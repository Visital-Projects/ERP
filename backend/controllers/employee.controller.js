// const bcrypt = require('bcrypt');
// const { Sequelize, Op } = require('sequelize');


// const Employee = require('../models/employee.model');
// const User = require('../models/user.model');
// const Department = require('../models/department.model');
// const Branch = require('../models/branch.model');
// const Designation = require('../models/designation.model');
// const Document = require('../models/document.model');
// const EmployeeDocument = require('../models/employee_document.model');

// const Role = require('../models/role.model');
// const RoleUser = require('../models/roleuser.model');





// async function getUserBranchId(userId) {
//   const emp = await Employee.findOne({
//     where: { user_id: userId },
//     attributes: ['branch_id'],
//     raw: true,
//   });
//   return emp?.branch_id || null;
// }


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

// async function hasBranch(userId) {
//   const emp = await Employee.findOne({
//     where: { user_id: userId },
//     attributes: ['branch_id'],
//     raw: true,
//   });
//   return !!(emp && emp.branch_id);
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


// exports.getAllEmployees = async (req, res) => {
//   try {
//     console.log('🎯 START getAllEmployees');
//     console.log('🔍 User Info - ID:', req.user.id, 'Type:', req.user.type);

//     const companyId = await getCompanyId(req);
//     let employees;

//     if (isSuper(req)) {
//       // ✅ Super admin → see all employees
//       console.log('🟡 Super Admin Access');
//       employees = await Employee.findAll({
//         where: { deleted_at: null },
//         include: [
//           { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
//           { model: Branch, as: 'branch', attributes: ['id', 'name'] },
//           { model: Department, as: 'department', attributes: ['id', 'name'] },
//           { model: Designation, as: 'designation', attributes: ['id', 'name'] },
//         ],
//         order: [['id', 'DESC']],
//       });

//     } else if ((req.user?.type || '').toLowerCase() === 'company') {
//       // ✅ Company login → all employees under company (all branches)
//       console.log('🟡 Company User Access');
//       const allowedUserIds = await getAllUserIdsUnderCompanyBranch(companyId, null);
//       employees = await Employee.findAll({
//         where: { created_by: { [Op.in]: allowedUserIds }, deleted_at: null },
//         include: [
//           { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
//           { model: Branch, as: 'branch', attributes: ['id', 'name'] },
//           { model: Department, as: 'department', attributes: ['id', 'name'] },
//           { model: Designation, as: 'designation', attributes: ['id', 'name'] },
//         ],
//         order: [['id', 'DESC']],
//       });

//     } else {
//       // 🔹 Check if logged-in user has an Employee record
//       const emp = await Employee.findOne({
//         where: { user_id: req.user.id },
//         attributes: ['id', 'branch_id'],
//       });

//       if (emp) {
//         // 🟢 UPDATED AREA: Branch User → ONLY their own branch employees
//         console.log('🟡 Branch User Access');
//         const branchId = emp.branch_id;
//         console.log('🔍 Branch ID for Branch User:', branchId);
        
//         if (!companyId) {
//           return res.status(403).json({ success: false, message: 'Unauthorized' });
//         }

//         // 🟢 SIMPLIFIED: Branch users only see employees in THEIR OWN BRANCH
//         // No need for complex allowedUserIds logic for branch users
//         employees = await Employee.findAll({
//           where: { 
//             branch_id: branchId, // 🟢 ONLY employees in same branch
//             deleted_at: null 
//           },
//           include: [
//             { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
//             { model: Branch, as: 'branch', attributes: ['id', 'name'] },
//             { model: Department, as: 'department', attributes: ['id', 'name'] },
//             { model: Designation, as: 'designation', attributes: ['id', 'name'] },
//           ],
//           order: [['id', 'DESC']],
//         });

//         console.log('🔍 Branch User - Employees in Branch', branchId + ':', employees.length);

//       } else {
//         // 🟢 Branchless user → FULL DATABASE ACCESS (all branches)
//         console.log('🟡 Branchless User Access (FULL DATABASE)');
//         employees = await Employee.findAll({
//           where: { deleted_at: null },
//           include: [
//             { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
//             { model: Branch, as: 'branch', attributes: ['id', 'name'] },
//             { model: Department, as: 'department', attributes: ['id', 'name'] },
//             { model: Designation, as: 'designation', attributes: ['id', 'name'] },
//           ],
//           order: [['id', 'DESC']],
//         });
//         console.log('🔍 Branchless User - All Employees Count:', employees.length);
//       }
//     }

//     console.log('🔍 Final Employees Count:', employees?.length || 0);
//     console.log('✅ END getAllEmployees - Success');
//     return res.json({ success: true, data: employees });

//   } catch (err) {
//     console.error('❌ Error getAllEmployees:', err);
//     return res.status(500).json({ message: 'Server error', error: err.message });
//   }
// };

// exports.getEmployeeById = async (req, res) => {
//   try {
//     console.log('🎯 START getEmployeeById');
//     console.log('🔍 User Info - ID:', req.user.id, 'Type:', req.user.type);
//     console.log('🔍 Requested Employee ID:', req.params.id);

//     const companyId = await getCompanyId(req);
//     console.log('🔍 Company ID:', companyId);

//     let where;

//     if (isSuper(req)) {
//       // ✅ Super admin can see any employee
//       console.log('🟡 Super Admin Access');
//       where = { employee_id: req.params.id };

//     } else if (isEmployee(req)) {
//       // ✅ Employee can only see their own profile
//       console.log('🟡 Employee Access - Own Profile Only');
//       const emp = await Employee.findOne({ where: { user_id: req.user.id } });
//       if (!emp || String(emp.employee_id) !== String(req.params.id)) {
//         return res.status(403).json({ success: false, message: 'Forbidden: you can only view your own profile' });
//       }
//       where = { id: emp.id };

//     } else {
//       // 🔹 Check if logged-in user has an Employee record (has branch)
//       const userEmployeeRecord = await Employee.findOne({
//         where: { user_id: req.user.id },
//         attributes: ['branch_id', 'created_by'],
//         raw: true,
//       });

//       console.log('🔍 User Employee Record:', userEmployeeRecord);

//       if (userEmployeeRecord && userEmployeeRecord.branch_id) {
//         // 🟢 UPDATED AREA: Branch User → can only access employees in their own branch
//         console.log('🟡 Branch User Access');
//         const branchId = userEmployeeRecord.branch_id;
//         console.log('🔍 Branch ID for Branch User:', branchId);

//         // 🔹 Find the target employee
//         const targetEmp = await Employee.findOne({
//           where: { employee_id: req.params.id },
//           attributes: ['id', 'branch_id', 'created_by'],
//         });

//         if (!targetEmp) {
//           return res.status(404).json({ success: false, message: 'Employee not found' });
//         }

//         // 🟢 BRANCH-LEVEL RESTRICTION: Only allow if target employee is in same branch
//         if (Number(targetEmp.branch_id) !== Number(branchId)) {
//           return res.status(403).json({ 
//             success: false, 
//             message: 'Forbidden: you can only access employees in your own branch' 
//           });
//         }

//         // ✅ Same branch → allow access
//         where = { id: targetEmp.id };
//         console.log('🔍 Branch User - Access granted to employee in same branch');

//       } else {
//         // 🟢 UPDATED AREA: Branchless User → can access ANY employee in the company
//         console.log('🟡 Branchless User Access (FULL ACCESS)');
        
//         if (!companyId) {
//           return res.status(403).json({ success: false, message: 'Unauthorized' });
//         }

//         // 🟢 Get all users under company (for created_by check)
//         const allowedUserIds = await getAllUserIdsUnderCompanyBranch(companyId, null);
        
//         where = {
//           employee_id: req.params.id,
//           created_by: { [Op.in]: allowedUserIds }
//         };
//         console.log('🔍 Branchless User - Access to any employee in company');
//       }
//     }

//     // 🔹 Fetch employee with relations
//     const employee = await Employee.findOne({
//       where,
//       include: [
//         { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
//         { model: Branch, as: 'branch', attributes: ['id', 'name'] },
//         { model: Department, as: 'department', attributes: ['id', 'name'] },
//         { model: Designation, as: 'designation', attributes: ['id', 'name'] },
//       ],
//     });

//     if (!employee) {
//       console.log('❌ Employee not found with criteria');
//       return res.status(404).json({ success: false, message: 'Employee not found' });
//     }

//     console.log('✅ Employee found, access granted');
//     return res.json({ success: true, data: employee });

//   } catch (err) {
//     console.error('❌ Error getEmployeeById:', err);
//     return res.status(500).json({ message: 'Server error', error: err.message });
//   }
// };


// exports.createEmployee = async (req, res) => {
//   const t = await Employee.sequelize.transaction();
//   try {
//     console.log('🎯 START createEmployee');
//     console.log('🔍 User Info - ID:', req.user.id, 'Type:', req.user.type);

//     // 🟢 Check if user exists in employees table (has branch)
//     const userEmployeeRecord = await Employee.findOne({
//       where: { user_id: req.user.id },
//       attributes: ['branch_id', 'created_by'],
//       raw: true,
//     });

//     console.log('🔍 User Employee Record:', userEmployeeRecord);

//     let companyId;
//     let creatorId = req.user.id;
//     let userBranchId = null;

//     // 🟢 SUPER ADMIN: Full access
//     if (isSuper(req)) {
//       console.log('🟡 Super Admin - Creating employee');
//       companyId = await getCompanyId(req);
//       // Super admin can create employees for any company
//     } 
//     else if (userEmployeeRecord && userEmployeeRecord.branch_id) {
//       // 🟢 CASE 1: User has employee record with branch → branch-level access
//       console.log('🟡 Branch User Access - Creating employee');
//       userBranchId = userEmployeeRecord.branch_id;
//       companyId = userEmployeeRecord.created_by;
      
//       if (!companyId) {
//         await t.rollback();
//         return res.status(403).json({ success: false, message: 'Unauthorized' });
//       }

//       // 🟢 Branch users can only create employees in their own branch
//       if (req.body.branch_id && Number(req.body.branch_id) !== Number(userBranchId)) {
//         await t.rollback();
//         return res.status(403).json({ 
//           success: false, 
//           message: 'Branch users can only create employees in their own branch' 
//         });
//       }
      
//       // Auto-assign to user's branch if not specified
//       if (!req.body.branch_id) {
//         req.body.branch_id = userBranchId;
//       }
//     } 
//     else {
//       // 🟢 CASE 2: User doesn't have employee record (no branch) → company-wide access
//       console.log('🟡 Branchless User Access - Creating employee');
//       companyId = await getCompanyId(req);
      
//       if (!companyId) {
//         await t.rollback();
//         return res.status(403).json({ success: false, message: 'Unauthorized' });
//       }
      
//       // 🟢 Branchless users can create employees in any branch
//       // No branch restrictions applied
//     }

//     console.log('🔍 Final Company ID:', companyId);
//     console.log('🔍 User Branch ID:', userBranchId);

//     const data = { ...req.body };
//     delete data.employee_id; 
//     data.created_by = creatorId;

//     // 🔹 [UPDATED AREA #1] — Allow new optional employee fields
//     const allowedFields = ['uan_number', 'ip_number', 'father_name', 'skills'];
//     for (const field of allowedFields) {
//       if (req.body[field] !== undefined) data[field] = req.body[field];
//     }

//     // 🔹 [UPDATED AREA #2] — Validate "skills" value
//     if (data.skills) {
//       const validSkills = ['High Skills', 'Skills', 'Semi Skills', 'Unskills'];
//       if (!validSkills.includes(data.skills)) {
//         await t.rollback();
//         return res.status(422).json({
//           success: false,
//           message: `Invalid skills value. Must be one of: ${validSkills.join(', ')}`
//         });
//       }
//     }

//     // 🔹 [OPTIONAL] Validate UAN & IP formats
//     if (data.uan_number && !/^\d{12}$/.test(data.uan_number)) {
//       await t.rollback();
//       return res.status(422).json({
//         success: false,
//         message: 'Invalid UAN number format (must be 12 digits).'
//       });
//     }

//     if (data.ip_number && !/^\d{10}$/.test(data.ip_number)) {
//       await t.rollback();
//       return res.status(422).json({
//         success: false,
//         message: 'Invalid IP number format (must be 10 digits).'
//       });
//     }

//     // 🟢 UPDATED DUPLICATE CHECK LOGIC
//     // if (data.aadhaar_number) {
//     //   let checkUserIds;
      
//     //   if (userEmployeeRecord && userEmployeeRecord.branch_id) {
//     //     // 🟢 Branch user: Check only within their branch
//     //     checkUserIds = await getAllUserIdsUnderCompanyBranch(companyId, userBranchId);
//     //   } else {
//     //     // 🟢 Branchless user/Super admin: Check entire company
//     //     checkUserIds = await getAllUserIdsUnderCompanyBranch(companyId, null);
//     //   }

//     //   const existingEmp = await Employee.findOne({
//     //     where: {
//     //       aadhaar_number: data.aadhaar_number.trim(),
//     //       created_by: { [Op.in]: checkUserIds },
//     //       deleted_at: null
//     //     },
//     //     transaction: t
//     //   });

//     //   if (existingEmp) {
//     //     await t.rollback();
//     //     return res.status(422).json({
//     //       success: false,
//     //       message: `Employee already exists with this Aadhaar number`
//     //     });
//     //   }
//     // }
    
//     // ???? UPDATED DUPLICATE CHECK LOGIC
//     if (data.aadhaar_number) {
//   let checkUserIds;
  
//   if (userEmployeeRecord && userEmployeeRecord.branch_id) {
//     checkUserIds = await getAllUserIdsUnderCompanyBranch(companyId, userBranchId);
//   } else {
//     checkUserIds = await getAllUserIdsUnderCompanyBranch(companyId, null);
//   }

//   // ? FIX: Ensure aadhaar_number is a string before calling trim()
//   const aadhaarString = String(data.aadhaar_number).trim();

//   const existingEmp = await Employee.findOne({
//     where: {
//       aadhaar_number: aadhaarString,  // ? Now safely using trimmed string
//       created_by: { [Op.in]: checkUserIds },
//       deleted_at: null
//     },
//     transaction: t
//   });

//   if (existingEmp) {
//     await t.rollback();
//     return res.status(422).json({
//       success: false,
//       message: `Employee already exists with this Aadhaar number`
//     });
//   }
// }



//     // 🔹 CHECK DUPLICATE PHONE NUMBER - UPDATED LOGIC
//     // if (data.phone) {
//     //   let checkUserIds;
      
//     //   if (userEmployeeRecord && userEmployeeRecord.branch_id) {
//     //     // 🟢 Branch user: Check only within their branch
//     //     checkUserIds = await getAllUserIdsUnderCompanyBranch(companyId, userBranchId);
//     //   } else {
//     //     // 🟢 Branchless user/Super admin: Check entire company
//     //     checkUserIds = await getAllUserIdsUnderCompanyBranch(companyId, null);
//     //   }
    
//     //   const existingPhone = await Employee.findOne({
//     //     where: {
//     //       phone: data.phone.trim(),
//     //       created_by: { [Op.in]: checkUserIds },
//     //       deleted_at: null
//     //     },
//     //     transaction: t
//     //   });
    
//     //   if (existingPhone) {
//     //     await t.rollback();
//     //     return res.status(422).json({
//     //       success: false,
//     //       message: `Employee already exists with this phone number.`
//     //     });
//     //   }
//     // }
    
//     if (data.phone) {
//       let checkUserIds;
      
//       if (userEmployeeRecord && userEmployeeRecord.branch_id) {
//         checkUserIds = await getAllUserIdsUnderCompanyBranch(companyId, userBranchId);
//       } else {
//         checkUserIds = await getAllUserIdsUnderCompanyBranch(companyId, null);
//       }
    
//       // ? FIX: Ensure phone is a string before calling trim()
//       const phoneString = String(data.phone).trim();
      
//       const existingPhone = await Employee.findOne({
//         where: {
//           phone: phoneString,  // ? Now safely using trimmed string
//           created_by: { [Op.in]: checkUserIds },
//           deleted_at: null
//         },
//         transaction: t
//       });
    
//       if (existingPhone) {
//         await t.rollback();
//         return res.status(422).json({
//           success: false,
//           message: `Employee already exists with this phone number.`
//         });
//       }
//     }


//     // ... rest of your existing code remains the same ...


//     if (data.password) {
//       const salt = await bcrypt.genSalt(10);
//       data.password = await bcrypt.hash(data.password, salt);
//     }

//     const user = await User.create(
//       {
//         name: data.name,
//         email: data.email,
//         password: data.password,
//         type: 'Employee',  
//         created_by: creatorId,     // IMPORTANT: company owner
//       },
//       { transaction: t }
//     );

