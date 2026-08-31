const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/database');
// const Role = require('./role.model');
// const Permission = require('./permission.model');

const RolePermission = sequelize.define('RolePermission', {
  permission_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    // references: {
    //   model: Permission,
    //   key: 'id',
    // },
  },
  role_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    // references: {
    //   model: Role,
    //   key: 'id',
    // },
  },
}, {
  tableName: 'role_has_permissions',
  timestamps: false,
});

// Associations
// Role.belongsToMany(Permission, {
//   through: RolePermission,
//   foreignKey: 'role_id',
//   otherKey: 'permission_id',
//   as: 'permissions',
// });

// Permission.belongsToMany(Role, {
//   through: RolePermission,
//   foreignKey: 'permission_id',
//   otherKey: 'role_id',
//   as: 'roles',
// });

module.exports = RolePermission;
