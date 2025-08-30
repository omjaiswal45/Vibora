import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Home, User, MessageCircle, Users, Search, Settings, LogOut, X } from "lucide-react";
import NotificationBadge from "./common/NotificationBadge";
import { handleLogout } from "../utils/auth";

function Sidebar({ onClose }) {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const isActive = (path) => {
    if (path === "/feed" && location.pathname === "/") return true;
    return location.pathname.startsWith(path);
  };

  const onLogout = () => {

    handleLogout(dispatch, navigate);
  };

  const handleNavClick = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-purple-50 via-pink-50 to-orange-50 border-r border-gray-200 overflow-hidden sidebar-container">
      {/* App Header */}
      <div className="p-4 lg:p-6 border-b border-gray-200 bg-white/80 backdrop-blur-sm flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg lg:text-xl">V</span>
            </div>
            <h1 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
              Vibora
            </h1>
          </div>
          {/* Close button for mobile */}
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <X size={20} className="text-gray-600" />
            </button>
          )}
        </div>
      </div>
      
      {/* Navigation Links */}
      <div className="flex-1 p-3 lg:p-4 space-y-2 overflow-y-auto sidebar-nav">
        <Link 
          to="/feed" 
          onClick={handleNavClick}
          className={`flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 ${
            isActive("/feed") 
              ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg transform scale-105" 
              : "text-gray-700 hover:bg-white/60 hover:shadow-md hover:scale-105"
          }`}
        >
          <Home size={18} className="lg:w-5 lg:h-5" />
          <span className="font-medium text-sm lg:text-base">Home</span>
        </Link>
        
        <Link 
          to="/profile" 
          onClick={handleNavClick}
          className={`flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 ${
            isActive("/profile") 
              ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg transform scale-105" 
              : "text-gray-700 hover:bg-white/60 hover:shadow-md hover:scale-105"
          }`}
        >
          <User size={18} className="lg:w-5 lg:h-5" />
          <span className="font-medium text-sm lg:text-base">Profile</span>
        </Link>
        
        <Link 
          to="/messages" 
          onClick={handleNavClick}
          className={`flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 ${
            isActive("/messages") 
              ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg transform scale-105" 
              : "text-gray-700 hover:bg-white/60 hover:shadow-md hover:scale-105"
          }`}
        >
          <NotificationBadge type="messages" />
          <span className="font-medium text-sm lg:text-base">Messages</span>
        </Link>
        
        <Link 
          to="/connections" 
          onClick={handleNavClick}
          className={`flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 ${
            isActive("/connections") 
              ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg transform scale-105" 
              : "text-gray-700 hover:bg-white/60 hover:shadow-md hover:scale-105"
          }`}
        >
          <NotificationBadge type="connections" />
          <span className="font-medium text-sm lg:text-base">Connections</span>
        </Link>
        
        <Link 
          to="/search" 
          onClick={handleNavClick}
          className={`flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 ${
            isActive("/search") 
              ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg transform scale-105" 
              : "text-gray-700 hover:bg-white/60 hover:shadow-md hover:scale-105"
          }`}
        >
          <Search size={18} className="lg:w-5 lg:h-5" />
          <span className="font-medium text-sm lg:text-base">Find People</span>
        </Link>
      </div>

      {/* Logout Button - Fixed at bottom */}
      <div className="p-3 lg:p-4 border-t border-gray-200 bg-white/80 backdrop-blur-sm flex-shrink-0">
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center space-x-3 p-3 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 text-white font-medium hover:from-red-600 hover:to-pink-600 hover:shadow-lg hover:scale-105 transition-all duration-200 transform text-sm lg:text-base"
        >
          <LogOut size={16} className="lg:w-[18px] lg:h-[18px]" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
