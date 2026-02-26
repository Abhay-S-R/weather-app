import { toLocalTime } from "../utils/localTime.js";
import { useState, useEffect } from "react";

function WeatherDisplay({ weather }) {
  const [localTime, setLocalTime] = useState("");

  useEffect(() => {
    if (!weather) return;

    const tick = () => {
      setLocalTime(toLocalTime(Date.now(), weather.timeSecs * 1000, true));
    };
    tick();

    const interval = setInterval(tick, 1000);

    return () => clearInterval(interval);
  }, [weather]);

  if (!weather) return null;

  return (
    <div className="weather-display">
      <h2>{weather.city}</h2>
      <p className="temperature">{weather.temp}°C</p>
      <p className="description">{weather.description}</p>
      <p className="feels-like">Feels like: {weather.feelsLike}°C</p>
      <p className="humidity">Humidity: {weather.humidity}%</p>
      <p className="timezone">Time Zone: {weather.timeZone}</p>
      <p className="current-time">Time: {localTime}</p>
      <p className="sunrise">Sunrise: {weather.sunrise}</p>
      <p className="sunset">Sunset: {weather.sunset}</p>
    </div>
  );
}

export default WeatherDisplay;
