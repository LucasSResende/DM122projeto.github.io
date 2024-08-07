import getWeatherDatabase from './database.js';

export async function addWeatherData(city, data) {
  const db = await getWeatherDatabase();
  await db.weather.put({ city, data });
}

export async function getWeatherData(city) {
  const db = await getWeatherDatabase();
  return db.weather.get(city);
}

export async function updateWeatherData(city, data) {
  const db = await getWeatherDatabase();
  await db.weather.put({ city, data });
}

export async function deleteWeatherData(city) {
  const db = await getWeatherDatabase();
  await db.weather.delete(city);
}
