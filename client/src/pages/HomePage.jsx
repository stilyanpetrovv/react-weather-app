import React, { useState } from 'react';
import useSWR from 'swr';
import axios from 'axios';

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
    if (weather?.showers === 1) {
      rain = "It's raining heavy."
    }
  } else {
    rain = "It's not raining";
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
      <p className="flex items-center">
        <span className="mr-2 text-yellow-300">
          {/* Example icon: Sun for daytime */}
          {timeOfDay === 'Day' ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12.79V11.2a6.002 6.002 0 00-5-5.917V4a2 2 0 10-4 0v1.283A6.002 6.002 0 003 11.2v1.59c0 1.667.333 2.167.917 2.75 2.333 2.333 5.417 3.25 8.083 3.25h.25c2.667 0 5.75-.917 8.083-3.25.584-.583.917-1.083.917-2.75z" />
            </svg>
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
        <span className="font-bold text-purple-300">Weather Code:</span> {weather.weathercode}
      </p>
      <p>
        <span className="font-bold text-yellow-300">Relative humidity:</span> {weather.relative_humidity}
      </p>
      <p>
        <span className="font-bold text-blue-400">Rain:</span> {rain}
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
