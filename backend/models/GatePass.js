const mongoose = require('mongoose');

const gatePassSchema = new mongoose.Schema({
  gatePassId: {
    type: String,
    unique: true,
    required: true // Auto-generated in pre-validate hook
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Optional - students may not have accounts
  },
  studentName: {
    type: String,
    required: true
  },
  studentId: {
    type: String,
    required: false
  },
  department: {
    type: String,
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  photo: {
    type: String,
    required: true
  },
  additionalPerson: {
    name: String,
    photo: String
  },
  status: {
    type: String,
    enum: [
      'pending_hod',
      'rejected_hod',
      'pending_principal',
      'rejected_principal',
      'approved',
      'approved_not_exited',
      'exit_confirmed'
    ],
    default: 'pending_hod'
  },
  hodApproval: {
    approved: {
      type: Boolean,
      default: false
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    approvedAt: Date,
    remarks: String
  },
  principalApproval: {
    approved: {
      type: Boolean,
      default: false
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    approvedAt: Date,
    remarks: String
  },
  watchmanVerification: {
    verified: {
      type: Boolean,
      default: false
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    verifiedAt: Date
  }
}, {
  timestamps: true
});

// Generate unique gate pass ID before validation
gatePassSchema.pre('validate', function(next) {
  if (!this.gatePassId) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    this.gatePassId = `GP${timestamp}${random}`.toUpperCase();
  }
  next();
});

module.exports = mongoose.model('GatePass', gatePassSchema);

