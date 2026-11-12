/**
 * Helper para registro e ciclo de vida do Service Worker no navegador.
 */

interface SWRegistrationCallbacks {
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
}

export function registerServiceWorker(callbacks?: SWRegistrationCallbacks) {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  window.addEventListener('load', () => {
    const swUrl = '/sw.js';

    navigator.serviceWorker
      .register(swUrl)
      .then((registration) => {
        registration.onupdatefound = () => {
          const installingWorker = registration.installing;
          if (!installingWorker) return;

          installingWorker.onstatechange = () => {
            if (installingWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                // Conteúdo novo disponível
                if (callbacks?.onUpdate) {
                  callbacks.onUpdate(registration);
                }
              } else {
                // Conteúdo armazenado em cache para uso offline
                if (callbacks?.onSuccess) {
                  callbacks.onSuccess(registration);
                }
              }
            }
          };
        };
      })
      .catch((error) => {
        console.warn('Falha no registro do Service Worker:', error);
      });
  });
}

export function unregisterServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        console.error(error.message);
      });
  }
}
