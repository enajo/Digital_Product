import React from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50 px-4">
      <div className="max-w-md w-full bg-white shadow-xl rounded-2xl p-8 text-center">
        <h1 className="text-3xl font-bold text-blue-700 mb-2">Welcome to QuickDoc</h1>
        <p className="text-gray-600 mb-6">
          Your last-minute medical appointment assistant.
        </p>

        <div className="flex flex-col gap-4 mt-4">
          <button
            onClick={() => navigate("/login?role=patient")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition"
          >
            I'm a Patient
          </button>
          <button
            onClick={() => navigate("/login?role=clinic")}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition"
          >
            I'm a Clinic
          </button>
          <button
            onClick={() => navigate("/login?role=admin")}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition"
          >
            Admin Access
          </button>
        </div>
      </div>

      <footer className="text-xs text-gray-400 mt-10">
        © {new Date().getFullYear()} QuickDoc. All rights reserved.
      </footer>
    </div>
  );
};

export default Home;
