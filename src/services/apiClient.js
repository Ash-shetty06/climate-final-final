const API_BASE_URL = 'http://localhost:5001/api/v1';

const getAuthToken = () => {
  return localStorage.getItem('atv_token');
};

export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getAuthToken();

  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...(options.headers || {}),
    },
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error.message);
    return {
      success: false,
      message: error.message,
      data: null,
    };
  }
};

export const apiGet = (endpoint) => {
  return apiRequest(endpoint, { method: 'GET' });
};

export const apiPost = (endpoint, body) => {
  return apiRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(body),
  });
};

export const apiPut = (endpoint, body) => {
  return apiRequest(endpoint, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
};

export const apiDelete = (endpoint) => {
  return apiRequest(endpoint, { method: 'DELETE' });
};

export default {
  apiRequest,
  apiGet,
  apiPost,
  apiPut,
  apiDelete,
};
