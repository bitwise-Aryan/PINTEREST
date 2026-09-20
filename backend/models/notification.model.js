// // src/models/notification.model.js
// import mongoose, { Schema } from "mongoose";

// const notificationSchema = new Schema(
//   {
//     // The user who *receives* the notification (the pin owner, or the followed user)
//     recipient: {
//       type: Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//       index: true, // Index for fast lookup by recipient
//     },
//     // The user who *triggered* the action (liked, commented, followed)
//     sender: {
//       type: Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//     // The type of activity: 'like', 'comment', 'follow'
//     type: {
//       type: String,
//       enum: ["like", "comment", "follow"],
//       required: true,
//     },
//     // Reference to the pin, if the action is a like or comment
//     pin: {
//       type: Schema.Types.ObjectId,
//       ref: "Pin",
//       required: function() {
//         return this.type === 'like' || this.type === 'comment';
//       },
//       index: true,
//     },
//     // The actual comment text (only if type is 'comment')
//     content: {
//       type: String,
//       required: function() {
//         return this.type === 'comment';
//       },
//     },
//     // Status flag
//     isRead: {
//       type: Boolean,
//       default: false,
//       index: true, // Index for fast unread count
//     },
//   },
//   { timestamps: true }
// );

// export default mongoose.model("Notification", notificationSchema);
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
    // The user who *triggered* the action (liked, commented, followed, created pin)
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // The type of activity: 'like', 'comment', 'follow', 'pin'
    type: {
      type: String,
      // FIX: Added 'activity' to the list of allowed types for general follower updates
      enum: ["like", "comment", "follow", "pin", "activity"], 
      required: true,
    },
    // Reference to the pin, if the action is a like, comment, pin creation, or activity on a pin
    pin: {
      type: Schema.Types.ObjectId,
      ref: "Pin",
      required: function() {
        // Pin reference is now required for 'pin', 'like', 'comment', and 'activity' types
        return this.type === 'like' || this.type === 'comment' || this.type === 'pin' || this.type === 'activity';
      },
      index: true,
    },
    // The actual comment text or general message about the new pin
    content: {
      type: String,
      required: function() {
        // Content is required for 'comment', 'pin', and 'activity'
        return this.type === 'comment' || this.type === 'pin' || this.type === 'activity';
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
