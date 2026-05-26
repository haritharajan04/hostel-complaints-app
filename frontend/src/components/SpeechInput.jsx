import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Loader, Play, Pause } from 'lucide-react';

export default function SpeechInput({ onTranscriptionComplete }) {
  const [isRecording, setIsRecording] = useState(false);
  const [modelStatus, setModelStatus] = useState('unloaded'); // unloaded, loading, ready
  const [transcribing, setTranscribing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [recordedAudioBlob, setRecordedAudioBlob] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);

  const workerRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioPlayerRef = useRef(null);
  const recordingTimerRef = useRef(null);
  const audioContextRef = useRef(null);
  const MAX_RECORDING_DURATION = 60; // 60 seconds max

  // Initialize Worker
  useEffect(() => {
    workerRef.current = new Worker(new URL('../services/worker.js', import.meta.url), {
      type: 'module'
    });

    workerRef.current.addEventListener('message', (e) => {
      const { status, message, progress, text } = e.data;
      
      console.log('[SpeechInput] Worker message received:', { status, message, progress, text });
      
      switch (status) {
        case 'loading':
          setModelStatus('loading');
          setStatusMessage(message);
          break;
        case 'progress':
          if (progress?.progress) {
            setProgress(Math.round(progress.progress));
            setStatusMessage(`Downloading AI Model... ${Math.round(progress.progress)}%`);
          }
          break;
        case 'ready':
          setModelStatus('ready');
          setStatusMessage('');
          console.log('[SpeechInput] Model is ready');
          break;
        case 'transcribing':
          setTranscribing(true);
          setStatusMessage('Transcribing audio...');
          console.log('[SpeechInput] Transcription started');
          break;
        case 'success':
          setTranscribing(false);
          setStatusMessage('');
          console.log('[SpeechInput] Transcription success:', text);
          onTranscriptionComplete(text);
          break;
        case 'error':
          setTranscribing(false);
          console.error('[SpeechInput] Worker error:', message);
          setStatusMessage(`Error: ${message}`);
          break;
      }
    });

    workerRef.current.addEventListener('error', (err) => {
      console.error('[SpeechInput] Worker error event:', err);
      setStatusMessage(`Worker error: ${err.message || err}`);
    });

    // Start loading model immediately
    console.log('[SpeechInput] Loading speech recognition model...');
    workerRef.current.postMessage({ type: 'load' });

    return () => {
      clearInterval(recordingTimerRef.current);
      workerRef.current.terminate();
    };
  }, [onTranscriptionComplete]);

  const startRecording = async () => {
    try {
      // 1. Initialize AudioContext on user gesture to prevent iOS Safari from suspending it
      if (!audioContextRef.current) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        audioContextRef.current = new AudioContextClass();
      }
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      console.log('[SpeechInput] Requesting microphone access...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('[SpeechInput] Microphone access granted');
      
      // 2. Explicitly specify MIME type for iOS Safari compatibility
      let options = {};
      if (window.MediaRecorder && window.MediaRecorder.isTypeSupported) {
        options = { mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4' };
      }
      
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      setRecordingDuration(0);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          console.log('[SpeechInput] Audio chunk received:', event.data.size, 'bytes');
          audioChunksRef.current.push(event.data);
        }
      };

      // Start recording duration timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration(prev => {
          const newDuration = prev + 1;
          if (newDuration >= MAX_RECORDING_DURATION) {
            console.warn('[SpeechInput] Maximum recording duration reached, stopping...');
            if (mediaRecorderRef.current && isRecording) {
              mediaRecorderRef.current.stop();
              if (mediaRecorderRef.current.stream) {
                mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
              }
              setIsRecording(false);
            }
            clearInterval(recordingTimerRef.current);
          }
          return newDuration;
        });
      }, 1000);

      mediaRecorder.onstop = async () => {
        clearInterval(recordingTimerRef.current);
        
        try {
          // 3. Fallback MIME type for Blob if mediaRecorder.mimeType is empty (common iOS bug)
          const mimeType = mediaRecorder.mimeType || (window.MediaRecorder?.isTypeSupported?.('audio/webm') ? 'audio/webm' : 'audio/mp4');
          const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
          
          console.log('[SpeechInput] Recording stopped. Audio blob size:', audioBlob.size, 'Duration:', recordingDuration, 'seconds');
          
          // Store the audio blob for playback
          setRecordedAudioBlob(audioBlob);
          
          if (audioBlob.size === 0) {
            setStatusMessage('No audio recorded. Please check your microphone.');
            stream.getTracks().forEach(track => track.stop());
            return;
          }
          
          // We need to decode the audio into Float32Array for Transformers.js
          const arrayBuffer = await audioBlob.arrayBuffer();
          const audioContext = audioContextRef.current;
          
          // Use the callback pattern wrapped in a Promise to support all Safari versions
          const audioBuffer = await new Promise((resolve, reject) => {
            audioContext.decodeAudioData(
              arrayBuffer,
              (buffer) => resolve(buffer),
              (error) => reject(error)
            );
          });
          console.log('[SpeechInput] Audio decoded. Sample rate:', audioBuffer.sampleRate, 'Length:', audioBuffer.length, 'Duration:', audioBuffer.duration, 'seconds');
          
          // Always resample to 16kHz for consistency with Whisper model
          const targetSampleRate = 16000;
          const OfflineContext = window.OfflineAudioContext || window.webkitOfflineAudioContext;
          const offlineContext = new OfflineContext(
            1, 
            Math.ceil(audioBuffer.length * (targetSampleRate / audioBuffer.sampleRate)), 
            targetSampleRate
          );
          
          const source = offlineContext.createBufferSource();
          source.buffer = audioBuffer;
          source.connect(offlineContext.destination);
          source.start(0);
          
          // Fallback for older Safari versions where startRendering doesn't return a Promise
          const renderPromise = offlineContext.startRendering();
          const renderedBuffer = await (renderPromise || new Promise(resolve => {
            offlineContext.oncomplete = (e) => resolve(e.renderedBuffer);
          }));
          
          // Safari Bug Fix: getChannelData().buffer is not always safely transferable on iOS.
          // Creating a new Float32Array guarantees an unshared, cleanly transferable buffer.
          let audioData = new Float32Array(renderedBuffer.getChannelData(0));
          
          console.log('[SpeechInput] Resampled to 16kHz. New length:', audioData.length, 'Duration:', audioData.length / 16000, 'seconds');
          
          // Check audio levels - print some sample values
          let minVal = Math.min(...audioData);
          let maxVal = Math.max(...audioData);
          let rms = Math.sqrt(audioData.reduce((sum, val) => sum + val * val, 0) / audioData.length);
          console.log('[SpeechInput] Audio levels - Min:', minVal.toFixed(4), 'Max:', maxVal.toFixed(4), 'RMS:', rms.toFixed(4));
          
          if (rms < 0.01) {
            console.warn('[SpeechInput] Audio level is very low - microphone may not have picked up sound');
          }
          
          if (!workerRef.current) {
            setStatusMessage('Worker not initialized.');
            stream.getTracks().forEach(track => track.stop());
            return;
          }
          
          console.log('[SpeechInput] Sending audio to worker for transcription...');
          // Use transferable for better performance
          workerRef.current.postMessage(
            { type: 'transcribe', audio: audioData },
            [audioData.buffer]
          );
        } catch (err) {
          console.error('Audio processing error:', err);
          setStatusMessage(`Audio processing failed: ${err.message}`);
        } finally {
          // Stop all tracks
          stream.getTracks().forEach(track => track.stop());
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setStatusMessage('Listening... Click to stop.');
      console.log('[SpeechInput] Recording started');
    } catch (err) {
      console.error('[SpeechInput] Microphone error:', err);
      setStatusMessage('Microphone access denied or unavailable. Please check browser permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      clearInterval(recordingTimerRef.current);
      mediaRecorderRef.current.stop();
      // 4. Free the microphone immediately on iOS to finalize audio and release hardware
      if (mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
      setIsRecording(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const playRecording = () => {
    if (!recordedAudioBlob) {
      console.warn('[SpeechInput] No recorded audio to play');
      return;
    }

    // Create a new audio element or reuse existing one
    if (!audioPlayerRef.current) {
      audioPlayerRef.current = new Audio();
      audioPlayerRef.current.onplay = () => {
        setIsPlaying(true);
      };
      audioPlayerRef.current.onended = () => {
        setIsPlaying(false);
      };
      audioPlayerRef.current.onpause = () => {
        setIsPlaying(false);
      };
    }

    const audioUrl = URL.createObjectURL(recordedAudioBlob);
    audioPlayerRef.current.src = audioUrl;

    if (isPlaying) {
      audioPlayerRef.current.pause();
      setIsPlaying(false);
    } else {
      audioPlayerRef.current.play().catch(err => {
        console.error('[SpeechInput] Playback error:', err);
        setStatusMessage('Could not play audio.');
      });
    }
  };

  return (
    <div className="speech-container">
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ margin: '0 0 10px 0' }}>Voice Assistant</h2>
        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Describe your complaint naturally.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', alignItems: 'center' }}>
        <button 
          type="button"
          className={`btn speech-btn ${isRecording ? 'recording' : ''}`}
          onClick={toggleRecording}
          disabled={modelStatus !== 'ready' || transcribing}
          title={isRecording ? 'Stop Recording' : 'Start Recording'}
        >
          {transcribing || modelStatus === 'loading' ? (
            <Loader size={28} className="animate-spin" />
          ) : isRecording ? (
            <Square size={24} color="white" fill="white" />
          ) : (
            <Mic size={28} color="white" />
          )}
        </button>

        <button 
          type="button"
          className={`btn speech-btn ${isPlaying ? 'playing' : ''}`}
          onClick={playRecording}
          disabled={!recordedAudioBlob || transcribing}
          title={isPlaying ? 'Stop Playback' : 'Play Recording'}
        >
          {isPlaying ? (
            <Pause size={28} color="white" />
          ) : (
            <Play size={28} color="white" />
          )}
        </button>
      </div>
      
      <div className="status-text">
        {isRecording ? (
          <span>{recordingDuration}s / {MAX_RECORDING_DURATION}s - {statusMessage}</span>
        ) : (
          statusMessage || (modelStatus === 'ready' ? 'Ready to listen' : '')
        )}
      </div>
    </div>
  );
}
