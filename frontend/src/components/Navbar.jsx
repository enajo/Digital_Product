import React from "react";
import { useNavigate } from "react-router-dom";

const Navbar = ({ user, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    if (onLogout) onLogout();
    navigate("/login");
  };

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm px-6 py-4 flex items-center justify-between">
      <h1
        className="text-xl font-semibold text-blue-700 cursor-pointer"
        onClick={() => navigate("/dashboard")}
      >
        QuickDoc
      </h1>

      {user && (
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-700 capitalize">
            Logged in as: <strong>{user.role}</strong>
          </span>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;