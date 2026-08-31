// const express = require('express');
// const router = express.Router();
// const controller = require('../controllers/job_stage.controller');
// const auth = require('../middlewares/auth.middleware');

// router.get('/', auth, controller.getAllJobStages);
// router.get('/:id', auth, controller.getJobStageById);
// router.post('/', auth, controller.createJobStage);
// router.put('/:id', auth, controller.updateJobStage);
// router.delete('/:id', auth, controller.deleteJobStage);
// router.post('/reorder', auth, controller.updateJobStageOrder);

// module.exports = router;






const express = require("express");
const router = express.Router();
const controller = require("../controllers/job_stage.controller");
const auth = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/authorize");

// Base: /api/job-stages
router.get("/", auth, authorize("manage job stage"), controller.getAllJobStages);
router.get("/:id", auth, authorize("manage job stage"), controller.getJobStageById);
router.post("/", auth, authorize("create job stage"), controller.createJobStage);
router.put("/:id", auth, authorize("edit job stage"), controller.updateJobStage);
router.delete("/:id", auth, authorize("delete job stage"), controller.deleteJobStage);
router.post("/reorder", auth, authorize("edit job stage"), controller.updateJobStageOrder);


module.exports = router;
