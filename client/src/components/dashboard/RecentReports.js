import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getReports } from '../../features/reports/reportSlice'; // Using getReports instead of getRecentReports

const RecentReports = () => {
  const dispatch = useDispatch();
  const { reports, loading } = useSelector(state => state.reports);
  
  useEffect(() => {
    if (!reports || reports.length === 0) {
      dispatch(getReports());
    }
  }, [dispatch, reports]);
  
  // Format date function 
  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    
    const date = new Date(dateString);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                    
    const month = months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    
    return `${month} ${day}, ${year}`;
  };
  
  if (loading) {
    return <div className="loading-indicator">Loading recent reports...</div>;
  }
  
  // Get the most recent reports (up to 5)
  const recentReports = reports ? 
    [...reports]
      .sort((a, b) => new Date(b.reportDate || b.createdAt) - new Date(a.reportDate || a.createdAt))
      .slice(0, 5) 
    : [];
  
  if (!recentReports || recentReports.length === 0) {
    return <div className="no-data">No recent reports available</div>;
  }
  
  return (
    <div className="report-list">
      {recentReports.map((report, index) => (
        <div key={report._id || index} className="report-item">
          <div className="report-info">
            <div className="report-name">
              {report.title || `${report.reportType || 'Monthly'} - ${report.reportPeriod || 'Unknown Period'}`}
            </div>
            <div className="report-period">
              {formatDate(report.reportDate || report.createdAt)}
            </div>
          </div>
          <div className="report-actions">
            <Link to={`/reports/${report._id}`} className="report-link">
              View
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RecentReports;