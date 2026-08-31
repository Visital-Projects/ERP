
// const { Op } = require("sequelize");
// const Designation = require("../models/designation.model");
// const Branch = require("../models/branch.model");
// const Department = require("../models/department.model");
// const Employee = require("../models/employee.model");
// const User = require("../models/user.model");

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
//   return (req.user?.roles || []).some(r => (r.name || "").toLowerCase() === "super admin");
// }

// function isCompany(req) {
//   return (req.user?.type || "").toLowerCase() === "company";
// }

// function isEmployee(req) {
//   return (req.user?.type || "").toLowerCase() === "employee";
// }

// async function getUserBranchId(userId) {
//   const emp = await Employee.findOne({
//     where: { user_id: userId },
//     attributes: ["branch_id"],
//     raw: true,
//   });
//   return emp?.branch_id || null;
// }

// async function getAllUserIdsUnderCompanyBranch(companyId, branchId) {
//   if (!companyId) return [];

//   const users = await User.findAll({
//     where: { created_by: companyId },
//     attributes: ["id"],
//     raw: true,
//   });
//   const userIds = users.map(u => Number(u.id));
//   const baseSet = new Set([Number(companyId), ...userIds]);

//   if (branchId) {
//     if (userIds.length === 0) return [Number(companyId)];
//     const emps = await Employee.findAll({
//       where: { user_id: { [Op.in]: userIds }, branch_id: branchId },
//       attributes: ["user_id"],
//       raw: true,
//     });
//     const branchUserIds = emps.map(e => Number(e.user_id));
//     return [...new Set([Number(companyId), ...branchUserIds])];
//   }

//   return Array.from(baseSet);
// }


// // exports.getAllDesignations = async (req, res) => {
// //   try {
// //     console.log('🎯 START getAllDesignations');
// //     console.log('🔍 User Info - ID:', req.user.id, 'Type:', req.user.type);

// //     // 🟢 SUPER ADMIN: Full access
// //     if (isSuper(req)) {
// //       console.log('🟡 Super Admin Access');
// //       const designations = await Designation.findAll({
// //         include: [
// //           { model: Branch, attributes: ["id", "name"] },
// //           { model: Department, attributes: ["id", "name"] },
// //         ],
// //         order: [["id", "DESC"]],
// //       });
// //       console.log('🟡 Super Admin Designations Count:', designations.length);
// //       return res.json({ success: true, data: designations });
// //     }

// //     // 🟢 Check if user exists in employees table (has branch)
// //     const userEmployeeRecord = await Employee.findOne({
// //       where: { user_id: req.user.id },
// //       attributes: ['branch_id', 'created_by'],
// //       raw: true,
// //     });

// //     console.log('🔍 User Employee Record:', userEmployeeRecord);

// //     let designations = [];

// //     if (userEmployeeRecord && userEmployeeRecord.branch_id) {
// //       // 🟢 CASE 1: User has employee record with branch → branch-level access
// //       console.log('🟡 Branch User Access');
// //       const branchId = userEmployeeRecord.branch_id;
// //       console.log('🔍 Branch ID:', branchId);
      
// //       // Get company ID for branch users
// //       const companyId = await getCompanyId(req);
// //       console.log('🔍 Company ID for Branch User:', companyId);
      
// //       if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

// //       // 🟢 Get COMPANY USERS (branchless users) - users without employee records
// //       const allCompanyUsers = await User.findAll({
// //         where: { created_by: companyId },
// //         attributes: ['id'],
// //         raw: true,
// //       });
      
// //       // Filter to get only branchless users (users without employee records)
// //       const branchlessUserIds = [];
// //       for (const user of allCompanyUsers) {
// //         const empRecord = await Employee.findOne({
// //           where: { user_id: user.id },
// //           attributes: ['id'],
// //           raw: true,
// //         });
// //         if (!empRecord) {
// //           branchlessUserIds.push(Number(user.id));
// //         }
// //       }

// //       // 🟢 Get CURRENT BRANCH USERS only
// //       const branchEmployees = await Employee.findAll({
// //         where: {
// //           created_by: companyId,
// //           branch_id: branchId,
// //         },
// //         attributes: ['user_id'],
// //         raw: true,
// //       });
// //       const currentBranchUserIds = branchEmployees.map(e => Number(e.user_id));

// //       // 🟢 Combined allowed users: companyId + branchless users + current branch users
// //       const allowedUserIds = [...new Set([
// //         Number(companyId), 
// //         ...branchlessUserIds, 
// //         ...currentBranchUserIds
// //       ])];

// //       console.log('🔍 Company ID:', companyId);
// //       console.log('🔍 Branchless User IDs:', branchlessUserIds);
// //       console.log('🔍 Current Branch User IDs:', currentBranchUserIds);
// //       console.log('🔍 Final Allowed User IDs:', allowedUserIds);

// //       // 🟢 Get designations created by allowed users OR designations assigned to current branch
// //       designations = await Designation.findAll({
// //         where: {
// //           [Op.or]: [
// //             // Designations created by company/branchless/current branch users
// //             { created_by: { [Op.in]: allowedUserIds } },
// //             // Designations specifically assigned to current branch (even if created by other branch users)
// //             { branch_id: branchId }
// //           ]
// //         },
// //         include: [
// //           { model: Branch, attributes: ["id", "name"] },
// //           { model: Department, attributes: ["id", "name"] },
// //         ],
// //         order: [["id", "DESC"]],
// //       });

// //     } else {
// //       // 🟢 CASE 2: User doesn't have employee record (no branch) → FULL DATABASE ACCESS
// //       console.log('🟡 Branchless User Access (FULL DATABASE)');
      
// //       // 🟢 DIRECTLY GET ALL DESIGNATIONS - no company filter
// //       designations = await Designation.findAll({
// //         include: [
// //           { model: Branch, attributes: ["id", "name"] },
// //           { model: Department, attributes: ["id", "name"] },
// //         ],
// //         order: [["id", "DESC"]],
// //       });
      
// //       console.log('🔍 Branchless User - All Designations Count:', designations.length);
// //     }

// //     console.log('🔍 Final Designations Count:', designations.length);
// //     console.log('✅ END getAllDesignations - Success');
// //     return res.json({ success: true, data: designations });

