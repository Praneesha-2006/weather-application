const apiKey = '31911f09593786caffacdfe6399231ad';

const form = document.getElementById("searchForm");
const cityInput = document.getElementById("cityInput");

const weatherCard = document.getElementById("weatherCard");
const forecastCard = document.getElementById("forecastCard");
const forecastList = document.getElementById("forecastList");

const cityNameEl = document.getElementById("cityName");
const conditionEl = document.getElementById("condition");
const tempEl = document.getElementById("temp");
const feelsEl = document.getElementById("feelsLike");
const windEl = document.getElementById("wind");
const humidEl = document.getElementById("humid");

form.addEventListener("submit", function (event) {
  event.preventDefault();
  const city = cityInput.value.trim();
  if (city) {
    fetchWeatherByCity(city);
  }
});

window.addEventListener("load", () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        fetchWeatherByLocation(latitude, longitude);
      },
      () => {
        console.warn('Geolocation permission denied.');
      }
    );
  }
});

async function fetchWeatherByCity(city) {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.cod === 200) {
      updateWeatherCard(data);
      fetchForecast(data.coord.lat, data.coord.lon);
      applyTheme(data.dt, data.timezone);
    } else {
      alert('City not found. Please try again.');
    }
  } catch (error) {
    alert('Error fetching weather data.');
    console.error(error);
  }
}

async function fetchWeatherByLocation(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    updateWeatherCard(data);
    fetchForecast(lat, lon);
    applyTheme(data.dt, data.timezone);
  } catch (error) {
    alert('Error fetching location-based weather.');
    console.error(error);
  }
}

function updateWeatherCard(data) {
  cityNameEl.textContent = data.name;
  tempEl.textContent = Math.round(data.main.temp);
  feelsEl.textContent = Math.round(data.main.feels_like);
  conditionEl.textContent = data.weather[0].description;
  windEl.textContent = Math.round(data.wind.speed);
  humidEl.textContent = data.main.humidity;
  weatherCard.classList.remove("hidden");
}

async function fetchForecast(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
  try {
    const response = await fetch(url);
    const data = await response.json();

    const daily = {};
    data.list.forEach(item => {
      const date = item.dt_txt.split(" ")[0];
      if (!daily[date]) {
        daily[date] = item;
      }
    });

    const dates = Object.keys(daily).slice(1, 4); // Next 3 days
    forecastList.innerHTML = '';
    dates.forEach(date => {
      const item = daily[date];
      const day = new Date(item.dt_txt).toLocaleDateString(undefined, { weekday: 'short' });
      const html = `
        <div>
          <p class="label">${day}</p>
          <p>${Math.round(item.main.temp)}°C</p>
          <p>${item.weather[0].description}</p>
        </div>
      `;
      forecastList.innerHTML += html;
    });

    forecastCard.classList.remove("hidden");
  } catch (error) {
    console.error("Forecast fetch failed", error);
  }
}

function applyTheme(timestamp, timezoneOffset) {
  const localTime = new Date((timestamp + timezoneOffset) * 1000);
  const hour = localTime.getUTCHours();
  document.body.classList.remove("day", "night");
  if (hour >= 6 && hour < 18) {
    document.body.classList.add("day");
  } else {
    document.body.classList.add("night");
  }
}

