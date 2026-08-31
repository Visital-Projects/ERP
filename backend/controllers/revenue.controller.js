

// const Revenue = require('../models/revenue.model');
// const BankAccount = require('../models/bank_account.model');
// const Customer = require('../models/customer.model');
// const Category = require('../models/category.model');
// const Employee = require('../models/employee.model');
// const path = require('path');
// const fs = require('fs');

// // ===============================
// // Helper: Get company id
// // ===============================
// async function getCompanyId(req) {
//   if (!req.user) return null;
//   if (req.user.type?.toLowerCase() === 'company') return req.user.id;

//   const emp = await Employee.findOne({ where: { user_id: req.user.id }, attributes: ['created_by'] });
//   return emp?.created_by || null;
// }

// // ===============================
// // GET ALL REVENUES
// // ===============================
// exports.getAll = async (req, res) => {
//   try {
//     const companyId = await getCompanyId(req);
//     if (!companyId) return res.status(403).json({ success: false, message: 'Unable to resolve company' });

//     const data = await Revenue.findAll({
//       where: { created_by: companyId },
//       include: [
//         { model: BankAccount, as: 'bankAccount', attributes: ['id', 'holder_name', 'bank_name', 'account_number'] },
//         { model: Customer, as: 'customer', attributes: ['id', 'name', 'customer_id'] },
//         { model: Category, as: 'category', attributes: ['id', 'name'] },
//       ],
//       order: [['id', 'DESC']],
//     });

//     res.json({ success: true, data });
//   } catch (err) {
//     console.error('Error in getAll revenues:', err);
//     res.status(500).json({ success: false, message: 'Server error', error: err.message });
//   }
// };

// // ===============================
// // GET REVENUE BY ID
// // ===============================
// exports.getById = async (req, res) => {
//   try {
//     const companyId = await getCompanyId(req);
//     if (!companyId) return res.status(403).json({ success: false, message: 'Unable to resolve company' });

//     const data = await Revenue.findOne({
//       where: { id: req.params.id, created_by: companyId },
//       include: [
//         { model: BankAccount, as: 'bankAccount', attributes: ['id', 'holder_name', 'bank_name', 'account_number'] },
//         { model: Customer, as: 'customer', attributes: ['id', 'name', 'customer_id'] },
//         { model: Category, as: 'category', attributes: ['id', 'name'] },
//       ],
//     });

//     if (!data) return res.status(404).json({ success: false, message: 'Revenue record not found' });

//     res.json({ success: true, data });
//   } catch (err) {
//     console.error('Error in getById revenue:', err);
//     res.status(500).json({ success: false, message: 'Server error', error: err.message });
//   }
// };

// // ===============================
// // CREATE REVENUE
// // ===============================
// exports.create = async (req, res) => {
//   try {
//     const companyId = await getCompanyId(req);
//     if (!companyId) return res.status(403).json({ success: false, message: 'Unable to resolve company' });

//     const { date, amount, account_id, customer_id, category_id, reference, description, payment_method } = req.body;

//     if (!date || !amount || !account_id || !customer_id || !category_id) {
//       return res.status(400).json({ success: false, message: 'date, amount, account_id, customer_id, category_id are required' });
//     }

//     // Validate foreign keys
//     const bank = await BankAccount.findOne({ where: { id: account_id, created_by: companyId } });
//     if (!bank) return res.status(400).json({ success: false, message: 'Invalid bank account' });

//     const customer = await Customer.findOne({ where: { id: customer_id, created_by: companyId } });
//     if (!customer) return res.status(400).json({ success: false, message: 'Invalid customer' });

//     const category = await Category.findOne({ where: { id: category_id, created_by: companyId } });
//     if (!category) return res.status(400).json({ success: false, message: 'Invalid category' });

//     // Handle file upload
//     let add_receipt = null;
//     if (req.file) {
//       add_receipt = path.relative(path.join(__dirname, '..'), req.file.path).replace(/\\/g, '/');
//     }

//     const payload = {
//       date,
//       amount,
//       account_id,
//       customer_id,
//       category_id,
//       reference: reference || null,
//       description: description || null,
//       payment_method: payment_method ? String(payment_method) : null, // ✅ FIXED
//       add_receipt,
//       created_by: companyId,
//       created_at: new Date(),
//       updated_at: new Date(),
//     };

//     const data = await Revenue.create(payload);
//     res.status(201).json({ success: true, message: 'Revenue record created', data });
//   } catch (err) {
//     console.error('Error in create revenue:', err);
//     res.status(500).json({ success: false, message: 'Server error', error: err.message });
//   }
// };

// // ===============================
// // UPDATE REVENUE
// // ===============================
// exports.update = async (req, res) => {
//   try {
//     const companyId = await getCompanyId(req);
//     if (!companyId) return res.status(403).json({ success: false, message: 'Unable to resolve company' });

//     const revenue = await Revenue.findOne({ where: { id: req.params.id, created_by: companyId } });
//     if (!revenue) return res.status(404).json({ success: false, message: 'Revenue record not found' });

