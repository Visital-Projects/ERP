// // controllers/warning.controller.js
// const Warning = require('../models/warning.model');
// const Employee = require('../models/employee.model');
// const { Op } = require('sequelize');

// // =====================
// // Helper: format warning response
// // =====================
// const formatWarningResponse = async (warning) => {
//   if (!warning) return null;
//   const json = warning.toJSON();

//   const [toEmployee, byEmployee] = await Promise.all([
//     Employee.findOne({ where: { employee_id: json.warning_to }, attributes: ['employee_id', 'name'] }),
//     Employee.findOne({ where: { employee_id: json.warning_by }, attributes: ['employee_id', 'name'] })
//   ]);

//   return {
//     id: json.id,
//     warning_to: json.warning_to,
//     warning_by: json.warning_by,
//     to_employee: toEmployee ? { employee_id: toEmployee.employee_id, name: toEmployee.name } : null,
//     by_employee: byEmployee ? { employee_id: byEmployee.employee_id, name: byEmployee.name } : null,
//     subject: json.subject,
//     warning_date: json.warning_date,
//     description: json.description,
//     created_by: json.created_by,
//     created_at: json.created_at,
//     updated_at: json.updated_at
//   };
// };

// // =====================
// // GET ALL WARNINGS
// // =====================
// exports.getAllWarnings = async (req, res) => {
//   try {
//     let warnings = [];

//     if (req.user.type === 'company') {
//       warnings = await Warning.findAll({
//         where: { created_by: req.user.id },
//         order: [['id', 'DESC']]
//       });
//     } else if (req.user.type === 'Employee') {
//       const emp = await Employee.findOne({ where: { user_id: req.user.id } });
//       if (!emp) return res.status(403).json({ success: false, message: 'Employee profile not found' });

//       warnings = await Warning.findAll({
//         where: {
//           created_by: emp.created_by,
//           [Op.or]: [
//             { warning_to: emp.employee_id },
//             { warning_by: emp.employee_id }
//           ]
//         },
//         order: [['id', 'DESC']]
//       });
//     } else {
//       const emp = await Employee.findOne({ where: { user_id: req.user.id } });
//       let whereClause = {};
//       if (emp) whereClause.created_by = emp.created_by;

//       warnings = await Warning.findAll({ where: whereClause, order: [['id', 'DESC']] });
//     }

//     const responseData = await Promise.all(warnings.map(w => formatWarningResponse(w)));
//     res.json({ success: true, data: responseData });
//   } catch (err) {
//     console.error('Get All Warnings Error:', err);
//     res.status(500).json({ success: false, message: 'Server error', error: err.message });
//   }
// };

// // =====================
// // GET WARNING BY ID
// // =====================
// exports.getWarningById = async (req, res) => {
//   try {
//     let whereClause = { id: req.params.id };

//     if (req.user.type === 'company') {
//       whereClause.created_by = req.user.id;
//     } else if (req.user.type === 'Employee') {
//       const emp = await Employee.findOne({ where: { user_id: req.user.id } });
//       if (!emp) return res.status(403).json({ success: false, message: 'Employee profile not found' });

//       whereClause = {
//         id: req.params.id,
//         created_by: emp.created_by,
//         [Op.or]: [
//           { warning_to: emp.employee_id },
//           { warning_by: emp.employee_id }
//         ]
//       };
//     } else {
//       const emp = await Employee.findOne({ where: { user_id: req.user.id } });
//       if (emp) whereClause.created_by = emp.created_by;
//     }

//     const warning = await Warning.findOne({ where: whereClause });
//     if (!warning) return res.status(404).json({ success: false, message: 'Warning not found' });

//     const responseData = await formatWarningResponse(warning);
//     res.json({ success: true, data: responseData });
//   } catch (err) {
//     console.error('Get Warning By ID Error:', err);
//     res.status(500).json({ success: false, message: 'Server error', error: err.message });
//   }
// };

// // ==========================
// // CREATE WARNING
// // ==========================
// exports.createWarning = async (req, res) => {
//   try {
//     const { warning_to, subject, warning_date, description } = req.body;

//     // === COMPANY USERS ===
//     if (req.user.type === 'company') {
//       const companyId = req.user.id;
//       const { warning_by } = req.body;

//       if (!warning_to || !warning_by || !warning_date) {
//         return res.status(400).json({ message: 'warning_to, warning_by, warning_date are required' });
//       }
//       if (Number(warning_to) === Number(warning_by)) {
//         return res.status(400).json({ message: 'warning_to and warning_by cannot be the same employee' });
//       }

//       const toEmp = await Employee.findOne({ where: { employee_id: warning_to, created_by: companyId } });
//       const byEmp = await Employee.findOne({ where: { employee_id: warning_by, created_by: companyId } });
//       if (!toEmp) return res.status(400).json({ message: 'warning_to employee not in your company' });
//       if (!byEmp) return res.status(400).json({ message: 'warning_by employee not in your company' });

//       const warning = await Warning.create({
//         warning_to,
//         warning_by,
//         subject,
//         warning_date,
//         description,
//         created_by: companyId,
//         created_at: new Date(),
//         updated_at: new Date()
//       });

//       return res.status(201).json({ success: true, message: 'Warning created', data: await formatWarningResponse(warning) });
//     }

//     // === EMPLOYEE USERS ===
//     if (req.user.type === 'Employee') {
//       const emp = await Employee.findOne({ where: { user_id: req.user.id } });
//       if (!emp) return res.status(403).json({ message: 'Employee profile not found' });

