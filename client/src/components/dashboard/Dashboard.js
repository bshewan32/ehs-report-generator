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
import KPITracker from '../kpi/KPITracker';
import { syncMetricsWithKPI, enhanceMetricsWithKPI } from './DashboardHelpers';
import './Dashboard.css';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { metrics, reports, loading } = useSelector(state => state.reports);
  const { user } = useSelector(state => state.auth);
  
  useEffect(() => {
    dispatch(getMetricsSummary());
    dispatch(getReports()); // Fetch all reports for OHSMS data
  }, [dispatch]);
  
  // Calculate incident metrics from reports
  const calculateIncidentMetrics = () => {
    if (!reports || reports.length === 0) return {};
    
    return reports.reduce((acc, report) => {
      if (report.incidents && report.incidents.length > 0) {
        report.incidents.forEach(incident => {
          if (incident.type === 'First Aid') acc.firstAidCount = (acc.firstAidCount || 0) + 1;
          if (incident.type === 'Medical Treatment') acc.medicalTreatmentCount = (acc.medicalTreatmentCount || 0) + 1;
          if (incident.type === 'Near Miss') acc.nearMissCount = (acc.nearMissCount || 0) + 1;
          if (incident.type === 'Lost Time') acc.lostTimeCount = (acc.lostTimeCount || 0) + 1;
        });
      }
      return acc;
    }, {});
  };
  
  // Get the calculated incident metrics
  const incidentMetrics = calculateIncidentMetrics();
  
  // Enhance metrics with KPI data (only if metrics exist)
  const enhancedMetrics = metrics ? enhanceMetricsWithKPI(metrics) : {};
  
  // Update metrics overview component reference with enhanced metrics
  const displayMetrics = {
    ...incidentMetrics,
    firstAidCount: incidentMetrics.firstAidCount || metrics?.lagging?.firstAidCases || 0,
    medicalTreatmentCount: incidentMetrics.medicalTreatmentCount || metrics?.lagging?.medicalTreatmentCases || 0,
    lostTimeCount: incidentMetrics.lostTimeCount || metrics?.lagging?.lostTimeIncidents || 0,
    nearMissCount: incidentMetrics.nearMissCount || metrics?.lagging?.nearMissCount || 0,
    inspectionsCompleted: metrics?.leading?.inspectionsCompleted || 0,
    inspectionsPlanned: metrics?.leading?.inspectionsPlanned || 0,
    trainingCompleted: metrics?.leading?.trainingCompleted || 0,
    safetyObservations: metrics?.leading?.safetyObservations || 0,
    safetyMeetings: metrics?.leading?.safetyMeetings || 0,
    hazardsIdentified: metrics?.leading?.hazardsIdentified || 0,
    hazardsClosed: metrics?.leading?.hazardsClosed || 0,
    ...enhancedMetrics
  };
  
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
        <MetricsOverview metrics={displayMetrics} />
      </div>
      
      <div className="dashboard-main-content">
        {/* KPI Section */}
        <div className="kpi-dashboard-section">
          <div className="section-header">
            <h3>Key Performance Indicators</h3>
            <span className="kpi-period">{new Date().getFullYear()}</span>
          </div>
          <div className="kpi-dashboard-content">
            {metrics && metrics.kpis && metrics.kpis.length > 0 ? (
              <KPITracker 
                kpiData={metrics.kpis}
                editMode={false}
                year={new Date().getFullYear()}
              />
            ) : (
              <div className="no-kpi-data">
                <p>No KPI data available. Create reports with KPI data to see performance tracking.</p>
              </div>
            )}
          </div>
        </div>
        
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
            <div className="recommendations-content">
              <AnalysisRecommendations />
            </div>
          </div>
          
          <div className="recent-reports-container">
            <div className="section-header">
              <h3>Recent Reports</h3>
              <Link to="/reports" className="view-all-link">View all</Link>
            </div>
            <div className="recent-reports-content">
              <RecentReports />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;