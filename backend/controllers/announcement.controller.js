// // controllers/announcement.controller.js
// const Announcement = require('../models/announcement.model');
// const Employee = require('../models/employee.model');
// const Branch = require('../models/branch.model');
// const Department = require('../models/department.model');

// // =====================
// // Helper: format response
// // =====================
// const formatAnnouncementResponse = async (a) => {
//   if (!a) return null;
//   const json = a.toJSON();
//   return {
//     id: json.id,
//     title: json.title,
//     description: json.description,
//     start_date: json.start_date,
//     end_date: json.end_date,
//     branch_id: json.branch_id,
//     department_id: json.department_id,
//     employee_id: json.employee_id,
//     created_by: json.created_by,
//     created_at: json.created_at,
//     updated_at: json.updated_at
//   };
// };

// // =====================
// // GET ALL ANNOUNCEMENTS
// // =====================
// exports.getAllAnnouncements = async (req, res) => {
//   try {
//     if (req.user.type === 'company') {
//       const announcements = await Announcement.findAll({
//         where: { created_by: req.user.id },
//         order: [['id', 'DESC']]
//       });
//       const responseData = await Promise.all(announcements.map(a => formatAnnouncementResponse(a)));
//       return res.json({ success: true, data: responseData });
//     }

//     if (req.user.type === 'Employee') {
//       const emp = await Employee.findOne({ where: { user_id: req.user.id } });
//       if (!emp) {
//         return res.status(403).json({ success: false, message: 'Employee profile not found' });
//       }
//       const announcements = await Announcement.findAll({
//         where: { created_by: emp.created_by },
//         order: [['id', 'DESC']]
//       });
//       const responseData = await Promise.all(announcements.map(a => formatAnnouncementResponse(a)));
//       return res.json({ success: true, data: responseData });
//     }

//     // === OTHER ROLES (HR, Manager, etc.) ===
//     const emp = await Employee.findOne({ where: { user_id: req.user.id } });
//     let whereClause = {};
//     if (emp) whereClause.created_by = emp.created_by;

//     const announcements = await Announcement.findAll({
//       where: whereClause,
//       order: [['id', 'DESC']]
//     });
//     const responseData = await Promise.all(announcements.map(a => formatAnnouncementResponse(a)));
//     return res.json({ success: true, data: responseData });
//   } catch (error) {
//     console.error("Get All Announcements Error:", error);
//     res.status(500).json({ success: false, message: 'Server error', error: error.message });
//   }
// };

// // =====================
// // GET ANNOUNCEMENT BY ID
// // =====================
// exports.getAnnouncementById = async (req, res) => {
//   try {
//     let whereClause = { id: req.params.id };

//     if (req.user.type === 'company') {
//       whereClause.created_by = req.user.id;
//     } else if (req.user.type === 'Employee') {
//       const emp = await Employee.findOne({ where: { user_id: req.user.id } });
//       if (!emp) return res.status(403).json({ success: false, message: 'Employee profile not found' });
//       whereClause = { id: req.params.id, created_by: emp.created_by };
//     } else {
//       const emp = await Employee.findOne({ where: { user_id: req.user.id } });
//       if (emp) whereClause.created_by = emp.created_by;
//     }

//     const announcement = await Announcement.findOne({ where: whereClause });
//     if (!announcement) return res.status(404).json({ success: false, message: 'Announcement not found' });

//     const responseData = await formatAnnouncementResponse(announcement);
//     res.json({ success: true, data: responseData });
//   } catch (error) {
//     console.error("Get Announcement By ID Error:", error);
//     res.status(500).json({ success: false, message: 'Server error', error: error.message });
//   }
// };
// // =====================
// // CREATE ANNOUNCEMENT
// // =====================
// exports.createAnnouncement = async (req, res) => {
//   try {
//     const { title, description, start_date, end_date, branch_id, department_id, employee_id } = req.body;

//     if (!title) return res.status(400).json({ success: false, message: 'title is required' });

//     let companyId;
//     if (req.user.type === 'company') {
//       companyId = req.user.id;
//     } else {
//       const emp = await Employee.findOne({ where: { user_id: req.user.id } });
//       if (!emp) return res.status(403).json({ success: false, message: 'Employee profile not found' });
//       companyId = emp.created_by;
//     }

//     // ✅ Validate branch belongs to company
//     if (branch_id) {
//       const branch = await Branch.findOne({ where: { id: branch_id, created_by: companyId } });
//       if (!branch) return res.status(400).json({ success: false, message: 'Invalid branch for your company' });
//     }

//     // ✅ Validate department belongs to company
//     if (department_id) {
//       const dept = await Department.findOne({ where: { id: department_id, created_by: companyId } });
//       if (!dept) return res.status(400).json({ success: false, message: 'Invalid department for your company' });
//     }

//     // ✅ Validate employee belongs to company
//     if (employee_id) {
//       const emp = await Employee.findOne({ where: { employee_id, created_by: companyId } });
//       if (!emp) return res.status(400).json({ success: false, message: 'Invalid employee for your company' });
//     }

