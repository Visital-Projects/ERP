// const { DataTypes } = require("sequelize");
// const sequelize = require("../config/database");
// const WorkOrder = require("./workOrder.model");
// const PurchaseOrder = require("./purchase_order.model");

// const Invoice = sequelize.define(
//   "Invoice",
//   {
//     id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },

//     // Reference number (PO or WO number)
//     number: { type: DataTypes.STRING(50), allowNull: false },

//     payment_amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
//     base_amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
//     gst_amount: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },

//     cgst: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 },
//     sgst: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 },
//     igst: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 },

//     total_amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
//     remaining_amount: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },

//     gst_type: { type: DataTypes.ENUM("Inclusive", "Exclusive"), defaultValue: "Exclusive" },

//     status: { type: DataTypes.ENUM("Pending", "Paid"), defaultValue: "Pending" },

//     created_by: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
//   },
//   {
//     tableName: "invoices_new",
//     timestamps: true,
//     createdAt: "created_at",
//     updatedAt: "updated_at",
//     paranoid: true,
//     deletedAt: "deleted_at",
//   }
// );

// // Associations
// Invoice.belongsTo(WorkOrder, { foreignKey: "number", targetKey: "wo_number", constraints: false });
// Invoice.belongsTo(PurchaseOrder, { foreignKey: "number", targetKey: "po_number", constraints: false });

// module.exports = Invoice;
// models/invoice.model.js



const { DataTypes } = require("sequelize");
const {sequelize} = require("../config/database");
const WorkOrder = require("./workOrder.model");
const PurchaseOrder = require("./purchase_order.model");

const Invoice = sequelize.define(
  "Invoice",
  {
    id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
    number: { type: DataTypes.STRING(50), allowNull: false }, // PO or WO number
    payment_amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    base_amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    gst_amount: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
    cgst: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 },
    sgst: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 },
    igst: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 },
    total_amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    remaining_amount: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
    gst_type: { type: DataTypes.ENUM("Inclusive", "Exclusive"), defaultValue: "Exclusive" },
    // status: { type: DataTypes.ENUM("Pending", "Paid"), defaultValue: "Pending" },
    created_by: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
  },
  {
    tableName: "invoices_new",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    paranoid: true,
    deletedAt: "deleted_at",
  }
);

// Associations with alias
Invoice.belongsTo(WorkOrder, {
  foreignKey: "number",
  targetKey: "wo_number",
  constraints: false,
  as: "workOrder",
});

Invoice.belongsTo(PurchaseOrder, {
  foreignKey: "number",
  targetKey: "po_number",
  constraints: false,
  as: "purchaseOrder",
});

module.exports = Invoice;

