import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@services': path.resolve(__dirname, './src/services'),
      '@types': path.resolve(__dirname, './src/types'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@lib': path.resolve(__dirname, './src/lib'),
    },
  },
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: false, // Desabilita sourcemaps em produção para reduzir tamanho
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          // Separa React e React DOM em chunk próprio
          'react-vendor': ['react', 'react-dom'],

          // Separa Radix UI components em chunk próprio
          'radix-ui': [
            '@radix-ui/react-accordion',
            '@radix-ui/react-alert-dialog',
            '@radix-ui/react-avatar',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-label',
            '@radix-ui/react-popover',
            '@radix-ui/react-select',
            '@radix-ui/react-separator',
            '@radix-ui/react-slot'
          ],

          // Separa biblioteca de gráficos (pesada)
          'charts': ['recharts'],

          // Separa bibliotecas de animação e carousel
          'animations': ['framer-motion', 'embla-carousel-react', 'embla-carousel-autoplay'],

          // Separa utilitários de data
          'date-utils': ['date-fns', 'react-day-picker'],

          // Separa ícones e utilitários UI
          'ui-utils': ['lucide-react', 'class-variance-authority', 'clsx', 'tailwind-merge']
        }
      }
    }
  }
});
