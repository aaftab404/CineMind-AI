
import { Link, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useTheme } from "../Context/ThemeContext";
import { useAuth } from "../Context/AuthContext";

import {
  Sun,
  Moon,
  Clapperboard,
  UserRound,
  LogOut,
  Settings,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";

const Navbar = ({
  className,
  isSidebarOpen,
  setIsSidebarOpen,
  showSidebarToggle = false,
}) => {
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const profileMenuRef = useRef(null);

  // Close dropdown when clicking outside or pressing Escape
  useEffect(() => {
    if (!profileMenuOpen) return;

    const handleClickOutside = (event) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setProfileMenuOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [profileMenuOpen]);

  const handleLogout = () => {
    setProfileMenuOpen(false);
    logout();
    navigate("/login");
  };

  return (
    <nav
      className={`
        h-16 pr-3 md:px-8 w-full
        flex items-center sm:gap-4 justify-between
        bg-white dark:bg-gray-900
        text-gray-900 dark:text-white
        border-b border-gray-200 dark:border-gray-800
        transition-colors duration-300
        ${className || ""}
      `}
    >
      <div className="flex">
      {/* Mobile Menu Button */}
      {showSidebarToggle && (
        <button
          onClick={() => setIsSidebarOpen((prev) => !prev)}
          className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 md:hidden"
          aria-label="Toggle sidebar"
          type="button"
        >
          {isSidebarOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      )}

      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 shrink-0">
        <div className="bg-violet-600 p-2 rounded-lg">
          <Clapperboard size={21} className="text-white" />
        </div>

        <h1 className="text-xl font-bold sm:text-xl">
          Cine<span className="text-violet-600">Mind</span>
        </h1>
      </Link>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
      <div className="flex">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          title="Toggle theme"
          type="button"
        >
          {theme === "light" ? (
            <Moon size={20} />
          ) : (
            <Sun size={20} />
          )}
        </button>
        </div>
          


        {/* Authentication */}
        {isAuthenticated ? (
          <div className="relative" ref={profileMenuRef}>
            {/* Profile Button */}
            <button
              onClick={() => setProfileMenuOpen((prev) => !prev)}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              type="button"
            >
              {user.profileImage ? (
                <img
                  src={user.profileImage}
                  alt="Profile"
                  className="w-9 h-9 rounded-full object-cover"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-violet-600 flex items-center justify-center text-white font-semibold">
                  {user.name?.charAt(0).toUpperCase() || "U"}
                </div>
              )}

              <span className="text-sm font-medium hidden sm:block">
                {user.name}
              </span>

              <ChevronDown
                size={16}
                className={`transition-transform ${
                  profileMenuOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {profileMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden z-50">
                {/* User Info */}
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-semibold truncate">
                    {user.name}
                  </p>

                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {user.email}
                  </p>
                </div>

                {/* Profile Option */}
                <button
                  onClick={() => {
                    setProfileMenuOpen(false);
                    navigate("/profile");
                  }}
                  className="flex items-center gap-3 w-full px-4 py-3 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  type="button"
                >
                  <Settings size={17} />
                  Change Profile
                </button>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  type="button"
                >
                  <LogOut size={17} />
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link
            to="/login"
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <UserRound size={17} />
            Login
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
