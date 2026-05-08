import { useEffect, useState } from "react";
import ReactMoment from "react-moment";
import { useSettings } from "../../context/SettingsContext"; // fix path if needed

export default function TimeWidget() {
  const { settings, loading } = useSettings();
  const [time, setTime] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(Date.now());
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  // wait until settings loaded
  if (loading) return null;

  const enabled = settings?.widgets?.time?.enabled ?? true;
  const format =
    settings?.widgets?.time?.format ?? "HH:mm:ss";

  if (!enabled) return null;

  return (
    <div className="text-primary-500 font-bold text-lg">
      <ReactMoment format={format}>
        {time}
      </ReactMoment>
    </div>
  );
}