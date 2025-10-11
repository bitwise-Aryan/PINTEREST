import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        // Initializes the socket connection to your backend
        // NOTE: Ensure your backend server is running on http://localhost:3000
        const newSocket = io('http://localhost:3000', {
            withCredentials: true, // Important for sending/receiving authentication cookies
        });

        setSocket(newSocket);
        
        // Cleanup: Disconnect the socket when the provider unmounts
        return () => newSocket.disconnect();
    }, []); // Empty dependency array ensures it runs only once on mount

    return (
        <SocketContext.Provider value={{ socket, isConnected: !!socket }}>
            {children}
        </SocketContext.Provider>
    );
};
