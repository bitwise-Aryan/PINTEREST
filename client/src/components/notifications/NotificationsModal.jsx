import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Image from "../image/image"; // Assuming you have an Image component
import './NotificationsModal.css'; 

const NotificationsModal = ({ onClose }) => {
    const [notifications, setNotifications] = useState([]); 
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const res = await axios.get('/notifications', { withCredentials: true });
                if (Array.isArray(res.data.notifications)) {
                    setNotifications(res.data.notifications);
                } else {
                    setNotifications([]);
                }
            } catch (err) {
                console.error("Error fetching notifications:", err);
                setNotifications([]);
            } finally {
                setLoading(false);
            }
        };
        fetchNotifications();
    }, []);

    const getMessage = (notif) => {
        const senderName = notif.sender?.displayName || notif.sender?.username || 'A User';
        const pinTitle = notif.pin?.title || 'a pin';
        
        switch (notif.type) {
            case 'like':
                return `liked your pin: ${pinTitle}`;
            case 'comment':
                return `commented "${notif.content}" on your pin`;
            case 'follow':
                return `started following you.`;
            default:
                return 'has new activity.';
        }
    };
    
    // Handles navigation to user profile (sender) or pin detail page
    const handleActionClick = (notif) => {
        onClose(); 
        
        // Navigate to sender's profile for all interactions
        if (notif.sender?.username) {
            navigate(`/profile/${notif.sender.username}`); 
        } else if (notif.pin?._id) {
             // Fallback: navigate to the pin detail page if user profile is unavailable
             navigate(`/pin/${notif.pin._id}`); 
        }
    }

    return (
        <div className="notifications-modal-overlay" onClick={onClose}>
            <div className="notifications-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Notifications</h3>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>
                <div className="modal-body">
                    {loading ? (
                        <p>Loading...</p>
                    ) : (notifications && notifications.length === 0) ? (
                        <p className="empty-state">Nothing to see here yet!</p>
                    ) : (
                        notifications.map(notif => (
                            <div 
                                key={notif._id} 
                                className={`notification-item ${notif.isRead ? 'read' : 'unread'}`}
                                onClick={() => handleActionClick(notif)}
                            >
                                {/* 1. Sender Image/Icon (Using standard img tag for simplicity as avatars often use full URLs) */}
                                <img 
                                    src={notif.sender?.img || 'https://placehold.co/40x40/cccccc/333333?text=U'} 
                                    alt={notif.sender?.username || 'user'} 
                                    className="sender-img" 
                                />
                                
                                {/* 2. Notification Message Content */}
                                <div className="notification-content">
                                    <span className="sender-name">{notif.sender?.displayName || notif.sender?.username}</span>
                                    {` ${getMessage(notif)}`}
                                    <span className="timestamp">{new Date(notif.createdAt).toLocaleString()}</span>
                                </div>
                                
                                {/* 3. Pin Preview Image (Conditional) */}
                                {notif.pin && (
                                    <div className="pin-preview-container">
                                        {/* FIX: Use the custom Image component for ImageKit resolution */}
                                        <Image 
                                            path={notif.pin.media} // Use the relative path
                                            alt={notif.pin.title} 
                                            className="pin-preview-img"
                                            w={50} // Request a width of 50px for the thumbnail
                                            h={50} // Request a height of 50px for the thumbnail
                                        />
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default NotificationsModal;
