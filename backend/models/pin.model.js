import { Schema } from "mongoose";
import mongoose from "mongoose";

// Define the Pin schema to store pin metadata and media info.
const pinSchema = new Schema(
  {
    // Media URL from ImageKit.io
    media: {
      type: String,
      required: true,
    },
    // ImageKit file ID, if you need to manage/delete the file later
    imagekitFileId: {
      type: String,
    },
    // Original media dimensions for UI layout
    width: {
      type: Number,
      required: true,
    },
    height: {
      type: Number,
      required: true,
    },
    // Pin details
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    // Optional: External link associated with the pin
    link: {
      type: String,
    },
    // Board reference (optional)
    board: {
      type: Schema.Types.ObjectId,
      ref: "Board",
    },
    // Tags for search/discovery
    tags: {
      type: [String],
    },
    // Creator of the pin (required)
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Array of user IDs who liked the pin (for dashboard counts and user interaction)
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      }
    ],
  },
  { timestamps: true }
);

// Exports the model for use in controllers and routes.
export default mongoose.model("Pin", pinSchema);
