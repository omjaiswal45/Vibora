const validator = require("validator");
const User = require("../models/user")

const validateSignUpData = async (req) => {
  const { firstName, lastName, emailId, password } = req.body;
  if (!firstName || !lastName) {
    throw new Error("Name is required");
  } else if (!validator.isEmail(emailId)) {
    throw new Error("EmailId is not valid");
  } else if (!validator.isStrongPassword(password)) {
    throw new Error("Please enter a strong password");
  }
    const existingUser = await User.findOne({ emailId });
  if (existingUser) {
    throw new Error("Email ID already registered");
  }
};

const validateEditProfileData = (req) => {
  const allowEditFields = ["firstName", "lastName", "emailId", "age", "about", "gender", "photoUrl"];
  const isEditAllowed = Object.keys(req.body).every(field => allowEditFields.includes(field));
  return isEditAllowed;
};

const validatePassword = (req) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    throw new Error("Both old & new password are required");
  } else if (!validator.isStrongPassword(newPassword)) {
    throw new Error("Please enter a strong password");
  }
  return true;
};

const validatePostData = (req) => {
  const { content, images, videos, taggedUsers } = req.body;
  
  if (!content || content.trim() === '') {
    throw new Error("Post content is required");
  }
  
  if (content.length > 1000) {
    throw new Error("Post content should not exceed 1000 characters");
  }

  // Validate images URLs if provided
  if (images && Array.isArray(images)) {
    for (let imageUrl of images) {
      if (!validator.isURL(imageUrl)) {
        throw new Error("Invalid image URL format");
      }
    }
  }

  // Validate video URLs if provided
  if (videos && Array.isArray(videos)) {
    for (let videoUrl of videos) {
      if (!validator.isURL(videoUrl)) {
        throw new Error("Invalid video URL format");
      }
    }
  }

  // Validate tagged users if provided
  if (taggedUsers && Array.isArray(taggedUsers)) {
    for (let userId of taggedUsers) {
      if (!validator.isMongoId(userId)) {
        throw new Error("Invalid tagged user ID");
      }
    }
  }

  return true;
};

const validateCommentData = (req) => {
  const { comment } = req.body;
  
  if (!comment || comment.trim() === '') {
    throw new Error("Comment is required");
  }
  
  if (comment.length > 500) {
    throw new Error("Comment should not exceed 500 characters");
  }

  return true;
};

const validateMessageData = (req) => {
  const { message, messageType, mediaUrl } = req.body;
  
  if (!message || message.trim() === '') {
    throw new Error("Message content is required");
  }
  
  if (message.length > 1000) {
    throw new Error("Message should not exceed 1000 characters");
  }

  // Validate message type
  if (messageType && !['text', 'image', 'video'].includes(messageType)) {
    throw new Error("Invalid message type");
  }

  // Validate media URL if provided
  if (mediaUrl && !validator.isURL(mediaUrl)) {
    throw new Error("Invalid media URL format");
  }

  return true;
};

module.exports = {
  validateSignUpData,
  validateEditProfileData,
  validatePassword,
  validatePostData,
  validateCommentData,
  validateMessageData
};