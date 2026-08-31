const express = require('express'); 
const router = express.Router();
 const reportController = require('../controllers/reportPlant.controller'); 
 const auth = require('../middlewares/auth.middleware'); 
 const authorize = require('../middlewares/authorize');

 router.get( '/plant-wise-report', auth, authorize('manage report plant wise'), reportController.generatePlantReport );
//  router.get( '/job-mode-wise-report', auth, authorize('manage report plant wise'), reportController.getPlantManpowerSummary );
 
 module.exports = router;