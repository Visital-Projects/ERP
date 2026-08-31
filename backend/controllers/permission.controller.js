// controllers/permission.controller.js

const Permission = require('../models/permission.model');

exports.index = async (req, res) => {
  try {
    const permissions = await Permission.findAll();
    res.json(permissions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

exports.store = async (req, res) => {
  try {
    const { name, guard_name } = req.body;

    if (!name || !guard_name) {
      return res.status(400).json({ message: 'Name and guard_name are required.' });
    }

    const permission = await Permission.create({ name, guard_name });
    res.status(201).json(permission);
  } catch (error) {
    console.error('Error creating permission:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

exports.destroy = async (req, res) => {
  try {
    const permission = await Permission.findByPk(req.params.id);
    if (!permission) return res.status(404).json({ message: 'Permission not found' });

    await permission.destroy();
    res.json({ message: 'Permission deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
