import User from "../models/user.model.js";
import Pin from "../models/pin.model.js";
import Like from "../models/like.model.js";
import Comment from "../models/comment.model.js";
import Follow from "../models/follow.model.js";
import Chat from "../models/chat.model.js";
import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/error.js";
import Imagekit from "imagekit";

// Logs output with clear separators, useful for server debugging.
const logDebug = (label, data) => {
  console.log(`[DEBUG][${label}]`, JSON.stringify(data, null, 2));
};

// @desc    Initiate or retrieve a chat session
// @route   GET /chat/:partnerUsername/init
// @access  Private
export const initiateChat = catchAsyncError(async (req, res, next) => {
  const currentUserId = req.user._id;
  const { partnerUsername } = req.params;
  logDebug('initiateChat:input', { currentUserId, partnerUsername });

  // ---- Partner Lookup ----
  const partner = await User.findOne({ username: partnerUsername, accountVerified: true });
  logDebug('partner_lookup', partner);

  if (!partner) {
    logDebug('partner_lookup:failed', { msg: 'User not found' });
    return next(new ErrorHandler("Partner user not found.", 404));
  }
  const partnerId = partner._id;

  if (currentUserId.equals(partnerId)) {
    logDebug('self_message_block', { currentUserId, partnerId });
    return next(new ErrorHandler("Cannot message yourself.", 400));
  }

  // ---- Chat Retrieval/Creation ----
  let chat = await Chat.findOne({
    participants: { $all: [currentUserId, partnerId] }
  });
  logDebug('chat_lookup', chat);

  if (!chat) {
    chat = await Chat.create({
      participants: [currentUserId, partnerId],
      messages: [],
    });
    logDebug('chat_created', chat);
  } else {
    // Mark partner's unread messages as seen
    let updated = false;
    const now = new Date();
    chat.messages.forEach(msg => {
      if (msg.sender.equals(partnerId) && !msg.seen) {
        msg.seen = true;
        msg.seenAt = now;
        updated = true;
      }
    });
    if (updated) {
      await chat.save();
      const io = req.app.get('io');
      if (io) {
        io.to(partnerId.toString()).emit('messagesSeen', {
          chatId: chat._id.toString(),
          seenAt: now,
        });
      }
    }
  }

  // Defensive serialization (handle null, missing _id, etc)
  const chatData = chat ? chat.toObject() : {};

  // Partner Data for Response
  const partnerDetails = await User.findById(partnerId).select('username displayName img _id');
  const partnerData = partnerDetails ? partnerDetails.toObject() : {};
  partnerData.id = partnerData._id ? partnerData._id.toString() : '';

  // Final API Response
  const responsePayload = {
    success: true,
    chatId: chatData._id ? chatData._id.toString() : '',
    partner: partnerData,
    messages: Array.isArray(chatData.messages) ? chatData.messages : [],
  };

  res.status(200).json(responsePayload);
});

// @desc    Add a new message to a chat session
// @route   POST /chat/:chatId/message
export const sendMessage = catchAsyncError(async (req, res, next) => {
  const { chatId } = req.params;
  const body = req.body || {};
  const text = body.text;
  const pin = body.pin;
  const currentUserId = req.user._id;

  let imageUrl = body.imageUrl;
  const media = req.files?.media;

  logDebug('sendMessage:input', { chatId, text, imageUrl, pin, currentUserId, hasMedia: !!media });

  if (!text && !imageUrl && !pin && !media) {
    return next(new ErrorHandler("Message content is required.", 400));
  }

  const chat = await Chat.findById(chatId);
  logDebug('chat_lookup', chat);

  if (!chat || !chat.participants.some(p => p.equals(currentUserId))) {
    logDebug('chat_not_found_or_forbidden', { chatId, currentUserId });
    return next(new ErrorHandler("Chat session not found or forbidden.", 404));
  }

  if (media) {
    try {
      const imagekit = new Imagekit({
        publicKey: process.env.IK_PUBLIC_KEY,
        privateKey: process.env.IK_PRIVATE_KEY,
        urlEndpoint: process.env.IK_URL_ENDPOINT,
      });
      const response = await imagekit.upload({
        file: media.data,
        fileName: media.name,
        folder: "chat_images",
      });
      imageUrl = response.url || `${process.env.IK_URL_ENDPOINT}/${response.filePath?.replace(/^\//, '')}`;
    } catch (uploadErr) {
      console.error("ImageKit upload error:", uploadErr);
      return next(new ErrorHandler("Failed to upload image attachment: " + uploadErr.message, 500));
    }
  }

  const newMessage = {
    sender: currentUserId,
    text: text || "",
    imageUrl: imageUrl || null,
    pin: pin || null,
    seen: false,
    reactions: [],
    createdAt: new Date(),
  };

  chat.messages.push(newMessage);
  chat.lastMessage = text || (imageUrl ? "Sent an image" : "Sent an attachment");
  chat.lastMessageAt = newMessage.createdAt;
  await chat.save();

  const savedMessage = chat.messages[chat.messages.length - 1];

  // Identify recipient
  const recipientId = chat.participants.find(id => !id.equals(currentUserId));
  const io = req.app.get('io');
  if (io) {
    const payload = {
      chatId: chatId.toString(),
      message: savedMessage,
      sender: { id: currentUserId, username: req.user.username },
    };
    io.to(chatId.toString()).emit('newMessage', payload);
    if (recipientId) {
      io.to(recipientId.toString()).emit('newMessage', payload);
    }
  }

  logDebug('message_sent', { chatId, savedMessage });

  res.status(201).json({ success: true, message: savedMessage });
});

