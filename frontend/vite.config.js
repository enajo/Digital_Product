// vite.config.js
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  // Load .env variables prefixed with VITE_ into import.meta.env
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": `${process.cwd()}/src`,   // import paths starting with @ map to src/
      },
    },
    define: {
      // expose all loaded VITE_ variables to your client code
      "import.meta.env": { ...env },
    },
    server: {
      host: true,
      port: 5173,
      proxy: {
        // any request starting with /api will be forwarded to your Flask backend
        "/api": {
          target: env.VITE_API_URL || "http://localhost:5000",
          changeOrigin: true,
          secure: false,
           rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
  };
});
