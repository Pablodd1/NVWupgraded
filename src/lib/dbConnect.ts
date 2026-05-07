import mongoose from "mongoose";

/** 
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections from growing exponentially
 * during API Route usage.
 */
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  const MONGO_URI = process.env.MONGODB_URI || process.env.NEXT_PUBLIC_MONGO_URI || "";

  if (!MONGO_URI) {
    throw new Error("MongoDB URI is not set. Please define MONGODB_URI in .env.local");
  }

  if (!cached.promise) {
    const opts = {
      dbName: "nvw",
      bufferCommands: true,
      connectTimeoutMS: 15000,
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
    };


    cached.promise = mongoose.connect(MONGO_URI, opts).then((mongoose) => {
      console.log("✅ MongoDB Connected Successfully");
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error("❌ MongoDB Connection Error:", e);
    throw e;
  }

  return cached.conn;
}
