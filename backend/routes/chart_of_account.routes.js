const express = require('express');
const router = express.Router();
const chartController = require('../controllers/chart_of_account.controller');
const auth = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/authorize');

router.get('/',auth, chartController.getAll);
router.get('/:id',auth, chartController.getById);
router.post('/',auth, chartController.create);
router.put('/:id',auth, chartController.update);
router.delete('/:id',auth, chartController.remove);

module.exports = router;
