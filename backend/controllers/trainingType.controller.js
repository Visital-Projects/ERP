



// const TrainingType = require('../models/trainingType.model');

// exports.getAll = async (req, res) => {
// try {
// const types = await TrainingType.findAll();
// res.json(types);
// } catch (err) {
// res.status(500).json({ message: 'Server error', error: err.message });
// }
// };

// exports.create = async (req, res) => {
// try {
// const { name } = req.body;
// const created_by = req.user?.id || null;
// const type = await TrainingType.create({ name, created_by });
// res.status(201).json(type);
// } catch (err) {
// res.status(500).json({ message: 'Creation failed', error: err.message });
// }
// };

// exports.update = async (req, res) => {
// try {
// const type = await TrainingType.findByPk(req.params.id);
// if (!type) return res.status(404).json({ message: 'Not found' });
// await type.update(req.body);
// res.json(type);
// } catch (err) {
// res.status(500).json({ message: 'Update failed', error: err.message });
// }
// };

// exports.delete = async (req, res) => {
// try {
// const type = await TrainingType.findByPk(req.params.id);
// if (!type) return res.status(404).json({ message: 'Not found' });
// await type.destroy();
// res.json({ message: 'Deleted successfully' });
// } catch (err) {
// res.status(500).json({ message: 'Delete failed', error: err.message });
// }
// };


// const TrainingType = require('../models/trainingType.model');

// // 🔹 Helper: Multi-tenancy company isolation
// function getCompanyId(req) {
//   return req.user?.creator_id || req.user?.id;
// }

// // Get all training types
// exports.getAll = async (req, res) => {
//   try {
//     const companyId = getCompanyId(req);
//     const types = await TrainingType.findAll({ where: { created_by: companyId } });
//     res.json({ success: true, data: types });
//   } catch (err) {
//     res.status(500).json({ success: false, message: 'Server error', error: err.message });
//   }
// };

// // Create training type
// exports.create = async (req, res) => {
//   try {
//     const { name } = req.body;
//     if (!name) return res.status(400).json({ success: false, message: 'Name is required' });

//     const companyId = getCompanyId(req);
//     const type = await TrainingType.create({ name, created_by: companyId });

//     res.status(201).json({ success: true, data: type });
//   } catch (err) {
//     res.status(500).json({ success: false, message: 'Creation failed', error: err.message });
//   }
// };


// exports.update = async (req, res) => {
//   try {
//     const companyId = getCompanyId(req);

//     // find by ID + created_by for multi-tenancy
//     const type = await TrainingType.findOne({
//       where: { id: req.params.id, created_by: companyId },
//     });

//     if (!type) {
//       return res.status(404).json({ success: false, message: 'Not found' });
//     }

//     const { name } = req.body || {};

//     // validation
//     if (!name || name.trim() === '') {
//       return res.status(400).json({ success: false, message: 'Name is required' });
//     }

//     type.name = name.trim();
//     await type.save();

//     res.json({ success: true, data: type });
//   } catch (err) {
//     console.error('Update TrainingType error:', err);
//     res.status(500).json({ success: false, message: 'Update failed', error: err.message });
//   }
// };





// // Delete training type
// exports.delete = async (req, res) => {
//   try {
//     const companyId = getCompanyId(req);
//     const type = await TrainingType.findOne({ where: { id: req.params.id, created_by: companyId } });

//     if (!type) return res.status(404).json({ success: false, message: 'Not found' });

//     await type.destroy();
//     res.json({ success: true, message: 'Deleted successfully' });
//   } catch (err) {
//     res.status(500).json({ success: false, message: 'Delete failed', error: err.message });
//   }
// };



// const TrainingType = require('../models/trainingType.model');
// const Employee = require('../models/employee.model'); // ensure Employee model exists

// // 🔹 Helper: Multi-tenancy company isolation
// async function getCompanyId(req) {
//   if (req.user?.creator_id) return req.user.creator_id;

//   if (req.user?.type === 'Employee') {
//     const emp = await Employee.findOne({
//       where: { user_id: req.user.id },
//       attributes: ['created_by']
//     });
//     return emp?.created_by;
//   }

//   return req.user?.id; // fallback for company/admin
// }

// function isCompanyUser(req) {
//   const t = (req.user?.type || '').toLowerCase();
//   return t === 'company' || t === 'admin';
// }



// exports.getAll = async (req, res) => {
//   try {
//     const companyId = await getCompanyId(req);

//     // ✅ Only company-bound filter, no user_id
//     const where = { created_by: companyId };

//     const types = await TrainingType.findAll({
//       where,
//       order: [['id', 'DESC']],
//     });

//     res.json({ success: true, data: types });
//   } catch (err) {
//     console.error('❌ Get Training Types Error:', err);
//     res.status(500).json({
//       success: false,
//       message: 'Server error',
//       error: err.message,
//     });
//   }
// };


// exports.getById = async (req, res) => {
//   try {
//     const companyId = await getCompanyId(req);

//     // ✅ Restrict by company only, not user_id
//     const where = { id: req.params.id, created_by: companyId };

//     const type = await TrainingType.findOne({ where });
//     if (!type) {
//       return res.status(404).json({ success: false, message: 'Not found' });
//     }

//     res.json({ success: true, data: type });
//   } catch (err) {
//     console.error('❌ Get Training Type Error:', err);
//     res.status(500).json({ success: false, message: 'Server error', error: err.message });
//   }
// };


// // ===============================
// // Create training type
// // ===============================
// exports.create = async (req, res) => {
//   try {
//     const { name } = req.body;
//     if (!name) return res.status(400).json({ success: false, message: 'Name is required' });

//     const companyId = await getCompanyId(req);

//     const type = await TrainingType.create({
//       name,
//       created_by: companyId,
//       user_id: req.user.id // store which employee created it
//     });

//     res.status(201).json({ success: true, data: type });
//   } catch (err) {
//     console.error('❌ Create Training Type Error:', err);
//     res.status(500).json({ success: false, message: 'Creation failed', error: err.message });
//   }
// };


// exports.update = async (req, res) => {
//   try {
//     const companyId = await getCompanyId(req);

//     // ✅ Only filter by company + id
//     const where = { id: req.params.id, created_by: companyId };

//     const type = await TrainingType.findOne({ where });
//     if (!type) {
//       return res.status(404).json({ success: false, message: 'Not found' });
//     }

//     const { name } = req.body || {};
//     if (!name?.trim()) {
//       return res.status(400).json({ success: false, message: 'Name is required' });
//     }

//     type.name = name.trim();
//     await type.save();

//     res.json({ success: true, data: type });
//   } catch (err) {
//     console.error('❌ Update Training Type Error:', err);
//     res.status(500).json({
//       success: false,
//       message: 'Update failed',
//       error: err.message,
//     });
//   }
// };




// exports.delete = async (req, res) => {
//   try {
//     const companyId = await getCompanyId(req);

//     // ✅ Restrict only by company + id
//     const where = { id: req.params.id, created_by: companyId };

//     const type = await TrainingType.findOne({ where });
//     if (!type) {
//       return res.status(404).json({ success: false, message: 'Not found' });
//     }

//     await type.destroy();
//     res.json({ success: true, message: 'Deleted successfully' });
//   } catch (err) {
//     console.error('❌ Delete Training Type Error:', err);
//     res.status(500).json({
//       success: false,
//       message: 'Delete failed',
//       error: err.message,
//     });
//   }
// };





const TrainingType = require('../models/trainingType.model');
const Employee = require('../models/employee.model');

// ============================
// 🔹 Helper: resolve company id
// ============================
async function getCompanyId(req) {
  if (!req.user) return null;

  const type = (req.user.type || '').toLowerCase();

  // Company/Admin/Super Admin → own id
  if (['company', 'admin', 'super admin'].includes(type)) return req.user.id;

  // Employee → resolve via employees table
  try {
    const emp = await Employee.findOne({
      where: { user_id: req.user.id },
      attributes: ['created_by'],
      raw: true,
    });
    if (emp?.created_by) return Number(emp.created_by);
  } catch (err) {
    console.error('getCompanyId Employee lookup failed:', err.message);
  }

  // Fallback
  return req.user.creator_id || req.user.id;
}

// ============================
// 🔹 Helper: is super admin
// ============================
function isSuper(req) {
  return (req.user?.roles || []).some(r => r.name?.toLowerCase() === 'super admin');
}

// ============================
// 🔹 Get All Training Types
// ============================
exports.getAll = async (req, res) => {
  try {
    let where = {};
    if (!isSuper(req)) {
      const companyId = await getCompanyId(req);
      if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });
      where.created_by = companyId;
    }

    const types = await TrainingType.findAll({
      where,
      order: [['id', 'DESC']],
    });

    res.json({ success: true, data: types });
  } catch (err) {
    console.error('❌ Get Training Types Error:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// ============================
// 🔹 Get Training Type by ID
// ============================
exports.getById = async (req, res) => {
  try {
    const where = { id: req.params.id };
    if (!isSuper(req)) {
      const companyId = await getCompanyId(req);
      if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });
      where.created_by = companyId;
    }

    const type = await TrainingType.findOne({ where });
    if (!type) return res.status(404).json({ success: false, message: 'Training type not found' });

    res.json({ success: true, data: type });
  } catch (err) {
    console.error('❌ Get Training Type Error:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// ============================
// 🔹 Create Training Type
// ============================
exports.create = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name?.trim()) return res.status(400).json({ success: false, message: 'Name is required' });

    const companyId = await getCompanyId(req);
    if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

    const type = await TrainingType.create({
      name: name.trim(),
      created_by: companyId,
      user_id: req.user.id, // store which employee created it
      created_at: new Date(),
      updated_at: new Date(),
    });

    res.status(201).json({ success: true, data: type });
  } catch (err) {
    console.error('❌ Create Training Type Error:', err);
    res.status(500).json({ success: false, message: 'Creation failed', error: err.message });
  }
};

// ============================
// 🔹 Update Training Type
// ============================
exports.update = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name?.trim()) return res.status(400).json({ success: false, message: 'Name is required' });

    const companyId = await getCompanyId(req);
    if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

    const where = { id: req.params.id, created_by: companyId };
    const type = await TrainingType.findOne({ where });
    if (!type) return res.status(404).json({ success: false, message: 'Training type not found' });

    type.name = name.trim();
    type.updated_at = new Date();
    await type.save();

    res.json({ success: true, data: type });
  } catch (err) {
    console.error('❌ Update Training Type Error:', err);
    res.status(500).json({ success: false, message: 'Update failed', error: err.message });
  }
};

// ============================
// 🔹 Delete Training Type
// ============================
exports.delete = async (req, res) => {
  try {
    const companyId = await getCompanyId(req);
    if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

    const where = { id: req.params.id, created_by: companyId };
    const type = await TrainingType.findOne({ where });
    if (!type) return res.status(404).json({ success: false, message: 'Training type not found' });

    await type.destroy();
    res.json({ success: true, message: 'Deleted successfully' });
  } catch (err) {
    console.error('❌ Delete Training Type Error:', err);
    res.status(500).json({ success: false, message: 'Delete failed', error: err.message });
  }
};
