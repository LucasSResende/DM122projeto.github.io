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
      displayWeather(city, weatherData);
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

export default async function getWeatherDatabase() {
  const { default: Dexie } = await import('https://cdn.jsdelivr.net/npm/dexie@4.0.8/+esm');
  const db = new Dexie('weatherDatabase');
  db.version(1).stores({
    weather: '&city, data'
  });
  return db;
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
    const editButton = document.createElement('button');
    editButton.className = 'edit';
    editButton.innerHTML = '<img src="images/edit.png" alt="Editar">';
    editButton.addEventListener('click', () => editWeather(weather.city));
    
    const deleteButton = document.createElement('button');
    deleteButton.className = 'delete';
    deleteButton.innerHTML = '<img src="images/recycle.png" alt="Excluir">';
    deleteButton.addEventListener('click', () => deleteWeather(weather.city));
    
    actionsCell.appendChild(editButton);
    actionsCell.appendChild(deleteButton);
  });
}

async function editWeather(city) {
  const db = await getWeatherDatabase();
  const weatherData = await db.weather.get(city);
  const newCity = prompt('Novo nome para a cidade:', city);
  if (newCity && newCity !== city) {
    const updatedData = { ...weatherData.data };
    await db.weather.put({ city: newCity, data: updatedData });
    await db.weather.delete(city);
    updateWeatherTable();
  }
}

async function deleteWeather(city) {
  await deleteWeatherData(city);
  updateWeatherTable();
}

document.addEventListener('DOMContentLoaded', 
  () => {updateWeatherTable();
});

registerServiceWorker();
