import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import toast from "react-hot-toast";
import Loader from "../components/common/Loader";
import { logoutUser, addUser } from "../features/auth/authSlice";

const Profile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const authUser = useSelector((state) => state.auth.user);

  const [profile, setProfile] = useState(authUser || null);
  const [loading, setLoading] = useState(!authUser);
  const [editMode, setEditMode] = useState(false);
  const [passwordMode, setPasswordMode] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    emailId: "",
    age: "",
    gender: "",
    about: "",
    photoUrl: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
  });

  const [deletePassword, setDeletePassword] = useState("");

  // Fetch profile from backend
  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/profile", { withCredentials: true });
      setProfile(res.data.data);
      setForm(res.data.data);
      dispatch(addUser(res.data.data)); // update Redux on refresh
    } catch (err) {
      toast.error(err.response?.data || "Failed to fetch profile");
      if (err.response?.status === 401) navigate("/login", { replace: true });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!profile) fetchProfile();
    else setForm(profile);
  }, []);

  if (loading) return <Loader />;

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateProfile = async () => {
    try {
      const allowedFields = [
        "firstName",
        "lastName",
        "emailId",
        "age",
        "about",
        "gender",
        "photoUrl",
      ];
      const payload = {};
      allowedFields.forEach((key) => {
        if (form[key] !== undefined) payload[key] = form[key];
      });

      const res = await axiosInstance.patch("/profile/edit", payload, { withCredentials: true });
      setProfile(res.data.data);
      toast.success(res.data.message);
      setEditMode(false);
      dispatch(addUser(res.data.data)); // update Redux
    } catch (err) {
      toast.error(err.response?.data || "Update failed");
    }
  };

  const handleChangePassword = async () => {
    try {
      const res = await axiosInstance.patch("/profile/password", passwordForm, { withCredentials: true });
      toast.success(res.data.message);
      setPasswordForm({ oldPassword: "", newPassword: "" });
      setPasswordMode(false);
    } catch (err) {
      toast.error(err.response?.data || "Password change failed");
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      toast.error("Please enter your password to confirm");
      return;
    }
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      try {
        await axiosInstance.delete("/profile/delete", { 
          data: { password: deletePassword },
          withCredentials: true 
        });
        toast.success("Account deleted successfully");
        dispatch(logoutUser());
        navigate("/login", { replace: true });
      } catch (err) {
        toast.error(err.response?.data || "Delete failed");
      }
    }
  };

  return (
    <div className="min-h-full bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-gray-200 p-4 lg:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
              Profile
            </h1>
            <p className="text-gray-600 text-sm lg:text-base">Manage your account settings</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setEditMode(!editMode)}
              className="px-4 py-2 lg:px-6 lg:py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm lg:text-base font-medium"
            >
              {editMode ? "Cancel" : "Edit Profile"}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 lg:p-6">
        <div className="max-w-4xl mx-auto space-y-6 lg:space-y-8">
          {/* Profile Header */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-6 lg:p-8">
            <div className="flex flex-col lg:flex-row items-center lg:items-start space-y-6 lg:space-y-0 lg:space-x-8">
              {/* Profile Picture */}
              <div className="relative">
                <div className="w-24 h-24 lg:w-32 lg:h-32 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-3xl lg:text-4xl">
                    {profile?.firstName?.[0] || profile?.lastName?.[0] || "U"}
                  </span>
                </div>
                {editMode && (
                  <button className="absolute bottom-0 right-0 w-8 h-8 lg:w-10 lg:h-10 bg-white rounded-full shadow-lg border-2 border-purple-500 flex items-center justify-center hover:bg-purple-50 transition-all duration-200">
                    <svg className="w-4 h-4 lg:w-5 lg:h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Profile Info */}
              <div className="flex-1 text-center lg:text-left">
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                  {profile?.firstName} {profile?.lastName}
                </h2>
                <p className="text-gray-600 text-sm lg:text-base mb-3">{profile?.emailId}</p>
                {profile?.about && (
                  <p className="text-gray-700 text-sm lg:text-base max-w-2xl">
                    {profile.about}
                  </p>
                )}
                <div className="flex flex-wrap justify-center lg:justify-start gap-4 mt-4">
                  {profile?.age && (
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs lg:text-sm font-medium">
                      {profile.age} years old
                    </span>
                  )}
                  {profile?.gender && (
                    <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-xs lg:text-sm font-medium">
                      {profile.gender}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Profile Form */}
          {editMode && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-6 lg:p-8">
              <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-6">Edit Profile</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                <input
                  type="text"
                  name="firstName"
                  placeholder="First Name"
                  value={form.firstName}
                  onChange={handleFormChange}
                  className="px-4 py-3 lg:px-5 lg:py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-sm lg:text-base"
                />
                <input
                  type="text"
                  name="lastName"
                  placeholder="Last Name"
                  value={form.lastName}
                  onChange={handleFormChange}
                  className="px-4 py-3 lg:px-5 lg:py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-sm lg:text-base"
                />
                <input
                  type="email"
                  name="emailId"
                  placeholder="Email"
                  value={form.emailId}
                  onChange={handleFormChange}
                  className="px-4 py-3 lg:px-5 lg:py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-sm lg:text-base"
                />
                <input
                  type="number"
                  name="age"
                  placeholder="Age"
                  value={form.age}
                  onChange={handleFormChange}
                  className="px-4 py-3 lg:px-5 lg:py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-sm lg:text-base"
                />
                <select
                  name="gender"
                  value={form.gender}
                  onChange={handleFormChange}
                  className="px-4 py-3 lg:px-5 lg:py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-sm lg:text-base"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                <input
                  type="text"
                  name="photoUrl"
                  placeholder="Photo URL"
                  value={form.photoUrl}
                  onChange={handleFormChange}
                  className="px-4 py-3 lg:px-5 lg:py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-sm lg:text-base"
                />
              </div>
              <textarea
                name="about"
                placeholder="About me..."
                value={form.about}
                onChange={handleFormChange}
                rows="4"
                className="w-full mt-4 px-4 py-3 lg:px-5 lg:py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-sm lg:text-base resize-none"
              />
              <div className="flex flex-col sm:flex-row items-center justify-end space-y-3 sm:space-y-0 sm:space-x-4 mt-6">
                <button
                  onClick={() => setEditMode(false)}
                  className="w-full sm:w-auto px-6 py-3 lg:px-8 lg:py-4 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all duration-200 font-medium text-sm lg:text-base"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateProfile}
                  className="w-full sm:w-auto px-6 py-3 lg:px-8 lg:py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium text-sm lg:text-base"
                >
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {/* Password Change */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-6 lg:p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl lg:text-2xl font-bold text-gray-900">Change Password</h3>
              <button
                onClick={() => setPasswordMode(!passwordMode)}
                className="px-4 py-2 lg:px-6 lg:py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm lg:text-base font-medium"
              >
                {passwordMode ? "Cancel" : "Change Password"}
              </button>
            </div>
            
            {passwordMode && (
              <div className="space-y-4 lg:space-y-6">
                <input
                  type="password"
                  name="oldPassword"
                  placeholder="Current Password"
                  value={passwordForm.oldPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-3 lg:px-5 lg:py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-sm lg:text-base"
                />
                <input
                  type="password"
                  name="newPassword"
                  placeholder="New Password"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-3 lg:px-5 lg:py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-sm lg:text-base"
                />
                <div className="flex justify-end">
                  <button
                    onClick={handleChangePassword}
                    className="px-6 py-3 lg:px-8 lg:py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium text-sm lg:text-base"
                  >
                    Update Password
                  </button>
                </div>
              </div>
            )}
          </div>

          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-red-200 p-6 lg:p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl lg:text-2xl font-bold text-red-700">Delete Account</h3>
                <p className="text-red-600 text-sm lg:text-base">Irreversible and destructive actions</p>
              </div>
              <button
                onClick={() => setDeleteMode(!deleteMode)}
                className="px-4 py-2 lg:px-6 lg:py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl hover:from-red-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm lg:text-base font-medium"
              >
                {deleteMode ? "Cancel" : "Delete Account"}
              </button>
            </div>
            
            {deleteMode && (
              <div className="space-y-4 lg:space-y-6">
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-red-700 text-sm lg:text-base">
                    <strong>Warning:</strong> This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
                  </p>
                </div>
                <input
                  type="password"
                  placeholder="Enter your password to confirm"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  className="w-full px-4 py-3 lg:px-5 lg:py-4 border border-red-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 text-sm lg:text-base"
                />
                <div className="flex justify-end">
                  <button
                    onClick={handleDeleteAccount}
                    className="px-6 py-3 lg:px-8 lg:py-4 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl hover:from-red-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium text-sm lg:text-base"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
