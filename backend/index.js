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

// dotenv.config(); // Load environment variables

// const app = express();

// // Middleware
// app.use(express.json());
// app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
// // These were the conflicting lines, now resolved to be active middleware
// app.use(cookieParser());
// app.use(fileUpload());

// // Routes
// app.use("/users", userRouter);
// app.use("/pins", pinRouter);
// app.use("/comments", commentRouter);
// app.use("/boards", boardRouter);

// // Error handler
// app.use((error, req, res, next) => {
//   res.status(error.status || 500).json({
//     message: error.message || "Something went wrong!",
//     status: error.status,
//     stack: error.stack,
//   });
// });

// // Start server after DB connects
// const PORT = process.env.PORT || 3000;

// app.listen(PORT, async () => {
//   await connectDB();
//   console.log(` Server is running on port ${PORT}`);
// });

// index.js of backend (Server Entry)

// --- Imports from your project ---
import express from "express";
import cors from "cors";
import userRouter from "./routes/user.route.js"; 
import pinRouter from "./routes/pin.route.js";
import commentRouter from "./routes/comment.route.js";
import boardRouter from "./routes/board.route.js";
import connectDB from "./utils/connectDB.js"; 
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import dotenv from "dotenv";

// --- Imports from the complete verification system ---
// import { removeUnverifiedAccounts } from "./automation/removeUnverifiedAccounts.js"; 
import { errorMiddleware } from "./middlewares/error.js"; 

dotenv.config(); 

const app = express();

// Set allowed origins for CORS
const allowedOrigins = [
  'http://localhost:5173', // Frontend Client URL (e.g., Vite/React)
  'http://localhost:5174', // Secondary client/development environment
  // Add your deployed client URL here if applicable
];

// --- Core Middleware ---
app.use(express.json());
app.use(cors({ origin: allowedOrigins, credentials: true })); 
app.use(cookieParser());
app.use(fileUpload());

// --- Automated Tasks (Runs on server start) ---
// removeUnverifiedAccounts(); 

// --- Routes ---
// The /users base path correctly routes to userRouter
app.use("/users", userRouter); 
app.use("/pins", pinRouter);
app.use("/comments", commentRouter);
app.use("/boards", boardRouter);

// --- Error Handling Middleware ---
app.use(errorMiddleware); 

// --- Server Startup ---
const PORT = process.env.PORT || 3000;

const startServer = async () => {
    await connectDB(); 
    app.listen(PORT, () => {
        console.log(` Server is running on port ${PORT}`);
    });
}

startServer();