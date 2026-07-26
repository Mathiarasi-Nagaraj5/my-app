import mongoose from "mongoose";
import dns from 'node:dns';
const MONGODB_URI = process.env.MONGODB_URI || "";
console.log("URI exists:", !!process.env.MONGODB_URI);
console.log("Starts with SRV:", process.env.MONGODB_URI?.startsWith("mongodb+srv://"));
if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable.");
}
if (typeof window === 'undefined') {
  dns.setServers(['1.1.1.1', '8.8.8.8']);
}

declare global {
  var mongooseCache:
    | {
        conn: typeof mongoose | null;
        promise: Promise<typeof mongoose> | null;
      }
    | undefined;
}

const cached = global.mongooseCache ?? {
  conn: null,
  promise: null,
};

global.mongooseCache = cached;

export default async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
   cached.promise = mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 10000,
});
  }
  try {
  cached.conn = await cached.promise;
  console.log("✅ Connected:", mongoose.connection.host);
  return cached.conn;
} catch (err) {
  console.error("MongoDB connection failed:", err);
  throw err;
}

}