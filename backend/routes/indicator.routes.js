const express = require('express');
const router = express.Router();
const controller = require('../controllers/indicator.controller');
const auth = require('../middlewares/auth.middleware');

router.get('/', auth, controller.getAll);
router.get('/:id', auth, controller.getIndicatorById);
router.post('/', auth, controller.create);
router.put('/:id', auth, controller.update);
router.delete('/:id', auth, controller.delete);

// get indicator by branch id
router.get('/branch/:branchId', auth, controller.getByBranchId);



module.exports = router;



