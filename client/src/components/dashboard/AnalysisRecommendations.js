
import { useDispatch, useSelector } from 'react-redux';
import React, { useEffect } from 'react';
import { getReports } from '../../features/reports/reportSlice';



const AnalysisRecommendations = () => {
  const { reports, loading } = useSelector(state => state.reports);
  const dispatch = useDispatch();


  useEffect(() => {
    if (!reports || reports.length === 0) {
      dispatch(getReports());
    }
  }, [dispatch, reports.length]); // Adding reports.length as dependency

  // At the beginning of the AnalysisRecommendations component
  useEffect(() => {
    if (reports && reports.length > 0) {
      console.log('Reports available for analysis:', reports);
      console.log('First report training data:', reports[0]?.metrics?.leading?.trainingCompleted);
      console.log('First report compliance data:', reports[0]?.compliance);
    }
    }, [reports]);

    if (loading || !Array.isArray(reports) || reports.length === 0) {
      return (
          <div className="analysis-container">
              <h3>Analysis & Recommendations</h3>
              <p>Insufficient data to generate analysis and recommendations.</p>
          </div>
      );
  }
  
  // Helper function to analyze metrics
  const analyzeMetrics = () => {
    // Get the last two reports to compare trends
    const sortedReports = [...reports].sort((a, b) => 
      new Date(b.reportDate || b.createdAt) - new Date(a.reportDate || a.createdAt)
    );
    
    const currentReport = sortedReports[0];
    const previousReport = sortedReports.length > 1 ? sortedReports[1] : null;
    
    const analysis = [];
    const recommendations = [];
    
    // Check if we have previous data to compare
    if (previousReport) {
      // Analyze incident trends
      const currentIncidents = currentReport.metrics?.lagging?.incidentCount || 0;
      const previousIncidents = previousReport.metrics?.lagging?.incidentCount || 0;
      
      if (currentIncidents > previousIncidents) {
        analysis.push(`Incident rate has increased from ${previousIncidents} to ${currentIncidents}.`);
        recommendations.push('Consider conducting a thorough review of safety procedures and controls.');
      } else if (currentIncidents < previousIncidents) {
        analysis.push(`Incident rate has decreased from ${previousIncidents} to ${currentIncidents}.`);
        analysis.push('Safety measures appear to be having a positive impact.');
      }
      
      // Analyze near miss trends
      const currentNearMisses = currentReport.metrics?.lagging?.nearMissCount || 0;
      const previousNearMisses = previousReport.metrics?.lagging?.nearMissCount || 0;
      
      if (currentNearMisses > previousNearMisses * 1.2) {
        analysis.push(`Near miss reporting has increased by ${((currentNearMisses/previousNearMisses) * 100 - 100).toFixed(0)}%.`);
        analysis.push('This could indicate improved safety awareness and reporting culture.');
      } else if (currentNearMisses < previousNearMisses * 0.8) {
        analysis.push(`Near miss reporting has decreased by ${((1 - currentNearMisses/previousNearMisses) * 100).toFixed(0)}%.`);
        recommendations.push('Review near miss reporting processes as underreporting may be occurring.');
      }
    }
    
    // Analyze current safety metrics
    const inspectionCompletion = currentReport.metrics?.leading?.inspectionsCompleted / 
                                (currentReport.metrics?.leading?.inspectionsPlanned || 1) * 100;
    
    if (inspectionCompletion < 80) {
      analysis.push(`Safety inspection completion rate is low at ${inspectionCompletion.toFixed(0)}%.`);
      recommendations.push('Prioritize completion of scheduled safety inspections.');
    }
    
    // Analyze training completion
    // For training data
      const trainingCompletion = currentReport.metrics?.leading?.trainingCompleted;
      console.log('Current report training completion:', trainingCompletion);

      if (trainingCompletion !== undefined && trainingCompletion !== null) {
          if (trainingCompletion < 85) {
              analysis.push(`Safety training completion rate is below target at ${trainingCompletion}%.`);
              recommendations.push('Implement measures to improve training completion rates.');
          } else {
              analysis.push(`Safety training completion rate is good at ${trainingCompletion}%.`);
          }
      } else {
          analysis.push('No safety training data available for analysis.');
          recommendations.push('Begin tracking training completion rates to improve monitoring of this leading indicator.');
      }

    
    // Analyze risk areas
    if (currentReport.riskAssessment && currentReport.riskAssessment.length > 0) {
      const highRisks = currentReport.riskAssessment.filter(risk => 
        risk.rating === 'High' || risk.rating === 'Critical'
      );
      
      if (highRisks.length > 0) {
        analysis.push(`There are ${highRisks.length} high or critical risk areas identified.`);
        
        const riskAreas = highRisks.map(risk => risk.risk).join(', ');
        analysis.push(`Key risk areas include: ${riskAreas}.`);
        
        recommendations.push('Develop specific action plans for each high and critical risk area.');
      }
    }
    
    // Analyze compliance
    console.log('Current report compliance:', currentReport.compliance);
if (currentReport.compliance) {
  const status = currentReport.compliance.status;
  
    if (status) {
        if (status !== 'Fully Compliant') {
            analysis.push(`Current compliance status is ${status}.`);

            if (currentReport.compliance.complianceIssues?.length > 0) {
                recommendations.push('Address identified compliance issues as a priority.');
            }
        } else {
            analysis.push('Organization is fully compliant with regulatory requirements.');
        }
    } else {
        analysis.push('Compliance status not specified in the report.');
        recommendations.push('Ensure compliance status is regularly assessed and documented.');
    }
} else {
    analysis.push('No compliance data available for analysis.');
    recommendations.push('Implement a compliance tracking system to monitor regulatory adherence.');
}

    // If we don't have much analysis, add some general statements
    if (analysis.length < 2) {
      analysis.push('Limited historical data available for trend analysis.');
      analysis.push('Continue regular monitoring of safety performance metrics.');
    }
    
    if (recommendations.length < 2) {
      recommendations.push('Maintain current safety management systems and controls.');
      recommendations.push('Continue emphasis on leading indicators such as inspections and training.');
    }
    
    return { analysis, recommendations };
  };
  
  const { analysis, recommendations } = analyzeMetrics();
  
  return (
    <div className="analysis-container">
      <h3>Analysis & Recommendations</h3>
      
      <div className="analysis-grid">
        <div className="analysis-card">
          <h4>Key Observations</h4>
          <ul>
            {analysis.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
        
        <div className="analysis-card">
          <h4>Recommended Actions</h4>
          <ul>
            {recommendations.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AnalysisRecommendations;