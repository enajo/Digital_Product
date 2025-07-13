import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  // Load all your .env vars (including VITE_*) into import.meta.env
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
      // expose env vars to client
      "import.meta.env": { ...env },
    },
    server: {
      host: true,   // listen on 0.0.0.0 so Codespaces/Docker can reach it
      port: 5173,   // Vite dev server port
      proxy: {
        // forward any /api/* request to our Flask backend container
        "/api": {
          target: "http://backend:5000",
          changeOrigin: true,
          secure: false,
          // keep the /api prefix so your Flask routes match exactly
          rewrite: (path) => path,
        },
      },
    },
  };
});
