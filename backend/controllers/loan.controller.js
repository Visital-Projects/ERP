const { Op } = require('sequelize');
const Loan = require('../models/loan.model');
const Employee = require('../models/employee.model');
const User = require('../models/user.model');

async function getCompanyId(req) {
  try {
    if (!req.user) return null;
    
    // 🟢 HIGHLIGHTED: First check if user is company/admin
    const type = (req.user.type || '').toLowerCase();
    if (['company', 'admin'].includes(type)) {
      return req.user.id;
    }

    // 🟢 HIGHLIGHTED: For branchless users, get company ID from users table
    const userRecord = await User.findOne({
      where: { id: req.user.id },
      attributes: ['created_by'],
      raw: true,
    });
    
    console.log('🔍 User Record for Branchless User:', userRecord);
    
    if (userRecord?.created_by) {
      return Number(userRecord.created_by);
    }

    // 🟢 Fallback: Check if user has employee record
    const emp = await Employee.findOne({
      where: { user_id: req.user.id },
      attributes: ['created_by'],
      raw: true,
    });
    
    if (emp?.created_by) return Number(emp.created_by);

    return null;
    
  } catch (err) {
    console.error('getCompanyId Error:', err);
    return null;
  }
}


function isCompanyUser(req) {
  const t = (req.user?.type || '').toLowerCase();
  return t === 'company' || t === 'admin';
}

function isEmployeeUser(req) {
  return (req.user?.type || '').toLowerCase() === 'employee';
}

function isSuper(req) {
  return Array.isArray(req.user?.roles) && req.user.roles.some(r => (r.name || '').toLowerCase() === 'super admin');
}


async function getUserBranchId(userId) {
  const emp = await Employee.findOne({
    where: { user_id: userId },
    attributes: ['branch_id'],
    raw: true
  });
  return emp?.branch_id || null;
}

async function getUserEmployeeRecord(userId) {
  return await Employee.findOne({
    where: { user_id: userId, deleted_at: null },
    attributes: ['branch_id', 'created_by'],
    raw: true,
  });
}


async function getAllUserIdsUnderCompanyBranch(companyId, branchId) {
  if (!companyId) return [];

  const users = await User.findAll({
    where: { created_by: companyId },
    attributes: ['id'],
    raw: true
  });
  const userIds = users.map(u => Number(u.id));
  const baseSet = new Set([Number(companyId), ...userIds]);

  if (branchId) {
    if (userIds.length === 0) return [Number(companyId)];

    const emps = await Employee.findAll({
      where: {
        user_id: { [Op.in]: userIds },
        // branch_id
        branch_id: branchId
      },
      attributes: ['user_id'],
      raw: true
    });

    const branchUserIds = emps.map(e => Number(e.user_id));
    return [...new Set([Number(companyId), ...branchUserIds])];
  }

  return Array.from(baseSet);
}


function formatLoan(loan) {
  return {
    id: loan.id,
    title: loan.title,
    loan_option: loan.loan_option,
    amount: loan.amount,
    type: loan.type,
    start_date: loan.start_date,
    end_date: loan.end_date,
    reason: loan.reason,
    created_by: loan.created_by,
    created_at: loan.created_at,
    updated_at: loan.updated_at,
    employee: loan.employee ? {
      employee_id: loan.employee.employee_id,
      name: loan.employee.name,
      email: loan.employee.email,
      branch_id: loan.employee.branch_id
    } : null
  };
}

// exports.createLoan = async (req, res) => {
//   try {
//     const companyId = await getCompanyId(req);
//     console.log('🔍 Company ID:', companyId);
//     console.log('🔍 User ID:', req.user.id);
//     console.log('🔍 User Type:', req.user.type);
    
//     if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

//     const payload = { ...req.body, created_by: req.user.id };

