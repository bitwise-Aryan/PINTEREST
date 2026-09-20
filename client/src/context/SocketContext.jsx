import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import useAuthStore from '../utils/authStore';

const SocketContext = createContext();

export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const { currentUser } = useAuthStore();

    useEffect(() => {
        // Connect to Socket.IO backend
        const socketUrl = import.meta.env.VITE_API_ENDPOINT || 'http://localhost:3000';
        const newSocket = io(socketUrl, {
            withCredentials: true,
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 20,
            reconnectionDelay: 1000,
        });

        const handleConnect = () => {
            console.log('⚡ Socket.IO connected:', newSocket.id);
            if (currentUser?._id) {
                newSocket.emit('register', currentUser._id.toString());
            }
        };

        newSocket.on('connect', handleConnect);
        newSocket.on('reconnect', handleConnect);

        setSocket(newSocket);

        return () => {
            newSocket.off('connect', handleConnect);
            newSocket.off('reconnect', handleConnect);
            newSocket.disconnect();
        };
    }, []);

    // Also register whenever currentUser changes or loads from localStorage
    useEffect(() => {
        if (socket && socket.connected && currentUser?._id) {
            socket.emit('register', currentUser._id.toString());
        }
    }, [socket, currentUser?._id]);

    return (
        <SocketContext.Provider value={{ socket, isConnected: !!socket }}>
            {children}
        </SocketContext.Provider>
    );
};
