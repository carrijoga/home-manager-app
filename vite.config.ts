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
    open: true,
    // Expõe na rede local para testar em dispositivos móveis
    host: true,
    // Encaminha as chamadas de API para o back-end, mantendo tudo na mesma
    // origem do dev server. Evita CORS e permite acesso via IP da rede local.
    proxy: {
      '/api': {
        target: process.env.VITE_PROXY_TARGET || 'https://localhost:7067',
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on('proxyRes', (proxyRes) => {
            const setCookie = proxyRes.headers['set-cookie'];
            if (setCookie) {
              proxyRes.headers['set-cookie'] = setCookie.map((cookie: string) =>
                cookie.replace(/;\s*secure/gi, '')
              );
            }
          });
        },
      },
      '/hubs': {
        target: process.env.VITE_PROXY_TARGET || 'https://localhost:7067',
        changeOrigin: true,
        secure: false,
        ws: true,
        configure: (proxy) => {
          proxy.on('proxyRes', (proxyRes) => {
            const setCookie = proxyRes.headers['set-cookie'];
            if (setCookie) {
              proxyRes.headers['set-cookie'] = setCookie.map((cookie: string) =>
                cookie.replace(/;\s*secure/gi, '')
              );
            }
          });
        },
      },
      '/health': {
        target: process.env.VITE_PROXY_TARGET || 'https://localhost:7067',
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on('proxyRes', (proxyRes) => {
            const setCookie = proxyRes.headers['set-cookie'];
            if (setCookie) {
              proxyRes.headers['set-cookie'] = setCookie.map((cookie: string) =>
                cookie.replace(/;\s*secure/gi, '')
              );
            }
          });
        },
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false, // Desabilita sourcemaps em produção para reduzir tamanho
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;

          // Separa React, React DOM e React Router em chunk próprio
          if (
            id.includes('react/') ||
            id.includes('react-dom/') ||
            id.includes('react-router-dom/') ||
            id.includes('@remix-run/')
          ) {
            return 'react-vendor';
          }

          // Separa Radix UI components
          if (id.includes('@radix-ui/')) {
            return 'radix-ui';
          }

          // Separa biblioteca de gráficos
          if (id.includes('recharts')) {
            return 'charts';
          }

          // Separa bibliotecas de animação e carousel
          if (id.includes('framer-motion') || id.includes('embla-carousel')) {
            return 'animations';
          }

          // Separa utilitários de data
          if (id.includes('date-fns') || id.includes('react-day-picker')) {
            return 'date-utils';
          }

          // Separa ícones e utilitários de classe UI
          if (
            id.includes('lucide-react') ||
            id.includes('class-variance-authority') ||
            id.includes('clsx') ||
            id.includes('tailwind-merge')
          ) {
            return 'ui-utils';
          }
        },
      }
    }
  }
});
