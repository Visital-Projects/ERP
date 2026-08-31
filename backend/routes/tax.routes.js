// const express = require('express');
// const router = express.Router();
// const taxController = require('../controllers/tax.controller');

// router.get('/', taxController.getAll);
// router.get('/:id', taxController.getById);
// router.post('/', taxController.create);
// router.put('/:id', taxController.update);
// router.delete('/:id', taxController.delete);

// module.exports = router;



const express = require('express');
const router = express.Router();
const controller = require('../controllers/tax.controller');
const auth = require('../middlewares/auth.middleware');

// All routes protected by auth middleware (adjust if needed)
router.get('/', auth, controller.index);
router.post('/', auth, controller.store);
router.get('/:id', auth, controller.show);
router.put('/:id', auth, controller.update);
router.delete('/:id', auth, controller.destroy);

module.exports = router;
