import React, { useState } from 'react';
import useSWR from 'swr';
import axios from 'axios';

const fetcher = (url) => axios.get(url).then((res) => res.data);

function WeatherApp() {
  const [city, setCity] = useState('');
  const [query, setQuery] = useState(null); // Track user-submitted city
  const { data: weather, error, isValidating } = useSWR(
    query ? `http://localhost:3000/api/weather?city=${query}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // Prevent refetch on window focus
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-sm">
        <h1 className="text-xl font-bold mb-4">Weather App</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Enter city name"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full px-4 py-2 border rounded mb-4"
          />
          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
          >
            Get Weather
          </button>
          {isValidating && <p className="text-green-500">Loading...</p>}
          {error && <p className="text-red-500">Error: {error.response?.data?.error || error.    message}</p>}
          {weather && (
          <div>
            <h3>Weather Details:</h3>
            <p>Temperature: {weather.temperature}°C</p>
            <p>Windspeed: {weather.windspeed} km/h</p>
            <p>Weather Code: {weather.weathercode}</p>
            <p>Relative humidity: {weather.relative_humidity}</p>
          </div>
       )}
        </form>
      </div>
    </div>
  );
}

export default WeatherApp;
