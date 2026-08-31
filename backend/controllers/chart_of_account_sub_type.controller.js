// controllers/chart_of_account_sub_type.controller.js
const ChartOfAccountSubType = require('../models/chart_of_account_sub_type.model');
const ChartOfAccountType = require('../models/chart_of_account_type.model');
const Employee = require('../models/employee.model');

// =====================
// Helper: resolve company id from request
// =====================
async function getCompanyId(req) {
  if (req.user?.type?.toLowerCase() === 'company') {
    return req.user.id; // company users → their own id
  }

  // employee/HR/manager etc. → find via employee record
  const emp = await Employee.findOne({
    where: { user_id: req.user.id },
    attributes: ['created_by']
  });

  return emp?.created_by || null;
}

// =====================
// GET ALL
// =====================
exports.getAll = async (req, res) => {
  try {
    const companyId = await getCompanyId(req);
    if (!companyId) {
      return res.status(403).json({ success: false, message: 'Unable to resolve company' });
    }

    const subTypes = await ChartOfAccountSubType.findAll({
      where: { created_by: companyId },
      attributes: ['id', 'name', 'type', 'created_by', 'created_at', 'updated_at'],
      include: [
        {
          model: ChartOfAccountType,
          as: 'accountType',
          attributes: ['id', 'name'],
        }
      ],
      order: [['id', 'ASC']],
    });

    return res.json({ success: true, data: subTypes });
  } catch (err) {
    console.error('Get All SubTypes Error:', err);
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

    const subType = await ChartOfAccountSubType.findOne({
      where: { id: req.params.id, created_by: companyId },
      attributes: ['id', 'name', 'type', 'created_by', 'created_at', 'updated_at'],
      include: [
        {
          model: ChartOfAccountType,
          as: 'accountType',
          attributes: ['id', 'name'],
        }
      ]
    });

    if (!subType) return res.status(404).json({ success: false, message: 'Not found' });

    return res.json({ success: true, data: subType });
  } catch (err) {
    console.error('Get SubType By ID Error:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// =====================
// CREATE
// =====================
exports.create = async (req, res) => {
  try {
    const { name, type } = req.body;
    if (!name || !String(name).trim()) {
      return res.status(400).json({ success: false, message: 'name is required' });
    }
    if (!type) {
      return res.status(400).json({ success: false, message: 'type is required' });
    }

    const companyId = await getCompanyId(req);
    if (!companyId) {
      return res.status(403).json({ success: false, message: 'Unable to resolve company for user' });
    }

    const payload = {
      name: String(name).trim(),
      type,
      created_by: companyId,
      created_at: new Date(),
      updated_at: new Date()
    };

    const data = await ChartOfAccountSubType.create(payload);
    return res.status(201).json({
      success: true,
      message: 'Sub-type created',
      data
    });
  } catch (err) {
    console.error('Create SubType Error:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// =====================
// UPDATE
// =====================
exports.update = async (req, res) => {
  try {
    const subTypeId = req.params.id;
    const { name, type } = req.body;

    const companyId = await getCompanyId(req);
    if (!companyId) return res.status(403).json({ success: false, message: 'Unable to resolve company' });

    const data = await ChartOfAccountSubType.findOne({
      where: { id: subTypeId, created_by: companyId }
    });
    if (!data) return res.status(404).json({ success: false, message: 'Sub-type not found' });

    const payload = {};
    if (name !== undefined) {
      if (!String(name).trim()) return res.status(400).json({ success: false, message: 'name cannot be empty' });
      payload.name = String(name).trim();
    }
    if (type !== undefined) {
      payload.type = type;
    }
    payload.updated_at = new Date();

    await data.update(payload);

    return res.json({ success: true, message: 'Sub-type updated', data });
  } catch (err) {
    console.error('Update SubType Error:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// =====================
// DELETE
// =====================
exports.remove = async (req, res) => {
  try {
    const subTypeId = req.params.id;
    const companyId = await getCompanyId(req);
    if (!companyId) return res.status(403).json({ success: false, message: 'Unable to resolve company' });

    const data = await ChartOfAccountSubType.findOne({
      where: { id: subTypeId, created_by: companyId }
    });
    if (!data) return res.status(404).json({ success: false, message: 'Sub-type not found' });

    await data.destroy();
    return res.json({ success: true, message: 'Sub-type deleted', data: { id: subTypeId } });
  } catch (err) {
    console.error('Delete SubType Error:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};
