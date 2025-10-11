import User from "../models/user.model.js";
import Pin from "../models/pin.model.js";
import Like from "../models/like.model.js";
import Comment from "../models/comment.model.js";
import Follow from "../models/follow.model.js";
import Chat from "../models/chat.model.js";
import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/error.js";

// Replace with actual Socket.IO instance if needed
const getIo = () => ({
  to: (roomId) => ({
    emit: (event, payload) => {
      console.log(`[SOCKET MOCK] Emitting ${event} to room ${roomId} with payload:`, payload);
    }
  })
});

// Logs output with clear separators, useful for server debugging.
const logDebug = (label, data) => {
  console.log(`[DEBUG][${label}]`, JSON.stringify(data, null, 2));
};

// Helper: Checks whether the two users have any interaction as required
const checkInteraction = async (currentUserId, partnerId) => {
  // Mutual follow check
  const followCheck = await Follow.exists({
    $or: [
      { follower: currentUserId, following: partnerId },
      { follower: partnerId, following: currentUserId },
    ]
  });
  if (followCheck) return true;

  // Mutual pin interaction check
  const [partnerPins, currentUserPins] = await Promise.all([
    Pin.find({ user: partnerId }).select('_id'),
    Pin.find({ user: currentUserId }).select('_id')
  ]);
  const partnerPinIds = partnerPins.map(p => p._id).filter(Boolean);
  const currentUserPinIds = currentUserPins.map(p => p._id).filter(Boolean);

  const interactionCheck = await Promise.race([
    Like.exists({ user: currentUserId, pin: { $in: partnerPinIds } }),
    Comment.exists({ user: currentUserId, pin: { $in: partnerPinIds } }),
    Like.exists({ user: partnerId, pin: { $in: currentUserPinIds } }),
    Comment.exists({ user: partnerId, pin: { $in: currentUserPinIds } }),
  ]);
  return !!interactionCheck;
};

// @desc    Initiate or retrieve a chat session, enforcing interaction rules
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

  // ---- Interaction Enforcement ----
  const hasInteracted = await checkInteraction(currentUserId, partnerId);
  logDebug('interaction_check', { hasInteracted });

  if (!hasInteracted) {
    logDebug('interaction_restricted', { currentUserId, partnerId });
    return next(new ErrorHandler(
      "Messaging restricted: You can only message users who have interacted with your pins/profile (or vice versa).",
      403
    ));
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
  }

  // Defensive serialization (handle null, missing _id, etc)
  const chatData = chat ? chat.toObject() : {};
  logDebug('serialized_chat', chatData);

  // Final fail-safe
  if (!chatData._id) {
    logDebug('chat_serialization_fail', chatData);
    return next(new ErrorHandler("Server failed to establish chat session.", 500));
  }

  // ---- Partner Data for Response ----
  const partnerDetails = await User.findById(partnerId).select('username displayName img _id');
  const partnerData = partnerDetails ? partnerDetails.toObject() : {};
  partnerData.id = partnerData._id ? partnerData._id.toString() : '';
  logDebug('partnerData_for_response', partnerData);

  // ---- Final API Response ----
  const responsePayload = {
    success: true,
    chatId: chatData._id ? chatData._id.toString() : '', // Always string, always present
    partner: partnerData,
    messages: Array.isArray(chatData.messages) ? chatData.messages : [],
  };
  logDebug('api_response', responsePayload);

  res.status(200).json(responsePayload);
});

// @desc    Add a new message to a chat session
// @route   POST /chat/:chatId/message
export const sendMessage = catchAsyncError(async (req, res, next) => {
  const { chatId } = req.params;
  const { text } = req.body;
  const currentUserId = req.user._id;

  logDebug('sendMessage:input', { chatId, text, currentUserId });

  if (!text) return next(new ErrorHandler("Message text is required.", 400));

  const chat = await Chat.findById(chatId);
  logDebug('chat_lookup', chat);

  if (!chat || !chat.participants.some(p => p.equals(currentUserId))) {
    logDebug('chat_not_found_or_forbidden', { chatId, currentUserId });
    return next(new ErrorHandler("Chat session not found or forbidden.", 404));
  }

  const newMessage = {
    sender: currentUserId,
    text,
    createdAt: new Date(),
  };

  chat.messages.push(newMessage);
  chat.lastMessage = text;
  chat.lastMessageAt = newMessage.createdAt;
  await chat.save();

  // Identify the recipient
  const recipientId = chat.participants.find(id => !id.equals(currentUserId));
  const io = getIo();
  io.to(recipientId.toString()).emit('newMessage', {
    chatId,
    message: newMessage,
    sender: { id: currentUserId, username: req.user.username },
  });

  logDebug('message_sent', { chatId, newMessage });

  res.status(201).json({ success: true, message: newMessage });
});
