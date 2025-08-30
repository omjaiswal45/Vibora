import React, { useState } from "react";
import { Send, X, UserPlus } from "lucide-react";
import axiosInstance from "../api/axiosInstance";
import toast from "react-hot-toast";
import ImageUpload from "./ImageUpload";

const PostComposer = ({ onPostCreated, onCancel }) => {
  const [content, setContent] = useState("");
  const [selectedImages, setSelectedImages] = useState([]);
  const [taggedUsers, setTaggedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showTagInput, setShowTagInput] = useState(false);
  const [tagInput, setTagInput] = useState("");

  const handleImagesSelected = (files) => {
    setSelectedImages(files);
  };

  const handleSubmit = async () => {
    if (!content.trim() && selectedImages.length === 0) {
      return toast.error("Write something or add an image");
    }

    try {
      setLoading(true);
      
      let imageUrls = [];
      
      // Upload images if any are selected
      if (selectedImages.length > 0) {
        const formData = new FormData();
        selectedImages.forEach((file, index) => {
          formData.append('images', file);
        });

        const uploadResponse = await axiosInstance.post("/post/upload-images", formData, {
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        imageUrls = uploadResponse.data.data.imageUrls;
      }

      // Create post with image URLs
      const postData = {
        content: content.trim(),
        images: imageUrls,
        taggedUsers: taggedUsers
      };

      const response = await axiosInstance.post("/post/create", postData, {
        withCredentials: true,
      });

      toast.success("Post created successfully!");
      setContent("");
      setSelectedImages([]);
      setTaggedUsers([]);
      onPostCreated && onPostCreated(response.data.data);
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error(error?.response?.data || "Could not create post");
    } finally {
      setLoading(false);
    }
  };

  const addTaggedUser = () => {
    if (tagInput.trim() && !taggedUsers.includes(tagInput.trim())) {
      setTaggedUsers(prev => [...prev, tagInput.trim()]);
      setTagInput("");
      setShowTagInput(false);
    }
  };

  const removeTaggedUser = (user) => {
    setTaggedUsers(prev => prev.filter(u => u !== user));
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 p-4 lg:p-6 space-y-4 lg:space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg lg:text-xl font-medium text-gray-900">Create Post</h3>
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-lg"
          >
            <X size={18} className="lg:w-5 lg:h-5" />
          </button>
        )}
      </div>

      {/* Content Input */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyPress={handleKeyPress}
        rows={4}
        placeholder="What's on your mind?"
        className="w-full resize-none outline-none border border-gray-200 rounded-xl p-3 lg:p-4 focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder:text-gray-400 text-sm lg:text-base"
      />

      {/* Tagged Users */}
      {taggedUsers.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {taggedUsers.map((user, index) => (
            <div
              key={index}
              className="flex items-center space-x-1 bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs lg:text-sm"
            >
              <span>@{user}</span>
              <button
                onClick={() => removeTaggedUser(user)}
                className="text-purple-500 hover:text-purple-700 p-1 hover:bg-purple-200 rounded-full transition-colors"
              >
                <X size={12} className="lg:w-3 lg:h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add Tagged User */}
      {showTagInput ? (
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="Enter username to tag"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm lg:text-base"
            onKeyPress={(e) => e.key === "Enter" && addTaggedUser()}
          />
          <div className="flex space-x-2">
            <button
              onClick={addTaggedUser}
              className="px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 text-sm lg:text-base font-medium"
            >
              Add
            </button>
            <button
              onClick={() => {
                setShowTagInput(false);
                setTagInput("");
              }}
              className="px-3 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 text-sm lg:text-base font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowTagInput(true)}
          className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 text-sm lg:text-base font-medium hover:bg-purple-50 px-3 py-2 rounded-xl transition-all duration-200"
        >
          <UserPlus size={16} className="lg:w-5 lg:h-5" />
          <span>Tag People</span>
        </button>
      )}

      {/* Image Upload Component */}
      <ImageUpload onImagesSelected={handleImagesSelected} maxImages={5} />

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-4 border-t border-gray-200 space-y-3 sm:space-y-0">
        <div className="text-sm text-gray-500">
          {selectedImages.length > 0 && (
            <span>{selectedImages.length} image(s) selected</span>
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading || (!content.trim() && selectedImages.length === 0)}
          className={`inline-flex items-center gap-2 px-6 py-3 lg:px-8 lg:py-4 rounded-xl text-white transition-all duration-200 font-medium text-sm lg:text-base ${
            loading || (!content.trim() && selectedImages.length === 0)
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 shadow-lg hover:shadow-xl transform hover:scale-105"
          }`}
        >
          <Send size={16} className="lg:w-5 lg:h-5" />
          {loading ? "Posting..." : "Post"}
        </button>
      </div>
    </div>
  );
};

export default PostComposer;