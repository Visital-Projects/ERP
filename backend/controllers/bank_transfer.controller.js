// const BankTransfer = require('../models/bank_transfer.model');

// const BankTransferController = {
//   async getAll(req, res) {
//     try {
//       const transfers = await BankTransfer.findAll({ order: [['id', 'DESC']] });
//       res.json(transfers);
//     } catch (err) {
//       res.status(500).json({ message: 'Server error', error: err.message });
//     }
//   },

//   async getById(req, res) {
//     try {
//       const transfer = await BankTransfer.findByPk(req.params.id);
//       if (!transfer) {
//         return res.status(404).json({ message: 'Bank transfer not found' });
//       }
//       res.json(transfer);
//     } catch (err) {
//       res.status(500).json({ message: 'Server error', error: err.message });
//     }
//   },

//   async create(req, res) {
//     try {
//       const {
//         from_account,
//         to_account,
//         amount,
//         date,
//         payment_method,
//         reference,
//         description
//       } = req.body;

//       const newTransfer = await BankTransfer.create({
//         from_account,
//         to_account,
//         amount,
//         date,
//         payment_method,
//         reference,
//         description,
//         created_by: req.user.id || 0
//       });

//       res.status(201).json({ message: 'Bank transfer created', data: newTransfer });
//     } catch (err) {
//       res.status(500).json({ message: 'Server error', error: err.message });
//     }
//   },

//   async update(req, res) {
//     try {
//       const transfer = await BankTransfer.findByPk(req.params.id);
//       if (!transfer) return res.status(404).json({ message: 'Bank transfer not found' });

//       const {
//         from_account,
//         to_account,
//         amount,
//         date,
//         payment_method,
//         reference,
//         description
//       } = req.body;

//       await transfer.update({
//         from_account,
//         to_account,
//         amount,
//         date,
//         payment_method,
//         reference,
//         description
//       });

//       res.json({ message: 'Bank transfer updated', data: transfer });
//     } catch (err) {
//       res.status(500).json({ message: 'Server error', error: err.message });
//     }
//   },

//   async delete(req, res) {
//     try {
//       const transfer = await BankTransfer.findByPk(req.params.id);
//       if (!transfer) return res.status(404).json({ message: 'Bank transfer not found' });

//       await transfer.destroy();
//       res.json({ message: 'Bank transfer deleted' });
//     } catch (err) {
//       res.status(500).json({ message: 'Server error', error: err.message });
//     }
//   }
// };

// module.exports = BankTransferController;



// controllers/bank_transfer.controller.js
const { Sequelize } = require('sequelize');
const sequelize = require('../config/database');
const BankTransfer = require('../models/bank_transfer.model');
const BankAccount = require('../models/bank_account.model');
const Employee = require('../models/employee.model');

async function getCompanyId(req) {
  if (!req.user) return null;
  if (req.user.type?.toLowerCase() === 'company') return req.user.id;

  const emp = await Employee.findOne({ where: { user_id: req.user.id }, attributes: ['created_by'] });
  return emp?.created_by || null;
}

