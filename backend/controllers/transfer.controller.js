
// // controllers/transfer.controller.js
// const { Op } = require('sequelize');
// const Transfer = require('../models/transfer.model');
// const Employee = require('../models/employee.model');
// const Branch = require('../models/branch.model');
// const Department = require('../models/department.model');
// const Designation = require('../models/designation.model');
// const User = require('../models/user.model');

// // =====================
// // 🔹 Helpers
// // =====================
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
// // 🔹 Format Transfer Response
// // =====================
// const formatTransferResponse = async (transfer) => {
//   if (!transfer) return null;
//   const json = transfer.toJSON ? transfer.toJSON() : transfer;

//   // Get employee details
//   const employee = await Employee.findOne({
//     where: { employee_id: String(json.employee_id), deleted_at: null },
//     attributes: ['id', 'employee_id', 'name', 'branch_id', 'department_id', 'designation_id'],
//     raw: true
//   });

//   // Get branch details
//   let branch = null;
//   if (json.branch_id) {
//     const b = await Branch.findByPk(json.branch_id, { raw: true });
//     if (b) branch = { id: b.id, name: b.name };
//   }

//   // Get department details
//   let department = null;
//   if (json.department_id) {
//     const d = await Department.findByPk(json.department_id, { raw: true });
//     if (d) department = { id: d.id, name: d.name };
//   }

//   // 🟢 Get designation details
//   let designation = null;
//   if (json.designation_id) {
//     const desig = await Designation.findByPk(json.designation_id, { raw: true });
//     if (desig) designation = { id: desig.id, name: desig.name };
//   }

//   return {
//     id: json.id,
//     employee_id: json.employee_id,
//     employee: employee ? {
//       id: employee.id,
//       employee_id: employee.employee_id,
//       name: employee.name,
//       branch_id: employee.branch_id,
//       department_id: employee.department_id,
//       designation_id: employee.designation_id // 🟢 ADDED DESIGNATION
//     } : null,
//     branch_id: json.branch_id,
//     branch: branch,
//     department_id: json.department_id,
//     department: department,
//     designation_id: json.designation_id, // 🟢 ADDED DESIGNATION
//     designation: designation, // 🟢 ADDED DESIGNATION
//     transfer_date: json.transfer_date,
//     description: json.description,
//     created_by: json.created_by,
//     created_at: json.created_at,
//     updated_at: json.updated_at
//   };
// };

// // =====================
// // 🔹 CREATE TRANSFER
// // =====================
// // exports.createTransfer = async (req, res) => {
// //   try {
// //     console.log('🎯 START createTransfer');
// //     console.log('🔍 User Info - ID:', req.user.id, 'Type:', req.user.type);
    
// //     const { employee_id, branch_id, department_id, transfer_date, description } = req.body;
// //     if (!employee_id) {
// //       return res.status(400).json({ success: false, message: 'employee_id is required' });
// //     }

// //     const companyId = await getCompanyId(req);
// //     if (!companyId && !isSuper(req)) return res.status(403).json({ success: false, message: 'Unauthorized' });

// //     // 🟢 Check if user exists in employees table (has branch)
// //     const userEmployeeRecord = await Employee.findOne({
// //       where: { user_id: req.user.id },
// //       attributes: ['branch_id', 'created_by'],
// //       raw: true,
// //     });

// //     console.log('🔍 User Employee Record:', userEmployeeRecord);

// //     let userBranchId = null;

// //     if (userEmployeeRecord && userEmployeeRecord.branch_id) {
// //       // 🟢 CASE 1: User has employee record with branch → branch-level access
// //       console.log('🟡 Branch User - Creating transfer');
// //       userBranchId = userEmployeeRecord.branch_id;
// //     } else {
// //       // 🟢 CASE 2: User doesn't have employee record (no branch) → company-wide access
// //       console.log('🟡 Branchless User - Creating transfer');
// //       // No branch restriction for branchless users
// //     }

// //     // 🟢 FIX: Only require branch for branch users, not branchless users
// //     if (!isCompany(req) && !isSuper(req) && userEmployeeRecord && !userBranchId && !isEmployee(req)) {
// //       return res.status(403).json({ success: false, message: 'No branch assigned' });
// //     }

// //     // Determine allowed creators within company/branch
// //     const allowedCreatedBy = await getAllUserIdsUnderCompanyBranch(companyId, isCompany(req) ? null : userBranchId);

// //     // Find target employee by business employee_id
// //     const employeeRecord = await Employee.findOne({
// //       where: { employee_id: String(employee_id), deleted_at: null }
// //     });
// //     if (!employeeRecord) {
// //       return res.status(404).json({ success: false, message: 'Employee not found' });
// //     }

// //     // Ensure the employee belongs to the current scope
// //     // - employeeRecord.created_by should be in allowedCreatedBy (company / branch users)
// //     // - branch users must be in same branch
// //     if (!isSuper(req)) {
// //       if (!allowedCreatedBy.map(String).includes(String(employeeRecord.created_by))) {
// //         return res.status(403).json({ success: false, message: 'Employee not in your company/branch scope' });
// //       }

// //       if (userEmployeeRecord && userEmployeeRecord.branch_id && !isCompany(req) && !isEmployee(req)) {
// //         // branch-level user: employee must be in same branch
// //         if (String(employeeRecord.branch_id) !== String(userBranchId)) {
// //           return res.status(403).json({ success: false, message: 'Employee not in your branch' });
// //         }
// //       }
// //     }

// //     // Employee users can only create transfers for themselves
// //     if (isEmployee(req)) {
// //       const self = await Employee.findOne({ where: { user_id: req.user.id, deleted_at: null } });
// //       if (!self || String(self.employee_id) !== String(employee_id)) {
// //         return res.status(403).json({ success: false, message: 'Employees can only create transfers for themselves' });
// //       }
// //     }

// //     // Validate branch belongs to the company
// //     if (branch_id) {
// //       const branchRecord = await Branch.findOne({
// //         where: { id: branch_id, deleted_at: null }
// //       });
// //       if (!branchRecord) {
// //         return res.status(400).json({ success: false, message: 'Invalid branch' });
// //       }
// //     }

// //     // Validate department belongs to the company
// //     if (department_id) {
// //       const departmentRecord = await Department.findOne({
// //         where: { id: department_id, deleted_at: null }
// //       });
// //       if (!departmentRecord) {
// //         return res.status(400).json({ success: false, message: 'Invalid department' });
// //       }
// //     }

// //     // Create transfer
// //     const transfer = await Transfer.create({
// //       employee_id: String(employee_id),
// //       branch_id: branch_id || null,
// //       department_id: department_id || null,
// //       transfer_date: transfer_date || new Date(),
// //       description: description || null,
// //       created_by: req.user.id,
// //       created_at: new Date(),
// //       updated_at: new Date()
// //     });

// //     const data = await formatTransferResponse(transfer);
// //     console.log('✅ Transfer created successfully');
// //     return res.status(201).json({ success: true, message: 'Transfer created', data });
// //   } catch (err) {
// //     console.error('❌ Create Transfer Error:', err);
// //     return res.status(500).json({ success: false, message: 'Server error', error: err.message });
// //   }
// // };


