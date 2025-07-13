// src/pages/Register.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "../services/api";
import illustration from "../assets/elder.jpg"; // swap in your own

const NavBar = () => (
  <nav className="bg-white shadow-md">
    <div className="container mx-auto px-6 py-4 flex justify-between items-center">
      <Link to="/" className="text-2xl font-bold text-green-600">
        Quickdoc
      </Link>
      <div className="space-x-6">
        <Link to="/" className="text-gray-600 hover:text-green-600">
          Home
        </Link>
        <Link to="/register" className="text-gray-600 hover:text-green-600">
          Register
        </Link>
        <Link to="/login" className="text-gray-600 hover:text-green-600">
          Login
        </Link>
      </div>
    </div>
  </nav>
);

const Footer = () => (
  <footer className="bg-white border-t mt-auto">
    <div className="container mx-auto px-6 py-4 text-center text-gray-500 text-sm">
      © {new Date().getFullYear()} HealthConnect. All rights reserved.
    </div>
  </footer>
);

export default function Register() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const queryRole = new URLSearchParams(search).get("role") || "patient";

  const [role, setRole] = useState(queryRole);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    language: "",
    location: "",
    city: "",
    doctor_name: ""
  });
  const [error, setError] = useState("");

  useEffect(() => {
    setRole(queryRole);
  }, [queryRole]);

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async e => {
    e.preventDefault();
    setError("");

    const payload = {
      email: formData.email,
      password: formData.password,
      role,
      name: formData.name,
    };

    if (role === "patient") {
      payload.language = formData.language;
      payload.location = formData.location;
    } else {
      payload.city = formData.city;
      payload.doctor_name = formData.doctor_name;
    }

    try {
      await axios.post("/auth/register", payload);
      navigate(`/login?role=${role}`);
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-green-50">
      <NavBar />

      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2">
          {/* — Left panel: illustration + benefits — */}
          <div className="p-8 bg-green-100 flex flex-col justify-between">
            <h3 className="uppercase text-sm font-medium text-gray-600 mb-4">
              Join us today
            </h3>
            <img
              src={illustration}
              alt="Illustration"
              className="w-full h-48 object-contain mb-6"
            />
            <p className="text-gray-700 mb-6">
              Your account helps us provide essential services, connect you
              with professionals, and support your health journey.
            </p>
            <ul className="space-y-3">
              <li className="flex items-center">
                <span className="inline-block w-5 h-5 bg-green-600 rounded-full mr-3"></span>
                Easy Appointment Booking
              </li>
              <li className="flex items-center">
                <span className="inline-block w-5 h-5 bg-green-600 rounded-full mr-3"></span>
                Personalized Health Dashboard
              </li>
              <li className="flex items-center">
                <span className="inline-block w-5 h-5 bg-green-600 rounded-full mr-3"></span>
                Secure Records Storage
              </li>
              <li className="flex items-center">
                <span className="inline-block w-5 h-5 bg-green-600 rounded-full mr-3"></span>
                24/7 Support
              </li>
            </ul>
          </div>

          {/* — Right panel: the form — */}
          <div className="p-8">
            <h2 className="text-3xl font-semibold text-green-700 mb-6 text-center">
              Create Your {role === "clinic" ? "Clinic" : "Patient"} Account
            </h2>

            {error && (
              <div className="bg-red-100 text-red-700 text-sm p-3 mb-4 rounded">
                {error}
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-5">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-gray-700 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>

              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-gray-700 mb-1">
                  {role === "clinic" ? "Clinic Name" : "Full Name"}
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  placeholder={
                    role === "clinic" ? "Your Clinic Name" : "Your Full Name"
                  }
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              {/* Patient-only fields */}
              {role === "patient" && (
                <>
                  <div>
                    <label
                      htmlFor="language"
                      className="block text-gray-700 mb-1"
                    >
                      Preferred Language
                    </label>
                    <input
                      id="language"
                      name="language"
                      type="text"
                      required
                      placeholder="e.g. English"
                      className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
                      value={formData.language}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="location"
                      className="block text-gray-700 mb-1"
                    >
                      Location
                    </label>
                    <input
                      id="location"
                      name="location"
                      type="text"
                      required
                      placeholder="City or Region"
                      className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
                      value={formData.location}
                      onChange={handleChange}
                    />
                  </div>
                </>
              )}

              {/* Clinic-only fields */}
              {role === "clinic" && (
                <>
                  <div>
                    <label htmlFor="city" className="block text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      id="city"
                      name="city"
                      type="text"
                      required
                      placeholder="City of Practice"
                      className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
                      value={formData.city}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="doctor_name"
                      className="block text-gray-700 mb-1"
                    >
                      Doctor’s Name (Optional)
                    </label>
                    <input
                      id="doctor_name"
                      name="doctor_name"
                      type="text"
                      placeholder="Dr. Jane Smith"
                      className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
                      value={formData.doctor_name}
                      onChange={handleChange}
                    />
                  </div>
                </>
              )}

              <button
                type="submit"
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition"
              >
                Register
              </button>
            </form>

            <p className="mt-6 text-center text-gray-600 text-sm">
              Already registered?{" "}
              <Link
                to={`/login?role=${role}`}
                className="text-green-600 hover:underline"
              >
                Login here
              </Link>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
