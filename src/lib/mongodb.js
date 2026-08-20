import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Missing MONGODB_URI environment variable");
}

/**
 * Next.js hot-reloads route modules in development, which would
 * otherwise create a brand new Mongoose connection on every request and
 * quickly exhaust MongoDB's connection pool. Caching the connection
 * promise on `global` survives module reloads and guarantees only one
 * connection attempt is ever in flight, in dev and in production alike.
 *
 * If you already have a Mongo connection helper elsewhere in the
 * project, merge this caching logic into it rather than running two
 * separate connection modules side by side.
 */
let cached = global._mongoose;
if (!cached) {
  cached = global._mongoose = { conn: null, promise: null };
}

export async function connectToDatabase() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, { maxPoolSize: 10 })
      .then((mongooseInstance) => {
        console.log("MongoDB connected");
        return mongooseInstance;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
