// import React, { useState, useEffect, useRef } from 'react';
// import { useSocket } from '../../context/SocketContext.jsx';
// import axios from 'axios';

// const ChatWindow = ({ partner }) => {
//   const { socket } = useSocket();
//   const [messages, setMessages] = useState([]);
//   const [inputMessage, setInputMessage] = useState('');
//   const [chatId, setChatId] = useState(null);
//   const messagesEndRef = useRef(null);
//   const [isAuthorized, setIsAuthorized] = useState(true);

//   // Fetch chat session and messages on partner change
//   useEffect(() => {
//     const fetchChatSession = async () => {
//       try {
//         const res = await axios.get(`/chat/${partner.username}/init`, { withCredentials: true });
//         console.log('Backend response:', res.data);

//         if (!res.data || !res.data.chatId) {
//           console.error("Chat initialization failed: Missing Chat ID in response.", res.data);
//           setChatId(null);
//           setIsAuthorized(true);
//           return;
//         }
//         setChatId(res.data.chatId);
//         setIsAuthorized(true);

//         const fetchedMessages = res.data.messages ?? [];
//         setMessages(fetchedMessages.map(msg => {
//           const pId = partner.id ?? partner._id;
//           const isPartner = msg.sender.toString() === pId?.toString();
//           return {
//             ...msg,
//             sender: isPartner ? partner.username : 'You',
//             timestamp: new Date(msg.createdAt),
//           };
//         }));
//       } catch (error) {
//         if (error.response && error.response.status === 403) {
//           setIsAuthorized(false);
//         } else {
//           console.error("Failed to initialize chat session:", error);
//           setChatId(null);
//         }
//       }
//     };
//     fetchChatSession();
//   }, [partner.username, partner.id, partner._id]);

//   // Real-time updates with cleanup
//   useEffect(() => {
//     if (!socket || !chatId) return;
//     const handleNewMessage = (data) => {
//       if (data.chatId === chatId) {
//         setMessages(prev => [
//           ...prev,
//           {
//             id: data.message.id || Date.now(),
//             sender: data.sender.username,
//             text: data.message.text,
//             timestamp: new Date(data.message.createdAt)
//           }
//         ]);
//       }
//     };
//     socket.on('newMessage', handleNewMessage);
//     return () => {
//       socket.off('newMessage', handleNewMessage);
//     };
//   }, [socket, chatId, partner.username]);

//   // Scroll to latest message when messages change
//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   // Handle sending a message
//   const handleSend = async (e) => {
//     e.preventDefault();
//     const text = inputMessage.trim();
//     if (text === '' || !chatId) return;
//     try {
//       const res = await axios.post(`/chat/${chatId}/message`, { text }, { withCredentials: true });
//       const sentMessage = res.data.message;
//       setMessages(prev => [
//         ...prev,
//         {
//           id: sentMessage.id || Date.now(),
//           sender: 'You',
//           text: sentMessage.text,
//           timestamp: new Date(sentMessage.createdAt)
//         }
//       ]);
//       setInputMessage('');
//     } catch (error) {
//       console.error("Failed to send message:", error);
//     }
//   };

//   if (!isAuthorized) {
//     return (
//       <div className="flex flex-col h-full items-center justify-center p-10 bg-red-50 border border-red-300 rounded-lg shadow-md">
//         <p className="text-2xl font-semibold text-red-700 mb-6">Chat Forbidden</p>
//         <p className="text-red-600 text-center max-w-sm">
//           Messaging is restricted to users who have interacted with your pins or profile (or vice versa).
//         </p>
//       </div>
//     );
//   }

//   return (
//     <div className="flex flex-col h-full bg-white border border-gray-200 rounded-lg shadow-lg">
//       {/* Messages display */}
//       <div className="flex-grow p-6 overflow-y-auto bg-gray-50 space-y-5">
//         {messages.length === 0 && (
//           <p className="text-center text-gray-400 italic mt-10 select-none">
//             Start the conversation!
//           </p>
//         )}
//         {messages.map((msg) => (
//           <div key={msg.id} className={`flex ${msg.sender === 'You' ? 'justify-end' : 'justify-start'}`}>
//             <div className={`p-4 max-w-xs rounded-xl shadow ${msg.sender === 'You' ? 'bg-red-600 text-white rounded-br-none' : 'bg-white text-gray-800 rounded-tl-none border border-gray-200'}`}>
//               <p className="break-words whitespace-pre-wrap">{msg.text}</p>
//               <span className={`block mt-1 text-xs ${msg.sender === 'You' ? 'text-red-200' : 'text-gray-500'}`}>
//                 {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//               </span>
//             </div>
//           </div>
//         ))}
//         <div ref={messagesEndRef} />
//       </div>

