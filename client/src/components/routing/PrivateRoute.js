import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PrivateRoute = ({ children, adminRequired = false }) => {
  const { isAuthenticated, loading, user } = useSelector(state => state.auth);
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        setTimedOut(true);
      }
    }, 5000); // 5-second timeout

    return () => clearTimeout(timer);
  }, [loading]);

  if (loading && !timedOut) {
    return <div>Loading...</div>;
  }

  if (timedOut || !isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  // Check for admin access if required
  if (adminRequired && user?.role !== 'admin') {
    return <Navigate to="/" />;
  }
  
  return children;
};

export default PrivateRoute;