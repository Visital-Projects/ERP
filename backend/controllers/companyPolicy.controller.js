
// // controllers/companyPolicy.controller.js
// const path = require("path");
// const CompanyPolicy = require("../models/companyPolicy.model");
// const Employee = require("../models/employee.model");
// const Branch = require("../models/branch.model");

// // =====================
// // Helper: format policy response
// // =====================
// const formatPolicyResponse = async (policy) => {
//   if (!policy) return null;
//   const json = policy.toJSON();
//   return {
//     id: json.id,
//     branch: json.branch,
//     title: json.title,
//     description: json.description,
//     attachment: json.attachment,
//     created_by: json.created_by,
//     created_at: json.created_at,
//     updated_at: json.updated_at
//   };
// };

// // =====================
// // GET ALL POLICIES
// // =====================
// exports.getAll = async (req, res) => {
//   try {
//     let whereClause = {};

//     if (req.user.type === "company") {
//       whereClause.created_by = req.user.id;
//     } else if (req.user.type === "Employee") {
//       const emp = await Employee.findOne({ where: { user_id: req.user.id } });
//       if (!emp) return res.status(403).json({ message: "Employee profile not found" });
//       whereClause = { created_by: emp.created_by, branch: emp.branch_id };
//     } else {
//       const emp = await Employee.findOne({ where: { user_id: req.user.id } });
//       if (emp) whereClause.created_by = emp.created_by;
//     }

//     const policies = await CompanyPolicy.findAll({ where: whereClause, order: [["id", "DESC"]] });
//     const responseData = await Promise.all(policies.map(p => formatPolicyResponse(p)));

//     res.json({ success: true, data: responseData });
//   } catch (err) {
//     console.error("Get All Policies Error:", err);
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

// // =====================
// // GET POLICY BY ID
// // =====================
// exports.getById = async (req, res) => {
//   try {
//     const { id } = req.params;
//     let whereClause = { id };

//     if (req.user.type === "company") {
//       whereClause.created_by = req.user.id;
//     } else if (req.user.type === "Employee") {
//       const emp = await Employee.findOne({ where: { user_id: req.user.id } });
//       if (!emp) return res.status(403).json({ message: "Employee profile not found" });
//       whereClause = { id, created_by: emp.created_by, branch: emp.branch_id };
//     } else {
//       const emp = await Employee.findOne({ where: { user_id: req.user.id } });
//       if (emp) whereClause.created_by = emp.created_by;
//     }

//     const policy = await CompanyPolicy.findOne({ where: whereClause });
//     if (!policy) return res.status(404).json({ message: "Policy not found" });

//     res.json({ success: true, data: await formatPolicyResponse(policy) });
//   } catch (err) {
//     console.error("Get Policy By ID Error:", err);
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

// // =====================
// // CREATE POLICY
// // =====================
// exports.create = async (req, res) => {
//   try {
//     const data = req.body;
//     let companyId;

//     if (req.user.type === "company") {
//       companyId = req.user.id;
//     } else {
//       const emp = await Employee.findOne({ where: { user_id: req.user.id } });
//       if (!emp) return res.status(403).json({ message: "Employee profile not found" });
//       companyId = emp.created_by;
//     }

//     // 🔹 Validate branch belongs to company
//     if (data.branch) {
//       const branch = await Branch.findOne({ where: { id: data.branch, created_by: companyId } });
//       if (!branch) return res.status(400).json({ message: "Invalid branch for this company" });
//     }

//     const attachment = req.file ? req.file.filename : null;

//     const policy = await CompanyPolicy.create({
//       branch: data.branch,
//       title: data.title,
//       description: data.description,
//       attachment,
//       created_by: companyId,
//       created_at: new Date(),
//       updated_at: new Date(),
//     });

//     res.status(201).json({ success: true, message: "Policy created successfully", data: await formatPolicyResponse(policy) });
//   } catch (err) {
//     console.error("Create Policy Error:", err);
//     res.status(500).json({ message: "Error creating policy", error: err.message });
//   }
// };

