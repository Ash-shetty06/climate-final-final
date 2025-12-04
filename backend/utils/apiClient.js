import axios from 'axios';
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 3600 });

export const fetchOpenWeatherData = async (lat, lon) => {
  const cacheKey = `openweather-${lat}-${lon}`;
  const cachedData = cache.get(cacheKey);
  if (cachedData) return cachedData;

  try {
    const response = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
      params: {
        lat,
        lon,
        appid: process.env.OPENWEATHER_API_KEY,
        units: 'metric'
      }
    });

    const data = {
      source: 'OpenWeather',
      temp: response.data.main.temp,
      feelsLike: response.data.main.feels_like,
      humidity: response.data.main.humidity,
      windSpeed: response.data.wind.speed,
      rainProb: response.data.clouds.all || 0,
      pressure: response.data.main.pressure,
      visibility: response.data.visibility,
      cloudCover: response.data.clouds.all,
      lastUpdated: new Date(),
      dataQuality: 'reliable'
    };

    cache.set(cacheKey, data);
    return data;
  } catch (error) {
    console.error('OpenWeather API Error:', error.message);
    throw error;
  }
};

export const fetchOpenMeteoAQI = async (lat, lon) => {
  const cacheKey = `openmeteo-aqi-${lat}-${lon}`;
  const cachedData = cache.get(cacheKey);
  if (cachedData) return cachedData;

  try {
    const response = await axios.get('https://air-quality-api.open-meteo.com/v1/air-quality', {
      params: {
        latitude: lat,
        longitude: lon,
        current: 'pm2_5,pm10,ozone,nitrogen_dioxide,carbon_monoxide',
        timezone: 'auto'
      }
    });

    const current = response.data.current;

    let aqi = current.pm2_5 * 4;
    if (aqi > 500) aqi = 500;

    const data = {
      source: 'Open-Meteo',
      aqi: Math.round(aqi),
      pm25: current.pm2_5 || 0,
      pm10: current.pm10 || 0,
      o3: current.ozone || 0,
      no2: current.nitrogen_dioxide || 0,
      co: current.carbon_monoxide || 0,
      lastUpdated: new Date(),
      dataQuality: 'reliable'
    };

    cache.set(cacheKey, data);
    return data;
  } catch (error) {
    console.error('Open-Meteo AQI API Error:', error.message);
    throw error;
  }
};

export const fetchWeatherUnionData = async (lat, lon) => {
  const cacheKey = `weatherunion-${lat}-${lon}`;
  const cachedData = cache.get(cacheKey);
  if (cachedData) return cachedData;

  try {
    const response = await axios.get('https://www.weatherunion.com/gw/weather/external/v0/get_locality_weather_data', {
      params: {
        latitude: lat,
        longitude: lon,
        apikey: process.env.WEATHERUNION_API_KEY
      }
    });

    const data = response.data;
    const weatherData = {
      source: 'WeatherUnion',
      temp: data.temperature || 0,
      feelsLike: data.feels_like || 0,
      humidity: data.humidity || 0,
      windSpeed: data.wind_speed || 0,
      rainProb: data.rain_probability || 0,
      pressure: data.pressure || 0,
      lastUpdated: new Date(),
      dataQuality: 'reliable'
    };

    cache.set(cacheKey, weatherData);
    return weatherData;
  } catch (error) {
    console.error('WeatherUnion API Error:', error.message);
    return null;
  }
};

export const fetchOpenMeteoWeather = async (lat, lon) => {
  const cacheKey = `openmeteo-weather-${lat}-${lon}`;
  const cachedData = cache.get(cacheKey);
  if (cachedData) return cachedData;

  try {
    const response = await axios.get('https://api.open-meteo.com/v1/forecast', {
      params: {
        latitude: lat,
        longitude: lon,
        current: 'temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation',
        timezone: 'auto'
      }
    });

    const current = response.data.current;
    const data = {
      source: 'Open-Meteo',
      temp: current.temperature_2m,
      feelsLike: current.temperature_2m,
      humidity: current.relative_humidity_2m,
      windSpeed: current.wind_speed_10m,
      rainProb: current.precipitation > 0 ? 100 : 0,
      pressure: 0,
      visibility: 0,
      cloudCover: 0,
      lastUpdated: new Date(),
      dataQuality: 'reliable'
    };

    cache.set(cacheKey, data);
    return data;
  } catch (error) {
    console.error('Open-Meteo Weather API Error:', error.message);
    return null;
  }
};

export const clearCache = () => {
  cache.flushAll();
};

export const getCacheStats = () => {
  return cache.getStats();
};
