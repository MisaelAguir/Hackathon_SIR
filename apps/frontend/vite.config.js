import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/assistant": "http://localhost:8000",
      "/geocode": "http://localhost:8000",
      "/incidents": "http://localhost:8000",
    },
  },
});
