const CompanyContribution = require('../models/companyContribution.model');

exports.create = async (req, res) => {
  try {
    const data = { ...req.body, created_by: req.user.id };
    const entry = await CompanyContribution.create(data);
    res.status(201).json(entry);
  } catch (err) {
    console.error('Create Error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.findAll = async (req, res) => {
  try {
    const data = await CompanyContribution.findAll();
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.findOne = async (req, res) => {
  try {
    const data = await CompanyContribution.findByPk(req.params.id);
    if (!data) return res.status(404).json({ message: 'Not found' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const record = await CompanyContribution.findByPk(req.params.id);
    if (!record) return res.status(404).json({ message: 'Not found' });
    await record.update(req.body);
    res.json(record);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const record = await CompanyContribution.findByPk(req.params.id);
    if (!record) return res.status(404).json({ message: 'Not found' });
    await record.destroy();
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

