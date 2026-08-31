/*
// // controllers/termination.controller.js
// const Termination = require('../models/termination.model');
// const Employee = require('../models/employee.model');
// const TerminationType = require('../models/termination_type.model');

// // =====================
// // Helper: format termination response
// // =====================
// const formatTerminationResponse = async (termination) => {
//   if (!termination) return null;
//   const json = termination.toJSON();
//   return {
//     id: json.id,
//     employee_id: json.employee_id,
//     notice_date: json.notice_date,
//     termination_date: json.termination_date,
//     termination_type: json.termination_type,
//     description: json.description,
//     created_by: json.created_by,
//     created_at: json.created_at,
//     updated_at: json.updated_at
//   };
// };

// // =====================
// // GET ALL TERMINATIONS
// // =====================
// exports.getAllTerminations = async (req, res) => {
//   try {
//     if (req.user.type === 'company') {
//       const terminations = await Termination.findAll({
//         where: { created_by: req.user.id },
//         order: [['id', 'DESC']]
//       });
//       const responseData = await Promise.all(terminations.map(t => formatTerminationResponse(t)));
//       return res.json({ success: true, data: responseData });
//     }

//     if (req.user.type === 'Employee') {
//       const emp = await Employee.findOne({ where: { user_id: req.user.id } });
//       if (!emp) {
//         return res.status(403).json({ success: false, message: 'Employee profile not found' });
//       }
//       const terminations = await Termination.findAll({
//         where: { created_by: emp.created_by, employee_id: emp.employee_id },
//         order: [['id', 'DESC']]
//       });
//       const responseData = await Promise.all(terminations.map(t => formatTerminationResponse(t)));
//       return res.json({ success: true, data: responseData });
//     }

//     // Fallback for other roles (HR, manager, etc.)
//     const emp = await Employee.findOne({ where: { user_id: req.user.id } });
//     let whereClause = {};
//     if (emp) whereClause.created_by = emp.created_by;

//     const terminations = await Termination.findAll({ where: whereClause, order: [['id', 'DESC']] });
//     const responseData = await Promise.all(terminations.map(t => formatTerminationResponse(t)));
//     return res.json({ success: true, data: responseData });
//   } catch (error) {
//     console.error('Get All Terminations Error:', error);
//     res.status(500).json({ success: false, message: 'Server error', error: error.message });
//   }
// };

// // =====================
// // GET TERMINATION BY ID
// // =====================
// exports.getTerminationById = async (req, res) => {
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

//     const termination = await Termination.findOne({ where: whereClause });
//     if (!termination) return res.status(404).json({ success: false, message: 'Termination not found' });

//     const responseData = await formatTerminationResponse(termination);
//     res.json({ success: true, data: responseData });
//   } catch (error) {
//     console.error('Get Termination By ID Error:', error);
//     res.status(500).json({ success: false, message: 'Server error', error: error.message });
//   }
// };

// // ==========================
// // CREATE TERMINATION
// // ==========================
// exports.createTermination = async (req, res) => {
//   try {
//     const { employee_id, notice_date, termination_date, termination_type, description } = req.body;

//     // === COMPANY USERS ===
//     if (req.user.type === 'company') {
//       const companyId = req.user.id;

//       const emp = await Employee.findOne({ where: { employee_id, created_by: companyId } });
//       if (!emp) return res.status(400).json({ message: 'Employee not found in your company' });

//       const type = await TerminationType.findOne({ where: { id: termination_type, created_by: companyId } });
//       if (!type) return res.status(400).json({ message: 'Invalid termination type for your company' });

//       const termination = await Termination.create({
//         employee_id: emp.employee_id,
//         notice_date,
//         termination_date,
//         termination_type,
//         description,
//         created_by: companyId,
//         created_at: new Date(),
//         updated_at: new Date()
//       });

//       return res.status(201).json({ success: true, message: 'Termination created', data: await formatTerminationResponse(termination) });
//     }

//     // === EMPLOYEE USERS (self only) ===
//     if (req.user.type === 'Employee') {
//       const loggedInEmployee = await Employee.findOne({ where: { user_id: req.user.id } });
//       if (!loggedInEmployee) return res.status(403).json({ message: 'Employee profile not found' });

//       if (employee_id == loggedInEmployee.employee_id) {
//         return res.status(403).json({ success: false, message: 'You cannot terminate yourself' });
//       }

//       const targetEmployee = await Employee.findOne({ where: { employee_id, created_by: loggedInEmployee.created_by } });
//       if (!targetEmployee) return res.status(400).json({ message: 'Target employee not found in your company' });

//       const type = await TerminationType.findOne({ where: { id: termination_type, created_by: loggedInEmployee.created_by } });
//       if (!type) return res.status(400).json({ message: 'Invalid termination type for your company' });

//       const termination = await Termination.create({
//         employee_id: targetEmployee.employee_id,
//         notice_date,
//         termination_date,
//         termination_type,
//         description,
//         created_by: loggedInEmployee.created_by,
//         created_at: new Date(),
//         updated_at: new Date()
//       });

//       return res.status(201).json({ success: true, message: 'Termination created', data: await formatTerminationResponse(termination) });
//     }

//     // === OTHER ROLES (HR, Manager, etc.) ===
//     const emp = await Employee.findOne({ where: { user_id: req.user.id } });
//     if (!emp) return res.status(403).json({ message: 'Employee profile not found' });

//     const targetEmployee = await Employee.findOne({ where: { employee_id, created_by: emp.created_by } });
//     if (!targetEmployee) return res.status(400).json({ message: 'Target employee not found in your company' });

//     const type = await TerminationType.findOne({ where: { id: termination_type, created_by: emp.created_by } });
//     if (!type) return res.status(400).json({ message: 'Invalid termination type for your company' });

//     const termination = await Termination.create({
//       employee_id: targetEmployee.employee_id,
//       notice_date,
//       termination_date,
//       termination_type,
//       description,
//       created_by: emp.created_by,
//       created_at: new Date(),
//       updated_at: new Date()
//     });

//     return res.status(201).json({ success: true, message: 'Termination created', data: await formatTerminationResponse(termination) });

//   } catch (error) {
//     console.error('Create Termination Error:', error);
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// };


// // ==========================
// // UPDATE TERMINATION
// // ==========================
// exports.updateTermination = async (req, res) => {
//   try {
//     const terminationId = req.params.id;
//     const { employee_id, notice_date, termination_date, termination_type, description } = req.body;

//     // === COMPANY USERS ===
//     if (req.user.type === 'company') {
//       const companyId = req.user.id;

//       if (employee_id) {
//         const emp = await Employee.findOne({ where: { employee_id, created_by: companyId } });
//         if (!emp) return res.status(400).json({ message: 'Employee not found in your company' });
//       }

//       if (termination_type) {
//         const type = await TerminationType.findOne({ where: { id: termination_type, created_by: companyId } });
//         if (!type) return res.status(400).json({ message: 'Invalid termination type for your company' });
//       }

//       const termination = await Termination.findOne({ where: { id: terminationId, created_by: companyId } });
//       if (!termination) return res.status(404).json({ success: false, message: 'Termination not found in your company' });

//       await termination.update({ employee_id, notice_date, termination_date, termination_type, description, updated_at: new Date() });
//       return res.json({ success: true, message: 'Termination updated', data: await formatTerminationResponse(termination) });
//     }

//     // === EMPLOYEE USERS (self only) ===
//     if (req.user.type === 'Employee') {
//       const emp = await Employee.findOne({ where: { user_id: req.user.id } });
//       if (!emp) return res.status(403).json({ success: false, message: 'Employee profile not found' });

//       const termination = await Termination.findOne({ where: { id: terminationId, created_by: emp.created_by, employee_id: emp.employee_id } });
//       if (!termination) return res.status(404).json({ success: false, message: 'Termination not found for you' });

//       await termination.update({ notice_date, termination_date, description, updated_at: new Date() });
//       return res.json({ success: true, message: 'Termination updated', data: await formatTerminationResponse(termination) });
//     }

//     // === OTHER ROLES (HR, Manager, etc.) ===
//     const emp = await Employee.findOne({ where: { user_id: req.user.id } });
//     if (!emp) return res.status(403).json({ success: false, message: 'Employee profile not found' });

//     if (employee_id) {
//       const targetEmp = await Employee.findOne({ where: { employee_id, created_by: emp.created_by } });
//       if (!targetEmp) return res.status(400).json({ message: 'Target employee not found in your company' });
//     }

//     if (termination_type) {
//       const type = await TerminationType.findOne({ where: { id: termination_type, created_by: emp.created_by } });
//       if (!type) return res.status(400).json({ message: 'Invalid termination type for your company' });
//     }

//     const termination = await Termination.findOne({ where: { id: terminationId, created_by: emp.created_by } });
//     if (!termination) return res.status(404).json({ success: false, message: 'Termination not found in your company' });

//     await termination.update({ employee_id, notice_date, termination_date, termination_type, description, updated_at: new Date() });
//     return res.json({ success: true, message: 'Termination updated', data: await formatTerminationResponse(termination) });

//   } catch (error) {
//     console.error("Update Termination Error:", error);
//     res.status(500).json({ success: false, message: 'Server error', error: error.message });
//   }
// };

// // =====================
// // DELETE TERMINATION
// // =====================
// exports.deleteTermination = async (req, res) => {
//   try {
//     const { id } = req.params;

//     // === COMPANY USERS ===
//     if (req.user.type === 'company') {
//       const companyId = req.user.id;

//       const termination = await Termination.findOne({ where: { id, created_by: companyId } });
//       if (!termination) return res.status(404).json({ success: false, message: 'Termination not found in your company' });

//       await termination.destroy();
//       return res.json({ success: true, message: 'Termination deleted', data: { id } });
//     }

//     // === EMPLOYEE USERS (self only) ===
//     if (req.user.type === 'Employee') {
//       const emp = await Employee.findOne({ where: { user_id: req.user.id } });
//       if (!emp) return res.status(403).json({ success: false, message: 'Employee profile not found' });

//       const termination = await Termination.findOne({ where: { id, created_by: emp.created_by, employee_id: emp.employee_id } });
//       if (!termination) return res.status(404).json({ success: false, message: 'Termination not found for you' });

//       await termination.destroy();
//       return res.json({ success: true, message: 'Your termination deleted', data: { id } });
//     }

//     // === OTHER ROLES (HR, Manager, etc.) ===
//     const emp = await Employee.findOne({ where: { user_id: req.user.id } });
//     if (!emp) return res.status(403).json({ success: false, message: 'Employee profile not found' });

//     const termination = await Termination.findOne({ where: { id, created_by: emp.created_by } });
//     if (!termination) return res.status(404).json({ success: false, message: 'Termination not found in your company' });

//     await termination.destroy();
//     return res.json({ success: true, message: 'Termination deleted', data: { id } });

//   } catch (error) {
//     console.error('Delete Termination Error:', error);
//     res.status(500).json({ success: false, message: 'Server error', error: error.message });
//   }
// };









*/








