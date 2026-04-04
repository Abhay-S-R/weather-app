import { useState, useEffect, useRef, useMemo } from "react";
import { preLoadImg } from "../utils/preLoadImg";
import {
  fetchWeatherData,
  fetchGeoData,
  fetchReverseGeoData,
} from "../services/weatherApi";
import { getBackground } from "../utils/getBackground";

function useWeather() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [transitioning, setTransitioning] = useState(false);
  const [prevBgUrl, setPrevBgUrl] = useState(null);

  const weatherControllerRef = useRef(null);

  // IP based search
  useEffect(() => {
    const controller = new AbortController();

    const getIpData = async () => {
      try {
        const ipResponse = await fetch("/api/geo/ip", {
          signal: controller.signal,
        });
        const ipData = await ipResponse.json().catch(() => ({}));

        if (!ipResponse.ok) {
          if (ipResponse.status === 429) {
            throw new Error(ipData.error);
          }
          console.error(`Backend Error (${ipResponse.status}):`, ipData);
          throw new Error("Failed to fetch IP data");
        }

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

  // Abort any pending weather request on unmount
  useEffect(() => {
    return () => {
      weatherControllerRef.current?.abort();
    };
  }, []);

  const searchByCoords = async (lat, lon, name, state, country) => {
    setError(null);
    setLoading(true);
    setTransitioning(true);

    weatherControllerRef.current?.abort();
    const controller = new AbortController();
    weatherControllerRef.current = controller;

    try {
      const weatherData = await fetchWeatherData(
        lat,
        lon,
        name,
        state,
        country,
        controller.signal,
      );

      const newBgUrl = getBackground(weatherData.icon);
      await preLoadImg(newBgUrl);

      setPrevBgUrl(getBackground(weather?.icon));
      setWeather(weatherData);
    } catch (err) {
      if (err.name !== "AbortError") {
        setError(err.message);
        console.error("error: ", err);
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
        setTimeout(() => setTransitioning(false), 400);
      }
      if (weatherControllerRef.current === controller)
        weatherControllerRef.current = null;
    }
  };

  const searchByCity = async (city) => {
    if (!city.trim()) {
      setError("Please enter a city name");
      return;
    }

    setError(null);
    setLoading(true);
    setTransitioning(true);

    weatherControllerRef.current?.abort();
    const controller = new AbortController();
    weatherControllerRef.current = controller;

    try {
      const { geoData } = await fetchGeoData(city, 1, controller.signal);

      if (geoData.length === 0) throw new Error("City not found");

      const { lat, lon, name, state, country } = geoData[0];
      const weatherData = await fetchWeatherData(
        lat,
        lon,
        name,
        state,
        country,
        controller.signal,
      );

      const newBgUrl = getBackground(weatherData.icon);
      await preLoadImg(newBgUrl);

      setPrevBgUrl(getBackground(weather?.icon));
      setWeather(weatherData);
    } catch (err) {
      if (err.name !== "AbortError") {
        setError(err.message);
        console.error("error: ", err);
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
        setTimeout(() => setTransitioning(false), 400);
      }
      if (weatherControllerRef.current === controller)
        weatherControllerRef.current = null;
    }
  };

  //Current-location based search
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        weatherControllerRef.current?.abort();
        const controller = new AbortController();
        weatherControllerRef.current = controller;

        try {
          const { latitude, longitude } = position.coords;
          // reverse geocode to get city name from coords
          const { geoData } = await fetchReverseGeoData(
            latitude,
            longitude,
            controller.signal,
          );
          if (geoData.length === 0)
            throw new Error("Could not determine your city");

          const { name, state, country } = geoData[0];
          const weatherData = await fetchWeatherData(
            latitude,
            longitude,
            name,
            state,
            country,
            controller.signal,
          );
          const newBgUrl = getBackground(weatherData.icon);
          await preLoadImg(newBgUrl);

          setPrevBgUrl(getBackground(weather?.icon));
          setWeather(weatherData);
        } catch (err) {
          if (err.name !== "AbortError") {
            setError(err.message);
            console.error(err);
          }
        } finally {
          if (!controller.signal.aborted) {
            setLoading(false);
          }
          if (weatherControllerRef.current === controller)
            weatherControllerRef.current = null;
        }
      },
      (err) => {
        setLoading(false);
        setError("Location access denied — please enable location permissions");
        console.error(err);
      },
    );
  };

  // The getBackground is just doing a mapping based search
  // Regardless it is a good practice to memoize it. 
  // Note: Memoization will have an impact only when an expensive function need not be executed with every re-render, unless the function itself changes
  const bgUrl = useMemo(() => getBackground(weather?.icon), [weather?.icon]);

  return {
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
  };
}

export default useWeather;
