const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const http = require('http');
const socketIo = require('socket.io');

const { initDb } = require('./src/config/db');

// Route imports
const authRoutes = require('./src/routes/auth.routes');
const complaintsRoutes = require('./src/routes/complaints.routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Create HTTP and Socket.IO server
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT']
  }
});

// Bind Socket.IO globally so controllers can trigger real-time push events
global.io = io;

io.on('connection', (socket) => {
  console.log(`[Socket.IO] Connected client session: ${socket.id}`);
  
  socket.on('disconnect', () => {
    console.log(`[Socket.IO] Disconnected client session: ${socket.id}`);
  });
});

// Global Middleware
app.use(cors());
app.use(express.json());

// Serve secure uploads static directory so files are accessible to frontend
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Initialize Database & Boot Server
async function startServer() {
  try {
    // 1. Establish SQLite DB pool & build schemas
    await initDb();

    // 2. Register modular routers
    // Mount auth at /api/admin to ensure perfect out-of-the-box compatibility with current frontend (e.g. POST /api/admin/login)
    app.use('/api/admin', authRoutes);
    app.use('/api/complaints', complaintsRoutes);

    // 3. Global Error Handler middleware for Multer or Rate Limit exceptions
    app.use((err, req, res, next) => {
      console.error('[Global Error Handler]:', err.message);
      
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'Secure Access Block: Uploaded file size exceeds the strict 5MB limit!' });
      }
      
      res.status(err.status || 500).json({ 
        error: err.message || 'Internal Server Error: Execution encountered unexpected exception.' 
      });
    });

    // 4. Start HTTP & WebSockets Server listening
    server.listen(PORT, () => {
      console.log(`[Server] Production-ready modular engine running on port ${PORT} with Socket.IO enabled`);
    });
  } catch (err) {
    console.error('Server boot failed due to critical exception:', err);
    process.exit(1);
  }
}

startServer();
