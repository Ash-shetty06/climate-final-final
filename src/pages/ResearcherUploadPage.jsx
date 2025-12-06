import React, { useState, useEffect } from 'react';
import { uploadData, getMyUploads, deleteUpload } from '../services/researchDataService';
import { Upload, FileText, Trash2, AlertCircle, CheckCircle, Download } from 'lucide-react';
import { CITIES } from '../utils/constants';

const ResearcherUploadPage = () => {
    const [formData, setFormData] = useState({
        city: '',
        dataType: 'temperature',
        timeRange: '24h',
        file: null
    });
    const [uploads, setUploads] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchUploads();
    }, []);

    const fetchUploads = async () => {
        setLoading(true);
        try {
            const response = await getMyUploads();
            setUploads(response.data || []);
        } catch (err) {
            console.error('Error fetching uploads:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
        setSuccess('');
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && !file.name.endsWith('.csv')) {
            setError('Please upload a CSV file');
            return;
        }
        setFormData({
            ...formData,
            file
        });
        setError('');
        setSuccess('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!formData.file) {
            setError('Please select a CSV file');
            return;
        }

        if (!formData.city) {
            setError('Please select a city');
            return;
        }

        setUploading(true);

        try {
            const data = new FormData();
            data.append('file', formData.file);
            data.append('city', formData.city);
            data.append('dataType', formData.dataType);
            data.append('timeRange', formData.timeRange);

            const response = await uploadData(data);
            setSuccess(`Successfully uploaded ${response.data.recordCount} records!`);
            setFormData({
                ...formData,
                file: null
            });
            // Reset file input
            document.getElementById('file-input').value = '';
            // Refresh uploads list
            fetchUploads();
        } catch (err) {
            setError(err.message || 'Upload failed. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this upload?')) {
            return;
        }

        try {
            await deleteUpload(id);
            setSuccess('Upload deleted successfully');
            fetchUploads();
        } catch (err) {
            setError(err.message || 'Failed to delete upload');
        }
    };

    const downloadSampleCSV = (dataType) => {
        let csvContent = '';

        switch (dataType) {
            case 'temperature':
                csvContent = 'date,temp_om,humidity,windSpeed\n2024-01-01T00:00:00Z,25.5,60,12.3\n2024-01-01T01:00:00Z,24.8,62,11.5';
                break;
            case 'aqi':
                csvContent = 'date,aqi_om,pm25,pm10,o3,no2\n2024-01-01T00:00:00Z,85,45.2,78.1,32.5,18.9';
                break;
            case 'rainfall':
                csvContent = 'date,rain_om\n2024-01-01T00:00:00Z,2.5\n2024-01-01T01:00:00Z,3.2';
                break;
            case 'pollutants':
                csvContent = 'date,pm25,pm10,o3,no2\n2024-01-01T00:00:00Z,45.2,78.1,32.5,18.9';
                break;
            case 'daily_averages':
                csvContent = 'date,temp_om,aqi_om,rain_om,pm25,pm10,o3,no2\n2024-01-01T00:00:00Z,25.5,85,2.5,45.2,78.1,32.5,18.9';
                break;
            default:
                csvContent = 'date,value\n2024-01-01T00:00:00Z,100';
        }

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sample_${dataType}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-6">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-slate-900 mb-2">Research Data Upload</h1>
                    <p className="text-slate-600">Upload historical climate data for visualization and analysis</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-800">{error}</p>
                    </div>
                )}

                {success && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-green-800">{success}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Upload Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <h2 className="text-xl font-bold text-slate-900 mb-6">Upload New Data</h2>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                                            City
                                        </label>
                                        <select
                                            name="city"
                                            value={formData.city}
                                            onChange={handleChange}
                                            required
                                            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                                        >
                                            <option value="">Select a city</option>
                                            {CITIES.map(city => (
                                                <option key={city.id} value={city.name}>
                                                    {city.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                                            Data Type
                                        </label>
                                        <select
                                            name="dataType"
                                            value={formData.dataType}
                                            onChange={handleChange}
                                            required
                                            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                                        >
                                            <option value="temperature">Temperature</option>
                                            <option value="aqi">Air Quality (AQI)</option>
                                            <option value="rainfall">Rainfall</option>
                                            <option value="pollutants">Pollutants</option>
                                            <option value="daily_averages">Daily Averages</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Time Range
                                    </label>
                                    <select
                                        name="timeRange"
                                        value={formData.timeRange}
                                        onChange={handleChange}
                                        required
                                        className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                                    >
                                        <option value="24h">Last 24 Hours</option>
                                        <option value="7d">Last 7 Days</option>
                                        <option value="30d">Last 30 Days</option>
                                        <option value="90d">Last 90 Days</option>
                                        <option value="1yr">Last 1 Year</option>
                                        <option value="5yr">Last 5 Years</option>
                                        <option value="10yr">Last 10 Years</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        CSV File
                                    </label>
                                    <input
                                        id="file-input"
                                        type="file"
                                        accept=".csv"
                                        onChange={handleFileChange}
                                        required
                                        className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                                    />
                                    {formData.file && (
                                        <p className="mt-2 text-sm text-slate-600 flex items-center gap-2">
                                            <FileText className="w-4 h-4" />
                                            {formData.file.name} ({(formData.file.size / 1024).toFixed(2)} KB)
                                        </p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={uploading}
                                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {uploading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                            Uploading...
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="w-5 h-5" />
                                            Upload Data
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* CSV Format Guide */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <h3 className="text-lg font-bold text-slate-900 mb-4">CSV Format Guide</h3>
                            <p className="text-sm text-slate-600 mb-4">
                                Download sample CSV files for each data type:
                            </p>
                            <div className="space-y-2">
                                {['temperature', 'aqi', 'rainfall', 'pollutants', 'daily_averages'].map(type => (
                                    <button
                                        key={type}
                                        onClick={() => downloadSampleCSV(type)}
                                        className="w-full text-left px-4 py-2 bg-slate-50 hover:bg-slate-100 rounded-lg text-sm flex items-center justify-between transition-colors"
                                    >
                                        <span className="capitalize">{type.replace('_', ' ')}</span>
                                        <Download className="w-4 h-4 text-slate-400" />
                                    </button>
                                ))}
                            </div>
                            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-xs text-blue-800">
                                    <strong>Note:</strong> All dates must be in ISO 8601 format (YYYY-MM-DDTHH:mm:ssZ)
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* My Uploads */}
                <div className="mt-8">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h2 className="text-xl font-bold text-slate-900 mb-6">My Uploads</h2>

                        {loading ? (
                            <div className="flex justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                            </div>
                        ) : uploads.length === 0 ? (
                            <p className="text-center text-slate-500 py-8">No uploads yet</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-50 border-b border-slate-200">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">City</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Data Type</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Time Range</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Records</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Uploaded</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {uploads.map(upload => (
                                            <tr key={upload._id} className="hover:bg-slate-50">
                                                <td className="px-4 py-3 text-sm text-slate-900">{upload.city}</td>
                                                <td className="px-4 py-3 text-sm text-slate-600 capitalize">{upload.dataType.replace('_', ' ')}</td>
                                                <td className="px-4 py-3 text-sm text-slate-600">{upload.timeRange}</td>
                                                <td className="px-4 py-3 text-sm text-slate-600">{upload.data?.length || 0}</td>
                                                <td className="px-4 py-3 text-sm text-slate-600">
                                                    {new Date(upload.uploadedAt).toLocaleDateString()}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <button
                                                        onClick={() => handleDelete(upload._id)}
                                                        className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded transition-colors"
                                                        title="Delete upload"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResearcherUploadPage;
