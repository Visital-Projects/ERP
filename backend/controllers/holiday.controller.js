

// // controllers/holiday.controller.js
// const Holiday = require('../models/holiday.model');
// const Employee = require('../models/employee.model');

// // =====================
// // Helper: format holiday response
// // =====================
// const formatHolidayResponse = async (holiday) => {
//   if (!holiday) return null;
//   const json = holiday.toJSON();
//   return {
//     id: json.id,
//     date: json.date,
//     end_date: json.end_date,
//     occasion: json.occasion,
//     created_by: json.created_by,
//     created_at: json.created_at,
//     updated_at: json.updated_at
//   };
// };

// // =====================
// // GET ALL HOLIDAYS
// // =====================
// exports.getAllHolidays = async (req, res) => {
//   try {
//     if (req.user.type === 'company') {
//       // Company sees only its own holidays
//       const holidays = await Holiday.findAll({
//         where: { created_by: req.user.id },
//         order: [['date', 'ASC']]
//       });
//       const responseData = await Promise.all(holidays.map(h => formatHolidayResponse(h)));
//       return res.json({ success: true, data: responseData });
//     }

//     if (req.user.type === 'Employee') {
//       // Employee sees holidays of their company
//       const emp = await Employee.findOne({ where: { user_id: req.user.id } });
//       if (!emp) {
//         return res.status(403).json({ success: false, message: 'Employee profile not found' });
//       }

//       const holidays = await Holiday.findAll({
//         where: { created_by: emp.created_by },
//         order: [['date', 'ASC']]
//       });
//       const responseData = await Promise.all(holidays.map(h => formatHolidayResponse(h)));
//       return res.json({ success: true, data: responseData });
//     }

//     // Other roles (HR, Manager, etc.) — fallback logic
//     const emp = await Employee.findOne({ where: { user_id: req.user.id } });
//     let whereClause = {};
//     if (emp) whereClause.created_by = emp.created_by;

//     const holidays = await Holiday.findAll({ where: whereClause, order: [['date', 'ASC']] });
//     const responseData = await Promise.all(holidays.map(h => formatHolidayResponse(h)));
//     return res.json({ success: true, data: responseData });
//   } catch (error) {
//     console.error('Get All Holidays Error:', error);
//     res.status(500).json({ success: false, message: 'Server error', error: error.message });
//   }
// };

// // =====================
// // GET HOLIDAY BY ID
// // =====================
// exports.getHolidayById = async (req, res) => {
//   try {
//     let whereClause = { id: req.params.id };

//     if (req.user.type === 'company') {
//       // Company can only fetch its own holiday
//       whereClause.created_by = req.user.id;
//     } else if (req.user.type === 'Employee') {
//       // Employee can fetch holidays of their company
//       const emp = await Employee.findOne({ where: { user_id: req.user.id } });
//       if (!emp) {
//         return res.status(403).json({ success: false, message: 'Employee profile not found' });
//       }
//       whereClause.created_by = emp.created_by;
//     } else {
//       // Other roles
//       const emp = await Employee.findOne({ where: { user_id: req.user.id } });
//       if (emp) whereClause.created_by = emp.created_by;
//     }

//     const holiday = await Holiday.findOne({ where: whereClause });
//     if (!holiday) {
//       return res.status(404).json({ success: false, message: 'Holiday not found' });
//     }

//     const responseData = await formatHolidayResponse(holiday);
//     return res.json({ success: true, data: responseData });
//   } catch (error) {
//     console.error('Get Holiday By ID Error:', error);
//     res.status(500).json({ success: false, message: 'Server error', error: error.message });
//   }
// };

// // =====================
// // CREATE HOLIDAY
// // =====================
// exports.createHoliday = async (req, res) => {
//   try {
//     const { date, end_date, occasion } = req.body;

//     // === COMPANY USERS ===
//     if (req.user.type === 'company') {
//       const holiday = await Holiday.create({
//         date,
//         end_date,
//         occasion,
//         created_by: req.user.id,
//         created_at: new Date(),
//         updated_at: new Date()
//       });
//       return res.status(201).json({ success: true, message: 'Holiday created', data: await formatHolidayResponse(holiday) });
//     }

