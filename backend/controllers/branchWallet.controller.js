
const { Op } = require("sequelize");
const path = require("path");
const BranchWallet = require("../models/branchWallet.model");
const Branch = require("../models/branch.model");
const Employee = require("../models/employee.model");
const User = require("../models/user.model");

// -------------------- HELPERS --------------------
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
  return await Employee.findOne({
    where: { user_id: req.user.id },
    attributes: ["branch_id", "created_by"],
  });
}

// -------------------- CONTROLLER --------------------

// GET ALL WALLETS
exports.getAllWallets = async (req, res) => {
  try {
    const emp = await getUserBranch(req);
    const companyId = await getCompanyId(req);

    let where = {};
    if (emp) {
      // Employee → only their branch
      where.branch_id = emp.branch_id;
    } else {
      // Company/Admin → all branches under company
      const branches = await Branch.findAll({
        where: { created_by: companyId },
        attributes: ["id"],
        raw: true,
      });
      where.branch_id = { [Op.in]: branches.map(b => b.id) };
    }

    const wallets = await BranchWallet.findAll({
      where,
      include: [{ model: Branch, attributes: ["id", "name"] }],
      order: [["id", "DESC"]],
    });

    res.status(200).json({ success: true, data: wallets });
  } catch (err) {
    console.error("getAllWallets failed:", err);
    res.status(500).json({ success: false, message: "Failed to fetch wallets", error: err.message });
  }
};

// GET WALLET BY ID
exports.getWalletById = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ success: false, message: "Invalid id" });

    const emp = await getUserBranch(req);
    const companyId = await getCompanyId(req);

    const wallet = await BranchWallet.findOne({
      where: { id },
      include: [{ model: Branch, attributes: ["id", "name"] }],
    });
    if (!wallet) return res.status(404).json({ success: false, message: "Wallet not found" });

    if (emp && wallet.branch_id !== emp.branch_id) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    if (!emp) {
      const branches = await Branch.findAll({ where: { created_by: companyId }, attributes: ["id"], raw: true });
      if (!branches.map(b => b.id).includes(wallet.branch_id)) {
        return res.status(403).json({ success: false, message: "Access denied" });
      }
    }

    res.status(200).json({ success: true, data: wallet });
  } catch (err) {
    console.error("getWalletById failed:", err);
    res.status(500).json({ success: false, message: "Failed to fetch wallet", error: err.message });
  }
};

// CREATE WALLET
exports.createWallet = async (req, res) => {
  try {
    const userId = req.user.id;
    let { branch_id, transaction_type, amount, description, name, transaction_date } = req.body;

    const emp = await getUserBranch(req);
    const companyId = await getCompanyId(req);

    // Enforce branch for employees
    if (emp) branch_id = emp.branch_id;
    if (!branch_id || !transaction_type || !amount) {
      return res.status(400).json({ success: false, message: "branch_id, transaction_type, and amount are required" });
    }

    const branch = await Branch.findOne({ where: { id: branch_id } });
    if (!branch) return res.status(404).json({ success: false, message: "Branch not found" });

    // Last balance
    const lastWallet = await BranchWallet.findOne({ where: { branch_id }, order: [["created_at", "DESC"]] });
    const lastBalance = lastWallet ? parseFloat(lastWallet.balance_after) : 0;
    const balance_after = transaction_type === "credit" ? lastBalance + parseFloat(amount) : lastBalance - parseFloat(amount);

    const wallet = await BranchWallet.create({
      branch_id,
      name: name || null,
      transaction_type,
      amount,
      description,
      balance_after,
      transaction_date: transaction_date || new Date(),
      created_by: userId,
    });

    res.status(201).json({ success: true, data: wallet });
  } catch (err) {
    console.error("createWallet failed:", err);
    res.status(500).json({ success: false, message: "Failed to create wallet", error: err.message });
  }
};

// UPDATE WALLET
// exports.updateWallet = async (req, res) => {
//   try {
//     const id = Number(req.params.id);
//     if (Number.isNaN(id)) return res.status(400).json({ success: false, message: "Invalid wallet id" });

//     const wallet = await BranchWallet.findOne({ where: { id } });
//     if (!wallet) return res.status(404).json({ success: false, message: "Wallet not found" });

//     const emp = await getUserBranch(req);
//     const companyId = await getCompanyId(req);

//     if (emp && wallet.branch_id !== emp.branch_id) {
//       return res.status(403).json({ success: false, message: "Access denied" });
//     }
//     if (!emp) {
//       const branches = await Branch.findAll({ where: { created_by: companyId }, attributes: ["id"], raw: true });
//       if (!branches.map(b => b.id).includes(wallet.branch_id)) {
//         return res.status(403).json({ success: false, message: "Access denied" });
//       }
//     }

//     let { branch_id, transaction_type, amount, description, name, transaction_date } = req.body;
//     const updateData = {};