//     const announcement = await Announcement.create({
//       title,
//       description,
//       start_date,
//       end_date,
//       branch_id,
//       department_id,
//       employee_id,
//       created_by: companyId,
//       created_at: new Date(),
//       updated_at: new Date()
//     });

//     res.status(201).json({ success: true, message: 'Announcement created', data: await formatAnnouncementResponse(announcement) });
//   } catch (error) {
//     console.error("Create Announcement Error:", error);
//     res.status(500).json({ success: false, message: 'Server error', error: error.message });
//   }
// };

// // =====================
// // UPDATE ANNOUNCEMENT
// // =====================
// exports.updateAnnouncement = async (req, res) => {
//   try {
//     const announcementId = req.params.id;
//     const { title, description, start_date, end_date, branch_id, department_id, employee_id } = req.body;

//     let whereClause = { id: announcementId };
//     if (req.user.type === 'company') {
//       whereClause.created_by = req.user.id;
//     } else {
//       const emp = await Employee.findOne({ where: { user_id: req.user.id } });
//       if (!emp) return res.status(403).json({ success: false, message: 'Employee profile not found' });
//       whereClause.created_by = emp.created_by;
//     }

//     const announcement = await Announcement.findOne({ where: whereClause });
//     if (!announcement) return res.status(404).json({ success: false, message: 'Announcement not found' });

//     // ✅ Validate branch
//     if (branch_id) {
//       const branch = await Branch.findOne({ where: { id: branch_id, created_by: announcement.created_by } });
//       if (!branch) return res.status(400).json({ success: false, message: 'Invalid branch for your company' });
//       announcement.branch_id = branch_id;
//     }

//     // ✅ Validate department
//     if (department_id) {
//       const dept = await Department.findOne({ where: { id: department_id, created_by: announcement.created_by } });
//       if (!dept) return res.status(400).json({ success: false, message: 'Invalid department for your company' });
//       announcement.department_id = department_id;
//     }

//     // ✅ Validate employee
//     if (employee_id) {
//       const emp = await Employee.findOne({ where: { employee_id, created_by: announcement.created_by } });
//       if (!emp) return res.status(400).json({ success: false, message: 'Invalid employee for your company' });
//       announcement.employee_id = employee_id;
//     }

//     await announcement.update({ title, description, start_date, end_date, updated_at: new Date() });

//     res.json({ success: true, message: 'Announcement updated', data: await formatAnnouncementResponse(announcement) });
//   } catch (error) {
//     console.error("Update Announcement Error:", error);
//     res.status(500).json({ success: false, message: 'Server error', error: error.message });
//   }
// };

// // =====================
// // DELETE ANNOUNCEMENT
// // =====================
// exports.deleteAnnouncement = async (req, res) => {
//   try {
//     const { id } = req.params;

//     let whereClause = { id };
//     if (req.user.type === 'company') {
//       whereClause.created_by = req.user.id;
//     } else {
//       const emp = await Employee.findOne({ where: { user_id: req.user.id } });
//       if (!emp) return res.status(403).json({ success: false, message: 'Employee profile not found' });
//       whereClause.created_by = emp.created_by;
//     }

//     const announcement = await Announcement.findOne({ where: whereClause });
//     if (!announcement) return res.status(404).json({ success: false, message: 'Announcement not found' });

//     await announcement.destroy();
//     res.json({ success: true, message: 'Announcement deleted', data: { id } });
//   } catch (error) {
//     console.error("Delete Announcement Error:", error);
//     res.status(500).json({ success: false, message: 'Server error', error: error.message });
//   }
// };















// const { Op } = require('sequelize');
// const Announcement = require('../models/announcement.model');
// const Employee = require('../models/employee.model');
// const User = require('../models/user.model');

// // =====================
// // 🔹 Helpers
// // =====================
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

// // =====================
// // Helper: format response
// // =====================
// const formatAnnouncementResponse = async (announcement) => {
//   if (!announcement) return null;
//   const json = announcement.toJSON ? announcement.toJSON() : announcement;

//   let employeeData = null;
//   if (json.employee_id) {
//     const employee = await Employee.findOne({
//       where: { employee_id: String(json.employee_id), deleted_at: null },
//       attributes: ['id', 'employee_id', 'name', 'branch_id'],
//       raw: true
//     });
//     if (employee) {
//       employeeData = {
//         id: employee.id,
//         employee_id: employee.employee_id,
//         name: employee.name,
//         branch_id: employee.branch_id
//       };
//     }
//   }

//   return {
//     id: json.id,
//     title: json.title,
//     description: json.description,
//     start_date: json.start_date,
//     end_date: json.end_date,
//     branch_id: json.branch_id,
//     department_id: json.department_id,
//     employee_id: json.employee_id,
//     employee: employeeData,
//     created_by: json.created_by,
//     created_at: json.created_at,
//     updated_at: json.updated_at
//   };
// };