//     const employeeRole = await Role.findOne({ where: { name: 'Employee' } });
//     if (!employeeRole) {
//       throw new Error("Role 'Employee' not found. Seed roles first.");
//     }
//     await RoleUser.create(
//       {
//         role_id: employeeRole.id,
//         model_type: 'App\\Models\\User', 
//         model_id: user.id,
//       },
//       { transaction: t }
//     );

//     data.user_id = user.id;


    
   
//     async function getAllUserIdsUnderCompany(companyId) {
//       const users = await User.findAll({
//         where: { created_by: companyId },
//         attributes: ['id']
//       });
//       return users.map(u => u.id).concat(companyId);
//     }
    
//     const allCompanyUserIds = await getAllUserIdsUnderCompany(companyId);
    
//     const maxEmp = await Employee.findOne({
//       where: { created_by: { [Op.in]: allCompanyUserIds } },
//       attributes: ['employee_id'],
//       order: [[Sequelize.cast(Sequelize.col('employee_id'), 'UNSIGNED'), 'DESC']],

//       lock: t.LOCK.UPDATE,      
//       transaction: t
//     });
    
//     // 🔹 Next numeric employee_id
//     const nextEmpNo = (Number(maxEmp?.employee_id) || 0) + 1;
//     data.employee_id = nextEmpNo;



    
    


//     const requiredDocs = await Document.findAll({
//       where: {
//         is_required: { [Op.in]: ['1', 1, true, 'true'] },
//         created_by: companyId,
//       },
//       attributes: ['id'],
//       transaction: t,
//     });
//     const requiredDocIds = requiredDocs.map(d => Number(d.id));

//     const uploadedDocIds = new Set();
//     const filePayloads = [];

//     const collectFromFile = (file, fieldnameForId) => {
//       const source = fieldnameForId || file.fieldname || '';
//       const m = String(source).match(/(\d+)/); // first number in field name
//       if (!m) return;
//       const document_id = Number(m[1]);
//       uploadedDocIds.add(document_id);
//       filePayloads.push({
//         document_id,
//         document_value: file.filename, 
//       });
//     };

//     if (Array.isArray(req.files)) {
//       for (const f of req.files) collectFromFile(f);
//     } else if (req.files && typeof req.files === 'object') {
//       for (const [field, files] of Object.entries(req.files)) {
//         for (const f of files) collectFromFile(f, field);
//       }
//     }

//     const missingRequired = requiredDocIds.filter(id => !uploadedDocIds.has(id));
//     if (requiredDocIds.length && missingRequired.length) {
//       await t.rollback();
//       return res.status(422).json({
//         success: false,
//         message: 'Missing required documents',
//         required_document_ids: requiredDocIds,
//         missing_document_ids: missingRequired,
//       });
//     }

//     data.documents = Array.from(uploadedDocIds).join(',');

//     const employee = await Employee.create(data, { transaction: t });

//     const now = new Date();
//     for (const it of filePayloads) {
//       await EmployeeDocument.create(
//         {
//           employee_id: employee.id,
//           document_id: it.document_id,
//           document_value: it.document_value,
//           created_by: creatorId,   

//           created_at: now,
//           updated_at: now,
//         },
//         { transaction: t }
//       );
//     }

//     await t.commit();
//     return res.status(201).json({ success: true, data: employee });
//   } catch (err) {
//     await t.rollback();
//     return res.status(500).json({ success: false, message: 'Error creating employee', error: err.message });
//   }
// };


// exports.updateEmployee = async (req, res) => {
//   const t = await Employee.sequelize.transaction();
//   try {
//     const companyId = await getCompanyId(req);
    
//         // 🔹 NEW: capture actual logged-in user id
//     const creatorId = req.user.id;  
//     const employee = await Employee.findOne({
//         where: { employee_id: req.params.id },   // ✅ match business ID
//         transaction: t,
//     });
    
//     // 🔹 HIGHLIGHTED UPDATE: ownership check based on role/user type
//     if (!employee) {
//       await t.rollback();
//       return res.status(404).json({ success: false, message: 'Employee not found' });
//     }
    

//     // 🟢 UPDATED AREA: Access Control Logic
//     if (!isSuper(req)) {
//       // 🔹 Check if logged-in user has an Employee record (has branch)
//       const userEmployeeRecord = await Employee.findOne({
//         where: { user_id: req.user.id },
//         attributes: ['branch_id', 'created_by'],
//         raw: true,
//       });
    
//       console.log('🔍 User Employee Record:', userEmployeeRecord);
    
//       if (userEmployeeRecord && userEmployeeRecord.branch_id) {
//         // 🟢 BRANCH USER: Can only update employees in their own branch
//         console.log('🟡 Branch User Access - Update');
//         const branchId = userEmployeeRecord.branch_id;
//         console.log('🔍 Branch ID for Branch User:', branchId);
    
//         // 🟢 BRANCH-LEVEL RESTRICTION: Only allow if target employee is in same branch
//         if (Number(employee.branch_id) !== Number(branchId)) {
//           await t.rollback();
//           return res.status(403).json({ 
//             success: false, 
//             message: 'Forbidden: you can only update employees in your own branch' 
//           });
//         }
//         console.log('🔍 Branch User - Update access granted to employee in same branch');
    
//       } else {
//         // 🟢 BRANCHLESS USER: Can update ANY employee in the company
//         console.log('🟡 Branchless User Access - Update (FULL ACCESS)');
        
//         if (!companyId) {
//           await t.rollback();
//           return res.status(403).json({ success: false, message: 'Unauthorized' });
//         }
    
//         // 🟢 Get all users under company (for created_by check)
//         const allowedUserIds = await getAllUserIdsUnderCompanyBranch(companyId, null);
        
//         // 🟢 Check if employee was created by company or branchless users
//         if (!allowedUserIds.map(String).includes(String(employee.created_by))) {
//           await t.rollback();
//           return res.status(403).json({ 
//             success: false, 
//             message: 'Forbidden: you can only update employees in your company' 
//           });
//         }
//         console.log('🔍 Branchless User - Update access granted to company employee');
//       }
//     } else {
//       console.log('🟡 Super Admin Access - Update');
//     }
//     // 🟢 END UPDATED AREA


//     // Step 2: Collect incoming data
//     const data = { ...req.body };
//     delete data.id;
//     delete data.employee_id;
//     delete data.created_by; // guard
    
    
//      // 🔹 HIGHLIGHTED AREA 3 — Validate new fields (uan_number, ip_number, father_name, skills)
//     if (data.skills) {
//       const allowedSkills = ['High Skills', 'Skills', 'Semi Skills', 'Unskills'];
//       if (!allowedSkills.includes(data.skills)) {
//         await t.rollback();
//         return res.status(400).json({
//           success: false,
//           message: `Invalid skills value. Must be one of: ${allowedSkills.join(', ')}`,
//         });
//       }
//     }

//     if (data.uan_number && !/^\d{12}$/.test(data.uan_number)) {
//       await t.rollback();
//       return res.status(400).json({ success: false, message: 'Invalid UAN number format (must be 12 digits).' });
//     }

//     if (data.ip_number && !/^\d{10}$/.test(data.ip_number)) {
//       await t.rollback();
//       return res.status(400).json({ success: false, message: 'Invalid IP number format (must be 10 digits).' });
//     }
//     // 🔹 END HIGHLIGHTED AREA 3


//     // Step 3: Hash password if present
//     if (data.password) {
//       const salt = await bcrypt.genSalt(10);
//       data.password = await bcrypt.hash(data.password, salt);
//     }

//     // Step 4: Update related User record if needed
//     const userUpdates = {};
//     if (data.name) userUpdates.name = data.name;
//     if (data.email) userUpdates.email = data.email;
//     if (data.password) userUpdates.password = data.password;

//     if (Object.keys(userUpdates).length) {
//       await User.update(userUpdates, { where: { id: employee.user_id }, transaction: t });
//     }

//     // Step 5: Required Documents (company-wise)
//     const requiredDocs = await Document.findAll({
//       where: {
//         is_required: { [Op.in]: ['1', 1, true, 'true'] },
//         created_by: employee.created_by, // ensure same company
//       },
//       attributes: ['id'],
//       transaction: t,
//     });
//     const requiredDocIds = requiredDocs.map(d => Number(d.id));

//     // Step 6: Parse uploaded files
//     const uploadedDocIds = new Set();
//     const filePayloads = [];

//     const collectFromFile = (file, fieldnameForId) => {
//       const source = fieldnameForId || file.fieldname || '';
//       const mAll = String(source).match(/(\d+)/g);
//       const num = mAll ? mAll[mAll.length - 1] : null;
//       if (!num) return;
//       const document_id = Number(num);
//       if (!isNaN(document_id)) {
//         uploadedDocIds.add(document_id);
//         filePayloads.push({
//           document_id,
//         //   document_value: `misc/${file.filename}`,
//         //   document_value: `employee_documents/${file.filename}`,
//           document_value: file.filename,

//         });
//       }
//     };

//     if (Array.isArray(req.files)) {
//       for (const f of req.files) collectFromFile(f);
//     } else if (req.files && typeof req.files === 'object') {
//       for (const [field, files] of Object.entries(req.files)) {
//         for (const f of files) collectFromFile(f, field);
//       }
//     }

//     // Step 7: Merge existing + uploaded doc IDs
//     const existingDocIds = (employee.documents || '')
//       .split(',')
//       .map(s => s.trim())
//       .filter(Boolean)
//       .map(n => Number(n))
//       .filter(n => !isNaN(n));

//     const finalDocIdsSet = new Set(existingDocIds);
//     for (const id of uploadedDocIds) finalDocIdsSet.add(Number(id));

//     // Step 8: Validate required documents
//     const missingRequired = requiredDocIds.filter(id => !finalDocIdsSet.has(id));
//     if (requiredDocIds.length && missingRequired.length) {
//       await t.rollback();
//       return res.status(422).json({
//         success: false,
//         message: 'Missing required documents',
//         required_document_ids: requiredDocIds,
//         missing_document_ids: missingRequired,
//       });
//     }

//     // Step 9: Persist changes
//     const documentsStr = Array.from(finalDocIdsSet).length ? Array.from(finalDocIdsSet).join(',') : null;

//     employee.set({
//       ...data,
//       documents: documentsStr,
//       updated_at: new Date(),
//     });

//     await employee.save({ transaction: t });

//     // Step 10: Insert new uploaded documents (only new ones)
//     // const now = new Date();
//     // for (const it of filePayloads) {
//     //   await EmployeeDocument.create(
//     //     {
//     //       employee_id: employee.id,
//     //       document_id: it.document_id,
//     //       document_value: it.document_value,
//     //       created_by: employee.created_by,
//     //       created_at: now,
//     //       updated_at: now,
//     //     },
//     //     { transaction: t }
//     //   );
//     // }
    
//     const now = new Date();
//     for (const it of filePayloads) {
//       // Check if document already exists
//       const existingDoc = await EmployeeDocument.findOne({
//         where: {
//           employee_id: employee.id,
//           document_id: it.document_id
//         },
//         transaction: t
//       });
    
//       if (existingDoc) {
//         // UPDATE existing document
//         await existingDoc.update({
//           document_value: it.document_value,
//           updated_at: now
//         }, { transaction: t });
//       } else {
//         // CREATE new document
//         await EmployeeDocument.create({
//           employee_id: employee.id,
//           document_id: it.document_id,
//           document_value: it.document_value,
//           created_by: employee.created_by,
//           created_at: now,
//           updated_at: now,
//         }, { transaction: t });
//       }
//     }

//     await t.commit();

//     const updatedEmployee = await Employee.findByPk(employee.id, {
//       include: [
//         { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
//         { model: Branch, as: 'branch', attributes: ['id', 'name'] },
//         { model: Department, as: 'department', attributes: ['id', 'name'] },
//         { model: Designation, as: 'designation', attributes: ['id', 'name'] },
//       ],
//     });

//     return res.status(200).json({ success: true, data: updatedEmployee });
//   } catch (err) {
//     await t.rollback();
//     return res.status(500).json({ success: false, message: 'Error updating employee', error: err.message });
//   }
// };


// exports.deleteEmployee = async (req, res) => {
//   try {
//     const companyId = await getCompanyId(req);

//     // 🔹 Fetch employee by business ID
//     const employee = await Employee.findOne({ where: { employee_id: req.params.id } });
//     if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });

//     // 🔹 HIGHLIGHTED: Get logged-in user employee record (for branch check)
//     let currentEmp = null;
//     if (!isSuper(req) && (req.user?.type || '').toLowerCase() !== 'company') {
//       currentEmp = await Employee.findOne({ where: { user_id: req.user.id } });
//       if (!currentEmp) {
//         return res.status(403).json({ success: false, message: 'Forbidden: you are not an employee' });
//       }
//     }

//     // 🔹 Permission check
//     if (!isSuper(req)) {
//       const userType = (req.user?.type || '').toLowerCase();

//       if (userType === 'company') {
//         // ✅ Company user can delete employees created by itself or its child users
//         const allCompanyUserIds = await User.findAll({
//           where: { created_by: companyId },
//           attributes: ['id']
//         }).then(users => users.map(u => u.id).concat(companyId));

//         if (!allCompanyUserIds.includes(employee.created_by)) {
//           return res.status(403).json({ success: false, message: 'Forbidden: not your employee' });
//         }
//       } else {
//         // 🔹 OLD CODE (only self-owned check)
//         /*
//         if (Number(employee.created_by) !== Number(req.user.id)) {
//           return res.status(403).json({ success: false, message: 'Forbidden: not your employee' });
//         }
//         */

//         // 🔹 NEW CODE: Branch-level check
//         if (String(currentEmp.branch_id) !== String(employee.branch_id)) {
//           return res.status(403).json({ success: false, message: 'Forbidden: employee is in another branch' });
//         }
//       }
//     }

//     // 🔹 Soft delete instead of hard delete
//     await employee.update({ deleted_at: new Date() });

//     res.json({ success: true, message: 'Employee soft deleted successfully' });
//   } catch (err) {
//     console.error('❌ Error deleting employee:', err);
//     res.status(500).json({ success: false, message: 'Error deleting employee', error: err.message });
//   }
// };

// exports.checkAadhaar = async (req, res) => {
//   try {
//     const { aadhaar_number } = req.body;

//     if (!aadhaar_number || !/^\d{12}$/.test(aadhaar_number)) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid Aadhaar number. Must be 12 digits.',
//       });
//     }

//     const companyId = await getCompanyId(req);

//     // Get all user IDs under this company
//     const allUserIds = await User.findAll({
//       where: { created_by: companyId },
//       attributes: ['id'],
//       raw: true,
//     }).then(users => users.map(u => u.id).concat(companyId));

//     // Trim input
//     const aadhaarClean = aadhaar_number.trim();

//     const employee = await Employee.findOne({
//       where: {
//         aadhaar_number: aadhaarClean,
//         created_by: { [Op.in]: allUserIds },
//         deleted_at: null
//       },
//       include: [
//         { model: Branch, as: 'branch', attributes: ['id', 'name'] }
//       ]
//     });

//     if (employee) {
//       return res.status(200).json({
//         success: true,
//         exists: true,
//         message: `Employee already exists in branch: ${employee.branch?.name || 'N/A'}`,
//         data: {
//           id: employee.id,
//           name: employee.name,
//           employee_id: employee.employee_id,
//           branch: employee.branch ? { id: employee.branch.id, name: employee.branch.name } : null
//         }
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       exists: false,
//       message: 'No employee found with this Aadhaar number. You can proceed to create.',
//     });

//   } catch (err) {
//     console.error('❌ Error in checkAadhaar:', err);
//     return res.status(500).json({
//       success: false,
//       message: 'Server error checking Aadhaar',
//       error: err.message
//     });
//   }
// };


// exports.rejoinEmployee = async (req, res) => {
//   const t = await Employee.sequelize.transaction();
//   try {
//     const { aadhaar_number, rejoin_reason } = req.body;

//     // 🔹 Validate input
//     if (!aadhaar_number || !/^\d{12}$/.test(aadhaar_number.trim())) {
//       await t.rollback();
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid Aadhaar number. Must be 12 digits.',
//       });
//     }

//     if (!rejoin_reason || rejoin_reason.trim().length === 0) {
//       await t.rollback();
//       return res.status(400).json({
//         success: false,
//         message: 'Rejoin reason is required.',
//       });
//     }

//     const companyId = await getCompanyId(req);

//     // 🔹 Get all user IDs under the company
//     const allUserIds = await User.findAll({
//       where: { created_by: companyId },
//       attributes: ['id'],
//       raw: true,
//     }).then(users => users.map(u => u.id).concat(companyId));

//     const aadhaarClean = aadhaar_number.trim();

//     // 🔹 Find employee by Aadhaar
//     const employee = await Employee.findOne({
//       where: {
//         aadhaar_number: aadhaarClean,
//         created_by: { [Op.in]: allUserIds },
//       },
//       include: [{ model: Branch, as: 'branch', attributes: ['id', 'name'] }],
//       transaction: t,
//     });

