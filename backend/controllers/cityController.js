import City from '../models/City.js';
import { calculateDistance, getAQICategory } from '../utils/helpers.js';
import { fetchOpenWeatherData, fetchOpenMeteoAQI } from '../utils/apiClient.js';

export const getAllCities = async (req, res) => {
  try {
    const cities = await City.find().select('-__v');
    res.status(200).json({
      success: true,
      data: cities,
      count: cities.length
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCityData = async (req, res) => {
  try {
    const { cityId } = req.params;
    let city = await City.findOne({ cityId }).select('-__v');

    if (!city) {
      return res.status(404).json({ success: false, message: 'City not found' });
    }

    
    const lastSync = new Date(city.lastSyncedAt);
    const now = new Date();
    const hourDiff = (now - lastSync) / (1000 * 60 * 60);

    if (hourDiff > 1) {
      try {
        
        const weatherData = await fetchOpenWeatherData(city.lat, city.lon);
        const aqiData = await fetchOpenMeteoAQI(city.lat, city.lon);

        
        city.weather.push(weatherData);
        city.aqi.push(aqiData);
        city.lastSyncedAt = new Date();

        
        if (city.weather.length > 10) city.weather = city.weather.slice(-10);
        if (city.aqi.length > 10) city.aqi = city.aqi.slice(-10);

        await city.save();
      } catch (apiError) {
        console.error('Failed to fetch fresh data:', apiError);
        
      }
    }

    res.status(200).json({
      success: true,
      data: city
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const searchCities = async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q) {
      return res.status(400).json({ success: false, message: 'Search query required' });
    }

    const cities = await City.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { cityId: { $regex: q, $options: 'i' } }
      ]
    }).limit(parseInt(limit)).select('cityId name lat lon weather aqi');

    res.status(200).json({
      success: true,
      data: cities,
      count: cities.length
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCityComparison = async (req, res) => {
  try {
    const { cityIds } = req.params;
    const ids = cityIds.split(',');

    if (ids.length < 2) {
      return res.status(400).json({ success: false, message: 'At least 2 cities required for comparison' });
    }

    const cities = await City.find({ cityId: { $in: ids } }).select('-__v');

    if (cities.length !== ids.length) {
      return res.status(404).json({ success: false, message: 'Some cities not found' });
    }

    
    const comparison = cities.map(city => ({
      ...city.toObject(),
      avgTemp: city.weather.length > 0 ?
        (city.weather.reduce((sum, w) => sum + w.temp, 0) / city.weather.length).toFixed(1) : null,
      avgAQI: city.aqi.length > 0 ?
        Math.round(city.aqi.reduce((sum, a) => sum + a.aqi, 0) / city.aqi.length) : null
    }));

    res.status(200).json({
      success: true,
      data: comparison,
      count: comparison.length
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
