// const express = require('express');
// const router = express.Router();
// const controller = require('../controllers/trainer.controller');
// const auth = require('../middlewares/auth.middleware');

// // Manage trainers
// router.get('/', auth, controller.getAll);

// // Get single trainer
// router.get('/:id', auth, controller.getById);

// // Create trainer
// router.post('/', auth, controller.create);

// // Edit trainer
// router.put('/:id', auth, controller.update);

// // Delete trainer
// router.delete('/:id', auth, controller.delete);

// module.exports = router;





const express = require('express');
const router = express.Router();
const controller = require('../controllers/trainer.controller');
const auth = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/authorize');

// Manage Trainers
router.get('/', auth, authorize('manage_trainer'), controller.getAll);

// Get Trainer by ID
router.get('/:id', auth, authorize('manage_trainer'), controller.getById);

// Create Trainer
router.post('/', auth, authorize('create_trainer'), controller.createTrainer);

// Update Trainer
router.put('/:id', auth, authorize('edit_trainer'), controller.updateTrainer);

// Delete Trainer
router.delete('/:id', auth, authorize('delete_trainer'), controller.deleteTrainer);

module.exports = router;