// // ==========================
// // CREATE ANNOUNCEMENT (Fixed following award controller logic)
// // ==========================
// exports.createAnnouncement = async (req, res) => {
//   try {
//     const { title, description, start_date, end_date, branch_id, department_id, employee_id } = req.body;

//     if (!title) {
//       return res.status(400).json({ success: false, message: 'Title is required' });
//     }

//     const companyId = await getCompanyId(req);
//     if (!companyId && !isSuper(req)) {
//       return res.status(403).json({ success: false, message: 'Unauthorized' });
//     }

//     const userBranchId = await getUserBranchId(req.user.id);
//     if (!isCompany(req) && !isSuper(req) && !userBranchId && !isEmployee(req)) {
//       return res.status(403).json({ success: false, message: 'No branch assigned' });
//     }

//     // Determine allowed creators within company/branch
//     const allowedCreatedBy = await getAllUserIdsUnderCompanyBranch(companyId, isCompany(req) ? null : userBranchId);

//     let finalEmployeeBusinessId = null;

//     if (employee_id) {
//       // Find target employee by business employee_id
//       const employeeRecord = await Employee.findOne({
//         where: { employee_id: String(employee_id), deleted_at: null }
//       });
      
//       if (!employeeRecord) {
//         return res.status(404).json({ success: false, message: 'Employee not found' });
//       }

//       // Ensure the employee belongs to the current scope
//       if (!isSuper(req)) {
//         if (!allowedCreatedBy.map(String).includes(String(employeeRecord.created_by))) {
//           return res.status(403).json({ success: false, message: 'Employee not in your company/branch scope' });
//         }

//         if (!isCompany(req) && !isEmployee(req)) {
//           // branch-level user: employee must be in same branch
//           if (String(employeeRecord.branch_id) !== String(userBranchId)) {
//             return res.status(403).json({ success: false, message: 'Employee not in your branch' });
//           }
//         }
//       }

//       // Employee users can only create announcements for themselves
//       if (isEmployee(req)) {
//         const self = await Employee.findOne({ where: { user_id: req.user.id, deleted_at: null } });
//         if (!self || String(self.employee_id) !== String(employee_id)) {
//           return res.status(403).json({ success: false, message: 'Employees can only create announcements for themselves' });
//         }
//       }

//       finalEmployeeBusinessId = String(employee_id);
//     }

//     // Validate branch if provided
//     let finalBranchId = branch_id || userBranchId;
//     if (finalBranchId && !isCompany(req) && !isSuper(req)) {
//       // For non-company users, ensure they can only use their own branch
//       if (String(finalBranchId) !== String(userBranchId)) {
//         return res.status(403).json({ success: false, message: 'You can only create announcements for your branch' });
//       }
//     }

//     const announcement = await Announcement.create({
//       title,
//       description,
//       start_date,
//       end_date,
//       branch_id: finalBranchId,
//       department_id,
//       employee_id: finalEmployeeBusinessId,
//       created_by: req.user.id,
//       created_at: new Date(),
//       updated_at: new Date()
//     });

//     const data = await formatAnnouncementResponse(announcement);
//     return res.status(201).json({
//       success: true,
//       message: 'Announcement created successfully',
//       data
//     });

//   } catch (err) {
//     console.error('Create Announcement Error:', err);
//     return res.status(500).json({ success: false, message: 'Server error', error: err.message });
//   }
// };

// // ==========================
// // GET ALL ANNOUNCEMENTS
// // ==========================
// exports.getAllAnnouncements = async (req, res) => {
//   try {
//     // 🟢 SUPER ADMIN: Full access
//     if (isSuper(req)) {
//       const announcements = await Announcement.findAll({
//         where: { deleted_at: null },
//         order: [['id', 'DESC']],
//       });
//       const data = await Promise.all(announcements.map(a => formatAnnouncementResponse(a)));
//       return res.json({ success: true, data });
//     }

//     // 🟢 Resolve company + branch
//     const companyId = await getCompanyId(req);
//     if (!companyId) {
//       return res.status(403).json({ success: false, message: 'Unauthorized' });
//     }

//     // ✅ Define branchId safely
//     const branchId = await getUserBranchId(req.user.id);
//     const isCompanyUserFlag = isCompany(req);

//     // 🟢 COMPANY USER → full access to all announcements in the company
//     if (isCompanyUserFlag) {
//       const allowedUserIds = await getAllUserIdsUnderCompanyBranch(companyId, null);
//       const announcements = await Announcement.findAll({
//         where: {
//           deleted_at: null,
//           created_by: { [Op.in]: allowedUserIds },
//         },
//         order: [['id', 'DESC']],
//       });
//       const data = await Promise.all(announcements.map(a => formatAnnouncementResponse(a)));
//       return res.json({ success: true, data });
//     }

//     // 🟢 BRANCH ROLE USERS → can only view announcements for THEIR SPECIFIC BRANCH
//     if (!branchId) {
//       return res.status(403).json({ success: false, message: 'No branch assigned to user' });
//     }

