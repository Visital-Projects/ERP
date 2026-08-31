// const express = require('express');
// const router = express.Router();
// const PromotionController = require('../controllers/promotion.controller');
// const auth = require('../middlewares/auth.middleware');

// // Base route: /api/promotions

// router.get('/', auth, PromotionController.getAllPromotions);
// router.get('/:id', auth, PromotionController.getPromotionById);
// router.post('/', auth, PromotionController.createPromotion);
// router.put('/:id', auth, PromotionController.updatePromotion);
// router.delete('/:id', auth, PromotionController.deletePromotion);

// module.exports = router;






const express = require('express');
const router = express.Router();

const PromotionController = require('../controllers/promotion.controller');
const auth = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/authorize');

// Base: /api/promotions
router.get(
  '/',
  auth,
  authorize('manage promotion'),        // list/manage
  PromotionController.getAllPromotions
);

router.get(
  '/:id',
  auth,
  authorize('manage promotion'),        // or 'view promotion' if you add it
  PromotionController.getPromotionById
);

router.post(
  '/',
  auth,
  authorize('create promotion'),
  PromotionController.createPromotion
);

router.put(
  '/:id',
  auth,
  authorize('edit promotion'),
  PromotionController.updatePromotion
);

router.delete(
  '/:id',
  auth,
  authorize('delete promotion'),
  PromotionController.deletePromotion
);

module.exports = router;
