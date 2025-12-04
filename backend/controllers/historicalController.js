import HistoricalData from '../models/HistoricalData.js';

export const getHistoricalData = async (req, res) => {
  try {
    const { cityId } = req.params;
    const { days = 30, limit = 100 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const data = await HistoricalData.find({
      cityId,
      date: { $gte: startDate }
    }).sort({ date: -1 }).limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data,
      count: data.length,
      period: `Last ${days} days`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getHistoricalTrends = async (req, res) => {
  try {
    const { cityId } = req.params;
    const { days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const trends = await HistoricalData.aggregate([
      {
        $match: {
          cityId,
          date: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            day: { $dayOfMonth: '$date' }
          },
          avgTemp: { $avg: '$tempAvg' },
          maxTemp: { $max: '$tempMax' },
          minTemp: { $min: '$tempMin' },
          totalRainfall: { $sum: '$rainfall' },
          avgAQI: { $avg: '$aqi' },
          avgHumidity: { $avg: '$humidity' }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: trends,
      period: `Last ${days} days`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getHistoricalComparison = async (req, res) => {
  try {
    const { cityIds } = req.params;
    const { days = 30 } = req.query;
    const ids = cityIds.split(',');

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const comparisonData = await Promise.all(ids.map(async (cityId) => {
      const data = await HistoricalData.find({
        cityId,
        date: { $gte: startDate }
      }).sort({ date: 1 });

      const stats = {
        cityId,
        dataPoints: data.length,
        avgTemp: data.length > 0 ? (data.reduce((sum, d) => sum + (d.tempAvg || 0), 0) / data.length).toFixed(1) : null,
        avgAQI: data.length > 0 ? Math.round(data.reduce((sum, d) => sum + (d.aqi || 0), 0) / data.length) : null,
        totalRainfall: data.reduce((sum, d) => sum + (d.rainfall || 0), 0),
        data
      };

      return stats;
    }));

    res.status(200).json({
      success: true,
      data: comparisonData,
      period: `Last ${days} days`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
