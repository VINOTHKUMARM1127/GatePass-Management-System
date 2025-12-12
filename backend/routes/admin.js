const express = require('express');
const { body, validationResult } = require('express-validator');
const GatePass = require('../models/GatePass');
const User = require('../models/User');
const Department = require('../models/Department');
const { auth, authorize } = require('../middleware/auth');
const { deleteImages } = require('../utils/cloudinary');

const router = express.Router();

// ========== HOD Routes ==========

// @route   GET /api/admin/hod/pending
// @desc    Get all pending gate pass requests for HOD's department
// @access  Private (HOD)
router.get('/hod/pending', auth, authorize('hod'), async (req, res) => {
  try {
    const hod = await User.findById(req.user.id);
    const gatePasses = await GatePass.find({
      department: hod.department,
      status: 'pending_hod'
    })
      .populate('student', 'name email studentId')
      .sort({ createdAt: -1 });

    // Transform to include student info even if no user account
    const transformed = gatePasses.map(gp => {
      const gpObj = gp.toObject();
      if (!gpObj.student && gp.studentName) {
        gpObj.student = { name: gp.studentName, studentId: gp.studentId };
      }
      return gpObj;
    });

    res.json(transformed);
  } catch (error) {
    console.error('Get HOD pending error:', error);
    res.status(500).json({ message: 'Server error fetching pending requests' });
  }
});

// @route   PUT /api/admin/hod/approve/:id
// @desc    HOD approve or reject a gate pass
// @access  Private (HOD)
router.put('/hod/approve/:id', auth, authorize('hod'), [
  body('action').isIn(['approve', 'reject']).withMessage('Action must be approve or reject'),
  body('remarks').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { action, remarks } = req.body;
    const gatePass = await GatePass.findById(req.params.id);

    if (!gatePass) {
      return res.status(404).json({ message: 'Gate pass not found' });
    }

    const hod = await User.findById(req.user.id);
    if (gatePass.department !== hod.department) {
      return res.status(403).json({ message: 'You can only approve requests from your department' });
    }

    if (gatePass.status !== 'pending_hod') {
      return res.status(400).json({ message: 'This request is not pending HOD approval' });
    }

    if (action === 'approve') {
      gatePass.hodApproval = {
        approved: true,
        approvedBy: req.user.id,
        approvedAt: new Date(),
        remarks: remarks || ''
      };
      gatePass.status = 'pending_principal';
    } else {
      gatePass.hodApproval = {
        approved: false,
        approvedBy: req.user.id,
        approvedAt: new Date(),
        remarks: remarks || 'Rejected by HOD'
      };
      gatePass.status = 'rejected_hod';
    }

    await gatePass.save();

    res.json({
      message: `Gate pass ${action === 'approve' ? 'approved' : 'rejected'} by HOD`,
      gatePass
    });
  } catch (error) {
    console.error('HOD approve error:', error);
    res.status(500).json({ message: 'Server error processing approval' });
  }
});

// @route   GET /api/admin/hod/all
// @desc    Get all gate pass requests for HOD's department
// @access  Private (HOD)
router.get('/hod/all', auth, authorize('hod'), async (req, res) => {
  try {
    const hod = await User.findById(req.user.id);
    const gatePasses = await GatePass.find({
      department: hod.department
    })
      .populate('student', 'name email studentId')
      .populate('hodApproval.approvedBy', 'name email')
      .populate('principalApproval.approvedBy', 'name email')
      .sort({ createdAt: -1 });

    // Transform to include student info even if no user account
    const transformed = gatePasses.map(gp => {
      const gpObj = gp.toObject();
      if (!gpObj.student && gp.studentName) {
        gpObj.student = { name: gp.studentName, studentId: gp.studentId };
      }
      return gpObj;
    });

    res.json(transformed);
  } catch (error) {
    console.error('Get HOD all error:', error);
    res.status(500).json({ message: 'Server error fetching requests' });
  }
});

// ========== Principal Routes ==========

// @route   GET /api/admin/principal/pending
// @desc    Get all pending gate pass requests for Principal approval
// @access  Private (Principal)
router.get('/principal/pending', auth, authorize('principal'), async (req, res) => {
  try {
    const gatePasses = await GatePass.find({
      status: 'pending_principal'
    })
      .populate('student', 'name email studentId')
      .populate('hodApproval.approvedBy', 'name email')
      .sort({ createdAt: -1 });

    // Transform to include student info even if no user account
    const transformed = gatePasses.map(gp => {
      const gpObj = gp.toObject();
      if (!gpObj.student && gp.studentName) {
        gpObj.student = { name: gp.studentName, studentId: gp.studentId };
      }
      return gpObj;
    });

    res.json(transformed);
  } catch (error) {
    console.error('Get Principal pending error:', error);
    res.status(500).json({ message: 'Server error fetching pending requests' });
  }
});

