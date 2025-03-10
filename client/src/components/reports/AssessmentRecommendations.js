// client/src/components/reports/AssessmentRecommendations.js
import React, { useState, useEffect } from 'react';

const AssessmentRecommendations = ({ reportData, onAssessmentChange }) => {
  // Initial state for assessment and recommendations
  const [assessment, setAssessment] = useState({
    performanceRating: 'Satisfactory',
    keyStrengths: [],
    keyWeaknesses: [],
    recommendations: [],
    criticalActions: [],
    improvementAreas: []
  });

  // Update local state when report data changes
  useEffect(() => {
    if (reportData && reportData.assessment) {
      setAssessment(reportData.assessment);
    }
  }, [reportData]);

  // Handle change for performance rating
  const handleRatingChange = (e) => {
    const newAssessment = {
      ...assessment,
      performanceRating: e.target.value
    };
    
    setAssessment(newAssessment);
    onAssessmentChange(newAssessment);
  };

  // Handle change for text arrays (strengths, weaknesses, recommendations, etc.)
  const handleArrayChange = (field, value) => {
    // Split by new line and filter out empty lines
    const items = value.split('\n').filter(item => item.trim() !== '');
    
    const newAssessment = {
      ...assessment,
      [field]: items
    };
    
    setAssessment(newAssessment);
    onAssessmentChange(newAssessment);
  };

  // Generate auto-recommendations based on report data
  const generateRecommendations = () => {
    if (!reportData) return;
    
    const newRecommendations = [];
    const newCriticalActions = [];
    const newImprovementAreas = [];
    
    // Check incident data
    if (reportData.metrics?.lagging?.incidentCount > 3) {
      newRecommendations.push("Implement additional incident investigation training to address high incident rate");
    }
    
    // Check training compliance
    if (reportData.training?.compliancePercentage < 85) {
      newRecommendations.push("Develop a training compliance improvement plan to address gaps");
      newCriticalActions.push("Bring training compliance above 85% within next 30 days");
    }
    
    // Check critical risks
    Object.values(reportData.criticalRisks || {}).forEach(risk => {
      if (risk.status === 'inadequate' || risk.status === 'needsImprovement') {
        newRecommendations.push(`Review and strengthen controls for ${risk.name}`);
        if (risk.status === 'inadequate') {
          newCriticalActions.push(`Immediate reassessment of ${risk.name} controls required`);
        }
      }
    });
    
    // Check risk assessment
    if (reportData.riskAssessment) {
      const highRisks = reportData.riskAssessment.filter(
        risk => risk.rating === 'High' || risk.rating === 'Critical'
      );
      
      if (highRisks.length > 0) {
        newRecommendations.push(`Focus on risk reduction for the ${highRisks.length} high/critical risk areas identified`);
        highRisks.forEach(risk => {
          newImprovementAreas.push(`Develop mitigation plan for ${risk.risk}`);
        });
      }
    }
    
    // Update state with new recommendations
    const newAssessment = {
      ...assessment,
      recommendations: [...assessment.recommendations, ...newRecommendations],
      criticalActions: [...assessment.criticalActions, ...newCriticalActions],
      improvementAreas: [...assessment.improvementAreas, ...newImprovementAreas]
    };
    
    setAssessment(newAssessment);
    onAssessmentChange(newAssessment);
  };

  return (
    <div className="assessment-recommendations-container">
      <h3>Safety Performance Assessment</h3>
      
      <div className="auto-generate-section">
        <button
          onClick={generateRecommendations}
          className="btn btn-secondary"
          type="button"
        >
          Auto-Generate Recommendations
        </button>
        <p className="text-muted">
          This will analyze your report data and suggest potential recommendations
        </p>
      </div>
      
      <div className="form-group">
        <label>Overall Performance Rating</label>
        <select
          value={assessment.performanceRating}
          onChange={handleRatingChange}
          className="form-control"
        >
          <option value="Excellent">Excellent</option>
          <option value="Good">Good</option>
          <option value="Satisfactory">Satisfactory</option>
          <option value="Needs Improvement">Needs Improvement</option>
          <option value="Unsatisfactory">Unsatisfactory</option>
        </select>
      </div>
      
      <div className="form-row">
        <div className="form-group col-md-6">
          <label>Key Strengths (one per line)</label>
          <textarea
            value={assessment.keyStrengths.join('\n')}
            onChange={(e) => handleArrayChange('keyStrengths', e.target.value)}
            className="form-control"
            rows="4"
            placeholder="Enter each strength on a new line..."
          ></textarea>
        </div>
        
        <div className="form-group col-md-6">
          <label>Key Weaknesses (one per line)</label>
          <textarea
            value={assessment.keyWeaknesses.join('\n')}
            onChange={(e) => handleArrayChange('keyWeaknesses', e.target.value)}
            className="form-control"
            rows="4"
            placeholder="Enter each weakness on a new line..."
          ></textarea>
        </div>
      </div>
      
      <div className="form-group">
        <label>Recommendations (one per line)</label>
        <textarea
          value={assessment.recommendations.join('\n')}
          onChange={(e) => handleArrayChange('recommendations', e.target.value)}
          className="form-control"
          rows="5"
          placeholder="Enter each recommendation on a new line..."
        ></textarea>
      </div>
      
      <div className="form-row">
        <div className="form-group col-md-6">
          <label>Critical Actions (one per line)</label>
          <textarea
            value={assessment.criticalActions.join('\n')}
            onChange={(e) => handleArrayChange('criticalActions', e.target.value)}
            className="form-control"
            rows="4"
            placeholder="Enter each critical action on a new line..."
          ></textarea>
        </div>
        
        <div className="form-group col-md-6">
          <label>Improvement Areas (one per line)</label>
          <textarea
            value={assessment.improvementAreas.join('\n')}
            onChange={(e) => handleArrayChange('improvementAreas', e.target.value)}
            className="form-control"
            rows="4"
            placeholder="Enter each improvement area on a new line..."
          ></textarea>
        </div>
      </div>
    </div>
  );
};

export default AssessmentRecommendations;