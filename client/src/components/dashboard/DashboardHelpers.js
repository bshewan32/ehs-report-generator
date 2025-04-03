// client/src/components/dashboard/DashboardHelpers.js

/**
 * Helper function to calculate metrics based on KPI data
 * This can be used to sync metrics between KPIs and the dashboard
 * 
 * @param {Array} kpis - Array of KPI objects
 * @param {Object} metrics - Current metrics object
 * @returns {Object} Updated metrics object
 */
export const syncMetricsWithKPI = (kpis, metrics) => {
    if (!kpis || kpis.length === 0 || !metrics) {
      return metrics;
    }
    
    const updatedMetrics = { ...metrics };
    
    // Get the near miss KPI if it exists
    const nearMissKPI = kpis.find(kpi => kpi.id === 'nearMissRate');
    if (nearMissKPI && nearMissKPI.nearMissCount) {
      // If we don't have lagging metrics initialized yet
      if (!updatedMetrics.lagging) {
        updatedMetrics.lagging = {};
      }
      
      // Update near miss count from KPI data
      updatedMetrics.lagging.nearMissCount = nearMissKPI.nearMissCount;
      
      // Add hours worked data which isn't normally tracked
      updatedMetrics.hoursWorked = nearMissKPI.hoursWorked;
    }
    
    // Get the critical risk verification KPI
    const criticalRiskKPI = kpis.find(kpi => kpi.id === 'criticalRiskVerification');
    if (criticalRiskKPI) {
      // Add critical risk verification metrics which aren't tracked elsewhere
      updatedMetrics.criticalRiskVerification = {
        percentage: criticalRiskKPI.actual,
        verifiedTasks: criticalRiskKPI.verifiedTasks,
        totalTasks: criticalRiskKPI.totalTasks
      };
    }
    
    // Get the electrical safety compliance KPI
    const electricalSafetyKPI = kpis.find(kpi => kpi.id === 'electricalSafetyCompliance');
    if (electricalSafetyKPI) {
      // Add electrical safety compliance metrics
      updatedMetrics.electricalSafetyCompliance = {
        percentage: electricalSafetyKPI.actual,
        compliantItems: electricalSafetyKPI.compliantItems,
        auditItems: electricalSafetyKPI.auditItems
      };
    }
    
    return updatedMetrics;
  };
  
  /**
   * Helper function to update the dashboard metrics overview with KPI data
   * 
   * @param {Object} metrics - Original metrics object
   * @returns {Object} Enhanced metrics object with KPI-specific data
   */
  export const enhanceMetricsWithKPI = (metrics) => {
    if (!metrics || !metrics.kpis || metrics.kpis.length === 0) {
      return metrics;
    }
    
    // Make a copy of the metrics
    const enhancedMetrics = { ...metrics };
    
    // Calculate trends if we have KPI data
    // This is simulated in this implementation but could be calculated
    // by comparing with previous periods in a real implementation
    const nearMissKPI = metrics.kpis.find(kpi => kpi.id === 'nearMissRate');
    const criticalRiskKPI = metrics.kpis.find(kpi => kpi.id === 'criticalRiskVerification');
    const electricalSafetyKPI = metrics.kpis.find(kpi => kpi.id === 'electricalSafetyCompliance');
    
    // Add trend data for the MetricsOverview component to display
    if (nearMissKPI) {
      enhancedMetrics.nearMissReportingRate = nearMissKPI.actual;
      // Simulate trend - could be calculated from actual data in production
      enhancedMetrics.nearMissReportingTrend = nearMissKPI.actual > nearMissKPI.target ? 5 : -3; 
    }
    
    if (criticalRiskKPI) {
      enhancedMetrics.criticalRiskVerificationRate = criticalRiskKPI.actual;
      // Simulate trend
      enhancedMetrics.criticalRiskVerificationTrend = criticalRiskKPI.actual > 95 ? 2 : -2; 
    }
    
    if (electricalSafetyKPI) {
      enhancedMetrics.electricalSafetyComplianceRate = electricalSafetyKPI.actual;
      // Simulate trend
      enhancedMetrics.electricalSafetyComplianceTrend = electricalSafetyKPI.actual > 90 ? 3 : -4; 
    }
    
    return enhancedMetrics;
  };