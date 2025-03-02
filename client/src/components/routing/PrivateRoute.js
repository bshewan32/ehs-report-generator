// client/src/components/routing/PrivateRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PrivateRoute = ({ children, adminRequired = false }) => {
  const { isAuthenticated, loading, user } = useSelector(state => state.auth);
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  // Check for admin access if required
  if (adminRequired && user?.role !== 'admin') {
    return <Navigate to="/" />;
  }
  
  return children;
};

export default PrivateRoute;