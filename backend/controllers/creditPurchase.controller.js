
const { Op } = require("sequelize");
const path = require("path");
const {erpDB} = require("../config/database");
const CreditPurchase = require("../models/creditPurchase.model");
const CreditPurchaseItem = require("../models/creditPurchaseItem.model");
const Branch = require("../models/branch.model");
const Employee = require("../models/employee.model");
const User = require("../models/user.model");
const Category = require("../models/expenseCategory.model");
const BranchWallet = require("../models/branchWallet.model");
// ===========================
// HELPERS
// ===========================
async function getCompanyId(req) {
  if (!req.user) return null;
  const type = (req.user.type || "").toLowerCase();

  if (type === "company") return req.user.id;

  const emp = await Employee.findOne({
    where: { user_id: req.user.id },
    attributes: ["created_by"],
    raw: true,
  });
  if (emp?.created_by) return emp.created_by;

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
  return emp;
}

function computeItemAmountsFromSubtotal({ subtotal, is_taxable, tax_rate = 0, tax_type }) {
  subtotal = Number(parseFloat(subtotal || 0));
  tax_rate = Number(parseFloat(tax_rate || 0));
  is_taxable = !!is_taxable;

  let tax_total = 0;
  let total_amount = subtotal;

  if (!is_taxable) return { subtotal, tax_total: 0, total_amount: subtotal };

  if (tax_type === "exclusive") {
    tax_total = subtotal * (tax_rate / 100);
    total_amount = subtotal + tax_total;
  } else if (tax_type === "inclusive") {
    tax_total = subtotal * (tax_rate / (100 + tax_rate));
    subtotal -= tax_total;
    total_amount = subtotal + tax_total;
  } else {
    tax_total = subtotal * (tax_rate / 100);
    total_amount = subtotal + tax_total;
  }

  return {
    subtotal: Number(subtotal.toFixed(2)),
    tax_total: Number(tax_total.toFixed(2)),
    total_amount: Number(total_amount.toFixed(2)),
  };
}

function findItemDocumentFile(reqFiles, index) {
  if (!reqFiles || !Array.isArray(reqFiles)) return null;
  return (
    reqFiles.find(
      (f) => f.fieldname === `item_document_${index}` || f.fieldname === `items[${index}].document`
    ) || null
  );
}

