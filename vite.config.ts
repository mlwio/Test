import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path, { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

// ES module e __dirname fix
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer(),
          ),
          await import("@replit/vite-plugin-dev-banner").then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": resolve(__dirname, "client", "src"),
      "@shared": resolve(__dirname, "shared"),
      "@assets": resolve(__dirname, "attached_assets"),
    },
  },
  root: resolve(__dirname, "client"),
  build: {
    outDir: resolve(__dirname, "dist", "public"),
    emptyOutDir: true,
    rollupOptions: {
      input: resolve(__dirname, "client", "index.html"),
    },
  },
  css: {
    postcss: resolve(__dirname, "postcss.config.js"),
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