// @route   PUT /api/admin/principal/approve/:id
// @desc    Principal approve or reject a gate pass
// @access  Private (Principal)
router.put('/principal/approve/:id', auth, authorize('principal'), [
  body('action').isIn(['approve', 'reject']).withMessage('Action must be approve or reject'),
  body('remarks').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { action, remarks } = req.body;
    const gatePass = await GatePass.findById(req.params.id);

    if (!gatePass) {
      return res.status(404).json({ message: 'Gate pass not found' });
    }

    if (gatePass.status !== 'pending_principal') {
      return res.status(400).json({ message: 'This request is not pending Principal approval' });
    }

    if (action === 'approve') {
      gatePass.principalApproval = {
        approved: true,
        approvedBy: req.user.id,
        approvedAt: new Date(),
        remarks: remarks || ''
      };
      gatePass.status = 'approved';
    } else {
      gatePass.principalApproval = {
        approved: false,
        approvedBy: req.user.id,
        approvedAt: new Date(),
        remarks: remarks || 'Rejected by Principal'
      };
      gatePass.status = 'rejected_principal';
    }

    await gatePass.save();

    res.json({
      message: `Gate pass ${action === 'approve' ? 'approved' : 'rejected'} by Principal`,
      gatePass
    });
  } catch (error) {
    console.error('Principal approve error:', error);
    res.status(500).json({ message: 'Server error processing approval' });
  }
});

// @route   GET /api/admin/principal/all
// @desc    Get all gate pass requests
// @access  Private (Principal)
router.get('/principal/all', auth, authorize('principal'), async (req, res) => {
  try {
    const gatePasses = await GatePass.find()
      .populate('student', 'name email studentId')
      .populate('hodApproval.approvedBy', 'name email')
      .populate('principalApproval.approvedBy', 'name email')
      .sort({ createdAt: -1 });

    // Transform to include student info even if no user account
    const transformed = gatePasses.map(gp => {
      const gpObj = gp.toObject();
      if (!gpObj.student && gp.studentName) {
        gpObj.student = { name: gp.studentName, studentId: gp.studentId };
      }
      return gpObj;
    });

    res.json(transformed);
  } catch (error) {
    console.error('Get Principal all error:', error);
    res.status(500).json({ message: 'Server error fetching requests' });
  }
});

// @route   DELETE /api/admin/principal/gatepass/:id
// @desc    Delete a gate pass request (Principal only)
// @access  Private (Principal)
router.delete('/principal/gatepass/:id', auth, authorize('principal'), async (req, res) => {
  try {
    const gatePass = await GatePass.findById(req.params.id);
    
    if (!gatePass) {
      return res.status(404).json({ message: 'Gate pass not found' });
    }

    // Collect all image URLs to delete
    const imageUrls = [];
    if (gatePass.photo) {
      imageUrls.push(gatePass.photo);
    }
    if (gatePass.additionalPerson && gatePass.additionalPerson.photo) {
      imageUrls.push(gatePass.additionalPerson.photo);
    }

    // Delete images from Cloudinary
    if (imageUrls.length > 0) {
      const deleteResult = await deleteImages(imageUrls);
      if (!deleteResult.success) {
        console.warn('Some images could not be deleted from Cloudinary:', deleteResult);
        // Continue with deletion even if image deletion fails
      }
    }

    // Delete gate pass from database
    await GatePass.findByIdAndDelete(req.params.id);

    res.json({ 
      message: 'Gate pass deleted successfully',
      deletedImages: imageUrls.length
    });
  } catch (error) {
    console.error('Delete gate pass error:', error);
    res.status(500).json({ message: 'Server error deleting gate pass' });
  }
});