// const { Op } = require('sequelize');
// const Termination = require('../models/termination.model');
// const Employee = require('../models/employee.model');
// const TerminationType = require('../models/termination_type.model');
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


// const formatTerminationResponse = async (termination) => {
//   if (!termination) return null;
//   const json = termination.toJSON();
//   return {
//     id: json.id,
//     employee_id: json.employee_id,
//     notice_date: json.notice_date,
//     termination_date: json.termination_date,
//     termination_type: json.termination_type,
//     description: json.description,
//     is_black_list: json.is_black_list ?? null,
//     created_by: json.created_by,
//     created_at: json.created_at,
//     updated_at: json.updated_at,
//   };
// };


// exports.getAllTerminations = async (req, res) => {
//   try {
//     if (isSuper(req)) {
//       const terminations = await Termination.findAll({
//         where: { deleted_at: null },
//         order: [['id', 'DESC']],
//       });
//       const responseData = await Promise.all(
//         terminations.map((t) => formatTerminationResponse(t))
//       );
//       return res.json({ success: true, data: responseData });
//     }

//     const companyId = await getCompanyId(req);
//     if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

//     let whereClause = { deleted_at: null };
//     const branchId = isCompany(req) ? null : await getUserBranchId(req.user.id);
//     const allowedCreatedBy = await getAllUserIdsUnderCompanyBranch(companyId, branchId);
//     whereClause.created_by = { [Op.in]: allowedCreatedBy };

