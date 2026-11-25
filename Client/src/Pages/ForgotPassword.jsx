
import { useState } from "react";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "../services/api.js";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    try {
      setLoading(true);

      const response = await fetch(
        `${API_BASE_URL}/auth/forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      setSubmittedEmail(email);
      setEmail("");

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800">

        {!submittedEmail ? (
          <>
            <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white">
              Forgot Password?
            </h1>

            <p className="text-sm text-center text-gray-500 dark:text-gray-400 mt-2 mb-6">
              Enter your registered email address and we'll send you a password reset link.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Email Address
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-violet-500"
                  required
                />
              </div>

              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-medium disabled:opacity-50"
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center">

            <div className="text-5xl mb-5">
              📩
            </div>

            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Check Your Email
            </h1>

            <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
              If an account exists for
            </p>

            <p className="text-violet-500 font-medium mt-1 break-all">
              {submittedEmail}
            </p>

            <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
              we've sent a password reset link. Please check your inbox and spam folder.
            </p>

            <button
                type="button"
                onClick={() => setSubmittedEmail("")}
                className="mt-6 text-sm text-violet-500 hover:underline"
                >
                Try another email
                </button>

          </div>
        )}

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
          Remember your password?{" "}
          <Link to="/login" className="text-violet-600 hover:underline">
            Back to Login
          </Link>
        </p>

      </div>
    </div>
  );
}

export default ForgotPassword;