// // =====================
// // UPDATE POLICY
// // =====================
// exports.update = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const data = req.body;
//     let whereClause = { id };

//     if (req.user.type === "company") {
//       whereClause.created_by = req.user.id;
//     } else if (req.user.type === "Employee") {
//       const emp = await Employee.findOne({ where: { user_id: req.user.id } });
//       if (!emp) return res.status(403).json({ message: "Employee profile not found" });
//       whereClause = { id, created_by: emp.created_by, branch: emp.branch_id };
//     } else {
//       const emp = await Employee.findOne({ where: { user_id: req.user.id } });
//       if (!emp) return res.status(403).json({ message: "Employee profile not found" });
//       whereClause.created_by = emp.created_by;
//     }

//     const policy = await CompanyPolicy.findOne({ where: whereClause });
//     if (!policy) return res.status(404).json({ message: "Policy not found" });

//     // 🔹 Validate branch if updating
//     if (data.branch) {
//       const branch = await Branch.findOne({ where: { id: data.branch, created_by: policy.created_by } });
//       if (!branch) return res.status(400).json({ message: "Invalid branch for this company" });
//     }

//     let attachment = policy.attachment;
//     if (req.file) {
//       attachment = req.file.filename;
//     }

//     await policy.update({
//       branch: data.branch || policy.branch,
//       title: data.title || policy.title,
//       description: data.description || policy.description,
//       attachment,
//       updated_at: new Date(),
//     });

//     res.json({ success: true, message: "Policy updated successfully", data: await formatPolicyResponse(policy) });
//   } catch (err) {
//     console.error("Update Policy Error:", err);
//     res.status(500).json({ message: "Error updating policy", error: err.message });
//   }
// };

// // =====================
// // DELETE POLICY
// // =====================
// exports.delete = async (req, res) => {
//   try {
//     const { id } = req.params;
//     let whereClause = { id };

//     if (req.user.type === "company") {
//       whereClause.created_by = req.user.id;
//     } else if (req.user.type === "Employee") {
//       const emp = await Employee.findOne({ where: { user_id: req.user.id } });
//       if (!emp) return res.status(403).json({ message: "Employee profile not found" });
//       whereClause = { id, created_by: emp.created_by, branch: emp.branch_id };
//     } else {
//       const emp = await Employee.findOne({ where: { user_id: req.user.id } });
//       if (!emp) return res.status(403).json({ message: "Employee profile not found" });
//       whereClause.created_by = emp.created_by;
//     }

//     const policy = await CompanyPolicy.findOne({ where: whereClause });
//     if (!policy) return res.status(404).json({ message: "Policy not found" });

//     await policy.destroy();
//     res.json({ success: true, message: "Policy deleted successfully", data: { id } });
//   } catch (err) {
//     console.error("Delete Policy Error:", err);
//     res.status(500).json({ message: "Error deleting policy", error: err.message });
//   }
// };




// controllers/companyPolicy.controller.js
const path = require("path");
const { Op } = require('sequelize');
const CompanyPolicy = require("../models/companyPolicy.model");
const Employee = require("../models/employee.model");
const Branch = require("../models/branch.model");
const User = require("../models/user.model");

// =====================
// 🔹 Helpers
// =====================
async function getCompanyId(req) {
  try {
    if (!req.user) return null;
    
    // 🟢 Pehle check karo user khud company hai ya nahi
    const type = (req.user.type || '').toLowerCase();
    if (['company', 'admin', 'super admin'].includes(type)) {
      return req.user.id;
    }

    // 🟢 Agar employee hai (employees table mein entry hai)
    const emp = await Employee.findOne({
      where: { user_id: req.user.id },
      attributes: ['created_by'],
      raw: true,
    });
    if (emp?.created_by) return Number(emp.created_by);
    
    // 🟢 FIX: Branchless users (jaise accountant) ke liye users table se created_by lekar aao
    const userRecord = await User.findOne({
      where: { id: req.user.id },
      attributes: ['created_by'],
      raw: true,
    });
    
    console.log('🔍 User Record created_by:', userRecord?.created_by);
    return Number(userRecord?.created_by) || null;
    
  } catch (err) {
    console.error('getCompanyId Error:', err);
    return null;
  }
}

