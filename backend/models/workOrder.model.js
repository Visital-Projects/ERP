// const { DataTypes } = require('sequelize');
// const sequelize = require('../config/database');
// const Branch = require('./branch.model');

// const WorkOrder = sequelize.define('WorkOrder', {
//   id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
//   wo_number: { type: DataTypes.STRING(50), allowNull: false, unique: true },

//   // Allow null here for drafts
//   title: { type: DataTypes.STRING(255), allowNull: true },
//   description: { type: DataTypes.TEXT, allowNull: true },

//   status: { 
//     type: DataTypes.ENUM('Draft','Open', 'In Progress', 'Completed', 'Hold', 'Invoiced', 'Cancelled', 'Partially Paid'), 
//     allowNull: false, 
//     defaultValue: 'Draft' 
//   },

//   wo_type: { type: DataTypes.STRING(100), allowNull: true },
//   amount: { type: DataTypes.DECIMAL(12,2), allowNull: true },
//   priority: { type: DataTypes.ENUM('Low', 'Medium', 'High', 'Emergency'), defaultValue: 'Medium' },
//   assigned_to: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
//   document: { type: DataTypes.JSON, allowNull: true },

//   // Allow null for Draft
//   issue_date: { type: DataTypes.DATE, allowNull: true },
//   expected_date: { type: DataTypes.DATE, allowNull: true },
//   start_date: { type: DataTypes.DATE, allowNull: true },
//   end_date: { type: DataTypes.DATE, allowNull: true },
//   expected_days: { type: DataTypes.DECIMAL(10,2), allowNull: true },
//   actual_days: { type: DataTypes.DECIMAL(10,2), allowNull: true },

//   created_by: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
// }, {
//   tableName: 'new_work_orders',
//   timestamps: true,
//   createdAt: 'created_at',
//   updatedAt: 'updated_at',
//   paranoid: true,
//   deletedAt: 'deleted_at',
// });

// // Associations
// WorkOrder.belongsTo(Branch, { foreignKey: 'assigned_to', as: 'assignedBranch' });

// module.exports = WorkOrder;



const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/database');
const Branch = require('./branch.model');

const WorkOrder = sequelize.define('WorkOrder', {
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  wo_number: { type: DataTypes.STRING(50), allowNull: false, unique: true },

  // Allow null here for drafts
  title: { type: DataTypes.STRING(255), allowNull: true },
  description: { type: DataTypes.TEXT, allowNull: true },

  status: { 
    type: DataTypes.ENUM('Draft','Open', 'In Progress', 'Completed', 'Hold', 'Invoiced', 'Cancelled', 'Partially Paid','Paid'), 
    allowNull: false, 
    defaultValue: 'Draft' 
  },

  wo_type: { type: DataTypes.STRING(100), allowNull: true },
//   amount: { type: DataTypes.DECIMAL(12,2), allowNull: true },
  priority: { type: DataTypes.ENUM('Low', 'Medium', 'High', 'Emergency'), defaultValue: 'Medium' },
  assigned_to: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
  document: { type: DataTypes.JSON, allowNull: true },
  issue_date: { type: DataTypes.DATE, allowNull: true },
  expected_date: { type: DataTypes.DATE, allowNull: true },
  start_date: { type: DataTypes.DATE, allowNull: true },
  end_date: { type: DataTypes.DATE, allowNull: true },
  expected_days: { type: DataTypes.DECIMAL(10,2), allowNull: true },
  actual_days: { type: DataTypes.DECIMAL(10,2), allowNull: true },

  work_order_amount: {
  type: DataTypes.DECIMAL(12,2),
  allowNull: false,
  defaultValue: 0,
},

total_invoiced_amount: {
  type: DataTypes.DECIMAL(12,2),
  allowNull: false,
  defaultValue: 0,
},

excess_amount: {
  type: DataTypes.DECIMAL(12,2),
  allowNull: false,
  defaultValue: 0,
},

  created_by: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
}, {
  tableName: 'new_work_orders',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  paranoid: true,
  deletedAt: 'deleted_at',
});

// Associations
WorkOrder.belongsTo(Branch, { foreignKey: 'assigned_to', as: 'assignedBranch' });

module.exports = WorkOrder;

