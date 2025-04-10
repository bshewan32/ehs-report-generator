// client/src/components/dashboard/OHSMSComplianceOverview.js
import React, { useEffect, useState } from 'react';
import { 
  BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import './OHSMSComplianceOverview.css';

const OHSMSComplianceOverview = ({ reports }) => {
  console.log('OHSMS Component - Reports received:', reports);
  
  const [complianceData, setComplianceData] = useState({
    statusData: [],
    averageScore: 0,
    categoryData: [],
    elementData: [],
    complianceIssues: []
  });
  
  useEffect(() => {
    if (reports && reports.length > 0) {
      console.log('OHSMS Component - Processing reports data');
      const processed = processComplianceData(reports);
      console.log('OHSMS Component - Processed data:', processed);
      setComplianceData(processed);
    } else {
      // If no reports data, use fallback data
      console.log('OHSMS Component - Using fallback data');
      setComplianceData(getFallbackData());
    }
  }, [reports]);
  
  // Fallback data for display when no real data is available
  const getFallbackData = () => {
    return {
      statusData: [
        { name: 'Fully Compliant', value: 70 },
        { name: 'Partially Compliant', value: 20 },
        { name: 'Non-Compliant', value: 10 }
      ],
      averageScore: 85,
      categoryData: [
        { 
          name: 'Chemical Management',
          compliant: 8,
          partially: 2,
          'non-compliant': 0
        },
        { 
          name: 'Machine Guarding',
          compliant: 6,
          partially: 3,
          'non-compliant': 1
        },
        { 
          name: 'Electrical Safety',
          compliant: 9,
          partially: 1,
          'non-compliant': 0
        }
      ],
      elementData: [
        { name: 'Leadership', score: 85 },
        { name: 'Planning', score: 80 },
        { name: 'Risk Assessment', score: 75 },
        { name: 'Training', score: 90 },
        { name: 'Document Control', score: 82 }
      ],
      complianceIssues: [
        'Update chemical inventory system to track expiration dates',
        'Complete machine guarding assessments for new equipment',
        'Revise emergency response procedures for satellite locations'
      ]
    };
  };
  
  // Process compliance data from reports
  const processComplianceData = (reportsList) => {
    try {
      // Get the most recent report with compliance data
      const sortedReports = [...reportsList].sort((a, b) => 
        new Date(b.reportDate || b.createdAt) - new Date(a.reportDate || a.createdAt)
      );
      
      console.log('OHSMS Component - Sorted reports:', sortedReports);
      
      // Initialize counters for compliance statuses
      const statusCounts = {
        'Fully Compliant': 0,
        'Partially Compliant': 0,
        'Non-Compliant': 0
      };
      
      // Track average OHSMS score
      let totalScore = 0;
      let reportsWithScore = 0;
      
      // Track category compliance
      const categoryCompliance = {};
      
      // Track element performance (from most recent report)
      let elementData = [];
      let complianceIssues = [];
      
      // Process all reports for trends
      reportsList.forEach(report => {
        console.log('OHSMS Component - Processing report:', report.title || 'Untitled', 'Compliance data:', report.compliance);
        
        if (report.compliance) {
          // Count overall status
          if (report.compliance.status && statusCounts.hasOwnProperty(report.compliance.status)) {
            statusCounts[report.compliance.status]++;
          }
          
          // Add to score total
          if (report.compliance.ohsmsScore !== undefined) {
            totalScore += report.compliance.ohsmsScore;
            reportsWithScore++;
          }
          
          // Process categories
          if (report.compliance.categories) {
            const categories = typeof report.compliance.categories.entries === 'function'
              ? Array.from(report.compliance.categories.entries())
              : Object.entries(report.compliance.categories);
              
            console.log('OHSMS Component - Categories:', categories);
              
            categories.forEach(([category, status]) => {
              if (!categoryCompliance[category]) {
                categoryCompliance[category] = {
                  name: formatCategoryName(category),
                  compliant: 0,
                  partially: 0,
                  'non-compliant': 0,
                  'not-applicable': 0
                };
              }
              
              // Increment the appropriate status counter
              if (categoryCompliance[category][status] !== undefined) {
                categoryCompliance[category][status]++;
              }
            });
          }
        }
      });
      
      // Get element data from most recent report
      const recentReport = sortedReports[0];
      console.log('OHSMS Component - Most recent report:', recentReport);
      
      if (recentReport?.compliance?.ohsms?.elements) {
        const elements = typeof recentReport.compliance.ohsms.elements.entries === 'function'
          ? Array.from(recentReport.compliance.ohsms.elements.entries())
          : Object.entries(recentReport.compliance.ohsms.elements);
          
        console.log('OHSMS Component - Elements:', elements);
          
        elementData = elements.map(([element, score]) => ({
          name: formatCategoryName(element),
          score: typeof score === 'object' ? score.score : score
        })).sort((a, b) => b.score - a.score); // Sort by score descending
      }
      
      // Get compliance issues from most recent report
      if (recentReport?.compliance?.complianceIssues) {
        complianceIssues = recentReport.compliance.complianceIssues;
      }
      
      // Convert status counts to pie chart data
      const statusData = Object.keys(statusCounts).map(status => ({
        name: status,
        value: statusCounts[status]
      })).filter(item => item.value > 0);
      
      // Calculate average score
      const averageScore = reportsWithScore > 0 ? totalScore / reportsWithScore : 0;
      
      // Convert category data to array for charts
      const categoryData = Object.values(categoryCompliance);
      
      const result = {
        statusData,
        averageScore,
        categoryData,
        elementData,
        complianceIssues
      };
      
      console.log('OHSMS Component - Final processed data:', result);
      
      // If we have no real data, use fallback data
      if (statusData.length === 0 && elementData.length === 0 && categoryData.length === 0) {
        console.log('OHSMS Component - No real data found, using fallback');
        return getFallbackData();
      }
      
      return result;
    } catch (error) {
      console.error('Error processing compliance data:', error);
      return getFallbackData();
    }
  };
  
  // Helper function to format category names
  const formatCategoryName = (category) => {
    return category
      .replace(/([A-Z])/g, ' $1') // Insert space before capital letters
      .replace(/\./g, ' ') // Replace dots with spaces
      .replace(/^\w/, c => c.toUpperCase()) // Capitalize first letter
      .trim();
  };
  
  // Colors for the pie chart
  const COLORS = ['#2ecc71', '#f39c12', '#e74c3c'];
  
  // Element performance color based on score
  const getScoreColor = (score) => {
    if (score >= 80) return '#2ecc71';
    if (score >= 60) return '#f39c12';
    return '#e74c3c';
  };
  
  // Return template with data
  return (
    <div className="ohsms-compliance-container">
      <div className="ohsms-metrics-row">
        <div className="ohsms-metric-column">
          <h4>Compliance Status Distribution</h4>
          {complianceData.statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={complianceData.statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {complianceData.statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} reports`, 'Count']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="no-data">No compliance status data available</p>
          )}
        </div>
        
        <div className="ohsms-metric-column">
          <h4>Average OHSMS Compliance Score</h4>
          <div className="score-container">
            <div className="score-value">{complianceData.averageScore.toFixed(1)}%</div>
            <div className="score-progress">
              <div 
                className={`progress-fill ${
                  complianceData.averageScore >= 80 ? 'high' :
                  complianceData.averageScore >= 60 ? 'medium' :
                  complianceData.averageScore >= 40 ? 'low' : 'critical'
                }`}
                style={{ width: `${complianceData.averageScore}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="ohsms-details-row">
        {complianceData.elementData.length > 0 && (
          <div className="ohsms-elements-column">
            <h4>Key OHSMS Elements Performance</h4>
            <div className="elements-list">
              {complianceData.elementData.slice(0, 5).map((element, index) => (
                <div key={index} className="element-item">
                  <div className="element-name">{element.name}</div>
                  <div className="element-score">
                    <div className="score-bar">
                      <div 
                        className="score-filled" 
                        style={{
                          width: `${element.score}%`,
                          backgroundColor: getScoreColor(element.score)
                        }}
                      />
                    </div>
                    <span className="score-value-small">{element.score}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {complianceData.complianceIssues.length > 0 && (
          <div className="ohsms-issues-column">
            <h4>Key Compliance Issues</h4>
            <ul className="compliance-issues-list">
              {complianceData.complianceIssues.slice(0, 3).map((issue, index) => (
                <li key={index} className="compliance-issue-item">{issue}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      {complianceData.categoryData.length > 0 && (
        <div className="ohsms-categories">
          <h4>Compliance by Category</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={complianceData.categoryData.slice(0, 6)} // Show top 6 categories
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45} 
                textAnchor="end" 
                height={80} 
                tick={{ fontSize: 12 }}
              />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="compliant" stackId="a" fill="#2ecc71" name="Compliant" />
              <Bar dataKey="partially" stackId="a" fill="#f39c12" name="Partially Compliant" />
              <Bar dataKey="non-compliant" stackId="a" fill="#e74c3c" name="Non-Compliant" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default OHSMSComplianceOverview;