import { useEffect, useState, useRef, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import PostCard from "../components/PostCard";
import PostComposer from "../components/PostComposer";
import toast from "react-hot-toast";
import { addUser } from "../features/auth/authSlice";
import { Plus, RefreshCw } from "lucide-react";

const SkeletonPost = () => (
  <div className="bg-white rounded-lg shadow p-4 animate-pulse space-y-2">
    <div className="h-6 w-1/3 bg-gray-300 rounded"></div>
    <div className="h-4 w-full bg-gray-300 rounded"></div>
    <div className="h-4 w-5/6 bg-gray-300 rounded"></div>
    <div className="h-40 bg-gray-300 rounded"></div>
  </div>
);

const Feed = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userData = useSelector((state) => state.auth.user);

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);
  const [showComposer, setShowComposer] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const loaderRef = useRef();

  // Fetch user profile if not in Redux
  const fetchUser = async () => {
    if (userData) return;
    try {
      const res = await axiosInstance.get("/profile", { withCredentials: true });
      dispatch(addUser(res.data.data));
    } catch (err) {
      if (err?.response?.status === 401) navigate("/login");
      else console.error(err);
    }
  };

  // Fetch posts by page
  const fetchPosts = async (pageNumber = 1, append = true) => {
    if (pageNumber === 1) setLoading(true);
    try {
      const res = await axiosInstance.get(`/feed?page=${pageNumber}&limit=${limit}`, {
        withCredentials: true,
      });
      
      if (append) {
        setPosts((prev) => [...prev, ...res.data.data]);
      } else {
        setPosts(res.data.data);
      }
      
      setTotalPages(res.data.pagination.pages || 1);
      setPage(res.data.pagination.page || 1);
    } catch (err) {
      toast.error(err?.response?.data || "Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  // Refresh feed
  const refreshFeed = async () => {
    setRefreshing(true);
    try {
      await fetchPosts(1, false);
      toast.success("Feed refreshed!");
    } catch (error) {
      console.error("Error refreshing feed:", error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUser();
    fetchPosts(1, false);
  }, []);

  const handleDeletePost = (postId) => {
    setPosts((prev) => prev.filter((p) => p._id !== postId));
  };

  const handlePostCreated = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
    setShowComposer(false);
    toast.success("Post created successfully!");
  };

  const handlePostUpdated = (updatedPost) => {
    setPosts((prev) => 
      prev.map((p) => p._id === updatedPost._id ? updatedPost : p)
    );
  };

  const handlePostLiked = (postId, liked) => {
    setPosts((prev) => 
      prev.map((p) => {
        if (p._id === postId) {
          const likeIndex = p.likes.findIndex(like => like.userId === userData._id);
          if (liked && likeIndex === -1) {
            p.likes.push({ userId: userData._id });
          } else if (!liked && likeIndex !== -1) {
            p.likes.splice(likeIndex, 1);
          }
        }
        return p;
      })
    );
  };

  const handleCommentAdded = (postId, newComment) => {
    setPosts((prev) => 
      prev.map((p) => {
        if (p._id === postId) {
          p.comments.push(newComment);
        }
        return p;
      })
    );
  };

  // Infinite scroll observer
  const handleObserver = useCallback(
    (entries) => {
      const target = entries[0];
      if (target.isIntersecting && page < totalPages && !loading) {
        fetchPosts(page + 1);
      }
    },
    [page, totalPages, loading]
  );

  useEffect(() => {
    const option = { root: null, rootMargin: "20px", threshold: 1.0 };
    const observer = new IntersectionObserver(handleObserver, option);
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => {
      if (loaderRef.current) observer.unobserve(loaderRef.current);
    };
  }, [handleObserver]);

  return (
    <div className="max-w-3xl mx-auto space-y-4 p-6">
      {/* Header with actions */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Home</h1>
          <div className="flex space-x-2">
            <button
              onClick={refreshFeed}
              disabled={refreshing}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
              title="Refresh feed"
            >
              <RefreshCw size={20} className={refreshing ? "animate-spin" : ""} />
            </button>
            <button
              onClick={() => setShowComposer(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              <Plus size={20} />
              <span>Create Post</span>
            </button>
          </div>
        </div>
        
        {/* Quick post composer */}
        {showComposer && (
          <PostComposer
            onPostCreated={handlePostCreated}
            onCancel={() => setShowComposer(false)}
          />
        )}
      </div>

      {/* Posts Container */}
      <div className="space-y-4">
        {posts.length > 0 ? (
          posts.map((post) => (
            <PostCard 
              key={post._id} 
              post={post} 
              onDelete={handleDeletePost}
              onUpdate={handlePostUpdated}
              onLike={handlePostLiked}
              onComment={handleCommentAdded}
            />
          ))
        ) : !loading && (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
            <p className="text-gray-500 mb-4">Be the first to share something with your network!</p>
            <button
              onClick={() => setShowComposer(true)}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              <Plus size={20} />
              <span>Create Your First Post</span>
            </button>
          </div>
        )}

        {/* Skeleton loaders */}
        {loading &&
          Array.from({ length: limit }).map((_, idx) => <SkeletonPost key={idx} />)}

        {/* Invisible loader div for intersection observer */}
        <div ref={loaderRef} className="h-1"></div>

        {page >= totalPages && !loading && posts.length > 0 && (
          <div className="text-center py-4">
            <p className="text-gray-400">You have reached the end of the feed</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Feed;
