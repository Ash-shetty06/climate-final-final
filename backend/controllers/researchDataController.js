import ResearchData from '../models/ResearchData.js';
import csv from 'csv-parser';
import fs from 'fs';

// Upload research data from CSV
export const uploadData = async (req, res) => {
    try {
        const { city, dataType, timeRange } = req.body;
        const file = req.file;

        if (!file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        if (!city || !dataType || !timeRange) {
            return res.status(400).json({
                success: false,
                message: 'City, data type, and time range are required'
            });
        }

        // Parse CSV file
        const results = [];

        // Read file content first to skip metadata lines
        const fileContent = fs.readFileSync(file.path, 'utf8');
        const lines = fileContent.split('\n');

        // Find the line index where the header starts (contains 'date' or 'time')
        let startIndex = 0;
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].toLowerCase();
            // Open-Meteo uses 'time' and 'temperature_2m', others use 'date' and 'temp'
            if ((line.includes('date') || line.includes('time')) &&
                (line.includes('temp') || line.includes('temperature') || line.includes('aqi') || line.includes('pm'))) {
                startIndex = i;
                break;
            }
        }

        // Join the valid CSV part
        const validCsv = lines.slice(startIndex).join('\n');

        // Create a stream from the valid string
        const { Readable } = await import('stream');
        const stream = Readable.from(validCsv);

        stream
            .pipe(csv())
            .on('data', (row) => {
                // Convert row to data format. Handle both 'temperature_2m' (API) and 'temp_om' (internal match)
                // Open-Meteo CSV header is usually 'temperature_2m'
                const temp = row['temperature_2m'] || row['temp_om'] || row['temperature'];
                const precip = row['precipitation'] || row['rain_om'];
                const pm25 = row['pm2_5'] || row['pm25'];

                if (!row.date && !row.time) return; // Skip empty rows

                const dataPoint = {
                    date: new Date(row.date || row.time), // Open-Meteo uses 'time'
                    temp_om: temp ? parseFloat(temp) : undefined,
                    temp_vc: row.temp_vc ? parseFloat(row.temp_vc) : undefined,
                    aqi_om: row.aqi_om ? parseFloat(row.aqi_om) : undefined,
                    aqi_vc: row.aqi_vc ? parseFloat(row.aqi_vc) : undefined,
                    rain_om: precip ? parseFloat(precip) : undefined,
                    rain_vc: row.rain_vc ? parseFloat(row.rain_vc) : undefined,
                    pm25: pm25 ? parseFloat(pm25) : undefined,
                    pm10: row.pm10 ? parseFloat(row.pm10) : undefined,
                    o3: row.o3 ? parseFloat(row.o3) : undefined,
                    no2: row.no2 ? parseFloat(row.no2) : undefined,
                    humidity: row.relative_humidity_2m ? parseFloat(row.relative_humidity_2m) : (row.humidity ? parseFloat(row.humidity) : undefined),
                    windSpeed: row.wind_speed_10m ? parseFloat(row.wind_speed_10m) : (row.windSpeed ? parseFloat(row.windSpeed) : undefined)
                };
                results.push(dataPoint);
            })
            .on('end', async () => {
                try {
                    // Create research data entry
                    const researchData = new ResearchData({
                        uploadedBy: req.userId,
                        city,
                        dataType,
                        timeRange,
                        data: results,
                        fileName: file.originalname
                    });

                    await researchData.save();

                    // Delete uploaded file
                    fs.unlinkSync(file.path);

                    res.status(201).json({
                        success: true,
                        message: 'Data uploaded successfully',
                        data: {
                            id: researchData._id,
                            city: researchData.city,
                            dataType: researchData.dataType,
                            timeRange: researchData.timeRange,
                            recordCount: results.length,
                            uploadedAt: researchData.uploadedAt
                        }
                    });
                } catch (error) {
                    console.error('Error saving research data:', error);
                    fs.unlinkSync(file.path);
                    res.status(500).json({
                        success: false,
                        message: 'Error saving data to database'
                    });
                }
            })
            .on('error', (error) => {
                console.error('CSV parsing error:', error);
                fs.unlinkSync(file.path);
                res.status(400).json({
                    success: false,
                    message: 'Error parsing CSV file'
                });
            });
    } catch (error) {
        console.error('Upload error:', error);
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({
            success: false,
            message: 'Server error during upload'
        });
    }
};

// Get research data for visualization
export const getResearchData = async (req, res) => {
    try {
        const { city, timeRange, dataType } = req.query;

        const query = {};
        if (city) query.city = city;
        if (timeRange) query.timeRange = timeRange;
        if (dataType) query.dataType = dataType;

        const researchData = await ResearchData.find(query)
            .populate('uploadedBy', 'username email')
            .sort({ uploadedAt: -1 });

        res.status(200).json({
            success: true,
            count: researchData.length,
            data: researchData
        });
    } catch (error) {
        console.error('Get research data error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching data'
        });
    }
};

// Get user's uploads
export const getMyUploads = async (req, res) => {
    try {
        const uploads = await ResearchData.find({ uploadedBy: req.userId })
            .sort({ uploadedAt: -1 });

        res.status(200).json({
            success: true,
            count: uploads.length,
            data: uploads
        });
    } catch (error) {
        console.error('Get my uploads error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching uploads'
        });
    }
};

// Delete upload
export const deleteUpload = async (req, res) => {
    try {
        const { id } = req.params;

        const upload = await ResearchData.findOne({
            _id: id,
            uploadedBy: req.userId
        });

        if (!upload) {
            return res.status(404).json({
                success: false,
                message: 'Upload not found or unauthorized'
            });
        }

        await ResearchData.deleteOne({ _id: id });

        res.status(200).json({
            success: true,
            message: 'Upload deleted successfully'
        });
    } catch (error) {
        console.error('Delete upload error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error deleting upload'
        });
    }
};
