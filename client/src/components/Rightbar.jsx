import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import UserCard from "./UserCard";
import axiosInstance from "../api/axiosInstance";
import toast from "react-hot-toast";
import { Users, Bell, TrendingUp, UserPlus, X } from "lucide-react";

function Rightbar({ onClose }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [recentActivity, setRecentActivity] = useState([]);
  const [suggestionsPage, setSuggestionsPage] = useState(1);
  const [suggestionsLimit] = useState(5);
  const [hasMoreSuggestions, setHasMoreSuggestions] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const user = useSelector((state) => state.auth.user);

  const fetchSuggestions = async (page = 1, append = false) => {
    if (page === 1) setLoading(true);
    try {
      // Get users who are not connected yet (using the new suggestions API)
      const res = await axiosInstance.get("/feed/users/suggestions", {
        params: { 
          page: page, 
          limit: suggestionsLimit 
        },
        withCredentials: true,
      });
      
      if (append) {
        setUsers(prev => [...prev, ...res.data.data]);
      } else {
        setUsers(res.data.data || []);
      }
      
      // Check if there are more suggestions
      setHasMoreSuggestions(page < (res.data.pagination?.pages || 1));
      setSuggestionsPage(page);
    } catch (e) {
      console.error("Error fetching suggestions:", e);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axiosInstance.get("/connection/stats", {
        withCredentials: true,
      });
      setStats(response.data.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      // Get recent posts from feed
      const response = await axiosInstance.get("/feed", {
        params: { page: 1, limit: 3 },
        withCredentials: true,
      });
      setRecentActivity(response.data.data || []);
    } catch (error) {
      console.error("Error fetching recent activity:", error);
    }
  };

  const handleConnectionRequest = async (userId) => {
    setUsers((prev) => prev.filter((u) => u._id !== userId));
  };

  const loadMoreSuggestions = async () => {
    if (loadingMore || !hasMoreSuggestions) return;
    setLoadingMore(true);
    await fetchSuggestions(suggestionsPage + 1, true);
  };

  useEffect(() => {
    fetchSuggestions(1, false);
    fetchStats();
    fetchRecentActivity();
  }, []);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="h-full space-y-6 overflow-y-auto scrollbar-hide">
      {/* Header with close button for mobile */}
      <div className="lg:hidden flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-800">Quick Actions</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <X size={20} className="text-gray-600" />
          </button>
        )}
      </div>

      {/* Connection Stats */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-6">
        <h2 className="font-bold text-xl mb-6 flex items-center space-x-3 text-gray-800">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <Users size={20} className="text-white" />
          </div>
          <span>Your Network</span>
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-100">
            <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {stats.totalFriends || 0}
            </p>
            <p className="text-sm font-medium text-purple-600">Friends</p>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-pink-50 rounded-xl border border-orange-100">
            <p className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
              {stats.pendingReceived || 0}
            </p>
            <p className="text-sm font-medium text-orange-600">Requests</p>
          </div>
        </div>
      </div>

      {/* People You May Know */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-6">
        <h2 className="font-bold text-xl mb-6 flex items-center space-x-3 text-gray-800">
          <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
            <UserPlus size={20} className="text-white" />
          </div>
          <span>People You May Know</span>
        </h2>
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gradient-to-r from-purple-200 to-pink-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gradient-to-r from-purple-200 to-pink-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : users.length > 0 ? (
          <div className="space-y-4">
            {users.map((user) => (
              <UserCard key={user._id} user={user} onRequestSent={handleConnectionRequest} />
            ))}
            {hasMoreSuggestions && (
              <button 
                onClick={loadMoreSuggestions}
                disabled={loadingMore}
                className="w-full text-center text-purple-600 hover:text-purple-700 text-sm py-3 hover:bg-purple-50 rounded-xl transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingMore ? "Loading..." : "Show More"}
              </button>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserPlus size={24} className="text-purple-600" />
            </div>
            <p className="text-gray-500 font-medium">No suggestions available</p>
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-6">
        <h2 className="font-bold text-xl mb-6 flex items-center space-x-3 text-gray-800">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
            <TrendingUp size={20} className="text-white" />
          </div>
          <span>Recent Activity</span>
        </h2>
        {recentActivity.length > 0 ? (
          <div className="space-y-4">
            {recentActivity.map((post) => (
              <div key={post._id} className="border-l-4 border-gradient-to-b from-purple-500 to-pink-500 pl-4 py-3 bg-gradient-to-r from-purple-50/50 to-pink-50/50 rounded-r-xl">
                <p className="text-sm text-gray-700 leading-relaxed">
                  <span className="font-semibold text-gray-900">
                    {post.userId?.firstName} {post.userId?.lastName}
                  </span>{" "}
                  posted: {post.content}
                </p>
                <p className="text-xs text-purple-600 font-medium mt-2">
                  {formatTime(post.createdAt)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-200 to-purple-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp size={24} className="text-blue-600" />
            </div>
            <p className="text-gray-500 font-medium">No recent activity</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-6">
        <h2 className="font-bold text-xl mb-6 flex items-center space-x-3 text-gray-800">
          <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
            <Bell size={20} className="text-white" />
          </div>
          <span>Quick Actions</span>
        </h2>
        <div className="space-y-3">
          <button className="w-full text-left p-4 rounded-xl hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-200 border border-transparent hover:border-purple-200">
            <span className="font-semibold text-gray-900">View All Connections</span>
            <p className="text-gray-600 text-sm mt-1">Manage your network</p>
          </button>
          <button className="w-full text-left p-4 rounded-xl hover:bg-gradient-to-r hover:from-green-50 hover:to-blue-50 transition-all duration-200 border border-transparent hover:border-green-200">
            <span className="font-semibold text-gray-900">Search People</span>
            <p className="text-gray-600 text-sm mt-1">Find new connections</p>
          </button>
          <button className="w-full text-left p-4 rounded-xl hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 transition-all duration-200 border border-transparent hover:border-orange-200">
            <span className="font-semibold text-gray-900">Create Post</span>
            <p className="text-gray-600 text-sm mt-1">Share with your network</p>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Rightbar;
