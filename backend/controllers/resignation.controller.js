

/*
// // controllers/resignation.controller.js
// const Resignation = require('../models/resignation.model');
// const Employee = require('../models/employee.model');

// // =====================
// // Helper: format resignation response
// // =====================
// const formatResignationResponse = async (resignation) => {
//   if (!resignation) return null;
//   const json = resignation.toJSON();
//   return {
//     id: json.id,
//     employee_id: json.employee_id,
//     notice_date: json.notice_date,
//     resignation_date: json.resignation_date,
//     description: json.description,
//     created_by: json.created_by, // ✅ always company_id
//     created_at: json.created_at,
//     updated_at: json.updated_at
//   };
// };

// // =====================
// // GET ALL RESIGNATIONS
// // =====================
// exports.getAllResignations = async (req, res) => {
//   try {
//     let whereClause = {};

//     if (req.user.type === 'company') {
//       whereClause.created_by = req.user.id;
//     } else if (req.user.type === 'Employee') {
//       const emp = await Employee.findOne({ where: { user_id: req.user.id } });
//       if (!emp) return res.status(403).json({ success: false, message: 'Employee profile not found' });
//       whereClause = { created_by: emp.created_by, employee_id: emp.employee_id };
//     } else {
//       const emp = await Employee.findOne({ where: { user_id: req.user.id } });
//       if (emp) whereClause.created_by = emp.created_by;
//     }

//     const resignations = await Resignation.findAll({ where: whereClause, order: [['id', 'DESC']] });
//     const responseData = await Promise.all(resignations.map(r => formatResignationResponse(r)));
//     res.json({ success: true, data: responseData });
//   } catch (error) {
//     console.error('Get All Resignations Error:', error);
//     res.status(500).json({ success: false, message: 'Server error', error: error.message });
//   }
// };

// // =====================
// // GET RESIGNATION BY ID
// // =====================
// exports.getResignationById = async (req, res) => {
//   try {
//     let whereClause = { id: req.params.id };

//     if (req.user.type === 'company') {
//       whereClause.created_by = req.user.id;
//     } else if (req.user.type === 'Employee') {
//       const emp = await Employee.findOne({ where: { user_id: req.user.id } });
//       if (!emp) return res.status(403).json({ success: false, message: 'Employee profile not found' });
//       whereClause = { id: req.params.id, created_by: emp.created_by, employee_id: emp.employee_id };
//     } else {
//       const emp = await Employee.findOne({ where: { user_id: req.user.id } });
//       if (emp) whereClause.created_by = emp.created_by;
//     }

//     const resignation = await Resignation.findOne({ where: whereClause });
//     if (!resignation) return res.status(404).json({ success: false, message: 'Resignation not found' });

//     res.json({ success: true, data: await formatResignationResponse(resignation) });
//   } catch (error) {
//     console.error('Get Resignation By ID Error:', error);
//     res.status(500).json({ success: false, message: 'Server error', error: error.message });
//   }
// };

// // =====================
// // CREATE RESIGNATION
// // =====================
// exports.createResignation = async (req, res) => {
//   try {
//     const { employee_id, notice_date, resignation_date, description } = req.body;
//     if (!employee_id) return res.status(400).json({ success: false, message: 'employee_id is required' });

//     let companyId;
//     if (req.user.type === 'company') {
//       companyId = req.user.id;
//     } else if (req.user.type === 'Employee') {
//       const emp = await Employee.findOne({ where: { user_id: req.user.id } });
//       if (!emp) return res.status(403).json({ success: false, message: 'Employee profile not found' });
//       companyId = emp.created_by;
//     } else {
//       const emp = await Employee.findOne({ where: { user_id: req.user.id } });
//       if (!emp) return res.status(403).json({ success: false, message: 'Employee profile not found' });
//       companyId = emp.created_by;
//     }

//     // ✅ Validate employee belongs to company
//     const targetEmployee = await Employee.findOne({ where: { employee_id, created_by: companyId } });
//     if (!targetEmployee) return res.status(400).json({ success: false, message: 'Employee not found in your company' });

//     const resignation = await Resignation.create({
//       employee_id,
//       notice_date,
//       resignation_date,
//       description,
//       created_by: companyId,
//       created_at: new Date(),
//       updated_at: new Date()
//     });

//     res.status(201).json({ success: true, message: 'Resignation created', data: await formatResignationResponse(resignation) });
//   } catch (error) {
//     console.error('Create Resignation Error:', error);
//     res.status(500).json({ success: false, message: 'Server error', error: error.message });
//   }
// };

// // =====================
// // UPDATE RESIGNATION
// // =====================
// exports.updateResignation = async (req, res) => {
//   try {
//     const resignationId = req.params.id;
//     const { employee_id, notice_date, resignation_date, description } = req.body;

//     let whereClause = { id: resignationId };

//     if (req.user.type === 'company') {
//       whereClause.created_by = req.user.id;
//     } else if (req.user.type === 'Employee') {
//       const emp = await Employee.findOne({ where: { user_id: req.user.id } });
//       if (!emp) return res.status(403).json({ success: false, message: 'Employee profile not found' });
//       whereClause = { id: resignationId, created_by: emp.created_by, employee_id: emp.employee_id };
//     } else {
//       const emp = await Employee.findOne({ where: { user_id: req.user.id } });
//       if (!emp) return res.status(403).json({ success: false, message: 'Employee profile not found' });
//       whereClause.created_by = emp.created_by;
//     }

//     const resignation = await Resignation.findOne({ where: whereClause });
//     if (!resignation) return res.status(404).json({ success: false, message: 'Resignation not found' });

//     // ✅ Validate employee belongs to same company if updating employee_id
//     if (employee_id) {
//       const targetEmployee = await Employee.findOne({ where: { employee_id, created_by: resignation.created_by } });
//       if (!targetEmployee) return res.status(400).json({ success: false, message: 'Employee not found in your company' });
//       resignation.employee_id = employee_id;
//     }

//     await resignation.update({ notice_date, resignation_date, description, updated_at: new Date() });

//     res.json({ success: true, message: 'Resignation updated', data: await formatResignationResponse(resignation) });
//   } catch (error) {
//     console.error('Update Resignation Error:', error);
//     res.status(500).json({ success: false, message: 'Server error', error: error.message });
//   }
// };

// // =====================
// // DELETE RESIGNATION
// // =====================
// exports.deleteResignation = async (req, res) => {
//   try {
//     const { id } = req.params;

//     if (req.user.type === 'company') {
//       const resignation = await Resignation.findOne({ where: { id, created_by: req.user.id } });
//       if (!resignation) return res.status(404).json({ success: false, message: 'Resignation not found in your company' });

//       await resignation.destroy();
//       return res.json({ success: true, message: 'Resignation deleted', data: { id } });
//     }

//     if (req.user.type === 'Employee') {
//       const emp = await Employee.findOne({ where: { user_id: req.user.id } });
//       if (!emp) return res.status(403).json({ success: false, message: 'Employee profile not found' });

//       const resignation = await Resignation.findOne({ where: { id, created_by: emp.created_by, employee_id: emp.employee_id } });
//       if (!resignation) return res.status(404).json({ success: false, message: 'Resignation not found for you' });

//       await resignation.destroy();
//       return res.json({ success: true, message: 'Your resignation deleted', data: { id } });
//     }

//     const emp = await Employee.findOne({ where: { user_id: req.user.id } });
//     if (!emp) return res.status(403).json({ success: false, message: 'Employee profile not found' });

//     const resignation = await Resignation.findOne({ where: { id, created_by: emp.created_by } });
//     if (!resignation) return res.status(404).json({ success: false, message: 'Resignation not found in your company' });

//     await resignation.destroy();
//     return res.json({ success: true, message: 'Resignation deleted', data: { id } });
//   } catch (error) {
//     console.error('Delete Resignation Error:', error);
//     res.status(500).json({ success: false, message: 'Server error', error: error.message });
//   }
// };


*/










