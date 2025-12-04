import { useState, useEffect } from 'react';
import { apiGet } from '../services/apiClient';

export const useCities = () => {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCities = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiGet('/cities');
        if (!response.success) {
          throw new Error(response.message || 'Failed to fetch cities');
        }
        setCities(response.data || []);
      } catch (err) {
        setError(err.message);
        setCities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCities();
  }, []);

  return {
    cities,
    loading,
    error,
  };
};

export default useCities;
