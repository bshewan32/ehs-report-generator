// client/src/components/dashboard/Dashboard.js
import './Dashboard.css';
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getMetricsSummary, getReports } from '../../features/reports/reportSlice';
import AnalysisRecommendations from './AnalysisRecommendations';
import CriticalRiskStatus from './CriticalRiskStatus';
import { 
  BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
// Dashboard Components
import MetricsOverview from './MetricsOverview';
import IncidentTrends from './IncidentTrends';
import RecentReports from './RecentReports';
import OHSMSComplianceOverview from './OHSMSComplianceOverview';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { metrics, reports, loading } = useSelector(state => state.reports);
  const { user } = useSelector(state => state.auth);
  
  useEffect(() => {
    dispatch(getMetricsSummary());
    dispatch(getReports()); // Fetch all reports for OHSMS data
  }, [dispatch]);
  
  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }
  
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>EHS Dashboard</h1>
          <p className="dashboard-subtitle">Your health and safety overview</p>
        </div>
        <div className="dashboard-actions">
          <Link to="/reports/new" className="btn btn-primary">
            Create New Report
          </Link>
          <Link to="/inspections/new" className="btn btn-outline">
            Record Inspection
          </Link>
        </div>
      </div>
      
      <div className="welcome-card">
        <div className="welcome-content">
          <h2>Welcome, {user && user.name}</h2>
          <p>Here's your EHS overview for the current period. Review your metrics and take action where needed.</p>
        </div>
      </div>
      
      {/* Improved Metrics Overview Section with better styling */}
      <div className="dashboard-metrics-cards">
        <MetricsOverview metrics={metrics} />
      </div>
      
      <div className="dashboard-main-content">
        {/* First row of charts */}
        <div className="charts-container">
          <div className="chart-item">
            <div className="chart-header">
              <h3>Incident Trends</h3>
              <span className="chart-period">Last 12 months</span>
            </div>
            <div className="chart-body">
              <IncidentTrends />
            </div>
          </div>
          
          <div className="chart-item">
            <div className="chart-header">
              <h3>Critical Risk Protocols</h3>
              <span className="chart-period">Status overview</span>
            </div>
            <div className="chart-body">
              <CriticalRiskStatus />
            </div>
          </div>
        </div>
        
        {/* OHSMS Compliance Section */}
        <div className="ohsms-section">
          <div className="section-header">
            <h3>OHSMS Compliance Overview</h3>
            <Link to="/ohsms-dashboard" className="view-details-link">View details</Link>
          </div>
          <div className="ohsms-content">
            <OHSMSComplianceOverview reports={reports} />
          </div>
        </div>
        
        {/* Bottom section with recommendations and recent reports */}
        <div className="bottom-section">
          <div className="recommendations-container">
            <div className="section-header">
              <h3>Analysis & Recommendations</h3>
            </div>
            <AnalysisRecommendations />
          </div>
          
          <div className="recent-reports-container">
            <div className="section-header">
              <h3>Recent Reports</h3>
              <Link to="/reports" className="view-all-link">View all</Link>
            </div>
            <RecentReports />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;