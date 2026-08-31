

// const { validationResult } = require('express-validator');
// const { Op } = require('sequelize');

// const Leave = require('../models/leave.model');
// const Employee = require('../models/employee.model');
// const LeaveType = require('../models/leave_type.model');
// const Branch = require('../models/branch.model');
// const User = require('../models/user.model'); 


// async function getCompanyId(req) {
//   try {
//     if (!req.user) return null;
//     const type = (req.user.type || '').toLowerCase();

//     // 🔹 Super Admin, Admin, Company types
//     if (['company', 'admin', 'super admin'].includes(type)) {
//       return req.user.id;
//     }

//     // 🔹 Employee user — find the company that created them
//     if (type === 'employee') {
//       const employee = await Employee.findOne({
//         where: { user_id: req.user.id },
//         attributes: ['created_by'],
//         raw: true,
//       });

//       if (employee && employee.created_by) {
//         return Number(employee.created_by);
//       } else {
//         console.warn('⚠️ No employee record found for user_id:', req.user.id);
//         return req.user.created_by || req.user.creator_id || null;
//       }
//     }

//     // 🔹 Fallback for role users (e.g., HR, Branch Manager)
//     const emp = await Employee.findOne({
//       where: { user_id: req.user.id },
//       attributes: ['created_by'],
//       raw: true,
//     });

//     if (emp?.created_by) {
//       return Number(emp.created_by);
//     }

//     // 🔹 Final fallback (user created by someone)
//     return req.user.created_by || req.user.creator_id || req.user.id;
//   } catch (err) {
//     console.error('❌ getCompanyId Error:', err.message);
//     return null;
//   }
// }



// function isSuper(req) {
//   return (req.user?.roles || []).some(r => (r.name || '').toLowerCase() === 'super admin');
// }

// function isCompany(req) {
//   return (req.user?.type || '').toLowerCase() === 'company';
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

// async function getAllUserIdsUnderCompanyBranch(companyId, branchId) {
//   if (!companyId) return [];

//   // fetch all direct user accounts created_by company (these are role users & sub-users)
//   const users = await User.findAll({
//     where: { created_by: companyId },
//     attributes: ['id'],
//     raw: true,
//   });
//   const userIds = users.map(u => Number(u.id));
//   const baseSet = new Set([Number(companyId), ...userIds]);

//   if (branchId) {
//     if (userIds.length === 0) return [Number(companyId)];

//     // find which of those userIds have an employee record in this branch
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

// const formatLeaveResponse = async (leave, companyId) => {
//   if (!leave) return null;
//   const json = leave.toJSON ? leave.toJSON() : leave;
  
//   if (json.employee) {
//     json.employee_id = json.employee.employee_id;
//   } else if (json.employee_id) {
//     const e = await Employee.findOne({
//       where: { id: json.employee_id },
//       attributes: ['id', 'employee_id', 'name', 'branch_id']
//     });
//     if (e) {
//       json.employee = { 
//         id: e.id, 
//         employee_id: e.employee_id, 
//         name: e.name,
//         branch_id: e.branch_id
//       };
//       json.employee_id = e.employee_id;
//     }
//   }
//   return json;
// };


// function toMidnight(d) {
//   const date = new Date(d);
//   date.setHours(0, 0, 0, 0);
//   return date;
// }
// function addDays(d, n) {
//   const date = new Date(d);
//   date.setDate(date.getDate() + n);
//   date.setHours(0, 0, 0, 0);
//   return date;
// }
// function computeDates({ start_date, end_date, total_leave_days }) {
//   if (!start_date) throw new Error('start_date is required');

//   const start = toMidnight(start_date);
//   let end;
//   let total;

//   if (end_date) {
//     end = toMidnight(end_date);
//     if (end < start) throw new Error('end_date must be same or after start_date');
//     const msDiff = end.getTime() - start.getTime();
//     total = Math.floor(msDiff / (24 * 60 * 60 * 1000)) + 1;
//   } else if (total_leave_days !== undefined && total_leave_days !== null) {
//     total = Number(total_leave_days);
//     if (!Number.isFinite(total) || total <= 0) throw new Error('total_leave_days must be a positive number');
//     end = addDays(start, total - 1);
//   } else {
//     total = 1;
//     end = start;
//   }

//   return { start_date: start, end_date: end, total_leave_days: total };
// }



// exports.createLeave = async (req, res) => {
//   try {
//     if (req.body.created_by) delete req.body.created_by;

//     const errors = validationResult(req);
//     if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

//     const companyId = await getCompanyId(req);
//     if (!companyId && !isSuper(req)) {
//       return res.status(400).json({ success: false, message: 'Could not resolve company/tenant' });
//     }

//     // ✅ get branch id of current user
//     const userBranchId = await getUserBranchId(req.user.id);
//     if (!isCompany(req) && !userBranchId && (req.user.type || '').toLowerCase() !== 'employee') {
//       return res.status(403).json({ success: false, message: "No branch assigned" });
//     }

//     const targetEmployeeBusinessId = req.body.employee_id;
//     let targetEmployee = null;


//     // ✅ FIXED: include branchId in allowed users
//     const allowedCreatedBy = await getAllUserIdsUnderCompanyBranch(companyId, userBranchId);

//     if (!targetEmployeeBusinessId) {
//       // Self leave
//       targetEmployee = await Employee.findOne({
//         where: { user_id: req.user.id, created_by: { [Op.in]: allowedCreatedBy }, deleted_at: null },
//       });
//       if (!targetEmployee)
//         return res.status(403).json({ success: false, message: 'Employee record not found' });
//     } else {
//       // ✅ FIXED: Search employee created by any allowed user within allowed branch scope
//       const whereClause = {
//         employee_id: String(targetEmployeeBusinessId),
//         created_by: { [Op.in]: allowedCreatedBy },
//         deleted_at: null,
//       };

//       // ✅ If branch-scoped user (HR/Branch Manager) — restrict to same branch
//       if (!isCompany(req) && !isSuper(req) && userBranchId) {
//         whereClause.branch_id = userBranchId;
//       }

//       targetEmployee = await Employee.findOne({ where: whereClause });

//       if (!targetEmployee)
//         return res.status(404).json({ success: false, message: 'Target employee not found or not in your branch' });

//       // branch restriction for HR / branch users
//       if (
//         !isCompany(req) &&
//         !isSuper(req) &&
//         (req.user.type || '').toLowerCase() !== 'employee'
//       ) {
//         const loggedInEmp = await Employee.findOne({
//           where: { user_id: req.user.id, deleted_at: null },
//         });
//         if (!loggedInEmp)
//           return res.status(403).json({ success: false, message: 'Your employee record not found' });

//         if (String(targetEmployee.branch_id) !== String(loggedInEmp.branch_id)) {
//           return res
//             .status(403)
//             .json({ success: false, message: 'You can only create leaves for employees in your branch' });
//         }
//       }

//       // employee cannot create for others
//       if ((req.user.type || '').toLowerCase() === 'employee') {
//         const self = await Employee.findOne({ where: { user_id: req.user.id, deleted_at: null } });
//         if (!self || String(self.employee_id) !== String(targetEmployeeBusinessId)) {
//           return res
//             .status(403)
//             .json({ success: false, message: 'You can only create leave for yourself' });
//         }
//       }
//     }

//     // compute dates
//     try {
//       const computed = computeDates({
//         start_date: req.body.start_date,
//         end_date: req.body.end_date,
//         total_leave_days: req.body.total_leave_days,
//       });
//       req.body.start_date = computed.start_date;
//       req.body.end_date = computed.end_date;
//       req.body.total_leave_days = computed.total_leave_days;
//     } catch (ex) {
//       return res.status(400).json({ success: false, message: ex.message });
//     }

