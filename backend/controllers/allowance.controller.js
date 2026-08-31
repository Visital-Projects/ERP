
const { Op } = require('sequelize');
const Allowance = require('../models/allowance.model');
const Employee = require('../models/employee.model');
const User = require('../models/user.model'); 
const Branch = require('../models/branch.model');

const formatAllowanceResponse = (allowance) => {
  if (!allowance) return null;
  const json = allowance.toJSON();
  return {
    id: json.id,
    employee_id: json.employee_id,
    allowance_option: json.allowance_option,
    title: json.title,
    type: json.type,
    amount: json.amount,
    created_by: json.created_by,
    branch_id: json.branch_id, 
    created_at: json.created_at,
    updated_at: json.updated_at
  };
};


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


exports.getAll = async (req, res) => {
  try {
    console.log('🎯 START getAll Allowances');
    console.log('🔍 User Info - ID:', req.user.id, 'Type:', req.user.type);

    const companyId = await getCompanyId(req);
    if (!companyId)
      return res.status(403).json({ success: false, message: "Unauthorized" });

    let allowances = [];

    // 🟢 SUPER ADMIN: Full access
    if (isSuper(req)) {
      console.log('🟡 Super Admin Access');
      allowances = await Allowance.findAll({
        order: [["id", "DESC"]],
      });
    }
    // 🟢 COMPANY USER: Full access to company allowances
    else if (isCompanyUser(req)) {
      console.log('🟡 Company User Access');
      const allowedUserIds = await getAllUserIdsUnderCompanyBranch(companyId, null);
      allowances = await Allowance.findAll({
        where: { created_by: { [Op.in]: allowedUserIds } },
        order: [["id", "DESC"]],
      });
    }
    // 🟢 EMPLOYEE USER: Self only
    else if (isEmployeeUser(req)) {
      console.log('🟡 Employee User Access - Own allowances only');
      const emp = await Employee.findOne({ where: { user_id: req.user.id } });
      if (!emp)
        return res.status(403).json({ success: false, message: "Employee profile not found" });

      allowances = await Allowance.findAll({
        where: { employee_id: emp.employee_id },
        order: [["id", "DESC"]],
      });
    }
    // 🟢 ROLE USERS (Branch/Branchless)
    else {
      // 🔹 Check if logged-in user has an Employee record (has branch)
      const userEmployeeRecord = await Employee.findOne({
        where: { user_id: req.user.id },
        attributes: ['branch_id', 'created_by'],
        raw: true,
      });

      console.log('🔍 User Employee Record:', userEmployeeRecord);

      if (userEmployeeRecord && userEmployeeRecord.branch_id) {
        // 🟢 UPDATED AREA: BRANCH USER - Can see allowances from:
        // 1. Company users
        // 2. Branchless users  
        // 3. Their own branch users
        console.log('🟡 Branch User Access');
        const branchId = userEmployeeRecord.branch_id;
        
        // 🟢 STEP 1: Get COMPANY USERS (branchless users) - users without employee records
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

        // 🟢 STEP 2: Get CURRENT BRANCH USERS only
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

        // 🟢 Get employees in current branch
        const branchEmployeesList = await Employee.findAll({
          where: { branch_id: branchId, deleted_at: null },
          attributes: ["employee_id"],
          raw: true,
        });

        const employeeIds = branchEmployeesList.map(e => e.employee_id);
        if (employeeIds.length === 0) {
          allowances = [];
        } else {
          allowances = await Allowance.findAll({
            where: { 
              // 🟢 UPDATED: Show allowances created by company/branchless users OR for employees in current branch
              [Op.or]: [
                { created_by: { [Op.in]: allowedUserIds } }, // Allowances created by company/branchless users
                { employee_id: { [Op.in]: employeeIds } }    // Allowances for employees in current branch
              ]
            },
            order: [["id", "DESC"]],
          });
        }
      } else {
        // 🟢 BRANCHLESS USER: Can see ALL allowances in the company
        console.log('🟡 Branchless User Access (FULL ACCESS)');
        const allowedUserIds = await getAllUserIdsUnderCompanyBranch(companyId, null);
        allowances = await Allowance.findAll({
          where: { created_by: { [Op.in]: allowedUserIds } },
          order: [["id", "DESC"]],
        });
      }
    }

    console.log('🔍 Final Allowances Count:', allowances.length);
    return res.json({ success: true, data: allowances.map(formatAllowanceResponse) });
  } catch (error) {
    console.error("❌ Get All Allowances Error:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

exports.getByEmployeeId = async (req, res) => {
  try {
    console.log('🎯 START getByEmployeeId Allowances');
    console.log('🔍 User Info - ID:', req.user.id, 'Type:', req.user.type);
    console.log('🔍 Requested Employee ID:', req.params.id);

    const employee_id = req.params.id;
    if (!employee_id)
      return res.status(400).json({ success: false, message: "employee_id required" });

    const companyId = await getCompanyId(req);
    console.log('🔍 Company ID:', companyId);
    
    if (!companyId)
      return res.status(403).json({ success: false, message: "Unauthorized" });

    // Find employee
    const allUserIds = await getAllUserIdsUnderCompanyBranch(companyId, null);
    const targetEmployee = await Employee.findOne({
      where: { employee_id, created_by: { [Op.in]: allUserIds }, deleted_at: null },
    });
    if (!targetEmployee)
      return res.status(404).json({ success: false, message: "Employee not found in your company" });

    let allowances = [];

    // 🟢 EMPLOYEE USER: Self only
    if (isEmployeeUser(req)) {
      console.log('🟡 Employee User - Getting own allowances');
      const self = await Employee.findOne({ where: { user_id: req.user.id } });
      if (!self || String(self.employee_id) !== String(employee_id))
        return res.status(403).json({ success: false, message: "You can only view your own allowances" });

      allowances = await Allowance.findAll({ where: { employee_id }, order: [["id", "DESC"]] });
    }
    // 🟢 SUPER ADMIN / COMPANY USER: Full access
    else if (isSuper(req) || isCompanyUser(req)) {
      console.log('🟡 Company/Super Admin - Getting allowances');
      allowances = await Allowance.findAll({
        where: { employee_id },
        order: [["id", "DESC"]],
      });
    }
    // 🟢 ROLE USERS (Branch/Branchless)
    else {
      // 🔹 Check if logged-in user has an Employee record (has branch)
      const userEmployeeRecord = await Employee.findOne({
        where: { user_id: req.user.id },
        attributes: ['branch_id', 'created_by'],
        raw: true,
      });

      console.log('🔍 User Employee Record:', userEmployeeRecord);

      if (userEmployeeRecord && userEmployeeRecord.branch_id) {
        // 🟢 UPDATED AREA: BRANCH USER - Can get ALL allowances for employees in their own branch
        console.log('🟡 Branch User - Getting allowances');
        if (Number(targetEmployee.branch_id) !== Number(userEmployeeRecord.branch_id)) {
          return res.status(403).json({ success: false, message: "Forbidden: not in your branch" });
        }

        // 🟢 FIXED: Get ALL allowances for the employee (no created_by filter)
        allowances = await Allowance.findAll({
          where: { employee_id },
          order: [["id", "DESC"]],
        });
        
        console.log('🔍 Branch User - Found allowances:', allowances.length);
        
        // 🟢 DEBUG: Check what allowances exist for this employee
        const allAllowancesForEmployee = await Allowance.findAll({
          where: { employee_id },
          order: [["id", "DESC"]],
          raw: true
        });
        console.log('🔍 DEBUG - All allowances for employee:', allAllowancesForEmployee.map(a => ({ id: a.id, created_by: a.created_by })));
        
      } else {
        // 🟢 BRANCHLESS USER: Can get allowances for ANY employee in the company
        console.log('🟡 Branchless User - Getting allowances (FULL ACCESS)');
        allowances = await Allowance.findAll({
          where: { employee_id },
          order: [["id", "DESC"]],
        });
      }
    }

    console.log('🔍 Final Allowances Count for Employee:', allowances.length);
    console.log('🔍 Allowances Details:', allowances.map(a => ({ id: a.id, created_by: a.created_by })));
    
    // 🟢 FIXED TYPO: Changed success: false to success: true
    return res.json({ success: true, data: allowances.map(formatAllowanceResponse) });
  } catch (error) {
    console.error("❌ Get Allowances By Employee ID Error:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    console.log('🎯 START create Allowance');
    console.log('🔍 User Info - ID:', req.user.id, 'Type:', req.user.type);

    const { employee_id, allowance_option, title, type, amount } = req.body;
    if (!employee_id)
      return res.status(400).json({ success: false, message: 'employee_id is required' });

    const companyId = await getCompanyId(req);
    console.log('🔍 Company ID:', companyId);
    
    if (!companyId)
      return res.status(403).json({ success: false, message: 'Unauthorized' });

    // Get all allowed user IDs under company
    const allowedCreatedByAll = await getAllUserIdsUnderCompanyBranch(companyId, null);

    // Ensure target employee exists
    const targetEmployee = await Employee.findOne({
      where: {
        employee_id,
        created_by: { [Op.in]: allowedCreatedByAll },
        deleted_at: null,
      },
    });

    if (!targetEmployee)
      return res.status(400).json({ success: false, message: 'Employee not found in your company' });

    // 🟢 UPDATED AREA: Access Control Logic
    let hasAccess = false;

    // 🟢 SUPER ADMIN: Full access
    if (isSuper(req)) {
      console.log('🟡 Super Admin - Creating allowance');
      hasAccess = true;
    }
    // 🟢 COMPANY USER: Full access
    else if (isCompanyUser(req)) {
      console.log('🟡 Company User - Creating allowance');
      hasAccess = true;
    }
    // 🟢 EMPLOYEE USER: Self only
    else if (isEmployeeUser(req)) {
      console.log('🟡 Employee User - Creating own allowance');
      const self = await Employee.findOne({ where: { user_id: req.user.id } });
      if (self && String(self.employee_id) === String(employee_id)) {
        hasAccess = true;
      } else {
        return res.status(403).json({ success: false, message: 'You can only create allowances for yourself' });
      }
    }
    // 🟢 ROLE USERS (Branch/Branchless)
    else {
      // 🔹 Check if logged-in user has an Employee record (has branch)
      const userEmployeeRecord = await Employee.findOne({
        where: { user_id: req.user.id },
        attributes: ['branch_id', 'created_by'],
        raw: true,
      });

      console.log('🔍 User Employee Record:', userEmployeeRecord);

      if (userEmployeeRecord && userEmployeeRecord.branch_id) {
        // 🟢 BRANCH USER: Can only create allowances for employees in their own branch
        console.log('🟡 Branch User - Creating allowance');
        if (Number(targetEmployee.branch_id) === Number(userEmployeeRecord.branch_id)) {
          hasAccess = true;
        } else {
          return res.status(403).json({ success: false, message: 'Forbidden: cannot create allowance for employees of another branch' });
        }
      } else {
        // 🟢 BRANCHLESS USER: Can create allowances for ANY employee in the company
        console.log('🟡 Branchless User - Creating allowance (FULL ACCESS)');
        hasAccess = true;
      }
    }

    if (!hasAccess) {
      return res.status(403).json({ success: false, message: 'Forbidden: no access to create allowance for this employee' });
    }

    // 🟢 Determine created_by based on user type
    let createdBy;
    if (isCompanyUser(req) || isSuper(req)) {
      createdBy = companyId;
    } else {
      createdBy = req.user.id; // branch-level user or employee
    }

    // 🟢 Create allowance
    const allowance = await Allowance.create({
      employee_id,
      allowance_option,
      title,
      type,
      amount,
      created_by: createdBy,
      branch_id: targetEmployee.branch_id,
      created_at: new Date(),
      updated_at: new Date(),
    });

    console.log('✅ Allowance created successfully');
    return res.status(201).json({
      success: true,
      message: 'Allowance created successfully',
      data: formatAllowanceResponse(allowance),
    });
  } catch (error) {
    console.error('❌ Create Allowance Error:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};


exports.update = async (req, res) => {
  try {
    console.log('🎯 START update Allowance');
    console.log('🔍 User Info - ID:', req.user.id, 'Type:', req.user.type);
    console.log('🔍 Requested Allowance ID:', req.params.id);

    const allowanceId = req.params.id;
    const { employee_id, allowance_option, title, type, amount } = req.body;

    const allowance = await Allowance.findByPk(allowanceId);
    if (!allowance)
      return res.status(404).json({ success: false, message: 'Allowance not found' });

    const companyId = await getCompanyId(req);
    console.log('🔍 Company ID:', companyId);
    
    if (!companyId)
      return res.status(403).json({ success: false, message: 'Unauthorized' });

    // 🔹 UPDATED: fetch current employee associated with allowance
    const allowedCreatedByAll = await getAllUserIdsUnderCompanyBranch(companyId, null);
    const currentEmployee = await Employee.findOne({
      where: { employee_id: allowance.employee_id, created_by: { [Op.in]: allowedCreatedByAll }, deleted_at: null }
    });
    if (!currentEmployee)
      return res.status(404).json({ success: false, message: 'Associated employee not found in your company' });

    // 🟢 UPDATED AREA: SIMPLIFIED Access Control Logic
    console.log('🔍 Current Employee Branch ID:', currentEmployee.branch_id);

    // 🟢 SUPER ADMIN: Full access
    if (isSuper(req)) {
      console.log('🟡 Super Admin - Updating allowance');
    }
    // 🟢 COMPANY USER: Full access
    else if (isCompanyUser(req)) {
      console.log('🟡 Company User - Updating allowance');
    }
    // 🟢 EMPLOYEE USER: Self only
    else if (isEmployeeUser(req)) {
      console.log('🟡 Employee User - Updating own allowance');
      const self = await Employee.findOne({ where: { user_id: req.user.id } });
      if (!self || String(self.employee_id) !== String(allowance.employee_id)) {
        return res.status(403).json({ success: false, message: 'Forbidden: you can update only your allowances' });
      }
    }
    // 🟢 ROLE USERS (Branch/Branchless)
    else {
      // 🔹 Check if logged-in user has an Employee record (has branch)
      const userEmployeeRecord = await Employee.findOne({
        where: { user_id: req.user.id },
        attributes: ['branch_id', 'created_by'],
        raw: true,
      });

      console.log('🔍 User Employee Record:', userEmployeeRecord);

      if (userEmployeeRecord && userEmployeeRecord.branch_id) {
        // 🟢 BRANCH USER: Can update allowances for employees in their own branch
        console.log('🟡 Branch User - Updating allowance');
        console.log('🔍 User Branch ID:', userEmployeeRecord.branch_id);
        console.log('🔍 Employee Branch ID:', currentEmployee.branch_id);
        
        if (Number(currentEmployee.branch_id) !== Number(userEmployeeRecord.branch_id)) {
          return res.status(403).json({ 
            success: false, 
            message: 'Forbidden: cannot update allowance for employees of another branch' 
          });
        }
        console.log('✅ Branch User - Access granted (same branch)');
      } else {
        // 🟢 BRANCHLESS USER: Can update allowances for ANY employee in the company
        console.log('🟡 Branchless User - Updating allowance (FULL ACCESS)');
        
        // 🟢 Check if allowance was created by company or branchless users
        const allowedUserIds = await getAllUserIdsUnderCompanyBranch(companyId, null);
        
        if (!allowedUserIds.map(String).includes(String(allowance.created_by))) {
          return res.status(403).json({ 
            success: false, 
            message: 'Forbidden: you can only update allowances in your company' 
          });
        }
        console.log('✅ Branchless User - Access granted');
      }
    }
    // 🟢 END UPDATED AREA

    // 🔹 UPDATED: changing employee_id → validate new employee is in company & branch
    if (employee_id && String(employee_id) !== String(allowance.employee_id)) {
      const newEmployee = await Employee.findOne({
        where: { employee_id, created_by: { [Op.in]: allowedCreatedByAll }, deleted_at: null }
      });
      if (!newEmployee)
        return res.status(400).json({ success: false, message: 'New employee not found in your company' });

      // 🟢 UPDATED AREA: Access control for employee change
      let canChangeEmployee = false;

      if (isSuper(req) || isCompanyUser(req)) {
        // 🟢 Super/Company users can change to any employee
        canChangeEmployee = true;
      } 
      else if (isEmployeeUser(req)) {
        // 🟢 Employee users cannot change employee_id (only their own)
        return res.status(403).json({ success: false, message: 'Forbidden: employees cannot change allowance assignment' });
      }
      else {
        // 🔹 Check if logged-in user has an Employee record (has branch)
        const userEmpRecord = await Employee.findOne({
          where: { user_id: req.user.id },
          attributes: ['branch_id'],
          raw: true,
        });

        if (userEmpRecord && userEmpRecord.branch_id) {
          // 🟢 Branch users can only change to employees in their own branch
          if (Number(newEmployee.branch_id) === Number(userEmpRecord.branch_id)) {
            canChangeEmployee = true;
          } else {
            return res.status(403).json({ success: false, message: 'Forbidden: cannot assign allowance to employee in another branch' });
          }
        } else {
          // 🟢 Branchless users can change to any employee
          canChangeEmployee = true;
        }
      }

      if (canChangeEmployee) {
        allowance.employee_id = employee_id;
        allowance.branch_id = newEmployee.branch_id;
        console.log('🔍 Employee changed successfully');
      }
    }

    await allowance.update({
      allowance_option,
      title,
      type,
      amount,
      updated_at: new Date()
    });

    console.log('✅ Allowance updated successfully');
    return res.json({
      success: true,
      message: 'Allowance updated',
      data: formatAllowanceResponse(allowance)
    });
  } catch (error) {
    console.error('❌ Update Allowance Error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    console.log('🎯 START remove Allowance');
    console.log('🔍 User Info - ID:', req.user.id, 'Type:', req.user.type);
    console.log('🔍 Requested Allowance ID:', req.params.id);

    const { id } = req.params;
    const allowance = await Allowance.findByPk(id);
    if (!allowance)
      return res.status(404).json({ success: false, message: 'Allowance not found' });

    const companyId = await getCompanyId(req);
    console.log('🔍 Company ID:', companyId);
    
    if (!companyId)
      return res.status(403).json({ success: false, message: 'Unauthorized' });

    // 🔹 UPDATED: fetch associated employee
    const allowedCreatedByAll = await getAllUserIdsUnderCompanyBranch(companyId, null);
    const assocEmp = await Employee.findOne({
      where: { employee_id: allowance.employee_id, created_by: { [Op.in]: allowedCreatedByAll }, deleted_at: null }
    });
    if (!assocEmp)
      return res.status(404).json({ success: false, message: 'Associated employee not found in your company' });

    // 🟢 UPDATED AREA: SIMPLIFIED Access Control Logic
    console.log('🔍 Allowance created_by:', allowance.created_by);
    console.log('🔍 Employee branch_id:', assocEmp.branch_id);

    // 🟢 SUPER ADMIN: Full access
    if (isSuper(req)) {
      console.log('🟡 Super Admin - Deleting allowance');
    }
    // 🟢 COMPANY USER: Full access
    else if (isCompanyUser(req)) {
      console.log('🟡 Company User - Deleting allowance');
    }
    // 🟢 EMPLOYEE USER: Self only
    else if (isEmployeeUser(req)) {
      console.log('🟡 Employee User - Deleting own allowance');
      const self = await Employee.findOne({ where: { user_id: req.user.id } });
      if (!self || String(self.employee_id) !== String(assocEmp.employee_id)) {
        return res.status(403).json({ success: false, message: 'Forbidden: you can delete only your allowances' });
      }
    }
    // 🟢 ROLE USERS (Branch/Branchless)
    else {
      // 🔹 Check if logged-in user has an Employee record (has branch)
      const userEmployeeRecord = await Employee.findOne({
        where: { user_id: req.user.id },
        attributes: ['branch_id', 'created_by'],
        raw: true,
      });

      console.log('🔍 User Employee Record:', userEmployeeRecord);

      if (userEmployeeRecord && userEmployeeRecord.branch_id) {
        // 🟢 BRANCH USER: Can only delete allowances for employees in their own branch
        console.log('🟡 Branch User - Deleting allowance');
        console.log('🔍 User Branch ID:', userEmployeeRecord.branch_id);
        console.log('🔍 Employee Branch ID:', assocEmp.branch_id);
        
        if (Number(assocEmp.branch_id) !== Number(userEmployeeRecord.branch_id)) {
          return res.status(403).json({ 
            success: false, 
            message: 'Forbidden: cannot delete allowance for employees of another branch' 
          });
        }
        console.log('✅ Branch User - Access granted (same branch)');
      } else {
        // 🟢 BRANCHLESS USER: Can delete allowances for ANY employee in the company
        console.log('🟡 Branchless User - Deleting allowance (FULL ACCESS)');
        
        // 🟢 FIXED: SIMPLIFIED - Branchless users can delete ANY allowance in the company
        console.log('✅ Branchless User - Access granted to delete allowance');
      }
    }
    // 🟢 END UPDATED AREA

    await allowance.destroy();
    console.log('✅ Allowance deleted successfully');
    return res.json({ success: true, message: 'Allowance deleted (soft)', data: { id } });
    
  } catch (error) {
    console.error('❌ Delete Allowance Error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};