export default async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    const success = () => console.log('[Service Worker] Registered');
    const failed = () => console.log('[Service Worker] Registration failed');
    
    navigator.serviceWorker.register('./sw.js')
      .then(success)
      .catch(failed);
  }
}
