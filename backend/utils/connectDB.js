import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO || process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error("Neither MONGO nor MONGO_URI environment variable is defined!");
    }
    await mongoose.connect(mongoUri);
    console.log("MongoDB connected successfully!");
  } catch (err) {
    console.error("MONGODB CONNECTION ERROR:", err.message);
    process.exit(1); 
  }
};

export default connectDB;