// GET ALL TRANSFERS
exports.getAll = async (req, res) => {
  try {
    const companyId = await getCompanyId(req);
    if (!companyId) return res.status(403).json({ success: false, message: 'Unable to resolve company' });

    const data = await BankTransfer.findAll({
      where: { created_by: companyId },
      include: [
        { model: BankAccount, as: 'fromAccount', attributes: ['id', 'holder_name', 'bank_name'] },
        { model: BankAccount, as: 'toAccount', attributes: ['id', 'holder_name', 'bank_name'] }
      ],
      order: [['id', 'ASC']]
    });

    res.json({ success: true, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// GET TRANSFER BY ID
exports.getById = async (req, res) => {
  try {
    const companyId = await getCompanyId(req);
    if (!companyId) return res.status(403).json({ success: false, message: 'Unable to resolve company' });

    const data = await BankTransfer.findOne({
      where: { id: req.params.id, created_by: companyId },
      include: [
        { model: BankAccount, as: 'fromAccount', attributes: ['id', 'holder_name', 'bank_name'] },
        { model: BankAccount, as: 'toAccount', attributes: ['id', 'holder_name', 'bank_name'] }
      ]
    });

    if (!data) return res.status(404).json({ success: false, message: 'Transfer not found' });
    res.json({ success: true, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// CREATE TRANSFER
exports.create = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { from_account, to_account, amount, date, payment_method, reference, description } = req.body;

    if (!from_account || !to_account || !amount || !date) {
      return res.status(400).json({ success: false, message: 'from_account, to_account, amount, date are required' });
    }

    if (from_account === to_account) {
      return res.status(400).json({ success: false, message: 'From and To account cannot be the same' });
    }

    const fromAcc = await BankAccount.findByPk(from_account, { transaction: t });
    const toAcc = await BankAccount.findByPk(to_account, { transaction: t });

    if (!fromAcc || !toAcc) return res.status(404).json({ success: false, message: 'Bank account not found' });

    // Optional: check current_balance dynamically if you want to prevent overdraft
    const outgoing = await BankTransfer.sum('amount', { where: { from_account } }) || 0;
    const currentBalance = parseFloat(fromAcc.opening_balance) - parseFloat(outgoing);

    if (currentBalance < parseFloat(amount)) {
      return res.status(400).json({ success: false, message: 'Insufficient balance in from_account' });
    }

    const transfer = await BankTransfer.create({
      from_account,
      to_account,
      amount,
      date,
      payment_method: payment_method || 'bank transfer',
      reference,
      description,
      created_by: req.user.id,
      created_at: new Date(),
      updated_at: new Date()
    }, { transaction: t });

    await t.commit();
    res.json({ success: true, message: 'Bank transfer created', data: transfer });

  } catch (err) {
    await t.rollback();
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// UPDATE TRANSFER
exports.update = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { from_account, to_account, amount, date, reference, description } = req.body;
    const companyId = await getCompanyId(req);
    if (!companyId) return res.status(403).json({ success: false, message: 'Unable to resolve company' });

    const transfer = await BankTransfer.findOne({ where: { id: req.params.id, created_by: companyId }, transaction: t });
    if (!transfer) return res.status(404).json({ success: false, message: 'Transfer not found' });

    // Optional: check current_balance of new from_account dynamically
    const fromAcc = from_account ? await BankAccount.findByPk(from_account, { transaction: t }) : await BankAccount.findByPk(transfer.from_account, { transaction: t });
    const outgoing = await BankTransfer.sum('amount', { where: { from_account: fromAcc.id, id: { [Sequelize.Op.ne]: transfer.id } } }) || 0;
    const currentBalance = parseFloat(fromAcc.opening_balance) - parseFloat(outgoing);

    const newAmount = amount !== undefined ? parseFloat(amount) : parseFloat(transfer.amount);
    if (currentBalance < newAmount) {
      return res.status(400).json({ success: false, message: 'Insufficient balance in from_account' });
    }

    await transfer.update({
      from_account: from_account || transfer.from_account,
      to_account: to_account || transfer.to_account,
      amount: newAmount,
      date: date || transfer.date,
      reference: reference !== undefined ? reference : transfer.reference,
      description: description !== undefined ? description : transfer.description,
      updated_at: new Date()
    }, { transaction: t });

    await t.commit();
    res.json({ success: true, message: 'Bank transfer updated', data: transfer });

  } catch (err) {
    await t.rollback();
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// DELETE (soft delete)
exports.remove = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const companyId = await getCompanyId(req);
    if (!companyId) {
      return res.status(403).json({ success: false, message: 'Unable to resolve company' });
    }

    const transfer = await BankTransfer.findOne({ 
      where: { id: req.params.id, created_by: companyId }, 
      transaction: t 
    });

    if (!transfer) {
      return res.status(404).json({ success: false, message: 'Transfer not found' });
    }

    // ✅ Force paranoid soft delete
    await transfer.destroy({ 
      transaction: t,
      individualHooks: true, 
      force: false   // 👈 make sure it updates deleted_at instead of hard delete
    });

    await t.commit();

    res.json({ success: true, message: 'Bank transfer deleted (soft)', data: { id: req.params.id } });
  } catch (err) {
    await t.rollback();
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};


