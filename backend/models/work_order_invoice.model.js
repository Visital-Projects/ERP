// const { DataTypes } = require('sequelize');
// const sequelize = require('../config/database');
// const WorkOrder = require('./workOrder.model');

// const WorkOrderInvoice = sequelize.define('WorkOrderInvoice', {
//   id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
//   wo_number: { type: DataTypes.STRING(50), allowNull: false },
//   payment_amount: { type: DataTypes.DECIMAL(12,2), allowNull: false },
//   cgst: { type: DataTypes.DECIMAL(5,2), defaultValue: 0 },
//   sgst: { type: DataTypes.DECIMAL(5,2), defaultValue: 0 },
//   igst: { type: DataTypes.DECIMAL(5,2), defaultValue: 0 },
//   gst_amount: { type: DataTypes.DECIMAL(12,2), defaultValue: 0 },
//   base_amount: { type: DataTypes.DECIMAL(12,2), allowNull: false },
//   total_amount: { type: DataTypes.DECIMAL(12,2), allowNull: false },
//   remaining_amount: { type: DataTypes.DECIMAL(12,2), defaultValue: 0 }, // New field
//   gst_type: { 
//   type: DataTypes.ENUM('Inclusive', 'Exclusive'), 
//   defaultValue: 'Exclusive' 
// },

// status: {
//   type: DataTypes.ENUM('pending', 'paid'),
//   allowNull: false,
//   defaultValue: 'pending',
// },


//   created_by: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
// }, {
//   tableName: 'work_order_invoices',
//   timestamps: true,
//   createdAt: 'created_at',
//   updatedAt: 'updated_at',
//   paranoid: true,
//   deletedAt: 'deleted_at'
// });

// // Association
// WorkOrderInvoice.belongsTo(WorkOrder, { foreignKey: 'wo_number', targetKey: 'wo_number', as: 'workOrder' });

// module.exports = WorkOrderInvoice;


const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/database');
const WorkOrder = require('./workOrder.model');

const WorkOrderInvoice = sequelize.define('WorkOrderInvoice', {
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  wo_number: { type: DataTypes.STRING(50), allowNull: false },
  payment_amount: { type: DataTypes.DECIMAL(12,2), allowNull: false },
  cgst: { type: DataTypes.DECIMAL(5,2), defaultValue: 0 },
  sgst: { type: DataTypes.DECIMAL(5,2), defaultValue: 0 },
  igst: { type: DataTypes.DECIMAL(5,2), defaultValue: 0 },
  gst_amount: { type: DataTypes.DECIMAL(12,2), defaultValue: 0 },
  base_amount: { type: DataTypes.DECIMAL(12,2), allowNull: false },
  total_amount: { type: DataTypes.DECIMAL(12,2), allowNull: false },
  remaining_amount: { type: DataTypes.DECIMAL(12,2), defaultValue: 0 }, // New field
  gst_type: { 
  type: DataTypes.ENUM('Inclusive', 'Exclusive'), 
  defaultValue: 'Exclusive' 
},

//   status: { 
//     type: DataTypes.ENUM('Pending', 'Paid'),
//     defaultValue: 'Pending'
//   },
  
status: {
  type: DataTypes.ENUM('pending', 'paid'),
  allowNull: false,
  defaultValue: 'pending',
},


  created_by: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
}, {
  tableName: 'work_order_invoices',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
//   paranoid: true,
//   deletedAt: 'deleted_at'
});

// Association
WorkOrderInvoice.belongsTo(WorkOrder, { foreignKey: 'wo_number', targetKey: 'wo_number', as: 'workOrder' });

module.exports = WorkOrderInvoice;
