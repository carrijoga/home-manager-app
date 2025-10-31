import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { ThemeProvider } from './contexts/ThemeContext';
import './index.css';
import './animations.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>,
);

// Registrar Service Worker para PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('✅ Service Worker registrado com sucesso:', registration.scope);

        // Verificar atualizações periodicamente
        setInterval(() => {
          registration.update();
        }, 60000); // Verifica a cada minuto
      })
      .catch((error) => {
        console.error('❌ Falha ao registrar Service Worker:', error);
      });

    // Detectar quando o app está pronto para instalação
    let deferredPrompt;
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      console.log('💡 App pronto para instalação');

      // Você pode criar um botão de instalação aqui
      // e usar deferredPrompt.prompt() quando o usuário clicar
    });

    // Detectar quando o app foi instalado
    window.addEventListener('appinstalled', () => {
      console.log('🎉 PWA instalado com sucesso!');
      deferredPrompt = null;
    });
  });
}
