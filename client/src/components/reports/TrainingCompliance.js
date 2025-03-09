// client/src/components/reports/TrainingCompliance.js
import React, { useState } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

const TrainingCompliance = ({ onTrainingDataProcessed, initialData }) => {
  const [trainingData, setTrainingData] = useState(null);
  const [summaryData, setSummaryData] = useState(initialData || null);
  
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const fileReader = new FileReader();
    
    if (file.name.endsWith('.csv')) {
      fileReader.onload = (event) => {
        const csvData = event.target.result;
        Papa.parse(csvData, {
          header: true,
          complete: (results) => {
            processTrainingData(results.data);
          }
        });
      };
      fileReader.readAsText(file);
    } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      fileReader.onload = (event) => {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const excelData = XLSX.utils.sheet_to_json(worksheet);
        processTrainingData(excelData);
      };
      fileReader.readAsArrayBuffer(file);
    }
  };
  
  const processTrainingData = (data) => {
    // Ensure the data has the required fields
    if (!data || data.length === 0) return;
    
    setTrainingData(data);
    
    // Calculate training compliance metrics
    const totalEmployees = data.length;
    let compliantEmployees = 0;
    let expiredTrainings = 0;
    let upcomingExpirations = 0;
    const criticalTrainingGaps = [];
    const departmentCompliance = {};
    
    data.forEach(employee => {
      // Check if employee is fully compliant
      const isCompliant = isEmployeeCompliant(employee);
      if (isCompliant) compliantEmployees++;
      
      // Count expired trainings
      const expired = countExpiredTrainings(employee);
      expiredTrainings += expired;
      
      // Count trainings expiring in next 30 days
      const upcoming = countUpcomingExpirations(employee);
      upcomingExpirations += upcoming;
      
      // Track department compliance
      const dept = employee.Department || 'Unknown';
      if (!departmentCompliance[dept]) {
        departmentCompliance[dept] = { total: 0, compliant: 0 };
      }
      departmentCompliance[dept].total++;
      if (isCompliant) departmentCompliance[dept].compliant++;
      
      // Track critical training gaps
      const criticalGaps = findCriticalTrainingGaps(employee);
      if (criticalGaps.length > 0) {
        criticalTrainingGaps.push({
          name: employee.Name,
          position: employee.Position,
          department: dept,
          gaps: criticalGaps
        });
      }
    });
    
    // Calculate overall compliance percentage
    const compliancePercentage = (compliantEmployees / totalEmployees) * 100;
    
    // Calculate department compliance percentages
    const departmentComplianceData = Object.keys(departmentCompliance).map(dept => ({
      department: dept,
      percentage: (departmentCompliance[dept].compliant / departmentCompliance[dept].total) * 100
    }));
    
    // Prepare summary data
    const summary = {
      totalEmployees,
      compliantEmployees,
      compliancePercentage,
      expiredTrainings,
      upcomingExpirations,
      departmentComplianceData,
      criticalTrainingGaps
    };
    
    setSummaryData(summary);
    onTrainingDataProcessed(summary);
  };
  
  // Helper functions to analyze training data
  const isEmployeeCompliant = (employee) => {
    // Implement logic to check if all required trainings are current
    // This depends on your data structure
    const requiredTrainings = ['Safety Orientation', 'Emergency Response', 'Hazard Recognition'];
    return requiredTrainings.every(training => 
      employee[training] === 'Current' || employee[`${training} Status`] === 'Current'
    );
  };
  
  const countExpiredTrainings = (employee) => {
    // Count trainings marked as 'Expired'
    return Object.keys(employee).filter(key => 
      key.includes('Status') && employee[key] === 'Expired'
    ).length;
  };
  
  const countUpcomingExpirations = (employee) => {
    // Count trainings expiring in next 30 days
    // This assumes you have expiration dates in your data
    let count = 0;
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    Object.keys(employee).forEach(key => {
      if (key.includes('Expiration')) {
        const expirationDate = new Date(employee[key]);
        if (expirationDate > new Date() && expirationDate <= thirtyDaysFromNow) {
          count++;
        }
      }
    });
    return count;
  };
  
  const findCriticalTrainingGaps = (employee) => {
    // Identify critical training requirements that are missing or expired
    const criticalTrainings = ['Confined Space', 'Fall Protection', 'Lockout/Tagout'];
    return criticalTrainings.filter(training => 
      employee[training] === 'Expired' || 
      employee[`${training} Status`] === 'Expired' ||
      !employee[training]
    );
  };
  
  return (
    <div className="training-compliance-section">
      <h3>Training Compliance</h3>
      
      <div className="file-upload">
        <label>Upload Training Records (CSV or Excel)</label>
        <input
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={handleFileUpload}
          className="form-control"
        />
      </div>
      
      {summaryData && (
        <div className="training-summary">
          <div className="summary-metrics">
            <div className="metric-card">
              <h4>Overall Compliance</h4>
              <p className="metric-value">{summaryData.compliancePercentage.toFixed(1)}%</p>
              <p className="metric-detail">{summaryData.compliantEmployees} of {summaryData.totalEmployees} employees</p>
            </div>
            
            <div className="metric-card">
              <h4>Expired Trainings</h4>
              <p className="metric-value">{summaryData.expiredTrainings}</p>
            </div>
            
            <div className="metric-card">
              <h4>Expiring in 30 Days</h4>
              <p className="metric-value">{summaryData.upcomingExpirations}</p>
            </div>
          </div>
          
          <h4>Department Compliance</h4>
          <table className="table">
            <thead>
              <tr>
                <th>Department</th>
                <th>Compliance %</th>
              </tr>
            </thead>
            <tbody>
              {summaryData.departmentComplianceData.map((dept, index) => (
                <tr key={index}>
                  <td>{dept.department}</td>
                  <td>{dept.percentage.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {summaryData.criticalTrainingGaps.length > 0 && (
            <>
              <h4>Critical Training Gaps</h4>
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Position</th>
                    <th>Department</th>
                    <th>Missing/Expired Critical Trainings</th>
                  </tr>
                </thead>
                <tbody>
                  {summaryData.criticalTrainingGaps.map((employee, index) => (
                    <tr key={index}>
                      <td>{employee.name}</td>
                      <td>{employee.position}</td>
                      <td>{employee.department}</td>
                      <td>{employee.gaps.join(', ')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default TrainingCompliance;