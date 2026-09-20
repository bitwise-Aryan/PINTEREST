import dotenv from 'dotenv';
dotenv.config();

import http from 'http'; 
import { Server as SocketServer } from "socket.io";
import express from "express";
import cors from "cors";
import path from 'path';

import userRouter from "./routes/user.route.js"; 
import pinRouter from "./routes/pin.route.js";
import commentRouter from "./routes/comment.route.js";
import boardRouter from "./routes/board.route.js";
import notificationRouter from "./routes/notification.route.js";
import chatRouter from "./routes/chat.route.js";

import connectDB from "./utils/connectDB.js"; 
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import { errorMiddleware } from "./middlewares/error.js"; 


const app = express();
const PORT = process.env.PORT || 3000;

// Create HTTP server and wrap Express app
const server = http.createServer(app);

// CORS allowed origins
const allowedOrigins = [
  'http://localhost:5173', 
  'http://localhost:5174',
  process.env.CLIENT_URL,
  process.env.FRONTEND_URL,
].filter(Boolean);

const corsOriginValidator = (origin, callback) => {
  // Allow requests with no origin (curl, server-to-server, mobile)
  if (!origin) return callback(null, true);
  if (
    allowedOrigins.includes(origin) ||
    origin.endsWith('.onrender.com') ||
    origin.endsWith('.vercel.app')
  ) {
    return callback(null, true);
  }
  callback(null, true); // Fallback allow in dev/staging
};

// Initialize Socket.IO with CORS configuration
const io = new SocketServer(server, {
  cors: {
    origin: corsOriginValidator,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Core middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: corsOriginValidator, credentials: true }));
app.use(cookieParser());
app.use(fileUpload());

// API routes
app.use("/chat", chatRouter);
app.use("/users", userRouter); 
app.use("/pins", pinRouter);
app.use("/comments", commentRouter);
app.use("/boards", boardRouter);
app.use("/notifications", notificationRouter);

// Serve uploads folder statically
app.use('/uploads', express.static('uploads'));

// Serve React build static files (adjust path if needed)
app.use(express.static(path.join(process.cwd(), 'build')));

// SPA fallback: serve index.html on all unmatched routes for React Router
app.get(/^\/(?!api).*/, (req, res) => {
  // This will match everything except routes that start with /api (adjust pattern as needed)
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Error handling middleware (should be last)
app.use(errorMiddleware);

// Expose io to routes
app.set("io", io);

// Socket.IO connection handler
io.on('connection', (socket) => {
  console.log('⚡ A user connected via Socket.IO:', socket.id);

  // Register the user to their own personal room (their user ID)
  socket.on('register', (userId) => {
    if (userId) {
      socket.join(userId.toString());
      console.log(`👤 User ${userId} joined room on socket ${socket.id}`);
    }
  });

  // Join active chat session room
  socket.on('joinChat', (chatId) => {
    if (chatId) {
      socket.join(chatId.toString());
      console.log(`💬 Socket ${socket.id} joined chat room: ${chatId}`);
    }
  });

  socket.on('leaveChat', (chatId) => {
    if (chatId) {
      socket.leave(chatId.toString());
      console.log(`🚪 Socket ${socket.id} left chat room: ${chatId}`);
    }
  });

  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id);
  });
});

// Server start function using server.listen for Socket.IO compatibility
const startServer = async () => {
  await connectDB(); 
  server.listen(PORT, () => {
    console.log(`✅ Express Server running on port ${PORT}`);
    console.log(`📡 Socket.IO listening on port ${PORT}`);
  });
};

startServer();