function isSuper(req) {
  return (req.user?.roles || []).some(r => (r.name || '').toLowerCase() === 'super admin');
}
function isCompany(req) {
  return (req.user?.type || '').toLowerCase() === 'company';
}
function isEmployee(req) {
  return (req.user?.type || '').toLowerCase() === 'employee';
}

async function getUserBranchId(userId) {
  if (!userId) return null;
  const emp = await Employee.findOne({
    where: { user_id: userId },
    attributes: ['branch_id'],
    raw: true,
  });
  return emp?.branch_id || null;
}

async function getAllUserIdsUnderCompanyBranch(companyId, branchId = null) {
  if (!companyId) return [];

  const users = await User.findAll({
    where: { created_by: companyId },
    attributes: ['id'],
    raw: true,
  });
  const userIds = users.map(u => Number(u.id));
  const baseSet = new Set([Number(companyId), ...userIds]);

  if (branchId) {
    if (userIds.length === 0) return [Number(companyId)];
    const emps = await Employee.findAll({
      where: {
        user_id: { [Op.in]: userIds },
        branch_id: branchId,
      },
      attributes: ['user_id'],
      raw: true
    });
    const branchUserIds = emps.map(e => Number(e.user_id));
    return [...new Set([Number(companyId), ...branchUserIds])];
  }

  return Array.from(baseSet);
}

// =====================
// 🔹 Format Policy Response
// =====================
const formatPolicyResponse = async (policy) => {
  if (!policy) return null;
  const json = policy.toJSON ? policy.toJSON() : policy;

  // Get branch details
  let branch = null;
  if (json.branch) {
    const b = await Branch.findByPk(json.branch, { raw: true });
    if (b) branch = { id: b.id, name: b.name };
  }

  return {
    id: json.id,
    branch: json.branch,
    branch_details: branch,
    title: json.title,
    description: json.description,
    attachment: json.attachment,
    created_by: json.created_by,
    created_at: json.created_at,
    updated_at: json.updated_at
  };
};

// =====================
// 🔹 CREATE POLICY
// =====================
exports.create = async (req, res) => {
  try {
    console.log('🎯 START createPolicy');
    console.log('🔍 User Info - ID:', req.user.id, 'Type:', req.user.type);
    
    const data = req.body;
    if (!data.title) {
      return res.status(400).json({ success: false, message: 'title is required' });
    }

    const companyId = await getCompanyId(req);
    if (!companyId && !isSuper(req)) return res.status(403).json({ success: false, message: 'Unauthorized' });

    // 🟢 Check if user exists in employees table (has branch)
    const userEmployeeRecord = await Employee.findOne({
      where: { user_id: req.user.id },
      attributes: ['branch_id', 'created_by'],
      raw: true,
    });

    console.log('🔍 User Employee Record:', userEmployeeRecord);

    let userBranchId = null;

    if (userEmployeeRecord && userEmployeeRecord.branch_id) {
      // 🟢 CASE 1: User has employee record with branch → branch-level access
      console.log('🟡 Branch User - Creating policy');
      userBranchId = userEmployeeRecord.branch_id;
    } else {
      // 🟢 CASE 2: User doesn't have employee record (no branch) → company-wide access
      console.log('🟡 Branchless User - Creating policy');
      // No branch restriction for branchless users
    }

    // 🟢 FIX: Only require branch for branch users, not branchless users
    if (!isCompany(req) && !isSuper(req) && userEmployeeRecord && !userBranchId && !isEmployee(req)) {
      return res.status(403).json({ success: false, message: 'No branch assigned' });
    }

    // Determine allowed creators within company/branch
    const allowedCreatedBy = await getAllUserIdsUnderCompanyBranch(companyId, isCompany(req) ? null : userBranchId);

    // 🔹 Validate branch belongs to the company
    if (data.branch) {
      const branchRecord = await Branch.findOne({
        where: { id: data.branch, deleted_at: null }
      });
      if (!branchRecord) {
        return res.status(400).json({ success: false, message: 'Invalid branch' });
      }
      
      // Ensure branch belongs to user's scope
      if (!isSuper(req) && !allowedCreatedBy.map(String).includes(String(branchRecord.created_by))) {
        return res.status(403).json({ success: false, message: 'Branch not in your company/branch scope' });
      }
    }

    const attachment = req.file ? req.file.filename : null;

    // Create policy
    const policy = await CompanyPolicy.create({
      branch: data.branch || null,
      title: data.title,
      description: data.description || null,
      attachment,
      created_by: req.user.id,
      created_at: new Date(),
      updated_at: new Date(),
    });

    const responseData = await formatPolicyResponse(policy);
    console.log('✅ Policy created successfully');
    return res.status(201).json({ success: true, message: "Policy created successfully", data: responseData });
  } catch (err) {
    console.error('❌ Create Policy Error:', err);
    return res.status(500).json({ success: false, message: "Error creating policy", error: err.message });
  }
};