//     // === EMPLOYEE USERS ===
//     if (req.user.type === 'Employee') {
//       const emp = await Employee.findOne({ where: { user_id: req.user.id } });
//       if (!emp) return res.status(403).json({ success: false, message: 'Employee profile not found' });

//       const holiday = await Holiday.create({
//         date,
//         end_date,
//         occasion,
//         created_by: emp.created_by,
//         created_at: new Date(),
//         updated_at: new Date()
//       });
//       return res.status(201).json({ success: true, message: 'Holiday created', data: await formatHolidayResponse(holiday) });
//     }

//     // === OTHER ROLES (HR, Manager, etc.) ===
//     const emp = await Employee.findOne({ where: { user_id: req.user.id } });
//     if (!emp) return res.status(403).json({ success: false, message: 'Employee profile not found' });

//     const holiday = await Holiday.create({
//       date,
//       end_date,
//       occasion,
//       created_by: emp.created_by,
//       created_at: new Date(),
//       updated_at: new Date()
//     });

//     return res.status(201).json({ success: true, message: 'Holiday created', data: await formatHolidayResponse(holiday) });
//   } catch (error) {
//     console.error('Create Holiday Error:', error);
//     res.status(500).json({ success: false, message: 'Server error', error: error.message });
//   }
// };

// // =====================
// // UPDATE HOLIDAY
// // =====================
// exports.updateHoliday = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { date, end_date, occasion } = req.body;

//     // === COMPANY USERS ===
//     if (req.user.type === 'company') {
//       const holiday = await Holiday.findOne({ where: { id, created_by: req.user.id } });
//       if (!holiday) return res.status(404).json({ success: false, message: 'Holiday not found in your company' });

//       await holiday.update({ date, end_date, occasion, updated_at: new Date() });
//       return res.json({ success: true, message: 'Holiday updated', data: await formatHolidayResponse(holiday) });
//     }

//     // === EMPLOYEE USERS ===
//     if (req.user.type === 'Employee') {
//       const emp = await Employee.findOne({ where: { user_id: req.user.id } });
//       if (!emp) return res.status(403).json({ success: false, message: 'Employee profile not found' });

//       const holiday = await Holiday.findOne({ where: { id, created_by: emp.created_by } });
//       if (!holiday) return res.status(404).json({ success: false, message: 'Holiday not found for your company' });

//       await holiday.update({ date, end_date, occasion, updated_at: new Date() });
//       return res.json({ success: true, message: 'Holiday updated', data: await formatHolidayResponse(holiday) });
//     }

//     // === OTHER ROLES ===
//     const emp = await Employee.findOne({ where: { user_id: req.user.id } });
//     if (!emp) return res.status(403).json({ success: false, message: 'Employee profile not found' });

//     const holiday = await Holiday.findOne({ where: { id, created_by: emp.created_by } });
//     if (!holiday) return res.status(404).json({ success: false, message: 'Holiday not found for your company' });

//     await holiday.update({ date, end_date, occasion, updated_at: new Date() });
//     return res.json({ success: true, message: 'Holiday updated', data: await formatHolidayResponse(holiday) });
//   } catch (error) {
//     console.error('Update Holiday Error:', error);
//     res.status(500).json({ success: false, message: 'Server error', error: error.message });
//   }
// };

// // =====================
// // DELETE HOLIDAY
// // =====================
// exports.deleteHoliday = async (req, res) => {
//   try {
//     const { id } = req.params;

//     // === COMPANY USERS ===
//     if (req.user.type === 'company') {
//       const holiday = await Holiday.findOne({ where: { id, created_by: req.user.id } });
//       if (!holiday) return res.status(404).json({ success: false, message: 'Holiday not found in your company' });

//       await holiday.destroy();
//       return res.json({ success: true, message: 'Holiday deleted', data: { id } });
//     }