// //   } catch (err) {
// //     console.error("❌ Get All Designations Error:", err);
// //     return res.status(500).json({ success: false, message: "Server error", error: err.message });
// //   }
// // };
// exports.getAllDesignations = async (req, res) => {
//   try {
//     console.log('🎯 START getAllDesignations');
//     console.log('🔍 User Info - ID:', req.user.id, 'Type:', req.user.type);

//     // 🟢 SUPER ADMIN: Full access
//     if (isSuper(req)) {
//       console.log('🟡 Super Admin Access');
//       const designations = await Designation.findAll({
//         include: [
//           { model: Branch, attributes: ["id", "name"] },
//           { model: Department, attributes: ["id", "name"] },
//         ],
//         order: [["id", "DESC"]],
//       });
//       console.log('🟡 Super Admin Designations Count:', designations.length);
//       return res.json({ success: true, data: designations });
//     }

//     // 🟢 Check if user exists in employees table (has branch)
//     const userEmployeeRecord = await Employee.findOne({
//       where: { user_id: req.user.id },
//       attributes: ['branch_id', 'created_by'],
//       raw: true,
//     });

//     console.log('🔍 User Employee Record:', userEmployeeRecord);

//     let designations = [];

//     if (userEmployeeRecord && userEmployeeRecord.branch_id) {
//       // 🟢 CASE 1: User has employee record with branch → branch-level access
//       console.log('🟡 Branch User Access');
//       const branchId = userEmployeeRecord.branch_id;
//       console.log('🔍 Branch ID:', branchId);
      
//       // Get company ID for branch users
//       const companyId = await getCompanyId(req);
//       console.log('🔍 Company ID for Branch User:', companyId);
      
//       if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

//       // 🟢 Get COMPANY USERS (branchless users) - users without employee records
//       const allCompanyUsers = await User.findAll({
//         where: { created_by: companyId },
//         attributes: ['id'],
//         raw: true,
//       });
      
//       // Filter to get only branchless users (users without employee records)
//       const branchlessUserIds = [];
//       for (const user of allCompanyUsers) {
//         const empRecord = await Employee.findOne({
//           where: { user_id: user.id },
//           attributes: ['id'],
//           raw: true,
//         });
//         if (!empRecord) {
//           branchlessUserIds.push(Number(user.id));
//         }
//       }

//       // 🟢 Get CURRENT BRANCH USERS only
//       const branchEmployees = await Employee.findAll({
//         where: {
//           created_by: companyId,
//           branch_id: branchId,
//         },
//         attributes: ['user_id'],
//         raw: true,
//       });
//       const currentBranchUserIds = branchEmployees.map(e => Number(e.user_id));

//       // 🟢 Combined allowed users: companyId + branchless users + current branch users
//       const allowedUserIds = [...new Set([
//         Number(companyId), 
//         ...branchlessUserIds, 
//         ...currentBranchUserIds
//       ])];

//       console.log('🔍 Company ID:', companyId);
//       console.log('🔍 Branchless User IDs:', branchlessUserIds);
//       console.log('🔍 Current Branch User IDs:', currentBranchUserIds);
//       console.log('🔍 Final Allowed User IDs:', allowedUserIds);

//       // 🟢 Get designations with proper filtering:
//       // 1. Designations created by company/branchless/current branch users AND assigned to current branch OR no branch
//       // 2. Designations specifically assigned to current branch (regardless of creator)
//       designations = await Designation.findAll({
//         where: {
//           [Op.or]: [
//             // Case 1: Created by allowed users AND (assigned to current branch OR no branch)
//             {
//               [Op.and]: [
//                 { created_by: { [Op.in]: allowedUserIds } },
//                 { 
//                   [Op.or]: [
//                     { branch_id: branchId },
//                     { branch_id: null }
//                   ]
//                 }
//               ]
//             },
//             // Case 2: Specifically assigned to current branch (even if created by other branch users)
//             { branch_id: branchId }
//           ]
//         },
//         include: [
//           { model: Branch, attributes: ["id", "name"] },
//           { model: Department, attributes: ["id", "name"] },
//         ],
//         order: [["id", "DESC"]],
//       });

//     } else {
//       // 🟢 CASE 2: User doesn't have employee record (no branch) → FULL DATABASE ACCESS
//       console.log('🟡 Branchless User Access (FULL DATABASE)');
      
//       // 🟢 DIRECTLY GET ALL DESIGNATIONS - no company filter
//       designations = await Designation.findAll({
//         include: [
//           { model: Branch, attributes: ["id", "name"] },
//           { model: Department, attributes: ["id", "name"] },
//         ],
//         order: [["id", "DESC"]],
//       });
      
//       console.log('🔍 Branchless User - All Designations Count:', designations.length);
//     }

//     console.log('🔍 Final Designations Count:', designations.length);
//     console.log('✅ END getAllDesignations - Success');
//     return res.json({ success: true, data: designations });

//   } catch (err) {
//     console.error("❌ Get All Designations Error:", err);
//     return res.status(500).json({ success: false, message: "Server error", error: err.message });
//   }
// };


// exports.getDesignationById = async (req, res) => {
//   try {
//     const id = req.params.id;
//     const designation = await Designation.findByPk(id, {
//       include: [
//         { model: Branch, attributes: ["id", "name"] },
//         { model: Department, attributes: ["id", "name"] },
//       ],
//     });

//     if (!designation)
//       return res.status(404).json({ success: false, message: "Designation not found" });

//     // 🟢 SUPER ADMIN: Full access
//     if (isSuper(req)) {
//       return res.json({ success: true, data: designation });
//     }

//     // 🟢 Check if user exists in employees table (has branch)
//     const userEmployeeRecord = await Employee.findOne({
//       where: { user_id: req.user.id },
//       attributes: ['branch_id', 'created_by'],
//       raw: true,
//     });

//     if (userEmployeeRecord && userEmployeeRecord.branch_id) {
//       // 🟢 CASE 1: User has employee record with branch → branch-level access
//       const companyId = await getCompanyId(req);
//       if (!companyId) return res.status(403).json({ success: false, message: "Unauthorized" });

//       // 🟢 Get COMPANY USERS (branchless users)
//       const allCompanyUsers = await User.findAll({
//         where: { created_by: companyId },
//         attributes: ['id'],
//         raw: true,
//       });
      
//       const branchlessUserIds = [];
//       for (const user of allCompanyUsers) {
//         const empRecord = await Employee.findOne({
//           where: { user_id: user.id },
//           attributes: ['id'],
//           raw: true,
//         });
//         if (!empRecord) {
//           branchlessUserIds.push(Number(user.id));
//         }
//       }

