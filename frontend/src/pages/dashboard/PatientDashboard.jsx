// src/pages/dashboard/PatientDashboard.jsx
import React, { useEffect, useState, useContext } from 'react';
import {
  FaChartLine,
  FaCalendarAlt,
  FaUserMd,
  FaBell,
  FaCog,
  FaBars,
  FaSearch,
  FaGlobe,
  FaMapMarkerAlt,
  FaBookOpen,
  FaMapMarkedAlt,
} from 'react-icons/fa';
import ToggleSwitch from '../../components/ToggleSwitch';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import mapImg from '../../assets/map.jpg';
import tipsImg from '../../assets/health.png';

const SPECIALTIES = [
  'General Practitioner',
  'Dentist',
  'Cardiologist',
  'Dermatologist',
  'Pediatrician',
];

export default function PatientDashboard() {
  const { user } = useContext(AuthContext);

  // Stats & data
  const [stats, setStats] = useState({ total: 0, upcoming: 0, completed: 0 });
  const [filters, setFilters] = useState({ doctor: '', specialty: '', city: '', lang: '' });
  const [slots, setSlots] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [history, setHistory] = useState([]);

  // Standby / DND state
  const [standby, setStandby] = useState({
    enabled: false,
    specialty: SPECIALTIES[0],
    city: '',
    languages: '',
    start_date: '',
    end_date: '',
    start_time: '',
    end_time: '',
    max_notifications_per_day: 3,
  });
  const [dnd, setDnd] = useState({ enabled: false, start_date: '', end_date: '', start_time: '', end_time: '' });
  
    // Save-feedback flags
  const [isSavingStandby, setIsSavingStandby] = useState(false);
  const [standbySaved,    setStandbySaved]    = useState(false);
  const [isSavingDnd,     setIsSavingDnd]     = useState(false);
  const [dndSaved,        setDndSaved]        = useState(false);


  // Load initial data
  useEffect(() => {
    api.get('/patient/metrics').then(res => setStats(res.data));
    api.get('/patient/appointments').then(res => {
      setBookings(res.data);
      setStats(s => ({ ...s, upcoming: res.data.length }));
    });
    api.get('/patient/history').then(res => {
      setHistory(res.data);
      setStats(s => ({ ...s, completed: res.data.length }));
    });
    api.get('/patient/profile').then(res => {
      if (res.data.standby) setStandby(s => ({ ...s, ...res.data.standby }));
      if (res.data.dnd)     setDnd(d => ({ ...d, ...res.data.dnd }));
    });
  }, []);

  // Fetch slots when filters change
  useEffect(() => {
    api.get('/patient/slots', { params: filters }).then(res => setSlots(res.data));
  }, [filters]);

    const saveStandby = () => {
		setIsSavingStandby(true);
		api.put('/patient/standby', standby)
		  .then(() => {
			setIsSavingStandby(false);
			setStandbySaved(true);
			setTimeout(() => setStandbySaved(false), 3000);
		  })
		  .catch(() => {
			setIsSavingStandby(false);
			alert('Failed to save preferences');
		  });
	  };

    const saveDnd = () => {
    setIsSavingDnd(true);
    api.put('/patient/dnd', dnd)
      .then(() => {
        setIsSavingDnd(false);
        setDndSaved(true);
        setTimeout(() => setDndSaved(false), 3000);
      })
      .catch(() => {
        setIsSavingDnd(false);
        alert('Failed to save DND');
      });
  };

  const bookSlot   = id =>
    api.post(`/patient/book/${id}`)
      .then(() => { refreshAppointments(); refreshSlots(); })
      .catch(() => alert('Booking failed'));

  const refreshAppointments = () => api.get('/patient/appointments').then(res => setBookings(res.data));
  const refreshSlots        = () => api.get('/patient/slots', { params: filters }).then(res => setSlots(res.data));

  const isFiltering = Boolean(filters.doctor || filters.specialty || filters.city || filters.lang);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-quickdocBlue/10 via-white to-quickdocGreen/10 text-gray-800">
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-br from-quickdocBlue/10 via-white to-quickdocGreen/10 border-r border-gray-200 flex flex-col">
        <a href="/" className="px-6 py-8 flex items-center space-x-3 border-b border-gray-200">
          <FaBars className="text-2xl text-blue-600" />
          <span className="text-2xl font-bold text-quickdocBlue">QuickDoc</span>
        </a>
        <nav className="flex flex-col flex-1 overflow-y-auto">
          <NavItem icon={<FaChartLine />} label="Dashboard" active />
          <ToggleSection icon={<FaCalendarAlt />} label="Standby" enabled={standby.enabled} onToggle={v => setStandby(s => ({ ...s, enabled: v }))}>
            <StandbyForm
			  state={standby}
			  setState={setStandby}
			  onSave={saveStandby}
			  isSaving={isSavingStandby}
			  justSaved={standbySaved}
			/>

          </ToggleSection>
          <ToggleSection icon={<FaUserMd />} label="Do-Not-Disturb" enabled={dnd.enabled} onToggle={v => setDnd(d => ({ ...d, enabled: v }))}>
            <DndForm
			  state={dnd}
			  setState={setDnd}
			  onSave={saveDnd}
			  isSaving={isSavingDnd}
			  justSaved={dndSaved}
			/>
          </ToggleSection>
          <NavItem icon={<FaBell />} label="Messages" />
          <NavItem icon={<FaCog />} label="Settings" />

          {/* CTA */}
          <div className="mt-auto mb-8 p-4 bg-gradient-to-br from-quickdocBlue/10 to-quickdocGreen/10 rounded-lg text-center">
            <p className="mb-2 font-medium">Learn more about our services</p>
            <button className="px-4 py-2 bg-gradient-to-r from-quickdocBlue/80 via-quickdocGreen/70 to-quickdocBlue/80 text-white rounded-lg">Learn More</button>
          </div>
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-blue-2">
          <div className="max-w-7xl mx-auto px-8 py-5 flex justify-between items-center">
            <h1 className="text-2xl font-semibold">Welcome back, {user.name}</h1>
            <div className="flex space-x-5">
              <FaBell className="w-6 h-6 hover:text-gray-600 transition" />
              <FaCog  className="w-6 h-6 hover:text-gray-600 transition" />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto py-8">
          <div className="max-w-7xl mx-auto px-8 space-y-8">
            {/* Analytics */}
            <div className="grid grid-cols-4 gap-6">
              <StatCard icon={<FaChartLine />}   label="Total Visits"    value={stats.total} />
              <StatCard icon={<FaCalendarAlt />} label="Upcoming"        value={stats.upcoming} />
              <StatCard icon={<FaUserMd />}      label="Completed"       value={stats.completed} />
              <StatCard icon={<FaBookOpen />}    label="Slots Available" value={slots.length} />
            </div>

            {/* Search & Slots */}
            <div className="bg-white rounded-xl border border-gray-200 px-6 py-4 flex flex-wrap items-center gap-4">
              <SearchInput value={filters.doctor} onChange={val => setFilters(f => ({ ...f, doctor: val }))} />
              <DropdownSelect
                icon={<FaGlobe />}
                options={['English','German','Spanish']}
                placeholder="Language"
                value={filters.lang}
                onChange={val => setFilters(f => ({ ...f, lang: val }))}
              />
              <InputWithIcon
                icon={<FaMapMarkerAlt />}
                placeholder="City"
                value={filters.city}
                onChange={val => setFilters(f => ({ ...f, city: val }))}
              />
              <DropdownSelect
                icon={null}
                options={SPECIALTIES}
                placeholder="Specialty"
                value={filters.specialty}
                onChange={val => setFilters(f => ({ ...f, specialty: val }))}
              />
            </div>
            {isFiltering && <SlotsTable slots={slots} onBook={bookSlot} />}

            {/* Bookings & History */}
            <div className="grid grid-cols-10 gap-6">
              <div className="col-span-6">
                <AppointmentsCard
				  title="My Bookings"
				  items={bookings}
				  emptyMessage="No upcoming appointments."
				  actionLabel="Cancel"
				  actionClass="text-red-500"
				  onAction={async id => {
					await api.delete(`/patient/appointments/${id}`)
					await refreshAppointments()
					await refreshSlots()
				  }}
				/>

              </div>
              <div className="col-span-4">
                <AppointmentsCard
                  title="History"
                  items={history}
                  emptyMessage="No past appointments."
                  actionLabel="Feedback"
                  actionClass="text-blue-600"
                />
              </div>
            </div>

            {/* Health Tips & Top Visits */}
            <div className="grid grid-cols-10 gap-6">
              {/* Health Tips */}
              <div className="col-span-6 bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-xl font-semibold mb-3">Health Tips</h3>
                <div className="w-full h-32 overflow-hidden rounded-lg mb-3">
                  <img
                    src={tipsImg}
                    alt="Health Tips"
                    className="w-full h-full object-cover"
                  />
                </div>
                <p>
                  Here are some quick tips to keep you healthy and safe. Remember to stay hydrated,
                  exercise regularly, and get enough rest!
                </p>
              </div>

              {/* Top Visits Map */}
              <div className="col-span-4 bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-xl font-semibold mb-3">Top Patient Visits</h3>
                <div className="w-full h-40 overflow-hidden rounded-lg">
                  <img
                    src={mapImg}
                    alt="Top Visits Map"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-gradient-to-br from-quickdocBlue/10 via-white to-quickdocGreen/10 border-t border-gray-200 text-gray-600 text-sm py-10 ml-52">
          <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
            <FooterSection
              title="Our company"
              links={['About QuickDoc','Privacy','Prevention','Video consultation','Careers','Help area']}
            />
            <FooterSection title="Find your specialist" links={SPECIALTIES} />
            <FooterSection
              title="Frequently searched"
              links={['Cardiologist New York','Dentist London','Pediatrician Berlin','Dermatologist Paris']}
            />
          </div>
          <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center">
            <span>© {new Date().getFullYear()} QuickDoc. All rights reserved.</span>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <img src="/assets/appstore.png" alt="App Store" className="h-8" />
              <img src="/assets/googleplay.png" alt="Google Play" className="h-8" />
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

/*** Sub-components ***/

function NavItem({ icon, label, active }) {
  return (
    <div className={`flex items-center px-4 py-3 border-b border-gray-200 cursor-pointer transition ${
      active
        ? 'text-blue-600 font-medium border-l-4 border-blue-500 bg-blue-50'
        : 'hover:bg-gray-50 text-gray-700'
    }`}>
      {React.cloneElement(icon, { className: 'w-5 h-5 mr-3' })}
      <span>{label}</span>
    </div>
  );
}

function ToggleSection({ icon, label, enabled, onToggle, children }) {
  return (
    <div>
      <div className="flex items-center px-4 py-3 border-b border-gray-200 cursor-pointer transition">
        {React.cloneElement(icon, { className: 'w-5 h-5 mr-3 text-gray-600' })}
        <span className="flex-1 font-medium text-gray-700">{label}</span>
        <ToggleSwitch checked={enabled} onChange={onToggle} onColor="#3B82F6" />
      </div>
      {enabled && <div className="ml-4 p-4">{children}</div>}
    </div>
  );
}

function StandbyForm({ state, setState, onSave, isSaving, justSaved }) {
  return (
    <div className="space-y-3">
      <select
        className="w-full border border-gray-300 rounded-lg px-3 py-2"
        value={state.specialty}
        onChange={e => setState(s => ({ ...s, specialty: e.target.value }))}
      >
        {SPECIALTIES.map(sp => <option key={sp}>{sp}</option>)}
      </select>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
          placeholder="City"
          value={state.city}
          onChange={e => setState(s => ({ ...s, city: e.target.value }))}
        />
        <input
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
          placeholder="Languages (comma-separated)"
          value={state.languages}
          onChange={e => setState(s => ({ ...s, languages: e.target.value }))}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <input
          type="date"
          className="border-gray-300 rounded-lg p-2 border"
          value={state.start_date}
          onChange={e => setState(s => ({ ...s, start_date: e.target.value }))}
        />
        <input
          type="date"
          className="border-gray-300 rounded-lg p-2 border"
          value={state.end_date}
          onChange={e => setState(s => ({ ...s, end_date: e.target.value }))}
        />
      </div>

      <div className="flex gap-3">
        <input
          type="time"
          className="flex-1 border-gray-300 rounded-lg p-2 border"
          value={state.start_time}
          onChange={e => setState(s => ({ ...s, start_time: e.target.value }))}
        />
        <input
          type="time"
          className="flex-1 border-gray-300 rounded-lg p-2 border"
          value={state.end_time}
          onChange={e => setState(s => ({ ...s, end_time: e.target.value }))}
        />
      </div>

      <input
        type="number"
        min={1}
        max={10}
        className="w-full border border-gray-300 rounded-lg px-3 py-2"
        placeholder="Max notifications per day"
        value={state.max_notifications_per_day}
        onChange={e => setState(s => ({ ...s, max_notifications_per_day: +e.target.value }))}
      />

      <button
        onClick={onSave}
        disabled={isSaving}
        className="w-full py-2 bg-gradient-to-br from-quickdocBlue/80 to-quickdocGreen/80 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
      >
        {isSaving ? 'Saving…' : 'Save Preferences'}
      </button>

      {justSaved && (
        <p className="mt-2 text-green-600 text-sm">
          ✔ Standby preferences saved!
        </p>
      )}
    </div>
  );
}

function DndForm({ state, setState, onSave, isSaving, justSaved }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <input
          type="date"
          className="border-gray-300 rounded-lg p-2 border"
          value={state.start_date}
          onChange={e => setState(d => ({ ...d, start_date: e.target.value }))}
        />
        <input
          type="date"
          className="border-gray-300 rounded-lg p-2 border"
          value={state.end_date}
          onChange={e => setState(d => ({ ...d, end_date: e.target.value }))}
        />
      </div>

      <div className="flex gap-3">
        <input
          type="time"
          className="flex-1 border-gray-300 rounded-lg p-2 border"
          value={state.start_time}
          onChange={e => setState(d => ({ ...d, start_time: e.target.value }))}
        />
        <input
          type="time"
          className="flex-1 border-gray-300 rounded-lg p-2 border"
          value={state.end_time}
          onChange={e => setState(d => ({ ...d, end_time: e.target.value }))}
        />
      </div>

      <button
        onClick={onSave}
        disabled={isSaving}
        className="w-full py-2 bg-gradient-to-br from-quickdocBlue/80 to-quickdocGreen/80 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
      >
        {isSaving ? 'Saving…' : 'Save DND'}
      </button>

      {justSaved && (
        <p className="mt-2 text-green-600 text-sm">
          ✔ DND settings saved!
        </p>
      )}
    </div>
  );
}


