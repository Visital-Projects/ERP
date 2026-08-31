const Travel = require('../models/travel.model');

exports.getAll = async (req, res) => {
try {
const data = await Travel.findAll();
res.json(data);
} catch (err) {
res.status(500).json({ message: 'Server error' });
}
};

exports.getById = async (req, res) => {
try {
const item = await Travel.findByPk(req.params.id);
if (!item) return res.status(404).json({ message: 'Not found' });
res.json(item);
} catch (err) {
res.status(500).json({ message: 'Server error' });
}
};

exports.create = async (req, res) => {
try {
const data = await Travel.create(req.body);
res.status(201).json(data);
} catch (err) {
res.status(500).json({ message: 'Server error' });
}
};

exports.update = async (req, res) => {
try {
const item = await Travel.findByPk(req.params.id);
if (!item) return res.status(404).json({ message: 'Not found' });
await item.update(req.body);
res.json(item);
} catch (err) {
res.status(500).json({ message: 'Server error' });
}
};

exports.destroy = async (req, res) => {
try {
const item = await Travel.findByPk(req.params.id);
if (!item) return res.status(404).json({ message: 'Not found' });
await item.destroy();
res.json({ message: 'Deleted' });
} catch (err) {
res.status(500).json({ message: 'Server error' });
}
};

