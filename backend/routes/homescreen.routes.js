const express = require('express');
const router = express.Router();
const controller = require('../controllers/homescreen.controller');

const auth = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');

// =====================
// Home Screen Routes
// =====================

// POST   /api/homescreen
// Only Super Admin can create (only once)
// Uses multipart/form-data with fields: logo, homescreen_left_image, homescreen_right_image
router.post(
  '/',
  auth,
  upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'homescreen_left_image', maxCount: 1 },
    { name: 'homescreen_right_image', maxCount: 1 }
  ]),
  controller.createHomeScreen
);

// GET    /api/homescreen
// Anyone logged in can view Home Screen images
router.get('/', controller.getHomeScreen);

// PUT    /api/homescreen/:id
// Only Super Admin can update (with file upload support)
router.put(
  '/:id',
  auth,
  upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'homescreen_left_image', maxCount: 1 },
    { name: 'homescreen_right_image', maxCount: 1 }
  ]),
  controller.updateHomeScreen
);

// ❌ DELETE not allowed (no delete route for Home Screen)
router.delete('/:id', (req, res) => {
  return res
    .status(405)
    .json({ success: false, message: 'Delete operation is not allowed for Home Screen' });
});

module.exports = router;
