const { Op } = require("sequelize");
const BranchFundRequest = require("../models/branch_fund_requests.model");
const BranchWallet = require("../models/branchWallet.model");
const Employee = require("../models/employee.model");
const Branch = require("../models/branch.model");

// -------------------- Helpers --------------------
async function getCompanyId(req) {
  if (!req.user) return null;
  const type = (req.user.type || "").toLowerCase();

  if (type === "company") return req.user.id;
  if (type === "accountant") return req.user.company_id || req.user.id;

  try {
    const emp = await Employee.findOne({
      where: { user_id: req.user.id },
      attributes: ["created_by"],
      raw: true,
    });
    if (emp?.created_by) return emp.created_by;
  } catch (err) {
    console.error("getCompanyId Employee lookup failed:", err.message);
  }

  return req.user.id;
}

// -------------------- Controllers --------------------

// Create fund request
async function createFundRequest(req, res) {
  try {
    const { amount, reason } = req.body;
    if (!amount) return res.status(400).json({ success: false, message: "Amount is required" });

    const emp = await Employee.findOne({ where: { user_id: req.user.id }, raw: true });
    if (!emp) return res.status(404).json({ success: false, message: "Employee not found" });

    const request = await BranchFundRequest.create({
      branch_id: emp.branch_id,
      amount,
      reason,
      status: "pending",
      transaction_id: null,
      created_by: req.user.id,
    });

    return res.status(201).json({ success: true, data: request });
  } catch (err) {
    console.error("Create Fund Request Error:", err);
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
}

// Get branch manager's fund requests
async function getMyFundRequests(req, res) {
  try {
    const emp = await Employee.findOne({ where: { user_id: req.user.id }, raw: true });
    if (!emp) return res.status(404).json({ success: false, message: "Employee not found" });

    const requests = await BranchFundRequest.findAll({
      where: { branch_id: emp.branch_id },
      include: [{ model: Branch, attributes: ["id", "name"] }],
      order: [["id", "DESC"]],
    });

    return res.json({ success: true, data: requests });
  } catch (err) {
    console.error("Get My Fund Requests Error:", err);
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
}

// Get all fund requests (company/head)
async function getAllFundRequests(req, res) {
  try {
    const companyId = await getCompanyId(req);
    if (!companyId) return res.status(403).json({ success: false, message: "Unauthorized" });

    const requests = await BranchFundRequest.findAll({
      include: [{ model: Branch, attributes: ["id", "name"] }],
      order: [["id", "DESC"]],
    });

    return res.json({ success: true, data: requests });
  } catch (err) {
    console.error("Get All Fund Requests Error:", err);
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
}

// Process fund request (approve or reject)
// async function processFundRequest(req, res) {
//   try {
//     const { id } = req.params;
//     const { transaction_id, status } = req.body;

//     if (!transaction_id && status !== "rejected") {
//       return res.status(400).json({ 
//         success: false, 
//         message: "Provide either transaction_id to approve or status: 'rejected'" 
//       });
//     }

//     const request = await BranchFundRequest.findByPk(id);
//     if (!request) return res.status(404).json({ success: false, message: "Request not found" });

//     if (request.status !== "pending") {
//       return res.status(400).json({ success: false, message: "Request already processed" });
//     }

//     // Reject
//     if (status === "rejected") {
//       await request.update({ status: "rejected" });
//       return res.json({ success: true, message: "Request rejected successfully", data: request });
//     }

//     // Approve
//     if (transaction_id) {
//       await request.update({ transaction_id, status: "paid" });

//       const lastWallet = await BranchWallet.findOne({
//         where: { branch_id: request.branch_id },
//         order: [["created_at", "DESC"]],
//       });

//       const lastBalance = lastWallet ? parseFloat(lastWallet.balance_after) : 0;
//       const newBalance = lastBalance + parseFloat(request.amount);

//       const walletTx = await BranchWallet.create({
//         branch_id: request.branch_id,
//         name: "Fund Request Approval",
//         transaction_type: "credit",
//         amount: request.amount,
//         description: "Fund approved by company/head",
//         balance_after: newBalance,
//         created_by: req.user.id,
//       });

//       return res.json({ success: true, message: "Request approved successfully", data: { request, walletTx } });
//     }
//   } catch (err) {
//     console.error("Process Fund Request Error:", err);
//     return res.status(500).json({ success: false, message: "Server error", error: err.message });
//   }
// }


// async function processFundRequest(req, res) {
//   try {
//     const { id } = req.params;
//     const { transaction_id, status } = req.body;

//     const request = await BranchFundRequest.findByPk(id);
//     if (!request) return res.status(404).json({ success: false, message: "Request not found" });

//     // ✅ Step 1: Handle "RECEIVED" first before validation
//     if (status === "received") {
//       if (request.status !== "paid") {
//         return res.status(400).json({
//           success: false,
//           message: "Only 'paid' requests can be marked as received",
//         });
//       }

//       await request.update({ status: "received" });
//       return res.json({ success: true, message: "Fund marked as received", data: request });
//     }

//     // ✅ Step 2: Validate input for approve/reject
//     if (!transaction_id && status !== "rejected") {
//       return res.status(400).json({ 
//         success: false, 
//         message: "Provide either transaction_id to approve, or status: 'rejected' or 'received'" 
//       });
//     }

//     // ✅ Step 3: Prevent re-processing
//     if (request.status !== "pending") {
//       return res.status(400).json({ success: false, message: "Request already processed" });
//     }

//     // ✅ Step 4: Reject
//     if (status === "rejected") {
//       await request.update({ status: "rejected" });
//       return res.json({ success: true, message: "Request rejected successfully", data: request });
//     }

//     // ✅ Step 5: Approve
//     if (transaction_id) {
//       await request.update({ transaction_id, status: "paid" });

//       const lastWallet = await BranchWallet.findOne({
//         where: { branch_id: request.branch_id },
//         order: [["created_at", "DESC"]],
//       });

//       const lastBalance = lastWallet ? parseFloat(lastWallet.balance_after) : 0;
//       const newBalance = lastBalance + parseFloat(request.amount);

//       const walletTx = await BranchWallet.create({
//         branch_id: request.branch_id,
//         name: "Fund Request Approval",
//         transaction_type: "credit",
//         amount: request.amount,
//         description: "Fund approved by company/head",
//         balance_after: newBalance,
//         created_by: req.user.id,
//       });

//       return res.json({
//         success: true,
//         message: "Request approved successfully",
//         data: { request, walletTx },
//       });
//     }

//   } catch (err) {
//     console.error("Process Fund Request Error:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Server error",
//       error: err.message,
//     });
//   }
// }



async function processFundRequest(req, res) {
  try {
    const { id } = req.params;
    const { transaction_id, status, paidAmount } = req.body;

    const request = await BranchFundRequest.findByPk(id);
    if (!request)
      return res
        .status(404)
        .json({ success: false, message: "Request not found" });

    // ============= 1️⃣ Mark as Received =============
    if (status === "received") {
      if (request.status !== "paid") {
        return res.status(400).json({
          success: false,
          message: "Only 'paid' requests can be marked as received",
        });
      }

      await request.update({ status: "received" });
      return res.json({
        success: true,
        message: "Fund marked as received successfully",
        data: request,
      });
    }

    // ============= 2️⃣ Reject Request =============
    if (status === "rejected") {
      await request.update({ status: "rejected" });
      return res.json({
        success: true,
        message: "Request rejected successfully",
        data: request,
      });
    }

    // ============= 3️⃣ Validation for Approval =============
    if (!transaction_id) {
      return res.status(400).json({
        success: false,
        message: "Transaction ID is required for approval",
      });
    }

    if (request.status !== "pending") {
      return res
        .status(400)
        .json({ success: false, message: "Request already processed" });
    }

    // ============= 4️⃣ Approve Request (Full / Partial) =============
    const totalRequested = parseFloat(request.amount);
    const approveAmount = paidAmount ? parseFloat(paidAmount) : totalRequested;

    if (approveAmount > totalRequested) {
      return res.status(400).json({
        success: false,
        message: "Paid amount cannot exceed requested amount",
      });
    }

    const remaining = totalRequested - approveAmount;

    // ✅ Update current request with paid & remaining amounts
    await request.update({
      transaction_id,
      status: "paid",
      paidAmount: approveAmount,
      remainingAmount: remaining,
    });

    // ✅ Create new pending request if partial payment
    let remainingRequest = null;
    if (remaining > 0) {
      remainingRequest = await BranchFundRequest.create({
        branch_id: request.branch_id,
        amount: remaining,
        paidAmount: 0,
        remainingAmount: 0,
        reason: request.reason,
        status: "pending",
        created_by: req.user.id,
      });
    }

    // ✅ Update Branch Wallet
    const lastWallet = await BranchWallet.findOne({
      where: { branch_id: request.branch_id },
      order: [["created_at", "DESC"]],
    });

    const lastBalance = lastWallet ? parseFloat(lastWallet.balance_after) : 0;
    const newBalance = lastBalance + approveAmount;

    const walletTx = await BranchWallet.create({
      branch_id: request.branch_id,
      name: "Fund Request Approval",
      transaction_type: "credit",
      amount: approveAmount,
      description: "Fund approved by company/head",
      balance_after: newBalance,
      created_by: req.user.id,
    });

    // ✅ Final Response
    return res.json({
      success: true,
      message: "Request approved successfully",
      data: {
        requestId: request.id,
        branch_id: request.branch_id,
        reason: request.reason,
        transaction_id,
        status: "paid",
        requestedAmount: totalRequested,
        paidAmount: approveAmount,
        remainingAmount: remaining,
        walletTx,
        remainingRequest,
      },
    });
  } catch (err) {
    console.error("Process Fund Request Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
}

// ✅ Export all controllers as an object
module.exports = {
  createFundRequest,
  getMyFundRequests,
  getAllFundRequests,
  processFundRequest
};




// const { Op } = require("sequelize");
// const BranchFundRequest = require("../models/branch_fund_requests.model");
// const BranchWallet = require("../models/branchWallet.model");
// const Employee = require("../models/employee.model");
// const Branch = require("../models/branch.model");
// const User = require("../models/user.model");

// // -------------------- Helpers --------------------
// async function getCompanyId(req) {
//   if (!req.user) return null;
//   const type = (req.user.type || "").toLowerCase();

//   if (type === "company") return req.user.id;
//   if (type === "accountant") return req.user.company_id || req.user.id;

//   try {
//     const emp = await Employee.findOne({
//       where: { user_id: req.user.id },
//       attributes: ["created_by"],
//       raw: true,
//     });
//     if (emp?.created_by) return emp.created_by;
//   } catch (err) {
//     console.error("getCompanyId Employee lookup failed:", err.message);
//   }

//   return req.user.id;
// }

// async function getAllUserIdsUnderCompany(companyId) {
//   const users = await User.findAll({
//     where: { created_by: companyId },
//     attributes: ["id"],
//     raw: true,
//   });
//   const ids = users.map((u) => u.id);
//   ids.push(companyId);
//   return ids;
// }

// // -------------------- Controllers --------------------

// // Branch Manager creates a fund request
// async function createFundRequest(req, res) {
//   try {
//     const { amount, reason } = req.body;
//     if (!amount) return res.status(400).json({ success: false, message: "Amount is required" });

//     const emp = await Employee.findOne({ where: { user_id: req.user.id }, raw: true });
//     if (!emp) return res.status(404).json({ success: false, message: "Employee not found" });

//     const request = await BranchFundRequest.create({
//       branch_id: emp.branch_id,
//       amount,
//       reason,
//       status: "pending",
//       transaction_id: null,
//       created_by: req.user.id,
//     });

//     return res.status(201).json({ success: true, data: request });
//   } catch (err) {
//     console.error("Create Fund Request Error:", err);
//     return res.status(500).json({ success: false, message: "Server error", error: err.message });
//   }
// }

// // Branch Manager / Employee → view their branch requests
// async function getMyFundRequests(req, res) {
//   try {
//     const emp = await Employee.findOne({ where: { user_id: req.user.id }, raw: true });
//     if (!emp) return res.status(404).json({ success: false, message: "Employee not found" });

//     const requests = await BranchFundRequest.findAll({
//       where: { branch_id: emp.branch_id },
//       include: [{ model: Branch, attributes: ["id", "name"] }],
//       order: [["id", "DESC"]],
//     });

//     return res.json({ success: true, data: requests });
//   } catch (err) {
//     console.error("Get My Fund Requests Error:", err);
//     return res.status(500).json({ success: false, message: "Server error", error: err.message });
//   }
// }

// // Company / Super Admin → view all requests under their scope
// async function getAllFundRequests(req, res) {
//   try {
//     const companyId = await getCompanyId(req);
//     if (!companyId) return res.status(403).json({ success: false, message: "Unauthorized" });

//     const userType = (req.user?.type || "").toLowerCase();
//     let where = {};

//     if (userType === "super admin") {
//       where = {};
//     } else if (userType === "company" || userType === "accountant") {
//       const allCompanyUserIds = await getAllUserIdsUnderCompany(companyId);
//       where = { created_by: { [Op.in]: allCompanyUserIds } };
//     } else if (userType === "branch manager" || userType === "employee") {
//       const emp = await Employee.findOne({
//         where: { user_id: req.user.id },
//         attributes: ["branch_id"],
//         raw: true,
//       });
//       if (!emp) return res.status(404).json({ success: false, message: "Employee record not found" });
//       where = { branch_id: emp.branch_id };
//     } else {
//       where = { created_by: req.user.id };
//     }

//     const requests = await BranchFundRequest.findAll({
//       where,
//       include: [{ model: Branch, attributes: ["id", "name"] }],
//       order: [["id", "DESC"]],
//     });

//     return res.json({ success: true, data: requests });
//   } catch (err) {
//     console.error("Get All Fund Requests Error:", err);
//     return res.status(500).json({ success: false, message: "Server error", error: err.message });
//   }
// }

// // Approve or Reject request
// async function processFundRequest(req, res) {
//   try {
//     const { id } = req.params;
//     const { transaction_id, status } = req.body;

//     const request = await BranchFundRequest.findByPk(id, {
//       include: [{ model: Branch, attributes: ["id", "company_id"] }],
//     });
//     if (!request) return res.status(404).json({ success: false, message: "Request not found" });

//     if (request.status !== "pending") {
//       return res.status(400).json({ success: false, message: "Request already processed" });
//     }

//     const userType = (req.user?.type || "").toLowerCase();
//     const companyId = await getCompanyId(req);

//     // Role-based permission check
//     if (userType === "company" || userType === "accountant") {
//       if (request.Branch.company_id !== companyId) {
//         return res.status(403).json({ success: false, message: "Cannot process requests outside your company" });
//       }
//     } else if (userType === "branch manager" || userType === "employee") {
//       return res.status(403).json({ success: false, message: "You are not allowed to approve/reject requests" });
//     }

//     // Reject
//     if (status === "rejected") {
//       await request.update({ status: "rejected" });
//       return res.json({ success: true, message: "Request rejected successfully", data: request });
//     }

//     // Approve
//     if (transaction_id) {
//       await request.update({ transaction_id, status: "paid" });

//       const lastWallet = await BranchWallet.findOne({
//         where: { branch_id: request.branch_id },
//         order: [["created_at", "DESC"]],
//       });

//       const lastBalance = lastWallet ? parseFloat(lastWallet.balance_after) : 0;
//       const newBalance = lastBalance + parseFloat(request.amount);

//       const walletTx = await BranchWallet.create({
//         branch_id: request.branch_id,
//         name: "Fund Request Approval",
//         transaction_type: "credit",
//         amount: request.amount,
//         description: "Fund approved by company/head",
//         balance_after: newBalance,
//         created_by: req.user.id,
//       });

//       return res.json({ success: true, message: "Request approved successfully", data: { request, walletTx } });
//     }

//     return res.status(400).json({ success: false, message: "Provide transaction_id or status: rejected" });
//   } catch (err) {
//     console.error("Process Fund Request Error:", err);
//     return res.status(500).json({ success: false, message: "Server error", error: err.message });
//   }
// }

// // ✅ Export
// module.exports = {
//   createFundRequest,
//   getMyFundRequests,
//   getAllFundRequests,
//   processFundRequest,
// };
