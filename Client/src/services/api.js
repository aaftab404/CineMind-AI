
export const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"
).replace(/\/$/, "");

let refreshPromise = null;

// Refresh the access token
const refreshAccessToken = async () => {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
          const response = await fetch(`${API_BASE_URL}/auth/refresh`, {          method: "POST",
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Session expired");
        }

        const data = await response.json();

        localStorage.setItem("token", data.token);

        return data.token;
      } catch (error) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        window.dispatchEvent(new Event("auth:logout"));

        throw error;
      } finally {
        refreshPromise = null;
      }
    })();
  }

  return refreshPromise;
};

// API request handler with automatic token refresh
export const apiFetch = async (endpoint, options = {}) => {
  const makeRequest = (token) => {
    const headers = new Headers(options.headers || {});

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    return fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      credentials: "include",
    });
  };

  const token = localStorage.getItem("token");

  let response = await makeRequest(token);

  // If token expired, refresh it and retry once
  if (response.status === 401 && !endpoint.includes("/auth/refresh")) {
    try {
      const newToken = await refreshAccessToken();

      response = await makeRequest(newToken);
    } catch {
      throw new Error("Session expired. Please login again.");
    }
  }

  return response;
};
