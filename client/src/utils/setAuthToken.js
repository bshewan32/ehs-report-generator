import axios from 'axios';

// Create API instance with base URL
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api'
});

// Function to set auth token for API requests
const setAuthToken = (token) => {
  if (token) {
    // Only set the token in the headers, not in localStorage
    api.defaults.headers.common['x-auth-token'] = token;
    axios.defaults.headers.common['x-auth-token'] = token; // For backward compatibility
  } else {
    delete api.defaults.headers.common['x-auth-token'];
    delete axios.defaults.headers.common['x-auth-token']; // For backward compatibility
  }
};

// Add interceptor with more debugging
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    console.log('API Error:', {
      status: error.response?.status,
      message: error.response?.data?.msg,
      url: originalRequest?.url
    });
    
    // Only redirect on 401 if not already on login page
    if (error.response?.status === 401 && !originalRequest._retry && 
        !window.location.pathname.includes('/login')) {
      originalRequest._retry = true;
      console.log('Token expired, redirecting to login');
      
      // Clean up token
      localStorage.removeItem('token');
      
      // Use React Router for navigation when possible
      if (window.location.pathname !== '/login') {
        window.location.href = '/login?expired=true';
      }
    }
    
    return Promise.reject(error);
  }
);

// Add a request interceptor to log outgoing requests
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

export { api, setAuthToken };