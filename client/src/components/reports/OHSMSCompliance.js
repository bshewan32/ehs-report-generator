// client/src/components/reports/OHSMSCompliance.js
import React, { useState, useEffect } from 'react';

const OHSMSCompliance = ({ initialData, onDataChange }) => {
  // ISO 45001 elements
  const ohsmsElements = [
    { id: 'context', name: '4. Context of the Organization', description: 'Understanding the organization and its context, needs of workers and interested parties, OHSMS scope' },
    { id: 'leadership', name: '5. Leadership and Worker Participation', description: 'Leadership commitment, OH&S policy, roles and responsibilities, consultation' },
    { id: 'planning', name: '6. Planning', description: 'Actions to address risks/opportunities, OH&S objectives, planning to achieve them' },
    { id: 'support', name: '7. Support', description: 'Resources, competence, awareness, communication, documented information' },
    { id: 'operation', name: '8. Operation', description: 'Operational planning and control, emergency preparedness and response' },
    { id: 'performance', name: '9. Performance Evaluation', description: 'Monitoring, measurement, analysis, evaluation, internal audit, management review' },
    { id: 'improvement', name: '10. Improvement', description: 'Addressing nonconformities, continual improvement' }
  ];

  // Default scores for each element
  const defaultElementScores = ohsmsElements.reduce((acc, element) => {
    acc[element.id] = { score: 0, notes: '' };
    return acc;
  }, {});

  // State for compliance data
  const [complianceData, setComplianceData] = useState(
    initialData || { elements: defaultElementScores, overallScore: 0 }
  );

  // Handle score change for an element
  const handleScoreChange = (elementId, value) => {
    const newScore = parseInt(value, 10);
    
    // Update the specific element score
    const updatedElements = {
      ...complianceData.elements,
      [elementId]: {
        ...complianceData.elements[elementId],
        score: newScore
      }
    };
    
    // Calculate new overall score
    const totalPossible = ohsmsElements.length * 100;
    const totalScore = Object.values(updatedElements).reduce((sum, element) => sum + element.score, 0);
    const overallScore = Math.round((totalScore / totalPossible) * 100);
    
    // Update state
    const newData = {
      elements: updatedElements,
      overallScore
    };
    
    setComplianceData(newData);
    
    // Notify parent component
    onDataChange(newData);
  };

  // Handle notes change for an element
  const handleNotesChange = (elementId, notes) => {
    const updatedElements = {
      ...complianceData.elements,
      [elementId]: {
        ...complianceData.elements[elementId],
        notes
      }
    };
    
    const newData = {
      ...complianceData,
      elements: updatedElements
    };
    
    setComplianceData(newData);
    onDataChange(newData);
  };

  return (
    <div className="ohsms-compliance-container">
      <div className="compliance-overview">
        <h3>ISO 45001 OHSMS Compliance Assessment</h3>
        <div className="compliance-score-summary">
          <div className="score-display">
            <div className="score-circle" style={{ background: `conic-gradient(#4CAF50 ${complianceData.overallScore * 3.6}deg, #f0f0f0 0deg)` }}>
              <span className="score-value">{complianceData.overallScore}%</span>
            </div>
            <span className="score-label">Overall Compliance</span>
          </div>
        </div>
      </div>
      
      <div className="elements-assessment">
        <h4>OHSMS Elements Assessment</h4>
        <p className="compliance-instructions">Rate each element's implementation from 0-100%</p>
        
        <div className="elements-list">
          {ohsmsElements.map(element => (
            <div className="element-item" key={element.id}>
              <div className="element-header">
                <h5>{element.name}</h5>
                <div className="element-score-input">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={complianceData.elements[element.id]?.score || 0}
                    onChange={(e) => handleScoreChange(element.id, e.target.value)}
                  />
                  <span className="score-value">
                    {complianceData.elements[element.id]?.score || 0}%
                  </span>
                </div>
              </div>
              
              <p className="element-description">{element.description}</p>
              
              <div className="element-notes">
                <textarea
                  placeholder={`Notes regarding ${element.name} implementation...`}
                  value={complianceData.elements[element.id]?.notes || ''}
                  onChange={(e) => handleNotesChange(element.id, e.target.value)}
                  rows="2"
                  className="form-control"
                ></textarea>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OHSMSCompliance;