//       if (!warning_to || !warning_date) {
//         return res.status(400).json({ message: 'warning_to and warning_date are required' });
//       }
//       if (Number(warning_to) === Number(emp.employee_id)) {
//         return res.status(400).json({ message: 'You cannot warn yourself' });
//       }

//       const toEmp = await Employee.findOne({ where: { employee_id: warning_to, created_by: emp.created_by } });
//       if (!toEmp) return res.status(400).json({ message: 'Target employee not found in your company' });

//       const warning = await Warning.create({
//         warning_to: toEmp.employee_id,
//         warning_by: emp.employee_id,
//         subject,
//         warning_date,
//         description,
//         created_by: emp.created_by,
//         created_at: new Date(),
//         updated_at: new Date()
//       });

//       return res.status(201).json({ success: true, message: 'Warning created', data: await formatWarningResponse(warning) });
//     }

//     // === OTHER ROLES ===
//     const emp = await Employee.findOne({ where: { user_id: req.user.id } });
//     if (!emp) return res.status(403).json({ message: 'Employee profile not found' });

//     const { warning_by } = req.body;
//     const toEmp = await Employee.findOne({ where: { employee_id: warning_to, created_by: emp.created_by } });
//     const byEmp = await Employee.findOne({ where: { employee_id: warning_by, created_by: emp.created_by } });
//     if (!toEmp || !byEmp) return res.status(400).json({ message: 'Employees not found in your company' });

//     const warning = await Warning.create({
//       warning_to,
//       warning_by,
//       subject,
//       warning_date,
//       description,
//       created_by: emp.created_by,
//       created_at: new Date(),
//       updated_at: new Date()
//     });

//     return res.status(201).json({ success: true, message: 'Warning created', data: await formatWarningResponse(warning) });

//   } catch (err) {
//     console.error('Create Warning Error:', err);
//     res.status(500).json({ success: false, message: 'Server error', error: err.message });
//   }
// };

// // ==========================
// // UPDATE WARNING
// // ==========================
// exports.updateWarning = async (req, res) => {
//   try {
//     const warningId = req.params.id;
//     const { warning_to, warning_by, subject, warning_date, description } = req.body;

//     // === COMPANY USERS ===
//     if (req.user.type === 'company') {
//       const companyId = req.user.id;
//       const warning = await Warning.findOne({ where: { id: warningId, created_by: companyId } });
//       if (!warning) return res.status(404).json({ success: false, message: 'Warning not found in your company' });

//       if (warning_to && warning_by && Number(warning_to) === Number(warning_by)) {
//         return res.status(400).json({ message: 'warning_to and warning_by cannot be same' });
//       }

//       if (warning_to) {
//         const toEmp = await Employee.findOne({ where: { employee_id: warning_to, created_by: companyId } });
//         if (!toEmp) return res.status(400).json({ message: 'warning_to employee not in your company' });
//       }
//       if (warning_by) {
//         const byEmp = await Employee.findOne({ where: { employee_id: warning_by, created_by: companyId } });
//         if (!byEmp) return res.status(400).json({ message: 'warning_by employee not in your company' });
//       }

//       await warning.update({ warning_to, warning_by, subject, warning_date, description, updated_at: new Date() });
//       return res.json({ success: true, message: 'Warning updated', data: await formatWarningResponse(warning) });
//     }

//     // === EMPLOYEE USERS ===
//     if (req.user.type === 'Employee') {
//       const emp = await Employee.findOne({ where: { user_id: req.user.id } });
//       if (!emp) return res.status(403).json({ message: 'Employee profile not found' });

//       const warning = await Warning.findOne({ where: { id: warningId, warning_by: emp.employee_id, created_by: emp.created_by } });
//       if (!warning) return res.status(404).json({ success: false, message: 'Warning not found or not created by you' });

//       if (warning_to && Number(warning_to) === Number(emp.employee_id)) {
//         return res.status(400).json({ message: 'You cannot warn yourself' });
//       }

//       if (warning_to) {
//         const toEmp = await Employee.findOne({ where: { employee_id: warning_to, created_by: emp.created_by } });
//         if (!toEmp) return res.status(400).json({ message: 'Target employee not found in your company' });
//       }

//       await warning.update({
//         warning_to,
//         warning_by: emp.employee_id, // fixed as self
//         subject,
//         warning_date,
//         description,
//         updated_at: new Date()
//       });

//       return res.json({ success: true, message: 'Warning updated', data: await formatWarningResponse(warning) });
//     }

//     // === OTHER ROLES ===
//     const emp = await Employee.findOne({ where: { user_id: req.user.id } });
//     if (!emp) return res.status(403).json({ message: 'Employee profile not found' });

//     const warning = await Warning.findOne({ where: { id: warningId, created_by: emp.created_by } });
//     if (!warning) return res.status(404).json({ success: false, message: 'Warning not found in your company' });

//     await warning.update({ warning_to, warning_by, subject, warning_date, description, updated_at: new Date() });
//     return res.json({ success: true, message: 'Warning updated', data: await formatWarningResponse(warning) });

//   } catch (err) {
//     console.error('Update Warning Error:', err);
//     res.status(500).json({ success: false, message: 'Server error', error: err.message });
//   }
// };

// // ==========================
// // DELETE WARNING
// // ==========================
// exports.deleteWarning = async (req, res) => {
//   try {
//     const { id } = req.params;

//     // === COMPANY USERS ===
//     if (req.user.type === 'company') {
//       const companyId = req.user.id;
//       const warning = await Warning.findOne({ where: { id, created_by: companyId } });
//       if (!warning) return res.status(404).json({ success: false, message: 'Warning not found in your company' });

