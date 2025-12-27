const express = require('express');
const GatePass = require('../models/GatePass');

const router = express.Router();

// @route   GET /api/viewer/:gatePassId
// @desc    Get gate pass details by ID (Public)
// @access  Public
router.get('/:gatePassId', async (req, res) => {
  try {
    const gatePass = await GatePass.findOne({ 
      gatePassId: req.params.gatePassId.toUpperCase() 
    })
      .populate('student', 'name email studentId')
      .populate('hodApproval.approvedBy', 'name email')
      .populate('principalApproval.approvedBy', 'name email')
      .populate('watchmanVerification.verifiedBy', 'name email')
      .select('-__v');

    if (!gatePass) {
      return res.status(404).json({ message: 'Gate pass not found' });
    }

    // Return public-safe information
    res.json({
      gatePassId: gatePass.gatePassId,
      studentName: gatePass.studentName,
      department: gatePass.department,
      reason: gatePass.reason,
      status: gatePass.status,
      additionalPerson: gatePass.additionalPerson,
      hodApproval: {
        approved: gatePass.hodApproval.approved,
        approvedBy: gatePass.hodApproval.approvedBy?.name || null,
        approvedAt: gatePass.hodApproval.approvedAt,
        remarks: gatePass.hodApproval.remarks
      },
      principalApproval: {
        approved: gatePass.principalApproval.approved,
        approvedBy: gatePass.principalApproval.approvedBy?.name || null,
        approvedAt: gatePass.principalApproval.approvedAt,
        remarks: gatePass.principalApproval.remarks
      },
      watchmanVerification: {
        verified: gatePass.watchmanVerification.verified,
        verifiedAt: gatePass.watchmanVerification.verifiedAt
      },
      createdAt: gatePass.createdAt,
      updatedAt: gatePass.updatedAt
    });
  } catch (error) {
    console.error('Viewer get gate pass error:', error);
    res.status(500).json({ message: 'Server error fetching gate pass' });
  }
});

module.exports = router;


