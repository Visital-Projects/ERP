const { Op } = require("sequelize");
const path = require("path");
const ExpenseNew = require("../models/expenseNew.model");
const BranchWallet = require("../models/branchWallet.model");
const Branch = require("../models/branch.model");
const Employee = require("../models/employee.model");
const User = require("../models/user.model");
const ExpenseNewItem = require("../models/expenseNewItem.model");
const ExpenseCategory = require("../models/expenseCategory.model");
const { erpDB } = require("../config/database"); 
// ================================
// HELPERS
// ================================
async function getCompanyId(req) {
  if (!req.user) return null;
  const type = (req.user.type || "").toLowerCase();

  if (type === "company") return req.user.id;

  // Check employee linkage
  const emp = await Employee.findOne({
    where: { user_id: req.user.id },
    attributes: ["created_by"],
    raw: true,
  });
  if (emp?.created_by) return emp.created_by;

  // Check direct company user (like accountant)
  const user = await User.findOne({
    where: { id: req.user.id },
    attributes: ["created_by"],
    raw: true,
  });
  if (user?.created_by) return user.created_by;

  return req.user.id;
}

async function getUserBranch(req) {
  const emp = await Employee.findOne({
    where: { user_id: req.user.id },
    attributes: ["branch_id", "created_by"],
  });
  return emp; // null if user has no branch
}



// helper: compute item tax depending on type
function computeItemAmountsFromSubtotal({ subtotal, is_taxable, tax_rate = 0, tax_type }) {
  subtotal = Number(parseFloat(subtotal || 0));
  tax_rate = Number(parseFloat(tax_rate || 0));
  is_taxable = !!is_taxable;

  let tax_total = 0;
  let total_amount = subtotal;

  if (!is_taxable) {
    tax_total = 0;
    total_amount = subtotal;
    return { subtotal, tax_total: Number(tax_total.toFixed(2)), total_amount: Number(total_amount.toFixed(2)) };
  }

  if (tax_type === "exclusive") {
    tax_total = subtotal * (tax_rate / 100);
    total_amount = subtotal + tax_total;
  } else if (tax_type === "inclusive") {
    tax_total = subtotal * (tax_rate / (100 + tax_rate));
    const base = subtotal - tax_total;
    // For consistency, store subtotal as base (amount without tax) and total_amount as original subtotal
    total_amount = subtotal; // inclusive total
    subtotal = base;
  } else {
    // default treat as exclusive
    tax_total = subtotal * (tax_rate / 100);
    total_amount = subtotal + tax_total;
  }

  return { subtotal: Number(subtotal.toFixed(2)), tax_total: Number(tax_total.toFixed(2)), total_amount: Number(total_amount.toFixed(2)) };
}

// helper to map uploaded files to item index based on fieldname 'item_document_<index>'
function findItemDocumentFile(reqFiles, index) {
  if (!reqFiles || !Array.isArray(reqFiles)) return null;
  const match = reqFiles.find(f => f.fieldname === `item_document_${index}` || f.fieldname === `items[${index}].document`);
  return match || null;
}


