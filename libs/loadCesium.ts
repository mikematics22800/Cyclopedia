import type * as CesiumType from 'cesium';

declare global {
  interface Window {
    Cesium?: typeof CesiumType;
    CESIUM_BASE_URL?: string;
  }
}

let loadPromise: Promise<typeof CesiumType> | null = null;

export function loadCesium(): Promise<typeof CesiumType> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Cesium can only load in the browser'));
  }

  if (window.Cesium) {
    return Promise.resolve(window.Cesium);
  }

  if (!loadPromise) {
    window.CESIUM_BASE_URL = '/cesium/';
    loadPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = '/cesium/Cesium.js';
      script.async = true;
      script.onload = () => {
        if (window.Cesium) {
          resolve(window.Cesium);
          return;
        }
        reject(new Error('Cesium failed to initialize'));
      };
      script.onerror = () => reject(new Error('Failed to load /cesium/Cesium.js'));
      document.head.appendChild(script);
    });
  }

  return loadPromise;
}
