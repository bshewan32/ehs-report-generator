// client/src/components/reports/IncidentMetrics.js
import React, { useMemo } from 'react';

const IncidentMetrics = ({ incidents = [] }) => {
  // Calculate metrics based on incidents
  const metrics = useMemo(() => {
    // Initialize counters
    const counts = {
      nearMiss: 0,
      firstAid: 0,
      medicalTreatment: 0,
      lostTime: 0,
      fatality: 0,
      total: 0
    };
    
    // Count incidents by type
    incidents.forEach(incident => {
      counts.total++;
      
      switch(incident.type) {
        case 'Near Miss':
          counts.nearMiss++;
          break;
        case 'First Aid':
          counts.firstAid++;
          break;
        case 'Medical Treatment':
          counts.medicalTreatment++;
          break;
        case 'Lost Time':
          counts.lostTime++;
          break;
        case 'Fatality':
          counts.fatality++;
          break;
        default:
          break;
      }
    });
    
    // Calculate recordable incident rate (if we had hours worked)
    // TRIR = (Recordable incidents × 200,000) ÷ Hours worked
    // For now, we'll just return the counts
    
    return counts;
  }, [incidents]);
  
  return (
    <div className="incident-metrics">
      <h3>Incident Summary</h3>
      
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-title">Near Misses</div>
          <div className="metric-value">{metrics.nearMiss}</div>
        </div>
        
        <div className="metric-card">
          <div className="metric-title">First Aid Cases</div>
          <div className="metric-value">{metrics.firstAid}</div>
        </div>
        
        <div className="metric-card">
          <div className="metric-title">Medical Treatment Cases</div>
          <div className="metric-value">{metrics.medicalTreatment}</div>
        </div>
        
        <div className="metric-card">
          <div className="metric-title">Lost Time Injuries</div>
          <div className="metric-value">{metrics.lostTime}</div>
        </div>
        
        <div className="metric-card">
          <div className="metric-title">Fatalities</div>
          <div className="metric-value">{metrics.fatality}</div>
        </div>
        
        <div className="metric-card">
          <div className="metric-title">Total Incidents</div>
          <div className="metric-value">{metrics.total}</div>
        </div>
      </div>
    </div>
  );
};

export default IncidentMetrics;