//     if (!employee) {
//       await t.rollback();
//       return res.status(404).json({
//         success: false,
//         message: 'No employee found with this Aadhaar number under your company.',
//       });
//     }

//     console.log('🔍 Employee Current Status:', {
//       id: employee.id,
//       name: employee.name,
//       employee_id: employee.employee_id,
//       is_active: employee.is_active,
//       branch: employee.branch ? employee.branch.name : 'No branch'
//     });

//     // 🔴 OLD CODE (Restrictive - blocking active employees):
//     // // 🟢 Check if employee is already active
//     // if (employee.is_active === 1 || employee.is_active === true) {
//     //   await t.rollback();
//     //   return res.status(400).json({
//     //     success: false,
//     //     message: 'Employee is already active and cannot rejoin.',
//     //   });
//     // }

//     // 🟢 NEW CODE (Flexible - allow both active and inactive employees to rejoin):
//     let statusChange = false;
//     let previousStatus = employee.is_active ? "Active" : "Inactive/Terminated";

//     // If employee is inactive, activate them
//     if (employee.is_active === 0 || employee.is_active === false) {
//       statusChange = true;
//     }

//     // 🟢 UPDATED AREA — Store rejoin reason and reactivate if needed
//     const updateData = {
//       rejoin_reason: rejoin_reason.trim(),
//       updated_at: new Date(),
//     };

//     // Only activate if employee is currently inactive
//     if (statusChange) {
//       updateData.is_active = 1; // ✅ Change from 0 to 1 (inactive to active)
//       updateData.rejoin_date = new Date(); // ✅ Store rejoin date
//     }

//     await employee.update(updateData, { transaction: t });

//     // 🟢 Check and close termination record if exists
//     const Termination = require('../models/termination.model');
//     const termination = await Termination.findOne({
//       where: { 
//         employee_id: employee.id,
//         deleted_at: null 
//       },
//       transaction: t,
//     });

//     if (termination) {
//       await termination.update(
//         { 
//           deleted_at: new Date(),
//           rejoin_reason: rejoin_reason.trim() // ✅ Optional: Also store in termination table
//         },
//         { transaction: t }
//       );
//       console.log('✅ Termination record closed for employee:', employee.name);
//     }

//     await t.commit();

//     return res.status(200).json({
//       success: true,
//       message: `Employee ${employee.name} has been successfully processed for rejoining.`,
//       data: {
//         id: employee.id,
//         name: employee.name,
//         employee_id: employee.employee_id,
//         branch: employee.branch ? employee.branch.name : null,
//         rejoin_reason: rejoin_reason.trim(),
//         rejoin_date: statusChange ? new Date() : null,
//         previous_status: previousStatus,
//         current_status: statusChange ? "Active" : previousStatus,
//         is_active: statusChange ? 1 : employee.is_active,
//         status_changed: statusChange,
//         action: statusChange ? "Reactivated and Rejoined" : "Rejoin Reason Updated"
//       },
//     });
//   } catch (err) {
//     await t.rollback();
//     console.error('❌ Error in rejoinEmployee:', err);
//     return res.status(500).json({
//       success: false,
//       message: 'Server error during rejoin process.',
//       error: err.message,
//     });
//   }
// };


// exports.getEmployeesByBranch = async (req, res) => {
//   try {
//     const companyId = await getCompanyId(req);
//     const { branchId } = req.params;

//     let where = { branch_id: branchId }; // base condition

//     if (!isSuper(req)) {
//       const userType = (req.user?.type || '').toLowerCase();

//       if (userType === 'company') {
//         // ✅ Company login → fetch employees in this branch created by company or its subordinates
//         const companyUsers = await User.findAll({
//           where: { created_by: companyId },
//           attributes: ['id'],
//         });
//         const allowedUserIds = companyUsers.map(u => u.id).concat(companyId);
//         where.created_by = { [Op.in]: allowedUserIds };

//       } else {
//         // Check if user has an Employee record
//         const emp = await Employee.findOne({ where: { user_id: req.user.id } });

//         if (emp) {
//           // ✅ Employee-type role user → can only fetch their own branch
//           if (String(emp.branch_id) !== String(branchId)) {
//             return res.status(403).json({
//               success: false,
//               message: 'Forbidden: you cannot access another branch',
//             });
//           }
//           where.branch_id = branchId; // only this branch

//         } else {
//           // ✅ Direct role user (no Employee record) → can fetch all employees in this branch
//           where.branch_id = branchId; // no created_by restriction
//         }
//       }
//     }

//     const employees = await Employee.findAll({
//       where,
//       include: [
//         { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
//         { model: Branch, as: 'branch', attributes: ['id', 'name'] },
//         { model: Department, as: 'department', attributes: ['id', 'name'] },
//         { model: Designation, as: 'designation', attributes: ['id', 'name'] },
//       ],
//       order: [['id', 'DESC']],
//     });

//     res.status(200).json({ success: true, data: employees });
//   } catch (error) {
//     console.error('❌ Error fetching employees by branch:', error);
//     res.status(500).json({ success: false, message: 'Server Error', error: error.message });
//   }
// };




// const path = require("path");
// const fs = require("fs");
// const ExcelJS = require("exceljs");
// const PayslipType = require("../models/payslipType.model"); // ✅ add this


// exports.getAllEmployeesSummary = async (req, res) => {
//   try {
//     if (!req.user) {
//       return res.status(401).json({ success: false, message: "Unauthorized" });
//     }

//     const companyId = await getCompanyId(req);
//     let employees;

//     // =====================================
//     // 🧩 Role-based data visibility
//     // =====================================

//     if (isSuper(req)) {
//       employees = await Employee.findAll({
//         where: { deleted_at: null },
//         include: [
//           { model: PayslipType, as: "salaryType", attributes: ["name"] },
//           { model: User, as: "user", attributes: ["id", "name", "email"] },
//           { model: Branch, as: "branch", attributes: ["id", "name"] },
//           { model: Department, as: "department", attributes: ["id", "name"] },
//           { model: Designation, as: "designation", attributes: ["id", "name"] },
//         ],
//         order: [["id", "DESC"]],
//       });
//     } else if (isEmployee(req)) {
//       const emp = await Employee.findOne({
//         where: { user_id: req.user.id, deleted_at: null },
//         include: [
//           { model: PayslipType, as: "salaryType", attributes: ["name"] },
//           { model: User, as: "user", attributes: ["id", "name", "email"] },
//           { model: Branch, as: "branch", attributes: ["id", "name"] },
//           { model: Department, as: "department", attributes: ["id", "name"] },
//           { model: Designation, as: "designation", attributes: ["id", "name"] },
//         ],
//       });
//       employees = emp ? [emp] : [];
//     } else if ((req.user?.type || "").toLowerCase() === "company") {
//       const allowedUserIds = await getAllUserIdsUnderCompanyBranch(companyId, null);
//       employees = await Employee.findAll({
//         where: { created_by: { [Op.in]: allowedUserIds }, deleted_at: null },
//         include: [
//           { model: PayslipType, as: "salaryType", attributes: ["name"] },
//           { model: User, as: "user", attributes: ["id", "name", "email"] },
//           { model: Branch, as: "branch", attributes: ["id", "name"] },
//           { model: Department, as: "department", attributes: ["id", "name"] },
//           { model: Designation, as: "designation", attributes: ["id", "name"] },
//         ],
//         order: [["id", "DESC"]],
//       });
//     } else {
//       const branchId = await getUserBranchId(req.user.id);
//       if (!branchId) {
//         return res.status(403).json({ success: false, message: "No branch assigned" });
//       }

//       const allowedUserIds = await getAllUserIdsUnderCompanyBranch(companyId, branchId);
//       employees = await Employee.findAll({
//         where: {
//           branch_id: branchId,
//           created_by: { [Op.in]: allowedUserIds },
//           deleted_at: null,
//         },
//         include: [
//           { model: PayslipType, as: "salaryType", attributes: ["name"] },
//           { model: User, as: "user", attributes: ["id", "name", "email"] },
//           { model: Branch, as: "branch", attributes: ["id", "name"] },
//           { model: Department, as: "department", attributes: ["id", "name"] },
//           { model: Designation, as: "designation", attributes: ["id", "name"] },
//         ],
//         order: [["id", "DESC"]],
//       });
//     }

//     // =====================================
//     // 🧾 Create Excel File (Dynamic Bank Sheet Format)
//     // =====================================

//     const folderPath = path.join(__dirname, "..", "excel");
//     if (!fs.existsSync(folderPath)) {
//       fs.mkdirSync(folderPath, { recursive: true });
//     }

//     const workbook = new ExcelJS.Workbook();
//     const worksheet = workbook.addWorksheet("Bank Payment");

//     // 🔹 Dynamic Header Title
//     const branchName = employees[0]?.branch?.name || "Company";
//     const today = new Date();
//     const formattedDate = today.toLocaleDateString("en-GB", {
//       day: "2-digit",
//       month: "short",
//       year: "2-digit",
//     });

//     const title = `${branchName} Site Bank Payment Sheet - ${formattedDate}`;

//     // 🔹 Merge title row
//     worksheet.mergeCells("A1:E1");
//     worksheet.getCell("A1").value = title;
//     worksheet.getCell("A1").alignment = { horizontal: "center" };
//     worksheet.getCell("A1").font = { bold: true, size: 14 };

//     // 🔹 Column Headers
//     worksheet.addRow([]);
//     worksheet.addRow(["Sl.No.", "Name", "Acc.No.", "IFSC CODE", "Amount"]);
//     const headerRow = worksheet.getRow(3);
//     headerRow.font = { bold: true };
//     headerRow.alignment = { horizontal: "center" };

//     // 🔹 Add Data Rows
//     let total = 0;
//     employees.forEach((e, i) => {
//       const emp = e.toJSON();
//       const amount = Number(emp.salary || 0);
//       total += amount;

//       worksheet.addRow([
//         i + 1,
//         emp.name || "",
//         emp.account_number || "",
//         emp.bank_identifier_code || "",
//         amount,
//       ]);
//     });

//     // 🔹 Add total row
//     const totalRow = worksheet.addRow(["", "", "", "Total", total]);
//     totalRow.font = { bold: true };

//     // 🔹 Adjust column widths
//     worksheet.columns = [
//       { width: 8 },
//       { width: 25 },
//       { width: 25 },
//       { width: 20 },
//       { width: 15 },
//     ];

//     // 🔹 Save file
//     const fileName = `bank_payment_sheet_${Date.now()}.xlsx`;
//     const filePath = path.join(folderPath, fileName);
//     await workbook.xlsx.writeFile(filePath);

//     return res.json({
//       success: true,
//       count: employees.length,
//       downloadUrl: `/excel/${fileName}`,
//       message: "Bank payment sheet generated successfully",
//     });

//   } catch (err) {
//     console.error("❌ Error getAllEmployeesSummary:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Server error",
//       error: err.message,
//     });
//   }
// };








// exports.updateEmbedding = async (req, res) => {
//   try {
//     // Support both :employee_id and :id in route
//     const employee_id = req.params.employee_id || req.params.id;

//     // console.log("🔎 Params received:", req.params);
//     // console.log("👉 employee_id used:", employee_id);

//     if (!employee_id) {
//       return res.status(400).json({
//         success: false,
//         message: "Employee ID is required in the URL"
//       });
//     }

//     const { embedding } = req.body;

//     if (!embedding || !Array.isArray(embedding)) {
//       return res.status(400).json({
//         success: false,
//         message: "Embedding must be an array"
//       });
//     }

//     // Find employee by employee_id
//     const employee = await Employee.findOne({ where: { employee_id } });

//     if (!employee) {
//       return res.status(404).json({
//         success: false,
//         message: "Employee not found"
//       });
//     }

//     // Ensure existing embeddings are arrays (not strings)
//     const existingEmbedding = Array.isArray(employee.biometric_emp_id)
//       ? employee.biometric_emp_id
//       : [];

//     const updatedEmbedding = [...existingEmbedding, ...embedding];

//     // Save back to DB
//     employee.biometric_emp_id = updatedEmbedding;
//     await employee.save();

//     return res.status(200).json({
//       success: true,
//       message: "Embedding updated successfully",
//       data: employee
//     });

//   } catch (error) {
//     console.error("❌ updateEmbedding error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Error updating embedding",
//       error: error.message
//     });
//   }
// };







// const bcrypt = require('bcrypt');
// const { Sequelize, Op } = require('sequelize');


// const Employee = require('../models/employee.model');
// const User = require('../models/user.model');
// const Department = require('../models/department.model');
// const Branch = require('../models/branch.model');
// const Designation = require('../models/designation.model');
// const Document = require('../models/document.model');
// const EmployeeDocument = require('../models/employee_document.model');

// const Role = require('../models/role.model');
// const RoleUser = require('../models/roleuser.model');





// async function getUserBranchId(userId) {
//   const emp = await Employee.findOne({
//     where: { user_id: userId },
//     attributes: ['branch_id'],
//     raw: true,
//   });
//   return emp?.branch_id || null;
// }


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

// async function hasBranch(userId) {
//   const emp = await Employee.findOne({
//     where: { user_id: userId },
//     attributes: ['branch_id'],
//     raw: true,
//   });
//   return !!(emp && emp.branch_id);
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


// exports.getAllEmployees = async (req, res) => {
//   try {
//     console.log('🎯 START getAllEmployees');
//     console.log('🔍 User Info - ID:', req.user.id, 'Type:', req.user.type);

//     const companyId = await getCompanyId(req);
//     let employees;

//     if (isSuper(req)) {
//       // ✅ Super admin → see all employees
//       console.log('🟡 Super Admin Access');
//       employees = await Employee.findAll({
//         where: { deleted_at: null },
//         include: [
//           { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
//           { model: Branch, as: 'branch', attributes: ['id', 'name'] },
//           { model: Department, as: 'department', attributes: ['id', 'name'] },
//           { model: Designation, as: 'designation', attributes: ['id', 'name'] },
//         ],
//         order: [['id', 'DESC']],
//       });

//     } else if ((req.user?.type || '').toLowerCase() === 'company') {
//       // ✅ Company login → all employees under company (all branches)
//       console.log('🟡 Company User Access');
//       const allowedUserIds = await getAllUserIdsUnderCompanyBranch(companyId, null);
//       employees = await Employee.findAll({
//         where: { created_by: { [Op.in]: allowedUserIds }, deleted_at: null },
//         include: [
//           { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
//           { model: Branch, as: 'branch', attributes: ['id', 'name'] },
//           { model: Department, as: 'department', attributes: ['id', 'name'] },
//           { model: Designation, as: 'designation', attributes: ['id', 'name'] },
//         ],
//         order: [['id', 'DESC']],
//       });

//     } else {
//       // 🔹 Check if logged-in user has an Employee record
//       const emp = await Employee.findOne({
//         where: { user_id: req.user.id },
//         attributes: ['id', 'branch_id'],
//       });

//       if (emp) {
//         // 🟢 UPDATED AREA: Branch User → ONLY their own branch employees
//         console.log('🟡 Branch User Access');
//         const branchId = emp.branch_id;
//         console.log('🔍 Branch ID for Branch User:', branchId);
        
//         if (!companyId) {
//           return res.status(403).json({ success: false, message: 'Unauthorized' });
//         }

//         // 🟢 SIMPLIFIED: Branch users only see employees in THEIR OWN BRANCH
//         // No need for complex allowedUserIds logic for branch users
//         employees = await Employee.findAll({
//           where: { 
//             branch_id: branchId, // 🟢 ONLY employees in same branch
//             deleted_at: null 
//           },
//           include: [
//             { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
//             { model: Branch, as: 'branch', attributes: ['id', 'name'] },
//             { model: Department, as: 'department', attributes: ['id', 'name'] },
//             { model: Designation, as: 'designation', attributes: ['id', 'name'] },
//           ],
//           order: [['id', 'DESC']],
//         });

//         console.log('🔍 Branch User - Employees in Branch', branchId + ':', employees.length);

//       } else {
//         // 🟢 Branchless user → FULL DATABASE ACCESS (all branches)
//         console.log('🟡 Branchless User Access (FULL DATABASE)');
//         employees = await Employee.findAll({
//           where: { deleted_at: null },
//           include: [
//             { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
//             { model: Branch, as: 'branch', attributes: ['id', 'name'] },
//             { model: Department, as: 'department', attributes: ['id', 'name'] },
//             { model: Designation, as: 'designation', attributes: ['id', 'name'] },
//           ],
//           order: [['id', 'DESC']],
//         });
//         console.log('🔍 Branchless User - All Employees Count:', employees.length);
//       }
//     }

//     console.log('🔍 Final Employees Count:', employees?.length || 0);
//     console.log('✅ END getAllEmployees - Success');
//     return res.json({ success: true, data: employees });

//   } catch (err) {
//     console.error('❌ Error getAllEmployees:', err);
//     return res.status(500).json({ message: 'Server error', error: err.message });
//   }
// };


