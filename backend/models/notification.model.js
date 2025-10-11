// src/models/notification.model.js
import mongoose, { Schema } from "mongoose";

const notificationSchema = new Schema(
  {
    // The user who *receives* the notification (the pin owner, or the followed user)
    recipient: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, // Index for fast lookup by recipient
    },
    // The user who *triggered* the action (liked, commented, followed)
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // The type of activity: 'like', 'comment', 'follow'
    type: {
      type: String,
      enum: ["like", "comment", "follow"],
      required: true,
    },
    // Reference to the pin, if the action is a like or comment
    pin: {
      type: Schema.Types.ObjectId,
      ref: "Pin",
      required: function() {
        return this.type === 'like' || this.type === 'comment';
      },
      index: true,
    },
    // The actual comment text (only if type is 'comment')
    content: {
      type: String,
      required: function() {
        return this.type === 'comment';
      },
    },
    // Status flag
    isRead: {
      type: Boolean,
      default: false,
      index: true, // Index for fast unread count
    },
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);