// ================================
// CREATE EXPENSE
// ================================
exports.createExpenseNew = async (req, res) => {
  const t = await erpDB.transaction();
  try {
    if (!req.user?.id) {
      await t.rollback();
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const userId = req.user.id;
    let { branch_id, description, vendor_name, remark, type_of_supply_or_service, actual_bill_date, category_id, items } = req.body;

    // items expected as array (if sent as JSON in form-data, parse it)
    if (typeof items === "string") {
      try {
        items = JSON.parse(items);
      } catch (e) {
        // keep as original
      }
    }

    if (!Array.isArray(items) || items.length === 0) {
      await t.rollback();
      return res.status(400).json({ success: false, message: "items array is required and cannot be empty" });
    }

    // Resolve branch based on user
    const emp = await getUserBranch(req);
    if (emp) {
      branch_id = emp.branch_id;
    } else if (!branch_id) {
      await t.rollback();
      return res.status(400).json({ success: false, message: "branch_id is required" });
    }

    const branch = await Branch.findOne({ where: { id: branch_id } });
    if (!branch) {
      await t.rollback();
      return res.status(404).json({ success: false, message: "Branch not found" });
    }

    // compute all items totals
    let totalSubtotal = 0;
    let totalTax = 0;
    let totalAmount = 0;

    const itemRecords = [];

    for (let i = 0; i < items.length; i++) {
      const it = items[i] || {};
      const item_name = (it.item_name || "").toString();
      if (!item_name) {
        await t.rollback();
        return res.status(400).json({ success: false, message: `item_name is required for item index ${i}` });
      }

      // define fields
      const is_taxable = it.is_taxable === true || it.is_taxable === "true" || it.is_taxable === 1 || it.is_taxable === "1";
      const tax_rate = parseFloat(it.tax_rate || 0) || 0;
      const tax_type = (it.tax_type || "").toLowerCase() === "inclusive" ? "inclusive" : (it.tax_type || "").toLowerCase() === "exclusive" ? "exclusive" : (is_taxable ? "exclusive" : null);

      // For exclusive: frontend should supply subtotal as base amount (without tax).
      // For inclusive: assume frontend sends subtotal as the inclusive total amount (common pattern).
      let rawSubtotal = parseFloat(it.subtotal || it.amount || 0) || 0;

      // compute amounts
      const computed = computeItemAmountsFromSubtotal({
        subtotal: rawSubtotal,
        is_taxable,
        tax_rate,
        tax_type
      });

      // try to attach document if uploaded with fieldname item_document_<i>
      let documentPath = null;
      // req.files might be array (multer .array) or object (fields)
      const file = findItemDocumentFile(req.files && Array.isArray(req.files) ? req.files : (req.files ? Object.values(req.files).flat() : []), i);
      if (file) {
        const uploadFolder = file.destination ? file.destination.split(path.sep).pop() : "uploads";
        documentPath = path.join("uploads", uploadFolder, file.filename).replace(/\\/g, "/");
      } else if (it.document && typeof it.document === "string") {
        // frontend may provide URL/path
        documentPath = it.document;
      }

      itemRecords.push({
        item_name,
        subtotal: computed.subtotal,
        is_taxable,
        tax_rate,
        tax_type,
        tax_total: computed.tax_total,
        total_amount: computed.total_amount,
        document: documentPath,
      });

      totalSubtotal += Number(computed.subtotal);
      totalTax += Number(computed.tax_total);
      totalAmount += Number(computed.total_amount);
    }

    // Check branch balance
    const lastWallet = await BranchWallet.findOne({ where: { branch_id }, order: [["created_at", "DESC"]] });
    const balanceBefore = lastWallet ? Number(lastWallet.balance_after) : 0;

    if (Number.isNaN(balanceBefore) || balanceBefore < totalAmount) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: `Insufficient branch balance. Current balance = ${balanceBefore}, required = ${totalAmount}.`,
      });
    }

    // create ExpenseNew
    const expense = await ExpenseNew.create({
      branch_id,
      payment_date: new Date(),
      actual_bill_date: actual_bill_date || new Date().toISOString().split('T')[0],
      subtotal: Number(totalSubtotal.toFixed(2)),
      tax_total: Number(totalTax.toFixed(2)),
      total_amount: Number(totalAmount.toFixed(2)),
      payments_status: "paid",
      created_by: userId,
      description: vendor_name || description || null,
      vendor_name: vendor_name || description || null,
      remark: remark || null,
      type_of_supply_or_service: type_of_supply_or_service || null,
      category_id: category_id || null,
    }, { transaction: t });

    // create items
    for (const rec of itemRecords) {
      await ExpenseNewItem.create({
        expense_id: expense.id,
        item_name: rec.item_name,
        subtotal: rec.subtotal,
        is_taxable: rec.is_taxable,
        tax_rate: rec.tax_rate,
        tax_type: rec.tax_type,
        tax_total: rec.tax_total,
        total_amount: rec.total_amount,
        document: rec.document,
      }, { transaction: t });
    }

    // branch wallet update
    const balanceAfter = Number((balanceBefore - totalAmount).toFixed(2));
    await BranchWallet.create({
      branch_id,
      name: `Expense #${expense.id}`,
      transaction_type: "debit",
      amount: Number(totalAmount.toFixed(2)),
      description: description || "Expense Deduction",
      balance_after: balanceAfter,
      created_by: userId,
    }, { transaction: t });

    await t.commit();

    // include items in response
    const createdExpense = await ExpenseNew.findOne({
      where: { id: expense.id },
      include: [{ model: ExpenseNewItem, as: "items" }],
    });

    return res.status(201).json({ success: true, data: { expense: createdExpense, balanceBefore, balanceAfter } });
  } catch (err) {
    await t.rollback();
    console.error("createExpenseNew failed:", err);
    return res.status(500).json({ success: false, message: "Failed to create expense", error: err.message });
  }
};