//     // 🔸 CRITICAL FIX: Only show announcements that are specifically for this branch
//     // This ensures branch managers don't see announcements from other branches
//     const announcements = await Announcement.findAll({
//       where: {
//         deleted_at: null,
//         [Op.or]: [
//           // Announcements created by users in the same branch
//           {
//             created_by: { [Op.in]: await getAllUserIdsUnderCompanyBranch(companyId, branchId) },
//             branch_id: branchId // Must be for this specific branch
//           },
//           // OR announcements with no specific branch (company-wide) but visible to all
//           {
//             branch_id: null
//           }
//         ]
//       },
//       order: [['id', 'DESC']],
//     });

//     const data = await Promise.all(announcements.map(a => formatAnnouncementResponse(a)));
//     return res.json({ success: true, data });

//   } catch (err) {
//     console.error('Get All Announcements Error:', err);
//     return res.status(500).json({ success: false, message: 'Server error', error: err.message });
//   }
// };
// // ==========================
// // GET ANNOUNCEMENT BY ID
// // ==========================
// exports.getAnnouncementById = async (req, res) => {
//   try {
//     const announcement = await Announcement.findOne({
//       where: { id: req.params.id, deleted_at: null },
//     });

//     if (!announcement) {
//       return res.status(404).json({ success: false, message: 'Announcement not found' });
//     }

//     // 🟢 Super Admin → full access
//     if (isSuper(req)) {
//       const data = await formatAnnouncementResponse(announcement);
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

//     const isCompanyUserFlag = isCompany(req);

//     // 🟢 COMPANY USER → can access any announcement in the company
//     if (isCompanyUserFlag) {
//       const allowedUserIds = await getAllUserIdsUnderCompanyBranch(companyId, null);
//       if (!allowedUserIds.map(String).includes(String(announcement.created_by))) {
//         return res.status(403).json({ success: false, message: 'Forbidden: not your company record' });
//       }
      
//       const data = await formatAnnouncementResponse(announcement);
//       return res.json({ success: true, data });
//     }

//     // 🟢 BRANCH ROLE USERS → can only access announcements for THEIR SPECIFIC BRANCH
//     if (!branchId) {
//       return res.status(403).json({ success: false, message: 'No branch assigned to user' });
//     }

//     // 🔒 CRITICAL FIX: Branch managers can only access announcements for their branch
//     if (announcement.branch_id && String(announcement.branch_id) !== String(branchId)) {
//       return res.status(403).json({ success: false, message: 'Forbidden: announcement not for your branch' });
//     }

//     // Also check if created by allowed users in the same branch scope
//     const allowedUserIds = await getAllUserIdsUnderCompanyBranch(companyId, branchId);
//     if (!allowedUserIds.map(String).includes(String(announcement.created_by))) {
//       return res.status(403).json({ success: false, message: 'Forbidden: not your branch record' });
//     }

//     // ✅ Return formatted announcement
//     const data = await formatAnnouncementResponse(announcement);
//     return res.json({ success: true, data });

//   } catch (err) {
//     console.error('Get Announcement By ID Error:', err);
//     return res.status(500).json({ success: false, message: 'Server error', error: err.message });
//   }
// };

// // ==========================
// // UPDATE ANNOUNCEMENT (Fixed following award controller logic)
// // ==========================
// exports.updateAnnouncement = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { title, description, start_date, end_date, branch_id, department_id, employee_id } = req.body;

//     const companyId = await getCompanyId(req);
//     if (!companyId && !isSuper(req)) {
//       return res.status(403).json({ success: false, message: 'Unauthorized' });
//     }

//     const branchId = await getUserBranchId(req.user.id);
//     const announcement = await Announcement.findOne({
//       where: { id, deleted_at: null },
//     });
    
//     if (!announcement) {
//       return res.status(404).json({ success: false, message: 'Announcement not found' });
//     }

//     const allowedUserIds = await getAllUserIdsUnderCompanyBranch(
//       companyId,
//       isCompany(req) ? null : branchId
//     );

//     // 🟢 Access validation
//     if (!isSuper(req)) {
//       if (!allowedUserIds.map(String).includes(String(announcement.created_by))) {
//         return res.status(403).json({
//           success: false,
//           message: 'Forbidden: not your branch/company record',
//         });
//       }

//       if (!isCompany(req)) {
//         if (announcement.branch_id && String(announcement.branch_id) !== String(branchId)) {
//           return res.status(403).json({
//             success: false,
//             message: 'Forbidden: different branch',
//           });
//         }
//       }
//     }

//     let finalEmployeeBusinessId = announcement.employee_id;
//     let finalBranchId = branch_id || announcement.branch_id;

//     if (employee_id) {
//       // Find target employee by business employee_id
//       const employeeRecord = await Employee.findOne({
//         where: { employee_id: String(employee_id), deleted_at: null }
//       });
      
//       if (!employeeRecord) {
//         return res.status(404).json({ success: false, message: 'Employee not found' });
//       }

