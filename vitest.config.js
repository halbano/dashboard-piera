import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    exclude: ["node_modules", ".netlify"],
    environmentMatchGlobs: [
      ["src/**/*.component.test.*", "jsdom"],
    ],
  },
});