// ================================
// GET ALL EXPENSES (include items)
// ================================
exports.getAllExpensesNew = async (req, res) => {
  try {
    const emp = await getUserBranch(req);
    const companyId = await getCompanyId(req);

    let where = {};
    if (emp) {
      where.branch_id = emp.branch_id;
    } else {
      const branches = await Branch.findAll({ where: { created_by: companyId }, attributes: ["id"], raw: true });
      where.branch_id = { [Op.in]: branches.map(b => b.id) };
    }

    const expenses = await ExpenseNew.findAll({
      where,
      include: [
        { model: User, as: "creator", attributes: ["id", "name"] },
        { model: Branch, as: "branch", attributes: ["id", "name"] },
        { model: ExpenseNewItem, as: "items" },
      ],
      order: [["created_at", "DESC"]],
    });

    return res.status(200).json({ success: true, data: expenses });
  } catch (err) {
    console.error("getAllExpensesNew failed:", err);
    return res.status(500).json({ success: false, message: "Failed to fetch expenses", error: err.message });
  }
};

// ================================
// GET EXPENSES BY BRANCH (include items)
// ================================
exports.getExpensesByBranchNew = async (req, res) => {
  try {
    const branchId = req.params.branch_id;
    if (!branchId) {
      return res.status(400).json({ success: false, message: "branch_id is required" });
    }

    const branch = await Branch.findOne({ where: { id: branchId } });
    if (!branch) {
      return res.status(404).json({ success: false, message: "Branch not found" });
    }

    const emp = await getUserBranch(req);
    if (emp && emp.branch_id !== Number(branchId)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const expenses = await ExpenseNew.findAll({
      where: { branch_id: branchId },
      include: [
        { model: User, as: "creator", attributes: ["id", "name"] },
        { model: Branch, as: "branch", attributes: ["id", "name"] },
        { model: ExpenseNewItem, as: "items" },
      ],
      order: [["created_at", "DESC"]],
    });

    if (expenses.length === 0) {
      return res.status(200).json({ success: true, message: "No expenses found for this branch", data: [] });
    }

    return res.status(200).json({ success: true, data: expenses });
  } catch (err) {
    console.error("getExpensesByBranchNew failed:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch branch expenses",
      error: err.message,
    });
  }
};

