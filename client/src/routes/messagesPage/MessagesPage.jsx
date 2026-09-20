import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiRequest from '../../utils/apiRequest';
import ChatWindow from '../../components/chat/ChatWindow';
import './MessagesPage.css';

// Helper to format contact timestamp
const formatContactTime = (date) => {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';

  const today = new Date();
  if (d.toDateString() === today.toDateString()) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }

  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

const MessagesPage = () => {
  const navigate = useNavigate();
  const [partners, setPartners] = useState([]);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  const fetchPartners = async () => {
    try {
      const res = await apiRequest.get('/users/available-partners');
      const users = res.data.users || [];
      setPartners(users);

      // If no partner is selected yet, select the top one if they have existing chat
      setSelectedPartner((prev) => {
        if (!prev && users.length > 0 && users[0].hasChat) {
          return { ...users[0], id: users[0]._id };
        }
        return prev;
      });
    } catch (err) {
      console.error("Failed to fetch partners:", err);
      setError("Could not load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  const handleSelectPartner = (partner) => {
    setSelectedPartner({ ...partner, id: partner._id });
    // Reset unread count locally when opened
    setPartners((prev) =>
      prev.map((p) => (p._id === partner._id ? { ...p, unreadCount: 0 } : p))
    );
  };

  const filteredPartners = partners.filter((p) =>
    (p.displayName || p.username).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="messages-page-container">
      {/* Left Sidebar: Contact List */}
      <div className="messages-sidebar">
        <div className="messages-sidebar-header">
          <h2>Messages</h2>
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="messages-search-input"
          />
        </div>
        <div className="messages-contact-list">
          {loading ? (
            <div className="messages-loading">Loading chats...</div>
          ) : error ? (
            <div className="messages-error">{error}</div>
          ) : filteredPartners.length === 0 ? (
            <div className="messages-empty">No users found.</div>
          ) : (
            filteredPartners.map((partner) => (
              <div
                key={partner._id}
                className={`messages-contact-item ${
                  selectedPartner?._id === partner._id ? 'active' : ''
                }`}
                onClick={() => handleSelectPartner(partner)}
              >
                <div className="messages-avatar-wrapper">
                  <img
                    src={
                      partner.img ||
                      "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"
                    }
                    alt="avatar"
                    className="messages-contact-avatar"
                  />
                  {partner.unreadCount > 0 && (
                    <span className="avatar-unread-dot" />
                  )}
                </div>

                <div className="messages-contact-info">
                  <div className="messages-contact-row-top">
                    <p className="messages-contact-name">
                      {partner.displayName || partner.username}
                    </p>
                    {partner.lastMessageAt && (
                      <span className="messages-contact-time">
                        {formatContactTime(partner.lastMessageAt)}
                      </span>
                    )}
                  </div>
                  <div className="messages-contact-row-bottom">
                    <p className="messages-contact-lastmsg">
                      {partner.lastMessage || `@${partner.username}`}
                    </p>
                    {partner.unreadCount > 0 && (
                      <span className="messages-unread-badge">
                        {partner.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Pane: Chat Window */}
      <div className="messages-chat-area">
        {selectedPartner ? (
          <div className="messages-chat-wrapper">
            {/* Clickable Header for Profile Redirection */}
            <div
              className="messages-chat-header clickable-header"
              onClick={() => navigate(`/profile/${selectedPartner.username}`)}
              title={`View @${selectedPartner.username}'s profile`}
            >
              <img
                src={
                  selectedPartner.img ||
                  "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"
                }
                alt="avatar"
                className="messages-chat-header-avatar"
              />
              <div className="messages-chat-header-details">
                <h3>{selectedPartner.displayName || selectedPartner.username}</h3>
                <span className="messages-header-sub">
                  @{selectedPartner.username} • View Profile
                </span>
              </div>
            </div>
            <ChatWindow partner={selectedPartner} />
          </div>
        ) : (
          <div className="messages-chat-placeholder">
            <div className="placeholder-content">
              <h3>Your Messages</h3>
              <p>Select a user from the left sidebar to start chatting.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;
