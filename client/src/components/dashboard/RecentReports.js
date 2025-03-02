// client/src/components/dashboard/RecentReports.js
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getReports } from '../../features/reports/reportSlice';

const RecentReports = () => {
  const dispatch = useDispatch();
  const { reports, loading } = useSelector(state => state.reports);

  useEffect(() => {
    if (!reports.length) {
      dispatch(getReports());
    }
  }, [dispatch, reports.length]);

  if (loading) {
    return <div>Loading...</div>;
  }

  // Show only the 5 most recent reports
  const recentReports = reports.slice(0, 5);

  return (
    <div className="recent-reports">
      {recentReports.length === 0 ? (
        <p>No recent reports available.</p>
      ) : (
        <ul className="report-list">
          {recentReports.map(report => (
            <li key={report._id} className="report-item">
              <span className="report-name">{report.companyName}</span>
              <span className="report-period">{report.reportPeriod}</span>
              <Link to={`/reports/view/${report._id}`} className="btn btn-sm">
                View
              </Link>
            </li>
          ))}
        </ul>
      )}
      <Link to="/reports" className="btn btn-outline">
        View All Reports
      </Link>
    </div>
  );
};

export default RecentReports;