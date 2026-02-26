import { toLocalTime } from "./localTime.js";

export function buildWeatherData(data, name, state, country) {
  const timeSecs = data.timezone / 3600;

  const weatherData = {
    city: name,
    state: state || null,
    country: country,
    temp: Math.round(data.main.temp),
    temp_min: Math.round(data.main.temp_min),
    temp_max: Math.round(data.main.temp_max),
    description: data.weather[0].description,
    feelsLike: Math.round(data.main.feels_like),
    humidity: data.main.humidity,
    icon: data.weather[0].icon,
    timeSecs: data.timezone,
    timeZone: timeSecs >= 0 ? `UTC+${timeSecs}` : `UTC${timeSecs}`,
    sunrise: toLocalTime(data.sys.sunrise * 1000, data.timezone * 1000),
    sunset: toLocalTime(data.sys.sunset * 1000, data.timezone * 1000),
    visibility: data.visibility,
    windSpeed: data.wind.speed,
    windDeg: data.wind.deg,
    windGust: data.wind.gust,
    cloudiness: data.clouds.all,
    pressure: data.main.pressure,
  };

  return weatherData;
}

