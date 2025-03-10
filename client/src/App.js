// client/src/App.js
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './app/store';
import { loadUser } from './features/auth/authSlice';
import { api, setAuthToken } from './utils/setAuthToken';

// Import components
import Navbar from './components/layout/Navbar';
import Dashboard from './components/dashboard/Dashboard';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ReportForm from './components/reports/ReportForm';
import ReportsList from './components/reports/ReportsList';
import PrivateRoute from './components/routing/PrivateRoute';
import ReportView from './components/reports/ReportView';

// Import inspection components
import InspectionsList from './components/inspections/InspectionsList';
import InspectionForm from './components/inspections/InspectionForm';
import InspectionDetail from './components/inspections/InspectionDetail';

// Set auth token on initial load
if (localStorage.token) {
  setAuthToken(localStorage.token);
}

function App() {
  useEffect(() => {
    if (localStorage.token) {
      store.dispatch(loadUser());
    }
  }, []);

  return (
    <Provider store={store}>
      <Router>
        <Navbar />
        <div className="container">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Root and dashboard routes */}
            <Route path="/" element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } />
            <Route path="/dashboard" element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } />
            
            {/* Report routes */}
            <Route path="/reports" element={
              <PrivateRoute>
                <ReportsList />
              </PrivateRoute>
            } />
            <Route path="/reports/new" element={
              <PrivateRoute>
                <ReportForm />
              </PrivateRoute>
            } />
            <Route path="/reports/view/:id" element={
              <PrivateRoute>
                <ReportView />
              </PrivateRoute>
            } />
            <Route path="/reports/:id" element={
              <PrivateRoute>
                <ReportForm />
              </PrivateRoute>
            } />
            
            {/* Inspection routes */}
            <Route path="/inspections" element={
              <PrivateRoute>
                <InspectionsList />
              </PrivateRoute>
            } />
            <Route path="/inspections/new" element={
              <PrivateRoute>
                <InspectionForm />
              </PrivateRoute>
            } />
            <Route path="/inspections/:id" element={
              <PrivateRoute>
                <InspectionDetail />
              </PrivateRoute>
            } />
            
          </Routes>
        </div>
      </Router>
    </Provider>
  );
}

export default App;