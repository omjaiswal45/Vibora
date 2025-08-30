import axiosInstance from "../api/axiosInstance";
import { logoutUser } from "../features/auth/authSlice";
import toast from "react-hot-toast";

/**
 * Handles user logout consistently across the application
 * @param {Function} dispatch - Redux dispatch function
 * @param {Function} navigate - React Router navigate function
 * @param {boolean} showToast - Whether to show success toast (default: true)
 */
export const handleLogout = async (dispatch, navigate, showToast = true) => {
  try {
    // Call logout API to clear server-side session
    await axiosInstance.post("/logout", {}, { withCredentials: true });
    
    // Clear local state
    dispatch(logoutUser());
    
    // Clear any stored credentials
    localStorage.removeItem("user");
    sessionStorage.clear();
    
    // Show success message if requested
    if (showToast) {
      toast.success("Logged out successfully!");
    }
    
    // Navigate to login page
    navigate("/login", { replace: true });
  } catch (error) {
    console.error("Logout error:", error);
    // Even if API call fails, clear local state and redirect
    dispatch(logoutUser());
    localStorage.removeItem("user");
    sessionStorage.clear();
    
    if (showToast) {
      toast.error("Logout failed, but you have been signed out locally");
    }
    
    navigate("/login", { replace: true });
  }
};

/**
 * Clears all authentication data without API call
 * Useful for forced logout scenarios
 * @param {Function} dispatch - Redux dispatch function
 * @param {Function} navigate - React Router navigate function
 */
export const forceLogout = (dispatch, navigate) => {
  dispatch(logoutUser());
  localStorage.removeItem("user");
  sessionStorage.clear();
  navigate("/login", { replace: true });
};

/**
 * Checks if user is authenticated
 * @param {Object} user - User object from Redux state
 * @returns {boolean} - Whether user is authenticated
 */
export const isAuthenticated = (user) => {
  return user && user._id;
};

/**
 * Gets user display name
 * @param {Object} user - User object
 * @returns {string} - User's display name
 */
export const getUserDisplayName = (user) => {
  if (!user) return "User";
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }
  if (user.firstName) return user.firstName;
  if (user.emailId) return user.emailId;
  return "User";
};
