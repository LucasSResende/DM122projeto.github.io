export async function getWeatherDatabase() {
  const { default: Dexie } = await import('https://cdn.jsdelivr.net/npm/dexie@4.0.8/+esm');
  const db = new Dexie('weatherDatabase');
  db.version(1).stores({
    weather: '&city, data'
  });
  return db;
}

export async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      await navigator.serviceWorker.register('./sw.js');
      console.log('[Service Worker] Registered');
    } catch (error) {
      console.log('[Service Worker] Registration failed', error);
    }
  }
}