//     req.body.applied_on = req.body.applied_on ? new Date(req.body.applied_on) : new Date();
//     req.body.employee_id = targetEmployee.id;
//     req.body.created_by = req.user.id;
//     req.body.status = 'Pending';

//     const leave = await Leave.create(req.body);

//     const full = await Leave.findOne({
//       where: { id: leave.id, deleted_at: null },
//       include: [
//         { model: Employee, as: 'employee', attributes: ['id', 'employee_id', 'name', 'branch_id'] },
//         { model: LeaveType, as: 'leave_type', attributes: ['id', 'title'] },
//       ],
//     });

//     const response = await formatLeaveResponse(full, companyId);
//     return res.status(201).json({ success: true, message: 'Leave created', data: response });
//   } catch (err) {
//     console.error('❌ Error creating leave:', err);
//     return res.status(500).json({ success: false, message: 'Server error', error: err.message });
//   }
// };


// exports.getAllLeaves = async (req, res) => {
//   try {
//     const { search = '', leave_type_id, status, employee_id } = req.query;
//     const userId = req.user?.id;
//     const userType = (req.user?.type || '').toLowerCase();

//     // 🔹 SUPER ADMIN: Full access to all records
//     if (isSuper(req)) {
//       const where = { deleted_at: null };
//       if (leave_type_id) where.leave_type_id = leave_type_id;
//       if (status) where.status = status;
//       if (search) where.leave_reason = { [Op.like]: `%${search}%` };

//       const { count, rows } = await Leave.findAndCountAll({
//         where,
//         include: [
//           { model: Employee, as: 'employee', attributes: ['id', 'employee_id', 'name', 'branch_id'] },
//           { model: LeaveType, as: 'leave_type', attributes: ['id', 'title'] },
//         ],
//         order: [['id', 'DESC']],
//       });

//       const data = await Promise.all(rows.map(l => formatLeaveResponse(l, null)));
//       return res.json({ success: true, total: count, data });
//     }

//     // 🔹 Resolve company and branch
//     const companyId = await getCompanyId(req);
//     const branchId = await getUserBranchId(userId);

//     if (!companyId) {
//       return res.status(400).json({ success: false, message: 'Could not resolve company/tenant' });
//     }

//     // 🔹 Base query
//     const where = { deleted_at: null };
//     if (leave_type_id) where.leave_type_id = leave_type_id;
//     if (status) where.status = status;
//     if (search) where.leave_reason = { [Op.like]: `%${search}%` };

//     // ============================================================
//     // 🏢 COMPANY USER → Access ALL branches under its company
//     // ============================================================
//     // if (isCompany(req)) {
//     //   const companyEmployees = await Employee.findAll({
//     //     where: { created_by: companyId, deleted_at: null },
//     //     attributes: ['id'],
//     //     raw: true,
//     //   });
//     //   const employeeIds = companyEmployees.map(e => e.id);
//     //   where.employee_id = employeeIds.length ? { [Op.in]: employeeIds } : -1;
//     // }
    
//     // ============================================================
//     // 🏢 COMPANY USER → Access ALL branches under its company
//     // ============================================================
//     if (isCompany(req)) {
//       // ✅ UPDATED LOGIC STARTS HERE
//       // Fetch all users created by the company (includes HR, Branch Managers, etc.)
//       const allUserIds = await User.findAll({
//         where: { [Op.or]: [{ id: companyId }, { created_by: companyId }] },
//         attributes: ['id'],
//         raw: true,
//       });

//       const allowedUserIds = allUserIds.map(u => Number(u.id));

//       // Fetch all employees created by company or any of its sub-users
//       const companyEmployees = await Employee.findAll({
//         where: { 
//           created_by: { [Op.in]: allowedUserIds },
//           deleted_at: null
//         },
//         attributes: ['id'],
//         raw: true,
//       });

//       const employeeIds = companyEmployees.map(e => e.id);
//       where.employee_id = employeeIds.length ? { [Op.in]: employeeIds } : -1;
//       // ✅ UPDATED LOGIC ENDS HERE
//     }


//     // ============================================================
//     // 🧑‍💼 BRANCH USER (HR / BRANCH MANAGER)
//     // ============================================================
//     else {
//       if (!branchId) {
//         return res.status(403).json({ success: false, message: 'No branch assigned' });
//       }

//       // ✅ UPDATED LOGIC STARTS HERE
//       // ✅ Get all user IDs (HRs, Managers, Employees) under same company + same branch
//       const allowedUserIds = await getAllUserIdsUnderCompanyBranch(companyId, branchId);

//       // ✅ Fetch all employees belonging to that company + branch
//       const branchEmployees = await Employee.findAll({
//         where: { 
//           branch_id: branchId, 
//           created_by: { [Op.in]: allowedUserIds }, 
//           deleted_at: null 
//         },
//         attributes: ['id'],
//         raw: true,
//       });

//       const branchEmpIds = branchEmployees.map(e => e.id);

//       // If no employees found in branch
//       if (branchEmpIds.length === 0) {
//         return res.json({ success: true, total: 0, data: [] });
//       }

//       // Restrict leaves only to this branch’s employees
//       where.employee_id = { [Op.in]: branchEmpIds };
//       // ✅ UPDATED LOGIC ENDS HERE
//     }

//     // ============================================================
//     // 🔍 FILTER BY employee_id (optional)
//     // ============================================================
//     if (employee_id) {
//       const emp = await Employee.findOne({
//         where: { employee_id: String(employee_id), deleted_at: null },
//         attributes: ['id'],
//       });
//       if (emp) where.employee_id = emp.id;
//       else where.employee_id = -1;
//     }

//     // ============================================================
//     // EXECUTE QUERY
//     // ============================================================
//     const { count, rows } = await Leave.findAndCountAll({
//       where,
//       include: [
//         { model: Employee, as: 'employee', attributes: ['id', 'employee_id', 'name', 'branch_id'] },
//         { model: LeaveType, as: 'leave_type', attributes: ['id', 'title'] },
//       ],
//       order: [['id', 'DESC']],
//     });

//     const leaves = await Promise.all(rows.map(leave => formatLeaveResponse(leave, companyId)));

//     return res.json({ success: true, total: count, data: leaves });

//   } catch (err) {
//     console.error('❌ Error fetching leaves:', err);
//     return res.status(500).json({ success: false, message: 'Server error', error: err.message });
//   }
// };


// exports.getLeaveById = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const leave = await Leave.findOne({
//       where: { id, deleted_at: null },
//       include: [
//         { model: Employee, as: 'employee', attributes: ['id', 'employee_id', 'name', 'branch_id'] },
//         { model: LeaveType, as: 'leave_type', attributes: ['id', 'title'] }
//       ]
//     });

//     if (!leave) {
//       return res.status(404).json({ success: false, message: 'Leave not found' });
//     }

//     // non-super users must pass company/branch/created_by checks
//     if (!isSuper(req)) {
//       const companyId = await getCompanyId(req);
//       if (!companyId) return res.status(403).json({ success: false, message: "Unauthorized" });

//       const branchId = isCompany(req) ? null : await getUserBranchId(req.user.id);
//       if (!isCompany(req) && !branchId) return res.status(403).json({ success: false, message: "No branch assigned" });

//       const allowedCreatedBy = await getAllUserIdsUnderCompanyBranch(companyId, branchId);

//       if (!allowedCreatedBy.map(String).includes(String(leave.created_by))) {
//         return res.status(403).json({ success: false, message: "Forbidden: not your record" });
//       }