//       await warning.destroy();
//       return res.json({ success: true, message: 'Warning deleted', data: { id } });
//     }

//     // === EMPLOYEE USERS ===
//     if (req.user.type === 'Employee') {
//       const emp = await Employee.findOne({ where: { user_id: req.user.id } });
//       if (!emp) return res.status(403).json({ message: 'Employee profile not found' });

//       const warning = await Warning.findOne({ where: { id, created_by: emp.created_by, warning_by: emp.employee_id } });
//       if (!warning) return res.status(404).json({ success: false, message: 'Warning not found or not created by you' });

//       await warning.destroy();
//       return res.json({ success: true, message: 'Your warning deleted', data: { id } });
//     }

//     // === OTHER ROLES ===
//     const emp = await Employee.findOne({ where: { user_id: req.user.id } });
//     if (!emp) return res.status(403).json({ message: 'Employee profile not found' });

//     const warning = await Warning.findOne({ where: { id, created_by: emp.created_by } });
//     if (!warning) return res.status(404).json({ success: false, message: 'Warning not found in your company' });

//     await warning.destroy();
//     return res.json({ success: true, message: 'Warning deleted', data: { id } });

//   } catch (err) {
//     console.error('Delete Warning Error:', err);
//     res.status(500).json({ success: false, message: 'Server error', error: err.message });
//   }
// };













// // controllers/warning.controller.js
// const { Op } = require('sequelize');
// const Warning = require('../models/warning.model');
// const Employee = require('../models/employee.model');
// const User = require('../models/user.model');

// // =====================
// // 🔹 Helpers
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

// function isSuper(req) { return (req.user?.roles || []).some(r => (r.name || '').toLowerCase() === 'super admin'); }
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

// // =====================
// // Helper: format warning response
// // =====================
// const formatWarningResponse = async (warning) => {
//   if (!warning) return null;
//   const json = warning.toJSON();

//   const [toEmployee, byEmployee] = await Promise.all([
//     Employee.findOne({ where: { employee_id: json.warning_to }, attributes: ['employee_id', 'name'], raw: true }),
//     Employee.findOne({ where: { employee_id: json.warning_by }, attributes: ['employee_id', 'name'], raw: true })
//   ]);

//   return {
//     id: json.id,
//     warning_to: json.warning_to,
//     warning_by: json.warning_by,
//     to_employee: toEmployee ? { employee_id: toEmployee.employee_id, name: toEmployee.name } : null,
//     by_employee: byEmployee ? { employee_id: byEmployee.employee_id, name: byEmployee.name } : null,
//     subject: json.subject,
//     warning_date: json.warning_date,
//     description: json.description,
//     created_by: json.created_by,
//     created_at: json.created_at,
//     updated_at: json.updated_at
//   };
// };

// // =====================
// // GET ALL WARNINGS
// // =====================
// exports.getAllWarnings = async (req, res) => {
//   try {
//     if (!req.user) return res.status(403).json({ success: false, message: 'Unauthorized' });

//     // Super admin → get all
//     if (isSuper(req)) {
//       const warnings = await Warning.findAll({ where: { deleted_at: null }, order: [['id', 'DESC']] });
//       const responseData = await Promise.all(warnings.map(formatWarningResponse));
//       return res.json({ success: true, data: responseData });
//     }

//     const companyId = await getCompanyId(req);
//     if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

//     let where = { deleted_at: null };
//     let allowedCreatedBy;

//     if (isCompany(req)) {
//       allowedCreatedBy = await getAllUserIdsUnderCompanyBranch(companyId, null);
//       where.created_by = { [Op.in]: allowedCreatedBy };
//     } else {
//       const branchId = await getUserBranchId(req.user.id);
//       if (!branchId) return res.status(403).json({ success: false, message: 'No branch assigned' });
//       allowedCreatedBy = await getAllUserIdsUnderCompanyBranch(companyId, branchId);
//       where.created_by = { [Op.in]: allowedCreatedBy };
//     }

//     const warnings = await Warning.findAll({ where, order: [['id', 'DESC']] });
//     const responseData = await Promise.all(warnings.map(formatWarningResponse));
//     return res.json({ success: true, data: responseData });

//   } catch (err) {
//     console.error('Get All Warnings Error:', err);
//     return res.status(500).json({ success: false, message: 'Server error', error: err.message });
//   }
// };

// // =====================
// // GET WARNING BY ID
// // =====================
// exports.getWarningById = async (req, res) => {
//   try {
//     const { id } = req.params;
//     if (!req.user) return res.status(403).json({ success: false, message: 'Unauthorized' });

//     const warning = await Warning.findOne({ where: { id, deleted_at: null } });
//     if (!warning) return res.status(404).json({ success: false, message: 'Warning not found' });

//     if (!isSuper(req)) {
//       const companyId = await getCompanyId(req);
//       if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

//       const branchId = isCompany(req) ? null : await getUserBranchId(req.user.id);
//       const allowedCreatedBy = await getAllUserIdsUnderCompanyBranch(companyId, branchId);
//       if (!allowedCreatedBy.map(String).includes(String(warning.created_by))) {
//         return res.status(403).json({ success: false, message: 'Forbidden: not your record' });
//       }
//     }

//     const responseData = await formatWarningResponse(warning);
//     return res.json({ success: true, data: responseData });

//   } catch (err) {
//     console.error('Get Warning By ID Error:', err);
//     return res.status(500).json({ success: false, message: 'Server error', error: err.message });
//   }
// };

