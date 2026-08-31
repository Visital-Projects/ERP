// const express = require('express');
// const router = express.Router();
// const awardTypeController = require('../controllers/award_type.controller');
// const auth = require('../middlewares/auth.middleware');

// router.post('/',auth, awardTypeController.createAwardType);
// router.get('/',auth, awardTypeController.getAllAwardTypes);
// router.get('/:id',auth, awardTypeController.getAwardTypeById);
// router.put('/:id',auth, awardTypeController.updateAwardType);
// router.delete('/:id',auth, awardTypeController.deleteAwardType);

// module.exports = router;


const express = require('express');
const router = express.Router();
const awardTypeController = require('../controllers/award_type.controller');
const auth = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/authorize');

// Routes with Role/Permission checks
router.get( '/', auth, authorize('manage award type'), awardTypeController.getAllAwardTypes );

router.get( '/:id', auth, authorize('manage award type'), awardTypeController.getAwardTypeById );

router.post( '/', auth, authorize('create award type'), awardTypeController.createAwardType );

router.put( '/:id', auth, authorize('edit award type'), awardTypeController.updateAwardType );

router.delete( '/:id', auth, authorize('delete award type'), awardTypeController.deleteAwardType );

module.exports = router;
