import "./WeatherDisplay.css";
import { toLocalTime } from "../../utils/localTime";
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
      <h2 className="city-name">{weather.city}</h2>
      <p className="temperature">{weather.temp}°C</p>
      <p className="description">{weather.description}</p>

      <div className="weather-details-grid">
        <div className="detail-item">
          <span className="detail-icon">🌡️</span>
          <div className="detail-content">
            <span className="detail-label">Feels Like</span>
            <span className="detail-value">{weather.feelsLike}°C</span>
          </div>
        </div>

        <div className="detail-item">
          <span className="detail-icon">💧</span>
          <div className="detail-content">
            <span className="detail-label">Humidity</span>
            <span className="detail-value">{weather.humidity}%</span>
          </div>
        </div>

        <div className="detail-item">
          <span className="detail-icon">🌍</span>
          <div className="detail-content">
            <span className="detail-label">Time Zone</span>
            <span className="detail-value">{weather.timeZone}</span>
          </div>
        </div>

        <div className="detail-item">
          <span className="detail-icon">🕐</span>
          <div className="detail-content">
            <span className="detail-label">Local Time</span>
            <span className="detail-value">{localTime}</span>
          </div>
        </div>

        <div className="detail-item">
          <span className="detail-icon">🌅</span>
          <div className="detail-content">
            <span className="detail-label">Sunrise</span>
            <span className="detail-value">{weather.sunrise}</span>
          </div>
        </div>

        <div className="detail-item">
          <span className="detail-icon">🌇</span>
          <div className="detail-content">
            <span className="detail-label">Sunset</span>
            <span className="detail-value">{weather.sunset}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WeatherDisplay;
