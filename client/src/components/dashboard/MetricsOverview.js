// client/src/components/dashboard/MetricsOverview.js
import React from 'react';

const MetricsOverview = ({ metrics }) => {
  if (!metrics) {
    return <div>No metrics data available</div>;
  }

  return (
    <div className="metrics-overview">
      <div className="metric-card">
        <h3>Total Reports</h3>
        <p className="metric-value">{metrics.totalReports}</p>
      </div>
      <div className="metric-card">
        <h3>Total Incidents</h3>
        <p className="metric-value">{metrics.totalIncidents}</p>
      </div>
      <div className="metric-card">
        <h3>Near Misses</h3>
        <p className="metric-value">{metrics.totalNearMisses}</p>
      </div>
      <div className="metric-card">
        <h3>Lost Time Incidents</h3>
        <p className="metric-value">{metrics.totalLostTimeIncidents}</p>
      </div>
      <div className="metric-card">
        <h3>Inspection Completion</h3>
        <p className="metric-value">{metrics.inspectionCompletion.toFixed(1)}%</p>
      </div>
      <div className="metric-card">
        <h3>Training Completion</h3>
        <p className="metric-value">{metrics.trainingCompletion.toFixed(1)}%</p>
      </div>
    </div>
  );
};

export default MetricsOverview;