// exports.getEmployeeById = async (req, res) => {
//   try {
//     console.log('🎯 START getEmployeeById');
//     console.log('🔍 User Info - ID:', req.user.id, 'Type:', req.user.type);
//     console.log('🔍 Requested Employee ID:', req.params.id);

//     const companyId = await getCompanyId(req);
//     console.log('🔍 Company ID:', companyId);

//     let where;

//     if (isSuper(req)) {
//       // ✅ Super admin can see any employee
//       console.log('🟡 Super Admin Access');
//       where = { employee_id: req.params.id };

//     } else if (isEmployee(req)) {
//       // ✅ Employee can only see their own profile
//       console.log('🟡 Employee Access - Own Profile Only');
//       const emp = await Employee.findOne({ where: { user_id: req.user.id } });
//       if (!emp || String(emp.employee_id) !== String(req.params.id)) {
//         return res.status(403).json({ success: false, message: 'Forbidden: you can only view your own profile' });
//       }
//       where = { id: emp.id };

//     } else {
//       // 🔹 Check if logged-in user has an Employee record (has branch)
//       const userEmployeeRecord = await Employee.findOne({
//         where: { user_id: req.user.id },
//         attributes: ['branch_id', 'created_by'],
//         raw: true,
//       });

//       console.log('🔍 User Employee Record:', userEmployeeRecord);

//       if (userEmployeeRecord && userEmployeeRecord.branch_id) {
//         // 🟢 UPDATED AREA: Branch User → can only access employees in their own branch
//         console.log('🟡 Branch User Access');
//         const branchId = userEmployeeRecord.branch_id;
//         console.log('🔍 Branch ID for Branch User:', branchId);

//         // 🔹 Find the target employee
//         const targetEmp = await Employee.findOne({
//           where: { employee_id: req.params.id },
//           attributes: ['id', 'branch_id', 'created_by'],
//         });

//         if (!targetEmp) {
//           return res.status(404).json({ success: false, message: 'Employee not found' });
//         }

//         // 🟢 BRANCH-LEVEL RESTRICTION: Only allow if target employee is in same branch
//         if (Number(targetEmp.branch_id) !== Number(branchId)) {
//           return res.status(403).json({ 
//             success: false, 
//             message: 'Forbidden: you can only access employees in your own branch' 
//           });
//         }

//         // ✅ Same branch → allow access
//         where = { id: targetEmp.id };
//         console.log('🔍 Branch User - Access granted to employee in same branch');

//       } else {
//         // 🟢 UPDATED AREA: Branchless User → can access ANY employee in the company
//         console.log('🟡 Branchless User Access (FULL ACCESS)');
        
//         if (!companyId) {
//           return res.status(403).json({ success: false, message: 'Unauthorized' });
//         }

//         // 🟢 Get all users under company (for created_by check)
//         const allowedUserIds = await getAllUserIdsUnderCompanyBranch(companyId, null);
        
//         where = {
//           employee_id: req.params.id,
//           created_by: { [Op.in]: allowedUserIds }
//         };
//         console.log('🔍 Branchless User - Access to any employee in company');
//       }
//     }

//     // 🔹 Fetch employee with relations
//     const employee = await Employee.findOne({
//       where,
//       include: [
//         { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
//         { model: Branch, as: 'branch', attributes: ['id', 'name'] },
//         { model: Department, as: 'department', attributes: ['id', 'name'] },
//         { model: Designation, as: 'designation', attributes: ['id', 'name'] },
//       ],
//     });

//     if (!employee) {
//       console.log('❌ Employee not found with criteria');
//       return res.status(404).json({ success: false, message: 'Employee not found' });
//     }

//     console.log('✅ Employee found, access granted');
//     return res.json({ success: true, data: employee });

//   } catch (err) {
//     console.error('❌ Error getEmployeeById:', err);
//     return res.status(500).json({ message: 'Server error', error: err.message });
//   }
// };


// exports.createEmployee = async (req, res) => {
//   const t = await Employee.sequelize.transaction();
//   try {
//     console.log('🎯 START createEmployee');
//     console.log('🔍 User Info - ID:', req.user.id, 'Type:', req.user.type);

//     // 🟢 Check if user exists in employees table (has branch)
//     const userEmployeeRecord = await Employee.findOne({
//       where: { user_id: req.user.id },
//       attributes: ['branch_id', 'created_by'],
//       raw: true,
//     });

//     console.log('🔍 User Employee Record:', userEmployeeRecord);

//     let companyId;
//     let creatorId = req.user.id;
//     let userBranchId = null;

//     // 🟢 SUPER ADMIN: Full access
//     if (isSuper(req)) {
//       console.log('🟡 Super Admin - Creating employee');
//       companyId = await getCompanyId(req);
//       // Super admin can create employees for any company
//     } 
//     else if (userEmployeeRecord && userEmployeeRecord.branch_id) {
//       // 🟢 CASE 1: User has employee record with branch → branch-level access
//       console.log('🟡 Branch User Access - Creating employee');
//       userBranchId = userEmployeeRecord.branch_id;
//       companyId = userEmployeeRecord.created_by;
      
//       if (!companyId) {
//         await t.rollback();
//         return res.status(403).json({ success: false, message: 'Unauthorized' });
//       }

//       // 🟢 Branch users can only create employees in their own branch
//       if (req.body.branch_id && Number(req.body.branch_id) !== Number(userBranchId)) {
//         await t.rollback();
//         return res.status(403).json({ 
//           success: false, 
//           message: 'Branch users can only create employees in their own branch' 
//         });
//       }
      
//       // Auto-assign to user's branch if not specified
//       if (!req.body.branch_id) {
//         req.body.branch_id = userBranchId;
//       }
//     } 
//     else {
//       // 🟢 CASE 2: User doesn't have employee record (no branch) → company-wide access
//       console.log('🟡 Branchless User Access - Creating employee');
//       companyId = await getCompanyId(req);
      
//       if (!companyId) {
//         await t.rollback();
//         return res.status(403).json({ success: false, message: 'Unauthorized' });
//       }
      
//       // 🟢 Branchless users can create employees in any branch
//       // No branch restrictions applied
//     }

//     console.log('🔍 Final Company ID:', companyId);
//     console.log('🔍 User Branch ID:', userBranchId);

//     const data = { ...req.body };
//     delete data.employee_id; 
//     data.created_by = creatorId;

//     // 🔹 [UPDATED AREA #1] — Allow new optional employee fields
//     const allowedFields = ['uan_number', 'ip_number', 'father_name', 'skills' , 'gatepassno'];
//     for (const field of allowedFields) {
//       if (req.body[field] !== undefined) data[field] = req.body[field];
//     }

//     // 🔹 [UPDATED AREA #2] — Validate "skills" value
//     if (data.skills) {
//       const validSkills = ['High Skills', 'Skills', 'Semi Skills', 'Unskills'];
//       if (!validSkills.includes(data.skills)) {
//         await t.rollback();
//         return res.status(422).json({
//           success: false,
//           message: `Invalid skills value. Must be one of: ${validSkills.join(', ')}`
//         });
//       }
//     }

//     // 🔹 [OPTIONAL] Validate UAN & IP formats
//     if (data.uan_number && !/^\d{12}$/.test(data.uan_number)) {
//       await t.rollback();
//       return res.status(422).json({
//         success: false,
//         message: 'Invalid UAN number format (must be 12 digits).'
//       });
//     }

//     if (data.ip_number && !/^\d{10}$/.test(data.ip_number)) {
//       await t.rollback();
//       return res.status(422).json({
//         success: false,
//         message: 'Invalid IP number format (must be 10 digits).'
//       });
//     }

//     // 🟢 UPDATED DUPLICATE CHECK LOGIC
//     // if (data.aadhaar_number) {
//     //   let checkUserIds;
      
//     //   if (userEmployeeRecord && userEmployeeRecord.branch_id) {
//     //     // 🟢 Branch user: Check only within their branch
//     //     checkUserIds = await getAllUserIdsUnderCompanyBranch(companyId, userBranchId);
//     //   } else {
//     //     // 🟢 Branchless user/Super admin: Check entire company
//     //     checkUserIds = await getAllUserIdsUnderCompanyBranch(companyId, null);
//     //   }

//     //   const existingEmp = await Employee.findOne({
//     //     where: {
//     //       aadhaar_number: data.aadhaar_number.trim(),
//     //       created_by: { [Op.in]: checkUserIds },
//     //       deleted_at: null
//     //     },
//     //     transaction: t
//     //   });

//     //   if (existingEmp) {
//     //     await t.rollback();
//     //     return res.status(422).json({
//     //       success: false,
//     //       message: `Employee already exists with this Aadhaar number`
//     //     });
//     //   }
//     // }
    
//     // ???? UPDATED DUPLICATE CHECK LOGIC
//     if (data.aadhaar_number) {
//   let checkUserIds;
  
//   if (userEmployeeRecord && userEmployeeRecord.branch_id) {
//     checkUserIds = await getAllUserIdsUnderCompanyBranch(companyId, userBranchId);
//   } else {
//     checkUserIds = await getAllUserIdsUnderCompanyBranch(companyId, null);
//   }

//   // ? FIX: Ensure aadhaar_number is a string before calling trim()
//   const aadhaarString = String(data.aadhaar_number).trim();

//   const existingEmp = await Employee.findOne({
//     where: {
//       aadhaar_number: aadhaarString,  // ? Now safely using trimmed string
//       created_by: { [Op.in]: checkUserIds },
//       deleted_at: null
//     },
//     transaction: t
//   });

//   if (existingEmp) {
//     await t.rollback();
//     return res.status(422).json({
//       success: false,
//       message: `Employee already exists with this Aadhaar number`
//     });
//   }
// }



//     // 🔹 CHECK DUPLICATE PHONE NUMBER - UPDATED LOGIC
//     // if (data.phone) {
//     //   let checkUserIds;
      
//     //   if (userEmployeeRecord && userEmployeeRecord.branch_id) {
//     //     // 🟢 Branch user: Check only within their branch
//     //     checkUserIds = await getAllUserIdsUnderCompanyBranch(companyId, userBranchId);
//     //   } else {
//     //     // 🟢 Branchless user/Super admin: Check entire company
//     //     checkUserIds = await getAllUserIdsUnderCompanyBranch(companyId, null);
//     //   }
    
//     //   const existingPhone = await Employee.findOne({
//     //     where: {
//     //       phone: data.phone.trim(),
//     //       created_by: { [Op.in]: checkUserIds },
//     //       deleted_at: null
//     //     },
//     //     transaction: t
//     //   });
    
//     //   if (existingPhone) {
//     //     await t.rollback();
//     //     return res.status(422).json({
//     //       success: false,
//     //       message: `Employee already exists with this phone number.`
//     //     });
//     //   }
//     // }
    
//     if (data.phone) {
//       let checkUserIds;
      
//       if (userEmployeeRecord && userEmployeeRecord.branch_id) {
//         checkUserIds = await getAllUserIdsUnderCompanyBranch(companyId, userBranchId);
//       } else {
//         checkUserIds = await getAllUserIdsUnderCompanyBranch(companyId, null);
//       }
    
//       // ? FIX: Ensure phone is a string before calling trim()
//       const phoneString = String(data.phone).trim();
      
//       const existingPhone = await Employee.findOne({
//         where: {
//           phone: phoneString,  // ? Now safely using trimmed string
//           created_by: { [Op.in]: checkUserIds },
//           deleted_at: null
//         },
//         transaction: t
//       });
    
//       if (existingPhone) {
//         await t.rollback();
//         return res.status(422).json({
//           success: false,
//           message: `Employee already exists with this phone number.`
//         });
//       }
//     }


//     // ... rest of your existing code remains the same ...


//     if (data.password) {
//       const salt = await bcrypt.genSalt(10);
//       data.password = await bcrypt.hash(data.password, salt);
//     }

//     const user = await User.create(
//       {
//         name: data.name,
//         email: data.email,
//         password: data.password,
//         type: 'Employee',  
//         created_by: creatorId,     // IMPORTANT: company owner
//       },
//       { transaction: t }
//     );

//     const employeeRole = await Role.findOne({ where: { name: 'Employee' } });
//     if (!employeeRole) {
//       throw new Error("Role 'Employee' not found. Seed roles first.");
//     }
//     await RoleUser.create(
//       {
//         role_id: employeeRole.id,
//         model_type: 'App\\Models\\User', 
//         model_id: user.id,
//       },
//       { transaction: t }
//     );

//     data.user_id = user.id;
    


    
   
//     async function getAllUserIdsUnderCompany(companyId) {
//       const users = await User.findAll({
//         where: { created_by: companyId },
//         attributes: ['id']
//       });
//       return users.map(u => u.id).concat(companyId);
//     }
    
//     const allCompanyUserIds = await getAllUserIdsUnderCompany(companyId);
    
//     const maxEmp = await Employee.findOne({
//       where: { created_by: { [Op.in]: allCompanyUserIds } },
//       attributes: ['employee_id'],
//       order: [[Sequelize.cast(Sequelize.col('employee_id'), 'UNSIGNED'), 'DESC']],

//       lock: t.LOCK.UPDATE,      
//       transaction: t
//     });
    
//     // 🔹 Next numeric employee_id
//     const nextEmpNo = (Number(maxEmp?.employee_id) || 0) + 1;
//     data.employee_id = nextEmpNo;



    
    


//     const requiredDocs = await Document.findAll({
//       where: {
//         is_required: { [Op.in]: ['1', 1, true, 'true'] },
//         created_by: companyId,
//       },
//       attributes: ['id'],
//       transaction: t,
//     });
//     const requiredDocIds = requiredDocs.map(d => Number(d.id));

//     const uploadedDocIds = new Set();
//     const filePayloads = [];

//     const collectFromFile = (file, fieldnameForId) => {
//       const source = fieldnameForId || file.fieldname || '';
//       const m = String(source).match(/(\d+)/); // first number in field name
//       if (!m) return;
//       const document_id = Number(m[1]);
//       uploadedDocIds.add(document_id);
//       filePayloads.push({
//         document_id,
//         document_value: file.filename, 
//       });
//     };

//     if (Array.isArray(req.files)) {
//       for (const f of req.files) collectFromFile(f);
//     } else if (req.files && typeof req.files === 'object') {
//       for (const [field, files] of Object.entries(req.files)) {
//         for (const f of files) collectFromFile(f, field);
//       }
//     }

//     const missingRequired = requiredDocIds.filter(id => !uploadedDocIds.has(id));
//     if (requiredDocIds.length && missingRequired.length) {
//       await t.rollback();
//       return res.status(422).json({
//         success: false,
//         message: 'Missing required documents',
//         required_document_ids: requiredDocIds,
//         missing_document_ids: missingRequired,
//       });
//     }

//     data.documents = Array.from(uploadedDocIds).join(',');

//     const employee = await Employee.create(data, { transaction: t });

//     const now = new Date();
//     for (const it of filePayloads) {
//       await EmployeeDocument.create(
//         {
//           employee_id: employee.id,
//           document_id: it.document_id,
//           document_value: it.document_value,
//           created_by: creatorId, 
//           gatepassno: req.body.gatepassno || null,

//           created_at: now,
//           updated_at: now,
//         },
//         { transaction: t }
//       );
//     }

//     await t.commit();
//     return res.status(201).json({ success: true, data: employee });
//   } catch (err) {
//     await t.rollback();
//     return res.status(500).json({ success: false, message: 'Error creating employee', error: err.message });
//   }
// };


// exports.updateEmployee = async (req, res) => {
//   const t = await Employee.sequelize.transaction();
//   try {
//     const companyId = await getCompanyId(req);
    
//         // 🔹 NEW: capture actual logged-in user id
//     const creatorId = req.user.id;  
//     const employee = await Employee.findOne({
//         where: { employee_id: req.params.id },   // ✅ match business ID
//         transaction: t,
//     });
    
//     // 🔹 HIGHLIGHTED UPDATE: ownership check based on role/user type
//     if (!employee) {
//       await t.rollback();
//       return res.status(404).json({ success: false, message: 'Employee not found' });
//     }
    

//     // 🟢 UPDATED AREA: Access Control Logic
//     if (!isSuper(req)) {
//       // 🔹 Check if logged-in user has an Employee record (has branch)
//       const userEmployeeRecord = await Employee.findOne({
//         where: { user_id: req.user.id },
//         attributes: ['branch_id', 'created_by'],
//         raw: true,
//       });
    
//       console.log('🔍 User Employee Record:', userEmployeeRecord);
    
//       if (userEmployeeRecord && userEmployeeRecord.branch_id) {
//         // 🟢 BRANCH USER: Can only update employees in their own branch
//         console.log('🟡 Branch User Access - Update');
//         const branchId = userEmployeeRecord.branch_id;
//         console.log('🔍 Branch ID for Branch User:', branchId);
    
