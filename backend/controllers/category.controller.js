const Category = require('../models/category.model');
const ChartOfAccountType = require('../models/chart_of_account_type.model');
const ChartOfAccount = require('../models/chart_of_account.model');
const Employee = require('../models/employee.model');

// Helper: get company id from logged-in user
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

    const data = await Category.findAll({
      where: { created_by: companyId },
      include: [
        { model: ChartOfAccountType, as: 'accountType', attributes: ['id', 'name'] },
        { model: ChartOfAccount, as: 'chartAccount', attributes: ['id', 'name', 'code'] },
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

    const data = await Category.findOne({
      where: { id: req.params.id, created_by: companyId },
      include: [
        { model: ChartOfAccountType, as: 'accountType', attributes: ['id', 'name'] },
        { model: ChartOfAccount, as: 'chartAccount', attributes: ['id', 'name', 'code'] },
      ]
    });

    if (!data) return res.status(404).json({ success: false, message: 'Category not found' });

    res.json({ success: true, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// CREATE
exports.create = async (req, res) => {
  try {
    const { name, type, chart_account_id, color } = req.body;

    if (!name || !type || !chart_account_id) {
      return res.status(400).json({ success: false, message: 'name, type, and chart_account_id are required' });
    }

    const companyId = await getCompanyId(req);
    if (!companyId) return res.status(403).json({ success: false, message: 'Unable to resolve company' });

    const payload = {
      name,
      type,
      chart_account_id,
      color: color || '#fc544b',
      created_by: companyId,
      created_at: new Date(),
      updated_at: new Date()
    };

    const data = await Category.create(payload);
    res.status(201).json({ success: true, message: 'Category created', data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// UPDATE
exports.update = async (req, res) => {
  try {
    const { name, type, chart_account_id, color } = req.body;
    const companyId = await getCompanyId(req);
    if (!companyId) return res.status(403).json({ success: false, message: 'Unable to resolve company' });

    const data = await Category.findOne({ where: { id: req.params.id, created_by: companyId } });
    if (!data) return res.status(404).json({ success: false, message: 'Category not found' });

    const payload = {};
    if (name !== undefined) payload.name = name;
    if (type !== undefined) payload.type = type;
    if (chart_account_id !== undefined) payload.chart_account_id = chart_account_id;
    if (color !== undefined) payload.color = color;
    payload.updated_at = new Date();

    await data.update(payload);
    res.json({ success: true, message: 'Category updated', data });
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

    const data = await Category.findOne({ where: { id: req.params.id, created_by: companyId } });
    if (!data) return res.status(404).json({ success: false, message: 'Category not found' });

    await data.destroy();
    res.json({ success: true, message: 'Category deleted', data: { id: req.params.id } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};
