// controllers/role.controller.js

const Role = require('../models/role.model');
const Permission = require('../models/permission.model');

exports.index = async (req, res) => {
  try {
    const roles = await Role.findAll({ include: ['permissions'] });
    res.json(roles);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

exports.show = async (req, res) => {
  try {
    const role = await Role.findByPk(req.params.id, { include: ['permissions'] });
    if (!role) return res.status(404).json({ message: 'Role not found' });
    res.json(role);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// exports.store = async (req, res) => {
//   try {
//     const { name, guard_name, permissions } = req.body;

//     if (!name || !guard_name) {
//       return res.status(400).json({ message: 'name and guard_name are required' });
//     }

//     const role = await Role.create({ name, guard_name });

//     if (permissions && Array.isArray(permissions)) {
//       await role.setPermissions(permissions);
//     }

//     return res.status(201).json({ message: 'Role created successfully', role });
//   } catch (error) {
//     console.error('Create Role Error:', error);
//     return res.status(500).json({ message: 'Server error', error });
//   }
// };

exports.store = async (req, res) => {
  try {
    let { name, guard_name, permissions } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'name is required' });
    }

    // Default guard_name = 'web' if not passed
    if (!guard_name) guard_name = 'web';

    // 🔑 Multi-tenancy: get companyId (company user OR fallback to self id)
    const companyId = req.user?.creator_id || req.user?.id || 0;

    // Create role with audit fields
    const role = await Role.create({
      name,
      guard_name,
      created_by: companyId,
      created_at: new Date(),
      updated_at: new Date()
    });

    // Attach permissions if any
    if (permissions && Array.isArray(permissions)) {
      await role.setPermissions(permissions);
    }

    return res.status(201).json({
      success: true,
      message: 'Role created successfully',
      role
    });
  } catch (error) {
    console.error('❌ Create Role Error:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};



exports.update = async (req, res) => {
  try {
    const { name, permissions = [] } = req.body;
    const role = await Role.findByPk(req.params.id);
    if (!role) return res.status(404).json({ message: 'Role not found' });

    role.name = name || role.name;
    await role.save();
    await role.setPermissions(permissions);

    const result = await Role.findByPk(role.id, { include: ['permissions'] });
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

exports.destroy = async (req, res) => {
  try {
    const role = await Role.findByPk(req.params.id);
    if (!role) return res.status(404).json({ message: 'Role not found' });

    await role.destroy();
    res.json({ message: 'Role deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