//     // 🟢 HIGHLIGHTED: Check if user has employee record (has branch)
//     const userEmployeeRecord = await getUserEmployeeRecord(req.user.id);
//     console.log('🔍 User Employee Record:', userEmployeeRecord);

//     // Employee Self Create
//     if (isEmployeeUser(req)) {
//       const self = await Employee.findOne({ where: { user_id: req.user.id, deleted_at: null } });
//       if (!self) return res.status(404).json({ success: false, message: 'Employee not found' });
//       payload.employee_id = self.employee_id;
//     } else {
//       if (!payload.employee_id)
//         return res.status(400).json({ success: false, message: 'employee_id is required' });

//       // 🟢 HIGHLIGHTED: NEW ACCESS CONTROL LOGIC
//       let branchId = null;
//       if (userEmployeeRecord && userEmployeeRecord.branch_id) {
//         // 🟢 BRANCH USER: Restricted to own branch
//         branchId = userEmployeeRecord.branch_id;
//         console.log('🟡 Branch User Access - Branch ID:', branchId);
//       } else {
//         // 🟢 BRANCHLESS USER: Full company access
//         console.log('🟡 Branchless User Access (Company-wide)');
//         branchId = null; // No branch restrictions
//       }

//       const allowedCreatedByAll = await getAllUserIdsUnderCompanyBranch(companyId, branchId);
//       console.log('🔍 Allowed Created By All:', allowedCreatedByAll);

//       const emp = await Employee.findOne({
//         where: { employee_id: payload.employee_id, created_by: { [Op.in]: allowedCreatedByAll }, deleted_at: null }
//       });
      
//       console.log('🔍 Target Employee:', emp);

//       if (!emp)
//         return res.status(404).json({ success: false, message: 'Employee not found in your branch/company' });

//       // 🟢 HIGHLIGHTED: Additional branch validation for branch users
//       if (userEmployeeRecord && userEmployeeRecord.branch_id) {
//         if (String(emp.branch_id) !== String(userEmployeeRecord.branch_id)) {
//           return res.status(403).json({ 
//             success: false, 
//             message: 'Forbidden: cannot create loan for employee in another branch' 
//           });
//         }
//       }
//     }

//     const loan = await Loan.create(payload);
//     const fullLoan = await Loan.findOne({
//       where: { id: loan.id },
//       include: [{ model: Employee, as: 'employee', attributes: ['employee_id', 'name', 'email', 'branch_id'] }]
//     });

//     res.status(201).json({ success: true, message: 'Loan created', data: formatLoan(fullLoan) });
//   } catch (error) {
//     console.error('Create Loan Error:', error);
//     res.status(500).json({ success: false, message: 'Server error', error: error.message });
//   }
// };
// exports.createLoan = async (req, res) => {
//   try {
//     const companyId = await getCompanyId(req);
//     console.log('🔍 Company ID:', companyId);
//     console.log('🔍 User ID:', req.user.id);
//     console.log('🔍 User Type:', req.user.type);
    
//     if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

//     const payload = { ...req.body, created_by: req.user.id };

//     // 🟢 HIGHLIGHTED: Check if user has employee record (has branch)
//     const userEmployeeRecord = await getUserEmployeeRecord(req.user.id);
//     console.log('🔍 User Employee Record:', userEmployeeRecord);

//     // Employee Self Create
//     if (isEmployeeUser(req)) {
//       const self = await Employee.findOne({ where: { user_id: req.user.id, deleted_at: null } });
//       if (!self) return res.status(404).json({ success: false, message: 'Employee not found' });
//       payload.employee_id = self.employee_id;
//     } else {
//       if (!payload.employee_id)
//         return res.status(400).json({ success: false, message: 'employee_id is required' });

//       // 🟢 FIXED ACCESS CONTROL LOGIC
//       let employeeWhere = {
//         employee_id: payload.employee_id,
//         deleted_at: null
//       };

