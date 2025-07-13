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

export default function App() {
  const { user, initialized } = useContext(AuthContext);
  const isAuthenticated = Boolean(user);

  const Protected = ({ children, roles }) => {
    // wait for AuthContext to finish loading
    if (!initialized) return null;
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    if (!roles.includes(user.role)) return <Navigate to="/" replace />;
    return children;
  };

  return (
    <Routes>
      {/* public */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* protected */}
      <Route
        path="/dashboard/patient"
        element={
          <Protected roles={["patient"]}>
            <PatientDashboard />
          </Protected>
        }
      />
      <Route
        path="/dashboard/clinic"
        element={
          <Protected roles={["clinic"]}>
            <ClinicDashboard />
          </Protected>
        }
      />
      <Route
        path="/dashboard/admin"
        element={
          <Protected roles={["admin"]}>
            <AdminDashboard />
          </Protected>
        }
      />
      <Route
        path="/settings"
        element={
          <Protected roles={["patient"]}>
            <Settings />
          </Protected>
        }
      />

      {/* fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
