// const ChartOfAccount = require('../models/chart_of_account.model');
// const ChartOfAccountType = require('../models/chart_of_account_type.model');
// const ChartOfAccountSubType = require('../models/chart_of_account_sub_type.model');
// const Employee = require('../models/employee.model');

// // Helper: get company id from logged-in user
// async function getCompanyId(req) {
//   if (!req.user) return null;
//   if (req.user.type?.toLowerCase() === 'company') return req.user.id;

//   const emp = await Employee.findOne({ where: { user_id: req.user.id }, attributes: ['created_by'] });
//   return emp?.created_by || null;
// }

// // GET ALL
// exports.getAll = async (req, res) => {
//   try {
//     const companyId = await getCompanyId(req);
//     if (!companyId) return res.status(403).json({ success: false, message: 'Unable to resolve company' });

//     const data = await ChartOfAccount.findAll({
//       where: { created_by: companyId },
//       include: [
//         { model: ChartOfAccountType, as: 'accountType', attributes: ['id', 'name'] },
//         { model: ChartOfAccountSubType, as: 'accountSubType', attributes: ['id', 'name'] },
//       ],
//       order: [['id', 'ASC']],
//     });

//     res.json({ success: true, data });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, message: 'Server error', error: err.message });
//   }
// };

// // GET BY ID
// exports.getById = async (req, res) => {
//   try {
//     const companyId = await getCompanyId(req);
//     if (!companyId) return res.status(403).json({ success: false, message: 'Unable to resolve company' });

//     const data = await ChartOfAccount.findOne({
//       where: { id: req.params.id, created_by: companyId },
//       include: [
//         { model: ChartOfAccountType, as: 'accountType', attributes: ['id', 'name'] },
//         { model: ChartOfAccountSubType, as: 'accountSubType', attributes: ['id', 'name'] },
//       ]
//     });

//     if (!data) return res.status(404).json({ success: false, message: 'Chart of account not found' });

//     res.json({ success: true, data });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, message: 'Server error', error: err.message });
//   }
// };

// // CREATE
// exports.create = async (req, res) => {
//   try {
//     const { name, code, type, sub_type, parent, is_enabled, description } = req.body;

//     if (!name || !code || !type || !sub_type) {
//       return res.status(400).json({ success: false, message: 'name, code, type, sub_type are required' });
//     }

//     const companyId = await getCompanyId(req);
//     if (!companyId) return res.status(403).json({ success: false, message: 'Unable to resolve company' });

//     const payload = {
//       name,
//       code,
//       type,
//       sub_type,
//       parent: parent || 0,
//       is_enabled: is_enabled !== undefined ? is_enabled : true,
//       description: description || null,
//       created_by: companyId,
//       created_at: new Date(),
//       updated_at: new Date()
//     };

//     const data = await ChartOfAccount.create(payload);
//     res.status(201).json({ success: true, message: 'Chart of account created', data });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, message: 'Server error', error: err.message });
//   }
// };

// // UPDATE
// exports.update = async (req, res) => {
//   try {
//     const { name, code, type, sub_type, parent, is_enabled, description } = req.body;
//     const companyId = await getCompanyId(req);
//     if (!companyId) return res.status(403).json({ success: false, message: 'Unable to resolve company' });

//     const data = await ChartOfAccount.findOne({ where: { id: req.params.id, created_by: companyId } });
//     if (!data) return res.status(404).json({ success: false, message: 'Chart of account not found' });

//     const payload = {};
//     if (name !== undefined) payload.name = name;
//     if (code !== undefined) payload.code = code;
//     if (type !== undefined) payload.type = type;
//     if (sub_type !== undefined) payload.sub_type = sub_type;
//     if (parent !== undefined) payload.parent = parent;
//     if (is_enabled !== undefined) payload.is_enabled = is_enabled;
//     if (description !== undefined) payload.description = description;
//     payload.updated_at = new Date();

//     await data.update(payload);
//     res.json({ success: true, message: 'Chart of account updated', data });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, message: 'Server error', error: err.message });
//   }
// };

// // DELETE
// exports.remove = async (req, res) => {
//   try {
//     const companyId = await getCompanyId(req);
//     if (!companyId) return res.status(403).json({ success: false, message: 'Unable to resolve company' });

//     const data = await ChartOfAccount.findOne({ where: { id: req.params.id, created_by: companyId } });
//     if (!data) return res.status(404).json({ success: false, message: 'Chart of account not found' });

//     await data.destroy();
//     res.json({ success: true, message: 'Chart of account deleted', data: { id: req.params.id } });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, message: 'Server error', error: err.message });
//   }
// };





