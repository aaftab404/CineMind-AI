
import { API_BASE_URL } from "./api.js";

const API_URL = `${API_BASE_URL}/auth`;

export const loginUser = async (email, password) => {
    const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Login failed");
    }

    return data;
};

export const registerUser = async (name, email, password) => {
    const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ name, email, password })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Registration failed");
    }

    return data;
};

export const refreshAccessToken = async () => {
    const response = await fetch(`${API_URL}/refresh`, {
        method: "POST",
        credentials: "include"
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Token refresh failed");
    }

    return data;
};

export const logoutUser = async () => {
    const response = await fetch(`${API_URL}/logout`, {
        method: "POST",
        credentials: "include"
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Logout failed");
    }

    return data;
};