//     const terminations = await Termination.findAll({
//       where: whereClause,
//       order: [['id', 'DESC']],
//     });
//     const responseData = await Promise.all(
//       terminations.map((t) => formatTerminationResponse(t))
//     );
//     return res.json({ success: true, data: responseData });
//   } catch (error) {
//     console.error('Get All Terminations Error:', error);
//     return res.status(500).json({ success: false, message: 'Server error', error: error.message });
//   }
// };


// exports.getTerminationById = async (req, res) => {
//   try {
//     const termination = await Termination.findOne({
//       where: { id: req.params.id, deleted_at: null },
//     });

//     if (!termination) return res.status(404).json({ success: false, message: 'Termination not found' });

//     if (!isSuper(req)) {
//       const companyId = await getCompanyId(req);
//       if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

//       const branchId = isCompany(req) ? null : await getUserBranchId(req.user.id);
//       const allowedCreatedBy = await getAllUserIdsUnderCompanyBranch(companyId, branchId);

//       if (!allowedCreatedBy.map(String).includes(String(termination.created_by))) {
//         return res.status(403).json({ success: false, message: 'Forbidden: not your record' });
//       }
//     }

//     const responseData = await formatTerminationResponse(termination);
//     return res.json({ success: true, data: responseData });
//   } catch (error) {
//     console.error('Get Termination By ID Error:', error);
//     return res.status(500).json({ success: false, message: 'Server error', error: error.message });
//   }
// };


