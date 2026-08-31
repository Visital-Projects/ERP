// const { Op } = require('sequelize');
// const Award = require('../models/award.model');
// const Employee = require('../models/employee.model');
// const AwardType = require('../models/award_type.model');
// const User = require('../models/user.model');


// async function getCompanyId(req) {
//   try {
//     if (!req.user) return null;
//     const type = (req.user.type || '').toLowerCase();

//     if (['company', 'admin', 'super admin'].includes(type)) {
//       return req.user.id;
//     }

//     // If user is an employee (role user mapped to an Employee row), resolve the employee.created_by
//     const emp = await Employee.findOne({
//       where: { user_id: req.user.id },
//       attributes: ['created_by'],
//       raw: true,
//     });

//     if (emp?.created_by) return Number(emp.created_by);
//     // fallback
//     return req.user.created_by || req.user.creator_id || req.user.id;
//   } catch (err) {
//     console.error('getCompanyId Error:', err);
//     return null;
//   }
// }

// function isSuper(req) {
//   return (req.user?.roles || []).some(r => (r.name || '').toLowerCase() === 'super admin');
// }
// function isCompany(req) {
//   return (req.user?.type || '').toLowerCase() === 'company';
// }
// function isEmployee(req) {
//   return (req.user?.type || '').toLowerCase() === 'employee';
// }

// async function getUserBranchId(userId) {
//   if (!userId) return null;
//   const emp = await Employee.findOne({
//     where: { user_id: userId },
//     attributes: ['branch_id'],
//     raw: true,
//   });
//   return emp?.branch_id || null;
// }


// async function getAllUserIdsUnderCompanyBranch(companyId, branchId = null) {
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
//         branch_id: branchId,
//       },
//       attributes: ['user_id'],
//       raw: true
//     });
//     const branchUserIds = emps.map(e => Number(e.user_id));
//     return [...new Set([Number(companyId), ...branchUserIds])];
//   }

//   return Array.from(baseSet);
// }


// async function formatAwardResponse(awardInstance) {
//   if (!awardInstance) return null;
//   const award = awardInstance.toJSON ? awardInstance.toJSON() : awardInstance;

//   // award.employee_id stores business employee id (string) in your schema
//   const employee = await Employee.findOne({
//     where: { employee_id: String(award.employee_id), deleted_at: null },
//     attributes: ['id', 'employee_id', 'name', 'branch_id'],
//     raw: true
//   });

//   let awardType = null;
//   if (award.award_type) {
//     const t = await AwardType.findByPk(award.award_type, { raw: true });
//     if (t) awardType = { id: t.id, title: t.title };
//   }

//   return {
//     id: award.id,
//     employee_id: award.employee_id,
//     employee: employee ? {
//       id: employee.id,
//       employee_id: employee.employee_id,
//       name: employee.name,
//       branch_id: employee.branch_id
//     } : null,
//     award_type: awardType ? awardType : award.award_type,
//     date: award.date,
//     gift: award.gift,
//     description: award.description,
//     created_by: award.created_by,
//     created_at: award.created_at,
//     updated_at: award.updated_at
//   };
// }

// exports.createAward = async (req, res) => {
//   try {
//     const { employee_id, award_type, date, gift, description } = req.body;
//     if (!employee_id || !award_type) {
//       return res.status(400).json({ success: false, message: 'employee_id and award_type are required' });
//     }

//     const companyId = await getCompanyId(req);
//     if (!companyId && !isSuper(req)) return res.status(403).json({ success: false, message: 'Unauthorized' });

//     const userBranchId = await getUserBranchId(req.user.id);
//     if (!isCompany(req) && !isSuper(req) && !userBranchId && !isEmployee(req)) {
//       return res.status(403).json({ success: false, message: 'No branch assigned' });
//     }

//     // Determine allowed creators within company/branch
//     const allowedCreatedBy = await getAllUserIdsUnderCompanyBranch(companyId, isCompany(req) ? null : userBranchId);

//     // Find target employee by business employee_id
//     const employeeRecord = await Employee.findOne({
//       where: { employee_id: String(employee_id), deleted_at: null }
//     });
//     if (!employeeRecord) {
//       return res.status(404).json({ success: false, message: 'Employee not found' });
//     }