//       if (branchId) {
//         const leaveJson = leave.toJSON ? leave.toJSON() : leave;
//         const employeeBranchId = leaveJson.employee?.branch_id;
//         if (employeeBranchId && String(employeeBranchId) !== String(branchId)) {
//           return res.status(403).json({ success: false, message: "Forbidden: not your branch record" });
//         }
//       }

//       // non-company users (including branch role users) — employee-only restrictions
//       if (!isCompany(req)) {
//         const emp = await Employee.findOne({ where: { user_id: req.user.id } });
//         if (!emp) return res.status(403).json({ success: false, message: 'Employee record not found' });

//         const leaveJson = leave.toJSON ? leave.toJSON() : leave;
//         if (String(emp.employee_id) !== String(leaveJson.employee?.employee_id) && (req.user.type || '').toLowerCase() === 'employee') {
//           return res.status(403).json({ success: false, message: 'Access denied' });
//         }
//       }
//     }

//     const companyId = await getCompanyId(req);
//     const response = await formatLeaveResponse(leave, companyId);

//     return res.json({ success: true, data: response });
//   } catch (err) {
//     console.error('❌ Error fetching leave:', err);
//     return res.status(500).json({ success: false, message: 'Server error', error: err.message });
//   }
// };


// exports.updateLeave = async (req, res) => {
//   try {
//     if (req.body.created_by) delete req.body.created_by;
//     const { id } = req.params;

//     // Super admin handles later
//     if (!isSuper(req)) {
//       const companyId = await getCompanyId(req);
//       if (!companyId) return res.status(403).json({ success: false, message: "Unauthorized" });

//       const branchId = isCompany(req) ? null : await getUserBranchId(req.user.id);
//       if (!isCompany(req) && !branchId) return res.status(403).json({ success: false, message: "No branch assigned" });

//       const allowedCreatedBy = await getAllUserIdsUnderCompanyBranch(companyId, branchId);

//       const leave = await Leave.findOne({
//         where: { id, created_by: { [Op.in]: allowedCreatedBy }, deleted_at: null },
//         include: [{ model: Employee, as: 'employee' }]
//       });

//       if (!leave) return res.status(404).json({ success: false, message: 'Leave not found' });

//       // If branch-scoped ensure employee belongs to that branch
//       if (branchId) {
//         const leaveJson = leave.toJSON ? leave.toJSON() : leave;
//         const employeeBranchId = leaveJson.employee?.branch_id;
//         if (employeeBranchId && String(employeeBranchId) !== String(branchId)) {
//           return res.status(403).json({ success: false, message: "Forbidden: not your branch record" });
//         }
//       }

//       // Employee (self) update: only own pending leave
//       if ((req.user.type || '').toLowerCase() === 'employee') {
//         const emp = await Employee.findOne({ where: { user_id: req.user.id } });
//         if (!emp) return res.status(403).json({ success: false, message: 'Employee record not found' });

//         if (String(emp.employee_id) !== String(leave.employee?.employee_id)) {
//           return res.status(403).json({ success: false, message: 'Access denied' });
//         }

//         if (leave.status !== 'Pending') {
//           return res.status(400).json({ success: false, message: 'Cannot edit approved/rejected leave' });
//         }

//         // allow limited fields only
//         const safe = {};
//         const EMPLOYEE_ALLOWED_UPDATE_FIELDS = [
//           'applied_on', 'start_date', 'end_date', 'total_leave_days', 'leave_reason', 'remark', 'leave_type_id'
//         ];
//         for (const f of EMPLOYEE_ALLOWED_UPDATE_FIELDS) if (req.body[f] !== undefined) safe[f] = req.body[f];

//         if (safe.start_date || safe.end_date || safe.total_leave_days !== undefined) {
//           try {
//             const computed = computeDates({
//               start_date: safe.start_date || leave.start_date,
//               end_date: safe.end_date || leave.end_date,
//               total_leave_days: safe.total_leave_days !== undefined ? safe.total_leave_days : leave.total_leave_days
//             });
//             safe.start_date = computed.start_date;
//             safe.end_date = computed.end_date;
//             safe.total_leave_days = computed.total_leave_days;
//           } catch (ex) {
//             return res.status(400).json({ success: false, message: ex.message });
//           }
//         }

//         await leave.update(safe);
//       } else {
//         // Company/branch role updating
//         const payload = { ...req.body };

//         if (payload.employee_id) {
//           // validate employee belongs to company and (if branch role) is in same branch
//           const targetEmp = await Employee.findOne({
//             where: { employee_id: String(payload.employee_id), created_by: companyId, deleted_at: null }
//           });
//           if (!targetEmp) return res.status(400).json({ success: false, message: 'Employee does not belong to your company' });

//           if (branchId && String(targetEmp.branch_id) !== String(branchId)) {
//             return res.status(403).json({ success: false, message: 'Forbidden: employee not in your branch' });
//           }

//           payload.employee_id = targetEmp.id;
//         }

//         if (payload.start_date || payload.end_date || payload.total_leave_days !== undefined) {
//           try {
//             const computed = computeDates({
//               start_date: payload.start_date || leave.start_date,
//               end_date: payload.end_date || leave.end_date,
//               total_leave_days: payload.total_leave_days !== undefined ? payload.total_leave_days : leave.total_leave_days
//             });
//             payload.start_date = computed.start_date;
//             payload.end_date = computed.end_date;
//             payload.total_leave_days = computed.total_leave_days;
//           } catch (ex) {
//             return res.status(400).json({ success: false, message: ex.message });
//           }
//         }

//         await leave.update(payload);
//       }

//       const updated = await Leave.findOne({
//         where: { id: leave.id, deleted_at: null },
//         include: [
//           { model: Employee, as: 'employee', attributes: ['id', 'employee_id', 'name', 'branch_id'] },
//           { model: LeaveType, as: 'leave_type', attributes: ['id', 'title'] }
//         ]
//       });

//       const response = await formatLeaveResponse(updated, companyId);
//       return res.json({ success: true, message: 'Leave updated', data: response });
//     } else {
//       // Super admin update
//       const leave = await Leave.findOne({ where: { id, deleted_at: null } });
//       if (!leave) return res.status(404).json({ success: false, message: 'Leave not found' });

//       const payload = { ...req.body };

//       // allow changing employee by business employee_id
//       if (payload.employee_id) {
//         const targetEmp = await Employee.findOne({ where: { employee_id: String(payload.employee_id), deleted_at: null } });
//         if (targetEmp) payload.employee_id = targetEmp.id;
//       }

//       if (payload.start_date || payload.end_date || payload.total_leave_days !== undefined) {
//         try {
//           const computed = computeDates({
//             start_date: payload.start_date || leave.start_date,
//             end_date: payload.end_date || leave.end_date,
//             total_leave_days: payload.total_leave_days !== undefined ? payload.total_leave_days : leave.total_leave_days
//           });
//           payload.start_date = computed.start_date;
//           payload.end_date = computed.end_date;
//           payload.total_leave_days = computed.total_leave_days;
//         } catch (ex) {
//           return res.status(400).json({ success: false, message: ex.message });
//         }
//       }

//       await leave.update(payload);

//       const updated = await Leave.findOne({
//         where: { id: leave.id, deleted_at: null },
//         include: [
//           { model: Employee, as: 'employee', attributes: ['id', 'employee_id', 'name', 'branch_id'] },
//           { model: LeaveType, as: 'leave_type', attributes: ['id', 'title'] }
//         ]
//       });

