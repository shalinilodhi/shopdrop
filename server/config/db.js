const mongoose = require("mongoose");

// On a normal server this connects once at startup. On Vercel each request may
// hit a fresh serverless function, so the connection is cached on `global` and
// reused instead of opening a new one every time.
let cached = global._mongooseCache;
if (!cached) {
  cached = global._mongooseCache = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn) return cached.conn;

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not set");
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 10000,
      })
      .then((m) => {
        console.log("MongoDB Connected");
        return m;
      })
      .catch((err) => {
        cached.promise = null; // let the next request try again
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
};

module.exports = connectDB;
