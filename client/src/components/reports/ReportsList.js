// client/src/components/reports/ReportsList.js
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getReports } from '../../features/reports/reportSlice';

const ReportsList = () => {
  const dispatch = useDispatch();
  const { reports, loading, error } = useSelector(state => state.reports);
  const { isAuthenticated } = useSelector(state => state.auth); // Add this line to get auth state

  useEffect(() => {
    // Only fetch reports if authenticated
    if (isAuthenticated) {
      dispatch(getReports());
    }
  }, [dispatch, isAuthenticated]); // Keep isAuthenticated as dependency

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <div className="reports-container">
      <h1>EHS Reports</h1>
      <Link to="/reports/new" className="btn btn-primary">
        Create New Report
      </Link>
      
      {reports && reports.length === 0 ? (
        <p>No reports found. Create your first report by clicking the button above.</p>
      ) : (
        <div className="reports-list">
          {reports && reports.map(report => (
            <div key={report._id} className="report-item">
              <h2>{report.companyName}</h2>
              <p><strong>Period:</strong> {report.reportPeriod}</p>
              <p><strong>Type:</strong> {report.reportType}</p>
              <p><strong>Incidents:</strong> {report.metrics?.lagging?.incidentCount || 0}</p>
              <div className="report-actions">
                <Link to={`/reports/view/${report._id}`} className="btn btn-info">
                  View
                </Link>
                <Link to={`/reports/${report._id}`} className="btn btn-primary">
                  Edit
                </Link>
              </div>
            </div>
          ))}
        </div>
        
      )}
    </div>
  );
};

export default ReportsList;