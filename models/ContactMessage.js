const mongoose = require('mongoose');

const ContactMessageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true
  },
  message: {
    type: String,
    required: [true, 'Message is required']
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

ContactMessageSchema.index({ createdAt: -1 });

module.exports = mongoose.model('ContactMessage', ContactMessageSchema);