//     // === EMPLOYEE USERS ===
//     if (req.user.type === 'Employee') {
//       const emp = await Employee.findOne({ where: { user_id: req.user.id } });
//       if (!emp) return res.status(403).json({ success: false, message: 'Employee profile not found' });

//       const holiday = await Holiday.findOne({ where: { id, created_by: emp.created_by } });
//       if (!holiday) return res.status(404).json({ success: false, message: 'Holiday not found for your company' });

//       await holiday.destroy();
//       return res.json({ success: true, message: 'Holiday deleted', data: { id } });
//     }

//     // === OTHER ROLES ===
//     const emp = await Employee.findOne({ where: { user_id: req.user.id } });
//     if (!emp) return res.status(403).json({ success: false, message: 'Employee profile not found' });

//     const holiday = await Holiday.findOne({ where: { id, created_by: emp.created_by } });
//     if (!holiday) return res.status(404).json({ success: false, message: 'Holiday not found for your company' });

//     await holiday.destroy();
//     return res.json({ success: true, message: 'Holiday deleted', data: { id } });
//   } catch (error) {
//     console.error('Delete Holiday Error:', error);
//     res.status(500).json({ success: false, message: 'Server error', error: error.message });
//   }
// };















// // controllers/holiday.controller.js
// const { Op } = require('sequelize');
// const Holiday = require('../models/holiday.model');
// const Employee = require('../models/employee.model');

// // =====================
// // 🔹 Helpers (mirrors termination.controller.js helpers)
// // =====================
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
//   return (req.user?.roles || []).some(
//     (r) => (r.name || '').toLowerCase() === 'super admin'
//   );
// }

// function isCompany(req) {
//   return (req.user?.type || '').toLowerCase() === 'company';
// }

// function isEmployee(req) {
//   return (req.user?.type || '').toLowerCase() === 'employee';
// }

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
//   // Note: we use Employee model to discover users under the company (consistent with termination.controller)
//   const users = await Employee.findAll({
//     where: { created_by: companyId },
//     attributes: ['user_id'],
//     raw: true,
//   });
//   const userIds = users.map((u) => Number(u.user_id));
//   const baseSet = new Set([Number(companyId), ...userIds]);

//   if (branchId) {
//     if (userIds.length === 0) return [Number(companyId)];
//     const emps = await Employee.findAll({
//       where: { user_id: { [Op.in]: userIds }, branch_id: branchId },
//       attributes: ['user_id'],
//       raw: true,
//     });
//     const branchUserIds = emps.map((e) => Number(e.user_id));
//     return [...new Set([Number(companyId), ...branchUserIds])];
//   }

//   return Array.from(baseSet);
// }

// // =====================
// // Helper: format holiday response
// // =====================
// const formatHolidayResponse = async (holiday) => {
//   if (!holiday) return null;
//   const json = holiday.toJSON();
//   return {
//     id: json.id,
//     date: json.date,
//     end_date: json.end_date,
//     occasion: json.occasion,
//     created_by: json.created_by,
//     created_at: json.created_at,
//     updated_at: json.updated_at,
//   };
// };

// // =====================
// // GET ALL HOLIDAYS
// // =====================
// exports.getAllHolidays = async (req, res) => {
//   try {
//     // Super admin -> unrestricted across companies (but exclude soft-deleted)
//     if (isSuper(req)) {
//       const holidays = await Holiday.findAll({
//         where: { deleted_at: null },
//         order: [['date', 'ASC']],
//       });
//       const responseData = await Promise.all(holidays.map((h) => formatHolidayResponse(h)));
//       return res.json({ success: true, data: responseData });
//     }

//     // require company context for non-super users
//     const companyId = await getCompanyId(req);
//     if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

//     // branch-based allowed creators
//     const branchId = isCompany(req) ? null : await getUserBranchId(req.user.id);
//     const allowedCreatedBy = await getAllUserIdsUnderCompanyBranch(companyId, branchId);

