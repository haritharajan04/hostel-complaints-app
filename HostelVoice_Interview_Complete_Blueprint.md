# HostelVoice: The End-to-End Interview Blueprint

This manual provides a detailed technical breakdown of the **HostelVoice** application architecture. Use this guide to explain the application's design, security, and real-time features in your technical interviews!

---

## 🏛️ High-Level System Architecture

```
                     +---------------------------------------+
                     |         React Frontend (Vite)         |
                     |  - SpeechInput.jsx (ScriptProcessor)  |
                     |  - Transformers.js (Whisper Worker)   |
                     +---------------------------------------+
                                   |          ^
                      HTTP multipart |          | Socket.IO
                      FormData & JWT |          | Real-time Sync
                                   v          |
                     +---------------------------------------+
                     |      Node.js Express MVC Server       |
                     |  - Rate Limiters, JWT & RBAC Gates    |
                     |  - Multer Secure Upload Sanitizer     |
                     +---------------------------------------+
                                   |
                                   | SQL Queries (db.js)
                                   v
                     +---------------------------------------+
                     |        SQLite Local Database          |
                     |  - Auto-seeded Users & Audit Logs     |
                     +---------------------------------------+
```

---

## 🎙️ Section 1: The Frontend Ingestion Engine (Audio & AI)

The frontend's job is to capture a student's voice smoothly on any device (even cheap mobile phones) and transcribe it 100% offline in the browser without locking the main thread.

### 1. High-Fidelity Audio Capturing (`SpeechInput.jsx`)
Standard browsers offer the `MediaRecorder` API, but it is highly inconsistent across devices (e.g., Safari records in `.mp4`/`.aac` while Chrome records in `.webm`). We bypassed this completely by using low-level **Web Audio APIs**:
- We open a `ScriptProcessorNode` to listen to the microphone stream directly.
- It intercepts raw Float32 audio samples directly in memory:
  ```javascript
  const scriptNode = audioContext.current.createScriptProcessor(4096, 1, 1);
  scriptNode.onaudioprocess = (audioProcessingEvent) => {
    const inputBuffer = audioProcessingEvent.inputBuffer;
    const inputData = inputBuffer.getChannelData(0); // 100% Raw Float32 sound waves
    pcmData.current.push(new Float32Array(inputData));
  };
  ```

### 2. The Auto-Gain volume Booster
To ensure the AI transcribes quiet voices accurately, we built a digital signal processing (DSP) auto-gain filter:
- It scans the compiled recording, finds the absolute peak amplitude, and safely scales the buffer up to a target peak of `0.8` (80% volume) so the audio doesn't distort:
  ```javascript
  const peak = Math.max(...samples.map(Math.abs));
  if (peak > 0 && peak < 0.8) {
    const boostFactor = 0.8 / peak;
    for (let i = 0; i < samples.length; i++) {
      samples[i] *= boostFactor; // Clean boost, zero clipping distortion
    }
  }
  ```

### 3. Binary WAV Header Compiler
Whisper models require standard PCM 16-bit mono WAV files at a sample rate of `16000Hz`. We write the binary headers (`RIFF`, `WAVE`, `fmt `) manually using `ArrayBuffer` and `DataView`:
- **The Code**: We construct the 44-byte standard WAV header:
  ```javascript
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);
  writeString(view, 0, 'RIFF');                 // ChunkID
  view.setUint32(4, 36 + samples.length * 2, true); // ChunkSize
  writeString(view, 8, 'WAVE');                 // Format
  writeString(view, 12, 'fmt ');                // Subchunk1ID
  view.setUint32(16, 16, true);                 // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true);                  // AudioFormat (1 = PCM)
  view.setUint16(22, 1, true);                  // NumChannels (1 = Mono)
  view.setUint32(24, 16000, true);              // SampleRate (16000 Hz)
  view.setUint32(28, 16000 * 2, true);          // ByteRate
  view.setUint16(32, 2, true);                  // BlockAlign
  view.setUint16(34, 16, true);                 // BitsPerSample (16-bit)
  writeString(view, 36, 'data');                // Subchunk2ID
  view.setUint32(40, samples.length * 2, true); // Subchunk2Size
  ```

### 4. Background Web Worker Thread (`worker.js` / OpenAI Whisper)
Transcribing voice using deep learning takes massive CPU power. If we ran this on the main browser thread, the page would freeze, causing a terrible user experience.
- **Web Worker Integration**: We spawn a background worker:
  ```javascript
  const worker = new Worker(new URL('../assets/worker.js', import.meta.url), { type: 'module' });
  ```
- **Inside the Worker**: It loads the ONNX runtime, downloads the lightweight Whisper model, caches it locally in the browser's Cache API (making it offline-first), and processes transcribing tasks in the background:
  ```javascript
  // worker.js
  import { pipeline } from '@xenova/transformers';
  
  let transcriber = await pipeline('automatic-speech-recognition', 'Xenova/whisper-base');
  self.addEventListener('message', async (event) => {
    const output = await transcriber(event.data.audio, { chunk_length_s: 30 });
    self.postMessage({ status: 'complete', text: output.text });
  });
  ```

---

