/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        quickdocBlue: "#2563EB",   // Tailwind blue-600
        quickdocBlueLight: "#3B82F6", // Slightly lighter blue for gradients/buttons
        quickdocGreen: "#059669",  // Tailwind green-600 (for accents)
        quickdocGray: "#F9FAFB",   // Tailwind gray-50 (backgrounds)
        quickdocDark: "#1E3A8A",   // Tailwind blue-900 (deep contrast)
        quickdocSoft: "#E0F2FE",   // Light blue background alternative
      },
      fontFamily: {
        brand: ["'Poppins'", "sans-serif"],
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        subtlePulse: {
          "0%, 100%": { opacity: 1 },
          "50%": { opacity: 0.7 },
        },
      },
      animation: {
        "fade-in": "fadeIn 1s ease-in-out",
        "fade-in-delay": "fadeIn 1.5s ease-in-out",
        "pulse-soft": "subtlePulse 3s ease-in-out infinite",
      },
      boxShadow: {
        glow: "0 0 15px rgba(37, 99, 235, 0.6)", // nice blue glow
        soft: "0 4px 14px rgba(0, 0, 0, 0.1)",   // subtle card shadow
      },
      backgroundImage: {
        "hero-gradient":
          "linear-gradient(to bottom right, #2563EB, #3B82F6, #2563EB)", // blended smooth gradient
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    // Future: require('@tailwindcss/forms'), require('@tailwindcss/typography')
  ],
};
