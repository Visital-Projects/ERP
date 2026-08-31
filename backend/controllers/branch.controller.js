

// const Branch = require('../models/branch.model');
// const Employee = require('../models/employee.model');
// const User = require('../models/user.model');
// const { Op } = require('sequelize');


// async function getCompanyId(req) {
//   try {
//     if (!req.user) return null;
    
//     // 🟢 Pehle check karo user khud company hai ya nahi
//     const type = (req.user.type || '').toLowerCase();
//     if (['company', 'admin', 'super admin'].includes(type)) {
//       return req.user.id;
//     }

//     // 🟢 Agar employee hai (employees table mein entry hai)
//     const emp = await Employee.findOne({
//       where: { user_id: req.user.id },
//       attributes: ['created_by'],
//       raw: true,
//     });
//     if (emp?.created_by) return Number(emp.created_by);
    
//     // 🟢 FIX: Branchless users (jaise accountant) ke liye users table se created_by lekar aao
//     const userRecord = await User.findOne({
//       where: { id: req.user.id },
//       attributes: ['created_by'],
//       raw: true,
//     });
    
//     console.log('🔍 User Record created_by:', userRecord?.created_by);
//     return Number(userRecord?.created_by) || null;
    
//   } catch (err) {
//     console.error('getCompanyId Error:', err);
//     return null;
//   }
// }

// function isSuper(req) {
//   return (req.user?.roles || []).some(r => (r.name || '').toLowerCase() === 'super admin');
// }
// function isCompany(req) { return (req.user?.type || '').toLowerCase() === 'company'; }
// function isEmployee(req) { return (req.user?.type || '').toLowerCase() === 'employee'; }

// function hasPermission(req, perm) {
//   if (!req.user) return false;
//   const type = (req.user.type || "").toLowerCase();

//   // system-level accounts
//   if (["company", "admin", "super admin"].includes(type)) return true;

//   // check user.permissions array
//   const perms = Array.isArray(req.user?.permissions) ? req.user.permissions : [];
//   return perms.some(p => (p?.toLowerCase?.() || "").trim() === perm.toLowerCase());
// }

// exports.getAllBranches = async (req, res) => {
//   try {
//     console.log('🎯 START getAllBranches');
//     console.log('🔍 User Info - ID:', req.user.id, 'Type:', req.user.type);

//     // 🟢 SUPER ADMIN: Full access
//     if (isSuper(req)) {
//       console.log('🟡 Super Admin Access');
//       const branches = await Branch.findAll({ 
//         order: [['id', 'DESC']] 
//       });
//       console.log('🟡 Super Admin Branches Count:', branches.length);
//       return res.json({ success: true, data: branches });
//     }

//     // 🟢 Check if user exists in employees table (has branch)
//     const userEmployeeRecord = await Employee.findOne({
//       where: { user_id: req.user.id },
//       attributes: ['branch_id', 'created_by'],
//       raw: true,
//     });

//     console.log('🔍 User Employee Record:', userEmployeeRecord);

//     let branches = [];

//     if (userEmployeeRecord && userEmployeeRecord.branch_id) {
//       // 🟢 CASE 1: User has employee record with branch → show only their branch
//       console.log('🟡 Branch User Access');
//       const branchId = userEmployeeRecord.branch_id;
//       console.log('🔍 Branch ID:', branchId);
      
//       // Get company ID for branch users
//       const companyId = await getCompanyId(req);
//       console.log('🔍 Company ID for Branch User:', companyId);
      
//       if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

//       // 🟢 Show only the branch where the user belongs (REGARDLESS of who created it)
//       branches = await Branch.findAll({
//         where: {
//           id: branchId
//           // 🟢 REMOVED: created_by: companyId - so branch users can see their branch even if created by accountant
//         },
//         order: [['id', 'DESC']],
//       });

//     } else {
//       // 🟢 CASE 2: User doesn't have employee record (no branch) → FULL DATABASE ACCESS
//       console.log('🟡 Branchless User Access (FULL DATABASE)');
      
//       // 🟢 Get company ID for branchless users
//       const companyId = await getCompanyId(req);
//       console.log('🔍 Company ID for Branchless User:', companyId);
      
//       if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

