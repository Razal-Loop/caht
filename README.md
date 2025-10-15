# AnonChat - Anonymous Chat Application

A modern, real-time anonymous chat application built with React, Node.js, and Socket.IO. Connect with strangers around the world through smart gender and interest-based matching.

![AnonChat Preview](https://img.shields.io/badge/Status-Live-brightgreen)
![React](https://img.shields.io/badge/React-18.2.0-blue)
![Node.js](https://img.shields.io/badge/Node.js-16+-green)
![Socket.IO](https://img.shields.io/badge/Socket.IO-4.7.0-orange)

## 🌟 Features

### Core Features
- **100% Anonymous Chat** - No registration required, just choose a username
- **Smart Matching Algorithm** - Connect based on gender preferences and shared interests
- **Real-time Messaging** - Instant message delivery with Socket.IO
- **Video & Audio Calls** - WebRTC-powered video and voice calling
- **Media Sharing** - Share images, videos, and audio files
- **Responsive Design** - Works perfectly on desktop, tablet, and mobile devices

### Advanced Features
- **Gender-based Matching** - Specify who you want to chat with
- **Interest Matching** - Connect with people who share your hobbies
- **Skip Functionality** - Find a new chat partner anytime
- **Typing Indicators** - See when someone is typing
- **WhatsApp-like UI** - Modern, intuitive interface
- **Bootstrap Integration** - Professional, responsive design

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Modern web browser

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/anonchat.git
   cd anonchat
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Start the application**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000

## 📁 Project Structure

```
anonchat/
├── client/                 # React frontend
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── Welcome.js # Welcome/registration screen
│   │   │   ├── Chat.js    # Main chat interface
│   │   │   ├── CallModal.js # Video/audio call modal
│   │   │   └── MediaShare.js # Media sharing modal
│   │   ├── utils/         # Utility functions
│   │   │   ├── webrtc.js  # WebRTC management
│   │   │   └── fileUpload.js # File upload handling
│   │   ├── App.js         # Main React component
│   │   └── App.css        # Global styles
│   └── package.json       # Frontend dependencies
├── server/                # Node.js backend
│   ├── models/           # Data models
│   ├── uploads/          # File uploads directory
│   ├── index.js          # Main server file
│   └── package.json      # Backend dependencies
├── start.bat             # Windows startup script
├── start.sh              # Linux/Mac startup script
└── README.md             # This file
```

## 🛠️ Technology Stack

### Frontend
- **React 18.2.0** - Modern UI library
- **Socket.IO Client** - Real-time communication
- **Bootstrap 5.3.8** - Responsive CSS framework
- **Lucide React** - Beautiful icons
- **WebRTC** - Video/audio calling

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **Socket.IO** - Real-time bidirectional communication
- **Multer** - File upload handling
- **MongoDB** (Optional) - Database (currently using in-memory storage)

## 🎯 Usage Guide

### Getting Started
1. **Enter Username** - Choose any username you like
2. **Select Avatar** - Use a random avatar or provide your own URL
3. **Choose Gender** - Select your gender (Male/Female/Other)
4. **Set Preferences** - Choose who you want to chat with
5. **Select Interests** - Pick your hobbies and interests
6. **Start Chatting** - Click "Start Chatting" to find a partner

### Chat Features
- **Send Messages** - Type and press Enter or click Send
- **Share Media** - Click the paperclip icon to share files
- **Video Call** - Click the video camera icon
- **Voice Call** - Click the microphone icon
- **Skip Partner** - Click the refresh icon to find someone new
- **Disconnect** - Click the phone icon to leave

### Matching Algorithm
The app uses a sophisticated matching system:
1. **Gender Compatibility** - Matches based on your preferences
2. **Interest Scoring** - Prioritizes users with shared interests
3. **Test Mode** - Includes bot users for testing when no real users are available

## 🔧 API Documentation

### Socket.IO Events

#### Client to Server
- `join-as-guest` - Join the chat as a guest user
- `send-message` - Send a text message
- `typing` - Indicate typing status
- `find-new-chat` - Skip current partner and find new one
- `call-offer` - Initiate video/audio call
- `call-answer` - Answer incoming call
- `call-end` - End current call
- `call-reject` - Reject incoming call

#### Server to Client
- `matched` - User matched with a chat partner
- `message` - Receive a new message
- `user-typing` - Partner is typing
- `user-stopped-typing` - Partner stopped typing
- `call-offer` - Incoming call offer
- `call-answer` - Call answer received
- `call-end` - Call ended
- `call-reject` - Call rejected

### HTTP Endpoints
- `GET /api/test` - Server health check
- `POST /api/upload` - File upload endpoint

## 🎨 Customization

### Styling
The app uses a WhatsApp-inspired design with:
- **Color Scheme**: Green gradient background (#25D366 to #075E54)
- **Typography**: System fonts for optimal readability
- **Responsive Design**: Mobile-first approach with Bootstrap
- **Dark Mode**: Ready for future dark theme implementation

### Configuration
Key configuration options in `server/index.js`:
- **Port**: Default 5000 (change `PORT` environment variable)
- **CORS**: Configured for localhost:3000
- **File Upload**: 10MB limit, supports images, audio, video
- **Matching**: Customizable interest scoring algorithm

## 🚀 Deployment

### Local Development
```bash
npm run dev          # Start both client and server
npm run server       # Start server only
npm run client       # Start client only
```

### Production Deployment

1. **Build the client**
   ```bash
   cd client
   npm run build
   ```

2. **Set environment variables**
   ```bash
   export PORT=5000
   export NODE_ENV=production
   ```

3. **Start the server**
   ```bash
   cd server
   npm start
   ```

### Docker Deployment
```dockerfile
# Dockerfile example
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 🧪 Testing

### Manual Testing
1. **Open multiple browser tabs** to test matching
2. **Use different browsers** to simulate multiple users
3. **Test media sharing** with various file types
4. **Test video/audio calls** between different devices

### Test Mode
The app includes a test mode with bot users:
- **TestBot** - Predefined bot user for testing
- **Quick Test Setup** - Button to auto-fill form fields
- **Server Health Check** - Test server connectivity

## 🔒 Security Features

- **Anonymous by Design** - No personal data collection
- **File Upload Validation** - Type and size restrictions
- **CORS Protection** - Configured for specific origins
- **Input Sanitization** - XSS protection
- **Rate Limiting** - Prevents spam (can be added)

## 🐛 Troubleshooting

### Common Issues

1. **Connection Failed**
   - Check if server is running on port 5000
   - Verify firewall settings
   - Check browser console for errors

2. **Video/Audio Not Working**
   - Ensure camera/microphone permissions are granted
   - Check if devices are being used by other applications
   - Try refreshing the page

3. **File Upload Issues**
   - Check file size (max 10MB)
   - Verify file type is supported
   - Ensure uploads directory exists

4. **Styling Issues**
   - Clear browser cache
   - Check if Bootstrap CSS is loading
   - Verify CSS file paths

### Debug Mode
Enable debug logging by adding to browser console:
```javascript
localStorage.setItem('debug', 'socket.io-client:*');
```

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Development Guidelines
- Follow existing code style
- Add comments for complex logic
- Test your changes thoroughly
- Update documentation as needed

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Socket.IO** - For real-time communication
- **React** - For the amazing UI library
- **Bootstrap** - For responsive design
- **Lucide** - For beautiful icons
- **WebRTC** - For video/audio calling

## 📞 Support

If you encounter any issues or have questions:

1. **Check the troubleshooting section** above
2. **Search existing issues** on GitHub
3. **Create a new issue** with detailed information
4. **Join our community** discussions

## 🔮 Roadmap

### Upcoming Features
- [ ] Dark mode theme
- [ ] Message encryption
- [ ] Group chat rooms
- [ ] User profiles
- [ ] Message history
- [ ] Push notifications
- [ ] Mobile app (React Native)
- [ ] Voice messages
- [ ] Emoji reactions
- [ ] Chat themes

### Performance Improvements
- [ ] Database integration (MongoDB/PostgreSQL)
- [ ] Redis for session management
- [ ] CDN for static assets
- [ ] Load balancing
- [ ] Caching strategies

---

**Made with ❤️ for anonymous connections worldwide**

*Connect. Chat. Discover.*