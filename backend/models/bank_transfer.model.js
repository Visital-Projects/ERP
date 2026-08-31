// const { DataTypes } = require('sequelize');
// const sequelize = require('../config/database');

// const BankTransfer = sequelize.define('BankTransfer', {
//   id: {
//     type: DataTypes.BIGINT.UNSIGNED,
//     autoIncrement: true,
//     primaryKey: true,
//   },
//   from_account: {
//     type: DataTypes.INTEGER,
//     allowNull: false,
//     defaultValue: 0,
//   },
//   to_account: {
//     type: DataTypes.INTEGER,
//     allowNull: false,
//     defaultValue: 0,
//   },
//   amount: {
//     type: DataTypes.DECIMAL(15, 2),
//     allowNull: false,
//     defaultValue: 0.0,
//   },
//   date: {
//     type: DataTypes.DATEONLY,
//     allowNull: false,
//   },
//   payment_method: {
//     type: DataTypes.INTEGER,
//     allowNull: false,
//     defaultValue: 0,
//   },
//   reference: {
//     type: DataTypes.STRING,
//     allowNull: true,
//   },
//   description: {
//     type: DataTypes.TEXT,
//     allowNull: false,
//   },
//   created_by: {
//     type: DataTypes.INTEGER,
//     allowNull: false,
//     defaultValue: 0,
//   },
//   created_at: {
//     type: DataTypes.DATE,
//     allowNull: true,
//   },
//   updated_at: {
//     type: DataTypes.DATE,
//     allowNull: true,
//   },
// }, {
//   tableName: 'bank_transfers',
//   timestamps: false
// });

// module.exports = BankTransfer;




// models/bank_transfer.model.js
const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/database');
const BankAccount = require('./bank_account.model');

const BankTransfer = sequelize.define('BankTransfer', {
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  from_account: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
  to_account: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
  amount: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
  date: { type: DataTypes.DATEONLY, allowNull: false },
  payment_method: { type: DataTypes.STRING(50), allowNull: false, defaultValue: 'bank transfer' },
  reference: { type: DataTypes.STRING(191), allowNull: true },
  description: { type: DataTypes.TEXT, allowNull: true },
  created_by: { type: DataTypes.INTEGER, allowNull: false },
}, {
  tableName: 'bank_transfers_new',
  timestamps: true,
  createdAt: 'created_at',   // 👈 map Sequelize createdAt → created_at
  updatedAt: 'updated_at',   // 👈 map Sequelize updatedAt → updated_at
  paranoid: true,
  deletedAt: 'deleted_at'    // 👈 map soft delete column
});

// Associations
BankTransfer.belongsTo(BankAccount, { foreignKey: 'from_account', as: 'fromAccount' });
BankTransfer.belongsTo(BankAccount, { foreignKey: 'to_account', as: 'toAccount' });

module.exports = BankTransfer;
