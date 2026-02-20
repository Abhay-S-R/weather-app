import "./HomePage.css";
import { useState, useEffect } from "react";
import WeatherDisplay from "../components/WeatherDisplay";

function HomePage() {
  const [locInput, setLocInput] = useState(""); 
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (city) => {
    if(!city.trim()){
      setError("Please enter a city name");
      return;
    }

    setError(null);
    setWeather(null);
    setLoading(true);

    try{
      const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
      
      const response = await fetch(url);

      if(!response.ok){
        if(response.status === 404) throw new Error("City not found please try again");
        else throw new Error("Failed to fetch weather data");
      }

      const data = await response.json();

      const weatherData = {
        city: data.name,
        temp: Math.round(data.main.temp),
        description: data.weather[0].description,
        feelsLike: Math.round(data.main.feels_like),
        humidity: data.main.humidity
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
