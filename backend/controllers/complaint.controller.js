// // controllers/complaint.controller.js
// const Complaint = require('../models/complaint.model');
// const Employee = require('../models/employee.model');

// // =====================
// // Helper: format complaint response
// // =====================
// const formatComplaintResponse = async (complaint) => {
//   if (!complaint) return null;
//   const json = complaint.toJSON();
//   return {
//     id: json.id,
//     complaint_from: json.complaint_from,
//     complaint_against: json.complaint_against,
//     title: json.title,
//     complaint_date: json.complaint_date,
//     description: json.description,
//     company_id: json.created_by,
//     created_at: json.created_at,
//     updated_at: json.updated_at
//   };
// };

// // =====================
// // GET ALL COMPLAINTS
// // =====================
// exports.getAllComplaints = async (req, res) => {
//   try {
//     if (req.user.type === 'company') {
//       const complaints = await Complaint.findAll({
//         where: { created_by: req.user.id },
//         order: [['id', 'DESC']]
//       });
//       const responseData = await Promise.all(complaints.map(c => formatComplaintResponse(c)));
//       return res.json({ success: true, data: responseData });
//     }

//     if (req.user.type === 'Employee') {
//       const emp = await Employee.findOne({ where: { user_id: req.user.id } });
//       if (!emp) return res.status(403).json({ success: false, message: 'Employee profile not found' });

//       const complaints = await Complaint.findAll({
//         where: { created_by: emp.created_by, complaint_from: emp.employee_id },
//         order: [['id', 'DESC']]
//       });
//       const responseData = await Promise.all(complaints.map(c => formatComplaintResponse(c)));
//       return res.json({ success: true, data: responseData });
//     }

//     // === Other roles (HR, Manager, etc.) ===
//     const emp = await Employee.findOne({ where: { user_id: req.user.id } });
//     let whereClause = {};
//     if (emp) whereClause.created_by = emp.created_by;

//     const complaints = await Complaint.findAll({ where: whereClause, order: [['id', 'DESC']] });
//     const responseData = await Promise.all(complaints.map(c => formatComplaintResponse(c)));
//     return res.json({ success: true, data: responseData });
//   } catch (err) {
//     console.error('Get All Complaints Error:', err);
//     res.status(500).json({ success: false, message: 'Server error', error: err.message });
//   }
// };

// // =====================
// // GET COMPLAINT BY ID
// // =====================
// exports.getComplaintById = async (req, res) => {
//   try {
//     let whereClause = { id: req.params.id };

//     if (req.user.type === 'company') {
//       whereClause.created_by = req.user.id;
//     } else if (req.user.type === 'Employee') {
//       const emp = await Employee.findOne({ where: { user_id: req.user.id } });
//       if (!emp) return res.status(403).json({ success: false, message: 'Employee profile not found' });
//       whereClause = { id: req.params.id, created_by: emp.created_by, complaint_from: emp.employee_id };
//     } else {
//       const emp = await Employee.findOne({ where: { user_id: req.user.id } });
//       if (emp) whereClause.created_by = emp.created_by;
//     }

//     const complaint = await Complaint.findOne({ where: whereClause });
//     if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });

//     const responseData = await formatComplaintResponse(complaint);
//     res.json({ success: true, data: responseData });
//   } catch (err) {
//     console.error('Get Complaint By ID Error:', err);
//     res.status(500).json({ success: false, message: 'Server error', error: err.message });
//   }
// };

// // ==========================
// // CREATE COMPLAINT
// // ==========================
// exports.createComplaint = async (req, res) => {
//   try {
//     const { complaint_from, complaint_against, title, complaint_date, description } = req.body;

//     // === COMPANY USERS ===
//     if (req.user.type === 'company') {
//       const companyId = req.user.id;

//       const fromEmp = await Employee.findOne({ where: { employee_id: complaint_from, created_by: companyId } });
//       const againstEmp = await Employee.findOne({ where: { employee_id: complaint_against, created_by: companyId } });

//       if (!fromEmp) return res.status(400).json({ message: 'complaint_from employee not found in your company' });
//       if (!againstEmp) return res.status(400).json({ message: 'complaint_against employee not found in your company' });

//       const complaint = await Complaint.create({
//         complaint_from,
//         complaint_against,
//         title,
//         complaint_date,
//         description,
//         created_by: companyId,
//         created_at: new Date(),
//         updated_at: new Date()
//       });

//       return res.status(201).json({ success: true, message: 'Complaint created', data: await formatComplaintResponse(complaint) });
//     }

//     // === EMPLOYEE USERS (self only) ===
//     if (req.user.type === 'Employee') {
//       const emp = await Employee.findOne({ where: { user_id: req.user.id } });
//       if (!emp) return res.status(403).json({ success: false, message: 'Employee profile not found' });

//       const againstEmp = await Employee.findOne({ where: { employee_id: complaint_against, created_by: emp.created_by } });
//       if (!againstEmp) return res.status(400).json({ message: 'complaint_against employee not found in your company' });

//       const complaint = await Complaint.create({
//         complaint_from: emp.employee_id,
//         complaint_against,
//         title,
//         complaint_date,
//         description,
//         created_by: emp.created_by,
//         created_at: new Date(),
//         updated_at: new Date()
//       });

//       return res.status(201).json({ success: true, message: 'Complaint created', data: await formatComplaintResponse(complaint) });
//     }

//     // === OTHER ROLES (HR, Manager, etc.) ===
//     const emp = await Employee.findOne({ where: { user_id: req.user.id } });
//     if (!emp) return res.status(403).json({ success: false, message: 'Employee profile not found' });

//     const fromEmp = await Employee.findOne({ where: { employee_id: complaint_from, created_by: emp.created_by } });
//     const againstEmp = await Employee.findOne({ where: { employee_id: complaint_against, created_by: emp.created_by } });

//     if (!fromEmp) return res.status(400).json({ message: 'complaint_from employee not found in your company' });
//     if (!againstEmp) return res.status(400).json({ message: 'complaint_against employee not found in your company' });

