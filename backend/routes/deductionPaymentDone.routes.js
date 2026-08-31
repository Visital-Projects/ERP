// const express = require("express");
// const router = express.Router();
// const deductionController = require("../controllers/deductionPaymentDone.controller");
// const auth = require("../middlewares/auth.middleware");
// const authorize = require('../middlewares/authorize');

// router.post("/", auth,authorize('create deduction payment done'), deductionController.create);
// router.get("/",auth,authorize('manage deduction payment done'), deductionController.getAll);
// router.get("/:id",auth,authorize('manage deduction payment done'), deductionController.getById);
// router.put("/:id", auth,authorize('edit deduction payment done'), deductionController.update);
// router.delete("/:id", auth,authorize('delete deduction payment done'), deductionController.remove);

// module.exports = router;




// routes/setSalary.routes.js

// const express = require('express');
// const router = express.Router();
// const setSalaryController = require('../controllers/setSalary.controller');
// const auth = require('../middlewares/auth.middleware');

// // Route: /api/set-salary/:employeeId
// router.post('/:employeeId', auth, setSalaryController.setSalary);

// module.exports = router;



const express = require('express');
const router = express.Router();
const netSalaryController = require('../controllers/deductionPaymentDone.controller');
const auth = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/authorize');


router.get("/branch/:branchId/net-salary",auth,authorize("manage set salary"),netSalaryController.calculateNetSalaryByBranch);


module.exports = router;