//       // Ensure the employee belongs to the current scope
//       if (!isSuper(req)) {
//         if (!allowedUserIds.map(String).includes(String(employeeRecord.created_by))) {
//           return res.status(403).json({ success: false, message: 'Employee not in your company/branch scope' });
//         }

//         if (!isCompany(req)) {
//           // branch-level user: employee must be in same branch
//           if (String(employeeRecord.branch_id) !== String(branchId)) {
//             return res.status(403).json({ success: false, message: 'Employee not in your branch' });
//           }
//         }
//       }

//       // Employee users can only update announcements for themselves
//       if (isEmployee(req)) {
//         const self = await Employee.findOne({ where: { user_id: req.user.id, deleted_at: null } });
//         if (!self || String(self.employee_id) !== String(employee_id)) {
//           return res.status(403).json({ success: false, message: 'Employees can only update announcements for themselves' });
//         }
//       }

//       finalEmployeeBusinessId = String(employee_id);
//     }

//     // Validate branch if changing
//     if (branch_id && !isCompany(req) && !isSuper(req)) {
//       // For non-company users, ensure they can only use their own branch
//       if (String(branch_id) !== String(branchId)) {
//         return res.status(403).json({ success: false, message: 'You can only update announcements for your branch' });
//       }
//     }

//     // 🟢 Perform update
//     await announcement.update({
//       title: title ?? announcement.title,
//       description: description ?? announcement.description,
//       start_date: start_date ?? announcement.start_date,
//       end_date: end_date ?? announcement.end_date,
//       branch_id: finalBranchId,
//       department_id: department_id ?? announcement.department_id,
//       employee_id: finalEmployeeBusinessId,
//       updated_at: new Date(),
//     });

//     const data = await formatAnnouncementResponse(announcement);
//     return res.json({
//       success: true,
//       message: 'Announcement updated successfully',
//       data,
//     });

//   } catch (err) {
//     console.error('Update Announcement Error:', err);
//     return res.status(500).json({ success: false, message: 'Server error', error: err.message });
//   }
// };

// // ==========================
// // DELETE ANNOUNCEMENT
// // ==========================
// // exports.deleteAnnouncement = async (req, res) => {
// //   try {
// //     const { id } = req.params;

// //     const companyId = await getCompanyId(req);
// //     if (!companyId && !isSuper(req)) {
// //       return res.status(403).json({ success: false, message: 'Unauthorized' });
// //     }

// //     const branchId = await getUserBranchId(req.user.id);
// //     const announcement = await Announcement.findOne({
// //       where: { id, deleted_at: null },
// //     });
    
// //     if (!announcement) {
// //       return res.status(404).json({ success: false, message: 'Announcement not found' });
// //     }

// //     const allowedUserIds = await getAllUserIdsUnderCompanyBranch(
// //       companyId,
// //       isCompany(req) ? null : branchId
// //     );

// //     // 🟢 Access validation
// //     if (!isSuper(req)) {
// //       if (!allowedUserIds.map(String).includes(String(announcement.created_by))) {
// //         return res.status(403).json({
// //           success: false,
// //           message: 'Forbidden: not your branch/company record',
// //         });
// //       }

// //       if (!isCompany(req)) {
// //         if (announcement.branch_id && String(announcement.branch_id) !== String(branchId)) {
// //           return res.status(403).json({
// //             success: false,
// //             message: 'Forbidden: different branch',
// //           });
// //         }
// //       }
// //     }

// //     await announcement.destroy();
// //     return res.json({
// //       success: true,
// //       message: 'Announcement deleted successfully',
// //       data: { id },
// //     });

// //   } catch (err) {
// //     console.error('Delete Announcement Error:', err);
// //     return res.status(500).json({ success: false, message: 'Server error', error: err.message });
// //   }
// // };

// // ==========================
// // DELETE ANNOUNCEMENT (Soft Delete)
// // ==========================
// exports.deleteAnnouncement = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const companyId = await getCompanyId(req);
//     if (!companyId && !isSuper(req)) {
//       return res.status(403).json({ success: false, message: 'Unauthorized' });
//     }

//     const branchId = await getUserBranchId(req.user.id);
//     const announcement = await Announcement.findOne({
//       where: { id, deleted_at: null },
//     });
    
//     if (!announcement) {
//       return res.status(404).json({ success: false, message: 'Announcement not found' });
//     }

//     const allowedUserIds = await getAllUserIdsUnderCompanyBranch(
//       companyId,
//       isCompany(req) ? null : branchId
//     );

//     // 🟢 Access validation
//     if (!isSuper(req)) {
//       if (!allowedUserIds.map(String).includes(String(announcement.created_by))) {
//         return res.status(403).json({
//           success: false,
//           message: 'Forbidden: not your branch/company record',
//         });
//       }

//       if (!isCompany(req)) {
//         if (announcement.branch_id && String(announcement.branch_id) !== String(branchId)) {
//           return res.status(403).json({
//             success: false,
//             message: 'Forbidden: different branch',
//           });
//         }
//       }
//     }

//     // ✅ FIX: Use update for soft delete instead of destroy
//     await announcement.update({
//       deleted_at: new Date(),
//       updated_at: new Date()
//     });

//     return res.json({
//       success: true,
//       message: 'Announcement soft deleted successfully',
//       data: { id },
//     });

//   } catch (err) {
//     console.error('Delete Announcement Error:', err);
//     return res.status(500).json({ success: false, message: 'Server error', error: err.message });
//   }
// };


// controllers/announcement.controller.js
const { Op } = require('sequelize');
const Announcement = require('../models/announcement.model');
const Employee = require('../models/employee.model');
const Branch = require('../models/branch.model');
const Department = require('../models/department.model');
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
// ???? Format Announcement Response
// =====================
const formatAnnouncementResponse = async (announcement) => {
  if (!announcement) return null;
  const json = announcement.toJSON ? announcement.toJSON() : announcement;

  // Get branch details
  let branch = null;
  if (json.branch_id) {
    const b = await Branch.findByPk(json.branch_id, { raw: true });
    if (b) branch = { id: b.id, name: b.name };
  }

  // Get department details
  let department = null;
  if (json.department_id) {
    const d = await Department.findByPk(json.department_id, { raw: true });
    if (d) department = { id: d.id, name: d.name };
  }

  // Get employee details
  let employee = null;
  if (json.employee_id) {
    const e = await Employee.findOne({
      where: { employee_id: String(json.employee_id), deleted_at: null },
      attributes: ['id', 'employee_id', 'name', 'branch_id', 'department_id'],
      raw: true
    });
    if (e) employee = {
      id: e.id,
      employee_id: e.employee_id,
      name: e.name,
      branch_id: e.branch_id,
      department_id: e.department_id
    };
  }

  return {
    id: json.id,
    title: json.title,
    description: json.description,
    start_date: json.start_date,
    end_date: json.end_date,
    branch_id: json.branch_id,
    branch: branch,
    department_id: json.department_id,
    department: department,
    employee_id: json.employee_id,
    employee: employee,
    created_by: json.created_by,
    created_at: json.created_at,
    updated_at: json.updated_at
  };
};