//     const holidays = await Holiday.findAll({
//       where: { created_by: { [Op.in]: allowedCreatedBy }, deleted_at: null },
//       order: [['date', 'ASC']],
//     });

//     const responseData = await Promise.all(holidays.map((h) => formatHolidayResponse(h)));
//     return res.json({ success: true, data: responseData });
//   } catch (error) {
//     console.error('Get All Holidays Error:', error);
//     res.status(500).json({ success: false, message: 'Server error', error: error.message });
//   }
// };

// // =====================
// // GET HOLIDAY BY ID
// // =====================
// exports.getHolidayById = async (req, res) => {
//   try {
//     const holiday = await Holiday.findOne({
//       where: { id: req.params.id, deleted_at: null },
//     });
//     if (!holiday) {
//       return res.status(404).json({ success: false, message: 'Holiday not found' });
//     }

//     // non-super users must be allowed by branch/company
//     if (!isSuper(req)) {
//       const companyId = await getCompanyId(req);
//       if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

//       const branchId = isCompany(req) ? null : await getUserBranchId(req.user.id);
//       const allowedCreatedBy = await getAllUserIdsUnderCompanyBranch(companyId, branchId);

//       if (!allowedCreatedBy.map(String).includes(String(holiday.created_by))) {
//         return res.status(403).json({ success: false, message: 'Forbidden: not your record' });
//       }
//     }

//     const responseData = await formatHolidayResponse(holiday);
//     return res.json({ success: true, data: responseData });
//   } catch (error) {
//     console.error('Get Holiday By ID Error:', error);
//     res.status(500).json({ success: false, message: 'Server error', error: error.message });
//   }
// };

// // =====================
// // CREATE HOLIDAY
// // =====================
// exports.createHoliday = async (req, res) => {
//   try {
//     const { date, end_date, occasion } = req.body;

//     const loggedInUserId = req.user.id;
//     const companyId = await getCompanyId(req);
//     if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

//     // Optional: require branch assignment for non-company users (common pattern)
//     if (!isCompany(req) && !isSuper(req)) {
//       const userBranch = await getUserBranchId(req.user.id);
//       if (!userBranch) return res.status(403).json({ success: false, message: 'No branch assigned' });
//     }

//     const holiday = await Holiday.create({
//       date,
//       end_date,
//       occasion,
//       created_by: loggedInUserId, // ✅ always logged-in user's id
//       created_at: new Date(),
//       updated_at: new Date(),
//     });

//     return res.status(201).json({ success: true, message: 'Holiday created', data: await formatHolidayResponse(holiday) });
//   } catch (error) {
//     console.error('Create Holiday Error:', error);
//     res.status(500).json({ success: false, message: 'Server error', error: error.message });
//   }
// };

// // =====================
// // UPDATE HOLIDAY
// // =====================
// exports.updateHoliday = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { date, end_date, occasion } = req.body;

//     // Super can update any (but ignore soft-deleted)
//     if (isSuper(req)) {
//       const holiday = await Holiday.findOne({ where: { id, deleted_at: null } });
//       if (!holiday) return res.status(404).json({ success: false, message: 'Holiday not found' });

//       await holiday.update({
//         date: date ?? holiday.date,
//         end_date: end_date ?? holiday.end_date,
//         occasion: occasion ?? holiday.occasion,
//         updated_at: new Date(),
//       });

//       return res.json({ success: true, message: 'Holiday updated', data: await formatHolidayResponse(holiday) });
//     }

//     // non-super: compute allowedCreatedBy via branch
//     const companyId = await getCompanyId(req);
//     if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

//     const branchId = isCompany(req) ? null : await getUserBranchId(req.user.id);
//     if (!isCompany(req) && !branchId) return res.status(403).json({ success: false, message: 'No branch assigned' });

//     const allowedCreatedBy = await getAllUserIdsUnderCompanyBranch(companyId, branchId);

//     const holiday = await Holiday.findOne({
//       where: { id, created_by: { [Op.in]: allowedCreatedBy }, deleted_at: null },
//     });
//     if (!holiday) return res.status(404).json({ success: false, message: 'Holiday not found' });

