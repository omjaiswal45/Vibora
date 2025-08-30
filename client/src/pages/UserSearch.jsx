import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axiosInstance from "../api/axiosInstance";
import { Search, User, UserPlus, Users, Clock } from "lucide-react";
import toast from "react-hot-toast";

function UserSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const user = useSelector((state) => state.auth.user);

  const searchUsers = async (query = searchQuery, pageNum = 1, append = false) => {
    if (!query.trim()) return;

    try {
      setLoading(true);
      const response = await axiosInstance.get(`/feed/users/search`, {
        params: { search: query, page: pageNum, limit: 10 },
        withCredentials: true,
      });

      const newResults = response.data.data;
      
      if (append) {
        setSearchResults(prev => [...prev, ...newResults]);
      } else {
        setSearchResults(newResults);
      }

      setHasMore(newResults.length === 10);
      setPage(pageNum);
      setHasSearched(true);
    } catch (error) {
      console.error("Error searching users:", error);
      toast.error("Failed to search users");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setPage(1);
      searchUsers(searchQuery, 1, false);
    }
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      searchUsers(searchQuery, page + 1, true);
    }
  };

  const sendConnectionRequest = async (userId) => {
    try {
      await axiosInstance.post(`/connection/request/${userId}`, {}, {
        withCredentials: true,
      });
      toast.success("Connection request sent!");
      
      // Update the UI to show request sent
      setSearchResults(prev => 
        prev.map(user => 
          user._id === userId 
            ? { ...user, connectionStatus: 'pending' }
            : user
        )
      );
    } catch (error) {
      console.error("Error sending connection request:", error);
      if (error.response?.status === 400) {
        toast.error(error.response.data.message || "Failed to send request");
      } else {
        toast.error("Failed to send connection request");
      }
    }
  };

  const blockUser = async (userId) => {
    try {
      await axiosInstance.patch(`/connection/block/${userId}`, {}, {
        withCredentials: true,
      });
      toast.success("User blocked successfully!");
      
      // Remove blocked user from results
      setSearchResults(prev => prev.filter(user => user._id !== userId));
    } catch (error) {
      console.error("Error blocking user:", error);
      toast.error("Failed to block user");
    }
  };

  const formatAge = (age) => {
    if (!age) return "Not specified";
    return `${age} years old`;
  };

  const formatGender = (gender) => {
    if (!gender) return "Not specified";
    return gender.charAt(0).toUpperCase() + gender.slice(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Find People</h1>
        <p className="text-gray-600">Search for people to connect with and expand your network</p>
      </div>

      {/* Search Form */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <form onSubmit={handleSearch} className="flex space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            disabled={!searchQuery.trim() || loading}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </form>
      </div>

      {/* Search Results */}
      {hasSearched && (
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Search Results
              {searchResults.length > 0 && (
                <span className="text-gray-500 font-normal ml-2">
                  ({searchResults.length} people found)
                </span>
              )}
            </h2>
          </div>

          <div className="p-6">
            {loading && page === 1 ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-gray-500">Searching...</div>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users size={48} className="mx-auto mb-2 text-gray-300" />
                <p>No users found</p>
                <p className="text-sm">Try a different search term</p>
              </div>
            ) : (
              <div className="space-y-4">
                {searchResults.map((userResult) => (
                  <div key={userResult._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                          <User size={24} className="text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-gray-900">
                            {userResult.firstName} {userResult.lastName}
                          </h3>
                          <p className="text-gray-600">{userResult.emailId}</p>
                          <div className="flex space-x-4 mt-2 text-sm text-gray-500">
                            <span>{formatAge(userResult.age)}</span>
                            <span>{formatGender(userResult.gender)}</span>
                          </div>
                          {userResult.about && (
                            <p className="text-gray-600 mt-2 text-sm">{userResult.about}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        {userResult.connectionStatus === 'pending' ? (
                          <div className="flex items-center space-x-2 px-3 py-2 text-sm text-yellow-600 bg-yellow-50 rounded-md">
                            <Clock size={16} />
                            <span>Request Sent</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => sendConnectionRequest(userResult._id)}
                            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                          >
                            <UserPlus size={16} />
                            <span>Connect</span>
                          </button>
                        )}
                        
                        <button
                          onClick={() => blockUser(userResult._id)}
                          className="px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                        >
                          Block
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Load More Button */}
                {hasMore && (
                  <div className="text-center pt-4">
                    <button
                      onClick={loadMore}
                      disabled={loading}
                      className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {loading ? "Loading..." : "Load More"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

    
    </div>
  );
}

export default UserSearch;

