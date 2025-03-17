// client/src/components/dashboard/MetricsOverview.js again
import React from 'react';
const { FaArrowUp, FaArrowDown, FaMinus } = window.ReactIcons.fa;

const MetricsOverview = ({ metrics }) => {
  // Fallback data if metrics is null or undefined
  const defaultMetrics = {
    incidentCount: 0,
    incidentTrend: 0,
    nearMissCount: 0,
    nearMissTrend: 0,
    inspectionCount: 0,
    inspectionTrend: 0,
    trainingCompliance: 0,
    trainingTrend: 0,
    riskAssessmentCount: 0,
    riskAssessmentTrend: 0,
    avgRiskScore: 0,
    riskScoreTrend: 0
  };

  const data = metrics || defaultMetrics;

  // Helper function to determine trend icon and class
  const getTrendIndicator = (trendValue) => {
    if (trendValue > 0) {
      return { 
        icon: <FaArrowUp className="trend-icon" />, 
        class: 'trend-up',
        text: `${trendValue}% increase`
      };
    } else if (trendValue < 0) {
      return { 
        icon: <FaArrowDown className="trend-icon" />, 
        class: 'trend-down',
        text: `${Math.abs(trendValue)}% decrease`
      };
    } else {
      return { 
        icon: <FaMinus className="trend-icon" />, 
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
          {getTrendIndicator(data.incidentTrend).icon}
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
          {getTrendIndicator(data.nearMissTrend).icon}
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
          {getTrendIndicator(data.inspectionTrend).icon}
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
          {getTrendIndicator(data.trainingTrend).icon}
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
          {getTrendIndicator(data.riskAssessmentTrend).icon}
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
          {getTrendIndicator(data.riskScoreTrend).icon}
          {getTrendIndicator(data.riskScoreTrend).text}
        </div>
      </div>
    </div>
  );
};

export default MetricsOverview;