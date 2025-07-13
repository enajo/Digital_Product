// vite.config.js
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  // 👇 load ALL your .env vars (including VITE_) but we won't actually need VITE_API_URL here
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": `${process.cwd()}/src`,
      },
    },
    define: {
      "import.meta.env": { ...env },
    },
    server: {
      host: true,     // listen on 0.0.0.0 so Codespaces can route to it
      port: 5173,     // your Vite port
      proxy: {
        // anything under /api/* gets forwarded to your Flask app
        "/api": {
          target: "http://localhost:5000",
          changeOrigin: true,
          secure: false,
          // **don’t strip** the /api prefix so that
          // /api/auth/register → http://localhost:5000/api/auth/register
          rewrite: (path) => path
        },
      },
    },
  };
});
