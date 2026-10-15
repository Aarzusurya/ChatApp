import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

import { connectDB } from "./lib/db.js";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
import conversationRoutes from "./routes/conversationRoutes.js";

const app = express();
const server = http.createServer(app);

// ==================== CORS CONFIG ====================

// Allowed origins
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  process.env.FRONTEND_URL // production frontend (Render/Vercel)
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "4mb" }));
app.use(express.urlencoded({ extended: true }));

// ==================== ROUTES ====================

app.get("/api/status", (req, res) => {
  res.send("Server is live ✅");
});

app.get("/", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/user", userRouter);
app.use("/api/messages", messageRouter);
app.use("/api/conversations", conversationRoutes);

// ==================== SOCKET.IO ====================

export const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

export const userSocketMap = {};

io.on("connection", (socket) => {
  const userId = socket.handshake.query?.userId;

  if (userId) {
    userSocketMap[userId] = socket.id;
    console.log("User Connected:", userId);
  }

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    if (userId) {
      delete userSocketMap[userId];
      console.log("User Disconnected:", userId);
    }
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

// ==================== START SERVER ====================

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);

  connectDB().catch((error) => {
    console.error("❌ Failed to connect to the database:", error.message);
  });
});
