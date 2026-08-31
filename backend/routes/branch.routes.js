
const express = require('express');
const router = express.Router();
const BranchController = require('../controllers/branch.controller');
const auth = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/authorize');

router.get('/', auth, authorize('manage branch'), BranchController.getAllBranches);
router.get('/:id', auth, authorize('manage branch'), BranchController.getBranchById);
router.post('/', auth, authorize('create branch'), BranchController.createBranch);
router.put('/:id', auth, authorize('edit branch'), BranchController.updateBranch);
router.delete('/:id', auth, authorize('delete branch'), BranchController.deleteBranch);

module.exports = router;