//       const response = await formatLeaveResponse(updated, null);
//       return res.json({ success: true, message: 'Leave updated', data: response });
//     }
//   } catch (err) {
//     console.error('❌ Error updating leave:', err);
//     return res.status(500).json({ success: false, message: 'Server error', error: err.message });
//   }
// };


// exports.deleteLeave = async (req, res) => {
//   try {
//     const { id } = req.params;

//     if (isSuper(req)) {
//       const leave = await Leave.findOne({ where: { id } });
//       if (!leave) return res.status(404).json({ success: false, message: 'Leave not found' });
//       await leave.destroy();
//       return res.json({ success: true, message: 'Leave soft deleted successfully', data: { id } });
//     }

//     const companyId = await getCompanyId(req);
//     if (!companyId) return res.status(403).json({ success: false, message: "Unauthorized" });

//     const branchId = isCompany(req) ? null : await getUserBranchId(req.user.id);
//     if (!isCompany(req) && !branchId) return res.status(403).json({ success: false, message: "No branch assigned" });

//     const allowedCreatedBy = await getAllUserIdsUnderCompanyBranch(companyId, branchId);

//     const leave = await Leave.findOne({
//       where: { id, created_by: { [Op.in]: allowedCreatedBy } },
//       include: [{ model: Employee, as: 'employee' }]
//     });

//     if (!leave) return res.status(404).json({ success: false, message: 'Leave not found' });

//     if (branchId) {
//       const leaveJson = leave.toJSON ? leave.toJSON() : leave;
//       const employeeBranchId = leaveJson.employee?.branch_id;
//       if (employeeBranchId && String(employeeBranchId) !== String(branchId)) {
//         return res.status(403).json({ success: false, message: "Forbidden: not your branch record" });
//       }
//     }

//     // Employee self-delete only for Pending status
//     if ((req.user.type || '').toLowerCase() === 'employee') {
//       const emp = await Employee.findOne({ where: { user_id: req.user.id } });
//       if (!emp) return res.status(403).json({ success: false, message: 'Employee record not found' });

//       if (String(emp.employee_id) !== String(leave.employee?.employee_id)) {
//         return res.status(403).json({ success: false, message: 'Access denied' });
//       }
//       if (leave.status !== 'Pending') {
//         return res.status(400).json({ success: false, message: 'Cannot delete approved/rejected leave' });
//       }
//     }

//     await leave.destroy();
//     return res.json({ success: true, message: 'Leave soft deleted successfully', data: { id } });

//   } catch (err) {
//     console.error('❌ Error deleting leave:', err);
//     return res.status(500).json({ success: false, message: 'Server error', error: err.message });
//   }
// };


// exports.getLeaveByEmployeeId = async (req, res) => {
//   try {
//     const { employee_id: businessEmpId } = req.params;

//     if (!businessEmpId) {
//       return res.status(400).json({ success: false, message: "Employee ID is required" });
//     }

//     const companyId = await getCompanyId(req);
//     const branchId = isCompany(req) ? null : await getUserBranchId(req.user.id);

//     // 🔹 Step 1: Determine allowed users (company + branch)
//     let allowedUserIds = [];
//     if (!isSuper(req)) {
//       allowedUserIds = await getAllUserIdsUnderCompanyBranch(companyId, branchId);
//     }

//     // 🔹 Step 2: Find employee by business employee_id and allowed users
//     const targetEmployee = await Employee.findOne({
//       where: {
//         employee_id: String(businessEmpId),
//         deleted_at: null,
//         ...(isSuper(req) ? {} : { created_by: { [Op.in]: allowedUserIds } }),
//         ...(branchId ? { branch_id: branchId } : {}),
//       },
//       attributes: ['id', 'employee_id', 'name', 'branch_id', 'created_by'],
//     });

//     if (!targetEmployee) {
//       return res.status(404).json({ success: false, message: "Employee not found or not in your company/branch" });
//     }

//     // 🔹 Step 3: Fetch leaves using employee PK (id)
//     const leaves = await Leave.findAll({
//       where: { employee_id: targetEmployee.id, deleted_at: null },
//       include: [
//         { model: Employee, as: 'employee', attributes: ['id', 'employee_id', 'name', 'branch_id'] },
//         { model: LeaveType, as: 'leave_type', attributes: ['id', 'title'] },
//       ],
//       order: [['id', 'DESC']],
//     });

//     const formatted = await Promise.all(leaves.map(l => formatLeaveResponse(l, companyId)));

//     return res.json({ success: true, total: formatted.length, data: formatted });

//   } catch (err) {
//     console.error('❌ Error fetching leaves by employee ID:', err);
//     return res.status(500).json({ success: false, message: 'Server error', error: err.message });
//   }
// };













const { validationResult } = require('express-validator');
const { Op } = require('sequelize');

const Leave = require('../models/leave.model');
const Employee = require('../models/employee.model');
const LeaveType = require('../models/leave_type.model');
const Branch = require('../models/branch.model');
const User = require('../models/user.model');


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

const formatLeaveResponse = async (leave, companyId) => {
  if (!leave) return null;
  const json = leave.toJSON ? leave.toJSON() : leave;
  
  if (json.employee) {
    json.employee_id = json.employee.employee_id;
  } else if (json.employee_id) {
    const e = await Employee.findOne({
      where: { id: json.employee_id },
      attributes: ['id', 'employee_id', 'name', 'branch_id']
    });
    if (e) {
      json.employee = { 
        id: e.id, 
        employee_id: e.employee_id, 
        name: e.name,
        branch_id: e.branch_id
      };
      json.employee_id = e.employee_id;
    }
  }
  return json;
};


function toMidnight(d) {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  return date;
}

function addDays(d, n) {
  const date = new Date(d);
  date.setDate(date.getDate() + n);
  date.setHours(0, 0, 0, 0);
  return date;
}

function computeDates({ start_date, end_date, total_leave_days }) {
  if (!start_date) throw new Error('start_date is required');

  const start = toMidnight(start_date);
  let end;
  let total;

  if (end_date) {
    end = toMidnight(end_date);
    if (end < start) throw new Error('end_date must be same or after start_date');
    const msDiff = end.getTime() - start.getTime();
    total = Math.floor(msDiff / (24 * 60 * 60 * 1000)) + 1;
  } else if (total_leave_days !== undefined && total_leave_days !== null) {
    total = Number(total_leave_days);
    if (!Number.isFinite(total) || total <= 0) throw new Error('total_leave_days must be a positive number');
    end = addDays(start, total - 1);
  } else {
    total = 1;
    end = start;
  }

  return { start_date: start, end_date: end, total_leave_days: total };
}


// exports.createLeave = async (req, res) => {
//   try {
//     console.log('🎯 START createLeave');
//     console.log('🔍 User Info - ID:', req.user.id, 'Type:', req.user.type);
    
//     if (req.body.created_by) delete req.body.created_by;

//     const errors = validationResult(req);
//     if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

//     const companyId = await getCompanyId(req);
//     if (!companyId && !isSuper(req)) {
//       return res.status(400).json({ success: false, message: 'Could not resolve company/tenant' });
//     }

//     // 🟢 Check if user exists in employees table (has branch)
//     const userEmployeeRecord = await Employee.findOne({
//       where: { user_id: req.user.id },
//       attributes: ['branch_id', 'created_by', 'employee_id'],
//       raw: true,
//     });

//     console.log('🔍 User Employee Record:', userEmployeeRecord);

//     let userBranchId = null;

