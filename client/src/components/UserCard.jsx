import { useState } from "react";
import axiosInstance from "../api/axiosInstance";
import toast from "react-hot-toast";
import { User, UserPlus, Check, Clock } from "lucide-react";

function UserCard({ user, onRequestSent, compact = false }) {
  const [loading, setLoading] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  const handleAddFriend = async () => {
    setLoading(true);
    try {
      await axiosInstance.post(`/connection/request/${user._id}`, {}, {
        withCredentials: true,
      });
      toast.success(`Connection request sent to ${user.firstName} ${user.lastName}`);
      setRequestSent(true);
      onRequestSent && onRequestSent(user._id);
    } catch (e) {
      if (e?.response?.status === 400) {
        toast.error(e.response.data.message || "Failed to send request");
      } else {
        toast.error("Failed to send connection request");
      }
    } finally {
      setLoading(false);
    }
  };

  if (compact) {
    return (
      <div className="flex items-center space-x-2 lg:space-x-3 p-2 lg:p-3 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 rounded-xl transition-all duration-200">
        <div className="w-6 h-6 lg:w-8 lg:h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
          <User size={12} className="lg:w-4 lg:h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-xs lg:text-sm text-gray-900 truncate">
            {user.firstName} {user.lastName}
          </p>
          <p className="text-xs text-gray-500 truncate">{user.emailId}</p>
        </div>
        {!requestSent ? (
          <button
            onClick={handleAddFriend}
            disabled={loading}
            className="flex-shrink-0 p-1 lg:p-1.5 text-purple-600 hover:text-purple-700 hover:bg-purple-100 rounded-lg transition-all duration-200 disabled:opacity-50"
            title="Send connection request"
          >
            <UserPlus size={12} className="lg:w-4 lg:h-4" />
          </button>
        ) : (
          <div className="flex-shrink-0 p-1 lg:p-1.5 text-green-600 bg-green-100 rounded-lg" title="Request sent">
            <Check size={12} className="lg:w-4 lg:h-4" />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm p-3 lg:p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 hover:border-purple-200">
      <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
        <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
          <User size={20} className="lg:w-6 lg:h-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-gray-900 truncate text-base lg:text-lg">
            {user.firstName} {user.lastName}
          </h4>
          <p className="text-xs lg:text-sm text-gray-600 truncate">{user.emailId}</p>
          {user.age && (
            <p className="text-xs text-gray-500 mt-1">
              {user.age} years old • {user.gender || "Not specified"}
            </p>
          )}
        </div>
        <div className="flex-shrink-0">
          {!requestSent ? (
            <button
              onClick={handleAddFriend}
              disabled={loading}
              className="flex items-center space-x-2 px-3 py-2 lg:px-4 lg:py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-xs lg:text-sm rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:scale-105 font-medium"
            >
              {loading ? (
                <>
                  <Clock size={12} className="lg:w-3 lg:h-3 animate-spin" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <UserPlus size={12} className="lg:w-3 lg:h-3" />
                  <span>Connect</span>
                </>
              )}
            </button>
          ) : (
            <div className="flex items-center space-x-2 px-3 py-2 lg:px-4 lg:py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white text-xs lg:text-sm rounded-xl shadow-md font-medium">
              <Check size={12} className="lg:w-3 lg:h-3" />
              <span>Request Sent</span>
            </div>
          )}
        </div>
      </div>
      
      {user.about && (
        <p className="text-xs lg:text-sm text-gray-600 mt-3 p-2 lg:p-3 bg-gradient-to-r from-purple-50/50 to-pink-50/50 rounded-lg border-l-4 border-purple-300">
          {user.about}
        </p>
      )}
    </div>
  );
}

export default UserCard;
