import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

export default function ClinicCalendar({ doctor, slots, onSlotClick }) {
  const [events, setEvents] = useState([]);

  // transform slots into FullCalendar events whenever slots change
  useEffect(() => {
    setEvents(
      // remove any duplicate slots at the same time
      slots
        .filter(
          (slot, i, arr) =>
            i ===
            arr.findIndex(
              (s) =>
                s.date === slot.date &&
                s.start_time === slot.start_time &&
                s.end_time === slot.end_time
            )
        )
        .map((slot) => ({
          id: slot.id.toString(),
          title:
            slot.status === "canceled"
              ? "Canceled"
              : slot.status === "booked"
              ? "Booked"
              : slot.status === "open"
              ? `${doctor.specialization} (${slot.language})`
              : slot.status.charAt(0).toUpperCase() + slot.status.slice(1),
          start: `${slot.date}T${slot.start_time}`,
          end: `${slot.date}T${slot.end_time}`,
          color:
            slot.status === "canceled"
              ? "#F87171" // red
              : slot.status === "booked"
              ? "#FBBF24" // yellow
              : slot.status === "open"
              ? "#34D399" // green
              : "#6B7280" // fallback gray
        }))
    );
  }, [slots, doctor]);

  return (
    <div className="rounded-xl shadow-sm bg-quickdocBlue/3 p-4">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay"
        }}
        events={events}
        slotMinTime="06:00:00"
        slotMaxTime="20:00:00"
        selectable={true}
        // prevent selecting overlapping existing events
        selectAllow={({ start, end }) =>
          !events.some((ev) => {
            const evStart = new Date(ev.start);
            const evEnd = new Date(ev.end);
            return start < evEnd && end > evStart;
          })
        }
        // also disallow selection to overlap events
        selectOverlap={false}
        // do not allow events to overlap when rendering or dragging
        eventOverlap={false}
        slotEventOverlap={false}
        select={(selectInfo) => {
          onSlotClick({
            existing: false,
            date: selectInfo.startStr.slice(0, 10),
            start_time: selectInfo.startStr.slice(11, 16),
            end_time: selectInfo.endStr.slice(11, 16)
          });
        }}
        eventClick={(clickInfo) => {
          onSlotClick({
            existing: true,
            slotId: parseInt(clickInfo.event.id, 10),
            date: clickInfo.event.startStr.slice(0, 10),
            start_time: clickInfo.event.startStr.slice(11, 16),
            end_time: clickInfo.event.endStr.slice(11, 16)
          });
        }}
        nowIndicator={true}
        height="auto"
      />
    </div>
  );
}
