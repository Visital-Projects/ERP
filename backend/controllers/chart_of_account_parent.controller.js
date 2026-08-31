const ChartOfAccountParent = require('../models/chart_of_account_parent.model');
const ChartOfAccountType = require('../models/chart_of_account_type.model');
const ChartOfAccountSubType = require('../models/chart_of_account_sub_type.model');
const ChartOfAccount = require('../models/chart_of_account.model');
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

    const data = await ChartOfAccountParent.findAll({
      where: { created_by: companyId },
      include: [
        { model: ChartOfAccountType, as: 'accountType', attributes: ['id', 'name'] },
        { model: ChartOfAccountSubType, as: 'accountSubType', attributes: ['id', 'name'] },
        { model: ChartOfAccount, as: 'accountCode', attributes: ['id', 'code', 'name'] },
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

    const data = await ChartOfAccountParent.findOne({
      where: { id: req.params.id, created_by: companyId },
      include: [
        { model: ChartOfAccountType, as: 'accountType', attributes: ['id', 'name'] },
        { model: ChartOfAccountSubType, as: 'accountSubType', attributes: ['id', 'name'] },
        { model: ChartOfAccount, as: 'accountCode', attributes: ['id', 'code', 'name'] },
      ]
    });

    if (!data) return res.status(404).json({ success: false, message: 'Chart of account parent not found' });

    res.json({ success: true, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// CREATE
exports.create = async (req, res) => {
  try {
    const { name, sub_type, type, account } = req.body;

    if (!name || !sub_type || !type || !account) {
      return res.status(400).json({ success: false, message: 'name, sub_type, type, account are required' });
    }

    const companyId = await getCompanyId(req);
    if (!companyId) return res.status(403).json({ success: false, message: 'Unable to resolve company' });

    // validate account code exists
    const accountExists = await ChartOfAccount.findOne({ where: { code: account, created_by: companyId } });
    if (!accountExists) {
      return res.status(400).json({ success: false, message: 'Invalid account code' });
    }

    const payload = {
      name,
      sub_type,
      type,
      account,
      created_by: companyId,
      created_at: new Date(),
      updated_at: new Date()
    };

    const data = await ChartOfAccountParent.create(payload);
    res.status(201).json({ success: true, message: 'Chart of account parent created', data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// UPDATE
exports.update = async (req, res) => {
  try {
    const { name, sub_type, type, account } = req.body;
    const companyId = await getCompanyId(req);
    if (!companyId) return res.status(403).json({ success: false, message: 'Unable to resolve company' });

    const data = await ChartOfAccountParent.findOne({ where: { id: req.params.id, created_by: companyId } });
    if (!data) return res.status(404).json({ success: false, message: 'Chart of account parent not found' });

    if (account) {
      const accountExists = await ChartOfAccount.findOne({ where: { code: account, created_by: companyId } });
      if (!accountExists) return res.status(400).json({ success: false, message: 'Invalid account code' });
    }

    const payload = {};
    if (name !== undefined) payload.name = name;
    if (sub_type !== undefined) payload.sub_type = sub_type;
    if (type !== undefined) payload.type = type;
    if (account !== undefined) payload.account = account;
    payload.updated_at = new Date();

    await data.update(payload);
    res.json({ success: true, message: 'Chart of account parent updated', data });
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

    const data = await ChartOfAccountParent.findOne({ where: { id: req.params.id, created_by: companyId } });
    if (!data) return res.status(404).json({ success: false, message: 'Chart of account parent not found' });

    await data.destroy();
    res.json({ success: true, message: 'Chart of account parent deleted', data: { id: req.params.id } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};
