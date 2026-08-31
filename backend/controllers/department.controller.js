
const { Op } = require("sequelize");
const Department = require('../models/department.model');
const Branch = require('../models/branch.model');
const Employee = require('../models/employee.model');
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
function isCompany(req) { return (req.user?.type || '').toLowerCase() === 'company'; }
function isEmployee(req) { return (req.user?.type || '').toLowerCase() === 'employee'; }

async function getUserBranchId(userId) {
  const emp = await Employee.findOne({
    where: { user_id: userId },
    attributes: ['branch_id'],
    raw: true,
  });
  return emp?.branch_id || null;
}


exports.getAllDepartments = async (req, res) => {
  try {
    console.log('🎯 START getAllDepartments');
    console.log('🔍 User Info - ID:', req.user.id, 'Type:', req.user.type);

    // 🟢 SUPER ADMIN: Full access
    if (isSuper(req)) {
      console.log('🟡 Super Admin Access');
      const departments = await Department.findAll({
        include: [{ model: Branch, as: "branch", attributes: ["id", "name"] }],
        order: [["id", "DESC"]],
      });
      console.log('🟡 Super Admin Departments Count:', departments.length);
      return res.json({ success: true, data: departments });
    }

    // 🟢 Check if user exists in employees table (has branch)
    const userEmployeeRecord = await Employee.findOne({
      where: { user_id: req.user.id },
      attributes: ['branch_id', 'created_by'],
      raw: true,
    });

    console.log('🔍 User Employee Record:', userEmployeeRecord);

    let departments = [];

    if (userEmployeeRecord && userEmployeeRecord.branch_id) {
      // 🟢 CASE 1: User has employee record with branch → show only their branch departments
      console.log('🟡 Branch User Access');
      const branchId = userEmployeeRecord.branch_id;
      console.log('🔍 Branch ID:', branchId);
      
      // Get company ID for branch users
      const companyId = await getCompanyId(req);
      console.log('🔍 Company ID for Branch User:', companyId);
      
      if (!companyId) return res.status(403).json({ success: false, message: "Unauthorized" });

      // 🟢 Show only departments from user's branch
      departments = await Department.findAll({
        where: {
          branch_id: branchId,
          created_by: companyId
        },
        include: [{ model: Branch, as: "branch", attributes: ["id", "name"] }],
        order: [["id", "DESC"]],
      });

    } else {
      // 🟢 CASE 2: User doesn't have employee record (no branch) → FULL DATABASE ACCESS
      console.log('🟡 Branchless User Access (FULL DATABASE)');
      
      // 🟢 DIRECTLY GET ALL DEPARTMENTS - no company filter
      const companyId = await getCompanyId(req);
      if (!companyId) return res.status(403).json({ success: false, message: "Unauthorized" });

      departments = await Department.findAll({
        where: { created_by: companyId },
        include: [{ model: Branch, as: "branch", attributes: ["id", "name"] }],
        order: [["id", "DESC"]],
      });
      
      console.log('🔍 Branchless User - All Departments Count:', departments.length);
    }

    console.log('🔍 Final Departments Count:', departments.length);
    console.log('✅ END getAllDepartments - Success');
    return res.json({ success: true, data: departments });

  } catch (error) {
    console.error("❌ Get All Departments Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};


exports.getDepartmentById = async (req, res) => {
  try {
    console.log('🎯 START getDepartmentById');
    console.log('🔍 User Info - ID:', req.user.id, 'Type:', req.user.type);
    
    const id = req.params.id;
    const dept = await Department.findByPk(id, {
      include: [{ model: Branch, as: "branch", attributes: ["id", "name"] }],
    });
    if (!dept) return res.status(404).json({ success: false, message: 'Department not found' });

    // 🟢 SUPER ADMIN: Full access
    if (isSuper(req)) {
      console.log('🟡 Super Admin - Accessing department');
      return res.json({ success: true, data: dept });
    }

    // 🟢 Check if user exists in employees table (has branch)
    const userEmployeeRecord = await Employee.findOne({
      where: { user_id: req.user.id },
      attributes: ['branch_id', 'created_by'],
      raw: true,
    });

    let canAccess = false;

    if (userEmployeeRecord && userEmployeeRecord.branch_id) {
      // 🟢 CASE 1: User has employee record with branch → check if they can access this department
      const companyId = await getCompanyId(req);
      if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

      // Branch users can only access departments from their branch
      if (Number(dept.branch_id) === Number(userEmployeeRecord.branch_id)) {
        canAccess = true;
      }
    } else {
      // 🟢 CASE 2: User doesn't have employee record (no branch) → check company access
      const companyId = await getCompanyId(req);
      if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

      // Branchless users can access any department created by their company
      if (Number(dept.created_by) === Number(companyId)) {
        canAccess = true;
      }
    }

    if (!canAccess) {
      return res.status(403).json({ success: false, message: 'No permission to access this department' });
    }

    console.log('✅ Department accessed successfully');
    return res.json({ success: true, data: dept });
  } catch (err) {
    console.error('❌ Get Department Error:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};


exports.createDepartment = async (req, res) => {
  try {
    console.log('🎯 START createDepartment');
    console.log('🔍 User Info - ID:', req.user.id, 'Type:', req.user.type);
    
    const { name, branch_id } = req.body;
    if (!name?.trim() || !branch_id) {
      return res.status(400).json({ success: false, message: 'Name and Branch ID are required' });
    }

    // 🟢 SUPER ADMIN: Full access
    if (isSuper(req)) {
      console.log('🟡 Super Admin - Creating department');
      const dept = await Department.create({
        name: name.trim(),
        branch_id,
        created_by: req.user.id,
        user_id: req.user.id || null,
        created_at: new Date(),
        updated_at: new Date(),
      });
      console.log('✅ Department created successfully by Super Admin');
      return res.status(201).json({ success: true, data: dept });
    }

    // 🟢 Check if user exists in employees table (has branch)
    const userEmployeeRecord = await Employee.findOne({
      where: { user_id: req.user.id },
      attributes: ['branch_id', 'created_by'],
      raw: true,
    });

    let companyId;
    let canCreate = false;

    if (userEmployeeRecord && userEmployeeRecord.branch_id) {
      // 🟢 CASE 1: User has employee record with branch → check if they can create in this branch
      console.log('🟡 Branch User - Checking creation permissions');
      companyId = await getCompanyId(req);
      if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

      // Branch users can only create departments in their own branch
      if (Number(branch_id) === Number(userEmployeeRecord.branch_id)) {
        canCreate = true;
      }
    } else {
      // 🟢 CASE 2: User doesn't have employee record (no branch) → FULL ACCESS
      console.log('🟡 Branchless User - Creating department');
      companyId = await getCompanyId(req);
      if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });
      canCreate = true;
    }

    if (!canCreate) {
      return res.status(403).json({ success: false, message: 'No permission to create department in this branch' });
    }

    const dept = await Department.create({
      name: name.trim(),
      branch_id,
      created_by: companyId,
      user_id: req.user.id || null,
      created_at: new Date(),
      updated_at: new Date(),
    });

    console.log('✅ Department created successfully');
    return res.status(201).json({ success: true, data: dept });
  } catch (err) {
    console.error('❌ Create Department Error:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};


exports.updateDepartment = async (req, res) => {
  try {
    console.log('🎯 START updateDepartment');
    console.log('🔍 User Info - ID:', req.user.id, 'Type:', req.user.type);
    
    const { name, branch_id } = req.body;
    if (!name?.trim() || !branch_id) {
      return res.status(400).json({ success: false, message: 'Name and Branch ID are required' });
    }

    const dept = await Department.findByPk(req.params.id);
    if (!dept) return res.status(404).json({ success: false, message: 'Department not found' });

    // 🟢 SUPER ADMIN: Full access
    if (isSuper(req)) {
      console.log('🟡 Super Admin - Updating department');
      dept.name = name.trim();
      dept.branch_id = branch_id;
      dept.updated_at = new Date();
      await dept.save();
      console.log('✅ Department updated successfully by Super Admin');
      return res.json({ success: true, data: dept });
    }

    // 🟢 Check if user exists in employees table (has branch)
    const userEmployeeRecord = await Employee.findOne({
      where: { user_id: req.user.id },
      attributes: ['branch_id', 'created_by'],
      raw: true,
    });

    let canUpdate = false;

    if (userEmployeeRecord && userEmployeeRecord.branch_id) {
      // 🟢 CASE 1: User has employee record with branch → check if they can update this department
      const companyId = await getCompanyId(req);
      if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

      // Branch users can only update departments from their branch
      if (Number(dept.branch_id) === Number(userEmployeeRecord.branch_id)) {
        canUpdate = true;
      }
    } else {
      // 🟢 CASE 2: User doesn't have employee record (no branch) → check company access
      const companyId = await getCompanyId(req);
      if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

      // Branchless users can update any department created by their company
      if (Number(dept.created_by) === Number(companyId)) {
        canUpdate = true;
      }
    }

    if (!canUpdate) {
      return res.status(403).json({ success: false, message: 'No permission to update this department' });
    }

    dept.name = name.trim();
    dept.branch_id = branch_id;
    dept.updated_at = new Date();
    await dept.save();

    console.log('✅ Department updated successfully');
    return res.json({ success: true, data: dept });
  } catch (err) {
    console.error('❌ Update Department Error:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};


exports.deleteDepartment = async (req, res) => {
  try {
    console.log('🎯 START deleteDepartment');
    console.log('🔍 User Info - ID:', req.user.id, 'Type:', req.user.type);
    
    const dept = await Department.findByPk(req.params.id);
    if (!dept) return res.status(404).json({ success: false, message: 'Department not found' });

    // 🟢 SUPER ADMIN: Full access
    if (isSuper(req)) {
      console.log('🟡 Super Admin - Deleting department');
      await dept.destroy();
      console.log('✅ Department deleted successfully by Super Admin');
      return res.json({ success: true, message: 'Department deleted successfully' });
    }

    // 🟢 Check if user exists in employees table (has branch)
    const userEmployeeRecord = await Employee.findOne({
      where: { user_id: req.user.id },
      attributes: ['branch_id', 'created_by'],
      raw: true,
    });

    let canDelete = false;

    if (userEmployeeRecord && userEmployeeRecord.branch_id) {
      // 🟢 CASE 1: User has employee record with branch → check if they can delete this department
      const companyId = await getCompanyId(req);
      if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

      // Branch users can only delete departments from their branch
      if (Number(dept.branch_id) === Number(userEmployeeRecord.branch_id)) {
        canDelete = true;
      }
    } else {
      // 🟢 CASE 2: User doesn't have employee record (no branch) → check company access
      const companyId = await getCompanyId(req);
      if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

      // Branchless users can delete any department created by their company
      if (Number(dept.created_by) === Number(companyId)) {
        canDelete = true;
      }
    }

    if (!canDelete) {
      return res.status(403).json({ success: false, message: 'No permission to delete this department' });
    }

    await dept.destroy();
    console.log('✅ Department deleted successfully');
    return res.json({ success: true, message: 'Department deleted successfully' });
  } catch (err) {
    console.error('❌ Delete Department Error:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};


exports.getDepartmentsByBranchId = async (req, res) => {
  try {
    console.log('🎯 START getDepartmentsByBranchId');
    console.log('🔍 User Info - ID:', req.user.id, 'Type:', req.user.type);
    
    const branchId = req.params.branchId;

    // 🟢 SUPER ADMIN: Full access
    if (isSuper(req)) {
      console.log('🟡 Super Admin - Accessing departments by branch');
      const departments = await Department.findAll({
        where: { branch_id: branchId },
        include: [{ model: Branch, as: "branch", attributes: ["id", "name"] }],
        order: [["id", "DESC"]],
      });
      return res.json({ success: true, data: departments });
    }

    // 🟢 Check if user exists in employees table (has branch)
    const userEmployeeRecord = await Employee.findOne({
      where: { user_id: req.user.id },
      attributes: ['branch_id', 'created_by'],
      raw: true,
    });

    let canAccess = false;

    if (userEmployeeRecord && userEmployeeRecord.branch_id) {
      // 🟢 CASE 1: User has employee record with branch → check if they can access this branch's departments
      const companyId = await getCompanyId(req);
      if (!companyId) return res.status(403).json({ success: false, message: "Unauthorized" });

      // Branch users can only access departments from their own branch
      if (String(branchId) === String(userEmployeeRecord.branch_id)) {
        canAccess = true;
      }
    } else {
      // 🟢 CASE 2: User doesn't have employee record (no branch) → check company access
      const companyId = await getCompanyId(req);
      if (!companyId) return res.status(403).json({ success: false, message: "Unauthorized" });
      canAccess = true;
    }

    if (!canAccess) {
      return res.status(403).json({ success: false, message: "No permission to access departments from this branch" });
    }

    const departments = await Department.findAll({
      where: { branch_id: branchId },
      include: [{ model: Branch, as: "branch", attributes: ["id", "name"] }],
      order: [["id", "DESC"]],
    });

    console.log('✅ Departments by branch accessed successfully');
    return res.json({ success: true, data: departments });
  } catch (err) {
    console.error("❌ Error fetching departments by branch:", err);
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

