import "./HomePage.css";
import { useState, useEffect, useRef } from "react";
import WeatherDisplay from "../components/WeatherDisplay";
import ChatPanel from "../components/ChatPanel";
import { buildWeatherData } from "../utils/buildWeatherData.js";
import { getBackground } from "../utils/getBackground.js";

//All API responses are in seconds

//WeatherAPI
const fetchWeatherData = async (lat, lon, name, state, country, signal) => {
  const weatherResponse = await fetch(`/api/weather?lat=${lat}&lon=${lon}`, {
    signal: signal,
  });
  if (!weatherResponse.ok) {
    throw new Error("Failed to fetch weather data");
  }
  const data = await weatherResponse.json();
  return buildWeatherData(data, name, state, country);
};

//GeoCoding API - direct
const fetchGeoData = async (query, limit = 1, signal) => {
  const geoResponse = await fetch(
    `/api/geo/direct?q=${encodeURIComponent(query)}&limit=${limit}`,
    { signal: signal },
  );
  const geoData = await geoResponse.json();
  return { geoResponse, geoData };
};

//GeoCoding API - reverse
const fetchReverseGeoData = async (lat, lon) => {
  const geoResponse = await fetch(`/api/geo/reverse?lat=${lat}&lon=${lon}`);
  const geoData = await geoResponse.json();
  return { geoResponse, geoData };
};

const preloadImg = (src) => {
  return new Promise((resolve) => {
    if (!src) return resolve();
    const img = new Image();
    img.src = src;
    img.onload = resolve;
    img.onerror = resolve;
  });
};

