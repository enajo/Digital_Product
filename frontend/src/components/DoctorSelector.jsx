import React, { useEffect, useState } from "react";
import api from "../services/api";

/**
 * DoctorSelector
 * Fetches and displays a dropdown list of doctors for the current clinic.
 * Props:
 *  - selectedDoctorId: ID of the currently selected doctor
 *  - onSelect: callback(docId) when a doctor is selected
 */
export default function DoctorSelector({ selectedDoctorId, onSelect }) {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchDoctors() {
      try {
        const { data } = await api.get("/clinic/doctors");
        setDoctors(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load doctors.");
      } finally {
        setLoading(false);
      }
    }
    fetchDoctors();
  }, []);

  if (loading) return <p>Loading doctors...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="mb-4">
      <label
        htmlFor="doctor"
        className="block text-sm font-medium text-gray-700"
      >
        Select Doctor
      </label>
      <select
        id="doctor"
        value={selectedDoctorId || ""}
        onChange={(e) => onSelect(e.target.value)}
        className="mt-1 block w-full p-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-quickdocBlue focus:border-quickdocBlue text-sm"
      >
        <option value="">All Doctors</option>
        {doctors.map((doc) => (
          <option key={doc.id} value={doc.id}>
            {doc.name}{doc.specialization ? ` (${doc.specialization})` : ""}
          </option>
        ))}
      </select>
    </div>
  );
}
