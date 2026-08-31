// // controllers/chart_of_account_type.controller.js
// const { Op } = require('sequelize');
// const ChartOfAccountType = require('../models/chart_of_account_type.model');

// // GET /api/chart-of-account-types
// exports.getAll = async (req, res) => {
//   try {
//     const types = await ChartOfAccountType.findAll({
//       order: [['id', 'ASC']],
//     });

//     return res.json({ success: true, data: types });
//   } catch (err) {
//     return res.status(500).json({ success: false, message: 'Server error', error: err.message });
//   }
// };

// // GET /api/chart-of-account-types/:id
// exports.getById = async (req, res) => {
//   try {
//     const type = await ChartOfAccountType.findByPk(req.params.id);

//     if (!type) return res.status(404).json({ success: false, message: 'Not found' });

//     return res.json({ success: true, data: type });
//   } catch (err) {
//     return res.status(500).json({ success: false, message: 'Server error', error: err.message });
//   }
// };

// // POST /api/chart-of-account-types
// exports.create = async (req, res) => {
//   try {
//     const { name } = req.body;
//     if (!name || String(name).trim() === '') {
//       return res.status(422).json({ success: false, message: 'Name is required' });
//     }

//     const created_by = req.user?.id || 0;
//     const now = new Date();

//     const type = await ChartOfAccountType.create({
//       name,
//       created_by,
//       created_at: now,
//       updated_at: now,
//     });

//     return res.status(201).json({ success: true, data: type });
//   } catch (err) {
//     return res.status(500).json({ success: false, message: 'Server error', error: err.message });
//   }
// };

// // PUT /api/chart-of-account-types/:id
// exports.update = async (req, res) => {
//   try {
//     const { name } = req.body;
//     if (!name || String(name).trim() === '') {
//       return res.status(422).json({ success: false, message: 'Name is required' });
//     }

//     const type = await ChartOfAccountType.findByPk(req.params.id);
//     if (!type) return res.status(404).json({ success: false, message: 'Not found' });

//     // optional: check duplicate
//     const dup = await ChartOfAccountType.findOne({
//       where: { name, id: { [Op.ne]: type.id } },
//     });
//     if (dup) return res.status(409).json({ success: false, message: 'Name already exists' });

//     await type.update({ name, updated_at: new Date() });

//     return res.json({ success: true, data: type });
//   } catch (err) {
//     return res.status(500).json({ success: false, message: 'Server error', error: err.message });
//   }
// };

// // DELETE /api/chart-of-account-types/:id
// exports.remove = async (req, res) => {
//   try {
//     const type = await ChartOfAccountType.findByPk(req.params.id);
//     if (!type) return res.status(404).json({ success: false, message: 'Not found' });

//     await type.destroy();
//     return res.json({ success: true, message: 'Deleted successfully' });
//   } catch (err) {
//     return res.status(500).json({ success: false, message: 'Server error', error: err.message });
//   }
// };





// controllers/chart_of_account_type.controller.js
const { Op } = require('sequelize');
const ChartOfAccountType = require('../models/chart_of_account_type.model');
const Employee = require('../models/employee.model');

// Helper: get company id from logged-in user
async function getCompanyId(req) {
  if (!req.user) return null;
  if (req.user.type?.toLowerCase() === 'company') return req.user.id;

  const emp = await Employee.findOne({ where: { user_id: req.user.id }, attributes: ['created_by'] });
  return emp?.created_by || null;
}

// =====================
// GET ALL
// =====================
exports.getAll = async (req, res) => {
  try {
    const companyId = await getCompanyId(req);
    if (!companyId) return res.status(403).json({ success: false, message: 'Unable to resolve company' });

    const types = await ChartOfAccountType.findAll({
      where: { created_by: companyId },
      order: [['id', 'ASC']],
    });

    return res.json({ success: true, data: types });
  } catch (err) {
    console.error('Get All ChartOfAccountTypes Error:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// =====================
// GET BY ID
// =====================
exports.getById = async (req, res) => {
  try {
    const companyId = await getCompanyId(req);
    if (!companyId) return res.status(403).json({ success: false, message: 'Unable to resolve company' });

    const type = await ChartOfAccountType.findOne({
      where: { id: req.params.id, created_by: companyId },
    });

    if (!type) return res.status(404).json({ success: false, message: 'Not found' });

    return res.json({ success: true, data: type });
  } catch (err) {
    console.error('Get ChartOfAccountType By ID Error:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// =====================
// CREATE
// =====================
exports.create = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || String(name).trim() === '') {
      return res.status(422).json({ success: false, message: 'Name is required' });
    }

    const companyId = await getCompanyId(req);
    if (!companyId) return res.status(403).json({ success: false, message: 'Unable to resolve company' });

    const now = new Date();

    const type = await ChartOfAccountType.create({
      name: name.trim(),
      created_by: companyId,
      created_at: now,
      updated_at: now,
    });

    return res.status(201).json({ success: true, data: type });
  } catch (err) {
    console.error('Create ChartOfAccountType Error:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// =====================
// UPDATE
// =====================
exports.update = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || String(name).trim() === '') {
      return res.status(422).json({ success: false, message: 'Name is required' });
    }

    const companyId = await getCompanyId(req);
    if (!companyId) return res.status(403).json({ success: false, message: 'Unable to resolve company' });

    const type = await ChartOfAccountType.findOne({
      where: { id: req.params.id, created_by: companyId },
    });
    if (!type) return res.status(404).json({ success: false, message: 'Not found' });

    // optional: check duplicate
    const dup = await ChartOfAccountType.findOne({
      where: { name, id: { [Op.ne]: type.id }, created_by: companyId },
    });
    if (dup) return res.status(409).json({ success: false, message: 'Name already exists' });

    await type.update({ name: name.trim(), updated_at: new Date() });

    return res.json({ success: true, data: type });
  } catch (err) {
    console.error('Update ChartOfAccountType Error:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// =====================
// DELETE
// =====================
exports.remove = async (req, res) => {
  try {
    const companyId = await getCompanyId(req);
    if (!companyId) return res.status(403).json({ success: false, message: 'Unable to resolve company' });

    const type = await ChartOfAccountType.findOne({
      where: { id: req.params.id, created_by: companyId },
    });
    if (!type) return res.status(404).json({ success: false, message: 'Not found' });

    await type.destroy();
    return res.json({ success: true, message: 'Deleted successfully' });
  } catch (err) {
    console.error('Delete ChartOfAccountType Error:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};
