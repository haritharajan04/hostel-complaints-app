import { pipeline, env } from '@xenova/transformers';

// Disable local models, since we want to download from Hugging Face hub
env.allowLocalModels = false;

// Disable WASM SIMD on iOS devices to prevent transcription from crashing
if (typeof navigator !== 'undefined' && /iP(hone|od|ad)/.test(navigator.userAgent)) {
    if (env.backends?.onnx?.env?.wasm) {
        env.backends.onnx.env.wasm.simd = false;
    }
}

// Available Whisper models (larger = more accurate):
// - Xenova/whisper-tiny.en (fastest, smallest ~75MB, less accurate)
// - Xenova/whisper-base.en (good balance ~140MB, recommended)
// - Xenova/whisper-small.en (better accuracy ~1GB)
// - Xenova/whisper-medium.en (best accuracy ~1.5GB, slower)

// Use base model for better speech detection while maintaining reasonable speed
const MODEL_NAME = 'Xenova/whisper-base.en';
let transcriber = null;

// Listen for messages from the main thread
self.addEventListener('message', async (event) => {
    const { type } = event.data;
    let audio = event.data.audio;
    
    if (type === 'load') {
        // Load the pipeline if not already loaded
        if (!transcriber) {
            self.postMessage({ status: 'loading', message: 'Loading speech recognition model...' });
            try {
                console.log('[Worker] Loading Whisper model...');
                transcriber = await pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny.en', {
                    progress_callback: (progress) => {
                        console.log('[Worker] Loading progress:', progress);
                        self.postMessage({ status: 'progress', progress });
                    }
                });
                console.log('[Worker] Model loaded successfully!');
                self.postMessage({ status: 'ready', message: 'Model loaded successfully!' });
            } catch (err) {
                console.error('[Worker] Model loading error:', err);
                self.postMessage({ status: 'error', message: err.message });
            }
        } else {
            self.postMessage({ status: 'ready', message: 'Model already loaded!' });
        }
    } else if (type === 'transcribe') {
        if (!transcriber) {
            const errorMsg = 'Model not loaded yet. Please wait for the model to load.';
            console.error('[Worker]', errorMsg);
            self.postMessage({ status: 'error', message: errorMsg });
            return;
        }
        
        try {
            if (!audio) {
                throw new Error('No audio data provided');
            }
            
            if (!(audio instanceof Float32Array)) {
                console.warn('[Worker] Audio is not Float32Array, converting...', audio.constructor.name);
                audio = new Float32Array(audio);
            }
            
            if (audio.length === 0) {
                throw new Error('Audio data is empty');
            }
            
            const durationSeconds = audio.length / 16000;
            const maxDurationSeconds = 60; // Whisper-tiny can handle up to ~60 seconds
            
            if (durationSeconds > maxDurationSeconds) {
                console.warn(`[Worker] Audio duration (${durationSeconds.toFixed(1)}s) exceeds maximum (${maxDurationSeconds}s), trimming...`);
                // Trim to maximum duration
                audio = audio.slice(0, maxDurationSeconds * 16000);
            }
            
            console.log('[Worker] Audio data received:');
            console.log('  - Type:', audio.constructor.name);
            console.log('  - Length:', audio.length);
            console.log('  - Duration at 16kHz:', (audio.length / 16000).toFixed(2), 'seconds');
            
            // Check audio levels - avoid spread operator on large arrays
            let minVal = audio[0];
            let maxVal = audio[0];
            let sum = 0;
            
            for (let i = 0; i < audio.length; i++) {
                if (audio[i] < minVal) minVal = audio[i];
                if (audio[i] > maxVal) maxVal = audio[i];
                sum += audio[i] * audio[i];
            }
            
            let rms = Math.sqrt(sum / audio.length);
            console.log('[Worker] Audio levels - Min:', minVal.toFixed(4), 'Max:', maxVal.toFixed(4), 'RMS:', rms.toFixed(4));
            
            if (rms < 0.001) {
                console.warn('[Worker] Audio level is extremely low - speech may not be detected');
            }
            
            self.postMessage({ status: 'transcribing' });
            
            console.log('[Worker] Starting transcription with', (audio.length / 16000).toFixed(2), 'seconds of audio...');
            
            // Run transcription with streaming to avoid stack overflow on large audio
            const result = await transcriber(audio, {
                chunk_length_s: 30,
                stride_length_s: 5,
                language: 'english',
                task: 'transcribe',
            });
            
            console.log('[Worker] Transcription result:', result);
            
            // Extract text robustly whether it's an array or object
            let final_text = "";
            if (Array.isArray(result)) {
                final_text = result[0]?.text || "";
                console.log('[Worker] Result is array, extracted text:', final_text);
            } else if (result && typeof result.text === 'string') {
                final_text = result.text;
                console.log('[Worker] Result is object with text property:', final_text);
            } else {
                console.warn('[Worker] Unexpected result format:', result);
                final_text = JSON.stringify(result);
            }
            
            final_text = final_text.trim();
            
            if (!final_text || final_text === '') {
                console.warn('[Worker] Empty transcription result - no speech was detected in the audio');
                final_text = "(No speech detected)";
            }
            
            console.log('[Worker] Final transcription text:', final_text);
            self.postMessage({ status: 'success', text: final_text });
        } catch (err) {
            console.error('[Worker] Transcription error:', err);
            
            // Handle stack size errors specifically
            if (err.message && err.message.includes('Maximum call stack size exceeded')) {
                self.postMessage({ status: 'error', message: 'Audio is too long or complex. Try recording a shorter audio clip (under 30 seconds).' });
            } else {
                self.postMessage({ status: 'error', message: `Transcription failed: ${err.message}` });
            }
        }
    }
});
