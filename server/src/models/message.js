const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: true,
    maxLength: 1000,
    trim: true
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'video'],
    default: 'text'
  },
  mediaUrl: {
    type: String,
    validate: {
      validator: function(v) {
        if (!v) return true; // Optional field
        return /^https?:\/\/.+\.(jpg|jpeg|png|gif|mp4|avi|mov|wmv)$/i.test(v);
      },
      message: 'Invalid media URL format'
    }
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for better performance
messageSchema.index({ senderId: 1, receiverId: 1, createdAt: -1 });
messageSchema.index({ receiverId: 1, isRead: 1 });

// Pre-save middleware to prevent self-messaging
messageSchema.pre("save", function(next) {
  const message = this;
  if (message.senderId.equals(message.receiverId)) {
    throw new Error("Cannot send message to yourself");
  }
  next();
});

const Message = mongoose.model('Message', messageSchema);
module.exports = Message;