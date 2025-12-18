import mongoose from "mongoose";

let isConnected = false;

export async function dbConnect() {
  if (isConnected) return;

  const MONGO_URI = process.env.MONGODB_URI || process.env.NEXT_PUBLIC_MONGO_URI || "";

  try {
    if (!MONGO_URI) {
      throw new Error("MongoDB URI is not set. Please define MONGODB_URI in .env.local");
    }
    console.log("🔗 Attempting to connect to:", MONGO_URI.replace(/:([^@]+)@/, ":****@")); // Log masked URI
    await mongoose.connect(MONGO_URI, {
      dbName: "nvw",
      bufferCommands: false,
    });
    isConnected = true;
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
    throw error; // Re-throw so callers know connection failed
  }
}
