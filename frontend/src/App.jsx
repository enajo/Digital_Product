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

// A component to guard routes by authentication + optional role check
function Protected({ children, roles }) {
  const { user, initialized } = useContext(AuthContext);

  // don't render anything until auth state has loaded
  if (!initialized) return null;

  // not logged in → redirect to login
  if (!user) return <Navigate to="/login" replace />;

  // if roles provided and user.role not in list → redirect to home
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;

  // otherwise render the protected component
  return children;
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Redirect /dashboard based on role */}
      <Route
        path="/dashboard"
        element={
          <Protected roles={["patient", "clinic", "admin"]}>
            {/* choose landing page */}
            <DashboardRedirect />
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

      {/* Settings (patients only) */}
      <Route
        path="/settings"
        element={
          <Protected roles={["patient"]}>
            <Settings />
          </Protected>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// helper to send /dashboard → role-specific dashboard
function DashboardRedirect() {
  const { user } = useContext(AuthContext);

  if (user.role === "patient") return <Navigate to="/dashboard/patient" replace />;
  if (user.role === "clinic")  return <Navigate to="/dashboard/clinic" replace />;
  return <Navigate to="/dashboard/admin" replace />;
}