// ===========================
// CREATE CREDIT PURCHASE
// ===========================
exports.createCreditPurchase = async (req, res) => {
  const t = await erpDB.transaction();
  try {
    if (!req.user?.id) {
      await t.rollback();
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const userId = req.user.id;
    let { branch_id, description, category_id, items, vendor_name, type_of_supply_or_service,actual_bill_date } = req.body;
    
    // =======================
// HANDLE CATEGORY (Select or Create)
// =======================

let finalCategoryId = category_id;

if (category_id && isNaN(category_id)) {
  // User typed new category name

  const existingCategory = await Category.findOne({
    where: { name: category_id },
  });

  if (existingCategory) {
    finalCategoryId = existingCategory.id;
  } else {
    const newCategory = await Category.create(
      {
        name: category_id,
        created_by: req.user.id,
      },
      { transaction: t }
    );

    finalCategoryId = newCategory.id;
  }
}

    if (typeof items === "string") items = JSON.parse(items);
    if (!Array.isArray(items) || !items.length) {
      await t.rollback();
      return res.status(400).json({ success: false, message: "Items array required" });
    }

    // Role permission: resolve branch based on employee
    const empBranch = await getUserBranch(req);
    if (empBranch) branch_id = empBranch.branch_id;
    if (!branch_id) {
      await t.rollback();
      return res.status(400).json({ success: false, message: "Branch ID required" });
    }

    const branch = await Branch.findOne({ where: { id: branch_id } });
    if (!branch) {
      await t.rollback();
      return res.status(404).json({ success: false, message: "Branch not found" });
    }

    // compute totals
    let totalSubtotal = 0, totalTax = 0, totalAmount = 0;
    const itemRecords = [];

    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      if (!it.item_name) {
        await t.rollback();
        return res.status(400).json({ success: false, message: `Item name required (index ${i})` });
      }

      const computed = computeItemAmountsFromSubtotal({
        subtotal: parseFloat(it.subtotal || 0),
        is_taxable: it.is_taxable,
        tax_rate: it.tax_rate,
        tax_type: it.tax_type,
      });

      let documentPath = null;
      const file = findItemDocumentFile(req.files ? Object.values(req.files).flat() : [], i);
      if (file) {
        const uploadFolder = file.destination ? file.destination.split(path.sep).pop() : "uploads";
        documentPath = path.join("uploads", uploadFolder, file.filename).replace(/\\/g, "/");
      } else if (it.document) documentPath = it.document;

      itemRecords.push({
        ...computed,
        item_name: it.item_name,
        is_taxable: it.is_taxable,
        tax_rate: it.tax_rate,
        tax_type: it.tax_type,
        document: documentPath,
      });

      totalSubtotal += computed.subtotal;
      totalTax += computed.tax_total;
      totalAmount += computed.total_amount;
    }

    const credit = await CreditPurchase.create(
      {
        branch_id,
        description,
        category_id: finalCategoryId,
        subtotal: totalSubtotal,
        tax_total: totalTax,
        total_amount: totalAmount,
        payment_status: "pending", // credit purchase default pending
        created_by: userId,
        vendor_name,
        type_of_supply_or_service,
        actual_bill_date: actual_bill_date || null,
      },
      { transaction: t }
    );

    for (const rec of itemRecords) {
      await CreditPurchaseItem.create(
        {
          credit_purchase_id: credit.id,
          item_name: rec.item_name,
          subtotal: rec.subtotal,
          is_taxable: rec.is_taxable,
          tax_rate: rec.tax_rate,
          tax_type: rec.tax_type,
          tax_total: rec.tax_total,
          total_amount: rec.total_amount,
          document: rec.document,
        },
        { transaction: t }
      );
    }

    await t.commit();

    const created = await CreditPurchase.findOne({
      where: { id: credit.id },
      include: [{ model: CreditPurchaseItem, as: "items" }],
    });

    return res.status(201).json({ success: true, data: created });
  } catch (err) {
    await t.rollback();
    console.error("createCreditPurchase error:", err);
    return res.status(500).json({ success: false, message: "Failed to create credit purchase", error: err.message });
  }
};

// ===========================
// GET ALL CREDIT PURCHASES WITH ROLE PERMISSION
// ===========================
exports.getAllCreditPurchases = async (req, res) => {
  try {
    const emp = await getUserBranch(req);
    const companyId = await getCompanyId(req);

    let where = {};
    if (emp) {
      where.branch_id = emp.branch_id; // employee can see only their branch
    } else {
      // company user: get all branches created by this company
      const branches = await Branch.findAll({ where: { created_by: companyId }, attributes: ["id"], raw: true });
      where.branch_id = { [Op.in]: branches.map(b => b.id) };
    }

    const credits = await CreditPurchase.findAll({
      where,
      include: [{ model: CreditPurchaseItem, as: "items" }],
      order: [["created_at", "DESC"]],
    });

    return res.status(200).json({ success: true, data: credits });
  } catch (err) {
    console.error("getAllCreditPurchases error:", err);
    return res.status(500).json({ success: false, message: "Failed to fetch credit purchases", error: err.message });
  }
};

