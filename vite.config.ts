import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    base: './', // GitHub Pages relative path
    build: {
      outDir: 'dist',
    },
    define: {
      // Stringify the env object so it's injected as a proper object literal
      'process.env': JSON.stringify(env)
    }
  };
});