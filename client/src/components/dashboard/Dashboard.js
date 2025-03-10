// client/src/components/dashboard/Dashboard.js
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getMetricsSummary } from '../../features/reports/reportSlice';
import AnalysisRecommendations from './AnalysisRecommendations';
import CriticalRiskStatus from './CriticalRiskStatus';

// Dashboard Components
import MetricsOverview from './MetricsOverview';
import IncidentTrends from './IncidentTrends';
import ComplianceStatus from './ComplianceStatus';
import RiskHeatmap from './RiskHeatmap';
import RecentReports from './RecentReports';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { metrics, loading } = useSelector(state => state.reports);
  const { user } = useSelector(state => state.auth);
  
  useEffect(() => {
    dispatch(getMetricsSummary());
  }, [dispatch]);
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>EHS Dashboard</h1>
        <div className="dashboard-actions">
          <Link to="/reports/new" className="btn btn-primary">
            Create New Report
          </Link>
          <Link to="/inspections/new" className="btn btn-secondary">
            Record Inspection
          </Link>
        </div>
      </div>
      
      <div className="dashboard-summary">
        <div className="welcome-message">
          <h2>Welcome, {user && user.name}</h2>
          <p>Here's your EHS overview for the current period.</p>
        </div>
        
        <MetricsOverview metrics={metrics} />
      </div>
      
      <div className="dashboard-charts">
        <div className="chart-row">
          <div className="chart-container">
            <h3>Incident Trends</h3>
            <IncidentTrends />
          </div>
          
          <div className="chart-container">
            <h3>Critical Risk Protocols</h3>
            <CriticalRiskStatus />
          </div>
        </div>
        
        <div className="chart-row">
          <div className="chart-container">
            <h3>Risk Assessment</h3>
            <RiskHeatmap
              riskAreas={metrics ? metrics.highRiskAreas : []}
            />
          </div>
          
          <div className="chart-container">
            <h3>Compliance Status</h3>
            <ComplianceStatus
              compliance={metrics ? metrics.complianceStatus : null}
            />
          </div>
          
          <div className="chart-container">
            <h3>Recent Reports</h3>
            <RecentReports />
          </div>
        </div>
        
        <div className="dashboard-section full-width">
          <AnalysisRecommendations />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;