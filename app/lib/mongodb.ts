import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "";
console.log(MONGODB_URI)
if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable.");
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
    cached.promise = mongoose.connect(MONGODB_URI);
  }

  cached.conn = await cached.promise;

  console.log("✅ Connected to:", mongoose.connection.name);

  return cached.conn;
}