//         // 🟢 BRANCH-LEVEL RESTRICTION: Only allow if target employee is in same branch
//         if (Number(employee.branch_id) !== Number(branchId)) {
//           await t.rollback();
//           return res.status(403).json({ 
//             success: false, 
//             message: 'Forbidden: you can only update employees in your own branch' 
//           });
//         }
//         console.log('🔍 Branch User - Update access granted to employee in same branch');
    
//       } else {
//         // 🟢 BRANCHLESS USER: Can update ANY employee in the company
//         console.log('🟡 Branchless User Access - Update (FULL ACCESS)');
        
//         if (!companyId) {
//           await t.rollback();
//           return res.status(403).json({ success: false, message: 'Unauthorized' });
//         }
    
//         // 🟢 Get all users under company (for created_by check)
//         const allowedUserIds = await getAllUserIdsUnderCompanyBranch(companyId, null);
        
//         // 🟢 Check if employee was created by company or branchless users
//         if (!allowedUserIds.map(String).includes(String(employee.created_by))) {
//           await t.rollback();
//           return res.status(403).json({ 
//             success: false, 
//             message: 'Forbidden: you can only update employees in your company' 
//           });
//         }
//         console.log('🔍 Branchless User - Update access granted to company employee');
//       }
//     } else {
//       console.log('🟡 Super Admin Access - Update');
//     }
//     // 🟢 END UPDATED AREA


//     // Step 2: Collect incoming data
//     const data = { ...req.body };
//     delete data.id;
//     delete data.employee_id;
//     delete data.created_by; // guard
    
    
//      // 🔹 HIGHLIGHTED AREA 3 — Validate new fields (uan_number, ip_number, father_name, skills)
     
//      if (data.gatepassno) {
// }

//     if (data.skills) {
//       const allowedSkills = ['High Skills', 'Skills', 'Semi Skills', 'Unskills'];
//       if (!allowedSkills.includes(data.skills)) {
//         await t.rollback();
//         return res.status(400).json({
//           success: false,
//           message: `Invalid skills value. Must be one of: ${allowedSkills.join(', ')}`,
//         });
//       }
//     }

//     if (data.uan_number && !/^\d{12}$/.test(data.uan_number)) {
//       await t.rollback();
//       return res.status(400).json({ success: false, message: 'Invalid UAN number format (must be 12 digits).' });
//     }

//     if (data.ip_number && !/^\d{10}$/.test(data.ip_number)) {
//       await t.rollback();
//       return res.status(400).json({ success: false, message: 'Invalid IP number format (must be 10 digits).' });
//     }
//     // 🔹 END HIGHLIGHTED AREA 3


//     // Step 3: Hash password if present
//     if (data.password) {
//       const salt = await bcrypt.genSalt(10);
//       data.password = await bcrypt.hash(data.password, salt);
//     }

//     // Step 4: Update related User record if needed
//     const userUpdates = {};
//     if (data.name) userUpdates.name = data.name;
//     if (data.email) userUpdates.email = data.email;
//     if (data.password) userUpdates.password = data.password;

//     if (Object.keys(userUpdates).length) {
//       await User.update(userUpdates, { where: { id: employee.user_id }, transaction: t });
//     }

//     // Step 5: Required Documents (company-wise)
//     const requiredDocs = await Document.findAll({
//       where: {
//         is_required: { [Op.in]: ['1', 1, true, 'true'] },
//         created_by: employee.created_by, // ensure same company
//       },
//       attributes: ['id'],
//       transaction: t,
//     });
//     const requiredDocIds = requiredDocs.map(d => Number(d.id));

//     // Step 6: Parse uploaded files
//     const uploadedDocIds = new Set();
//     const filePayloads = [];

//     const collectFromFile = (file, fieldnameForId) => {
//       const source = fieldnameForId || file.fieldname || '';
//       const mAll = String(source).match(/(\d+)/g);
//       const num = mAll ? mAll[mAll.length - 1] : null;
//       if (!num) return;
//       const document_id = Number(num);
//       if (!isNaN(document_id)) {
//         uploadedDocIds.add(document_id);
//         filePayloads.push({
//           document_id,
//         //   document_value: `misc/${file.filename}`,
//         //   document_value: `employee_documents/${file.filename}`,
//           document_value: file.filename,

//         });
//       }
//     };

//     if (Array.isArray(req.files)) {
//       for (const f of req.files) collectFromFile(f);
//     } else if (req.files && typeof req.files === 'object') {
//       for (const [field, files] of Object.entries(req.files)) {
//         for (const f of files) collectFromFile(f, field);
//       }
//     }

//     // Step 7: Merge existing + uploaded doc IDs
//     const existingDocIds = (employee.documents || '')
//       .split(',')
//       .map(s => s.trim())
//       .filter(Boolean)
//       .map(n => Number(n))
//       .filter(n => !isNaN(n));

//     const finalDocIdsSet = new Set(existingDocIds);
//     for (const id of uploadedDocIds) finalDocIdsSet.add(Number(id));

//     // Step 8: Validate required documents
//     const missingRequired = requiredDocIds.filter(id => !finalDocIdsSet.has(id));
//     if (requiredDocIds.length && missingRequired.length) {
//       await t.rollback();
//       return res.status(422).json({
//         success: false,
//         message: 'Missing required documents',
//         required_document_ids: requiredDocIds,
//         missing_document_ids: missingRequired,
//       });
//     }

//     // Step 9: Persist changes
//     const documentsStr = Array.from(finalDocIdsSet).length ? Array.from(finalDocIdsSet).join(',') : null;

//     employee.set({
//       ...data,
//       documents: documentsStr,
//       updated_at: new Date(),
//     });

//     await employee.save({ transaction: t });

//     // Step 10: Insert new uploaded documents (only new ones)
//     // const now = new Date();
//     // for (const it of filePayloads) {
//     //   await EmployeeDocument.create(
//     //     {
//     //       employee_id: employee.id,
//     //       document_id: it.document_id,
//     //       document_value: it.document_value,
//     //       created_by: employee.created_by,
//     //       created_at: now,
//     //       updated_at: now,
//     //     },
//     //     { transaction: t }
//     //   );
//     // }
    
//     const now = new Date();
//     for (const it of filePayloads) {
//       // Check if document already exists
//       const existingDoc = await EmployeeDocument.findOne({
//         where: {
//           employee_id: employee.id,
//           document_id: it.document_id
//         },
//         transaction: t
//       });
    
//       if (existingDoc) {
//         // UPDATE existing document
//         await existingDoc.update({
//           document_value: it.document_value,
//           updated_at: now
//         }, { transaction: t });
//       } else {
//         // CREATE new document
//         await EmployeeDocument.create({
//           employee_id: employee.id,
//           document_id: it.document_id,
//           document_value: it.document_value,
//           created_by: employee.created_by,
//           created_at: now,
//           updated_at: now,
//         }, { transaction: t });
//       }
//     }

//     await t.commit();

//     const updatedEmployee = await Employee.findByPk(employee.id, {
//       include: [
//         { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
//         { model: Branch, as: 'branch', attributes: ['id', 'name'] },
//         { model: Department, as: 'department', attributes: ['id', 'name'] },
//         { model: Designation, as: 'designation', attributes: ['id', 'name'] },
//       ],
//     });

//     return res.status(200).json({ success: true, data: updatedEmployee });
//   } catch (err) {
//     await t.rollback();
//     return res.status(500).json({ success: false, message: 'Error updating employee', error: err.message });
//   }
// };


// exports.deleteEmployee = async (req, res) => {
//   try {
//     const companyId = await getCompanyId(req);

//     // 🔹 Fetch employee by business ID
//     const employee = await Employee.findOne({ where: { employee_id: req.params.id } });
//     if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });

//     // 🔹 HIGHLIGHTED: Get logged-in user employee record (for branch check)
//     let currentEmp = null;
//     if (!isSuper(req) && (req.user?.type || '').toLowerCase() !== 'company') {
//       currentEmp = await Employee.findOne({ where: { user_id: req.user.id } });
//       if (!currentEmp) {
//         return res.status(403).json({ success: false, message: 'Forbidden: you are not an employee' });
//       }
//     }

//     // 🔹 Permission check
//     if (!isSuper(req)) {
//       const userType = (req.user?.type || '').toLowerCase();

//       if (userType === 'company') {
//         // ✅ Company user can delete employees created by itself or its child users
//         const allCompanyUserIds = await User.findAll({
//           where: { created_by: companyId },
//           attributes: ['id']
//         }).then(users => users.map(u => u.id).concat(companyId));

//         if (!allCompanyUserIds.includes(employee.created_by)) {
//           return res.status(403).json({ success: false, message: 'Forbidden: not your employee' });
//         }
//       } else {
//         // 🔹 OLD CODE (only self-owned check)
//         /*
//         if (Number(employee.created_by) !== Number(req.user.id)) {
//           return res.status(403).json({ success: false, message: 'Forbidden: not your employee' });
//         }
//         */

//         // 🔹 NEW CODE: Branch-level check
//         if (String(currentEmp.branch_id) !== String(employee.branch_id)) {
//           return res.status(403).json({ success: false, message: 'Forbidden: employee is in another branch' });
//         }
//       }
//     }

//     // 🔹 Soft delete instead of hard delete
//     await employee.update({ deleted_at: new Date() });

//     res.json({ success: true, message: 'Employee soft deleted successfully' });
//   } catch (err) {
//     console.error('❌ Error deleting employee:', err);
//     res.status(500).json({ success: false, message: 'Error deleting employee', error: err.message });
//   }
// };


// exports.checkAadhaar = async (req, res) => {
//   try {
//     const { aadhaar_number } = req.body;

//     if (!aadhaar_number || !/^\d{12}$/.test(aadhaar_number)) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid Aadhaar number. Must be 12 digits.',
//       });
//     }

//     const companyId = await getCompanyId(req);

//     // Get all user IDs under this company
//     const allUserIds = await User.findAll({
//       where: { created_by: companyId },
//       attributes: ['id'],
//       raw: true,
//     }).then(users => users.map(u => u.id).concat(companyId));

//     // Trim input
//     const aadhaarClean = aadhaar_number.trim();

//     const employee = await Employee.findOne({
//       where: {
//         aadhaar_number: aadhaarClean,
//         created_by: { [Op.in]: allUserIds },
//         deleted_at: null
//       },
//       include: [
//         { model: Branch, as: 'branch', attributes: ['id', 'name'] }
//       ]
//     });

//     if (employee) {
//       return res.status(200).json({
//         success: true,
//         exists: true,
//         message: `Employee already exists in branch: ${employee.branch?.name || 'N/A'}`,
//         data: {
//           id: employee.id,
//           name: employee.name,
//           employee_id: employee.employee_id,
//           branch: employee.branch ? { id: employee.branch.id, name: employee.branch.name } : null
//         }
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       exists: false,
//       message: 'No employee found with this Aadhaar number. You can proceed to create.',
//     });

//   } catch (err) {
//     console.error('❌ Error in checkAadhaar:', err);
//     return res.status(500).json({
//       success: false,
//       message: 'Server error checking Aadhaar',
//       error: err.message
//     });
//   }
// };


// exports.rejoinEmployee = async (req, res) => {
//   const t = await Employee.sequelize.transaction();
//   try {
//     const { aadhaar_number, rejoin_reason } = req.body;

//     // 🔹 Validate input
//     if (!aadhaar_number || !/^\d{12}$/.test(aadhaar_number.trim())) {
//       await t.rollback();
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid Aadhaar number. Must be 12 digits.',
//       });
//     }

//     if (!rejoin_reason || rejoin_reason.trim().length === 0) {
//       await t.rollback();
//       return res.status(400).json({
//         success: false,
//         message: 'Rejoin reason is required.',
//       });
//     }

//     const companyId = await getCompanyId(req);

//     // 🔹 Get all user IDs under the company
//     const allUserIds = await User.findAll({
//       where: { created_by: companyId },
//       attributes: ['id'],
//       raw: true,
//     }).then(users => users.map(u => u.id).concat(companyId));

//     const aadhaarClean = aadhaar_number.trim();

//     // 🔹 Find employee by Aadhaar
//     const employee = await Employee.findOne({
//       where: {
//         aadhaar_number: aadhaarClean,
//         created_by: { [Op.in]: allUserIds },
//       },
//       include: [{ model: Branch, as: 'branch', attributes: ['id', 'name'] }],
//       transaction: t,
//     });

//     if (!employee) {
//       await t.rollback();
//       return res.status(404).json({
//         success: false,
//         message: 'No employee found with this Aadhaar number under your company.',
//       });
//     }

//     console.log('🔍 Employee Current Status:', {
//       id: employee.id,
//       name: employee.name,
//       employee_id: employee.employee_id,
//       is_active: employee.is_active,
//       branch: employee.branch ? employee.branch.name : 'No branch'
//     });

//     // 🔴 OLD CODE (Restrictive - blocking active employees):
//     // // 🟢 Check if employee is already active
//     // if (employee.is_active === 1 || employee.is_active === true) {
//     //   await t.rollback();
//     //   return res.status(400).json({
//     //     success: false,
//     //     message: 'Employee is already active and cannot rejoin.',
//     //   });
//     // }

//     // 🟢 NEW CODE (Flexible - allow both active and inactive employees to rejoin):
//     let statusChange = false;
//     let previousStatus = employee.is_active ? "Active" : "Inactive/Terminated";

//     // If employee is inactive, activate them
//     if (employee.is_active === 0 || employee.is_active === false) {
//       statusChange = true;
//     }

//     // 🟢 UPDATED AREA — Store rejoin reason and reactivate if needed
//     const updateData = {
//       rejoin_reason: rejoin_reason.trim(),
//       updated_at: new Date(),
//     };

//     // Only activate if employee is currently inactive
//     if (statusChange) {
//       updateData.is_active = 1; // ✅ Change from 0 to 1 (inactive to active)
//       updateData.rejoin_date = new Date(); // ✅ Store rejoin date
//     }

//     await employee.update(updateData, { transaction: t });

//     // 🟢 Check and close termination record if exists
//     const Termination = require('../models/termination.model');
//     const termination = await Termination.findOne({
//       where: { 
//         employee_id: employee.id,
//         deleted_at: null 
//       },
//       transaction: t,
//     });

//     if (termination) {
//       await termination.update(
//         { 
//           deleted_at: new Date(),
//           rejoin_reason: rejoin_reason.trim() // ✅ Optional: Also store in termination table
//         },
//         { transaction: t }
//       );
//       console.log('✅ Termination record closed for employee:', employee.name);
//     }

//     await t.commit();

//     return res.status(200).json({
//       success: true,
//       message: `Employee ${employee.name} has been successfully processed for rejoining.`,
//       data: {
//         id: employee.id,
//         name: employee.name,
//         employee_id: employee.employee_id,
//         branch: employee.branch ? employee.branch.name : null,
//         rejoin_reason: rejoin_reason.trim(),
//         rejoin_date: statusChange ? new Date() : null,
//         previous_status: previousStatus,
//         current_status: statusChange ? "Active" : previousStatus,
//         is_active: statusChange ? 1 : employee.is_active,
//         status_changed: statusChange,
//         action: statusChange ? "Reactivated and Rejoined" : "Rejoin Reason Updated"
//       },
//     });
//   } catch (err) {
//     await t.rollback();
//     console.error('❌ Error in rejoinEmployee:', err);
//     return res.status(500).json({
//       success: false,
//       message: 'Server error during rejoin process.',
//       error: err.message,
//     });
//   }
// };


// exports.getEmployeesByBranch = async (req, res) => {
//   try {
//     const companyId = await getCompanyId(req);
//     const { branchId } = req.params;

//     let where = { branch_id: branchId }; // base condition

//     if (!isSuper(req)) {
//       const userType = (req.user?.type || '').toLowerCase();

//       if (userType === 'company') {
//         // ✅ Company login → fetch employees in this branch created by company or its subordinates
//         const companyUsers = await User.findAll({
//           where: { created_by: companyId },
//           attributes: ['id'],
//         });
//         const allowedUserIds = companyUsers.map(u => u.id).concat(companyId);
//         where.created_by = { [Op.in]: allowedUserIds };

//       } else {
//         // Check if user has an Employee record
//         const emp = await Employee.findOne({ where: { user_id: req.user.id } });

//         if (emp) {
//           // ✅ Employee-type role user → can only fetch their own branch
//           if (String(emp.branch_id) !== String(branchId)) {
//             return res.status(403).json({
//               success: false,
//               message: 'Forbidden: you cannot access another branch',
//             });
//           }
//           where.branch_id = branchId; // only this branch

//         } else {
//           // ✅ Direct role user (no Employee record) → can fetch all employees in this branch
//           where.branch_id = branchId; // no created_by restriction
//         }
//       }
//     }

