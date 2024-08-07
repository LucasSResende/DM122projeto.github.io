import { addWeatherData, getWeatherData, updateWeatherData, deleteWeatherData } from './helpers/repo-db.js';
import registerServiceWorker from './helpers/install-sw.js';

const apiKey = '180ae62922ddd7603d823745a17b6ef5';
const weatherForm = document.getElementById('weather-form');
const weatherResult = document.getElementById('weather-result');
const weatherTable = document.getElementById('weather-table').getElementsByTagName('tbody')[0];

weatherForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const city = document.getElementById('city').value;

  let weatherData = await getWeatherData(city);
  if (weatherData) {
    displayWeather(city, weatherData.data);
  } else {
    weatherData = await fetchWeatherFromAPI(city);
    if (weatherData) {
      await addWeatherData(city, weatherData);
      displayWeather(city, weatherData);
      updateWeatherTable();
    }
  }
});

async function fetchWeatherFromAPI(city) {
  try {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch weather data', error);
  }
}

function displayWeather(city, data) {
  const temperatureInCelsius = (data.main.temp - 273.15).toFixed(2);
  weatherResult.innerHTML = `
    <h2>${city}</h2>
    <p>Temperatura: ${temperatureInCelsius}°C</p>
    <p>Clima: ${data.weather[0].description}</p>
    <button id="save-weather-button">Salvar</button>
  `;

  document.getElementById('save-weather-button').onclick = () => saveWeather(city, temperatureInCelsius, data.weather[0].description);
}

async function saveWeather(city, temperature, description) {
  const data = { temperature, description };
  await addWeatherData(city, data);
  updateWeatherTable();
}

async function updateWeatherTable() {
  weatherTable.innerHTML = ''; // Clear the table before re-populating
  const db = await getWeatherDatabase();
  const allWeatherData = await db.weather.toArray();

  allWeatherData.forEach((weather) => {
    const row = weatherTable.insertRow();
    row.insertCell().textContent = weather.city;
    row.insertCell().textContent = weather.data.temperature + '°C';
    row.insertCell().textContent = weather.data.description;

    const actionsCell = row.insertCell();
    actionsCell.innerHTML = `
      <button class="edit" onclick="editWeather('${weather.city}')">Editar</button>
      <button class="delete" onclick="deleteWeather('${weather.city}')">Excluir</button>
    `;
  });
}

async function editWeather(city) {
  const db = await getWeatherDatabase();
  const weatherData = await db.weather.get(city);
  const newCity = prompt('Novo nome para a cidade:', city);
  if (newCity && newCity !== city) {
    const updatedData = { ...weatherData.data, city: newCity };
    await updateWeatherData(newCity, updatedData);
    await deleteWeatherData(city);
    updateWeatherTable();
  }
}

async function deleteWeather(city) {
  await deleteWeatherData(city);
  updateWeatherTable();
}

// Initialize the table on load
document.addEventListener('DOMContentLoaded', updateWeatherTable);

registerServiceWorker();
