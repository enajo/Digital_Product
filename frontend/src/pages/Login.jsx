// src/pages/Login.jsx
import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../services/api";
import LoginImage from "../assets/login.jpg";
import { AuthContext } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post("/auth/login", { email, password });
      // destructure the correct fields out of response
      const { access_token: token, user } = response.data;

      // persist token so our interceptor picks it up next time
      localStorage.setItem("token", token);

      // update React context immediately
      setUser({ id: user.id, email: user.email, role: user.role });

      // redirect to the right dashboard
      navigate(`/dashboard/${user.role}`);
    } catch (err) {
      const message =
        err.response?.data?.error || "Login failed. Please try again.";
      setError(message);
    }
  };

  return (
    <div className="min-h-screen font-brand bg-gradient-to-br from-quickdocBlue/10 via-white to-quickdocGreen/10 flex flex-col">
      {/* Navbar */}
      <nav className="w-full px-6 py-4 flex justify-between items-center max-w-7xl mx-auto">
        <div
          className="text-2xl font-bold text-quickdocBlue cursor-pointer hover:text-quickdocDark transition"
          onClick={() => navigate("/")}
        >
          QuickDoc
        </div>
        <div className="flex items-center gap-6 text-sm font-medium text-quickdocBlue">
          <button
            onClick={() => navigate("/login")}
            className="hover:text-quickdocDark transition"
          >
            Login
          </button>
          <button
            onClick={() => navigate("/register")}
            className="bg-quickdocBlue text-white px-4 py-2 rounded-full shadow hover:bg-quickdocDark transition"
          >
            Register
          </button>
        </div>
      </nav>

      {/* Main Section */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 items-center max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
        {/* Image Section */}
        <div className="hidden lg:block h-full pl-4 pr-2">
          <img
            src={LoginImage}
            alt="Login Illustration"
            className="w-full h-full object-cover rounded-l-[4rem]"
          />
        </div>

        {/* Form Section */}
        <div className="py-12 pr-8">
          <div className="max-w-sm w-full mx-auto">
            <h2 className="text-3xl font-bold text-quickdocBlue mb-2">
              Welcome Back!
            </h2>
            <p className="text-gray-600 text-sm mb-6">
              Enter your credentials to access your dashboard.
            </p>

            {error && (
              <div className="bg-red-100 text-red-600 text-sm p-2 mb-4 rounded-md border border-red-200">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm text-gray-600 mb-1">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-quickdocBlue text-sm"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm text-gray-600 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-quickdocBlue text-sm"
                  required
                />
                <div className="text-right mt-1">
                  <button
                    type="button"
                    onClick={() => navigate("/forgot-password")}
                    className="text-xs text-quickdocBlue hover:text-quickdocDark transition underline"
                  >
                    Forgot Password?
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-quickdocBlue to-quickdocGreen hover:from-quickdocDark hover:to-green-600 text-white py-2 rounded-full font-semibold shadow-sm transition"
              >
                Login
              </button>
            </form>

            <div className="mt-5 text-sm text-gray-500 text-center">
              Don’t have an account?{" "}
              <span
                onClick={() => navigate("/register")}
                className="text-quickdocBlue hover:underline cursor-pointer"
              >
                Register
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-100 py-6 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} QuickDoc. All rights reserved.
      </footer>
    </div>
  );
};

export default Login;
