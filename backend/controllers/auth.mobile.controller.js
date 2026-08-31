// controllers/auth.controller.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const Role = require('../models/role.model');
    const Branch = require('../models/branch.model');

// after chnage login method
const Permission = require('../models/permission.model');  //-----> After Change


// ENV VAR
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

exports.loginWithBranch = async (req, res) => {
  try {
    const { email, password, branchId } = req.body;

    // 1. Find user
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // 2. Password check
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    // 3. Find branch
    const branch = await Branch.findOne({ where: { id: branchId } });

    if (!branch) {
      return res.status(403).json({ message: 'Invalid branch – login not allowed' });
    }

    // 4. Validate branch belongs to this company (created_by check)
    if (branch.created_by !== user.id) {
      return res.status(403).json({ message: 'This branch does not belong to your account' });
    }

    // 5. Token
    const token = jwt.sign(
      { id: user.id, email: user.email, type: user.type, branchId },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        type: user.type,
        branchId
      }
    });

  } catch (error) {
    console.error('LoginWithBranch Error:', error);
    return res.status(500).json({ message: 'Login failed' });
  }
};