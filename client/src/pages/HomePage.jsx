import React, { useState } from 'react';
import useSWR from 'swr';
import axios from 'axios';
// import react-icons
import { FaSun, FaMoon } from "react-icons/fa";
import { WiNightClear, WiDaySunny, WiSnow, WiThermometer, WiStrongWind, WiRain, WiCloud, WiCloudy, WiHumidity } from "react-icons/wi";


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

  // Time of day check
  let timeOfDay = "";

  if (weather?.is_day === 1) {
    timeOfDay = "Day";
  } else {
    timeOfDay = "Night";
  }

  // Rain  and snow check
  let rainDescription = ""; // Renamed variable to avoid confusion with `rain`

  if (weather?.rain >= 0.1 && weather?.rain < 0.2) {
    rainDescription = "It's raining slightly";
  } else if (weather?.rain >= 0.2 && weather?.rain < 0.5) {
    rainDescription = "It's raining moderately";
  } else if (weather?.rain >= 0.5 && weather?.rain < 1) {
    rainDescription = "It's raining heavily";
  } else if (weather?.rain >= 1) {
    rainDescription = "It's raining very heavily";
  } else {
    rainDescription = "It's not raining";
  }

  if (weather?.showers >= 0.1 && weather?.showers < 0.2) {
    rainDescription = "It's raining slightly";
  } else if (weather?.showers >= 0.2 && weather?.showers < 0.5) {
    rainDescription = "It's raining moderately";
  } else if (weather?.showers >= 0.5 && weather?.showers < 1) {
    rainDescription = "It's raining heavily";
  } else if (weather?.showers >= 1) {
    rainDescription = "It's raining very heavily";
  } else {
    rainDescription = "It's not raining";
  }

  // snowfall check
  let snowfall = "";
  
  if (weather?.snowfall > 0) {
    snowfall = "It's snowing";
  }

  // Cloud cover check
  let cloudCover = "";

  if (weather?.cloud_cover >= 0 && weather?.cloud_cover < 20) {
    cloudCover = "Clear";
  } else if (weather?.cloud_cover >= 20 && weather?.cloud_cover <= 40) {
    cloudCover = "Partially cloudy";
  } else if (weather?.cloud_cover > 40 && weather?.cloud_cover <= 70) {
    cloudCover = "Mostly cloudy";
  } else if (weather?.cloud_cover > 70 && weather?.cloud_cover <= 100) {
    cloudCover = "Overcast";
  } else {
    cloudCover = "Cloud cover data unavailable";
  }

  // Render page
  return (
    <div className="min-h-screen flex items-center justify-center scale-125 bg-gray-900 text-gray-200">
      <div className="bg-gray-800 p-8 rounded shadow-md w-full max-w-sm">
      <h1 className="text-xl font-bold mb-4 text-gray-100 text-center">Weather App</h1>
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
        {/* Weather info */}
        {weather && (
          <div className="mt-4 flex flex-col items-center justify-center text-center bg-gray-700 p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold text-gray-100 mb-4">Weather Details</h3>
            <div className="flex flex-col items-center gap-2 space-y-0.5">
              {/* Time of day conditions */}
              <div>
                {weather?.is_day === 0 ? (
                  <p className="flex items-center">
                    <span><FaMoon className="text-indigo-700 text-xl mr-2 mb-1"/></span>
                    <span className="font-bold text-indigo-700 mr-2">
                      Right now it's: </span> {timeOfDay}
                  </p> 
                ) : (
                  // render day
                  <p className="flex items-center">
                    <span><FaSun className="text-yellow-500 text-xl mr-2 mb-1"/></span>
                    <span className="font-bold text-yellow-500 mr-2">
                      Right now it's: </span> {timeOfDay}
                  </p>
                )}
              </div>
              <p className='flex items-center'>
                <span><WiThermometer className='text-teal-300 text-3xl mb-0.5'/></span>
                <span className="font-bold text-teal-300 mr-2">Temperature:</span> {weather.temperature}°C
              </p>
              {/* wind speed */}
              <p className='flex items-center'>
                <span><WiStrongWind className='text-blue-300 text-3xl mr-1 mb-1'/></span>
                <span className="font-bold text-blue-300 mr-2">
                  Windspeed:</span> {weather.windspeed} km/h
              </p>
              {/* humidity */}
              <p className="flex items-center">
                <span><WiHumidity className='text-yellow-300 text-3xl mb-0.5'/></span>
                <span className="font-bold text-yellow-300 mr-2">
                  Relative humidity: </span> {weather.relative_humidity}
              </p>
              {/* cloudy weather conditions */}
              <p className="flex items-center">
                <span className="text-pink-500 mr-0.5">
                  {cloudCover === "Clear" && weather?.is_day === 1 ? (
                    <WiDaySunny className="text-pink-500 text-3xl" />
                  ) : cloudCover === "Clear" && weather?.is_day === 0 ? (
                    <WiNightClear className="text-pink-500 text-4xl mb-1 -mr-0.5" />
                  ) : cloudCover === "Partially cloudy" ? (
                    <WiCloud className="text-pink-500 text-4xl" />
                  ) : (
                    <WiCloudy className="text-pink-500 text-4xl" />
                  )}
                </span>
                <span className="font-bold text-pink-500 mr-2">Cloud cover:</span> {cloudCover}
              </p>
              {/* rain conditions */}
              <div>
                {/* Render only if there's rain or snow */}
                {weather?.rain > 0 || weather?.snowfall > 0 || weather?.showers > 0 ? (
                  <div>
                    {/* Check if snow is greater than rain */}
                    {weather?.snowfall > weather?.rain ? (
                      <p className="flex items-center">
                        <span><WiSnow className="text-blue-400 text-3xl mr-1"/></span>
                        <span className="font-bold text-blue-400 mr-2">Snow:</span> {snowfall}
                      </p>
                    ) : (
                      <p className="flex items-center">
                        <span><WiRain className="text-blue-400 text-3xl mr-1"/></span>
                        <span className="font-bold text-blue-400 mr-2">Rain:</span> {rainDescription}
                      </p>
                    )}
                  </div>
                ) : null}
              </div>
            </div>
        </div>
      )}
       </form>
      </div>
    </div>
  );
}

export default WeatherApp;