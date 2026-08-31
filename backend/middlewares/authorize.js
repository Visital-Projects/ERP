


// const User = require('../models/user.model');
// const Role = require('../models/role.model');
// const Permission = require('../models/permission.model');

// const authorize = (requiredPermission) => {
//   return async (req, res, next) => {
//     try {
//       const userId = req.user?.id;
//       if (!userId) {
//         return res.status(401).json({ message: 'Unauthorized: no user logged in' });
//       }

//       const user = await User.findByPk(userId, {
//         include: [
//           {
//             model: Role,
//             as: 'roles',
//             required: false, // important!
//             include: [{ model: Permission, as: 'permissions', required: false }]
//           },
//           { model: Permission, as: 'permissions', required: false }
//         ]
//       });

//       if (!user) {
//         return res.status(404).json({ message: 'User not found' });
//       }

//       // Debug
//       console.log("USER ID:", user.id);
//       console.log("USER ROLES:", user.roles?.map(r => r.name));
//       console.log("USER PERMISSIONS:", user.permissions?.map(p => p.name));

//       // Collect permissions
//       let userPermissions = new Set();
//       if (user.permissions) {
//         user.permissions.forEach(p => userPermissions.add(p.name));
//       }
//       if (user.roles) {
//         user.roles.forEach(role => {
//           if (role.permissions) {
//             role.permissions.forEach(p => userPermissions.add(p.name));
//           }
//         });
//       }

//       // Super roles override
//       const SUPER_ROLES = ['super admin', 'company'];
//       if (user.roles?.some(r => SUPER_ROLES.includes(r.name.trim().toLowerCase()))) {
//         return next();
//       }

//       // Check required permission
//       if (!userPermissions.has(requiredPermission)) {
//         return res.status(403).json({ message: 'Forbidden: insufficient permission' });
//       }

//       next();
//     } catch (err) {
//       console.error('Authorization error:', err);
//       res.status(500).json({ message: 'Server error', error: err.message });
//     }
//   };
// };

// module.exports = authorize;






// middleware/authorize.js
const User = require('../models/user.model');
const Role = require('../models/role.model');
const Permission = require('../models/permission.model');

const authorize = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized: no user logged in' });
      }

      // ✅ Load user from DB
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // ✅ Find role based on user.type instead of user_roles relation
      const role = await Role.findOne({
        where: { name: user.type },
        include: [{ model: Permission, as: 'permissions' }]
      });

      if (!role) {
        return res.status(403).json({ message: 'No role matched with user.type' });
      }

      // ✅ Collect permissions
      const userPermissions = new Set(role.permissions?.map((p) => p.name) || []);

      // ✅ Super roles override
      const SUPER_ROLES = ['super admin', 'company'];
      const hasSuperRole = SUPER_ROLES.includes(role.name.trim().toLowerCase());
      if (hasSuperRole) {
        return next();
      }

      // ✅ Check required permission
      if (!userPermissions.has(requiredPermission)) {
        return res.status(403).json({ message: 'Forbidden: insufficient permission' });
      }

      next();
    } catch (err) {
      console.error('🔥 Authorization error:', err);
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  };
};

module.exports = authorize;