// const { Op } = require('sequelize');
// const Resignation = require('../models/resignation.model');
// const Employee = require('../models/employee.model');
// const User = require('../models/user.model');


// async function getCompanyId(req) {
//   if (!req.user) return null;
//   const type = (req.user.type || '').toLowerCase();

//   if (['company', 'admin', 'super admin'].includes(type)) return req.user.id;

//   try {
//     const emp = await Employee.findOne({
//       where: { user_id: req.user.id },
//       attributes: ['created_by'],
//       raw: true,
//     });
//     if (emp?.created_by) return Number(emp.created_by);
//   } catch (err) {
//     console.error('getCompanyId Employee lookup failed:', err.message);
//   }

//   return req.user.creator_id || req.user.id;
// }

// function isSuper(req) {
//   return (req.user?.roles || []).some(r => (r.name || '').toLowerCase() === 'super admin');
// }
// function isCompany(req) { return (req.user?.type || '').toLowerCase() === 'company'; }
// function isEmployee(req) { return (req.user?.type || '').toLowerCase() === 'employee'; }

// async function getUserBranchId(userId) {
//   const emp = await Employee.findOne({
//     where: { user_id: userId },
//     attributes: ['branch_id'],
//     raw: true,
//   });
//   return emp?.branch_id || null;
// }

