const express = require("express");
const postRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const Post = require("../models/post");
const User = require("../models/user");
const { validatePostData, validateCommentData } = require("../utils/validation");

// Create a new post
postRouter.post("/post/create", userAuth, async (req, res) => {
  try {
    // Validate post data
    validatePostData(req);
    
    const { content, images, videos, taggedUsers } = req.body;
    const userId = req.user._id;

    // Validate tagged users exist
    if (taggedUsers && taggedUsers.length > 0) {
      const validUsers = await User.find({ _id: { $in: taggedUsers } });
      if (validUsers.length !== taggedUsers.length) {
        throw new Error("Some tagged users do not exist");
      }
    }

    const post = new Post({
      userId,
      content,
      images: images || [],
      videos: videos || [],
      taggedUsers: taggedUsers || []
    });

    const savedPost = await post.save();
    await savedPost.populate('userId', 'firstName lastName');
    await savedPost.populate('taggedUsers', 'firstName lastName');

    res.json({
      message: "Post created successfully",
      data: savedPost
    });
    
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

// Get user's own posts
postRouter.get("/post/my", userAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find({ userId, isActive: true })
      .populate('userId', 'firstName lastName')
      .populate('taggedUsers', 'firstName lastName')
      .populate('likes.userId', 'firstName lastName')
      .populate('comments.userId', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      message: "Posts retrieved successfully",
      data: posts,
      pagination: { page, limit, total: posts.length }
    });
    
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

// Update a post
postRouter.patch("/post/edit/:postId", userAuth, async (req, res) => {
  try {
    const postId = req.params.postId;
    const userId = req.user._id;
    
    // Validate post data
    validatePostData(req);
    
    const post = await Post.findOne({ _id: postId, userId, isActive: true });
    if (!post) {
      return res.status(404).json({ message: "Post not found or unauthorized" });
    }

    const { content, images, videos, taggedUsers } = req.body;

    // Validate tagged users if provided
    if (taggedUsers && taggedUsers.length > 0) {
      const validUsers = await User.find({ _id: { $in: taggedUsers } });
      if (validUsers.length !== taggedUsers.length) {
        throw new Error("Some tagged users do not exist");
      }
    }

    // Update post
    Object.keys(req.body).forEach((key) => {
      if (['content', 'images', 'videos', 'taggedUsers'].includes(key)) {
        post[key] = req.body[key];
      }
    });

    const updatedPost = await post.save();
    await updatedPost.populate('userId', 'firstName lastName');
    await updatedPost.populate('taggedUsers', 'firstName lastName');

    res.json({
      message: "Post updated successfully",
      data: updatedPost
    });
    
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

// Delete a post
postRouter.delete("/post/delete/:postId", userAuth, async (req, res) => {
  try {
    const postId = req.params.postId;
    const userId = req.user._id;
    
    const post = await Post.findOne({ _id: postId, userId });
    if (!post) {
      return res.status(404).json({ message: "Post not found or unauthorized" });
    }

    post.isActive = false;
    await post.save();

    res.json({ message: "Post deleted successfully" });
    
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

// Like/Unlike a post
postRouter.post("/post/like/:postId", userAuth, async (req, res) => {
  try {
    const postId = req.params.postId;
    const userId = req.user._id;
    
    const post = await Post.findOne({ _id: postId, isActive: true });
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if user already liked the post
    const existingLike = post.likes.find(like => like.userId.equals(userId));
    
    if (existingLike) {
      // Unlike the post
      post.likes = post.likes.filter(like => !like.userId.equals(userId));
      await post.save();
      res.json({ message: "Post unliked successfully", liked: false });
    } else {
      // Like the post
      post.likes.push({ userId });
      await post.save();
      res.json({ message: "Post liked successfully", liked: true });
    }
    
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

// Add comment to a post
postRouter.post("/post/comment/:postId", userAuth, async (req, res) => {
  try {
    const postId = req.params.postId;
    const userId = req.user._id;
    
    // Validate comment data
    validateCommentData(req);
    
    const { comment } = req.body;
    
    const post = await Post.findOne({ _id: postId, isActive: true });
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    post.comments.push({
      userId,
      comment
    });

    await post.save();
    await post.populate('comments.userId', 'firstName lastName');

    res.json({
      message: "Comment added successfully",
      data: post.comments[post.comments.length - 1]
    });
    
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

// Get single post with all details
postRouter.get("/post/:postId", userAuth, async (req, res) => {
  try {
    const postId = req.params.postId;
    
    const post = await Post.findOne({ _id: postId, isActive: true })
      .populate('userId', 'firstName lastName')
      .populate('taggedUsers', 'firstName lastName')
      .populate('likes.userId', 'firstName lastName')
      .populate('comments.userId', 'firstName lastName');

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.json({
      message: "Post retrieved successfully",
      data: post
    });
    
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

module.exports = postRouter;