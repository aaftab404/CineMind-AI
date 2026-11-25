import { Routes, Route } from "react-router-dom";

import Home from "./Pages/Home";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import Favorites from "./Pages/Favorites";
import Discover from "./Pages/Discover";
import Profile from "./Pages/Profile";
import ResetPassword from "./Pages/ResetPassword";
import ForgotPassword from "./Pages/ForgotPassword";

import ProtectedRoute from "./Components/ProtectedRoute";

function App() {
  return (
    <Routes>
      {/* Home layout stays mounted */}
      <Route path="/" element={<Home />}>
        <Route index element={null} />

        {/* Protected Chat Route */}
        <Route element={<ProtectedRoute />}>
          <Route path="chat/:chatId" element={null} />
        </Route>
      </Route>

      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/discover" element={<Discover />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Other Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/profile" element={<Profile />} />
      </Route>
    </Routes>
  );
}

export default App;
