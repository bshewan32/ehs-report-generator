// client/src/components/dashboard/MetricsOverview.js
import React from 'react';

const MetricsOverview = ({ metrics }) => {
  console.log('MetricsOverview - Received metrics:', metrics);
  
  // Fallback data if metrics is null or undefined
  const defaultMetrics = {
    incidentCount: 12,
    incidentTrend: -5,
    nearMissCount: 24,
    nearMissTrend: 15,
    inspectionCount: 18,
    inspectionTrend: 8,
    trainingCompliance: 92,
    trainingTrend: 3,
    riskAssessmentCount: 7,
    riskAssessmentTrend: 0,
    avgRiskScore: 63,
    riskScoreTrend: -8
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

  return (
    <div className="metrics-overview">
      {/* Lagging Indicators - Incidents */}
      <div className="metric-card">
        <div className="metric-title">Incidents (YTD)</div>
        <div className={`metric-value ${getMetricClass(data.incidentCount, data.incidentTrend, false)}`}>
          {data.incidentCount}
        </div>
        <div className={`metric-trend ${getTrendIndicator(data.incidentTrend).class}`}>
          <span className="trend-icon">{getTrendIndicator(data.incidentTrend).icon}</span>
          {getTrendIndicator(data.incidentTrend).text}
        </div>
      </div>

      {/* Lagging Indicators - Near Misses */}
      <div className="metric-card">
        <div className="metric-title">Near Misses (YTD)</div>
        <div className={`metric-value ${getMetricClass(data.nearMissCount, data.nearMissTrend, true)}`}>
          {data.nearMissCount}
        </div>
        <div className={`metric-trend ${getTrendIndicator(data.nearMissTrend).class}`}>
          <span className="trend-icon">{getTrendIndicator(data.nearMissTrend).icon}</span>
          {getTrendIndicator(data.nearMissTrend).text}
        </div>
      </div>

      {/* Leading Indicators - Inspections */}
      <div className="metric-card">
        <div className="metric-title">Inspections (YTD)</div>
        <div className={`metric-value ${getMetricClass(data.inspectionCount, data.inspectionTrend, true)}`}>
          {data.inspectionCount}
        </div>
        <div className={`metric-trend ${getTrendIndicator(data.inspectionTrend).class}`}>
          <span className="trend-icon">{getTrendIndicator(data.inspectionTrend).icon}</span>
          {getTrendIndicator(data.inspectionTrend).text}
        </div>
      </div>

      {/* Leading Indicators - Training Compliance */}
      <div className="metric-card">
        <div className="metric-title">Training Compliance</div>
        <div className={`metric-value ${getMetricClass(data.trainingCompliance, data.trainingTrend, true)}`}>
          {data.trainingCompliance}%
        </div>
        <div className={`metric-trend ${getTrendIndicator(data.trainingTrend).class}`}>
          <span className="trend-icon">{getTrendIndicator(data.trainingTrend).icon}</span>
          {getTrendIndicator(data.trainingTrend).text}
        </div>
      </div>

      {/* Leading Indicators - Risk Assessments */}
      <div className="metric-card">
        <div className="metric-title">Risk Assessments</div>
        <div className={`metric-value ${getMetricClass(data.riskAssessmentCount, data.riskAssessmentTrend, true)}`}>
          {data.riskAssessmentCount}
        </div>
        <div className={`metric-trend ${getTrendIndicator(data.riskAssessmentTrend).class}`}>
          <span className="trend-icon">{getTrendIndicator(data.riskAssessmentTrend).icon}</span>
          {getTrendIndicator(data.riskAssessmentTrend).text}
        </div>
      </div>

      {/* Risk Score */}
      <div className="metric-card">
        <div className="metric-title">Average Risk Score</div>
        <div className={`metric-value ${getMetricClass(data.avgRiskScore, data.riskScoreTrend, false)}`}>
          {data.avgRiskScore}
        </div>
        <div className={`metric-trend ${getTrendIndicator(data.riskScoreTrend).class}`}>
          <span className="trend-icon">{getTrendIndicator(data.riskScoreTrend).icon}</span>
          {getTrendIndicator(data.riskScoreTrend).text}
        </div>
      </div>
    </div>
  );
};

export default MetricsOverview;