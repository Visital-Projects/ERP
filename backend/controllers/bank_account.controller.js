// controllers/bank_account.controller.js
const BankAccount = require('../models/bank_account.model');
const BankTransfer = require('../models/bank_transfer.model');
const ChartOfAccount = require('../models/chart_of_account.model');
const Employee = require('../models/employee.model');

// Helper to get company id
async function getCompanyId(req) {
  if (!req.user) return null;
  if (req.user.type?.toLowerCase() === 'company') return req.user.id;

  const emp = await Employee.findOne({ where: { user_id: req.user.id }, attributes: ['created_by'] });
  return emp?.created_by || null;
}


// exports.getAll = async (req, res) => {
//   try {
//     const companyId = await getCompanyId(req);
//     if (!companyId) return res.status(403).json({ success: false, message: 'Unable to resolve company' });

//     const data = await BankAccount.findAll({
//       where: { created_by: companyId },
//       include: [{ model: ChartOfAccount, as: 'chartAccount', attributes: ['id', 'name', 'code'] }],
//       order: [['id', 'ASC']],
//     });

//     res.json({ success: true, data });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, message: 'Server error', error: err.message });
//   }
// };



exports.getAll = async (req, res) => {
  try {
    const companyId = await getCompanyId(req);
    if (!companyId) return res.status(403).json({ success: false, message: 'Unable to resolve company' });

    const accounts = await BankAccount.findAll({
      where: { created_by: companyId },
      include: [{ model: ChartOfAccount, as: 'chartAccount', attributes: ['id', 'name', 'code'] }],
      order: [['id', 'ASC']],
    });

    // Calculate current balance after transfers
    const accountsWithBalance = await Promise.all(accounts.map(async (acc) => {
      // Sum of all outgoing transfers
      const outgoing = await BankTransfer.sum('amount', { where: { from_account: acc.id } }) || 0;
      // Sum of all incoming transfers
      const incoming = await BankTransfer.sum('amount', { where: { to_account: acc.id } }) || 0;

      return {
        ...acc.toJSON(),
        current_balance: parseFloat(acc.opening_balance) - parseFloat(outgoing) + parseFloat(incoming)
      };
    }));

    res.json({ success: true, data: accountsWithBalance });
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

    const data = await BankAccount.findOne({
      where: { id: req.params.id, created_by: companyId },
      include: [{ model: ChartOfAccount, as: 'chartAccount', attributes: ['id', 'name', 'code'] }],
    });

    if (!data) return res.status(404).json({ success: false, message: 'Bank account not found' });
    res.json({ success: true, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// CREATE
exports.create = async (req, res) => {
  try {
    const { holder_name, bank_name, account_number, chart_account_id, opening_balance, contact_number, bank_address } = req.body;

    if (!holder_name || !bank_name || !account_number || !chart_account_id) {
      return res.status(400).json({ success: false, message: 'holder_name, bank_name, account_number, chart_account_id are required' });
    }

    const companyId = await getCompanyId(req);
    if (!companyId) return res.status(403).json({ success: false, message: 'Unable to resolve company' });

    // Validate chart account exists
    const chartAccount = await ChartOfAccount.findOne({ where: { id: chart_account_id, created_by: companyId } });
    if (!chartAccount) return res.status(400).json({ success: false, message: 'Invalid chart account' });

    const payload = {
      holder_name,
      bank_name,
      account_number,
      chart_account_id,
      opening_balance: opening_balance || 0,
      contact_number: contact_number || null,
      bank_address: bank_address || null,
      payment_name: 'bank transfer',
      created_by: companyId,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const data = await BankAccount.create(payload);
    res.status(201).json({ success: true, message: 'Bank account created', data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// UPDATE
exports.update = async (req, res) => {
  try {
    const { holder_name, bank_name, account_number, chart_account_id, opening_balance, contact_number, bank_address } = req.body;
    const companyId = await getCompanyId(req);
    if (!companyId) return res.status(403).json({ success: false, message: 'Unable to resolve company' });

    const data = await BankAccount.findOne({ where: { id: req.params.id, created_by: companyId } });
    if (!data) return res.status(404).json({ success: false, message: 'Bank account not found' });

    if (chart_account_id) {
      const chartAccount = await ChartOfAccount.findOne({ where: { id: chart_account_id, created_by: companyId } });
      if (!chartAccount) return res.status(400).json({ success: false, message: 'Invalid chart account' });
    }

    const payload = {};
    if (holder_name !== undefined) payload.holder_name = holder_name;
    if (bank_name !== undefined) payload.bank_name = bank_name;
    if (account_number !== undefined) payload.account_number = account_number;
    if (chart_account_id !== undefined) payload.chart_account_id = chart_account_id;
    if (opening_balance !== undefined) payload.opening_balance = opening_balance;
    if (contact_number !== undefined) payload.contact_number = contact_number;
    if (bank_address !== undefined) payload.bank_address = bank_address;
    payload.updated_at = new Date();

    await data.update(payload);
    res.json({ success: true, message: 'Bank account updated', data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// DELETE (soft delete)
exports.remove = async (req, res) => {
  try {
    const companyId = await getCompanyId(req);
    if (!companyId) {
      return res.status(403).json({ success: false, message: 'Unable to resolve company' });
    }

    const data = await BankAccount.findOne({ where: { id: req.params.id, created_by: companyId } });
    if (!data) {
      return res.status(404).json({ success: false, message: 'Bank account not found' });
    }

    await data.destroy(); // will set deleted_at, not remove
    res.json({ success: true, message: 'Bank account deleted (soft)', data: { id: req.params.id } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

