// src/models/chat.model.js
import mongoose, { Schema } from "mongoose";

// Sub-schema for individual messages
const messageSchema = new Schema({
    sender: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    text: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Schema for a conversation/thread
const chatSchema = new Schema(
  {
    // Array of the two participants' IDs
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    // Embed the messages directly in the conversation document
    messages: [messageSchema],
    // For quick reference in the UI
    lastMessage: {
        type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Chat", chatSchema);