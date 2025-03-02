// client/src/app/store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import reportReducer from '../features/reports/reportSlice';
import inspectionReducer from '../features/inspections/inspectionSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    reports: reportReducer,
    inspections: inspectionReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Disable serializable check
      immutableStateInvariant: false // Disable in development if needed
    })
});