// // ================================
// // UPDATE EXPENSE (replace items, adjust wallet)
// // ================================
exports.updateExpenseNew = async (req, res) => {
  const t = await erpDB.transaction();
  try {
    const expense = await ExpenseNew.findOne({
      where: { id: req.params.id, is_deleted: false },
      include: [{ model: ExpenseNewItem, as: "items" }],
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!expense) {
      await t.rollback();
      return res.status(404).json({ success: false, message: "Expense not found" });
    }

    const emp = await getUserBranch(req);
    if (emp && expense.branch_id !== emp.branch_id) {
      await t.rollback();
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const oldBranchId = expense.branch_id;
    const oldAmount = Number(expense.total_amount || 0);

    let {
      branch_id,
      description,
      vendor_name,
      remark,
      type_of_supply_or_service,
      category_id,
      items,
      payments_status,
      actual_bill_date,
    } = req.body;

    const targetBranchId = branch_id ? parseInt(branch_id, 10) : oldBranchId;
    const effectiveDescription = vendor_name || description;

    if (!remark || remark.toString().trim() === "") {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: "Remark is required while updating expense",
      });
    }

    if (typeof items === "string") {
      try {
        items = JSON.parse(items);
      } catch (e) {}
    }

    let newTotalSubtotal = oldAmount;
    let newTotalTax = Number(expense.tax_total || 0);
    let newTotalAmount = oldAmount;

    // ================================
    // RECOMPUTE ITEMS IF PROVIDED
    // ================================
    if (Array.isArray(items) && items.length > 0) {
      newTotalSubtotal = 0;
      newTotalTax = 0;
      newTotalAmount = 0;

      const computedItems = [];

      for (let i = 0; i < items.length; i++) {
        const it = items[i] || {};
        if (!it.item_name) {
          await t.rollback();
          return res.status(400).json({ success: false, message: "item_name required at index " + i });
        }

        const is_taxable = it.is_taxable === true || it.is_taxable === "true" || it.is_taxable === 1;
        const tax_rate = Number(it.tax_rate || 0);
        const tax_type =
          it.tax_type === "inclusive"
            ? "inclusive"
            : it.tax_type === "exclusive"
            ? "exclusive"
            : is_taxable
            ? "exclusive"
            : null;

        const rawSubtotal = Number(it.subtotal || it.amount || 0);

        const computed = computeItemAmountsFromSubtotal({
          subtotal: rawSubtotal,
          is_taxable,
          tax_rate,
          tax_type,
        });

        let documentPath = it.document || null;
        const file = findItemDocumentFile(
          req.files && Array.isArray(req.files)
            ? req.files
            : req.files
            ? Object.values(req.files).flat()
            : [],
          i
        );

        if (file) {
          documentPath = path
            .join("uploads", file.destination.split(path.sep).pop(), file.filename)
            .replace(/\\/g, "/");
        }

        computedItems.push({
          expense_id: expense.id,
          item_name: it.item_name,
          subtotal: computed.subtotal,
          is_taxable,
          tax_rate,
          tax_type,
          tax_total: computed.tax_total,
          total_amount: computed.total_amount,
          document: documentPath,
        });

        newTotalSubtotal += computed.subtotal;
        newTotalTax += computed.tax_total;
        newTotalAmount += computed.total_amount;
      }

      await ExpenseNewItem.destroy({ where: { expense_id: expense.id }, transaction: t });
      await ExpenseNewItem.bulkCreate(computedItems, { transaction: t });
    }

    // Helper to recalculate running balances for a branch
    async function recalculateBranchBalances(bId) {
      const allTx = await BranchWallet.findAll({
        where: { branch_id: bId },
        order: [["id", "ASC"]],
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      let running = 0;
      for (const w of allTx) {
        const amt = Number(w.amount);
        running =
          w.transaction_type === "credit"
            ? Number((running + amt).toFixed(2))
            : Number((running - amt).toFixed(2));
        if (Number(w.balance_after) !== running) {
          await w.update({ balance_after: running }, { transaction: t });
        }
      }
    }

    // ================================
    // WALLET ADJUSTMENT
    // ================================
    const existingTx = await BranchWallet.findOne({
      where: {
        branch_id: oldBranchId,
        transaction_type: "debit",
        [Op.or]: [
          { name: { [Op.like]: "%Expense%#" + expense.id + "%" } },
          { description: { [Op.like]: "%expense%#" + expense.id + "%" } },
          { name: "Expense #" + expense.id },
        ],
      },
      order: [["id", "ASC"]],
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (existingTx) {
      if (oldBranchId === targetBranchId) {
        if (oldAmount !== newTotalAmount) {
          await existingTx.update(
            {
              amount: newTotalAmount,
            },
            { transaction: t }
          );
          await recalculateBranchBalances(oldBranchId);
        }
      } else {
        await existingTx.update(
          {
            branch_id: targetBranchId,
            amount: newTotalAmount,
          },
          { transaction: t }
        );

        await recalculateBranchBalances(oldBranchId);
        await recalculateBranchBalances(targetBranchId);
      }
    }

    // ================================
    // UPDATE EXPENSE
    // ================================
    await expense.update(
      {
        branch_id: targetBranchId,
        description: effectiveDescription !== undefined ? effectiveDescription : expense.description,
        vendor_name: effectiveDescription !== undefined ? effectiveDescription : expense.vendor_name,
        remark: remark ?? expense.remark,
        type_of_supply_or_service: type_of_supply_or_service !== undefined ? type_of_supply_or_service : expense.type_of_supply_or_service,
        category_id: category_id ?? expense.category_id,
        actual_bill_date: actual_bill_date ?? expense.actual_bill_date,
        subtotal: Number(newTotalSubtotal.toFixed(2)),
        tax_total: Number(newTotalTax.toFixed(2)),
        total_amount: Number(newTotalAmount.toFixed(2)),
        payments_status: payments_status ?? expense.payments_status,
      },
      { transaction: t }
    );

    await t.commit();

    const updatedExpense = await ExpenseNew.findOne({
      where: { id: expense.id },
      include: [{ model: ExpenseNewItem, as: "items" }],
    });

    return res.status(200).json({
      success: true,
      message: "Expense updated successfully",
      data: updatedExpense,
    });
  } catch (err) {
    await t.rollback();
    console.error("updateExpenseNew failed:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to update expense",
      error: err.message,
    });
  }
};

exports.softDeleteExpenseNew = async (req, res) => {
  const t = await erpDB.transaction();
  try {
    const expense = await ExpenseNew.findOne({
      where: { id: req.params.id, is_deleted: false },
    });

    if (!expense) {
      await t.rollback();
      return res.status(404).json({ success: false, message: "Expense not found" });
    }

    const emp = await getUserBranch(req);
    if (emp && expense.branch_id !== emp.branch_id) {
      await t.rollback();
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const expenseAmount = Number(expense.total_amount || 0);

    // 🔹 Get last wallet balance
    const lastWallet = await BranchWallet.findOne({
      where: { branch_id: expense.branch_id },
      order: [["created_at", "DESC"]],
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    const currentBalance = lastWallet ? Number(lastWallet.balance_after) : 0;
    const balanceAfter = Number((currentBalance + expenseAmount).toFixed(2));

    // 🔹 Credit money back
    await BranchWallet.create(
      {
        branch_id: expense.branch_id,
        name: `Expense Deleted #${expense.id}`,
        transaction_type: "credit",
        amount: expenseAmount,
        description: "Expense deleted – amount refunded",
        balance_after: balanceAfter,
        created_by: req.user.id,
      },
      { transaction: t }
    );

    // 🔹 Soft delete expense
    await expense.update(
      { is_deleted: true },
      { transaction: t }
    );

    // 🔹 Remove items (optional but clean)
    await ExpenseNewItem.destroy({
      where: { expense_id: expense.id },
      transaction: t,
    });

    await t.commit();

    return res.status(200).json({
      success: true,
      message: "Expense deleted and wallet refunded successfully",
      refunded_amount: expenseAmount,
      balance_after: balanceAfter,
    });
  } catch (err) {
    await t.rollback();
    console.error("softDeleteExpenseNew failed:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to delete expense",
      error: err.message,
    });
  }
};

// ================================
// EMPLOYEE ADVANCE PAYMENT
// ================================
exports.employeeAdvancePayment = async (req, res) => {
  try {
    const userId = req.user.id;
    const userName = req.user.name;
    let { branch_id, employee_id, advance_amount, description } = req.body;

    // Enforce branch for branch users
    const emp = await getUserBranch(req);
    if (emp) branch_id = emp.branch_id;

    if (!branch_id || !employee_id || !advance_amount) {
      return res.status(400).json({
        success: false,
        message: "branch_id, employee_id, and advance_amount are required",
      });
    }

    // ✅ Check branch
    const branch = await Branch.findOne({ where: { id: branch_id } });
    if (!branch)
      return res
        .status(404)
        .json({ success: false, message: "Branch not found" });

    // ✅ Find employee using employee_id (not id)
    const employee = await Employee.findOne({
      where: { employee_id: employee_id, branch_id },
    });
    if (!employee)
      return res.status(404).json({
        success: false,
        message: "Employee not found in this branch",
      });

    // ✅ Salary calculations
    const netSalary = parseFloat(employee.salary || 0);
    const prevAdvances = await ExpenseNew.sum("total_amount", {
      where: { branch_id, employee_id },
    });
    const totalPrevAdvance = parseFloat(prevAdvances || 0);
    const salaryBalanceBefore = netSalary - totalPrevAdvance;

    if (advance_amount > salaryBalanceBefore) {
      return res.status(400).json({
        success: false,
        message: "Advance amount cannot exceed employee salary balance",
      });
    }

    // ✅ Branch wallet check
    const lastWallet = await BranchWallet.findOne({
      where: { branch_id },
      order: [["created_at", "DESC"]],
    });
    const branchBalanceBefore = lastWallet
      ? parseFloat(lastWallet.balance_after)
      : 0;

    if (branchBalanceBefore < advance_amount) {
      return res.status(400).json({
        success: false,
        message: `Insufficient branch balance. Current balance = ${branchBalanceBefore}, required = ${advance_amount}.`,
      });
    }

    const salaryBalanceAfter = salaryBalanceBefore - advance_amount;
    const branchBalanceAfter = branchBalanceBefore - advance_amount;

    // ✅ Create Expense
    const expense = await ExpenseNew.create({
      branch_id,
      employee_id, // using employee_id field
      payment_date: new Date(),
      subtotal: advance_amount,
      tax_total: 0,
      total_amount: advance_amount,
      payments_status: "paid",
      created_by: userId,
      description: description || null,
    });

    // ✅ Create BranchWallet transaction
    await BranchWallet.create({
      branch_id,
      name: `Advance Expense #${expense.id} - ${employee.employee_id}`,
      transaction_type: "debit",
      amount: advance_amount,
      description: `Advance Payment to ${employee.employee_id} (${employee.name})`,
      balance_after: branchBalanceAfter,
      created_by: userId,
    });

    // ✅ Response
    res.status(201).json({
      success: true,
      message: "Employee advance payment recorded",
      data: {
        expense_id: expense.id,
        employee_id: employee.employee_id,
        employee_name: employee.name,
        advanceAmount: advance_amount,
        salaryBalanceBefore,
        salaryBalanceAfter,
        branchBalanceBefore,
        branchBalanceAfter,
        created_by: userName,
      },
    });
  } catch (err) {
    console.error("Employee advance payment failed:", err);
    res.status(500).json({
      success: false,
      message: "Failed to record advance payment",
      error: err.message,
    });
  }
};
exports.getExpenseById = async (req, res) => {
  try {
    const { id } = req.params;

    const expense = await ExpenseNew.findOne({
      where: { id, is_deleted: false },
      include: [
        { model: ExpenseNewItem, as: 'items', required: false },
        { model: Branch, as: 'branch', required: false },
        { model: ExpenseCategory, as: 'category', required: false },
      ],
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found',
      });
    }

    const response = expense.toJSON();
    response.total_items = (expense.items || []).length;

    return res.status(200).json({
      success: true,
      data: {
        expense: response,
      },
    });
  } catch (err) {
    console.error('getExpenseById error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch expense',
      error: err.message,
    });
  }
}