//     if (userEmployeeRecord && userEmployeeRecord.branch_id) {
//       // 🟢 CASE 1: User has employee record with branch → branch-level access
//       console.log('🟡 Branch User - Creating leave');
//       userBranchId = userEmployeeRecord.branch_id;
//     } else {
//       // 🟢 CASE 2: User doesn't have employee record (no branch) → company-wide access
//       console.log('🟡 Branchless User - Creating leave');
//       // No branch restriction for branchless users
//     }

//     // 🟢 FIX: Only require branch for branch users, not branchless users
//     if (!isCompany(req) && !isSuper(req) && userEmployeeRecord && !userBranchId && !isEmployee(req)) {
//       return res.status(403).json({ success: false, message: 'No branch assigned' });
//     }

//     // Determine allowed creators within company/branch
//     const allowedCreatedBy = await getAllUserIdsUnderCompanyBranch(companyId, isCompany(req) ? null : userBranchId);

//     const targetEmployeeBusinessId = req.body.employee_id;
//     let targetEmployee = null;

//     if (!targetEmployeeBusinessId) {
//       // Self leave
//       targetEmployee = await Employee.findOne({
//         where: { 
//           user_id: req.user.id, 
//           created_by: { [Op.in]: allowedCreatedBy }, 
//           deleted_at: null 
//         },
//       });
//       if (!targetEmployee)
//         return res.status(403).json({ success: false, message: 'Employee record not found' });
//     } else {
//       // Find target employee by business employee_id
//       const whereClause = {
//         employee_id: String(targetEmployeeBusinessId),
//         created_by: { [Op.in]: allowedCreatedBy },
//         deleted_at: null,
//       };

//       // 🟢 If branch-scoped user (HR/Branch Manager) — restrict to same branch
//       if (!isCompany(req) && !isSuper(req) && userBranchId) {
//         whereClause.branch_id = userBranchId;
//       }

//       targetEmployee = await Employee.findOne({ where: whereClause });

//       if (!targetEmployee)
//         return res.status(404).json({ success: false, message: 'Target employee not found or not in your branch' });

//       // Employee users can only create leaves for themselves
//       if (isEmployee(req)) {
//         const self = await Employee.findOne({ 
//           where: { user_id: req.user.id, deleted_at: null } 
//         });
//         if (!self || String(self.employee_id) !== String(targetEmployeeBusinessId)) {
//           return res.status(403).json({ 
//             success: false, 
//             message: 'Employees can only create leaves for themselves' 
//           });
//         }
//       }
//     }

//     // Compute dates
//     try {
//       const computed = computeDates({
//         start_date: req.body.start_date,
//         end_date: req.body.end_date,
//         total_leave_days: req.body.total_leave_days,
//       });
//       req.body.start_date = computed.start_date;
//       req.body.end_date = computed.end_date;
//       req.body.total_leave_days = computed.total_leave_days;
//     } catch (ex) {
//       return res.status(400).json({ success: false, message: ex.message });
//     }

//     req.body.applied_on = req.body.applied_on ? new Date(req.body.applied_on) : new Date();
//     req.body.employee_id = targetEmployee.id;
//     req.body.created_by = req.user.id;
//     req.body.status = 'Pending';

//     const leave = await Leave.create(req.body);

//     const full = await Leave.findOne({
//       where: { id: leave.id, deleted_at: null },
//       include: [
//         { 
//           model: Employee, 
//           as: 'employee', 
//           attributes: ['id', 'employee_id', 'name', 'branch_id'] 
//         },
//         { 
//           model: LeaveType, 
//           as: 'leave_type', 
//           attributes: ['id', 'title'] 
//         },
//       ],
//     });

