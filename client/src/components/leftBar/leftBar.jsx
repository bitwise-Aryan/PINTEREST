// import Image from "../image/image";
// import {Link} from "react-router";
// import "./leftBar.css";
// import React, { useState } from "react";
// import NotificationsModal from "../notifications/NotificationsModal";

// const LeftBar = () => {
//   return (
//     <div className="leftBar">
//       <div className="menuIcons">
//         <Link to="/" className="menuIcon">
//           <Image path="/general/temp3.png" alt="" className="logo"/>
//         </Link>
//         <Link to="/" className="menuIcon">
//           <Image path="/general/home.svg" alt="" />
//         </Link>
//         <Link to="/create" className="menuIcon">
//           <Image path="/general/create.svg" alt="" />
//         </Link>
//         <Link to="/" className="menuIcon">
//           <Image path="/general/updates.svg" alt="" />
//         </Link>
//       <Link to="/explore" className="menuIcon">
//   <Image path="/general/explore.svg" alt="Explore" />
// </Link>
//       </div>
//       <Link to="/" className="menuIcon">
//         <Image path="/general/settings.svg" alt="" />
//       </Link>
//     </div>
//   );
// };

// export default LeftBar;


import Image from "../image/image";
import { Link } from "react-router-dom"; 
import "./leftBar.css";
import React, { useState, useEffect } from "react";
import NotificationsModal from "../notifications/NotificationsModal";
import axios from 'axios'; 
// NOTE: Make sure the path below is correct relative to LeftBar.js
import { useSocket } from "../../context/SocketContext.jsx"; 

const LeftBar = () => {
  const { socket } = useSocket(); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Function to fetch the unread count via REST API
  const fetchUnreadCount = async () => {
    try {
      const res = await axios.get('/notifications/unread-count', { withCredentials: true });
      // Only update if the data is valid
      if (typeof res.data.count === 'number') {
        setUnreadCount(res.data.count);
      }
    } catch (err) {
      console.error("Failed to fetch unread count:", err);
    }
  };

  useEffect(() => {
    fetchUnreadCount();

    // --- SOCKET.IO REAL-TIME LISTENER ---
    if (socket) {
        // This handler updates the badge count when a new notification is broadcasted
        const handleNewNotification = () => {
            // Optimistically increment the count
            setUnreadCount(prev => prev + 1); 
        };

        socket.on('newNotification', handleNewNotification);

        return () => {
            socket.off('newNotification', handleNewNotification);
        };
    }
  }, [socket]); 

  const toggleModal = async () => {
    if (isModalOpen) {
      // Logic for CLOSING the modal: Mark all as read
      try {
        // Send request to backend to mark all as read
        await axios.put('/notifications/mark-read', {}, { withCredentials: true });
        setUnreadCount(0); // Reset local count
      } catch (err) {
        console.error("Failed to mark notifications as read:", err);
      }
    }
    setIsModalOpen(!isModalOpen);
  };

  return (
    <div className="leftBar">
      <div className="menuIcons">
        {/* Original Link: Temp Logo */}
        <Link to="/" className="menuIcon">
          <Image path="/general/temp3.png" alt="" className="logo"/>
        </Link>
        {/* Original Link: Home */}
        <Link to="/" className="menuIcon">
          <Image path="/general/home.svg" alt="" />
        </Link>
        {/* Original Link: Create */}
        <Link to="/create" className="menuIcon">
          <Image path="/general/create.svg" alt="" />
        </Link>
        
        {/* Notification Icon */}
        <div 
          className="menuIcon notificationIconContainer" 
          onClick={toggleModal}
          role="button" 
          aria-label="Notifications" 
          tabIndex="0"
        >
          <Image path="/general/updates.svg" alt="Notifications" />
          {/* Notification Badge */}
          {unreadCount > 0 && (
            <span className="notificationBadge">{unreadCount > 9 ? '9+' : unreadCount}</span> 
          )}
        </div>
        
        {/* Original Link: Explore */}
        <Link to="/explore" className="menuIcon">
          <Image path="/general/explore.svg" alt="Explore" />
        </Link>
      </div>
      
      {/* Original Link: Settings */}
      <Link to="/" className="menuIcon">
        <Image path="/general/settings.svg" alt="" />
      </Link>

      {/* Conditional Rendering of the Notification Modal */}
      {isModalOpen && <NotificationsModal onClose={toggleModal} />}
    </div>
  );
};

export default LeftBar;
