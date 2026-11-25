import { loginUser as loginApi } from "../services/authService";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import {
  Clapperboard,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
} from "lucide-react";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setError("");
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");

  try {
    setLoading(true);

    const data = await loginApi(
      formData.email,
      formData.password
    );

    login(data.token, data.user);
    navigate("/");
  } catch (error) {
    setError(error.message || "Something went wrong.");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center px-3 sm:px-5 py-6 sm:py-10 bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <div className="w-full max-w-md sm:max-w-lg">

        {/* Logo */}
        <Link
          to="/"
          className="flex items-center justify-center gap-2 mb-4"
        >
          <div className="bg-violet-600 p-2 sm:p-2.5 rounded-xl">
            <Clapperboard size={22} className="text-white sm:w-[25px] sm:h-[25px]" />
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            Cine<span className="text-violet-600">Mind</span>
          </h1>
        </Link>

        {/* Login Card */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 sm:p-6 md:px-9 md:py-7 shadow-sm">

          {/* Heading */}
          <div className="text-center mb-5">
            <div className="flex justify-center mb-3 sm:mb-4">
              <div className="bg-violet-100 dark:bg-violet-500/10 p-3 rounded-full">
                <Sparkles size={23} className="text-violet-600" />
              </div>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              Welcome Back!
            </h2>

            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2">
              Sign in to continue your movie discovery journey.
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>

              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Password
                </label>

                <Link
                  to="/forgot-password"
                  className="text-xs text-violet-600 hover:text-violet-700 font-medium shrink-0"
                >
                  Forgot password?
                </Link>
              </div>

              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                  className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-violet-600"
                >
                  {showPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="remember"
                className="accent-violet-600 w-4 h-4"
              />

              <label
                htmlFor="remember"
                className="text-sm text-gray-600 dark:text-gray-400"
              >
                Remember me
              </label>
            </div>

            {/* Error Message */}
            {error && (
              <p className="text-sm text-red-500 break-words">
                {error}
              </p>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold transition duration-200 shadow-lg shadow-violet-600/20"
            >
              {loading ? "Signing In..." : "Sign In"}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          {/* Register Link */}
          <p className="text-center text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-5 sm:mt-7">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-violet-600 hover:text-violet-700 font-semibold"
            >
              Create Account
            </Link>
          </p>
        </div>

        {/* Back to Home */}
        <Link
          to="/"
          className="block text-center text-sm text-gray-500 dark:text-gray-400 hover:text-violet-600 mt-5 sm:mt-6 transition"
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}

export default Login;
