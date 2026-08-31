// const jwt = require('jsonwebtoken');
// const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// module.exports = function (req, res, next) {
//   const token = req.header('Authorization')?.split(' ')[1];

//   if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });

//   try {
//     const decoded = jwt.verify(token, JWT_SECRET);
//     req.user = decoded; // attach user to request
//     next();
//   } catch (err) {
//     return res.status(400).json({ message: 'Invalid token' });
//   }
// };







// middleware/auth.middleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const Role = require('../models/role.model');
const Permission = require('../models/permission.model');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

module.exports = async function (req, res, next) {
  const token = req.header('Authorization')?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    // ✅ Step 1: Decode token
    const decoded = jwt.verify(token, JWT_SECRET);

    // ✅ Step 2: Get user from DB
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // ✅ Step 3: Find role based on user.type and include permissions
    const matchedRole = await Role.findOne({
      where: { name: user.type },
      include: [{ model: Permission, as: 'permissions' }]
    });

    let roles = [];
    let permissions = [];

    if (matchedRole) {
      roles = [{ id: matchedRole.id, name: matchedRole.name }];
      permissions = matchedRole.permissions?.map(p => p.name) || [];
    }

    // ✅ Step 4: Attach enriched user object to request
    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      type: user.type,
      roles,
      permissions
    };

    next();
  } catch (err) {
    console.error('Auth Middleware Error:', err);
    return res.status(400).json({ message: 'Invalid token' });
  }
};