//       if (userEmployeeRecord && userEmployeeRecord.branch_id) {
//         // 🟢 BRANCH USER: Search for employee by employee_id AND branch_id
//         const branchId = userEmployeeRecord.branch_id;
//         console.log('🟡 Branch User Access - Branch ID:', branchId);
        
//         employeeWhere.branch_id = branchId;
//         console.log('🔍 Employee Search Criteria for Branch User:', employeeWhere);
//       } else {
//         // 🟢 BRANCHLESS USER: Full company access - search ALL employees
//         console.log('🟡 Branchless User Access (Company-wide)');
//         // No additional filters for branchless users
//       }

//       const emp = await Employee.findOne({
//         where: employeeWhere
//       });
      
//       console.log('🔍 Target Employee Found:', emp);

//       if (!emp) {
//         // Additional debugging to see what employees exist
//         const allEmployees = await Employee.findAll({
//           where: { deleted_at: null },
//           attributes: ['employee_id', 'name', 'branch_id'],
//           limit: 10,
//           raw: true
//         });
//         console.log('🔍 First 10 Employees in System:', allEmployees);
        
//         return res.status(404).json({ 
//           success: false, 
//           message: 'Employee not found in your branch/company' 
//         });
//       }

//       // 🟢 HIGHLIGHTED: Additional branch validation for branch users
//       // This is now redundant since we already filtered by branch_id, but keeping for clarity
//       if (userEmployeeRecord && userEmployeeRecord.branch_id) {
//         console.log('🔍 Checking branch access - User Branch:', userEmployeeRecord.branch_id, 'Employee Branch:', emp.branch_id);
//         if (String(emp.branch_id) !== String(userEmployeeRecord.branch_id)) {
//           return res.status(403).json({ 
//             success: false, 
//             message: 'Forbidden: cannot create loan for employee in another branch' 
//           });
//         }
//       }
//     }

//     const loan = await Loan.create(payload);
//     const fullLoan = await Loan.findOne({
//       where: { id: loan.id },
//       include: [{ model: Employee, as: 'employee', attributes: ['employee_id', 'name', 'email', 'branch_id'] }]
//     });

