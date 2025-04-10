// models/Report.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Incident Schema (embedded in Report)
const IncidentSchema = new Schema({
  type: {
    type: String,
    enum: ['Near Miss', 'First Aid', 'Medical Treatment', 'Lost Time', 'Fatality'],
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  rootCause: {
    type: String
  },
  actions: {
    type: String
  },
  status: {
    type: String,
    enum: ['Open', 'In Progress', 'Closed'],
    default: 'Open'
  }
});

// Risk Assessment Schema (embedded in Report)
const RiskAssessmentSchema = new Schema({
  risk: {
    type: String,
    required: true
  },
  probability: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  severity: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  rating: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    required: true
  }
});



// Main Report Schema
// Main Report Schema
const ReportSchema = new Schema({
  companyName: {
    type: String,
    required: true
  },
  reportPeriod: {
    type: String,
    required: true
  },
  reportType: {
    type: String,
    enum: ['Monthly', 'Quarterly', 'Annual'],
    default: 'Monthly'
  },
  reportDate: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  metrics: {
    lagging: {
      incidentCount: Number,
      nearMissCount: Number,
      firstAidCount: Number,
      medicalTreatmentCount: Number,
      lostTimeIncidents: Number,
      totalRecordableIncidentRate: Number,
      lostTimeIncidentRate: Number,
      severityRate: Number
    },
    leading: {
      inspectionsCompleted: Number,
      inspectionsPlanned: Number,
      trainingCompleted: Number,
      safetyObservations: Number,
      safetyMeetings: Number,
      hazardsIdentified: Number,
      hazardsClosed: Number
    }
  },
  kpis: [{
    id: String,
    name: String,
    description: String,
    target: Number,
    actual: Number,
    unit: String,
    year: Number,
    // Fields for Near Miss Rate calculation
    nearMissCount: Number,
    hoursWorked: Number,
    // Fields for Critical Risk Verification
    totalTasks: Number,
    verifiedTasks: Number,
    // Fields for Electrical Safety Compliance
    auditItems: Number,
    compliantItems: Number
  }],
  
  historicalData: [
    {
      period: String,
      incidents: Number,
      nearMisses: Number,
      inspections: Number
    }
  ],
  // In models/Report.js - update the compliance schema
  compliance: {
    status: {
      type: String,
      enum: ['Fully Compliant', 'Partially Compliant', 'Non-Compliant'],
      required: true
    },
    ohsmsScore: {
      type: Number,
      min: 0,
      max: 100
    },
    fullyCompliantPercentage: Number,
    inProgressPercentage: Number,
    nonCompliantPercentage: Number,
    categories: {
      type: Map,
      of: String
    },
    upcomingRegulations: String,
    complianceIssues: [String],
    complianceActions: String
  },
  // In models/Report.js - add to the ReportSchema
  criticalRisks: {
    type: Map,
    of: {
      name: String,
      status: {
        type: String,
        enum: ['effective', 'adequate', 'needsImprovement', 'inadequate']
      },
      changes: String,
      incidents: {
        type: Number,
        default: 0
      }
    }
  },
  incidents: [IncidentSchema],
  riskAssessment: [RiskAssessmentSchema],
  safetyInitiatives: {
    current: String,
    upcoming: [String]
  },
  analysis: {
    trends: [String],
    positiveObservations: [String],
    concernAreas: [String],
    recommendations: [String]
  }
}, { timestamps: true });

// Create virtual for risk scoring calculation
ReportSchema.virtual('highRiskCount').get(function() {
  return this.riskAssessment.filter(risk => risk.rating === 'High' || risk.rating === 'Critical').length;
});

// Method to calculate risk ratings based on probability and severity
ReportSchema.methods.calculateRiskRatings = function() {
  this.riskAssessment.forEach(risk => {
    const score = risk.probability * risk.severity;
    if (score >= 15) risk.rating = 'Critical';
    else if (score >= 10) risk.rating = 'High';
    else if (score >= 5) risk.rating = 'Medium';
    else risk.rating = 'Low';
  });
};

module.exports = mongoose.model('Report', ReportSchema);