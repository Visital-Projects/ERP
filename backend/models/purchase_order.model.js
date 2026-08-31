
// const { DataTypes } = require("sequelize");
// const sequelize = require("../config/database");
// const PurchaseOrderItem = require("./purchase_order_item.model");
// const Branch = require("./branch.model");

// const PurchaseOrder = sequelize.define(
//   "purchase_order",
//   {
//     id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
//     po_number: { type: DataTypes.STRING(50), allowNull: false, unique: true },
//     vendor_name: { type: DataTypes.STRING(255), allowNull: false },
//     status: {
//       type: DataTypes.ENUM("Draft", "Success", "Approved", "Received"),
//       defaultValue: "Draft",
//       allowNull: false,
//     },
// document: {
//   type: DataTypes.JSON,  // store multiple file paths
//   allowNull: true,
// },


//     po_date: { type: DataTypes.DATE, allowNull: false },
//     delivery_date: { type: DataTypes.DATE },
//     total_amount: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0.0 },
//     created_by: { type: DataTypes.BIGINT },
//     branch_id: { type: DataTypes.BIGINT, allowNull: true },
//   },
//   {
//     paranoid: true,
//     timestamps: true,
//     createdAt: "created_at",
//     updatedAt: "updated_at",
//     deletedAt: "deleted_at",
//     tableName: "purchase_orders",
//   }
// );

// // Associations
// PurchaseOrder.hasMany(PurchaseOrderItem, {
//   foreignKey: "purchase_order_id",
//   as: "line_items",
//   onDelete: "CASCADE",
// });
// PurchaseOrderItem.belongsTo(PurchaseOrder, { foreignKey: "purchase_order_id" });

// PurchaseOrder.belongsTo(Branch, { foreignKey: "branch_id", as: "branch" });

// module.exports = PurchaseOrder;

const { DataTypes } = require("sequelize");
const {sequelize} = require("../config/database");
const PurchaseOrderItem = require("./purchase_order_item.model");
const Branch = require("./branch.model");

const PurchaseOrder = sequelize.define(
  "purchase_order",
  {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },

    // allow null for draft creation
    po_number: { type: DataTypes.STRING(50), allowNull: true, unique: true },
    vendor_name: { type: DataTypes.STRING(255), allowNull: true },

    status: {
      type: DataTypes.ENUM("Draft", "Success", "Approved", "Received"),
      defaultValue: "Draft",
      allowNull: false,
    },

    document: { type: DataTypes.JSON, allowNull: true },

    po_date: { type: DataTypes.DATE, allowNull: true }, // allow null for draft
    delivery_date: { type: DataTypes.DATE },
    total_amount: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0.0 },
    created_by: { type: DataTypes.BIGINT },
    branch_id: { type: DataTypes.BIGINT, allowNull: true },
  },
  {
    paranoid: true,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    deletedAt: "deleted_at",
    tableName: "purchase_orders",
  }
);

// Associations
PurchaseOrder.hasMany(PurchaseOrderItem, {
  foreignKey: "purchase_order_id",
  as: "line_items",
  onDelete: "CASCADE",
});
PurchaseOrderItem.belongsTo(PurchaseOrder, { foreignKey: "purchase_order_id" });

PurchaseOrder.belongsTo(Branch, { foreignKey: "branch_id", as: "branch" });

module.exports = PurchaseOrder;

