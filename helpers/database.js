export default async function getWeatherDatabase() {
  const { default: Dexie } = await import('https://cdn.jsdelivr.net/npm/dexie@4.0.8/+esm');
  const db = new Dexie('weatherDatabase');
  db.version(1).stores({
    weather: '&city, data'
  });
  return db;
}