//       // 🟢 Get CURRENT BRANCH USERS
//       const branchEmployees = await Employee.findAll({
//         where: {
//           created_by: companyId,
//           branch_id: userEmployeeRecord.branch_id,
//         },
//         attributes: ['user_id'],
//         raw: true,
//       });
//       const currentBranchUserIds = branchEmployees.map(e => Number(e.user_id));

//       // 🟢 Combined allowed users
//       const allowedUserIds = [...new Set([
//         Number(companyId), 
//         ...branchlessUserIds, 
//         ...currentBranchUserIds
//       ])];

//       // Check if designation is accessible
//       const isAccessible = 
//         allowedUserIds.map(String).includes(String(designation.created_by)) ||
//         designation.branch_id === userEmployeeRecord.branch_id;

//       if (!isAccessible) {
//         return res.status(404).json({ success: false, message: "Designation not found" });
//       }
//     } else {
//       // 🟢 CASE 2: User doesn't have employee record (no branch) → FULL ACCESS
//       console.log('🟡 Branchless User - Full designation access');
//     }

//     return res.json({ success: true, data: designation });
//   } catch (err) {
//     console.error("❌ Get Designation Error:", err);
//     return res.status(500).json({ success: false, message: "Server error", error: err.message });
//   }
// };


// exports.createDesignation = async (req, res) => {
//   try {
//     console.log('🎯 START createDesignation');
//     console.log('🔍 User Info - ID:', req.user.id, 'Type:', req.user.type);
    
//     const { name, department_id, branch_id } = req.body;
//     if (!name?.trim() || !department_id)
//       return res.status(400).json({ success: false, message: "Name and Department are required" });

//     // 🟢 SUPER ADMIN: Full access
//     if (isSuper(req)) {
//       console.log('🟡 Super Admin - Creating designation');
//       const designation = await Designation.create({
//         name: name.trim(),
//         department_id,
//         branch_id: branch_id || null,
//         created_by: req.user.id,
//         user_id: req.user.id || null,
//         created_at: new Date(),
//         updated_at: new Date(),
//       });
//       return res.status(201).json({ success: true, data: designation });
//     }

//     // 🟢 Check if user exists in employees table (has branch)
//     const userEmployeeRecord = await Employee.findOne({
//       where: { user_id: req.user.id },
//       attributes: ['branch_id', 'created_by'],
//       raw: true,
//     });

//     console.log('🔍 User Employee Record:', userEmployeeRecord);

//     let finalBranchId = branch_id;

//     if (userEmployeeRecord && userEmployeeRecord.branch_id) {
//       // 🟢 CASE 1: User has employee record with branch → branch-level access
//       console.log('🟡 Branch User - Creating designation');
      
//       // Get company ID for branch users
//       const companyId = await getCompanyId(req);
//       console.log('🔍 Company ID for Branch User:', companyId);
      
//       if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

//       // Branch users can only create designations for their own branch
//       finalBranchId = userEmployeeRecord.branch_id;
//     } else {
//       // 🟢 CASE 2: User doesn't have employee record (no branch) → company-wide access
//       console.log('🟡 Branchless User - Creating designation');
//       // Branchless users can create designations for any branch or no branch
//     }

//     const designation = await Designation.create({
//       name: name.trim(),
//       department_id,
//       branch_id: finalBranchId,
//       created_by: req.user.id,
//       user_id: req.user.id || null,
//       created_at: new Date(),
//       updated_at: new Date(),
//     });

//     console.log('✅ Designation created successfully');
//     return res.status(201).json({ success: true, data: designation });
//   } catch (err) {
//     console.error("❌ Create Designation Error:", err);
//     return res.status(500).json({ success: false, message: "Server error", error: err.message });
//   }
// };


// exports.updateDesignation = async (req, res) => {
//   try {
//     console.log('🎯 START updateDesignation');
//     console.log('🔍 User Info - ID:', req.user.id, 'Type:', req.user.type);
    
//     const { name, department_id, branch_id } = req.body;
//     if (!name?.trim())
//       return res.status(400).json({ success: false, message: "Name is required" });

//     const designation = await Designation.findByPk(req.params.id);
//     if (!designation)
//       return res.status(404).json({ success: false, message: "Designation not found" });

//     // 🟢 SUPER ADMIN: Full access
//     if (isSuper(req)) {
//       console.log('🟡 Super Admin - Updating designation');
//       designation.name = name.trim();
//       if (department_id) designation.department_id = department_id;
//       if (branch_id) designation.branch_id = branch_id;
//       designation.updated_at = new Date();
//       await designation.save();
//       return res.json({ success: true, data: designation });
//     }

//     // 🟢 Check if user exists in employees table (has branch)
//     const userEmployeeRecord = await Employee.findOne({
//       where: { user_id: req.user.id },
//       attributes: ['branch_id', 'created_by'],
//       raw: true,
//     });

//     if (userEmployeeRecord && userEmployeeRecord.branch_id) {
//       // 🟢 CASE 1: User has employee record with branch → branch-level access
//       const companyId = await getCompanyId(req);
//       if (!companyId) return res.status(403).json({ success: false, message: "Unauthorized" });

//       // 🟢 Get COMPANY USERS (branchless users)
//       const allCompanyUsers = await User.findAll({
//         where: { created_by: companyId },
//         attributes: ['id'],
//         raw: true,
//       });
      
//       const branchlessUserIds = [];
//       for (const user of allCompanyUsers) {
//         const empRecord = await Employee.findOne({
//           where: { user_id: user.id },
//           attributes: ['id'],
//           raw: true,
//         });
//         if (!empRecord) {
//           branchlessUserIds.push(Number(user.id));
//         }
//       }

//       // 🟢 Get CURRENT BRANCH USERS
//       const branchEmployees = await Employee.findAll({
//         where: {
//           created_by: companyId,
//           branch_id: userEmployeeRecord.branch_id,
//         },
//         attributes: ['user_id'],
//         raw: true,
//       });
//       const currentBranchUserIds = branchEmployees.map(e => Number(e.user_id));

//       // 🟢 Combined allowed users
//       const allowedUserIds = [...new Set([
//         Number(companyId), 
//         ...branchlessUserIds, 
//         ...currentBranchUserIds
//       ])];