// async function getAllUserIdsUnderCompanyBranch(companyId, branchId) {
//   if (!companyId) return [];

//   const users = await User.findAll({
//     where: { created_by: companyId },
//     attributes: ['id'],
//     raw: true,
//   });

//   const userIds = users.map(u => Number(u.id));
//   const baseSet = new Set([Number(companyId), ...userIds]);

//   if (branchId) {
//     if (userIds.length === 0) return [Number(companyId)];

//     const emps = await Employee.findAll({
//       where: {
//         user_id: { [Op.in]: userIds },
//         branch_id: branchId
//       },
//       attributes: ['user_id'],
//       raw: true,
//     });

//     const branchUserIds = emps.map(e => Number(e.user_id));
//     return [...new Set([Number(companyId), ...branchUserIds])];
//   }

//   return Array.from(baseSet);
// }


// const formatResignationResponse = async (resignation) => {
//   if (!resignation) return null;
//   const json = resignation.toJSON();
//   return {
//     id: json.id,
//     employee_id: json.employee_id,
//     // notice_date: json.notice_date,
//     resignation_date: json.resignation_date,
//     description: json.description,
//     created_by: json.created_by,   // ✅ always logged-in user_id
//     created_at: json.created_at,
//     updated_at: json.updated_at
//   };
// };



// exports.getAllResignations = async (req, res) => {
//   try {
//     const companyId = await getCompanyId(req);
//     if (!companyId && !isSuper(req)) {
//       return res.status(403).json({ success: false, message: 'Unauthorized' });
//     }

//     let where = { deleted_at: null }; // 🔹 Only active (non-deleted) records

//     if (!isSuper(req)) {
//       if (isCompany(req)) {
//         const allowedCreatedBy = await getAllUserIdsUnderCompanyBranch(companyId, null);
//         where.created_by = { [Op.in]: allowedCreatedBy };
//       } else {
//         const branchId = await getUserBranchId(req.user.id);
//         if (!branchId) return res.status(403).json({ success: false, message: 'No branch assigned' });

//         const allowedCreatedBy = await getAllUserIdsUnderCompanyBranch(companyId, branchId);
//         where.created_by = { [Op.in]: allowedCreatedBy };
//       }
//     }

//     const resignations = await Resignation.findAll({
//       where,
//       order: [['id', 'DESC']],
//     });

//     const responseData = await Promise.all(resignations.map(r => formatResignationResponse(r)));
//     res.json({ success: true, data: responseData });
//   } catch (error) {
//     console.error('Get All Resignations Error:', error);
//     res.status(500).json({ success: false, message: 'Server error', error: error.message });
//   }
// };


// exports.getResignationById = async (req, res) => {
//   try {
//     const resignation = await Resignation.findOne({
//       where: {
//         id: req.params.id,
//         deleted_at: null, // 🔹 Ignore soft-deleted
//       },
//     });

//     if (!resignation) {
//       return res.status(404).json({ success: false, message: 'Resignation not found or deleted' });
//     }

//     if (!isSuper(req)) {
//       const companyId = await getCompanyId(req);
//       if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

//       const branchId = isCompany(req) ? null : await getUserBranchId(req.user.id);
//       const allowedCreatedBy = await getAllUserIdsUnderCompanyBranch(companyId, branchId);

//       if (!allowedCreatedBy.map(String).includes(String(resignation.created_by))) {
//         return res.status(403).json({ success: false, message: 'Forbidden: not your record' });
//       }
//     }

//     res.json({ success: true, data: await formatResignationResponse(resignation) });
//   } catch (error) {
//     console.error('Get Resignation By ID Error:', error);
//     res.status(500).json({ success: false, message: 'Server error', error: error.message });
//   }
// };



