import express from 'express';
import {
    getCurrentWeather,
    getCurrentAQI,
    getHistoricalData,
    getHourlyForecast,
    getDailyForecast,
    getMetNorwayWeather,
    getWaqiFeed,
    searchCities,
    clearCache
} from '../controllers/weatherProxyController.js';

const router = express.Router();

router.get('/current', getCurrentWeather);
router.get('/aqi', getCurrentAQI);
router.get('/historical', getHistoricalData);
router.get('/hourly', getHourlyForecast);
router.get('/daily', getDailyForecast);
router.get('/met-norway', getMetNorwayWeather);
router.get('/waqi', getWaqiFeed);
router.get('/search-cities', searchCities);
router.post('/clear-cache', clearCache);

export default router;
