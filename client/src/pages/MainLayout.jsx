import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Outlet } from "react-router-dom";
import { Menu, X } from "lucide-react";
import axiosInstance from "../api/axiosInstance";
import { addUser } from "../features/auth/authSlice";
import Sidebar from "../components/Sidebar";
import Rightbar from "../components/Rightbar";

function MainLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [rightbarOpen, setRightbarOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      if (user) return; // already in Redux

      try {
        const res = await axiosInstance.get("/profile", {
          withCredentials: true, // important for cookie-based session
        });
        dispatch(addUser(res.data.data));
      } catch (err) {
        console.error(err);
        navigate("/login"); // session invalid → go to login
      }
    };

    fetchUser();
  }, [user, dispatch, navigate]);

  // Show loading while fetching user
  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-white font-bold text-2xl">V</span>
          </div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      {/* Left Sidebar - Fixed */}
      <div className="w-1/5 shadow-xl bg-gradient-to-b from-purple-50 via-pink-50 to-orange-50 overflow-hidden">
        <Sidebar />
      </div>

      {/* Main Content - Scrollable (no scrollbar visible) */}
      <div className="flex-1 overflow-hidden bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
        <div className="h-full overflow-y-auto scrollbar-hide">
          <Outlet /> {/* Feed, Profile, etc. */}
        </div>
      </div>

      {/* Right Sidebar - Fixed */}
      <div className="w-1/4 p-6 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 overflow-y-auto scrollbar-hide">
        <Rightbar />
      </div>
    </div>
  );
}

export default MainLayout;