// exports.createTransfer = async (req, res) => {
//   try {
//     console.log('🎯 START createTransfer');
//     console.log('🔍 User Info - ID:', req.user.id, 'Type:', req.user.type);
    
//     const { employee_id, branch_id, department_id, designation_id, transfer_date, description } = req.body;
//     if (!employee_id) {
//       return res.status(400).json({ success: false, message: 'employee_id is required' });
//     }

//     const companyId = await getCompanyId(req);
//     if (!companyId && !isSuper(req)) return res.status(403).json({ success: false, message: 'Unauthorized' });

//     // 🟢 Check if user exists in employees table (has branch)
//     const userEmployeeRecord = await Employee.findOne({
//       where: { user_id: req.user.id },
//       attributes: ['branch_id', 'created_by'],
//       raw: true,
//     });

//     console.log('🔍 User Employee Record:', userEmployeeRecord);

//     let userBranchId = null;

//     if (userEmployeeRecord && userEmployeeRecord.branch_id) {
//       // 🟢 CASE 1: User has employee record with branch → branch-level access
//       console.log('🟡 Branch User - Creating transfer');
//       userBranchId = userEmployeeRecord.branch_id;
//     } else {
//       // 🟢 CASE 2: User doesn't have employee record (no branch) → company-wide access
//       console.log('🟡 Branchless User - Creating transfer');
//       // No branch restriction for branchless users
//     }

//     // 🟢 FIX: Only require branch for branch users, not branchless users
//     if (!isCompany(req) && !isSuper(req) && userEmployeeRecord && !userBranchId && !isEmployee(req)) {
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

//       if (userEmployeeRecord && userEmployeeRecord.branch_id && !isCompany(req) && !isEmployee(req)) {
//         // branch-level user: employee must be in same branch
//         if (String(employeeRecord.branch_id) !== String(userBranchId)) {
//           return res.status(403).json({ success: false, message: 'Employee not in your branch' });
//         }
//       }
//     }

//     // Employee users can only create transfers for themselves
//     if (isEmployee(req)) {
//       const self = await Employee.findOne({ where: { user_id: req.user.id, deleted_at: null } });
//       if (!self || String(self.employee_id) !== String(employee_id)) {
//         return res.status(403).json({ success: false, message: 'Employees can only create transfers for themselves' });
//       }
//     }

//     // Validate branch belongs to the company
//     if (branch_id) {
//       const branchRecord = await Branch.findOne({
//         where: { id: branch_id, deleted_at: null }
//       });
//       if (!branchRecord) {
//         return res.status(400).json({ success: false, message: 'Invalid branch' });
//       }
//     }

//     // Validate department belongs to the company
//     if (department_id) {
//       const departmentRecord = await Department.findOne({
//         where: { id: department_id, deleted_at: null }
//       });
//       if (!departmentRecord) {
//         return res.status(400).json({ success: false, message: 'Invalid department' });
//       }
//     }

//     // 🟢 Validate designation belongs to the company
//     if (designation_id) {
//       const designationRecord = await Designation.findOne({
//         where: { id: designation_id, deleted_at: null }
//       });
//       if (!designationRecord) {
//         return res.status(400).json({ success: false, message: 'Invalid designation' });
//       }
//     }

//     // 🟢 CREATE TRANSFER RECORD
//     const transfer = await Transfer.create({
//       employee_id: String(employee_id),
//       branch_id: branch_id || null,
//       department_id: department_id || null,
//       designation_id: designation_id || null, // 🟢 ADDED DESIGNATION FIELD
//       transfer_date: transfer_date || new Date(),
//       description: description || null,
//       created_by: req.user.id,
//       created_at: new Date(),
//       updated_at: new Date()
//     });

//     // 🟢 UPDATE EMPLOYEE'S BRANCH, DEPARTMENT AND DESIGNATION IN EMPLOYEE TABLE
//     if (branch_id || department_id || designation_id) {
//       const updateData = {};
//       if (branch_id) updateData.branch_id = branch_id;
//       if (department_id) updateData.department_id = department_id;
//       if (designation_id) updateData.designation_id = designation_id; // 🟢 ADDED DESIGNATION UPDATE
//       updateData.updated_at = new Date();

//       await Employee.update(updateData, {
//         where: { employee_id: String(employee_id), deleted_at: null }
//       });

//       console.log('✅ Employee branch/department/designation updated successfully');
//     }

//     const data = await formatTransferResponse(transfer);
//     console.log('✅ Transfer created successfully');
//     return res.status(201).json({ success: false, message: 'Transfer created', data });
//   } catch (err) {
//     console.error('❌ Create Transfer Error:', err);
//     return res.status(500).json({ success: false, message: 'Server error', error: err.message });
//   }
// };

// // =====================
// // 🔹 GET ALL TRANSFERS
// // =====================
// exports.getAllTransfers = async (req, res) => {
//   try {
//     console.log('🎯 START getAllTransfers');
//     console.log('🔍 User Info - ID:', req.user.id, 'Type:', req.user.type);

//     // 🟢 SUPER ADMIN: Full access
//     if (isSuper(req)) {
//       console.log('🟡 Super Admin Access');
//       const transfers = await Transfer.findAll({
//         where: { deleted_at: null },
//         order: [['id', 'DESC']],
//       });
//       console.log('🟡 Super Admin Transfers Count:', transfers.length);
//       const data = await Promise.all(transfers.map(t => formatTransferResponse(t)));
//       return res.json({ success: true, data });
//     }

//     // 🟢 Check if user exists in employees table (has branch)
//     const userEmployeeRecord = await Employee.findOne({
//       where: { user_id: req.user.id },
//       attributes: ['branch_id', 'created_by'],
//       raw: true,
//     });

//     console.log('🔍 User Employee Record:', userEmployeeRecord);

//     let transfers = [];

//     if (userEmployeeRecord && userEmployeeRecord.branch_id) {
//       // 🟢 CASE 1: User has employee record with branch → branch-level access
//       console.log('🟡 Branch User Access');
//       const branchId = userEmployeeRecord.branch_id;
//       console.log('🔍 Branch ID:', branchId);
      
//       // Get company ID for branch users
//       const companyId = await getCompanyId(req);
//       console.log('🔍 Company ID for Branch User:', companyId);
      
//       if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

//       // 🟢 STEP 1: Get ALL EMPLOYEES in the same branch under this company
//       const branchEmployees = await Employee.findAll({
//         where: {
//           branch_id: branchId,
//           deleted_at: null,
//         },
//         attributes: ['employee_id'],
//         raw: true,
//       });

//       const branchEmployeeIds = branchEmployees.map(e => String(e.employee_id));
//       console.log('🔍 Branch Employee IDs:', branchEmployeeIds);

//       // 🟢 STEP 2: Fetch transfers for employees in the same branch
//       transfers = await Transfer.findAll({
//         where: {
//           deleted_at: null,
//           employee_id: { [Op.in]: branchEmployeeIds },
//         },
//         order: [['id', 'DESC']],
//       });

//     } else {
//       // 🟢 CASE 2: User doesn't have employee record (no branch) → FULL DATABASE ACCESS
//       console.log('🟡 Branchless User Access (FULL DATABASE)');
      