//       // Check if designation is accessible
//       const isAccessible = 
//         allowedUserIds.map(String).includes(String(designation.created_by)) ||
//         designation.branch_id === userEmployeeRecord.branch_id;

//       if (!isAccessible) {
//         return res.status(403).json({ success: false, message: "Forbidden: not your record" });
//       }

//       // Branch users can only update branch_id to their own branch
//       if (branch_id && branch_id !== userEmployeeRecord.branch_id) {
//         return res.status(403).json({ success: false, message: "Forbidden: cannot assign to other branch" });
//       }
//     } else {
//       // 🟢 CASE 2: User doesn't have employee record (no branch) → FULL ACCESS
//       console.log('🟡 Branchless User - Updating designation');
//       // Branchless users can update any designation
//     }

//     designation.name = name.trim();
//     if (department_id) designation.department_id = department_id;
//     if (branch_id) designation.branch_id = branch_id;
//     designation.updated_at = new Date();

//     await designation.save();
//     console.log('✅ Designation updated successfully');
//     return res.json({ success: true, data: designation });
//   } catch (err) {
//     console.error("❌ Update Designation Error:", err);
//     return res.status(500).json({ success: false, message: "Server error", error: err.message });
//   }
// };


// exports.deleteDesignation = async (req, res) => {
//   try {
//     console.log('🎯 START deleteDesignation');
//     console.log('🔍 User Info - ID:', req.user.id, 'Type:', req.user.type);
    
//     const designation = await Designation.findByPk(req.params.id);
//     if (!designation)
//       return res.status(404).json({ success: false, message: "Designation not found" });

//     // 🟢 SUPER ADMIN: Full access
//     if (isSuper(req)) {
//       console.log('🟡 Super Admin - Deleting designation');
//       await designation.destroy();
//       return res.json({ success: true, message: "Designation deleted successfully" });
//     }

//     // 🟢 Check if user exists in employees table (has branch)
//     const userEmployeeRecord = await Employee.findOne({
//       where: { user_id: req.user.id },
//       attributes: ['branch_id', 'created_by'],
//       raw: true,
//     });

//     if (userEmployeeRecord && userEmployeeRecord.branch_id) {
//       // 🟢 CASE 1: User has employee record with branch → branch-level access
//       const companyId = await getCompanyId(req);
//       if (!companyId) return res.status(403).json({ success: false, message: "Unauthorized" });

//       // 🟢 Get COMPANY USERS (branchless users)
//       const allCompanyUsers = await User.findAll({
//         where: { created_by: companyId },
//         attributes: ['id'],
//         raw: true,
//       });
      
//       const branchlessUserIds = [];
//       for (const user of allCompanyUsers) {
//         const empRecord = await Employee.findOne({
//           where: { user_id: user.id },
//           attributes: ['id'],
//           raw: true,
//         });
//         if (!empRecord) {
//           branchlessUserIds.push(Number(user.id));
//         }
//       }

//       // 🟢 Get CURRENT BRANCH USERS
//       const branchEmployees = await Employee.findAll({
//         where: {
//           created_by: companyId,
//           branch_id: userEmployeeRecord.branch_id,
//         },
//         attributes: ['user_id'],
//         raw: true,
//       });
//       const currentBranchUserIds = branchEmployees.map(e => Number(e.user_id));

//       // 🟢 Combined allowed users
//       const allowedUserIds = [...new Set([
//         Number(companyId), 
//         ...branchlessUserIds, 
//         ...currentBranchUserIds
//       ])];

//       // Check if designation is accessible
//       const isAccessible = 
//         allowedUserIds.map(String).includes(String(designation.created_by)) ||
//         designation.branch_id === userEmployeeRecord.branch_id;

//       if (!isAccessible) {
//         return res.status(403).json({ success: false, message: "Forbidden: not your record" });
//       }
//     } else {
//       // 🟢 CASE 2: User doesn't have employee record (no branch) → FULL ACCESS
//       console.log('🟡 Branchless User - Deleting designation');
//       // Branchless users can delete any designation
//     }

//     await designation.destroy();
//     console.log('✅ Designation deleted successfully');
//     return res.json({ success: true, message: "Designation deleted successfully" });
//   } catch (err) {
//     console.error("❌ Delete Designation Error:", err);
//     return res.status(500).json({ success: false, message: "Server error", error: err.message });
//   }
// };


// exports.getDesignationsByDepartmentId = async (req, res) => {
//   try {
//     console.log('🎯 START getDesignationsByDepartmentId');
//     console.log('🔍 User Info - ID:', req.user.id, 'Type:', req.user.type);
    
//     const { departmentId } = req.params;
//     const companyId = await getCompanyId(req);
//     if (!companyId && !isSuper(req))
//       return res.status(403).json({ success: false, message: "Unauthorized" });

//     // 🟢 SUPER ADMIN: Full access
//     if (isSuper(req)) {
//       console.log('🟡 Super Admin - Getting designations by department');
//       const designations = await Designation.findAll({
//         where: { department_id: departmentId },
//         include: [
//           { model: Branch, attributes: ["id", "name"] },
//           { model: Department, attributes: ["id", "name"] },
//         ],
//         order: [["id", "DESC"]],
//       });
//       return res.json({ success: true, data: designations });
//     }

//     // 🟢 Check if user exists in employees table (has branch)
//     const userEmployeeRecord = await Employee.findOne({
//       where: { user_id: req.user.id },
//       attributes: ['branch_id', 'created_by'],
//       raw: true,
//     });

//     let designations = [];

//     if (userEmployeeRecord && userEmployeeRecord.branch_id) {
//       // 🟢 CASE 1: User has employee record with branch → branch-level access
//       console.log('🟡 Branch User - Getting designations by department');
      
//       // 🟢 Get COMPANY USERS (branchless users)
//       const allCompanyUsers = await User.findAll({
//         where: { created_by: companyId },
//         attributes: ['id'],
//         raw: true,
//       });
      
//       const branchlessUserIds = [];
//       for (const user of allCompanyUsers) {
//         const empRecord = await Employee.findOne({
//           where: { user_id: user.id },
//           attributes: ['id'],
//           raw: true,
//         });
//         if (!empRecord) {
//           branchlessUserIds.push(Number(user.id));
//         }
//       }

