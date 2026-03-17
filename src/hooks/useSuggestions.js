import { useState, useEffect, useRef } from "react";
import { fetchGeoData } from "../services/weatherApi";

function useSuggestions() {
  const [locInput, setLocInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [inputFocused, setInputFocused] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const dropdownRef = useRef(null);
  const inputRef = useRef(null);
  const controllerRef = useRef(null);
  const debounceRef = useRef(null);

  // Debounced suggestions fetch
  useEffect(() => {
    if (locInput.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    // User is typing 3+ chars — hide history, show suggestions
    setShowHistory(false);

    //Clear previous timer
    clearTimeout(debounceRef.current);
    //The debouncing part
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(locInput);
    }, 300);

    return () => clearTimeout(debounceRef.current);
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
        setSelectedIndex(-1);
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

  const clearSuggestionsAndHistory = () => {
    setShowSuggestions(false);
    setLocInput("");
    setSuggestions([]);
    inputRef.current?.blur();
    setShowHistory(false);
  };

  const cancelPendingSuggestions = () => {
    clearTimeout(debounceRef.current);
    controllerRef.current?.abort();
  };

  return {
    locInput,
    setLocInput,
    showSuggestions,
    setShowSuggestions,
    suggestions,
    inputFocused,
    setInputFocused,
    dropdownRef,
    inputRef,
    showHistory,
    setShowHistory,
    clearSuggestionsAndHistory,
    cancelPendingSuggestions,
    selectedIndex,
    setSelectedIndex,
  };
}

export default useSuggestions;
