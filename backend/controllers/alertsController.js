import Alert from '../models/Alert.js';

export const createAlert = async (req, res) => {
  try {
    const { userId } = req.user || {};
    const { cityId, type = 'aqi', threshold } = req.body;

    if (!cityId || threshold == null) {
      return res.status(400).json({ success: false, message: 'cityId and threshold are required' });
    }

    const alert = new Alert({ userId: userId || req.body.userId, cityId, type, threshold });
    await alert.save();

    res.status(201).json({ success: true, data: alert });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUserAlerts = async (req, res) => {
  try {
    const { userId } = req.user || {};

    const alerts = await Alert.find({ userId: userId || req.query.userId });
    res.status(200).json({ success: true, data: alerts, count: alerts.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteAlert = async (req, res) => {
  try {
    const { alertId } = req.params;
    const { userId } = req.user || {};

    const alert = await Alert.findById(alertId);
    if (!alert) return res.status(404).json({ success: false, message: 'Alert not found' });
    if (alert.userId !== (userId || req.body.userId)) return res.status(403).json({ success: false, message: 'Not authorized' });

    await Alert.findByIdAndDelete(alertId);
    res.status(200).json({ success: true, message: 'Alert deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