//     // Ensure the employee belongs to the current scope
//     // - employeeRecord.created_by should be in allowedCreatedBy (company / branch users)
//     // - branch users must be in same branch
//     if (!isSuper(req)) {
//       if (!allowedCreatedBy.map(String).includes(String(employeeRecord.created_by))) {
//         return res.status(403).json({ success: false, message: 'Employee not in your company/branch scope' });
//       }

//       if (!isCompany(req) && !isEmployee(req)) {
//         // branch-level user: employee must be in same branch
//         if (String(employeeRecord.branch_id) !== String(userBranchId)) {
//           return res.status(403).json({ success: false, message: 'Employee not in your branch' });
//         }
//       }
//     }

//     // Employee users can only create awards for themselves
//     if (isEmployee(req)) {
//       const self = await Employee.findOne({ where: { user_id: req.user.id, deleted_at: null } });
//       if (!self || String(self.employee_id) !== String(employee_id)) {
//         return res.status(403).json({ success: false, message: 'Employees can only create awards for themselves' });
//       }
//     }

//     // Validate award type belongs to the company
//     const awardTypeRecord = await AwardType.findOne({
//       where: { id: award_type, created_by: companyId, deleted_at: null }
//     });
//     if (!awardTypeRecord) {
//       return res.status(400).json({ success: false, message: 'Invalid award_type for your company' });
//     }

//     // Create award — keep employee_id as business employee id (string) consistent with your schema
//     const award = await Award.create({
//       employee_id: String(employee_id),
//       award_type,
//       date: date || new Date(),
//       gift: gift || null,
//       description: description || null,
//       created_by: req.user.id,
//       user_id: req.user.id || null,
//       created_at: new Date(),
//       updated_at: new Date()
//     });

//     const data = await formatAwardResponse(award);
//     return res.status(201).json({ success: true, message: 'Award created', data });
//   } catch (err) {
//     console.error('Create Award Error:', err);
//     return res.status(500).json({ success: false, message: 'Server error', error: err.message });
//   }
// };

// exports.getAllAwards = async (req, res) => {
//   try {
//     // 🟢 SUPER ADMIN: Full access
//     if (isSuper(req)) {
//       const awards = await Award.findAll({
//         where: { deleted_at: null },
//         order: [['id', 'DESC']],
//       });
//       const data = await Promise.all(awards.map(a => formatAwardResponse(a)));
//       return res.json({ success: true, data });
//     }

//     // 🟢 Resolve company + branch
//     const companyId = await getCompanyId(req);
//     if (!companyId)
//       return res.status(403).json({ success: false, message: 'Unauthorized' });

//     // ✅ Define branchId safely
//     const branchId = await getUserBranchId(req.user.id);
//     const isCompanyUserFlag = isCompany(req);

//     // 🟢 COMPANY USER → full access to all subordinate users (all branches)
//     if (isCompanyUserFlag) {
//       const allowedUserIds = await getAllUserIdsUnderCompanyBranch(companyId, null);
//       const awards = await Award.findAll({
//         where: {
//           deleted_at: null,
//           created_by: { [Op.in]: allowedUserIds },
//         },
//         order: [['id', 'DESC']],
//       });
//       const data = await Promise.all(awards.map(a => formatAwardResponse(a)));
//       return res.json({ success: true, data });
//     }

//     // 🟢 BRANCH ROLE USERS → can view & CRUD all awards within same branch
//     if (!branchId)
//       return res.status(403).json({ success: false, message: 'No branch assigned to user' });

//     // 🔸 Find all users belonging to same company + same branch
//     const branchEmployees = await Employee.findAll({
//       where: {
//         created_by: companyId,
//         branch_id: branchId,
//         deleted_at: null,
//       },
//       attributes: ['user_id'],
//       raw: true,
//     });

//     const branchUserIds = branchEmployees.map(e => Number(e.user_id));

//     // Also include company owner in scope (safety)
//     const allowedUserIds = [Number(companyId), ...branchUserIds];

//     // 🔸 Fetch all awards created by any user in same branch
//     const awards = await Award.findAll({
//       where: {
//         deleted_at: null,
//         created_by: { [Op.in]: allowedUserIds },
//       },
//       order: [['id', 'DESC']],
//     });

//     const data = await Promise.all(awards.map(a => formatAwardResponse(a)));
//     return res.json({ success: true, data });

//   } catch (err) {
//     console.error('❌ Get All Awards Error:', err);
//     return res.status(500).json({
//       success: false,
//       message: 'Server error',
//       error: err.message,
//     });
//   }
// };

