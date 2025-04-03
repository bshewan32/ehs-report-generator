// client/src/components/kpi/KPITracker.js
import React, { useState, useEffect } from 'react';
import './KPITracker.css';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';

const KPITracker = ({ 
  kpiData = [], // Array of KPI objects
  onKPIChange = null, // Callback for when KPI data changes (for the form)
  editMode = false, // Whether the component is in edit mode (for the form)
  year = new Date().getFullYear() // Current year for the KPIs
}) => {
  // Define default KPIs if none provided
  const defaultKPIs = [
    {
      id: 'nearMissRate',
      name: 'Near Miss Reporting Rate',
      description: 'Number of near misses reported per 100,000 hours worked',
      target: 10,
      actual: 0,
      unit: 'per 100K hrs',
      hoursWorked: 0,
      nearMissCount: 0
    },
    {
      id: 'criticalRiskVerification',
      name: 'Critical Risk Verification',
      description: 'Percentage of critical risk tasks verified with appropriate controls',
      target: 100,
      actual: 0,
      unit: '%',
      totalTasks: 0,
      verifiedTasks: 0
    },
    {
      id: 'electricalSafetyCompliance',
      name: 'Electrical Safety Compliance',
      description: 'Percentage compliance with LOTO, work permits and PPE requirements',
      target: 100,
      actual: 0,
      unit: '%',
      auditItems: 0,
      compliantItems: 0
    }
  ];

  // Initialize state with provided data or defaults
  const [kpis, setKPIs] = useState(kpiData.length > 0 ? kpiData : defaultKPIs);

  // Effect to update KPIs when prop data changes
  useEffect(() => {
    if (kpiData && kpiData.length > 0) {
      setKPIs(kpiData);
    }
  }, [kpiData]);

  // Calculate KPI performance percentage
  const calculatePerformance = (kpi) => {
    if (kpi.target === 0) return 0;
    
    // For metrics where higher is better (like near miss reporting)
    if (kpi.id === 'nearMissRate') {
      return (kpi.actual / kpi.target) * 100;
    }
    
    // For metrics where we're targeting 100% (compliance metrics)
    return kpi.actual;
  };

  // Get color based on performance
  const getPerformanceColor = (kpi) => {
    const performance = calculatePerformance(kpi);
    
    // For near miss reporting, higher is better
    if (kpi.id === 'nearMissRate') {
      if (performance >= 100) return '#10b981'; // Green - meeting or exceeding target
      if (performance >= 75) return '#f59e0b'; // Amber - close to target
      return '#ef4444'; // Red - far from target
    }
    
    // For compliance metrics, higher is better, but scale is tighter
    if (performance >= 95) return '#10b981'; // Green
    if (performance >= 85) return '#f59e0b'; // Amber
    return '#ef4444'; // Red
  };

  // Update a KPI's actual value based on input
  const handleKPIInputChange = (id, field, value) => {
    const updatedKPIs = kpis.map(kpi => {
      if (kpi.id === id) {
        const updatedKPI = { ...kpi, [field]: parseFloat(value) || 0 };
        
        // Recalculate actual values based on input components
        if (id === 'nearMissRate' && (field === 'nearMissCount' || field === 'hoursWorked')) {
          updatedKPI.actual = updatedKPI.hoursWorked > 0 
            ? (updatedKPI.nearMissCount / updatedKPI.hoursWorked) * 100000 
            : 0;
        } else if (id === 'criticalRiskVerification' && (field === 'totalTasks' || field === 'verifiedTasks')) {
          updatedKPI.actual = updatedKPI.totalTasks > 0 
            ? (updatedKPI.verifiedTasks / updatedKPI.totalTasks) * 100 
            : 0;
        } else if (id === 'electricalSafetyCompliance' && (field === 'auditItems' || field === 'compliantItems')) {
          updatedKPI.actual = updatedKPI.auditItems > 0 
            ? (updatedKPI.compliantItems / updatedKPI.auditItems) * 100 
            : 0;
        }

        // Round to 1 decimal place
        updatedKPI.actual = Math.round(updatedKPI.actual * 10) / 10;
        
        return updatedKPI;
      }
      return kpi;
    });

    setKPIs(updatedKPIs);
    
    // If callback provided, send updated KPIs
    if (onKPIChange) {
      onKPIChange(updatedKPIs);
    }
  };

  // Format data for the chart
  const chartData = kpis.map(kpi => ({
    name: kpi.name,
    actual: kpi.actual,
    target: kpi.target,
    id: kpi.id,
    unit: kpi.unit
  }));

  // Render the KPI tracker with conditional editing UI
  return (
    <div className="kpi-tracker">
      <div className="kpi-header">
        <h3>Key Performance Indicators ({year})</h3>
      </div>

      <div className="kpi-visualization">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={100}
            />
            <YAxis />
            <Tooltip 
              formatter={(value, name, props) => {
                const unit = props.payload.unit;
                return [`${value} ${unit}`, name === 'actual' ? 'Actual' : 'Target'];
              }}
            />
            <Legend 
              verticalAlign="top"
              formatter={(value) => value === 'actual' ? 'Actual' : 'Target'}
            />
            <Bar name="actual" dataKey="actual" fill="#8884d8">
              {chartData.map((entry, index) => {
                const kpi = kpis.find(k => k.id === entry.id);
                return <Cell key={`cell-${index}`} fill={getPerformanceColor(kpi)} />;
              })}
            </Bar>
            {chartData.map((entry, index) => (
              <ReferenceLine 
                key={`ref-${index}`}
                x={entry.name} 
                y={entry.target} 
                stroke="black"
                strokeDasharray="3 3"
                strokeWidth={2}
                isFront={true}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="kpi-metrics">
        {kpis.map(kpi => (
          <div className="kpi-card" key={kpi.id}>
            <div className="kpi-card-header">
              <h4>{kpi.name}</h4>
              <span className="kpi-description">{kpi.description}</span>
            </div>
            
            <div className="kpi-card-body">
              <div className="kpi-values">
                <div className="kpi-actual">
                  <span className="label">Actual:</span>
                  <span 
                    className="value" 
                    style={{ color: getPerformanceColor(kpi) }}
                  >
                    {kpi.actual} {kpi.unit}
                  </span>
                </div>
                <div className="kpi-target">
                  <span className="label">Target:</span>
                  <span className="value">
                    {editMode ? (
                      <input 
                        type="number" 
                        value={kpi.target} 
                        onChange={(e) => handleKPIInputChange(kpi.id, 'target', e.target.value)}
                        className="kpi-input"
                        min="0"
                        step="1"
                      />
                    ) : (
                      `${kpi.target} ${kpi.unit}`
                    )}
                  </span>
                </div>
              </div>
              
              {/* Render calculation inputs in edit mode */}
              {editMode && (
                <div className="kpi-inputs">
                  {kpi.id === 'nearMissRate' && (
                    <>
                      <div className="kpi-input-field">
                        <label>Near Misses:</label>
                        <input 
                          type="number"
                          value={kpi.nearMissCount || 0}
                          onChange={(e) => handleKPIInputChange(kpi.id, 'nearMissCount', e.target.value)}
                          min="0"
                          className="kpi-input"
                        />
                      </div>
                      <div className="kpi-input-field">
                        <label>Hours Worked:</label>
                        <input 
                          type="number"
                          value={kpi.hoursWorked || 0}
                          onChange={(e) => handleKPIInputChange(kpi.id, 'hoursWorked', e.target.value)}
                          min="0"
                          className="kpi-input"
                        />
                      </div>
                    </>
                  )}
                  
                  {kpi.id === 'criticalRiskVerification' && (
                    <>
                      <div className="kpi-input-field">
                        <label>Verified Tasks:</label>
                        <input 
                          type="number"
                          value={kpi.verifiedTasks || 0}
                          onChange={(e) => handleKPIInputChange(kpi.id, 'verifiedTasks', e.target.value)}
                          min="0"
                          className="kpi-input"
                        />
                      </div>
                      <div className="kpi-input-field">
                        <label>Total Tasks:</label>
                        <input 
                          type="number"
                          value={kpi.totalTasks || 0}
                          onChange={(e) => handleKPIInputChange(kpi.id, 'totalTasks', e.target.value)}
                          min="0"
                          className="kpi-input"
                        />
                      </div>
                    </>
                  )}
                  
                  {kpi.id === 'electricalSafetyCompliance' && (
                    <>
                      <div className="kpi-input-field">
                        <label>Compliant Items:</label>
                        <input 
                          type="number"
                          value={kpi.compliantItems || 0}
                          onChange={(e) => handleKPIInputChange(kpi.id, 'compliantItems', e.target.value)}
                          min="0"
                          className="kpi-input"
                        />
                      </div>
                      <div className="kpi-input-field">
                        <label>Total Audit Items:</label>
                        <input 
                          type="number"
                          value={kpi.auditItems || 0}
                          onChange={(e) => handleKPIInputChange(kpi.id, 'auditItems', e.target.value)}
                          min="0"
                          className="kpi-input"
                        />
                      </div>
                    </>
                  )}
                </div>
              )}
              
              {/* Performance indicator - circular gauge */}
              <div className="kpi-performance">
                <div 
                  className="performance-gauge"
                  style={{
                    background: `conic-gradient(
                      ${getPerformanceColor(kpi)} ${Math.min(100, calculatePerformance(kpi))}%, 
                      #e5e7eb ${Math.min(100, calculatePerformance(kpi))}%
                    )`
                  }}
                >
                  <div className="gauge-center">
                    {Math.round(calculatePerformance(kpi))}%
                  </div>
                </div>
                <span className="performance-label">Performance</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KPITracker;