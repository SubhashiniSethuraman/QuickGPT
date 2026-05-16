// config/db.js
import { MongoClient } from "mongodb";

let db;

export const connectDB = async () => {
  try {
    const client = new MongoClient(process.env.MONGO_URI);

    await client.connect();

    // ✅ Explicit DB name
    db = client.db("test");

    console.log("MongoDB Connected");
    console.log("Using DB:", db.databaseName);

    return db;

  } catch (error) {
    console.error("Database connection error:", error.message);
    process.exit(1);
  }
};

export const getDB = () => {
  if (!db) {
    throw new Error("Database not initialized. Call connectDB first.");
  }
  return db;
};