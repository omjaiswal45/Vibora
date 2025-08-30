import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axiosInstance from "../api/axiosInstance";
import { addUser } from "../features/auth/authSlice";

const Signup = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [emailId, setEmailId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSignUp = async () => {
    if (!firstName || !lastName || !emailId || !password) {
      toast.error("Please fill all fields");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await axiosInstance.post("/signup", {
        firstName,
        lastName,
        emailId,
        password,
      });
      dispatch(addUser(res.data.data));
      toast.success("Account created successfully!");
      navigate("/");
    } catch (err) {
      toast.error(err?.response?.data || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 px-4 py-8">
      <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl max-w-md w-full p-6 lg:p-8">
        <div className="text-center mb-6 lg:mb-8">
          <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-white font-bold text-2xl lg:text-3xl">V</span>
          </div>
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2">Vibora</h2>
          <p className="text-gray-700 text-sm lg:text-base">Sign up to see photos and videos from your friends.</p>
        </div>

        <div className="space-y-4 lg:space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="First Name"
              className="w-full px-4 py-3 lg:px-5 lg:py-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200 text-sm lg:text-base"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
            <input
              type="text"
              placeholder="Last Name"
              className="w-full px-4 py-3 lg:px-5 lg:py-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200 text-sm lg:text-base"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
          
          <input
            type="email"
            placeholder="Email ID"
            className="w-full px-4 py-3 lg:px-5 lg:py-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200 text-sm lg:text-base"
            value={emailId}
            onChange={(e) => setEmailId(e.target.value)}
          />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="password"
              placeholder="Password"
              className="w-full px-4 py-3 lg:px-5 lg:py-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200 text-sm lg:text-base"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <input
              type="password"
              placeholder="Confirm Password"
              className="w-full px-4 py-3 lg:px-5 lg:py-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200 text-sm lg:text-base"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <button
            onClick={handleSignUp}
            disabled={loading}
            className="w-full py-3 lg:py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 font-medium text-sm lg:text-base shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>

          <div className="text-center">
            <p className="text-gray-600 text-sm lg:text-base">
              Already have an account?{" "}
              <button
                onClick={() => navigate("/login")}
                className="text-purple-600 hover:text-purple-700 font-medium hover:underline transition-colors duration-200"
              >
                Log in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
