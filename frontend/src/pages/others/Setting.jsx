import { useEffect, useState } from "react";
import Input from "../../components/elements/Input";
import SwitchButton from "../../components/elements/Switch";
import Select from "../../components/elements/Select";
import { toast, ToastContainer } from "react-toastify";
import { useSettings, DEFAULT_SETTINGS } from "../../context/SettingsContext";
import ReactMoment from "react-moment";

export default function Setting() {
  const { settings, updateSettings, loading } = useSettings();

  const [localSettings, setLocalSettings] = useState(settings);
  const [saving, setSaving] = useState(false);
  const [time, setTime] = useState(Date.now());

  /* ===============================
     Sync local draft when context loads
  =============================== */
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  /* ===============================
     Timer for preview
  =============================== */
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  /* ===============================
     Safe Nested Update (LOCAL ONLY)
  =============================== */
  const handleChange = (field, value) => {
    setLocalSettings((prev) => {
      const keys = field.split(".");
      const newState = { ...prev };
      let current = newState;

      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...(current[keys[i]] || {}) };
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = value;
      return newState;
    });
  };

  /* ===============================
     SAVE SETTINGS
  =============================== */
  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      await updateSettings(localSettings);
      toast.success("Settings saved successfully ✅");
    } catch {
      toast.error("Failed to save settings ❌");
    } finally {
      setSaving(false);
    }
  };

  /* ===============================
     RESET SETTINGS
  =============================== */
  const handleResetSettings = async () => {
    try {
      setSaving(true);
      setLocalSettings(DEFAULT_SETTINGS);
      await updateSettings(DEFAULT_SETTINGS);
      toast.success("Settings reset to default 🔄");
    } catch {
      toast.error("Failed to reset settings ❌");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !localSettings) {
    return (
      <div className="text-center py-20 text-gray-500">Loading settings...</div>
    );
  }

  const timeChoice = [
    { format: "hh:mm:ss dddd DD-MMM", label: "" },
    { format: "HH:mm:ss dddd DD-MMM", label: "" },
    { format: "dddd HH:mm:ss", label: "" },
    { format: "hh:mm A", label: "" },
    { format: "DD-MMM-YYYY HH:mm:ss", label: "" },
  ];

  return (
    <div className="space-y-6">
      <ToastContainer position="top-right" autoClose={2500} />

      <h1 className="text-2xl font-bold text-gray-800">Settings</h1>

      {/* ================= GENERAL ================= */}
      <div className="bg-white shadow-md rounded-lg p-6 border space-y-4">
        <h2 className="text-lg font-semibold">General Settings</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <Input
            placeholder="Language"
            value={localSettings.language}
            onChange={(val) => handleChange("language", val)}
          />

          <Input
            placeholder="Timezone"
            value={localSettings.timezone}
            onChange={(val) => handleChange("timezone", val)}
          />
        </div>
      </div>

      {/* ================= NOTIFICATIONS ================= */}
      <div className="bg-white shadow-md rounded-lg p-6 border space-y-4">
        <h2 className="text-lg font-semibold">Notifications</h2>

        {[
          ["Email Notifications", "emailNotifications"],
          ["SMS Notifications", "smsNotifications"],
          ["Whatsapp Notifications", "whatsappNotification"],
        ].map(([label, key]) => (
          <div key={key} className="flex items-center justify-between">
            <span>{label}</span>
            <SwitchButton
              value={localSettings[key]}
              onChange={(val) => handleChange(key, val)}
            />
          </div>
        ))}
      </div>

      {/* ================= SECURITY ================= */}
      <div className="bg-white shadow-md rounded-lg p-6 border space-y-4">
        <h2 className="text-lg font-semibold">Security Settings</h2>

        {[
          ["Two-Factor Authentication", "twoFA"],
          ["Login Alerts", "loginAlerts"],
        ].map(([label, key]) => (
          <div key={key} className="flex items-center justify-between">
            <span>{label}</span>
            <SwitchButton
              value={localSettings[key]}
              onChange={(val) => handleChange(key, val)}
            />
          </div>
        ))}

        <div className="flex items-center justify-between">
          <span>Beta Version</span>
          <SwitchButton
            value={localSettings.beta.isActive}
            onChange={(val) => handleChange("beta.isActive", val)}
          />
        </div>
      </div>

      {/* ================= BETA FEATURES ================= */}
      {localSettings.beta.isActive && (
        <div className="bg-white shadow-md rounded-lg p-6 border space-y-4">
          <h2 className="text-lg font-semibold">Beta Features</h2>

          {[
            ["New Buttons", "beta.newButtons"],
            ["New Pagination", "beta.newPagination"],
          ].map(([label, key]) => (
            <div key={key} className="flex items-center justify-between">
              <span>{label}</span>
              <SwitchButton
                value={localSettings.beta[key.split(".")[1]]}
                onChange={(val) => handleChange(key, val)}
              />
            </div>
          ))}
        </div>
      )}

      {/* ================= WIDGETS ================= */}
      <div className="bg-white shadow-md rounded-lg p-6 border space-y-4">
        <h2 className="text-lg font-semibold">Widgets</h2>

        <div className="flex items-center justify-between">
          <span>Full Screen</span>
          <SwitchButton
            value={localSettings.widgets?.screen?.enabled}
            onChange={(val) => handleChange("widgets.screen.enabled", val)}
          />
        </div>
        <div className="flex items-center justify-between">
          <span>Notification</span>
          <SwitchButton
            value={localSettings.widgets?.notification?.enabled}
            onChange={(val) =>
              handleChange("widgets.notification.enabled", val)
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <span>Enable Time Widget</span>
          <SwitchButton
            value={localSettings.widgets?.time?.enabled}
            onChange={(val) => handleChange("widgets.time.enabled", val)}
          />
        </div>

        {localSettings.widgets?.time?.enabled && (
          <Select
            value={localSettings.widgets?.time?.format}
            onChange={(val) => handleChange("widgets.time.format", val)}
          >
            {timeChoice.map((choice, index) => (
              <option key={index} value={choice.format}>
                <ReactMoment format={choice.format}>{time}</ReactMoment>
                {choice.label}
              </option>
            ))}
          </Select>
        )}
      </div>

      {/* ================= WIDGETS ================= */}
      <div className="bg-white shadow-md rounded-lg p-6 border space-y-4">
        <h2 className="text-lg font-semibold">Widgets</h2>

        <div className="flex items-center justify-between">
          <span>Full Screen</span>
          <SwitchButton
            value={localSettings.widgets?.screen?.enabled}
            onChange={(val) => handleChange("widgets.screen.enabled", val)}
          />
        </div>
        <div className="flex items-center justify-between">
          <span>Notification</span>
          <SwitchButton
            value={localSettings.widgets?.notification?.enabled}
            onChange={(val) =>
              handleChange("widgets.notification.enabled", val)
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <span>Enable Time Widget</span>
          <SwitchButton
            value={localSettings.widgets?.time?.enabled}
            onChange={(val) => handleChange("widgets.time.enabled", val)}
          />
        </div>

        {localSettings.widgets?.time?.enabled && (
          <Select
            value={localSettings.widgets?.time?.format}
            onChange={(val) => handleChange("widgets.time.format", val)}
          >
            {timeChoice.map((choice, index) => (
              <option key={index} value={choice.format}>
                <ReactMoment format={choice.format}>{time}</ReactMoment>
                {choice.label}
              </option>
            ))}
          </Select>
        )}
      </div>

      {/* ================= ACTION BUTTONS ================= */}
      <div className="flex gap-3 justify-end">
        <button
          onClick={handleResetSettings}
          disabled={saving}
          className="px-4 py-2 rounded-md border hover:bg-gray-100"
        >
          Reset
        </button>

        <button
          onClick={handleSaveSettings}
          disabled={saving}
          className="px-4 py-2 rounded-md bg-primary-500 text-white"
        >
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </div>
  );
}
