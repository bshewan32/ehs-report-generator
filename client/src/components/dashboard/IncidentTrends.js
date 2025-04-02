import React from 'react';
import { useSelector } from 'react-redux';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const IncidentTrends = () => {
  const { reports } = useSelector(state => state.reports);

  // Process report data for trend chart
  const processChartData = () => {
    if (!reports || reports.length === 0) return [];

    // Sort reports by period
    const sortedReports = [...reports].sort((a, b) => {
      // Try to convert period to date for sorting
      const aDate = new Date(a.reportPeriod);
      const bDate = new Date(b.reportPeriod);
      
      if (!isNaN(aDate) && !isNaN(bDate)) {
        return aDate - bDate;
      }
      
      // Fallback to string comparison
      return a.reportPeriod.localeCompare(b.reportPeriod);
    });

    // Take the last 6 reports for trending
    const recentReports = sortedReports.slice(-6);

    // Map to chart data format
    return recentReports.map(report => ({
      period: report.reportPeriod,
      incidents: report.metrics?.lagging?.incidentCount || 0,
      nearMisses: report.metrics?.lagging?.nearMissCount || 0,
      lostTime: report.metrics?.lagging?.lostTimeIncidents || 0,
      firstAid: report.metrics?.lagging?.firstAidCases || 0,
      medicalTreatment: report.metrics?.lagging?.medicalTreatmentCases || 0
    }));
  };

  const chartData = processChartData();

  return (
    <div className="incident-trends-chart">
      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="incidents" stroke="#8884d8" name="Incidents" />
            <Line type="monotone" dataKey="nearMisses" stroke="#82ca9d" name="Near Misses" />
            <Line type="monotone" dataKey="lostTime" stroke="#ff7300" name="Lost Time" />
            <Line type="monotone" dataKey="firstAid" stroke="#00c49f" name="First Aid" />
            <Line type="monotone" dataKey="medicalTreatment" stroke="#ff69b4" name="Medical Treatment" />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="chart-placeholder">
          <p>Insufficient data for trend analysis. Create more reports to see trends over time.</p>
        </div>
      )}
    </div>
  );
};

export default IncidentTrends;