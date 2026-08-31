// const express = require('express');
// const router = express.Router();
// const controller = require('../controllers/event.controller');
// const auth = require('../middlewares/auth.middleware');

// router.get('/', auth, controller.getAll);
// router.get('/:id', auth, controller.getById);
// router.post('/', auth, controller.create);
// router.put('/:id', auth, controller.update);
// router.delete('/:id', auth, controller.delete);

// module.exports = router;




const express = require('express');
const router = express.Router();
const controller = require('../controllers/event.controller');
const auth = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/authorize');

// =======================
// Event Routes
// =======================

// Get events (Company + Employees)
router.get('/', auth, authorize('manage event'), controller.getAll);

// Get event by ID
router.get('/:id', auth, authorize('manage event'), controller.getById);

// Create event (Company or Employee with permission)
router.post('/', auth, authorize('create event'), controller.create);

// Update event
router.put('/:id', auth, authorize('edit event'), controller.update);

// Delete event
router.delete('/:id', auth, authorize('delete event'), controller.delete);

module.exports = router;
