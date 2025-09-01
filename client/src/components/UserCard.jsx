import { useState } from "react";
import axiosInstance from "../api/axiosInstance";
import toast from "react-hot-toast";
import { User, UserPlus, Check, Clock } from "lucide-react";

function UserCard({ user, onRequestSent }) {
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

  return (
    <div className="bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 w-60 flex flex-col items-center">
      {/* User logo */}
      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg mb-3">
        <User size={24} className="text-white" />
      </div>

      {/* Name */}
      <h4 className="font-semibold text-gray-900 text-center mb-3 truncate">
        {user.firstName} {user.lastName}
      </h4>

      {/* Connect button */}
      {!requestSent ? (
        <button
          onClick={handleAddFriend}
          disabled={loading}
          className="flex items-center justify-center space-x-2 w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl shadow-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Clock size={16} className="animate-spin" />
              <span>Sending...</span>
            </>
          ) : (
            <>
              <UserPlus size={16} />
              <span>Connect</span>
            </>
          )}
        </button>
      ) : (
        <div className="flex items-center justify-center space-x-2 w-full px-4 py-2 bg-green-500 text-white rounded-xl shadow-md font-medium">
          <Check size={16} />
          <span>Request Sent</span>
        </div>
      )}
    </div>
  );
}

export default UserCard;
