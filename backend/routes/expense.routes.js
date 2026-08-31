// const express = require("express");
// const router = express.Router();
// const expenseController = require("../controllers/expense.controller");
// // const { generateExpenseReport } = require("../controllers/expense.controller");


// const auth = require("../middlewares/auth.middleware");

// const authorize = require('../middlewares/authorize');
// const upload = require("../middlewares/upload.middleware");




// // Expense Report (branch-wise excel)
// router.get(
//   "/report/expense",
//   auth,
//   expenseController.generateExpenseReport
// );

// // ================================
// // CREATE EXPENSE
// // ================================
// // Expect form-data fields:
// // - branch_id, description
// // - items (JSON string)
// // - item_0, item_1, ... files
// router.post(
//   "/create",auth,authorize('create employee'),
//   upload.fields([
//     // We'll accept up to 20 item files, dynamically named item_0, item_1, ...
//     ...Array.from({ length: 20 }, (_, i) => ({ name: `item_${i}`, maxCount: 1 }))
//   ]),
//   expenseController.createExpense
// );

// // ================================
// // UPDATE EXPENSE
// // ================================
// router.put(
//   "/update/:id", auth,
//   upload.fields([
//     ...Array.from({ length: 20 }, (_, i) => ({ name: `item_${i}`, maxCount: 1 }))
//   ]),
//   expenseController.updateExpense
// );



// // Get all expenses (HO or branch)
// router.get("/", auth, expenseController.getAllExpenses);


// // Get branch-wise expense report
// commented
// commented
// router.get("/:branch_id",auth, expenseController.getExpensesByBranch);

// router.delete("/:id",auth, expenseController.softDeleteExpense);


// router.post(
//   "/advance", 
//   auth,
//   expenseController.employeeAdvancePayment
// );

// module.exports = router;










const express = require("express");
const router = express.Router();
const expenseController = require("../controllers/expenseNew.controller");
// const { generateExpenseReport } = require("../controllers/expense.controller");


const auth = require("../middlewares/auth.middleware");

const authorize = require('../middlewares/authorize');
const upload = require("../middlewares/upload.middleware");





router.post("/", auth,authorize('create expense'),  upload.fields([
    { name: "document", maxCount: 1 },        // optional main document
    { name: "item_document_0", maxCount: 1 }, // item documents
    { name: "item_document_1", maxCount: 1 },
    { name: "item_document_2", maxCount: 1 },
    { name: "item_document_3", maxCount: 1 },
    { name: "item_document_4", maxCount: 1 },
    { name: "item_document_5", maxCount: 1 },
    { name: "item_document_6", maxCount: 1 },
    { name: "item_document_7", maxCount: 1 }]),expenseController.createExpenseNew);
router.get("/", auth,authorize('manage expense'), expenseController.getAllExpensesNew);

router.get("/detail/:id", auth, authorize('manage expense'), expenseController.getExpenseById);
router.get("/:branch_id", auth,authorize('manage expense'), expenseController.getExpensesByBranchNew);

router.put("/:id", auth,authorize('edit expense'), upload.fields([
    { name: "document", maxCount: 1 },        // optional main document
    { name: "item_document_0", maxCount: 1 }, // item documents
    { name: "item_document_1", maxCount: 1 },
    { name: "item_document_2", maxCount: 1 },
    { name: "item_document_3", maxCount: 1 },
    { name: "item_document_4", maxCount: 1 },
    { name: "item_document_5", maxCount: 1 },
    { name: "item_document_6", maxCount: 1 },
    { name: "item_document_7", maxCount: 1 }]), expenseController.updateExpenseNew);

router.delete("/:id", auth,authorize('delete expense'), expenseController.softDeleteExpenseNew);

router.post(
  "/advance", 
  auth,authorize('create expense'),
  expenseController.employeeAdvancePayment
);

module.exports = router;
