// const express = require('express');
// const router = express.Router();
// const meetingController = require('../controllers/meeting.controller');
// const auth = require('../middlewares/auth.middleware');

// // Routes
// router.get('/', auth, meetingController.getAllMeetings);
// router.get('/:id', auth, meetingController.getMeetingById);
// router.post('/', auth, meetingController.createMeeting);
// router.put('/:id', auth, meetingController.updateMeeting);
// router.delete('/:id', auth, meetingController.deleteMeeting);

// module.exports = router;








const express = require('express');
const router = express.Router();
const meetingController = require('../controllers/meeting.controller');
const auth = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/authorize');

// Base: /api/meetings
router.get('/', auth, authorize('manage meeting'), meetingController.getAllMeetings);
router.get('/:id', auth, authorize('manage meeting'), meetingController.getMeetingById);
router.post('/', auth, authorize('create meeting'), meetingController.createMeeting);
router.put('/:id', auth, authorize('edit meeting'), meetingController.updateMeeting);
router.delete('/:id', auth, authorize('delete meeting'), meetingController.deleteMeeting);

module.exports = router;
