
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { define } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // This allows process.env.API_KEY to work in the browser for the Gemini SDK
    'process.env': process.env
  }
});