// @route   GET /api/admin/principal/stats
// @desc    Get statistics for Principal dashboard
// @access  Private (Principal)
router.get('/principal/stats', auth, authorize('principal'), async (req, res) => {
  try {
    const total = await GatePass.countDocuments();
    const pending = await GatePass.countDocuments({ status: 'pending_principal' });
    const approved = await GatePass.countDocuments({ status: 'approved' });
    const rejected = await GatePass.countDocuments({ 
      status: { $in: ['rejected_hod', 'rejected_principal'] }
    });
    const exitConfirmed = await GatePass.countDocuments({ status: 'exit_confirmed' });

    // Department-wise stats
    const departmentStats = await GatePass.aggregate([
      {
        $group: {
          _id: '$department',
          total: { $sum: 1 },
          approved: {
            $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
          },
          pending: {
            $sum: { $cond: [{ $eq: ['$status', 'pending_principal'] }, 1, 0] }
          }
        }
      }
    ]);

    res.json({
      total,
      pending,
      approved,
      rejected,
      exitConfirmed,
      departmentStats
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error fetching statistics' });
  }
});

// @route   GET /api/admin/principal/departments
// @desc    Get all departments (Public for gate pass form, also used by Principal)
// @access  Public
router.get('/principal/departments', async (req, res) => {
  try {
    const departments = await Department.find({ isActive: true })
      .populate('hod', 'name email')
      .sort({ name: 1 });

    res.json(departments);
  } catch (error) {
    console.error('Get departments error:', error);
    res.status(500).json({ message: 'Server error fetching departments' });
  }
});

// @route   POST /api/admin/principal/departments
// @desc    Create a new department
// @access  Private (Principal)
router.post('/principal/departments', auth, authorize('principal'), [
  body('name').trim().notEmpty().withMessage('Department name is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name } = req.body;
    const department = new Department({ name });
    await department.save();

    res.status(201).json(department);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Department already exists' });
    }
    console.error('Create department error:', error);
    res.status(500).json({ message: 'Server error creating department' });
  }
});

// @route   GET /api/admin/principal/hods
// @desc    Get all HODs
// @access  Private (Principal)
router.get('/principal/hods', auth, authorize('principal'), async (req, res) => {
  try {
    const hods = await User.find({ role: 'hod', isActive: true })
      .select('-password')
      .sort({ name: 1 });

    res.json(hods);
  } catch (error) {
    console.error('Get HODs error:', error);
    res.status(500).json({ message: 'Server error fetching HODs' });
  }
});

// @route   GET /api/admin/principal/users
// @desc    Get all users by role
// @access  Private (Principal)
router.get('/principal/users', auth, authorize('principal'), async (req, res) => {
  try {
    const { role } = req.query;
    const query = { isActive: true };
    if (role) {
      query.role = role;
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ name: 1 });

    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error fetching users' });
  }
});

// @route   PUT /api/admin/principal/users/:id
// @desc    Update user details (HOD or Watchman)
// @access  Private (Principal)
router.put('/principal/users/:id', auth, authorize('principal'), [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('email').optional().isEmail().withMessage('Please provide a valid email'),
  body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('department').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, department } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Only allow updating HOD and Watchman
    if (user.role !== 'hod' && user.role !== 'watchman') {
      return res.status(403).json({ message: 'Can only update HOD and Watchman accounts' });
    }

    // Update fields if provided
    if (name) user.name = name;
    if (email) {
      // Check if email is already taken by another user
      const existingUser = await User.findOne({ email, _id: { $ne: user._id } });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' });
      }
      user.email = email;
    }
    if (password) {
      user.password = password; // Will be hashed by pre-save hook
    }
    if (department !== undefined) {
      if (user.role === 'hod') {
        user.department = department;
      } else if (user.role === 'watchman' && department) {
        return res.status(400).json({ message: 'Watchman cannot have a department' });
      }
    }

    await user.save();

    res.json({
      message: 'User updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error updating user' });
  }
});

// @route   DELETE /api/admin/principal/users/:id
// @desc    Delete user (HOD or Watchman)
// @access  Private (Principal)
router.delete('/principal/users/:id', auth, authorize('principal'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Only allow deleting HOD and Watchman
    if (user.role !== 'hod' && user.role !== 'watchman') {
      return res.status(403).json({ message: 'Can only delete HOD and Watchman accounts' });
    }

    // Check if HOD has pending gate passes
    if (user.role === 'hod' && user.department) {
      const pendingPasses = await GatePass.countDocuments({
        department: user.department,
        status: { $in: ['pending_hod', 'pending_principal', 'approved'] }
      });

      if (pendingPasses > 0) {
        return res.status(400).json({ 
          message: `Cannot delete HOD. There are ${pendingPasses} pending/approved gate passes in their department.` 
        });
      }

      // Remove HOD assignment from department
      await Department.updateMany(
        { hod: user._id },
        { $unset: { hod: 1 } }
      );
    }

    // Soft delete - set isActive to false
    user.isActive = false;
    await user.save();

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error deleting user' });
  }
});