## 🔒 Section 2: The Production-Grade Backend (Express & SQLite)

The backend (`backend/src/`) is decoupled using the professional **MVC (Model-View-Controller)** pattern to separate routes, control logic, database tables, and security guardrails.

### 1. Database Layer (`config/db.js`)
We use a lightweight, serverless, persistent **SQLite** database (`database.sqlite`).
- On server startup, it executes SQL commands to create three tables:
  1. `users` (admin and student accounts with secure password fields).
  2. `complaints` (logs the title, audio paths, categories, priority levels, and file attachment URLs).
  3. `history` (tracks audit logs of status transitions like "Pending" -> "Assigned" -> "Resolved").
- It automatically seeds default credentials: `admin / admin123` (Admin) and `student / student123` (Student).

### 2. State-of-the-Art Security Middlewares
- **Rate Limiter (`middleware/rateLimiter.js`)**: Protects endpoints (like administrator logins) from brute-force scripts by capping requests to 10 logins per 15 minutes.
- **JWT Auth Session Gate (`middleware/auth.js`)**: Reads the HTTP request headers (`Authorization: Bearer <token>`), decodes the JWT using a secure signature secret, and attaches the user session directly to the request: `req.user = decodedToken`.
- **Role-Based Access Control (RBAC - `middleware/rbac.js`)**: Ensures students can never modify ticket statuses or call administrative actions:
  ```javascript
  module.exports = (allowedRoles) => {
    return (req, res, next) => {
      if (!req.user || !allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ error: 'Access Denied: Insufficient authorization permissions.' });
      }
      next();
    };
  };
  ```
- **Secure File Uploader (`middleware/upload.js`)**: Leverages **Multer** to handle image uploads of physical damage (e.g. broken piping) with strict guardrails:
  - Enforces a **5MB file size limit**.
  - Limits file types strictly to safe extensions (`.png`, `.jpg`, `.jpeg`, `.pdf`), throwing an error on executable scripts (`.js`, `.exe`) to prevent server takeover attacks.
  - Sanitizes the file name to prevent **Directory Traversal** attacks.

---

## ⚡ Section 3: The Real-Time Synchronization Layer (Socket.IO)

To make the app feel alive, we integrated **Socket.IO** to run concurrently on the same port as our Express HTTP server in `server.js`:

```javascript
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });
```

### Real-Time Event Flows:
1. **Complaint Filing (`complaint:created`)**: When a student saves a complaint, the backend database controller triggers an instant push broadcast:
   ```javascript
   io.emit('complaint:created', newComplaint);
   ```
   This immediately updates the administrator's **Live Feed Alerts** panel and data grid in real-time, eliminating the need to refresh the page.
2. **Ticket Dispatching (`complaint:updated`)**: When the admin changes a ticket status (e.g., assigning a technician), the backend pushes an update event:
   ```javascript
   io.emit('complaint:updated', updatedComplaint);
   ```
   The student's mobile dashboard catches this event instantly, animating their status badge (e.g. turning it green for "Resolved") and popping a status toast notification.

---

## 🎨 Section 4: The Visual Interface & Dashboards

We redesigned the entire administrative interface to use a premium, clean **Light Theme** matching our brand styleboard:

### 1. Interactive Styleboard Route (`/styleboard`)
Features 9 beautifully rendered Behance/Dribbble branding cards, including:
- An **interactive audio player mockup** with live transcription animations.
- **Click-to-Copy Color Swatches** featuring HSL-curated color chips (`#4F6DF5` Primary Blue, `#2DDE8F` Soft Cyan, `#8E54E9` Soft Purple).

### 2. Operational Dashboards (`Dashboard.jsx` & `ComplaintsList.jsx`)
- **Category Outages Progressive Tracker**: Computes reported complaints by category in real-time and displays them as modern, HSL-colored progress bars.
- **Live Feed Alerts**: Real-time telemetry log feed that appends WebSocket events as they happen on campus.
- **Dispatch Action Desk**: Quick administrative tools allowing the user to trigger automated technician routing rules (`Auto-Assign Engineers`) or run telemetry system diagnostics checks with one click.

---

## 💡 Section 5: Key Interview Questions & Answers

### Q1: "Why did you choose client-side Transformers.js instead of a cloud Speech-to-Text API like Google Cloud or OpenAI Whisper API?"
> **Answer**: *"By downloading and caching the Whisper ONNX model on the student's browser, we achieve three massive advantages: First, it is 100% cost-free to run because we don't pay per-second API fees. Second, it offers absolute privacy since the student's voice recording is transcribed entirely on their local device without leaving the network. Third, it is offline-first, meaning students can dictate complaints even with unstable campus Wi-Fi."*

### Q2: "How did you solve the security issues associated with allowing students to upload images of their complaints?"
> **Answer**: *"Allowing user uploads is one of the most common security holes in web apps. We handled this by creating a highly secure Multer interceptor: First, we enforce a strict 5MB size cap to prevent database storage exhaustion. Second, we run a strict MIME type checker on the server side to ensure only valid images (.png, .jpg) are processed, blocking malicious files (.exe, .js). Finally, we sanitize and rename files before saving them to disk to protect against directory-traversal exploits."*