//       // 🟢 DIRECTLY GET ALL TRANSFERS - no company filter
//       transfers = await Transfer.findAll({
//         where: { deleted_at: null },
//         order: [['id', 'DESC']],
//       });
      
//       console.log('🔍 Branchless User - All Transfers Count:', transfers.length);
//     }

//     console.log('🔍 Final Transfers Count:', transfers.length);
//     const data = await Promise.all(transfers.map(t => formatTransferResponse(t)));
//     console.log('✅ END getAllTransfers - Success');
//     return res.json({ success: true, data });

//   } catch (err) {
//     console.error('❌ Get All Transfers Error:', err);
//     return res.status(500).json({
//       success: false,
//       message: 'Server error',
//       error: err.message,
//     });
//   }
// };

// // =====================
// // 🔹 GET TRANSFER BY ID
// // =====================
// exports.getTransferById = async (req, res) => {
//   try {
//     console.log('🎯 START getTransferById');
//     console.log('🔍 User Info - ID:', req.user.id, 'Type:', req.user.type);
    
//     const transfer = await Transfer.findOne({
//       where: { id: req.params.id, deleted_at: null },
//     });

//     if (!transfer) {
//       return res.status(404).json({ success: false, message: 'Transfer not found' });
//     }

//     // 🟢 Super Admin → full access
//     if (isSuper(req)) {
//       const data = await formatTransferResponse(transfer);
//       return res.json({ success: true, data });
//     }

//     // 🟢 Check if user exists in employees table (has branch)
//     const userEmployeeRecord = await Employee.findOne({
//       where: { user_id: req.user.id },
//       attributes: ['branch_id', 'created_by'],
//       raw: true,
//     });

//     console.log('🔍 User Employee Record:', userEmployeeRecord);

//     if (userEmployeeRecord && userEmployeeRecord.branch_id) {
//       // 🟢 CASE 1: User has employee record with branch → branch-level access
//       const companyId = await getCompanyId(req);
//       if (!companyId) {
//         return res.status(403).json({ success: false, message: 'Unauthorized' });
//       }

//       // 🟢 STEP 1: Get the employee linked to the transfer
//       const transferEmployee = await Employee.findOne({
//         where: { employee_id: String(transfer.employee_id), deleted_at: null },
//         raw: true,
//       });

//       if (!transferEmployee) {
//         return res.status(404).json({ success: false, message: 'Employee linked to transfer not found' });
//       }

//       // 🟢 STEP 2: Check if the transfer employee belongs to the same branch as the current user
//       const employeeBranchId = transferEmployee.branch_id || null;
      
//       console.log('🔍 Transfer Employee Branch ID:', employeeBranchId);
//       console.log('🔍 Current User Branch ID:', userEmployeeRecord.branch_id);

//       if (String(employeeBranchId) !== String(userEmployeeRecord.branch_id)) {
//         return res.status(403).json({ success: false, message: 'Forbidden: transfer belongs to different branch' });
//       }

//     } else {
//       // 🟢 CASE 2: User doesn't have employee record (no branch) → FULL ACCESS
//       console.log('🟡 Branchless User - Full transfer access');
//       // No additional checks needed - branchless users can access any transfer
//     }

//     // ✅ Return formatted transfer
//     const data = await formatTransferResponse(transfer);
//     console.log('✅ END getTransferById - Success');
//     return res.json({ success: true, data });

//   } catch (err) {
//     console.error('❌ Get Transfer By ID Error:', err);
//     return res.status(500).json({
//       success: false,
//       message: 'Server error',
//       error: err.message,
//     });
//   }
// };

// // =====================
// // 🔹 UPDATE TRANSFER
// // =====================
// // exports.updateTransfer = async (req, res) => {
// //   try {
// //     console.log('🎯 START updateTransfer');
// //     console.log('🔍 User Info - ID:', req.user.id, 'Type:', req.user.type);
    
// //     const { id } = req.params;
// //     const { employee_id, branch_id, department_id, transfer_date, description } = req.body;

// //     const companyId = await getCompanyId(req);
// //     if (!companyId && !isSuper(req))
// //       return res
// //         .status(403)
// //         .json({ success: false, message: 'Unauthorized' });

// //     // 🟢 Check if user exists in employees table (has branch)
// //     const userEmployeeRecord = await Employee.findOne({
// //       where: { user_id: req.user.id },
// //       attributes: ['branch_id', 'created_by'],
// //       raw: true,
// //     });

// //     console.log('🔍 User Employee Record:', userEmployeeRecord);

// //     let userBranchId = null;

// //     if (userEmployeeRecord && userEmployeeRecord.branch_id) {
// //       // 🟢 CASE 1: User has employee record with branch → branch-level access
// //       console.log('🟡 Branch User - Updating transfer');
// //       userBranchId = userEmployeeRecord.branch_id;
// //     } else {
// //       // 🟢 CASE 2: User doesn't have employee record (no branch) → company-wide access
// //       console.log('🟡 Branchless User - Updating transfer');
// //       // No branch restriction for branchless users
// //     }

// //     const transfer = await Transfer.findOne({
// //       where: { id, deleted_at: null },
// //     });
// //     if (!transfer)
// //       return res
// //         .status(404)
// //         .json({ success: false, message: 'Transfer not found' });

// //     const transferEmployee = await Employee.findOne({
// //       where: { employee_id: String(transfer.employee_id), deleted_at: null },
// //     });

// //     // Determine allowed creators within company/branch
// //     const allowedUserIds = await getAllUserIdsUnderCompanyBranch(companyId, isCompany(req) ? null : userBranchId);

// //     // 🟢 Access validation
// //     if (!isSuper(req)) {
// //       if (
// //         !transferEmployee ||
// //         !allowedUserIds.map(String).includes(String(transferEmployee.created_by))
// //       ) {
// //         return res.status(403).json({
// //           success: false,
// //           message: 'Forbidden: not your branch/company record',
// //         });
// //       }

// //       if (userEmployeeRecord && userEmployeeRecord.branch_id && !isCompany(req) && !isEmployee(req)) {
// //         // branch-level user: employee must be in same branch
// //         if (String(transferEmployee.branch_id) !== String(userBranchId)) {
// //           return res.status(403).json({
// //             success: false,
// //             message: 'Forbidden: different branch',
// //           });
// //         }
// //       }
// //     }

// //     // Employee users can only update transfers for themselves
// //     if (isEmployee(req)) {
// //       const self = await Employee.findOne({ where: { user_id: req.user.id, deleted_at: null } });
// //       if (!self || String(self.employee_id) !== String(transfer.employee_id)) {
// //         return res.status(403).json({ success: false, message: 'Employees can only update their own transfers' });
// //       }
// //     }

// //     // Validate branch belongs to the company (if branch_id is being updated)
// //     if (branch_id && branch_id !== transfer.branch_id) {
// //       const branchRecord = await Branch.findOne({
// //         where: { id: branch_id, deleted_at: null }
// //       });
// //       if (!branchRecord) {
// //         return res.status(400).json({ success: false, message: 'Invalid branch' });
// //       }
// //     }

