// controllers/account.controller.js
const Account = require('../models/account.model');
const Employee = require('../models/employee.model');

// =====================
// Helper: format account response
// =====================
const formatAccountResponse = async (account) => {
  if (!account) return null;
  const json = account.toJSON();
  return {
    id: json.id,
    account_name: json.account_name,
    created_by: json.created_by,
    created_at: json.created_at,
    updated_at: json.updated_at
  };
};

// =====================
// GET ALL ACCOUNTS
// =====================
exports.getAllAccounts = async (req, res) => {
  try {
    if (req.user.type === 'company') {
      const accounts = await Account.findAll({
        where: { created_by: req.user.id },
        order: [['id', 'DESC']]
      });
      const responseData = await Promise.all(accounts.map(a => formatAccountResponse(a)));
      return res.json({ success: true, data: responseData });
    }

    if (req.user.type === 'Employee') {
      const emp = await Employee.findOne({ where: { user_id: req.user.id } });
      if (!emp) {
        return res.status(403).json({ success: false, message: 'Employee profile not found' });
      }
      const accounts = await Account.findAll({
        where: { created_by: emp.created_by },
        order: [['id', 'DESC']]
      });
      const responseData = await Promise.all(accounts.map(a => formatAccountResponse(a)));
      return res.json({ success: true, data: responseData });
    }

    // Other roles (HR, Manager, etc.)
    const emp = await Employee.findOne({ where: { user_id: req.user.id } });
    let whereClause = {};
    if (emp) whereClause.created_by = emp.created_by;

    const accounts = await Account.findAll({ where: whereClause, order: [['id', 'DESC']] });
    const responseData = await Promise.all(accounts.map(a => formatAccountResponse(a)));
    return res.json({ success: true, data: responseData });
  } catch (error) {
    console.error('Get All Accounts Error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// =====================
// GET ACCOUNT BY ID
// =====================
exports.getAccountById = async (req, res) => {
  try {
    let whereClause = { id: req.params.id };

    if (req.user.type === 'company') {
      whereClause.created_by = req.user.id;
    } else if (req.user.type === 'Employee') {
      const emp = await Employee.findOne({ where: { user_id: req.user.id } });
      if (!emp) return res.status(403).json({ success: false, message: 'Employee profile not found' });
      whereClause.created_by = emp.created_by;
    } else {
      const emp = await Employee.findOne({ where: { user_id: req.user.id } });
      if (emp) whereClause.created_by = emp.created_by;
    }

    const account = await Account.findOne({ where: whereClause });
    if (!account) return res.status(404).json({ success: false, message: 'Account not found' });

    const responseData = await formatAccountResponse(account);
    res.json({ success: true, data: responseData });
  } catch (error) {
    console.error('Get Account By ID Error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// =====================
// CREATE ACCOUNT
// =====================
exports.createAccount = async (req, res) => {
  try {
    const { account_name } = req.body;

    if (!account_name) {
      return res.status(400).json({ success: false, message: 'Account name is required' });
    }

    let companyId;
    if (req.user.type === 'company') {
      companyId = req.user.id;
    } else {
      const emp = await Employee.findOne({ where: { user_id: req.user.id } });
      if (!emp) return res.status(403).json({ success: false, message: 'Employee profile not found' });
      companyId = emp.created_by;
    }

    const account = await Account.create({
      account_name,
      created_by: companyId,
      created_at: new Date(),
      updated_at: new Date()
    });

    return res.status(201).json({ success: true, message: 'Account created', data: await formatAccountResponse(account) });
  } catch (error) {
    console.error('Create Account Error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// =====================
// UPDATE ACCOUNT
// =====================
exports.updateAccount = async (req, res) => {
  try {
    const accountId = req.params.id;
    const { account_name } = req.body;

    let whereClause = { id: accountId };

    if (req.user.type === 'company') {
      whereClause.created_by = req.user.id;
    } else {
      const emp = await Employee.findOne({ where: { user_id: req.user.id } });
      if (!emp) return res.status(403).json({ success: false, message: 'Employee profile not found' });
      whereClause.created_by = emp.created_by;
    }

    const account = await Account.findOne({ where: whereClause });
    if (!account) return res.status(404).json({ success: false, message: 'Account not found' });

    await account.update({ account_name, updated_at: new Date() });
    return res.json({ success: true, message: 'Account updated', data: await formatAccountResponse(account) });
  } catch (error) {
    console.error("Update Account Error:", error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// =====================
// DELETE ACCOUNT
// =====================
exports.deleteAccount = async (req, res) => {
  try {
    const { id } = req.params;

    let whereClause = { id };

    if (req.user.type === 'company') {
      whereClause.created_by = req.user.id;
    } else {
      const emp = await Employee.findOne({ where: { user_id: req.user.id } });
      if (!emp) return res.status(403).json({ success: false, message: 'Employee profile not found' });
      whereClause.created_by = emp.created_by;
    }

    const account = await Account.findOne({ where: whereClause });
    if (!account) return res.status(404).json({ success: false, message: 'Account not found' });

    await account.destroy();
    return res.json({ success: true, message: 'Account deleted', data: { id } });
  } catch (error) {
    console.error('Delete Account Error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
