import React from "react";
import { useNavigate } from "react-router-dom";
import { FaRegClock, FaUserMd, FaShieldAlt } from "react-icons/fa";
import ElderImage from "../assets/elder.jpg";
import { FaSearch, FaMapMarkerAlt, FaGlobe, FaArrowRight } from "react-icons/fa";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-quickdocGray via-white to-quickdocGray font-brand relative">
      {/* Navbar */}
      <div className="absolute top-0 left-0 w-full flex justify-between items-center py-6 px-6 max-w-7xl mx-auto z-20">
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
            onClick={() => navigate("/contact")}
            className="hover:text-quickdocDark transition"
          >
            Contact
          </button>
          <button
            onClick={() => navigate("/register")}
            className="bg-quickdocBlue text-white px-4 py-2 rounded-full shadow hover:bg-quickdocDark transition"
          >
            Sign Up
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex flex-col lg:flex-row items-center justify-center overflow-hidden pt-28 px-6">
        {/* Left: Text & Buttons */}
        <div className="z-10 w-full lg:w-1/2 px-8 text-center lg:text-left py-10">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-quickdocDark mb-6 animate-fade-in max-w-lg mx-auto lg:mx-0 leading-snug">
            Healthcare at Your Fingertips
          </h1>
          <p className="text-base sm:text-lg text-gray-600 mb-8 animate-fade-in-delay max-w-lg mx-auto lg:mx-0">
            Seamlessly book last-minute medical appointments & manage your clinic with ease.
            A smarter way to connect patients and clinics in real-time.
          </p>

          <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-3">
            <button
              onClick={() => navigate("/login?role=patient")}
              className="flex-1 border border-quickdocBlue text-quickdocBlue px-4 py-2 rounded-full font-medium hover:bg-quickdocBlue hover:text-white transition text-sm shadow"
            >
              I'm a Patient
            </button>
            <button
              onClick={() => navigate("/login?role=clinic")}
              className="flex-1 border border-quickdocGreen text-quickdocGreen px-4 py-2 rounded-full font-medium hover:bg-quickdocGreen hover:text-white transition text-sm shadow"
            >
              I'm a Clinic
            </button>
            <button
              onClick={() => navigate("/login?role=admin")}
              className="flex-1 border border-gray-700 text-gray-700 px-4 py-2 rounded-full font-medium hover:bg-gray-700 hover:text-white transition text-sm shadow"
            >
              Admin Access
            </button>
          </div>
        </div>

        {/* Right: Hero Image */}
        <div className="w-full lg:w-1/2 relative h-80 lg:h-full mt-8 lg:mt-0">
          <img
            src={ElderImage}
            alt="Doctor with patient"
            className="object-cover w-full h-full grayscale contrast-110 opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-quickdocGray via-transparent to-quickdocGray opacity-30"></div>
        </div>
      </section>

{/* Search Bar Section */}
<section className="px-6 mt-16 max-w-5xl mx-auto z-20 relative">
  <div className="flex items-center bg-white rounded-full shadow-lg overflow-hidden border border-gray-200">
    {/* Specialist / Doctor Input */}
    <div className="flex items-center flex-1 px-4">
      <FaSearch className="text-quickdocDark mr-2 text-lg" />
      <input
        type="text"
        placeholder="Search specialist or doctor"
        className="w-full py-3 bg-transparent focus:outline-none text-sm text-quickdocDark placeholder-gray-400"
      />
    </div>

    {/* Divider */}
    <div className="h-8 w-px bg-gray-300"></div>

    {/* Language Dropdown */}
    <div className="flex items-center flex-1 px-4">
      <FaGlobe className="text-quickdocDark mr-2 text-lg" />
      <select
        className="w-full py-3 bg-transparent focus:outline-none text-sm text-quickdocDark placeholder-gray-400"
        defaultValue=""
      >
        <option value="" disabled>Select language</option>
        <option value="english">English</option>
        <option value="german">German</option>
        <option value="spanish">Spanish</option>
        {/* Add more if needed */}
      </select>
    </div>

    {/* Divider */}
    <div className="h-8 w-px bg-gray-300"></div>

    {/* City Input */}
    <div className="flex items-center flex-1 px-4">
      <FaMapMarkerAlt className="text-quickdocDark mr-2 text-lg" />
      <input
        type="text"
        placeholder="e.g., Berlin or 12043"
        className="w-full py-3 bg-transparent focus:outline-none text-sm text-quickdocDark placeholder-gray-400"
      />
    </div>

    {/* Search Button */}
    <button className="bg-gradient-to-r from-quickdocBlue/80 via-quickdocGreen/70 to-quickdocBlue/80 text-white px-6 py-3 flex items-center justify-center font-semibold text-sm transition hover:opacity-90">
      Search <FaArrowRight className="ml-2" />
    </button>
  </div>
