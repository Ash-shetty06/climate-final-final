import axios from 'axios';
import { API_BASE_URL } from './apiConfig';

const AUTH_API = `${API_BASE_URL}/auth`;

export const getToken = () => {
    return localStorage.getItem('token');
};

export const getCurrentUser = () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
};

export const isAuthenticated = () => {
    return !!getToken();
};

export const isResearcher = () => {
    const user = getCurrentUser();
    return user && user.role === 'researcher';
};

export const register = async (email, password, username, role = 'user') => {
    try {
        const response = await axios.post(`${AUTH_API}/register`, {
            email,
            password,
            username,
            role
        });

        if (response.data.success) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }

        return response.data;
    } catch (error) {
        throw error.response?.data || { success: false, message: 'Registration failed' };
    }
};

export const login = async (email, password) => {
    try {
        const response = await axios.post(`${AUTH_API}/login`, {
            email,
            password
        });

        if (response.data.success) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }

        return response.data;
    } catch (error) {
        throw error.response?.data || { success: false, message: 'Login failed' };
    }
};

export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
};

export const fetchCurrentUser = async () => {
    try {
        const token = getToken();
        if (!token) {
            throw new Error('No token found');
        }

        const response = await axios.get(`${AUTH_API}/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.data.success) {
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }

        return response.data;
    } catch (error) {
        logout();
        throw error.response?.data || { success: false, message: 'Authentication failed' };
    }
};

export const addFavorite = async (cityData) => {
    try {
        const token = getToken();
        if (!token) throw new Error('Not authenticated');

        const response = await axios.post(`${AUTH_API}/favorites`, cityData, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.data.success) {
            const user = getCurrentUser();
            if (user) {
                user.favoriteCities = response.data.favoriteCities;
                localStorage.setItem('user', JSON.stringify(user));
            }
        }
        return response.data;
    } catch (error) {
        throw error.response?.data || { success: false, message: 'Failed to add favorite' };
    }
};

export const removeFavorite = async (cityId) => {
    try {
        const token = getToken();
        if (!token) throw new Error('Not authenticated');

        const response = await axios.delete(`${AUTH_API}/favorites/${cityId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.data.success) {
            const user = getCurrentUser();
            if (user) {
                user.favoriteCities = response.data.favoriteCities;
                localStorage.setItem('user', JSON.stringify(user));
            }
        }
        return response.data;
    } catch (error) {
        throw error.response?.data || { success: false, message: 'Failed to remove favorite' };
    }
};

// Axios interceptor to add token to requests
axios.interceptors.request.use(
    (config) => {
        const token = getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Axios interceptor to handle 401 errors
axios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            logout();
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);
