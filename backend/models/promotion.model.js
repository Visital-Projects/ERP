// const { DataTypes } = require('sequelize');
// const sequelize = require('../config/database');

// const Promotion = sequelize.define('Promotion', {
//   id: {
//     type: DataTypes.BIGINT.UNSIGNED,
//     primaryKey: true,
//     autoIncrement: true
//   },
//   employee_id: {
//     type: DataTypes.INTEGER,
//     allowNull: false
//   },
//   designation_id: {
//     type: DataTypes.INTEGER,
//     allowNull: false
//   },
//   promotion_title: {
//     type: DataTypes.STRING,
//     allowNull: true
//   },
//   promotion_date: {
//     type: DataTypes.DATE,
//     allowNull: false
//   },
//   description: {
//     type: DataTypes.STRING,
//     allowNull: true
//   },
//   created_by: {
//     type: DataTypes.STRING,
//     allowNull: false
//   },
//   created_at: {
//     type: DataTypes.DATE,
//     defaultValue: DataTypes.NOW
//   },
//   updated_at: {
//     type: DataTypes.DATE,
//     defaultValue: DataTypes.NOW
//   }
// }, {
//   tableName: 'promotions',
//   timestamps: false
// });

// module.exports = Promotion;



const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/database');

const Employee = require('./employee.model');
const Designation = require('./designation.model');

const Promotion = sequelize.define('Promotion', {
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  employee_id: { type: DataTypes.INTEGER, allowNull: false },
  designation_id: { type: DataTypes.INTEGER, allowNull: false },
  promotion_title: { type: DataTypes.STRING },
  promotion_date: { type: DataTypes.DATEONLY, allowNull: false },
  description: { type: DataTypes.STRING },
  created_by: { type: DataTypes.STRING, allowNull: false },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  deleted_at: { type: DataTypes.DATE, allowNull: true, defaultValue: null }
}, {
  tableName: 'promotions',
  timestamps: false
});

// ✅ Add associations
Promotion.belongsTo(Employee, { foreignKey: 'employee_id', as: 'employee' });
Promotion.belongsTo(Designation, { foreignKey: 'designation_id', as: 'designation' });

module.exports = Promotion;
