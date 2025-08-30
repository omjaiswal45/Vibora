import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import axiosInstance from "../../api/axiosInstance";

function NotificationBadge({ type = "messages" }) {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (type === "messages") {
      fetchUnreadCount();
    } else if (type === "connections") {
      fetchConnectionRequests();
    }
  }, [type]);

  const fetchUnreadCount = async () => {
    try {
      const response = await axiosInstance.get("/message/unread/count", {
        withCredentials: true,
      });
      setCount(response.data.data.unreadCount || 0);
    } catch (error) {
      console.error("Error fetching unread count:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchConnectionRequests = async () => {
    try {
      const response = await axiosInstance.get("/connection/requests/received", {
        withCredentials: true,
      });
      setCount(response.data.data.length || 0);
    } catch (error) {
      console.error("Error fetching connection requests:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="relative">
        <Bell size={20} className="text-gray-600" />
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-pulse shadow-sm"></div>
      </div>
    );
  }

  if (count === 0) {
    return <Bell size={20} className="text-gray-600" />;
  }

  return (
    <div className="relative">
      <Bell size={20} className="text-gray-600" />
      <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-lg border-2 border-white">
        {count > 99 ? "99+" : count}
      </div>
    </div>
  );
}

export default NotificationBadge;
