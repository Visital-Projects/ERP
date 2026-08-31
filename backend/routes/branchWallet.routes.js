const express = require('express');
const router = express.Router();
const branchWalletController = require('../controllers/branchWallet.controller');
const { generateLedgerReport } = require("../controllers/branchWallet.controller");
const { generateAllBranchesLedgerReport } = require("../controllers/branchWallet.controller");
// const branchController= require('../controllers/generateBranchWalletReport.controller');
const auth = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/authorize');

// router.get("/wallet-report", auth, branchController.generateBranchWalletReport);

// router.get("/wallets/report/ledger", auth, generateLedgerReport);

router.get('/', auth, authorize('manage branch wallet'),  branchWalletController.getAllWallets);

// Transactions route first
router.get("/transactions/:branch_id", auth,authorize('manage branch wallet'), branchWalletController.getTransactionsByBranchId);


router.get('/:id', auth, authorize('manage branch wallet'),  branchWalletController.getWalletById);
router.post('/', auth,authorize('create branch wallet'), branchWalletController.createWallet);
router.patch('/:id', auth,authorize('edit branch wallet'), branchWalletController.updateWallet);
router.delete('/:id',auth,authorize('delete branch wallet'),  branchWalletController.deleteWallet);



module.exports = router;
