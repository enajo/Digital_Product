import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { format, addDays, startOfWeek, parseISO } from "date-fns";

/**
 * CalendarGrid
 * 
 * Displays a weekly calendar grid for a given doctor.
 * Props:
 *   - doctorId: ID of the doctor whose slots to display
 *   - onCreateSlot(date: string, time: string): callback when an empty cell is clicked
 *   - onSlotClick(slot): callback when an existing slot cell is clicked
 */
export default function CalendarGrid({ doctorId, onCreateSlot, onSlotClick }) {
  const [slots, setSlots] = useState([]);
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 })); // Monday

  useEffect(() => {
    if (!doctorId) return;
    axios
      .get(`/clinic/doctors/${doctorId}/slots`)
      .then((res) => setSlots(res.data))
      .catch((err) => console.error("Failed to load slots", err));
  }, [doctorId]);

  // Build array of 7 days for the header
  const days = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));

  // Hours from 8 to 18
  const hours = Array.from({ length: 11 }).map((_, i) => 8 + i);

  // Helper to find slot for given day and hour
  const findSlot = (day, hour) => {
    return slots.find((s) => {
      const slotDate = parseISO(s.date);
      const slotHour = parseISO(`${s.date}T${s.start_time}`);
      return (
        slotDate.toDateString() === day.toDateString() &&
        slotHour.getHours() === hour
      );
    });
  };

  return (
    <div className="overflow-auto border rounded-lg">
      {/* Header Row */}
      <div className="grid grid-cols-8 bg-gray-100">
        <div className="p-2" />
        {days.map((day) => (
          <div key={day} className="p-2 text-center font-medium">
            <div>{format(day, 'EEE')}</div>
            <div className="text-sm text-gray-600">{format(day, 'MM/dd')}</div>
          </div>
        ))}
      </div>

      {/* Time Rows */}
      {hours.map((hour) => (
        <div key={hour} className="grid grid-cols-8 border-t">
          {/* Hour label */}
          <div className="p-2 text-right text-sm text-gray-700">
            {`${hour}:00`}
          </div>
          {/* Day cells */}
          {days.map((day) => {
            const slot = findSlot(day, hour);
            return (
              <div
                key={day}
                className={`h-16 border-l relative cursor-pointer hover:bg-gray-50 ${
                  slot ? 'bg-green-100' : ''
                }`}
                onClick={() => {
                  if (slot) onSlotClick(slot);
                  else onCreateSlot(format(day, 'yyyy-MM-dd'), `${hour.toString().padStart(2, '0')}:00`);
                }}
              >
                {slot && (
                  <div className="absolute inset-0 flex flex-col justify-center items-center text-xs font-medium text-green-800">
                    <div>{slot.start_time}–{slot.end_time}</div>
                    {slot.specialization && <div className="italic">{slot.specialization}</div>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
