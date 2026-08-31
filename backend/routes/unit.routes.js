const express = require('express');
const router = express.Router();
const UnitController = require('../controllers/unit.controller');
const auth = require('../middlewares/auth.middleware');

router.get('/',auth, UnitController.getAll);
router.get('/:id',auth, UnitController.getById);
router.post('/',auth, UnitController.create);
router.put('/:id',auth, UnitController.update);
router.delete('/:id',auth, UnitController.delete);

module.exports = router;
