import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(" MongoDB is connected!");
  } catch (err) {
    console.error(" MONGODB CONNECTION ERROR:", err.message);
    process.exit(1); 
  }
};

export default connectDB;
