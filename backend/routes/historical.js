import express from 'express';
import { getHistoricalData, getHistoricalTrends, getHistoricalComparison } from '../controllers/historicalController.js';

const router = express.Router();

router.get('/comparison/:cityIds', getHistoricalComparison);
router.get('/:cityId/trends', getHistoricalTrends);

router.get('/:cityId/download', getHistoricalData);
router.get('/:cityId', getHistoricalData);

export default router;
