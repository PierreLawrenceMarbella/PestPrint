import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ command }) => ({
  plugins: [react(), tailwindcss()],
  base: command === "serve" ? "/" : "/static/app/",
  build: { outDir: "../static/app", emptyOutDir: true },
  server: { proxy: { "/api": "http://127.0.0.1:5000" } },
}));
