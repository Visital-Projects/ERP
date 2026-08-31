


const { DataTypes } = require("sequelize");
const {sequelize} = require("../config/database");
const Customer = require("./customer.model");

const Invoice = sequelize.define("Invoice", {
  id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
  invoice_number: { type: DataTypes.STRING(50), allowNull: false, unique: true },
  customer_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
    created_by: {   // ✅ NEW FIELD
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false
  },
  invoice_date: { type: DataTypes.DATEONLY, allowNull: false },
  due_date: { type: DataTypes.DATEONLY },
  issue_date: { 
    type: DataTypes.DATEONLY, 
    allowNull: false, 
    defaultValue: DataTypes.NOW 
  },

  reference_no: { type: DataTypes.STRING(50) },
  reference_date: { type: DataTypes.DATEONLY },

  dispatch_doc_no: { type: DataTypes.STRING(50) },
  dispatch_date: { type: DataTypes.DATEONLY },
  terms_of_delivery: { type: DataTypes.TEXT },

  // 🆕 Extra fields from your invoice image
  buyer_order_no: { type: DataTypes.STRING(100) },
  buyer_order_date: { type: DataTypes.DATEONLY },
  delivery_note: { type: DataTypes.STRING(100) },
  mode_of_payment: { type: DataTypes.STRING(100) },
  other_references: { type: DataTypes.STRING(100) },
  dispatched_through: { type: DataTypes.STRING(100) },
  destination: { type: DataTypes.STRING(100) },
  authorized_signatory: { type: DataTypes.STRING(100) },

  taxable_value: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
  tax_amount: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
  tax_amount_in_words: {type: DataTypes.STRING,allowNull: true,},

  total_amount: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
  amount_in_words: { type: DataTypes.TEXT },
  round_off: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.0 },
  total_quantity: {
  type: DataTypes.FLOAT,
  defaultValue: 0,
},


  irn: { type: DataTypes.STRING(100) },
  ack_no: { type: DataTypes.STRING(100) },
  ack_date: { type: DataTypes.DATE },
  qr_code_url: { type: DataTypes.TEXT },

  // 🚛 Transporter
  transporter_name: { type: DataTypes.STRING(100) },
  lr_no: { type: DataTypes.STRING(50) },
  vehicle_no: { type: DataTypes.STRING(50) },

  // 💰 Payment tracking
  amount_paid: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0.0 },
  balance_due: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0.0 },
  payment_status: {
    type: DataTypes.ENUM("Unpaid", "Partially Paid", "Paid"),
    defaultValue: "Unpaid",
  },

  status: {
    type: DataTypes.ENUM("Draft", "Issued", "Paid", "Cancelled"),
    defaultValue: "Issued",
  },
}, {
  tableName: "invoices",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at",
});

Invoice.belongsTo(Customer, { foreignKey: "customer_id", as: "customer" });
Customer.hasMany(Invoice, { foreignKey: "customer_id", as: "invoices" });

module.exports = Invoice;
