const { DataTypes } = require("sequelize");
const {sequelize} = require("../config/database");
const Invoice = require("./Invoice.model");

const InvoiceTax = sequelize.define("InvoiceTax", {
  tax_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  invoice_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false
  },
  tax_type: {
    type: DataTypes.ENUM("IGST", "CGST", "SGST"),
    allowNull: false
  },
  rate: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false
  },
  tax_amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: "taxe",   // your DB table name
  timestamps: false
});

// ✅ Relations
InvoiceTax.belongsTo(Invoice, { foreignKey: "invoice_id", as: "invoice" });
Invoice.hasMany(InvoiceTax, { foreignKey: "invoice_id", as: "taxes" });

module.exports = InvoiceTax;
