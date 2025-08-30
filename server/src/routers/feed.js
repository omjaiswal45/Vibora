const express = require("express");
const feedRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const Post = require("../models/post");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");

// Get news feed - posts from friends and own posts
feedRouter.get("/feed", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get all accepted connection requests where user is either sender or receiver
    const connections = await ConnectionRequest.find({
      $or: [
        { fromUserId: loggedInUser._id, status: "accepted" },
        { toUserId: loggedInUser._id, status: "accepted" }
      ]
    });

    // Extract friend IDs
    const friendIds = connections.map(connection => {
      return connection.fromUserId.equals(loggedInUser._id) 
        ? connection.toUserId 
        : connection.fromUserId;
    });

    // Include user's own ID to see their posts too
    const feedUserIds = [...friendIds, loggedInUser._id];

    // Get posts from friends and own posts
    const posts = await Post.find({ 
      userId: { $in: feedUserIds }, 
      isActive: true 
    })
      .populate('userId', 'firstName lastName')
      .populate('taggedUsers', 'firstName lastName')
      .populate('likes.userId', 'firstName lastName')
      .populate('comments.userId', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPosts = await Post.countDocuments({ 
      userId: { $in: feedUserIds }, 
      isActive: true 
    });

    res.json({
      message: "Feed retrieved successfully",
      data: posts,
      pagination: {
        page,
        limit,
        total: totalPosts,
        pages: Math.ceil(totalPosts / limit)
      }
    });
    
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

// Get posts by a specific user (public profile view)
feedRouter.get("/feed/user/:userId", userAuth, async (req, res) => {
  try {
    const userId = req.params.userId;
    const loggedInUser = req.user;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Check if the target user exists
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if users are connected or it's the user's own profile
    let canViewPosts = userId === loggedInUser._id.toString();
    
    if (!canViewPosts) {
      const connection = await ConnectionRequest.findOne({
        $or: [
          { fromUserId: loggedInUser._id, toUserId: userId, status: "accepted" },
          { fromUserId: userId, toUserId: loggedInUser._id, status: "accepted" }
        ]
      });
      canViewPosts = !!connection;
    }

    if (!canViewPosts) {
      return res.status(403).json({ message: "You can only view posts of connected friends" });
    }

    const posts = await Post.find({ 
      userId, 
      isActive: true 
    })
      .populate('userId', 'firstName lastName')
      .populate('taggedUsers', 'firstName lastName')
      .populate('likes.userId', 'firstName lastName')
      .populate('comments.userId', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPosts = await Post.countDocuments({ 
      userId, 
      isActive: true 
    });

    res.json({
      message: `Posts by ${targetUser.firstName} retrieved successfully`,
      data: posts,
      pagination: {
        page,
        limit,
        total: totalPosts,
        pages: Math.ceil(totalPosts / limit)
      }
    });
    
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

// Search users for potential connections
feedRouter.get("/feed/users/search", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const searchQuery = req.query.search;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    if (!searchQuery || searchQuery.trim() === '') {
      return res.status(400).json({ message: "Search query is required" });
    }

    // Get existing connection request user IDs to exclude from search
    const existingConnections = await ConnectionRequest.find({
      $or: [
        { fromUserId: loggedInUser._id },
        { toUserId: loggedInUser._id }
      ]
    });

    const excludeUserIds = existingConnections.map(conn => 
      conn.fromUserId.equals(loggedInUser._id) ? conn.toUserId : conn.fromUserId
    );

    // Also exclude the logged-in user
    excludeUserIds.push(loggedInUser._id);

    // Search for users by name or email
    const users = await User.find({
      _id: { $nin: excludeUserIds },
      $or: [
        { firstName: { $regex: searchQuery, $options: 'i' } },
        { lastName: { $regex: searchQuery, $options: 'i' } },
        { emailId: { $regex: searchQuery, $options: 'i' } }
      ]
    })
      .select('firstName lastName emailId age gender about')
      .skip(skip)
      .limit(limit);

    const totalUsers = await User.countDocuments({
      _id: { $nin: excludeUserIds },
      $or: [
        { firstName: { $regex: searchQuery, $options: 'i' } },
        { lastName: { $regex: searchQuery, $options: 'i' } },
        { emailId: { $regex: searchQuery, $options: 'i' } }
      ]
    });

    res.json({
      message: "Users found",
      data: users,
      pagination: {
        page,
        limit,
        total: totalUsers,
        pages: Math.ceil(totalUsers / limit)
      }
    });
    
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

module.exports = feedRouter;