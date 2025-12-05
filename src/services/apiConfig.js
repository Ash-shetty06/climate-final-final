const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const WEATHER_API = {
    CURRENT: `${API_BASE_URL}/weather/current`,
    AQI: `${API_BASE_URL}/weather/aqi`,
    HISTORICAL: `${API_BASE_URL}/weather/historical`,
    HOURLY: `${API_BASE_URL}/weather/hourly`,
    DAILY: `${API_BASE_URL}/weather/daily`,
    MET_NORWAY: `${API_BASE_URL}/weather/met-norway`,
    WAQI: `${API_BASE_URL}/weather/waqi`,
    SEARCH_CITIES: `${API_BASE_URL}/weather/search-cities`,
};

export default API_BASE_URL;
