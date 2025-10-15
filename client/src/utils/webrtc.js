class WebRTCManager {
  constructor() {
    this.localStream = null;
    this.remoteStream = null;
    this.peerConnection = null;
    this.socket = null;
    this.roomId = null;
    this.isInitiator = false;
    this.callbacks = {
      onLocalStream: null,
      onRemoteStream: null,
      onCallEnd: null,
      onCallReject: null
    };
  }

  initialize(socket, roomId) {
    this.socket = socket;
    this.roomId = roomId;
    this.setupSocketListeners();
  }

  setupSocketListeners() {
    this.socket.on('call-offer', this.handleCallOffer.bind(this));
    this.socket.on('call-answer', this.handleCallAnswer.bind(this));
    this.socket.on('ice-candidate', this.handleIceCandidate.bind(this));
    this.socket.on('call-end', this.handleCallEnd.bind(this));
    this.socket.on('call-reject', this.handleCallReject.bind(this));
  }

  async startCall(callType = 'video') {
    try {
      this.isInitiator = true;
      
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('getUserMedia is not supported in this browser');
      }

      // Check permissions first
      const hasPermission = await this.checkMediaPermissions(callType);
      if (!hasPermission) {
        throw new Error('Camera/microphone permission denied');
      }

      // Get user media with fallback constraints
      const constraints = {
        video: callType === 'video' ? {
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
          facingMode: 'user'
        } : false,
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      };
      
      console.log('Requesting media with constraints:', constraints);
      this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('Successfully got local stream:', this.localStream);
      
      if (this.callbacks.onLocalStream) {
        this.callbacks.onLocalStream(this.localStream);
      }

      // Create peer connection
      await this.createPeerConnection();
      
      // Add local stream to peer connection
      this.localStream.getTracks().forEach(track => {
        this.peerConnection.addTrack(track, this.localStream);
      });

      // Create and send offer
      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);
      
      this.socket.emit('call-offer', {
        offer: offer,
        roomId: this.roomId,
        callType: callType
      });

      return true;
    } catch (error) {
      console.error('Error starting call:', error);
      
      // Provide user-friendly error messages
      let errorMessage = 'Failed to start call';
      if (error.name === 'NotAllowedError') {
        errorMessage = 'Camera/microphone access denied. Please allow access and try again.';
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'No camera/microphone found. Please connect a device and try again.';
      } else if (error.name === 'NotReadableError') {
        errorMessage = 'Camera/microphone is being used by another application. Please close other apps and try again.';
      } else if (error.name === 'OverconstrainedError') {
        errorMessage = 'Camera/microphone constraints cannot be satisfied. Trying with basic settings...';
        // Try with basic constraints as fallback
        return await this.startCallWithBasicConstraints(callType);
      } else if (error.name === 'SecurityError') {
        errorMessage = 'Camera/microphone access blocked. Please use HTTPS or localhost.';
      }
      
      // Show error to user
      if (this.callbacks.onError) {
        this.callbacks.onError(errorMessage);
      }
      
      return false;
    }
  }

  async answerCall(offer, callType = 'video') {
    try {
      this.isInitiator = false;
      
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('getUserMedia is not supported in this browser');
      }

      // Get user media with same constraints as startCall
      const constraints = {
        video: callType === 'video' ? {
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
          facingMode: 'user'
        } : false,
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      };
      
      console.log('Answering call with constraints:', constraints);
      this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('Successfully got local stream for answer:', this.localStream);
      
      if (this.callbacks.onLocalStream) {
        this.callbacks.onLocalStream(this.localStream);
      }

      // Create peer connection
      await this.createPeerConnection();
      
      // Add local stream to peer connection
      this.localStream.getTracks().forEach(track => {
        this.peerConnection.addTrack(track, this.localStream);
      });

      // Set remote description and create answer
      await this.peerConnection.setRemoteDescription(offer);
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);
      
      this.socket.emit('call-answer', {
        answer: answer,
        roomId: this.roomId
      });

      return true;
    } catch (error) {
      console.error('Error answering call:', error);
      
      // Provide user-friendly error messages
      let errorMessage = 'Failed to answer call';
      if (error.name === 'NotAllowedError') {
        errorMessage = 'Camera/microphone access denied. Please allow access and try again.';
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'No camera/microphone found. Please connect a device and try again.';
      } else if (error.name === 'NotReadableError') {
        errorMessage = 'Camera/microphone is being used by another application. Please close other apps and try again.';
      } else if (error.name === 'OverconstrainedError') {
        errorMessage = 'Camera/microphone constraints cannot be satisfied. Trying with basic settings...';
        // Try with basic constraints as fallback
        return await this.answerCallWithBasicConstraints(offer, callType);
      } else if (error.name === 'SecurityError') {
        errorMessage = 'Camera/microphone access blocked. Please use HTTPS or localhost.';
      }
      
      // Show error to user
      if (this.callbacks.onError) {
        this.callbacks.onError(errorMessage);
      }
      
      return false;
    }
  }

  async createPeerConnection() {
    const configuration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    };

    this.peerConnection = new RTCPeerConnection(configuration);

    // Handle remote stream
    this.peerConnection.ontrack = (event) => {
      this.remoteStream = event.streams[0];
      if (this.callbacks.onRemoteStream) {
        this.callbacks.onRemoteStream(this.remoteStream);
      }
    };

    // Handle ICE candidates
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.socket.emit('ice-candidate', {
          candidate: event.candidate,
          roomId: this.roomId
        });
      }
    };

    // Handle connection state changes
    this.peerConnection.onconnectionstatechange = () => {
      console.log('Connection state:', this.peerConnection.connectionState);
      if (this.peerConnection.connectionState === 'disconnected' || 
          this.peerConnection.connectionState === 'failed') {
        this.endCall();
      }
    };
  }

  async handleCallOffer(data) {
    if (this.callbacks.onCallOffer) {
      this.callbacks.onCallOffer(data);
    }
  }

  async handleCallAnswer(data) {
    if (this.peerConnection) {
      await this.peerConnection.setRemoteDescription(data.answer);
    }
  }

  async handleIceCandidate(data) {
    if (this.peerConnection && data.candidate) {
      await this.peerConnection.addIceCandidate(data.candidate);
    }
  }

  handleCallEnd(data) {
    this.cleanup();
    if (this.callbacks.onCallEnd) {
      this.callbacks.onCallEnd(data);
    }
  }

  handleCallReject(data) {
    this.cleanup();
    if (this.callbacks.onCallReject) {
      this.callbacks.onCallReject(data);
    }
  }

  endCall() {
    this.socket.emit('call-end', { roomId: this.roomId });
    this.cleanup();
  }

  rejectCall() {
    this.socket.emit('call-reject', { roomId: this.roomId });
    this.cleanup();
  }

  cleanup() {
    // Stop local stream
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    // Close peer connection
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    this.remoteStream = null;
    this.isInitiator = false;
  }

  // Set callbacks
  setCallbacks(callbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  // Check media permissions
  async checkMediaPermissions(callType) {
    try {
      if (navigator.permissions) {
        const cameraPermission = callType === 'video' ? 
          await navigator.permissions.query({ name: 'camera' }) : 
          { state: 'granted' };
        const micPermission = await navigator.permissions.query({ name: 'microphone' });
        
        console.log('Camera permission:', cameraPermission.state);
        console.log('Microphone permission:', micPermission.state);
        
        return cameraPermission.state === 'granted' && micPermission.state === 'granted';
      }
      return true; // If permissions API not available, assume granted
    } catch (error) {
      console.log('Permission check failed:', error);
      return true; // If check fails, try anyway
    }
  }

  // Fallback method with basic constraints
  async startCallWithBasicConstraints(callType) {
    try {
      console.log('Trying with basic constraints...');
      const basicConstraints = {
        video: callType === 'video' ? true : false,
        audio: true
      };
      
      this.localStream = await navigator.mediaDevices.getUserMedia(basicConstraints);
      console.log('Successfully got local stream with basic constraints:', this.localStream);
      
      if (this.callbacks.onLocalStream) {
        this.callbacks.onLocalStream(this.localStream);
      }

      // Create peer connection
      await this.createPeerConnection();
      
      // Add local stream to peer connection
      this.localStream.getTracks().forEach(track => {
        this.peerConnection.addTrack(track, this.localStream);
      });

      // Create and send offer
      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);
      
      this.socket.emit('call-offer', {
        offer: offer,
        roomId: this.roomId,
        callType: callType
      });

      return true;
    } catch (error) {
      console.error('Error with basic constraints:', error);
      if (this.callbacks.onError) {
        this.callbacks.onError('Unable to access camera/microphone. Please check your device settings.');
      }
      return false;
    }
  }

  // Fallback method for answering call with basic constraints
  async answerCallWithBasicConstraints(offer, callType) {
    try {
      console.log('Answering call with basic constraints...');
      const basicConstraints = {
        video: callType === 'video' ? true : false,
        audio: true
      };
      
      this.localStream = await navigator.mediaDevices.getUserMedia(basicConstraints);
      console.log('Successfully got local stream for answer with basic constraints:', this.localStream);
      
      if (this.callbacks.onLocalStream) {
        this.callbacks.onLocalStream(this.localStream);
      }

      // Create peer connection
      await this.createPeerConnection();
      
      // Add local stream to peer connection
      this.localStream.getTracks().forEach(track => {
        this.peerConnection.addTrack(track, this.localStream);
      });

      // Set remote description and create answer
      await this.peerConnection.setRemoteDescription(offer);
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);
      
      this.socket.emit('call-answer', {
        answer: answer,
        roomId: this.roomId
      });

      return true;
    } catch (error) {
      console.error('Error answering call with basic constraints:', error);
      if (this.callbacks.onError) {
        this.callbacks.onError('Unable to access camera/microphone. Please check your device settings.');
      }
      return false;
    }
  }

  // Toggle video/audio
  toggleVideo() {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        return videoTrack.enabled;
      }
    }
    return false;
  }

  toggleAudio() {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        return audioTrack.enabled;
      }
    }
    return false;
  }
}

export default WebRTCManager;

