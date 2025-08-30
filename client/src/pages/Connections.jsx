import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axiosInstance from "../api/axiosInstance";
import { User, Users, UserPlus, UserCheck, UserX, Clock, Check, X } from "lucide-react";
import toast from "react-hot-toast";

function Connections() {
  const [activeTab, setActiveTab] = useState("friends");
  const [friends, setFriends] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({});
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    fetchStats();
    if (activeTab === "friends") {
      fetchFriends();
    } else if (activeTab === "received") {
      fetchReceivedRequests();
    } else if (activeTab === "sent") {
      fetchSentRequests();
    }
  }, [activeTab]);

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

  const fetchFriends = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/connection/friends", {
        withCredentials: true,
      });
      setFriends(response.data.data);
    } catch (error) {
      console.error("Error fetching friends:", error);
      toast.error("Failed to load friends");
    } finally {
      setLoading(false);
    }
  };

  const fetchReceivedRequests = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/connection/requests/received", {
        withCredentials: true,
      });
      setReceivedRequests(response.data.data);
    } catch (error) {
      console.error("Error fetching received requests:", error);
      toast.error("Failed to load received requests");
    } finally {
      setLoading(false);
    }
  };

  const fetchSentRequests = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/connection/requests/sent", {
        withCredentials: true,
      });
      setSentRequests(response.data.data);
    } catch (error) {
      console.error("Error fetching sent requests:", error);
      toast.error("Failed to load sent requests");
    } finally {
      setLoading(false);
    }
  };

  const handleConnectionRequest = async (userId, action) => {
    try {
      if (action === "accept") {
        await axiosInstance.patch(`/connection/accept/${userId}`, {}, {
          withCredentials: true,
        });
        toast.success("Connection request accepted!");
      } else if (action === "reject") {
        await axiosInstance.patch(`/connection/reject/${userId}`, {}, {
          withCredentials: true,
        });
        toast.success("Connection request rejected!");
      } else if (action === "cancel") {
        await axiosInstance.delete(`/connection/cancel/${userId}`, {
          withCredentials: true,
        });
        toast.success("Connection request cancelled!");
      } else if (action === "remove") {
        await axiosInstance.delete(`/connection/remove/${userId}`, {
          withCredentials: true,
        });
        toast.success("Friend removed!");
      }

      // Refresh data
      fetchStats();
      if (activeTab === "friends") {
        fetchFriends();
      } else if (activeTab === "received") {
        fetchReceivedRequests();
      } else if (activeTab === "sent") {
        fetchSentRequests();
      }
    } catch (error) {
      console.error("Error handling connection request:", error);
      toast.error("Failed to process request");
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  };

  const renderFriends = () => (
    <div className="space-y-4">
      {friends.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Users size={48} className="mx-auto mb-2 text-gray-300" />
          <p>No friends yet</p>
          <p className="text-sm">Start connecting with people!</p>
        </div>
      ) : (
        friends.map((friendData) => (
          <div key={friendData.connectionId} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <User size={24} className="text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">
                    {friendData.friend.firstName} {friendData.friend.lastName}
                  </h3>
                  <p className="text-sm text-gray-500">{friendData.friend.emailId}</p>
                  <p className="text-xs text-gray-400">
                    Connected since {formatDate(friendData.connectedAt)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleConnectionRequest(friendData.friend._id, "remove")}
                className="px-3 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );

  const renderReceivedRequests = () => (
    <div className="space-y-4">
      {receivedRequests.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <UserPlus size={48} className="mx-auto mb-2 text-gray-300" />
          <p>No pending requests</p>
          <p className="text-sm">You're all caught up!</p>
        </div>
      ) : (
        receivedRequests.map((request) => (
          <div key={request._id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <User size={24} className="text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">
                    {request.fromUserId.firstName} {request.fromUserId.lastName}
                  </h3>
                  <p className="text-sm text-gray-500">{request.fromUserId.emailId}</p>
                  <p className="text-xs text-gray-400">
                    Sent {formatDate(request.createdAt)}
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleConnectionRequest(request.fromUserId._id, "accept")}
                  className="px-3 py-1 text-sm bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors flex items-center space-x-1"
                >
                  <Check size={14} />
                  <span>Accept</span>
                </button>
                <button
                  onClick={() => handleConnectionRequest(request.fromUserId._id, "reject")}
                  className="px-3 py-1 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors flex items-center space-x-1"
                >
                  <X size={14} />
                  <span>Reject</span>
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );

  const renderSentRequests = () => (
    <div className="space-y-4">
      {sentRequests.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Clock size={48} className="mx-auto mb-2 text-gray-300" />
          <p>No sent requests</p>
          <p className="text-sm">You haven't sent any connection requests yet</p>
        </div>
      ) : (
        sentRequests.map((request) => (
          <div key={request._id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <User size={24} className="text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">
                    {request.toUserId.firstName} {request.toUserId.lastName}
                  </h3>
                  <p className="text-sm text-gray-500">{request.toUserId.emailId}</p>
                  <p className="text-xs text-gray-400">
                    Sent {formatDate(request.createdAt)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleConnectionRequest(request.toUserId._id, "cancel")}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Connections</h1>
        
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <Users size={24} className="mx-auto mb-2 text-blue-600" />
            <p className="text-2xl font-bold text-blue-600">{stats.totalFriends || 0}</p>
            <p className="text-sm text-gray-600">Friends</p>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <UserPlus size={24} className="mx-auto mb-2 text-yellow-600" />
            <p className="text-2xl font-bold text-yellow-600">{stats.pendingReceived || 0}</p>
            <p className="text-sm text-gray-600">Received</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <Clock size={24} className="mx-auto mb-2 text-purple-600" />
            <p className="text-2xl font-bold text-purple-600">{stats.pendingSent || 0}</p>
            <p className="text-sm text-gray-600">Sent</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <UserX size={24} className="mx-auto mb-2 text-gray-600" />
            <p className="text-2xl font-bold text-gray-600">{stats.rejected || 0}</p>
            <p className="text-sm text-gray-600">Rejected</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab("friends")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "friends"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Friends ({stats.totalFriends || 0})
            </button>
            <button
              onClick={() => setActiveTab("received")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "received"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Received ({stats.pendingReceived || 0})
            </button>
            <button
              onClick={() => setActiveTab("sent")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "sent"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Sent ({stats.pendingSent || 0})
            </button>
          </nav>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-500">Loading...</div>
            </div>
          ) : (
            <>
              {activeTab === "friends" && renderFriends()}
              {activeTab === "received" && renderReceivedRequests()}
              {activeTab === "sent" && renderSentRequests()}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Connections;

