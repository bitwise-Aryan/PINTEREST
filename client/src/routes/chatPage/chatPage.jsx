import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import ChatWindow from '../../components/chat/ChatWindow';
import './ChatPage.css';
const ChatPage = () => {
 const { partnerUsername } = useParams();
 const [partner, setPartner] = useState(null);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState(null);

 useEffect(() => {
     const fetchPartnerDetails = async () => {
         if (!partnerUsername) {
             setError("No partner specified.");
             setLoading(false);
             return;
         }
         try {
             // Ensure a plain 'id' prop from the response
             const res = await axios.get(`/users/${partnerUsername}`, { withCredentials: true });
             setPartner({ ...res.data, id: res.data._id });
             setError(null);
         } catch (err) {
             console.error("Failed to fetch partner details:", err);
             setError("User not found or connection failed.");
         } finally {
             setLoading(false);
         }
     };
     fetchPartnerDetails();
 }, [partnerUsername]);

 if (loading) {
     return <div className="chat-page-loading">Loading chat partner details...</div>;
 }
 if (error) {
     return <div className="chat-page-error">Error: {error}</div>;
 }
 return (
     <div className="chat-page container mx-auto p-4 flex flex-col h-full">
         <h2 className="text-2xl font-bold mb-4">Chat with {partner.displayName || partner.username}</h2>
         <ChatWindow partner={partner} />
     </div>
 );
};

export default ChatPage;
