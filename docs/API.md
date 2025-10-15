# AnonChat API Documentation

This document provides comprehensive API documentation for the AnonChat application.

## 📡 Socket.IO Events

### Client to Server Events

#### `join-as-guest`
Join the chat as a guest user.

**Parameters:**
```javascript
{
  username: string,        // User's chosen username
  avatar: string,          // Avatar URL (optional)
  gender: string,          // "Male", "Female", or "Other"
  lookingFor: string[],    // Array of genders user wants to chat with
  interests: string[]      // Array of user's interests
}
```

**Example:**
```javascript
socket.emit('join-as-guest', {
  username: 'JohnDoe',
  avatar: 'https://example.com/avatar.jpg',
  gender: 'Male',
  lookingFor: ['Female', 'Other'],
  interests: ['Gaming', 'Music', 'Technology']
});
```

#### `send-message`
Send a text message to the current chat partner.

**Parameters:**
```javascript
{
  message: string,         // Message content
  roomId: string          // Current room ID
}
```

**Example:**
```javascript
socket.emit('send-message', {
  message: 'Hello there!',
  roomId: 'room_123'
});
```

#### `typing`
Indicate that the user is typing.

**Parameters:**
```javascript
{
  roomId: string,         // Current room ID
  isTyping: boolean       // Typing status
}
```

**Example:**
```javascript
socket.emit('typing', {
  roomId: 'room_123',
  isTyping: true
});
```

#### `find-new-chat`
Skip current partner and find a new chat partner.

**Parameters:**
```javascript
{
  userId: string          // Current user ID
}
```

**Example:**
```javascript
socket.emit('find-new-chat', {
  userId: 'user_456'
});
```

#### `call-offer`
Initiate a video or audio call.

**Parameters:**
```javascript
{
  roomId: string,         // Current room ID
  offer: RTCSessionDescription, // WebRTC offer
  callType: string        // "video" or "audio"
}
```

**Example:**
```javascript
socket.emit('call-offer', {
  roomId: 'room_123',
  offer: rtcOffer,
  callType: 'video'
});
```

#### `call-answer`
Answer an incoming call.

**Parameters:**
```javascript
{
  roomId: string,         // Current room ID
  answer: RTCSessionDescription // WebRTC answer
}
```

**Example:**
```javascript
socket.emit('call-answer', {
  roomId: 'room_123',
  answer: rtcAnswer
});
```

#### `call-end`
End the current call.

**Parameters:**
```javascript
{
  roomId: string          // Current room ID
}
```

**Example:**
```javascript
socket.emit('call-end', {
  roomId: 'room_123'
});
```

#### `call-reject`
Reject an incoming call.

**Parameters:**
```javascript
{
  roomId: string          // Current room ID
}
```

**Example:**
```javascript
socket.emit('call-reject', {
  roomId: 'room_123'
});
```

### Server to Client Events

#### `matched`
User has been matched with a chat partner.

**Data:**
```javascript
{
  roomId: string,         // New room ID
  partner: {              // Partner information
    userId: string,
    username: string,
    avatar: string,
    gender: string,
    interests: string[]
  },
  commonInterests: string[], // Shared interests
  isTestBot: boolean      // Whether partner is a test bot
}
```

**Example:**
```javascript
socket.on('matched', (data) => {
  console.log('Matched with:', data.partner.username);
  console.log('Common interests:', data.commonInterests);
});
```

#### `message`
Receive a new message from the chat partner.

**Data:**
```javascript
{
  id: string,             // Message ID
  content: string,        // Message content
  senderId: string,       // Sender's user ID
  senderName: string,     // Sender's username
  timestamp: Date,        // Message timestamp
  type: string           // "text", "image", "audio", "video"
}
```

**Example:**
```javascript
socket.on('message', (message) => {
  console.log(`${message.senderName}: ${message.content}`);
});
```

#### `user-typing`
Partner is typing a message.

**Data:**
```javascript
{
  userId: string,         // User ID of typing user
  username: string,       // Username of typing user
  isTyping: boolean       // Typing status
}
```

**Example:**
```javascript
socket.on('user-typing', (data) => {
  if (data.isTyping) {
    console.log(`${data.username} is typing...`);
  }
});
```

#### `user-stopped-typing`
Partner stopped typing.

**Data:**
```javascript
{
  userId: string,         // User ID
  username: string        // Username
}
```

**Example:**
```javascript
socket.on('user-stopped-typing', (data) => {
  console.log(`${data.username} stopped typing`);
});
```

#### `waiting-for-match`
User is waiting for a match.

**Data:**
```javascript
{
  message: string,        // Waiting message
  position: number,       // Position in queue
  estimatedWait: number   // Estimated wait time in seconds
}
```

**Example:**
```javascript
socket.on('waiting-for-match', (data) => {
  console.log(data.message);
  console.log(`Position: ${data.position}`);
});
```

#### `call-offer`
Receive an incoming call offer.

**Data:**
```javascript
{
  roomId: string,         // Room ID
  offer: RTCSessionDescription, // WebRTC offer
  callType: string,       // "video" or "audio"
  callerId: string,       // Caller's user ID
  callerName: string      // Caller's username
}
```

**Example:**
```javascript
socket.on('call-offer', (data) => {
  console.log(`Incoming ${data.callType} call from ${data.callerName}`);
});
```

#### `call-answer`
Receive a call answer.

**Data:**
```javascript
{
  roomId: string,         // Room ID
  answer: RTCSessionDescription // WebRTC answer
}
```

**Example:**
```javascript
socket.on('call-answer', (answer) => {
  // Handle call answer
});
```

#### `call-end`
Call has ended.