// exports.getAwardById = async (req, res) => {
//   try {
//     const award = await Award.findOne({
//       where: { id: req.params.id, deleted_at: null },
//     });

//     if (!award) {
//       return res.status(404).json({ success: false, message: 'Award not found' });
//     }

//     // 🟢 Super Admin → full access
//     if (isSuper(req)) {
//       const data = await formatAwardResponse(award);
//       return res.json({ success: true, data });
//     }

//     // 🟢 Resolve company + branch safely
//     const companyId = await getCompanyId(req);
//     if (!companyId) {
//       return res.status(403).json({ success: false, message: 'Unauthorized' });
//     }

//     let branchId = null;
//     try {
//       branchId = await getUserBranchId(req.user.id);
//     } catch (e) {
//       branchId = null;
//     }

//     // 🟢 Fetch employee linked to award
//     const awardEmployee = await Employee.findOne({
//       where: { employee_id: String(award.employee_id), deleted_at: null },
//       raw: true,
//     });

//     if (!awardEmployee) {
//       return res.status(404).json({ success: false, message: 'Employee linked to award not found' });
//     }

//     // 🟢 Collect allowed user IDs based on company + branch
//     const allowedUserIds = await getAllUserIdsUnderCompanyBranch(
//       companyId,
//       isCompany(req) ? null : branchId
//     );

//     // 🔒 Check if employee belongs to allowed users
//     if (!allowedUserIds.map(String).includes(String(awardEmployee.created_by))) {
//       return res.status(403).json({ success: false, message: 'Forbidden: not your company/branch record' });
//     }

//     // 🔒 If role user, check branch matches safely
//     const employeeBranchId = awardEmployee.branch_id || null; // ✅ fallback
//     if (!isCompany(req) && branchId !== null) {
//       if (String(employeeBranchId) !== String(branchId)) {
//         return res.status(403).json({ success: false, message: 'Forbidden: different branch' });
//       }
//     }

//     // ✅ Return formatted award
//     const data = await formatAwardResponse(award);
//     return res.json({ success: true, data });

//   } catch (err) {
//     console.error('❌ Get Award By ID Error:', err);
//     return res.status(500).json({
//       success: false,
//       message: 'Server error',
//       error: err.message,
//     });
//   }
// };

// exports.updateAward = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { employee_id, award_type, date, gift, description } = req.body;

//     const companyId = await getCompanyId(req);
//     if (!companyId && !isSuper(req))
//       return res
//         .status(403)
//         .json({ success: false, message: 'Unauthorized' });

//     const branchId = await getUserBranchId(req.user.id);
//     const award = await Award.findOne({
//       where: { id, deleted_at: null },
//     });
//     if (!award)
//       return res
//         .status(404)
//         .json({ success: false, message: 'Award not found' });

//     const awardEmployee = await Employee.findOne({
//       where: { employee_id: String(award.employee_id), deleted_at: null },
//     });

//     const allowedUserIds = await getAllUserIdsUnderCompanyBranch(
//       companyId,
//       isCompany(req) ? null : branchId
//     );

//     // 🟢 Access validation
//     if (!isSuper(req)) {
//       if (
//         !awardEmployee ||
//         !allowedUserIds.map(String).includes(String(awardEmployee.created_by))
//       ) {
//         return res.status(403).json({
//           success: false,
//           message: 'Forbidden: not your branch/company record',
//         });
//       }
//       if (!isCompany(req)) {
//         if (String(awardEmployee.branch_id) !== String(branchId)) {
//           return res.status(403).json({
//             success: false,
//             message: 'Forbidden: different branch',
//           });
//         }
//       }
//     }

//     // 🟢 Perform update
//     await award.update({
//       employee_id: employee_id ?? award.employee_id,
//       award_type: award_type ?? award.award_type,
//       date: date ?? award.date,
//       gift: gift ?? award.gift,
//       description: description ?? award.description,
//       updated_at: new Date(),
//     });

//     const data = await formatAwardResponse(award);
//     return res.json({
//       success: true,
//       message: 'Award updated successfully',
//       data,
//     });
//   } catch (err) {
//     console.error('❌ Update Award Error:', err);
//     return res
//       .status(500)
//       .json({ success: false, message: 'Server error', error: err.message });
//   }
// };


