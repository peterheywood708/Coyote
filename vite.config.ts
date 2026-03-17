import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig({
  build: {
    target: "esnext", // Enables modern JavaScript features
  },
  plugins: [react()],
  define: { "process.env": {}, global: {} },
  server: {
    host: true,
    strictPort: true,
    port: 8080,
  },
});