//     if (emp) branch_id = emp.branch_id; // enforce branch for employees
//     if (branch_id) updateData.branch_id = branch_id;
//     if (transaction_type) updateData.transaction_type = transaction_type;
//     if (amount !== undefined) updateData.amount = amount;
//     if (description !== undefined) updateData.description = description;
//     if (name !== undefined) updateData.name = name;
//     if (transaction_date !== undefined) {
//   updateData.transaction_date = transaction_date;
// }

//     // Recalculate balance_after
//     if (amount !== undefined || transaction_type !== undefined || branch_id !== undefined) {
//       const branchIdToUse = branch_id || wallet.branch_id;
//       const typeToUse = transaction_type || wallet.transaction_type;
//       const amountToUse = amount !== undefined ? parseFloat(amount) : parseFloat(wallet.amount);

//       const lastWalletBefore = await BranchWallet.findOne({ where: { branch_id: branchIdToUse, id: { [Op.lt]: wallet.id } }, order: [["id", "DESC"]] });
//       let balance_after = lastWalletBefore ? parseFloat(lastWalletBefore.balance_after) : 0;
//       balance_after = typeToUse === "credit" ? balance_after + amountToUse : balance_after - amountToUse;
//       updateData.balance_after = balance_after;

//       const subsequentWallets = await BranchWallet.findAll({ where: { branch_id: branchIdToUse, id: { [Op.gt]: wallet.id } }, order: [["id", "ASC"]] });
//       let runningBalance = balance_after;
//       for (const w of subsequentWallets) {
//         runningBalance = w.transaction_type === "credit" ? runningBalance + parseFloat(w.amount) : runningBalance - parseFloat(w.amount);
//         await w.update({ balance_after: runningBalance });
//       }
//     }

//     await wallet.update(updateData);
//     res.status(200).json({ success: true, data: wallet });
//   } catch (err) {
//     console.error("updateWallet failed:", err);
//     res.status(500).json({ success: false, message: "Failed to update wallet", error: err.message });
//   }
// };

exports.updateWallet = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ success: false, message: "Invalid wallet id" });
    }

    const wallet = await BranchWallet.findOne({ where: { id } });
    if (!wallet) {
      return res.status(404).json({ success: false, message: "Wallet not found" });
    }

    const emp = await getUserBranch(req);
    const companyId = await getCompanyId(req);

    // Access control for current branch
    if (emp && wallet.branch_id !== emp.branch_id) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    if (!emp) {
      const branches = await Branch.findAll({
        where: { created_by: companyId },
        attributes: ["id"],
        raw: true
      });
      const allowedBranchIds = branches.map(b => b.id);

      if (!allowedBranchIds.includes(wallet.branch_id)) {
        return res.status(403).json({ success: false, message: "Access denied" });
      }

      // ✅ If changing to a new branch, verify access to target branch too
      if (req.body.branch_id && Number(req.body.branch_id) !== wallet.branch_id) {
        if (!allowedBranchIds.includes(Number(req.body.branch_id))) {
          return res.status(403).json({ success: false, message: "Access denied to target branch" });
        }
      }
    }

    let { branch_id, transaction_type, amount, description, name, transaction_date } = req.body;

    const oldBranchId = wallet.branch_id;
    const newBranchId = branch_id ? Number(branch_id) : oldBranchId;
    const isBranchChanging = newBranchId !== oldBranchId;

    const updateData = {};
    if (branch_id) updateData.branch_id = newBranchId;
    if (transaction_type) updateData.transaction_type = transaction_type;
    if (amount !== undefined) updateData.amount = amount;
    if (description !== undefined) updateData.description = description;
    if (name !== undefined) updateData.name = name;
    if (transaction_date !== undefined) updateData.transaction_date = transaction_date;

    const typeToUse = transaction_type || wallet.transaction_type;
    const amountToUse = amount !== undefined ? parseFloat(amount) : parseFloat(wallet.amount);

    // 1️⃣ Calculate new balance for the current transaction in the target branch
    const lastWalletBeforeNew = await BranchWallet.findOne({
      where: {
        branch_id: newBranchId,
        id: { [Op.lt]: wallet.id }
      },
      order: [["id", "DESC"]]
    });

    let balance_after = lastWalletBeforeNew ? parseFloat(lastWalletBeforeNew.balance_after) : 0;
    balance_after = typeToUse === "credit" ? balance_after + amountToUse : balance_after - amountToUse;
    updateData.balance_after = balance_after;

    // 2️⃣ Apply updates to the database
    await wallet.update(updateData);

    // 3️⃣ Update forward chain for the NEW branch (propagate the new balance)
    const subsequentWalletsNew = await BranchWallet.findAll({
      where: {
        branch_id: newBranchId,
        id: { [Op.gt]: wallet.id }
      },
      order: [["id", "ASC"]]
    });

    let runningBalanceNew = balance_after;
    for (const w of subsequentWalletsNew) {
      runningBalanceNew = w.transaction_type === "credit" ? runningBalanceNew + parseFloat(w.amount) : runningBalanceNew - parseFloat(w.amount);
      await w.update({ balance_after: runningBalanceNew });
    }

    // 4️⃣ If branch changed, we MUST also update the forward chain for the OLD branch
    // since this transaction was removed from its timeline.
    if (isBranchChanging) {
      const firstSubsequentOld = await BranchWallet.findOne({
        where: {
          branch_id: oldBranchId,
          id: { [Op.gt]: wallet.id }
        },
        order: [["id", "ASC"]]
      });

      if (firstSubsequentOld) {
        const lastBeforeOld = await BranchWallet.findOne({
          where: {
            branch_id: oldBranchId,
            id: { [Op.lt]: firstSubsequentOld.id }
          },
          order: [["id", "DESC"]]
        });

        let runningBalanceOld = lastBeforeOld ? parseFloat(lastBeforeOld.balance_after) : 0;
        
        const allSubsequentOld = await BranchWallet.findAll({
          where: {
            branch_id: oldBranchId,
            id: { [Op.gte]: firstSubsequentOld.id }
          },
          order: [["id", "ASC"]]
        });

        for (const w of allSubsequentOld) {
          runningBalanceOld = w.transaction_type === "credit" ? runningBalanceOld + parseFloat(w.amount) : runningBalanceOld - parseFloat(w.amount);
          await w.update({ balance_after: runningBalanceOld });
        }
      }
    }

    return res.status(200).json({ success: true, data: wallet });

  } catch (err) {
    console.error("updateWallet failed:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to update wallet",
      error: err.message
    });
  }
};


