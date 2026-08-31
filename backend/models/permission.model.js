/*
// const { DataTypes } = require('sequelize');
// const sequelize = require('../config/database');

// const Permission = sequelize.define('Permission', {
//   id: {
//     type: DataTypes.INTEGER,
//     primaryKey: true,
//     autoIncrement: true,
//   },
//   name: DataTypes.STRING,
//   guard_name: DataTypes.STRING,
//   created_at: DataTypes.DATE,
//   updated_at: DataTypes.DATE,
// }, {
//   tableName: 'permissions',
//   timestamps: false,
// });

// module.exports = Permission;
*/

/*// const RoleHasPermission = require('./rolePermission');
// const RoleHasPermission = require('./role_has_permissions.model');

// // 🔹 Relations
// Permission.belongsToMany(Role, {
//   through: RoleHasPermission,
//   foreignKey: 'permission_id',
//   otherKey: 'role_id',
//   as: 'roles'
// });

// const { DataTypes } = require('sequelize');
// const sequelize = require('../config/database');
// const Role = require('./role.model');
// const RolePermission = require('./rolePermission');

// const Permission = sequelize.define('Permission', {
//   id: {
//     type: DataTypes.BIGINT.UNSIGNED,
//     primaryKey: true,
//     autoIncrement: true
//   },
//   name: DataTypes.STRING(191),
//   guard_name: {
//     type: DataTypes.STRING(191),
//     defaultValue: 'web'
//   },
// }, {
//   tableName: 'permissions',
//   timestamps: true,
//   createdAt: 'created_at',
//   updatedAt: 'updated_at'
// });


// // Associations
// Permission.belongsToMany(Role, {
//   through: RolePermission,
//   foreignKey: 'permission_id',
//   otherKey: 'role_id',
//   as: 'roles',
// });


// module.exports = Permission;*/

const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/database');

const Permission = sequelize.define('Permission', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(191),
    allowNull: false,
  },
  guard_name: {
    type: DataTypes.STRING(191),
    defaultValue: 'web',
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'permissions',
  timestamps: false, // because we manually mapped created_at & updated_at
});

module.exports = Permission;


