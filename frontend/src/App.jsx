import React, { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PatientDashboard from "./pages/dashboard/PatientDashboard";
import ClinicDashboard from "./pages/dashboard/ClinicDashboard";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import Settings from "./pages/dashboard/Settings";

// A component to guard routes by authentication + role
function Protected({ children, roles }) {
  const { user, initialized } = useContext(AuthContext);

  // don't render anything until auth state has loaded
  if (!initialized) return null;

  // not logged in → back to login
  if (!user) return <Navigate to="/login" replace />;

  // role mismatch → back to home
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;

  // otherwise render children
  return children;
}

export default function App() {
  const { user, initialized } = useContext(AuthContext);

  return (
    <Routes>
      {/* Public pages */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Dashboard landing: redirect based on role */}
      <Route
        path="/dashboard"
        element={
          <Protected roles={["patient", "clinic", "admin"]}>
            {user?.role === "patient" ? (
              <Navigate to="/dashboard/patient" replace />
            ) : user?.role === "clinic" ? (
              <Navigate to="/dashboard/clinic" replace />
            ) : (
              <Navigate to="/dashboard/admin" replace />
            )}
          </Protected>
        }
      />

      {/* Patient-only */}
      <Route
        path="/dashboard/patient"
        element={
          <Protected roles={["patient"]}>
            <PatientDashboard />
          </Protected>
        }
      />

      {/* Clinic-only */}
      <Route
        path="/dashboard/clinic"
        element={
          <Protected roles={["clinic"]}>
            <ClinicDashboard />
          </Protected>
        }
      />

      {/* Admin-only */}
      <Route
        path="/dashboard/admin"
        element={
          <Protected roles={["admin"]}>
            <AdminDashboard />
          </Protected>
        }
      />

      {/* Settings (only patients for now) */}
      <Route
        path="/settings"
        element={
          <Protected roles={["patient"]}>
            <Settings />
          </Protected>
        }
      />

      {/* 404 fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
