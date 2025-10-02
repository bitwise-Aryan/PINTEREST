import { Schema } from "mongoose";
import mongoose from "mongoose";

// Define the Pin schema which will store the metadata and ImageKit URL for the image/video.
const pinSchema = new Schema(
  {
    // Stores the permanent URL provided by ImageKit.io
    media: {
      type: String,
      required: true,
    },
    // Stores the ImageKit file ID, useful for deleting or managing the file later
    imagekitFileId: {
        type: String,
    },
    // Original media dimensions for layout rendering
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
    // Optional external link
    link: {
      type: String,
    },
    // References the board this pin belongs to (optional)
    board: {
      type: Schema.Types.ObjectId,
      ref: "Board",
    },
    // Searchable tags
    tags: {
      type: [String],
    },
    // Creator of the pin
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Pin", pinSchema);