**Data:**
```javascript
{
  roomId: string,         // Room ID
  reason: string          // Reason for ending call
}
```

**Example:**
```javascript
socket.on('call-end', (data) => {
  console.log(`Call ended: ${data.reason}`);
});
```

#### `call-reject`
Call was rejected.

**Data:**
```javascript
{
  roomId: string,         // Room ID
  reason: string          // Rejection reason
}
```

**Example:**
```javascript
socket.on('call-reject', (data) => {
  console.log(`Call rejected: ${data.reason}`);
});
```

#### `partner-disconnected`
Chat partner has disconnected.

**Data:**
```javascript
{
  partnerId: string,      // Partner's user ID
  reason: string          // Disconnection reason
}
```

**Example:**
```javascript
socket.on('partner-disconnected', (data) => {
  console.log(`Partner disconnected: ${data.reason}`);
});
```

## 🌐 HTTP Endpoints

### Health Check

#### `GET /api/test`
Check server health and get statistics.

**Response:**
```javascript
{
  status: "ok",
  timestamp: "2024-01-15T10:30:00.000Z",
  uptime: 3600,
  activeUsers: 5,
  waitingUsers: 2,
  totalRooms: 3
}
```

**Example:**
```javascript
fetch('http://localhost:5000/api/test')
  .then(response => response.json())
  .then(data => console.log(data));
```

### File Upload

#### `POST /api/upload`
Upload media files (images, audio, video).

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body: FormData with file

**Parameters:**
```javascript
{
  file: File,             // File to upload
  roomId: string,         // Room ID
  userId: string          // User ID
}
```

**Response:**
```javascript
{
  success: true,
  fileUrl: string,        // URL of uploaded file
  fileName: string,       // Original filename
  fileSize: number,       // File size in bytes
  fileType: string        // MIME type
}
```

**Example:**
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('roomId', 'room_123');
formData.append('userId', 'user_456');

fetch('http://localhost:5000/api/upload', {
  method: 'POST',
  body: formData
})
.then(response => response.json())
.then(data => console.log(data));
```

## 🔧 Configuration

### Server Configuration

**Environment Variables:**
```bash
PORT=5000                 # Server port
NODE_ENV=development      # Environment mode
CORS_ORIGIN=http://localhost:3000  # CORS origin
UPLOAD_DIR=./uploads      # Upload directory
MAX_FILE_SIZE=10485760    # Max file size (10MB)
```

### Client Configuration

**Socket.IO Configuration:**
```javascript
const socket = io('http://localhost:5000', {
  transports: ['websocket', 'polling'],
  timeout: 20000,
  forceNew: true
});
```

**WebRTC Configuration:**
```javascript
const rtcConfig = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ]
};
```

## 📊 Data Models

### User Model
```javascript
{
  id: string,             // Unique user ID
  username: string,       // Display name
  avatar: string,         // Avatar URL
  gender: string,         // "Male", "Female", "Other"
  lookingFor: string[],   // Preferred chat partners
  interests: string[],    // User interests
  isActive: boolean,      // Online status
  lastSeen: Date,         // Last activity timestamp
  socketId: string        // Socket.IO connection ID
}
```

### Room Model
```javascript
{
  id: string,             // Unique room ID
  users: string[],        // Array of user IDs
  createdAt: Date,        // Room creation timestamp
  lastActivity: Date,     // Last message timestamp
  isActive: boolean       // Room status
}
```

### Message Model
```javascript
{
  id: string,             // Unique message ID
  roomId: string,         // Room ID
  senderId: string,       // Sender's user ID
  content: string,        // Message content
  type: string,           // "text", "image", "audio", "video"
  timestamp: Date,        // Message timestamp
  fileUrl: string,        // File URL (for media messages)
  fileName: string        // Original filename
}
```

## 🚨 Error Handling

### Socket.IO Error Events

#### `connect_error`
Connection failed.

**Data:**
```javascript
{
  message: string,        // Error message
  description: string,    // Error description
  context: string,        // Error context
  type: string           // Error type
}
```

**Example:**
```javascript
socket.on('connect_error', (error) => {
  console.error('Connection failed:', error.message);
});
```

#### `disconnect`
Connection lost.

**Data:**
```javascript
{
  reason: string,         // Disconnect reason
  wasConnected: boolean   // Previous connection status
}
```

**Example:**
```javascript
socket.on('disconnect', (reason) => {
  console.log('Disconnected:', reason);
});
```

### HTTP Error Responses

#### 400 Bad Request
```javascript
{
  error: "Bad Request",
  message: "Invalid request parameters",
  code: 400
}
```

#### 404 Not Found
```javascript
{
  error: "Not Found",
  message: "Resource not found",
  code: 404
}
```

#### 413 Payload Too Large
```javascript
{
  error: "Payload Too Large",
  message: "File size exceeds limit",
  code: 413
}
```

#### 500 Internal Server Error
```javascript
{
  error: "Internal Server Error",
  message: "An unexpected error occurred",
  code: 500
}
```

## 🔐 Security Considerations

### Input Validation
- All user inputs are validated and sanitized
- File uploads are restricted by type and size
- XSS protection for message content

### Rate Limiting
- Message sending rate limits
- File upload rate limits
- Connection attempt limits

### CORS Configuration
```javascript
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
};
```

## 📈 Performance Optimization

### Connection Management
- Automatic reconnection on disconnect
- Connection pooling for multiple users
- Efficient room management

### File Handling
- Streaming for large files
- Compression for images
- CDN integration ready

### Memory Management
- Automatic cleanup of inactive rooms
- User session management
- Garbage collection optimization

---

*For more information, see the main [README.md](../README.md) file.*
