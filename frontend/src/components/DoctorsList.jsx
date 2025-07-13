// src/components/DoctorsList.jsx

import React, { useEffect, useState } from "react";
import api from "../services/api";

const SPECIALIZATIONS = [
  "Dentist",
  "Cardiologist",
  "Dermatologist",
  "General Practitioner",
];

const LANGUAGES = ["English", "Spanish", "German", "French"];

export default function DoctorsList({ onSelect }) {
  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState({
    name: "",
    specialization: "",
    languages: [],
  });
  const [loading, setLoading] = useState(true);

  // Load doctors on mount
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/clinic/doctors");
        setDoctors(data);
      } catch {
        alert("Could not load doctors.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Selecting a doctor
  const handleSelect = (doc) => {
    onSelect(doc);
  };

  // Form field changes (text, select, checkboxes)
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "languages") {
      setForm((f) => ({
        ...f,
        languages: checked
          ? [...f.languages, value]
          : f.languages.filter((l) => l !== value),
      }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

  // Add a new doctor
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.name || !form.specialization || form.languages.length === 0) {
      alert("Please fill name, specialization, and select at least one language.");
      return;
    }
    try {
      const res = await api.post("/clinic/doctors", {
        name: form.name,
        specialization: form.specialization,
        languages: form.languages.join(","),
      });
      const newDoc = res.data.doctor;
      setDoctors((d) => [...d, newDoc]);
      setForm({ name: "", specialization: "", languages: [] });
    } catch {
      alert("Failed to add doctor.");
    }
  };

  if (loading) {
    return (
      <div className="p-4 bg-white rounded shadow">
        <p className="text-gray-500">Loading doctors…</p>
      </div>
    );
  }

  return (
    <aside className="bg-quickdocBlue/2 rounded shadow p-4 mb-8">

      {doctors.length === 0 ? (
        <p className="text-sm text-gray-500 mb-6">
          You have no doctors yet. Add one below.
        </p>
      ) : (
        <ul className="space-y-2 mb-6">
          {doctors.map((doc) => (
            <li key={doc.id}>
              <button
                onClick={() => handleSelect(doc)}
                className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 transition flex justify-between"
              >
                <span>Dr. {doc.name}</span>
                <span className="italic text-sm text-gray-600">{doc.specialization}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <form
        onSubmit={handleAdd}
        className="border-t pt-4 space-y-3"
      >
        <h4 className="text-md font-medium">Add New Doctor</h4>

        <input
          name="name"
          placeholder="Full Name"
          value={form.name}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />

        <select
          name="specialization"
          value={form.specialization}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        >
          <option value="">Specialization</option>
          {SPECIALIZATIONS.map((spec) => (
            <option key={spec} value={spec}>
              {spec}
            </option>
          ))}
        </select>

        <fieldset className="space-y-1">
          <legend className="text-sm font-medium">Languages</legend>
          <div className="flex flex-wrap gap-3">
            {LANGUAGES.map((lang) => (
              <label key={lang} className="flex items-center">
                <input
                  type="checkbox"
                  name="languages"
                  value={lang}
                  checked={form.languages.includes(lang)}
                  onChange={handleChange}
                  className="mr-2"
                />
                <span className="text-sm">{lang}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <button
          type="submit"
          className="w-full bg-gradient-to-br from-quickdocBlue/80 to-quickdocGreen/80 text-white py-2 rounded hover:bg-green-700 transition"
        >
          Add Doctor
        </button>
      </form>
    </aside>
  );
}
