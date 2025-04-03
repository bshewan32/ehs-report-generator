// client/src/components/reports/ReportView.js
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, Link } from 'react-router-dom';
import { getReport } from '../../features/reports/reportSlice';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import KPITracker from '../kpi/KPITracker';

const ReportView = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { report, loading } = useSelector(state => state.reports);

  useEffect(() => {
    dispatch(getReport(id));
  }, [dispatch, id]);

  if (loading || !report) {
    return <div className="loader">Loading...</div>;
  }

  // Calculate some derived metrics
  const inspectionCompletionRate = report.metrics.leading.inspectionsPlanned > 0 
    ? ((report.metrics.leading.inspectionsCompleted / report.metrics.leading.inspectionsPlanned) * 100).toFixed(1) 
    : 0;

  const renderMetricsChart = () => {
    const metricsData = [
      { name: 'Incidents', value: report.metrics.lagging.incidentCount },
      { name: 'Near Misses', value: report.metrics.lagging.nearMissCount },
      { name: 'Lost Time', value: report.metrics.lagging.lostTimeIncidents }
    ];
    
    const COLORS = ['#8884d8', '#82ca9d', '#ffc658'];
    
    return (
      <div className="metrics-chart">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={metricsData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#8884d8">
              {metricsData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const renderCriticalRiskChart = () => {
    if (!report.criticalRisks) return null;

    const criticalRiskData = Object.entries(report.criticalRisks).map(([key, risk]) => ({
      name: risk.name,
      incidents: risk.incidents || 0,
      status: risk.status || 'adequate'
    }));
    return (
      <div className="critical-risk-chart">
        <h4>Critical Risk Status</h4>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={criticalRiskData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="incidents" fill="#8884d8" name="Related Incidents" />
          </BarChart>
        </ResponsiveContainer>

        <div className="critical-risk-status">
          <h4>Protocol Implementation Status</h4>
          <table className="table">
            <thead>
              <tr>
                <th>Critical Risk</th>
                <th>Status</th>
                <th>Changes This Period</th>
              </tr>
            </thead>
            <tbody>
              {criticalRiskData.map((risk, index) => (
                <tr key={index}>
                  <td>{risk.name}</td>
                  <td className={`status-${risk.status}`}>
                    {risk.status.charAt(0).toUpperCase() + risk.status.slice(1).replace(/([A-Z])/g, ' $1')}
                  </td>
                  <td>{report.criticalRisks[Object.keys(report.criticalRisks)[index]].changes || 'None'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderRiskChart = () => {
    if (!report.riskAssessment || report.riskAssessment.length === 0) {
      return null;
    }
    
    
    const riskCounts = report.riskAssessment.reduce((acc, risk) => {
      acc[risk.rating] = (acc[risk.rating] || 0) + 1;
      return acc;
    }, {});
    
    const riskData = Object.keys(riskCounts).map(rating => ({
      name: rating,
      value: riskCounts[rating]
    }));
    
    const COLORS = {
      'Critical': '#d9534f',
      'High': '#f0ad4e',
      'Medium': '#5bc0de',
      'Low': '#5cb85c'
    };
    
    return (
      <div className="risk-chart">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={riskData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {riskData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#8884d8'} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  };

  // New function to render OHSMS compliance section
  const renderOHSMSComplianceSection = () => {
    if (!report.compliance || !report.compliance.ohsmsScore) {
      return (
        <div className="compliance-card">
          <h4>OHSMS Compliance</h4>
          <p>No OHSMS compliance data available for this report.</p>
        </div>
      );
    }

    // Determine the progress bar class based on the compliance score
    const getProgressClass = (score) => {
      if (score >= 80) return 'progress-success';
      if (score >= 60) return 'progress-info';
      if (score >= 40) return 'progress-warning';
      return 'progress-danger';
    };

    // Format category names for display
    const formatCategoryName = (category) => {
      return category
        .replace(/([A-Z])/g, ' $1') // Insert space before capital letters
        .replace(/\./g, ' ') // Replace dots with spaces
        .replace(/^\w/, c => c.toUpperCase()) // Capitalize first letter
        .trim();
    };

    // Get appropriate badge class for compliance status
    const getStatusBadgeClass = (status) => {
      switch(status) {
        case 'compliant': return 'badge-success';
        case 'partially': return 'badge-warning';
        case 'non-compliant': return 'badge-danger';
        case 'not-applicable': return 'badge-secondary';
        default: return 'badge-info';
      }
    };

    return (
      <div className="ohsms-compliance-section">
        <h4>OHSMS Compliance Score</h4>
        <div className="ohsms-score">
          <div className="score-display">
            <span className="score-value">{report.compliance.ohsmsScore}%</span>
          </div>
          <div className="progress">
            <div 
              className={`progress-bar ${getProgressClass(report.compliance.ohsmsScore)}`}
              role="progressbar" 
              style={{ width: `${report.compliance.ohsmsScore}%` }}
              aria-valuenow={report.compliance.ohsmsScore} 
              aria-valuemin="0" 
              aria-valuemax="100"
            >
              {report.compliance.ohsmsScore}%
            </div>
          </div>
        </div>

        {report.compliance.categories && Object.keys(report.compliance.categories).length > 0 && (
          <div className="compliance-categories">
            <h4>Compliance Categories</h4>
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(report.compliance.categories).map(([category, status]) => (
                  <tr key={category}>
                    <td>{formatCategoryName(category)}</td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(status)}`}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="report-view">
      <div className="report-header">
        <h1>{report.companyName}</h1>
        <h2>EHS Board Report - {report.reportPeriod}</h2>
        <div className="report-actions">
          <Link to={`/reports/${id}/edit`} className="btn btn-primary">
            Edit Report
          </Link>
          <Link to="/reports" className="btn btn-secondary">
            Back to Reports
          </Link>
        </div>
      </div>
      
      <div className="report-content">
      <div className="report-section">
  <h3>Executive Summary</h3>
          <div className="summary-grid">
            {/* Safety Performance card */}
            <div className="summary-card">
              <h4>Safety Performance</h4>
              <div className="metric-group">
                <div className="metric">
                  <span className="metric-label">Lost Time Injuries</span>
                  <span className="metric-value">{report.incidents?.filter(i => i.type === 'Lost Time').length || 0}</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Medical Treatment</span>
                  <span className="metric-value">{report.incidents?.filter(i => i.type === 'Medical Treatment').length || 0}</span>
                </div>
                <div className="metric">
                  <span className="metric-label">First Aid</span>
                  <span className="metric-value">{report.incidents?.filter(i => i.type === 'First Aid').length || 0}</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Near Misses</span>
                  <span className="metric-value">{report.incidents?.filter(i => i.type === 'Near Miss').length || 0}</span>
                </div>
              </div>
            </div>

            <div className="summary-card">
              <h4>Leading Indicators</h4>
              <div className="metric-group">
                <div className="metric">
                  <span className="metric-label">Inspections</span>
                  <span className="metric-value">{inspectionCompletionRate}%</span>
                  <span className="metric-subtitle">Completion Rate</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Training</span>
                  <span className="metric-value">{report.metrics.leading.trainingCompleted}%</span>
                  <span className="metric-subtitle">Completion Rate</span>
                </div>
              </div>
            </div>

            <div className="summary-card">
              <h4>Compliance Status</h4>
              <div className={`compliance-status ${report.compliance.status === 'Fully Compliant' ? 'status-green' :
                  report.compliance.status === 'Partially Compliant' ? 'status-amber' :
                    'status-red'
                }`}>
                {report.compliance.status}
              </div>
            </div>
          </div>
        </div>
        
        <div className="report-section">
          <h3>Key Safety Metrics</h3>
          {/* Add the metrics chart here */}
          {renderMetricsChart()}
          
          <div className="metrics-table">
            <h4>Lagging Indicators</h4>
            <table>
              <tbody>
                <tr>
                  <td>Total Incidents</td>
                  <td>{report.incidents?.length || 0}</td>
                </tr>
                <tr>
                  <td>First Aid Cases</td>
                  <td>{report.incidents?.filter(i => i.type === 'First Aid').length || 0}</td>
                </tr>
                <tr>
                  <td>Medical Treatment Cases</td>
                  <td>{report.incidents?.filter(i => i.type === 'Medical Treatment').length || 0}</td>
                </tr>
                <tr>
                  <td>Lost Time Injuries</td>
                  <td>{report.incidents?.filter(i => i.type === 'Lost Time').length || 0}</td>
                </tr>
                <tr>
                  <td>Near Misses</td>
                  <td>{report.incidents?.filter(i => i.type === 'Near Miss').length || 0}</td>
                </tr>
                <tr>
                  <td>TRIR</td>
                  <td>{report.metrics.lagging.totalRecordableIncidentRate?.toFixed(2) || 'N/A'}</td>
                </tr>
                <tr>
                  <td>LTIR</td>
                  <td>{report.metrics.lagging.lostTimeIncidentRate?.toFixed(2) || 'N/A'}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="metrics-table">
            <h4>Leading Indicators</h4>
            <table>
              <tbody>
                <tr>
                  <td>Inspections Completed</td>
                  <td>{report.metrics.leading.inspectionsCompleted} / {report.metrics.leading.inspectionsPlanned}</td>
                </tr>
                <tr>
                  <td>Training Completion</td>
                  <td>{report.metrics.leading.trainingCompleted}%</td>
                </tr>
                <tr>
                  <td>Safety Meetings</td>
                  <td>{report.metrics.leading.safetyMeetings || 0}</td>
                </tr>
                <tr>
                  <td>Safety Observations</td>
                  <td>{report.metrics.leading.safetyObservations || 0}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="report-section">
        <h3>Incidents</h3>
          // In the Incidents section of ReportView.js
        // Add this before the incidents table

        <div className="metrics-grid incidents-metrics-grid">
          <div className="metric-card">
            <div className="metric-title">Near Misses</div>
            <div className="metric-value">
              {report.incidents?.filter(i => i.type === 'Near Miss').length || 0}
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-title">First Aid Cases</div>
            <div className="metric-value">
              {report.incidents?.filter(i => i.type === 'First Aid').length || 0}
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-title">Medical Treatment Cases</div>
            <div className="metric-value">
              {report.incidents?.filter(i => i.type === 'Medical Treatment').length || 0}
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-title">Lost Time Injuries</div>
            <div className="metric-value">
              {report.incidents?.filter(i => i.type === 'Lost Time').length || 0}
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-title">Fatalities</div>
            <div className="metric-value">
              {report.incidents?.filter(i => i.type === 'Fatality').length || 0}
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-title">Total Incidents</div>
            <div className="metric-value">
              {report.incidents?.length || 0}
            </div>
          </div>
        </div>

          <h4 className="mt-4">Significant Incidents</h4>
          {report.incidents && report.incidents.length > 0 ? (
            <table className="incidents-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Date</th>
                  <th>Location</th>
                  <th>Description</th>
                  <th>Root Cause</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {report.incidents.map((incident, index) => (
                  <tr key={index}>
                    <td>{incident.type}</td>
                    <td>{new Date(incident.date).toLocaleDateString()}</td>
                    <td>{incident.location}</td>
                    <td>{incident.description}</td>
                    <td>{incident.rootCause}</td>
                    <td className={`status-${incident.status === 'Closed' ? 'green' : incident.status === 'In Progress' ? 'amber' : 'red'}`}>
                      {incident.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No incidents reported for this period.</p>
          )}
        </div>
        <div className="report-section">
          <h3>Critical Risk Protocols</h3>
          {renderCriticalRiskChart()}
        </div>

        <div className="report-section">
          <h3>Risk Assessment</h3>
          {/* Add the risk chart here */}
          {renderRiskChart()}

          {report.riskAssessment && report.riskAssessment.length > 0 ? (
            <div className="risk-matrix">
              <table className="risk-table">
                <thead>
                  <tr>
                    <th>Risk Area</th>
                    <th>Probability</th>
                    <th>Severity</th>
                    <th>Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {report.riskAssessment.map((risk, index) => (
                    <tr key={index}>
                      <td>{risk.risk}</td>
                      <td>{risk.probability}</td>
                      <td>{risk.severity}</td>
                      <td className={`risk-${risk.rating === 'Critical' ? 'critical' : risk.rating === 'High' ? 'high' : risk.rating === 'Medium' ? 'medium' : 'low'}`}>
                        {risk.rating}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>No risk assessment data available.</p>
          )}
        </div>

        <div className="report-section">
          <h3>Compliance and Regulatory</h3>
          <div className="compliance-section">
            <div className="compliance-status-card">
              <h4>Overall Status</h4>
              <div className={`compliance-indicator ${report.compliance.status === 'Fully Compliant' ? 'status-green' :
                report.compliance.status === 'Partially Compliant' ? 'status-amber' :
                  'status-red'
                }`}>
                {report.compliance.status}
              </div>
            </div>

            {renderOHSMSComplianceSection()}

            <div className="compliance-details">
              <div className="compliance-issues">
                <h4>Compliance Issues</h4>
                {report.compliance.complianceIssues && report.compliance.complianceIssues.length > 0 ? (
                  <ul>
                    {report.compliance.complianceIssues.map((issue, index) => (
                      <li key={index}>{issue}</li>
                    ))}
                  </ul>
                ) : (
                  <p>No compliance issues reported.</p>
                )}
              </div>

              <div className="upcoming-regulations">
                <h4>Upcoming Regulations</h4>
                <p>{report.compliance.upcomingRegulations || 'No upcoming regulatory changes identified.'}</p>
              </div>

              <div className="compliance-actions">
                <h4>Compliance Actions</h4>
                <p>{report.compliance.complianceActions || 'No compliance actions documented.'}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="report-section">
          <h3>Safety Initiatives</h3>
          <div className="initiatives-section">
            <div className="current-initiatives">
              <h4>Current Programs</h4>
              <p>{report.safetyInitiatives?.current || 'No current initiatives documented.'}</p>
            </div>
          </div>
        </div>

        <div className="report-section">
          <h3>Analysis & Recommendations</h3>

          <div className="analysis-section">
            <div className="trends">
              <h4>Trends</h4>
              {report.analysis?.trends && report.analysis.trends.length > 0 ? (
                <ul>
                  {report.analysis.trends.map((trend, index) => (
                    <li key={index}>{trend}</li>
                  ))}
                </ul>
              ) : (
                <p>No trends identified.</p>
              )}
            </div>

            <div className="recommendations">
              <h4>Recommendations</h4>
              {report.analysis?.recommendations && report.analysis.recommendations.length > 0 ? (
                <ul>
                  {report.analysis.recommendations.map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              ) : (
                <p>No recommendations provided.</p>
              )}
            </div>
          </div>
        </div>
        <div className="report-section">
        <h3>Key Performance Indicators</h3>
        <div className="kpi-section">
          {report.kpis && report.kpis.length > 0 ? (
            <KPITracker
              kpiData={report.kpis}
              editMode={false}
              year={report.kpis[0]?.year || new Date().getFullYear()}
            />
          ) : (
            <p>No KPI data available for this report.</p>
          )}
        </div>
      </div>

      <div className="report-section">
        <h3>Safety Initiatives</h3>
        <div className="initiatives-section">
          <div className="current-initiatives">
            <h4>Current Programs</h4>
            <p>{report.safetyInitiatives?.current || 'No current initiatives documented.'}</p>
          </div>
        </div>
      </div>

      <div className="report-section"></div>
      </div>
    
  );
};

export default ReportView;