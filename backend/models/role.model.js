

const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/database');
const Permission = require('./permission.model');

const RolePermission = require('./rolePermission');


const Role = sequelize.define('Role', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(191),
    allowNull: false,
  },
  guard_name: {
    type: DataTypes.STRING(191),
    allowNull: false,
    defaultValue: 'web',
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
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
  tableName: 'roles',
  timestamps: false, // we’re manually mapping created_at, updated_at
});


// Associations here
Role.belongsToMany(Permission, {
  through: RolePermission,
  foreignKey: 'role_id',
  otherKey: 'permission_id',
  as: 'permissions',
});

Permission.belongsToMany(Role, {
  through: RolePermission,
  foreignKey: 'permission_id',
  otherKey: 'role_id',
  as: 'roles',
});



module.exports = Role;



// 🔗 Role ↔ Permissions (Many-to-Many)
// Role.belongsToMany(Permission, {
//   through: 'role_has_permissions',
//   foreignKey: 'role_id',
//   otherKey: 'permission_id',
//   as: 'permissions',
//   timestamps: false,
// });

// Associations here (no circular import problem)
// Role.belongsToMany(Permission, {
//   through: RolePermission,
//   foreignKey: 'role_id',
//   otherKey: 'permission_id',
//   as: 'permissions',
// });


/*
// const { DataTypes } = require('sequelize');
// const sequelize = require('../config/database');
// const Permission = require('./permission.model');

// const Role = sequelize.define('Role', {
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
//   tableName: 'roles',
//   timestamps: false,
// });

// // 🔗 Role ↔ Permissions (Many-to-Many)
// Role.belongsToMany(Permission, {
//   through: 'role_has_permissions',
//   foreignKey: 'role_id',
//   otherKey: 'permission_id',
//   as: 'permissions',
//   timestamps: false,
// });

// module.exports = Role;
*/