// =====================
// ???? CREATE ANNOUNCEMENT
// =====================
exports.createAnnouncement = async (req, res) => {
  try {
    console.log('???? START createAnnouncement');
    console.log('???? User Info - ID:', req.user.id, 'Type:', req.user.type);
    
    const { title, description, start_date, end_date, branch_id, department_id, employee_id } = req.body;
    if (!title) {
      return res.status(400).json({ success: false, message: 'title is required' });
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
      console.log('???? Branch User - Creating announcement');
      userBranchId = userEmployeeRecord.branch_id;
    } else {
      // ???? CASE 2: User doesn't have employee record (no branch) ? company-wide access
      console.log('???? Branchless User - Creating announcement');
      // No branch restriction for branchless users
    }

    // ???? FIX: Only require branch for branch users, not branchless users
    if (!isCompany(req) && !isSuper(req) && userEmployeeRecord && !userBranchId && !isEmployee(req)) {
      return res.status(403).json({ success: false, message: 'No branch assigned' });
    }

    // Determine allowed creators within company/branch
    const allowedCreatedBy = await getAllUserIdsUnderCompanyBranch(companyId, isCompany(req) ? null : userBranchId);

    // Validate branch belongs to the company
    if (branch_id) {
      const branchRecord = await Branch.findOne({
        where: { id: branch_id, deleted_at: null }
      });
      if (!branchRecord) {
        return res.status(400).json({ success: false, message: 'Invalid branch' });
      }
      
      // Ensure branch belongs to user's scope
      if (!isSuper(req) && !allowedCreatedBy.map(String).includes(String(branchRecord.created_by))) {
        return res.status(403).json({ success: false, message: 'Branch not in your company/branch scope' });
      }
    }

    // Validate department belongs to the company
    if (department_id) {
      const departmentRecord = await Department.findOne({
        where: { id: department_id, deleted_at: null }
      });
      if (!departmentRecord) {
        return res.status(400).json({ success: false, message: 'Invalid department' });
      }
      
      // Ensure department belongs to user's scope
      if (!isSuper(req) && !allowedCreatedBy.map(String).includes(String(departmentRecord.created_by))) {
        return res.status(403).json({ success: false, message: 'Department not in your company/branch scope' });
      }
    }

    // Validate employee belongs to the company
    if (employee_id) {
      const employeeRecord = await Employee.findOne({
        where: { employee_id: String(employee_id), deleted_at: null }
      });
      if (!employeeRecord) {
        return res.status(400).json({ success: false, message: 'Invalid employee' });
      }
      
      // Ensure employee belongs to user's scope
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
    }

    // Create announcement
    const announcement = await Announcement.create({
      title: title,
      description: description || null,
      start_date: start_date || new Date(),
      end_date: end_date || null,
      branch_id: branch_id || null,
      department_id: department_id || null,
      employee_id: employee_id || null,
      created_by: req.user.id,
      created_at: new Date(),
      updated_at: new Date()
    });

    const data = await formatAnnouncementResponse(announcement);
    console.log('? Announcement created successfully');
    return res.status(201).json({ success: true, message: 'Announcement created', data });
  } catch (err) {
    console.error('? Create Announcement Error:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// =====================
// ???? GET ALL ANNOUNCEMENTS
// =====================
exports.getAllAnnouncements = async (req, res) => {
  try {
    console.log('???? START getAllAnnouncements');
    console.log('???? User Info - ID:', req.user.id, 'Type:', req.user.type);

    // ???? SUPER ADMIN: Full access
    if (isSuper(req)) {
      console.log('???? Super Admin Access');
      const announcements = await Announcement.findAll({
        where: { deleted_at: null },
        order: [['id', 'DESC']],
      });
      console.log('???? Super Admin Announcements Count:', announcements.length);
      const data = await Promise.all(announcements.map(a => formatAnnouncementResponse(a)));
      return res.json({ success: true, data });
    }

    // ???? Check if user exists in employees table (has branch)
    const userEmployeeRecord = await Employee.findOne({
      where: { user_id: req.user.id },
      attributes: ['branch_id', 'created_by', 'employee_id'],
      raw: true,
    });

    console.log('???? User Employee Record:', userEmployeeRecord);

    let announcements = [];

    if (userEmployeeRecord && userEmployeeRecord.branch_id) {
      // ???? CASE 1: User has employee record with branch ? branch-level access
      console.log('???? Branch User Access');
      const branchId = userEmployeeRecord.branch_id;
      console.log('???? Branch ID:', branchId);
      
      // Get company ID for branch users
      const companyId = await getCompanyId(req);
      console.log('???? Company ID for Branch User:', companyId);
      
      if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

      // ???? STEP 1: Get announcements created by users in the same branch/company
      const allowedUserIds = await getAllUserIdsUnderCompanyBranch(companyId, branchId);
      
      // ???? STEP 2: Fetch announcements for the branch
      announcements = await Announcement.findAll({
        where: {
          deleted_at: null,
          [Op.or]: [
            // Announcements created by users in the same branch
            { created_by: { [Op.in]: allowedUserIds } },
            // Announcements specifically targeted to this branch
            { branch_id: branchId },
            // Announcements without specific branch (company-wide)
            { branch_id: null }
          ]
        },
        order: [['id', 'DESC']],
      });

    } else {
      // ???? CASE 2: User doesn't have employee record (no branch) ? FULL DATABASE ACCESS
      console.log('???? Branchless User Access (FULL DATABASE)');
      
      // ???? DIRECTLY GET ALL ANNOUNCEMENTS - no company filter
      announcements = await Announcement.findAll({
        where: { deleted_at: null },
        order: [['id', 'DESC']],
      });
      
      console.log('???? Branchless User - All Announcements Count:', announcements.length);
    }

    console.log('???? Final Announcements Count:', announcements.length);
    const data = await Promise.all(announcements.map(a => formatAnnouncementResponse(a)));
    console.log('? END getAllAnnouncements - Success');
    return res.json({ success: true, data });

  } catch (err) {
    console.error('? Get All Announcements Error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message,
    });
  }
};

// =====================
// ???? GET ANNOUNCEMENT BY ID
// =====================
exports.getAnnouncementById = async (req, res) => {
  try {
    console.log('???? START getAnnouncementById');
    console.log('???? User Info - ID:', req.user.id, 'Type:', req.user.type);
    
    const announcement = await Announcement.findOne({
      where: { id: req.params.id, deleted_at: null },
    });

    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }

    // ???? Super Admin ? full access
    if (isSuper(req)) {
      const data = await formatAnnouncementResponse(announcement);
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

      // ???? STEP 1: Check if announcement is accessible to branch user
      const allowedUserIds = await getAllUserIdsUnderCompanyBranch(companyId, userEmployeeRecord.branch_id);
      
      const isAccessible = 
        // Announcement created by user in same branch
        allowedUserIds.map(String).includes(String(announcement.created_by)) ||
        // Announcement targeted to user's branch
        announcement.branch_id === userEmployeeRecord.branch_id ||
        // Company-wide announcement (no branch specified)
        announcement.branch_id === null;

      if (!isAccessible) {
        return res.status(403).json({ success: false, message: 'Forbidden: announcement not accessible in your branch' });
      }

    } else {
      // ???? CASE 2: User doesn't have employee record (no branch) ? FULL ACCESS
      console.log('???? Branchless User - Full announcement access');
      // No additional checks needed - branchless users can access any announcement
    }

    // ? Return formatted announcement
    const data = await formatAnnouncementResponse(announcement);
    console.log('? END getAnnouncementById - Success');
    return res.json({ success: true, data });

  } catch (err) {
    console.error('? Get Announcement By ID Error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message,
    });
  }
};