// //     // Validate department belongs to the company (if department_id is being updated)
// //     if (department_id && department_id !== transfer.department_id) {
// //       const departmentRecord = await Department.findOne({
// //         where: { id: department_id, deleted_at: null }
// //       });
// //       if (!departmentRecord) {
// //         return res.status(400).json({ success: false, message: 'Invalid department' });
// //       }
// //     }

// //     // 🟢 Perform update
// //     await transfer.update({
// //       employee_id: employee_id ?? transfer.employee_id,
// //       branch_id: branch_id ?? transfer.branch_id,
// //       department_id: department_id ?? transfer.department_id,
// //       transfer_date: transfer_date ?? transfer.transfer_date,
// //       description: description ?? transfer.description,
// //       updated_at: new Date(),
// //     });

// //     const data = await formatTransferResponse(transfer);
// //     console.log('✅ Transfer updated successfully');
// //     return res.json({
// //       success: true,
// //       message: 'Transfer updated successfully',
// //       data,
// //     });
// //   } catch (err) {
// //     console.error('❌ Update Transfer Error:', err);
// //     return res
// //       .status(500)
// //       .json({ success: false, message: 'Server error', error: err.message });
// //   }
// // };

// exports.updateTransfer = async (req, res) => {
//   try {
//     console.log('🎯 START updateTransfer');
//     console.log('🔍 User Info - ID:', req.user.id, 'Type:', req.user.type);
    
//     const { id } = req.params;
//     const { employee_id, branch_id, department_id, designation_id, transfer_date, description } = req.body;

//     const companyId = await getCompanyId(req);
//     if (!companyId && !isSuper(req))
//       return res
//         .status(403)
//         .json({ success: false, message: 'Unauthorized' });

//     // 🟢 Check if user exists in employees table (has branch)
//     const userEmployeeRecord = await Employee.findOne({
//       where: { user_id: req.user.id },
//       attributes: ['branch_id', 'created_by'],
//       raw: true,
//     });

//     console.log('🔍 User Employee Record:', userEmployeeRecord);

//     let userBranchId = null;

//     if (userEmployeeRecord && userEmployeeRecord.branch_id) {
//       // 🟢 CASE 1: User has employee record with branch → branch-level access
//       console.log('🟡 Branch User - Updating transfer');
//       userBranchId = userEmployeeRecord.branch_id;
//     } else {
//       // 🟢 CASE 2: User doesn't have employee record (no branch) → company-wide access
//       console.log('🟡 Branchless User - Updating transfer');
//       // No branch restriction for branchless users
//     }

//     const transfer = await Transfer.findOne({
//       where: { id, deleted_at: null },
//     });
//     if (!transfer)
//       return res
//         .status(404)
//         .json({ success: false, message: 'Transfer not found' });

//     const transferEmployee = await Employee.findOne({
//       where: { employee_id: String(transfer.employee_id), deleted_at: null },
//     });

//     // Determine allowed creators within company/branch
//     const allowedUserIds = await getAllUserIdsUnderCompanyBranch(companyId, isCompany(req) ? null : userBranchId);

//     // 🟢 Access validation
//     if (!isSuper(req)) {
//       if (
//         !transferEmployee ||
//         !allowedUserIds.map(String).includes(String(transferEmployee.created_by))
//       ) {
//         return res.status(403).json({
//           success: false,
//           message: 'Forbidden: not your branch/company record',
//         });
//       }

//       if (userEmployeeRecord && userEmployeeRecord.branch_id && !isCompany(req) && !isEmployee(req)) {
//         // branch-level user: employee must be in same branch
//         if (String(transferEmployee.branch_id) !== String(userBranchId)) {
//           return res.status(403).json({
//             success: false,
//             message: 'Forbidden: different branch',
//           });
//         }
//       }
//     }

//     // Employee users can only update transfers for themselves
//     if (isEmployee(req)) {
//       const self = await Employee.findOne({ where: { user_id: req.user.id, deleted_at: null } });
//       if (!self || String(self.employee_id) !== String(transfer.employee_id)) {
//         return res.status(403).json({ success: false, message: 'Employees can only update their own transfers' });
//       }
//     }

//     // Validate branch belongs to the company (if branch_id is being updated)
//     if (branch_id && branch_id !== transfer.branch_id) {
//       const branchRecord = await Branch.findOne({
//         where: { id: branch_id, deleted_at: null }
//       });
//       if (!branchRecord) {
//         return res.status(400).json({ success: false, message: 'Invalid branch' });
//       }
//     }

//     // Validate department belongs to the company (if department_id is being updated)
//     if (department_id && department_id !== transfer.department_id) {
//       const departmentRecord = await Department.findOne({
//         where: { id: department_id, deleted_at: null }
//       });
//       if (!departmentRecord) {
//         return res.status(400).json({ success: false, message: 'Invalid department' });
//       }
//     }

//     // 🟢 Validate designation belongs to the company (if designation_id is being updated)
//     if (designation_id && designation_id !== transfer.designation_id) {
//       const designationRecord = await Designation.findOne({
//         where: { id: designation_id, deleted_at: null }
//       });
//       if (!designationRecord) {
//         return res.status(400).json({ success: false, message: 'Invalid designation' });
//       }
//     }

//     // 🟢 Store old values before update to check if employee record needs update
//     const oldBranchId = transfer.branch_id;
//     const oldDepartmentId = transfer.department_id;
//     const oldDesignationId = transfer.designation_id; // 🟢 ADDED DESIGNATION TRACKING
//     const currentEmployeeId = transfer.employee_id;

//     console.log('🔍 Before Update - Old Branch:', oldBranchId, 'Old Department:', oldDepartmentId, 'Old Designation:', oldDesignationId);
//     console.log('🔍 Update Request - New Branch:', branch_id, 'New Department:', department_id, 'New Designation:', designation_id);

//     // 🟢 Perform transfer update
//     await transfer.update({
//       employee_id: employee_id ?? transfer.employee_id,
//       branch_id: branch_id ?? transfer.branch_id,
//       department_id: department_id ?? transfer.department_id,
//       designation_id: designation_id ?? transfer.designation_id, // 🟢 ADDED DESIGNATION UPDATE
//       transfer_date: transfer_date ?? transfer.transfer_date,
//       description: description ?? transfer.description,
//       updated_at: new Date(),
//     });

//     // 🟢 UPDATE EMPLOYEE'S BRANCH, DEPARTMENT AND DESIGNATION IN EMPLOYEE TABLE
//     // Determine which employee record to update
//     const targetEmployeeId = employee_id ? String(employee_id) : currentEmployeeId;
    
//     // Check if branch, department or designation actually changed
//     const branchChanged = branch_id !== undefined && branch_id !== null && branch_id !== oldBranchId;
//     const departmentChanged = department_id !== undefined && department_id !== null && department_id !== oldDepartmentId;
//     const designationChanged = designation_id !== undefined && designation_id !== null && designation_id !== oldDesignationId; // 🟢 ADDED DESIGNATION CHECK

//     console.log('🔍 Changes Detected - Branch Changed:', branchChanged, 'Department Changed:', departmentChanged, 'Designation Changed:', designationChanged);
//     console.log('🔍 Target Employee ID:', targetEmployeeId);

//     if (branchChanged || departmentChanged || designationChanged) {
//       const updateData = {};
      