//     await holiday.update({
//       date: date ?? holiday.date,
//       end_date: end_date ?? holiday.end_date,
//       occasion: occasion ?? holiday.occasion,
//       updated_at: new Date(),
//     });

//     return res.json({ success: true, message: 'Holiday updated', data: await formatHolidayResponse(holiday) });
//   } catch (error) {
//     console.error('Update Holiday Error:', error);
//     res.status(500).json({ success: false, message: 'Server error', error: error.message });
//   }
// };

// // =====================
// // DELETE HOLIDAY (Soft Delete)
// // =====================
// exports.deleteHoliday = async (req, res) => {
//   try {
//     const { id } = req.params;

//     // === Super Admin → soft delete any holiday ===
//     if (isSuper(req)) {
//       const holiday = await Holiday.findOne({ where: { id, deleted_at: null } });
//       if (!holiday) return res.status(404).json({ success: false, message: 'Holiday not found' });

//       await holiday.update({ deleted_at: new Date() });
//       return res.json({ success: true, message: 'Holiday soft deleted', data: { id } });
//     }

//     // === Get company & branch info ===
//     const companyId = await getCompanyId(req);
//     if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

//     const branchId = isCompany(req) ? null : await getUserBranchId(req.user.id);
//     if (!isCompany(req) && !branchId) return res.status(403).json({ success: false, message: 'No branch assigned' });

//     // === Get allowed user IDs for this company & branch ===
//     const allowedCreatedBy = await getAllUserIdsUnderCompanyBranch(companyId, branchId);
//     if (!allowedCreatedBy || allowedCreatedBy.length === 0) {
//       return res.status(404).json({ success: false, message: 'No employees found under your branch/company' });
//     }

//     // === Find holiday to delete ===
//     const holiday = await Holiday.findOne({
//       where: {
//         id,
//         created_by: { [Op.in]: allowedCreatedBy },
//         deleted_at: null
//       },
//     });

//     if (!holiday) return res.status(404).json({ success: false, message: 'Holiday not found or already deleted' });

//     // 🔹 Log the holiday row before update (for debugging)
//     console.log('Holiday before soft delete:', holiday.toJSON());

//     // === Soft delete ===
//     await holiday.update({ deleted_at: new Date() });

//     // 🔹 Log after update
//     console.log('Holiday after soft delete:', holiday.toJSON());

//     return res.json({ success: true, message: 'Holiday soft deleted', data: { id } });
//   } catch (error) {
//     console.error('Delete Holiday Error:', error);
//     return res.status(500).json({ success: false, message: 'Server error', error: error.message });
//   }
// };




// controllers/holiday.controller.js
const { Op } = require('sequelize');
const Holiday = require('../models/holiday.model');
const Employee = require('../models/employee.model');
const User = require('../models/user.model');

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
// 🔹 Format Holiday Response
// =====================
const formatHolidayResponse = async (holiday) => {
  if (!holiday) return null;
  const json = holiday.toJSON ? holiday.toJSON() : holiday;

  return {
    id: json.id,
    date: json.date,
    end_date: json.end_date,
    occasion: json.occasion,
    created_by: json.created_by,
    created_at: json.created_at,
    updated_at: json.updated_at
  };
};

