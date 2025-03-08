// client/src/components/reports/ReportForm.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { createReport, getReport, updateReport } from '../../features/reports/reportSlice';

// This component will be fleshed out with better UI elements and more comprehensive fields

const ReportForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const { report, loading, error } = useSelector(state => state.reports);
  const { user } = useSelector(state => state.auth);

  // Initial form data state
  const [formData, setFormData] = useState({
    companyName: '',
    reportPeriod: '',
    reportType: 'Monthly',
    metrics: {
      lagging: {
        incidentCount: 0,
        nearMissCount: 0,
        lostTimeIncidents: 0,
        totalRecordableIncidentRate: 0,
        lostTimeIncidentRate: 0,
        severityRate: 0
      },
      leading: {
        inspectionsCompleted: 0,
        inspectionsPlanned: 0,
        trainingCompleted: 0,
        safetyObservations: 0,
        safetyMeetings: 0,
        hazardsIdentified: 0,
        hazardsClosed: 0
      }
    },
    compliance: {
      status: 'Fully Compliant',
      fullyCompliantPercentage: 100,
      inProgressPercentage: 0,
      nonCompliantPercentage: 0,
      upcomingRegulations: '',
      complianceIssues: [],
      complianceActions: ''
    },
    incidents: [],
    riskAssessment: [],
    safetyInitiatives: {
      current: '',
      upcoming: []
    },
    analysis: {
      trends: [],
      positiveObservations: [],
      concernAreas: [],
      recommendations: []
    },
    historicalData: []
  });

  // Form step state
  const [step, setStep] = useState(1);
  // Total number of steps
  const totalSteps = 5;
  
  // Form validation state
  const [errors, setErrors] = useState({});

  // Load report data if editing
  useEffect(() => {
    if (isEditing) {
      dispatch(getReport(id));
    }
  }, [dispatch, id, isEditing]);

  // Populate form data when report is loaded
  useEffect(() => {
    if (!loading && report && isEditing) {
      setFormData({
        companyName: report.companyName || '',
        reportPeriod: report.reportPeriod || '',
        reportType: report.reportType || 'Monthly',
        metrics: report.metrics || formData.metrics,
        compliance: report.compliance || formData.compliance,
        incidents: report.incidents || [],
        riskAssessment: report.riskAssessment || [],
        safetyInitiatives: report.safetyInitiatives || formData.safetyInitiatives,
        analysis: report.analysis || formData.analysis,
        historicalData: report.historicalData || []
      });
    }
  }, [loading, report, isEditing]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested properties
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
    
    // Clear validation error for this field if it exists
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  // Handle metrics change (deeply nested properties)
  const handleMetricsChange = (e) => {
    const { name, value } = e.target;
    const [category, metric] = name.split('.');
    
    setFormData({
      ...formData,
      metrics: {
        ...formData.metrics,
        [category]: {
          ...formData.metrics[category],
          [metric]: value === '' ? 0 : Number(value)
        }
      }
    });
  };

  // Handle incident add, update, remove
  const [currentIncident, setCurrentIncident] = useState({
    type: 'Near Miss',
    date: new Date().toISOString().split('T')[0],
    location: '',
    description: '',
    rootCause: '',
    actions: '',
    status: 'Open'
  });

  const handleIncidentChange = (e) => {
    const { name, value } = e.target;
    setCurrentIncident({
      ...currentIncident,
      [name]: value
    });
  };

  const addIncident = () => {
    // Validate incident
    if (!currentIncident.description || !currentIncident.location) {
      setErrors({
        ...errors,
        incidentDescription: !currentIncident.description ? 'Description is required' : '',
        incidentLocation: !currentIncident.location ? 'Location is required' : ''
      });
      return;
    }
    
    const updatedIncidents = [
      ...formData.incidents,
      { 
        ...currentIncident,
        _id: Date.now().toString() // Temporary ID for frontend
      }
    ];
    
    setFormData({
      ...formData,
      incidents: updatedIncidents
    });
    
    // Reset current incident form
    setCurrentIncident({
      type: 'Near Miss',
      date: new Date().toISOString().split('T')[0],
      location: '',
      description: '',
      rootCause: '',
      actions: '',
      status: 'Open'
    });
    
    // Clear any incident-related errors
    setErrors({
      ...errors,
      incidentDescription: '',
      incidentLocation: ''
    });
  };

  const removeIncident = (incidentId) => {
    setFormData({
      ...formData,
      incidents: formData.incidents.filter(
        incident => incident._id !== incidentId
      )
    });
  };

  // Handle risk assessment add, update, remove
  const [currentRisk, setCurrentRisk] = useState({
    risk: '',
    probability: 3,
    severity: 3,
    rating: 'Medium'
  });

  const handleRiskChange = (e) => {
    const { name, value } = e.target;
    
    // For numeric values, calculate rating
    if (name === 'probability' || name === 'severity') {
      const newValues = {
        ...currentRisk,
        [name]: Number(value)
      };
      
      // Calculate risk rating based on probability and severity
      const score = (name === 'probability' ? Number(value) : currentRisk.probability) * 
                   (name === 'severity' ? Number(value) : currentRisk.severity);
      
      let rating = 'Low';
      if (score >= 15) rating = 'Critical';
      else if (score >= 10) rating = 'High';
      else if (score >= 5) rating = 'Medium';
      
      setCurrentRisk({
        ...newValues,
        rating
      });
    } else {
      setCurrentRisk({
        ...currentRisk,
        [name]: value
      });
    }
  };

  const addRisk = () => {
    // Validate risk
    if (!currentRisk.risk) {
      setErrors({
        ...errors,
        riskArea: 'Risk area is required'
      });
      return;
    }
    
    const updatedRisks = [
      ...formData.riskAssessment,
      { 
        ...currentRisk,
        _id: Date.now().toString() // Temporary ID for frontend
      }
    ];
    
    setFormData({
      ...formData,
      riskAssessment: updatedRisks
    });
    
    // Reset current risk form
    setCurrentRisk({
      risk: '',
      probability: 3,
      severity: 3,
      rating: 'Medium'
    });
    
    // Clear risk errors
    setErrors({
      ...errors,
      riskArea: ''
    });
  };

  const removeRisk = (riskId) => {
    setFormData({
      ...formData,
      riskAssessment: formData.riskAssessment.filter(
        risk => risk._id !== riskId
      )
    });
  };

  // Validate current step
  const validateStep = (step) => {
    const newErrors = {};
    
    switch (step) {
      case 1:
        if (!formData.companyName) newErrors.companyName = 'Company name is required';
        if (!formData.reportPeriod) newErrors.reportPeriod = 'Report period is required';
        break;
      case 2:
        // Metrics validation - ensure they're numbers
        if (isNaN(formData.metrics.lagging.incidentCount)) 
          newErrors.incidentCount = 'Must be a number';
        if (isNaN(formData.metrics.lagging.nearMissCount)) 
          newErrors.nearMissCount = 'Must be a number';
        break;
      default:
        // No validation for other steps yet
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Navigation between form steps
  const nextStep = () => {
    if (validateStep(step) && step < totalSteps) {
      setStep(step + 1);
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
      window.scrollTo(0, 0);
    }
  };

  // Form submission
  // Form submission
const handleSubmit = (e) => {
  e.preventDefault();
  
  // Final validation
  if (!validateStep(step)) {
    return;
  }
  
  // Clean up the data before sending to the server
  const cleanedFormData = {
    ...formData,
    incidents: formData.incidents.map(({ _id, ...rest }) => rest), // Remove temporary _id fields
    riskAssessment: formData.riskAssessment.map(({ _id, ...rest }) => rest) // Remove temporary _id fields
  };
  
  if (isEditing) {
    dispatch(updateReport({ id, formData: cleanedFormData }));
  } else {
    dispatch(createReport(cleanedFormData));
  }
  
  // Navigate back to reports list
  navigate('/reports');
};

  // Show spinner while loading report data for editing
  if (loading && isEditing) {
    return <div className="loader">Loading...</div>;
  }

  // Form steps rendering
  const renderFormStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="form-step">
            <h2 className="step-title">Report Information</h2>
            
            <div className="form-group">
              <label>Company Name</label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                required
                className={`form-control ${errors.companyName ? 'is-invalid' : ''}`}
              />
              {errors.companyName && <div className="invalid-feedback">{errors.companyName}</div>}
            </div>
            
            <div className="form-group">
              <label>Reporting Period</label>
              <input
                type="text"
                name="reportPeriod"
                value={formData.reportPeriod}
                onChange={handleChange}
                required
                className={`form-control ${errors.reportPeriod ? 'is-invalid' : ''}`}
                placeholder="e.g., Q1 2025, January 2025"
              />
              {errors.reportPeriod && <div className="invalid-feedback">{errors.reportPeriod}</div>}
            </div>
            
            <div className="form-group">
              <label>Report Type</label>
              <select
                name="reportType"
                value={formData.reportType}
                onChange={handleChange}
                className="form-control"
              >
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
                <option value="Annual">Annual</option>
              </select>
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="form-step">
            <h2 className="step-title">Safety Metrics</h2>
            
            <div className="metrics-section">
              <h3>Lagging Indicators</h3>
              <div className="metrics-grid">
                <div className="form-group">
                  <label>Incident Count</label>
                  <input
                    type="number"
                    name="lagging.incidentCount"
                    value={formData.metrics.lagging.incidentCount}
                    onChange={handleMetricsChange}
                    min="0"
                    className={`form-control ${errors.incidentCount ? 'is-invalid' : ''}`}
                  />
                  {errors.incidentCount && <div className="invalid-feedback">{errors.incidentCount}</div>}
                </div>
                
                <div className="form-group">
                  <label>Near Miss Count</label>
                  <input
                    type="number"
                    name="lagging.nearMissCount"
                    value={formData.metrics.lagging.nearMissCount}
                    onChange={handleMetricsChange}
                    min="0"
                    className={`form-control ${errors.nearMissCount ? 'is-invalid' : ''}`}
                  />
                  {errors.nearMissCount && <div className="invalid-feedback">{errors.nearMissCount}</div>}
                </div>
                
                <div className="form-group">
                  <label>Lost Time Incidents</label>
                  <input
                    type="number"
                    name="lagging.lostTimeIncidents"
                    value={formData.metrics.lagging.lostTimeIncidents}
                    onChange={handleMetricsChange}
                    min="0"
                    className="form-control"
                  />
                </div>
                
                <div className="form-group">
                  <label>Total Recordable Incident Rate (TRIR)</label>
                  <input
                    type="number"
                    name="lagging.totalRecordableIncidentRate"
                    value={formData.metrics.lagging.totalRecordableIncidentRate}
                    onChange={handleMetricsChange}
                    step="0.01"
                    min="0"
                    className="form-control"
                  />
                </div>
                
                <div className="form-group">
                  <label>Lost Time Incident Rate (LTIR)</label>
                  <input
                    type="number"
                    name="lagging.lostTimeIncidentRate"
                    value={formData.metrics.lagging.lostTimeIncidentRate}
                    onChange={handleMetricsChange}
                    step="0.01"
                    min="0"
                    className="form-control"
                  />
                </div>
              </div>
            </div>
            
            <div className="metrics-section">
              <h3>Leading Indicators</h3>
              <div className="metrics-grid">
                <div className="form-group">
                  <label>Inspections Completed</label>
                  <input
                    type="number"
                    name="leading.inspectionsCompleted"
                    value={formData.metrics.leading.inspectionsCompleted}
                    onChange={handleMetricsChange}
                    min="0"
                    className="form-control"
                  />
                </div>
                
                <div className="form-group">
                  <label>Inspections Planned</label>
                  <input
                    type="number"
                    name="leading.inspectionsPlanned"
                    value={formData.metrics.leading.inspectionsPlanned}
                    onChange={handleMetricsChange}
                    min="0"
                    className="form-control"
                  />
                </div>
                
                <div className="form-group">
                  <label>Training Completed (%)</label>
                  <input
                    type="number"
                    name="leading.trainingCompleted"
                    value={formData.metrics.leading.trainingCompleted}
                    onChange={handleMetricsChange}
                    min="0"
                    max="100"
                    className="form-control"
                  />
                </div>
                
                <div className="form-group">
                  <label>Safety Observations</label>
                  <input
                    type="number"
                    name="leading.safetyObservations"
                    value={formData.metrics.leading.safetyObservations}
                    onChange={handleMetricsChange}
                    min="0"
                    className="form-control"
                  />
                </div>
                
                <div className="form-group">
                  <label>Safety Meetings</label>
                  <input
                    type="number"
                    name="leading.safetyMeetings"
                    value={formData.metrics.leading.safetyMeetings}
                    onChange={handleMetricsChange}
                    min="0"
                    className="form-control"
                  />
                </div>
              </div>
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="form-step">
            <h2 className="step-title">Incidents</h2>
            
            <div className="incidents-section">
              <h3>Add Incident</h3>
              <div className="incident-form">
                <div className="form-row">
                  <div className="form-group col-md-6">
                    <label>Incident Type</label>
                    <select
                      name="type"
                      value={currentIncident.type}
                      onChange={handleIncidentChange}
                      className="form-control"
                    >
                      <option value="Near Miss">Near Miss</option>
                      <option value="First Aid">First Aid</option>
                      <option value="Medical Treatment">Medical Treatment</option>
                      <option value="Lost Time">Lost Time</option>
                      <option value="Fatality">Fatality</option>
                    </select>
                  </div>
                  
                  <div className="form-group col-md-6">
                    <label>Date</label>
                    <input
                      type="date"
                      name="date"
                      value={currentIncident.date}
                      onChange={handleIncidentChange}
                      className="form-control"
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Location</label>
                  <input
                    type="text"
                    name="location"
                    value={currentIncident.location}
                    onChange={handleIncidentChange}
                    className={`form-control ${errors.incidentLocation ? 'is-invalid' : ''}`}
                  />
                  {errors.incidentLocation && <div className="invalid-feedback">{errors.incidentLocation}</div>}
                </div>
                
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={currentIncident.description}
                    onChange={handleIncidentChange}
                    className={`form-control ${errors.incidentDescription ? 'is-invalid' : ''}`}
                    rows="3"
                  ></textarea>
                  {errors.incidentDescription && <div className="invalid-feedback">{errors.incidentDescription}</div>}
                </div>
                
                <div className="form-group">
                  <label>Root Cause</label>
                  <textarea
                    name="rootCause"
                    value={currentIncident.rootCause}
                    onChange={handleIncidentChange}
                    className="form-control"
                    rows="2"
                  ></textarea>
                </div>
                
                <div className="form-group">
                  <label>Corrective Actions</label>
                  <textarea
                    name="actions"
                    value={currentIncident.actions}
                    onChange={handleIncidentChange}
                    className="form-control"
                    rows="2"
                  ></textarea>
                </div>
                
                <div className="form-group">
                  <label>Status</label>
                  <select
                    name="status"
                    value={currentIncident.status}
                    onChange={handleIncidentChange}
                    className="form-control"
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
                
                <button
                  type="button"
                  onClick={addIncident}
                  className="btn btn-success btn-block"
                >
                  Add Incident
                </button>
              </div>
              
              <h3 className="mt-4">Incidents</h3>
              {formData.incidents.length === 0 ? (
                <p>No incidents reported</p>
              ) : (
                <div className="incidents-list">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>Type</th>
                        <th>Date</th>
                        <th>Location</th>
                        <th>Description</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.incidents.map((incident) => (
                        <tr key={incident._id}>
                          <td>{incident.type}</td>
                          <td>{new Date(incident.date).toLocaleDateString()}</td>
                          <td>{incident.location}</td>
                          <td>{incident.description}</td>
                          <td>{incident.status}</td>
                          <td>
                            <button
                              type="button"
                              onClick={() => removeIncident(incident._id)}
                              className="btn btn-danger btn-sm"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        );
      
      case 4:
        return (
          <div className="form-step">
            <h2 className="step-title">Risk Assessment</h2>
            
            <div className="risk-section">
              <h3>Add Risk Area</h3>
              <div className="risk-form">
                <div className="form-group">
                  <label>Risk Area</label>
                  <input
                    type="text"
                    name="risk"
                    value={currentRisk.risk}
                    onChange={handleRiskChange}
                    className={`form-control ${errors.riskArea ? 'is-invalid' : ''}`}
                    placeholder="e.g., Chemical Exposure, Machine Guarding"
                  />
                  {errors.riskArea && <div className="invalid-feedback">{errors.riskArea}</div>}
                </div>
                
                <div className="form-row">
                  <div className="form-group col-md-6">
                    <label>Probability (1-5)</label>
                    <select
                      name="probability"
                      value={currentRisk.probability}
                      onChange={handleRiskChange}
                      className="form-control"
                    >
                      <option value="1">1 - Rare</option>
                      <option value="2">2 - Unlikely</option>
                      <option value="3">3 - Possible</option>
                      <option value="4">4 - Likely</option>
                      <option value="5">5 - Almost Certain</option>
                    </select>
                  </div>
                  
                  <div className="form-group col-md-6">
                    <label>Severity (1-5)</label>
                    <select
                      name="severity"
                      value={currentRisk.severity}
                      onChange={handleRiskChange}
                      className="form-control"
                    >
                      <option value="1">1 - Negligible</option>
                      <option value="2">2 - Minor</option>
                      <option value="3">3 - Moderate</option>
                      <option value="4">4 - Major</option>
                      <option value="5">5 - Catastrophic</option>
                    </select>
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Risk Rating</label>
                  <input
                    type="text"
                    value={currentRisk.rating}
                    readOnly
                    className={`form-control ${
                      currentRisk.rating === 'Critical' ? 'bg-danger text-white' :
                      currentRisk.rating === 'High' ? 'bg-warning' :
                      currentRisk.rating === 'Medium' ? 'bg-info' : 'bg-success'
                    }`}
                  />
                </div>
                
                <button
                  type="button"
                  onClick={addRisk}
                  className="btn btn-success btn-block"
                >
                  Add Risk Area
                </button>
              </div>
              
              <h3 className="mt-4">Risk Areas</h3>
              {formData.riskAssessment.length === 0 ? (
                <p>No risk areas identified</p>
              ) : (
                <div className="risk-list">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>Risk Area</th>
                        <th>Probability</th>
                        <th>Severity</th>
                        <th>Rating</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.riskAssessment.map((risk) => (
                        <tr key={risk._id}>
                          <td>{risk.risk}</td>
                          <td>{risk.probability}</td>
                          <td>{risk.severity}</td>
                          <td>
                            <span className={`badge ${
                              risk.rating === 'Critical' ? 'bg-danger' :
                              risk.rating === 'High' ? 'bg-warning' :
                              risk.rating === 'Medium' ? 'bg-info' : 'bg-success'
                            }`}>
                              {risk.rating}
                            </span>
                          </td>
                          <td>
                            <button
                              type="button"
                              onClick={() => removeRisk(risk._id)}
                              className="btn btn-danger btn-sm"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        );
      
      case 5:
        return (
          <div className="form-step">
            <h2 className="step-title">Analysis & Recommendations</h2>
            
            <div className="form-group">
              <label>Compliance Status</label>
              <select
                name="compliance.status"
                value={formData.compliance.status}
                onChange={handleChange}
                className="form-control"
              >
                <option value="Fully Compliant">Fully Compliant</option>
                <option value="Partially Compliant">Partially Compliant</option>
                <option value="Non-Compliant">Non-Compliant</option>
              </select>
            </div>
            <div className="form-group">
              <label>Current Compliance Issues</label>
              <textarea
                name="compliance.complianceIssues"
                value={Array.isArray(formData.compliance.complianceIssues) ? formData.compliance.complianceIssues.join('\n') : ''}
                onChange={(e) => {
                  const issuesArray = e.target.value.split('\n').filter(item => item.trim() !== '');
                  setFormData({
                    ...formData,
                    compliance: {
                      ...formData.compliance,
                      complianceIssues: issuesArray
                    }
                  });
                }}
                className="form-control"
                rows="3"
                placeholder="Enter each compliance issue on a new line (e.g., Machine guarding inspection overdue)"
              ></textarea>
            </div>
            
            <div className="form-group">
              <label>Upcoming Regulations</label>
              <textarea
                name="compliance.upcomingRegulations"
                value={formData.compliance.upcomingRegulations}
                onChange={handleChange}
                className="form-control"
                rows="3"
                placeholder="Describe any upcoming regulatory changes that may impact operations..."
              ></textarea>
            </div>
            
            <div className="form-group">
              <label>Current Safety Initiatives</label>
              <textarea
                name="safetyInitiatives.current"
                value={formData.safetyInitiatives.current}
                onChange={handleChange}
                className="form-control"
                rows="3"
                placeholder="Describe current safety programs and initiatives..."
              ></textarea>
            </div>
            
            <div className="form-group">
              <label>Trends (one per line)</label>
              <textarea
                name="analysis.trends"
                value={Array.isArray(formData.analysis.trends) ? formData.analysis.trends.join('\n') : ''}
                onChange={(e) => {
                  const trendsArray = e.target.value.split('\n').filter(item => item.trim() !== '');
                  setFormData({
                    ...formData,
                    analysis: {
                      ...formData.analysis,
                      trends: trendsArray
                    }
                  });
                }}
                className="form-control"
                rows="3"
                placeholder="Enter each trend on a new line..."
              ></textarea>
            </div>
            
            <div className="form-group">
              <label>Recommendations (one per line)</label>
              <textarea
                name="analysis.recommendations"
                value={Array.isArray(formData.analysis.recommendations) ? formData.analysis.recommendations.join('\n') : ''}
                onChange={(e) => {
                  const recommendationsArray = e.target.value.split('\n').filter(item => item.trim() !== '');
                  setFormData({
                    ...formData,
                    analysis: {
                      ...formData.analysis,
                      recommendations: recommendationsArray
                    }
                  });
                }}
                className="form-control"
                rows="3"
                placeholder="Enter each recommendation on a new line..."
              ></textarea>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  
  return (
    <div className="report-form-container">
      <div className="form-header">
        <h1>{isEditing ? 'Edit Report' : 'Create New Report'}</h1>
        <div className="progress-container">
          <div className="progress-steps">
            {[...Array(totalSteps)].map((_, i) => (
              <div 
                key={i}
                className={`step-indicator ${i + 1 === step ? 'active' : ''} ${i + 1 < step ? 'completed' : ''}`}
              >
                {i + 1}
              </div>
            ))}
          </div>
          <div className="progress-text">
            Step {step} of {totalSteps}
          </div>
        </div>
      </div>
      
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        {renderFormStep()}
        
        <div className="form-navigation">
          {step > 1 && (
            <button 
              type="button" 
              onClick={prevStep}
              className="btn btn-secondary"
            >
              Previous
            </button>
          )}
          
          {step < totalSteps ? (
            <button 
              type="button" 
              onClick={nextStep}
              className="btn btn-primary"
            >
              Next
            </button>
          ) : (
            <button 
              type="submit" 
              className="btn btn-success"
            >
              {isEditing ? 'Update Report' : 'Create Report'}
            </button>
          )}
          
          <Link to="/reports" className="btn btn-outline">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
export default ReportForm;