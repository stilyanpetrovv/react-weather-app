import React, { useState } from 'react';
import axios from 'axios';

function WeatherApp() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState('');

  const fetchWeather = async () => {
    setError('');
    setWeather(null); // Reset previous data before new request
    try {
      const response = await axios.get(`http://localhost:3000/api/weather?city=${city}`);
      setWeather(response.data);
    } catch (err) {
      if (err.response) {
        // Server returned an error response
        setError(err.response.data.error || 'Something went wrong!');
      } else {
        // Other errors (e.g., network issues)
        setError('Unable to fetch data. Please try again later.');
      }
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!city.trim()) {
      setError('City name cannot be empty!');
      return;
    }
    fetchWeather();
  };

  return (
    <div className="wrapper">
      <h1>Weather App</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter city name"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <button type="submit">Get Weather</button>
      </form>
      {error && <p className="error">{error}</p>}
      {weather && (
        <div className="weather-details">
          <h3>Weather Details:</h3>
          <p>Temperature: {weather.temperature}°C</p>
          <p>Windspeed: {weather.windspeed} km/h</p>
          <p>Weather Code: {weather.weathercode}</p>
        </div>
      )}
    </div>
  );
}

export default WeatherApp;
