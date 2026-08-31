const express = require("express");
const router = express.Router();
const controller = require("../controllers/purchase_order.controller");
const auth = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/authorize");
const upload = require('../middlewares/upload.middleware');
// All routes protected
router.get("/draft",auth,authorize('manage purchase order'), controller.getDraftPOs);
router.post("/", auth, authorize('create purchase order'),upload.array('documents', 10),controller.create);
router.get("/", auth,authorize('manage purchase order'), controller.getAll);
router.get("/:id", auth,authorize('manage purchase order'), controller.getById);
router.put("/:id", auth,authorize('edit purchase order'),upload.array('documents', 10),controller.update);
router.delete("/:id", auth,authorize('delete purchase order'), controller.remove);


module.exports = router;
