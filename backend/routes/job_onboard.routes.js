const express = require('express');
const router = express.Router();
const controller = require('../controllers/job_onboard.controller');
const auth = require('../middlewares/auth.middleware');

router.get('/', auth, controller.getAllJobOnBoards);
router.get('/:id', auth, controller.getJobOnBoardById);
router.post('/', auth, controller.createJobOnBoard);
router.put('/:id', auth, controller.updateJobOnBoard);
router.delete('/:id', auth, controller.deleteJobOnBoard);

module.exports = router;