// exports.createTermination = async (req, res) => {
//   try {
//     let { employee_id, notice_date, termination_date, termination_type, description, is_black_list } = req.body;

//     const loggedInUserId = req.user.id;
//     const companyId = await getCompanyId(req);
//     if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

//     // Validate employee exists in company
//     const targetEmployee = await Employee.findOne({ where: { employee_id } });

//     if (!targetEmployee) return res.status(400).json({ message: 'Employee not found in your company' });

//     // Validate termination type exists in company
//     const type = await TerminationType.findOne({
//       where: { id: termination_type},
//     });
//     if (!type) return res.status(400).json({ message: 'Invalid termination type for your company' });

//     // Employees cannot terminate themselves
//     if (isEmployee(req) && employee_id == targetEmployee.employee_id) {
//       return res.status(403).json({ success: false, message: 'You cannot terminate yourself' });
//     }
    
//     // ✅ Allow null values for notice_date and termination_date
//     if (!notice_date || notice_date === '') notice_date = null;

//     const termination = await Termination.create({
//       employee_id: targetEmployee.employee_id,
//       notice_date,
//       termination_date,
//       termination_type,
//       description,
//       is_black_list: is_black_list ?? null, // ✅ Updated area
//       created_by: loggedInUserId,
//       created_at: new Date(),
//       updated_at: new Date(),
//     });
    
//     /* 🔹 HIGHLIGHTED ADDITION:
//       When termination is created, mark employee inactive (is_active = 0) */
//     await Employee.update(
//       { is_active: 0 },
//       { where: { employee_id } }
//     );
    
//     // 🟩 Find user linked to this employee and deactivate
//     const empData = await Employee.findOne({
//       where: { employee_id },
//       attributes: ['user_id'],
//       raw: true
//     });

//     if (empData?.user_id) {
//       await User.update(
//         { is_active: 0 },
//         { where: { id: empData.user_id } }
//       );
//     }
//     /* 🔹 END HIGHLIGHT */


//     return res.status(201).json({ success: true, message: 'Termination created', data: await formatTerminationResponse(termination) });
//   } catch (error) {
//     console.error('Create Termination Error:', error);
//     return res.status(500).json({ success: false, message: 'Server error', error: error.message });
//   }
// };


// exports.updateTermination = async (req, res) => {
//   try {
//     const terminationId = req.params.id;
//     let { employee_id, notice_date, termination_date, termination_type, description, is_black_list } = req.body;

//     const loggedInUserId = req.user.id;
//     const companyId = await getCompanyId(req);
//     if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

