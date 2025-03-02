// client/src/components/dashboard/ComplianceStatus.js
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const ComplianceStatus = ({ compliance }) => {
  if (!compliance) {
    return <div className="chart-placeholder">No compliance data available</div>;
  }

  // Prepare data for pie chart
  const data = [
    { name: 'Fully Compliant', value: compliance.fullyCompliant || 0 },
    { name: 'Partially Compliant', value: compliance.partiallyCompliant || 0 },
    { name: 'Non-Compliant', value: compliance.nonCompliant || 0 }
  ].filter(item => item.value > 0);

  const COLORS = ['#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="compliance-chart">
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <div className="chart-placeholder">
          <p>No compliance data available for visualization.</p>
        </div>
      )}
    </div>
  );
};

export default ComplianceStatus;