// // ==========================
// // CREATE WARNING
// // ==========================
// exports.createWarning = async (req, res) => {
//   try {
//     const { warning_to, warning_by, subject, warning_date, description } = req.body;
//     if (!req.user) return res.status(403).json({ success: false, message: 'Unauthorized' });

//     const creatorId = req.user.id;
//     const companyId = await getCompanyId(req);
//     if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

//     const emp = await Employee.findOne({ where: { user_id: creatorId } });
//     if (!emp && !isCompany(req) && !isSuper(req))
//       return res.status(403).json({ success: false, message: 'Employee profile not found' });

//     // COMPANY / SUPER
//     if (isCompany(req) || isSuper(req)) {
//       if (!warning_to || !warning_by || !warning_date)
//         return res.status(400).json({ message: 'warning_to, warning_by, warning_date are required' });
//       if (Number(warning_to) === Number(warning_by))
//         return res.status(400).json({ message: 'warning_to and warning_by cannot be the same employee' });

//       const toEmp = await Employee.findOne({ where: { employee_id: warning_to} });
//       const byEmp = await Employee.findOne({ where: { employee_id: warning_by} });
//       if (!toEmp) return res.status(400).json({ message: 'warning_to employee not in your company' });
//       if (!byEmp) return res.status(400).json({ message: 'warning_by employee not in your company' });

//       const warning = await Warning.create({
//         warning_to,
//         warning_by,
//         subject,
//         warning_date,
//         description,
//         created_by: creatorId,
//         created_at: new Date(),
//         updated_at: new Date()
//       });

//       return res.status(201).json({ success: true, message: 'Warning created', data: await formatWarningResponse(warning) });
//     }

//     // EMPLOYEE
//     if (isEmployee(req)) {
//       if (!warning_to || !warning_date)
//         return res.status(400).json({ message: 'warning_to and warning_date are required' });
//       if (Number(warning_to) === Number(emp.employee_id))
//         return res.status(400).json({ message: 'You cannot warn yourself' });

//       const toEmp = await Employee.findOne({ where: { employee_id: warning_to, created_by: emp.created_by } });
//       if (!toEmp) return res.status(400).json({ message: 'Target employee not found in your company' });

//       const warning = await Warning.create({
//         warning_to: toEmp.employee_id,
//         warning_by: emp.employee_id,
//         subject,
//         warning_date,
//         description,
//         created_by: creatorId,
//         created_at: new Date(),
//         updated_at: new Date()
//       });

//       return res.status(201).json({ success: true, message: 'Warning created', data: await formatWarningResponse(warning) });
//     }

//     // OTHER ROLES
//     const toEmp = await Employee.findOne({ where: { employee_id: warning_to} });
//     const byEmp = await Employee.findOne({ where: { employee_id: warning_by} });
//     if (!toEmp || !byEmp) return res.status(400).json({ message: 'Employees not found in your company' });

//     const warning = await Warning.create({
//       warning_to,
//       warning_by,
//       subject,
//       warning_date,
//       description,
//       created_by: creatorId,
//       created_at: new Date(),
//       updated_at: new Date()
//     });

//     return res.status(201).json({ success: true, message: 'Warning created', data: await formatWarningResponse(warning) });

//   } catch (err) {
//     console.error('Create Warning Error:', err);
//     return res.status(500).json({ success: false, message: 'Server error', error: err.message });
//   }
// };

// // ==========================
// // UPDATE WARNING
// // ==========================
// exports.updateWarning = async (req, res) => {
//   try {
//     const warningId = req.params.id;
//     const { warning_to, warning_by, subject, warning_date, description } = req.body;
//     if (!req.user) return res.status(403).json({ success: false, message: 'Unauthorized' });

//     const creatorId = req.user.id;
//     const companyId = await getCompanyId(req);
//     if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

//     const emp = await Employee.findOne({ where: { user_id: creatorId } });

//     // Super → can update any
//     if (isSuper(req)) {
//       const warning = await Warning.findOne({ where: { id: warningId, deleted_at: null } });
//       if (!warning) return res.status(404).json({ success: false, message: 'Warning not found' });

//       await warning.update({
//         warning_to: warning_to || warning.warning_to,
//         warning_by: warning_by || warning.warning_by,
//         subject: subject || warning.subject,
//         warning_date: warning_date || warning.warning_date,
//         description: description || warning.description,
//         updated_at: new Date()
//       });

//       return res.json({ success: true, message: 'Warning updated', data: await formatWarningResponse(warning) });
//     }

//     // Compute allowedCreatedBy
//     let allowedCreatedBy;
//     if (isCompany(req)) allowedCreatedBy = await getAllUserIdsUnderCompanyBranch(companyId, null);
//     else {
//       const branchId = await getUserBranchId(req.user.id);
//       allowedCreatedBy = await getAllUserIdsUnderCompanyBranch(companyId, branchId);
//     }

//     const warning = await Warning.findOne({ where: { id: warningId, deleted_at: null, created_by: { [Op.in]: allowedCreatedBy } } });
//     if (!warning) return res.status(404).json({ success: false, message: 'Warning not found or not authorized' });

//     // Employee → only self can warn others
//     if (isEmployee(req)) {
//       if (warning_to && Number(warning_to) === Number(emp.employee_id))
//         return res.status(400).json({ message: 'You cannot warn yourself' });

//       await warning.update({
//         warning_to: warning_to || warning.warning_to,
//         warning_by: emp.employee_id,
//         subject: subject || warning.subject,
//         warning_date: warning_date || warning.warning_date,
//         description: description || warning.description,
//         updated_at: new Date()
//       });