// =====================
// 🔹 GET ALL POLICIES
// =====================
// =====================
// 🔹 GET ALL POLICIES (FIXED)
// =====================
exports.getAll = async (req, res) => {
  try {
    console.log('🎯 START getAllPolicies');
    console.log('🔍 User Info - ID:', req.user.id, 'Type:', req.user.type);

    // 🟢 SUPER ADMIN: Full access
    if (isSuper(req)) {
      console.log('🟡 Super Admin Access');
      const policies = await CompanyPolicy.findAll({
        where: { deleted_at: null },
        order: [["id", "DESC"]]
      });
      console.log('🟡 Super Admin Policies Count:', policies.length);
      const data = await Promise.all(policies.map(p => formatPolicyResponse(p)));
      return res.json({ success: true, data });
    }

    // 🟢 Check if user exists in employees table (has branch)
    const userEmployeeRecord = await Employee.findOne({
      where: { user_id: req.user.id },
      attributes: ['branch_id', 'created_by'],
      raw: true,
    });

    console.log('🔍 User Employee Record:', userEmployeeRecord);

    let policies = [];

    if (userEmployeeRecord && userEmployeeRecord.branch_id) {
      // 🟢 CASE 1: User has employee record with branch → BRANCH-LEVEL ACCESS ONLY
      console.log('🟡 Branch User Access');
      const branchId = userEmployeeRecord.branch_id;
      console.log('🔍 Branch ID:', branchId);
      
      // Get company ID for branch users
      const companyId = await getCompanyId(req);
      console.log('🔍 Company ID for Branch User:', companyId);
      
      if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

      // 🟢 FIXED: Get ALL user IDs under the company (including branchless users)
      const allCompanyUserIds = await getAllUserIdsUnderCompanyBranch(companyId, null);
      
      // 🟢 FIXED: Only get policies that are accessible to branch users
      policies = await CompanyPolicy.findAll({
        where: {
          deleted_at: null,
          [Op.or]: [
            // 🟢 Policies specifically targeted to user's branch
            { branch: branchId },
            // 🟢 Company-wide policies (no branch specified) - BUT only if created by company users
            { 
              branch: null,
              created_by: { [Op.in]: allCompanyUserIds }
            }
          ]
        },
        order: [["id", "DESC"]]
      });

      console.log('🔍 Branch User Policies Count:', policies.length);

    } else {
      // 🟢 CASE 2: User doesn't have employee record (no branch) → FULL COMPANY ACCESS
      console.log('🟡 Branchless User Access (FULL COMPANY ACCESS)');
      
      const companyId = await getCompanyId(req);
      if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

      // 🟢 FIXED: Get all user IDs under the company
      const allCompanyUserIds = await getAllUserIdsUnderCompanyBranch(companyId, null);
      
      // 🟢 FIXED: Branchless users can see all policies within their company
      policies = await CompanyPolicy.findAll({
        where: {
          deleted_at: null,
          created_by: { [Op.in]: allCompanyUserIds }
        },
        order: [["id", "DESC"]]
      });
      
      console.log('🔍 Branchless User - Company Policies Count:', policies.length);
    }

    console.log('🔍 Final Policies Count:', policies.length);
    const data = await Promise.all(policies.map(p => formatPolicyResponse(p)));
    console.log('✅ END getAllPolicies - Success');
    return res.json({ success: true, data });

  } catch (err) {
    console.error('❌ Get All Policies Error:', err);
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

// =====================
// 🔹 GET POLICY BY ID
// =====================
// =====================
// 🔹 GET POLICY BY ID (FIXED)
// =====================
exports.getById = async (req, res) => {
  try {
    console.log('🎯 START getPolicyById');
    console.log('🔍 User Info - ID:', req.user.id, 'Type:', req.user.type);
    
    const { id } = req.params;
    
    const policy = await CompanyPolicy.findOne({
      where: { id: id, deleted_at: null },
    });

    if (!policy) {
      return res.status(404).json({ success: false, message: "Policy not found" });
    }

    // 🟢 Super Admin → full access
    if (isSuper(req)) {
      const data = await formatPolicyResponse(policy);
      return res.json({ success: true, data });
    }

    // 🟢 Check if user exists in employees table (has branch)
    const userEmployeeRecord = await Employee.findOne({
      where: { user_id: req.user.id },
      attributes: ['branch_id', 'created_by'],
      raw: true,
    });

    console.log('🔍 User Employee Record:', userEmployeeRecord);

    const companyId = await getCompanyId(req);
    if (!companyId) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    // 🟢 Get all user IDs under the company
    const allCompanyUserIds = await getAllUserIdsUnderCompanyBranch(companyId, null);

    if (userEmployeeRecord && userEmployeeRecord.branch_id) {
      // 🟢 CASE 1: User has employee record with branch → BRANCH-LEVEL ACCESS ONLY
      const branchId = userEmployeeRecord.branch_id;

      // 🟢 FIXED: Check if policy is accessible to branch user
      const isAccessible = 
        // Policy targeted to user's branch
        policy.branch === branchId ||
        // Company-wide policy (no branch specified) AND created by company user
        (policy.branch === null && allCompanyUserIds.map(String).includes(String(policy.created_by)));

      if (!isAccessible) {
        return res.status(403).json({ success: false, message: 'Forbidden: policy not accessible in your branch' });
      }

    } else {
      // 🟢 CASE 2: User doesn't have employee record (no branch) → COMPANY ACCESS ONLY
      console.log('🟡 Branchless User - Company policy access');
      
      // 🟢 FIXED: Check if policy belongs to the company
      if (!allCompanyUserIds.map(String).includes(String(policy.created_by))) {
        return res.status(403).json({ success: false, message: 'Forbidden: policy not in your company scope' });
      }
    }

    // ✅ Return formatted policy
    const data = await formatPolicyResponse(policy);
    console.log('✅ END getPolicyById - Success');
    return res.json({ success: true, data });

  } catch (err) {
    console.error('❌ Get Policy By ID Error:', err);
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};
// =====================
// 🔹 UPDATE POLICY
// =====================
exports.update = async (req, res) => {
  try {
    console.log('🎯 START updatePolicy');
    console.log('🔍 User Info - ID:', req.user.id, 'Type:', req.user.type);
    
    const { id } = req.params;
    const data = req.body;

    const companyId = await getCompanyId(req);
    if (!companyId && !isSuper(req))
      return res.status(403).json({ success: false, message: 'Unauthorized' });

    // 🟢 Check if user exists in employees table (has branch)
    const userEmployeeRecord = await Employee.findOne({
      where: { user_id: req.user.id },
      attributes: ['branch_id', 'created_by'],
      raw: true,
    });

    console.log('🔍 User Employee Record:', userEmployeeRecord);

    let userBranchId = null;

    if (userEmployeeRecord && userEmployeeRecord.branch_id) {
      // 🟢 CASE 1: User has employee record with branch → branch-level access
      console.log('🟡 Branch User - Updating policy');
      userBranchId = userEmployeeRecord.branch_id;
    } else {
      // 🟢 CASE 2: User doesn't have employee record (no branch) → company-wide access
      console.log('🟡 Branchless User - Updating policy');
      // No branch restriction for branchless users
    }

    const policy = await CompanyPolicy.findOne({
      where: { id: id, deleted_at: null },
    });
    if (!policy)
      return res.status(404).json({ success: false, message: "Policy not found" });

    // Determine allowed creators within company/branch
    const allowedUserIds = await getAllUserIdsUnderCompanyBranch(companyId, isCompany(req) ? null : userBranchId);

    // 🟢 Access validation
    if (!isSuper(req)) {
      if (!allowedUserIds.map(String).includes(String(policy.created_by))) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: not your branch/company record',
        });
      }
    }

    // 🔹 Validate branch belongs to the company (if branch is being updated)
    if (data.branch && data.branch !== policy.branch) {
      const branchRecord = await Branch.findOne({
        where: { id: data.branch, deleted_at: null }
      });
      if (!branchRecord) {
        return res.status(400).json({ success: false, message: 'Invalid branch' });
      }
      
      // Ensure branch belongs to user's scope
      if (!isSuper(req) && !allowedUserIds.map(String).includes(String(branchRecord.created_by))) {
        return res.status(403).json({ success: false, message: 'Branch not in your company/branch scope' });
      }
    }

    let attachment = policy.attachment;
    if (req.file) {
      attachment = req.file.filename;
    }

    // 🟢 Perform update
    await policy.update({
      branch: data.branch ?? policy.branch,
      title: data.title ?? policy.title,
      description: data.description ?? policy.description,
      attachment: attachment,
      updated_at: new Date(),
    });

    const responseData = await formatPolicyResponse(policy);
    console.log('✅ Policy updated successfully');
    return res.json({ success: true, message: "Policy updated successfully", data: responseData });
  } catch (err) {
    console.error('❌ Update Policy Error:', err);
    return res.status(500).json({ success: false, message: "Error updating policy", error: err.message });
  }
};

