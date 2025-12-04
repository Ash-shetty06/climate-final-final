import mongoose from 'mongoose';

const historicalDataSchema = new mongoose.Schema({
  cityId: {
    type: String,
    required: true,
    index: true
  },
  cityName: String,
  date: {
    type: Date,
    required: true,
    index: true
  },
  tempMin: Number,
  tempMax: Number,
  tempAvg: Number,
  humidity: Number,
  rainfall: Number,
  windSpeed: Number,
  aqi: Number,
  pm25: Number,
  pm10: Number,
  uvIndex: Number,
  sunrise: String,
  sunset: String,
  dataSource: String,
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('HistoricalData', historicalDataSchema);
