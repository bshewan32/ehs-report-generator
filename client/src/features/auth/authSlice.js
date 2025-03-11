// client/src/features/auth/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { api, setAuthToken } from '../../utils/setAuthToken';

// Load user
export const loadUser = createAsyncThunk(
  'auth/loadUser',
  async (_, { rejectWithValue }) => {
    if (localStorage.token) {
      console.log('Setting auth token for user load');
      setAuthToken(localStorage.token);
    }
    try {
      console.log('Making loadUser API request');
      const res = await api.get('/api/auth');
      console.log('LoadUser API response:', res.data);
      return res.data;
    } catch (err) {
      console.error('LoadUser API error:', err.response?.data || err.message);
      localStorage.removeItem('token');
      return rejectWithValue(err.response?.data?.message || 'Failed to load user');
    }
  }
);
// Login user
export const login = createAsyncThunk(
  'auth/login',
  async (formData, { rejectWithValue }) => {
    try {
      console.log('Making login API request');
      const res = await api.post('/api/auth/login', formData);
      console.log('Login API response:', res.data);
      
      localStorage.setItem('token', res.data.token);
      return res.data;
    } catch (err) {
      console.error('Login API error:', err.response?.data || err.message);
      return rejectWithValue(err.response?.data?.message || 'Login failed');
    }
  }
);

// Register user
// Register user
export const register = createAsyncThunk(
  'auth/register',
  async (formData, { rejectWithValue }) => {
    try {
      const res = await api.post('/api/users', formData);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response.data.message);
    }
  }
);

const initialState = {
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: true,
  user: null,
  error: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.removeItem('token');
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.user = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadUser.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(loadUser.rejected, (state, action) => {
        state.token = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.user = null;
        state.error = action.payload;
      })
      .addCase(login.pending, (state) => {
        state.loading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.loading = false;
      })
      .addCase(login.rejected, (state, action) => {
        state.token = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.user = null;
        state.error = action.payload;
      })
      .addCase(register.rejected, (state, action) => {
        state.error = action.payload;
      });
  }
});

export const { logout, clearError } = authSlice.actions;

export default authSlice.reducer;