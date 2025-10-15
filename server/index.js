const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Create uploads directory
const uploadsDir = path.join(__dirname, 'uploads');
fs.ensureDirSync(uploadsDir);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|mp3|wav|ogg|mp4|webm/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images, audio, and video files are allowed!'));
    }
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));

// MongoDB connection (optional - will work without DB)
let Message, User, ChatRoom;

// Create simple in-memory models for now
Message = class {
  constructor(data) { Object.assign(this, data); }
  async save() { return this; }
  static findOneAndUpdate() { return Promise.resolve(); }
};
User = class {
  constructor(data) { Object.assign(this, data); }
  async save() { return this; }
  static findOneAndUpdate() { return Promise.resolve(); }
};
ChatRoom = class {
  constructor(data) { Object.assign(this, data); }
  save() { return this; }
};

console.log('Running in memory mode (MongoDB disabled)');

// Store active users and their socket connections
const activeUsers = new Map();
const waitingUsers = new Set();

// Test mode - create a bot user for testing
const createTestBot = () => {
  const botUserId = 'bot_' + uuidv4();
  const botUser = {
    userId: botUserId,
    username: 'TestBot',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bot',
    gender: 'male',
    interests: ['Gaming', 'Music', 'Technology', 'Movies'],
    lookingFor: ['female', 'male', 'other'],
    socketId: 'bot_socket',
    isBot: true
  };
  return botUser;
};

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Anonymous Chat Server is running!' });
});

// Test endpoint for debugging
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Server is working!', 
    timestamp: new Date().toISOString(),
    activeUsers: activeUsers.size,
    waitingUsers: waitingUsers.size
  });
});

// Test mode endpoint
app.post('/api/test-mode', (req, res) => {
  const { enable } = req.body;
  if (enable) {
    // Add bot to waiting users for testing
    const botUser = createTestBot();
    activeUsers.set('bot_socket', botUser);
    waitingUsers.add('bot_socket');
    res.json({ message: 'Test mode enabled - bot user added to waiting list' });
  } else {
    // Remove bot
    activeUsers.delete('bot_socket');
    waitingUsers.delete('bot_socket');
    res.json({ message: 'Test mode disabled' });
  }
});

