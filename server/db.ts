import 'dotenv/config';
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

let isConnected = false;

export async function connectDB() {
  if (isConnected) return;

  if (!MONGODB_URI) {
    console.log("⚠️  MONGODB_URI not set. Using in-memory storage.");
    return;
  }

  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    isConnected = true;
    console.log("✓ Connected to MongoDB Atlas");
  } catch (error) {
    console.error("❌ Failed to connect to MongoDB:", error);
    throw error;
  }
}

export const db = mongoose.connection;
