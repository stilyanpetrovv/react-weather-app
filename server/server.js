import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { cors } from 'hono/cors'
import fetch from "node-fetch";

const app = new Hono();

app.use('*', cors({
  origin: 'http://localhost:5173',
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['POST', 'GET', 'OPTIONS'],
  exposeHeaders: ['Content-Length'],
  maxAge: 600,
  credentials: true,
}))

const cache = new Map();
const CACHE_EXPIRATION = 10 * 60 * 1000 // 10 minutes in milliseconds

app.get('/api/weather', async (c) => {
  const city = c.req.query("city");

  // Input validation
  if (!city || city.trim() === "") {
    return c.json({ error : "City name cannot be empty!" }, 400);
  }

  try {
    // cache check first
    if (cache.has(city)) {
      const { data, timestamp } = cache.get(city);
      const isExpired = Date.now() - timestamp > CACHE_EXPIRATION;

      if (!isExpired) {
        console.log("Serving from cache: ", city);
        return c.json(data);
      }
      // If expired, delete the cache history
      cache.delete(city);
      console.log("deleting cache")
    }

    // step 1: Get city coordinates using Nominatim API
    const geoResponse = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}`
    );

    const geoData = await geoResponse.json();

    if (!geoData || geoData.length === 0) {
      return c.json({ error: "City not found. Please check the city name." }, 404);
    }

    const { lat, lon } = geoData[0]; // Extract latitude and longitude

    // step 2: Fetch weather data
    const weatherResponse = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
    );

    if (!weatherResponse.ok) {
      return c.json({ error: "Failed to fetch weather data." }, 500);
    }

    const weatherData = await weatherResponse.json();

    // simplify the result
    const result = {
      temperature: weatherData.current_weather.temperature,
      windspeed: weatherData.current_weather.windspeed,
      weathercode: weatherData.current_weather.weathercode,
    };

    return c.json(result);
  } catch (error) {
    console.error("Error ferching weather data: ", error);
    return c.json({ error: "Internal server error." }, 500);
  }
});

// Start the server
serve({
  fetch: app.fetch,
  port: 3000,
});

console.log('Server is running on http://localhost:3000');