//       if (branchChanged) {
//         updateData.branch_id = branch_id;
//         console.log('🔄 Updating employee branch to:', branch_id);
//       }
      
//       if (departmentChanged) {
//         updateData.department_id = department_id;
//         console.log('🔄 Updating employee department to:', department_id);
//       }

//       if (designationChanged) {
//         updateData.designation_id = designation_id; // 🟢 ADDED DESIGNATION UPDATE
//         console.log('🔄 Updating employee designation to:', designation_id);
//       }
      
//       updateData.updated_at = new Date();

//       // Update the employee record
//       const updateResult = await Employee.update(updateData, {
//         where: { employee_id: targetEmployeeId, deleted_at: null }
//       });

//       console.log('✅ Employee update result:', updateResult);
      
//       if (updateResult[0] > 0) {
//         console.log('✅ Employee branch/department/designation updated successfully');
        
//         // Verify the update
//         const updatedEmployee = await Employee.findOne({
//           where: { employee_id: targetEmployeeId, deleted_at: null },
//           attributes: ['employee_id', 'branch_id', 'department_id', 'designation_id']
//         });
        
//         if (updatedEmployee) {
//           console.log('✅ Verification - Employee current branch:', updatedEmployee.branch_id, 'department:', updatedEmployee.department_id, 'designation:', updatedEmployee.designation_id);
//         }
//       } else {
//         console.log('⚠️ No employee record found to update');
//       }
//     } else {
//       console.log('🟡 No branch/department/designation changes detected, skipping employee update');
//     }

//     const data = await formatTransferResponse(transfer);
//     console.log('✅ Transfer updated successfully');
//     return res.json({
//       success: true,
//       message: 'Transfer updated successfully',
//       data,
//     });
//   } catch (err) {
//     console.error('❌ Update Transfer Error:', err);
//     return res
//       .status(500)
//       .json({ success: false, message: 'Server error', error: err.message });
//   }
// };

// // =====================
// // 🔹 DELETE TRANSFER (soft delete)
// // =====================
// exports.deleteTransfer = async (req, res) => {
//   try {
//     console.log('🎯 START deleteTransfer');
//     console.log('🔍 User Info - ID:', req.user.id, 'Type:', req.user.type);
    
//     const { id } = req.params;

//     const companyId = await getCompanyId(req);
//     if (!companyId && !isSuper(req))
//       return res
//         .status(403)
//         .json({ success: false, message: 'Unauthorized' });

//     // 🟢 Check if user exists in employees table (has branch)
//     const userEmployeeRecord = await Employee.findOne({
//       where: { user_id: req.user.id },
//       attributes: ['branch_id', 'created_by'],
//       raw: true,
//     });

//     console.log('🔍 User Employee Record:', userEmployeeRecord);

//     let branchId = null;

//     if (userEmployeeRecord && userEmployeeRecord.branch_id) {
//       // 🟢 CASE 1: User has employee record with branch → branch-level access
//       branchId = userEmployeeRecord.branch_id;
//     } else {
//       // 🟢 CASE 2: User doesn't have employee record (no branch) → company-wide access
//       console.log('🟡 Branchless User - Deleting transfer');
//     }

//     const transfer = await Transfer.findOne({
//       where: { id, deleted_at: null },
//     });
//     if (!transfer)
//       return res
//         .status(404)
//         .json({ success: false, message: 'Transfer not found' });

//     const transferEmployee = await Employee.findOne({
//       where: { employee_id: String(transfer.employee_id), deleted_at: null },
//     });

//     const allowedUserIds = await getAllUserIdsUnderCompanyBranch(
//       companyId,
//       isCompany(req) ? null : branchId
//     );

//     // 🟢 Access validation
//     if (!isSuper(req)) {
//       if (
//         !transferEmployee ||
//         !allowedUserIds.map(String).includes(String(transferEmployee.created_by))
//       ) {
//         return res.status(403).json({
//           success: false,
//           message: 'Forbidden: not your branch/company record',
//         });
//       }
//       if (!isCompany(req) && branchId !== null) {
//         if (String(transferEmployee.branch_id) !== String(branchId)) {
//           return res.status(403).json({
//             success: false,
//             message: 'Forbidden: different branch',
//           });
//         }
//       }
//     }

//     await transfer.destroy();
//     console.log('✅ Transfer deleted successfully');
//     return res.json({
//       success: true,
//       message: 'Transfer deleted successfully',
//       data: { id },
//     });
//   } catch (err) {
//     console.error('❌ Delete Transfer Error:', err);
//     return res
//       .status(500)
//       .json({ success: false, message: 'Server error', error: err.message });
//   }
// };







// controllers/transfer.controller.js
const { Op } = require('sequelize');
const Transfer = require('../models/transfer.model');
const Employee = require('../models/employee.model');
const Branch = require('../models/branch.model');
const Department = require('../models/department.model');
const Designation = require('../models/designation.model');
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
// ???? Format Transfer Response
// =====================
const formatTransferResponse = async (transfer) => {
  if (!transfer) return null;
  const json = transfer.toJSON ? transfer.toJSON() : transfer;

  // Get employee details
  const employee = await Employee.findOne({
    where: { employee_id: String(json.employee_id), deleted_at: null },
    attributes: ['id', 'employee_id', 'name', 'branch_id', 'department_id', 'designation_id'],
    raw: true
  });

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

  // ???? Get designation details
  let designation = null;
  if (json.designation_id) {
    const desig = await Designation.findByPk(json.designation_id, { raw: true });
    if (desig) designation = { id: desig.id, name: desig.name };
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
      designation_id: employee.designation_id // ???? ADDED DESIGNATION
    } : null,
    branch_id: json.branch_id,
    branch: branch,
    department_id: json.department_id,
    department: department,
    designation_id: json.designation_id, // ???? ADDED DESIGNATION
    designation: designation, // ???? ADDED DESIGNATION
    transfer_date: json.transfer_date,
    description: json.description,
    created_by: json.created_by,
    created_at: json.created_at,
    updated_at: json.updated_at
  };
};

// =====================
// ???? CREATE TRANSFER
// =====================
// exports.createTransfer = async (req, res) => {
//   try {
//     console.log('???? START createTransfer');
//     console.log('???? User Info - ID:', req.user.id, 'Type:', req.user.type);
    
//     const { employee_id, branch_id, department_id, transfer_date, description } = req.body;
//     if (!employee_id) {
//       return res.status(400).json({ success: false, message: 'employee_id is required' });
//     }

//     const companyId = await getCompanyId(req);
//     if (!companyId && !isSuper(req)) return res.status(403).json({ success: false, message: 'Unauthorized' });

//     // ???? Check if user exists in employees table (has branch)
//     const userEmployeeRecord = await Employee.findOne({
//       where: { user_id: req.user.id },
//       attributes: ['branch_id', 'created_by'],
//       raw: true,
//     });

//     console.log('???? User Employee Record:', userEmployeeRecord);

//     let userBranchId = null;

//     if (userEmployeeRecord && userEmployeeRecord.branch_id) {
//       // ???? CASE 1: User has employee record with branch ? branch-level access
//       console.log('???? Branch User - Creating transfer');
//       userBranchId = userEmployeeRecord.branch_id;
//     } else {
//       // ???? CASE 2: User doesn't have employee record (no branch) ? company-wide access
//       console.log('???? Branchless User - Creating transfer');
//       // No branch restriction for branchless users
//     }

