import "./HomePage.css";
import { useState } from "react";
import WeatherDisplay from "../components/WeatherDisplay";
import { toLocalTime } from "../utils/localTime.js";

function HomePage() {
  const [locInput, setLocInput] = useState("");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const handleSearch = async (city) => {
    if (!city.trim()) {
      setError("Please enter a city name");
      return;
    }

    setError(null);
    setWeather(null);
    setLoading(true);

    try {
      const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
      const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`;
      const geoResponse = await fetch(geoUrl);
      const geoData = await geoResponse.json();
      console.log(geoData);

      if(!geoResponse.ok) throw new Error("Failed to fetch geo data");
      if(geoData.length === 0) throw new Error("City not found")

      const {lat, lon, name} = geoData[0];

      const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
      const weatherResponse = await fetch(weatherUrl);

      if (!weatherResponse.ok) {
        if (weatherResponse.status === 404)
          throw new Error("City not found please try again");
        else throw new Error("Failed to fetch weather data");
      }

      //All API responses are in seconds
      const data = await weatherResponse.json();
      console.log(data);
      const timeSecs = data.timezone / 3600;

      const weatherData = {
        city: name,
        temp: Math.round(data.main.temp),
        description: data.weather[0].description,
        feelsLike: Math.round(data.main.feels_like),
        humidity: data.main.humidity,
        timeSecs: data.timezone,
        timeZone: timeSecs >= 0 ? `UTC+${timeSecs}` : `UTC${timeSecs}`,
        sunrise: toLocalTime(data.sys.sunrise * 1000, data.timezone * 1000),
        sunset: toLocalTime(data.sys.sunset * 1000, data.timezone * 1000),
      };

      setWeather(weatherData);
      setLocInput("");
    } catch (err) {
      setError(err.message);
      console.error("error: ", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="input-container">
        <input
          type="text"
          className="location-input"
          placeholder="Enter city name"
          value={locInput}
          onChange={(e) => setLocInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch(locInput)}
          disabled={loading}
        />
        <button
          className="location-enter-btn"
          onClick={() => handleSearch(locInput)}
          disabled={loading}
        >
          {loading ? "Searching..." : "Enter"}
        </button>
      </div>

      {error && (
        <div className="error-message">
          <p>⚠️ {error}</p>
        </div>
      )}

      {loading && (
        <div className="loading">
          <p>Loading weather data...</p>
        </div>
      )}

      <WeatherDisplay weather={weather} />
    </>
  );
}

export default HomePage;
