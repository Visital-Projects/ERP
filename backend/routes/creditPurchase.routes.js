const express = require("express");
const router = express.Router();
const creditCtrl = require("../controllers/creditPurchase.controller");
const auth = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/authorize');
const upload = require('../middlewares/upload.middleware');


router.post("/",auth,authorize('create credit purchase'), upload.any(), creditCtrl.createCreditPurchase);
router.get("/",auth,authorize('manage credit purchase'),  creditCtrl.getAllCreditPurchases);
router.get("/:id",auth,authorize('manage credit purchase'), creditCtrl.getCreditPurchaseById);
router.patch("/:id/pay",auth,authorize('manage credit purchase'),  creditCtrl.markCreditPurchasePaid);
router.put("/:id",auth, upload.any(), creditCtrl.updateCreditPurchase);


router.delete("/:id", auth, authorize('delete credit purchase'), creditCtrl.deleteCreditPurchase);


module.exports = router;
