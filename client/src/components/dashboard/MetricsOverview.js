import React from 'react';

const MetricsOverview = ({ metrics }) => {
  console.log('MetricsOverview - Received metrics:', metrics);
  
  // Fallback data if metrics is null or undefined
  const defaultMetrics = {
    incidentCount: 12,
    incidentTrend: -5,
    nearMissCount: 24,
    nearMissTrend: 15,
    inspectionCount: metrics.inspectionsCompleted || 0,
    inspectionTrend: 8,
    trainingCompliance: metrics.trainingCompleted || 0,
    trainingTrend: 3,
    riskAssessmentCount: metrics.riskAssessmentCompleted || 0,
    riskAssessmentTrend: 0,
    avgRiskScore: 63,
    riskScoreTrend: -8,
    // Add KPI-specific metrics
    nearMissReportingRate: 8.5,
    nearMissReportingTrend: 4,
    criticalRiskVerificationRate: 92,
    criticalRiskVerificationTrend: 3,
    electricalSafetyComplianceRate: 88,
    electricalSafetyComplianceTrend: -2
  };

  // Use provided metrics or fallback to defaults
  const data = metrics || defaultMetrics;
  
  console.log('MetricsOverview - Using data:', data);

  // Helper function to determine trend icon and class
  const getTrendIndicator = (trendValue) => {
    if (trendValue > 0) {
      return { 
        icon: "↑", 
        class: 'trend-up',
        text: `${trendValue}% increase`
      };
    } else if (trendValue < 0) {
      return { 
        icon: "↓", 
        class: 'trend-down',
        text: `${Math.abs(trendValue)}% decrease`
      };
    } else {
      return { 
        icon: "―", 
        class: '',
        text: 'No change'
      };
    }
  };

  // Helper function to determine if a trend is positive or negative based on metric type
  const getMetricClass = (value, trend, isPositiveBetter) => {
    if (trend === 0) return 'neutral';
    return (trend > 0 && isPositiveBetter) || (trend < 0 && !isPositiveBetter) 
      ? 'positive' 
      : 'negative';
  };

  const incidentTrend = getTrendIndicator(data.incidentTrend);
  const nearMissTrend = getTrendIndicator(data.nearMissTrend);
  const firstAidTrend = getTrendIndicator(data.firstAidTrend || 0);
  const medicalTreatmentTrend = getTrendIndicator(data.medicalTreatmentTrend || 0);
  const inspectionTrend = getTrendIndicator(data.inspectionTrend);
  const trainingTrend = getTrendIndicator(data.trainingTrend);
  const riskAssessmentTrend = getTrendIndicator(data.riskAssessmentTrend);
  const riskScoreTrend = getTrendIndicator(data.riskScoreTrend);

  return (
    <div className="metrics-overview">
      <h4 className="metric-section-title">Lagging Indicators</h4>
      
      {/* Lagging Indicators - Incidents */}
      <div className="metric-card">
        <div className="metric-title">Incidents (YTD)</div>
        <div className={`metric-value ${getMetricClass(data.incidentCount, data.incidentTrend, false)}`}>
          {data.incidentCount}
        </div>
        <div className={`metric-trend ${incidentTrend.class}`}>
          <span className="trend-icon">{incidentTrend.icon}</span>
          {incidentTrend.text}
        </div>
      </div>

      {/* Lagging Indicators - Near Misses */}
      <div className="metric-card">
        <div className="metric-title">Near Misses (YTD)</div>
        <div className={`metric-value ${getMetricClass(data.nearMissCount, data.nearMissTrend, true)}`}>
          {data.nearMissCount}
        </div>
        <div className={`metric-trend ${nearMissTrend.class}`}>
          <span className="trend-icon">{nearMissTrend.icon}</span>
          {nearMissTrend.text}
        </div>
      </div>

      {/* Lagging Indicators - First Aid Cases */}
      <div className="metric-card">
        <div className="metric-title">First Aid Cases</div>
        <div className={`metric-value ${getMetricClass(data.firstAidCount, data.firstAidTrend || 0, false)}`}>
          {data.firstAidCount || 0}
        </div>
        <div className={`metric-trend ${firstAidTrend.class}`}>
          <span className="trend-icon">{firstAidTrend.icon}</span>
          {firstAidTrend.text}
        </div>
      </div>

      {/* Lagging Indicators - Medical Treatment Cases */}
      <div className="metric-card">
        <div className="metric-title">Medical Treatments</div>
        <div className={`metric-value ${getMetricClass(data.medicalTreatmentCount, data.medicalTreatmentTrend || 0, false)}`}>
          {data.medicalTreatmentCount || 0}
        </div>
        <div className={`metric-trend ${medicalTreatmentTrend.class}`}>
          <span className="trend-icon">{medicalTreatmentTrend.icon}</span>
          {medicalTreatmentTrend.text}
        </div>
      </div>

      <h4 className="metric-section-title">Leading Indicators</h4>
      
      {/* Leading Indicators - Inspections */}
      <div className="metric-card">
        <div className="metric-title">Inspections (YTD)</div>
        <div className={`metric-value ${getMetricClass(data.inspectionCount, data.inspectionTrend, true)}`}>
          {data.inspectionCount}
        </div>
        <div className={`metric-trend ${inspectionTrend.class}`}>
          <span className="trend-icon">{inspectionTrend.icon}</span>
          {inspectionTrend.text}
        </div>
      </div>

      {/* Leading Indicators - Training Compliance */}
      <div className="metric-card">
        <div className="metric-title">Training Compliance</div>
        <div className={`metric-value ${getMetricClass(data.trainingCompliance, data.trainingTrend, true)}`}>
          {data.trainingCompliance}%
        </div>
        <div className={`metric-trend ${trainingTrend.class}`}>
          <span className="trend-icon">{trainingTrend.icon}</span>
          {trainingTrend.text}
        </div>
      </div>

      {/* Leading Indicators - Risk Assessments */}
      <div className="metric-card">
        <div className="metric-title">Risk Assessments</div>
        <div className={`metric-value ${getMetricClass(data.riskAssessmentCount, data.riskAssessmentTrend, true)}`}>
          {data.riskAssessmentCount}
        </div>
        <div className={`metric-trend ${riskAssessmentTrend.class}`}>
          <span className="trend-icon">{riskAssessmentTrend.icon}</span>
          {riskAssessmentTrend.text}
        </div>
      </div>

      {/* Risk Score */}
      <div className="metric-card">
        <div className="metric-title">Average Risk Score</div>
        <div className={`metric-value ${getMetricClass(data.avgRiskScore, data.riskScoreTrend, false)}`}>
          {data.avgRiskScore}
        </div>
        <div className={`metric-trend ${riskScoreTrend.class}`}>
          <span className="trend-icon">{riskScoreTrend.icon}</span>
          {riskScoreTrend.text}
        </div>
      </div>

      <h4 className="metric-section-title">KPI Metrics</h4>

      {/* KPI - Near Miss Reporting Rate */}
      <div className="metric-card">
        <div className="metric-title">Near Miss Reporting Rate</div>
        <div className="metric-value">
          {data.nearMissReportingRate || 0}
          <span className="metric-unit"> per 100K hrs</span>
        </div>
      </div>

      {/* KPI - Critical Risk Verification */}
      <div className="metric-card">
        <div className="metric-title">Critical Risk Verification</div>
        <div className="metric-value">
          {data.criticalRiskVerificationRate || 0}%
        </div>
      </div>

      {/* KPI - Electrical Safety Compliance */}
      <div className="metric-card">
        <div className="metric-title">Electrical Safety Compliance</div>
        <div className="metric-value">
          {data.electricalSafetyComplianceRate || 0}%
        </div>
      </div>
    </div>
  );
};

export default MetricsOverview;