// ===========================
// MARK CREDIT PURCHASE PAID
// ===========================
exports.markCreditPurchasePaid = async (req, res) => {
  const t = await erpDB.transaction();
  try {
    const { id } = req.params;

    if (!id) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: "Credit purchase id is required",
      });
    }

    const credit = await CreditPurchase.findByPk(id, { transaction: t });

    if (!credit) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: "Credit purchase not found",
      });
    }

    const emp = await getUserBranch(req);
    if (emp && credit.branch_id !== emp.branch_id) {
      await t.rollback();
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    if (credit.payment_status === "paid") {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: "Already marked as paid",
      });
    }

    // 🔥 WALLET CHECK + DEDUCTION
    const lastWallet = await BranchWallet.findOne({
      where: { branch_id: credit.branch_id },
      order: [["created_at", "DESC"]],
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    const currentBalance = lastWallet
      ? Number(lastWallet.balance_after)
      : 0;

    const totalAmount = Number(credit.total_amount || 0);

    if (currentBalance < totalAmount) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: `Insufficient wallet balance. Available = ${currentBalance}, required = ${totalAmount}`,
      });
    }

    const balanceAfter = Number(
      (currentBalance - totalAmount).toFixed(2)
    );

    // 🔥 Create wallet entry
    await BranchWallet.create(
      {
        branch_id: credit.branch_id,
        name: `Credit Purchase Payment #${credit.id}`,
        transaction_type: "debit",
        amount: totalAmount,
        description: `Payment of credit purchase #${credit.id}`,
        balance_after: balanceAfter,
        created_by: req.user.id,
      },
      { transaction: t }
    );

    // ✅ Update credit purchase
    await credit.update(
      {
        payment_status: "paid",
        payment_date: new Date(),
      },
      { transaction: t }
    );

    await t.commit();

    return res.status(200).json({
      success: true,
      message: "Credit purchase marked as paid successfully",
      data: credit,
    });
  } catch (err) {
    await t.rollback();
    console.error("markCreditPurchasePaid error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to mark paid",
      error: err.message,
    });
  }
};