function HomePage() {
  const [locInput, setLocInput] = useState("");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [inputFocused, setInputFocused] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [prevBgUrl, setPrevBgUrl] = useState(null);

  const dropdownRef = useRef(null);
  const inputRef = useRef(null);
  const controllerRef = useRef(null);

  const [searchHistory, setSearchHistory] = useState(() => {
    const saved = localStorage.getItem("weather-history");
    return saved ? JSON.parse(saved) : [];
  });
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (weather) {
      setSearchHistory((prev) => {
        // Deduplicate by city + country
        const filtered = prev.filter(
          (h) => !(h.city === weather.city && h.country === weather.country),
        );

        const updatedHistory = [...filtered.slice(-4), weather];
        localStorage.setItem("weather-history", JSON.stringify(updatedHistory));
        return updatedHistory;
      });
    }
  }, [weather]);

  // Debounced suggestions fetch
  useEffect(() => {
    if (locInput.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    // User is typing 3+ chars — hide history, show suggestions
    setShowHistory(false);

    //The debouncing part
    const timerId = setTimeout(() => {
      fetchSuggestions(locInput);
    }, 300);

    return () => clearTimeout(timerId);
  }, [locInput]);

  // Click outside to dismiss
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowSuggestions(false);
        setShowHistory(false);
        setInputFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const getIpData = async () => {
      try {
        const ipData = await fetch("/api/geo/ip", {
          signal: controller.signal,
        }).then((res) => res.json());

        const weatherData = await fetchWeatherData(
          parseFloat(ipData.latitude),
          parseFloat(ipData.longitude),
          ipData.city,
          ipData.region,
          ipData.country_code,
          controller.signal,
        );
        setWeather(weatherData);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Failed to fetch IP data", err);
        }
      }
    };

    getIpData();

    return () => {
      controller.abort();
    };
  }, []);

  //Suggestions to be shown in the drop-down
  const fetchSuggestions = async (query) => {
    try {
      //Abort previous request
      controllerRef.current?.abort();

      const controller = new AbortController();
      controllerRef.current = controller;
      const { geoData } = await fetchGeoData(query, 5, controller.signal);

      if (geoData.length > 0) {
        setSuggestions(geoData);
        setShowSuggestions(true);
        setShowHistory(false);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        setSuggestions([]);
        setShowSuggestions(false);
        console.error("Failed to fetch suggestions", err);
      }
    }
  };

  // Fetch weather using lat/lon directly (used by suggestion clicks, not directly by user)
  const fetchWeatherByCoords = async (suggestion) => {
    setError(null);
    setLoading(true);
    setTransitioning(true);
    setShowSuggestions(false);
    setLocInput("");
    setSuggestions([]);
    inputRef.current?.blur();
    setShowHistory(false);

    try {
      const { lat, lon, name, state, country } = suggestion;
      const weatherData = await fetchWeatherData(
        lat,
        lon,
        name,
        state,
        country,
      );

      const newBgUrl = getBackground(weatherData.icon);
      await preloadImg(newBgUrl);

      setPrevBgUrl(getBackground(weather?.icon));
      setWeather(weatherData);
    } catch (err) {
      setError(err.message);
      console.error("error: ", err);
    } finally {
      setLoading(false);
      setTimeout(() => setTransitioning(false), 400);
    }
  };

  // Text-based search
  const textSearch = async (city) => {
    if (!city.trim()) {
      setError("Please enter a city name");
      return;
    }

    setError(null);
    setLoading(true);
    setTransitioning(true);
    setShowSuggestions(false);
    setSuggestions([]);

    try {
      const { geoResponse, geoData } = await fetchGeoData(city);
      if (!geoResponse.ok) throw new Error("Failed to fetch geo data");
      if (geoData.length === 0) throw new Error("City not found");

      const { lat, lon, name, state, country } = geoData[0];
      const weatherData = await fetchWeatherData(
        lat,
        lon,
        name,
        state,
        country,
      );

      const newBgUrl = getBackground(weatherData.icon);
      await preloadImg(newBgUrl);

      setPrevBgUrl(getBackground(weather?.icon));
      setWeather(weatherData);
      setLocInput("");
      inputRef.current?.blur(); //mobile keyboard
      setShowHistory(false);
    } catch (err) {
      setError(err.message);
      console.error("error: ", err);
    } finally {
      setLoading(false);
      setTimeout(() => setTransitioning(false), 400);
    }
  };

  //IP based search
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          // reverse geocode to get city name from coords
          const { geoData } = await fetchReverseGeoData(latitude, longitude);
          if (geoData.length === 0)
            throw new Error("Could not determine your city");

          const { name, state, country } = geoData[0];
          const weatherData = await fetchWeatherData(
            latitude,
            longitude,
            name,
            state,
            country,
          );
          const newBgUrl = getBackground(weatherData.icon);
          await preloadImg(newBgUrl);

          setPrevBgUrl(getBackground(weather?.icon));
          setWeather(weatherData);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        setLoading(false);
        setError("Location access denied — please enable location permissions");
        console.error(err);
      },
    );
  };

  const bgUrl = getBackground(weather?.icon);

  return (
    <>
      {/* Previous background for crossfade */}
      {prevBgUrl && prevBgUrl !== bgUrl && (
        <div
          className="weather-bg active"
          style={{ backgroundImage: `url(${prevBgUrl})` }}
        />
      )}
      <div
        className={`weather-bg ${bgUrl ? "active" : ""}`}
        style={bgUrl ? { backgroundImage: `url(${bgUrl})` } : {}}
        onTransitionEnd={() => setPrevBgUrl(null)}
      />
      <header className="app-header">
        <h1 className="app-title">Havāmāna</h1>
        <p className="app-subtitle">Real-time weather, anywhere in the world</p>
      </header>

      <div className="search-wrapper" ref={dropdownRef}>
        <div className="input-container">
          <input
            ref={inputRef}
            type="text"
            className="location-input"
            placeholder="Search for a city..."
            value={locInput}
            onChange={(e) => {
              setLocInput(e.target.value);
              if (e.target.value.length > 0) {
                setShowHistory(false);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setInputFocused(false);
                textSearch(locInput);
              }
            }}
            onFocus={() => {
              setInputFocused(true);
              if (locInput.length === 0 && searchHistory.length > 0) {
                setShowHistory(true);
                setShowSuggestions(false);
              } else if (suggestions.length > 0) {
                setShowSuggestions(true);
              }
            }}
            disabled={loading}
          />
          <button
            className="location-enter-btn"
            onClick={() => {
              setInputFocused(false);
              textSearch(locInput);
            }}
            disabled={loading}
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>

        {showSuggestions && suggestions.length > 0 && (
          <ul className="suggestions-list">
            {inputFocused && (
              <li
                className="suggestion-item use-location-item"
                onClick={() => {
                  setInputFocused(false);
                  setShowSuggestions(false);
                  getCurrentLocation();
                }}
              >
                <span className="suggestion-name">
                  📍 Use my current location
                </span>
              </li>
            )}
            {suggestions.map((s, idx) => (
              <li
                key={`${s.lat}-${s.lon}-${idx}`}
                className="suggestion-item"
                onClick={() => {
                  setInputFocused(false);
                  fetchWeatherByCoords(s);
                }}
              >
                <span className="suggestion-name">{s.name}</span>
                <span className="suggestion-meta">
                  {[s.state, s.country].filter(Boolean).join(", ")}
                </span>
              </li>
            ))}
          </ul>
        )}

        {showHistory && !showSuggestions && searchHistory.length > 0 && (
          <ul className="suggestions-list history-list">
            {inputFocused && (
              <li
                className="suggestion-item use-location-item"
                onClick={() => {
                  setInputFocused(false);
                  setShowHistory(false);
                  getCurrentLocation();
                }}
              >
                <span className="suggestion-name">
                  📍 Use my current location
                </span>
              </li>
            )}
            <li className="history-header">
              <span>Recent searches</span>
              <button
                className="clear-history-btn"
                onClick={() => {
                  setSearchHistory([]);
                  localStorage.removeItem("weather-history");
                  setShowHistory(false);
                }}
              >
                Clear
              </button>
            </li>
            {[...searchHistory].reverse().map((h, idx) => (
              <li
                key={`${h.city}-${h.country}-${idx}`}
                className="suggestion-item history-item"
                onClick={() => {
                  setInputFocused(false);
                  setShowHistory(false);
                  fetchWeatherByCoords({
                    lat: h.lat,
                    lon: h.lon,
                    name: h.city,
                    state: h.state,
                    country: h.country,
                  });
                }}
              >
                <span className="suggestion-name">🕐 {h.city}</span>
                <span className="suggestion-meta">
                  {[h.state, h.country].filter(Boolean).join(", ")}
                </span>
              </li>
            ))}
          </ul>
        )}

        {/* Show location option even when no suggestions or history */}
        {inputFocused && !showSuggestions && !showHistory && (
          <ul className="suggestions-list">
            <li
              className="suggestion-item use-location-item"
              onClick={() => {
                setInputFocused(false);
                getCurrentLocation();
              }}
            >
              <span className="suggestion-name">
                📍 Use my current location
              </span>
            </li>
          </ul>
        )}
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

      <div
        className={`weather-content ${transitioning ? "transitioning" : ""}`}
      >
        <WeatherDisplay weather={weather} />
        <ChatPanel weather={weather} />
      </div>
    </>
  );
}

export default HomePage;
