import "./HomePage.css";
import { useState, useEffect, useRef } from "react";
import WeatherDisplay from "../components/WeatherDisplay";
import ChatPanel from "../components/ChatPanel";
import useWeather from "../hooks/useWeather.js";
import useSuggestions from "../hooks/useSuggestions.js";
import useSearchHistory from "../hooks/useSearchHistory.js";

function HomePage() {
  const {
    weather,
    loading,
    error,
    transitioning,
    prevBgUrl,
    setPrevBgUrl,
    bgUrl,
    searchByCoords,
    searchByCity,
    getCurrentLocation,
    setError,
  } = useWeather();

  const {
    locInput,
    setLocInput,
    showSuggestions,
    setShowSuggestions,
    suggestions,
    inputFocused,
    dropdownRef,
    inputRef,
    setInputFocused,
    selectedIndex,
    setSelectedIndex,
    showHistory,
    setShowHistory,
    clearSuggestionsAndHistory,
    cancelPendingSuggestions,
  } = useSuggestions();

  const { searchHistory, clearHistory } = useSearchHistory(weather);

  // Fetch weather using lat/lon directly (used by suggestion clicks, not directly by user typing in the input box)
  const fetchWeatherByCoords = async (suggestion) => {
    clearSuggestionsAndHistory();

    searchByCoords(
      suggestion.lat,
      suggestion.lon,
      suggestion.name,
      suggestion.state,
      suggestion.country,
    );
  };

  // Text-based search
  const textSearch = async (city) => {
    clearSuggestionsAndHistory();
    cancelPendingSuggestions();

    searchByCity(city);
  };

  //Keyboard Nav for Input
  const keyboardNav = (e) => {
    const activeList = showSuggestions
      ? suggestions
      : showHistory
        ? searchHistory
        : [];

    //Since we have "Use my current location maxIndex will be +1"
    const maxIndex = activeList.length;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < maxIndex ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > -1 ? prev - 1 : -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      setInputFocused(false);

      if (selectedIndex === 0) {
        setShowSuggestions(false);
        setShowHistory(false);
        getCurrentLocation();
      } else if (selectedIndex > 0 && activeList.length > 0) {
        const rawItem =
          activeList === searchHistory
            ? [...searchHistory].reverse()[selectedIndex - 1]
            : activeList[selectedIndex - 1];

        const selectedItem =
          activeList === searchHistory
            ? {
                lat: rawItem.lat,
                lon: rawItem.lon,
                name: rawItem.city,
                state: rawItem.state,
                country: rawItem.country,
              }
            : rawItem;

        fetchWeatherByCoords(selectedItem);
      } else {
        textSearch(locInput);
      }
    }
  };

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
              setSelectedIndex(-1);
              if (e.target.value.length > 0) {
                setShowHistory(false);
              } else if (searchHistory.length > 0) {
                setShowHistory(true);
                setShowSuggestions(false);
              }
            }}
            onKeyDown={(e) => {
              keyboardNav(e);
            }}
            onFocus={() => {
              setInputFocused(true);
              setSelectedIndex(-1);
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
                className={`suggestion-item use-location-item ${selectedIndex === 0 ? "selected" : ""}`}
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
                className={`suggestion-item ${selectedIndex === idx + 1 ? "selected" : ""}`}
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
                className={`suggestion-item use-location-item ${selectedIndex === 0 ? "selected" : ""}`}
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
                  clearHistory();
                  setShowHistory(false);
                }}
              >
                Clear
              </button>
            </li>
            {[...searchHistory].reverse().map((h, idx) => (
              <li
                key={`${h.city}-${h.country}-${idx}`}
                className={`suggestion-item history-item ${selectedIndex === idx + 1 ? "selected" : ""}`}
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
              className={`suggestion-item use-location-item ${selectedIndex === 0 ? "selected" : ""}`}
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