// exports.deleteAward = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const companyId = await getCompanyId(req);
//     if (!companyId && !isSuper(req))
//       return res
//         .status(403)
//         .json({ success: false, message: 'Unauthorized' });

//     const branchId = await getUserBranchId(req.user.id);
//     const award = await Award.findOne({
//       where: { id, deleted_at: null },
//     });
//     if (!award)
//       return res
//         .status(404)
//         .json({ success: false, message: 'Award not found' });

//     const awardEmployee = await Employee.findOne({
//       where: { employee_id: String(award.employee_id), deleted_at: null },
//     });

//     const allowedUserIds = await getAllUserIdsUnderCompanyBranch(
//       companyId,
//       isCompany(req) ? null : branchId
//     );

//     // 🟢 Access validation
//     if (!isSuper(req)) {
//       if (
//         !awardEmployee ||
//         !allowedUserIds.map(String).includes(String(awardEmployee.created_by))
//       ) {
//         return res.status(403).json({
//           success: false,
//           message: 'Forbidden: not your branch/company record',
//         });
//       }
//       if (!isCompany(req)) {
//         if (String(awardEmployee.branch_id) !== String(branchId)) {
//           return res.status(403).json({
//             success: false,
//             message: 'Forbidden: different branch',
//           });
//         }
//       }
//     }

//     await award.destroy();
//     return res.json({
//       success: true,
//       message: 'Award deleted successfully',
//       data: { id },
//     });
//   } catch (err) {
//     console.error('❌ Delete Award Error:', err);
//     return res
//       .status(500)
//       .json({ success: false, message: 'Server error', error: err.message });
//   }
// };



const { Op } = require('sequelize');
const Award = require('../models/award.model');
const Employee = require('../models/employee.model');
const AwardType = require('../models/award_type.model');
const User = require('../models/user.model');


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


async function formatAwardResponse(awardInstance) {
  if (!awardInstance) return null;
  const award = awardInstance.toJSON ? awardInstance.toJSON() : awardInstance;

  // award.employee_id stores business employee id (string) in your schema
  const employee = await Employee.findOne({
    where: { employee_id: String(award.employee_id), deleted_at: null },
    attributes: ['id', 'employee_id', 'name', 'branch_id'],
    raw: true
  });

  let awardType = null;
  if (award.award_type) {
    const t = await AwardType.findByPk(award.award_type, { raw: true });
    if (t) awardType = { id: t.id, title: t.title };
  }

  return {
    id: award.id,
    employee_id: award.employee_id,
    employee: employee ? {
      id: employee.id,
      employee_id: employee.employee_id,
      name: employee.name,
      branch_id: employee.branch_id
    } : null,
    award_type: awardType ? awardType : award.award_type,
    date: award.date,
    gift: award.gift,
    description: award.description,
    created_by: award.created_by,
    created_at: award.created_at,
    updated_at: award.updated_at
  };
}

