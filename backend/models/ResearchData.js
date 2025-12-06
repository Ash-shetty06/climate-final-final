import mongoose from 'mongoose';

const researchDataSchema = new mongoose.Schema({
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    city: {
        type: String,
        required: true
    },
    dataType: {
        type: String,
        enum: ['temperature', 'aqi', 'rainfall', 'pollutants', 'daily_averages'],
        required: true
    },
    timeRange: {
        type: String,
        enum: ['24h', '7d', '30d', '90d', '1yr', '5yr', '10yr'],
        required: true
    },
    data: [{
        date: {
            type: Date,
            required: true
        },
        temp_om: Number,
        temp_vc: Number,
        aqi_om: Number,
        aqi_vc: Number,
        rain_om: Number,
        rain_vc: Number,
        pm25: Number,
        pm10: Number,
        o3: Number,
        no2: Number,
        humidity: Number,
        windSpeed: Number
    }],
    uploadedAt: {
        type: Date,
        default: Date.now
    },
    fileName: {
        type: String,
        required: true
    }
});

// Index for faster queries
researchDataSchema.index({ city: 1, dataType: 1, timeRange: 1 });
researchDataSchema.index({ uploadedBy: 1 });

const ResearchData = mongoose.model('ResearchData', researchDataSchema);

export default ResearchData;