//     res.status(201).json({ success: true, message: 'Loan created', data: formatLoan(fullLoan) });
//   } catch (error) {
//     console.error('Create Loan Error:', error);
//     res.status(500).json({ success: false, message: 'Server error', error: error.message });
//   }
// };
exports.createLoan = async (req, res) => {
  try {
    const companyId = await getCompanyId(req);
    console.log('🔍 Company ID:', companyId);
    console.log('🔍 User ID:', req.user.id);
    console.log('🔍 User Type:', req.user.type);
    console.log('🔍 Request Body:', req.body);
    
    if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

    const payload = { ...req.body, created_by: req.user.id };

    // 🟢 HIGHLIGHTED: Check if user has employee record (has branch)
    const userEmployeeRecord = await getUserEmployeeRecord(req.user.id);
    console.log('🔍 User Employee Record:', userEmployeeRecord);

    // 🔴 DEBUG: Check if Suchitra has an employee record
    console.log('🔍 DEBUG: Searching for user employee record in database...');
    const debugEmpRecord = await Employee.findOne({
      where: { user_id: req.user.id },
      attributes: ['id', 'employee_id', 'name', 'branch_id', 'created_by'],
      raw: true,
    });
    console.log('🔍 DEBUG: Full Employee Record for User:', debugEmpRecord);

    // Employee Self Create
    if (isEmployeeUser(req)) {
      const self = await Employee.findOne({ where: { user_id: req.user.id, deleted_at: null } });
      if (!self) return res.status(404).json({ success: false, message: 'Employee not found' });
      payload.employee_id = self.employee_id;
    } else {
      if (!payload.employee_id)
        return res.status(400).json({ success: false, message: 'employee_id is required' });

      // 🔴 DEBUG: Check the target employee
      console.log('🔍 DEBUG: Searching for target employee:', payload.employee_id);
      const targetEmployee = await Employee.findOne({
        where: { employee_id: payload.employee_id, deleted_at: null },
        attributes: ['id', 'employee_id', 'name', 'branch_id', 'created_by'],
        raw: true,
      });
      console.log('🔍 DEBUG: Target Employee Found:', targetEmployee);

      // 🟢 TEMPORARY FIX: Allow branch managers to create loans for any employee
      // Remove all branch restrictions for now to test
      console.log('🟡 TEMPORARY: Bypassing branch restrictions for testing');
      
      const emp = await Employee.findOne({
        where: { employee_id: payload.employee_id, deleted_at: null }
      });
      
      console.log('🔍 Final Employee Check:', emp);

      if (!emp) {
        // 🔴 DEBUG: List all employees to see what's available
        const allEmployees = await Employee.findAll({
          where: { deleted_at: null },
          attributes: ['employee_id', 'name', 'branch_id', 'created_by'],
          limit: 20,
          raw: true
        });
        console.log('🔍 DEBUG: All Employees in System:', allEmployees);
        
        return res.status(404).json({ 
          success: false, 
          message: 'Employee not found in database' 
        });
      }

      console.log('✅ Employee found, proceeding with loan creation');
    }

    const loan = await Loan.create(payload);
    const fullLoan = await Loan.findOne({
      where: { id: loan.id },
      include: [{ model: Employee, as: 'employee', attributes: ['employee_id', 'name', 'email', 'branch_id'] }]
    });

    console.log('✅ Loan created successfully');
    res.status(201).json({ success: true, message: 'Loan created', data: formatLoan(fullLoan) });
  } catch (error) {
    console.error('Create Loan Error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.getAllLoans = async (req, res) => {
  try {
    console.log('🎯 START getAllLoans');
    console.log('🔍 User Info - ID:', req.user.id, 'Type:', req.user.type);

    const companyId = await getCompanyId(req);
    console.log('🔍 Company ID:', companyId);
    
    if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

    // 🟢 HIGHLIGHTED: Check if user has employee record (has branch)
    const userEmployeeRecord = await getUserEmployeeRecord(req.user.id);
    console.log('🔍 User Employee Record:', userEmployeeRecord);

    let loans = [];

    if (userEmployeeRecord && userEmployeeRecord.branch_id) {
      // 🟢 CASE 1: User has employee record with branch → branch-level access
      console.log('🟡 Branch User Access');
      const branchId = userEmployeeRecord.branch_id;
      
      const allowedCreatedByAll = await getAllUserIdsUnderCompanyBranch(companyId, branchId);
      console.log('🔍 Allowed Created By All (Branch):', allowedCreatedByAll);
      
      loans = await Loan.findAll({
        where: { created_by: { [Op.in]: allowedCreatedByAll } },
        include: [{ model: Employee, as: 'employee', attributes: ['employee_id', 'name', 'branch_id'] }],
        order: [['id', 'DESC']]
      });

    } else if (isEmployeeUser(req)) {
      // 🟢 CASE 2: Employee user → self access only
      console.log('🟡 Employee User Access (Self only)');
      const self = await Employee.findOne({ where: { user_id: req.user.id, deleted_at: null } });
      if (!self) return res.status(404).json({ success: false, message: 'Employee record not found' });
      
      loans = await Loan.findAll({
        where: { employee_id: self.employee_id },
        include: [{ model: Employee, as: 'employee', attributes: ['employee_id', 'name', 'branch_id'] }],
        order: [['id', 'DESC']]
      });

    } else {
      // 🟢 CASE 3: User doesn't have employee record (no branch) → FULL DATABASE ACCESS
      console.log('🟡 Branchless/Company User Access (FULL DATABASE)');
      
      // 🟢 HIGHLIGHTED: DIRECTLY GET ALL LOANS - no branch filter
      const allowedCreatedByAll = await getAllUserIdsUnderCompanyBranch(companyId, null);
      console.log('🔍 Allowed Created By All (Company):', allowedCreatedByAll);
      
      loans = await Loan.findAll({
        where: { created_by: { [Op.in]: allowedCreatedByAll } },
        include: [{ model: Employee, as: 'employee', attributes: ['employee_id', 'name', 'branch_id'] }],
        order: [['id', 'DESC']]
      });
    }

    console.log('🔍 Final Loans Count:', loans.length);
    res.json({ success: true, data: loans.map(formatLoan) });
  } catch (error) {
    console.error('Get All Loans Error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.getLoansByEmployeeId = async (req, res) => {
  try {
    const employeeBusinessId = req.params.id;
    console.log('🎯 START getLoansByEmployeeId');
    console.log('🔍 User Info - ID:', req.user.id, 'Type:', req.user.type);
    console.log('🔍 Requested Employee ID:', employeeBusinessId);

    const companyId = await getCompanyId(req);
    console.log('🔍 Company ID:', companyId);
    
    if (!companyId)
      return res.status(403).json({ success: false, message: 'Unauthorized' });

    // 🟢 HIGHLIGHTED: Check if user has employee record (has branch)
    const userEmployeeRecord = await getUserEmployeeRecord(req.user.id);
    console.log('🔍 User Employee Record:', userEmployeeRecord);

    let allowedCreatedByAll = [];

    if (userEmployeeRecord && userEmployeeRecord.branch_id) {
      // 🟢 CASE 1: BRANCH USER - Can see loans from company + branchless users + own branch users
      console.log('🟡 Branch User Access');
      const branchId = userEmployeeRecord.branch_id;
      
      // 🟢 HIGHLIGHTED: Get COMPANY USERS (company + branchless users)
      const allCompanyUsers = await User.findAll({
        where: { created_by: companyId },
        attributes: ['id'],
        raw: true,
      });
      
      // 🟢 HIGHLIGHTED: Filter to get only branchless users (users without employee records)
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

      // 🟢 HIGHLIGHTED: Get CURRENT BRANCH USERS only
      const branchEmployees = await Employee.findAll({
        where: {
          created_by: companyId,
          branch_id: branchId,
        },
        attributes: ['user_id'],
        raw: true,
      });
      const currentBranchUserIds = branchEmployees.map(e => Number(e.user_id));

      // 🟢 HIGHLIGHTED: Combined allowed users: companyId + branchless users + current branch users
      allowedCreatedByAll = [...new Set([
        Number(companyId), 
        ...branchlessUserIds, 
        ...currentBranchUserIds
      ])];

      console.log('🔍 Company ID:', companyId);
      console.log('🔍 Branchless User IDs:', branchlessUserIds);
      console.log('🔍 Current Branch User IDs:', currentBranchUserIds);
      console.log('🔍 Final Allowed User IDs:', allowedCreatedByAll);

    } else {
      // 🟢 CASE 2: BRANCHLESS/COMPANY USER - Can see ALL loans in company
      console.log('🟡 Branchless/Company User Access (Company-wide)');
      allowedCreatedByAll = await getAllUserIdsUnderCompanyBranch(companyId, null);
      console.log('🔍 Allowed Created By All:', allowedCreatedByAll);
    }

    // 👷 For employee users → restrict strictly to self
    if (isEmployeeUser(req)) {
      const self = await Employee.findOne({
        where: { user_id: req.user.id, deleted_at: null },
      });
      if (!self)
        return res.status(404).json({ success: false, message: 'Employee profile not found' });

      // self-view only
      if (String(self.employee_id) !== String(employeeBusinessId)) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: you can view only your own loans',
        });
      }
    }

    // 🔹 Verify target employee exists and belongs to the company/branch scope
    const targetEmp = await Employee.findOne({
      where: {
        employee_id: employeeBusinessId,
        created_by: { [Op.in]: allowedCreatedByAll },
        deleted_at: null,
      },
    });
    
    console.log('🔍 Target Employee:', targetEmp);

    if (!targetEmp)
      return res.status(404).json({
        success: false,
        message: 'Employee not found in your branch/company',
      });

    // 🟢 HIGHLIGHTED: Additional branch validation for branch users
    if (userEmployeeRecord && userEmployeeRecord.branch_id) {
      if (String(targetEmp.branch_id) !== String(userEmployeeRecord.branch_id)) {
        return res.status(403).json({ 
          success: false, 
          message: 'Forbidden: cannot view loans for employee in another branch' 
        });
      }
    }

    // 🔹 Fetch all loans for that employee
    const loans = await Loan.findAll({
      where: {
        employee_id: targetEmp.employee_id,
        created_by: { [Op.in]: allowedCreatedByAll },
        deleted_at: null,
      },
      include: [
        {
          model: Employee,
          as: 'employee',
          attributes: ['employee_id', 'name', 'email', 'branch_id'],
        },
      ],
      order: [['id', 'DESC']],
    });

    console.log('🔍 Found Loans Count:', loans.length);
    console.log('🔍 Loans Details:', loans.map(l => ({ id: l.id, created_by: l.created_by })));
    res.status(200).json({
      success: true,
      data: loans.map(formatLoan),
    });
  } catch (error) {
    console.error('Get Loans By Employee ID Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

exports.updateLoan = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🎯 START updateLoan');
    console.log('🔍 User Info - ID:', req.user.id, 'Type:', req.user.type);
    console.log('🔍 Requested Loan ID:', id);

    const companyId = await getCompanyId(req);
    console.log('🔍 Company ID:', companyId);
    
    if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

    // 🟢 HIGHLIGHTED: Check if user has employee record (has branch)
    const userEmployeeRecord = await getUserEmployeeRecord(req.user.id);
    console.log('🔍 User Employee Record:', userEmployeeRecord);



    // 🟢 NEW CODE (Fixed):
    let loan;

    if (userEmployeeRecord && userEmployeeRecord.branch_id) {
      // 🟢 BRANCH USER: Find loan by ID and check if employee is in same branch
      const branchId = userEmployeeRecord.branch_id;
      console.log('🟡 Branch User Access - Branch ID:', branchId);
      
      loan = await Loan.findOne({
        where: { id },
        include: [{
          model: Employee, 
          as: 'employee', 
          attributes: ['employee_id', 'branch_id'],
          where: { branch_id: branchId, deleted_at: null } // 🟢 KEY FIX: Filter by employee branch
        }]
      });

      console.log('🔍 Found Loan for Branch User:', loan ? {
        id: loan.id,
        employee_id: loan.employee_id,
        created_by: loan.created_by,
        employee_branch: loan.employee?.branch_id
      } : 'NOT FOUND IN YOUR BRANCH');

    } else {
      // 🟢 BRANCHLESS USER: Full company access - find by created_by
      console.log('🟡 Branchless User Access (Company-wide)');
      const allowedCreatedByAll = await getAllUserIdsUnderCompanyBranch(companyId, null);
      console.log('🔍 Allowed Created By All:', allowedCreatedByAll);

      loan = await Loan.findOne({
        where: { id, created_by: { [Op.in]: allowedCreatedByAll } },
        include: [{ model: Employee, as: 'employee', attributes: ['employee_id', 'branch_id'] }]
      });

      console.log('🔍 Found Loan for Branchless User:', loan ? {
        id: loan.id,
        employee_id: loan.employee_id,
        created_by: loan.created_by,
        employee_branch: loan.employee?.branch_id
      } : 'NOT FOUND');
    }

    if (!loan) return res.status(404).json({ success: false, message: 'Loan not found' });

    

    // Employee Self Restriction
    if (isEmployeeUser(req)) {
      const self = await Employee.findOne({ where: { user_id: req.user.id, deleted_at: null } });
      console.log('🔍 Employee Self Check - Self Employee ID:', self?.employee_id, 'Loan Employee ID:', loan.employee_id);
      if (!self || self.employee_id !== loan.employee_id)
        return res.status(403).json({ success: false, message: 'Forbidden: cannot update others loan' });
    }

    await loan.update({ ...req.body, updated_at: new Date() });

    const updatedLoan = await Loan.findOne({
      where: { id: loan.id },
      include: [{ model: Employee, as: 'employee', attributes: ['employee_id', 'name', 'email', 'branch_id'] }]
    });

    console.log('✅ Loan updated successfully');
    res.json({ success: true, message: 'Loan updated', data: formatLoan(updatedLoan) });
  } catch (error) {
    console.error('Update Loan Error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};




exports.deleteLoan = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🎯 START deleteLoan');
    console.log('🔍 User Info - ID:', req.user.id, 'Type:', req.user.type);
    console.log('🔍 Requested Loan ID:', id);

    const companyId = await getCompanyId(req);
    console.log('🔍 Company ID:', companyId);
    
    if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

    // 🟢 HIGHLIGHTED: Check if user has employee record (has branch)
    const userEmployeeRecord = await getUserEmployeeRecord(req.user.id);
    console.log('🔍 User Employee Record:', userEmployeeRecord);

    // 🟢 HIGHLIGHTED: NEW ACCESS CONTROL LOGIC
    let branchId = null;
    if (userEmployeeRecord && userEmployeeRecord.branch_id) {
      // 🟢 BRANCH USER: Restricted to own branch
      branchId = userEmployeeRecord.branch_id;
      console.log('🟡 Branch User Access - Branch ID:', branchId);
    } else {
      // 🟢 BRANCHLESS USER: Full company access
      console.log('🟡 Branchless User Access (Company-wide)');
      branchId = null; // No branch restrictions
    }

    const allowedCreatedByAll = await getAllUserIdsUnderCompanyBranch(companyId, branchId);
    console.log('🔍 Allowed Created By All:', allowedCreatedByAll);

    const loan = await Loan.findOne({
      where: { id, created_by: { [Op.in]: allowedCreatedByAll } },
      include: [{ model: Employee, as: 'employee', attributes: ['branch_id'] }]
    });

    console.log('🔍 Found Loan:', loan ? {
      id: loan.id,
      employee_id: loan.employee_id,
      created_by: loan.created_by,
      employee_branch: loan.employee?.branch_id
    } : 'NOT FOUND');

    if (!loan) return res.status(404).json({ success: false, message: 'Loan not found' });

    // 🟢 HIGHLIGHTED: Additional branch validation for branch users
    if (userEmployeeRecord && userEmployeeRecord.branch_id) {
      console.log('🔍 Checking branch access - User Branch:', userEmployeeRecord.branch_id, 'Employee Branch:', loan.employee?.branch_id);
      if (String(loan.employee.branch_id) !== String(userEmployeeRecord.branch_id)) {
        return res.status(403).json({ 
          success: false, 
          message: 'Forbidden: cannot delete loan for employee in another branch' 
        });
      }
    }

    if (isEmployeeUser(req)) {
      const self = await Employee.findOne({ where: { user_id: req.user.id, deleted_at: null } });
      console.log('🔍 Employee Self Check - Self Employee ID:', self?.employee_id, 'Loan Employee ID:', loan.employee_id);
      if (!self || self.employee_id !== loan.employee_id)
        return res.status(403).json({ success: false, message: 'Forbidden: cannot delete others loan' });
    }

    await loan.destroy(); // soft delete
    console.log('✅ Loan deleted successfully');
    res.json({ success: true, message: 'Loan deleted (soft)', data: { id } });
  } catch (error) {
    console.error('Delete Loan Error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