exports.updateCreditPurchase = async (req, res) => {
  const t = await erpDB.transaction();
  try {
    if (!req.user?.id) {
      await t.rollback();
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const creditId = req.params.id;
    const credit = await CreditPurchase.findOne({
      where: { id: creditId },
      include: [{ model: CreditPurchaseItem, as: "items" }],
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!credit) {
      await t.rollback();
      return res.status(404).json({ success: false, message: "Credit purchase not found" });
    }
    const oldBranchId = credit.branch_id;
    const oldTotalAmount = parseFloat(credit.total_amount || 0);

    const empBranch = await getUserBranch(req);
    if (empBranch && empBranch.branch_id !== credit.branch_id) {
      await t.rollback();
      return res.status(403).json({ success: false, message: "Access denied for this branch" });
    }

    // Destructure incoming fields
    let {
      branch_id,
      description,
      category_id,
      items,
      vendor_name,
      type_of_supply_or_service,
      payment_status,
      remark,
      actual_bill_date,
    } = req.body;

    const targetBranchId = branch_id ? parseInt(branch_id, 10) : oldBranchId;

    if (!remark || remark.trim() === "") {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: "Remark is mandatory while updating credit purchase",
      });
    }
    if (typeof items === "string") {
      try {
        items = JSON.parse(items);
      } catch (e) {}
    }

    // Initialize totals
    let totalSubtotal = parseFloat(credit.subtotal || 0);
    let totalTax = parseFloat(credit.tax_total || 0);
    let totalAmount = parseFloat(credit.total_amount || 0);

    // Recalculate if items are provided
    if (Array.isArray(items) && items.length > 0) {
      const newItems = [];
      totalSubtotal = 0;
      totalTax = 0;
      totalAmount = 0;

      for (let i = 0; i < items.length; i++) {
        const it = items[i];
        if (!it.item_name) {
          await t.rollback();
          return res
            .status(400)
            .json({ success: false, message: "Item name required (index " + i + ")" });
        }

        const computed = computeItemAmountsFromSubtotal({
          subtotal: parseFloat(it.subtotal || 0),
          is_taxable:
            it.is_taxable === true ||
            it.is_taxable === "true" ||
            it.is_taxable === 1 ||
            it.is_taxable === "1",
          tax_rate: parseFloat(it.tax_rate || 0) || 0,
          tax_type: (it.tax_type || "").toLowerCase(),
        });

        let documentPath = null;
        const file = findItemDocumentFile(
          req.files ? Object.values(req.files).flat() : [],
          i
        );
        if (file) {
          const uploadFolder = file.destination
            ? file.destination.split(path.sep).pop()
            : "uploads";
          documentPath = path
            .join("uploads", uploadFolder, file.filename)
            .replace(/\\/g, "/");
        } else if (it.document) {
          documentPath = it.document;
        }

        newItems.push({
          item_name: it.item_name,
          subtotal: computed.subtotal,
          is_taxable:
            it.is_taxable === true ||
            it.is_taxable === "true" ||
            it.is_taxable === 1 ||
            it.is_taxable === "1",
          tax_rate: parseFloat(it.tax_rate || 0),
          tax_type: it.tax_type || null,
          tax_total: computed.tax_total,
          total_amount: computed.total_amount,
          document: documentPath,
        });
        totalSubtotal += computed.subtotal;
        totalTax += computed.tax_total;
        totalAmount += computed.total_amount;
      }

      // Remove old and insert new
      await CreditPurchaseItem.destroy({ where: { credit_purchase_id: credit.id }, transaction: t });
      for (const rec of newItems) {
        await CreditPurchaseItem.create(
          {
            credit_purchase_id: credit.id,
            item_name: rec.item_name,
            subtotal: rec.subtotal,
            is_taxable: rec.is_taxable,
            tax_rate: rec.tax_rate,
            tax_type: rec.tax_type,
            tax_total: rec.tax_total,
            total_amount: rec.total_amount,
            document: rec.document,
          },
          { transaction: t }
        );
      }
    }

    let finalCategoryId = credit.category_id;
    if (category_id) {
      if (isNaN(category_id)) {
        const existingCategory = await Category.findOne({
          where: { name: category_id },
        });

        if (existingCategory) {
          finalCategoryId = existingCategory.id;
        } else {
          const newCategory = await Category.create(
            {
              name: category_id,
              created_by: req.user.id,
            },
            { transaction: t }
          );

          finalCategoryId = newCategory.id;
        }
      } else {
        finalCategoryId = category_id;
      }
    }

    // Update parent record
    const updatedFields = {
      branch_id: targetBranchId,
      description: description || credit.description,
      category_id: finalCategoryId,
      vendor_name: vendor_name || credit.vendor_name,
      type_of_supply_or_service: type_of_supply_or_service || credit.type_of_supply_or_service,
      subtotal: Number(totalSubtotal.toFixed(2)),
      tax_total: Number(totalTax.toFixed(2)),
      total_amount: Number(totalAmount.toFixed(2)),
      payment_status: payment_status || credit.payment_status,
      remark: remark.trim(),
      actual_bill_date: actual_bill_date || credit.actual_bill_date,
    };

    const oldPaymentStatus = credit.payment_status;
    const newPaymentStatus = updatedFields.payment_status;
    const newTotalAmount = Number(updatedFields.total_amount);

    await credit.update(updatedFields, { transaction: t });

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
    // WALLET ADJUSTMENT FOR GST PURCHASE
    // ================================
    if (oldPaymentStatus === "pending" && newPaymentStatus === "paid") {
      // Pending -> Paid: create new debit transaction for target branch
      const lastWallet = await BranchWallet.findOne({
        where: { branch_id: targetBranchId },
        order: [["id", "DESC"]],
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      const currentBalance = lastWallet ? Number(lastWallet.balance_after) : 0;
      const balanceAfter = Number((currentBalance - newTotalAmount).toFixed(2));

      await BranchWallet.create(
        {
          branch_id: targetBranchId,
          name: "Credit Purchase Payment #" + credit.id,
          transaction_type: "debit",
          amount: newTotalAmount,
          description: "Payment of credit purchase #" + credit.id,
          balance_after: balanceAfter,
          created_by: req.user.id,
        },
        { transaction: t }
      );
    } else if (oldPaymentStatus === "paid") {
      // Already paid -> find existing wallet debit transaction
      const existingTx = await BranchWallet.findOne({
        where: {
          branch_id: oldBranchId,
          transaction_type: "debit",
          [Op.or]: [
            { name: { [Op.like]: "%Credit Purchase%#" + credit.id + "%" } },
            { description: { [Op.like]: "%credit purchase%#" + credit.id + "%" } },
            { name: "Credit Purchase Payment #" + credit.id },
          ],
        },
        order: [["id", "ASC"]],
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      if (existingTx) {
        if (newPaymentStatus === "pending") {
          // Changed from paid to pending: remove the payment transaction
          await existingTx.destroy({ transaction: t });
          await recalculateBranchBalances(oldBranchId);
        } else {
          // Still paid: check if site or amount changed
          if (oldBranchId === targetBranchId) {
            if (oldTotalAmount !== newTotalAmount) {
              await existingTx.update(
                {
                  amount: newTotalAmount,
                },
                { transaction: t }
              );
              await recalculateBranchBalances(oldBranchId);
            }
          } else {
            // Site changed: move transaction to target site
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
      }
    }

    await t.commit();

    const updatedCredit = await CreditPurchase.findOne({
      where: { id: credit.id },
      include: [{ model: CreditPurchaseItem, as: "items" }],
    });

    return res.status(200).json({
      success: true,
      message: "Credit purchase updated successfully",
      data: updatedCredit,
    });
  } catch (err) {
    await t.rollback();
    console.error("updateCreditPurchase error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to update credit purchase",
      error: err.message,
    });
  }
};
// ===========================
// GET CREDIT PURCHASE BY ID
// ===========================
exports.getCreditPurchaseById = async (req, res) => {
  try {
    const { id } = req.params;
    const credit = await CreditPurchase.findOne({
      where: { id },
      include: [
        { model: CreditPurchaseItem, as: "items" },
        { model: Branch, as: "branch" },
        { model: Category, as: "category" },
      ],
    });

    if (!credit) {
      return res.status(404).json({ success: false, message: "Credit purchase not found" });
    }

    return res.status(200).json({ success: true, data: credit });
  } catch (err) {
    console.error("getCreditPurchaseById error:", err);
    return res.status(500).json({ success: false, message: "Failed to fetch credit purchase", error: err.message });
  }
};

// ===========================
// DELETE CREDIT PURCHASE
// ===========================
exports.deleteCreditPurchase = async (req, res) => {
  const t = await erpDB.transaction();
  try {
    const { id } = req.params;
    const credit = await CreditPurchase.findOne({
      where: { id },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!credit) {
      await t.rollback();
      return res.status(404).json({ success: false, message: "Credit purchase not found" });
    }

    // If paid, reverse wallet effect
    if (credit.payment_status === "paid") {
      const existingTx = await BranchWallet.findOne({
        where: {
          branch_id: credit.branch_id,
          transaction_type: "debit",
          [Op.or]: [
            { name: { [Op.like]: "%Credit Purchase%#" + credit.id + "%" } },
            { description: { [Op.like]: "%credit purchase%#" + credit.id + "%" } },
            { name: "Credit Purchase Payment #" + credit.id },
          ],
        },
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      if (existingTx) {
        await existingTx.destroy({ transaction: t });

        // Recalculate branch balances
        const allTx = await BranchWallet.findAll({
          where: { branch_id: credit.branch_id },
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
    }

    await CreditPurchaseItem.destroy({ where: { credit_purchase_id: id }, transaction: t });
    await credit.destroy({ transaction: t });

    await t.commit();
    return res.status(200).json({ success: true, message: "Credit purchase deleted successfully" });
  } catch (err) {
    await t.rollback();
    console.error("deleteCreditPurchase error:", err);
    return res.status(500).json({ success: false, message: "Failed to delete credit purchase", error: err.message });
  }
};