// exports.createResignation = async (req, res) => {
//   try {
//     const { employee_id,/* notice_date,*/ resignation_date, description } = req.body;
//     if (!employee_id) return res.status(400).json({ success: false, message: 'employee_id is required' });

//     const creatorId = req.user.id;

//     // Validate employee exists in same company
//     const emp = await Employee.findOne({ where: { employee_id } });
//     if (!emp) return res.status(400).json({ success: false, message: 'Employee not found' });

//     const resignation = await Resignation.create({
//       employee_id,
//     //   notice_date,
//       resignation_date,
//       description,
//       created_by: creatorId,   // ✅ logged-in user_id
//       created_at: new Date(),
//       updated_at: new Date()
//     });
    
//     /* 🔹 HIGHLIGHTED ADDITION: Mark employee as inactive after resignation */
//     await Employee.update(
//       { is_active: 0 },
//       { where: { employee_id } }
//     );
    
    
//     // 2️⃣ Fetch employee again to get its user_id (if not already retrieved)
//     const updatedEmp = emp || await Employee.findOne({ where: { employee_id }, attributes: ['user_id'], raw: true });
    
//     // 3️⃣ If corresponding user exists, deactivate that user too
//     if (updatedEmp?.user_id) {
//       await User.update(
//         { is_active: 0 },
//         { where: { id: updatedEmp.user_id } }
//       );
//     }
//     /* 🔹 END HIGHLIGHT */

//     res.status(201).json({ success: true, message: 'Resignation created', data: await formatResignationResponse(resignation) });
//   } catch (error) {
//     console.error('Create Resignation Error:', error);
//     res.status(500).json({ success: false, message: 'Server error', error: error.message });
//   }
// };


// exports.updateResignation = async (req, res) => {
//   try {
//     const resignationId = req.params.id;
//     const { employee_id, /*notice_date,*/ resignation_date, description } = req.body;

//     const resignation = await Resignation.findOne({ where: { id: resignationId } });
//     if (!resignation) return res.status(404).json({ success: false, message: 'Resignation not found' });

//     // ✅ If updating employee_id, check if valid
//     if (employee_id) {
//       const emp = await Employee.findOne({ where: { employee_id } });
//       if (!emp) return res.status(400).json({ success: false, message: 'Employee not found' });
//       resignation.employee_id = employee_id;
//     }

//     await resignation.update({
//     //   notice_date: notice_date || resignation.notice_date,
//       resignation_date: resignation_date || resignation.resignation_date,
//       description: description || resignation.description,
//       updated_at: new Date()
//     });

//     res.json({ success: true, message: 'Resignation updated', data: await formatResignationResponse(resignation) });
//   } catch (error) {
//     console.error('Update Resignation Error:', error);
//     res.status(500).json({ success: false, message: 'Server error', error: error.message });
//   }
// };



// exports.deleteResignation = async (req, res) => {
//   try {
//     const { id } = req.params;

//     // 🔹 Step 1: Try to find resignation (even if deleted_at column missing)
//     const resignation = await Resignation.findOne({ where: { id } });

//     if (!resignation) {
//       return res.status(404).json({
//         success: false,
//         message: 'Resignation not found'
//       });
//     }

//     // 🔹 Step 2: Check if already deleted
//     if (resignation.deleted_at) {
//       return res.status(400).json({
//         success: false,
//         message: 'Resignation already deleted'
//       });
//     }

//     // 🔹 Step 3: Perform soft delete
//     resignation.deleted_at = new Date();
//     await resignation.save();

//     return res.json({
//       success: true,
//       message: 'Resignation soft deleted successfully',
//       data: { id, deleted_at: resignation.deleted_at }
//     });
//   } catch (error) {
//     console.error('Delete Resignation Error:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Server error',
//       error: error.message
//     });
//   }
// };

// controllers/resignation.controller.js
const { Op } = require('sequelize');
const Resignation = require('../models/resignation.model');
const Employee = require('../models/employee.model');
const User = require('../models/user.model');