function SearchInput({ value, onChange }) {
  return (
    <div className="relative flex-1">
      <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Search doctor…"
        className="w-full border border-gray-300 rounded-full pl-12 pr-4 py-3 focus:ring-2 focus:ring-blue-400 transition"
      />
    </div>
  );
}

function DropdownSelect({ icon, options, placeholder, value, onChange }) {
  return (
    <div className="flex items-center border border-gray-300 rounded-full overflow-hidden">
      {icon && React.cloneElement(icon, { className: 'text-gray-400 mx-3' })}
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="px-4 py-2 focus:outline-none"
      >
        <option value="">{placeholder}</option>
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </div>
  );
}

function InputWithIcon({ icon, placeholder, value, onChange }) {
  return (
    <div className="flex items-center border border-gray-300 rounded-full overflow-hidden">
      {React.cloneElement(icon, { className: 'text-gray-400 mx-3' })}
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="px-4 py-2 focus:outline-none w-32"
      />
    </div>
  );
}

function SlotsTable({ slots, onBook }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
      <h2 className="text-2xl font-semibold px-6 py-4">Available Slots</h2>
      <table className="min-w-full table-auto">
        <thead className="bg-gray-50">
          <tr>
            {['Doctor','Specialty','Date','Time','Language','Action'].map(h => (
              <th key={h} className="px-6 py-3 text-left text-sm font-medium text-gray-600">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {slots.length ? slots.map(s => (
            <tr key={s.id} className="border-b hover:bg-gray-50 transition">
              <td className="px-6 py-4">{s.doctor_name}</td>
              <td className="px-6 py-4">{s.specialization}</td>
              <td className="px-6 py-4">{new Date(s.date).toLocaleDateString()}</td>
              <td className="px-6 py-4">{s.start_time}</td>
              <td className="px-6 py-4">{s.language}</td>
              <td className="px-6 py-4">
                <button onClick={() => onBook(s.id)} className="flex items-center space-x-1 text-blue-600 hover:underline text-sm">
                  <FaBookOpen /><span>Book</span>
                </button>
              </td>
            </tr>
          )) : (
            <tr><td colSpan={6} className="py-12 text-center text-gray-500">No slots match your filters.</td></tr>
          )}  
        </tbody>
      </table>
    </div>
  );
}

function AppointmentsCard({
  title,
  items,
  emptyMessage,
  actionLabel,
  actionClass,
  onAction
}) {
  return (
    <div className="bg-white rounded-xl border p-6 space-y-4">
      <h3 className="text-xl font-semibold">{title}</h3>
      {items.length ? items.map(item => (
        <div key={item.id} className="flex justify-between items-center border-b pb-3">
          <div>
            <p className="font-medium">{item.doctor_name} — {item.specialization || "General"}</p>
            <p className="text-sm text-gray-600">
              {new Date(item.date).toLocaleDateString()} @ {item.start_time}
            </p>
            <p className="text-sm text-gray-500">Clinic: {item.clinic_city}</p>
          </div>
          <button
            onClick={() => onAction(item.id)}
            className={`${actionClass} text-sm hover:underline`}
          >
            {actionLabel}
          </button>
        </div>
      )) : (
        <p className="text-gray-500 italic">{emptyMessage}</p>
      )}
    </div>
  );
}



function StatCard({ icon, label, value }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 flex items-center space-x-4">
      {React.cloneElement(icon, { className: 'w-8 h-8 text-quickdocDark' })}
      <div>
        <p className="text-3xl font-bold text-gray-800">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  );
}

function FooterSection({ title, links }) {
  return (
    <div>
      <h4 className="font-semibold mb-3">{title}</h4>
      <ul className="space-y-2 text-gray-600">
        {links.map(link => <li key={link}>{link}</li>)}
      </ul>
    </div>
  );
}
