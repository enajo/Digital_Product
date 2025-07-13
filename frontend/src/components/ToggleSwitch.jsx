// src/components/ToggleSwitch.jsx
import React from "react";

export default function ToggleSwitch({
  id,
  checked,
  onChange,
  onColor = "#3B82F6",   // blue when “on”
  offColor = "#ccc",      // gray when “off”
}) {
  return (
    <label htmlFor={id} className="relative inline-block w-12 h-6">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        className="opacity-0 w-0 h-0"
      />
      {/* track */}
      <span
        className="absolute inset-0 rounded-full transition-colors duration-200"
        style={{ backgroundColor: checked ? onColor : offColor }}
      />
      {/* thumb */}
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transform transition-transform duration-200 ${
          checked ? "translate-x-6" : ""
        }`}
      />
    </label>
  );
}