// =====================
// ???? Helpers
// =====================
async function getCompanyId(req) {
  try {
    if (!req.user) return null;
    
    // ???? Pehle check karo user khud company hai ya nahi
    const type = (req.user.type || '').toLowerCase();
    if (['company', 'admin', 'super admin'].includes(type)) {
      return req.user.id;
    }

    // ???? Agar employee hai (employees table mein entry hai)
    const emp = await Employee.findOne({
      where: { user_id: req.user.id },
      attributes: ['created_by'],
      raw: true,
    });
    if (emp?.created_by) return Number(emp.created_by);
    
    // ???? FIX: Branchless users (jaise accountant) ke liye users table se created_by lekar aao
    const userRecord = await User.findOne({
      where: { id: req.user.id },
      attributes: ['created_by'],
      raw: true,
    });
    
    console.log('???? User Record created_by:', userRecord?.created_by);
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
// ???? Format Resignation Response
// =====================
const formatResignationResponse = async (resignation) => {
  if (!resignation) return null;
  const json = resignation.toJSON ? resignation.toJSON() : resignation;

  // Get employee details
  const employee = await Employee.findOne({
    where: { employee_id: String(json.employee_id), deleted_at: null },
    attributes: ['id', 'employee_id', 'name', 'branch_id', 'department_id', 'is_active'],
    raw: true
  });

  return {
    id: json.id,
    employee_id: json.employee_id,
    employee: employee ? {
      id: employee.id,
      employee_id: employee.employee_id,
      name: employee.name,
      branch_id: employee.branch_id,
      department_id: employee.department_id,
      is_active: employee.is_active
    } : null,
    // notice_date: json.notice_date,
    resignation_date: json.resignation_date,
    description: json.description,
    created_by: json.created_by,
    created_at: json.created_at,
    updated_at: json.updated_at
  };
};

// =====================
// ???? CREATE RESIGNATION
// =====================
exports.createResignation = async (req, res) => {
  try {
    console.log('???? START createResignation');
    console.log('???? User Info - ID:', req.user.id, 'Type:', req.user.type);
    
    const { employee_id, resignation_date, description } = req.body;
    if (!employee_id) {
      return res.status(400).json({ success: false, message: 'employee_id is required' });
    }

    const companyId = await getCompanyId(req);
    if (!companyId && !isSuper(req)) return res.status(403).json({ success: false, message: 'Unauthorized' });

    // ???? Check if user exists in employees table (has branch)
    const userEmployeeRecord = await Employee.findOne({
      where: { user_id: req.user.id },
      attributes: ['branch_id', 'created_by'],
      raw: true,
    });

    console.log('???? User Employee Record:', userEmployeeRecord);

    let userBranchId = null;

    if (userEmployeeRecord && userEmployeeRecord.branch_id) {
      // ???? CASE 1: User has employee record with branch ? branch-level access
      console.log('???? Branch User - Creating resignation');
      userBranchId = userEmployeeRecord.branch_id;
    } else {
      // ???? CASE 2: User doesn't have employee record (no branch) ? company-wide access
      console.log('???? Branchless User - Creating resignation');
      // No branch restriction for branchless users
    }

    // ???? FIX: Only require branch for branch users, not branchless users
    if (!isCompany(req) && !isSuper(req) && userEmployeeRecord && !userBranchId && !isEmployee(req)) {
      return res.status(403).json({ success: false, message: 'No branch assigned' });
    }

    // Determine allowed creators within company/branch
    const allowedCreatedBy = await getAllUserIdsUnderCompanyBranch(companyId, isCompany(req) ? null : userBranchId);

    // Find target employee by business employee_id
    const employeeRecord = await Employee.findOne({
      where: { employee_id: String(employee_id), deleted_at: null }
    });
    if (!employeeRecord) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    // Ensure the employee belongs to the current scope
    // - employeeRecord.created_by should be in allowedCreatedBy (company / branch users)
    // - branch users must be in same branch
    if (!isSuper(req)) {
      if (!allowedCreatedBy.map(String).includes(String(employeeRecord.created_by))) {
        return res.status(403).json({ success: false, message: 'Employee not in your company/branch scope' });
      }

      if (userEmployeeRecord && userEmployeeRecord.branch_id && !isCompany(req) && !isEmployee(req)) {
        // branch-level user: employee must be in same branch
        if (String(employeeRecord.branch_id) !== String(userBranchId)) {
          return res.status(403).json({ success: false, message: 'Employee not in your branch' });
        }
      }
    }

    // Employee users can only create resignations for themselves
    if (isEmployee(req)) {
      const self = await Employee.findOne({ where: { user_id: req.user.id, deleted_at: null } });
      if (!self || String(self.employee_id) !== String(employee_id)) {
        return res.status(403).json({ success: false, message: 'Employees can only create resignations for themselves' });
      }
    }

    // Create resignation
    const resignation = await Resignation.create({
      employee_id: String(employee_id),
      resignation_date: resignation_date || new Date(),
      description: description || null,
      created_by: req.user.id,
      created_at: new Date(),
      updated_at: new Date()
    });

    /* ???? HIGHLIGHTED ADDITION: Mark employee as inactive after resignation */
    await Employee.update(
      { is_active: 0 },
      { where: { employee_id } }
    );
    
    // 2?? Fetch employee again to get its user_id (if not already retrieved)
    const updatedEmp = employeeRecord || await Employee.findOne({ where: { employee_id }, attributes: ['user_id'], raw: true });
    
    // 3?? If corresponding user exists, deactivate that user too
    if (updatedEmp?.user_id) {
      await User.update(
        { is_active: 0 },
        { where: { id: updatedEmp.user_id } }
      );
    }
    /* ???? END HIGHLIGHT */

    const data = await formatResignationResponse(resignation);
    console.log('? Resignation created successfully');
    return res.status(201).json({ success: true, message: 'Resignation created', data });
  } catch (err) {
    console.error('? Create Resignation Error:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// =====================
// ???? GET ALL RESIGNATIONS
// =====================
exports.getAllResignations = async (req, res) => {
  try {
    console.log('???? START getAllResignations');
    console.log('???? User Info - ID:', req.user.id, 'Type:', req.user.type);

    // ???? SUPER ADMIN: Full access
    if (isSuper(req)) {
      console.log('???? Super Admin Access');
      const resignations = await Resignation.findAll({
        where: { deleted_at: null },
        order: [['id', 'DESC']],
      });
      console.log('???? Super Admin Resignations Count:', resignations.length);
      const data = await Promise.all(resignations.map(r => formatResignationResponse(r)));
      return res.json({ success: true, data });
    }

    // ???? Check if user exists in employees table (has branch)
    const userEmployeeRecord = await Employee.findOne({
      where: { user_id: req.user.id },
      attributes: ['branch_id', 'created_by'],
      raw: true,
    });

    console.log('???? User Employee Record:', userEmployeeRecord);

    let resignations = [];

    if (userEmployeeRecord && userEmployeeRecord.branch_id) {
      // ???? CASE 1: User has employee record with branch ? branch-level access
      console.log('???? Branch User Access');
      const branchId = userEmployeeRecord.branch_id;
      console.log('???? Branch ID:', branchId);
      
      // Get company ID for branch users
      const companyId = await getCompanyId(req);
      console.log('???? Company ID for Branch User:', companyId);
      
      if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

      // ???? STEP 1: Get ALL EMPLOYEES in the same branch under this company
      const branchEmployees = await Employee.findAll({
        where: {
          branch_id: branchId,
          deleted_at: null,
        },
        attributes: ['employee_id'],
        raw: true,
      });

      const branchEmployeeIds = branchEmployees.map(e => String(e.employee_id));
      console.log('???? Branch Employee IDs:', branchEmployeeIds);

      // ???? STEP 2: Fetch resignations for employees in the same branch
      resignations = await Resignation.findAll({
        where: {
          deleted_at: null,
          employee_id: { [Op.in]: branchEmployeeIds },
        },
        order: [['id', 'DESC']],
      });

    } else {
      // ???? CASE 2: User doesn't have employee record (no branch) ? FULL DATABASE ACCESS
      console.log('???? Branchless User Access (FULL DATABASE)');
      
      // ???? DIRECTLY GET ALL RESIGNATIONS - no company filter
      resignations = await Resignation.findAll({
        where: { deleted_at: null },
        order: [['id', 'DESC']],
      });
      
      console.log('???? Branchless User - All Resignations Count:', resignations.length);
    }

    console.log('???? Final Resignations Count:', resignations.length);
    const data = await Promise.all(resignations.map(r => formatResignationResponse(r)));
    console.log('? END getAllResignations - Success');
    return res.json({ success: true, data });

  } catch (err) {
    console.error('? Get All Resignations Error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message,
    });
  }
};

// =====================
// ???? GET RESIGNATION BY ID
// =====================
exports.getResignationById = async (req, res) => {
  try {
    console.log('???? START getResignationById');
    console.log('???? User Info - ID:', req.user.id, 'Type:', req.user.type);
    
    const resignation = await Resignation.findOne({
      where: { id: req.params.id, deleted_at: null },
    });

    if (!resignation) {
      return res.status(404).json({ success: false, message: 'Resignation not found' });
    }

    // ???? Super Admin ? full access
    if (isSuper(req)) {
      const data = await formatResignationResponse(resignation);
      return res.json({ success: true, data });
    }

    // ???? Check if user exists in employees table (has branch)
    const userEmployeeRecord = await Employee.findOne({
      where: { user_id: req.user.id },
      attributes: ['branch_id', 'created_by'],
      raw: true,
    });

    console.log('???? User Employee Record:', userEmployeeRecord);

    if (userEmployeeRecord && userEmployeeRecord.branch_id) {
      // ???? CASE 1: User has employee record with branch ? branch-level access
      const companyId = await getCompanyId(req);
      if (!companyId) {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
      }

      // ???? STEP 1: Get the employee linked to the resignation
      const resignationEmployee = await Employee.findOne({
        where: { employee_id: String(resignation.employee_id), deleted_at: null },
        raw: true,
      });

      if (!resignationEmployee) {
        return res.status(404).json({ success: false, message: 'Employee linked to resignation not found' });
      }

      // ???? STEP 2: Check if the resignation employee belongs to the same branch as the current user
      const employeeBranchId = resignationEmployee.branch_id || null;
      
      console.log('???? Resignation Employee Branch ID:', employeeBranchId);
      console.log('???? Current User Branch ID:', userEmployeeRecord.branch_id);

      if (String(employeeBranchId) !== String(userEmployeeRecord.branch_id)) {
        return res.status(403).json({ success: false, message: 'Forbidden: resignation belongs to different branch' });
      }

    } else {
      // ???? CASE 2: User doesn't have employee record (no branch) ? FULL ACCESS
      console.log('???? Branchless User - Full resignation access');
      // No additional checks needed - branchless users can access any resignation
    }

    // ? Return formatted resignation
    const data = await formatResignationResponse(resignation);
    console.log('? END getResignationById - Success');
    return res.json({ success: true, data });

  } catch (err) {
    console.error('? Get Resignation By ID Error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message,
    });
  }
};

// =====================
// ???? UPDATE RESIGNATION
// =====================
exports.updateResignation = async (req, res) => {
  try {
    console.log('???? START updateResignation');
    console.log('???? User Info - ID:', req.user.id, 'Type:', req.user.type);
    
    const { id } = req.params;
    const { employee_id, resignation_date, description } = req.body;

    const companyId = await getCompanyId(req);
    if (!companyId && !isSuper(req))
      return res
        .status(403)
        .json({ success: false, message: 'Unauthorized' });

    // ???? Check if user exists in employees table (has branch)
    const userEmployeeRecord = await Employee.findOne({
      where: { user_id: req.user.id },
      attributes: ['branch_id', 'created_by'],
      raw: true,
    });

    console.log('???? User Employee Record:', userEmployeeRecord);

    let userBranchId = null;

    if (userEmployeeRecord && userEmployeeRecord.branch_id) {
      // ???? CASE 1: User has employee record with branch ? branch-level access
      console.log('???? Branch User - Updating resignation');
      userBranchId = userEmployeeRecord.branch_id;
    } else {
      // ???? CASE 2: User doesn't have employee record (no branch) ? company-wide access
      console.log('???? Branchless User - Updating resignation');
      // No branch restriction for branchless users
    }

    const resignation = await Resignation.findOne({
      where: { id, deleted_at: null },
    });
    if (!resignation)
      return res
        .status(404)
        .json({ success: false, message: 'Resignation not found' });

    const resignationEmployee = await Employee.findOne({
      where: { employee_id: String(resignation.employee_id), deleted_at: null },
    });

    // Determine allowed creators within company/branch
    const allowedUserIds = await getAllUserIdsUnderCompanyBranch(companyId, isCompany(req) ? null : userBranchId);

    // ???? Access validation
    if (!isSuper(req)) {
      if (
        !resignationEmployee ||
        !allowedUserIds.map(String).includes(String(resignationEmployee.created_by))
      ) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: not your branch/company record',
        });
      }

      if (userEmployeeRecord && userEmployeeRecord.branch_id && !isCompany(req) && !isEmployee(req)) {
        // branch-level user: employee must be in same branch
        if (String(resignationEmployee.branch_id) !== String(userBranchId)) {
          return res.status(403).json({
            success: false,
            message: 'Forbidden: different branch',
          });
        }
      }
    }

    // Employee users can only update resignations for themselves
    if (isEmployee(req)) {
      const self = await Employee.findOne({ where: { user_id: req.user.id, deleted_at: null } });
      if (!self || String(self.employee_id) !== String(resignation.employee_id)) {
        return res.status(403).json({ success: false, message: 'Employees can only update their own resignations' });
      }
    }

    // ? If updating employee_id, check if valid and belongs to company
    if (employee_id && employee_id !== resignation.employee_id) {
      const newEmployeeRecord = await Employee.findOne({
        where: { employee_id: String(employee_id), deleted_at: null }
      });
      
      if (!newEmployeeRecord) {
        return res.status(400).json({ success: false, message: 'Employee not found' });
      }

      // Validate new employee belongs to same scope
      if (!isSuper(req)) {
        if (!allowedUserIds.map(String).includes(String(newEmployeeRecord.created_by))) {
          return res.status(403).json({ success: false, message: 'New employee not in your company/branch scope' });
        }

        if (userEmployeeRecord && userEmployeeRecord.branch_id && !isCompany(req) && !isEmployee(req)) {
          if (String(newEmployeeRecord.branch_id) !== String(userBranchId)) {
            return res.status(403).json({ success: false, message: 'New employee not in your branch' });
          }
        }
      }
    }

    // ???? Perform update
    await resignation.update({
      employee_id: employee_id ?? resignation.employee_id,
      resignation_date: resignation_date ?? resignation.resignation_date,
      description: description ?? resignation.description,
      updated_at: new Date(),
    });

    const data = await formatResignationResponse(resignation);
    console.log('? Resignation updated successfully');
    return res.json({
      success: true,
      message: 'Resignation updated successfully',
      data,
    });
  } catch (err) {
    console.error('? Update Resignation Error:', err);
    return res
      .status(500)
      .json({ success: false, message: 'Server error', error: err.message });
  }
};

