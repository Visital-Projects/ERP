// const express = require('express');
// const router = express.Router();
// const AwardController = require('../controllers/award.controller');
// const auth = require('../middlewares/auth.middleware');
// const authorize = require('../middlewares/authorize');

// router.post('/',auth, AwardController.createAward);
// router.get('/',auth, AwardController.getAllAwards);
// router.get('/:id',auth, AwardController.getAwardById);
// router.put('/:id',auth, AwardController.updateAward);
// router.delete('/:id',auth, AwardController.deleteAward);

// module.exports = router;






const express = require('express');
const router = express.Router();
const AwardController = require('../controllers/award.controller');
const auth = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/authorize');

// 🟢 Manage all awards
router.get('/', auth, authorize('manage award'), AwardController.getAllAwards);

// 🟢 View single award
router.get('/:id', auth, authorize('manage award'), AwardController.getAwardById);

// 🟢 Create award
router.post('/', auth, authorize('create award'), AwardController.createAward);

// 🟢 Edit award
router.put('/:id', auth, authorize('edit award'), AwardController.updateAward);

// 🟢 Delete award
router.delete('/:id', auth, authorize('delete award'), AwardController.deleteAward);

module.exports = router;
