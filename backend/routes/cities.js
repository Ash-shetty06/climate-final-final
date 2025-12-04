import express from 'express';
import { getAllCities, getCityData, searchCities, getCityComparison } from '../controllers/cityController.js';

const router = express.Router();

router.get('/', getAllCities);
router.get('/search', searchCities);
router.get('/:cityId', getCityData);
router.get('/compare/:cityIds', getCityComparison);

export default router;