//     // ???? FIX: Only require branch for branch users, not branchless users
//     if (!isCompany(req) && !isSuper(req) && userEmployeeRecord && !userBranchId && !isEmployee(req)) {
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

//       if (userEmployeeRecord && userEmployeeRecord.branch_id && !isCompany(req) && !isEmployee(req)) {
//         // branch-level user: employee must be in same branch
//         if (String(employeeRecord.branch_id) !== String(userBranchId)) {
//           return res.status(403).json({ success: false, message: 'Employee not in your branch' });
//         }
//       }
//     }

//     // Employee users can only create transfers for themselves
//     if (isEmployee(req)) {
//       const self = await Employee.findOne({ where: { user_id: req.user.id, deleted_at: null } });
//       if (!self || String(self.employee_id) !== String(employee_id)) {
//         return res.status(403).json({ success: false, message: 'Employees can only create transfers for themselves' });
//       }
//     }

//     // Validate branch belongs to the company
//     if (branch_id) {
//       const branchRecord = await Branch.findOne({
//         where: { id: branch_id, deleted_at: null }
//       });
//       if (!branchRecord) {
//         return res.status(400).json({ success: false, message: 'Invalid branch' });
//       }
//     }

//     // Validate department belongs to the company
//     if (department_id) {
//       const departmentRecord = await Department.findOne({
//         where: { id: department_id, deleted_at: null }
//       });
//       if (!departmentRecord) {
//         return res.status(400).json({ success: false, message: 'Invalid department' });
//       }
//     }

//     // Create transfer
//     const transfer = await Transfer.create({
//       employee_id: String(employee_id),
//       branch_id: branch_id || null,
//       department_id: department_id || null,
//       transfer_date: transfer_date || new Date(),
//       description: description || null,
//       created_by: req.user.id,
//       created_at: new Date(),
//       updated_at: new Date()
//     });

//     const data = await formatTransferResponse(transfer);
//     console.log('? Transfer created successfully');
//     return res.status(201).json({ success: true, message: 'Transfer created', data });
//   } catch (err) {
//     console.error('? Create Transfer Error:', err);
//     return res.status(500).json({ success: false, message: 'Server error', error: err.message });
//   }
// };


