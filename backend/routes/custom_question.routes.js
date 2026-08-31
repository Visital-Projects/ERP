const express = require('express');
const router = express.Router();
const controller = require('../controllers/custom_question.controller');
const auth = require('../middlewares/auth.middleware');

router.get('/', auth, controller.getAll);
router.get('/:id', auth, controller.getById);
router.post('/', auth, controller.create);
router.put('/:id', auth, controller.update);
router.delete('/:id', auth, controller.delete);

module.exports = router;

