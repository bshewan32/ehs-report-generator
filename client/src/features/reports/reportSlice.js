// client/src/features/reports/reportSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Get all reports
export const getReports = createAsyncThunk(
  'reports/getReports',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get('/api/reports');
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Error fetching reports');
    }
  }
);

// Get single report
export const getReport = createAsyncThunk(
  'reports/getReport',
  async (id, { rejectWithValue }) => {
    try {
      const res = await axios.get(`/api/reports/${id}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Error fetching report');
    }
  }
);

// Create new report
export const createReport = createAsyncThunk(
  'reports/createReport',
  async (formData, { rejectWithValue }) => {
    try {
      const res = await axios.post('/api/reports', formData);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Error creating report');
    }
  }
);

// Update report
export const updateReport = createAsyncThunk(
  'reports/updateReport',
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const res = await axios.put(`/api/reports/${id}`, formData);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Error updating report');
    }
  }
);

// Delete report
export const deleteReport = createAsyncThunk(
  'reports/deleteReport',
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`/api/reports/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Error deleting report');
    }
  }
);

// Get metrics summary
export const getMetricsSummary = createAsyncThunk(
  'reports/getMetricsSummary',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get('/api/reports/metrics/summary');
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Error fetching metrics');
    }
  }
);

const initialState = {
  reports: [],
  report: null,
  metrics: null,
  loading: false,
  error: null,
  success: false
};

const reportSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {
    clearReportState: (state) => {
      state.error = null;
      state.success = false;
    },
    clearCurrentReport: (state) => {
      state.report = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getReports.pending, (state) => {
        state.loading = true;
      })
      .addCase(getReports.fulfilled, (state, action) => {
        state.loading = false;
        state.reports = action.payload.reports;
      })
      .addCase(getReports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getReport.pending, (state) => {
        state.loading = true;
      })
      .addCase(getReport.fulfilled, (state, action) => {
        state.loading = false;
        state.report = action.payload;
      })
      .addCase(getReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createReport.pending, (state) => {
        state.loading = true;
      })
      .addCase(createReport.fulfilled, (state, action) => {
        state.loading = false;
        state.reports.push(action.payload);
        state.success = true;
      })
      .addCase(createReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateReport.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateReport.fulfilled, (state, action) => {
        state.loading = false;
        state.reports = state.reports.map(report => 
          report._id === action.payload._id ? action.payload : report
        );
        state.report = action.payload;
        state.success = true;
      })
      .addCase(updateReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteReport.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteReport.fulfilled, (state, action) => {
        state.loading = false;
        state.reports = state.reports.filter(report => report._id !== action.payload);
        state.success = true;
      })
      .addCase(deleteReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getMetricsSummary.pending, (state) => {
        state.loading = true;
      })
      .addCase(getMetricsSummary.fulfilled, (state, action) => {
        state.loading = false;
        state.metrics = action.payload;
      })
      .addCase(getMetricsSummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearReportState, clearCurrentReport } = reportSlice.actions;

export default reportSlice.reducer;