// @route   PUT /api/admin/principal/departments/:id/assign-hod
// @desc    Assign or change HOD to a department
// @access  Private (Principal)
router.put('/principal/departments/:id/assign-hod', auth, authorize('principal'), [
  body('hodId').notEmpty().withMessage('HOD ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { hodId } = req.body;
    const hod = await User.findById(hodId);
    
    if (!hod || hod.role !== 'hod') {
      return res.status(404).json({ message: 'HOD not found' });
    }

    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    // If there's an existing HOD, remove their department assignment
    if (department.hod && department.hod.toString() !== hodId) {
      const oldHod = await User.findById(department.hod);
      if (oldHod) {
        oldHod.department = undefined;
        await oldHod.save();
      }
    }

    // Assign new HOD
    department.hod = hodId;
    hod.department = department.name;
    await department.save();
    await hod.save();

    res.json(department);
  } catch (error) {
    console.error('Assign HOD error:', error);
    res.status(500).json({ message: 'Server error assigning HOD' });
  }
});

// @route   DELETE /api/admin/principal/departments/:id/revoke-hod
// @desc    Revoke HOD assignment from a department
// @access  Private (Principal)
router.delete('/principal/departments/:id/revoke-hod', auth, authorize('principal'), async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    if (!department.hod) {
      return res.status(400).json({ message: 'No HOD assigned to this department' });
    }

    const hodId = department.hod;

    // Remove HOD's department assignment
    const hod = await User.findById(hodId);
    if (hod) {
      hod.department = null;
      await hod.save();
    }

    // Remove HOD from department using $unset
    await Department.updateOne(
      { _id: department._id },
      { $unset: { hod: 1 } }
    );

    // Refresh department to return updated data
    const updatedDepartment = await Department.findById(department._id);

    res.json({ message: 'HOD assignment revoked successfully', department: updatedDepartment });
  } catch (error) {
    console.error('Revoke HOD error:', error);
    res.status(500).json({ message: 'Server error revoking HOD assignment', error: error.message });
  }
});

// @route   PUT /api/admin/principal/departments/:id
// @desc    Update department name
// @access  Private (Principal)
router.put('/principal/departments/:id', auth, authorize('principal'), [
  body('name').trim().notEmpty().withMessage('Department name is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name } = req.body;
    const department = await Department.findById(req.params.id);
    
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    // Check if new name already exists
    const existingDept = await Department.findOne({ name, _id: { $ne: department._id } });
    if (existingDept) {
      return res.status(400).json({ message: 'Department name already exists' });
    }

    const oldName = department.name;
    department.name = name;
    await department.save();

    // Update HOD's department name if assigned
    if (department.hod) {
      const hod = await User.findById(department.hod);
      if (hod) {
        hod.department = name;
        await hod.save();
      }
    }

    // Update all gate passes with this department
    await GatePass.updateMany(
      { department: oldName },
      { $set: { department: name } }
    );

    res.json(department);
  } catch (error) {
    console.error('Update department error:', error);
    res.status(500).json({ message: 'Server error updating department' });
  }
});

// @route   DELETE /api/admin/principal/departments/:id
// @desc    Delete a department
// @access  Private (Principal)
router.delete('/principal/departments/:id', auth, authorize('principal'), async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    // Check if department has pending gate passes
    const pendingPasses = await GatePass.countDocuments({
      department: department.name,
      status: { $in: ['pending_hod', 'pending_principal', 'approved'] }
    });

    if (pendingPasses > 0) {
      return res.status(400).json({ 
        message: `Cannot delete department. There are ${pendingPasses} pending/approved gate passes.` 
      });
    }

    // Remove HOD assignment if exists
    if (department.hod) {
      const hod = await User.findById(department.hod);
      if (hod) {
        hod.department = undefined;
        await hod.save();
      }
    }

    // Soft delete - set isActive to false
    department.isActive = false;
    await department.save();

    res.json({ message: 'Department deleted successfully' });
  } catch (error) {
    console.error('Delete department error:', error);
    res.status(500).json({ message: 'Server error deleting department' });
  }
});

module.exports = router;