// @desc    Mark all messages in a chat as seen by recipient
// @route   POST /chat/:chatId/seen
export const markMessagesAsSeen = catchAsyncError(async (req, res, next) => {
  const { chatId } = req.params;
  const currentUserId = req.user._id;

  const chat = await Chat.findById(chatId);
  if (!chat || !chat.participants.some(p => p.equals(currentUserId))) {
    return next(new ErrorHandler("Chat session not found.", 404));
  }

  const partnerId = chat.participants.find(id => !id.equals(currentUserId));
  let updated = false;
  const now = new Date();

  chat.messages.forEach(msg => {
    if (msg.sender.equals(partnerId) && !msg.seen) {
      msg.seen = true;
      msg.seenAt = now;
      updated = true;
    }
  });

  if (updated) {
    await chat.save();
    const io = req.app.get('io');
    if (io) {
      const payload = {
        chatId: chat._id.toString(),
        seenAt: now,
      };
      io.to(chat._id.toString()).emit('messagesSeen', payload);
      if (partnerId) {
        io.to(partnerId.toString()).emit('messagesSeen', payload);
      }
    }
  }

  res.status(200).json({ success: true, message: "Messages marked as seen." });
});

// @desc    Add or toggle an emoji reaction on a message
// @route   POST /chat/:chatId/messages/:messageId/reaction
export const toggleReaction = catchAsyncError(async (req, res, next) => {
  const { chatId, messageId } = req.params;
  const { emoji } = req.body || {};
  const currentUserId = req.user._id;

  if (!emoji) {
    return next(new ErrorHandler("Emoji is required for reaction.", 400));
  }

  const chat = await Chat.findById(chatId);
  if (!chat || !chat.participants.some(p => p.equals(currentUserId))) {
    return next(new ErrorHandler("Chat not found.", 404));
  }

  const message = chat.messages.id(messageId);
  if (!message) {
    return next(new ErrorHandler("Message not found.", 404));
  }

  if (!Array.isArray(message.reactions)) {
    message.reactions = [];
  }

  const existingIndex = message.reactions.findIndex(r => r.user.equals(currentUserId));
  if (existingIndex > -1) {
    if (message.reactions[existingIndex].emoji === emoji) {
      // Toggle off if same emoji clicked again
      message.reactions.splice(existingIndex, 1);
    } else {
      // Change to new emoji
      message.reactions[existingIndex].emoji = emoji;
    }
  } else {
    // Add reaction
    message.reactions.push({ user: currentUserId, emoji });
  }

  await chat.save();

  // Notify both the chat room and recipient via Socket.IO
  const recipientId = chat.participants.find(id => !id.equals(currentUserId));
  const io = req.app.get('io');
  if (io) {
    const payload = {
      chatId: chatId.toString(),
      messageId: messageId.toString(),
      reactions: message.reactions,
    };
    io.to(chatId.toString()).emit('messageReaction', payload);
    if (recipientId) {
      io.to(recipientId.toString()).emit('messageReaction', payload);
    }
  }

  res.status(200).json({ success: true, reactions: message.reactions });
});
