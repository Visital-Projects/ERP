// const express = require('express');
// const router = express.Router();
// const announcementController = require('../controllers/announcement.controller');
// const auth = require('../middlewares/auth.middleware');

// router.get('/', auth,announcementController.getAllAnnouncements);
// router.get('/:id',auth, announcementController.getAnnouncementById);
// router.post('/', auth,announcementController.createAnnouncement);
// router.put('/:id',auth, announcementController.updateAnnouncement);
// router.delete('/:id', auth,announcementController.deleteAnnouncement);

// module.exports = router;


// const express = require('express');
// const router = express.Router();
// const announcementController = require('../controllers/announcement.controller');
// const auth = require('../middlewares/auth.middleware');
// const authorize = require('../middlewares/authorize'); // ✅ import middleware

// // 🔹 View announcements
// router.get( '/', auth, authorize('view announcements'), announcementController.getAllAnnouncements );
// router.get( '/:id', auth, authorize('view announcements'), announcementController.getAnnouncementById );
// // 🔹 Create announcements
// router.post( '/', auth, authorize('create announcements'), announcementController.createAnnouncement );
// // 🔹 Edit announcements
// router.put( '/:id', auth, authorize('edit announcements'), announcementController.updateAnnouncement );
// // 🔹 Delete announcements
// router.delete( '/:id', auth, authorize('delete announcements'), announcementController.deleteAnnouncement);

// module.exports = router;



// routes/announcement.routes.js
const express = require('express');
const router = express.Router();
const announcementController = require('../controllers/announcement.controller');
const auth = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/authorize');

// list / manage announcements
router.get('/', auth, authorize('manage announcement'), announcementController.getAllAnnouncements);
// view a single announcement (use same manage permission or 'view announcement' if you have it)
router.get('/:id', auth, authorize('manage announcement'), announcementController.getAnnouncementById);

// create
router.post('/', auth, authorize('create announcement'), announcementController.createAnnouncement);

// edit
router.put('/:id', auth, authorize('edit announcement'), announcementController.updateAnnouncement);

// delete
router.delete('/:id', auth, authorize('delete announcement'), announcementController.deleteAnnouncement);

module.exports = router;
