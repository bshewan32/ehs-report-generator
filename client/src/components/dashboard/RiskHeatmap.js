// client/src/components/dashboard/RiskHeatmap.js
import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const RiskHeatmap = ({ riskAreas }) => {
  // Prepare data for visualization
  const prepareData = () => {
    if (!riskAreas || riskAreas.length === 0) return [];
    
    // Map risk areas to visualization data
    return riskAreas.map(risk => ({
      name: risk.name,
      count: risk.count,
      x: Math.random() * 100, // Random position for visualization
      y: Math.random() * 100,
      z: risk.highCount, // Size based on high-risk count
    }));
  };

  const data = prepareData();

  if (data.length === 0) {
    return <div className="chart-placeholder">No risk data available</div>;
  }

  return (
    <div className="risk-chart">
      <ResponsiveContainer width="100%" height={300}>
        <ScatterChart
          margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
        >
          <CartesianGrid />
          <XAxis type="number" dataKey="x" name="random" hide />
          <YAxis type="number" dataKey="y" name="random" hide />
          <ZAxis type="number" dataKey="z" range={[100, 1000]} name="high-risk count" />
          <Tooltip 
            cursor={{ strokeDasharray: '3 3' }}
            formatter={(value, name, props) => {
              if (name === 'high-risk count') {
                return [props.payload.z, 'High Risk Count'];
              }
              return [props.payload.name, 'Risk Area'];
            }}
          />
          <Scatter name="Risk Areas" data={data} fill="#ff7300" />
        </ScatterChart>
      </ResponsiveContainer>
      
      <div className="risk-table">
        <h4>Top Risk Areas</h4>
        <table>
          <thead>
            <tr>
              <th>Risk Area</th>
              <th>Total Instances</th>
              <th>High Risk Instances</th>
            </tr>
          </thead>
          <tbody>
            {riskAreas.slice(0, 5).map((risk, index) => (
              <tr key={index}>
                <td>{risk.name}</td>
                <td>{risk.count}</td>
                <td className={risk.highCount > 0 ? 'high-risk' : ''}>{risk.highCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RiskHeatmap;