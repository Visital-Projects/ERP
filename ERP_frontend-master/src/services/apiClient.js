

import axios from 'axios';
import { toast } from 'react-toastify';

const apiClient = axios.create({
  baseURL: `${import.meta.env.VITE_BASE_URL}/api`, // ✅ Dynamically from .env

  headers: {
    Accept: 'application/json',
  },
});

let networkErrorCount = 0;


// Attach token for every request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status } = error.response;

      if (status === 403) {
        toast.error(' Access Denied! You don’t have permission.');
      } else if (status === 401) {
        toast.error('⚠️ Unauthorized! Please log in again.');
        localStorage.removeItem('token');
        window.location.href = '/login'; // optional redirect
      } else if (status >= 500) {
        // toast.error('🔥 Server error! Please try later.');
      }
    } else {
      // Network or CORS error
      if (networkErrorCount < 1) {
        toast.error(" Network error. Please check your connection.");
        networkErrorCount++;
        // Reset counter after a short delay
        setTimeout(() => {
          networkErrorCount = 0;
        }, 10000); // 10 seconds cooldown
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;