</section>
      {/* Features Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-white to-quickdocGray text-center">
        <h2 className="text-3xl font-bold text-quickdocDark mb-14">Why Choose QuickDoc?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Feature 1 */}
          <div className="relative bg-white rounded-xl p-8 shadow-lg hover:shadow-2xl transition transform hover:-translate-y-2 border border-transparent hover:border-quickdocBlue">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-tr from-quickdocBlue to-quickdocGreen p-4 rounded-full shadow-lg">
              <FaRegClock className="text-white text-2xl" />
            </div>
            <h3 className="text-lg font-semibold mt-8 mb-3 text-quickdocBlue">Instant Booking</h3>
            <p className="text-gray-600 text-sm">
              Book appointments in real-time, no more endless calls or waiting lists.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="relative bg-white rounded-xl p-8 shadow-lg hover:shadow-2xl transition transform hover:-translate-y-2 border border-transparent hover:border-quickdocGreen">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-tr from-green-500 to-quickdocBlue p-4 rounded-full shadow-lg">
              <FaUserMd className="text-white text-2xl" />
            </div>
            <h3 className="text-lg font-semibold mt-8 mb-3 text-quickdocGreen">Clinic Efficiency</h3>
            <p className="text-gray-600 text-sm">
              Keep your calendar full by filling cancellations instantly and managing patients with ease.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="relative bg-white rounded-xl p-8 shadow-lg hover:shadow-2xl transition transform hover:-translate-y-2 border border-transparent hover:border-quickdocDark">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-tr from-gray-700 to-quickdocDark p-4 rounded-full shadow-lg">
              <FaShieldAlt className="text-white text-2xl" />
            </div>
            <h3 className="text-lg font-semibold mt-8 mb-3 text-quickdocDark">Trusted & Secure</h3>
            <p className="text-gray-600 text-sm">
              Your privacy is our priority—GDPR-compliant & secure data handling built-in.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section with Wave */}
      <section className="relative">
        <div className="absolute top-0 left-0 w-full overflow-hidden leading-[0] rotate-180">
          <svg className="relative block w-full h-16" viewBox="0 0 1440 320">
            <path
              fill="#2563EB"
              fillOpacity="0.2"
              d="M0,288L48,272C96,256,192,224,288,208C384,192,480,192,576,176C672,160,768,128,864,138.7C960,149,1056,203,1152,224C1248,245,1344,235,1392,229.3L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            ></path>
          </svg>
        </div>

        <div className="py-20 px-6 bg-gradient-to-r from-quickdocBlue/80 via-quickdocGreen/70 to-quickdocBlue/80 text-center text-white">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">Join QuickDoc Today</h2>
          <p className="text-lg max-w-2xl mx-auto mb-8">
            Revolutionize your healthcare experience. QuickDoc is trusted by thousands of patients and clinics across the country.
          </p>
          <button
            onClick={() => navigate("/register?role=patient")}
            className="bg-white text-quickdocBlue px-8 py-3 rounded-full text-lg font-semibold shadow-lg hover:scale-105 transition"
          >
            Get Started Now
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 py-6 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} QuickDoc. All rights reserved.
      </footer>
    </div>
  );
};

export default Home;