// =====================
// 🔹 CREATE HOLIDAY
// =====================
exports.createHoliday = async (req, res) => {
  try {
    console.log('🎯 START createHoliday');
    console.log('🔍 User Info - ID:', req.user.id, 'Type:', req.user.type);
    
    const { date, end_date, occasion } = req.body;
    if (!date || !occasion) {
      return res.status(400).json({ success: false, message: 'date and occasion are required' });
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
      console.log('🟡 Branch User - Creating holiday');
      userBranchId = userEmployeeRecord.branch_id;
    } else {
      // 🟢 CASE 2: User doesn't have employee record (no branch) → company-wide access
      console.log('🟡 Branchless User - Creating holiday');
      // No branch restriction for branchless users
    }

    // 🟢 FIX: Only require branch for branch users, not branchless users
    if (!isCompany(req) && !isSuper(req) && userEmployeeRecord && !userBranchId && !isEmployee(req)) {
      return res.status(403).json({ success: false, message: 'No branch assigned' });
    }

    // Determine allowed creators within company/branch
    const allowedCreatedBy = await getAllUserIdsUnderCompanyBranch(companyId, isCompany(req) ? null : userBranchId);

    // Create holiday
    const holiday = await Holiday.create({
      date: date,
      end_date: end_date || null,
      occasion: occasion,
      created_by: req.user.id,
      created_at: new Date(),
      updated_at: new Date()
    });

    const data = await formatHolidayResponse(holiday);
    console.log('✅ Holiday created successfully');
    return res.status(201).json({ success: true, message: 'Holiday created', data });
  } catch (err) {
    console.error('❌ Create Holiday Error:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};


// =====================
// 🔹 GET ALL HOLIDAYS
// =====================
exports.getAllHolidays = async (req, res) => {
  try {
    console.log('🎯 START getAllHolidays');
    console.log('🔍 User Info - ID:', req.user.id, 'Type:', req.user.type);

    // 🟢 SUPER ADMIN: Full access
    if (isSuper(req)) {
      console.log('🟡 Super Admin Access');
      const holidays = await Holiday.findAll({
        where: { deleted_at: null },
        order: [['date', 'ASC']],
      });
      console.log('🟡 Super Admin Holidays Count:', holidays.length);
      const data = await Promise.all(holidays.map(h => formatHolidayResponse(h)));
      return res.json({ success: true, data });
    }

    // 🟢 Check if user exists in employees table (has branch)
    const userEmployeeRecord = await Employee.findOne({
      where: { user_id: req.user.id },
      attributes: ['branch_id', 'created_by'],
      raw: true,
    });

    console.log('🔍 User Employee Record:', userEmployeeRecord);

    let holidays = [];

    if (userEmployeeRecord && userEmployeeRecord.branch_id) {
      // 🟢 CASE 1: User has employee record with branch → branch-level access
      console.log('🟡 Branch User Access');
      const branchId = userEmployeeRecord.branch_id;
      console.log('🔍 Branch ID:', branchId);
      
      // Get company ID for branch users
      const companyId = await getCompanyId(req);
      console.log('🔍 Company ID for Branch User:', companyId);
      
      if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

      // 🟢 STEP 1: Get ALL COMPANY USERS
      const allCompanyUsers = await User.findAll({
        where: { created_by: companyId },
        attributes: ['id'],
        raw: true,
      });
      
      // 🟢 STEP 2: Identify BRANCHLESS USERS (users without employee records)
      const branchlessUserIds = [];
      for (const user of allCompanyUsers) {
        const empRecord = await Employee.findOne({
          where: { user_id: user.id },
          attributes: ['id'],
          raw: true,
        });
        if (!empRecord) {
          branchlessUserIds.push(Number(user.id));
        }
      }

      // 🟢 STEP 3: Get CURRENT BRANCH USERS only
      const branchEmployees = await Employee.findAll({
        where: {
          created_by: companyId,
          branch_id: branchId,
        },
        attributes: ['user_id'],
        raw: true,
      });
      const currentBranchUserIds = branchEmployees.map(e => Number(e.user_id));

      // 🟢 Combined allowed users: companyId + branchless users + current branch users
      const allowedUserIds = [...new Set([
        Number(companyId), 
        ...branchlessUserIds, 
        ...currentBranchUserIds
      ])];

      console.log('🔍 Company ID:', companyId);
      console.log('🔍 Branchless User IDs:', branchlessUserIds);
      console.log('🔍 Current Branch User IDs:', currentBranchUserIds);
      console.log('🔍 Final Allowed User IDs:', allowedUserIds);

      // 🟢 STEP 4: Fetch holidays created by allowed users
      holidays = await Holiday.findAll({
        where: {
          deleted_at: null,
          created_by: { [Op.in]: allowedUserIds }
        },
        order: [['date', 'ASC']],
      });

      console.log('🔍 Branch User Holidays Count:', holidays.length);

    } else {
      // 🟢 CASE 2: User doesn't have employee record (no branch) → FULL DATABASE ACCESS
      console.log('🟡 Branchless User Access (FULL DATABASE)');
      
      // 🟢 DIRECTLY GET ALL HOLIDAYS - no company filter
      holidays = await Holiday.findAll({
        where: { deleted_at: null },
        order: [['date', 'ASC']],
      });
      
      console.log('🔍 Branchless User - All Holidays Count:', holidays.length);
    }

    console.log('🔍 Final Holidays Count:', holidays.length);
    const data = await Promise.all(holidays.map(h => formatHolidayResponse(h)));
    console.log('✅ END getAllHolidays - Success');
    return res.json({ success: true, data });

  } catch (err) {
    console.error('❌ Get All Holidays Error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message,
    });
  }
};

// =====================
// 🔹 GET HOLIDAY BY ID
// =====================
exports.getHolidayById = async (req, res) => {
  try {
    console.log('🎯 START getHolidayById');
    console.log('🔍 User Info - ID:', req.user.id, 'Type:', req.user.type);
    
    const holiday = await Holiday.findOne({
      where: { id: req.params.id, deleted_at: null },
    });

    if (!holiday) {
      return res.status(404).json({ success: false, message: 'Holiday not found' });
    }

    // 🟢 Super Admin → full access
    if (isSuper(req)) {
      const data = await formatHolidayResponse(holiday);
      return res.json({ success: true, data });
    }

    // 🟢 Check if user exists in employees table (has branch)
    const userEmployeeRecord = await Employee.findOne({
      where: { user_id: req.user.id },
      attributes: ['branch_id', 'created_by', 'employee_id'],
      raw: true,
    });

    console.log('🔍 User Employee Record:', userEmployeeRecord);

    if (userEmployeeRecord && userEmployeeRecord.branch_id) {
      // 🟢 CASE 1: User has employee record with branch → branch-level access
      const companyId = await getCompanyId(req);
      if (!companyId) {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
      }

      // 🟢 STEP 1: Get ALL COMPANY USERS
      const allCompanyUsers = await User.findAll({
        where: { created_by: companyId },
        attributes: ['id'],
        raw: true,
      });
      
      // 🟢 STEP 2: Identify BRANCHLESS USERS (users without employee records)
      const branchlessUserIds = [];
      for (const user of allCompanyUsers) {
        const empRecord = await Employee.findOne({
          where: { user_id: user.id },
          attributes: ['id'],
          raw: true,
        });
        if (!empRecord) {
          branchlessUserIds.push(Number(user.id));
        }
      }

      // 🟢 STEP 3: Get CURRENT BRANCH USERS only
      const branchEmployees = await Employee.findAll({
        where: {
          created_by: companyId,
          branch_id: userEmployeeRecord.branch_id,
        },
        attributes: ['user_id'],
        raw: true,
      });
      const currentBranchUserIds = branchEmployees.map(e => Number(e.user_id));

      // 🟢 Combined allowed users: companyId + branchless users + current branch users
      const allowedUserIds = [...new Set([
        Number(companyId), 
        ...branchlessUserIds, 
        ...currentBranchUserIds
      ])];

      console.log('🔍 Company ID:', companyId);
      console.log('🔍 Branchless User IDs:', branchlessUserIds);
      console.log('🔍 Current Branch User IDs:', currentBranchUserIds);
      console.log('🔍 Final Allowed User IDs:', allowedUserIds);
      console.log('🔍 Holiday Created By:', holiday.created_by);

      // 🟢 STEP 4: Check if holiday is accessible to branch user
      const isAccessible = allowedUserIds.map(String).includes(String(holiday.created_by));

      console.log('🔍 Is Holiday Accessible:', isAccessible);

      if (!isAccessible) {
        return res.status(403).json({ 
          success: false, 
          message: 'Forbidden: holiday not accessible in your branch. You can only access holidays from your branch and company-wide holidays.' 
        });
      }

    } else {
      // 🟢 CASE 2: User doesn't have employee record (no branch) → FULL ACCESS
      console.log('🟡 Branchless User - Full holiday access');
      // No additional checks needed - branchless users can access any holiday
    }

    // ✅ Return formatted holiday
    const data = await formatHolidayResponse(holiday);
    console.log('✅ END getHolidayById - Success');
    return res.json({ success: true, data });

  } catch (err) {
    console.error('❌ Get Holiday By ID Error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message,
    });
  }
};

// =====================
// 🔹 UPDATE HOLIDAY
// =====================
exports.updateHoliday = async (req, res) => {
  try {
    console.log('🎯 START updateHoliday');
    console.log('🔍 User Info - ID:', req.user.id, 'Type:', req.user.type);
    
    const { id } = req.params;
    const { date, end_date, occasion } = req.body;

    const companyId = await getCompanyId(req);
    if (!companyId && !isSuper(req))
      return res
        .status(403)
        .json({ success: false, message: 'Unauthorized' });

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
      console.log('🟡 Branch User - Updating holiday');
      userBranchId = userEmployeeRecord.branch_id;
    } else {
      // 🟢 CASE 2: User doesn't have employee record (no branch) → company-wide access
      console.log('🟡 Branchless User - Updating holiday');
      // No branch restriction for branchless users
    }

    const holiday = await Holiday.findOne({
      where: { id, deleted_at: null },
    });
    if (!holiday)
      return res
        .status(404)
        .json({ success: false, message: 'Holiday not found' });

    // Determine allowed creators within company/branch
    const allowedUserIds = await getAllUserIdsUnderCompanyBranch(companyId, isCompany(req) ? null : userBranchId);

    // 🟢 Access validation
    if (!isSuper(req)) {
      if (!allowedUserIds.map(String).includes(String(holiday.created_by))) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: not your branch/company record',
        });
      }
    }

    // 🟢 Perform update
    await holiday.update({
      date: date ?? holiday.date,
      end_date: end_date ?? holiday.end_date,
      occasion: occasion ?? holiday.occasion,
      updated_at: new Date(),
    });

    const data = await formatHolidayResponse(holiday);
    console.log('✅ Holiday updated successfully');
    return res.json({
      success: true,
      message: 'Holiday updated successfully',
      data,
    });
  } catch (err) {
    console.error('❌ Update Holiday Error:', err);
    return res
      .status(500)
      .json({ success: false, message: 'Server error', error: err.message });
  }
};