exports.deleteWallet = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid id"
      });
    }

    const wallet = await BranchWallet.findOne({
      where: { id }
    });

    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: "Wallet not found"
      });
    }

    const emp = await getUserBranch(req);
    const companyId = await getCompanyId(req);

    // Employee can delete only own branch wallet entries
    if (emp && wallet.branch_id !== emp.branch_id) {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }

    // Company/Admin access validation
    if (!emp) {
      const branches = await Branch.findAll({
        where: { created_by: companyId },
        attributes: ["id"],
        raw: true
      });

      const branchIds = branches.map((b) => b.id);

      if (!branchIds.includes(wallet.branch_id)) {
        return res.status(403).json({
          success: false,
          message: "Access denied"
        });
      }
    }

    const deletedWalletId = wallet.id;
    const branchId = wallet.branch_id;

    // Delete wallet row
    await wallet.destroy();

    // Find previous valid transaction
    const previousWallet = await BranchWallet.findOne({
      where: {
        branch_id: branchId,
        id: { [Op.lt]: deletedWalletId },
        deleted_at: null
      },
      order: [["id", "DESC"]]
    });

    let runningBalance = previousWallet
      ? parseFloat(previousWallet.balance_after)
      : 0;

    // Find all next valid transactions after deleted row
    const nextWallets = await BranchWallet.findAll({
      where: {
        branch_id: branchId,
        id: { [Op.gt]: deletedWalletId },
        deleted_at: null
      },
      order: [["id", "ASC"]]
    });

    // Recalculate balances
    for (const row of nextWallets) {
      const amount = parseFloat(row.amount);

      if (row.transaction_type === "credit") {
        runningBalance += amount;
      } else {
        runningBalance -= amount;
      }

      await row.update({
        balance_after: runningBalance
      });
    }

    return res.status(200).json({
      success: true,
      message: "Wallet deleted and balances recalculated successfully"
    });

  } catch (err) {
    console.error("deleteWallet failed:", err);

    return res.status(500).json({
      success: false,
      message: "Failed to delete wallet",
      error: err.message
    });
  }
};

// GET WALLET TRANSACTIONS BY BRANCH
exports.getTransactionsByBranchId = async (req, res) => {
  try {
    let branchId = Number(req.params.branch_id);
    if (Number.isNaN(branchId)) return res.status(400).json({ success: false, message: "Invalid branch_id" });

    const emp = await getUserBranch(req);
    const companyId = await getCompanyId(req);

    if (emp) branchId = emp.branch_id;

    if (!emp) {
      const branches = await Branch.findAll({ where: { created_by: companyId }, attributes: ["id"], raw: true });
      if (!branches.map(b => b.id).includes(branchId)) {
        return res.status(403).json({ success: false, message: "Access denied" });
      }
    }

    const transactions = await BranchWallet.findAll({
      where: { branch_id: branchId },
      include: [{ model: Branch, attributes: ["id", "name"] }],
      order: [["id", "DESC"]],
    });

    res.status(200).json({ success: true, data: transactions });
  } catch (err) {
    console.error("getTransactionsByBranchId failed:", err);
    res.status(500).json({ success: false, message: "Failed to fetch transactions", error: err.message });
  }
};
