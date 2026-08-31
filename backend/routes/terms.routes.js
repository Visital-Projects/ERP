const express = require('express');
const router = express.Router();
const controller = require('../controllers/terms.controller');

const auth = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/authorize');

// =====================
// Terms & Conditions Routes
// =====================

// POST   /api/terms
// Only Super Admin can create (only once)
router.post('/', auth, controller.createTerms);

// GET    /api/terms
// Anyone logged in can view Terms & Conditions
router.get('/', controller.getTerms);

// PUT    /api/terms/:id
// Only Super Admin can update
router.put('/:id', auth, controller.updateTerms);

// ❌ DELETE not allowed (no delete route for Terms & Conditions)

module.exports = router;