exports.createTransfer = async (req, res) => {
  try {
    console.log('???? START createTransfer');
    console.log('???? User Info - ID:', req.user.id, 'Type:', req.user.type);
    
    const { employee_id, branch_id, department_id, designation_id, transfer_date, description } = req.body;
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
      console.log('???? Branch User - Creating transfer');
      userBranchId = userEmployeeRecord.branch_id;
    } else {
      // ???? CASE 2: User doesn't have employee record (no branch) ? company-wide access
      console.log('???? Branchless User - Creating transfer');
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

    // Employee users can only create transfers for themselves
    if (isEmployee(req)) {
      const self = await Employee.findOne({ where: { user_id: req.user.id, deleted_at: null } });
      if (!self || String(self.employee_id) !== String(employee_id)) {
        return res.status(403).json({ success: false, message: 'Employees can only create transfers for themselves' });
      }
    }

    // Validate branch belongs to the company
    if (branch_id) {
      const branchRecord = await Branch.findOne({
        where: { id: branch_id, deleted_at: null }
      });
      if (!branchRecord) {
        return res.status(400).json({ success: false, message: 'Invalid branch' });
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
    }

    // ???? Validate designation belongs to the company
    if (designation_id) {
      const designationRecord = await Designation.findOne({
        where: { id: designation_id, deleted_at: null }
      });
      if (!designationRecord) {
        return res.status(400).json({ success: false, message: 'Invalid designation' });
      }
    }

    // ???? CREATE TRANSFER RECORD
    const transfer = await Transfer.create({
      employee_id: String(employee_id),
      branch_id: branch_id || null,
      department_id: department_id || null,
      designation_id: designation_id || null, // ???? ADDED DESIGNATION FIELD
      transfer_date: transfer_date || new Date(),
      description: description || null,
      created_by: req.user.id,
      created_at: new Date(),
      updated_at: new Date()
    });

    // ???? UPDATE EMPLOYEE'S BRANCH, DEPARTMENT AND DESIGNATION IN EMPLOYEE TABLE
    if (branch_id || department_id || designation_id) {
      const updateData = {};
      if (branch_id) updateData.branch_id = branch_id;
      if (department_id) updateData.department_id = department_id;
      if (designation_id) updateData.designation_id = designation_id; // ???? ADDED DESIGNATION UPDATE
      updateData.updated_at = new Date();

      await Employee.update(updateData, {
        where: { employee_id: String(employee_id), deleted_at: null }
      });

      console.log('? Employee branch/department/designation updated successfully');
    }

    const data = await formatTransferResponse(transfer);
    console.log('? Transfer created successfully');
    return res.status(201).json({ success: false, message: 'Transfer created', data });
  } catch (err) {
    console.error('? Create Transfer Error:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// =====================
// ???? GET ALL TRANSFERS
// =====================
exports.getAllTransfers = async (req, res) => {
  try {
    console.log('???? START getAllTransfers');
    console.log('???? User Info - ID:', req.user.id, 'Type:', req.user.type);

    // ???? SUPER ADMIN: Full access
    if (isSuper(req)) {
      console.log('???? Super Admin Access');
      const transfers = await Transfer.findAll({
        where: { deleted_at: null },
        order: [['id', 'DESC']],
      });
      console.log('???? Super Admin Transfers Count:', transfers.length);
      const data = await Promise.all(transfers.map(t => formatTransferResponse(t)));
      return res.json({ success: true, data });
    }

    // ???? Check if user exists in employees table (has branch)
    const userEmployeeRecord = await Employee.findOne({
      where: { user_id: req.user.id },
      attributes: ['branch_id', 'created_by'],
      raw: true,
    });

    console.log('???? User Employee Record:', userEmployeeRecord);

    let transfers = [];

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

      // ???? STEP 2: Fetch transfers for employees in the same branch
      transfers = await Transfer.findAll({
        where: {
          deleted_at: null,
          employee_id: { [Op.in]: branchEmployeeIds },
        },
        order: [['id', 'DESC']],
      });

    } else {
      // ???? CASE 2: User doesn't have employee record (no branch) ? FULL DATABASE ACCESS
      console.log('???? Branchless User Access (FULL DATABASE)');
      
      // ???? DIRECTLY GET ALL TRANSFERS - no company filter
      transfers = await Transfer.findAll({
        where: { deleted_at: null },
        order: [['id', 'DESC']],
      });
      
      console.log('???? Branchless User - All Transfers Count:', transfers.length);
    }

    console.log('???? Final Transfers Count:', transfers.length);
    const data = await Promise.all(transfers.map(t => formatTransferResponse(t)));
    console.log('? END getAllTransfers - Success');
    return res.json({ success: true, data });

  } catch (err) {
    console.error('? Get All Transfers Error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message,
    });
  }
};

// =====================
// ???? GET TRANSFER BY ID
// =====================
exports.getTransferById = async (req, res) => {
  try {
    console.log('???? START getTransferById');
    console.log('???? User Info - ID:', req.user.id, 'Type:', req.user.type);
    
    const transfer = await Transfer.findOne({
      where: { id: req.params.id, deleted_at: null },
    });

    if (!transfer) {
      return res.status(404).json({ success: false, message: 'Transfer not found' });
    }

    // ???? Super Admin ? full access
    if (isSuper(req)) {
      const data = await formatTransferResponse(transfer);
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

      // ???? STEP 1: Get the employee linked to the transfer
      const transferEmployee = await Employee.findOne({
        where: { employee_id: String(transfer.employee_id), deleted_at: null },
        raw: true,
      });

      if (!transferEmployee) {
        return res.status(404).json({ success: false, message: 'Employee linked to transfer not found' });
      }

      // ???? STEP 2: Check if the transfer employee belongs to the same branch as the current user
      const employeeBranchId = transferEmployee.branch_id || null;
      
      console.log('???? Transfer Employee Branch ID:', employeeBranchId);
      console.log('???? Current User Branch ID:', userEmployeeRecord.branch_id);

      if (String(employeeBranchId) !== String(userEmployeeRecord.branch_id)) {
        return res.status(403).json({ success: false, message: 'Forbidden: transfer belongs to different branch' });
      }

    } else {
      // ???? CASE 2: User doesn't have employee record (no branch) ? FULL ACCESS
      console.log('???? Branchless User - Full transfer access');
      // No additional checks needed - branchless users can access any transfer
    }

    // ? Return formatted transfer
    const data = await formatTransferResponse(transfer);
    console.log('? END getTransferById - Success');
    return res.json({ success: true, data });

  } catch (err) {
    console.error('? Get Transfer By ID Error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message,
    });
  }
};

// =====================
// ???? UPDATE TRANSFER
// =====================
// exports.updateTransfer = async (req, res) => {
//   try {
//     console.log('???? START updateTransfer');
//     console.log('???? User Info - ID:', req.user.id, 'Type:', req.user.type);
    
//     const { id } = req.params;
//     const { employee_id, branch_id, department_id, transfer_date, description } = req.body;

//     const companyId = await getCompanyId(req);
//     if (!companyId && !isSuper(req))
//       return res
//         .status(403)
//         .json({ success: false, message: 'Unauthorized' });

//     // ???? Check if user exists in employees table (has branch)
//     const userEmployeeRecord = await Employee.findOne({
//       where: { user_id: req.user.id },
//       attributes: ['branch_id', 'created_by'],
//       raw: true,
//     });

//     console.log('???? User Employee Record:', userEmployeeRecord);

//     let userBranchId = null;

//     if (userEmployeeRecord && userEmployeeRecord.branch_id) {
//       // ???? CASE 1: User has employee record with branch ? branch-level access
//       console.log('???? Branch User - Updating transfer');
//       userBranchId = userEmployeeRecord.branch_id;
//     } else {
//       // ???? CASE 2: User doesn't have employee record (no branch) ? company-wide access
//       console.log('???? Branchless User - Updating transfer');
//       // No branch restriction for branchless users
//     }

//     const transfer = await Transfer.findOne({
//       where: { id, deleted_at: null },
//     });
//     if (!transfer)
//       return res
//         .status(404)
//         .json({ success: false, message: 'Transfer not found' });

//     const transferEmployee = await Employee.findOne({
//       where: { employee_id: String(transfer.employee_id), deleted_at: null },
//     });

//     // Determine allowed creators within company/branch
//     const allowedUserIds = await getAllUserIdsUnderCompanyBranch(companyId, isCompany(req) ? null : userBranchId);

//     // ???? Access validation
//     if (!isSuper(req)) {
//       if (
//         !transferEmployee ||
//         !allowedUserIds.map(String).includes(String(transferEmployee.created_by))
//       ) {
//         return res.status(403).json({
//           success: false,
//           message: 'Forbidden: not your branch/company record',
//         });
//       }

//       if (userEmployeeRecord && userEmployeeRecord.branch_id && !isCompany(req) && !isEmployee(req)) {
//         // branch-level user: employee must be in same branch
//         if (String(transferEmployee.branch_id) !== String(userBranchId)) {
//           return res.status(403).json({
//             success: false,
//             message: 'Forbidden: different branch',
//           });
//         }
//       }
//     }

//     // Employee users can only update transfers for themselves
//     if (isEmployee(req)) {
//       const self = await Employee.findOne({ where: { user_id: req.user.id, deleted_at: null } });
//       if (!self || String(self.employee_id) !== String(transfer.employee_id)) {
//         return res.status(403).json({ success: false, message: 'Employees can only update their own transfers' });
//       }
//     }

//     // Validate branch belongs to the company (if branch_id is being updated)
//     if (branch_id && branch_id !== transfer.branch_id) {
//       const branchRecord = await Branch.findOne({
//         where: { id: branch_id, deleted_at: null }
//       });
//       if (!branchRecord) {
//         return res.status(400).json({ success: false, message: 'Invalid branch' });
//       }
//     }

//     // Validate department belongs to the company (if department_id is being updated)
//     if (department_id && department_id !== transfer.department_id) {
//       const departmentRecord = await Department.findOne({
//         where: { id: department_id, deleted_at: null }
//       });
//       if (!departmentRecord) {
//         return res.status(400).json({ success: false, message: 'Invalid department' });
//       }
//     }

//     // ???? Perform update
//     await transfer.update({
//       employee_id: employee_id ?? transfer.employee_id,
//       branch_id: branch_id ?? transfer.branch_id,
//       department_id: department_id ?? transfer.department_id,
//       transfer_date: transfer_date ?? transfer.transfer_date,
//       description: description ?? transfer.description,
//       updated_at: new Date(),
//     });

//     const data = await formatTransferResponse(transfer);
//     console.log('? Transfer updated successfully');
//     return res.json({
//       success: true,
//       message: 'Transfer updated successfully',
//       data,
//     });
//   } catch (err) {
//     console.error('? Update Transfer Error:', err);
//     return res
//       .status(500)
//       .json({ success: false, message: 'Server error', error: err.message });
//   }
// };

exports.updateTransfer = async (req, res) => {
  try {
    console.log('???? START updateTransfer');
    console.log('???? User Info - ID:', req.user.id, 'Type:', req.user.type);
    
    const { id } = req.params;
    const { employee_id, branch_id, department_id, designation_id, transfer_date, description } = req.body;

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
      console.log('???? Branch User - Updating transfer');
      userBranchId = userEmployeeRecord.branch_id;
    } else {
      // ???? CASE 2: User doesn't have employee record (no branch) ? company-wide access
      console.log('???? Branchless User - Updating transfer');
      // No branch restriction for branchless users
    }

    const transfer = await Transfer.findOne({
      where: { id, deleted_at: null },
    });
    if (!transfer)
      return res
        .status(404)
        .json({ success: false, message: 'Transfer not found' });

    const transferEmployee = await Employee.findOne({
      where: { employee_id: String(transfer.employee_id), deleted_at: null },
    });

    // Determine allowed creators within company/branch
    const allowedUserIds = await getAllUserIdsUnderCompanyBranch(companyId, isCompany(req) ? null : userBranchId);

    // ???? Access validation
    if (!isSuper(req)) {
      if (
        !transferEmployee ||
        !allowedUserIds.map(String).includes(String(transferEmployee.created_by))
      ) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: not your branch/company record',
        });
      }

      if (userEmployeeRecord && userEmployeeRecord.branch_id && !isCompany(req) && !isEmployee(req)) {
        // branch-level user: employee must be in same branch
        if (String(transferEmployee.branch_id) !== String(userBranchId)) {
          return res.status(403).json({
            success: false,
            message: 'Forbidden: different branch',
          });
        }
      }
    }

    // Employee users can only update transfers for themselves
    if (isEmployee(req)) {
      const self = await Employee.findOne({ where: { user_id: req.user.id, deleted_at: null } });
      if (!self || String(self.employee_id) !== String(transfer.employee_id)) {
        return res.status(403).json({ success: false, message: 'Employees can only update their own transfers' });
      }
    }

    // Validate branch belongs to the company (if branch_id is being updated)
    if (branch_id && branch_id !== transfer.branch_id) {
      const branchRecord = await Branch.findOne({
        where: { id: branch_id, deleted_at: null }
      });
      if (!branchRecord) {
        return res.status(400).json({ success: false, message: 'Invalid branch' });
      }
    }

    // Validate department belongs to the company (if department_id is being updated)
    if (department_id && department_id !== transfer.department_id) {
      const departmentRecord = await Department.findOne({
        where: { id: department_id, deleted_at: null }
      });
      if (!departmentRecord) {
        return res.status(400).json({ success: false, message: 'Invalid department' });
      }
    }

    // ???? Validate designation belongs to the company (if designation_id is being updated)
    if (designation_id && designation_id !== transfer.designation_id) {
      const designationRecord = await Designation.findOne({
        where: { id: designation_id, deleted_at: null }
      });
      if (!designationRecord) {
        return res.status(400).json({ success: false, message: 'Invalid designation' });
      }
    }

    // ???? Store old values before update to check if employee record needs update
    const oldBranchId = transfer.branch_id;
    const oldDepartmentId = transfer.department_id;
    const oldDesignationId = transfer.designation_id; // ???? ADDED DESIGNATION TRACKING
    const currentEmployeeId = transfer.employee_id;

    console.log('???? Before Update - Old Branch:', oldBranchId, 'Old Department:', oldDepartmentId, 'Old Designation:', oldDesignationId);
    console.log('???? Update Request - New Branch:', branch_id, 'New Department:', department_id, 'New Designation:', designation_id);

    // ???? Perform transfer update
    await transfer.update({
      employee_id: employee_id ?? transfer.employee_id,
      branch_id: branch_id ?? transfer.branch_id,
      department_id: department_id ?? transfer.department_id,
      designation_id: designation_id ?? transfer.designation_id, // ???? ADDED DESIGNATION UPDATE
      transfer_date: transfer_date ?? transfer.transfer_date,
      description: description ?? transfer.description,
      updated_at: new Date(),
    });

    // ???? UPDATE EMPLOYEE'S BRANCH, DEPARTMENT AND DESIGNATION IN EMPLOYEE TABLE
    // Determine which employee record to update
    const targetEmployeeId = employee_id ? String(employee_id) : currentEmployeeId;
    
    // Check if branch, department or designation actually changed
    const branchChanged = branch_id !== undefined && branch_id !== null && branch_id !== oldBranchId;
    const departmentChanged = department_id !== undefined && department_id !== null && department_id !== oldDepartmentId;
    const designationChanged = designation_id !== undefined && designation_id !== null && designation_id !== oldDesignationId; // ???? ADDED DESIGNATION CHECK

    console.log('???? Changes Detected - Branch Changed:', branchChanged, 'Department Changed:', departmentChanged, 'Designation Changed:', designationChanged);
    console.log('???? Target Employee ID:', targetEmployeeId);

    if (branchChanged || departmentChanged || designationChanged) {
      const updateData = {};
      
      if (branchChanged) {
        updateData.branch_id = branch_id;
        console.log('???? Updating employee branch to:', branch_id);
      }
      
      if (departmentChanged) {
        updateData.department_id = department_id;
        console.log('???? Updating employee department to:', department_id);
      }

      if (designationChanged) {
        updateData.designation_id = designation_id; // ???? ADDED DESIGNATION UPDATE
        console.log('???? Updating employee designation to:', designation_id);
      }
      
      updateData.updated_at = new Date();

      // Update the employee record
      const updateResult = await Employee.update(updateData, {
        where: { employee_id: targetEmployeeId, deleted_at: null }
      });

      console.log('? Employee update result:', updateResult);
      
      if (updateResult[0] > 0) {
        console.log('? Employee branch/department/designation updated successfully');
        
        // Verify the update
        const updatedEmployee = await Employee.findOne({
          where: { employee_id: targetEmployeeId, deleted_at: null },
          attributes: ['employee_id', 'branch_id', 'department_id', 'designation_id']
        });
        
        if (updatedEmployee) {
          console.log('? Verification - Employee current branch:', updatedEmployee.branch_id, 'department:', updatedEmployee.department_id, 'designation:', updatedEmployee.designation_id);
        }
      } else {
        console.log('?? No employee record found to update');
      }
    } else {
      console.log('???? No branch/department/designation changes detected, skipping employee update');
    }

    const data = await formatTransferResponse(transfer);
    console.log('? Transfer updated successfully');
    return res.json({
      success: true,
      message: 'Transfer updated successfully',
      data,
    });
  } catch (err) {
    console.error('? Update Transfer Error:', err);
    return res
      .status(500)
      .json({ success: false, message: 'Server error', error: err.message });
  }
};

