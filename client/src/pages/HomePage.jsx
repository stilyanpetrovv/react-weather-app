import React, { useState } from 'react';
import useSWR from 'swr';
import axios from 'axios';
// import react-icons
import { FaSun, FaMoon, FaCloud, FaUmbrella } from "react-icons/fa";
import { WiRain, WiCloud, WiCloudy } from "react-icons/wi";


const fetcher = (url) => axios.get(url).then((res) => res.data);

function WeatherApp() {
  const [city, setCity] = useState('');
  const [query, setQuery] = useState(null); // Track user-submitted city
  const { data: weather, error, isValidating } = useSWR(
    query ? `http://localhost:3000/weather?city=${query}` : null,
    fetcher,
    {
      revalidateOnFocus: false, // Prevent refetch on window focus
      dedupingInterval: 120000, // cache for 2 minutes
    }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!city.trim()) {
      alert('City name cannot be empty!');
      return;
    }
    setQuery(city); // Trigger SWR fetch by setting query
  };

  let timeOfDay = "";
  if (weather?.is_day === 1) {
    timeOfDay = "Day";
  } else {
    timeOfDay = "Night";
  }

  let rain = "";
  if (weather?.rain === 1) {
    rain = "It's raining";
  } else if (weather?.showers > 0) {
    rain = "It's raining";
  } else {
    rain = "It's not raining";
  }

  let cloudCover = "";
  if (weather?.cloud_cover <= 40 && weather?.cloud_cover >= 20) {
    cloudCover = "Partially cloudy";
  } else {
    cloudCover = "Cloudy";
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-gray-200">
      <div className="bg-gray-800 p-8 rounded shadow-md w-full max-w-sm">
      <h1 className="text-xl font-bold mb-4 text-gray-100">Weather App</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter city name"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="w-full px-4 py-2 border border-gray-600 rounded mb-4 bg-gray-700 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          Get Weather
        </button>
        {isValidating && <p className="text-green-400 mt-4">Loading...</p>}
        {error && <p className="text-red-400 mt-4">Error: {error.response?.data?.error || error.message}</p>}
        {weather && (
          <div className="mt-4 flex flex-col items-center justify-center text-center bg-gray-700 p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold text-gray-100 mb-4">Weather Details</h3>
            <div className="flex flex-col items-center gap-2">
              {/* Time of day conditions */}
              <p className="flex items-center">
                <span className="mr-2 text-yellow-300">
                  {timeOfDay === 'Day' ? (
                    <FaSun className="text-yellow-500 text-xl mb-0.5"/>
                  ) : (
                    <FaMoon className="text-indigo-700 text-xl mb-0.5"/>
                  )}
                </span>
                Right now it's: {timeOfDay}
              </p>
              <p>
                <span className="font-bold text-teal-300">Temperature:</span> {weather.temperature}°C
              </p>
              <p>
                <span className="font-bold text-blue-300">Windspeed:</span> {weather.windspeed} km/h
              </p>
              <p>
                <span className="font-bold text-yellow-300">Relative humidity:</span> {weather.relative_humidity}
              </p>
              {/* cloudy weather conditions */}
              <p className="flex items-center">
                <span className="text-blue-400 mr-1">
                  {cloudCover === "Partially cloudy" ? (
                    <WiCloud className="text-indigo-700 text-4xl mb-0.5" />
                  ) : (
                    <WiCloudy className="text-indigo-700 text-4xl mb-0.5" />
                  )}
                </span>
                <span className="font-bold text-indigo-700">Cloud cover:</span>
                <span className="ml-1">{cloudCover}</span>
              </p>
              {/* rain conditions */}
              <p className="flex items-center">
                <span className="font-bold text-blue-400 mr-1">
                  Rain: {rain === "It's raining" ? (
                    <WiRain className="text-indigo-700 text-xl mb-1"/>
                    ) : (null)} </span> {rain}
              </p>
            </div>
        </div>
      )}
       </form>
      </div>
    </div>
  );
}

export default WeatherApp;