//     const branchId = isCompany(req) ? null : await getUserBranchId(req.user.id);
//     const allowedCreatedBy = await getAllUserIdsUnderCompanyBranch(companyId, branchId);

//     const termination = await Termination.findOne({
//       where: { id: terminationId, created_by: { [Op.in]: allowedCreatedBy }, deleted_at: null },
//     });
//     if (!termination) return res.status(404).json({ success: false, message: 'Termination not found' });

//     // Validate employee if updated
//     if (employee_id) {
//       const emp = await Employee.findOne({ where: { employee_id} });
//       if (!emp) return res.status(400).json({ message: 'Employee not found in your company' });
//     }

//     // Validate termination type if updated
//     if (termination_type) {
//       const type = await TerminationType.findOne({ where: { id: termination_type} });
//       if (!type) return res.status(400).json({ message: 'Invalid termination type for your company' });
//     }
    
//     // ✅ Allow null values for notice_date and termination_date
//     if (!notice_date || notice_date === '') notice_date = null;


//     await termination.update({
//       employee_id: employee_id || termination.employee_id,
//       notice_date: notice_date || termination.notice_date,
//       termination_date: termination_date || termination.termination_date,
//       termination_type: termination_type || termination.termination_type,
//       description: description || termination.description,
//     //   is_black_list: is_black_list !== undefined ? is_black_list : termination.is_black_list,
//       is_black_list:
//         typeof is_black_list !== 'undefined'
//           ? is_black_list
//           : termination.is_black_list,
// // ✅ Updated area

//       updated_at: new Date(),
//     });

//     return res.json({ success: true, message: 'Termination updated', data: await formatTerminationResponse(termination) });
//   } catch (error) {
//     console.error('Update Termination Error:', error);
//     return res.status(500).json({ success: false, message: 'Server error', error: error.message });
//   }
// };


// exports.deleteTermination = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const loggedInUserId = req.user.id;
//     const companyId = await getCompanyId(req);
//     if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

//     const branchId = isCompany(req) ? null : await getUserBranchId(req.user.id);
//     const allowedCreatedBy = await getAllUserIdsUnderCompanyBranch(companyId, branchId);

//     const termination = await Termination.findOne({
//       where: { id, created_by: { [Op.in]: allowedCreatedBy }, deleted_at: null },
//     });
//     if (!termination) return res.status(404).json({ success: false, message: 'Termination not found' });

//     await termination.update({ deleted_at: new Date() });
//     return res.json({ success: true, message: 'Termination soft deleted', data: { id } });
//   } catch (error) {
//     console.error('Delete Termination Error:', error);
//     return res.status(500).json({ success: false, message: 'Server error', error: error.message });
//   }
// };


// controllers/termination.controller.js
const { Op } = require('sequelize');
const Termination = require('../models/termination.model');
const Employee = require('../models/employee.model');
const TerminationType = require('../models/termination_type.model');
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
// ???? Format Termination Response
// =====================
const formatTerminationResponse = async (termination) => {
  if (!termination) return null;
  const json = termination.toJSON ? termination.toJSON() : termination;

  // Get employee details
  const employee = await Employee.findOne({
    where: { employee_id: String(json.employee_id), deleted_at: null },
    attributes: ['id', 'employee_id', 'name', 'branch_id', 'department_id', 'is_active'],
    raw: true
  });

  // Get termination type details
  let terminationType = null;
  if (json.termination_type) {
    const t = await TerminationType.findByPk(json.termination_type, { raw: true });
    if (t) terminationType = { id: t.id, title: t.title };
  }

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
    notice_date: json.notice_date,
    termination_date: json.termination_date,
    termination_type: json.termination_type,
    termination_type_details: terminationType,
    description: json.description,
    created_by: json.created_by,
    created_at: json.created_at,
    updated_at: json.updated_at
  };
};

