const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  username: {
    type: String,
    required: true
  },
  avatar: {
    type: String,
    required: true
  },
  socketId: {
    type: String,
    required: true
  },
  isOnline: {
    type: Boolean,
    default: true
  },
  joinedAt: {
    type: Date,
    default: Date.now
  },
  disconnectedAt: {
    type: Date
  }
});

module.exports = mongoose.model('User', userSchema);

