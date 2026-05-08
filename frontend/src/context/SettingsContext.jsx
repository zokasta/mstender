import { createContext, useContext, useEffect, useState } from "react";
import Token from "../database/Token";

const SettingsContext = createContext();

const LOCAL_STORAGE_KEY = "user.settings";

export const DEFAULT_SETTINGS = {
  language: "English",
  timezone: "GMT+0",
  emailNotifications: true,
  smsNotifications: false,
  whatsappNotification: false,
  twoFA: false,
  loginAlerts: true,
  beta: {
    isActive: false,
    newButtons: false,
    newPagination: false,
  },
  widgets: {
    time: {
      enabled: true,
      format: "hh:mm:ss dddd DD-MMM",
    },
    screen: {
      enabled: true,
    },
    notification: {
      enabled: true,
    },
  },
};

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);

        if (saved) {
          setSettings(JSON.parse(saved));
        } else {
          const res = await Token.get("/auth/me");
          if (res.data?.settings) {
            setSettings(res.data.settings);
            localStorage.setItem(
              LOCAL_STORAGE_KEY,
              JSON.stringify(res.data.settings)
            );
          }
        }
      } catch (err) {
        console.error("Failed to load settings");
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const updateSettings = async (newSettings) => {
    setSettings(newSettings); // 🔥 instant update

    localStorage.setItem(
      LOCAL_STORAGE_KEY,
      JSON.stringify(newSettings)
    );

    await Token.put("/auth/settings", {
      settings: newSettings,
    });
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        setSettings,
        updateSettings,
        loading,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);