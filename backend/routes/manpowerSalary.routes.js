


// routes/manpowerSalary.routes.js
const express = require('express');
const router = express.Router();

const manpowerController = require('../controllers/manpowerSalary.controller');
const auth = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/authorize'); 





router.get('/:branch_id', auth, authorize('manage plant wise manpower salary reports'), manpowerController.getBranchWiseManpower);

router.get('/', auth, authorize('manage plant wise manpower salary reports'), manpowerController.getAllBranchWiseManpower);

router.get("/excel",auth, manpowerController.downloadBranchWiseManpowerExcel);


module.exports = router;
