// const { DataTypes } = require('sequelize');
// const sequelize = require('../config/database');
// const Employee = require('./employee.model');

// const Warning = sequelize.define('Warning', {
//   id: {
//     type: DataTypes.BIGINT.UNSIGNED,
//     autoIncrement: true,
//     primaryKey: true
//   },
//   warning_to: {
//     type: DataTypes.INTEGER,
//     allowNull: false
//   },
//   warning_by: {
//     type: DataTypes.INTEGER,
//     allowNull: false
//   },
//   subject: {
//     type: DataTypes.STRING(191),
//     allowNull: true
//   },
//   warning_date: {
//     type: DataTypes.DATEONLY,
//     allowNull: false
//   },
//   description: {
//     type: DataTypes.STRING(191),
//     allowNull: true
//   },
//   created_by: {
//     type: DataTypes.STRING(191),
//     allowNull: false
//   },
//   created_at: {
//     type: DataTypes.DATE,
//     allowNull: true
//   },
//   updated_at: {
//     type: DataTypes.DATE,
//     allowNull: true
//   }
// }, {
//   tableName: 'warnings',
//   timestamps: false
// });

// // Associations
// Warning.belongsTo(Employee, { foreignKey: 'warning_to', as: 'to_employee' });
// Warning.belongsTo(Employee, { foreignKey: 'warning_by', as: 'by_employee' });

// module.exports = Warning;






const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/database');
const Employee = require('./employee.model');

const Warning = sequelize.define('Warning', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  warning_to: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  warning_by: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  subject: {
    type: DataTypes.STRING(191),
    allowNull: true
  },
  warning_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  description: {
    type: DataTypes.STRING(191),
    allowNull: true
  },
  created_by: {
    type: DataTypes.STRING(191),
    allowNull: false
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  deleted_at: {  // 🔹 Soft delete column
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'warnings',
  timestamps: false
});

// Associations
Warning.belongsTo(Employee, { foreignKey: 'warning_to', as: 'to_employee' });
Warning.belongsTo(Employee, { foreignKey: 'warning_by', as: 'by_employee' });

module.exports = Warning;
