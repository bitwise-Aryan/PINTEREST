// src/models/chat.model.js
import mongoose, { Schema } from "mongoose";

// Sub-schema for reactions on an individual message
const reactionSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    emoji: {
        type: String,
        required: true,
    },
}, { _id: false });

// Sub-schema for individual messages
const messageSchema = new Schema({
    sender: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    text: {
        type: String,
        // Optional because a message might just be an image or a pin
    },
    imageUrl: {
        type: String,
    },
    pin: {
        type: Schema.Types.ObjectId,
        ref: "Pin",
    },
    seen: {
        type: Boolean,
        default: false,
    },
    seenAt: {
        type: Date,
    },
    reactions: [reactionSchema],
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
    lastMessageAt: {
        type: Date,
    },
  },
  { timestamps: true }
);

chatSchema.index({ participants: 1 });
chatSchema.index({ lastMessageAt: -1 });

export default mongoose.model("Chat", chatSchema);