//     const complaint = await Complaint.create({
//       complaint_from,
//       complaint_against,
//       title,
//       complaint_date,
//       description,
//       created_by: emp.created_by,
//       created_at: new Date(),
//       updated_at: new Date()
//     });

//     return res.status(201).json({ success: true, message: 'Complaint created', data: await formatComplaintResponse(complaint) });

//   } catch (err) {
//     console.error('Create Complaint Error:', err);
//     res.status(500).json({ success: false, message: 'Server error', error: err.message });
//   }
// };

// // ==========================
// // UPDATE COMPLAINT
// // ==========================
// exports.updateComplaint = async (req, res) => {
//   try {
//     const complaintId = req.params.id;
//     const { complaint_from, complaint_against, title, complaint_date, description } = req.body;

//     // === COMPANY USERS ===
//     if (req.user.type === 'company') {
//       const companyId = req.user.id;

//       const complaint = await Complaint.findOne({ where: { id: complaintId, created_by: companyId } });
//       if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found in your company' });

//       if (complaint_from) {
//         const fromEmp = await Employee.findOne({ where: { employee_id: complaint_from, created_by: companyId } });
//         if (!fromEmp) return res.status(400).json({ message: 'complaint_from employee not found in your company' });
//       }

//       if (complaint_against) {
//         const againstEmp = await Employee.findOne({ where: { employee_id: complaint_against, created_by: companyId } });
//         if (!againstEmp) return res.status(400).json({ message: 'complaint_against employee not found in your company' });
//       }

//       await complaint.update({ complaint_from, complaint_against, title, complaint_date, description, updated_at: new Date() });
//       return res.json({ success: true, message: 'Complaint updated', data: await formatComplaintResponse(complaint) });
//     }

//     // === EMPLOYEE USERS (self only) ===
//     if (req.user.type === 'Employee') {
//       const emp = await Employee.findOne({ where: { user_id: req.user.id } });
//       if (!emp) return res.status(403).json({ success: false, message: 'Employee profile not found' });

//       const complaint = await Complaint.findOne({ where: { id: complaintId, created_by: emp.created_by, complaint_from: emp.employee_id } });
//       if (!complaint) return res.status(404).json({ success: false, message: 'Your complaint not found' });

//       if (complaint_against) {
//         const againstEmp = await Employee.findOne({ where: { employee_id: complaint_against, created_by: emp.created_by } });
//         if (!againstEmp) return res.status(400).json({ message: 'complaint_against employee not found in your company' });
//       }

//       await complaint.update({ complaint_against, title, complaint_date, description, updated_at: new Date() });
//       return res.json({ success: true, message: 'Complaint updated', data: await formatComplaintResponse(complaint) });
//     }

//     // === OTHER ROLES (HR, Manager, etc.) ===
//     const emp = await Employee.findOne({ where: { user_id: req.user.id } });
//     if (!emp) return res.status(403).json({ success: false, message: 'Employee profile not found' });

//     const complaint = await Complaint.findOne({ where: { id: complaintId, created_by: emp.created_by } });
//     if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found in your company' });

//     if (complaint_from) {
//       const fromEmp = await Employee.findOne({ where: { employee_id: complaint_from, created_by: emp.created_by } });
//       if (!fromEmp) return res.status(400).json({ message: 'complaint_from employee not found in your company' });
//     }

//     if (complaint_against) {
//       const againstEmp = await Employee.findOne({ where: { employee_id: complaint_against, created_by: emp.created_by } });
//       if (!againstEmp) return res.status(400).json({ message: 'complaint_against employee not found in your company' });
//     }

//     await complaint.update({ complaint_from, complaint_against, title, complaint_date, description, updated_at: new Date() });
//     return res.json({ success: true, message: 'Complaint updated', data: await formatComplaintResponse(complaint) });

//   } catch (err) {
//     console.error('Update Complaint Error:', err);
//     res.status(500).json({ success: false, message: 'Server error', error: err.message });
//   }
// };

// // =====================
// // DELETE COMPLAINT
// // =====================
// exports.deleteComplaint = async (req, res) => {
//   try {
//     const { id } = req.params;

//     // === COMPANY USERS ===
//     if (req.user.type === 'company') {
//       const companyId = req.user.id;
//       const complaint = await Complaint.findOne({ where: { id, created_by: companyId } });
//       if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found in your company' });

//       await complaint.destroy();
//       return res.json({ success: true, message: 'Complaint deleted', data: { id } });
//     }

//     // === EMPLOYEE USERS (self only) ===
//     if (req.user.type === 'Employee') {
//       const emp = await Employee.findOne({ where: { user_id: req.user.id } });
//       if (!emp) return res.status(403).json({ success: false, message: 'Employee profile not found' });

//       const complaint = await Complaint.findOne({ where: { id, created_by: emp.created_by, complaint_from: emp.employee_id } });
//       if (!complaint) return res.status(404).json({ success: false, message: 'Your complaint not found' });

//       await complaint.destroy();
//       return res.json({ success: true, message: 'Your complaint deleted', data: { id } });
//     }

//     // === OTHER ROLES (HR, Manager, etc.) ===
//     const emp = await Employee.findOne({ where: { user_id: req.user.id } });
//     if (!emp) return res.status(403).json({ success: false, message: 'Employee profile not found' });

//     const complaint = await Complaint.findOne({ where: { id, created_by: emp.created_by } });
//     if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found in your company' });

//     await complaint.destroy();
//     return res.json({ success: true, message: 'Complaint deleted', data: { id } });

//   } catch (err) {
//     console.error('Delete Complaint Error:', err);
//     res.status(500).json({ success: false, message: 'Server error', error: err.message });
//   }
// };











// // controllers/complaint.controller.js
// const { Op } = require('sequelize');
// const Complaint = require('../models/complaint.model');
// const Employee = require('../models/employee.model');
// const User = require('../models/user.model');

// // =====================
// // 🔹 Helpers (kept consistent with other controllers)
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