// =====================
// 🔹 DELETE HOLIDAY (soft delete)
// =====================
exports.deleteHoliday = async (req, res) => {
  try {
    console.log('🎯 START deleteHoliday');
    console.log('🔍 User Info - ID:', req.user.id, 'Type:', req.user.type);
    
    const { id } = req.params;

    const companyId = await getCompanyId(req);
    if (!companyId && !isSuper(req))
      return res
        .status(403)
        .json({ success: false, message: 'Unauthorized' });

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
      console.log('🟡 Branchless User - Deleting holiday');
    }

    const holiday = await Holiday.findOne({
      where: { id, deleted_at: null },
    });
    if (!holiday)
      return res
        .status(404)
        .json({ success: false, message: 'Holiday not found' });

    const allowedUserIds = await getAllUserIdsUnderCompanyBranch(
      companyId,
      isCompany(req) ? null : branchId
    );

    // 🟢 Access validation
    if (!isSuper(req)) {
      if (!allowedUserIds.map(String).includes(String(holiday.created_by))) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: not your branch/company record',
        });
      }
    }

    await holiday.destroy();
    console.log('✅ Holiday deleted successfully');
    return res.json({
      success: true,
      message: 'Holiday deleted successfully',
      data: { id },
    });
  } catch (err) {
    console.error('❌ Delete Holiday Error:', err);
    return res
      .status(500)
      .json({ success: false, message: 'Server error', error: err.message });
  }
};