// =====================
// 🔹 DELETE POLICY (soft delete)
// =====================
exports.delete = async (req, res) => {
  try {
    console.log('🎯 START deletePolicy');
    console.log('🔍 User Info - ID:', req.user.id, 'Type:', req.user.type);
    
    const { id } = req.params;

    const companyId = await getCompanyId(req);
    if (!companyId && !isSuper(req))
      return res.status(403).json({ success: false, message: 'Unauthorized' });

    // 🟢 Check if user exists in employees table (has branch)
    const userEmployeeRecord = await Employee.findOne({
      where: { user_id: req.user.id },
      attributes: ['branch_id', 'created_by'],
      raw: true,
    });

    console.log('🔍 User Employee Record:', userEmployeeRecord);

    let branchId = null;

    if (userEmployeeRecord && userEmployeeRecord.branch_id) {
      // 🟢 CASE 1: User has employee record with branch → branch-level access
      branchId = userEmployeeRecord.branch_id;
    } else {
      // 🟢 CASE 2: User doesn't have employee record (no branch) → company-wide access
      console.log('🟡 Branchless User - Deleting policy');
    }

    const policy = await CompanyPolicy.findOne({
      where: { id: id, deleted_at: null },
    });
    if (!policy)
      return res.status(404).json({ success: false, message: "Policy not found" });

    const allowedUserIds = await getAllUserIdsUnderCompanyBranch(
      companyId,
      isCompany(req) ? null : branchId
    );

    // 🟢 Access validation
    if (!isSuper(req)) {
      if (!allowedUserIds.map(String).includes(String(policy.created_by))) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: not your branch/company record',
        });
      }
    }

    await policy.destroy();
    console.log('✅ Policy deleted successfully');
    return res.json({ success: true, message: "Policy deleted successfully", data: { id } });
  } catch (err) {
    console.error('❌ Delete Policy Error:', err);
    return res.status(500).json({ success: false, message: "Error deleting policy", error: err.message });
  }
};