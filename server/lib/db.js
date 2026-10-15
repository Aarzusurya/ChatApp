import mongoose from "mongoose";

export const connectDB = async () => {
  if (!process.env.MONGODB_URL) {
    throw new Error("MONGODB_URL is not configured");
  }

  if (mongoose.connection.readyState === 1) return;

  await mongoose.connect(`${process.env.MONGODB_URL}/chat-app`);
  console.log("Database connected");
};