// File upload route
app.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({
      success: true,
      fileUrl: fileUrl,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      fileType: req.file.mimetype
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'File upload failed' });
  }
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Handle user joining as guest
  socket.on('join-as-guest', async (data) => {
    try {
      const { username, avatar, gender, interests, lookingFor } = data;
      const userId = uuidv4();
      
      // Create user session
      const user = new User({
        userId,
        username: username || `Guest_${Math.random().toString(36).substr(2, 9)}`,
        avatar: avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
        gender: gender || 'other',
        interests: interests || [],
        lookingFor: lookingFor || ['male', 'female', 'other'],
        socketId: socket.id,
        isOnline: true,
        joinedAt: new Date()
      });

      await user.save();
      
      // Store user in active users
      activeUsers.set(socket.id, {
        userId,
        username: user.username,
        avatar: user.avatar,
        gender: user.gender,
        interests: user.interests,
        lookingFor: user.lookingFor,
        socketId: socket.id
      });

      socket.emit('user-joined', {
        userId,
        username: user.username,
        avatar: user.avatar,
        gender: user.gender,
        interests: user.interests,
        lookingFor: user.lookingFor
      });

      // Try to match with waiting users
      matchUsers(socket);
      
    } catch (error) {
      console.error('Error joining user:', error);
      socket.emit('error', { message: 'Failed to join chat' });
    }
  });

  // Handle finding a new chat partner
  socket.on('find-new-chat', () => {
    const user = activeUsers.get(socket.id);
    if (user) {
      // Leave current room if any
      socket.leaveAll();
      // Add to waiting list
      waitingUsers.add(socket.id);
      matchUsers(socket);
    }
  });

  // Handle sending messages
  socket.on('send-message', async (data) => {
    try {
      const user = activeUsers.get(socket.id);
      if (!user) return;

      const { message, roomId } = data;
      
      // Save message to database
      const newMessage = new Message({
        roomId,
        userId: user.userId,
        username: user.username,
        avatar: user.avatar,
        message,
        timestamp: new Date()
      });

      await newMessage.save();

      // Broadcast message to room
      io.to(roomId).emit('new-message', {
        id: newMessage._id,
        userId: user.userId,
        username: user.username,
        avatar: user.avatar,
        message,
        timestamp: newMessage.timestamp
      });

    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Handle typing indicators
  socket.on('typing', (data) => {
    const user = activeUsers.get(socket.id);
    if (user) {
      socket.to(data.roomId).emit('user-typing', {
        userId: user.userId,
        username: user.username,
        isTyping: data.isTyping
      });
    }
  });

  // WebRTC signaling handlers
  socket.on('call-offer', (data) => {
    const user = activeUsers.get(socket.id);
    if (user) {
      socket.to(data.roomId).emit('call-offer', {
        offer: data.offer,
        caller: {
          userId: user.userId,
          username: user.username,
          avatar: user.avatar
        },
        callType: data.callType // 'video' or 'audio'
      });
    }
  });

  socket.on('call-answer', (data) => {
    const user = activeUsers.get(socket.id);
    if (user) {
      socket.to(data.roomId).emit('call-answer', {
        answer: data.answer,
        answerer: {
          userId: user.userId,
          username: user.username,
          avatar: user.avatar
        }
      });
    }
  });

  socket.on('ice-candidate', (data) => {
    socket.to(data.roomId).emit('ice-candidate', {
      candidate: data.candidate,
      userId: activeUsers.get(socket.id)?.userId
    });
  });

  socket.on('call-end', (data) => {
    socket.to(data.roomId).emit('call-end', {
      userId: activeUsers.get(socket.id)?.userId
    });
  });

  socket.on('call-reject', (data) => {
    socket.to(data.roomId).emit('call-reject', {
      userId: activeUsers.get(socket.id)?.userId
    });
  });

  // Handle media sharing
  socket.on('share-media', async (data) => {
    try {
      const user = activeUsers.get(socket.id);
      if (!user) return;

      const { mediaUrl, mediaType, fileName, roomId } = data;
      
      // Save media message to database
      const newMessage = new Message({
        roomId,
        userId: user.userId,
        username: user.username,
        avatar: user.avatar,
        message: `Shared a ${mediaType}`,
        mediaUrl,
        mediaType,
        fileName,
        timestamp: new Date()
      });

      await newMessage.save();

      // Broadcast media message to room
      io.to(roomId).emit('new-media-message', {
        id: newMessage._id,
        userId: user.userId,
        username: user.username,
        avatar: user.avatar,
        message: newMessage.message,
        mediaUrl,
        mediaType,
        fileName,
        timestamp: newMessage.timestamp
      });

    } catch (error) {
      console.error('Error sharing media:', error);
      socket.emit('error', { message: 'Failed to share media' });
    }
  });

  // Handle disconnection
  socket.on('disconnect', async () => {
    console.log('User disconnected:', socket.id);
    
    const user = activeUsers.get(socket.id);
    if (user) {
      // Remove from active users
      activeUsers.delete(socket.id);
      waitingUsers.delete(socket.id);
      
      // Update user status in database
      await User.findOneAndUpdate(
        { socketId: socket.id },
        { isOnline: false, disconnectedAt: new Date() }
      );

      // Notify partner if in a chat room
      const rooms = Array.from(socket.rooms);
      rooms.forEach(roomId => {
        if (roomId !== socket.id) {
          socket.to(roomId).emit('partner-disconnected', {
            userId: user.userId,
            username: user.username
          });
        }
      });
    }
  });
});

// Function to match users based on gender preferences and interests
function matchUsers(socket) {
  const currentUser = activeUsers.get(socket.id);
  if (!currentUser) return;

  // Find compatible users in waiting list
  let bestMatch = null;
  let bestMatchScore = 0;
  
  for (const waitingSocketId of waitingUsers) {
    const waitingUser = activeUsers.get(waitingSocketId);
    if (!waitingUser || waitingSocketId === socket.id) continue;
    
    // Check gender compatibility
    const isGenderCompatible = 
      currentUser.lookingFor.includes(waitingUser.gender) &&
      waitingUser.lookingFor.includes(currentUser.gender);
    
    if (!isGenderCompatible) continue;
    
    // Calculate interest compatibility score
    const commonInterests = currentUser.interests.filter(interest => 
      waitingUser.interests.includes(interest)
    );
    const interestScore = commonInterests.length;
    
    // Prefer users with higher interest compatibility
    if (interestScore > bestMatchScore) {
      bestMatch = waitingUser;
      bestMatchScore = interestScore;
    }
  }
  
  if (bestMatch) {
    const bestMatchSocketId = bestMatch.socketId;
    
    // Create room ID
    const roomId = `room_${currentUser.userId}_${bestMatch.userId}`;
    
    // Join both users to the room
    io.sockets.sockets.get(socket.id)?.join(roomId);
    io.sockets.sockets.get(bestMatchSocketId)?.join(roomId);
    
    // Remove from waiting list
    waitingUsers.delete(socket.id);
    waitingUsers.delete(bestMatchSocketId);
    
    // Create chat room in database
    const chatRoom = new ChatRoom({
      roomId,
      participants: [currentUser.userId, bestMatch.userId],
      createdAt: new Date()
    });
    chatRoom.save();
    
    // Notify both users about the match
    io.to(socket.id).emit('matched', {
      roomId,
      partner: {
        userId: bestMatch.userId,
        username: bestMatch.username,
        avatar: bestMatch.avatar,
        gender: bestMatch.gender,
        commonInterests: currentUser.interests.filter(interest => 
          bestMatch.interests.includes(interest)
        )
      }
    });
    
    io.to(bestMatchSocketId).emit('matched', {
      roomId,
      partner: {
        userId: currentUser.userId,
        username: currentUser.username,
        avatar: currentUser.avatar,
        gender: currentUser.gender,
        commonInterests: bestMatch.interests.filter(interest => 
          currentUser.interests.includes(interest)
        )
      }
    });
  } else {
    // If no real users available, create a test bot for demonstration
    const botUser = createTestBot();
    const isGenderCompatible = 
      currentUser.lookingFor.includes(botUser.gender) &&
      botUser.lookingFor.includes(currentUser.gender);
    
    if (isGenderCompatible) {
      // Match with bot for testing
      const roomId = `room_${currentUser.userId}_${botUser.userId}`;
      
      // Join user to the room
      io.sockets.sockets.get(socket.id)?.join(roomId);
      
      // Remove from waiting list
      waitingUsers.delete(socket.id);
      
      // Create chat room
      const chatRoom = new ChatRoom({
        roomId,
        participants: [currentUser.userId, botUser.userId],
        createdAt: new Date()
      });
      chatRoom.save();
      
      // Notify user about the match with bot
      io.to(socket.id).emit('matched', {
        roomId,
        partner: {
          userId: botUser.userId,
          username: botUser.username,
          avatar: botUser.avatar,
          gender: botUser.gender,
          commonInterests: currentUser.interests.filter(interest => 
            botUser.interests.includes(interest)
          ),
          isBot: true
        }
      });
      
      // Send welcome message from bot
      setTimeout(() => {
        const welcomeMessage = new Message({
          roomId,
          userId: botUser.userId,
          username: botUser.username,
          avatar: botUser.avatar,
          message: `Hi ${currentUser.username}! I'm a test bot. You can test the chat features with me! Try sending messages, sharing files, or making calls.`,
          timestamp: new Date()
        });
        welcomeMessage.save();
        
        io.to(socket.id).emit('new-message', {
          id: welcomeMessage._id,
          userId: botUser.userId,
          username: botUser.username,
          avatar: botUser.avatar,
          message: welcomeMessage.message,
          timestamp: welcomeMessage.timestamp
        });
      }, 1000);
      
    } else {
      // Add to waiting list if no compatible match available
      waitingUsers.add(socket.id);
      socket.emit('waiting-for-match', { 
        message: 'Looking for a compatible chat partner...',
        preferences: {
          lookingFor: currentUser.lookingFor,
          interests: currentUser.interests
        }
      });
    }
  }
}

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
