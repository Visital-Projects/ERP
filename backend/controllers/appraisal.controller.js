/*// const Appraisal = require('../models/appraisal.model');

// exports.getAll = async (req, res) => {
// try {
// const data = await Appraisal.findAll();
// res.json(data);
// } catch (err) {
// res.status(500).json({ message: 'Server error' });
// }
// };

// exports.create = async (req, res) => {
// try {
// const appraisal = await Appraisal.create(req.body);
// res.status(201).json(appraisal);
// } catch (err) {
// res.status(500).json({ message: 'Creation failed' });
// }
// };

// exports.update = async (req, res) => {
// try {
// const appraisal = await Appraisal.findByPk(req.params.id);
// if (!appraisal) return res.status(404).json({ message: 'Not found' });

// } catch (err) {
// res.status(500).json({ message: 'Update failed' });
// }
// };

// exports.destroy = async (req, res) => {
// try {
// const appraisal = await Appraisal.findByPk(req.params.id);
// if (!appraisal) return res.status(404).json({ message: 'Not found' });

// } catch (err) {
// res.status(500).json({ message: 'Delete failed' });
// }
// };*/


const Appraisal = require("../models/appraisal.model");
const Branch = require("../models/branch.model");
const Employee = require("../models/employee.model");

exports.getAll = async (req, res) => {
  try {
    const createdBy = req.user?.created_by || req.user?.id;
    const list = await Appraisal.findAll({
      where: { created_by: createdBy },
      include: [
        { model: Branch, as: "branch_detail", attributes: ["id", "name"] },
        { model: Employee, as: "employee_detail", attributes: ["id", "name"] },
      ],
    });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const item = await Appraisal.findByPk(req.params.id, {
      include: [
        { model: Branch, as: "branch_detail" },
        { model: Employee, as: "employee_detail" },
      ],
    });
    if (!item) return res.status(404).json({ message: "Appraisal not found" });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const {
      branch,
      employee,
      rating,
      appraisal_date,
      customer_experience,
      marketing,
      administration,
      professionalism,
      integrity,
      attendance,
      remark,
    } = req.body;

    const created_by = req.user?.created_by || req.user?.id;

    const newItem = await Appraisal.create({
      branch,
      employee,
      rating: JSON.stringify(rating),
      appraisal_date,
      customer_experience,
      marketing,
      administration,
      professionalism,
      integrity,
      attendance,
      remark,
      created_by,
    });

    res.status(201).json(newItem);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const item = await Appraisal.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: "Appraisal not found" });

    const {
      branch,
      employee,
      rating,
      appraisal_date,
      customer_experience,
      marketing,
      administration,
      professionalism,
      integrity,
      attendance,
      remark,
    } = req.body;

    item.branch = branch ?? item.branch;
    item.employee = employee ?? item.employee;
    item.rating = rating ? JSON.stringify(rating) : item.rating;
    item.appraisal_date = appraisal_date ?? item.appraisal_date;
    item.customer_experience = customer_experience ?? item.customer_experience;
    item.marketing = marketing ?? item.marketing;
    item.administration = administration ?? item.administration;
    item.professionalism = professionalism ?? item.professionalism;
    item.integrity = integrity ?? item.integrity;
    item.attendance = attendance ?? item.attendance;
    item.remark = remark ?? item.remark;

    await item.save();
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const item = await Appraisal.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: "Appraisal not found" });
    await item.destroy();
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};



