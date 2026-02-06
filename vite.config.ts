import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // GitHub Pages alt klasöründe çalışabilmesi için relative path
  build: {
    outDir: 'dist',
  }
});