import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import sass from 'sass';

export default defineConfig({
  base: './',
  plugins: [react()],
  css: {
    modules: false,
    preprocessorOptions: {
      scss: {
        implementation: sass,
      },
    },
  },
  build: {
    minify: 'terser',
    terserOptions: {
      mangle: {
        toplevel: true, // Це мінімізує імена змінних навіть на верхньому рівні, включаючи export
      },
      format: {
        comments: false, // Видаляє коментарі
      },
    },
  },
});