// =====================
// ???? DELETE RESIGNATION (soft delete)
// =====================
exports.deleteResignation = async (req, res) => {
  try {
    console.log('???? START deleteResignation');
    console.log('???? User Info - ID:', req.user.id, 'Type:', req.user.type);
    
    const { id } = req.params;

    const companyId = await getCompanyId(req);
    if (!companyId && !isSuper(req))
      return res
        .status(403)
        .json({ success: false, message: 'Unauthorized' });

    // ???? Check if user exists in employees table (has branch)
    const userEmployeeRecord = await Employee.findOne({
      where: { user_id: req.user.id },
      attributes: ['branch_id', 'created_by'],
      raw: true,
    });

    console.log('???? User Employee Record:', userEmployeeRecord);

    let branchId = null;

    if (userEmployeeRecord && userEmployeeRecord.branch_id) {
      // ???? CASE 1: User has employee record with branch ? branch-level access
      branchId = userEmployeeRecord.branch_id;
    } else {
      // ???? CASE 2: User doesn't have employee record (no branch) ? company-wide access
      console.log('???? Branchless User - Deleting resignation');
    }

    const resignation = await Resignation.findOne({
      where: { id, deleted_at: null },
    });
    if (!resignation)
      return res
        .status(404)
        .json({ success: false, message: 'Resignation not found' });

    const resignationEmployee = await Employee.findOne({
      where: { employee_id: String(resignation.employee_id), deleted_at: null },
    });

    const allowedUserIds = await getAllUserIdsUnderCompanyBranch(
      companyId,
      isCompany(req) ? null : branchId
    );

    // ???? Access validation
    if (!isSuper(req)) {
      if (
        !resignationEmployee ||
        !allowedUserIds.map(String).includes(String(resignationEmployee.created_by))
      ) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: not your branch/company record',
        });
      }
      if (!isCompany(req) && branchId !== null) {
        if (String(resignationEmployee.branch_id) !== String(branchId)) {
          return res.status(403).json({
            success: false,
            message: 'Forbidden: different branch',
          });
        }
      }
    }

    await resignation.destroy();
    console.log('? Resignation deleted successfully');
    return res.json({
      success: true,
      message: 'Resignation deleted successfully',
      data: { id },
    });
  } catch (err) {
    console.error('? Delete Resignation Error:', err);
    return res
      .status(500)
      .json({ success: false, message: 'Server error', error: err.message });
  }
};


