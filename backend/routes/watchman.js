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

// @route   GET /api/watchman/today
// @desc    Get today's approved gate passes (for watchman to verify exits)
// @access  Private (Watchman)
router.get('/today', auth, authorize('watchman'), async (req, res) => {
  try {
    // Get today's date range (start and end of today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Find approved gate passes that were approved today
    const gatePasses = await GatePass.find({
      status: { $in: ['approved', 'exit_confirmed'] },
      'principalApproval.approvedAt': {
        $gte: today,
        $lt: tomorrow
      }
    })
      .populate('student', 'name email studentId')
      .populate('hodApproval.approvedBy', 'name email')
      .populate('principalApproval.approvedBy', 'name email')
      .sort({ 'principalApproval.approvedAt': -1 });

    res.json(gatePasses);
  } catch (error) {
    console.error('Get today approved error:', error);
    res.status(500).json({ message: 'Server error fetching today\'s approved gate passes' });
  }
});

// @route   PUT /api/watchman/update-not-exited
// @desc    Update approved gate passes from previous days to "approved_not_exited" status
// @access  Private (Watchman) - Called on page load
router.put('/update-not-exited', auth, authorize('watchman'), async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Update approved gate passes from previous days that haven't been exited
    const result = await GatePass.updateMany(
      {
        status: 'approved',
        'principalApproval.approvedAt': { $lt: today }
      },
      {
        $set: { status: 'approved_not_exited' }
      }
    );

    res.json({ 
      message: 'Updated gate passes status',
      updated: result.modifiedCount
    });
  } catch (error) {
    console.error('Update not exited error:', error);
    res.status(500).json({ message: 'Server error updating gate passes' });
  }
});

module.exports = router;

