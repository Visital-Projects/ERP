
/*// const express = require('express');
// const router = express.Router();
// const controller = require('../controllers/appraisal.controller');

// router.get('/', controller.getAll);
// router.post('/', controller.create);
// router.put('/:id', controller.update);
// router.delete('/:id', controller.destroy);

// module.exports = router;
*/



const express = require('express');
const router = express.Router();
const controller = require('../controllers/appraisal.controller');
const auth = require('../middlewares/auth.middleware');

router.get('/', auth, controller.getAll);
router.get('/:id', auth, controller.getById);
router.post('/', auth, controller.create);
router.put('/:id', auth, controller.update);
router.delete('/:id', auth, controller.delete);

module.exports = router;

