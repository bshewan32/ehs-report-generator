// routes/reports.js - Report management routes
const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
const auth = require('../middleware/auth');

// @route   GET api/reports
// @desc    Get all reports (with pagination)
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const reports = await Report.find()
      .sort({ reportDate: -1 })
      .skip(skip)
      .limit(limit)
      .select('companyName reportPeriod reportType reportDate metrics.lagging.incidentCount')
      .populate('createdBy', 'name');
    
    const total = await Report.countDocuments();
    
    res.json({
      reports,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalReports: total
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/reports/:id
// @desc    Get a single report by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('createdBy', 'name email');
    
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    
    res.json(report);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Report not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST api/reports
// @desc    Create a new report
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const newReport = new Report({
      ...req.body,
      createdBy: req.user.id
    });
    
    // Calculate risk ratings if risk assessment data is provided
    if (newReport.riskAssessment && newReport.riskAssessment.length > 0) {
      newReport.calculateRiskRatings();
    }
    
    const report = await newReport.save();
    res.status(201).json(report);
  } catch (err) {
    console.error(err.message);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT api/reports/:id
// @desc    Update a report
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    
    // Check if user is authorized (admin or report creator)
    if (report.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized to update this report' });
    }
    
    // Update the report fields
    Object.assign(report, req.body);
    
    // Calculate risk ratings if risk assessment data is provided
    if (report.riskAssessment && report.riskAssessment.length > 0) {
      report.calculateRiskRatings();
    }
    
    await report.save();
    res.json(report);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Report not found' });
    }
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE api/reports/:id
// @desc    Delete a report
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    
    // Check if user is authorized (admin or report creator)
    if (report.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized to delete this report' });
    }
    
    await report.deleteOne();
    res.json({ message: 'Report removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Report not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/reports/metrics/summary
// @desc    Get metrics summary for dashboard
// @access  Private
// @route   GET api/reports/metrics/summary
// @desc    Get metrics summary for dashboard
// @access  Private
router.get('/metrics/summary', auth, async (req, res) => {
  try {
    // Get time period from query or default to current year
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const startDate = new Date(year, 0, 1); // January 1st of the year
    const endDate = new Date(year, 11, 31); // December 31st of the year
    
    // Get all reports for the year
    const reports = await Report.find({
      reportDate: { $gte: startDate, $lte: endDate }
    });
    
    // Calculate summary metrics
    const summary = {
      totalReports: reports.length,
      totalIncidents: reports.reduce((sum, report) => sum + (report.metrics?.lagging?.incidentCount || 0), 0),
      totalNearMisses: reports.reduce((sum, report) => sum + (report.metrics?.lagging?.nearMissCount || 0), 0),
      totalFirstAidCases: reports.reduce((sum, report) => sum + (report.metrics?.lagging?.firstAidCount || 0), 0),
      totalMedicalTreatments: reports.reduce((sum, report) => sum + (report.metrics?.lagging?.medicalTreatmentCount || 0), 0),
      totalLostTimeIncidents: reports.reduce((sum, report) => sum + (report.metrics?.lagging?.lostTimeIncidents || 0), 0),
      inspectionCompletion: calculateInspectionCompletion(reports),
      trainingCompletion: calculateTrainingCompletion(reports),
      highRiskAreas: calculateTopRiskAreas(reports),
      complianceStatus: calculateComplianceStatus(reports),
      kpis: calculateKPIMetrics(reports, year)
    };
    
    res.json(summary);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to calculate inspection completion
function calculateInspectionCompletion(reports) {
  let total = 0;
  let validReports = 0;
  
  reports.forEach(report => {
    const planned = report.metrics?.leading?.inspectionsPlanned || 0;
    const completed = report.metrics?.leading?.inspectionsCompleted || 0;
    
    if (planned > 0) {
      total += (completed / planned);
      validReports++;
    }
  });
  
  return validReports > 0 ? (total / validReports) * 100 : 0;
}

// Helper function to calculate training completion
function calculateTrainingCompletion(reports) {
  let total = 0;
  let validReports = 0;
  
  reports.forEach(report => {
    if (report.metrics?.leading?.trainingCompleted !== undefined) {
      total += report.metrics.leading.trainingCompleted;
      validReports++;
    }
  });
  
  return validReports > 0 ? total / validReports : 0;
}

// Helper function to calculate top risk areas
function calculateTopRiskAreas(reports) {
  // Flatten all risk assessments from all reports
  const allRisks = reports.flatMap(report => report.riskAssessment || []);
  
  // Group by risk area and count occurrences
  const riskCounts = {};
  
  allRisks.forEach(risk => {
    if (!riskCounts[risk.risk]) {
      riskCounts[risk.risk] = { count: 0, highCount: 0 };
    }
    riskCounts[risk.risk].count++;
    if (risk.rating === 'High' || risk.rating === 'Critical') {
      riskCounts[risk.risk].highCount++;
    }
  });
  
  // Convert to array and sort by high risk count, then total count
  return Object.keys(riskCounts)
    .map(risk => ({
      name: risk,
      count: riskCounts[risk].count,
      highCount: riskCounts[risk].highCount
    }))
    .sort((a, b) => b.highCount - a.highCount || b.count - a.count)
    .slice(0, 5); // Return top 5
}

// Helper function to calculate overall compliance status
// Helper function to calculate overall compliance status
function calculateComplianceStatus(reports) {
  const complianceCounts = {
    'Fully Compliant': 0,
    'Partially Compliant': 0,
    'Non-Compliant': 0
  };
  
  reports.forEach(report => {
    if (report.compliance && report.compliance.status) {
      complianceCounts[report.compliance.status]++;
    }
  });
  
  const total = reports.length || 1; // Avoid division by zero
  
  return {
    fullyCompliant: (complianceCounts['Fully Compliant'] / total) * 100,
    partiallyCompliant: (complianceCounts['Partially Compliant'] / total) * 100,
    nonCompliant: (complianceCounts['Non-Compliant'] / total) * 100
  };
}

// Helper function to process KPI data
function calculateKPIMetrics(reports, year) {
  // Create a map to store the most recent KPI data
  const kpiMap = {};
  
  // Process all reports
  reports.forEach(report => {
    if (report.kpis && report.kpis.length > 0) {
      report.kpis.forEach(kpi => {
        // Only include KPIs for the requested year
        if (kpi.year === year) {
          // If we don't have this KPI yet, or if this report is more recent
          const kpiId = kpi.id;
          if (!kpiMap[kpiId] || new Date(report.reportDate) > new Date(kpiMap[kpiId].reportDate)) {
            kpiMap[kpiId] = {
              ...kpi,
              reportDate: report.reportDate // We'll remove this later
            };
          }
        }
      });
    }
  });
  
  // Convert to array and remove the temporary reportDate field
  return Object.values(kpiMap).map(({ reportDate, ...kpi }) => kpi);
}

module.exports = router;