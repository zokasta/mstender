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

  /* ================================
     Load User
  ================================= */
  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (!raw) return;

    try {
      setUser(JSON.parse(raw));
    } catch {
      toast.error("Invalid user data");
    }
  }, []);

  /* ================================
     Get Image URL
  ================================= */
  const getProfileImage = () => {
    if (imgPreview) return imgPreview;
    if (!user?.profile_image) return env.DEFAULT_PROFILE;

    if (user.profile_image.startsWith("http")) {
      return user.profile_image;
    }

    return `${env.IMAGE_PATH}${user.profile_image.replace(/^\/+/, "")}`;
  };

  /* ================================
     Handle Image Change
  ================================= */
  const handleProfilePicChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select valid image file");
      return;
    }

    setImageFile(file);
    setImgPreview(URL.createObjectURL(file));
  };

  /* ================================
     Save Profile
  ================================= */
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

      toast.success("Profile updated successfully 🎉");
    } catch (err) {
      console.log(err.response?.data);
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  /* ================================
     Change Password
  ================================= */
  const handleChangePassword = async () => {
    if (passwords.new_password !== passwords.new_password_confirmation) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setPasswordLoading(true);

      await Token.post("/user/change-password", passwords);

      toast.success("Password changed successfully ✅");

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
    return <div className="text-center py-20">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <ToastContainer position="top-right" autoClose={2500} />
      <h1 className="text-2xl font-bold">Profile</h1>

      {/* ================= Account Info ================= */}
      <div className="bg-white shadow-md rounded-lg p-6 border space-y-4">
        <div className="flex items-center gap-6">
          {/* Profile Image */}
          <div className="relative">
            <img
              src={getProfileImage()}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover border"
              onError={(e) => {
                e.currentTarget.src = env.DEFAULT_PROFILE;
              }}
            />

            <label className="absolute bottom-0 right-0 bg-primary-500 p-2 rounded-full cursor-pointer text-white hover:bg-primary-600">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleProfilePicChange}
              />
              <FaCamera />
            </label>
          </div>

          {/* User Info */}
          <div className="flex-1 grid grid-cols-2 gap-4">
            <Input
              label="Name"
              value={user.name || ""}
              onChange={(v) => setUser({ ...user, name: v })}
            />
            <Input
              label="Username"
              value={user.username || ""}
              onChange={(v) => setUser({ ...user, username: v })}
            />
            <Input
              label="Email"
              value={user.email || ""}
              onChange={(v) => setUser({ ...user, email: v })}
            />
            <Input
              label="Phone"
              value={user.phone || ""}
              onChange={(v) => setUser({ ...user, phone: v })}
            />
          </div>
        </div>

        {/* Save Button */}
        <button
          disabled={loading}
          onClick={handleSaveProfile}
          className={`px-4 py-2 rounded flex items-center gap-2 text-white ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-primary-500 hover:bg-primary-600"
          }`}
        >
          {loading ? (
            "Saving..."
          ) : (
            <>
              <FaSave /> Save Profile
            </>
          )}
        </button>
      </div>

      {/* ================= Change Password ================= */}
      <div className="bg-white shadow-md rounded-lg p-6 border space-y-4">
        <h2 className="font-semibold">Change Password</h2>

        <div className="grid grid-cols-3 gap-4">
          <Input
            type="password"
            placeholder="Current Password"
            value={passwords.current_password}
            onChange={(v) =>
              setPasswords({ ...passwords, current_password: v })
            }
          />
          <Input
            type="password"
            placeholder="New Password"
            value={passwords.new_password}
            onChange={(v) => setPasswords({ ...passwords, new_password: v })}
          />
          <Input
            type="password"
            placeholder="Confirm Password"
            value={passwords.new_password_confirmation}
            onChange={(v) =>
              setPasswords({
                ...passwords,
                new_password_confirmation: v,
              })
            }
          />
        </div>

        <button
          disabled={passwordLoading}
          onClick={handleChangePassword}
          className={`px-4 py-2 rounded flex items-center gap-2 text-white ${
            passwordLoading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-primary-500 hover:bg-primary-600"
          }`}
        >
          {passwordLoading ? (
            "Updating..."
          ) : (
            <>
              <FaKey /> Update Password
            </>
          )}
        </button>
      </div>
    </div>
  );
}
