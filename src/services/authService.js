import axios from 'axios';
import { API_BASE_URL } from './apiConfig';

const AUTH_API = `${API_BASE_URL}/auth`;

// Get token from localStorage
export const getToken = () => {
    return localStorage.getItem('token');
};

// Get current user from localStorage
export const getCurrentUser = () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
};

// Check if user is authenticated
export const isAuthenticated = () => {
    return !!getToken();
};

// Check if user is researcher
export const isResearcher = () => {
    const user = getCurrentUser();
    return user && user.role === 'researcher';
};

// Register new user
export const register = async (email, password, username, role = 'user') => {
    try {
        const response = await axios.post(`${AUTH_API}/register`, {
            email,
            password,
            username,
            role
        });

        if (response.data.success) {
            // Store token and user info
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }

        return response.data;
    } catch (error) {
        throw error.response?.data || { success: false, message: 'Registration failed' };
    }
};

// Login user
export const login = async (email, password) => {
    try {
        const response = await axios.post(`${AUTH_API}/login`, {
            email,
            password
        });

        if (response.data.success) {
            // Store token and user info
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }

        return response.data;
    } catch (error) {
        throw error.response?.data || { success: false, message: 'Login failed' };
    }
};

// Logout user
export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
};

// Get current user from server (verify token)
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
        // Token might be expired
        logout();
        throw error.response?.data || { success: false, message: 'Authentication failed' };
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