//       {/* Input form */}
//       <form onSubmit={handleSend} className="flex p-4 border-t border-gray-300 bg-white">
//         <input
//           type="text"
//           value={inputMessage}
//           onChange={(e) => setInputMessage(e.target.value)}
//           placeholder={chatId ? "Type a message..." : "Connecting..."}
//           disabled={!chatId}
//           className="flex-grow text-base p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-red-500 placeholder-gray-400 transition"
//         />
//         <button
//           type="submit"
//           disabled={!chatId || inputMessage.trim() === ''}
//           className="bg-red-600 text-white px-6 rounded-r-lg font-semibold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
//         >
//           Send
//         </button>
//       </form>
//     </div>
//   );
// };

// export default ChatWindow;
import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../../context/SocketContext.jsx';
import axios from 'axios';
import './ChatWindow.css'; // Import CSS file

const ChatWindow = ({ partner }) => {
  const { socket } = useSocket();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [chatId, setChatId] = useState(null);
  const messagesEndRef = useRef(null);
  const [isAuthorized, setIsAuthorized] = useState(true);

  useEffect(() => {
    const fetchChatSession = async () => {
      try {
        const res = await axios.get(`/chat/${partner.username}/init`, { withCredentials: true });
        console.log('Backend response:', res.data);

        if (!res.data || !res.data.chatId) {
          console.error("Chat initialization failed: Missing Chat ID in response.", res.data);
          setChatId(null);
          setIsAuthorized(true);
          return;
        }
        setChatId(res.data.chatId);
        setIsAuthorized(true);

        const fetchedMessages = res.data.messages ?? [];
        setMessages(fetchedMessages.map(msg => {
          const pId = partner.id ?? partner._id;
          const isPartner = msg.sender.toString() === pId?.toString();
          return {
            ...msg,
            sender: isPartner ? partner.username : 'You',
            timestamp: new Date(msg.createdAt),
          };
        }));
      } catch (error) {
        if (error.response && error.response.status === 403) {
          setIsAuthorized(false);
        } else {
          console.error("Failed to initialize chat session:", error);
          setChatId(null);
        }
      }
    };
    fetchChatSession();
  }, [partner.username, partner.id, partner._id]);

  useEffect(() => {
    if (!socket || !chatId) return;
    const handleNewMessage = (data) => {
      if (data.chatId === chatId) {
        setMessages(prev => [
          ...prev,
          {
            id: data.message.id || Date.now(),
            sender: data.sender.username,
            text: data.message.text,
            timestamp: new Date(data.message.createdAt),
          }
        ]);
      }
    };
    socket.on('newMessage', handleNewMessage);
    return () => {
      socket.off('newMessage', handleNewMessage);
    };
  }, [socket, chatId, partner.username]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    const text = inputMessage.trim();
    if (text === '' || !chatId) return;
    try {
      const res = await axios.post(`/chat/${chatId}/message`, { text }, { withCredentials: true });
      const sentMessage = res.data.message;
      setMessages(prev => [
        ...prev,
        {
          id: sentMessage.id || Date.now(),
          sender: 'You',
          text: sentMessage.text,
          timestamp: new Date(sentMessage.createdAt),
        }
      ]);
      setInputMessage('');
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  if (!isAuthorized) {
    return (
      <div className="chat-forbidden">
        <p className="chat-forbidden-title">Chat Forbidden</p>
        <p className="chat-forbidden-text">
          Messaging is restricted to users who have interacted with your pins or profile (or vice versa).
        </p>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <div className="messages-area">
        {messages.length === 0 && (
          <p className="empty-message">Start the conversation!</p>
        )}
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`message ${msg.sender === 'You' ? 'message-sent' : 'message-received'}`}
          >
            <div className="message-bubble">
              <p className="message-text">{msg.text}</p>
              <span className={`message-time ${msg.sender === 'You' ? 'time-sent' : 'time-received'}`}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="input-area">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder={chatId ? 'Type a message...' : 'Connecting...'}
          disabled={!chatId}
          className="input-field"
        />
        <button
          type="submit"
          disabled={!chatId || inputMessage.trim() === ''}
          className="send-button"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;
