const { DataTypes } = require("sequelize");
const {sequelize} = require("../config/database");
const Invoice = require("./Invoice.model");

const InvoiceItem = sequelize.define("InvoiceItem", {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  invoice_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: true,
  },
   created_by: {   // ✅ New field
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: true,
  },

   title: {  // ✅ New field
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  hsn_sac: {
    type: DataTypes.STRING(50),
  },
  quantity: {
    type: DataTypes.DECIMAL(15, 3),
    allowNull: false,
    defaultValue: 1.0,
  },
  unit: {
    type: DataTypes.STRING(50),
  },
  rate: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
  },
  amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
  },
}, {
  tableName: "invoice_items",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at",
});

// Associations
InvoiceItem.belongsTo(Invoice, { foreignKey: "invoice_id", as: "invoice" });
Invoice.hasMany(InvoiceItem, { foreignKey: "invoice_id", as: "items" });

module.exports = InvoiceItem;
