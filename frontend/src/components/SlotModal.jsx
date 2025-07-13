// src/components/SlotModal.jsx
import React, { useState, useEffect } from "react";

export default function SlotModal({ slot, onSave, onClose }) {
  const [form, setForm] = useState({
    date: slot.date,
    start_time: slot.start_time,
    end_time: slot.end_time,
    status: slot.status,
  });

  useEffect(() => {
    setForm({
      date: slot.date,
      start_time: slot.start_time,
      end_time: slot.end_time,
      status: slot.status,
    });
  }, [slot]);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(slot.id, form);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg w-[90%] max-w-md">
        <h4 className="text-lg font-semibold mb-4">
          {slot.id ? "Edit Slot" : "New Slot"}
        </h4>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm">Date</label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm">Start</label>
              <input
                type="time"
                name="start_time"
                value={form.start_time}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm">End</label>
              <input
                type="time"
                name="end_time"
                value={form.end_time}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm">Status</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            >
              <option value="open">Open</option>
              <option value="cancelled">Cancelled</option>
              <option value="expired">Expired</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
