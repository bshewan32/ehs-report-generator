// New component: client/src/components/dashboard/CriticalRiskStatus.js
import React from 'react';
import { useSelector } from 'react-redux';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CriticalRiskStatus = () => {
  const { reports } = useSelector(state => state.reports);
  
  // Process critical risk data from reports
  const processCriticalRiskData = () => {
    if (!reports || reports.length === 0) return [];
    
    // Use the most recent report for critical risk status
    const sortedReports = [...reports].sort((a, b) => 
      new Date(b.reportDate || b.createdAt) - new Date(a.reportDate || a.createdAt)
    );
    
    const recentReport = sortedReports[0];
    
    if (!recentReport.criticalRisks) return [];
    
    // Convert Map to array for charting
    return Object.entries(recentReport.criticalRisks).map(([id, risk]) => ({
      name: risk.name,
      incidents: risk.incidents || 0,
      status: risk.status || 'adequate'
    })).slice(0, 6); // Show top 6 risks
  };

  const riskData = processCriticalRiskData();
  
  // Map status to numeric value for visualization
  const getStatusScore = (status) => {
    switch(status) {
      case 'effective': return 4;
      case 'adequate': return 3;
      case 'needsImprovement': return 2;
      case 'inadequate': return 1;
      default: return 3;
    }
  };
  
  // Add status score to chart data
  const chartData = riskData.map(risk => ({
    ...risk,
    statusScore: getStatusScore(risk.status)
  }));

  return (
    <div className="critical-risk-chart">
      {chartData.length > 0 ? (
        <>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
              <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
              <Tooltip />
              <Bar yAxisId="left" dataKey="incidents" fill="#8884d8" name="Incidents" />
              <Bar yAxisId="right" dataKey="statusScore" fill="#82ca9d" name="Control Status" />
            </BarChart>
          </ResponsiveContainer>
          
          <div className="risk-table mt-4">
            <h4>Critical Risk Protocols</h4>
            <table>
              <thead>
                <tr>
                  <th>Risk</th>
                  <th>Status</th>
                  <th>Incidents</th>
                </tr>
              </thead>
              <tbody>
                {chartData.map((risk, index) => (
                  <tr key={index}>
                    <td>{risk.name}</td>
                    <td className={`status-${risk.status}`}>
                      {risk.status.charAt(0).toUpperCase() + risk.status.slice(1).replace(/([A-Z])/g, ' $1')}
                    </td>
                    <td className={risk.incidents > 0 ? 'high-risk' : ''}>{risk.incidents}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="chart-placeholder">
          <p>No critical risk data available. Create a report with critical risk information.</p>
        </div>
      )}
    </div>
  );
};

export default CriticalRiskStatus;