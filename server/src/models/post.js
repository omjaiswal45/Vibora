const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    maxLength: 1000,
    trim: true
  },
  images: [{
    type: String, // URL of the image
    validate: {
      validator: function(v) {
        return /^https?:\/\/.+\.(jpg|jpeg|png|gif)$/i.test(v); // for validation  about image url
      },
      message: 'Invalid image URL format'
    }
  }],
  videos: [{
    type: String, // URL of the video
    validate: {
      validator: function(v) {
        return /^https?:\/\/.+\.(mp4|avi|mov|wmv)$/i.test(v);
      },
      message: 'Invalid video URL format'
    }
  }],
  taggedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  likes: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    likedAt: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    comment: {
      type: String,
      required: true,
      maxLength: 500,
      trim: true
    },
    commentedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for better performance
postSchema.index({ userId: 1, createdAt: -1 });
postSchema.index({ taggedUsers: 1 });

const Post = mongoose.model('Post', postSchema);
module.exports = Post;