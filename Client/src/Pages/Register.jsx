import { registerUser as registerApi } from "../services/authService";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Clapperboard,
  UserRound,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
} from "lucide-react";

function Register() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setError("");
    setSuccess("");
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  setError("");
  setSuccess("");

  if (formData.password !== formData.confirmPassword) {
    setError("Passwords do not match!");
    return;
  }

  try {
    setLoading(true);

    const data = await registerApi(
      formData.name,
      formData.email,
      formData.password
    );

    setSuccess("Account created successfully! Redirecting to login...");

    setFormData({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    });

    setTimeout(() => {
      navigate("/login");
    }, 1500);

  } catch (error) {
    setError(error.message || "Something went wrong.");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center px-3 sm:px-5 py-5 sm:py-8 bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <div className="w-full max-w-md sm:max-w-lg">

        {/* Logo */}
        <Link
          to="/"
          className="flex items-center justify-center gap-2 mb-4"
        >
          <div className="bg-violet-600 p-2 sm:p-2.5 rounded-xl">
            <Clapperboard
              size={22}
              className="text-white sm:w-[25px] sm:h-[25px]"
            />
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            Cine<span className="text-violet-600">Mind</span>
          </h1>
        </Link>

        {/* Register Card */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 sm:p-6 md:px-9 md:py-7 shadow-sm">

          {/* Heading */}
          <div className="text-center mb-4">
            <div className="flex justify-center mb-3">
              <div className="bg-violet-100 dark:bg-violet-500/10 p-3 rounded-full">
                <Sparkles size={23} className="text-violet-600" />
              </div>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              Create Your Account
            </h2>

            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2">
              Join CineMind and discover your next favourite movie.
            </p>
          </div>

          {/* Register Form */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Full Name
              </label>

              <div className="relative">
                <UserRound
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition"
                />
              </div>
            </div>

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
                  placeholder="you@example.com"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>

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
                  placeholder="Create a password"
                  minLength={6}
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

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirm Password
              </label>

              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  minLength={6}
                  required
                  className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-violet-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <p className="text-sm text-red-500 break-words">
                {error}
              </p>
            )}

            {/* Success Message */}
            {success && (
              <p className="text-sm text-green-600 break-words">
                {success}
              </p>
            )}

            {/* Register Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold transition duration-200 shadow-lg shadow-violet-600/20"
            >
              {loading ? "Creating Account..." : "Create Account"}
              {!loading && <ArrowRight size={18} />}
            </button>

          </form>

          {/* Login Link */}
          <p className="text-center text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-5 sm:mt-7">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-violet-600 hover:text-violet-700 font-semibold"
            >
              Sign In
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

export default Register;
