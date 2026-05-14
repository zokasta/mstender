import { useEffect, useState } from "react";

import Input from "../../components/elements/Input";

import { FaCamera, FaSave, FaKey } from "react-icons/fa";

import { toast, ToastContainer } from "react-toastify";

import Token from "../../database/Token";

import env from "../../data/env";

export default function Profile() {
  const [user, setUser] = useState(null);

  const [imageFile, setImageFile] = useState(null);

  const [imgPreview, setImgPreview] = useState(null);

  const [loading, setLoading] = useState(false);

  const [passwordLoading, setPasswordLoading] = useState(false);

  const [passwords, setPasswords] = useState({
    current_password: "",
    new_password: "",
    new_password_confirmation: "",
  });

  useEffect(() => {
    const raw = localStorage.getItem("user");

    if (!raw) return;

    try {
      setUser(JSON.parse(raw));
    } catch {
      toast.error("Invalid user data");
    }
  }, []);

  const getProfileImage = () => {
    if (imgPreview) return imgPreview;

    if (!user?.profile_image) return env.DEFAULT_PROFILE;

    if (user.profile_image.startsWith("http")) {
      return user.profile_image;
    }

    return `${env.IMAGE_PATH}${user.profile_image.replace(/^\/+/, "")}`;
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select valid image");

      return;
    }

    setImageFile(file);

    setImgPreview(URL.createObjectURL(file));
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("name", user.name);

      formData.append("username", user.username);

      formData.append("email", user.email);

      formData.append("phone", user.phone || "");

      if (imageFile) {
        formData.append("profile_image", imageFile);
      }

      const res = await Token.post("/user/profile", formData);

      localStorage.setItem("user", JSON.stringify(res.data.user));

      setUser(res.data.user);

      setImageFile(null);

      setImgPreview(null);

      toast.success("Profile updated successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwords.new_password !== passwords.new_password_confirmation) {
      toast.error("Passwords do not match");

      return;
    }

    try {
      setPasswordLoading(true);

      await Token.post("/user/change-password", passwords);

      toast.success("Password updated");

      setPasswords({
        current_password: "",
        new_password: "",
        new_password_confirmation: "",
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Password update failed");
    } finally {
      setPasswordLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="py-32 flex items-center justify-center text-gray-500 dark:text-gray-400">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ToastContainer position="top-right" autoClose={2500} />

      {/* HEADER */}

      <div>
        <h1 className="text-3xl font-black text-gray-800 dark:text-white">
          My Profile
        </h1>

        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Manage your personal information and security settings
        </p>
      </div>

      {/* PROFILE CARD */}

      <div className="bg-white dark:bg-surface-darkCard border border-surface-border dark:border-surface-darkBorder rounded-[28px] shadow-sm overflow-hidden">
        
        {/* TOP */}

        <div className="h-32 bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 relative" />

        {/* CONTENT */}

        <div className="px-8 pb-8">
          {/* IMAGE */}

          <div className="relative -mt-14 w-fit">
            <img
              src={getProfileImage()}
              alt="Profile"
              className="w-28 h-28 rounded-[28px] object-cover border-4 border-white dark:border-surface-darkCard shadow-xl"
              onError={(e) => {
                e.currentTarget.src = env.DEFAULT_PROFILE;
              }}
            />

            <label className="absolute bottom-2 right-2 w-10 h-10 rounded-2xl bg-primary-500 hover:bg-primary-600 text-white flex items-center justify-center cursor-pointer shadow-lg transition-all">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleProfilePicChange}
              />

              <FaCamera size={14} />
            </label>
          </div>

          {/* INFO */}

          <div className="mt-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              {user.name}
            </h2>

            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {user.email}
            </p>
          </div>

          {/* FORM */}

          <div className="grid grid-cols-2 gap-5 mt-8">
            <Input
              label="Full Name"
              value={user.name || ""}
              onChange={(v) => setUser({ ...user, name: v })}
            />

            <Input
              label="Username"
              value={user.username || ""}
              onChange={(v) => setUser({ ...user, username: v })}
            />

            <Input
              label="Email Address"
              value={user.email || ""}
              onChange={(v) => setUser({ ...user, email: v })}
            />

            <Input
              label="Phone Number"
              value={user.phone || ""}
              onChange={(v) => setUser({ ...user, phone: v })}
            />
          </div>

          {/* BUTTON */}

          <div className="mt-8">
            <button
              disabled={loading}
              onClick={handleSaveProfile}
              className={`h-12 px-6 rounded-2xl text-white font-semibold flex items-center gap-3 transition-all shadow-lg ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-primary-500 hover:bg-primary-600 shadow-primary-500/20"
              }`}
            >
              <FaSave />

              {loading ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </div>
      </div>

      {/* PASSWORD */}

      <div className="bg-white dark:bg-surface-darkCard border border-surface-border dark:border-surface-darkBorder rounded-[28px] shadow-sm p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-primary-50 dark:bg-surface-darkMuted text-primary-500 flex items-center justify-center">
            <FaKey />
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
              Change Password
            </h2>

            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Update your account password securely
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-5">
          <Input
            type="password"
            label="Current Password"
            value={passwords.current_password}
            onChange={(v) =>
              setPasswords({
                ...passwords,
                current_password: v,
              })
            }
          />

          <Input
            type="password"
            label="New Password"
            value={passwords.new_password}
            onChange={(v) =>
              setPasswords({
                ...passwords,
                new_password: v,
              })
            }
          />

          <Input
            type="password"
            label="Confirm Password"
            value={passwords.new_password_confirmation}
            onChange={(v) =>
              setPasswords({
                ...passwords,
                new_password_confirmation: v,
              })
            }
          />
        </div>

        <div className="mt-8">
          <button
            disabled={passwordLoading}
            onClick={handleChangePassword}
            className={`h-12 px-6 rounded-2xl text-white font-semibold flex items-center gap-3 transition-all shadow-lg ${
              passwordLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-primary-500 hover:bg-primary-600 shadow-primary-500/20"
            }`}
          >
            <FaKey />

            {passwordLoading
              ? "Updating..."
              : "Update Password"}
          </button>
        </div>
      </div>
    </div>
  );
}