const ChartOfAccount = require('../models/chart_of_account.model');
const ChartOfAccountType = require('../models/chart_of_account_type.model');
const ChartOfAccountSubType = require('../models/chart_of_account_sub_type.model');
const ChartOfAccountParent = require('../models/chart_of_account_parent.model');
const Employee = require('../models/employee.model');

// Helper: get company id
async function getCompanyId(req) {
  if (!req.user) return null;
  if (req.user.type?.toLowerCase() === 'company') return req.user.id;

  const emp = await Employee.findOne({ where: { user_id: req.user.id }, attributes: ['created_by'] });
  return emp?.created_by || null;
}

// GET ALL
exports.getAll = async (req, res) => {
  try {
    const companyId = await getCompanyId(req);
    if (!companyId) return res.status(403).json({ success: false, message: 'Unable to resolve company' });

    const data = await ChartOfAccount.findAll({
      where: { created_by: companyId },
      include: [
        { model: ChartOfAccountType, as: 'accountType', attributes: ['id', 'name'] },
        { model: ChartOfAccountSubType, as: 'accountSubType', attributes: ['id', 'name'] },
        { model: ChartOfAccountParent, as: 'parentAccount', attributes: ['id', 'name'] },
      ],
      order: [['id', 'ASC']],
    });

    res.json({ success: true, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// GET BY ID
exports.getById = async (req, res) => {
  try {
    const companyId = await getCompanyId(req);
    if (!companyId) return res.status(403).json({ success: false, message: 'Unable to resolve company' });

    const data = await ChartOfAccount.findOne({
      where: { id: req.params.id, created_by: companyId },
      include: [
        { model: ChartOfAccountType, as: 'accountType', attributes: ['id', 'name'] },
        { model: ChartOfAccountSubType, as: 'accountSubType', attributes: ['id', 'name'] },
        { model: ChartOfAccountParent, as: 'parentAccount', attributes: ['id', 'name'] },
      ]
    });

    if (!data) return res.status(404).json({ success: false, message: 'Chart of account not found' });

    res.json({ success: true, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// CREATE
exports.create = async (req, res) => {
  try {
    const { name, code, type, sub_type, parent, is_enabled, description } = req.body;

    if (!name || !code || !type || !sub_type) {
      return res.status(400).json({ success: false, message: 'name, code, type, sub_type are required' });
    }

    const companyId = await getCompanyId(req);
    if (!companyId) return res.status(403).json({ success: false, message: 'Unable to resolve company' });

    // validate parent if provided
    if (parent && parent !== 0) {
      const parentExists = await ChartOfAccountParent.findOne({ where: { id: parent, created_by: companyId } });
      if (!parentExists) return res.status(400).json({ success: false, message: 'Invalid parent account' });
    }

    const payload = {
      name,
      code,
      type,
      sub_type,
      parent: parent || 0,
      is_enabled: is_enabled !== undefined ? is_enabled : true,
      description: description || null,
      created_by: companyId,
      created_at: new Date(),
      updated_at: new Date()
    };

    const data = await ChartOfAccount.create(payload);
    res.status(201).json({ success: true, message: 'Chart of account created', data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// UPDATE
exports.update = async (req, res) => {
  try {
    const { name, code, type, sub_type, parent, is_enabled, description } = req.body;
    const companyId = await getCompanyId(req);
    if (!companyId) return res.status(403).json({ success: false, message: 'Unable to resolve company' });

    const data = await ChartOfAccount.findOne({ where: { id: req.params.id, created_by: companyId } });
    if (!data) return res.status(404).json({ success: false, message: 'Chart of account not found' });

    // validate parent if updating
    if (parent && parent !== 0) {
      const parentExists = await ChartOfAccountParent.findOne({ where: { id: parent, created_by: companyId } });
      if (!parentExists) return res.status(400).json({ success: false, message: 'Invalid parent account' });
    }

    const payload = {};
    if (name !== undefined) payload.name = name;
    if (code !== undefined) payload.code = code;
    if (type !== undefined) payload.type = type;
    if (sub_type !== undefined) payload.sub_type = sub_type;
    if (parent !== undefined) payload.parent = parent;
    if (is_enabled !== undefined) payload.is_enabled = is_enabled;
    if (description !== undefined) payload.description = description;
    payload.updated_at = new Date();

    await data.update(payload);
    res.json({ success: true, message: 'Chart of account updated', data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// DELETE
exports.remove = async (req, res) => {
  try {
    const companyId = await getCompanyId(req);
    if (!companyId) return res.status(403).json({ success: false, message: 'Unable to resolve company' });

    const data = await ChartOfAccount.findOne({ where: { id: req.params.id, created_by: companyId } });
    if (!data) return res.status(404).json({ success: false, message: 'Chart of account not found' });

    await data.destroy();
    res.json({ success: true, message: 'Chart of account deleted', data: { id: req.params.id } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};
