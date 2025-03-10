import React from 'react';
import { useSelector } from 'react-redux';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const OHSMSComplianceDashboard = () => {
  const { reports } = useSelector(state => state.reports);
  
  // Process OHSMS compliance data from reports
  const processComplianceData = () => {
    if (!reports || reports.length === 0) {
      console.log("No reports available for compliance data");
      return getDefaultComplianceData();
    }
    
    // Use the most recent report for compliance status
    const sortedReports = [...reports].sort((a, b) => 
      new Date(b.reportDate || b.createdAt) - new Date(a.reportDate || a.createdAt)
    );
    
    const recentReport = sortedReports[0];
    console.log("Recent report for compliance:", recentReport);
    
    if (!recentReport.compliance) {
      console.log("No compliance data in recent report");
      return getDefaultComplianceData();
    }
    
    console.log("Compliance data in report:", recentReport.compliance);
    
    // Extract compliance data
    const { fullyCompliantPercentage, inProgressPercentage, nonCompliantPercentage, ohsmsScore } = recentReport.compliance;
    
    // Create data for charts
    const pieData = [
      { name: 'Fully Compliant', value: fullyCompliantPercentage || 0 },
      { name: 'In Progress', value: inProgressPercentage || 0 },
      { name: 'Non-Compliant', value: nonCompliantPercentage || 0 }
    ];
    
    // Process any categories data
    let categoriesData = [];
    if (recentReport.compliance.categories) {
      // Check if it's a Map or plain object
      const categoriesEntries = typeof recentReport.compliance.categories.entries === 'function'
        ? Array.from(recentReport.compliance.categories.entries())
        : Object.entries(recentReport.compliance.categories);
      
      categoriesData = categoriesEntries.map(([category, status]) => ({
        category,
        status
      }));
    }
    
    // Extract OHSMS elements data if available
    let ohsmsElementsData = [];
    if (recentReport.compliance.ohsms && recentReport.compliance.ohsms.elements) {
      const elementsEntries = typeof recentReport.compliance.ohsms.elements.entries === 'function'
        ? Array.from(recentReport.compliance.ohsms.elements.entries())
        : Object.entries(recentReport.compliance.ohsms.elements);
      
      ohsmsElementsData = elementsEntries.map(([element, score]) => ({
        element,
        score: typeof score === 'object' ? score.score : score
      }));
    }
    
    return {
      pieData,
      ohsmsScore: ohsmsScore || 0,
      categoriesData,
      ohsmsElementsData,
      complianceIssues: recentReport.compliance.complianceIssues || [],
      complianceActions: recentReport.compliance.complianceActions || ''
    };
  };
  
  // Default data when no real data is available
  const getDefaultComplianceData = () => {
    return {
      pieData: [
        { name: 'Fully Compliant', value: 70 },
        { name: 'In Progress', value: 20 },
        { name: 'Non-Compliant', value: 10 }
      ],
      ohsmsScore: 85,
      categoriesData: [
        { category: 'Chemical Management', status: 'compliant' },
        { category: 'Machine Guarding', status: 'partially' },
        { category: 'Fall Protection', status: 'compliant' },
        { category: 'Emergency Preparedness', status: 'compliant' }
      ],
      ohsmsElementsData: [
        { element: 'Leadership', score: 85 },
        { element: 'Planning', score: 80 },
        { element: 'Risk Assessment', score: 75 },
        { element: 'Training', score: 90 }
      ],
      complianceIssues: ['Example issue 1', 'Example issue 2'],
      complianceActions: 'Example compliance actions being taken'
    };
  };
  
  const complianceData = processComplianceData();
  
  // Colors for pie chart
  const COLORS = ['#4caf50', '#ff9800', '#f44336'];
  
  // Map status to readable format
  const formatStatus = (status) => {
    switch(status) {
      case 'compliant': return 'Compliant';
      case 'partially': return 'Partially Compliant';
      case 'non-compliant': return 'Non-Compliant';
      case 'not-applicable': return 'Not Applicable';
      default: return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };
  
  return (
    <div className="ohsms-compliance-dashboard">
      <h3>OHSMS Compliance Overview</h3>
      
      <div className="compliance-grid">
        <div className="compliance-chart-container">
          <h4>Compliance Status</h4>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={complianceData.pieData}
                cx="50%"
                cy="50%"
                labelLine={true}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {complianceData.pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value}%`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="compliance-info">
          <div className="score-card">
            <h4>Overall OHSMS Score</h4>
            <div className="score">
              <span className="score-value">{complianceData.ohsmsScore}%</span>
              <div className="score-bar">
                <div 
                  className="score-filled" 
                  style={{width: `${complianceData.ohsmsScore}%`, 
                  backgroundColor: complianceData.ohsmsScore >= 80 ? '#4caf50' : 
                                  complianceData.ohsmsScore >= 60 ? '#ff9800' : '#f44336'}}
                />
              </div>
            </div>
          </div>
          
          {complianceData.categoriesData.length > 0 && (
            <div className="categories-status">
              <h4>Key Compliance Categories</h4>
              <table>
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {complianceData.categoriesData.map((item, index) => (
                    <tr key={index}>
                      <td>{item.category}</td>
                      <td className={`status-${item.status}`}>
                        {formatStatus(item.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      
      {complianceData.ohsmsElementsData.length > 0 && (
        <div className="ohsms-elements mt-4">
          <h4>OHSMS Elements Performance</h4>
          <div className="elements-grid">
            {complianceData.ohsmsElementsData.map((element, index) => (
              <div key={index} className="element-card">
                <div className="element-name">{element.element}</div>
                <div className="element-score">
                  <div className="score-bar">
                    <div 
                      className="score-filled" 
                      style={{
                        width: `${element.score}%`,
                        backgroundColor: element.score >= 80 ? '#4caf50' : 
                                        element.score >= 60 ? '#ff9800' : '#f44336'
                      }}
                    />
                  </div>
                  <span>{element.score}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {complianceData.complianceIssues.length > 0 && (
        <div className="compliance-issues mt-4">
          <h4>Current Compliance Issues</h4>
          <ul>
            {complianceData.complianceIssues.map((issue, index) => (
              <li key={index}>{issue}</li>
            ))}
          </ul>
        </div>
      )}
      
      {complianceData.complianceActions && (
        <div className="compliance-actions mt-3">
          <h4>Compliance Actions</h4>
          <p>{complianceData.complianceActions}</p>
        </div>
      )}
    </div>
  );
};

export default OHSMSComplianceDashboard;

// // client/src/components/dashboard/OHSMSComplianceOverview.js
// import React, { useEffect, useState } from 'react';
// import { 
//   BarChart, Bar, PieChart, Pie, Cell, 
//   XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
// } from 'recharts';

// const OHSMSComplianceOverview = ({ reports }) => {
//   const [complianceData, setComplianceData] = useState({
//     statusData: [],
//     averageScore: 0,
//     categoryData: []
//   });
  
//   useEffect(() => {
//     if (reports && reports.length > 0) {
//       const processed = processComplianceData(reports);
//       setComplianceData(processed);
//     }
//   }, [reports]);
  
//   // Process compliance data from reports
//   const processComplianceData = (reportsList) => {
//     // Initialize counters for compliance statuses
//     const statusCounts = {
//       'Fully Compliant': 0,
//       'Partially Compliant': 0,
//       'Non-Compliant': 0
//     };
    
//     // Track average OHSMS score
//     let totalScore = 0;
//     let reportsWithScore = 0;
    
//     // Track category compliance
//     const categoryCompliance = {};
    
//     reportsList.forEach(report => {
//       if (report.compliance) {
//         // Count overall status
//         if (report.compliance.status && statusCounts.hasOwnProperty(report.compliance.status)) {
//           statusCounts[report.compliance.status]++;
//         }
        
//         // Add to score total
//         if (report.compliance.ohsmsScore !== undefined) {
//           totalScore += report.compliance.ohsmsScore;
//           reportsWithScore++;
//         }
        
//         // Process categories
//         if (report.compliance.categories) {
//           Object.entries(report.compliance.categories).forEach(([category, status]) => {
//             if (!categoryCompliance[category]) {
//               categoryCompliance[category] = {
//                 name: formatCategoryName(category),
//                 compliant: 0,
//                 partially: 0,
//                 'non-compliant': 0,
//                 'not-applicable': 0
//               };
//             }
            
//             // Increment the appropriate status counter
//             if (categoryCompliance[category][status] !== undefined) {
//               categoryCompliance[category][status]++;
//             }
//           });
//         }
//       }
//     });
    
//     // Convert status counts to pie chart data
//     const statusData = Object.keys(statusCounts).map(status => ({
//       name: status,
//       value: statusCounts[status]
//     })).filter(item => item.value > 0);
    
//     // Calculate average score
//     const averageScore = reportsWithScore > 0 ? totalScore / reportsWithScore : 0;
    
//     // Convert category data to array for charts
//     const categoryData = Object.values(categoryCompliance);
    
//     return {
//       statusData,
//       averageScore,
//       categoryData
//     };
//   };
  
//   // Helper function to format category names
//   const formatCategoryName = (category) => {
//     return category
//       .replace(/([A-Z])/g, ' $1') // Insert space before capital letters
//       .replace(/\./g, ' ') // Replace dots with spaces
//       .replace(/^\w/, c => c.toUpperCase()) // Capitalize first letter
//       .trim();
//   };
  
//   // Colors for the pie chart
//   const COLORS = ['#2ecc71', '#f39c12', '#e74c3c'];
  
//   if (!reports || reports.length === 0) {
//     return (
//       <div className="ohsms-compliance-empty">
//         <p>No reports available to analyze OHSMS compliance data.</p>
//       </div>
//     );
//   }
  
//   return (
//     <div className="ohsms-compliance-container">
//       <div className="ohsms-metrics-row">
//         <div className="ohsms-metric-column">
//           <h4>Compliance Status Distribution</h4>
//           {complianceData.statusData.length > 0 ? (
//             <ResponsiveContainer width="100%" height={300}>
//               <PieChart>
//                 <Pie
//                   data={complianceData.statusData}
//                   cx="50%"
//                   cy="50%"
//                   labelLine={true}
//                   label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
//                   outerRadius={80}
//                   fill="#8884d8"
//                   dataKey="value"
//                 >
//                   {complianceData.statusData.map((entry, index) => (
//                     <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                   ))}
//                 </Pie>
//                 <Tooltip formatter={(value) => [`${value} reports`, 'Count']} />
//               </PieChart>
//             </ResponsiveContainer>
//           ) : (
//             <p className="no-data">No compliance status data available</p>
//           )}
//         </div>
        
//         <div className="ohsms-metric-column">
//           <h4>Average OHSMS Compliance Score</h4>
//           <div className="score-container">
//             <div className="score-value">{complianceData.averageScore.toFixed(1)}%</div>
//             <div className="score-progress">
//               <div 
//                 className={`progress-fill ${
//                   complianceData.averageScore >= 80 ? 'high' :
//                   complianceData.averageScore >= 60 ? 'medium' :
//                   complianceData.averageScore >= 40 ? 'low' : 'critical'
//                 }`}
//                 style={{ width: `${complianceData.averageScore}%` }}
//               ></div>
//             </div>
//           </div>
//         </div>
//       </div>
      
//       {complianceData.categoryData.length > 0 && (
//         <div className="ohsms-categories">
//           <h4>Compliance by Category</h4>
//           <ResponsiveContainer width="100%" height={400}>
//             <BarChart
//               data={complianceData.categoryData}
//               margin={{ top: 20, right: 30, left: 20, bottom: 100 }}
//             >
//               <CartesianGrid strokeDasharray="3 3" />
//               <XAxis 
//                 dataKey="name" 
//                 angle={-45} 
//                 textAnchor="end" 
//                 height={100} 
//               />
//               <YAxis />
//               <Tooltip />
//               <Legend />
//               <Bar dataKey="compliant" stackId="a" fill="#2ecc71" name="Compliant" />
//               <Bar dataKey="partially" stackId="a" fill="#f39c12" name="Partially Compliant" />
//               <Bar dataKey="non-compliant" stackId="a" fill="#e74c3c" name="Non-Compliant" />
//               <Bar dataKey="not-applicable" stackId="a" fill="#95a5a6" name="Not Applicable" />
//             </BarChart>
//           </ResponsiveContainer>
//         </div>
//       )}
//     </div>
//   );
// };

// export default OHSMSComplianceOverview;