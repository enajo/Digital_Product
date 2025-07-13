import React, { useEffect, useState } from "react";
import axios from "../../services/api";
import Navbar from "../../components/Navbar";
import ToggleSwitch from "../../components/ToggleSwitch";

const Settings = ({ user }) => {
  const [standby, setStandby] = useState({
    enabled: false,
    preferred_languages: [],
    preferred_days: [],
    preferred_times: "",
    max_notifications_per_day: 5,
  });

  const [dnd, setDnd] = useState({
    dnd_days: [],
    dnd_time_ranges: [],
    temporarily_paused: false,
    pause_until: "",
  });

  const fetchSettings = async () => {
    try {
      const standbyRes = await axios.get("/patient/profile"); // optionally separate endpoints
      if (standbyRes.data.standby) setStandby(standbyRes.data.standby);
      if (standbyRes.data.dnd) setDnd(standbyRes.data.dnd);
    } catch (err) {
      console.warn("Failed to load preferences.");
    }
  };

  const updateStandby = async () => {
    try {
      await axios.put("/patient/standby", standby);
      alert("Standby preferences updated.");
    } catch {
      alert("Error updating standby.");
    }
  };

  const updateDND = async () => {
    try {
      await axios.put("/patient/dnd", dnd);
      alert("DND preferences updated.");
    } catch {
      alert("Error updating DND.");
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Notification Settings</h2>

        {/* STANDBY MODE */}
        <div className="bg-white p-6 rounded shadow mb-8">
          <h3 className="text-lg font-semibold text-blue-700 mb-3">Standby Mode</h3>
          <ToggleSwitch
            id="standby-toggle"
            label="Enable standby alerts"
            checked={standby.enabled}
            onChange={(val) => setStandby({ ...standby, enabled: val })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <input
              type="text"
              placeholder="Preferred Languages (comma-separated)"
              value={standby.preferred_languages.join(",")}
              onChange={(e) =>
                setStandby({
                  ...standby,
                  preferred_languages: e.target.value.split(",").map((v) => v.trim()),
                })
              }
              className="p-2 border rounded"
            />
            <input
              type="text"
              placeholder="Preferred Days (e.g., Monday,Tuesday)"
              value={standby.preferred_days.join(",")}
              onChange={(e) =>
                setStandby({
                  ...standby,
                  preferred_days: e.target.value.split(",").map((v) => v.trim()),
                })
              }
              className="p-2 border rounded"
            />
            <input
              type="text"
              placeholder="Preferred Times (e.g., 08:00-11:00)"
              value={standby.preferred_times}
              onChange={(e) =>
                setStandby({ ...standby, preferred_times: e.target.value })
              }
              className="p-2 border rounded"
            />
            <input
              type="number"
              min="1"
              placeholder="Max Notifications/Day"
              value={standby.max_notifications_per_day}
              onChange={(e) =>
                setStandby({
                  ...standby,
                  max_notifications_per_day: parseInt(e.target.value),
                })
              }
              className="p-2 border rounded"
            />
          </div>

          <button
            onClick={updateStandby}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Save Standby Settings
          </button>
        </div>

        {/* DND */}
        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-lg font-semibold text-red-600 mb-3">Do Not Disturb (DND)</h3>

          <ToggleSwitch
            id="dnd-pause"
            label="Temporarily Pause All Alerts"
            checked={dnd.temporarily_paused}
            onChange={(val) => setDnd({ ...dnd, temporarily_paused: val })}
          />

          <input
            type="datetime-local"
            value={dnd.pause_until || ""}
            onChange={(e) => setDnd({ ...dnd, pause_until: e.target.value })}
            className="mt-3 w-full p-2 border rounded"
            placeholder="Pause Until (optional)"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <input
              type="text"
              placeholder="DND Days (e.g., Saturday,Sunday)"
              value={dnd.dnd_days.join(",")}
              onChange={(e) =>
                setDnd({
                  ...dnd,
                  dnd_days: e.target.value.split(",").map((v) => v.trim()),
                })
              }
              className="p-2 border rounded"
            />

            <textarea
              placeholder='DND Time Ranges (e.g., [{"from":"08:00","to":"10:00"}])'
              value={JSON.stringify(dnd.dnd_time_ranges)}
              onChange={(e) =>
                setDnd({ ...dnd, dnd_time_ranges: JSON.parse(e.target.value || "[]") })
              }
              className="p-2 border rounded"
              rows={3}
            />
          </div>
			
          <button
            onClick={updateDND}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
          >
            Save DND Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
