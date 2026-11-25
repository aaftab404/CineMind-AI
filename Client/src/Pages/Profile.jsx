import { apiFetch } from "../services/api.js";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import { Camera, ArrowLeft, Save } from "lucide-react";

function Profile() {
    const { user, updateUser } = useAuth();
    const navigate = useNavigate();

    const [name, setName] = useState(user?.name || "");
    const [profileImage, setProfileImage] = useState(
        user?.profileImage || null
    );
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState("");

    const handleImageChange = (e) => {
        const file = e.target.files[0];

        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            setError("Image size must be less than 5MB.");
            e.target.value = "";
            return;
        }

        setError("");

        const reader = new FileReader();

        reader.onload = () => {
            setProfileImage(reader.result);
        };

        reader.readAsDataURL(file);
    };

    const handleSave = async () => {
        if (!name.trim()) {
            setError("Name is required.");
            return;
        }

        try {
            setIsSaving(true);
            setError("");

           const response = await apiFetch("/auth/profile", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: name.trim(),
                    profileImage,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to update profile");
            }

            const updatedUser = {
                ...user,
                ...data.user,
                profileImage: data.user.profile_image,
            };

            updateUser(updatedUser);
            navigate("/");
        } catch (error) {
            console.error("Profile update error:", error);
            setError(error.message || "Something went wrong.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white transition-colors">

            <div className="w-full max-w-3xl mx-auto px-3 sm:px-5 md:px-8 py-4 sm:py-6">

                {/* Back Button */}
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-violet-600 transition-colors mb-4 sm:mb-6"
                >
                    <ArrowLeft size={17} />
                    Back to Home
                </Link>

                {/* Heading */}
                <div className="mb-4 sm:mb-6">
                    <h1 className="text-2xl sm:text-3xl font-bold">
                        Profile Settings
                    </h1>

                    <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mt-2">
                        Manage your account information.
                    </p>
                </div>

                {/* Profile Card */}
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 sm:p-6 md:p-8 shadow-sm">

                    {/* Profile Photo */}
                    <div className="flex flex-col items-center mb-6 sm:mb-8">
                        <div className="relative">

                            {profileImage ? (
                                <img
                                    src={profileImage}
                                    alt="Profile"
                                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-violet-100 dark:border-violet-900"
                                />
                            ) : (
                                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-violet-600 flex items-center justify-center text-white text-3xl sm:text-4xl font-bold">
                                    {name.charAt(0).toUpperCase() || "U"}
                                </div>
                            )}

                            <label
                                htmlFor="profile-upload"
                                className="absolute bottom-0 right-0 p-2 bg-violet-600 hover:bg-violet-700 text-white rounded-full cursor-pointer shadow-md transition-colors"
                                title="Change profile photo"
                            >
                                <Camera size={17} />
                            </label>

                            <input
                                id="profile-upload"
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                            />
                        </div>

                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
                            Upload a profile photo
                        </p>
                    </div>

                    {/* Name */}
                    <div className="mb-5">
                        <label className="block text-sm font-medium mb-2">
                            Full Name
                        </label>

                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-3 sm:px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 outline-none focus:border-violet-500 transition-colors text-sm sm:text-base"
                            placeholder="Enter your name"
                        />
                    </div>

                    {/* Email */}
                    <div className="mb-6 sm:mb-8">
                        <label className="block text-sm font-medium mb-2">
                            Email Address
                        </label>

                        <input
                            type="email"
                            value={user?.email || ""}
                            disabled
                            className="w-full px-3 sm:px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-500 cursor-not-allowed text-sm sm:text-base"
                        />

                        <p className="text-xs text-gray-500 mt-2">
                            Email address cannot be changed.
                        </p>
                    </div>

                    {/* Error */}
                    {error && (
                        <p className="text-red-500 text-sm mb-4 break-words">
                            {error}
                        </p>
                    )}

                    {/* Save Button */}
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center justify-center gap-2 w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-60 disabled:cursor-not-allowed text-white py-3 rounded-xl font-medium transition-colors text-sm sm:text-base"
                    >
                        <Save size={18} />
                        {isSaving ? "Saving..." : "Save Changes"}
                    </button>

                </div>
            </div>
        </div>
    );
}

export default Profile;
