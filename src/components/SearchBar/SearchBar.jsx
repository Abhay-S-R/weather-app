import "./SearchBar.css";
import useSuggestions from "../../hooks/useSuggestions.js";

// Private sub-component
function DropdownItem({ className, isSelected, onClick, icon, name, meta }) {
  return (
    <li
      className={`suggestion-item ${className || ""} ${isSelected ? "selected" : ""}`}
      onClick={onClick}
    >
      <span className="suggestion-name">
        {icon && `${icon} `}
        {name}
      </span>
      {meta && <span className="suggestion-meta">{meta}</span>}
    </li>
  );
}

function SearchBar({
  onSearch,
  onSelectSuggestion,
  onGetCurrentLocation,
  searchHistory,
  clearHistory,
  loading,
}) {
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

  // Fetch weather using lat/lon directly (used by suggestion clicks, not directly by user typing in the input box)
  const fetchWeatherByCoords = (suggestion) => {
    clearSuggestionsAndHistory();
    onSelectSuggestion(suggestion);
  };

  // Text-based search
  const textSearch = (city) => {
    clearSuggestionsAndHistory();
    cancelPendingSuggestions();
    onSearch(city);
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
        onGetCurrentLocation();
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
            <DropdownItem
              className="use-location-item"
              isSelected={selectedIndex === 0}
              onClick={() => {
                setInputFocused(false);
                setShowSuggestions(false);
                onGetCurrentLocation();
              }}
              icon="📍"
              name="Use my current location"
            />
          )}
          {suggestions.map((s, idx) => (
            <DropdownItem
              key={`${s.lat}-${s.lon}-${idx}`}
              isSelected={selectedIndex === idx + 1}
              onClick={() => {
                setInputFocused(false);
                fetchWeatherByCoords(s);
              }}
              name={s.name}
              meta={[s.state, s.country].filter(Boolean).join(", ")}
            />
          ))}
        </ul>
      )}

      {showHistory && !showSuggestions && searchHistory.length > 0 && (
        <ul className="suggestions-list history-list">
          {inputFocused && (
            <DropdownItem
              className="use-location-item"
              isSelected={selectedIndex === 0}
              onClick={() => {
                setInputFocused(false);
                setShowHistory(false)
                onGetCurrentLocation();
              }}
              icon="📍"
              name="Use my current location"
            />
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
            <DropdownItem
              key={`${h.city}-${h.country}-${idx}`}
              className="history-item"
              isSelected={selectedIndex === idx + 1}
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
              name={h.city}
              icon="🕐"
              meta={[h.state, h.country].filter(Boolean).join(", ")}
            />
          ))}
        </ul>
      )}

      {/* Show location option even when no suggestions or history */}
      {inputFocused && !showSuggestions && !showHistory && (
        <ul className="suggestions-list">
          <DropdownItem
            className="use-location-item"
            isSelected={selectedIndex === 0}
            onClick={() => {
              setInputFocused(false);
              onGetCurrentLocation();
            }}
            icon="📍"
            name="Use my current location"
          />
        </ul>
      )}
    </div>
  );
}

export default SearchBar;
