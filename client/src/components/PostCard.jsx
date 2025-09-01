import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Button from "./common/Button";
import axiosInstance from "../api/axiosInstance";
import toast from "react-hot-toast";
import { Heart, MessageCircle, Edit, Trash2, MoreVertical, Send, Clock, User } from "lucide-react";

function PostCard({ post, onDelete, onUpdate, onLike, onComment }) {
  const [loading, setLoading] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [commentLoading, setCommentLoading] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [editContent, setEditContent] = useState(post.content);
  const [localComments, setLocalComments] = useState(post.comments || []);

  const currentUser = useSelector((state) => state.auth.user);
  const isOwnPost = currentUser?._id === post.userId?._id;
  const isLiked = post.likes?.some(
    (like) => like.userId?.toString() === currentUser?._id
  );

  // Sync edit content when post.content updates
  useEffect(() => {
    setEditContent(post.content);
  }, [post.content]);

  // Sync comments if parent updates
  useEffect(() => {
    setLocalComments(post.comments || []);
  }, [post.comments]);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    setLoading(true);
    try {
      await axiosInstance.delete(`/post/delete/${post._id}`, { withCredentials: true });
      toast.success("Post deleted successfully!");
      onDelete && onDelete(post._id);
    } catch (e) {
      toast.error(e?.response?.data || "Failed to delete");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!editContent.trim()) return;
    setLoading(true);
    try {
      const response = await axiosInstance.patch(
        `/post/edit/${post._id}`,
        { content: editContent },
        { withCredentials: true }
      );
      toast.success("Post updated successfully!");
      onUpdate && onUpdate(response.data.data);
      setEditMode(false);
    } catch (e) {
      toast.error(e?.response?.data || "Failed to update");
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    setLikeLoading(true);
    try {
      const response = await axiosInstance.post(
        `/post/like/${post._id}`,
        {},
        { withCredentials: true }
      );
      onLike && onLike(post._id, response.data.liked);
      toast.success(response.data.liked ? "Post liked!" : "Post unliked!");
    } catch (e) {
      toast.error(e?.response?.data || "Failed to like/unlike");
    } finally {
      setLikeLoading(false);
    }
  };

  const handleComment = async () => {
    if (!newComment.trim()) return;
    setCommentLoading(true);
    try {
      const response = await axiosInstance.post(
        `/post/comment/${post._id}`,
        { comment: newComment },
        { withCredentials: true }
      );
      // Update local comments immediately
      setLocalComments((prev) => [...prev, response.data.data]);
      setNewComment("");
      toast.success("Comment added!");
      onComment && onComment(post._id, response.data.data);
    } catch (e) {
      toast.error(e?.response?.data || "Failed to add comment");
    } finally {
      setCommentLoading(false);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
    return date.toLocaleDateString();
  };

  const formatTaggedUsers = (taggedUsers) => {
    if (!taggedUsers || taggedUsers.length === 0) return null;
    return (
      <div className="flex items-center space-x-1 text-sm text-blue-600">
        <span>Tagged:</span>
        {taggedUsers.map((user, idx) => (
          <span key={user._id} className="font-medium">
            {user.firstName} {user.lastName}
            {idx < taggedUsers.length - 1 && ", "}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4 bg-white p-4 rounded-xl shadow-md">
      {/* Post Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg lg:text-xl">
              {post.userId
                ? post.userId.firstName?.[0] || post.userId.lastName?.[0] || "U"
                : "U"}
            </span>
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-gray-900 text-sm lg:text-base">
                {post.userId?.firstName} {post.userId?.lastName}
              </h3>
              {post.userId?.verified && (
                <span className="text-blue-500 text-xs lg:text-sm">✓</span>
              )}
            </div>
            <div className="flex items-center space-x-2 text-gray-500 text-xs lg:text-sm">
              <Clock size={12} className="lg:w-3 lg:h-3" />
              <span>{formatTime(post.createdAt)}</span>
              {post.edited && <span className="text-gray-400">(edited)</span>}
            </div>
          </div>
        </div>

        {/* Options Menu */}
        {isOwnPost && (
          <div className="relative">
            <button
              onClick={() => setShowOptions(!showOptions)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <MoreVertical size={16} className="lg:w-5 lg:h-5 text-gray-600" />
            </button>
            {showOptions && (
              <div className="absolute right-0 top-full mt-2 w-32 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-10">
                <button
                  onClick={() => {
                    setEditMode(true);
                    setShowOptions(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                >
                  <Edit size={14} className="lg:w-4 lg:h-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={handleDelete}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                >
                  <Trash2 size={14} className="lg:w-4 lg:h-4" />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Post Content */}
      <div className="space-y-3">
        {editMode ? (
          <div className="space-y-3">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-sm lg:text-base"
              rows="3"
              placeholder="What's on your mind?"
            />
            <div className="flex items-center space-x-3">
              <button
                onClick={handleEdit}
                disabled={loading || !editContent.trim()}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm lg:text-base"
              >
                {loading ? "Saving..." : "Save"}
              </button>
              <button
                onClick={() => {
                  setEditMode(false);
                  setEditContent(post.content);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all duration-200 text-sm lg:text-base"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-gray-800 text-sm lg:text-base leading-relaxed whitespace-pre-wrap">
              {post.content}
            </p>

            {/* Images */}
            {post.images && post.images.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl overflow-hidden">
                {post.images.slice(0, 4).map((image, idx) => (
                  <div key={idx} className="relative">
                    <img
                      src={image}
                      alt={`Post image ${idx + 1}`}
                      className={`w-full ${
                        idx === 3 ? "h-32" : "h-48"
                      } object-cover hover:scale-105 transition-transform duration-300 cursor-pointer`}
                      onClick={() => window.open(image, "_blank")}
                    />
                    {idx === 3 && post.images.length > 4 && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-xl">
                        <span className="text-white text-lg font-bold">
                          +{post.images.length - 4} more
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {formatTaggedUsers(post.taggedUsers) && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="text-xs lg:text-sm text-gray-500">Tagged:</span>
                {post.taggedUsers.map((user) => (
                  <span
                    key={user._id}
                    className="inline-flex items-center space-x-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs lg:text-sm"
                  >
                    <User size={12} className="lg:w-3 lg:h-3" />
                    <span>{user.firstName} {user.lastName}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Post Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-200">
        <div className="flex items-center space-x-4 lg:space-x-6">
          <button
            onClick={handleLike}
            disabled={likeLoading}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 hover:scale-105 ${
              isLiked
                ? "text-red-500 bg-red-50 hover:bg-red-100"
                : "text-gray-600 hover:text-red-500 hover:bg-red-50"
            }`}
          >
            <Heart size={16} className={`lg:w-5 lg:h-5 ${isLiked ? "text-red-500" : ""}`} />
            <span className="text-sm lg:text-base font-medium">{post.likes?.length || 0}</span>
          </button>

          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all duration-200 hover:scale-105"
          >
            <MessageCircle size={16} className="lg:w-5 lg:h-5" />
            <span className="text-sm lg:text-base font-medium">{localComments.length || 0}</span>
          </button>
        </div>

        <div className="text-xs lg:text-sm text-gray-500">
          {post.views || 0} views
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="space-y-4 pt-4 border-t border-gray-200">
          {/* Add Comment */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
              <span className="text-white font-bold text-sm lg:text-base">
                {currentUser?.firstName?.[0] || currentUser?.lastName?.[0] || "U"}
              </span>
            </div>
            <div className="flex-1 flex items-center space-x-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 p-2 lg:p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm lg:text-base"
              />
              <button
                onClick={handleComment}
                disabled={commentLoading || !newComment.trim()}
                className="p-2 lg:p-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={16} className="lg:w-5 lg:h-5" />
              </button>
            </div>
          </div>

          {/* Comments List */}
          {localComments.length > 0 ? (
            <div className="space-y-3">
              {localComments.map((comment) => (
                <div key={comment._id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-6 h-6 lg:w-8 lg:h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                    <span className="text-white font-bold text-xs lg:text-sm">
                      {comment.userId?.firstName?.[0] || comment.userId?.lastName?.[0] || "U"}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-semibold text-gray-900 text-xs lg:text-sm">
                        {comment.userId?.firstName} {comment.userId?.lastName}
                      </span>
                      <span className="text-gray-500 text-xs">{formatTime(comment.createdAt)}</span>
                    </div>
                    <p className="text-gray-700 text-xs lg:text-sm">{comment.comment}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500 text-sm lg:text-base">
              No comments yet. Be the first to comment!
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default PostCard;
