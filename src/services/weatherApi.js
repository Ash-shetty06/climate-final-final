import axios from 'axios';
import { WEATHER_API } from './apiConfig';

export const fetchHistoricalData = async (lat, lon, startDate, endDate) => {
    try {
        const response = await axios.get(WEATHER_API.HISTORICAL, {
            params: { lat, lon, startDate, endDate }
        });
        return response.data.data || [];
    } catch (error) {
        console.error("Error fetching historical data:", error);
        return [];
    }
};

export const fetchCurrentWeather = async (lat, lon) => {
    try {
        const response = await axios.get(WEATHER_API.CURRENT, {
            params: { lat, lon }
        });
        return response.data.data || null;
    } catch (error) {
        console.error("Error fetching current weather:", error);
        return null;
    }
};

export const fetchCurrentAQI = async (lat, lon) => {
    try {
        const response = await axios.get(WEATHER_API.AQI, {
            params: { lat, lon }
        });
        return response.data.data || null;
    } catch (error) {
        console.error("Error fetching current AQI:", error);
        return null;
    }
};

export const fetchMetNorwayWeather = async (lat, lon) => {
    try {
        const response = await axios.get(WEATHER_API.MET_NORWAY, {
            params: { lat, lon }
        });
        return response.data.data || null;
    } catch (error) {
        console.warn("MET Norway API error:", error.message);
        return null;
    }
};

export const fetchWaqiFeed = async (lat, lon) => {
    try {
        const response = await axios.get(WEATHER_API.WAQI, {
            params: { lat, lon }
        });
        return response.data.data || null;
    } catch (error) {
        console.warn("WAQI API error:", error.message);
        return null;
    }
};

export const searchCities = async (query) => {
    try {
        if (!query || query.length < 2) return [];

        const response = await axios.get(WEATHER_API.SEARCH_CITIES, {
            params: { query }
        });
        return response.data.data || [];
    } catch (error) {
        console.error("Error searching cities:", error);
        return [];
    }
};

export const fetchHourlyForecast = async (lat, lon) => {
    try {
        const response = await axios.get(WEATHER_API.HOURLY, {
            params: { lat, lon }
        });
        return response.data.data || null;
    } catch (error) {
        console.error('Error fetching hourly forecast:', error);
        return null;
    }
};

export const fetchDailyForecast = async (lat, lon) => {
    try {
        const response = await axios.get(WEATHER_API.DAILY, {
            params: { lat, lon }
        });
        return response.data.data || null;
    } catch (error) {
        console.error('Error fetching daily forecast:', error);
        return null;
    }
};