// =====================
// ???? CREATE TERMINATION
// =====================
exports.createTermination = async (req, res) => {
  try {
    console.log('???? START createTermination');
    console.log('???? User Info - ID:', req.user.id, 'Type:', req.user.type);
    
    const { employee_id, notice_date, termination_date, termination_type, description } = req.body;
    if (!employee_id || !termination_type) {
      return res.status(400).json({ success: false, message: 'employee_id and termination_type are required' });
    }

    const companyId = await getCompanyId(req);
    if (!companyId && !isSuper(req)) return res.status(403).json({ success: false, message: 'Unauthorized' });

    // ???? Check if user exists in employees table (has branch)
    const userEmployeeRecord = await Employee.findOne({
      where: { user_id: req.user.id },
      attributes: ['branch_id', 'created_by', 'employee_id'],
      raw: true,
    });

    console.log('???? User Employee Record:', userEmployeeRecord);

    let userBranchId = null;

    if (userEmployeeRecord && userEmployeeRecord.branch_id) {
      // ???? CASE 1: User has employee record with branch ? branch-level access
      console.log('???? Branch User - Creating termination');
      userBranchId = userEmployeeRecord.branch_id;
    } else {
      // ???? CASE 2: User doesn't have employee record (no branch) ? company-wide access
      console.log('???? Branchless User - Creating termination');
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

    // Employee users cannot create terminations (only view their own)
    if (isEmployee(req)) {
      return res.status(403).json({ success: false, message: 'Employees cannot create terminations' });
    }

    // Validate termination type belongs to the company
    const terminationTypeRecord = await TerminationType.findOne({
      where: { id: termination_type, deleted_at: null }
    });
    if (!terminationTypeRecord) {
      return res.status(400).json({ success: false, message: 'Invalid termination_type' });
    }

    // Create termination
    const termination = await Termination.create({
      employee_id: String(employee_id),
      notice_date: notice_date || null,
      termination_date: termination_date || new Date(),
      termination_type,
      description: description || null,
      created_by: req.user.id,
      created_at: new Date(),
      updated_at: new Date()
    });

    // ???? Mark employee as inactive after termination
    await Employee.update(
      { is_active: 0 },
      { where: { employee_id } }
    );
    
    // ???? If corresponding user exists, deactivate that user too
    if (employeeRecord?.user_id) {
      await User.update(
        { is_active: 0 },
        { where: { id: employeeRecord.user_id } }
      );
    }

    const data = await formatTerminationResponse(termination);
    console.log('? Termination created successfully');
    return res.status(201).json({ success: true, message: 'Termination created', data });
  } catch (err) {
    console.error('? Create Termination Error:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// =====================
// ???? GET ALL TERMINATIONS
// =====================
exports.getAllTerminations = async (req, res) => {
  try {
    console.log('???? START getAllTerminations');
    console.log('???? User Info - ID:', req.user.id, 'Type:', req.user.type);

    // ???? SUPER ADMIN: Full access
    if (isSuper(req)) {
      console.log('???? Super Admin Access');
      const terminations = await Termination.findAll({
        where: { deleted_at: null },
        order: [['id', 'DESC']],
      });
      console.log('???? Super Admin Terminations Count:', terminations.length);
      const data = await Promise.all(terminations.map(t => formatTerminationResponse(t)));
      return res.json({ success: true, data });
    }

    // ???? Check if user exists in employees table (has branch)
    const userEmployeeRecord = await Employee.findOne({
      where: { user_id: req.user.id },
      attributes: ['branch_id', 'created_by', 'employee_id'],
      raw: true,
    });

    console.log('???? User Employee Record:', userEmployeeRecord);

    let terminations = [];

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

      // ???? STEP 2: Fetch terminations for employees in the same branch
      terminations = await Termination.findAll({
        where: {
          deleted_at: null,
          employee_id: { [Op.in]: branchEmployeeIds },
        },
        order: [['id', 'DESC']],
      });

    } else {
      // ???? CASE 2: User doesn't have employee record (no branch) ? FULL DATABASE ACCESS
      console.log('???? Branchless User Access (FULL DATABASE)');
      
      // ???? DIRECTLY GET ALL TERMINATIONS - no company filter
      terminations = await Termination.findAll({
        where: { deleted_at: null },
        order: [['id', 'DESC']],
      });
      
      console.log('???? Branchless User - All Terminations Count:', terminations.length);
    }

    console.log('???? Final Terminations Count:', terminations.length);
    const data = await Promise.all(terminations.map(t => formatTerminationResponse(t)));
    console.log('? END getAllTerminations - Success');
    return res.json({ success: true, data });

  } catch (err) {
    console.error('? Get All Terminations Error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message,
    });
  }
};

// =====================
// ???? GET TERMINATION BY ID
// =====================
exports.getTerminationById = async (req, res) => {
  try {
    console.log('???? START getTerminationById');
    console.log('???? User Info - ID:', req.user.id, 'Type:', req.user.type);
    
    const termination = await Termination.findOne({
      where: { id: req.params.id, deleted_at: null },
    });

    if (!termination) {
      return res.status(404).json({ success: false, message: 'Termination not found' });
    }

    // ???? Super Admin ? full access
    if (isSuper(req)) {
      const data = await formatTerminationResponse(termination);
      return res.json({ success: true, data });
    }

    // ???? Check if user exists in employees table (has branch)
    const userEmployeeRecord = await Employee.findOne({
      where: { user_id: req.user.id },
      attributes: ['branch_id', 'created_by', 'employee_id'],
      raw: true,
    });

    console.log('???? User Employee Record:', userEmployeeRecord);

    if (userEmployeeRecord && userEmployeeRecord.branch_id) {
      // ???? CASE 1: User has employee record with branch ? branch-level access
      const companyId = await getCompanyId(req);
      if (!companyId) {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
      }

      // ???? STEP 1: Get the employee linked to the termination
      const terminationEmployee = await Employee.findOne({
        where: { employee_id: String(termination.employee_id), deleted_at: null },
        raw: true,
      });

      if (!terminationEmployee) {
        return res.status(404).json({ success: false, message: 'Employee linked to termination not found' });
      }

      // ???? STEP 2: Check if the termination employee belongs to the same branch as the current user
      const employeeBranchId = terminationEmployee.branch_id || null;
      
      console.log('???? Termination Employee Branch ID:', employeeBranchId);
      console.log('???? Current User Branch ID:', userEmployeeRecord.branch_id);

      if (String(employeeBranchId) !== String(userEmployeeRecord.branch_id)) {
        return res.status(403).json({ success: false, message: 'Forbidden: termination belongs to different branch' });
      }

    } else {
      // ???? CASE 2: User doesn't have employee record (no branch) ? FULL ACCESS
      console.log('???? Branchless User - Full termination access');
      // No additional checks needed - branchless users can access any termination
    }

    // ? Return formatted termination
    const data = await formatTerminationResponse(termination);
    console.log('? END getTerminationById - Success');
    return res.json({ success: true, data });

  } catch (err) {
    console.error('? Get Termination By ID Error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message,
    });
  }
};

// =====================
// ???? UPDATE TERMINATION
// =====================
exports.updateTermination = async (req, res) => {
  try {
    console.log('???? START updateTermination');
    console.log('???? User Info - ID:', req.user.id, 'Type:', req.user.type);
    
    const { id } = req.params;
    const { employee_id,termination_date, termination_type, description } = req.body;

    const companyId = await getCompanyId(req);
    if (!companyId && !isSuper(req))
      return res
        .status(403)
        .json({ success: false, message: 'Unauthorized' });

    // ???? Check if user exists in employees table (has branch)
    const userEmployeeRecord = await Employee.findOne({
      where: { user_id: req.user.id },
      attributes: ['branch_id', 'created_by', 'employee_id'],
      raw: true,
    });

    console.log('???? User Employee Record:', userEmployeeRecord);

    let userBranchId = null;

    if (userEmployeeRecord && userEmployeeRecord.branch_id) {
      // ???? CASE 1: User has employee record with branch ? branch-level access
      console.log('???? Branch User - Updating termination');
      userBranchId = userEmployeeRecord.branch_id;
    } else {
      // ???? CASE 2: User doesn't have employee record (no branch) ? company-wide access
      console.log('???? Branchless User - Updating termination');
      // No branch restriction for branchless users
    }

    const termination = await Termination.findOne({
      where: { id, deleted_at: null },
    });
    if (!termination)
      return res
        .status(404)
        .json({ success: false, message: 'Termination not found' });

    const terminationEmployee = await Employee.findOne({
      where: { employee_id: String(termination.employee_id), deleted_at: null },
    });

    // Determine allowed creators within company/branch
    const allowedUserIds = await getAllUserIdsUnderCompanyBranch(companyId, isCompany(req) ? null : userBranchId);

    // ???? Access validation
    if (!isSuper(req)) {
      if (
        !terminationEmployee ||
        !allowedUserIds.map(String).includes(String(terminationEmployee.created_by))
      ) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: not your branch/company record',
        });
      }

      if (userEmployeeRecord && userEmployeeRecord.branch_id && !isCompany(req) && !isEmployee(req)) {
        // branch-level user: employee must be in same branch
        if (String(terminationEmployee.branch_id) !== String(userBranchId)) {
          return res.status(403).json({
            success: false,
            message: 'Forbidden: different branch',
          });
        }
      }
    }

    // Employee users cannot update terminations
    if (isEmployee(req)) {
      return res.status(403).json({ success: false, message: 'Employees cannot update terminations' });
    }

    // Validate termination type belongs to the company (if termination_type is being updated)
    if (termination_type && termination_type !== termination.termination_type) {
      const terminationTypeRecord = await TerminationType.findOne({
        where: { id: termination_type, deleted_at: null }
      });
      if (!terminationTypeRecord) {
        return res.status(400).json({ success: false, message: 'Invalid termination_type' });
      }
    }

    // ? If updating employee_id, check if valid and belongs to company
    if (employee_id && employee_id !== termination.employee_id) {
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
    await termination.update({
      employee_id: employee_id ?? termination.employee_id,
      termination_date: termination_date ?? termination.termination_date,
      termination_type: termination_type ?? termination.termination_type,
      description: description ?? termination.description,
      updated_at: new Date(),
    });

    const data = await formatTerminationResponse(termination);
    console.log('? Termination updated successfully');
    return res.json({
      success: true,
      message: 'Termination updated successfully',
      data,
    });
  } catch (err) {
    console.error('? Update Termination Error:', err);
    return res
      .status(500)
      .json({ success: false, message: 'Server error', error: err.message });
  }
};

