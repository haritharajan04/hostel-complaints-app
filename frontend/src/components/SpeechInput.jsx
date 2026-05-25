import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Loader } from 'lucide-react';

export default function SpeechInput({ onTranscriptionComplete }) {
  const [isRecording, setIsRecording] = useState(false);
  const [modelStatus, setModelStatus] = useState('unloaded'); // unloaded, loading, ready
  const [transcribing, setTranscribing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');

  const workerRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Initialize Worker
  useEffect(() => {
    workerRef.current = new Worker(new URL('../services/worker.js', import.meta.url), {
      type: 'module'
    });

    workerRef.current.addEventListener('message', (e) => {
      const { status, message, progress, text } = e.data;
      
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
          break;
        case 'transcribing':
          setTranscribing(true);
          setStatusMessage('Transcribing audio...');
          break;
        case 'success':
          setTranscribing(false);
          setStatusMessage('');
          onTranscriptionComplete(text);
          break;
        case 'error':
          setTranscribing(false);
          setStatusMessage(`Error: ${message}`);
          break;
      }
    });

    // Start loading model immediately
    workerRef.current.postMessage({ type: 'load' });

    return () => {
      workerRef.current.terminate();
    };
  }, [onTranscriptionComplete]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        // We need to decode the audio into Float32Array for Transformers.js
        const arrayBuffer = await audioBlob.arrayBuffer();
        const audioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
        
        try {
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
          const offlineContext = new OfflineAudioContext(1, audioBuffer.length, 16000);
          const source = offlineContext.createBufferSource();
          source.buffer = audioBuffer;
          source.connect(offlineContext.destination);
          source.start();
          const renderedBuffer = await offlineContext.startRendering();
          
          const audioData = renderedBuffer.getChannelData(0);
          
          workerRef.current.postMessage({ type: 'transcribe', audio: audioData });
        } catch (err) {
          setStatusMessage("Could not decode audio.");
        }
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setStatusMessage('Listening... Click to stop.');
    } catch (err) {
      console.error(err);
      setStatusMessage('Microphone access denied or unavailable.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
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

  return (
    <div className="speech-container">
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ margin: '0 0 10px 0' }}>Voice Assistant</h2>
        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Describe your complaint naturally.
        </p>
      </div>

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
      
      <div className="status-text">
        {statusMessage || (modelStatus === 'ready' ? 'Ready to listen' : '')}
      </div>
    </div>
  );
}