exports.createAward = async (req, res) => {
  try {
    console.log('???? START createAward');
    console.log('???? User Info - ID:', req.user.id, 'Type:', req.user.type);
    
    const { employee_id, award_type, date, gift, description } = req.body;
    if (!employee_id || !award_type) {
      return res.status(400).json({ success: false, message: 'employee_id and award_type are required' });
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
      console.log('???? Branch User - Creating award');
      userBranchId = userEmployeeRecord.branch_id;
    } else {
      // ???? CASE 2: User doesn't have employee record (no branch) ? company-wide access
      console.log('???? Branchless User - Creating award');
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

    // Employee users can only create awards for themselves
    if (isEmployee(req)) {
      const self = await Employee.findOne({ where: { user_id: req.user.id, deleted_at: null } });
      if (!self || String(self.employee_id) !== String(employee_id)) {
        return res.status(403).json({ success: false, message: 'Employees can only create awards for themselves' });
      }
    }

    // Validate award type belongs to the company
    const awardTypeRecord = await AwardType.findOne({
      where: { id: award_type, deleted_at: null }
    });
    if (!awardTypeRecord) {
      return res.status(400).json({ success: false, message: 'Invalid award_type for your company' });
    }

    // Create award — keep employee_id as business employee id (string) consistent with your schema
    const award = await Award.create({
      employee_id: String(employee_id),
      award_type,
      date: date || new Date(),
      gift: gift || null,
      description: description || null,
      created_by: req.user.id,
      user_id: req.user.id || null,
      created_at: new Date(),
      updated_at: new Date()
    });

    const data = await formatAwardResponse(award);
    console.log('? Award created successfully');
    return res.status(201).json({ success: true, message: 'Award created', data });
  } catch (err) {
    console.error('? Create Award Error:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

exports.getAllAwards = async (req, res) => {
  try {
    console.log('???? START getAllAwards');
    console.log('???? User Info - ID:', req.user.id, 'Type:', req.user.type);

    // ???? SUPER ADMIN: Full access
    if (isSuper(req)) {
      console.log('???? Super Admin Access');
      const awards = await Award.findAll({
        where: { deleted_at: null },
        order: [['id', 'DESC']],
      });
      console.log('???? Super Admin Awards Count:', awards.length);
      const data = await Promise.all(awards.map(a => formatAwardResponse(a)));
      return res.json({ success: true, data });
    }

    // ???? Check if user exists in employees table (has branch)
    const userEmployeeRecord = await Employee.findOne({
      where: { user_id: req.user.id },
      attributes: ['branch_id', 'created_by'],
      raw: true,
    });

    console.log('???? User Employee Record:', userEmployeeRecord);

    let awards = [];

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
        //   created_by: companyId,
          branch_id: branchId,
          deleted_at: null,
        },
        attributes: ['employee_id'],
        raw: true,
      });

      const branchEmployeeIds = branchEmployees.map(e => String(e.employee_id));
      console.log('???? Branch Employee IDs:', branchEmployeeIds);

      // ???? STEP 2: Fetch awards for employees in the same branch
      awards = await Award.findAll({
        where: {
          deleted_at: null,
          employee_id: { [Op.in]: branchEmployeeIds },
        },
        order: [['id', 'DESC']],
      });

    } else {
      // ???? CASE 2: User doesn't have employee record (no branch) ? FULL DATABASE ACCESS
      console.log('???? Branchless User Access (FULL DATABASE)');
      
      // ???? DIRECTLY GET ALL AWARDS - no company filter
      awards = await Award.findAll({
        where: { deleted_at: null },
        order: [['id', 'DESC']],
      });
      
      console.log('???? Branchless User - All Awards Count:', awards.length);
    }

    console.log('???? Final Awards Count:', awards.length);
    const data = await Promise.all(awards.map(a => formatAwardResponse(a)));
    console.log('? END getAllAwards - Success');
    return res.json({ success: true, data });

  } catch (err) {
    console.error('? Get All Awards Error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message,
    });
  }
};

exports.getAwardById = async (req, res) => {
  try {
    console.log('???? START getAwardById');
    console.log('???? User Info - ID:', req.user.id, 'Type:', req.user.type);
    
    const award = await Award.findOne({
      where: { id: req.params.id, deleted_at: null },
    });

    if (!award) {
      return res.status(404).json({ success: false, message: 'Award not found' });
    }

    // ???? Super Admin ? full access
    if (isSuper(req)) {
      const data = await formatAwardResponse(award);
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

      // ???? STEP 1: Get the employee linked to the award
      const awardEmployee = await Employee.findOne({
        where: { employee_id: String(award.employee_id), deleted_at: null },
        raw: true,
      });

      if (!awardEmployee) {
        return res.status(404).json({ success: false, message: 'Employee linked to award not found' });
      }

      // ???? STEP 2: Check if the award employee belongs to the same branch as the current user
      const employeeBranchId = awardEmployee.branch_id || null;
      
      console.log('???? Award Employee Branch ID:', employeeBranchId);
      console.log('???? Current User Branch ID:', userEmployeeRecord.branch_id);

      if (String(employeeBranchId) !== String(userEmployeeRecord.branch_id)) {
        return res.status(403).json({ success: false, message: 'Forbidden: award belongs to different branch' });
      }

      // ???? STEP 3: Remove company check since branch employees can be created by branch managers
      // No need to check created_by since we only care about branch assignment

    } else {
      // ???? CASE 2: User doesn't have employee record (no branch) ? FULL ACCESS
      console.log('???? Branchless User - Full award access');
      // No additional checks needed - branchless users can access any award
    }

    // ? Return formatted award
    const data = await formatAwardResponse(award);
    console.log('? END getAwardById - Success');
    return res.json({ success: true, data });

  } catch (err) {
    console.error('? Get Award By ID Error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message,
    });
  }
};

