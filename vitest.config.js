import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react({
      jsxRuntime: 'automatic', // Ensures new JSX transform is enabled
    }),],
  test: {
    environment: 'jsdom',
    globals: true,
  },
});