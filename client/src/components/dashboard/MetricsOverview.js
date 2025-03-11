// MetricsOverview.js
import React from 'react';
import { useSelector } from 'react-redux';

const MetricsOverview = () => {
  const { metrics, loading } = useSelector(state => state.reports);
  
  // Check if metrics is undefined or still loading
  if (loading || !metrics) {
    return <div className="metrics-loading">Loading metrics...</div>;
  }
  
  // Ensure all required properties exist with fallbacks
  const {
    incidentCount = 0,
    nearMissCount = 0,
    lostTimeIncidents = 0,
    totalRecordableIncidentRate = 0,
    lostTimeIncidentRate = 0
  } = metrics.lagging || {};
  
  const {
    inspectionsCompleted = 0,
    inspectionsPlanned = 0,
    trainingCompleted = 0,
    safetyObservations = 0,
    safetyMeetings = 0
  } = metrics.leading || {};
  
  // Calculate inspection completion rate with null check
  const inspectionRate = inspectionsPlanned > 0 
    ? ((inspectionsCompleted / inspectionsPlanned) * 100).toFixed(1) 
    : '0.0';

  return (
    <div className="metrics-overview">
      <div className="metrics-section">
        <h3>Lagging Indicators</h3>
        <div className="metrics-grid">
          <div className="metric-card">
            <span className="metric-value">{incidentCount}</span>
            <span className="metric-label">Incidents</span>
          </div>
          <div className="metric-card">
            <span className="metric-value">{nearMissCount}</span>
            <span className="metric-label">Near Misses</span>
          </div>
          <div className="metric-card">
            <span className="metric-value">{lostTimeIncidents}</span>
            <span className="metric-label">Lost Time Incidents</span>
          </div>
          <div className="metric-card">
            <span className="metric-value">{totalRecordableIncidentRate.toFixed(2)}</span>
            <span className="metric-label">Total Recordable IR</span>
          </div>
          <div className="metric-card">
            <span className="metric-value">{lostTimeIncidentRate.toFixed(2)}</span>
            <span className="metric-label">Lost Time IR</span>
          </div>
        </div>
      </div>
      
      <div className="metrics-section">
        <h3>Leading Indicators</h3>
        <div className="metrics-grid">
          <div className="metric-card">
            <span className="metric-value">{inspectionRate}%</span>
            <span className="metric-label">Inspection Completion</span>
          </div>
          <div className="metric-card">
            <span className="metric-value">{trainingCompleted}%</span>
            <span className="metric-label">Training Completed</span>
          </div>
          <div className="metric-card">
            <span className="metric-value">{safetyObservations}</span>
            <span className="metric-label">Safety Observations</span>
          </div>
          <div className="metric-card">
            <span className="metric-value">{safetyMeetings}</span>
            <span className="metric-label">Safety Meetings</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetricsOverview;