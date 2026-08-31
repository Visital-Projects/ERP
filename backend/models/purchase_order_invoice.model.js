const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/database');
const PurchaseOrder = require('./purchase_order.model');

const PurchaseOrderInvoice = sequelize.define('PurchaseOrderInvoice', {
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  po_number: { type: DataTypes.STRING(50), allowNull: false },
  payment_amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  cgst: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 },
  sgst: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 },
  igst: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 },
  gst_amount: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  base_amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  total_amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  remaining_amount: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  gst_type: {
  type: DataTypes.ENUM('Inclusive', 'Exclusive'),
  defaultValue: 'Exclusive',
  allowNull: false
},

  status: {
    type: DataTypes.ENUM('Pending', 'Paid'),
    defaultValue: 'Pending'
  },
  created_by: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
}, {
  tableName: 'purchase_order_invoices',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  paranoid: true,
  deletedAt: 'deleted_at'
});

// Association
PurchaseOrderInvoice.belongsTo(PurchaseOrder, {
  foreignKey: 'po_number',
  targetKey: 'po_number',
  as: 'purchaseOrder'
});

module.exports = PurchaseOrderInvoice;
