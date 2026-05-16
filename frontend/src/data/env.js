// src/config/env.js
const env = {
  APP_NAME: "Junoon Travel Portal",

  // 🧭 API Base URLs
  BASE_URL: "https://adminpage.mstender.com",
  // BASE_URL: "http://localhost:3000",
  API_URL: "https://backend.mstender.com/api",
  // API_URL: "http://localhost:8000/api",

  // 🪪 Authentication & Tokens
  TOKEN_KEY: "junoon_auth_token",

  // 🌍 Frontend URL
  FRONTEND_URL: "https://adminpage.mstender.com",

  // 🧱 Common Paths
  IMAGE_PATH: "https://backend.mstender.com",
  DEFAULT_PROFILE: "https://backend.mstender.com/storage/profiles/NEJvNH11gn0O9KaqbEaG0vgRmplVqAOgpoMvkJQM.png",

  // ⚙️ App Settings
  DATE_FORMAT: "YYYY-MM-DD",
  CURRENCY: "₹",
  TIMEZONE: "Asia/Kolkata",

  // 🚦 Feature flags (optional)
  DEBUG_MODE: true,
  ENABLE_NOTIFICATIONS: true,

  PUSHER_APP_KEY: "9ddd270cea670464d0df",
  VITE_PUSHER_APP_CLUSTER: "ap2",
};

export default env;
