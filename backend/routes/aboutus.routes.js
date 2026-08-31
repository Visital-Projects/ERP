const express = require('express');
const router = express.Router();
const controller = require('../controllers/aboutus.controller');

const auth = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/authorize');

// =====================
// About Us Routes
// =====================

// POST   /api/aboutus
// Only Super Admin can create (only once)
router.post('/', auth, controller.createAboutUs);

// GET    /api/aboutus
// Anyone logged in can view About Us
router.get('/', controller.getAboutUs);

// PUT    /api/aboutus/:id
// Only Super Admin can update
router.put('/:id', auth, controller.updateAboutUs);

// ❌ DELETE not allowed (no delete route for About Us)

module.exports = router;
