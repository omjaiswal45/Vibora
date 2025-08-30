import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import toast from "react-hot-toast";
import Loader from "../components/common/Loader";
import PostCard from "../components/PostCard";

const MyPosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(5); // Posts per page
  const [totalPages, setTotalPages] = useState(1);

  // New post form
  const [newPost, setNewPost] = useState({ content: "", images: [] });
  const [uploading, setUploading] = useState(false);

  // Fetch my posts with pagination
  const fetchPosts = async (pageNumber = 1) => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/post/my?page=${pageNumber}&limit=${limit}`, {
        withCredentials: true,
      });
      if (pageNumber === 1) setPosts(res.data.data);
      else setPosts((prev) => [...prev, ...res.data.data]);
      setTotalPages(Math.ceil(res.data.pagination.total / limit));
      setPage(res.data.pagination.page);
    } catch (err) {
      toast.error(err?.response?.data || "Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // Handle form input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPost((prev) => ({ ...prev, [name]: value }));
  };

  // Upload image to Cloudinary
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "YOUR_CLOUDINARY_PRESET"); // Change to your preset
    setUploading(true);
    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setNewPost((prev) => ({ ...prev, images: [...prev.images, data.secure_url] }));
      toast.success("Image uploaded!");
    } catch (err) {
      toast.error("Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  // Create a new post
  const handleCreatePost = async () => {
    if (!newPost.content && newPost.images.length === 0) {
      toast.error("Add content or image to post");
      return;
    }
    try {
      const res = await axiosInstance.post("/post/create", newPost, { withCredentials: true });
      setPosts((prev) => [res.data.data, ...prev]);
      setNewPost({ content: "", images: [] });
      toast.success("Post created!");
    } catch (err) {
      toast.error(err?.response?.data || "Failed to create post");
    }
  };

  // Delete a post
  const handleDeletePost = async (postId) => {
    try {
      await axiosInstance.delete(`/post/delete/${postId}`, { withCredentials: true });
      setPosts((prev) => prev.filter((p) => p._id !== postId));
      toast.success("Post deleted!");
    } catch (err) {
      toast.error(err?.response?.data || "Delete failed");
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      {/* Create Post */}
      <div className="bg-white p-4 rounded shadow space-y-2">
        <textarea
          name="content"
          value={newPost.content}
          onChange={handleInputChange}
          placeholder="What's on your mind?"
          className="w-full p-2 border rounded"
        />
        <div className="flex items-center space-x-2">
          <label className="cursor-pointer text-blue-600 hover:underline">
            {uploading ? "Uploading..." : "Upload Image"}
            <input type="file" onChange={handleImageUpload} className="hidden" />
          </label>
          <button onClick={handleCreatePost} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Post
          </button>
        </div>
        {newPost.images.length > 0 && (
          <div className="flex space-x-2 overflow-x-auto mt-2">
            {newPost.images.map((img, idx) => (
              <img key={idx} src={img} alt="preview" className="w-24 h-24 object-cover rounded" />
            ))}
          </div>
        )}
      </div>

      {/* Posts List */}
      {posts.length ? (
        posts.map((post) => (
          <PostCard key={post._id} post={post} onDelete={handleDeletePost} />
        ))
      ) : (
        <p className="text-center text-gray-500">No posts yet</p>
      )}

      {/* Load more button */}
      {page < totalPages && (
        <div className="text-center mt-4">
          <button
            onClick={() => fetchPosts(page + 1)}
            className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
};

export default MyPosts;
