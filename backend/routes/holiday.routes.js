// const express = require('express');
// const router = express.Router();
// const auth = require('../middlewares/auth.middleware');
// const holidayController = require('../controllers/holiday.controller');

// // Create a new holiday
// router.post('/', auth, holidayController.createHoliday);

// // Get all holidays (with optional filters)
// router.get('/',auth, holidayController.getAllHolidays);

// // Get a specific holiday by ID
// router.get('/:id',auth, holidayController.getHolidayById);

// // Update a holiday
// router.put('/:id',auth, holidayController.updateHoliday);

// // Delete a holiday
// router.delete('/:id',auth, holidayController.deleteHoliday);

// module.exports = router;








const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/authorize');
const holidayController = require('../controllers/holiday.controller');

// =======================
// Holidays Routes
// =======================

// Manage Holidays (list & filter)
router.get(
  '/',
  auth,
  authorize('manage holiday'),
  holidayController.getAllHolidays
);

// Get holiday by ID
router.get(
  '/:id',
  auth,
  authorize('manage holiday'),
  holidayController.getHolidayById
);

// Create Holiday
router.post(
  '/',
  auth,
  authorize('create holiday'),
  holidayController.createHoliday
);

// Edit Holiday
router.put(
  '/:id',
  auth,
  authorize('edit holiday'),
  holidayController.updateHoliday
);

// Delete Holiday
router.delete(
  '/:id',
  auth,
  authorize('delete holiday'),
  holidayController.deleteHoliday
);

module.exports = router;
