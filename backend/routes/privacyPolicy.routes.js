const express = require('express');
const router = express.Router();
const controller = require('../controllers/privacyPolicy.controller');

const auth = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/authorize');

// =====================
// Privacy Policy Routes
// =====================

// POST   /api/privacypolicy
// Only Super Admin can create (only once)
router.post('/', auth, controller.createPrivacyPolicy);

// GET    /api/privacypolicy
// Anyone logged in can view Privacy Policy
router.get('/', controller.getPrivacyPolicy);

// PUT    /api/privacypolicy/:id
// Only Super Admin can update
router.put('/:id', auth, controller.updatePrivacyPolicy);

// ❌ DELETE not allowed (no delete route for Privacy Policy)

module.exports = router;