//     const response = await formatLeaveResponse(full, companyId);
//     console.log('✅ Leave created successfully');
//     return res.status(201).json({ success: true, message: 'Leave created', data: response });
//   } catch (err) {
//     console.error('❌ Create Leave Error:', err);
//     return res.status(500).json({ success: false, message: 'Server error', error: err.message });
//   }
// };
exports.createLeave = async (req, res) => {
  try {
    console.log('🎯 START createLeave');
    console.log('🔍 User Info - ID:', req.user.id, 'Type:', req.user.type);
    
    if (req.body.created_by) delete req.body.created_by;

    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

    const companyId = await getCompanyId(req);
    if (!companyId && !isSuper(req)) {
      return res.status(400).json({ success: false, message: 'Could not resolve company/tenant' });
    }

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
      console.log('🟡 Branch User - Creating leave');
      userBranchId = userEmployeeRecord.branch_id;
    } else {
      // 🟢 CASE 2: User doesn't have employee record (no branch) → company-wide access
      console.log('🟡 Branchless User - Creating leave');
      // No branch restriction for branchless users
    }

    // 🟢 FIX: Only require branch for branch users, not branchless users
    if (!isCompany(req) && !isSuper(req) && userEmployeeRecord && !userBranchId && !isEmployee(req)) {
      return res.status(403).json({ success: false, message: 'No branch assigned' });
    }

    const targetEmployeeBusinessId = req.body.employee_id;
    let targetEmployee = null;

    if (!targetEmployeeBusinessId) {
      // ============================================================
      // 🔥 HIGHLIGHTED FIX: SELF LEAVE - NO CREATED_BY CHECK
      // ============================================================
      targetEmployee = await Employee.findOne({
        where: { 
          user_id: req.user.id, 
          // 🟢 REMOVED: created_by check
          deleted_at: null 
        },
      });
      if (!targetEmployee)
        return res.status(403).json({ success: false, message: 'Employee record not found' });
    } else {
      // ============================================================
      // 🔥 HIGHLIGHTED FIX: TARGET EMPLOYEE - NO CREATED_BY CHECK
      // ONLY CHECK BRANCH FOR BRANCH USERS
      // ============================================================
      const whereClause = {
        employee_id: String(targetEmployeeBusinessId),
        // 🟢 REMOVED: created_by check
        deleted_at: null,
      };

      // 🟢 ONLY BRANCH USERS GET BRANCH RESTRICTION
      if (!isCompany(req) && !isSuper(req) && userBranchId) {
        whereClause.branch_id = userBranchId;
      }
      // 🟢 BRANCH-LESS USERS & COMPANY USERS: NO BRANCH RESTRICTION

      console.log('🔍 Target Employee Where Clause:', whereClause);

      targetEmployee = await Employee.findOne({ where: whereClause });

      if (!targetEmployee) {
        const message = userBranchId 
          ? 'Target employee not found or not in your branch' 
          : 'Target employee not found in your company';
        return res.status(404).json({ success: false, message });
      }

      // ============================================================
      // 🔥 HIGHLIGHTED FIX: EMPLOYEE CAN ONLY CREATE FOR THEMSELVES
      // ============================================================
      if (isEmployee(req)) {
        const self = await Employee.findOne({ 
          where: { user_id: req.user.id, deleted_at: null } 
        });
        if (!self || String(self.employee_id) !== String(targetEmployeeBusinessId)) {
          return res.status(403).json({ 
            success: false, 
            message: 'Employees can only create leaves for themselves' 
          });
        }
      }

      // ============================================================
      // 🔥 HIGHLIGHTED FIX: BRANCH USER CAN CREATE FOR ANY EMPLOYEE IN THEIR BRANCH
      // NO CREATOR RESTRICTIONS
      // ============================================================
      if (!isCompany(req) && !isSuper(req) && userBranchId) {
        const loggedInEmp = await Employee.findOne({
          where: { user_id: req.user.id, deleted_at: null },
        });
        if (!loggedInEmp)
          return res.status(403).json({ success: false, message: 'Your employee record not found' });

        // 🟢 ONLY CHECK IF EMPLOYEE IS IN SAME BRANCH, NOT WHO CREATED THEM
        if (String(targetEmployee.branch_id) !== String(loggedInEmp.branch_id)) {
          return res
            .status(403)
            .json({ success: false, message: 'You can only create leaves for employees in your branch' });
        }
      }
    }

    // Compute dates
    try {
      const computed = computeDates({
        start_date: req.body.start_date,
        end_date: req.body.end_date,
        total_leave_days: req.body.total_leave_days,
      });
      req.body.start_date = computed.start_date;
      req.body.end_date = computed.end_date;
      req.body.total_leave_days = computed.total_leave_days;
    } catch (ex) {
      return res.status(400).json({ success: false, message: ex.message });
    }

    req.body.applied_on = req.body.applied_on ? new Date(req.body.applied_on) : new Date();
    req.body.employee_id = targetEmployee.id;
    req.body.created_by = req.user.id;
    req.body.status = 'Pending';

    const leave = await Leave.create(req.body);

    const full = await Leave.findOne({
      where: { id: leave.id, deleted_at: null },
      include: [
        { 
          model: Employee, 
          as: 'employee', 
          attributes: ['id', 'employee_id', 'name', 'branch_id'] 
        },
        { 
          model: LeaveType, 
          as: 'leave_type', 
          attributes: ['id', 'title'] 
        },
      ],
    });

    const response = await formatLeaveResponse(full, companyId);
    console.log('✅ Leave created successfully');
    return res.status(201).json({ success: false, message: 'Leave created', data: response });
  } catch (err) {
    console.error('❌ Create Leave Error:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};


exports.getAllLeaves = async (req, res) => {
  try {
    console.log('🎯 START getAllLeaves');
    console.log('🔍 User Info - ID:', req.user.id, 'Type:', req.user.type);

    const { search = '', leave_type_id, status, employee_id } = req.query;

    // 🟢 SUPER ADMIN: Full access
    if (isSuper(req)) {
      console.log('🟡 Super Admin Access');
      const where = { deleted_at: null };
      if (leave_type_id) where.leave_type_id = leave_type_id;
      if (status) where.status = status;
      if (search) where.leave_reason = { [Op.like]: `%${search}%` };

      const { count, rows } = await Leave.findAndCountAll({
        where,
        include: [
          { 
            model: Employee, 
            as: 'employee', 
            attributes: ['id', 'employee_id', 'name', 'branch_id'] 
          },
          { 
            model: LeaveType, 
            as: 'leave_type', 
            attributes: ['id', 'title'] 
          },
        ],
        order: [['id', 'DESC']],
      });

      console.log('🟡 Super Admin Leaves Count:', count);
      const data = await Promise.all(rows.map(l => formatLeaveResponse(l, null)));
      return res.json({ success: true, total: count, data });
    }

    const companyId = await getCompanyId(req);
    if (!companyId) {
      return res.status(400).json({ success: false, message: 'Could not resolve company/tenant' });
    }

    // 🟢 Check if user exists in employees table (has branch)
    const userEmployeeRecord = await Employee.findOne({
      where: { user_id: req.user.id },
      attributes: ['branch_id', 'created_by', 'employee_id'],
      raw: true,
    });

    console.log('🔍 User Employee Record:', userEmployeeRecord);

    let where = { deleted_at: null };
    if (leave_type_id) where.leave_type_id = leave_type_id;
    if (status) where.status = status;
    if (search) where.leave_reason = { [Op.like]: `%${search}%` };

    let leaves = [];

    if (userEmployeeRecord && userEmployeeRecord.branch_id) {
      // 🟢 CASE 1: User has employee record with branch → branch-level access
      console.log('🟡 Branch User Access');
      const branchId = userEmployeeRecord.branch_id;
      console.log('🔍 Branch ID:', branchId);

      // 🟢 STEP 1: Get ALL EMPLOYEES in the same branch under this company
      const branchEmployees = await Employee.findAll({
        where: {
          branch_id: branchId,
          deleted_at: null,
        },
        attributes: ['id'],
        raw: true,
      });

      const branchEmployeeIds = branchEmployees.map(e => e.id);
      console.log('🔍 Branch Employee IDs:', branchEmployeeIds);

      if (branchEmployeeIds.length === 0) {
        console.log('🔍 No employees found in branch');
        return res.json({ success: true, total: 0, data: [] });
      }

      // 🟢 STEP 2: Fetch leaves for employees in the same branch
      where.employee_id = { [Op.in]: branchEmployeeIds };

      const { count, rows } = await Leave.findAndCountAll({
        where,
        include: [
          { 
            model: Employee, 
            as: 'employee', 
            attributes: ['id', 'employee_id', 'name', 'branch_id'] 
          },
          { 
            model: LeaveType, 
            as: 'leave_type', 
            attributes: ['id', 'title'] 
          },
        ],
        order: [['id', 'DESC']],
      });

      leaves = rows;
      console.log('🔍 Branch User Leaves Count:', count);

    } else {
      // 🟢 CASE 2: User doesn't have employee record (no branch) → FULL DATABASE ACCESS
      console.log('🟡 Branchless User Access (FULL DATABASE)');
      
      // 🟢 DIRECTLY GET ALL LEAVES - no company filter
      const { count, rows } = await Leave.findAndCountAll({
        where,
        include: [
          { 
            model: Employee, 
            as: 'employee', 
            attributes: ['id', 'employee_id', 'name', 'branch_id'] 
          },
          { 
            model: LeaveType, 
            as: 'leave_type', 
            attributes: ['id', 'title'] 
          },
        ],
        order: [['id', 'DESC']],
      });

      leaves = rows;
      console.log('🔍 Branchless User - All Leaves Count:', count);
    }

    // 🔍 FILTER BY employee_id (optional)
    if (employee_id) {
      const emp = await Employee.findOne({
        where: { employee_id: String(employee_id), deleted_at: null },
        attributes: ['id'],
      });
      if (emp) {
        leaves = leaves.filter(leave => leave.employee_id === emp.id);
      } else {
        leaves = [];
      }
    }

    console.log('🔍 Final Leaves Count:', leaves.length);
    const data = await Promise.all(leaves.map(leave => formatLeaveResponse(leave, companyId)));
    console.log('✅ END getAllLeaves - Success');
    return res.json({ success: true, total: data.length, data });

  } catch (err) {
    console.error('❌ Get All Leaves Error:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};


exports.getLeaveById = async (req, res) => {
  try {
    console.log('🎯 START getLeaveById');
    console.log('🔍 User Info - ID:', req.user.id, 'Type:', req.user.type);
    
    const { id } = req.params;

    const leave = await Leave.findOne({
      where: { id, deleted_at: null },
      include: [
        { 
          model: Employee, 
          as: 'employee', 
          attributes: ['id', 'employee_id', 'name', 'branch_id'] 
        },
        { 
          model: LeaveType, 
          as: 'leave_type', 
          attributes: ['id', 'title'] 
        }
      ]
    });

    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave not found' });
    }

    // 🟢 Super Admin → full access
    if (isSuper(req)) {
      const data = await formatLeaveResponse(leave, null);
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

      // 🟢 STEP 1: Get the employee linked to the leave
      const leaveEmployee = await Employee.findOne({
        where: { id: leave.employee_id, deleted_at: null },
        raw: true,
      });

      if (!leaveEmployee) {
        return res.status(404).json({ success: false, message: 'Employee linked to leave not found' });
      }

      // 🟢 STEP 2: Check if the leave employee belongs to the same branch as the current user
      const employeeBranchId = leaveEmployee.branch_id || null;
      
      console.log('🔍 Leave Employee Branch ID:', employeeBranchId);
      console.log('🔍 Current User Branch ID:', userEmployeeRecord.branch_id);

      if (String(employeeBranchId) !== String(userEmployeeRecord.branch_id)) {
        return res.status(403).json({ success: false, message: 'Forbidden: leave belongs to different branch' });
      }

    } else {
      // 🟢 CASE 2: User doesn't have employee record (no branch) → FULL ACCESS
      console.log('🟡 Branchless User - Full leave access');
      // No additional checks needed - branchless users can access any leave
    }

    // ✅ Return formatted leave
    const companyId = await getCompanyId(req);
    const data = await formatLeaveResponse(leave, companyId);
    console.log('✅ END getLeaveById - Success');
    return res.json({ success: true, data });

  } catch (err) {
    console.error('❌ Get Leave By ID Error:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};


exports.updateLeave = async (req, res) => {
  try {
    console.log('🎯 START updateLeave');
    console.log('🔍 User Info - ID:', req.user.id, 'Type:', req.user.type);
    
    const { id } = req.params;
    if (req.body.created_by) delete req.body.created_by;

    const companyId = await getCompanyId(req);
    if (!companyId && !isSuper(req))
      return res.status(403).json({ success: false, message: 'Unauthorized' });

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
      console.log('🟡 Branch User - Updating leave');
      userBranchId = userEmployeeRecord.branch_id;
    } else {
      // 🟢 CASE 2: User doesn't have employee record (no branch) → company-wide access
      console.log('🟡 Branchless User - Updating leave');
      // No branch restriction for branchless users
    }

    const leave = await Leave.findOne({
      where: { id, deleted_at: null },
      include: [{ model: Employee, as: 'employee' }]
    });
    if (!leave)
      return res.status(404).json({ success: false, message: 'Leave not found' });

    // 🟢 FIX: Check if the leave belongs to user's scope by checking EMPLOYEE's branch, not leave.created_by
    if (!isSuper(req)) {
      const leaveJson = leave.toJSON ? leave.toJSON() : leave;
      const employeeBranchId = leaveJson.employee?.branch_id;

      // For branch users: employee must be in same branch
      if (userEmployeeRecord && userEmployeeRecord.branch_id && !isCompany(req) && !isEmployee(req)) {
        if (String(employeeBranchId) !== String(userBranchId)) {
          return res.status(403).json({
            success: false,
            message: 'Forbidden: different branch',
          });
        }
      }

      // For company users: employee must belong to company
      if (isCompany(req)) {
        const allowedUserIds = await getAllUserIdsUnderCompanyBranch(companyId, null);
        const employeeRecord = await Employee.findOne({
          where: { id: leave.employee_id },
          attributes: ['created_by'],
          raw: true
        });
        
        if (!employeeRecord || !allowedUserIds.map(String).includes(String(employeeRecord.created_by))) {
          return res.status(403).json({
            success: false,
            message: 'Forbidden: employee not in your company',
          });
        }
      }
    }

    // Employee users can only update their own leaves
    if (isEmployee(req)) {
      const self = await Employee.findOne({ where: { user_id: req.user.id, deleted_at: null } });
      if (!self || String(self.employee_id) !== String(leave.employee?.employee_id)) {
        return res.status(403).json({ success: false, message: 'Employees can only update their own leaves' });
      }

      if (leave.status !== 'Pending') {
        return res.status(400).json({ success: false, message: 'Cannot edit approved/rejected leave' });
      }
    }

    // 🟢 Perform update
    const payload = { ...req.body };

    // ✅ If updating employee_id, check if valid and belongs to company
    if (payload.employee_id && payload.employee_id !== leave.employee?.employee_id) {
      const newEmployeeRecord = await Employee.findOne({
        where: { employee_id: String(payload.employee_id), deleted_at: null }
      });
      
      if (!newEmployeeRecord) {
        return res.status(400).json({ success: false, message: 'Employee not found' });
      }

      // Validate new employee belongs to same scope
      if (!isSuper(req)) {
        const allowedUserIds = await getAllUserIdsUnderCompanyBranch(companyId, isCompany(req) ? null : userBranchId);
        
        if (!allowedUserIds.map(String).includes(String(newEmployeeRecord.created_by))) {
          return res.status(403).json({ success: false, message: 'New employee not in your company/branch scope' });
        }

        if (userEmployeeRecord && userEmployeeRecord.branch_id && !isCompany(req) && !isEmployee(req)) {
          if (String(newEmployeeRecord.branch_id) !== String(userBranchId)) {
            return res.status(403).json({ success: false, message: 'New employee not in your branch' });
          }
        }
      }

      payload.employee_id = newEmployeeRecord.id;
    }

    // Compute dates if date fields are being updated
    if (payload.start_date || payload.end_date || payload.total_leave_days !== undefined) {
      try {
        const computed = computeDates({
          start_date: payload.start_date || leave.start_date,
          end_date: payload.end_date || leave.end_date,
          total_leave_days: payload.total_leave_days !== undefined ? payload.total_leave_days : leave.total_leave_days
        });
        payload.start_date = computed.start_date;
        payload.end_date = computed.end_date;
        payload.total_leave_days = computed.total_leave_days;
      } catch (ex) {
        return res.status(400).json({ success: false, message: ex.message });
      }
    }

    await leave.update(payload);

    const updated = await Leave.findOne({
      where: { id: leave.id, deleted_at: null },
      include: [
        { 
          model: Employee, 
          as: 'employee', 
          attributes: ['id', 'employee_id', 'name', 'branch_id'] 
        },
        { 
          model: LeaveType, 
          as: 'leave_type', 
          attributes: ['id', 'title'] 
        }
      ]
    });

    const response = await formatLeaveResponse(updated, companyId);
    console.log('✅ Leave updated successfully');
    return res.json({ success: true, message: 'Leave updated', data: response });
  } catch (err) {
    console.error('❌ Update Leave Error:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

exports.deleteLeave = async (req, res) => {
  try {
    console.log('🎯 START deleteLeave');
    console.log('🔍 User Info - ID:', req.user.id, 'Type:', req.user.type);
    
    const { id } = req.params;

    const companyId = await getCompanyId(req);
    if (!companyId && !isSuper(req))
      return res.status(403).json({ success: false, message: 'Unauthorized' });

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
      userBranchId = userEmployeeRecord.branch_id;
    } else {
      // 🟢 CASE 2: User doesn't have employee record (no branch) → company-wide access
      console.log('🟡 Branchless User - Deleting leave');
    }

    const leave = await Leave.findOne({
      where: { id, deleted_at: null },
      include: [{ model: Employee, as: 'employee' }]
    });
    if (!leave)
      return res.status(404).json({ success: false, message: 'Leave not found' });

    // 🟢 FIX: Check if the leave belongs to user's scope by checking EMPLOYEE's branch, not leave.created_by
    if (!isSuper(req)) {
      const leaveJson = leave.toJSON ? leave.toJSON() : leave;
      const employeeBranchId = leaveJson.employee?.branch_id;

      // For branch users: employee must be in same branch
      if (userEmployeeRecord && userEmployeeRecord.branch_id && !isCompany(req) && !isEmployee(req)) {
        if (String(employeeBranchId) !== String(userBranchId)) {
          return res.status(403).json({
            success: false,
            message: 'Forbidden: different branch',
          });
        }
      }

      // For company users: employee must belong to company
      if (isCompany(req)) {
        const allowedUserIds = await getAllUserIdsUnderCompanyBranch(companyId, null);
        const employeeRecord = await Employee.findOne({
          where: { id: leave.employee_id },
          attributes: ['created_by'],
          raw: true
        });
        
        if (!employeeRecord || !allowedUserIds.map(String).includes(String(employeeRecord.created_by))) {
          return res.status(403).json({
            success: false,
            message: 'Forbidden: employee not in your company',
          });
        }
      }
    }

    // Employee users can only delete their own leaves
    if (isEmployee(req)) {
      const self = await Employee.findOne({ where: { user_id: req.user.id, deleted_at: null } });
      if (!self || String(self.employee_id) !== String(leave.employee?.employee_id)) {
        return res.status(403).json({ success: false, message: 'Employees can only delete their own leaves' });
      }

      if (leave.status !== 'Pending') {
        return res.status(400).json({ success: false, message: 'Cannot delete approved/rejected leave' });
      }
    }

    await leave.destroy();
    console.log('✅ Leave deleted successfully');
    return res.json({ success: true, message: 'Leave deleted successfully', data: { id } });
  } catch (err) {
    console.error('❌ Delete Leave Error:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};


// exports.getLeaveByEmployeeId = async (req, res) => {
//   try {
//     console.log('🎯 START getLeaveByEmployeeId');
//     console.log('🔍 User Info - ID:', req.user.id, 'Type:', req.user.type);
    
//     const { employee_id: businessEmpId } = req.params;

//     if (!businessEmpId) {
//       return res.status(400).json({ success: false, message: "Employee ID is required" });
//     }

//     const companyId = await getCompanyId(req);
//     if (!companyId && !isSuper(req)) {
//       return res.status(400).json({ success: false, message: 'Could not resolve company/tenant' });
//     }

//     // 🟢 Check if user exists in employees table (has branch)
//     const userEmployeeRecord = await Employee.findOne({
//       where: { user_id: req.user.id },
//       attributes: ['branch_id', 'created_by', 'employee_id'],
//       raw: true,
//     });

//     console.log('🔍 User Employee Record:', userEmployeeRecord);

//     let userBranchId = null;

//     if (userEmployeeRecord && userEmployeeRecord.branch_id) {
//       // 🟢 CASE 1: User has employee record with branch → branch-level access
//       userBranchId = userEmployeeRecord.branch_id;
//     } else {
//       // 🟢 CASE 2: User doesn't have employee record (no branch) → company-wide access
//       console.log('🟡 Branchless User - Accessing employee leaves');
//     }

//     // Determine allowed creators within company/branch
//     const allowedUserIds = await getAllUserIdsUnderCompanyBranch(companyId, isCompany(req) ? null : userBranchId);

//     // Find target employee by business employee_id
//     const targetEmployee = await Employee.findOne({
//       where: {
//         employee_id: String(businessEmpId),
//         deleted_at: null,
//         ...(isSuper(req) ? {} : { created_by: { [Op.in]: allowedUserIds } }),
//         ...(userBranchId ? { branch_id: userBranchId } : {}),
//       },
//       attributes: ['id', 'employee_id', 'name', 'branch_id', 'created_by'],
//     });

//     if (!targetEmployee) {
//       return res.status(404).json({ success: false, message: "Employee not found or not in your company/branch" });
//     }

//     // Fetch leaves using employee PK (id)
//     const leaves = await Leave.findAll({
//       where: { employee_id: targetEmployee.id, deleted_at: null },
//       include: [
//         { 
//           model: Employee, 
//           as: 'employee', 
//           attributes: ['id', 'employee_id', 'name', 'branch_id'] 
//         },
//         { 
//           model: LeaveType, 
//           as: 'leave_type', 
//           attributes: ['id', 'title'] 
//         },
//       ],
//       order: [['id', 'DESC']],
//     });

//     const formatted = await Promise.all(leaves.map(l => formatLeaveResponse(l, companyId)));
//     console.log('✅ END getLeaveByEmployeeId - Success');
//     return res.json({ success: true, total: formatted.length, data: formatted });

//   } catch (err) {
//     console.error('❌ Get Leave By Employee ID Error:', err);
//     return res.status(500).json({ success: false, message: 'Server error', error: err.message });
//   }
// };
exports.getLeaveByEmployeeId = async (req, res) => {
  try {
    console.log('🎯 START getLeaveByEmployeeId');
    console.log('🔍 User Info - ID:', req.user.id, 'Type:', req.user.type);
    
    const { employee_id: businessEmpId } = req.params;

    if (!businessEmpId) {
      return res.status(400).json({ success: false, message: "Employee ID is required" });
    }

    const companyId = await getCompanyId(req);
    if (!companyId && !isSuper(req)) {
      return res.status(400).json({ success: false, message: 'Could not resolve company/tenant' });
    }

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
      userBranchId = userEmployeeRecord.branch_id;
    } else {
      // 🟢 CASE 2: User doesn't have employee record (no branch) → company-wide access
      console.log('🟡 Branchless User - Accessing employee leaves');
    }

    console.log('🔍 User Branch ID:', userBranchId);

    // ============================================================
    // 🔥 HIGHLIGHTED FIX: SIMPLIFIED ACCESS CONTROL
    // DO NOT CHECK WHO CREATED THE LEAVE - ONLY CHECK EMPLOYEE'S BRANCH
    // ============================================================

    // Find target employee by business employee_id
    const whereClause = {
      employee_id: String(businessEmpId),
      deleted_at: null,
    };

    // ============================================================
    // 🔥 HIGHLIGHTED FIX: ONLY RESTRICT BY BRANCH, NOT BY CREATOR
    // ============================================================
    if (isSuper(req)) {
      // 🟢 Super Admin: No restrictions - can access any employee
      // No additional where conditions needed
    } else if (isCompany(req)) {
      // 🟢 Company User: Can access all employees in the company
      // No branch restriction needed
    } else if (userBranchId) {
      // 🟢 Branch User: Can only access employees in THEIR branch
      whereClause.branch_id = userBranchId;
    } else {
      // 🟢 Branch-less User (Accountant, HR, etc.): Can access ALL company employees
      // No branch restriction needed
    }

    console.log('🔍 Final Employee Where Clause:', whereClause);

    const targetEmployee = await Employee.findOne({
      where: whereClause,
      attributes: ['id', 'employee_id', 'name', 'branch_id', 'created_by'],
    });

    if (!targetEmployee) {
      const message = userBranchId 
        ? "Employee not found or not in your branch" 
        : "Employee not found in your company";
      return res.status(404).json({ success: false, message });
    }

    // ============================================================
    // 🔥 HIGHLIGHTED FIX: FETCH LEAVES WITHOUT CREATOR RESTRICTIONS
    // ONLY FILTER BY EMPLOYEE ID - DO NOT CHECK WHO CREATED THE LEAVE
    // ============================================================
    const leavesWhereClause = { 
      employee_id: targetEmployee.id, 
      deleted_at: null 
    };

    // 🟢 NO CREATOR RESTRICTIONS - ANYONE WITH ACCESS TO EMPLOYEE CAN SEE ALL THEIR LEAVES

    const leaves = await Leave.findAll({
      where: leavesWhereClause,
      include: [
        { 
          model: Employee, 
          as: 'employee', 
          attributes: ['id', 'employee_id', 'name', 'branch_id'] 
        },
        { 
          model: LeaveType, 
          as: 'leave_type', 
          attributes: ['id', 'title'] 
        },
      ],
      order: [['id', 'DESC']],
    });

    const formatted = await Promise.all(leaves.map(l => formatLeaveResponse(l, companyId)));
    console.log('✅ END getLeaveByEmployeeId - Success. Found leaves:', formatted.length);
    return res.json({ success: true, total: formatted.length, data: formatted });

  } catch (err) {
    console.error('❌ Get Leave By Employee ID Error:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};



