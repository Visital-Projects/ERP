// controllers/profile.controller.js
const User = require('../models/user.model');

const path = require('path');


exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

/*exports.updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.name = name ?? user.name;
    user.email = email ?? user.email;

    await user.save();
    res.json({ message: 'Profile updated', user });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};*/

exports.updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.name = name ?? user.name;
    user.email = email ?? user.email;

    // ✅ Handle avatar upload
    if (req.file) {
      user.avatar = path.join('uploads', 'avatars', req.file.filename);
    }

    await user.save();
    res.json({ message: 'Profile updated', user });
  } catch (err) {
    console.error('updateProfile error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};




exports.filterUserView = async (req, res) => {
  try {
    const { branch, department, role } = req.query;
    const where = {};
    const include = [
      { model: Role, attributes: ['name'] },
      { model: Branch, attributes: ['name'] },
      { model: Department, attributes: ['name'] },
    ];

    if (branch) where.branch_id = branch;
    
    if (department) {
      include[2].where = { name: department }; // Filter by department name
    }

    if (role) where.type = role;

    const users = await User.findAll({
      where,
      include,
      attributes: { exclude: ['password'] },
    });

    res.json({ users });
  } catch (err) {
    console.error('filterUserView error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};