// =====================
// ???? DELETE TRANSFER (soft delete)
// =====================
exports.deleteTransfer = async (req, res) => {
  try {
    console.log('???? START deleteTransfer');
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
      console.log('???? Branchless User - Deleting transfer');
    }

    const transfer = await Transfer.findOne({
      where: { id, deleted_at: null },
    });
    if (!transfer)
      return res
        .status(404)
        .json({ success: false, message: 'Transfer not found' });

    const transferEmployee = await Employee.findOne({
      where: { employee_id: String(transfer.employee_id), deleted_at: null },
    });

    const allowedUserIds = await getAllUserIdsUnderCompanyBranch(
      companyId,
      isCompany(req) ? null : branchId
    );

    // ???? Access validation
    if (!isSuper(req)) {
      if (
        !transferEmployee ||
        !allowedUserIds.map(String).includes(String(transferEmployee.created_by))
      ) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: not your branch/company record',
        });
      }
      if (!isCompany(req) && branchId !== null) {
        if (String(transferEmployee.branch_id) !== String(branchId)) {
          return res.status(403).json({
            success: false,
            message: 'Forbidden: different branch',
          });
        }
      }
    }

    await transfer.destroy();
    console.log('? Transfer deleted successfully');
    return res.json({
      success: true,
      message: 'Transfer deleted successfully',
      data: { id },
    });
  } catch (err) {
    console.error('? Delete Transfer Error:', err);
    return res
      .status(500)
      .json({ success: false, message: 'Server error', error: err.message });
  }
};







