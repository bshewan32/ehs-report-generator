// client/src/utils/setAuthToken.js
import axios from 'axios';

// Create API instance with base URL
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api'
});

// Function to set auth token in localStorage and for all requests
const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
    api.defaults.headers.common['x-auth-token'] = token;
    axios.defaults.headers.common['x-auth-token'] = token; // For backward compatibility
  } else {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['x-auth-token'];
    delete axios.defaults.headers.common['x-auth-token']; // For backward compatibility
  }
};

// Add interceptor to automatically attach token to every request
// Add this to your axios interceptor code (perhaps in your setAuthToken.js file)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 and it's due to an expired token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Force logout and redirect to login page
        localStorage.removeItem('token');
        window.location.href = '/login?expired=true';
        return Promise.reject(error);
      } catch (err) {
        return Promise.reject(err);
      }
    }
    return Promise.reject(error);
  }
);

export { api, setAuthToken };