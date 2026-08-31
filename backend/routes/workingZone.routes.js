const express = require('express');
const router = express.Router();
const workingZoneController = require('../controllers/workingZone.controller');
const auth = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/authorize');

// Create Working Zone (User must be authenticated & authorized)
router.post(
    '/',
    auth,                    // Verify user is logged in
    authorize('create working zone'),     // Check permission for creating
    workingZoneController.createWorkingZone
);

// Get All Working Zones (Authenticated & Authorized)
router.get(
    '/',
    auth,
    authorize('manage working zone'),
    workingZoneController.getAllWorkingZones
);

// Get Working Zone by ID
router.get(
    '/:id',
    auth,
    authorize('manage working zone'),
    workingZoneController.getWorkingZoneById
);

// Update Working Zone
router.put(
    '/:id',
    auth,
    authorize('edit working zone'),
    workingZoneController.updateWorkingZone
);

// Delete Working Zone
router.delete(
    '/:id',
    auth,
    authorize('delete working zone'),
    workingZoneController.deleteWorkingZone
);

module.exports = router;
