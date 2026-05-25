import { pipeline, env } from '@xenova/transformers';

// Disable local models, since we want to download from Hugging Face hub
env.allowLocalModels = false;

// We will use the whisper-tiny.en model for fast, english-only speech recognition
let transcriber = null;

// Listen for messages from the main thread
self.addEventListener('message', async (event) => {
    const { type, audio } = event.data;
    
    if (type === 'load') {
        // Load the pipeline if not already loaded
        if (!transcriber) {
            self.postMessage({ status: 'loading', message: 'Loading speech recognition model...' });
            try {
                transcriber = await pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny.en', {
                    progress_callback: (progress) => {
                        self.postMessage({ status: 'progress', progress });
                    }
                });
                self.postMessage({ status: 'ready', message: 'Model loaded successfully!' });
            } catch (err) {
                self.postMessage({ status: 'error', message: err.message });
            }
        } else {
            self.postMessage({ status: 'ready', message: 'Model already loaded!' });
        }
    } else if (type === 'transcribe') {
        if (!transcriber) {
            self.postMessage({ status: 'error', message: 'Model not loaded yet' });
            return;
        }
        
        self.postMessage({ status: 'transcribing' });
        
        try {
            // Run transcription
            const result = await transcriber(audio, {
                chunk_length_s: 30,
                stride_length_s: 5,
                language: 'english',
                task: 'transcribe',
            });
            
            self.postMessage({ status: 'success', text: result.text });
        } catch (err) {
            self.postMessage({ status: 'error', message: err.message });
        }
    }
});
