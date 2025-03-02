// routes/inspections.js - Inspection routes
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Inspection = require('../models/Inspection');

// @route   GET api/inspections
// @desc    Get all inspections with filters
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { location, status, startDate, endDate, page = 1, limit = 10 } = req.query;
    
    // Build filter object
    const filter = {};
    
    if (location) filter.location = location;
    if (status) filter.status = status;
    
    // Date range filter
    if (startDate || endDate) {
      filter.inspectionDate = {};
      if (startDate) filter.inspectionDate.$gte = new Date(startDate);
      if (endDate) filter.inspectionDate.$lte = new Date(endDate);
    }
    
    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const inspections = await Inspection.find(filter)
      .sort({ inspectionDate: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('inspector', 'name')
      .populate('reviewedBy', 'name');
    
    const total = await Inspection.countDocuments(filter);
    
    res.json({
      inspections,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      totalInspections: total
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST api/inspections
// @desc    Create a new inspection
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const newInspection = new Inspection({
      ...req.body,
      inspector: req.user.id
    });
    
    const inspection = await newInspection.save();
    
    res.status(201).json(inspection);
  } catch (err) {
    console.error(err.message);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/inspections/:id
// @desc    Get inspection by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const inspection = await Inspection.findById(req.params.id)
      .populate('inspector', 'name')
      .populate('reviewedBy', 'name')
      .populate('findings.assignedTo', 'name');
    
    if (!inspection) {
      return res.status(404).json({ message: 'Inspection not found' });
    }
    
    res.json(inspection);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Inspection not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT api/inspections/:id
// @desc    Update an inspection
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    let inspection = await Inspection.findById(req.params.id);
    
    if (!inspection) {
      return res.status(404).json({ message: 'Inspection not found' });
    }
    
    // Check if user is authorized (inspector, reviewer, or admin)
    if (
      inspection.inspector.toString() !== req.user.id &&
      (inspection.reviewedBy && inspection.reviewedBy.toString() !== req.user.id) &&
      req.user.role !== 'admin'
    ) {
      return res.status(401).json({ message: 'Not authorized to update this inspection' });
    }
    
    // Handle review process
    if (req.body.status === 'Reviewed' && inspection.status !== 'Reviewed') {
      req.body.reviewedBy = req.user.id;
    }
    
    inspection = await Inspection.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    
    res.json(inspection);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Inspection not found' });
    }
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE api/inspections/:id
// @desc    Delete an inspection
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const inspection = await Inspection.findById(req.params.id);
    
    if (!inspection) {
      return res.status(404).json({ message: 'Inspection not found' });
    }
    
    // Check if user is authorized (inspector or admin)
    if (inspection.inspector.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized to delete this inspection' });
    }
    
    await inspection.deleteOne();
    
    res.json({ message: 'Inspection removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Inspection not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;