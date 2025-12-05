import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import NodeCache from 'node-cache';

import citiesRoutes from './routes/cities.js';
import historicalRoutes from './routes/historical.js';
import alertsRoutes from './routes/alerts.js';
import weatherProxyRoutes from './routes/weatherProxy.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

export const cache = new NodeCache({ stdTTL: 3600 });

app.use(cors({
  origin: [
    'http://localhost:3001',
    'http://localhost:3002',
    process.env.CORS_ORIGIN || 'http://localhost:3001'
  ],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

app.use('/api/cities', citiesRoutes);
app.use('/api/historical', historicalRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/weather', weatherProxyRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'AtmosView Backend API is running',
    timestamp: new Date().toISOString()
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/atmosview';

    console.log('🔄 Attempting to connect to MongoDB...');

    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log('✅ MongoDB connected successfully');
    console.log(`📊 Database: ${mongoose.connection.name}`);
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.log('⚠️  Server will continue running without database');
    console.log('⚠️  Authentication and user features will not work');
    console.log('⚠️  Weather proxy endpoints will still function');
  }
};

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`🚀 AtmosView Backend API running on http://localhost:${PORT}`);
    console.log(`📊 Endpoints available:`);
    console.log(`   Cities: GET /api/cities/`);
    console.log(`   Search: GET /api/cities/search?q=query`);
    console.log(`   City Data: GET /api/cities/:cityId`);
    console.log(`   Compare: GET /api/cities/compare/:cityIds`);
    console.log(`   Historical: GET /api/historical/:cityId`);
    console.log(`   Trends: GET /api/historical/:cityId/trends`);
    console.log(`   User Prefs: GET /api/users/:userId/preferences`);
    console.log(`🏥 Health Check: GET /health`);
  });
};

startServer().catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
