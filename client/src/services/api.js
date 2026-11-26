import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  timeout: 15000,
  headers: {
    Accept: 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Unable to reach the server. Please try again.';
    return Promise.reject({
      ...error,
      friendlyMessage: message,
      status: error.response?.status || 500,
    });
  }
);

export default api;
