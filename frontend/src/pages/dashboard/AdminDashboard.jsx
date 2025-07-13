import React, { useEffect, useState } from "react";
import axios from "../../services/api";
import Navbar from "../../components/Navbar";

const AdminDashboard = ({ user }) => {
  const [stats, setStats] = useState({});
  const [patients, setPatients] = useState([]);
  const [clinics, setClinics] = useState([]);

  const fetchStats = async () => {
    const res = await axios.get("/admin/dashboard");
    setStats(res.data);
  };

  const fetchUsers = async () => {
    const [patRes, cliRes] = await Promise.all([
      axios.get("/admin/users/patients"),
      axios.get("/admin/users/clinics")
    ]);
    setPatients(patRes.data);
    setClinics(cliRes.data);
  };

  const handleDelete = async (role, id) => {
    if (!window.confirm(`Delete this ${role}?`)) return;
    try {
      await axios.delete(`/admin/users/${role}/${id}/delete`);
      fetchUsers();
    } catch {
      alert("Delete failed.");
    }
  };

  useEffect(() => {
    fetchStats();
    fetchUsers();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Admin Dashboard</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {Object.entries(stats).map(([key, value]) => (
            <div
              key={key}
              className="bg-white shadow rounded-md p-4 text-center"
            >
              <div className="text-sm text-gray-500">{key.replaceAll('_', ' ')}</div>
              <div className="text-xl font-bold text-blue-700">{value}</div>
            </div>
          ))}
        </div>

        <h3 className="text-xl font-semibold text-blue-700 mb-2">All Clinics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {clinics.length === 0 ? (
            <p className="text-gray-500">No clinics found.</p>
          ) : (
            clinics.map((c) => (
              <div key={c.id} className="bg-white p-4 rounded shadow text-sm flex justify-between items-center">
                <div>
                  <p><strong>{c.name}</strong> ({c.city})</p>
                  <p className="text-xs text-gray-500">{c.email}</p>
                </div>
                <button
                  onClick={() => handleDelete("clinic", c.id)}
                  className="text-red-600 text-xs hover:underline"
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>

        <h3 className="text-xl font-semibold text-green-700 mb-2">All Patients</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {patients.length === 0 ? (
            <p className="text-gray-500">No patients found.</p>
          ) : (
            patients.map((p) => (
              <div key={p.id} className="bg-white p-4 rounded shadow text-sm flex justify-between items-center">
                <div>
                  <p><strong>{p.name}</strong> ({p.language})</p>
                  <p className="text-xs text-gray-500">{p.email}</p>
                </div>
                <button
                  onClick={() => handleDelete("patient", p.id)}
                  className="text-red-600 text-xs hover:underline"
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
