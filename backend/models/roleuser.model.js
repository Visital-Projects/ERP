/*// const { DataTypes } = require('sequelize');
// const sequelize = require('../config/database');
// const Role = require('./role.model');
// const User = require('./user.model');

// const RoleUser = sequelize.define('RoleUser', {
//   role_id: {
//     type: DataTypes.INTEGER,
//     allowNull: false,
//     references: {
//       model: Role,
//       key: 'id',
//     },
//   },
//   model_type: {
//     type: DataTypes.STRING,
//     defaultValue: 'App\\Models\\User', // Laravel convention
//   },
//   model_id: {
//     type: DataTypes.INTEGER,
//     allowNull: false,
//     references: {
//       model: User,
//       key: 'id',
//     },
//   },
// }, {
//   tableName: 'model_has_roles',
//   timestamps: false,
// });

// // Setup associations
// User.belongsToMany(Role, {
//   through: RoleUser,
//   foreignKey: 'model_id',
//   otherKey: 'role_id',
//   as: 'roles',
// });

// Role.belongsToMany(User, {
//   through: RoleUser,
//   foreignKey: 'role_id',
//   otherKey: 'model_id',
//   as: 'users',
// });

// module.exports = RoleUser;*/



// models/roleuser.model.js
const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/database');

const RoleUser = sequelize.define('RoleUser', {
  role_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  model_type: {
    type: DataTypes.STRING,
    defaultValue: 'App\\Models\\User', // Laravel convention
  },
  model_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'model_has_roles',
  timestamps: false,
});

module.exports = RoleUser;
