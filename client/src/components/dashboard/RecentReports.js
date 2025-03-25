// client/src/components/dashboard/RecentReports.js
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getRecentReports } from '../../features/reports/reportSlice';
import Moment from 'react-moment';

const RecentReports = () => {
  const dispatch = useDispatch();
  const { recentReports, loading } = useSelector(state => state.reports);
  
  useEffect(() => {
    dispatch(getRecentReports());
  }, [dispatch]);
  
  if (loading) {
    return <div className="loading-indicator">Loading recent reports...</div>;
  }
  
  if (!recentReports || recentReports.length === 0) {
    return <div className="no-data">No recent reports available</div>;
  }
  
  return (
    <div className="report-list">
      {recentReports.map(report => (
        <div key={report._id} className="report-item">
          <div className="report-info">
            <div className="report-name">{report.title || 'Untitled Report'}</div>
            <div className="report-period">
              <Moment format="MMM D, YYYY">{report.reportDate}</Moment>
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