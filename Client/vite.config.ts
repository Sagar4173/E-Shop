import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { compression } from "vite-plugin-compression2";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isProduction = mode === "production";

  return {
    plugins: [
      react(),
      tailwindcss(),
      isProduction && compression(), // Only enable compression in production
    ],
    build: {
      minify: isProduction ? "terser" : false,
      terserOptions: {
        compress: {
          drop_console: isProduction, // Remove console logs in production
          drop_debugger: isProduction,
        },
      },
      rollupOptions: {
        output: {
          manualChunks: {
            react: ["react", "react-dom"],
            router: ["react-router-dom"],
            stripe: ["@stripe/react-stripe-js", "@stripe/stripe-js"],
            icons: ["react-icons"],
            utils: ["date-fns"],
          },
        },
      },
      sourcemap: !isProduction, // Only generate sourcemaps in development
      chunkSizeWarningLimit: 1000, // Increase size limit warning threshold
    },
  };
});
