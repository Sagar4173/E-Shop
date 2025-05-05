import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isProduction = mode === "production";

  return {
    plugins: [react(), tailwindcss()],
    base: "/",
    build: {
      minify: isProduction, // Simplified minification setting
      sourcemap: !isProduction,
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        // Disable platform-specific optimizations
        treeshake: true,
        output: {
          manualChunks: {
            react: ["react", "react-dom"],
            router: ["react-router-dom"],
          },
        },
      },
    },
    optimizeDeps: {
      include: ["react", "react-dom", "react-router-dom"],
    },
    define: {
      "process.env.NODE_ENV": JSON.stringify(
        isProduction ? "production" : "development"
      ),
    },
  };
});
