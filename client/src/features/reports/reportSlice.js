// client/src/features/reports/reportSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api, setAuthToken } from '../../utils/setAuthToken';
import axios from 'axios';

// Get all reports
export const getReports = createAsyncThunk(
  'reports/getReports',
  async (_, { rejectWithValue }) => {
    try {
      // Make sure the token is in localStorage
      const token = localStorage.getItem('token');
      console.log('Getting reports, token present:', !!token);
      
      if (token) {
        setAuthToken(token);
      }
      
      const res = await api.get('/api/reports');
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.msg || 'Failed to get reports');
    }
  }
);

export const getRecentReports = createAsyncThunk(
  'reports/getRecent',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get('/api/reports?limit=5');
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);


// Get single report
export const getReport = createAsyncThunk(
  'reports/getReport',
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`/api/reports/${id}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.msg || 'Failed to get report');
    }
  }
);

// Create new report
export const createReport = createAsyncThunk(
  'reports/createReport',
  async (formData, { rejectWithValue }) => {
    try {
      const res = await api.post('/api/reports', formData);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.msg || 'Error creating report');
    }
  }
);

// Update report
export const updateReport = createAsyncThunk(
  'reports/updateReport',
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/api/reports/${id}`, formData);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.msg || 'Error updating report');
    }
  }
);

// Delete report
export const deleteReport = createAsyncThunk(
  'reports/deleteReport',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/api/reports/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.msg || 'Error deleting report');
    }
  }
);


// Get metrics summary
export const getMetricsSummary = createAsyncThunk(
  'reports/getMetricsSummary',
  async (_, { rejectWithValue, getState }) => {
    try {
      const res = await api.get('/api/reports/metrics/summary');

      // Get all reports from state to calculate additional metrics
      const { reports } = getState().reports;

      // Calculate incident counts from reports if they exist
      let additionalMetrics = {};
      if (reports && reports.length > 0) {
        const incidentCounts = reports.reduce((acc, report) => {
          if (report.incidents && report.incidents.length > 0) {
            report.incidents.forEach(incident => {
              if (incident.type === 'First Aid') acc.firstAidCount++;
              if (incident.type === 'Medical Treatment') acc.medicalTreatmentCount++;
              if (incident.type === 'Near Miss') acc.nearMissCount++;
              if (incident.type === 'Lost Time') acc.lostTimeCount++;
              if (incident.type === 'Fatality') acc.fatalityCount++;
            });
          }
          return acc;
        }, {
          firstAidCount: 0,
          medicalTreatmentCount: 0,
          nearMissCount: 0,
          lostTimeCount: 0,
          fatalityCount: 0
        });

        // Process KPI data if available
        const currentYear = new Date().getFullYear();
        const recentKPIs = {};

        reports.forEach(report => {
          if (report.kpis && report.kpis.length > 0) {
            report.kpis.forEach(kpi => {
              // Only process KPIs for the current year
              if (kpi.year === currentYear) {
                // If this KPI doesn't exist in our collection yet, or if this report is more recent
                if (!recentKPIs[kpi.id] || new Date(report.reportDate) > new Date(recentKPIs[kpi.id].reportDate)) {
                  recentKPIs[kpi.id] = {
                    ...kpi,
                    reportDate: report.reportDate
                  };
                }
              }
            });
          }
        });

        // Add KPI data to additional metrics
        additionalMetrics = {
          ...incidentCounts,
          kpis: Object.values(recentKPIs).map(({ reportDate, ...kpi }) => kpi) // Remove the temp reportDate field
        };
      }

      // Combine API metrics with calculated metrics
      return {
        ...res.data,
        ...additionalMetrics
      };
    } catch (err) {
      return rejectWithValue(err.response?.data?.msg || 'Error fetching metrics');
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
        // Handle both array and object with reports property
        state.reports = Array.isArray(action.payload) ? action.payload :
          (action.payload.reports || []);
        if (state.reports.length > 0) {
          const incidentCounts = state.reports.reduce((acc, report) => {
            if (report.incidents && report.incidents.length > 0) {
              report.incidents.forEach(incident => {
                if (incident.type === 'First Aid') acc.firstAidCount++;
                if (incident.type === 'Medical Treatment') acc.medicalTreatmentCount++;
                if (incident.type === 'Near Miss') acc.nearMissCount++;
                if (incident.type === 'Lost Time') acc.lostTimeCount++;
                if (incident.type === 'Fatality') acc.fatalityCount++;
              });
            }
            return acc;
          }, {
            firstAidCount: 0,
            medicalTreatmentCount: 0,
            nearMissCount: 0,
            lostTimeCount: 0,
            fatalityCount: 0
          }); if (!state.metrics) {
            state.metrics = incidentCounts;
          } else {
            state.metrics = {
              ...state.metrics,
              ...incidentCounts
            };
          }
        }

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
      })
      .addCase(getRecentReports.pending, (state) => {
        state.loading = true;
      })
      .addCase(getRecentReports.fulfilled, (state, action) => {
        state.loading = false;
        state.recentReports = action.payload;
      })
      .addCase(getRecentReports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearReportState, clearCurrentReport } = reportSlice.actions;

export default reportSlice.reducer;