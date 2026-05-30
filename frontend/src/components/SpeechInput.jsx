import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Loader, Play, Pause } from 'lucide-react';
import TranscriberWorker from '../services/worker.js?worker';

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
  const processorRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const pcmDataRef = useRef([]);
  const MAX_RECORDING_DURATION = 60; // 60 seconds max

  // Helper function to convert Float32Array to standard WAV Blob
  const bufferToWav = (buffer, optSampleRate) => {
    const sampleRate = optSampleRate || 16000;
    const length = buffer.length * 2;
    const bufferArr = new ArrayBuffer(44 + length);
    const view = new DataView(bufferArr);
    
    const writeString = (view, offset, string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    const floatTo16BitPCM = (output, offset, input) => {
      for (let i = 0; i < input.length; i++, offset += 2) {
        let s = Math.max(-1, Math.min(1, input[i]));
        output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
      }
    };

    /* RIFF identifier */
    writeString(view, 0, 'RIFF');
    /* file length */
    view.setUint32(4, 36 + length, true);
    /* RIFF type */
    writeString(view, 8, 'WAVE');
    /* format chunk identifier */
    writeString(view, 12, 'fmt ');
    /* format chunk length */
    view.setUint32(16, 16, true);
    /* sample format (raw) */
    view.setUint16(20, 1, true);
    /* channel count */
    view.setUint16(22, 1, true);
    /* sample rate */
    view.setUint32(24, sampleRate, true);
    /* byte rate (sample rate * block align) */
    view.setUint32(28, sampleRate * 2, true);
    /* block align (channel count * bytes per sample) */
    view.setUint16(32, 2, true);
    /* bits per sample */
    view.setUint16(34, 16, true);
    /* data chunk identifier */
    writeString(view, 36, 'data');
    /* chunk length */
    view.setUint32(40, length, true);
    
    floatTo16BitPCM(view, 44, buffer);
    
    return new Blob([view], { type: 'audio/wav' });
  };

  // Initialize Worker
  useEffect(() => {
    try {
      console.log('[SpeechInput] Initializing Classic Web Worker...');
      workerRef.current = new TranscriberWorker();

      workerRef.current.addEventListener('message', (e) => {
        const { status, message, progress, text } = e.data;
        
        console.log('[SpeechInput] Worker message received:', { status, message, progress, text });
        
        switch (status) {
          case 'loading':
            setModelStatus('loading');
            setStatusMessage(message || 'Loading model...');
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
    } catch (err) {
      console.error('[SpeechInput] Worker initialization error:', err);
      setStatusMessage(`Worker setup failed: ${err.message}`);
    }

    return () => {
      clearInterval(recordingTimerRef.current);
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, [onTranscriptionComplete]);

  const startRecording = async () => {
    try {
      // 1. Initialize AudioContext on user gesture
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      const audioContext = new AudioContextClass();
      audioContextRef.current = audioContext;

      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }

      console.log('[SpeechInput] Requesting microphone access...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      console.log('[SpeechInput] Microphone access granted');
      
      // 2. Setup direct PCM ScriptProcessor recording (buffer size 4096, 1 input channel, 1 output channel)
      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;
      pcmDataRef.current = [];

      processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        // Copy the Float32Array since the underlying buffer is reused by the browser
        pcmDataRef.current.push(new Float32Array(inputData));
      };

      // Connect nodes
      source.connect(processor);
      processor.connect(audioContext.destination);

      setRecordingDuration(0);

      // Start recording duration timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration(prev => {
          const newDuration = prev + 1;
          if (newDuration >= MAX_RECORDING_DURATION) {
            console.warn('[SpeechInput] Maximum recording duration reached, stopping...');
            stopRecording();
          }
          return newDuration;
        });
      }, 1000);

      setIsRecording(true);
      setStatusMessage('Listening... Click to stop.');
      console.log('[SpeechInput] Recording started');
    } catch (err) {
      console.error('[SpeechInput] Microphone error:', err);
      setStatusMessage('Microphone access denied or unavailable. Please check browser permissions.');
    }
  };

  const stopRecording = async () => {
    if (!isRecording) return;
    
    clearInterval(recordingTimerRef.current);
    setIsRecording(false);
    setStatusMessage('Processing audio...');
    console.log('[SpeechInput] Stopping recording...');

    try {
      // Disconnect audio nodes
      if (processorRef.current) {
        processorRef.current.disconnect();
        processorRef.current.onaudioprocess = null;
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }

      // Merge Float32 PCM chunks
      const chunks = pcmDataRef.current;
      const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
      
      if (totalLength === 0) {
        setStatusMessage('No audio recorded. Please speak into the mic.');
        return;
      }

      const mergedPcm = new Float32Array(totalLength);
      let offset = 0;
      for (const chunk of chunks) {
        mergedPcm.set(chunk, offset);
        offset += chunk.length;
      }

      const audioContext = audioContextRef.current;
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }

      // Create pure AudioBuffer from captured PCM data
      const audioBuffer = audioContext.createBuffer(1, mergedPcm.length, audioContext.sampleRate);
      audioBuffer.copyToChannel(mergedPcm, 0);

      console.log('[SpeechInput] Audio buffer merged. Sample rate:', audioBuffer.sampleRate, 'Length:', audioBuffer.length);
      
      // Resample to 16kHz for Whisper compatibility
      const targetSampleRate = 16000;
      const OfflineContext = window.OfflineAudioContext || window.webkitOfflineAudioContext;
      const offlineContext = new OfflineContext(
        1, 
        Math.ceil(audioBuffer.length * (targetSampleRate / audioBuffer.sampleRate)), 
        targetSampleRate
      );
      
      const offlineSource = offlineContext.createBufferSource();
      offlineSource.buffer = audioBuffer;
      offlineSource.connect(offlineContext.destination);
      offlineSource.start(0);
      
      const renderedBuffer = await offlineContext.startRendering();
      const audioData = new Float32Array(renderedBuffer.getChannelData(0));

      // Peak Normalization (Auto-Gain) to amplify quiet mobile microphone capture perfectly
      let maxAbsVal = 0;
      for (let i = 0; i < audioData.length; i++) {
        const abs = Math.abs(audioData[i]);
        if (abs > maxAbsVal) maxAbsVal = abs;
      }
      if (maxAbsVal > 0) {
        const boostMultiplier = 0.8 / maxAbsVal;
        if (boostMultiplier > 1.0) {
          console.log('[SpeechInput] Boosting quiet recording. Multiplier:', boostMultiplier.toFixed(2));
          for (let i = 0; i < audioData.length; i++) {
            audioData[i] *= boostMultiplier;
          }
        }
      }

      console.log('[SpeechInput] Resampled to 16kHz. Length:', audioData.length, 'Duration:', (audioData.length / 16000).toFixed(2), 'seconds');

      // Check audio levels
      let sum = 0;
      for (let i = 0; i < audioData.length; i++) {
        sum += audioData[i] * audioData[i];
      }
      let rms = Math.sqrt(sum / audioData.length);
      console.log('[SpeechInput] Audio RMS level:', rms.toFixed(4));

      // Generate standard WAV Blob for native playback compatibility
      const wavBlob = bufferToWav(audioData, 16000);
      setRecordedAudioBlob(wavBlob);

      if (rms < 0.003) {
        setStatusMessage('Warning: Extremely quiet recording. Please speak louder.');
      }

      if (!workerRef.current) {
        setStatusMessage('Worker not initialized.');
        return;
      }

      console.log('[SpeechInput] Sending resampled audio to worker for transcription...');
      // Convert to native Array before sending to guarantee 100% reliable serialization on mobile engines
      const audioArray = Array.from(audioData);
      workerRef.current.postMessage({ type: 'transcribe', audio: audioArray });
    } catch (err) {
      console.error('Audio compilation failed:', err);
      setStatusMessage(`Audio compile failed: ${err.message}`);
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
