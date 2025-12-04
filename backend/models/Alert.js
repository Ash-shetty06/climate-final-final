import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  cityId: { type: String, required: true },
  type: { type: String, enum: ['aqi', 'weather'], default: 'aqi' },
  threshold: { type: Number, required: true },
  enabled: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Alert', alertSchema);
