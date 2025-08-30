const express = require("express");
const { userAuth } = require("../middlewares/auth");
const { validateEditProfileData, validatePassword } = require("../utils/validation");
const bcrypt = require("bcrypt");
const User = require("../models/user");

const profileRouter = express.Router();

// Get user profile
profileRouter.get("/profile", userAuth, async (req, res) => {
  try {
    const user = req.user;
    res.json({
      message: "Profile retrieved successfully",
      data: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        emailId: user.emailId,
        age: user.age,
        gender: user.gender,
        about: user.about,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

// Get another user's profile (public view)
profileRouter.get("/profile/user/:userId", userAuth, async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId).select("-password");
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "User profile retrieved successfully",
      data: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        age: user.age,
        gender: user.gender,
        about: user.about
      }
    });
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});
 
// Update profile
profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    // Validate profile edit data
    if (!validateEditProfileData(req)) {
      throw new Error("Invalid edit request");
    }

    const loggedInUser = req.user;
    
    // Check if email is being changed and if it already exists
    if (req.body.emailId && req.body.emailId !== loggedInUser.emailId) {
      const existingUser = await User.findOne({ emailId: req.body.emailId });
      if (existingUser) {
        throw new Error("Email already exists");
      }
    }

    Object.keys(req.body).forEach((key) => (loggedInUser[key] = req.body[key]));
    await loggedInUser.save();

    res.json({
      message: `${loggedInUser.firstName}, your profile updated successfully`,
      data: {
        _id: loggedInUser._id,
        firstName: loggedInUser.firstName,
        lastName: loggedInUser.lastName,
        emailId: loggedInUser.emailId,
        age: loggedInUser.age,
        gender: loggedInUser.gender,
        about: loggedInUser.about
      }
    });
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

// Change password
profileRouter.patch("/profile/password", userAuth, async (req, res) => {
  try {
    // Validate password data
    validatePassword(req);
    
    const { oldPassword, newPassword } = req.body;
    const loggedInUser = req.user;

    // Compare old password
    const isMatch = await bcrypt.compare(oldPassword, loggedInUser.password);
    if (!isMatch) {
      throw new Error("Old password is incorrect");
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password
    loggedInUser.password = hashedNewPassword;
    await loggedInUser.save();

    res.json({
      message: "Password changed successfully"
    });
    
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  } 
});

// Delete account (soft delete)
// Delete account (soft delete)
profileRouter.delete("/profile/delete", userAuth, async (req, res) => {
  try {
    const { password } = req.body;
    const loggedInUser = req.user;

    if (!password) {
      return res.status(400).json({ message: "Password is required to delete account" });
    }

    // Verify password before deletion
    const isMatch = await bcrypt.compare(password, loggedInUser.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Password is incorrect" });
    }

    // Soft delete: mark user as inactive
    loggedInUser.isActive = false;
    loggedInUser.deletedAt = new Date();
    await loggedInUser.save();

    // Clear the authentication cookie
    res.clearCookie("token", {
      httpOnly: true,
      sameSite: "Strict",
    });

    // Respond with success
    res.status(200).json({ message: "Account deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error: " + err.message });
  }
});


module.exports = profileRouter;