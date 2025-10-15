import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import io from 'socket.io-client';
import 'bootstrap/dist/css/bootstrap.min.css';
import Welcome from './components/Welcome';
import Chat from './components/Chat';
import './App.css';

const socket = io('http://localhost:5000');

function App() {
  const [user, setUser] = useState(null);
  // Connection status removed

  useEffect(() => {
    // Handle connection status
    socket.on('connect', () => {
      console.log('✅ Connected to server:', socket.id);
    });

    socket.on('disconnect', () => {
      console.log('❌ Disconnected from server');
    });

    socket.on('connect_error', (error) => {
      console.error('🚨 Connection error:', error);
    });

    // Try to connect immediately
    console.log('🔄 Attempting to connect to server...');
    socket.connect();

    // Handle user joined event
    socket.on('user-joined', (userData) => {
      setUser(userData);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('user-joined');
    };
  }, []);

  const handleJoinAsGuest = (username, avatar, gender, lookingFor, interests) => {
    socket.emit('join-as-guest', { username, avatar, gender, lookingFor, interests });
  };

  const handleDisconnect = () => {
    socket.disconnect();
    setUser(null);
  };

  return (
    <Router>
      <div className="App">
        {/* Connection status removed */}
        
        <Routes>
          <Route 
            path="/" 
            element={
              user ? (
                <Chat 
                  user={user} 
                  socket={socket} 
                  onDisconnect={handleDisconnect}
                />
              ) : (
                <Welcome 
                  onJoinAsGuest={handleJoinAsGuest}
                />
              )
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