//       return res.json({ success: true, message: 'Warning updated', data: await formatWarningResponse(warning) });
//     }

//     // Other roles → update within allowedCreatedBy
//     await warning.update({
//       warning_to: warning_to || warning.warning_to,
//       warning_by: warning_by || warning.warning_by,
//       subject: subject || warning.subject,
//       warning_date: warning_date || warning.warning_date,
//       description: description || warning.description,
//       updated_at: new Date()
//     });

//     return res.json({ success: true, message: 'Warning updated', data: await formatWarningResponse(warning) });

//   } catch (err) {
//     console.error('Update Warning Error:', err);
//     return res.status(500).json({ success: false, message: 'Server error', error: err.message });
//   }
// };

// // ==========================
// // DELETE WARNING (Soft Delete)
// // ==========================
// exports.deleteWarning = async (req, res) => {
//   try {
//     const { id } = req.params;
//     if (!req.user) return res.status(403).json({ success: false, message: 'Unauthorized' });

//     const creatorId = req.user.id;
//     const companyId = await getCompanyId(req);
//     if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

//     const emp = await Employee.findOne({ where: { user_id: creatorId } });

//     // Super → delete any
//     if (isSuper(req)) {
//       const warning = await Warning.findOne({ where: { id, deleted_at: null } });
//       if (!warning) return res.status(404).json({ success: false, message: 'Warning not found' });
//       await warning.update({ deleted_at: new Date() });
//       return res.json({ success: true, message: 'Warning soft deleted', data: { id } });
//     }

//     // Compute allowedCreatedBy
//     let allowedCreatedBy;
//     if (isCompany(req)) allowedCreatedBy = await getAllUserIdsUnderCompanyBranch(companyId, null);
//     else {
//       const branchId = await getUserBranchId(req.user.id);
//       allowedCreatedBy = await getAllUserIdsUnderCompanyBranch(companyId, branchId);
//     }

//     const whereClause = { id, deleted_at: null, created_by: { [Op.in]: allowedCreatedBy } };
//     if (isEmployee(req)) whereClause.warning_by = emp.employee_id;

//     const warning = await Warning.findOne({ where: whereClause });
//     if (!warning) return res.status(404).json({ success: false, message: 'Warning not found or not authorized' });

//     await warning.update({ deleted_at: new Date() });
//     return res.json({ success: true, message: isEmployee(req) ? 'Your warning soft deleted' : 'Warning soft deleted', data: { id } });

//   } catch (err) {
//     console.error('Delete Warning Error:', err);
//     return res.status(500).json({ success: false, message: 'Server error', error: err.message });
//   }
// };





// controllers/warning.controller.js
const { Op } = require('sequelize');
const Warning = require('../models/warning.model');
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
// 🔹 Format Warning Response
// =====================
const formatWarningResponse = async (warning) => {
  if (!warning) return null;
  const json = warning.toJSON ? warning.toJSON() : warning;

  // Get warning_to employee details
  const toEmployee = await Employee.findOne({
    where: { employee_id: String(json.warning_to), deleted_at: null },
    attributes: ['id', 'employee_id', 'name', 'branch_id', 'department_id'],
    raw: true
  });

  // Get warning_by employee details
  const byEmployee = await Employee.findOne({
    where: { employee_id: String(json.warning_by), deleted_at: null },
    attributes: ['id', 'employee_id', 'name', 'branch_id', 'department_id'],
    raw: true
  });

  return {
    id: json.id,
    warning_to: json.warning_to,
    warning_to_employee: toEmployee ? {
      id: toEmployee.id,
      employee_id: toEmployee.employee_id,
      name: toEmployee.name,
      branch_id: toEmployee.branch_id,
      department_id: toEmployee.department_id
    } : null,
    warning_by: json.warning_by,
    warning_by_employee: byEmployee ? {
      id: byEmployee.id,
      employee_id: byEmployee.employee_id,
      name: byEmployee.name,
      branch_id: byEmployee.branch_id,
      department_id: byEmployee.department_id
    } : null,
    subject: json.subject,
    warning_date: json.warning_date,
    description: json.description,
    created_by: json.created_by,
    created_at: json.created_at,
    updated_at: json.updated_at
  };
};