//       // 🟢 Show ALL branches created by the company AND branchless users
//       const allCompanyUsers = await User.findAll({
//         where: { created_by: companyId },
//         attributes: ['id'],
//         raw: true,
//       });
//       const companyUserIds = allCompanyUsers.map(u => Number(u.id));

//       branches = await Branch.findAll({
//         where: {
//           [Op.or]: [
//             { created_by: companyId },           // Company created branches
//             { created_by: { [Op.in]: companyUserIds } }  // Branchless users created branches
//           ]
//         },
//         order: [['id', 'DESC']],
//       });
      
//       console.log('🔍 Branchless User - All Branches Count:', branches.length);
//     }

//     console.log('🔍 Final Branches Count:', branches.length);
//     console.log('✅ END getAllBranches - Success');
//     return res.json({ success: true, data: branches });

//   } catch (error) {
//     console.error('❌ Get All Branches Error:', error);
//     return res.status(500).json({ success: false, message: 'Server error', error: error.message });
//   }
// };


// exports.createBranch = async (req, res) => {
//   try {
//     console.log('🎯 START createBranch');
//     console.log('🔍 User Info - ID:', req.user.id, 'Type:', req.user.type);
    
//     const { name, branch_address, contact_number, co_ordinates, clock_out } = req.body;

//     if (!name) return res.status(400).json({ success: false, message: "Branch name is required" });

//     // 🟢 SUPER ADMIN: Full access
//     if (isSuper(req)) {
//       console.log('🟡 Super Admin - Creating branch');
//       const branch = await Branch.create({
//         name,
//         created_by: req.user.id,
//         branch_address: branch_address || null,
//         contact_number: contact_number || null,
//         co_ordinates: co_ordinates || null,
//         clock_out: clock_out !== undefined ? Boolean(clock_out) : false
//       });
//       console.log('✅ Branch created successfully by Super Admin');
//       return res.status(201).json({ success: true, data: branch });
//     }

//     // 🟢 Check if user exists in employees table (has branch)
//     const userEmployeeRecord = await Employee.findOne({
//       where: { user_id: req.user.id },
//       attributes: ['branch_id', 'created_by'],
//       raw: true,
//     });

//     console.log('🔍 User Employee Record:', userEmployeeRecord);

//     let companyId;
//     let canCreate = false;

//     if (userEmployeeRecord && userEmployeeRecord.branch_id) {
//       // 🟢 CASE 1: User has employee record with branch → check permissions
//       console.log('🟡 Branch User - Checking creation permissions');
//       companyId = await getCompanyId(req);
//       if (!companyId) return res.status(403).json({ success: false, message: "Unauthorized" });
      
//       // Check if user has permission to create branch
//       if (hasPermission(req, "create branch")) {
//         canCreate = true;
//       }
//     } else {
//       // 🟢 CASE 2: User doesn't have employee record (no branch) → FULL ACCESS
//       console.log('🟡 Branchless User - Creating branch');
//       companyId = await getCompanyId(req);
//       if (!companyId) return res.status(403).json({ success: false, message: "Unauthorized" });
      
//       // Check if user has permission to create branch
//       if (hasPermission(req, "create branch")) {
//         canCreate = true;
//       }
//     }

//     if (!canCreate) {
//       return res.status(403).json({ success: false, message: "No permission to create branch" });
//     }

//     // Create the branch
//     const branch = await Branch.create({
//       name,
//       created_by: companyId,
//       branch_address: branch_address || null,
//       contact_number: contact_number || null,
//       co_ordinates: co_ordinates || null,
//       clock_out: clock_out !== undefined ? Boolean(clock_out) : false

//     });

//     console.log('✅ Branch created successfully');
//     return res.status(201).json({ success: true, data: branch });
//   } catch (error) {
//     console.error('❌ Create Branch Error:', error);
//     return res.status(500).json({ success: false, message: "Server error", error: error.message });
//   }
// };

// exports.updateBranch = async (req, res) => {
//   try {
//     console.log('🎯 START updateBranch');
//     console.log('🔍 User Info - ID:', req.user.id, 'Type:', req.user.type);
    
//     const { name, branch_address, contact_number, co_ordinates, clock_out } = req.body;
//     const branchId = req.params.id;

//     if (!name) return res.status(400).json({ success: false, message: "Branch name is required" });