//       // 🟢 Get CURRENT BRANCH USERS
//       const branchEmployees = await Employee.findAll({
//         where: {
//           created_by: companyId,
//           branch_id: userEmployeeRecord.branch_id,
//         },
//         attributes: ['user_id'],
//         raw: true,
//       });
//       const currentBranchUserIds = branchEmployees.map(e => Number(e.user_id));

//       // 🟢 Combined allowed users
//       const allowedUserIds = [...new Set([
//         Number(companyId), 
//         ...branchlessUserIds, 
//         ...currentBranchUserIds
//       ])];

//       designations = await Designation.findAll({
//         where: {
//           department_id: departmentId,
//           [Op.or]: [
//             { created_by: { [Op.in]: allowedUserIds } },
//             { branch_id: userEmployeeRecord.branch_id }
//           ]
//         },
//         include: [
//           { model: Branch, attributes: ["id", "name"] },
//           { model: Department, attributes: ["id", "name"] },
//         ],
//         order: [["id", "DESC"]],
//       });

//     } else {
//       // 🟢 CASE 2: User doesn't have employee record (no branch) → FULL DATABASE ACCESS
//       console.log('🟡 Branchless User - Getting designations by department');
      
//       designations = await Designation.findAll({
//         where: { department_id: departmentId },
//         include: [
//           { model: Branch, attributes: ["id", "name"] },
//           { model: Department, attributes: ["id", "name"] },
//         ],
//         order: [["id", "DESC"]],
//       });
//     }

//     console.log('🔍 Final Designations Count by Department:', designations.length);
//     console.log('✅ END getDesignationsByDepartmentId - Success');
//     return res.json({ success: true, data: designations });
//   } catch (err) {
//     console.error("❌ Get Designations by Department Error:", err);
//     return res.status(500).json({ success: false, message: "Server error", error: err.message });
//   }
// };




const { Op } = require("sequelize");
const Designation = require("../models/designation.model");
const Branch = require("../models/branch.model");
const Department = require("../models/department.model");
const Employee = require("../models/employee.model");
const User = require("../models/user.model");

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
  return (req.user?.roles || []).some(r => (r.name || "").toLowerCase() === "super admin");
}

function isCompany(req) {
  return (req.user?.type || "").toLowerCase() === "company";
}

function isEmployee(req) {
  return (req.user?.type || "").toLowerCase() === "employee";
}

async function getUserBranchId(userId) {
  const emp = await Employee.findOne({
    where: { user_id: userId },
    attributes: ["branch_id"],
    raw: true,
  });
  return emp?.branch_id || null;
}

async function getAllUserIdsUnderCompanyBranch(companyId, branchId) {
  if (!companyId) return [];

  const users = await User.findAll({
    where: { created_by: companyId },
    attributes: ["id"],
    raw: true,
  });
  const userIds = users.map(u => Number(u.id));
  const baseSet = new Set([Number(companyId), ...userIds]);

  if (branchId) {
    if (userIds.length === 0) return [Number(companyId)];
    const emps = await Employee.findAll({
      where: { user_id: { [Op.in]: userIds }, branch_id: branchId },
      attributes: ["user_id"],
      raw: true,
    });
    const branchUserIds = emps.map(e => Number(e.user_id));
    return [...new Set([Number(companyId), ...branchUserIds])];
  }

  return Array.from(baseSet);
}


// exports.getAllDesignations = async (req, res) => {
//   try {
//     console.log('🎯 START getAllDesignations');
//     console.log('🔍 User Info - ID:', req.user.id, 'Type:', req.user.type);

//     // 🟢 SUPER ADMIN: Full access
//     if (isSuper(req)) {
//       console.log('🟡 Super Admin Access');
//       const designations = await Designation.findAll({
//         include: [
//           { model: Branch, attributes: ["id", "name"] },
//           { model: Department, attributes: ["id", "name"] },
//         ],
//         order: [["id", "DESC"]],
//       });
//       console.log('🟡 Super Admin Designations Count:', designations.length);
//       return res.json({ success: true, data: designations });
//     }

//     // 🟢 Check if user exists in employees table (has branch)
//     const userEmployeeRecord = await Employee.findOne({
//       where: { user_id: req.user.id },
//       attributes: ['branch_id', 'created_by'],
//       raw: true,
//     });

//     console.log('🔍 User Employee Record:', userEmployeeRecord);

//     let designations = [];

//     if (userEmployeeRecord && userEmployeeRecord.branch_id) {
//       // 🟢 CASE 1: User has employee record with branch → branch-level access
//       console.log('🟡 Branch User Access');
//       const branchId = userEmployeeRecord.branch_id;
//       console.log('🔍 Branch ID:', branchId);
      
//       // Get company ID for branch users
//       const companyId = await getCompanyId(req);
//       console.log('🔍 Company ID for Branch User:', companyId);
      
//       if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

//       // 🟢 Get COMPANY USERS (branchless users) - users without employee records
//       const allCompanyUsers = await User.findAll({
//         where: { created_by: companyId },
//         attributes: ['id'],
//         raw: true,
//       });
      
//       // Filter to get only branchless users (users without employee records)
//       const branchlessUserIds = [];
//       for (const user of allCompanyUsers) {
//         const empRecord = await Employee.findOne({
//           where: { user_id: user.id },
//           attributes: ['id'],
//           raw: true,
//         });
//         if (!empRecord) {
//           branchlessUserIds.push(Number(user.id));
//         }
//       }

//       // 🟢 Get CURRENT BRANCH USERS only
//       const branchEmployees = await Employee.findAll({
//         where: {
//           created_by: companyId,
//           branch_id: branchId,
//         },
//         attributes: ['user_id'],
//         raw: true,
//       });
//       const currentBranchUserIds = branchEmployees.map(e => Number(e.user_id));

//       // 🟢 Combined allowed users: companyId + branchless users + current branch users
//       const allowedUserIds = [...new Set([
//         Number(companyId), 
//         ...branchlessUserIds, 
//         ...currentBranchUserIds
//       ])];

//       console.log('🔍 Company ID:', companyId);
//       console.log('🔍 Branchless User IDs:', branchlessUserIds);
//       console.log('🔍 Current Branch User IDs:', currentBranchUserIds);
//       console.log('🔍 Final Allowed User IDs:', allowedUserIds);

