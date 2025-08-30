const express = require("express");
const messageRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const Message = require("../models/message");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");
const { validateMessageData } = require("../utils/validation");

// Send a message to a friend
messageRouter.post("/message/send/:receiverId", userAuth, async (req, res) => {
  try {
    const senderId = req.user._id;
    const receiverId = req.params.receiverId;
    
    // Validate message data
    validateMessageData(req);
    
    const { message, messageType, mediaUrl } = req.body;

    // Check if receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: "Receiver not found" });
    }

    // Check if users are connected (can only message friends)
    const connection = await ConnectionRequest.findOne({
      $or: [
        { fromUserId: senderId, toUserId: receiverId, status: "accepted" },
        { fromUserId: receiverId, toUserId: senderId, status: "accepted" }
      ]
    });

    if (!connection) {
      return res.status(403).json({ message: "You can only message connected friends" });
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      message,
      messageType: messageType || 'text',
      mediaUrl
    });

    const savedMessage = await newMessage.save();
    await savedMessage.populate('senderId', 'firstName lastName');
    await savedMessage.populate('receiverId', 'firstName lastName');

    res.json({
      message: "Message sent successfully",
      data: savedMessage
    });
    
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

// Get conversation between two users
messageRouter.get("/message/conversation/:friendId", userAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    const friendId = req.params.friendId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    // Check if friend exists
    const friend = await User.findById(friendId);
    if (!friend) {
      return res.status(404).json({ message: "Friend not found" });
    }

    // Check if users are connected
    const connection = await ConnectionRequest.findOne({
      $or: [
        { fromUserId: userId, toUserId: friendId, status: "accepted" },
        { fromUserId: friendId, toUserId: userId, status: "accepted" }
      ]
    });

    if (!connection) {
      return res.status(403).json({ message: "You can only view messages with connected friends" });
    }

    // Get messages between the two users
    const messages = await Message.find({
      $or: [
        { senderId: userId, receiverId: friendId },
        { senderId: friendId, receiverId: userId }
      ]
    })
      .populate('senderId', 'firstName lastName')
      .populate('receiverId', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Mark messages as read if they were sent to the current user
    await Message.updateMany(
      { senderId: friendId, receiverId: userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    const totalMessages = await Message.countDocuments({
      $or: [
        { senderId: userId, receiverId: friendId },
        { senderId: friendId, receiverId: userId }
      ]
    });

    res.json({
      message: "Conversation retrieved successfully",
      data: messages.reverse(), // Reverse to show oldest first
      pagination: {
        page,
        limit,
        total: totalMessages,
        pages: Math.ceil(totalMessages / limit)
      }
    });
    
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

// Get all conversations for the current user
messageRouter.get("/message/conversations", userAuth, async (req, res) => {
  try {
    const userId = req.user._id;

    // Get all unique conversation partners
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [{ senderId: userId }, { receiverId: userId }]
        }
      },
      {
        $addFields: {
          partnerId: {
            $cond: {
              if: { $eq: ["$senderId", userId] },
              then: "$receiverId",
              else: "$senderId"
            }
          }
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: "$partnerId",
          lastMessage: { $first: "$$ROOT" },
          unreadCount: {
            $sum: {
              $cond: {
                if: {
                  $and: [
                    { $eq: ["$receiverId", userId] },
                    { $eq: ["$isRead", false] }
                  ]
                },
                then: 1,
                else: 0
              }
            }
          }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "partner",
          pipeline: [
            { $project: { firstName: 1, lastName: 1, emailId: 1 } }
          ]
        }
      },
      {
        $unwind: "$partner"
      },
      {
        $sort: { "lastMessage.createdAt": -1 }
      }
    ]);

    res.json({
      message: "Conversations retrieved successfully",
      data: conversations
    });
    
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

// Get unread message count
messageRouter.get("/message/unread/count", userAuth, async (req, res) => {
  try {
    const userId = req.user._id;

    const unreadCount = await Message.countDocuments({
      receiverId: userId,
      isRead: false
    });

    res.json({
      message: "Unread count retrieved successfully",
      data: { unreadCount }
    });
    
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

// Mark messages as read
messageRouter.patch("/message/mark-read/:friendId", userAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    const friendId = req.params.friendId;

    const result = await Message.updateMany(
      { senderId: friendId, receiverId: userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    res.json({
      message: `${result.modifiedCount} messages marked as read`,
      data: { modifiedCount: result.modifiedCount }
    });
    
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

// Delete a message (soft delete - only remove for sender)
messageRouter.delete("/message/delete/:messageId", userAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    const messageId = req.params.messageId;

    const message = await Message.findOne({
      _id: messageId,
      senderId: userId
    });

    if (!message) {
      return res.status(404).json({ message: "Message not found or unauthorized" });
    }

    await Message.findByIdAndDelete(messageId);

    res.json({ message: "Message deleted successfully" });
    
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

module.exports = messageRouter;