//     const employees = await Employee.findAll({
//       where,
//       include: [
//         { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
//         { model: Branch, as: 'branch', attributes: ['id', 'name'] },
//         { model: Department, as: 'department', attributes: ['id', 'name'] },
//         { model: Designation, as: 'designation', attributes: ['id', 'name'] },
//       ],
//       order: [['id', 'DESC']],
//     });

//     res.status(200).json({ success: true, data: employees });
//   } catch (error) {
//     console.error('❌ Error fetching employees by branch:', error);
//     res.status(500).json({ success: false, message: 'Server Error', error: error.message });
//   }
// };




// const path = require("path");
// const fs = require("fs");
// const ExcelJS = require("exceljs");
// const PayslipType = require("../models/payslipType.model"); // ✅ add this


// exports.getAllEmployeesSummary = async (req, res) => {
//   try {
//     if (!req.user) {
//       return res.status(401).json({ success: false, message: "Unauthorized" });
//     }

//     const companyId = await getCompanyId(req);
//     let employees;

//     // =====================================
//     // 🧩 Role-based data visibility
//     // =====================================

//     if (isSuper(req)) {
//       employees = await Employee.findAll({
//         where: { deleted_at: null },
//         include: [
//           { model: PayslipType, as: "salaryType", attributes: ["name"] },
//           { model: User, as: "user", attributes: ["id", "name", "email"] },
//           { model: Branch, as: "branch", attributes: ["id", "name"] },
//           { model: Department, as: "department", attributes: ["id", "name"] },
//           { model: Designation, as: "designation", attributes: ["id", "name"] },
//         ],
//         order: [["id", "DESC"]],
//       });
//     } else if (isEmployee(req)) {
//       const emp = await Employee.findOne({
//         where: { user_id: req.user.id, deleted_at: null },
//         include: [
//           { model: PayslipType, as: "salaryType", attributes: ["name"] },
//           { model: User, as: "user", attributes: ["id", "name", "email"] },
//           { model: Branch, as: "branch", attributes: ["id", "name"] },
//           { model: Department, as: "department", attributes: ["id", "name"] },
//           { model: Designation, as: "designation", attributes: ["id", "name"] },
//         ],
//       });
//       employees = emp ? [emp] : [];
//     } else if ((req.user?.type || "").toLowerCase() === "company") {
//       const allowedUserIds = await getAllUserIdsUnderCompanyBranch(companyId, null);
//       employees = await Employee.findAll({
//         where: { created_by: { [Op.in]: allowedUserIds }, deleted_at: null },
//         include: [
//           { model: PayslipType, as: "salaryType", attributes: ["name"] },
//           { model: User, as: "user", attributes: ["id", "name", "email"] },
//           { model: Branch, as: "branch", attributes: ["id", "name"] },
//           { model: Department, as: "department", attributes: ["id", "name"] },
//           { model: Designation, as: "designation", attributes: ["id", "name"] },
//         ],
//         order: [["id", "DESC"]],
//       });
//     } else {
//       const branchId = await getUserBranchId(req.user.id);
//       if (!branchId) {
//         return res.status(403).json({ success: false, message: "No branch assigned" });
//       }

//       const allowedUserIds = await getAllUserIdsUnderCompanyBranch(companyId, branchId);
//       employees = await Employee.findAll({
//         where: {
//           branch_id: branchId,
//           created_by: { [Op.in]: allowedUserIds },
//           deleted_at: null,
//         },
//         include: [
//           { model: PayslipType, as: "salaryType", attributes: ["name"] },
//           { model: User, as: "user", attributes: ["id", "name", "email"] },
//           { model: Branch, as: "branch", attributes: ["id", "name"] },
//           { model: Department, as: "department", attributes: ["id", "name"] },
//           { model: Designation, as: "designation", attributes: ["id", "name"] },
//         ],
//         order: [["id", "DESC"]],
//       });
//     }

//     // =====================================
//     // 🧾 Create Excel File (Dynamic Bank Sheet Format)
//     // =====================================

//     const folderPath = path.join(__dirname, "..", "excel");
//     if (!fs.existsSync(folderPath)) {
//       fs.mkdirSync(folderPath, { recursive: true });
//     }

//     const workbook = new ExcelJS.Workbook();
//     const worksheet = workbook.addWorksheet("Bank Payment");

//     // 🔹 Dynamic Header Title
//     const branchName = employees[0]?.branch?.name || "Company";
//     const today = new Date();
//     const formattedDate = today.toLocaleDateString("en-GB", {
//       day: "2-digit",
//       month: "short",
//       year: "2-digit",
//     });

//     const title = `${branchName} Site Bank Payment Sheet - ${formattedDate}`;

//     // 🔹 Merge title row
//     worksheet.mergeCells("A1:E1");
//     worksheet.getCell("A1").value = title;
//     worksheet.getCell("A1").alignment = { horizontal: "center" };
//     worksheet.getCell("A1").font = { bold: true, size: 14 };

//     // 🔹 Column Headers
//     worksheet.addRow([]);
//     worksheet.addRow(["Sl.No.", "Name", "Acc.No.", "IFSC CODE", "Amount"]);
//     const headerRow = worksheet.getRow(3);
//     headerRow.font = { bold: true };
//     headerRow.alignment = { horizontal: "center" };

//     // 🔹 Add Data Rows
//     let total = 0;
//     employees.forEach((e, i) => {
//       const emp = e.toJSON();
//       const amount = Number(emp.salary || 0);
//       total += amount;

//       worksheet.addRow([
//         i + 1,
//         emp.name || "",
//         emp.account_number || "",
//         emp.bank_identifier_code || "",
//         amount,
//       ]);
//     });

//     // 🔹 Add total row
//     const totalRow = worksheet.addRow(["", "", "", "Total", total]);
//     totalRow.font = { bold: true };

//     // 🔹 Adjust column widths
//     worksheet.columns = [
//       { width: 8 },
//       { width: 25 },
//       { width: 25 },
//       { width: 20 },
//       { width: 15 },
//     ];

//     // 🔹 Save file
//     const fileName = `bank_payment_sheet_${Date.now()}.xlsx`;
//     const filePath = path.join(folderPath, fileName);
//     await workbook.xlsx.writeFile(filePath);

//     return res.json({
//       success: true,
//       count: employees.length,
//       downloadUrl: `/excel/${fileName}`,
//       message: "Bank payment sheet generated successfully",
//     });

//   } catch (err) {
//     console.error("❌ Error getAllEmployeesSummary:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Server error",
//       error: err.message,
//     });
//   }
// };








// exports.updateEmbedding = async (req, res) => {
//   try {
//     // Support both :employee_id and :id in route
//     const employee_id = req.params.employee_id || req.params.id;

//     // console.log("🔎 Params received:", req.params);
//     // console.log("👉 employee_id used:", employee_id);

//     if (!employee_id) {
//       return res.status(400).json({
//         success: false,
//         message: "Employee ID is required in the URL"
//       });
//     }

//     const { embedding } = req.body;

//     if (!embedding || !Array.isArray(embedding)) {
//       return res.status(400).json({
//         success: false,
//         message: "Embedding must be an array"
//       });
//     }

//     // Find employee by employee_id
//     const employee = await Employee.findOne({ where: { employee_id } });

//     if (!employee) {
//       return res.status(404).json({
//         success: false,
//         message: "Employee not found"
//       });
//     }

//     // Ensure existing embeddings are arrays (not strings)
//     const existingEmbedding = Array.isArray(employee.biometric_emp_id)
//       ? employee.biometric_emp_id
//       : [];

//     const updatedEmbedding = [...existingEmbedding, ...embedding];

//     // Save back to DB
//     employee.biometric_emp_id = updatedEmbedding;
//     await employee.save();

//     return res.status(200).json({
//       success: true,
//       message: "Embedding updated successfully",
//       data: employee
//     });

//   } catch (error) {
//     console.error("❌ updateEmbedding error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Error updating embedding",
//       error: error.message
//     });
//   }
// };






const bcrypt = require('bcrypt');
const { Sequelize, Op } = require('sequelize');


const Employee = require('../models/employee.model');
const User = require('../models/user.model');
const Department = require('../models/department.model');
const Branch = require('../models/branch.model');
const Designation = require('../models/designation.model');
const Document = require('../models/document.model');
const EmployeeDocument = require('../models/employee_document.model');

const Role = require('../models/role.model');
const RoleUser = require('../models/roleuser.model');
const Skill = require('../models/skill.model');




async function getUserBranchId(userId) {
  const emp = await Employee.findOne({
    where: { user_id: userId },
    attributes: ['branch_id'],
    raw: true,
  });
  return emp?.branch_id || null;
}


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

