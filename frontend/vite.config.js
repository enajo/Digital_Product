// vite.config.js
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  // Load all environment variables (including those prefixed VITE_) from .env files
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react()],
    resolve: {
      alias: {
        // Use "@/..." to import from src/
        "@": `${process.cwd()}/src`,
      },
    },
    define: {
      // Make all VITE_ vars available under import.meta.env in your client code
      "import.meta.env": { ...env },
    },
    server: {
      host: true,
      port: 5173,
      proxy: {
        // Proxy /api/* → your Flask backend (default localhost:5000 or override via VITE_API_URL)
        "/api": {
          target: env.VITE_API_URL || "http://localhost:5000",
          changeOrigin: true,
          secure: false,
          // keep the /api prefix so your Flask routes still match
          rewrite: (path) => path,
        },
      },
    },
  };
});
