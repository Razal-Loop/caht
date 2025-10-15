import React, { useState, useEffect, useRef } from 'react';
import { Send, RotateCcw, Phone, PhoneOff, User, Video, Mic, Paperclip } from 'lucide-react';
import WebRTCManager from '../utils/webrtc';
import CallModal from './CallModal';
import MediaShare from './MediaShare';

const Chat = ({ user, socket, onDisconnect }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [partner, setPartner] = useState(null);
  const [isWaiting, setIsWaiting] = useState(true);
  const [waitingMessage, setWaitingMessage] = useState('Looking for a chat partner...');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [roomId, setRoomId] = useState(null);
  const [showMediaShare, setShowMediaShare] = useState(false);
  const [callState, setCallState] = useState({
    isInCall: false,
    isIncoming: false,
    caller: null,
    callType: 'video',
    localStream: null,
    remoteStream: null,
    isVideoEnabled: true,
    isAudioEnabled: true
  });
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const webrtcManager = useRef(new WebRTCManager());

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initialize WebRTC manager
    if (roomId) {
      webrtcManager.current.initialize(socket, roomId);
      webrtcManager.current.setCallbacks({
        onLocalStream: (stream) => {
          setCallState(prev => ({ ...prev, localStream: stream }));
        },
        onRemoteStream: (stream) => {
          setCallState(prev => ({ ...prev, remoteStream: stream }));
        },
        onCallEnd: () => {
          setCallState(prev => ({ 
            ...prev, 
            isInCall: false, 
            isIncoming: false, 
            caller: null,
            localStream: null,
            remoteStream: null
          }));
        },
        onCallReject: () => {
          setCallState(prev => ({ 
            ...prev, 
            isInCall: false, 
            isIncoming: false, 
            caller: null
          }));
        },
        onCallOffer: (data) => {
          setCallState(prev => ({
            ...prev,
            isInCall: true,
            isIncoming: true,
            caller: data.caller,
            callType: data.callType
          }));
        },
        onError: (errorMessage) => {
          // Show error to user
          alert(`Call Error: ${errorMessage}`);
          console.error('WebRTC Error:', errorMessage);
        }
      });
    }

    // Listen for match found
    socket.on('matched', (data) => {
      setPartner(data.partner);
      setRoomId(data.roomId);
      setIsWaiting(false);
      setMessages([]);
      
      // Show common interests if available
      if (data.partner.commonInterests && data.partner.commonInterests.length > 0) {
        console.log('Common interests:', data.partner.commonInterests);
      }
    });

    // Listen for waiting status
    socket.on('waiting-for-match', (data) => {
      setIsWaiting(true);
      setPartner(null);
      setRoomId(null);
      setWaitingMessage(data.message || 'Looking for a compatible chat partner...');
    });

    // Listen for new messages
    socket.on('new-message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    // Listen for media messages
    socket.on('new-media-message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    // Listen for typing indicators
    socket.on('user-typing', (data) => {
      if (data.userId !== user.userId) {
        setTypingUsers(prev => {
          if (data.isTyping) {
            return [...prev.filter(u => u.userId !== data.userId), data];
          } else {
            return prev.filter(u => u.userId !== data.userId);
          }
        });
      }
    });

    // Listen for partner disconnection
    socket.on('partner-disconnected', (data) => {
      setMessages(prev => [...prev, {
        id: Date.now(),
        userId: 'system',
        username: 'System',
        message: `${data.username} has left the chat`,
        timestamp: new Date(),
        isSystem: true
      }]);
    });

    // Listen for errors
    socket.on('error', (error) => {
      console.error('Socket error:', error);
      alert(error.message);
    });

    return () => {
      socket.off('matched');
      socket.off('waiting-for-match');
      socket.off('new-message');
      socket.off('new-media-message');
      socket.off('user-typing');
      socket.off('partner-disconnected');
      socket.off('error');
    };
  }, [socket, user.userId, roomId]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() && roomId) {
      socket.emit('send-message', {
        message: newMessage.trim(),
        roomId
      });
      setNewMessage('');
      
      // Stop typing indicator
      socket.emit('typing', { roomId, isTyping: false });
      setIsTyping(false);
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    if (!isTyping && roomId) {
      setIsTyping(true);
      socket.emit('typing', { roomId, isTyping: true });
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      if (roomId) {
        socket.emit('typing', { roomId, isTyping: false });
        setIsTyping(false);
      }
    }, 1000);
  };

  const handleFindNewChat = () => {
    socket.emit('find-new-chat');
    setIsWaiting(true);
    setPartner(null);
    setRoomId(null);
    setMessages([]);
    setTypingUsers([]);
    webrtcManager.current.cleanup();
  };

  // Call handlers
  const handleStartCall = async (callType) => {
    console.log(`Starting ${callType} call...`);
    const success = await webrtcManager.current.startCall(callType);
    if (success) {
      setCallState(prev => ({
        ...prev,
        isInCall: true,
        isIncoming: false,
        caller: partner,
        callType: callType
      }));
    } else {
      console.log('Failed to start call');
    }
  };

  const handleAcceptCall = async () => {
    const success = await webrtcManager.current.answerCall(
      callState.caller?.offer, 
      callState.callType
    );
    if (success) {
      setCallState(prev => ({
        ...prev,
        isIncoming: false
      }));
    }
  };

  const handleRejectCall = () => {
    webrtcManager.current.rejectCall();
    setCallState(prev => ({
      ...prev,
      isInCall: false,
      isIncoming: false,
      caller: null
    }));
  };

  const handleEndCall = () => {
    webrtcManager.current.endCall();
    setCallState(prev => ({
      ...prev,
      isInCall: false,
      isIncoming: false,
      caller: null,
      localStream: null,
      remoteStream: null
    }));
  };

  const handleToggleVideo = () => {
    const enabled = webrtcManager.current.toggleVideo();
    setCallState(prev => ({ ...prev, isVideoEnabled: enabled }));
  };

  const handleToggleAudio = () => {
    const enabled = webrtcManager.current.toggleAudio();
    setCallState(prev => ({ ...prev, isAudioEnabled: enabled }));
  };

  // Media sharing handlers
  const handleMediaShare = (mediaData) => {
    socket.emit('share-media', {
      ...mediaData,
      roomId
    });
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (isWaiting) {
    return (
      <div className="chat-container">
        <div className="chat-header">
          <div className="header-info">
            <div className="user-avatar">
              <User size={24} />
            </div>
            <div>
              <h3>Welcome, {user.username}!</h3>
              <p className="partner-status">{waitingMessage}</p>
            </div>
          </div>
          <div className="header-actions">
            <button onClick={onDisconnect} className="action-button" title="Disconnect">
              <PhoneOff size={20} />
            </button>
          </div>
        </div>

        <div className="waiting-container">
          <div className="waiting-animation"></div>
          <h2 className="waiting-title">Finding a chat partner...</h2>
          <p className="waiting-message">
            We're connecting you with someone who wants to chat right now!
          </p>
          <button onClick={handleFindNewChat} className="find-new-button">
            <RotateCcw size={16} />
            Find New Chat
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="container-fluid">
          <div className="row align-items-center">
            <div className="col">
              <div className="header-info d-flex align-items-center">
                <img 
                  src={partner?.avatar} 
                  alt={partner?.username} 
                  className="partner-avatar me-3"
                />
                <div className="partner-info">
                  <h3 className="mb-0">{partner?.username}</h3>
                  <p className="partner-status mb-0">Online</p>
                </div>
              </div>
            </div>
            <div className="col-auto">
              <div className="header-actions d-flex gap-2">
                <button 
                  onClick={() => handleStartCall('video')} 
                  className="btn btn-outline-light btn-sm" 
                  title="Video Call"
                  disabled={callState.isInCall}
                >
                  <Video size={16} />
                </button>
                <button 
                  onClick={() => handleStartCall('audio')} 
                  className="btn btn-outline-light btn-sm" 
                  title="Voice Call"
                  disabled={callState.isInCall}
                >
                  <Mic size={16} />
                </button>
                <button onClick={handleFindNewChat} className="btn btn-outline-light btn-sm" title="New Chat">
                  <RotateCcw size={16} />
                </button>
                <button onClick={onDisconnect} className="btn btn-outline-light btn-sm" title="Disconnect">
                  <PhoneOff size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="chat-messages">
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`message ${message.userId === user.userId ? 'own' : ''}`}
          >
            {message.userId !== user.userId && (
              <img 
                src={message.avatar} 
                alt={message.username} 
                className="message-avatar"
              />
            )}
            <div className="message-content">
              {message.userId !== user.userId && (
                <div className="message-username">{message.username}</div>
              )}
              
              {message.mediaUrl ? (
                <div className="media-message">
                  {message.mediaType === 'image' && (
                    <img 
                      src={`http://localhost:5000${message.mediaUrl}`} 
                      alt={message.fileName}
                      className="media-image"
                    />
                  )}
                  {message.mediaType === 'video' && (
                    <video 
                      src={`http://localhost:5000${message.mediaUrl}`} 
                      controls 
                      className="media-video"
                    />
                  )}
                  {message.mediaType === 'audio' && (
                    <div className="media-audio">
                      <audio 
                        src={`http://localhost:5000${message.mediaUrl}`} 
                        controls 
                        className="audio-player"
                      />
                      <div className="audio-info">
                        <span className="audio-filename">{message.fileName}</span>
                      </div>
                    </div>
                  )}
                  <div className="media-caption">{message.message}</div>
                </div>
              ) : (
                <div className="message-text">{message.message}</div>
              )}
              
              <div className="message-time">{formatTime(message.timestamp)}</div>
            </div>
          </div>
        ))}
        
        {typingUsers.map((typingUser) => (
          <div key={typingUser.userId} className="typing-indicator">
            <img 
              src={typingUser.avatar} 
              alt={typingUser.username} 
              className="typing-avatar"
            />
            <span>{typingUser.username} is typing</span>
            <div className="typing-dots">
              <div key="dot1" className="typing-dot"></div>
              <div key="dot2" className="typing-dot"></div>
              <div key="dot3" className="typing-dot"></div>
            </div>
          </div>
        ))}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-container">
        <div className="container-fluid">
          <form onSubmit={handleSendMessage} className="chat-input-form d-flex align-items-end gap-2">
            <button 
              type="button"
              onClick={() => setShowMediaShare(true)}
              className="btn btn-outline-secondary btn-sm"
              title="Share Media"
              disabled={!partner}
            >
              <Paperclip size={16} />
            </button>
            <div className="flex-grow-1">
              <textarea
                value={newMessage}
                onChange={handleTyping}
                placeholder="Type a message..."
                className="form-control"
                rows="1"
                disabled={!partner}
                style={{ resize: 'none' }}
              />
            </div>
            <button 
              type="submit" 
              className="btn btn-primary btn-sm"
              disabled={!newMessage.trim() || !partner}
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>

      {/* Call Modal */}
      <CallModal
        isOpen={callState.isInCall}
        onClose={() => setCallState(prev => ({ ...prev, isInCall: false }))}
        callType={callState.callType}
        caller={callState.caller}
        isIncoming={callState.isIncoming}
        onAccept={handleAcceptCall}
        onReject={handleRejectCall}
        onEnd={handleEndCall}
        localStream={callState.localStream}
        remoteStream={callState.remoteStream}
        onToggleVideo={handleToggleVideo}
        onToggleAudio={handleToggleAudio}
        isVideoEnabled={callState.isVideoEnabled}
        isAudioEnabled={callState.isAudioEnabled}
      />

      {/* Media Share Modal */}
      <MediaShare
        isOpen={showMediaShare}
        onClose={() => setShowMediaShare(false)}
        onMediaShare={handleMediaShare}
      />
    </div>
  );
};

export default Chat;
