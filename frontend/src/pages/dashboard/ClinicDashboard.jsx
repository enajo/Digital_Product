// src/pages/dashboard/ClinicDashboard.jsx
import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import api from "../../services/api";
import {
  FaBars,
  FaUserMd,
  FaChartPie,
  FaBell,
  FaCog,
  FaClock,
} from "react-icons/fa";
import DoctorsList from "../../components/DoctorsList";
import ClinicCalendar from "../../components/ClinicCalendar";
import SlotModal from "../../components/SlotModal";

export default function ClinicDashboard() {
  const { user } = useContext(AuthContext);

  // doctors & calendar
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [slots, setSlots] = useState([]);
  const [showSlotModal, setShowSlotModal] = useState(false);
  const [activeSlot, setActiveSlot] = useState(null);

  // view: "calendar" or "analytics"
  const [view, setView] = useState("calendar");

  // inline Add-Doctor form
  const [newDoc, setNewDoc] = useState({ name: "", specialty: "" });

  // cancellations & reminders
  const [cancellations, setCancellations] = useState([]);
  const reminders = [
    { id: 1, text: "Staff meeting at 3 PM", time: "2:00 PM" },
    { id: 2, text: "Inventory check tomorrow", time: "5:00 PM" },
  ];

  // load doctors & cancellations
  useEffect(() => {
    api.get("/clinic/doctors").then(({ data }) => {
      setDoctors(data);
      if (data.length) setSelectedDoctor(data[0]);
    });
    api.get("/clinic/cancellations").then(({ data }) => setCancellations(data));
  }, []);

  // when selectedDoctor changes, load slots
  useEffect(() => {
    if (!selectedDoctor) return setSlots([]);
    api
      .get(`/clinic/doctors/${selectedDoctor.id}/slots`)
      .then(({ data }) => setSlots(data));
  }, [selectedDoctor]);

  // slot handlers
  const openNewSlot = () => {
    setActiveSlot({ id: null, date: "", start_time: "", end_time: "", status: "open" });
    setShowSlotModal(true);
  };
  const openEditSlot = (slot) => {
    setActiveSlot(slot);
    setShowSlotModal(true);
  };
  const saveSlot = async (slotId, updates) => {
    if (slotId) {
      await api.put(
        `/clinic/doctors/${selectedDoctor.id}/slots/${slotId}`,
        updates
      );
    } else {
      await api.post(
        `/clinic/doctors/${selectedDoctor.id}/slots`,
        updates
      );
    }
    setShowSlotModal(false);
    const { data } = await api.get(`/clinic/doctors/${selectedDoctor.id}/slots`);
    setSlots(data);
  };

  // add-doctor handler
  const addDoctor = async () => {
    const { data } = await api.post("/clinic/doctors", newDoc);
    setDoctors((prev) => [...prev, data]);
    setSelectedDoctor(data);
    setNewDoc({ name: "", specialty: "" });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-quickdocBlue/5 via-white to-quickdocGreen/5">
      {/* Top Nav */}
      <nav className="bg-quickdocBlue/1 px-6 py-3">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <FaBars className="text-2xl text-blue-600" />
            <span className="text-xl font-bold text-blue-600">
              QuickDoc Clinic
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <FaBell className="w-6 h-6 text-gray-600 hover:text-gray-800 cursor-pointer" />
            <FaCog className="w-6 h-6 text-gray-600 hover:text-gray-800 cursor-pointer" />
            <span className="text-gray-700">{user.name}</span>
          </div>
        </div>
      </nav>

      {/* Main grid */}
      <main className="flex-1 container mx-auto px-6 py-8 grid grid-cols-12 gap-6 bg-quickdocGreen/3">
        {/* Sidebar */}
        <aside className="col-span-3 flex flex-col bg-gradient-to-br from-quickdocBlue/10 via-white to-quickdocGreen/10 border-r border-gray-200 rounded-xl shadow-sm p-6">
          {/* Nav */}
          <NavItem
            icon={<FaUserMd />}
            label="Doctors"
            active={view === "calendar"}
            onClick={() => setView("calendar")}
          />

          {/* Doctors list */}
          <div className="mt-2 flex-1 overflow-y-auto">
            <DoctorsList
              doctors={doctors}
              selectedId={selectedDoctor?.id}
              onSelect={setSelectedDoctor}
            />
          </div>

          <NavItem
            icon={<FaChartPie />}
            label="Analytics"
            active={view === "analytics"}
            onClick={() => setView("analytics")}
          />
          <NavItem icon={<FaBell />} label="Messages" />
          <NavItem icon={<FaCog />} label="Settings" />
        </aside>

        {/* Main panel */}
        <section className="col-span-6 space-y-6">
          {view === "analytics" ? (
            <AnalyticsSection />
          ) : (
            <>
              <header className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-green-700">
                  {selectedDoctor
                    ? `Dr. ${selectedDoctor.name}'s Calendar`
                    : "Select a doctor"}
                </h1>
                {selectedDoctor && (
                  <button
                    onClick={openNewSlot}
                    className="bg-gradient-to-br from-quickdocBlue/80 to-quickdocGreen/80 text-white px-4 py-2 rounded-lg hover:bg-blue-500 transition"
                  >
                    + New Slot
                  </button>
                )}
              </header>

              {selectedDoctor ? (
                <div className="bg-gradient-to-br from-quickdocBlue/8 to-quickdocGreen/8 p-6 rounded-xl shadow-sm">
                  <ClinicCalendar
                    doctor={selectedDoctor}
                    slots={slots}
                    onSlotClick={openEditSlot}
                  />
                </div>
              ) : (
                <div className="text-gray-500 italic">No doctor selected.</div>
              )}
            </>
          )}
        </section>

        {/* Right panel */}
        <aside className="col-span-3 space-y-6">
          {/* Notifications */}
          <div className="bg-quickdocBlue/5 p-6 rounded-xl shadow-sm h-[500px] mb-8">
            <h2 className="text-xl font-semibold mb-4">Notifications</h2>
            {cancellations.length ? (
              cancellations.map((c) => (
                <div
                  key={c.id}
                  className="flex justify-between items-center border-b py-2"
                >
                  <div>
                    <p className="font-medium">
                      Dr. {c.doctorName} ({c.specialty})
                    </p>
                    <p className="text-gray-600 text-sm">
                      {new Date(c.date).toLocaleDateString()} @ {c.time}
                    </p>
                  </div>
                  <div className="space-x-2">
                    <button
                      onClick={async () => {
                        await api.post(`/clinic/slots/${c.slotId}/reopen`);
                        const { data } = await api.get("/clinic/cancellations");
                        setCancellations(data);
                      }}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      Reopen
                    </button>
                    <button
                      onClick={async () => {
                        await api.delete(`/clinic/cancellations/${c.id}`);
                        const { data } = await api.get("/clinic/cancellations");
                        setCancellations(data);
                      }}
                      className="text-red-500 hover:underline text-sm"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No new notifications.</p>
            )}
          </div>

          {/* Icon Bridge */}
          <div className="flex justify-center my-8 text-quickdocGreen/80 space-x-4">
            <FaBell className="w-10 h-10 mr-2 animate-bounce" />
            <FaClock className="w-10 h-10 animate-pulse" />
          </div>

          {/* Reminders */}
          <div className="bg-quickdocBlue/5 p-6 rounded-xl shadow-sm h-96 mt-96">
            <h2 className="text-xl font-semibold mb-4">Reminders</h2>
            {reminders.map((r) => (
              <div key={r.id} className="flex justify-between py-1">
                <span>{r.text}</span>
                <span className="text-gray-500 text-sm">{r.time}</span>
              </div>
            ))}
          </div>
        </aside>
      </main>

      {/* Slot modal */}
      {showSlotModal && (
        <SlotModal
          slot={activeSlot}
          onSave={saveSlot}
          onClose={() => setShowSlotModal(false)}
        />
      )}

      {/* Footer */}
      <footer className="bg-gradient-to-br from-quickdocBlue/10 via-white to-quickdocGreen/10 border-t">
        <div className="container mx-auto px-6 py-4 text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} QuickDoc Clinic Dashboard. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

// Sidebar NavItem
function NavItem({ icon, label, active, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center px-4 py-2 mb-1 cursor-pointer transition ${
        active
          ? "bg-blue-50 text-blue-600 border-l-4 border-blue-500"
          : "hover:bg-gray-100 text-gray-700"
      }`}
    >
      {React.cloneElement(icon, { className: "w-5 h-5 mr-3" })}
      <span>{label}</span>
    </div>
  );
}

// Analytics placeholder
function AnalyticsSection() {
  const charts = [
    "Cancellation Trend",
    "Appointment Volume",
    "No-Show Rate",
    "Staff Utilization",
  ];
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Clinic Analytics</h1>
      <div className="grid grid-cols-2 gap-6">
        {charts.map((title) => (
          <div key={title} className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="font-semibold mb-2">{title}</h3>
            <div className="h-40 flex items-center justify-center text-gray-400 italic">
              [Chart placeholder]
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
