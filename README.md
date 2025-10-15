# AnonChat - Anonymous Chat Application

A real-time anonymous chat application similar to WhatsApp, where users can connect as guests and chat with strangers around the world.

## Features

- 🔒 **100% Anonymous** - No registration required, just choose a username and avatar
- ⚡ **Real-time Messaging** - Powered by Socket.io for instant message delivery
- 🎯 **Instant Matching** - Automatically connects you with other users looking to chat
- 📱 **Responsive Design** - Works perfectly on desktop and mobile devices
- 🎨 **Modern UI** - Beautiful, intuitive interface with smooth animations
- 💬 **Typing Indicators** - See when your chat partner is typing
- 🔄 **New Chat** - Easily find new chat partners anytime
- 📹 **Video Calls** - High-quality video calling with WebRTC
- 🎤 **Voice Calls** - Crystal clear voice calling
- 📷 **Media Sharing** - Share images, videos, and audio files
- 🎛️ **Call Controls** - Mute/unmute, video on/off, and more

## Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Socket.io** - Real-time communication
- **MongoDB** - Database for storing messages and user sessions
- **Mongoose** - MongoDB object modeling
- **Multer** - File upload handling
- **WebRTC Signaling** - Real-time call management

### Frontend
- **React** - UI library
- **Socket.io Client** - Real-time communication
- **React Router** - Client-side routing
- **Lucide React** - Beautiful icons
- **CSS3** - Styling with modern features
- **WebRTC** - Video and voice calling
- **React Dropzone** - File upload interface

## Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v14 or higher)
- **MongoDB** (v4.4 or higher)
- **npm** or **yarn**

## Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd anon-chat-app
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Set up MongoDB**
   - Make sure MongoDB is running on your system
   - The app will connect to `mongodb://localhost:27017/anonchat` by default
   - You can change this in the server's environment variables

4. **Environment Variables (Optional)**
   Create a `.env` file in the `server` directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/anonchat
   NODE_ENV=development
   ```

## Running the Application

### Development Mode
```bash
npm run dev
```
This will start both the backend server (port 5000) and frontend development server (port 3000).

### Production Mode
```bash
# Build the frontend
npm run build

# Start the backend server
npm run server
```

## Usage

1. **Open your browser** and go to `http://localhost:3000`
2. **Enter a username** or use the random generator
3. **Choose an avatar** or generate a random one
4. **Click "Start Chatting"** to begin
5. **Wait for a match** - the app will automatically connect you with another user
6. **Start chatting** - send messages in real-time
7. **Make calls** - click the video or voice call buttons to start a call
8. **Share media** - click the paperclip icon to share images, videos, or audio
9. **Find new chat partners** anytime using the "New Chat" button

## Project Structure

```
anon-chat-app/
├── client/                 # React frontend
│   ├── public/            # Static files
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── Welcome.js # Landing page
│   │   │   └── Chat.js    # Chat interface
│   │   ├── App.js         # Main app component
│   │   └── index.js       # Entry point
│   └── package.json
├── server/                # Node.js backend
│   ├── models/           # MongoDB models
│   │   ├── User.js
│   │   ├── Message.js
│   │   └── ChatRoom.js
│   ├── index.js          # Server entry point
│   └── package.json
└── package.json          # Root package.json
```

## API Endpoints

### WebSocket Events

#### Client to Server
- `join-as-guest` - Join as anonymous user
- `find-new-chat` - Find a new chat partner
- `send-message` - Send a message
- `typing` - Send typing indicator
- `call-offer` - Initiate a video/voice call
- `call-answer` - Answer an incoming call
- `ice-candidate` - WebRTC ICE candidate exchange
- `call-end` - End an active call
- `call-reject` - Reject an incoming call
- `share-media` - Share media files

#### Server to Client
- `user-joined` - User successfully joined
- `matched` - Found a chat partner
- `waiting-for-match` - Waiting for a partner
- `new-message` - New message received
- `new-media-message` - New media message received
- `user-typing` - Partner is typing
- `partner-disconnected` - Partner left the chat
- `call-offer` - Incoming call offer
- `call-answer` - Call answer received
- `ice-candidate` - WebRTC ICE candidate
- `call-end` - Call ended
- `call-reject` - Call rejected

## Database Schema

### User
```javascript
{
  userId: String (unique),
  username: String,
  avatar: String,
  socketId: String,
  isOnline: Boolean,
  joinedAt: Date,
  disconnectedAt: Date
}
```

### Message
```javascript
{
  roomId: String,
  userId: String,
  username: String,
  avatar: String,
  message: String,
  mediaUrl: String, // Optional
  mediaType: String, // 'image', 'audio', 'video'
  fileName: String, // Optional
  timestamp: Date
}
```

### ChatRoom
```javascript
{
  roomId: String (unique),
  participants: [String],
  createdAt: Date,
  lastMessageAt: Date,
  isActive: Boolean
}
```

## Features in Detail

### Anonymous Authentication
- Users can join without any registration
- Each user gets a unique session ID
- Usernames and avatars are customizable
- No personal information is stored

### Real-time Matching
- Automatic pairing of users looking to chat
- Queue system for waiting users
- Instant connection when a match is found

### Chat Features
- Real-time message delivery
- Typing indicators
- Message timestamps
- Partner disconnection notifications
- Easy partner switching
- Media file sharing (images, videos, audio)
- File upload with progress tracking
- Media preview and playback

### Calling Features
- High-quality video calls with WebRTC
- Crystal clear voice calls
- Call controls (mute, video toggle, end call)
- Incoming call notifications
- Call acceptance/rejection
- Real-time call status updates

### User Experience
- Modern, responsive design
- Smooth animations and transitions
- Mobile-friendly interface
- Connection status indicators
- Error handling and user feedback
- Intuitive call interface
- Drag-and-drop file sharing

## Security Considerations

- All communication is anonymous
- No personal data is stored
- Messages are not permanently stored (optional)
- Rate limiting can be implemented
- Input validation and sanitization

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

If you encounter any issues or have questions, please open an issue on GitHub.

---

**Enjoy chatting anonymously! 🎉**
