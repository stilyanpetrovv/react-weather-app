import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { cors } from 'hono/cors'
import fetch from "node-fetch";
import NodeCache from 'node-cache';

const app = new Hono();
const weatherCache = new NodeCache({ stdTTL: 60 }); // Cache TTL of 1 minute (60 seconds)

app.use('*', cors({
  origin: 'http://localhost:5173',
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['POST', 'GET', 'OPTIONS'],
  exposeHeaders: ['Content-Length'],
  maxAge: 600,
  credentials: true,
}))

app.get('/api/weather', async (c) => {
  const city = c.req.query("city")?.trim().toLocaleLowerCase();

  // Input validation
  if (!city || city.trim() === "") {
    return c.json({ error : "City name cannot be empty!" }, 400);
  }

  // Check cache
  const cachedWeather = weatherCache.get(city);
  if (cachedWeather) {
    console.log(`Cache hit for city: ${city}`);
    return c.json(cachedWeather);
  }

  console.log(`Cache miss for city: ${city}`);

  try {    
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
    
    // Cache the fetched weather data
    weatherCache.set(city, weatherData);

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