//       // 🟢 Get designations created by allowed users OR designations assigned to current branch
//       designations = await Designation.findAll({
//         where: {
//           [Op.or]: [
//             // Designations created by company/branchless/current branch users
//             { created_by: { [Op.in]: allowedUserIds } },
//             // Designations specifically assigned to current branch (even if created by other branch users)
//             { branch_id: branchId }
//           ]
//         },
//         include: [
//           { model: Branch, attributes: ["id", "name"] },
//           { model: Department, attributes: ["id", "name"] },
//         ],
//         order: [["id", "DESC"]],
//       });

//     } else {
//       // 🟢 CASE 2: User doesn't have employee record (no branch) → FULL DATABASE ACCESS
//       console.log('🟡 Branchless User Access (FULL DATABASE)');
      
//       // 🟢 DIRECTLY GET ALL DESIGNATIONS - no company filter
//       designations = await Designation.findAll({
//         include: [
//           { model: Branch, attributes: ["id", "name"] },
//           { model: Department, attributes: ["id", "name"] },
//         ],
//         order: [["id", "DESC"]],
//       });
      
//       console.log('🔍 Branchless User - All Designations Count:', designations.length);
//     }

//     console.log('🔍 Final Designations Count:', designations.length);
//     console.log('✅ END getAllDesignations - Success');
//     return res.json({ success: true, data: designations });