//     const branch = await Branch.findByPk(branchId);
//     if (!branch) return res.status(404).json({ success: false, message: "Branch not found" });

//     // 🟢 SUPER ADMIN: Full access
//     if (isSuper(req)) {
//       console.log('🟡 Super Admin - Updating branch');
//       await branch.update({
//         name,
//         branch_address: branch_address || null,
//         contact_number: contact_number || null,
//         co_ordinates: co_ordinates || null,
//         clock_out: clock_out !== undefined ? Boolean(clock_out) : branch.clock_out,
//         updated_at: new Date()
//       });
//       console.log('✅ Branch updated successfully by Super Admin');
//       return res.json({ success: true, data: branch });
//     }

//     // 🟢 Check if user exists in employees table (has branch)
//     const userEmployeeRecord = await Employee.findOne({
//       where: { user_id: req.user.id },
//       attributes: ['branch_id', 'created_by'],
//       raw: true,
//     });

//     let canUpdate = false;

//     if (userEmployeeRecord && userEmployeeRecord.branch_id) {
//       // 🟢 CASE 1: User has employee record with branch → check if they can update this branch
//       const companyId = await getCompanyId(req);
//       if (!companyId) return res.status(403).json({ success: false, message: "Unauthorized" });

//       // Branch users can only update branches created by their company
//       if (Number(branch.created_by) === Number(companyId)) {
//         if (hasPermission(req, "update branch")) {
//           canUpdate = true;
//         }
//       }
//     } else {
//       // 🟢 CASE 2: User doesn't have employee record (no branch) → check company access
//       const companyId = await getCompanyId(req);
//       if (!companyId) return res.status(403).json({ success: false, message: "Unauthorized" });

//       // Branchless users can update branches created by their company
//       if (Number(branch.created_by) === Number(companyId)) {
//         if (hasPermission(req, "update branch")) {
//           canUpdate = true;
//         }
//       }
//     }

//     if (!canUpdate) {
//       return res.status(403).json({ success: false, message: "No permission to update this branch" });
//     }

//     await branch.update({
//       name,
//       branch_address: branch_address || null,
//       contact_number: contact_number || null,
//       co_ordinates: co_ordinates || null,
//       clock_out: clock_out !== undefined ? Boolean(clock_out) : branch.clock_out,
//       updated_at: new Date()
//     });

//     console.log('✅ Branch updated successfully');
//     return res.json({ success: true, data: branch });
//   } catch (error) {
//     console.error('❌ Update Branch Error:', error);
//     return res.status(500).json({ success: false, message: "Server error", error: error.message });
//   }
// };

// exports.deleteBranch = async (req, res) => {
//   try {
//     console.log('🎯 START deleteBranch');
//     console.log('🔍 User Info - ID:', req.user.id, 'Type:', req.user.type);
    
//     const branchId = req.params.id;

//     const branch = await Branch.findByPk(branchId);
//     if (!branch) return res.status(404).json({ success: false, message: "Branch not found" });

//     // 🟢 SUPER ADMIN: Full access
//     if (isSuper(req)) {
//       console.log('🟡 Super Admin - Deleting branch');
//       await branch.destroy();
//       console.log('✅ Branch deleted successfully by Super Admin');
//       return res.json({ success: true, message: "Branch deleted successfully" });
//     }

//     // 🟢 Check if user exists in employees table (has branch)
//     const userEmployeeRecord = await Employee.findOne({
//       where: { user_id: req.user.id },
//       attributes: ['branch_id', 'created_by'],
//       raw: true,
//     });

//     let canDelete = false;

//     if (userEmployeeRecord && userEmployeeRecord.branch_id) {
//       // 🟢 CASE 1: User has employee record with branch → check if they can delete this branch
//       const companyId = await getCompanyId(req);
//       if (!companyId) return res.status(403).json({ success: false, message: "Unauthorized" });

//       // Branch users can only delete branches created by their company
//       if (Number(branch.created_by) === Number(companyId)) {
//         if (hasPermission(req, "delete branch")) {
//           canDelete = true;
//         }
//       }
//     } else {
//       // 🟢 CASE 2: User doesn't have employee record (no branch) → check company access
//       const companyId = await getCompanyId(req);
//       if (!companyId) return res.status(403).json({ success: false, message: "Unauthorized" });

