import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Toaster } from "react-hot-toast";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import MainLayout from "./pages/MainLayout";
import Feed from "./pages/Feed";
import Profile from "./pages/Profile";
import Messages from "./pages/Messages";
import Connections from "./pages/Connections";
import UserSearch from "./pages/UserSearch";
import ToastProvider from "./components/common/ToastProvider";
import ErrorBoundary from "./components/common/ErrorBoundary";

function App() {
  const user = useSelector((state) => state.auth.user);

  return (
    <ErrorBoundary>
      <Router>
        <Toaster position="top-right" reverseOrder={false} />
        <ToastProvider />

        <Routes>
          {/* Public Routes */}
          <Route
            path="/login"
            element={user ? <Navigate to="/" replace /> : <Login />}
          />
          <Route
            path="/signup"
            element={user ? <Navigate to="/" replace /> : <Signup />}
          />

          {/* Protected Routes */}
          <Route path="/*" element={<MainLayout />}>
            <Route index element={<Navigate to="feed" replace />} /> {/* `/` -> `/feed` */}
            <Route path="feed" element={<Feed />} />
            <Route path="profile" element={<Profile />} />
            <Route path="profile/:userId" element={<Profile />} />
            <Route path="messages" element={<Messages />} />
            <Route path="connections" element={<Connections />} />
            <Route path="search" element={<UserSearch />} />
            {/* Add other nested routes here */}
          </Route>
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
