import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environmentMatchGlobs: [
      // Component tests use jsdom; pure logic tests use default (node)
      ["src/**/*.component.test.*", "jsdom"],
    ],
  },
});
