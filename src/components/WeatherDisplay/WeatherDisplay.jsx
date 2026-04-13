import "./WeatherDisplay.css";
import { toLocalTime } from "../../../shared/localTime";
import { useState, useEffect } from "react";

// Pure functions
const toF = (c) => Math.round((c * 9) / 5 + 32);
const displayTemp = (c, useFahrenheit) => (useFahrenheit ? toF(c) : c);
const to12h = (timeStr) => {
  if (!timeStr) return timeStr;
  const parts = timeStr.split(":");
  let hours = parseInt(parts[0], 10);
  const suffix = hours >= 12 ? " PM" : " AM";
  hours = hours % 12 || 12;
  return `${hours}:${parts.slice(1).join(":")}${suffix}`;
};
const displayTime = (t, use12Hour) => (use12Hour ? to12h(t) : t);

const getVisibilityInfo = (meters) => {
  const km = meters / 1000;
  if (km >= 10)
    return { desc: "Excellent", tip: "Crystal clear, horizon sharp" };
  if (km >= 5) return { desc: "Good", tip: "Clear, slight haze far away" };
  if (km >= 2)
    return { desc: "Moderate", tip: "Noticeable haze, distant objects fade" };
  if (km >= 1)
    return { desc: "Poor", tip: "Fog/smog, visibility clearly reduced" };
  return { desc: "Very Poor", tip: "Dense fog, unsafe for driving" };
};

function WeatherDisplay({ weather }) {
  const [localTime, setLocalTime] = useState("");
  const [useFahrenheit, setUseFahrenheit] = useState(false);
  const [use12Hour, setUse12Hour] = useState(false);
  const [showGust, setShowGust] = useState(false);

  const unit = useFahrenheit ? "°F" : "°C";

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

  const iconUrl = `https://openweathermap.org/img/wn/${weather.icon}@2x.png`;

  return (
    <div
      className="weather-display"
      role="region"
      aria-label="Weather information"
    >
      <h2 className="city-name">
        {weather.city}
        {weather.state && `, ${weather.state}`}, {weather.country}
      </h2>

      <div className="weather-hero">
        <img className="weather-icon" src={iconUrl} alt={weather.description} />
        <p className="temperature">
          {displayTemp(weather.temp, useFahrenheit)}
          {unit}
        </p>
      </div>

      <p className="description">{weather.description}</p>

      <div className="toggle-buttons">
        <button
          className="unit-toggle-btn"
          onClick={() => setUseFahrenheit((prev) => !prev)}
          aria-pressed={useFahrenheit}
          aria-label={
            useFahrenheit ? "Switch to Celsius" : "Switch to Fahrenheit"
          }
        >
          Switch to {useFahrenheit ? "°C" : "°F"}
        </button>
        <button
          className="unit-toggle-btn"
          onClick={() => setUse12Hour((prev) => !prev)}
          aria-pressed={use12Hour}
          aria-label={
            use12Hour ? "Switch to 24-hour time" : "Switch to 12-hour time"
          }
        >
          Switch to {use12Hour ? "24h" : "12h"}
        </button>
      </div>

      <div className="weather-details-grid">
        <div className="detail-item">
          <span className="detail-icon" aria-hidden="true">
            🌡️
          </span>
          <div className="detail-content">
            <span className="detail-label">Feels Like</span>
            <span className="detail-value">
              {displayTemp(weather.feelsLike, useFahrenheit)}
              {unit}
            </span>
          </div>
        </div>

        <div className="detail-item">
          <span className="detail-icon" aria-hidden="true">
            💧
          </span>
          <div className="detail-content">
            <span className="detail-label">Humidity</span>
            <span className="detail-value">{weather.humidity}%</span>
          </div>
        </div>

        <div className="detail-item">
          <span className="detail-icon" aria-hidden="true">
            🌍
          </span>
          <div className="detail-content">
            <span className="detail-label">Time Zone</span>
            <span className="detail-value">{weather.timeZone}</span>
          </div>
        </div>

        <div className="detail-item">
          <span className="detail-icon" aria-hidden="true">
            🕐
          </span>
          <div className="detail-content">
            <span className="detail-label">Local Time</span>
            <span className="detail-value">{displayTime(localTime, use12Hour)}</span>
          </div>
        </div>

        <div className="detail-item">
          <span className="detail-icon" aria-hidden="true">
            🌅
          </span>
          <div className="detail-content">
            <span className="detail-label">Sunrise</span>
            <span className="detail-value">{displayTime(weather.sunrise, use12Hour)}</span>
          </div>
        </div>

        <div className="detail-item">
          <span className="detail-icon" aria-hidden="true">
            🌇
          </span>
          <div className="detail-content">
            <span className="detail-label">Sunset</span>
            <span className="detail-value">{displayTime(weather.sunset, use12Hour)}</span>
          </div>
        </div>
        <div className="detail-item visibility-item">
          <span className="detail-icon" aria-hidden="true">
            👁️
          </span>
          <div className="detail-content">
            <span className="detail-label">Visibility</span>
            <span className="detail-value">
              {(weather.visibility / 1000).toFixed(1)} km ·{" "}
              {getVisibilityInfo(weather.visibility).desc}
            </span>
            <span className="visibility-tip">
              {getVisibilityInfo(weather.visibility).tip}
            </span>
          </div>
        </div>

        <div className="detail-item">
          <span className="detail-icon" aria-hidden="true">
            ☁️
          </span>
          <div className="detail-content">
            <span className="detail-label">Cloudiness</span>
            <span className="detail-value">{weather.cloudiness}%</span>
          </div>
        </div>

        <div className="detail-item">
          <span className="detail-icon" aria-hidden="true">
            🔻
          </span>
          <div className="detail-content">
            <span className="detail-label">Pressure</span>
            <span className="detail-value">{weather.pressure} hPa</span>
          </div>
        </div>
      </div>

      {/* Wind widget */}
      <div className="wind-widget">
        <div className="wind-header">
          <span className="detail-icon" aria-hidden="true">
            💨
          </span>
          <span className="wind-title">Wind</span>
        </div>

        <div className="wind-body">
          <div className="wind-direction">
            <div
              className="wind-arrow"
              style={{ transform: `rotate(${weather.windDeg}deg)` }}
              title={`Wind direction: ${weather.windDeg}°`}
              role="img"
              aria-label={`Wind direction: ${weather.windDeg} degrees`}
            >
              ↑
            </div>
            <span className="wind-deg-label">{weather.windDeg}°</span>
          </div>

          <div className="wind-speed-section">
            <div className="wind-speed-display">
              <span className="wind-speed-value">
                {showGust ? (weather.windGust ?? "N/A") : weather.windSpeed}
              </span>
              <span className="wind-speed-unit">
                {typeof (showGust ? weather.windGust : weather.windSpeed) ===
                "number"
                  ? " m/s"
                  : ""}
              </span>
            </div>

            <div className="wind-speed-label-row">
              <span className={`wind-tab ${!showGust ? "active" : ""}`}>
                Speed
                <span className="wind-tooltip">
                  The sustained wind speed — the average wind velocity measured
                  over a period.
                </span>
              </span>
              <button
                className="wind-toggle-btn"
                onClick={() => setShowGust((prev) => !prev)}
                aria-pressed={showGust}
                aria-label={showGust ? "Show wind speed" : "Show wind gust"}
              >
                {showGust ? "← Speed" : "Gust →"}
              </button>
              <span className={`wind-tab ${showGust ? "active" : ""}`}>
                Gust
                <span className="wind-tooltip">
                  A brief burst of wind that exceeds the sustained speed —
                  usually lasts only a few seconds.
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WeatherDisplay;