// // =====================
// // Helper: format complaint response
// // =====================
// const formatComplaintResponse = async (complaint) => {
//   if (!complaint) return null;
//   const json = complaint.toJSON();
//   return {
//     id: json.id,
//     complaint_from: json.complaint_from,
//     complaint_against: json.complaint_against,
//     title: json.title,
//     complaint_date: json.complaint_date,
//     description: json.description,
//     company_id: json.created_by,
//     created_at: json.created_at,
//     updated_at: json.updated_at
//   };
// };

// // =====================
// // GET ALL COMPLAINTS
// // =====================
// exports.getAllComplaints = async (req, res) => {
//   try {
//     // Super admin → unrestricted
//     if (isSuper(req)) {
//       const complaints = await Complaint.findAll({ order: [['id', 'DESC']] });
//       const responseData = await Promise.all(complaints.map(c => formatComplaintResponse(c)));
//       return res.json({ success: true, data: responseData });
//     }

//     const companyId = await getCompanyId(req);
//     if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

//     let where = { deleted_at: null }; // 🔹 Only active (non-deleted) records


//     // Company (admin) or role users: restrict by allowedCreatedBy
//     if (isCompany(req)) {
//       const allowedCreatedBy = await getAllUserIdsUnderCompanyBranch(companyId, null);
//       where.created_by = { [Op.in]: allowedCreatedBy };
//     } else {
//       // Non-company (role or employee) → restrict to their branch
//       const branchId = await getUserBranchId(req.user.id);
//       if (!branchId) return res.status(403).json({ success: false, message: 'No branch assigned' });

//       const allowedCreatedBy = await getAllUserIdsUnderCompanyBranch(companyId, branchId);
//       where.created_by = { [Op.in]: allowedCreatedBy };
//     }

//     // Optional query filters (complaint_from / complaint_against)
//     if (req.query.complaint_from) where.complaint_from = req.query.complaint_from;
//     if (req.query.complaint_against) where.complaint_against = req.query.complaint_against;

//     const complaints = await Complaint.findAll({
//       where,
//       order: [['id', 'DESC']]
//     });

//     const responseData = await Promise.all(complaints.map(c => formatComplaintResponse(c)));
//     return res.json({ success: true, data: responseData });
//   } catch (err) {
//     console.error('Get All Complaints Error:', err);
//     return res.status(500).json({ success: false, message: 'Server error', error: err.message });
//   }
// };

// // =====================
// // GET COMPLAINT BY ID
// // =====================
// exports.getComplaintById = async (req, res) => {
//   try {
//     const complaint = await Complaint.findOne({
//       where: {
//         id: req.params.id,
//         deleted_at: null // 🔹 ignore soft-deleted
//       }
//     });

//     if (!complaint)
//       return res.status(404).json({ success: false, message: 'Complaint not found' });

//     // 🔹 Super admin → unrestricted
//     if (!isSuper(req)) {
//       const companyId = await getCompanyId(req);
//       if (!companyId)
//         return res.status(403).json({ success: false, message: 'Unauthorized' });

//       const branchId = isCompany(req) ? null : await getUserBranchId(req.user.id);
//       const allowedCreatedBy = await getAllUserIdsUnderCompanyBranch(companyId, branchId);

//       if (!allowedCreatedBy.map(String).includes(String(complaint.created_by))) {
//         return res.status(403).json({ success: false, message: 'Forbidden: not your record' });
//       }
//     }

//     const responseData = await formatComplaintResponse(complaint);
//     return res.json({ success: true, data: responseData });
//   } catch (err) {
//     console.error('Get Complaint By ID Error:', err);
//     return res.status(500).json({ success: false, message: 'Server error', error: err.message });
//   }
// };


// // ==========================
// // CREATE COMPLAINT
// // ==========================
// exports.createComplaint = async (req, res) => {
//   try {
//     const { complaint_from, complaint_against, title, complaint_date, description } = req.body;

//     if (!complaint_against && !complaint_from) {
//       return res.status(400).json({ success: false, message: 'complaint_from or complaint_against required' });
//     }

//     const creatorId = req.user.id;
//     const companyId = await getCompanyId(req);
//     if (!companyId && !isSuper(req)) return res.status(403).json({ success: false, message: 'Unauthorized' });

//     // COMPANY USERS
//     if (isCompany(req) || isSuper(req)) {
//       const compId = creatorId; // company's own user id
//       // Validate both employees belong to this company
//       if (complaint_from) {
//         const fromEmp = await Employee.findOne({ where: { employee_id: complaint_from} });
//         if (!fromEmp) return res.status(400).json({ message: 'complaint_from employee not found in your company' });
//       }
//       if (complaint_against) {
//         const againstEmp = await Employee.findOne({ where: { employee_id: complaint_against} });
//         if (!againstEmp) return res.status(400).json({ message: 'complaint_against employee not found in your company' });
//       }

//       const complaint = await Complaint.create({
//         complaint_from,
//         complaint_against,
//         title,
//         complaint_date,
//         description,
//         created_by: creatorId,      // logged-in user id
//         created_at: new Date(),
//         updated_at: new Date()
//       });

//       return res.status(201).json({ success: true, message: 'Complaint created', data: await formatComplaintResponse(complaint) });
//     }

//     // EMPLOYEE USERS → can only file as themselves (complaint_from enforced)
//     if (isEmployee(req)) {
//       const emp = await Employee.findOne({ where: { user_id: req.user.id } });
//       if (!emp) return res.status(403).json({ success: false, message: 'Employee profile not found' });

//       // complaint_from must be the logged-in employee
//       const fromId = emp.employee_id;

//       const againstEmp = await Employee.findOne({ where: { employee_id: complaint_against, created_by: emp.created_by } });
//       if (!againstEmp) return res.status(400).json({ message: 'complaint_against employee not found in your company' });

//       const complaint = await Complaint.create({
//         complaint_from: fromId,
//         complaint_against,
//         title,
//         complaint_date,
//         description,
//         created_by: creatorId,      // logged-in user id
//         created_at: new Date(),
//         updated_at: new Date()
//       });

//       return res.status(201).json({ success: true, message: 'Complaint created', data: await formatComplaintResponse(complaint) });
//     }

//     // OTHER ROLES (HR/Manager/Accountant etc.)
//     // They act on behalf of their company (creatorId identifies the role user)
//     const emp = await Employee.findOne({ where: { user_id: req.user.id } });
//     if (!emp) return res.status(403).json({ success: false, message: 'Employee profile not found' });

//     // Validate employees belong to emp.created_by (company)
//     if (complaint_from) {
//       const fromEmp = await Employee.findOne({ where: { employee_id: complaint_from} });
//       if (!fromEmp) return res.status(400).json({ message: 'complaint_from employee not found in your company' });
//     }
//     if (complaint_against) {
//       const againstEmp = await Employee.findOne({ where: { employee_id: complaint_against} });
//       if (!againstEmp) return res.status(400).json({ message: 'complaint_against employee not found in your company' });
//     }

//     const complaint = await Complaint.create({
//       complaint_from,
//       complaint_against,
//       title,
//       complaint_date,
//       description,
//       created_by: creatorId,      // logged-in user id
//       created_at: new Date(),
//       updated_at: new Date()
//     });

//     return res.status(201).json({ success: true, message: 'Complaint created', data: await formatComplaintResponse(complaint) });
//   } catch (err) {
//     console.error('Create Complaint Error:', err);
//     return res.status(500).json({ success: false, message: 'Server error', error: err.message });
//   }
// };

// // ==========================
// // UPDATE COMPLAINT
// // ==========================
// exports.updateComplaint = async (req, res) => {
//   try {
//     const complaintId = req.params.id;
//     const { complaint_from, complaint_against, title, complaint_date, description } = req.body;

//     // Super can update any record
//     if (isSuper(req)) {
//       const complaint = await Complaint.findOne({ where: { id: complaintId } });
//       if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });

//       // Validate if complaint_from/against provided they belong to the same company of the complaint.created_by
//       if (complaint_from) {
//         const fromEmp = await Employee.findOne({ where: { employee_id: complaint_from, created_by: complaint.created_by } });
//         if (!fromEmp) return res.status(400).json({ message: 'complaint_from employee not found' });
//       }
//       if (complaint_against) {
//         const againstEmp = await Employee.findOne({ where: { employee_id: complaint_against, created_by: complaint.created_by } });
//         if (!againstEmp) return res.status(400).json({ message: 'complaint_against employee not found' });
//       }

//       await complaint.update({
//         complaint_from: complaint_from || complaint.complaint_from,
//         complaint_against: complaint_against || complaint.complaint_against,
//         title: title || complaint.title,
//         complaint_date: complaint_date || complaint.complaint_date,
//         description: description || complaint.description,
//         updated_at: new Date()
//       });

//       return res.json({ success: true, message: 'Complaint updated', data: await formatComplaintResponse(complaint) });
//     }

//     // Non-super: compute allowedCreatedBy
//     const companyId = await getCompanyId(req);
//     if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

//     let allowedCreatedBy;
//     if (isCompany(req)) {
//       allowedCreatedBy = await getAllUserIdsUnderCompanyBranch(companyId, null);
//     } else {
//       const branchId = await getUserBranchId(req.user.id);
//       if (!branchId) return res.status(403).json({ success: false, message: 'No branch assigned' });
//       allowedCreatedBy = await getAllUserIdsUnderCompanyBranch(companyId, branchId);
//     }

//     // COMPANY USERS
//     if (isCompany(req)) {
//       const complaint = await Complaint.findOne({ where: { id: complaintId, created_by: { [Op.in]: allowedCreatedBy } } });
//       if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found in your company' });

//       if (complaint_from) {
//         const fromEmp = await Employee.findOne({ where: { employee_id: complaint_from} });
//         if (!fromEmp) return res.status(400).json({ message: 'complaint_from employee not found in your company' });
//       }
//       if (complaint_against) {
//         const againstEmp = await Employee.findOne({ where: { employee_id: complaint_against} });
//         if (!againstEmp) return res.status(400).json({ message: 'complaint_against employee not found in your company' });
//       }

//       await complaint.update({
//         complaint_from: complaint_from || complaint.complaint_from,
//         complaint_against: complaint_against || complaint.complaint_against,
//         title: title || complaint.title,
//         complaint_date: complaint_date || complaint.complaint_date,
//         description: description || complaint.description,
//         updated_at: new Date()
//       });

//       return res.json({ success: true, message: 'Complaint updated', data: await formatComplaintResponse(complaint) });
//     }

//     // EMPLOYEE USERS (self only)
//     if (isEmployee(req)) {
//       const emp = await Employee.findOne({ where: { user_id: req.user.id } });
//       if (!emp) return res.status(403).json({ success: false, message: 'Employee profile not found' });

//       const complaint = await Complaint.findOne({
//         where: {
//           id: complaintId,
//           created_by: { [Op.in]: allowedCreatedBy },
//           complaint_from: emp.employee_id
//         }
//       });
//       if (!complaint) return res.status(404).json({ success: false, message: 'Your complaint not found' });

//       // employees cannot change complaint_from; only complaint_against, title, date, description
//       if (complaint_against) {
//         const againstEmp = await Employee.findOne({ where: { employee_id: complaint_against, created_by: emp.created_by } });
//         if (!againstEmp) return res.status(400).json({ message: 'complaint_against employee not found in your company' });
//       }

//       await complaint.update({
//         complaint_against: complaint_against || complaint.complaint_against,
//         title: title || complaint.title,
//         complaint_date: complaint_date || complaint.complaint_date,
//         description: description || complaint.description,
//         updated_at: new Date()
//       });

//       return res.json({ success: true, message: 'Complaint updated', data: await formatComplaintResponse(complaint) });
//     }

//     // OTHER ROLES (HR, Manager, Accountant)
//     // They can update complaints within allowedCreatedBy
//     const empRole = await Employee.findOne({ where: { user_id: req.user.id } });
//     if (!empRole) return res.status(403).json({ success: false, message: 'Employee profile not found' });

//     const complaint = await Complaint.findOne({ where: { id: complaintId, created_by: { [Op.in]: allowedCreatedBy } } });
//     if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found in your company' });

//     if (complaint_from) {
//       const fromEmp = await Employee.findOne({ where: { employee_id: complaint_from} });
//       if (!fromEmp) return res.status(400).json({ message: 'complaint_from employee not found in your company' });
//     }
//     if (complaint_against) {
//       const againstEmp = await Employee.findOne({ where: { employee_id: complaint_against} });
//       if (!againstEmp) return res.status(400).json({ message: 'complaint_against employee not found in your company' });
//     }

//     await complaint.update({
//       complaint_from: complaint_from || complaint.complaint_from,
//       complaint_against: complaint_against || complaint.complaint_against,
//       title: title || complaint.title,
//       complaint_date: complaint_date || complaint.complaint_date,
//       description: description || complaint.description,
//       updated_at: new Date()
//     });

//     return res.json({ success: true, message: 'Complaint updated', data: await formatComplaintResponse(complaint) });
//   } catch (err) {
//     console.error('Update Complaint Error:', err);
//     return res.status(500).json({ success: false, message: 'Server error', error: err.message });
//   }
// };

// // // =====================
// // // DELETE COMPLAINT
// // // =====================
// // exports.deleteComplaint = async (req, res) => {
// //   try {
// //     const { id } = req.params;

// //     // Super → can delete any
// //     if (isSuper(req)) {
// //       const complaint = await Complaint.findOne({ where: { id } });
// //       if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });
// //       await complaint.destroy();
// //       return res.json({ success: true, message: 'Complaint deleted', data: { id } });
// //     }

// //     const companyId = await getCompanyId(req);
// //     if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

// //     // Compute allowedCreatedBy
// //     let allowedCreatedBy;
// //     if (isCompany(req)) {
// //       allowedCreatedBy = await getAllUserIdsUnderCompanyBranch(companyId, null);
// //     } else {
// //       const branchId = await getUserBranchId(req.user.id);
// //       if (!branchId) return res.status(403).json({ success: false, message: 'No branch assigned' });
// //       allowedCreatedBy = await getAllUserIdsUnderCompanyBranch(companyId, branchId);
// //     }

// //     // COMPANY USERS
// //     if (isCompany(req)) {
// //       const complaint = await Complaint.findOne({ where: { id, created_by: { [Op.in]: allowedCreatedBy } } });
// //       if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found in your company' });
// //       await complaint.destroy();
// //       return res.json({ success: true, message: 'Complaint deleted', data: { id } });
// //     }

// //     // EMPLOYEE USERS (self only)
// //     if (isEmployee(req)) {
// //       const emp = await Employee.findOne({ where: { user_id: req.user.id } });
// //       if (!emp) return res.status(403).json({ success: false, message: 'Employee profile not found' });

// //       const complaint = await Complaint.findOne({
// //         where: {
// //           id,
// //           created_by: { [Op.in]: allowedCreatedBy },
// //           complaint_from: emp.employee_id
// //         }
// //       });
// //       if (!complaint) return res.status(404).json({ success: false, message: 'Your complaint not found' });

// //       await complaint.destroy();
// //       return res.json({ success: true, message: 'Your complaint deleted', data: { id } });
// //     }

// //     // OTHER ROLES
// //     const empRole = await Employee.findOne({ where: { user_id: req.user.id } });
// //     if (!empRole) return res.status(403).json({ success: false, message: 'Employee profile not found' });

// //     const complaint = await Complaint.findOne({ where: { id, created_by: { [Op.in]: allowedCreatedBy } } });
// //     if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found in your company' });

// //     await complaint.destroy();
// //     return res.json({ success: true, message: 'Complaint deleted', data: { id } });
// //   } catch (err) {
// //     console.error('Delete Complaint Error:', err);
// //     return res.status(500).json({ success: false, message: 'Server error', error: err.message });
// //   }
// // };

// // =====================
// // DELETE COMPLAINT (Soft Delete)
// // =====================
// exports.deleteComplaint = async (req, res) => {
//   try {
//     const { id } = req.params;

//     // Super → can delete any complaint
//     if (isSuper(req)) {
//       const complaint = await Complaint.findOne({ where: { id, deleted_at: null } });
//       if (!complaint)
//         return res.status(404).json({ success: false, message: 'Complaint not found' });

//       await complaint.update({ deleted_at: new Date() });
//       return res.json({ success: true, message: 'Complaint soft deleted', data: { id } });
//     }

//     const companyId = await getCompanyId(req);
//     if (!companyId)
//       return res.status(403).json({ success: false, message: 'Unauthorized' });

//     // Compute allowedCreatedBy
//     let allowedCreatedBy;
//     if (isCompany(req)) {
//       allowedCreatedBy = await getAllUserIdsUnderCompanyBranch(companyId, null);
//     } else {
//       const branchId = await getUserBranchId(req.user.id);
//       if (!branchId)
//         return res.status(403).json({ success: false, message: 'No branch assigned' });
//       allowedCreatedBy = await getAllUserIdsUnderCompanyBranch(companyId, branchId);
//     }

//     // COMPANY USERS
//     if (isCompany(req)) {
//       const complaint = await Complaint.findOne({
//         where: { id, created_by: { [Op.in]: allowedCreatedBy }, deleted_at: null },
//       });
//       if (!complaint)
//         return res
//           .status(404)
//           .json({ success: false, message: 'Complaint not found in your company' });

//       await complaint.update({ deleted_at: new Date() });
//       return res.json({ success: true, message: 'Complaint soft deleted', data: { id } });
//     }

//     // EMPLOYEE USERS (self-only)
//     if (isEmployee(req)) {
//       const emp = await Employee.findOne({ where: { user_id: req.user.id } });
//       if (!emp)
//         return res
//           .status(403)
//           .json({ success: false, message: 'Employee profile not found' });

//       const complaint = await Complaint.findOne({
//         where: {
//           id,
//           created_by: { [Op.in]: allowedCreatedBy },
//           complaint_from: emp.employee_id,
//           deleted_at: null,
//         },
//       });
//       if (!complaint)
//         return res
//           .status(404)
//           .json({ success: false, message: 'Your complaint not found' });

//       await complaint.update({ deleted_at: new Date() });
//       return res.json({ success: true, message: 'Your complaint soft deleted', data: { id } });
//     }

//     // OTHER ROLES
//     const empRole = await Employee.findOne({ where: { user_id: req.user.id } });
//     if (!empRole)
//       return res
//         .status(403)
//         .json({ success: false, message: 'Employee profile not found' });

//     const complaint = await Complaint.findOne({
//       where: { id, created_by: { [Op.in]: allowedCreatedBy }, deleted_at: null },
//     });
//     if (!complaint)
//       return res
//         .status(404)
//         .json({ success: false, message: 'Complaint not found in your company' });

//     await complaint.update({ deleted_at: new Date() });
//     return res.json({ success: true, message: 'Complaint soft deleted', data: { id } });
//   } catch (err) {
//     console.error('Delete Complaint Error:', err);
//     return res
//       .status(500)
//       .json({ success: false, message: 'Server error', error: err.message });
//   }
// };


// controllers/complaint.controller.js
const { Op } = require('sequelize');
const Complaint = require('../models/complaint.model');
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
// ???? Format Complaint Response
// =====================
const formatComplaintResponse = async (complaint) => {
  if (!complaint) return null;
  const json = complaint.toJSON ? complaint.toJSON() : complaint;

  // Get complaint_from employee details
  const fromEmployee = await Employee.findOne({
    where: { employee_id: String(json.complaint_from), deleted_at: null },
    attributes: ['id', 'employee_id', 'name', 'branch_id', 'department_id'],
    raw: true
  });

  // Get complaint_against employee details
  const againstEmployee = await Employee.findOne({
    where: { employee_id: String(json.complaint_against), deleted_at: null },
    attributes: ['id', 'employee_id', 'name', 'branch_id', 'department_id'],
    raw: true
  });

  return {
    id: json.id,
    complaint_from: json.complaint_from,
    complaint_from_employee: fromEmployee ? {
      id: fromEmployee.id,
      employee_id: fromEmployee.employee_id,
      name: fromEmployee.name,
      branch_id: fromEmployee.branch_id,
      department_id: fromEmployee.department_id
    } : null,
    complaint_against: json.complaint_against,
    complaint_against_employee: againstEmployee ? {
      id: againstEmployee.id,
      employee_id: againstEmployee.employee_id,
      name: againstEmployee.name,
      branch_id: againstEmployee.branch_id,
      department_id: againstEmployee.department_id
    } : null,
    title: json.title,
    complaint_date: json.complaint_date,
    description: json.description,
    created_by: json.created_by,
    created_at: json.created_at,
    updated_at: json.updated_at
  };
};

// =====================
// ???? CREATE COMPLAINT
// =====================
exports.createComplaint = async (req, res) => {
  try {
    console.log('???? START createComplaint');
    console.log('???? User Info - ID:', req.user.id, 'Type:', req.user.type);
    
    const { complaint_from, complaint_against, title, complaint_date, description } = req.body;
    if (!complaint_from || !complaint_against || !title) {
      return res.status(400).json({ success: false, message: 'complaint_from, complaint_against, and title are required' });
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
      console.log('???? Branch User - Creating complaint');
      userBranchId = userEmployeeRecord.branch_id;
    } else {
      // ???? CASE 2: User doesn't have employee record (no branch) ? company-wide access
      console.log('???? Branchless User - Creating complaint');
      // No branch restriction for branchless users
    }

    // ???? FIX: Only require branch for branch users, not branchless users
    if (!isCompany(req) && !isSuper(req) && userEmployeeRecord && !userBranchId && !isEmployee(req)) {
      return res.status(403).json({ success: false, message: 'No branch assigned' });
    }

    // Determine allowed creators within company/branch
    const allowedCreatedBy = await getAllUserIdsUnderCompanyBranch(companyId, isCompany(req) ? null : userBranchId);

    // Find complaint_from employee by business employee_id
    const fromEmployeeRecord = await Employee.findOne({
      where: { employee_id: String(complaint_from), deleted_at: null }
    });
    if (!fromEmployeeRecord) {
      return res.status(404).json({ success: false, message: 'Complaint_from employee not found' });
    }

    // Find complaint_against employee by business employee_id
    const againstEmployeeRecord = await Employee.findOne({
      where: { employee_id: String(complaint_against), deleted_at: null }
    });
    if (!againstEmployeeRecord) {
      return res.status(404).json({ success: false, message: 'Complaint_against employee not found' });
    }

    // Ensure both employees belong to the current scope
    if (!isSuper(req)) {
      if (!allowedCreatedBy.map(String).includes(String(fromEmployeeRecord.created_by)) || 
          !allowedCreatedBy.map(String).includes(String(againstEmployeeRecord.created_by))) {
        return res.status(403).json({ success: false, message: 'One or both employees not in your company/branch scope' });
      }

      if (userEmployeeRecord && userEmployeeRecord.branch_id && !isCompany(req) && !isEmployee(req)) {
        // branch-level user: both employees must be in same branch
        if (String(fromEmployeeRecord.branch_id) !== String(userBranchId) || 
            String(againstEmployeeRecord.branch_id) !== String(userBranchId)) {
          return res.status(403).json({ success: false, message: 'One or both employees not in your branch' });
        }
      }
    }

    // Employee users can only create complaints for themselves as complaint_from
    if (isEmployee(req)) {
      if (!userEmployeeRecord || String(userEmployeeRecord.employee_id) !== String(complaint_from)) {
        return res.status(403).json({ success: false, message: 'Employees can only create complaints for themselves as complaint_from' });
      }
    }

    // Create complaint
    const complaint = await Complaint.create({
      complaint_from: String(complaint_from),
      complaint_against: String(complaint_against),
      title: title,
      complaint_date: complaint_date || new Date(),
      description: description || null,
      created_by: req.user.id,
      created_at: new Date(),
      updated_at: new Date()
    });

    const data = await formatComplaintResponse(complaint);
    console.log('? Complaint created successfully');
    return res.status(201).json({ success: true, message: 'Complaint created', data });
  } catch (err) {
    console.error('? Create Complaint Error:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// =====================
// ???? GET ALL COMPLAINTS
// =====================
exports.getAllComplaints = async (req, res) => {
  try {
    console.log('???? START getAllComplaints');
    console.log('???? User Info - ID:', req.user.id, 'Type:', req.user.type);

    // ???? SUPER ADMIN: Full access
    if (isSuper(req)) {
      console.log('???? Super Admin Access');
      const complaints = await Complaint.findAll({
        where: { deleted_at: null },
        order: [['id', 'DESC']],
      });
      console.log('???? Super Admin Complaints Count:', complaints.length);
      const data = await Promise.all(complaints.map(c => formatComplaintResponse(c)));
      return res.json({ success: true, data });
    }

    // ???? Check if user exists in employees table (has branch)
    const userEmployeeRecord = await Employee.findOne({
      where: { user_id: req.user.id },
      attributes: ['branch_id', 'created_by', 'employee_id'],
      raw: true,
    });

    console.log('???? User Employee Record:', userEmployeeRecord);

    let complaints = [];

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

      // ???? STEP 2: Fetch complaints where both complaint_from AND complaint_against are in the same branch
      complaints = await Complaint.findAll({
        where: {
          deleted_at: null,
          complaint_from: { [Op.in]: branchEmployeeIds },
          complaint_against: { [Op.in]: branchEmployeeIds }
        },
        order: [['id', 'DESC']],
      });

    } else {
      // ???? CASE 2: User doesn't have employee record (no branch) ? FULL DATABASE ACCESS
      console.log('???? Branchless User Access (FULL DATABASE)');
      
      // ???? DIRECTLY GET ALL COMPLAINTS - no company filter
      complaints = await Complaint.findAll({
        where: { deleted_at: null },
        order: [['id', 'DESC']],
      });
      
      console.log('???? Branchless User - All Complaints Count:', complaints.length);
    }

    console.log('???? Final Complaints Count:', complaints.length);
    const data = await Promise.all(complaints.map(c => formatComplaintResponse(c)));
    console.log('? END getAllComplaints - Success');
    return res.json({ success: true, data });

  } catch (err) {
    console.error('? Get All Complaints Error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message,
    });
  }
};

// =====================
// ???? GET COMPLAINT BY ID
// =====================
exports.getComplaintById = async (req, res) => {
  try {
    console.log('???? START getComplaintById');
    console.log('???? User Info - ID:', req.user.id, 'Type:', req.user.type);
    
    const complaint = await Complaint.findOne({
      where: { id: req.params.id, deleted_at: null },
    });

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    // ???? Super Admin ? full access
    if (isSuper(req)) {
      const data = await formatComplaintResponse(complaint);
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

      // ???? STEP 1: Get the employees linked to the complaint
      const fromEmployee = await Employee.findOne({
        where: { employee_id: String(complaint.complaint_from), deleted_at: null },
        raw: true,
      });

      const againstEmployee = await Employee.findOne({
        where: { employee_id: String(complaint.complaint_against), deleted_at: null },
        raw: true,
      });

      if (!fromEmployee || !againstEmployee) {
        return res.status(404).json({ success: false, message: 'Employees linked to complaint not found' });
      }

      // ???? STEP 2: Check if both complaint employees belong to the same branch as the current user
      const fromEmployeeBranchId = fromEmployee.branch_id || null;
      const againstEmployeeBranchId = againstEmployee.branch_id || null;
      
      console.log('???? From Employee Branch ID:', fromEmployeeBranchId);
      console.log('???? Against Employee Branch ID:', againstEmployeeBranchId);
      console.log('???? Current User Branch ID:', userEmployeeRecord.branch_id);

      if (String(fromEmployeeBranchId) !== String(userEmployeeRecord.branch_id) || 
          String(againstEmployeeBranchId) !== String(userEmployeeRecord.branch_id)) {
        return res.status(403).json({ success: false, message: 'Forbidden: complaint belongs to different branch' });
      }

    } else {
      // ???? CASE 2: User doesn't have employee record (no branch) ? FULL ACCESS
      console.log('???? Branchless User - Full complaint access');
      // No additional checks needed - branchless users can access any complaint
    }

    // ? Return formatted complaint
    const data = await formatComplaintResponse(complaint);
    console.log('? END getComplaintById - Success');
    return res.json({ success: true, data });

  } catch (err) {
    console.error('? Get Complaint By ID Error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message,
    });
  }
};

// =====================
// ???? UPDATE COMPLAINT
// =====================
exports.updateComplaint = async (req, res) => {
  try {
    console.log('???? START updateComplaint');
    console.log('???? User Info - ID:', req.user.id, 'Type:', req.user.type);
    
    const { id } = req.params;
    const { complaint_from, complaint_against, title, complaint_date, description } = req.body;

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
      console.log('???? Branch User - Updating complaint');
      userBranchId = userEmployeeRecord.branch_id;
    } else {
      // ???? CASE 2: User doesn't have employee record (no branch) ? company-wide access
      console.log('???? Branchless User - Updating complaint');
      // No branch restriction for branchless users
    }

    const complaint = await Complaint.findOne({
      where: { id, deleted_at: null },
    });
    if (!complaint)
      return res
        .status(404)
        .json({ success: false, message: 'Complaint not found' });

    const fromEmployee = await Employee.findOne({
      where: { employee_id: String(complaint.complaint_from), deleted_at: null },
    });

    const againstEmployee = await Employee.findOne({
      where: { employee_id: String(complaint.complaint_against), deleted_at: null },
    });

    // Determine allowed creators within company/branch
    const allowedUserIds = await getAllUserIdsUnderCompanyBranch(companyId, isCompany(req) ? null : userBranchId);

    // ???? Access validation
    if (!isSuper(req)) {
      if (
        !fromEmployee ||
        !againstEmployee ||
        !allowedUserIds.map(String).includes(String(fromEmployee.created_by)) ||
        !allowedUserIds.map(String).includes(String(againstEmployee.created_by))
      ) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: not your branch/company record',
        });
      }

      if (userEmployeeRecord && userEmployeeRecord.branch_id && !isCompany(req) && !isEmployee(req)) {
        // branch-level user: both employees must be in same branch
        if (String(fromEmployee.branch_id) !== String(userBranchId) || 
            String(againstEmployee.branch_id) !== String(userBranchId)) {
          return res.status(403).json({
            success: false,
            message: 'Forbidden: different branch',
          });
        }
      }
    }

    // Employee users can only update their own complaints
    if (isEmployee(req)) {
      if (!userEmployeeRecord || String(userEmployeeRecord.employee_id) !== String(complaint.complaint_from)) {
        return res.status(403).json({ success: false, message: 'Employees can only update their own complaints' });
      }
    }

    // ? If updating complaint_from, check if valid and belongs to company
    if (complaint_from && complaint_from !== complaint.complaint_from) {
      const newFromEmployee = await Employee.findOne({
        where: { employee_id: String(complaint_from), deleted_at: null }
      });
      
      if (!newFromEmployee) {
        return res.status(400).json({ success: false, message: 'New complaint_from employee not found' });
      }

      // Validate new employee belongs to same scope
      if (!isSuper(req)) {
        if (!allowedUserIds.map(String).includes(String(newFromEmployee.created_by))) {
          return res.status(403).json({ success: false, message: 'New complaint_from employee not in your company/branch scope' });
        }

        if (userEmployeeRecord && userEmployeeRecord.branch_id && !isCompany(req) && !isEmployee(req)) {
          if (String(newFromEmployee.branch_id) !== String(userBranchId)) {
            return res.status(403).json({ success: false, message: 'New complaint_from employee not in your branch' });
          }
        }
      }
    }

    // ? If updating complaint_against, check if valid and belongs to company
    if (complaint_against && complaint_against !== complaint.complaint_against) {
      const newAgainstEmployee = await Employee.findOne({
        where: { employee_id: String(complaint_against), deleted_at: null }
      });
      
      if (!newAgainstEmployee) {
        return res.status(400).json({ success: false, message: 'New complaint_against employee not found' });
      }

      // Validate new employee belongs to same scope
      if (!isSuper(req)) {
        if (!allowedUserIds.map(String).includes(String(newAgainstEmployee.created_by))) {
          return res.status(403).json({ success: false, message: 'New complaint_against employee not in your company/branch scope' });
        }

        if (userEmployeeRecord && userEmployeeRecord.branch_id && !isCompany(req) && !isEmployee(req)) {
          if (String(newAgainstEmployee.branch_id) !== String(userBranchId)) {
            return res.status(403).json({ success: false, message: 'New complaint_against employee not in your branch' });
          }
        }
      }
    }

    // ???? Perform update
    await complaint.update({
      complaint_from: complaint_from ?? complaint.complaint_from,
      complaint_against: complaint_against ?? complaint.complaint_against,
      title: title ?? complaint.title,
      complaint_date: complaint_date ?? complaint.complaint_date,
      description: description ?? complaint.description,
      updated_at: new Date(),
    });

    const data = await formatComplaintResponse(complaint);
    console.log('? Complaint updated successfully');
    return res.json({
      success: true,
      message: 'Complaint updated successfully',
      data,
    });
  } catch (err) {
    console.error('? Update Complaint Error:', err);
    return res
      .status(500)
      .json({ success: false, message: 'Server error', error: err.message });
  }
};

// =====================
// ???? DELETE COMPLAINT (soft delete)
// =====================
exports.deleteComplaint = async (req, res) => {
  try {
    console.log('???? START deleteComplaint');
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
      console.log('???? Branchless User - Deleting complaint');
    }

    const complaint = await Complaint.findOne({
      where: { id, deleted_at: null },
    });
    if (!complaint)
      return res
        .status(404)
        .json({ success: false, message: 'Complaint not found' });

    const fromEmployee = await Employee.findOne({
      where: { employee_id: String(complaint.complaint_from), deleted_at: null },
    });

    const againstEmployee = await Employee.findOne({
      where: { employee_id: String(complaint.complaint_against), deleted_at: null },
    });

    const allowedUserIds = await getAllUserIdsUnderCompanyBranch(
      companyId,
      isCompany(req) ? null : branchId
    );

    // ???? Access validation
    if (!isSuper(req)) {
      if (
        !fromEmployee ||
        !againstEmployee ||
        !allowedUserIds.map(String).includes(String(fromEmployee.created_by)) ||
        !allowedUserIds.map(String).includes(String(againstEmployee.created_by))
      ) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: not your branch/company record',
        });
      }
      if (!isCompany(req) && branchId !== null) {
        if (String(fromEmployee.branch_id) !== String(branchId) || 
            String(againstEmployee.branch_id) !== String(branchId)) {
          return res.status(403).json({
            success: false,
            message: 'Forbidden: different branch',
          });
        }
      }
    }

    // Employee users can only delete their own complaints
    if (isEmployee(req)) {
      if (!userEmployeeRecord || String(userEmployeeRecord.employee_id) !== String(complaint.complaint_from)) {
        return res.status(403).json({ success: false, message: 'Employees can only delete their own complaints' });
      }
    }

    await complaint.destroy();
    console.log('? Complaint deleted successfully');
    return res.json({
      success: true,
      message: 'Complaint deleted successfully',
      data: { id },
    });
  } catch (err) {
    console.error('? Delete Complaint Error:', err);
    return res
      .status(500)
      .json({ success: false, message: 'Server error', error: err.message });
  }
};

