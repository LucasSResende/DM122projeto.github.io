import { addWeatherData, getWeatherData, updateWeatherData, deleteWeatherData } from './helpers/repo-db.js';
import registerServiceWorker from './helpers/install-sw.js';

const apiKey = '180ae62922ddd7603d823745a17b6ef5';
const weatherForm = document.getElementById('weather-form');
const weatherResult = document.getElementById('weather-result');

weatherForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const city = document.getElementById('city').value;
  
  let weatherData = await getWeatherData(city);
  if (weatherData) {
    displayWeather(weatherData.data);
  } else {
    weatherData = await fetchWeatherFromAPI(city);
    if (weatherData) {
      await addWeatherData(city, weatherData);
      displayWeather(weatherData);
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

function displayWeather(data) {
  const temperatureInCelsius = (data.main.temp - 273.15).toFixed(2);
  weatherResult.innerHTML = `
    <h2>${data.name}</h2>
    <p>Temperatura: ${temperatureInCelsius}°C</p>
    <p>Clima: ${data.weather[0].description}</p>
  `;
}


registerServiceWorker();