//     const { date, amount, account_id, customer_id, category_id, reference, description, payment_method } = req.body;

//     // Validate foreign keys
//     if (account_id) {
//       const bank = await BankAccount.findOne({ where: { id: account_id, created_by: companyId } });
//       if (!bank) return res.status(400).json({ success: false, message: 'Invalid bank account' });
//     }

//     if (customer_id) {
//       const customer = await Customer.findOne({ where: { id: customer_id, created_by: companyId } });
//       if (!customer) return res.status(400).json({ success: false, message: 'Invalid customer' });
//     }

//     if (category_id) {
//       const category = await Category.findOne({ where: { id: category_id, created_by: companyId } });
//       if (!category) return res.status(400).json({ success: false, message: 'Invalid category' });
//     }

//     // Handle file upload
//     let add_receipt = revenue.add_receipt;
//     if (req.file) {
//       if (add_receipt) {
//         const newFile = path.join(__dirname, '..', add_receipt);
//         if (fs.existsSync(newFile)) fs.unlinkSync(newFile);
//       }
//       add_receipt = path.relative(path.join(__dirname, '..'), req.file.path).replace(/\\/g, '/');
//     }

//     const payload = {};
//     if (date !== undefined) payload.date = date;
//     if (amount !== undefined) payload.amount = amount;
//     if (account_id !== undefined) payload.account_id = account_id;
//     if (customer_id !== undefined) payload.customer_id = customer_id;
//     if (category_id !== undefined) payload.category_id = category_id;
//     if (reference !== undefined) payload.reference = reference;
//     if (description !== undefined) payload.description = description;
//     if (payment_method !== undefined) payload.payment_method = payment_method ? String(payment_method) : null; // ✅ FIXED
//     payload.add_receipt = add_receipt;
//     payload.updated_at = new Date();

//     await revenue.update(payload);
//     res.json({ success: true, message: 'Revenue record updated', data: revenue });
//   } catch (err) {
//     console.error('Error in update revenue:', err);
//     res.status(500).json({ success: false, message: 'Server error', error: err.message });
//   }
// };

// // ===============================
// // DELETE REVENUE
// // ===============================
// exports.remove = async (req, res) => {
//   try {
//     const companyId = await getCompanyId(req);
//     if (!companyId) return res.status(403).json({ success: false, message: 'Unable to resolve company' });

//     const revenue = await Revenue.findOne({ where: { id: req.params.id, created_by: companyId } });
//     if (!revenue) return res.status(404).json({ success: false, message: 'Revenue record not found' });

//     if (revenue.add_receipt) {
//       const filePath = path.join(__dirname, '..', revenue.add_receipt);
//       if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
//     }

//     await revenue.destroy();
//     res.json({ success: true, message: 'Revenue record deleted', data: { id: req.params.id } });
//   } catch (err) {
//     console.error('Error in delete revenue:', err);
//     res.status(500).json({ success: false, message: 'Server error', error: err.message });
//   }
// };


const Revenue = require('../models/revenue.model');
const BankAccount = require('../models/bank_account.model');
const Customer = require('../models/customer.model');
const Category = require('../models/category.model');
const Employee = require('../models/employee.model');
const path = require('path');
const fs = require('fs');

// ===============================
// Helper: Get company id
// ===============================
async function getCompanyId(req) {
    if (!req.user) return null;
    if (req.user.type?.toLowerCase() === 'company') return req.user.id;

    const emp = await Employee.findOne({ where: { user_id: req.user.id }, attributes: ['created_by'] });
    return emp?.created_by || null;
}