async function hasBranch(userId) {
  const emp = await Employee.findOne({
    where: { user_id: userId },
    attributes: ['branch_id'],
    raw: true,
  });
  return !!(emp && emp.branch_id);
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


exports.getAllEmployees = async (req, res) => {
  try {
    console.log('🎯 START getAllEmployees');
    console.log('🔍 User Info - ID:', req.user.id, 'Type:', req.user.type);

    const companyId = await getCompanyId(req);
    let employees;

    if (isSuper(req)) {
      // ✅ Super admin → see all employees
      console.log('🟡 Super Admin Access');
      employees = await Employee.findAll({
        where: { deleted_at: null },
        include: [
          { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
          { model: Branch, as: 'branch', attributes: ['id', 'name'] },
          { model: Department, as: 'department', attributes: ['id', 'name'] },
          { model: Designation, as: 'designation', attributes: ['id', 'name'] },
           {
    model: Skill,
    as: 'skill',
    attributes: ['id', 'name', 'wages'],
  },
        ],
        order: [['id', 'DESC']],
      });

    } else if ((req.user?.type || '').toLowerCase() === 'company') {
      // ✅ Company login → all employees under company (all branches)
      console.log('🟡 Company User Access');
      const allowedUserIds = await getAllUserIdsUnderCompanyBranch(companyId, null);
      employees = await Employee.findAll({
        where: { created_by: { [Op.in]: allowedUserIds }, deleted_at: null },
        include: [
          { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
          { model: Branch, as: 'branch', attributes: ['id', 'name'] },
          { model: Department, as: 'department', attributes: ['id', 'name'] },
          { model: Designation, as: 'designation', attributes: ['id', 'name'] },
          {
  model: Skill,
  as: 'skill',
  attributes: ['id', 'name', 'wages'],
},

        ],
        order: [['id', 'DESC']],
      });

    } else {
      // 🔹 Check if logged-in user has an Employee record
      const emp = await Employee.findOne({
        where: { user_id: req.user.id },
        attributes: ['id', 'branch_id'],
      });

      if (emp) {
        // 🟢 UPDATED AREA: Branch User → ONLY their own branch employees
        console.log('🟡 Branch User Access');
        const branchId = emp.branch_id;
        console.log('🔍 Branch ID for Branch User:', branchId);
        
        if (!companyId) {
          return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        // 🟢 SIMPLIFIED: Branch users only see employees in THEIR OWN BRANCH
        // No need for complex allowedUserIds logic for branch users
        employees = await Employee.findAll({
          where: { 
            branch_id: branchId, // 🟢 ONLY employees in same branch
            deleted_at: null 
          },
          include: [
            { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
            { model: Branch, as: 'branch', attributes: ['id', 'name'] },
            { model: Department, as: 'department', attributes: ['id', 'name'] },
            { model: Designation, as: 'designation', attributes: ['id', 'name'] },
            {
  model: Skill,
  as: 'skill',
  attributes: ['id', 'name', 'wages'],
},

          ],
          order: [['id', 'DESC']],
        });

        console.log('🔍 Branch User - Employees in Branch', branchId + ':', employees.length);

      } else {
        // 🟢 Branchless user → FULL DATABASE ACCESS (all branches)
        console.log('🟡 Branchless User Access (FULL DATABASE)');
        employees = await Employee.findAll({
          where: { deleted_at: null },
          include: [
            { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
            { model: Branch, as: 'branch', attributes: ['id', 'name'] },
            { model: Department, as: 'department', attributes: ['id', 'name'] },
            { model: Designation, as: 'designation', attributes: ['id', 'name'] },
            {
  model: Skill,
  as: 'skill',
  attributes: ['id', 'name', 'wages'],
},

          ],
          order: [['id', 'DESC']],
        });
        console.log('🔍 Branchless User - All Employees Count:', employees.length);
      }
    }

    console.log('🔍 Final Employees Count:', employees?.length || 0);
    console.log('✅ END getAllEmployees - Success');
    return res.json({ success: true, data: employees });

  } catch (err) {
    console.error('❌ Error getAllEmployees:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};


exports.getEmployeeById = async (req, res) => {
  try {
    console.log('🎯 START getEmployeeById');
    console.log('🔍 User Info - ID:', req.user.id, 'Type:', req.user.type);
    console.log('🔍 Requested Employee ID:', req.params.id);

    const companyId = await getCompanyId(req);
    console.log('🔍 Company ID:', companyId);

    let where;

    if (isSuper(req)) {
      // ✅ Super admin can see any employee
      console.log('🟡 Super Admin Access');
      where = { employee_id: req.params.id };

    } else if (isEmployee(req)) {
      // ✅ Employee can only see their own profile
      console.log('🟡 Employee Access - Own Profile Only');
      const emp = await Employee.findOne({ where: { user_id: req.user.id } });
      if (!emp || String(emp.employee_id) !== String(req.params.id)) {
        return res.status(403).json({ success: false, message: 'Forbidden: you can only view your own profile' });
      }
      where = { id: emp.id };

    } else {
      // 🔹 Check if logged-in user has an Employee record (has branch)
      const userEmployeeRecord = await Employee.findOne({
        where: { user_id: req.user.id },
        attributes: ['branch_id', 'created_by'],
        raw: true,
      });

      console.log('🔍 User Employee Record:', userEmployeeRecord);

      if (userEmployeeRecord && userEmployeeRecord.branch_id) {
        // 🟢 UPDATED AREA: Branch User → can only access employees in their own branch
        console.log('🟡 Branch User Access');
        const branchId = userEmployeeRecord.branch_id;
        console.log('🔍 Branch ID for Branch User:', branchId);

        // 🔹 Find the target employee
        const targetEmp = await Employee.findOne({
          where: { employee_id: req.params.id },
          attributes: ['id', 'branch_id', 'created_by'],
        });

        if (!targetEmp) {
          return res.status(404).json({ success: false, message: 'Employee not found' });
        }

        // 🟢 BRANCH-LEVEL RESTRICTION: Only allow if target employee is in same branch
        if (Number(targetEmp.branch_id) !== Number(branchId)) {
          return res.status(403).json({ 
            success: false, 
            message: 'Forbidden: you can only access employees in your own branch' 
          });
        }

        // ✅ Same branch → allow access
        where = { id: targetEmp.id };
        console.log('🔍 Branch User - Access granted to employee in same branch');

      } else {
        // 🟢 UPDATED AREA: Branchless User → can access ANY employee in the company
        console.log('🟡 Branchless User Access (FULL ACCESS)');
        
        if (!companyId) {
          return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        // 🟢 Get all users under company (for created_by check)
        const allowedUserIds = await getAllUserIdsUnderCompanyBranch(companyId, null);
        
        where = {
          employee_id: req.params.id,
          created_by: { [Op.in]: allowedUserIds }
        };
        console.log('🔍 Branchless User - Access to any employee in company');
      }
    }

    // 🔹 Fetch employee with relations
    const employee = await Employee.findOne({
      where,
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
        { model: Branch, as: 'branch', attributes: ['id', 'name'] },
        { model: Department, as: 'department', attributes: ['id', 'name'] },
        { model: Designation, as: 'designation', attributes: ['id', 'name'] },
         {
    model: Skill,
    as: 'skill',
    attributes: ['id', 'name', 'wages'],
  },
      ],
    });

    if (!employee) {
      console.log('❌ Employee not found with criteria');
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    console.log('✅ Employee found, access granted');
    return res.json({ success: true, data: employee });

  } catch (err) {
    console.error('❌ Error getEmployeeById:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};


exports.createEmployee = async (req, res) => {
  const t = await Employee.sequelize.transaction();
  try {
    console.log('🎯 START createEmployee');
    console.log('🔍 User Info - ID:', req.user.id, 'Type:', req.user.type);

    // 🟢 Check if user exists in employees table (has branch)
    const userEmployeeRecord = await Employee.findOne({
      where: { user_id: req.user.id },
      attributes: ['branch_id', 'created_by'],
      raw: true,
    });

    console.log('🔍 User Employee Record:', userEmployeeRecord);

    let companyId;
    let creatorId = req.user.id;
    let userBranchId = null;

    // 🟢 SUPER ADMIN: Full access
    if (isSuper(req)) {
      console.log('🟡 Super Admin - Creating employee');
      companyId = await getCompanyId(req);
      // Super admin can create employees for any company
    } 
    else if (userEmployeeRecord && userEmployeeRecord.branch_id) {
      // 🟢 CASE 1: User has employee record with branch → branch-level access
      console.log('🟡 Branch User Access - Creating employee');
      userBranchId = userEmployeeRecord.branch_id;
      companyId = userEmployeeRecord.created_by;
      
      if (!companyId) {
        await t.rollback();
        return res.status(403).json({ success: false, message: 'Unauthorized' });
      }

      // 🟢 Branch users can only create employees in their own branch
      if (req.body.branch_id && Number(req.body.branch_id) !== Number(userBranchId)) {
        await t.rollback();
        return res.status(403).json({ 
          success: false, 
          message: 'Branch users can only create employees in their own branch' 
        });
      }
      
      // Auto-assign to user's branch if not specified
      if (!req.body.branch_id) {
        req.body.branch_id = userBranchId;
      }
    } 
    else {
      // 🟢 CASE 2: User doesn't have employee record (no branch) → company-wide access
      console.log('🟡 Branchless User Access - Creating employee');
      companyId = await getCompanyId(req);
      
      if (!companyId) {
        await t.rollback();
        return res.status(403).json({ success: false, message: 'Unauthorized' });
      }
      
      // 🟢 Branchless users can create employees in any branch
      // No branch restrictions applied
    }

    console.log('🔍 Final Company ID:', companyId);
    console.log('🔍 User Branch ID:', userBranchId);

    const data = { ...req.body };
    delete data.employee_id; 
    data.created_by = creatorId;

    // 🔹 [UPDATED AREA #1] — Allow new optional employee fields
    const allowedFields = ['uan_number', 'ip_number', 'father_name', 'skill_id' , 'gatepassno'];
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) data[field] = req.body[field];
    }

    // 🔹 [UPDATED AREA #2] — Validate "skills" value
    // if (data.skills) {
    //   const validSkills = ['High Skills', 'Skills', 'Semi Skills', 'Unskills'];
    //   if (!validSkills.includes(data.skills)) {
    //     await t.rollback();
    //     return res.status(422).json({
    //       success: false,
    //       message: `Invalid skills value. Must be one of: ${validSkills.join(', ')}`
    //     });
    //   }
    // }
    
    if (data.skill_id) {
  const skill = await Skill.findByPk(data.skill_id);
  if (!skill) {
    await t.rollback();
    return res.status(422).json({
      success: false,
      message: 'Invalid skill selected',
    });
  }
}

data.basic_salary = Number(data.basic_salary) || 0;

    // 🔹 [OPTIONAL] Validate UAN & IP formats
    if (data.uan_number && !/^\d{12}$/.test(data.uan_number)) {
      await t.rollback();
      return res.status(422).json({
        success: false,
        message: 'Invalid UAN number format (must be 12 digits).'
      });
    }

    if (data.ip_number && !/^\d{10}$/.test(data.ip_number)) {
      await t.rollback();
      return res.status(422).json({
        success: false,
        message: 'Invalid IP number format (must be 10 digits).'
      });
    }

    // 🟢 UPDATED DUPLICATE CHECK LOGIC
    // if (data.aadhaar_number) {
    //   let checkUserIds;
      
    //   if (userEmployeeRecord && userEmployeeRecord.branch_id) {
    //     // 🟢 Branch user: Check only within their branch
    //     checkUserIds = await getAllUserIdsUnderCompanyBranch(companyId, userBranchId);
    //   } else {
    //     // 🟢 Branchless user/Super admin: Check entire company
    //     checkUserIds = await getAllUserIdsUnderCompanyBranch(companyId, null);
    //   }

    //   const existingEmp = await Employee.findOne({
    //     where: {
    //       aadhaar_number: data.aadhaar_number.trim(),
    //       created_by: { [Op.in]: checkUserIds },
    //       deleted_at: null
    //     },
    //     transaction: t
    //   });

    //   if (existingEmp) {
    //     await t.rollback();
    //     return res.status(422).json({
    //       success: false,
    //       message: `Employee already exists with this Aadhaar number`
    //     });
    //   }
    // }
    
    // ???? UPDATED DUPLICATE CHECK LOGIC
    if (data.aadhaar_number) {
  let checkUserIds;
  
  if (userEmployeeRecord && userEmployeeRecord.branch_id) {
    checkUserIds = await getAllUserIdsUnderCompanyBranch(companyId, userBranchId);
  } else {
    checkUserIds = await getAllUserIdsUnderCompanyBranch(companyId, null);
  }

  // ? FIX: Ensure aadhaar_number is a string before calling trim()
  const aadhaarString = String(data.aadhaar_number).trim();

  const existingEmp = await Employee.findOne({
    where: {
      aadhaar_number: aadhaarString,  // ? Now safely using trimmed string
      created_by: { [Op.in]: checkUserIds },
      deleted_at: null
    },
    transaction: t
  });

  if (existingEmp) {
    await t.rollback();
    return res.status(422).json({
      success: false,
      message: `Employee already exists with this Aadhaar number`
    });
  }
}



    // 🔹 CHECK DUPLICATE PHONE NUMBER - UPDATED LOGIC
    // if (data.phone) {
    //   let checkUserIds;
      
    //   if (userEmployeeRecord && userEmployeeRecord.branch_id) {
    //     // 🟢 Branch user: Check only within their branch
    //     checkUserIds = await getAllUserIdsUnderCompanyBranch(companyId, userBranchId);
    //   } else {
    //     // 🟢 Branchless user/Super admin: Check entire company
    //     checkUserIds = await getAllUserIdsUnderCompanyBranch(companyId, null);
    //   }
    
    //   const existingPhone = await Employee.findOne({
    //     where: {
    //       phone: data.phone.trim(),
    //       created_by: { [Op.in]: checkUserIds },
    //       deleted_at: null
    //     },
    //     transaction: t
    //   });
    
    //   if (existingPhone) {
    //     await t.rollback();
    //     return res.status(422).json({
    //       success: false,
    //       message: `Employee already exists with this phone number.`
    //     });
    //   }
    // }
    
    if (data.phone) {
      let checkUserIds;
      
      if (userEmployeeRecord && userEmployeeRecord.branch_id) {
        checkUserIds = await getAllUserIdsUnderCompanyBranch(companyId, userBranchId);
      } else {
        checkUserIds = await getAllUserIdsUnderCompanyBranch(companyId, null);
      }
    
      // ? FIX: Ensure phone is a string before calling trim()
      const phoneString = String(data.phone).trim();
      
      const existingPhone = await Employee.findOne({
        where: {
          phone: phoneString,  // ? Now safely using trimmed string
          created_by: { [Op.in]: checkUserIds },
          deleted_at: null
        },
        transaction: t
      });
    
      if (existingPhone) {
        await t.rollback();
        return res.status(422).json({
          success: false,
          message: `Employee already exists with this phone number.`
        });
      }
    }


    // ... rest of your existing code remains the same ...


    if (data.password) {
      const salt = await bcrypt.genSalt(10);
      data.password = await bcrypt.hash(data.password, salt);
    }

    const user = await User.create(
      {
        name: data.name,
        email: data.email,
        password: data.password,
        type: 'Employee',  
        created_by: creatorId,     // IMPORTANT: company owner
      },
      { transaction: t }
    );

    const employeeRole = await Role.findOne({ where: { name: 'Employee' } });
    if (!employeeRole) {
      throw new Error("Role 'Employee' not found. Seed roles first.");
    }
    await RoleUser.create(
      {
        role_id: employeeRole.id,
        model_type: 'App\\Models\\User', 
        model_id: user.id,
      },
      { transaction: t }
    );

    data.user_id = user.id;
    


    
   
    async function getAllUserIdsUnderCompany(companyId) {
      const users = await User.findAll({
        where: { created_by: companyId },
        attributes: ['id']
      });
      return users.map(u => u.id).concat(companyId);
    }
    
    const allCompanyUserIds = await getAllUserIdsUnderCompany(companyId);
    
    const maxEmp = await Employee.findOne({
      where: { created_by: { [Op.in]: allCompanyUserIds } },
      attributes: ['employee_id'],
      order: [[Sequelize.cast(Sequelize.col('employee_id'), 'UNSIGNED'), 'DESC']],

      lock: t.LOCK.UPDATE,      
      transaction: t
    });
    
    // 🔹 Next numeric employee_id
    const nextEmpNo = (Number(maxEmp?.employee_id) || 0) + 1;
    data.employee_id = nextEmpNo;



    
    


    const requiredDocs = await Document.findAll({
      where: {
        is_required: { [Op.in]: ['1', 1, true, 'true'] },
        created_by: companyId,
      },
      attributes: ['id'],
      transaction: t,
    });
    const requiredDocIds = requiredDocs.map(d => Number(d.id));

    const uploadedDocIds = new Set();
    const filePayloads = [];

    const collectFromFile = (file, fieldnameForId) => {
      const source = fieldnameForId || file.fieldname || '';
      const m = String(source).match(/(\d+)/); // first number in field name
      if (!m) return;
      const document_id = Number(m[1]);
      uploadedDocIds.add(document_id);
      filePayloads.push({
        document_id,
        document_value: file.filename, 
      });
    };

    if (Array.isArray(req.files)) {
      for (const f of req.files) collectFromFile(f);
    } else if (req.files && typeof req.files === 'object') {
      for (const [field, files] of Object.entries(req.files)) {
        for (const f of files) collectFromFile(f, field);
      }
    }

    const missingRequired = requiredDocIds.filter(id => !uploadedDocIds.has(id));
    if (requiredDocIds.length && missingRequired.length) {
      await t.rollback();
      return res.status(422).json({
        success: false,
        message: 'Missing required documents',
        required_document_ids: requiredDocIds,
        missing_document_ids: missingRequired,
      });
    }

    data.documents = Array.from(uploadedDocIds).join(',');

    const employee = await Employee.create(data, { transaction: t });

    const now = new Date();
    for (const it of filePayloads) {
      await EmployeeDocument.create(
        {
          employee_id: employee.id,
          document_id: it.document_id,
          document_value: it.document_value,
          created_by: creatorId, 
          gatepassno: req.body.gatepassno || null,

          created_at: now,
          updated_at: now,
        },
        { transaction: t }
      );
    }

    await t.commit();
    return res.status(201).json({ success: true, data: employee });
  } catch (err) {
    await t.rollback();
    return res.status(500).json({ success: false, message: 'Error creating employee', error: err.message });
  }
};


exports.updateEmployee = async (req, res) => {
  const t = await Employee.sequelize.transaction();
  try {
    const companyId = await getCompanyId(req);
    
        // 🔹 NEW: capture actual logged-in user id
    const creatorId = req.user.id;  
    const employee = await Employee.findOne({
        where: { employee_id: req.params.id },   // ✅ match business ID
        transaction: t,
    });
    
    // 🔹 HIGHLIGHTED UPDATE: ownership check based on role/user type
    if (!employee) {
      await t.rollback();
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }
    

    // 🟢 UPDATED AREA: Access Control Logic
    if (!isSuper(req)) {
      // 🔹 Check if logged-in user has an Employee record (has branch)
      const userEmployeeRecord = await Employee.findOne({
        where: { user_id: req.user.id },
        attributes: ['branch_id', 'created_by'],
        raw: true,
      });
    
      console.log('🔍 User Employee Record:', userEmployeeRecord);
    
      if (userEmployeeRecord && userEmployeeRecord.branch_id) {
        // 🟢 BRANCH USER: Can only update employees in their own branch
        console.log('🟡 Branch User Access - Update');
        const branchId = userEmployeeRecord.branch_id;
        console.log('🔍 Branch ID for Branch User:', branchId);
    
        // 🟢 BRANCH-LEVEL RESTRICTION: Only allow if target employee is in same branch
        if (Number(employee.branch_id) !== Number(branchId)) {
          await t.rollback();
          return res.status(403).json({ 
            success: false, 
            message: 'Forbidden: you can only update employees in your own branch' 
          });
        }
        console.log('🔍 Branch User - Update access granted to employee in same branch');
    
      } else {
        // 🟢 BRANCHLESS USER: Can update ANY employee in the company
        console.log('🟡 Branchless User Access - Update (FULL ACCESS)');
        
        if (!companyId) {
          await t.rollback();
          return res.status(403).json({ success: false, message: 'Unauthorized' });
        }
    
        // 🟢 Get all users under company (for created_by check)
        const allowedUserIds = await getAllUserIdsUnderCompanyBranch(companyId, null);
        
        // 🟢 Check if employee was created by company or branchless users
        if (!allowedUserIds.map(String).includes(String(employee.created_by))) {
          await t.rollback();
          return res.status(403).json({ 
            success: false, 
            message: 'Forbidden: you can only update employees in your company' 
          });
        }
        console.log('🔍 Branchless User - Update access granted to company employee');
      }
    } else {
      console.log('🟡 Super Admin Access - Update');
    }
    // 🟢 END UPDATED AREA


    // Step 2: Collect incoming data
    const data = { ...req.body };
    delete data.id;
    delete data.employee_id;
    delete data.created_by; // guard
    
    
     // 🔹 HIGHLIGHTED AREA 3 — Validate new fields (uan_number, ip_number, father_name, skills)
     
     if (data.gatepassno) {
}

    // if (data.skills) {
    //   const allowedSkills = ['High Skills', 'Skills', 'Semi Skills', 'Unskills'];
    //   if (!allowedSkills.includes(data.skills)) {
    //     await t.rollback();
    //     return res.status(400).json({
    //       success: false,
    //       message: `Invalid skills value. Must be one of: ${allowedSkills.join(', ')}`,
    //     });
    //   }
    // }
    
    if (data.skill_id) {
  const skill = await Skill.findByPk(data.skill_id);
  if (!skill) {
    await t.rollback();
    return res.status(400).json({
      success: false,
      message: 'Invalid skill selected',
    });
  }
}


    if (data.uan_number && !/^\d{12}$/.test(data.uan_number)) {
      await t.rollback();
      return res.status(400).json({ success: false, message: 'Invalid UAN number format (must be 12 digits).' });
    }

    if (data.ip_number && !/^\d{10}$/.test(data.ip_number)) {
      await t.rollback();
      return res.status(400).json({ success: false, message: 'Invalid IP number format (must be 10 digits).' });
    }
    // 🔹 END HIGHLIGHTED AREA 3


    // Step 3: Hash password if present
    if (data.password) {
      const salt = await bcrypt.genSalt(10);
      data.password = await bcrypt.hash(data.password, salt);
    }

    // Step 4: Update related User record if needed
    const userUpdates = {};
    if (data.name) userUpdates.name = data.name;
    if (data.email) userUpdates.email = data.email;
    if (data.password) userUpdates.password = data.password;

    if (Object.keys(userUpdates).length) {
      await User.update(userUpdates, { where: { id: employee.user_id }, transaction: t });
    }

    // Step 5: Required Documents (company-wise)
    const requiredDocs = await Document.findAll({
      where: {
        is_required: { [Op.in]: ['1', 1, true, 'true'] },
        created_by: employee.created_by, // ensure same company
      },
      attributes: ['id'],
      transaction: t,
    });
    const requiredDocIds = requiredDocs.map(d => Number(d.id));

    // Step 6: Parse uploaded files
    const uploadedDocIds = new Set();
    const filePayloads = [];

    const collectFromFile = (file, fieldnameForId) => {
      const source = fieldnameForId || file.fieldname || '';
      const mAll = String(source).match(/(\d+)/g);
      const num = mAll ? mAll[mAll.length - 1] : null;
      if (!num) return;
      const document_id = Number(num);
      if (!isNaN(document_id)) {
        uploadedDocIds.add(document_id);
        filePayloads.push({
          document_id,
        //   document_value: `misc/${file.filename}`,
        //   document_value: `employee_documents/${file.filename}`,
          document_value: file.filename,

        });
      }
    };

    if (Array.isArray(req.files)) {
      for (const f of req.files) collectFromFile(f);
    } else if (req.files && typeof req.files === 'object') {
      for (const [field, files] of Object.entries(req.files)) {
        for (const f of files) collectFromFile(f, field);
      }
    }

    // Step 7: Merge existing + uploaded doc IDs
    const existingDocIds = (employee.documents || '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)
      .map(n => Number(n))
      .filter(n => !isNaN(n));

    const finalDocIdsSet = new Set(existingDocIds);
    for (const id of uploadedDocIds) finalDocIdsSet.add(Number(id));

    // Step 8: Validate required documents
    const missingRequired = requiredDocIds.filter(id => !finalDocIdsSet.has(id));
    if (requiredDocIds.length && missingRequired.length) {
      await t.rollback();
      return res.status(422).json({
        success: false,
        message: 'Missing required documents',
        required_document_ids: requiredDocIds,
        missing_document_ids: missingRequired,
      });
    }

    // Step 9: Persist changes
    const documentsStr = Array.from(finalDocIdsSet).length ? Array.from(finalDocIdsSet).join(',') : null;

    employee.set({
      ...data,
      documents: documentsStr,
      updated_at: new Date(),
    });

    await employee.save({ transaction: t });

    // Step 10: Insert new uploaded documents (only new ones)
    // const now = new Date();
    // for (const it of filePayloads) {
    //   await EmployeeDocument.create(
    //     {
    //       employee_id: employee.id,
    //       document_id: it.document_id,
    //       document_value: it.document_value,
    //       created_by: employee.created_by,
    //       created_at: now,
    //       updated_at: now,
    //     },
    //     { transaction: t }
    //   );
    // }
    
    const now = new Date();
    for (const it of filePayloads) {
      // Check if document already exists
      const existingDoc = await EmployeeDocument.findOne({
        where: {
          employee_id: employee.id,
          document_id: it.document_id
        },
        transaction: t
      });
    
      if (existingDoc) {
        // UPDATE existing document
        await existingDoc.update({
          document_value: it.document_value,
          updated_at: now
        }, { transaction: t });
      } else {
        // CREATE new document
        await EmployeeDocument.create({
          employee_id: employee.id,
          document_id: it.document_id,
          document_value: it.document_value,
          created_by: employee.created_by,
          created_at: now,
          updated_at: now,
        }, { transaction: t });
      }
    }

    await t.commit();

    const updatedEmployee = await Employee.findByPk(employee.id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
        { model: Branch, as: 'branch', attributes: ['id', 'name'] },
        { model: Department, as: 'department', attributes: ['id', 'name'] },
        { model: Designation, as: 'designation', attributes: ['id', 'name'] },
      ],
    });

    return res.status(200).json({ success: true, data: updatedEmployee });
  } catch (err) {
    await t.rollback();
    return res.status(500).json({ success: false, message: 'Error updating employee', error: err.message });
  }
};


exports.deleteEmployee = async (req, res) => {
  try {
    const companyId = await getCompanyId(req);

    // 🔹 Fetch employee by business ID
    const employee = await Employee.findOne({ where: { employee_id: req.params.id } });
    if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });

    // 🔹 HIGHLIGHTED: Get logged-in user employee record (for branch check)
    let currentEmp = null;
    if (!isSuper(req) && (req.user?.type || '').toLowerCase() !== 'company') {
      currentEmp = await Employee.findOne({ where: { user_id: req.user.id } });
      if (!currentEmp) {
        return res.status(403).json({ success: false, message: 'Forbidden: you are not an employee' });
      }
    }

    // 🔹 Permission check
    if (!isSuper(req)) {
      const userType = (req.user?.type || '').toLowerCase();

      if (userType === 'company') {
        // ✅ Company user can delete employees created by itself or its child users
        const allCompanyUserIds = await User.findAll({
          where: { created_by: companyId },
          attributes: ['id']
        }).then(users => users.map(u => u.id).concat(companyId));

        if (!allCompanyUserIds.includes(employee.created_by)) {
          return res.status(403).json({ success: false, message: 'Forbidden: not your employee' });
        }
      } else {
        // 🔹 OLD CODE (only self-owned check)
        /*
        if (Number(employee.created_by) !== Number(req.user.id)) {
          return res.status(403).json({ success: false, message: 'Forbidden: not your employee' });
        }
        */

        // 🔹 NEW CODE: Branch-level check
        if (String(currentEmp.branch_id) !== String(employee.branch_id)) {
          return res.status(403).json({ success: false, message: 'Forbidden: employee is in another branch' });
        }
      }
    }

    // 🔹 Soft delete instead of hard delete
    await employee.update({ deleted_at: new Date() });

    res.json({ success: true, message: 'Employee soft deleted successfully' });
  } catch (err) {
    console.error('❌ Error deleting employee:', err);
    res.status(500).json({ success: false, message: 'Error deleting employee', error: err.message });
  }
};


exports.checkAadhaar = async (req, res) => {
  try {
    const { aadhaar_number } = req.body;

    if (!aadhaar_number || !/^\d{12}$/.test(aadhaar_number)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Aadhaar number. Must be 12 digits.',
      });
    }

    const companyId = await getCompanyId(req);

    // Get all user IDs under this company
    const allUserIds = await User.findAll({
      where: { created_by: companyId },
      attributes: ['id'],
      raw: true,
    }).then(users => users.map(u => u.id).concat(companyId));

    // Trim input
    const aadhaarClean = aadhaar_number.trim();

    const employee = await Employee.findOne({
      where: {
        aadhaar_number: aadhaarClean,
        created_by: { [Op.in]: allUserIds },
        deleted_at: null
      },
      include: [
        { model: Branch, as: 'branch', attributes: ['id', 'name'] }
      ]
    });

    if (employee) {
      return res.status(200).json({
        success: true,
        exists: true,
        message: `Employee already exists in branch: ${employee.branch?.name || 'N/A'}`,
        data: {
          id: employee.id,
          name: employee.name,
          employee_id: employee.employee_id,
          branch: employee.branch ? { id: employee.branch.id, name: employee.branch.name } : null
        }
      });
    }

    return res.status(200).json({
      success: true,
      exists: false,
      message: 'No employee found with this Aadhaar number. You can proceed to create.',
    });

  } catch (err) {
    console.error('❌ Error in checkAadhaar:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error checking Aadhaar',
      error: err.message
    });
  }
};


exports.rejoinEmployee = async (req, res) => {
  const t = await Employee.sequelize.transaction();
  try {
    const { aadhaar_number, rejoin_reason } = req.body;

    // 🔹 Validate input
    if (!aadhaar_number || !/^\d{12}$/.test(aadhaar_number.trim())) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'Invalid Aadhaar number. Must be 12 digits.',
      });
    }

    if (!rejoin_reason || rejoin_reason.trim().length === 0) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'Rejoin reason is required.',
      });
    }

    const companyId = await getCompanyId(req);

    // 🔹 Get all user IDs under the company
    const allUserIds = await User.findAll({
      where: { created_by: companyId },
      attributes: ['id'],
      raw: true,
    }).then(users => users.map(u => u.id).concat(companyId));

    const aadhaarClean = aadhaar_number.trim();

    // 🔹 Find employee by Aadhaar
    const employee = await Employee.findOne({
      where: {
        aadhaar_number: aadhaarClean,
        created_by: { [Op.in]: allUserIds },
      },
      include: [{ model: Branch, as: 'branch', attributes: ['id', 'name'] }],
      transaction: t,
    });

    if (!employee) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: 'No employee found with this Aadhaar number under your company.',
      });
    }

    console.log('🔍 Employee Current Status:', {
      id: employee.id,
      name: employee.name,
      employee_id: employee.employee_id,
      is_active: employee.is_active,
      branch: employee.branch ? employee.branch.name : 'No branch'
    });

    // 🔴 OLD CODE (Restrictive - blocking active employees):
    // // 🟢 Check if employee is already active
    // if (employee.is_active === 1 || employee.is_active === true) {
    //   await t.rollback();
    //   return res.status(400).json({
    //     success: false,
    //     message: 'Employee is already active and cannot rejoin.',
    //   });
    // }

    // 🟢 NEW CODE (Flexible - allow both active and inactive employees to rejoin):
    let statusChange = false;
    let previousStatus = employee.is_active ? "Active" : "Inactive/Terminated";

    // If employee is inactive, activate them
    if (employee.is_active === 0 || employee.is_active === false) {
      statusChange = true;
    }

    // 🟢 UPDATED AREA — Store rejoin reason and reactivate if needed
    const updateData = {
      rejoin_reason: rejoin_reason.trim(),
      updated_at: new Date(),
    };

    // Only activate if employee is currently inactive
    if (statusChange) {
      updateData.is_active = 1; // ✅ Change from 0 to 1 (inactive to active)
      updateData.rejoin_date = new Date(); // ✅ Store rejoin date
    }

    await employee.update(updateData, { transaction: t });

    // 🟢 Check and close termination record if exists
    const Termination = require('../models/termination.model');
    const termination = await Termination.findOne({
      where: { 
        employee_id: employee.id,
        deleted_at: null 
      },
      transaction: t,
    });

    if (termination) {
      await termination.update(
        { 
          deleted_at: new Date(),
          rejoin_reason: rejoin_reason.trim() // ✅ Optional: Also store in termination table
        },
        { transaction: t }
      );
      console.log('✅ Termination record closed for employee:', employee.name);
    }

    await t.commit();

    return res.status(200).json({
      success: true,
      message: `Employee ${employee.name} has been successfully processed for rejoining.`,
      data: {
        id: employee.id,
        name: employee.name,
        employee_id: employee.employee_id,
        branch: employee.branch ? employee.branch.name : null,
        rejoin_reason: rejoin_reason.trim(),
        rejoin_date: statusChange ? new Date() : null,
        previous_status: previousStatus,
        current_status: statusChange ? "Active" : previousStatus,
        is_active: statusChange ? 1 : employee.is_active,
        status_changed: statusChange,
        action: statusChange ? "Reactivated and Rejoined" : "Rejoin Reason Updated"
      },
    });
  } catch (err) {
    await t.rollback();
    console.error('❌ Error in rejoinEmployee:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error during rejoin process.',
      error: err.message,
    });
  }
};


