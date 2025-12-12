const express = require('express');
const GatePass = require('../models/GatePass');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/watchman/verify/:gatePassId
// @desc    Verify a gate pass by ID
// @access  Private (Watchman)
router.get('/verify/:gatePassId', auth, authorize('watchman'), async (req, res) => {
  try {
    const gatePass = await GatePass.findOne({ gatePassId: req.params.gatePassId.toUpperCase() })
      .populate('student', 'name email studentId')
      .populate('hodApproval.approvedBy', 'name email')
      .populate('principalApproval.approvedBy', 'name email');

    if (!gatePass) {
      return res.status(404).json({ message: 'Gate pass not found' });
    }

    res.json(gatePass);
  } catch (error) {
    console.error('Verify gate pass error:', error);
    res.status(500).json({ message: 'Server error verifying gate pass' });
  }
});

// @route   PUT /api/watchman/confirm-exit/:id
// @desc    Confirm student exit
// @access  Private (Watchman)
router.put('/confirm-exit/:id', auth, authorize('watchman'), async (req, res) => {
  try {
    const gatePass = await GatePass.findById(req.params.id);

    if (!gatePass) {
      return res.status(404).json({ message: 'Gate pass not found' });
    }

    if (gatePass.status !== 'approved') {
      return res.status(400).json({ 
        message: 'Gate pass must be fully approved before exit confirmation' 
      });
    }

    if (gatePass.status === 'exit_confirmed') {
      return res.status(400).json({ 
        message: 'Exit already confirmed for this gate pass' 
      });
    }

    gatePass.watchmanVerification = {
      verified: true,
      verifiedBy: req.user.id,
      verifiedAt: new Date()
    };
    gatePass.status = 'exit_confirmed';

    await gatePass.save();

    res.json({
      message: 'Exit confirmed successfully',
      gatePass
    });
  } catch (error) {
    console.error('Confirm exit error:', error);
    res.status(500).json({ message: 'Server error confirming exit' });
  }
});

// @route   GET /api/watchman/recent
// @desc    Get recently verified gate passes
// @access  Private (Watchman)
router.get('/recent', auth, authorize('watchman'), async (req, res) => {
  try {
    const gatePasses = await GatePass.find({
      status: 'exit_confirmed',
      'watchmanVerification.verifiedBy': req.user.id
    })
      .populate('student', 'name email studentId')
      .sort({ 'watchmanVerification.verifiedAt': -1 })
      .limit(50);

    res.json(gatePasses);
  } catch (error) {
    console.error('Get recent error:', error);
    res.status(500).json({ message: 'Server error fetching recent exits' });
  }
});

module.exports = router;

