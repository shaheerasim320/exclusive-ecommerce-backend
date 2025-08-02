import { connectDB } from "../utils/db.js";

export const dbConnectMiddleware = async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("MongoDB connection error:", err);
    res.status(500).json({ message: "Database connection failed" });
  }
};