exports.getEmployeesByBranch = async (req, res) => {
  try {
    const companyId = await getCompanyId(req);
    const { branchId } = req.params;

    let where = { branch_id: branchId }; // base condition

    if (!isSuper(req)) {
      const userType = (req.user?.type || '').toLowerCase();

      if (userType === 'company') {
        // ✅ Company login → fetch employees in this branch created by company or its subordinates
        const companyUsers = await User.findAll({
          where: { created_by: companyId },
          attributes: ['id'],
        });
        const allowedUserIds = companyUsers.map(u => u.id).concat(companyId);
        where.created_by = { [Op.in]: allowedUserIds };

      } else {
        // Check if user has an Employee record
        const emp = await Employee.findOne({ where: { user_id: req.user.id } });

        if (emp) {
          // ✅ Employee-type role user → can only fetch their own branch
          if (String(emp.branch_id) !== String(branchId)) {
            return res.status(403).json({
              success: false,
              message: 'Forbidden: you cannot access another branch',
            });
          }
          where.branch_id = branchId; // only this branch

        } else {
          // ✅ Direct role user (no Employee record) → can fetch all employees in this branch
          where.branch_id = branchId; // no created_by restriction
        }
      }
    }

    const employees = await Employee.findAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
        { model: Branch, as: 'branch', attributes: ['id', 'name'] },
        { model: Department, as: 'department', attributes: ['id', 'name'] },
        { model: Designation, as: 'designation', attributes: ['id', 'name'] },
      ],
      order: [['id', 'DESC']],
    });

    res.status(200).json({ success: true, data: employees });
  } catch (error) {
    console.error('❌ Error fetching employees by branch:', error);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};




const path = require("path");
const fs = require("fs");
const ExcelJS = require("exceljs");
const PayslipType = require("../models/payslipType.model"); // ✅ add this


exports.getAllEmployeesSummary = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const companyId = await getCompanyId(req);
    let employees;

    // =====================================
    // 🧩 Role-based data visibility
    // =====================================

    if (isSuper(req)) {
      employees = await Employee.findAll({
        where: { deleted_at: null },
        include: [
          { model: PayslipType, as: "salaryType", attributes: ["name"] },
          { model: User, as: "user", attributes: ["id", "name", "email"] },
          { model: Branch, as: "branch", attributes: ["id", "name"] },
          { model: Department, as: "department", attributes: ["id", "name"] },
          { model: Designation, as: "designation", attributes: ["id", "name"] },
        ],
        order: [["id", "DESC"]],
      });
    } else if (isEmployee(req)) {
      const emp = await Employee.findOne({
        where: { user_id: req.user.id, deleted_at: null },
        include: [
          { model: PayslipType, as: "salaryType", attributes: ["name"] },
          { model: User, as: "user", attributes: ["id", "name", "email"] },
          { model: Branch, as: "branch", attributes: ["id", "name"] },
          { model: Department, as: "department", attributes: ["id", "name"] },
          { model: Designation, as: "designation", attributes: ["id", "name"] },
        ],
      });
      employees = emp ? [emp] : [];
    } else if ((req.user?.type || "").toLowerCase() === "company") {
      const allowedUserIds = await getAllUserIdsUnderCompanyBranch(companyId, null);
      employees = await Employee.findAll({
        where: { created_by: { [Op.in]: allowedUserIds }, deleted_at: null },
        include: [
          { model: PayslipType, as: "salaryType", attributes: ["name"] },
          { model: User, as: "user", attributes: ["id", "name", "email"] },
          { model: Branch, as: "branch", attributes: ["id", "name"] },
          { model: Department, as: "department", attributes: ["id", "name"] },
          { model: Designation, as: "designation", attributes: ["id", "name"] },
        ],
        order: [["id", "DESC"]],
      });
    } else {
      const branchId = await getUserBranchId(req.user.id);
      if (!branchId) {
        return res.status(403).json({ success: false, message: "No branch assigned" });
      }

      const allowedUserIds = await getAllUserIdsUnderCompanyBranch(companyId, branchId);
      employees = await Employee.findAll({
        where: {
          branch_id: branchId,
          created_by: { [Op.in]: allowedUserIds },
          deleted_at: null,
        },
        include: [
          { model: PayslipType, as: "salaryType", attributes: ["name"] },
          { model: User, as: "user", attributes: ["id", "name", "email"] },
          { model: Branch, as: "branch", attributes: ["id", "name"] },
          { model: Department, as: "department", attributes: ["id", "name"] },
          { model: Designation, as: "designation", attributes: ["id", "name"] },
        ],
        order: [["id", "DESC"]],
      });
    }

    // =====================================
    // 🧾 Create Excel File (Dynamic Bank Sheet Format)
    // =====================================

    const folderPath = path.join(__dirname, "..", "excel");
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Bank Payment");

    // 🔹 Dynamic Header Title
    const branchName = employees[0]?.branch?.name || "Company";
    const today = new Date();
    const formattedDate = today.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "2-digit",
    });

    const title = `${branchName} Site Bank Payment Sheet - ${formattedDate}`;

    // 🔹 Merge title row
    worksheet.mergeCells("A1:E1");
    worksheet.getCell("A1").value = title;
    worksheet.getCell("A1").alignment = { horizontal: "center" };
    worksheet.getCell("A1").font = { bold: true, size: 14 };

    // 🔹 Column Headers
    worksheet.addRow([]);
    worksheet.addRow(["Sl.No.", "Name", "Acc.No.", "IFSC CODE", "Amount"]);
    const headerRow = worksheet.getRow(3);
    headerRow.font = { bold: true };
    headerRow.alignment = { horizontal: "center" };

    // 🔹 Add Data Rows
    let total = 0;
    employees.forEach((e, i) => {
      const emp = e.toJSON();
      const amount = Number(emp.salary || 0);
      total += amount;

      worksheet.addRow([
        i + 1,
        emp.name || "",
        emp.account_number || "",
        emp.bank_identifier_code || "",
        amount,
      ]);
    });

    // 🔹 Add total row
    const totalRow = worksheet.addRow(["", "", "", "Total", total]);
    totalRow.font = { bold: true };

    // 🔹 Adjust column widths
    worksheet.columns = [
      { width: 8 },
      { width: 25 },
      { width: 25 },
      { width: 20 },
      { width: 15 },
    ];

    // 🔹 Save file
    const fileName = `bank_payment_sheet_${Date.now()}.xlsx`;
    const filePath = path.join(folderPath, fileName);
    await workbook.xlsx.writeFile(filePath);

    return res.json({
      success: true,
      count: employees.length,
      downloadUrl: `/excel/${fileName}`,
      message: "Bank payment sheet generated successfully",
    });

  } catch (err) {
    console.error("❌ Error getAllEmployeesSummary:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};








exports.updateEmbedding = async (req, res) => {
  try {
    // Support both :employee_id and :id in route
    const employee_id = req.params.employee_id || req.params.id;

    // console.log("🔎 Params received:", req.params);
    // console.log("👉 employee_id used:", employee_id);

    if (!employee_id) {
      return res.status(400).json({
        success: false,
        message: "Employee ID is required in the URL"
      });
    }

    const { embedding } = req.body;

    if (!embedding || !Array.isArray(embedding)) {
      return res.status(400).json({
        success: false,
        message: "Embedding must be an array"
      });
    }

    // Find employee by employee_id
    const employee = await Employee.findOne({ where: { employee_id } });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found"
      });
    }

    // Ensure existing embeddings are arrays (not strings)
    const existingEmbedding = Array.isArray(employee.biometric_emp_id)
      ? employee.biometric_emp_id
      : [];

    const updatedEmbedding = [...existingEmbedding, ...embedding];

    // Save back to DB
    employee.biometric_emp_id = updatedEmbedding;
    await employee.save();

    return res.status(200).json({
      success: true,
      message: "Embedding updated successfully",
      data: employee
    });

  } catch (error) {
    console.error("❌ updateEmbedding error:", error);
    return res.status(500).json({
      success: false,
      message: "Error updating embedding",
      error: error.message
    });
  }
};