exports.updateAward = async (req, res) => {
  try {
    console.log('???? START updateAward');
    console.log('???? User Info - ID:', req.user.id, 'Type:', req.user.type);
    
    const { id } = req.params;
    const { employee_id, award_type, date, gift, description } = req.body;

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
      console.log('???? Branch User - Updating award');
      userBranchId = userEmployeeRecord.branch_id;
    } else {
      // ???? CASE 2: User doesn't have employee record (no branch) ? company-wide access
      console.log('???? Branchless User - Updating award');
      // No branch restriction for branchless users
    }

    const award = await Award.findOne({
      where: { id, deleted_at: null },
    });
    if (!award)
      return res
        .status(404)
        .json({ success: false, message: 'Award not found' });

    const awardEmployee = await Employee.findOne({
      where: { employee_id: String(award.employee_id), deleted_at: null },
    });

    // Determine allowed creators within company/branch
    const allowedUserIds = await getAllUserIdsUnderCompanyBranch(companyId, isCompany(req) ? null : userBranchId);

    // ???? Access validation
    if (!isSuper(req)) {
      if (
        !awardEmployee ||
        !allowedUserIds.map(String).includes(String(awardEmployee.created_by))
      ) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: not your branch/company record',
        });
      }

      if (userEmployeeRecord && userEmployeeRecord.branch_id && !isCompany(req) && !isEmployee(req)) {
        // branch-level user: employee must be in same branch
        if (String(awardEmployee.branch_id) !== String(userBranchId)) {
          return res.status(403).json({
            success: false,
            message: 'Forbidden: different branch',
          });
        }
      }
    }

    // Employee users can only update awards for themselves
    if (isEmployee(req)) {
      const self = await Employee.findOne({ where: { user_id: req.user.id, deleted_at: null } });
      if (!self || String(self.employee_id) !== String(award.employee_id)) {
        return res.status(403).json({ success: false, message: 'Employees can only update their own awards' });
      }
    }

    // Validate award type belongs to the company (if award_type is being updated)
    if (award_type && award_type !== award.award_type) {
      const awardTypeRecord = await AwardType.findOne({
        where: { id: award_type, deleted_at: null }
      });
      if (!awardTypeRecord) {
        return res.status(400).json({ success: false, message: 'Invalid award_type for your company' });
      }
    }

    // ???? Perform update
    await award.update({
      employee_id: employee_id ?? award.employee_id,
      award_type: award_type ?? award.award_type,
      date: date ?? award.date,
      gift: gift ?? award.gift,
      description: description ?? award.description,
      updated_at: new Date(),
    });

    const data = await formatAwardResponse(award);
    console.log('? Award updated successfully');
    return res.json({
      success: true,
      message: 'Award updated successfully',
      data,
    });
  } catch (err) {
    console.error('? Update Award Error:', err);
    return res
      .status(500)
      .json({ success: false, message: 'Server error', error: err.message });
  }
};


exports.deleteAward = async (req, res) => {
  try {
    console.log('???? START deleteAward');
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
      console.log('???? Branchless User - Deleting award');
    }

    const award = await Award.findOne({
      where: { id, deleted_at: null },
    });
    if (!award)
      return res
        .status(404)
        .json({ success: false, message: 'Award not found' });

    const awardEmployee = await Employee.findOne({
      where: { employee_id: String(award.employee_id), deleted_at: null },
    });

    const allowedUserIds = await getAllUserIdsUnderCompanyBranch(
      companyId,
      isCompany(req) ? null : branchId
    );

    // ???? Access validation
    if (!isSuper(req)) {
      if (
        !awardEmployee ||
        !allowedUserIds.map(String).includes(String(awardEmployee.created_by))
      ) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: not your branch/company record',
        });
      }
      if (!isCompany(req) && branchId !== null) {
        if (String(awardEmployee.branch_id) !== String(branchId)) {
          return res.status(403).json({
            success: false,
            message: 'Forbidden: different branch',
          });
        }
      }
    }

    await award.destroy();
    console.log('? Award deleted successfully');
    return res.json({
      success: true,
      message: 'Award deleted successfully',
      data: { id },
    });
  } catch (err) {
    console.error('? Delete Award Error:', err);
    return res
      .status(500)
      .json({ success: false, message: 'Server error', error: err.message });
  }
};