//   } catch (err) {
//     console.error("❌ Get All Designations Error:", err);
//     return res.status(500).json({ success: false, message: "Server error", error: err.message });
//   }
// };
exports.getAllDesignations = async (req, res) => {
  try {
    console.log('🎯 START getAllDesignations');
    console.log('🔍 User Info - ID:', req.user.id, 'Type:', req.user.type);

    // 🟢 SUPER ADMIN: Full access
    if (isSuper(req)) {
      console.log('🟡 Super Admin Access');
      const designations = await Designation.findAll({
        include: [
          { model: Branch, attributes: ["id", "name"] },
          { model: Department, attributes: ["id", "name"] },
        ],
        order: [["id", "DESC"]],
      });
      console.log('🟡 Super Admin Designations Count:', designations.length);
      return res.json({ success: true, data: designations });
    }

    // 🟢 Check if user exists in employees table (has branch)
    const userEmployeeRecord = await Employee.findOne({
      where: { user_id: req.user.id },
      attributes: ['branch_id', 'created_by'],
      raw: true,
    });

    console.log('🔍 User Employee Record:', userEmployeeRecord);

    let designations = [];

    if (userEmployeeRecord && userEmployeeRecord.branch_id) {
      // 🟢 CASE 1: User has employee record with branch → branch-level access
      console.log('🟡 Branch User Access');
      const branchId = userEmployeeRecord.branch_id;
      console.log('🔍 Branch ID:', branchId);
      
      // Get company ID for branch users
      const companyId = await getCompanyId(req);
      console.log('🔍 Company ID for Branch User:', companyId);
      
      if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

      // 🟢 Get COMPANY USERS (branchless users) - users without employee records
      const allCompanyUsers = await User.findAll({
        where: { created_by: companyId },
        attributes: ['id'],
        raw: true,
      });
      
      // Filter to get only branchless users (users without employee records)
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

      // 🟢 Get CURRENT BRANCH USERS only
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

      // 🟢 Get designations with proper filtering:
      // 1. Designations created by company/branchless/current branch users AND assigned to current branch OR no branch
      // 2. Designations specifically assigned to current branch (regardless of creator)
      designations = await Designation.findAll({
        where: {
          [Op.or]: [
            // Case 1: Created by allowed users AND (assigned to current branch OR no branch)
            {
              [Op.and]: [
                { created_by: { [Op.in]: allowedUserIds } },
                { 
                  [Op.or]: [
                    { branch_id: branchId },
                    { branch_id: null }
                  ]
                }
              ]
            },
            // Case 2: Specifically assigned to current branch (even if created by other branch users)
            { branch_id: branchId }
          ]
        },
        include: [
          { model: Branch, attributes: ["id", "name"] },
          { model: Department, attributes: ["id", "name"] },
        ],
        order: [["id", "DESC"]],
      });

    } else {
      // 🟢 CASE 2: User doesn't have employee record (no branch) → FULL DATABASE ACCESS
      console.log('🟡 Branchless User Access (FULL DATABASE)');
      
      // 🟢 DIRECTLY GET ALL DESIGNATIONS - no company filter
      designations = await Designation.findAll({
        include: [
          { model: Branch, attributes: ["id", "name"] },
          { model: Department, attributes: ["id", "name"] },
        ],
        order: [["id", "DESC"]],
      });
      
      console.log('🔍 Branchless User - All Designations Count:', designations.length);
    }

    console.log('🔍 Final Designations Count:', designations.length);
    console.log('✅ END getAllDesignations - Success');
    return res.json({ success: true, data: designations });

  } catch (err) {
    console.error("❌ Get All Designations Error:", err);
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};


exports.getDesignationById = async (req, res) => {
  try {
    const id = req.params.id;
    const designation = await Designation.findByPk(id, {
      include: [
        { model: Branch, attributes: ["id", "name"] },
        { model: Department, attributes: ["id", "name"] },
      ],
    });

    if (!designation)
      return res.status(404).json({ success: false, message: "Designation not found" });

    // 🟢 SUPER ADMIN: Full access
    if (isSuper(req)) {
      return res.json({ success: true, data: designation });
    }

    // 🟢 Check if user exists in employees table (has branch)
    const userEmployeeRecord = await Employee.findOne({
      where: { user_id: req.user.id },
      attributes: ['branch_id', 'created_by'],
      raw: true,
    });

    if (userEmployeeRecord && userEmployeeRecord.branch_id) {
      // 🟢 CASE 1: User has employee record with branch → branch-level access
      const companyId = await getCompanyId(req);
      if (!companyId) return res.status(403).json({ success: false, message: "Unauthorized" });

      // 🟢 Get COMPANY USERS (branchless users)
      const allCompanyUsers = await User.findAll({
        where: { created_by: companyId },
        attributes: ['id'],
        raw: true,
      });
      
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

      // 🟢 Get CURRENT BRANCH USERS
      const branchEmployees = await Employee.findAll({
        where: {
          created_by: companyId,
          branch_id: userEmployeeRecord.branch_id,
        },
        attributes: ['user_id'],
        raw: true,
      });
      const currentBranchUserIds = branchEmployees.map(e => Number(e.user_id));

      // 🟢 Combined allowed users
      const allowedUserIds = [...new Set([
        Number(companyId), 
        ...branchlessUserIds, 
        ...currentBranchUserIds
      ])];

      // Check if designation is accessible
      const isAccessible = 
        allowedUserIds.map(String).includes(String(designation.created_by)) ||
        designation.branch_id === userEmployeeRecord.branch_id;

      if (!isAccessible) {
        return res.status(404).json({ success: false, message: "Designation not found" });
      }
    } else {
      // 🟢 CASE 2: User doesn't have employee record (no branch) → FULL ACCESS
      console.log('🟡 Branchless User - Full designation access');
    }

    return res.json({ success: true, data: designation });
  } catch (err) {
    console.error("❌ Get Designation Error:", err);
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};


exports.createDesignation = async (req, res) => {
  try {
    console.log('🎯 START createDesignation');
    console.log('🔍 User Info - ID:', req.user.id, 'Type:', req.user.type);
    
    const { name, department_id, branch_id ,overtime_rate } = req.body;
    if (!name?.trim() || !department_id)
      return res.status(400).json({ success: false, message: "Name and Department are required" });
      
    const finalOvertimeRate = overtime_rate !== undefined ? Number(overtime_rate) : 1;

// if (![1, 1.5, 2].includes(finalOvertimeRate)) {
//   return res.status(400).json({
//     success: false,
//     message: "Invalid overtime_rate. Allowed values: 1, 1.5, 2"
//   });
// }


    // 🟢 SUPER ADMIN: Full access
    if (isSuper(req)) {
      console.log('🟡 Super Admin - Creating designation');
      const designation = await Designation.create({
        name: name.trim(),
        department_id,
        branch_id: branch_id || null,
        created_by: req.user.id,
        user_id: req.user.id || null,
        created_at: new Date(),
        updated_at: new Date(),
      });
      return res.status(201).json({ success: true, data: designation });
    }

    // 🟢 Check if user exists in employees table (has branch)
    const userEmployeeRecord = await Employee.findOne({
      where: { user_id: req.user.id },
      attributes: ['branch_id', 'created_by'],
      raw: true,
    });

    console.log('🔍 User Employee Record:', userEmployeeRecord);

    let finalBranchId = branch_id;

    if (userEmployeeRecord && userEmployeeRecord.branch_id) {
      // 🟢 CASE 1: User has employee record with branch → branch-level access
      console.log('🟡 Branch User - Creating designation');
      
      // Get company ID for branch users
      const companyId = await getCompanyId(req);
      console.log('🔍 Company ID for Branch User:', companyId);
      
      if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

      // Branch users can only create designations for their own branch
      finalBranchId = userEmployeeRecord.branch_id;
    } else {
      // 🟢 CASE 2: User doesn't have employee record (no branch) → company-wide access
      console.log('🟡 Branchless User - Creating designation');
      // Branchless users can create designations for any branch or no branch
    }

    const designation = await Designation.create({
      name: name.trim(),
      department_id,
      branch_id: finalBranchId,
      overtime_rate: finalOvertimeRate,
      created_by: req.user.id,
      user_id: req.user.id || null,
      created_at: new Date(),
      updated_at: new Date(),
    });

    console.log('✅ Designation created successfully');
    return res.status(201).json({ success: true, data: designation });
  } catch (err) {
    console.error("❌ Create Designation Error:", err);
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};


exports.updateDesignation = async (req, res) => {
  try {
    console.log('🎯 START updateDesignation');
    console.log('🔍 User Info - ID:', req.user.id, 'Type:', req.user.type);
    
    const { name, department_id, branch_id,overtime_rate  } = req.body;
    if (!name?.trim())
      return res.status(400).json({ success: false, message: "Name is required" });

    const designation = await Designation.findByPk(req.params.id);
    if (!designation)
      return res.status(404).json({ success: false, message: "Designation not found" });

    // 🟢 SUPER ADMIN: Full access
    if (isSuper(req)) {
      console.log('🟡 Super Admin - Updating designation');
      designation.name = name.trim();
      if (department_id) designation.department_id = department_id;
      if (branch_id) designation.branch_id = branch_id;
      designation.updated_at = new Date();
      await designation.save();
      return res.json({ success: true, data: designation });
    }
    
//     if (overtime_rate !== undefined) {
//   const rate = Number(overtime_rate);
//   if (![1, 1.5, 2].includes(rate)) {
//     return res.status(400).json({
//       success: false,
//       message: "Invalid overtime_rate. Allowed values: 1, 1.5, 2"
//     });
//   }
//   designation.overtime_rate = rate;
// }

    // 🟢 Check if user exists in employees table (has branch)
    const userEmployeeRecord = await Employee.findOne({
      where: { user_id: req.user.id },
      attributes: ['branch_id', 'created_by'],
      raw: true,
    });

    if (userEmployeeRecord && userEmployeeRecord.branch_id) {
      // 🟢 CASE 1: User has employee record with branch → branch-level access
      const companyId = await getCompanyId(req);
      if (!companyId) return res.status(403).json({ success: false, message: "Unauthorized" });

      // 🟢 Get COMPANY USERS (branchless users)
      const allCompanyUsers = await User.findAll({
        where: { created_by: companyId },
        attributes: ['id'],
        raw: true,
      });
      
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

      // 🟢 Get CURRENT BRANCH USERS
      const branchEmployees = await Employee.findAll({
        where: {
          created_by: companyId,
          branch_id: userEmployeeRecord.branch_id,
        },
        attributes: ['user_id'],
        raw: true,
      });
      const currentBranchUserIds = branchEmployees.map(e => Number(e.user_id));

      // 🟢 Combined allowed users
      const allowedUserIds = [...new Set([
        Number(companyId), 
        ...branchlessUserIds, 
        ...currentBranchUserIds
      ])];

      // Check if designation is accessible
      const isAccessible = 
        allowedUserIds.map(String).includes(String(designation.created_by)) ||
        designation.branch_id === userEmployeeRecord.branch_id;

      if (!isAccessible) {
        return res.status(403).json({ success: false, message: "Forbidden: not your record" });
      }

      // Branch users can only update branch_id to their own branch
      if (branch_id && branch_id !== userEmployeeRecord.branch_id) {
        return res.status(403).json({ success: false, message: "Forbidden: cannot assign to other branch" });
      }
    } else {
      // 🟢 CASE 2: User doesn't have employee record (no branch) → FULL ACCESS
      console.log('🟡 Branchless User - Updating designation');
      // Branchless users can update any designation
    }

    designation.name = name.trim();
    if (department_id) designation.department_id = department_id;
    if (branch_id) designation.branch_id = branch_id;
    if (overtime_rate !== undefined) {
  designation.overtime_rate = Number(overtime_rate);
}

    designation.updated_at = new Date();

    await designation.save();
    console.log('✅ Designation updated successfully');
    return res.json({ success: true, data: designation });
  } catch (err) {
    console.error("❌ Update Designation Error:", err);
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};


exports.deleteDesignation = async (req, res) => {
  try {
    console.log('🎯 START deleteDesignation');
    console.log('🔍 User Info - ID:', req.user.id, 'Type:', req.user.type);
    
    const designation = await Designation.findByPk(req.params.id);
    if (!designation)
      return res.status(404).json({ success: false, message: "Designation not found" });

    // 🟢 SUPER ADMIN: Full access
    if (isSuper(req)) {
      console.log('🟡 Super Admin - Deleting designation');
      await designation.destroy();
      return res.json({ success: true, message: "Designation deleted successfully" });
    }

    // 🟢 Check if user exists in employees table (has branch)
    const userEmployeeRecord = await Employee.findOne({
      where: { user_id: req.user.id },
      attributes: ['branch_id', 'created_by'],
      raw: true,
    });

    if (userEmployeeRecord && userEmployeeRecord.branch_id) {
      // 🟢 CASE 1: User has employee record with branch → branch-level access
      const companyId = await getCompanyId(req);
      if (!companyId) return res.status(403).json({ success: false, message: "Unauthorized" });

      // 🟢 Get COMPANY USERS (branchless users)
      const allCompanyUsers = await User.findAll({
        where: { created_by: companyId },
        attributes: ['id'],
        raw: true,
      });
      
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

      // 🟢 Get CURRENT BRANCH USERS
      const branchEmployees = await Employee.findAll({
        where: {
          created_by: companyId,
          branch_id: userEmployeeRecord.branch_id,
        },
        attributes: ['user_id'],
        raw: true,
      });
      const currentBranchUserIds = branchEmployees.map(e => Number(e.user_id));

      // 🟢 Combined allowed users
      const allowedUserIds = [...new Set([
        Number(companyId), 
        ...branchlessUserIds, 
        ...currentBranchUserIds
      ])];

      // Check if designation is accessible
      const isAccessible = 
        allowedUserIds.map(String).includes(String(designation.created_by)) ||
        designation.branch_id === userEmployeeRecord.branch_id;

      if (!isAccessible) {
        return res.status(403).json({ success: false, message: "Forbidden: not your record" });
      }
    } else {
      // 🟢 CASE 2: User doesn't have employee record (no branch) → FULL ACCESS
      console.log('🟡 Branchless User - Deleting designation');
      // Branchless users can delete any designation
    }

    await designation.destroy();
    console.log('✅ Designation deleted successfully');
    return res.json({ success: true, message: "Designation deleted successfully" });
  } catch (err) {
    console.error("❌ Delete Designation Error:", err);
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};


exports.getDesignationsByDepartmentId = async (req, res) => {
  try {
    console.log('🎯 START getDesignationsByDepartmentId');
    console.log('🔍 User Info - ID:', req.user.id, 'Type:', req.user.type);
    
    const { departmentId } = req.params;
    const companyId = await getCompanyId(req);
    if (!companyId && !isSuper(req))
      return res.status(403).json({ success: false, message: "Unauthorized" });

    // 🟢 SUPER ADMIN: Full access
    if (isSuper(req)) {
      console.log('🟡 Super Admin - Getting designations by department');
      const designations = await Designation.findAll({
        where: { department_id: departmentId },
        include: [
          { model: Branch, attributes: ["id", "name"] },
          { model: Department, attributes: ["id", "name"] },
        ],
        order: [["id", "DESC"]],
      });
      return res.json({ success: true, data: designations });
    }

    // 🟢 Check if user exists in employees table (has branch)
    const userEmployeeRecord = await Employee.findOne({
      where: { user_id: req.user.id },
      attributes: ['branch_id', 'created_by'],
      raw: true,
    });

    let designations = [];

    if (userEmployeeRecord && userEmployeeRecord.branch_id) {
      // 🟢 CASE 1: User has employee record with branch → branch-level access
      console.log('🟡 Branch User - Getting designations by department');
      
      // 🟢 Get COMPANY USERS (branchless users)
      const allCompanyUsers = await User.findAll({
        where: { created_by: companyId },
        attributes: ['id'],
        raw: true,
      });
      
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

      // 🟢 Get CURRENT BRANCH USERS
      const branchEmployees = await Employee.findAll({
        where: {
          created_by: companyId,
          branch_id: userEmployeeRecord.branch_id,
        },
        attributes: ['user_id'],
        raw: true,
      });
      const currentBranchUserIds = branchEmployees.map(e => Number(e.user_id));

      // 🟢 Combined allowed users
      const allowedUserIds = [...new Set([
        Number(companyId), 
        ...branchlessUserIds, 
        ...currentBranchUserIds
      ])];

      designations = await Designation.findAll({
        where: {
          department_id: departmentId,
          [Op.or]: [
            { created_by: { [Op.in]: allowedUserIds } },
            { branch_id: userEmployeeRecord.branch_id }
          ]
        },
        include: [
          { model: Branch, attributes: ["id", "name"] },
          { model: Department, attributes: ["id", "name"] },
        ],
        order: [["id", "DESC"]],
      });

    } else {
      // 🟢 CASE 2: User doesn't have employee record (no branch) → FULL DATABASE ACCESS
      console.log('🟡 Branchless User - Getting designations by department');
      
      designations = await Designation.findAll({
        where: { department_id: departmentId },
        include: [
          { model: Branch, attributes: ["id", "name"] },
          { model: Department, attributes: ["id", "name"] },
        ],
        order: [["id", "DESC"]],
      });
    }

    console.log('🔍 Final Designations Count by Department:', designations.length);
    console.log('✅ END getDesignationsByDepartmentId - Success');
    return res.json({ success: true, data: designations });
  } catch (err) {
    console.error("❌ Get Designations by Department Error:", err);
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};