// =====================
// 🔹 CREATE WARNING
// =====================
exports.createWarning = async (req, res) => {
  try {
    console.log('🎯 START createWarning');
    console.log('🔍 User Info - ID:', req.user.id, 'Type:', req.user.type);
    
    const { warning_to, warning_by, subject, warning_date, description } = req.body;
    if (!warning_to || !warning_by || !subject) {
      return res.status(400).json({ success: false, message: 'warning_to, warning_by, and subject are required' });
    }

    // Check if warning_to and warning_by are the same
    if (String(warning_to) === String(warning_by)) {
      return res.status(400).json({ success: false, message: 'warning_to and warning_by cannot be the same employee' });
    }

    const companyId = await getCompanyId(req);
    if (!companyId && !isSuper(req)) return res.status(403).json({ success: false, message: 'Unauthorized' });

    // 🟢 Check if user exists in employees table (has branch)
    const userEmployeeRecord = await Employee.findOne({
      where: { user_id: req.user.id },
      attributes: ['branch_id', 'created_by', 'employee_id'],
      raw: true,
    });

    console.log('🔍 User Employee Record:', userEmployeeRecord);

    let userBranchId = null;

    if (userEmployeeRecord && userEmployeeRecord.branch_id) {
      // 🟢 CASE 1: User has employee record with branch → branch-level access
      console.log('🟡 Branch User - Creating warning');
      userBranchId = userEmployeeRecord.branch_id;
    } else {
      // 🟢 CASE 2: User doesn't have employee record (no branch) → company-wide access
      console.log('🟡 Branchless User - Creating warning');
      // No branch restriction for branchless users
    }

    // 🟢 FIX: Only require branch for branch users, not branchless users
    if (!isCompany(req) && !isSuper(req) && userEmployeeRecord && !userBranchId && !isEmployee(req)) {
      return res.status(403).json({ success: false, message: 'No branch assigned' });
    }

    // Determine allowed creators within company/branch
    const allowedCreatedBy = await getAllUserIdsUnderCompanyBranch(companyId, isCompany(req) ? null : userBranchId);

    // Find warning_to employee by business employee_id
    const toEmployeeRecord = await Employee.findOne({
      where: { employee_id: String(warning_to), deleted_at: null }
    });
    if (!toEmployeeRecord) {
      return res.status(404).json({ success: false, message: 'Warning_to employee not found' });
    }

    // Find warning_by employee by business employee_id
    const byEmployeeRecord = await Employee.findOne({
      where: { employee_id: String(warning_by), deleted_at: null }
    });
    if (!byEmployeeRecord) {
      return res.status(404).json({ success: false, message: 'Warning_by employee not found' });
    }

    // Ensure both employees belong to the current scope
    if (!isSuper(req)) {
      if (!allowedCreatedBy.map(String).includes(String(toEmployeeRecord.created_by)) || 
          !allowedCreatedBy.map(String).includes(String(byEmployeeRecord.created_by))) {
        return res.status(403).json({ success: false, message: 'One or both employees not in your company/branch scope' });
      }

      if (userEmployeeRecord && userEmployeeRecord.branch_id && !isCompany(req) && !isEmployee(req)) {
        // branch-level user: both employees must be in same branch
        if (String(toEmployeeRecord.branch_id) !== String(userBranchId) || 
            String(byEmployeeRecord.branch_id) !== String(userBranchId)) {
          return res.status(403).json({ success: false, message: 'One or both employees not in your branch' });
        }
      }
    }

    // Employee users can only create warnings where they are the warning_by
    if (isEmployee(req)) {
      if (!userEmployeeRecord || String(userEmployeeRecord.employee_id) !== String(warning_by)) {
        return res.status(403).json({ success: false, message: 'Employees can only create warnings for themselves as warning_by' });
      }
    }

    // Create warning
    const warning = await Warning.create({
      warning_to: String(warning_to),
      warning_by: String(warning_by),
      subject: subject,
      warning_date: warning_date || new Date(),
      description: description || null,
      created_by: req.user.id,
      created_at: new Date(),
      updated_at: new Date()
    });

    const data = await formatWarningResponse(warning);
    console.log('✅ Warning created successfully');
    return res.status(201).json({ success: true, message: 'Warning created', data });
  } catch (err) {
    console.error('❌ Create Warning Error:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// =====================
// 🔹 GET ALL WARNINGS
// =====================
exports.getAllWarnings = async (req, res) => {
  try {
    console.log('🎯 START getAllWarnings');
    console.log('🔍 User Info - ID:', req.user.id, 'Type:', req.user.type);

    // 🟢 SUPER ADMIN: Full access
    if (isSuper(req)) {
      console.log('🟡 Super Admin Access');
      const warnings = await Warning.findAll({
        where: { deleted_at: null },
        order: [['id', 'DESC']],
      });
      console.log('🟡 Super Admin Warnings Count:', warnings.length);
      const data = await Promise.all(warnings.map(w => formatWarningResponse(w)));
      return res.json({ success: true, data });
    }

    // 🟢 Check if user exists in employees table (has branch)
    const userEmployeeRecord = await Employee.findOne({
      where: { user_id: req.user.id },
      attributes: ['branch_id', 'created_by', 'employee_id'],
      raw: true,
    });

    console.log('🔍 User Employee Record:', userEmployeeRecord);

    let warnings = [];

    if (userEmployeeRecord && userEmployeeRecord.branch_id) {
      // 🟢 CASE 1: User has employee record with branch → branch-level access
      console.log('🟡 Branch User Access');
      const branchId = userEmployeeRecord.branch_id;
      console.log('🔍 Branch ID:', branchId);
      
      // Get company ID for branch users
      const companyId = await getCompanyId(req);
      console.log('🔍 Company ID for Branch User:', companyId);
      
      if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

      // 🟢 STEP 1: Get ALL EMPLOYEES in the same branch under this company
      const branchEmployees = await Employee.findAll({
        where: {
          branch_id: branchId,
          deleted_at: null,
        },
        attributes: ['employee_id'],
        raw: true,
      });

      const branchEmployeeIds = branchEmployees.map(e => String(e.employee_id));
      console.log('🔍 Branch Employee IDs:', branchEmployeeIds);

      // 🟢 STEP 2: Fetch warnings where both warning_to AND warning_by are in the same branch
      warnings = await Warning.findAll({
        where: {
          deleted_at: null,
          warning_to: { [Op.in]: branchEmployeeIds },
          warning_by: { [Op.in]: branchEmployeeIds }
        },
        order: [['id', 'DESC']],
      });

    } else {
      // 🟢 CASE 2: User doesn't have employee record (no branch) → FULL DATABASE ACCESS
      console.log('🟡 Branchless User Access (FULL DATABASE)');
      
      // 🟢 DIRECTLY GET ALL WARNINGS - no company filter
      warnings = await Warning.findAll({
        where: { deleted_at: null },
        order: [['id', 'DESC']],
      });
      
      console.log('🔍 Branchless User - All Warnings Count:', warnings.length);
    }

    console.log('🔍 Final Warnings Count:', warnings.length);
    const data = await Promise.all(warnings.map(w => formatWarningResponse(w)));
    console.log('✅ END getAllWarnings - Success');
    return res.json({ success: true, data });

  } catch (err) {
    console.error('❌ Get All Warnings Error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message,
    });
  }
};

// =====================
// 🔹 GET WARNING BY ID
// =====================
exports.getWarningById = async (req, res) => {
  try {
    console.log('🎯 START getWarningById');
    console.log('🔍 User Info - ID:', req.user.id, 'Type:', req.user.type);
    
    const warning = await Warning.findOne({
      where: { id: req.params.id, deleted_at: null },
    });

    if (!warning) {
      return res.status(404).json({ success: false, message: 'Warning not found' });
    }

    // 🟢 Super Admin → full access
    if (isSuper(req)) {
      const data = await formatWarningResponse(warning);
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

      // 🟢 STEP 1: Get the employees linked to the warning
      const toEmployee = await Employee.findOne({
        where: { employee_id: String(warning.warning_to), deleted_at: null },
        raw: true,
      });

      const byEmployee = await Employee.findOne({
        where: { employee_id: String(warning.warning_by), deleted_at: null },
        raw: true,
      });

      if (!toEmployee || !byEmployee) {
        return res.status(404).json({ success: false, message: 'Employees linked to warning not found' });
      }

      // 🟢 STEP 2: Check if both warning employees belong to the same branch as the current user
      const toEmployeeBranchId = toEmployee.branch_id || null;
      const byEmployeeBranchId = byEmployee.branch_id || null;
      
      console.log('🔍 To Employee Branch ID:', toEmployeeBranchId);
      console.log('🔍 By Employee Branch ID:', byEmployeeBranchId);
      console.log('🔍 Current User Branch ID:', userEmployeeRecord.branch_id);

      if (String(toEmployeeBranchId) !== String(userEmployeeRecord.branch_id) || 
          String(byEmployeeBranchId) !== String(userEmployeeRecord.branch_id)) {
        return res.status(403).json({ success: false, message: 'Forbidden: warning belongs to different branch' });
      }

    } else {
      // 🟢 CASE 2: User doesn't have employee record (no branch) → FULL ACCESS
      console.log('🟡 Branchless User - Full warning access');
      // No additional checks needed - branchless users can access any warning
    }

    // ✅ Return formatted warning
    const data = await formatWarningResponse(warning);
    console.log('✅ END getWarningById - Success');
    return res.json({ success: true, data });

  } catch (err) {
    console.error('❌ Get Warning By ID Error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message,
    });
  }
};

// =====================
// 🔹 UPDATE WARNING
// =====================
exports.updateWarning = async (req, res) => {
  try {
    console.log('🎯 START updateWarning');
    console.log('🔍 User Info - ID:', req.user.id, 'Type:', req.user.type);
    
    const { id } = req.params;
    const { warning_to, warning_by, subject, warning_date, description } = req.body;

    const companyId = await getCompanyId(req);
    if (!companyId && !isSuper(req))
      return res
        .status(403)
        .json({ success: false, message: 'Unauthorized' });

    // 🟢 Check if user exists in employees table (has branch)
    const userEmployeeRecord = await Employee.findOne({
      where: { user_id: req.user.id },
      attributes: ['branch_id', 'created_by', 'employee_id'],
      raw: true,
    });

    console.log('🔍 User Employee Record:', userEmployeeRecord);

    let userBranchId = null;

    if (userEmployeeRecord && userEmployeeRecord.branch_id) {
      // 🟢 CASE 1: User has employee record with branch → branch-level access
      console.log('🟡 Branch User - Updating warning');
      userBranchId = userEmployeeRecord.branch_id;
    } else {
      // 🟢 CASE 2: User doesn't have employee record (no branch) → company-wide access
      console.log('🟡 Branchless User - Updating warning');
      // No branch restriction for branchless users
    }

    const warning = await Warning.findOne({
      where: { id, deleted_at: null },
    });
    if (!warning)
      return res
        .status(404)
        .json({ success: false, message: 'Warning not found' });

    const toEmployee = await Employee.findOne({
      where: { employee_id: String(warning.warning_to), deleted_at: null },
    });

    const byEmployee = await Employee.findOne({
      where: { employee_id: String(warning.warning_by), deleted_at: null },
    });

    // Determine allowed creators within company/branch
    const allowedUserIds = await getAllUserIdsUnderCompanyBranch(companyId, isCompany(req) ? null : userBranchId);

    // 🟢 Access validation
    if (!isSuper(req)) {
      if (
        !toEmployee ||
        !byEmployee ||
        !allowedUserIds.map(String).includes(String(toEmployee.created_by)) ||
        !allowedUserIds.map(String).includes(String(byEmployee.created_by))
      ) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: not your branch/company record',
        });
      }

      if (userEmployeeRecord && userEmployeeRecord.branch_id && !isCompany(req) && !isEmployee(req)) {
        // branch-level user: both employees must be in same branch
        if (String(toEmployee.branch_id) !== String(userBranchId) || 
            String(byEmployee.branch_id) !== String(userBranchId)) {
          return res.status(403).json({
            success: false,
            message: 'Forbidden: different branch',
          });
        }
      }
    }

    // Employee users can only update warnings where they are the warning_by
    if (isEmployee(req)) {
      if (!userEmployeeRecord || String(userEmployeeRecord.employee_id) !== String(warning.warning_by)) {
        return res.status(403).json({ success: false, message: 'Employees can only update warnings created by them' });
      }
    }

    // Check if warning_to and warning_by are the same
    if (warning_to && warning_by && String(warning_to) === String(warning_by)) {
      return res.status(400).json({ success: false, message: 'warning_to and warning_by cannot be the same employee' });
    }

    // ✅ If updating warning_to, check if valid and belongs to company
    if (warning_to && warning_to !== warning.warning_to) {
      const newToEmployee = await Employee.findOne({
        where: { employee_id: String(warning_to), deleted_at: null }
      });
      
      if (!newToEmployee) {
        return res.status(400).json({ success: false, message: 'New warning_to employee not found' });
      }

      // Validate new employee belongs to same scope
      if (!isSuper(req)) {
        if (!allowedUserIds.map(String).includes(String(newToEmployee.created_by))) {
          return res.status(403).json({ success: false, message: 'New warning_to employee not in your company/branch scope' });
        }

        if (userEmployeeRecord && userEmployeeRecord.branch_id && !isCompany(req) && !isEmployee(req)) {
          if (String(newToEmployee.branch_id) !== String(userBranchId)) {
            return res.status(403).json({ success: false, message: 'New warning_to employee not in your branch' });
          }
        }
      }
    }

    // ✅ If updating warning_by, check if valid and belongs to company
    if (warning_by && warning_by !== warning.warning_by) {
      const newByEmployee = await Employee.findOne({
        where: { employee_id: String(warning_by), deleted_at: null }
      });
      
      if (!newByEmployee) {
        return res.status(400).json({ success: false, message: 'New warning_by employee not found' });
      }

      // Validate new employee belongs to same scope
      if (!isSuper(req)) {
        if (!allowedUserIds.map(String).includes(String(newByEmployee.created_by))) {
          return res.status(403).json({ success: false, message: 'New warning_by employee not in your company/branch scope' });
        }

        if (userEmployeeRecord && userEmployeeRecord.branch_id && !isCompany(req) && !isEmployee(req)) {
          if (String(newByEmployee.branch_id) !== String(userBranchId)) {
            return res.status(403).json({ success: false, message: 'New warning_by employee not in your branch' });
          }
        }
      }
    }

    // 🟢 Perform update
    await warning.update({
      warning_to: warning_to ?? warning.warning_to,
      warning_by: warning_by ?? warning.warning_by,
      subject: subject ?? warning.subject,
      warning_date: warning_date ?? warning.warning_date,
      description: description ?? warning.description,
      updated_at: new Date(),
    });

    const data = await formatWarningResponse(warning);
    console.log('✅ Warning updated successfully');
    return res.json({
      success: true,
      message: 'Warning updated successfully',
      data,
    });
  } catch (err) {
    console.error('❌ Update Warning Error:', err);
    return res
      .status(500)
      .json({ success: false, message: 'Server error', error: err.message });
  }
};

