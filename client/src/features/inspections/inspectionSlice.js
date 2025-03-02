// client/src/features/inspections/inspectionSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Get all inspections
export const getInspections = createAsyncThunk(
  'inspections/getInspections',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get('/api/inspections');
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Error fetching inspections');
    }
  }
);

// Get single inspection
export const getInspection = createAsyncThunk(
  'inspections/getInspection',
  async (id, { rejectWithValue }) => {
    try {
      const res = await axios.get(`/api/inspections/${id}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Error fetching inspection');
    }
  }
);

// Create new inspection
export const createInspection = createAsyncThunk(
  'inspections/createInspection',
  async (formData, { rejectWithValue }) => {
    try {
      const res = await axios.post('/api/inspections', formData);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Error creating inspection');
    }
  }
);

// Update inspection
export const updateInspection = createAsyncThunk(
  'inspections/updateInspection',
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const res = await axios.put(`/api/inspections/${id}`, formData);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Error updating inspection');
    }
  }
);

// Delete inspection
export const deleteInspection = createAsyncThunk(
  'inspections/deleteInspection',
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`/api/inspections/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Error deleting inspection');
    }
  }
);

const initialState = {
  inspections: [],
  inspection: null,
  loading: false,
  error: null,
  success: false
};

const inspectionSlice = createSlice({
  name: 'inspections',
  initialState,
  reducers: {
    clearInspectionState: (state) => {
      state.error = null;
      state.success = false;
    },
    clearCurrentInspection: (state) => {
      state.inspection = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getInspections.pending, (state) => {
        state.loading = true;
      })
      .addCase(getInspections.fulfilled, (state, action) => {
        state.loading = false;
        state.inspections = action.payload.inspections;
      })
      .addCase(getInspections.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getInspection.pending, (state) => {
        state.loading = true;
      })
      .addCase(getInspection.fulfilled, (state, action) => {
        state.loading = false;
        state.inspection = action.payload;
      })
      .addCase(getInspection.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createInspection.pending, (state) => {
        state.loading = true;
      })
      .addCase(createInspection.fulfilled, (state, action) => {
        state.loading = false;
        state.inspections.push(action.payload);
        state.success = true;
      })
      .addCase(createInspection.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateInspection.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateInspection.fulfilled, (state, action) => {
        state.loading = false;
        state.inspections = state.inspections.map(inspection => 
          inspection._id === action.payload._id ? action.payload : inspection
        );
        state.inspection = action.payload;
        state.success = true;
      })
      .addCase(updateInspection.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteInspection.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteInspection.fulfilled, (state, action) => {
        state.loading = false;
        state.inspections = state.inspections.filter(inspection => inspection._id !== action.payload);
        state.success = true;
      })
      .addCase(deleteInspection.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearInspectionState, clearCurrentInspection } = inspectionSlice.actions;

export default inspectionSlice.reducer;