//       // Branchless users can delete branches created by their company
//       if (Number(branch.created_by) === Number(companyId)) {
//         if (hasPermission(req, "delete branch")) {
//           canDelete = true;
//         }
//       }
//     }

//     if (!canDelete) {
//       return res.status(403).json({ success: false, message: "No permission to delete this branch" });
//     }

//     await branch.destroy();
//     console.log('✅ Branch deleted successfully');
//     return res.json({ success: true, message: "Branch deleted successfully" });
//   } catch (error) {
//     console.error('❌ Delete Branch Error:', error);
//     return res.status(500).json({ success: false, message: "Server error", error: error.message });
//   }
// };

// exports.getBranchById = async (req, res) => {
//   try {
//     console.log('🎯 START getBranchById');
//     console.log('🔍 User Info - ID:', req.user.id, 'Type:', req.user.type);
    
//     const branchId = req.params.id;

//     const branch = await Branch.findByPk(branchId);
//     if (!branch) return res.status(404).json({ success: false, message: "Branch not found" });

//     // 🟢 SUPER ADMIN: Full access
//     if (isSuper(req)) {
//       console.log('🟡 Super Admin - Accessing branch');
//       console.log('✅ Branch accessed successfully by Super Admin');
//       return res.json({ success: true, data: branch });
//     }

//     // 🟢 Check if user exists in employees table (has branch)
//     const userEmployeeRecord = await Employee.findOne({
//       where: { user_id: req.user.id },
//       attributes: ['branch_id', 'created_by'],
//       raw: true,
//     });

//     console.log('🔍 User Employee Record:', userEmployeeRecord);

//     let canAccess = false;

//     if (userEmployeeRecord && userEmployeeRecord.branch_id) {
//       // 🟢 CASE 1: User has employee record with branch → check if they can access this branch
//       console.log('🟡 Branch User - Checking access permissions');
//       const companyId = await getCompanyId(req);
//       if (!companyId) return res.status(403).json({ success: false, message: "Unauthorized" });

//       // Branch users can only access:
//       // 1. Their own branch (regardless of who created it)
//       // 2. Any branch created by their company
//       if (Number(branch.id) === Number(userEmployeeRecord.branch_id) || 
//           Number(branch.created_by) === Number(companyId)) {
//         canAccess = true;
//       }
//     } else {
//       // 🟢 CASE 2: User doesn't have employee record (no branch) → check company access
//       console.log('🟡 Branchless User - Checking access permissions');
//       const companyId = await getCompanyId(req);
//       if (!companyId) return res.status(403).json({ success: false, message: "Unauthorized" });

//       // Branchless users can access any branch created by their company
//       if (Number(branch.created_by) === Number(companyId)) {
//         canAccess = true;
//       }
//     }

//     if (!canAccess) {
//       return res.status(403).json({ success: false, message: "No permission to access this branch" });
//     }

//     console.log('✅ Branch accessed successfully');
//     return res.json({ success: true, data: branch });
//   } catch (error) {
//     console.error('❌ Get Branch By ID Error:', error);
//     return res.status(500).json({ success: false, message: "Server error", error: error.message });
//   }
// };




const Branch = require('../models/branch.model');
const Employee = require('../models/employee.model');
const User = require('../models/user.model');
const { Op } = require('sequelize');


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
function isCompany(req) { return (req.user?.type || '').toLowerCase() === 'company'; }
function isEmployee(req) { return (req.user?.type || '').toLowerCase() === 'employee'; }

function hasPermission(req, perm) {
  if (!req.user) return false;
  const type = (req.user.type || "").toLowerCase();

  // system-level accounts
  if (["company", "admin", "super admin"].includes(type)) return true;

  // check user.permissions array
  const perms = Array.isArray(req.user?.permissions) ? req.user.permissions : [];
  return perms.some(p => (p?.toLowerCase?.() || "").trim() === perm.toLowerCase());
}

