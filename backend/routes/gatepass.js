const express = require('express');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const GatePass = require('../models/GatePass');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');
const upload = require('../utils/upload');

const router = express.Router();

// @route   POST /api/gatepass/create
// @desc    Create a new gate pass request (Public - no auth required)
// @access  Public
router.post('/create', 
  (req, res, next) => {
    upload.fields([
      { name: 'photo', maxCount: 1 },
      { name: 'additionalPersonPhoto', maxCount: 1 }
    ])(req, res, (err) => {
      if (err) {
        console.error('Multer error:', err);
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ message: 'File size too large. Maximum size is 5MB.' });
        }
        return res.status(400).json({ message: err.message || 'File upload error' });
      }
      next();
    });
  },
  body('studentName').trim().notEmpty().withMessage('Student name is required'),
  body('reason').trim().notEmpty().withMessage('Reason is required'),
  body('department').trim().notEmpty().withMessage('Department is required'),
  async (req, res) => {
  try {
    console.log('Request body:', req.body);
    console.log('Request files:', req.files);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!req.files || !req.files.photo || !req.files.photo[0]) {
      return res.status(400).json({ message: 'Student photo is required' });
    }

    const { studentName, studentId, reason, department, additionalPersonName } = req.body;

    // Check if additional person photo is required
    if (additionalPersonName && (!req.files.additionalPersonPhoto || !req.files.additionalPersonPhoto[0])) {
      return res.status(400).json({ message: 'Additional person photo is required when adding another person' });
    }

    const gatePassData = {
      student: null, // No user account linked
      studentName,
      department,
      reason,
      photo: req.files.photo[0].path, // Cloudinary URL
      status: 'pending_hod'
    };

    if (studentId) {
      gatePassData.studentId = studentId;
    }

    if (additionalPersonName && req.files.additionalPersonPhoto && req.files.additionalPersonPhoto[0]) {
      gatePassData.additionalPerson = {
        name: additionalPersonName,
        photo: req.files.additionalPersonPhoto[0].path // Cloudinary URL
      };
    }

    const gatePass = new GatePass(gatePassData);
    await gatePass.save();

    res.status(201).json({
      message: 'Gate pass request created successfully',
      gatePass: {
        id: gatePass._id,
        gatePassId: gatePass.gatePassId,
        status: gatePass.status,
        createdAt: gatePass.createdAt
      }
    });
  } catch (error) {
    console.error('Create gate pass error:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Server error creating gate pass',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/gatepass/my-requests
// @desc    Get all gate pass requests by logged in student
// @access  Private (Student)
router.get('/my-requests', auth, authorize('student'), async (req, res) => {
  try {
    const gatePasses = await GatePass.find({ student: req.user.id })
      .sort({ createdAt: -1 })
      .populate('hodApproval.approvedBy', 'name email')
      .populate('principalApproval.approvedBy', 'name email');

    res.json(gatePasses);
  } catch (error) {
    console.error('Get my requests error:', error);
    res.status(500).json({ message: 'Server error fetching requests' });
  }
});

// @route   GET /api/gatepass/:id
// @desc    Get a specific gate pass by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const gatePass = await GatePass.findById(req.params.id)
      .populate('student', 'name email studentId')
      .populate('hodApproval.approvedBy', 'name email')
      .populate('principalApproval.approvedBy', 'name email')
      .populate('watchmanVerification.verifiedBy', 'name email');

    if (!gatePass) {
      return res.status(404).json({ message: 'Gate pass not found' });
    }

    // Check if user has permission to view
    if (req.user.role === 'student' && gatePass.student && gatePass.student._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(gatePass);
  } catch (error) {
    console.error('Get gate pass error:', error);
    res.status(500).json({ message: 'Server error fetching gate pass' });
  }
});

module.exports = router;

