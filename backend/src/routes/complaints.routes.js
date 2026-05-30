const express = require('express');
const router = express.Router();
const complaintsController = require('../controllers/complaints.controller');
const { verifyToken } = require('../middleware/auth');
const { checkRole } = require('../middleware/rbac');
const { apiLimiter } = require('../middleware/rateLimiter');
const { validateComplaintInput } = require('../middleware/validator');
const upload = require('../middleware/upload');

// Public complaints grid endpoint (for students displaying recent alerts)
router.get('/', apiLimiter, complaintsController.getComplaints);

// Student lodging endpoint (supports optional secure Multer file uploads & strict body validators)
router.post('/', apiLimiter, upload.single('file'), validateComplaintInput, complaintsController.createComplaint);

// Protected Admin Operation endpoints (gated by JWT token verification & RBAC check)
router.get('/:id', apiLimiter, verifyToken, checkRole('admin'), complaintsController.getComplaintById);
router.put('/:id', apiLimiter, verifyToken, checkRole('admin'), complaintsController.updateComplaint);

module.exports = router;
