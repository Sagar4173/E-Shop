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
    base: "/", // Explicitly set the base path for Vercel deployment
    build: {
      outDir: "dist", // Ensure this matches the outputDirectory in vercel.json
      emptyOutDir: true,
      minify: isProduction ? "esbuild" : false,
      terserOptions: isProduction
        ? {
            compress: {
              drop_console: true, // Remove console logs in production
              drop_debugger: true,
            },
          }
        : undefined,
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
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true,
          secure: false,
        },
        '/uploads': {
          target: 'http://localhost:5000',
          changeOrigin: true,
          secure: false,
        }
      }
    }
  };
});
