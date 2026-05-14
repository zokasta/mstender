import { useEffect, useState } from "react";

import Input from "../../components/elements/Input";

import SwitchButton from "../../components/elements/Switch";

import Select from "../../components/elements/Select";

import { toast, ToastContainer } from "react-toastify";

import {
  useSettings,
  DEFAULT_SETTINGS,
} from "../../context/SettingsContext";

import ReactMoment from "react-moment";

import {
  FaCog,
  FaBell,
  FaShieldAlt,
  FaFlask,
  FaDesktop,
  FaSave,
  FaUndo,
} from "react-icons/fa";

export default function Setting() {
  const { settings, updateSettings, loading } =
    useSettings();

  const [localSettings, setLocalSettings] =
    useState(settings);

  const [saving, setSaving] = useState(false);

  const [time, setTime] = useState(Date.now());

  /* ===============================
     SYNC SETTINGS
  =============================== */

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  /* ===============================
     CLOCK
  =============================== */

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  /* ===============================
     UPDATE NESTED
  =============================== */

  const handleChange = (field, value) => {
    setLocalSettings((prev) => {
      const keys = field.split(".");

      const newState = { ...prev };

      let current = newState;

      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = {
          ...(current[keys[i]] || {}),
        };

        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = value;

      return newState;
    });
  };

  /* ===============================
     SAVE
  =============================== */

  const handleSaveSettings = async () => {
    try {
      setSaving(true);

      await updateSettings(localSettings);

      toast.success("Settings saved successfully");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  /* ===============================
     RESET
  =============================== */

  const handleResetSettings = async () => {
    try {
      setSaving(true);

      setLocalSettings(DEFAULT_SETTINGS);

      await updateSettings(DEFAULT_SETTINGS);

      toast.success("Settings reset successfully");
    } catch {
      toast.error("Failed to reset settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !localSettings) {
    return (
      <div className="py-32 flex items-center justify-center text-gray-500 dark:text-gray-400">
        Loading settings...
      </div>
    );
  }

  const timeChoice = [
    { format: "hh:mm:ss dddd DD-MMM" },
    { format: "HH:mm:ss dddd DD-MMM" },
    { format: "dddd HH:mm:ss" },
    { format: "hh:mm A" },
    { format: "DD-MMM-YYYY HH:mm:ss" },
  ];

  /* ===============================
     CARD
  =============================== */

  const Card = ({ icon, title, desc, children }) => (
    <div className="bg-white dark:bg-surface-darkCard border border-surface-border dark:border-surface-darkBorder rounded-[28px] shadow-sm overflow-hidden">
      {/* HEADER */}

      <div className="px-7 py-5 border-b border-surface-border dark:border-surface-darkBorder bg-gradient-to-r from-primary-50 to-white dark:from-surface-darkMuted dark:to-surface-darkCard">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary-500 text-white flex items-center justify-center shadow-lg shadow-primary-500/20">
            {icon}
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">
              {title}
            </h2>

            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {desc}
            </p>
          </div>
        </div>
      </div>

      {/* BODY */}

      <div className="p-7 space-y-5">
        {children}
      </div>
    </div>
  );

  /* ===============================
     TOGGLE ROW
  =============================== */

  const ToggleRow = ({
    label,
    description,
    value,
    onChange,
  }) => (
    <div className="flex items-center justify-between gap-5 p-4 rounded-2xl bg-surface-light dark:bg-surface-darkMuted border border-surface-border dark:border-surface-darkBorder">
      <div>
        <h4 className="font-semibold text-gray-800 dark:text-white">
          {label}
        </h4>

        {description && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {description}
          </p>
        )}
      </div>

      <SwitchButton
        value={value}
        onChange={onChange}
      />
    </div>
  );

  return (
    <div className="space-y-6">
      <ToastContainer
        position="top-right"
        autoClose={2500}
      />

      {/* HEADER */}

      <div>
        <h1 className="text-3xl font-black text-gray-800 dark:text-white">
          Settings
        </h1>

        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Configure your ERP preferences and system behavior
        </p>
      </div>

      {/* GENERAL */}

      <Card
        icon={<FaCog />}
        title="General Settings"
        desc="Manage application language and timezone"
      >
        <div className="grid md:grid-cols-2 gap-5">
          <Input
            label="Language"
            value={localSettings.language}
            onChange={(val) =>
              handleChange("language", val)
            }
          />

          <Input
            label="Timezone"
            value={localSettings.timezone}
            onChange={(val) =>
              handleChange("timezone", val)
            }
          />
        </div>
      </Card>

      {/* NOTIFICATIONS */}

      <Card
        icon={<FaBell />}
        title="Notifications"
        desc="Control notification delivery settings"
      >
        <ToggleRow
          label="Email Notifications"
          description="Receive important updates through email"
          value={localSettings.emailNotifications}
          onChange={(val) =>
            handleChange("emailNotifications", val)
          }
        />

        <ToggleRow
          label="SMS Notifications"
          description="Receive SMS alerts on your mobile"
          value={localSettings.smsNotifications}
          onChange={(val) =>
            handleChange("smsNotifications", val)
          }
        />

        <ToggleRow
          label="Whatsapp Notifications"
          description="Enable WhatsApp business notifications"
          value={localSettings.whatsappNotification}
          onChange={(val) =>
            handleChange(
              "whatsappNotification",
              val
            )
          }
        />
      </Card>

      {/* SECURITY */}

      <Card
        icon={<FaShieldAlt />}
        title="Security"
        desc="Manage authentication and account protection"
      >
        <ToggleRow
          label="Two-Factor Authentication"
          description="Add additional login security"
          value={localSettings.twoFA}
          onChange={(val) =>
            handleChange("twoFA", val)
          }
        />

        <ToggleRow
          label="Login Alerts"
          description="Get notified on suspicious logins"
          value={localSettings.loginAlerts}
          onChange={(val) =>
            handleChange("loginAlerts", val)
          }
        />
      </Card>

      {/* BETA */}

      <Card
        icon={<FaFlask />}
        title="Beta Features"
        desc="Try experimental ERP features"
      >
        <ToggleRow
          label="Enable Beta Features"
          description="Access upcoming features before release"
          value={localSettings.beta.isActive}
          onChange={(val) =>
            handleChange("beta.isActive", val)
          }
        />

        {localSettings.beta.isActive && (
          <>
            <ToggleRow
              label="New Buttons"
              description="Enable redesigned button system"
              value={localSettings.beta.newButtons}
              onChange={(val) =>
                handleChange(
                  "beta.newButtons",
                  val
                )
              }
            />

            <ToggleRow
              label="New Pagination"
              description="Enable modern pagination component"
              value={localSettings.beta.newPagination}
              onChange={(val) =>
                handleChange(
                  "beta.newPagination",
                  val
                )
              }
            />
          </>
        )}
      </Card>

      {/* WIDGETS */}

      <Card
        icon={<FaDesktop />}
        title="Widgets"
        desc="Customize dashboard widgets and tools"
      >
        <ToggleRow
          label="Fullscreen Widget"
          description="Enable fullscreen button in topbar"
          value={
            localSettings.widgets?.screen?.enabled
          }
          onChange={(val) =>
            handleChange(
              "widgets.screen.enabled",
              val
            )
          }
        />

        <ToggleRow
          label="Notification Widget"
          description="Show notification dropdown in topbar"
          value={
            localSettings.widgets?.notification
              ?.enabled
          }
          onChange={(val) =>
            handleChange(
              "widgets.notification.enabled",
              val
            )
          }
        />

        <ToggleRow
          label="Time Widget"
          description="Display live clock in topbar"
          value={
            localSettings.widgets?.time?.enabled
          }
          onChange={(val) =>
            handleChange(
              "widgets.time.enabled",
              val
            )
          }
        />

{localSettings.widgets?.time?.enabled && (
          <div className="space-y-4">
            
            {/* TITLE */}

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Time Format
              </label>

              <p className="text-xs text-gray-500 dark:text-gray-400">
                Select how time appears in widgets and dashboards
              </p>
            </div>

            {/* OPTIONS */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {timeChoice.map((choice, index) => {
                const active =
                  localSettings.widgets?.time
                    ?.format === choice.format;

                return (
                  <button
                    key={index}
                    onClick={() =>
                      handleChange(
                        "widgets.time.format",
                        choice.format
                      )
                    }
                    className={`text-left p-5 rounded-2xl border transition-all ${
                      active
                        ? "border-primary-500 bg-primary-50 dark:bg-primary-900/10 shadow-lg shadow-primary-500/10"
                        : "border-surface-border dark:border-surface-darkBorder bg-white dark:bg-surface-dark hover:border-primary-200 dark:hover:border-primary-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      
                      {/* LEFT */}

                      <div>
                        <p className="font-semibold text-gray-800 dark:text-white">
                          <ReactMoment
                            format={choice.format}
                          >
                            {time}
                          </ReactMoment>
                        </p>

                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          {choice.format}
                        </p>
                      </div>

                      {/* ACTIVE */}

                      {active && (
                        <div className="w-3 h-3 rounded-full bg-primary-500" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </Card>

      {/* ACTIONS */}

      <div className="flex items-center justify-end gap-4">
        <button
          onClick={handleResetSettings}
          disabled={saving}
          className="h-12 px-6 rounded-2xl border border-surface-border dark:border-surface-darkBorder bg-white dark:bg-surface-darkCard hover:bg-surface-light dark:hover:bg-surface-darkMuted text-gray-700 dark:text-gray-300 font-semibold transition-all flex items-center gap-3"
        >
          <FaUndo />

          Reset
        </button>

        <button
          onClick={handleSaveSettings}
          disabled={saving}
          className={`h-12 px-6 rounded-2xl text-white font-semibold flex items-center gap-3 transition-all shadow-lg ${
            saving
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-primary-500 hover:bg-primary-600 shadow-primary-500/20"
          }`}
        >
          <FaSave />

          {saving
            ? "Saving..."
            : "Save Settings"}
        </button>
      </div>
    </div>
  );
}