import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react'; // Make sure you have this import for React projects
import path from 'path'; // This import is also needed for path.resolve

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load environment variables based on the current mode (e.g., development, production)
  const env = loadEnv(mode, process.cwd(), ''); // process.cwd() ensures it looks in the current working directory

  return {
    // --- Core Vite Configuration ---

    // The base URL for your deployed application.
    // This is crucial for GitHub Pages, as your app is served from a subpath (your repository name).
    // Replace 'freefire_tournaments' with your actual GitHub repository name if it's different.
    base: '/freefire_tournaments/',

    // Plugins to use (e.g., for React support)
    plugins: [
      react() // This enables React fast refresh and other React-specific optimizations
    ],

    // --- Custom Configuration from your existing file ---

    // Define global constants. Useful for injecting environment variables into your client-side code.
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      // If you have other API keys or env vars, define them here too
      // 'process.env.ANOTHER_VAR': JSON.stringify(env.ANOTHER_VAR),
    },

    // Configure aliases for easier imports
    resolve: {
      alias: {
        // This alias allows you to use '@' for your project root, e.g., import MyComponent from '@/components/MyComponent'
        '@': path.resolve(__dirname, './')
      }
    }

    // --- Other potential Vite configurations (commented out for now, but commonly used) ---
    // server: {
    //   port: 3000, // Customize dev server port
    //   open: true, // Automatically open browser on dev server start
    // },
    // build: {
    //   outDir: 'dist', // Output directory for build artifacts
    //   sourcemap: true, // Generate sourcemaps for debugging
    // },
    // css: {
    //   modules: {
    //     localsConvention: 'camelCaseOnly', // Or 'camelCase' for CSS modules
    //   },
    // },
  };
});