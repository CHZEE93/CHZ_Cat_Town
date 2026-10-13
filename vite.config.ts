import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  server: {
    watch: { usePolling: true, interval: 300 },
    proxy: {
      "/api": {
        target:
          loadEnv(mode, ".", "").API_PROXY_TARGET || "http://localhost:8000",
      },
    },
  },
}));