exports.getAllBranches = async (req, res) => {
  try {
    console.log('🎯 START getAllBranches');
    console.log('🔍 User Info - ID:', req.user.id, 'Type:', req.user.type);

    // 🟢 SUPER ADMIN: Full access
    if (isSuper(req)) {
      console.log('🟡 Super Admin Access');
      const branches = await Branch.findAll({ 
        order: [['id', 'DESC']] 
      });
      console.log('🟡 Super Admin Branches Count:', branches.length);
      return res.json({ success: true, data: branches });
    }

    // 🟢 Check if user exists in employees table (has branch)
    const userEmployeeRecord = await Employee.findOne({
      where: { user_id: req.user.id },
      attributes: ['branch_id', 'created_by'],
      raw: true,
    });

    console.log('🔍 User Employee Record:', userEmployeeRecord);

    let branches = [];

    if (userEmployeeRecord && userEmployeeRecord.branch_id) {
      // 🟢 CASE 1: User has employee record with branch → show only their branch
      console.log('🟡 Branch User Access');
      const branchId = userEmployeeRecord.branch_id;
      console.log('🔍 Branch ID:', branchId);
      
      // Get company ID for branch users
      const companyId = await getCompanyId(req);
      console.log('🔍 Company ID for Branch User:', companyId);
      
      if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

      // 🟢 Show only the branch where the user belongs (REGARDLESS of who created it)
      branches = await Branch.findAll({
        where: {
          id: branchId
          // 🟢 REMOVED: created_by: companyId - so branch users can see their branch even if created by accountant
        },
        order: [['id', 'DESC']],
      });

    } else {
      // 🟢 CASE 2: User doesn't have employee record (no branch) → FULL DATABASE ACCESS
      console.log('🟡 Branchless User Access (FULL DATABASE)');
      
      // 🟢 Get company ID for branchless users
      const companyId = await getCompanyId(req);
      console.log('🔍 Company ID for Branchless User:', companyId);
      
      if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

      // 🟢 Show ALL branches created by the company AND branchless users
      const allCompanyUsers = await User.findAll({
        where: { created_by: companyId },
        attributes: ['id'],
        raw: true,
      });
      const companyUserIds = allCompanyUsers.map(u => Number(u.id));

      branches = await Branch.findAll({
        where: {
          [Op.or]: [
            { created_by: companyId },           // Company created branches
            { created_by: { [Op.in]: companyUserIds } }  // Branchless users created branches
          ]
        },
        order: [['id', 'DESC']],
      });
      
      console.log('🔍 Branchless User - All Branches Count:', branches.length);
    }

    console.log('🔍 Final Branches Count:', branches.length);
    console.log('✅ END getAllBranches - Success');
    return res.json({ success: true, data: branches });

  } catch (error) {
    console.error('❌ Get All Branches Error:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};


exports.createBranch = async (req, res) => {
  try {
    console.log('🎯 START createBranch');
    console.log('🔍 User Info - ID:', req.user.id, 'Type:', req.user.type);
    
    const { name, branch_address, contact_number, co_ordinates, clock_out, working_days, working_hours } = req.body;

    if (!name) return res.status(400).json({ success: false, message: "Branch name is required" });

    // 🟢 SUPER ADMIN: Full access
    if (isSuper(req)) {
      console.log('🟡 Super Admin - Creating branch');
      const branch = await Branch.create({
        name,
        created_by: req.user.id,
        branch_address: branch_address || null,
        contact_number: contact_number || null,
        co_ordinates: co_ordinates || null,
        clock_out: clock_out !== undefined ? Boolean(clock_out) : false,
        working_days: working_days || 26,
        working_hours: working_hours || 8,
      });
      console.log('✅ Branch created successfully by Super Admin');
      return res.status(201).json({ success: true, data: branch });
    }

    // 🟢 Check if user exists in employees table (has branch)
    const userEmployeeRecord = await Employee.findOne({
      where: { user_id: req.user.id },
      attributes: ['branch_id', 'created_by'],
      raw: true,
    });

    console.log('🔍 User Employee Record:', userEmployeeRecord);

    let companyId;
    let canCreate = false;

    if (userEmployeeRecord && userEmployeeRecord.branch_id) {
      // 🟢 CASE 1: User has employee record with branch → check permissions
      console.log('🟡 Branch User - Checking creation permissions');
      companyId = await getCompanyId(req);
      if (!companyId) return res.status(403).json({ success: false, message: "Unauthorized" });
      
      // Check if user has permission to create branch
      if (hasPermission(req, "create branch")) {
        canCreate = true;
      }
    } else {
      // 🟢 CASE 2: User doesn't have employee record (no branch) → FULL ACCESS
      console.log('🟡 Branchless User - Creating branch');
      companyId = await getCompanyId(req);
      if (!companyId) return res.status(403).json({ success: false, message: "Unauthorized" });
      
      // Check if user has permission to create branch
      if (hasPermission(req, "create branch")) {
        canCreate = true;
      }
    }

    if (!canCreate) {
      return res.status(403).json({ success: false, message: "No permission to create branch" });
    }

    // Create the branch
    const branch = await Branch.create({
      name,
      created_by: companyId,
      branch_address: branch_address || null,
      contact_number: contact_number || null,
      co_ordinates: co_ordinates || null,
      clock_out: clock_out !== undefined ? Boolean(clock_out) : false,
      working_days: working_days !== undefined ? working_days : 26,
      working_hours: working_hours !== undefined ? working_hours : 8,

    });

    console.log('✅ Branch created successfully');
    return res.status(201).json({ success: true, data: branch });
  } catch (error) {
    console.error('❌ Create Branch Error:', error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

exports.updateBranch = async (req, res) => {
  try {
    console.log('🎯 START updateBranch');
    console.log('🔍 User Info - ID:', req.user.id, 'Type:', req.user.type);
    
    const { name, branch_address, contact_number, co_ordinates, clock_out,working_days, working_hours } = req.body;
    const branchId = req.params.id;

    if (!name) return res.status(400).json({ success: false, message: "Branch name is required" });

    const branch = await Branch.findByPk(branchId);
    if (!branch) return res.status(404).json({ success: false, message: "Branch not found" });

    // 🟢 SUPER ADMIN: Full access
    if (isSuper(req)) {
      console.log('🟡 Super Admin - Updating branch');
      await branch.update({
        name,
        branch_address: branch_address || null,
        contact_number: contact_number || null,
        co_ordinates: co_ordinates || null,
        clock_out: clock_out !== undefined ? Boolean(clock_out) : branch.clock_out,
        working_days: working_days !== undefined ? working_days : branch.working_days,
        working_hours: working_hours !== undefined ? working_hours : branch.working_hours,
        updated_at: new Date()
      });
      console.log('✅ Branch updated successfully by Super Admin');
      return res.json({ success: true, data: branch });
    }

    // 🟢 Check if user exists in employees table (has branch)
    const userEmployeeRecord = await Employee.findOne({
      where: { user_id: req.user.id },
      attributes: ['branch_id', 'created_by'],
      raw: true,
    });

    let canUpdate = false;

    if (userEmployeeRecord && userEmployeeRecord.branch_id) {
      // 🟢 CASE 1: User has employee record with branch → check if they can update this branch
      const companyId = await getCompanyId(req);
      if (!companyId) return res.status(403).json({ success: false, message: "Unauthorized" });

      // Branch users can only update branches created by their company
      if (Number(branch.created_by) === Number(companyId)) {
        if (hasPermission(req, "update branch")) {
          canUpdate = true;
        }
      }
    } else {
      // 🟢 CASE 2: User doesn't have employee record (no branch) → check company access
      const companyId = await getCompanyId(req);
      if (!companyId) return res.status(403).json({ success: false, message: "Unauthorized" });

      // Branchless users can update branches created by their company
      if (Number(branch.created_by) === Number(companyId)) {
        if (hasPermission(req, "update branch")) {
          canUpdate = true;
        }
      }
    }

    if (!canUpdate) {
      return res.status(403).json({ success: false, message: "No permission to update this branch" });
    }

    await branch.update({
      name,
      branch_address: branch_address || null,
      contact_number: contact_number || null,
      co_ordinates: co_ordinates || null,
      clock_out: clock_out !== undefined ? Boolean(clock_out) : branch.clock_out,
      working_days: working_days !== undefined ? working_days : branch.working_days,
      working_hours: working_hours !== undefined ? working_hours : branch.working_hours,
      updated_at: new Date()
    });

    console.log('✅ Branch updated successfully');
    return res.json({ success: true, data: branch });
  } catch (error) {
    console.error('❌ Update Branch Error:', error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

exports.deleteBranch = async (req, res) => {
  try {
    console.log('🎯 START deleteBranch');
    console.log('🔍 User Info - ID:', req.user.id, 'Type:', req.user.type);
    
    const branchId = req.params.id;

    const branch = await Branch.findByPk(branchId);
    if (!branch) return res.status(404).json({ success: false, message: "Branch not found" });

    // 🟢 SUPER ADMIN: Full access
    if (isSuper(req)) {
      console.log('🟡 Super Admin - Deleting branch');
      await branch.destroy();
      console.log('✅ Branch deleted successfully by Super Admin');
      return res.json({ success: true, message: "Branch deleted successfully" });
    }

    // 🟢 Check if user exists in employees table (has branch)
    const userEmployeeRecord = await Employee.findOne({
      where: { user_id: req.user.id },
      attributes: ['branch_id', 'created_by'],
      raw: true,
    });

    let canDelete = false;

    if (userEmployeeRecord && userEmployeeRecord.branch_id) {
      // 🟢 CASE 1: User has employee record with branch → check if they can delete this branch
      const companyId = await getCompanyId(req);
      if (!companyId) return res.status(403).json({ success: false, message: "Unauthorized" });

      // Branch users can only delete branches created by their company
      if (Number(branch.created_by) === Number(companyId)) {
        if (hasPermission(req, "delete branch")) {
          canDelete = true;
        }
      }
    } else {
      // 🟢 CASE 2: User doesn't have employee record (no branch) → check company access
      const companyId = await getCompanyId(req);
      if (!companyId) return res.status(403).json({ success: false, message: "Unauthorized" });

      // Branchless users can delete branches created by their company
      if (Number(branch.created_by) === Number(companyId)) {
        if (hasPermission(req, "delete branch")) {
          canDelete = true;
        }
      }
    }

    if (!canDelete) {
      return res.status(403).json({ success: false, message: "No permission to delete this branch" });
    }

    await branch.destroy();
    console.log('✅ Branch deleted successfully');
    return res.json({ success: true, message: "Branch deleted successfully" });
  } catch (error) {
    console.error('❌ Delete Branch Error:', error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

exports.getBranchById = async (req, res) => {
  try {
    console.log('🎯 START getBranchById');
    console.log('🔍 User Info - ID:', req.user.id, 'Type:', req.user.type);
    
    const branchId = req.params.id;

    const branch = await Branch.findByPk(branchId);
    if (!branch) return res.status(404).json({ success: false, message: "Branch not found" });

    // 🟢 SUPER ADMIN: Full access
    if (isSuper(req)) {
      console.log('🟡 Super Admin - Accessing branch');
      console.log('✅ Branch accessed successfully by Super Admin');
      return res.json({ success: true, data: branch });
    }

    // 🟢 Check if user exists in employees table (has branch)
    const userEmployeeRecord = await Employee.findOne({
      where: { user_id: req.user.id },
      attributes: ['branch_id', 'created_by'],
      raw: true,
    });

    console.log('🔍 User Employee Record:', userEmployeeRecord);

    let canAccess = false;

    if (userEmployeeRecord && userEmployeeRecord.branch_id) {
      // 🟢 CASE 1: User has employee record with branch → check if they can access this branch
      console.log('🟡 Branch User - Checking access permissions');
      const companyId = await getCompanyId(req);
      if (!companyId) return res.status(403).json({ success: false, message: "Unauthorized" });

      // Branch users can only access:
      // 1. Their own branch (regardless of who created it)
      // 2. Any branch created by their company
      if (Number(branch.id) === Number(userEmployeeRecord.branch_id) || 
          Number(branch.created_by) === Number(companyId)) {
        canAccess = true;
      }
    } else {
      // 🟢 CASE 2: User doesn't have employee record (no branch) → check company access
      console.log('🟡 Branchless User - Checking access permissions');
      const companyId = await getCompanyId(req);
      if (!companyId) return res.status(403).json({ success: false, message: "Unauthorized" });

      // Branchless users can access any branch created by their company
      if (Number(branch.created_by) === Number(companyId)) {
        canAccess = true;
      }
    }

    if (!canAccess) {
      return res.status(403).json({ success: false, message: "No permission to access this branch" });
    }

    console.log('✅ Branch accessed successfully');
    return res.json({ success: true, data: branch });
  } catch (error) {
    console.error('❌ Get Branch By ID Error:', error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

