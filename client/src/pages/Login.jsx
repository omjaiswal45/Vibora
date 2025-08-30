import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axiosInstance from "../api/axiosInstance";
import { addUser } from "../features/auth/authSlice";


const Login = () => {
  const [emailId, setEmailId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!emailId || !password) {
      toast.error("Please fill all fields");
      return;
    }

    setLoading(true);
    try {
      const res = await axiosInstance.post("/login", { emailId, password });
      console.log("Login Response:", res.data);
      dispatch(addUser(res.data));
      toast.success("Logged in successfully!");
      navigate("/");
    } catch (err) {
      toast.error(err?.response?.data || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      {/* Left side with image cards */}
      <div className="hidden lg:flex w-full lg:w-1/2 items-center justify-center p-6 lg:p-10">
        <div className="grid grid-cols-2 gap-4 lg:gap-6">
          {/* Card 1 */}
          <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-lg overflow-hidden">
            <img
              src="https://static.drimify.com/wp-content/uploads/2023/02/diverse-teenage-students-using-digital-smart-mobil-2022-12-17-03-40-08-utc-scaled-1200x600.jpg?110924"
              alt="Social"
              className="w-full h-32 lg:h-40 object-cover"
            />
            <div className="p-3 lg:p-4">
              <h3 className="font-semibold text-gray-800 text-sm lg:text-base">Connect with friends</h3>
              <p className="text-xs lg:text-sm text-gray-600">Stay updated with your circle</p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-lg overflow-hidden">
            <img
              src="https://www.shutterstock.com/image-photo/young-biracial-woman-browsing-her-260nw-2433308555.jpg"
              alt="Chat"
              className="w-full h-32 lg:h-40 object-cover"
            />
            <div className="p-3 lg:p-4">
              <h3 className="font-semibold text-gray-800 text-sm lg:text-base">Share your moments</h3>
              <p className="text-xs lg:text-sm text-gray-600">Post updates & photos</p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-lg overflow-hidden col-span-2">
            <img
              src="https://familiesforlife.sg/media/getimage?filepath=Article/fe3effad-9f24-41c8-b0be-f7006ad0caa8/SocialMediaConnection_9b4e8355-643c-43fd-b130-7b56f38f3b7f.jpg"
              alt="Community"
              className="w-full h-32 lg:h-40 object-cover"
            />
            <div className="p-3 lg:p-4">
              <h3 className="font-semibold text-gray-800 text-sm lg:text-base">Join the community</h3>
              <p className="text-xs lg:text-sm text-gray-600">Engage with like-minded people</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side login form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-4 lg:p-8">
        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl max-w-md w-full p-6 lg:p-8">
          <div className="text-center mb-6 lg:mb-8">
            <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-white font-bold text-2xl lg:text-3xl">V</span>
            </div>
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2">
              Welcome Back
            </h2>
            <p className="text-gray-600 text-sm lg:text-base">Login to continue</p>
          </div>

          <div className="space-y-4 lg:space-y-6">
            <input
              type="email"
              placeholder="Email ID"
              className="w-full px-4 py-3 lg:px-5 lg:py-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200 text-sm lg:text-base"
              value={emailId}
              onChange={(e) => setEmailId(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full px-4 py-3 lg:px-5 lg:py-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200 text-sm lg:text-base"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full py-3 lg:py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 font-medium text-sm lg:text-base shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Logging in..." : "Login"}
            </button>

            <div className="text-center">
              <p className="text-gray-600 text-sm lg:text-base">
                Don't have an account?{" "}
                <button
                  onClick={() => navigate("/signup")}
                  className="text-purple-600 hover:text-purple-700 font-medium hover:underline transition-colors duration-200"
                >
                  Sign up
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
