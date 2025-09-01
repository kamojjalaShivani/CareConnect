const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const providerRoutes = require('./routes/providers');
const familyRoutes = require('./routes/families');
const careRequestRoutes = require('./routes/careRequests');
const dashboardRoutes = require('./routes/dashboard');
const assignmentRoutes = require('./routes/assignments');

const { initDatabase } = require('./database/init');
const { authenticateToken } = require('./middleware/auth');
const models = require('./models');

async function startServer() {
  try {
    // Initialize database first and get the db instance
    const db = await initDatabase();
    
    const app = express();
    const server = http.createServer(app);
    const io = socketIo(server, {
      cors: {
        origin: [`http://localhost:${process.env.VITE_PORT || 5173}`, "http://localhost:3000"],
        methods: ["GET", "POST", "PUT", "DELETE"]
      }
    });

    const PORT = process.env.PORT || 3001;

    // Middleware
    app.use(helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false
    }));
    app.use(cors({
      origin: [`http://localhost:${process.env.VITE_PORT || 5173}`, "http://localhost:3000"],
      credentials: true
    }));
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Add request logging for debugging
    app.use((req, res, next) => {
      console.log(`${req.method} ${req.path}`);
      next();
    });

    // Make io and db available to routes
    app.use((req, res, next) => {
      req.io = io;
      req.db = db;
      next();
    });

    // Routes
    app.use('/api/auth', authRoutes(db, models));
    app.use('/api/dashboard', authenticateToken, dashboardRoutes(db, models));
    app.use('/api/providers', authenticateToken, providerRoutes(db, models));
    app.use('/api/families', authenticateToken, familyRoutes(db, models));
    app.use('/api/care-requests', authenticateToken, careRequestRoutes(db, models));
    app.use('/api/assignments', authenticateToken, assignmentRoutes(db, models));

    // Health check
    app.get('/api/health', (req, res) => {
      res.json({ status: 'OK', timestamp: new Date().toISOString() });
    });

    // Socket.IO connection handling
    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);
      
      socket.on('join-room', (room) => {
        socket.join(room);
        console.log(`Client ${socket.id} joined room: ${room}`);
      });
      
      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });

    // Error handling middleware
    app.use((err, req, res, next) => {
      console.error(err.stack);
      res.status(500).json({ 
        error: 'Something went wrong!',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
      });
    });

    // 404 handler
    app.use('*', (req, res) => {
      res.status(404).json({ error: 'Route not found' });
    });

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();
