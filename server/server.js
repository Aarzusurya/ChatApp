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

// -------------------- MIDDLEWARE --------------------
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json({ limit: "4mb" }));
app.use(express.urlencoded({ extended: true }));

// -------------------- ROUTES --------------------
app.get("/api/status", (req, res) => {
  res.send("Server is live ✅");
});

app.use("/api/user", userRouter);
app.use("/api/messages", messageRouter);
app.use("/api/conversations", conversationRoutes);


// -------------------- SOCKET.IO --------------------
export const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
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

// -------------------- START SERVER --------------------
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
