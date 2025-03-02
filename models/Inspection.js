// models/Inspection.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const InspectionSchema = new Schema({
  inspectionDate: {
    type: Date,
    required: true
  },
  inspectionType: {
    type: String,
    required: true,
    enum: ['Safety Walk', 'Workplace Inspection', 'Equipment Inspection', 'Management Tour']
  },
  location: {
    type: String,
    required: true
  },
  inspector: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  findings: [{
    category: {
      type: String,
      enum: ['Housekeeping', 'Fire Safety', 'Electrical', 'PPE', 'Ergonomics', 'Chemical', 'Other']
    },
    description: String,
    severity: {
      type: String,
      enum: ['Low', 'Medium', 'High']
    },
    status: {
      type: String,
      enum: ['Open', 'In Progress', 'Closed'],
      default: 'Open'
    },
    actionRequired: String,
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    dueDate: Date,
    closureDate: Date
  }],
  status: {
    type: String,
    enum: ['Draft', 'Submitted', 'Reviewed', 'Closed'],
    default: 'Draft'
  },
  reviewedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  comments: String
}, { timestamps: true });

// Virtual for counting open findings
InspectionSchema.virtual('openFindingsCount').get(function() {
  return this.findings.filter(finding => finding.status !== 'Closed').length;
});

// Virtual for counting high severity findings
InspectionSchema.virtual('highSeverityCount').get(function() {
  return this.findings.filter(finding => finding.severity === 'High').length;
});

module.exports = mongoose.model('Inspection', InspectionSchema);