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
      await axiosInstance.post(`/connection/request/${user._id}`, {}, { withCredentials: true });
      toast.success(`Connection request sent to ${user.firstName} ${user.lastName}`);
      setRequestSent(true);
      onRequestSent && onRequestSent(user._id);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to send request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 hover:border-purple-200 flex flex-col items-center space-y-3 w-64">
      
      {/* Avatar */}
      <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-md">
        <User size={24} className="text-white" />
      </div>

      {/* User Info */}
      <div className="text-center space-y-1">
        <h4 className="font-bold text-gray-900 text-base truncate">
          {user.firstName} {user.lastName}
        </h4>
        <p className="text-xs text-gray-600 truncate">{user.emailId}</p>
        {user.age && (
          <p className="text-xs text-gray-500">
            {user.age} yrs • {user.gender || "Not specified"}
          </p>
        )}
      </div>

      {/* About */}
      {user.about && (
        <p className="text-xs text-gray-600 text-center p-2 bg-gradient-to-r from-purple-50/50 to-pink-50/50 rounded-lg border-l-4 border-purple-300 w-full">
          {user.about}
        </p>
      )}

      {/* Connect Button */}
      <div className="flex w-full">
        {!requestSent ? (
          <button
            onClick={handleAddFriend}
            disabled={loading}
            className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs rounded-xl transition-all duration-200 disabled:opacity-50 shadow hover:shadow-md hover:scale-105"
          >
            {loading ? (
              <>
                <Clock size={12} className="animate-spin" />
                <span>Sending...</span>
              </>
            ) : (
              <>
                <UserPlus size={12} />
                <span>Connect</span>
              </>
            )}
          </button>
        ) : (
          <div className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white text-xs rounded-xl shadow font-medium">
            <Check size={12} />
            <span>Request Sent</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserCard;