// ===============================
// GET ALL REVENUES
// ===============================
exports.getAll = async (req, res) => {
    try {
        const companyId = await getCompanyId(req);
        if (!companyId) return res.status(403).json({ success: false, message: 'Unable to resolve company' });

        const data = await Revenue.findAll({
            where: { created_by: companyId },
            include: [
                { model: BankAccount, as: 'account', attributes: ['id', 'holder_name', 'bank_name', 'account_number'] },
                { model: Customer, as: 'customer', attributes: ['id', 'name', 'customer_id'] },
                { model: Category, as: 'category', attributes: ['id', 'name'] },
            ],
            order: [['id', 'DESC']],
        });

        res.json({ success: true, data });
    } catch (err) {
        console.error('Error in getAll revenues:', err);
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
};

// ===============================
// GET REVENUE BY ID
// ===============================
exports.getById = async (req, res) => {
    try {
        const companyId = await getCompanyId(req);
        if (!companyId) return res.status(403).json({ success: false, message: 'Unable to resolve company' });

        const data = await Revenue.findOne({
            where: { id: req.params.id, created_by: companyId },
            include: [
                { model: BankAccount, as: 'account', attributes: ['id', 'holder_name', 'bank_name', 'account_number'] },
                { model: Customer, as: 'customer', attributes: ['id', 'name', 'customer_id'] },
                { model: Category, as: 'category', attributes: ['id', 'name'] },
            ],
        });

        if (!data) return res.status(404).json({ success: false, message: 'Revenue record not found' });

        res.json({ success: true, data });
    } catch (err) {
        console.error('Error in getById revenue:', err);
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
};

// ===============================
// CREATE REVENUE
// ===============================
exports.create = async (req, res) => {
    try {
        const companyId = await getCompanyId(req);
        if (!companyId) return res.status(403).json({ success: false, message: 'Unable to resolve company' });

        const { date, amount, account_id, customer_id, category_id, reference, description, payment_method } = req.body;

        if (!date || !amount || !account_id || !customer_id || !category_id) {
            return res.status(400).json({ success: false, message: 'date, amount, account_id, customer_id, category_id are required' });
        }

        // Validate foreign keys
        const bank = await BankAccount.findOne({ where: { id: account_id, created_by: companyId } });
        if (!bank) return res.status(400).json({ success: false, message: 'Invalid bank account' });

        const customer = await Customer.findOne({ where: { id: customer_id, created_by: companyId } });
        if (!customer) return res.status(400).json({ success: false, message: 'Invalid customer' });

        const category = await Category.findOne({ where: { id: category_id, created_by: companyId } });
        if (!category) return res.status(400).json({ success: false, message: 'Invalid category' });

        // Handle file upload
        let add_receipt = null;
        if (req.file) {
            add_receipt = path.relative(path.join(__dirname, '..'), req.file.path).replace(/\\/g, '/');
        }

        const payload = {
            date,
            amount,
            account_id,
            customer_id,
            category_id,
            reference: reference || null,
            description: description || null,
            payment_method: payment_method || null, // ✅ directly store string
            add_receipt,
            created_by: companyId,
            created_at: new Date(),
            updated_at: new Date(),
        };

        const data = await Revenue.create(payload);
        res.status(201).json({ success: true, message: 'Revenue record created', data });
    } catch (err) {
        console.error('Error in create revenue:', err);
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
};

// ===============================
// UPDATE REVENUE
// ===============================
exports.update = async (req, res) => {
    try {
        const companyId = await getCompanyId(req);
        if (!companyId) return res.status(403).json({ success: false, message: 'Unable to resolve company' });

        const revenue = await Revenue.findOne({ where: { id: req.params.id, created_by: companyId } });
        if (!revenue) return res.status(404).json({ success: false, message: 'Revenue record not found' });

        const { date, amount, account_id, customer_id, category_id, reference, description, payment_method } = req.body;

        // Validate foreign keys
        if (account_id) {
            const bank = await BankAccount.findOne({ where: { id: account_id, created_by: companyId } });
            if (!bank) return res.status(400).json({ success: false, message: 'Invalid bank account' });
        }

        if (customer_id) {
            const customer = await Customer.findOne({ where: { id: customer_id, created_by: companyId } });
            if (!customer) return res.status(400).json({ success: false, message: 'Invalid customer' });
        }

        if (category_id) {
            const category = await Category.findOne({ where: { id: category_id, created_by: companyId } });
            if (!category) return res.status(400).json({ success: false, message: 'Invalid category' });
        }

        // Handle file upload
        let add_receipt = revenue.add_receipt;
        if (req.file) {
            if (add_receipt) {
                const oldFile = path.join(__dirname, '..', add_receipt);
                if (fs.existsSync(oldFile)) fs.unlinkSync(oldFile);
            }
            add_receipt = path.relative(path.join(__dirname, '..'), req.file.path).replace(/\\/g, '/');
        }

        const payload = {};
        if (date !== undefined) payload.date = date;
        if (amount !== undefined) payload.amount = amount;
        if (account_id !== undefined) payload.account_id = account_id;
        if (customer_id !== undefined) payload.customer_id = customer_id;
        if (category_id !== undefined) payload.category_id = category_id;
        if (reference !== undefined) payload.reference = reference;
        if (description !== undefined) payload.description = description;
        if (payment_method !== undefined) payload.payment_method = payment_method; // ✅ store string
        payload.add_receipt = add_receipt;
        payload.updated_at = new Date();

        await revenue.update(payload);
        res.json({ success: true, message: 'Revenue record updated', data: revenue });
    } catch (err) {
        console.error('Error in update revenue:', err);
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
};


// ===============================
// SOFT DELETE REVENUE
// ===============================
exports.softdelete = async (req, res) => {
    try {
        const companyId = await getCompanyId(req);
        if (!companyId) 
            return res.status(403).json({ success: false, message: 'Unable to resolve company' });

        const revenue = await Revenue.findOne({ where: { id: req.params.id, created_by: companyId } });
        if (!revenue) 
            return res.status(404).json({ success: false, message: 'Revenue record not found' });

        // If you want to remove receipt file, optional
        if (revenue.add_receipt) {
            const filePath = path.join(__dirname, '..', revenue.add_receipt);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }

        // Soft delete: mark as deleted
        await revenue.update({
            is_deleted: true,
            deleted_at: new Date()
        });

        res.json({ success: true, message: 'Revenue record deleted', data: { id: req.params.id } });
    } catch (err) {
        console.error('Error in delete revenue:', err);
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
};