// =====================
// 🔹 DELETE WARNING (soft delete)
// =====================
exports.deleteWarning = async (req, res) => {
  try {
    console.log('🎯 START deleteWarning');
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
      attributes: ['branch_id', 'created_by', 'employee_id'],
      raw: true,
    });

    console.log('🔍 User Employee Record:', userEmployeeRecord);

    let branchId = null;

    if (userEmployeeRecord && userEmployeeRecord.branch_id) {
      // 🟢 CASE 1: User has employee record with branch → branch-level access
      branchId = userEmployeeRecord.branch_id;
    } else {
      // 🟢 CASE 2: User doesn't have employee record (no branch) → company-wide access
      console.log('🟡 Branchless User - Deleting warning');
    }

    const warning = await Warning.findOne({
      where: { id, deleted_at: null },
    });
    if (!warning)
      return res
        .status(404)
        .json({ success: false, message: 'Warning not found' });

    const toEmployee = await Employee.findOne({
      where: { employee_id: String(warning.warning_to), deleted_at: null },
    });

    const byEmployee = await Employee.findOne({
      where: { employee_id: String(warning.warning_by), deleted_at: null },
    });

    const allowedUserIds = await getAllUserIdsUnderCompanyBranch(
      companyId,
      isCompany(req) ? null : branchId
    );

    // 🟢 Access validation
    if (!isSuper(req)) {
      if (
        !toEmployee ||
        !byEmployee ||
        !allowedUserIds.map(String).includes(String(toEmployee.created_by)) ||
        !allowedUserIds.map(String).includes(String(byEmployee.created_by))
      ) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: not your branch/company record',
        });
      }
      if (!isCompany(req) && branchId !== null) {
        if (String(toEmployee.branch_id) !== String(branchId) || 
            String(byEmployee.branch_id) !== String(branchId)) {
          return res.status(403).json({
            success: false,
            message: 'Forbidden: different branch',
          });
        }
      }
    }

    // Employee users can only delete warnings where they are the warning_by
    if (isEmployee(req)) {
      if (!userEmployeeRecord || String(userEmployeeRecord.employee_id) !== String(warning.warning_by)) {
        return res.status(403).json({ success: false, message: 'Employees can only delete warnings created by them' });
      }
    }

    await warning.destroy();
    console.log('✅ Warning deleted successfully');
    return res.json({
      success: true,
      message: 'Warning deleted successfully',
      data: { id },
    });
  } catch (err) {
    console.error('❌ Delete Warning Error:', err);
    return res
      .status(500)
      .json({ success: false, message: 'Server error', error: err.message });
  }
};