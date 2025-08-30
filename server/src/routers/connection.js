const express = require("express");
const connectionRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");

// Send connection request
connectionRouter.post("/connection/request/:userId", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const targetUserId = req.params.userId;

    // Check if target user exists
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user is trying to connect with themselves
    if (loggedInUser._id.equals(targetUserId)) {
      return res.status(400).json({ message: "You cannot send connection request to yourself" });
    }

    // Check if connection request already exists
    const existingRequest = await ConnectionRequest.findOne({
      $or: [
        { fromUserId: loggedInUser._id, toUserId: targetUserId },
        { fromUserId: targetUserId, toUserId: loggedInUser._id }
      ]
    });

    if (existingRequest) {
      if (existingRequest.status === "accepted") {
        return res.status(400).json({ message: "You are already connected with this user" });
      } else if (existingRequest.status === "interested") {
        if (existingRequest.fromUserId.equals(loggedInUser._id)) {
          return res.status(400).json({ message: "Connection request already sent" });
        } else {
          return res.status(400).json({ message: "This user has already sent you a connection request" });
        }
      } else if (existingRequest.status === "ignored") {
        return res.status(400).json({ message: "This user is blocked" });
      }
    }

    // Create new connection request
    const connectionRequest = new ConnectionRequest({
      fromUserId: loggedInUser._id,
      toUserId: targetUserId,
      status: "interested"
    });

    await connectionRequest.save();

    res.json({
      message: "Connection request sent successfully",
      data: connectionRequest
    });
    
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

// Accept connection request
connectionRouter.patch("/connection/accept/:userId", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const fromUserId = req.params.userId;

    const connectionRequest = await ConnectionRequest.findOne({
      fromUserId: fromUserId,
      toUserId: loggedInUser._id,
      status: "interested"
    });

    if (!connectionRequest) {
      return res.status(404).json({ message: "Connection request not found" });
    }

    connectionRequest.status = "accepted";
    await connectionRequest.save();

    res.json({
      message: "Connection request accepted successfully",
      data: connectionRequest
    });
    
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

// Reject connection request
connectionRouter.patch("/connection/reject/:userId", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const fromUserId = req.params.userId;

    const connectionRequest = await ConnectionRequest.findOne({
      fromUserId: fromUserId,
      toUserId: loggedInUser._id,
      status: "interested"
    });

    if (!connectionRequest) {
      return res.status(404).json({ message: "Connection request not found" });
    }

    connectionRequest.status = "rejected";
    await connectionRequest.save();

    res.json({
      message: "Connection request rejected successfully",
      data: connectionRequest
    });
    
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

// Cancel connection request
connectionRouter.delete("/connection/cancel/:userId", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const toUserId = req.params.userId;

    const connectionRequest = await ConnectionRequest.findOne({
      fromUserId: loggedInUser._id,
      toUserId: toUserId,
      status: "interested"
    });

    if (!connectionRequest) {
      return res.status(404).json({ message: "Connection request not found" });
    }

    await ConnectionRequest.findByIdAndDelete(connectionRequest._id);

    res.json({
      message: "Connection request cancelled successfully"
    });
    
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

// Get all pending connection requests received
connectionRouter.get("/connection/requests/received", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const connectionRequests = await ConnectionRequest.find({
      toUserId: loggedInUser._id,
      status: "interested"
    }).populate("fromUserId", "firstName lastName emailId age gender about");

    res.json({
      message: "Connection requests retrieved successfully",
      data: connectionRequests
    });
    
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

// Get all pending connection requests sent
connectionRouter.get("/connection/requests/sent", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const connectionRequests = await ConnectionRequest.find({
      fromUserId: loggedInUser._id,
      status: "interested"
    }).populate("toUserId", "firstName lastName emailId age gender about");

    res.json({
      message: "Sent connection requests retrieved successfully",
      data: connectionRequests
    });
    
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

// Get all connections (accepted friends)
connectionRouter.get("/connection/friends", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const connections = await ConnectionRequest.find({
      $or: [
        { fromUserId: loggedInUser._id, status: "accepted" },
        { toUserId: loggedInUser._id, status: "accepted" }
      ]
    })
    .populate("fromUserId", "firstName lastName emailId age gender about")
    .populate("toUserId", "firstName lastName emailId age gender about")
    .skip(skip)
    .limit(limit);

    // Extract friend data
    const friends = connections.map(connection => {
      if (connection.fromUserId._id.equals(loggedInUser._id)) {
        return {
          connectionId: connection._id,
          friend: connection.toUserId,
          connectedAt: connection.updatedAt
        };
      } else {
        return {
          connectionId: connection._id,
          friend: connection.fromUserId,
          connectedAt: connection.updatedAt
        };
      }
    });

    const totalConnections = await ConnectionRequest.countDocuments({
      $or: [
        { fromUserId: loggedInUser._id, status: "accepted" },
        { toUserId: loggedInUser._id, status: "accepted" }
      ]
    });

    res.json({
      message: "Friends list retrieved successfully",
      data: friends,
      pagination: {
        page,
        limit,
        total: totalConnections,
        pages: Math.ceil(totalConnections / limit)
      }
    });
    
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

// Remove a friend (delete connection)
connectionRouter.delete("/connection/remove/:friendId", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const friendId = req.params.friendId;

    const connection = await ConnectionRequest.findOne({
      $or: [
        { fromUserId: loggedInUser._id, toUserId: friendId, status: "accepted" },
        { fromUserId: friendId, toUserId: loggedInUser._id, status: "accepted" }
      ]
    });

    if (!connection) {
      return res.status(404).json({ message: "Connection not found" });
    }

    await ConnectionRequest.findByIdAndDelete(connection._id);

    res.json({ message: "Friend removed successfully" });
    
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

// Get connection statistics
connectionRouter.get("/connection/stats", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const stats = await ConnectionRequest.aggregate([
      {
        $match: {
          $or: [
            { fromUserId: loggedInUser._id },
            { toUserId: loggedInUser._id }
          ]
        }
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    const pendingReceived = await ConnectionRequest.countDocuments({
      toUserId: loggedInUser._id,
      status: "interested"
    });

    const pendingSent = await ConnectionRequest.countDocuments({
      fromUserId: loggedInUser._id,
      status: "interested"
    });

    const statsObject = stats.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {});

    res.json({
      message: "Connection statistics retrieved successfully",
      data: {
        totalFriends: statsObject.accepted || 0,
        pendingReceived,
        pendingSent,
        rejected: statsObject.rejected || 0,
        ignored: statsObject.ignored || 0
      }
    });
    
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

// Block a user (change status to ignored)
connectionRouter.patch("/connection/block/:userId", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const userId = req.params.userId;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find existing connection request
    const connectionRequest = await ConnectionRequest.findOne({
      $or: [
        { fromUserId: loggedInUser._id, toUserId: userId },
        { fromUserId: userId, toUserId: loggedInUser._id }
      ]
    });

    if (connectionRequest) {
      connectionRequest.status = "ignored";
      await connectionRequest.save();
      res.json({ message: "User blocked successfully" });
    } else {
      // Create a new ignored connection request
      const newConnectionRequest = new ConnectionRequest({
        fromUserId: loggedInUser._id,
        toUserId: userId,
        status: "ignored"
      });
      await newConnectionRequest.save();
      res.json({ message: "User blocked successfully" });
    }
    
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

module.exports = connectionRouter;