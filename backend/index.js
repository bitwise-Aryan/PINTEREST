



// // --- Imports from your project ---
// import express from "express";
// import cors from "cors";
// import userRouter from "./routes/user.route.js"; 
// import pinRouter from "./routes/pin.route.js";
// import commentRouter from "./routes/comment.route.js";
// import boardRouter from "./routes/board.route.js";
// import connectDB from "./utils/connectDB.js"; 
// import cookieParser from "cookie-parser";
// import fileUpload from "express-fileupload";
// import dotenv from "dotenv";
// import notificationRouter from "./routes/notification.route.js"; 

// // --- Imports from the complete verification system ---
// // import { removeUnverifiedAccounts } from "./automation/removeUnverifiedAccounts.js"; 
// import { errorMiddleware } from "./middlewares/error.js"; 

// dotenv.config(); 

// const app = express();

// // Set allowed origins for CORS
// const allowedOrigins = [
//   'http://localhost:5173', // Frontend Client URL (e.g., Vite/React)
//   'http://localhost:5174', // Secondary client/development environment
//   // Add your deployed client URL here if applicable
// ];

// // --- Core Middleware ---
// app.use(express.json());
// app.use(cors({ origin: allowedOrigins, credentials: true })); 
// app.use(cookieParser());
// app.use(fileUpload());

// // --- Automated Tasks (Runs on server start) ---
// // removeUnverifiedAccounts(); 

// // --- Routes ---
// // The /users base path correctly routes to userRouter
// app.use("/users", userRouter); 
// app.use("/pins", pinRouter);
// app.use("/comments", commentRouter);
// app.use("/boards", boardRouter);
// app.use("/notifications", notificationRouter);

// app.use('/uploads', express.static('uploads'));
// // --- Error Handling Middleware ---
// app.use(errorMiddleware); 

// // --- Server Startup ---
// const PORT = process.env.PORT || 3000;

// const startServer = async () => {
//     await connectDB(); 
//     app.listen(PORT, () => {
//         console.log(` Server is running on port ${PORT}`);
//     });
// }

// startServer();
// --- src/index.js (FINAL CODE WITH SOCKET.IO FIX) ---

import dotenv from 'dotenv';
dotenv.config();

// NEW: Import necessary Node.js modules for creating the server
import http from 'http'; 
import { Server as SocketServer } from "socket.io"; // Renamed import for clarity

import express from "express";
import cors from "cors";
import userRouter from "./routes/user.route.js"; 
import pinRouter from "./routes/pin.route.js";
import commentRouter from "./routes/comment.route.js";
import boardRouter from "./routes/board.route.js";
import notificationRouter from "./routes/notification.route.js"; // Include the new notification route
import connectDB from "./utils/connectDB.js"; 
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import { errorMiddleware } from "./middlewares/error.js"; 


const app = express();
const PORT = process.env.PORT || 3000;

// 1. Create the HTTP server and wrap the Express app
const server = http.createServer(app);

// Set allowed origins for CORS (MUST include the frontend URL)
const allowedOrigins = [
  'http://localhost:5173', // Frontend Client URL
  'http://localhost:5174', // Secondary client/development environment
  // Add your deployed client URL here if applicable
];

// 2. Initialize Socket.IO and attach it to the HTTP server
const io = new SocketServer(server, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"],
        credentials: true
    }
});

// --- Core Middleware ---
app.use(express.json());
// Ensure CORS for Express routes uses the same configuration
app.use(cors({ origin: allowedOrigins, credentials: true })); 
app.use(cookieParser());
app.use(fileUpload());

// --- Routes ---
app.use("/users", userRouter); 
app.use("/pins", pinRouter);
app.use("/comments", commentRouter);
app.use("/boards", boardRouter);
app.use("/notifications", notificationRouter); // Your new notification route

app.use('/uploads', express.static('uploads'));
// --- Error Handling Middleware ---
app.use(errorMiddleware); 

// --- Socket.IO Connection Handler ---
io.on('connection', (socket) => {
    console.log('A user connected via Socket.IO:', socket.id);

    // Placeholder for real-time logic (e.g., notification broadcasting, chat)
    
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});
// ---------------------------------------------------------------- //

// --- Server Startup ---
const startServer = async () => {
    await connectDB(); 
    // IMPORTANT: Use server.listen() instead of app.listen()
    server.listen(PORT, () => {
        console.log(`✅ Express Server running on port ${PORT}`);
        console.log(`📡 Socket.IO listening on port ${PORT}`);
    });
}

startServer();