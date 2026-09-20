import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../../context/SocketContext.jsx';
import useAuthStore from '../../utils/authStore.jsx';
import apiRequest from '../../utils/apiRequest.jsx';
import EmojiPicker from 'emoji-picker-react';
import './ChatWindow.css';

// Quick WhatsApp reactions list
const QUICK_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

// Helper to format date badges (e.g. "Today", "Yesterday", "Sunday, 20 Sep 2026")
const formatMessageDateBadge = (date) => {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (d.toDateString() === today.toDateString()) {
    return 'Today';
  }
  if (d.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }

  const options = {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    ...(d.getFullYear() !== today.getFullYear() ? { year: 'numeric' } : {}),
  };
  return d.toLocaleDateString(undefined, options);
};

// Helper to format message time (e.g. "10:45 AM")
const formatMessageTime = (date) => {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Helper for full timestamp tooltip
const formatFullTimestamp = (date) => {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const ChatWindow = ({ partner }) => {
  const { socket } = useSocket();
  const { currentUser } = useAuthStore();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [activeReactMessageId, setActiveReactMessageId] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [chatId, setChatId] = useState(null);
  const [uploadError, setUploadError] = useState('');

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const emojiPickerRef = useRef(null);

  // Close emoji picker and reaction bar on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target)) {
        setShowEmojiPicker(false);
      }
      if (!e.target.closest('.message-reactions-bar') && !e.target.closest('.reaction-trigger-btn')) {
        setActiveReactMessageId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch chat session and messages when partner changes
  useEffect(() => {
    if (!partner?.username) return;

    const fetchChatSession = async () => {
      try {
        setUploadError('');
        const res = await apiRequest.get(`/chat/${partner.username}/init`);

        if (!res.data || !res.data.chatId) {
          console.error("Chat initialization failed: Missing Chat ID", res.data);
          setChatId(null);
          return;
        }

        const activeChatId = res.data.chatId;
        setChatId(activeChatId);
        const fetchedMessages = res.data.messages ?? [];
        setMessages(
          fetchedMessages.map((msg) => {
            const pId = partner.id ?? partner._id;
            const isPartner = msg.sender?.toString() === pId?.toString();
            return {
              id: msg._id || msg.id || Date.now() + Math.random(),
              sender: isPartner ? partner.username : 'You',
              text: msg.text,
              imageUrl: msg.imageUrl,
              pin: msg.pin,
              seen: msg.seen || false,
              seenAt: msg.seenAt,
              reactions: msg.reactions || [],
              timestamp: new Date(msg.createdAt),
            };
          })
        );

        // Mark incoming messages as seen
        apiRequest.post(`/chat/${activeChatId}/seen`).catch(() => {});
      } catch (error) {
        console.error("Failed to initialize chat session:", error);
        setChatId(null);
      }
    };

    fetchChatSession();
  }, [partner?.username, partner?.id, partner?._id]);

  // Join chat room whenever chatId is ready
  useEffect(() => {
    if (!socket || !chatId) return;
    socket.emit('joinChat', chatId.toString());
    return () => {
      socket.emit('leaveChat', chatId.toString());
    };
  }, [socket, chatId]);

  // Listen for real-time messages, seen events, and reactions
  useEffect(() => {
    if (!socket || !chatId) return;

    const handleNewMessage = (data) => {
      const isTargetChat = data.chatId?.toString() === chatId?.toString();
      if (!isTargetChat) return;

      const isMe = 
        data.sender?.username === currentUser?.username || 
        data.sender?.id?.toString() === currentUser?._id?.toString() ||
        data.message?.sender?.toString() === currentUser?._id?.toString();

      const newMsgObj = {
        id: data.message._id || data.message.id || Date.now(),
        sender: isMe ? 'You' : (partner?.username || data.sender?.username),
        text: data.message.text,
        imageUrl: data.message.imageUrl,
        pin: data.message.pin,
        seen: data.message.seen || false,
        reactions: data.message.reactions || [],
        timestamp: new Date(data.message.createdAt),
      };

      setMessages((prev) => {
        // Prevent duplicate if already added
        if (prev.some((m) => m.id?.toString() === newMsgObj.id?.toString())) {
          return prev;
        }
        return [...prev, newMsgObj];
      });

      // Mark seen if incoming from partner
      if (!isMe) {
        apiRequest.post(`/chat/${chatId}/seen`).catch(() => {});
      }
    };

    const handleMessagesSeen = (data) => {
      if (data.chatId?.toString() === chatId?.toString()) {
        setMessages((prev) =>
          prev.map((m) => (m.sender === 'You' ? { ...m, seen: true } : m))
        );
      }
    };

    const handleMessageReaction = (data) => {
      if (data.chatId?.toString() === chatId?.toString()) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id?.toString() === data.messageId?.toString()
              ? { ...m, reactions: data.reactions }
              : m
          )
        );
      }
    };

    socket.on('newMessage', handleNewMessage);
    socket.on('messagesSeen', handleMessagesSeen);
    socket.on('messageReaction', handleMessageReaction);

    return () => {
      socket.off('newMessage', handleNewMessage);
      socket.off('messagesSeen', handleMessagesSeen);
      socket.off('messageReaction', handleMessageReaction);
    };
  }, [socket, chatId, partner?.username, currentUser]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle file selection
  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setFilePreview(URL.createObjectURL(selected));
      setUploadError('');
    }
  };

  // Remove selected file
  const handleRemoveFile = () => {
    setFile(null);
    if (filePreview) {
      URL.revokeObjectURL(filePreview);
      setFilePreview(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle emoji select from picker
  const handleEmojiClick = (emojiData) => {
    setInputMessage((prev) => prev + emojiData.emoji);
  };

  // Handle message reaction toggle (WhatsApp style)
  const handleReact = async (messageId, emoji) => {
    try {
      const res = await apiRequest.post(
        `/chat/${chatId}/messages/${messageId}/reaction`,
        { emoji }
      );
      setMessages((prev) =>
        prev.map((m) =>
          m.id?.toString() === messageId?.toString()
            ? { ...m, reactions: res.data.reactions }
            : m
        )
      );
      setActiveReactMessageId(null);
    } catch (err) {
      console.error("Failed to add reaction:", err);
    }
  };

  // Handle sending a message
  const handleSend = async (e) => {
    e.preventDefault();
    const text = inputMessage.trim();
    if ((text === '' && !file) || !chatId || isUploading) return;

    setIsUploading(true);
    setUploadError('');
    setShowEmojiPicker(false);

    try {
      const formData = new FormData();
      if (text) formData.append('text', text);
      if (file) formData.append('media', file);

      const res = await apiRequest.post(`/chat/${chatId}/message`, formData);

      const sentMessage = res.data.message;
      setMessages((prev) => {
        if (prev.some((m) => m.id?.toString() === sentMessage._id?.toString())) {
          return prev;
        }
        return [
          ...prev,
          {
            id: sentMessage._id || sentMessage.id || Date.now(),
            sender: 'You',
            text: sentMessage.text,
            imageUrl: sentMessage.imageUrl,
            pin: sentMessage.pin,
            seen: false,
            reactions: [],
            timestamp: new Date(sentMessage.createdAt),
          },
        ];
      });

      setInputMessage('');
      handleRemoveFile();
    } catch (error) {
      console.error("Failed to send message:", error);
      setUploadError(error.response?.data?.message || "Failed to send message. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="chat-container">
      {/* Messages Scroll Area */}
      <div className="messages-area">
        {messages.length === 0 && (
          <div className="empty-message-container">
            <div className="empty-message-icon">💬</div>
            <p className="empty-message">No messages yet. Say hello to {partner?.displayName || partner?.username || 'start chatting'}!</p>
          </div>
        )}

        {messages.map((msg, index) => {
          // Check if we need a Date Divider before this message
          const prevMsg = messages[index - 1];
          const showDateDivider =
            !prevMsg ||
            new Date(msg.timestamp).toDateString() !== new Date(prevMsg.timestamp).toDateString();

          // Aggregate reactions by emoji
          const reactionCounts = (msg.reactions || []).reduce((acc, r) => {
            acc[r.emoji] = (acc[r.emoji] || 0) + 1;
            return acc;
          }, {});

          return (
            <React.Fragment key={msg.id}>
              {showDateDivider && (
                <div className="chat-date-divider">
                  <span>{formatMessageDateBadge(msg.timestamp)}</span>
                </div>
              )}

              <div
                className={`message ${msg.sender === 'You' ? 'message-sent' : 'message-received'}`}
              >
                <div className="message-wrapper">
                  {/* Reaction trigger button on hover */}
                  <button
                    type="button"
                    className="reaction-trigger-btn"
                    onClick={() =>
                      setActiveReactMessageId(
                        activeReactMessageId === msg.id ? null : msg.id
                      )
                    }
                    title="React to message"
                  >
                    😊
                  </button>

                  {/* WhatsApp Quick Reactions Bar Popover */}
                  {activeReactMessageId === msg.id && (
                    <div className="message-reactions-bar">
                      {QUICK_REACTIONS.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          className="reaction-quick-btn"
                          onClick={() => handleReact(msg.id, emoji)}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="message-bubble" title={formatFullTimestamp(msg.timestamp)}>
                    {/* Image Attachment */}
                    {msg.imageUrl && (
                      <div className="message-image-wrapper">
                        <a href={msg.imageUrl} target="_blank" rel="noopener noreferrer">
                          <img
                            src={msg.imageUrl}
                            alt="attachment"
                            className="chat-attachment-img"
                          />
                        </a>
                      </div>
                    )}

                    {/* Shared Pin Link */}
                    {msg.pin && (
                      <div className="chat-pin-link">
                        <a href={`/pin/${msg.pin}`} target="_blank" rel="noreferrer">
                          📌 View Shared Pin
                        </a>
                      </div>
                    )}

                    {/* Message Text */}
                    {msg.text && <p className="message-text">{msg.text}</p>}

                    {/* Time and Blue Tick Status */}
                    <div className="message-meta">
                      <span
                        className={`message-time ${
                          msg.sender === 'You' ? 'time-sent' : 'time-received'
                        }`}
                      >
                        {formatMessageTime(msg.timestamp)}
                      </span>

                      {/* WhatsApp Blue Ticks for Sent Messages */}
                      {msg.sender === 'You' && (
                        <span
                          className="tick-indicator"
                          title={msg.seen ? 'Seen by recipient' : 'Delivered'}
                        >
                          {msg.seen ? (
                            <span className="tick-blue">✓✓</span>
                          ) : (
                            <span className="tick-single">✓</span>
                          )}
                        </span>
                      )}
                    </div>

                    {/* Reactions Display Badge */}
                    {Object.keys(reactionCounts).length > 0 && (
                      <div className="message-reactions-badge">
                        {Object.entries(reactionCounts).map(([emoji, count]) => (
                          <span
                            key={emoji}
                            className="reaction-badge-item"
                            onClick={() => handleReact(msg.id, emoji)}
                            title={`Reacted with ${emoji}`}
                          >
                            {emoji} {count > 1 ? count : ''}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </React.Fragment>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Error notification banner if any */}
      {uploadError && (
        <div className="chat-error-banner">
          ⚠️ {uploadError}
        </div>
      )}

      {/* File Attachment Preview Banner */}
      {file && (
        <div className="attachment-preview-bar">
          <div className="attachment-preview-info">
            {filePreview && (
              <img src={filePreview} alt="Preview" className="attachment-thumb" />
            )}
            <div className="attachment-details">
              <span className="attachment-filename">{file.name}</span>
              <span className="attachment-size">
                {(file.size / 1024).toFixed(1)} KB
              </span>
            </div>
          </div>
          <button
            type="button"
            className="attachment-remove-btn"
            onClick={handleRemoveFile}
            title="Remove attachment"
          >
            ✕
          </button>
        </div>
      )}

      {/* Emoji Picker Popover */}
      {showEmojiPicker && (
        <div className="chat-emoji-popover" ref={emojiPickerRef}>
          <EmojiPicker
            onEmojiClick={handleEmojiClick}
            autoFocusSearch={false}
            width={340}
            height={400}
            previewConfig={{ showPreview: false }}
          />
        </div>
      )}

      {/* Input Area */}
      <form onSubmit={handleSend} className="input-area">
        {/* Attachment Button */}
        <label
          htmlFor="chat-file-upload"
          className="chat-action-btn"
          title="Attach Image"
        >
          📎
        </label>
        <input
          id="chat-file-upload"
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />

        {/* Emoji Button */}
        <button
          type="button"
          className={`chat-action-btn ${showEmojiPicker ? 'active' : ''}`}
          onClick={() => setShowEmojiPicker((prev) => !prev)}
          title="Insert Emoji"
        >
          😊
        </button>

        {/* Message Input */}
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder={
            file
              ? `Attached: ${file.name}`
              : chatId
              ? 'Type a message...'
              : 'Connecting...'
          }
          disabled={!chatId || isUploading}
          className="input-field"
        />

        {/* Send Button */}
        <button
          type="submit"
          disabled={!chatId || isUploading || (inputMessage.trim() === '' && !file)}
          className="send-button"
        >
          {isUploading ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;
