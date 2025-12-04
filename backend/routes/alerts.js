import express from 'express';
import { createAlert, getUserAlerts, deleteAlert } from '../controllers/alertsController.js';

const router = express.Router();

router.post('/', createAlert);
router.get('/:userId', getUserAlerts);
router.delete('/:alertId', deleteAlert);

export default router;
