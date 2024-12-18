import React, { useState } from 'react';
import useSWR from 'swr';

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function HomePage() {
  const [city, setCity] = useState('');
  const [searchCity, setSearchCity] = useState(''); // For triggering the API call

  // SWR fetch hook
  const { data, error, isLoading } = useSWR(
    searchCity ? `http://localhost:3000/api/weather?city=${searchCity}` : null, // Only fetch if searchCity is not empty
    fetcher,
    { revalidateOnFocus: false } // Optional: Disable revalidation on window focus
  );

  // Handle form submission
  const handleSearch = (e) => {
    e.preventDefault();
    if (city.trim()) {
      setSearchCity(city); // Trigger SWR to fetch the weather data
    } else {
      alert('Please enter a valid city name.');
    }
  };

  return (
    <div className="wrapper">
      <h1>Weather App</h1>
      <form onSubmit={handleSearch}>
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Enter city name"
        />
        <button type="submit">Search</button>
      </form>

      {/* Display loading, error, or weather data */}
      {isLoading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>Error fetching weather data.</p>}
      {data && !data.error && (
        <div className="weather-details">
          <h3>Weather Details:</h3>
          <p>Temperature: {data.temperature}°C</p>
          <p>Windspeed: {data.windspeed} km/h</p>
          <p>Weather Code: {data.weathercode}</p>
        </div>
      )}
      {data?.error && <p style={{ color: 'red' }}>{data.error}</p>}
    </div>
  );
}