// =====================
// ???? UPDATE ANNOUNCEMENT
// =====================
exports.updateAnnouncement = async (req, res) => {
  try {
    console.log('???? START updateAnnouncement');
    console.log('???? User Info - ID:', req.user.id, 'Type:', req.user.type);
    
    const { id } = req.params;
    const { title, description, start_date, end_date, branch_id, department_id, employee_id } = req.body;

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
      console.log('???? Branch User - Updating announcement');
      userBranchId = userEmployeeRecord.branch_id;
    } else {
      // ???? CASE 2: User doesn't have employee record (no branch) ? company-wide access
      console.log('???? Branchless User - Updating announcement');
      // No branch restriction for branchless users
    }

    const announcement = await Announcement.findOne({
      where: { id, deleted_at: null },
    });
    if (!announcement)
      return res
        .status(404)
        .json({ success: false, message: 'Announcement not found' });

    // Determine allowed creators within company/branch
    const allowedUserIds = await getAllUserIdsUnderCompanyBranch(companyId, isCompany(req) ? null : userBranchId);

    // ???? Access validation
    if (!isSuper(req)) {
      if (!allowedUserIds.map(String).includes(String(announcement.created_by))) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: not your branch/company record',
        });
      }
    }

    // Validate branch belongs to the company (if branch_id is being updated)
    if (branch_id && branch_id !== announcement.branch_id) {
      const branchRecord = await Branch.findOne({
        where: { id: branch_id, deleted_at: null }
      });
      if (!branchRecord) {
        return res.status(400).json({ success: false, message: 'Invalid branch' });
      }
      
      // Ensure branch belongs to user's scope
      if (!isSuper(req) && !allowedUserIds.map(String).includes(String(branchRecord.created_by))) {
        return res.status(403).json({ success: false, message: 'Branch not in your company/branch scope' });
      }
    }

    // Validate department belongs to the company (if department_id is being updated)
    if (department_id && department_id !== announcement.department_id) {
      const departmentRecord = await Department.findOne({
        where: { id: department_id, deleted_at: null }
      });
      if (!departmentRecord) {
        return res.status(400).json({ success: false, message: 'Invalid department' });
      }
      
      // Ensure department belongs to user's scope
      if (!isSuper(req) && !allowedUserIds.map(String).includes(String(departmentRecord.created_by))) {
        return res.status(403).json({ success: false, message: 'Department not in your company/branch scope' });
      }
    }

    // Validate employee belongs to the company (if employee_id is being updated)
    if (employee_id && employee_id !== announcement.employee_id) {
      const employeeRecord = await Employee.findOne({
        where: { employee_id: String(employee_id), deleted_at: null }
      });
      if (!employeeRecord) {
        return res.status(400).json({ success: false, message: 'Invalid employee' });
      }
      
      // Ensure employee belongs to user's scope
      if (!isSuper(req)) {
        if (!allowedUserIds.map(String).includes(String(employeeRecord.created_by))) {
          return res.status(403).json({ success: false, message: 'Employee not in your company/branch scope' });
        }

        if (userEmployeeRecord && userEmployeeRecord.branch_id && !isCompany(req) && !isEmployee(req)) {
          if (String(employeeRecord.branch_id) !== String(userBranchId)) {
            return res.status(403).json({ success: false, message: 'Employee not in your branch' });
          }
        }
      }
    }

    // ???? Perform update
    await announcement.update({
      title: title ?? announcement.title,
      description: description ?? announcement.description,
      start_date: start_date ?? announcement.start_date,
      end_date: end_date ?? announcement.end_date,
      branch_id: branch_id ?? announcement.branch_id,
      department_id: department_id ?? announcement.department_id,
      employee_id: employee_id ?? announcement.employee_id,
      updated_at: new Date(),
    });

    const data = await formatAnnouncementResponse(announcement);
    console.log('? Announcement updated successfully');
    return res.json({
      success: true,
      message: 'Announcement updated successfully',
      data,
    });
  } catch (err) {
    console.error('? Update Announcement Error:', err);
    return res
      .status(500)
      .json({ success: false, message: 'Server error', error: err.message });
  }
};

// =====================
// ???? DELETE ANNOUNCEMENT (soft delete)
// =====================
exports.deleteAnnouncement = async (req, res) => {
  try {
    console.log('???? START deleteAnnouncement');
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
      console.log('???? Branchless User - Deleting announcement');
    }

    const announcement = await Announcement.findOne({
      where: { id, deleted_at: null },
    });
    if (!announcement)
      return res
        .status(404)
        .json({ success: false, message: 'Announcement not found' });

    const allowedUserIds = await getAllUserIdsUnderCompanyBranch(
      companyId,
      isCompany(req) ? null : branchId
    );

    // ???? Access validation
    if (!isSuper(req)) {
      if (!allowedUserIds.map(String).includes(String(announcement.created_by))) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: not your branch/company record',
        });
      }
    }

    await announcement.destroy();
    console.log('? Announcement deleted successfully');
    return res.json({
      success: true,
      message: 'Announcement deleted successfully',
      data: { id },
    });
  } catch (err) {
    console.error('? Delete Announcement Error:', err);
    return res
      .status(500)
      .json({ success: false, message: 'Server error', error: err.message });
  }
};