// =====================
// ???? DELETE TERMINATION (soft delete)
// =====================
exports.deleteTermination = async (req, res) => {
  try {
    console.log('???? START deleteTermination');
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
      attributes: ['branch_id', 'created_by', 'employee_id'],
      raw: true,
    });

    console.log('???? User Employee Record:', userEmployeeRecord);

    let branchId = null;

    if (userEmployeeRecord && userEmployeeRecord.branch_id) {
      // ???? CASE 1: User has employee record with branch ? branch-level access
      branchId = userEmployeeRecord.branch_id;
    } else {
      // ???? CASE 2: User doesn't have employee record (no branch) ? company-wide access
      console.log('???? Branchless User - Deleting termination');
    }

    const termination = await Termination.findOne({
      where: { id, deleted_at: null },
    });
    if (!termination)
      return res
        .status(404)
        .json({ success: false, message: 'Termination not found' });

    const terminationEmployee = await Employee.findOne({
      where: { employee_id: String(termination.employee_id), deleted_at: null },
    });

    const allowedUserIds = await getAllUserIdsUnderCompanyBranch(
      companyId,
      isCompany(req) ? null : branchId
    );

    // ???? Access validation
    if (!isSuper(req)) {
      if (
        !terminationEmployee ||
        !allowedUserIds.map(String).includes(String(terminationEmployee.created_by))
      ) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: not your branch/company record',
        });
      }
      if (!isCompany(req) && branchId !== null) {
        if (String(terminationEmployee.branch_id) !== String(branchId)) {
          return res.status(403).json({
            success: false,
            message: 'Forbidden: different branch',
          });
        }
      }
    }

    // Employee users cannot delete terminations
    if (isEmployee(req)) {
      return res.status(403).json({ success: false, message: 'Employees cannot delete terminations' });
    }

    await termination.destroy();
    console.log('? Termination deleted successfully');
    return res.json({
      success: true,
      message: 'Termination deleted successfully',
      data: { id },
    });
  } catch (err) {
    console.error('? Delete Termination Error:', err);
    return res
      .status(500)
      .json({ success: false, message: 'Server error', error: err.message });
  }
};







