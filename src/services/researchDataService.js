import axios from 'axios';
import { API_BASE_URL } from './apiConfig';
import { getToken } from './authService';

const RESEARCH_API = `${API_BASE_URL}/research`;

// Upload research data (CSV file)
export const uploadData = async (formData) => {
    try {
        const token = getToken();
        const response = await axios.post(`${RESEARCH_API}/upload`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${token}`
            }
        });

        return response.data;
    } catch (error) {
        throw error.response?.data || { success: false, message: 'Upload failed' };
    }
};

// Get research data for visualization
export const getResearchData = async (city, timeRange, dataType) => {
    try {
        const params = {};
        if (city) params.city = city;
        if (timeRange) params.timeRange = timeRange;
        if (dataType) params.dataType = dataType;

        const response = await axios.get(`${RESEARCH_API}/data`, { params });
        return response.data;
    } catch (error) {
        throw error.response?.data || { success: false, message: 'Failed to fetch research data' };
    }
};

// Get my uploads (researcher only)
export const getMyUploads = async () => {
    try {
        const token = getToken();
        const response = await axios.get(`${RESEARCH_API}/my-uploads`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        return response.data;
    } catch (error) {
        throw error.response?.data || { success: false, message: 'Failed to fetch uploads' };
    }
};

// Delete upload (researcher only)
export const deleteUpload = async (id) => {
    try {
        const token = getToken();
        const response = await axios.delete(`${RESEARCH_API}/upload/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        return response.data;
    } catch (error) {
        throw error.response?.data || { success: false, message: 'Failed to delete upload' };
    }
};
