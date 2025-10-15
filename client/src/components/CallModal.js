import React, { useState, useEffect, useRef } from 'react';
import { Phone, PhoneOff, Video, VideoOff, Mic, MicOff, X } from 'lucide-react';

const CallModal = ({ 
  isOpen, 
  onClose, 
  callType, 
  caller, 
  isIncoming, 
  onAccept, 
  onReject, 
  onEnd,
  localStream,
  remoteStream,
  onToggleVideo,
  onToggleAudio,
  isVideoEnabled,
  isAudioEnabled
}) => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [callDuration, setCallDuration] = useState(0);

  useEffect(() => {
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  useEffect(() => {
    let interval;
    if (isOpen && !isIncoming) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isOpen, isIncoming]);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="call-modal-overlay">
      <div className="call-modal">
        {isIncoming ? (
          // Incoming call
          <div className="incoming-call">
            <div className="caller-info">
              <img src={caller?.avatar} alt={caller?.username} className="caller-avatar" />
              <h3>{caller?.username}</h3>
              <p>{callType === 'video' ? 'Video Call' : 'Voice Call'}</p>
            </div>
            
            <div className="call-actions">
              <button 
                onClick={onAccept} 
                className="accept-call-btn"
                title="Accept"
              >
                <Phone size={24} />
              </button>
              <button 
                onClick={onReject} 
                className="reject-call-btn"
                title="Reject"
              >
                <PhoneOff size={24} />
              </button>
            </div>
          </div>
        ) : (
          // Active call
          <div className="active-call">
            {callType === 'video' ? (
              <div className="video-call">
                <div className="remote-video-container">
                  <video 
                    ref={remoteVideoRef} 
                    autoPlay 
                    playsInline 
                    className="remote-video"
                  />
                  <div className="remote-user-info">
                    <img src={caller?.avatar} alt={caller?.username} className="remote-avatar" />
                    <span>{caller?.username}</span>
                  </div>
                </div>
                
                <div className="local-video-container">
                  <video 
                    ref={localVideoRef} 
                    autoPlay 
                    playsInline 
                    muted 
                    className="local-video"
                  />
                </div>
              </div>
            ) : (
              <div className="audio-call">
                <div className="caller-info">
                  <img src={caller?.avatar} alt={caller?.username} className="caller-avatar-large" />
                  <h3>{caller?.username}</h3>
                  <p className="call-duration">{formatDuration(callDuration)}</p>
                </div>
              </div>
            )}
            
            <div className="call-controls">
              <button 
                onClick={onToggleAudio} 
                className={`control-btn ${!isAudioEnabled ? 'disabled' : ''}`}
                title={isAudioEnabled ? 'Mute' : 'Unmute'}
              >
                {isAudioEnabled ? <Mic size={20} /> : <MicOff size={20} />}
              </button>
              
              {callType === 'video' && (
                <button 
                  onClick={onToggleVideo} 
                  className={`control-btn ${!isVideoEnabled ? 'disabled' : ''}`}
                  title={isVideoEnabled ? 'Turn off video' : 'Turn on video'}
                >
                  {isVideoEnabled ? <Video size={20} /> : <VideoOff size={20} />}
                </button>
              )}
              
              <button 
                onClick={onEnd} 
                className="end-call-btn"
                title="End call"
              >
                <PhoneOff size={20} />
              </button>
            </div>
          </div>
        )}
        
        <button onClick={onClose} className="close-modal-btn">
          <X size={20} />
        </button>
      </div>
    </div>
  );
};

export default CallModal;

