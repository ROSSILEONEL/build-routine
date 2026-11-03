import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // Todo lo que empiece con /api va al backend de Express
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
});
