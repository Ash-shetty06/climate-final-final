import mongoose from 'mongoose';

const citySchema = new mongoose.Schema({
  cityId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  lat: Number,
  lon: Number,
  country: String,
  weather: [{
    source: String,
    temp: Number,
    feelsLike: Number,
    humidity: Number,
    windSpeed: Number,
    rainProb: Number,
    pressure: Number,
    uvIndex: Number,
    visibility: Number,
    cloudCover: Number,
    sunrise: String,
    sunset: String,
    lastUpdated: { type: Date, default: Date.now },
    dataQuality: String
  }],
  aqi: [{
    source: String,
    aqi: Number,
    pm25: Number,
    pm10: Number,
    o3: Number,
    no2: Number,
    so2: Number,
    co: Number,
    healthAdvisory: String,
    lastUpdated: { type: Date, default: Date.now },
    dataQuality: String
  }],
  forecast: [{
    date: Date,
    tempMin: Number,
    tempMax: Number,
    condition: String,
    precipChance: Number,
    windSpeed: Number
  }],
  lastSyncedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('City', citySchema);
