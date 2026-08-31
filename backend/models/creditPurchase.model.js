// const { DataTypes } = require("sequelize");
// const sequelize = require("../config/database");
// const Branch = require("./branch.model");
// const User = require("./user.model");
// const ExpenseCategory = require("./expenseCategory.model");
// const ExpenseNewItem = require("./expenseNewItem.model"); // reuse

// const CreditPurchase = sequelize.define("credit_purchase", {
//   id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
//   branch_id: { type: DataTypes.BIGINT, allowNull: false },
//   category_id: { type: DataTypes.BIGINT, allowNull: true },
//   description: { type: DataTypes.TEXT, allowNull: true },
//   subtotal: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
//   tax_total: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
//   total_amount: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
//   payment_status: {
//     type: DataTypes.ENUM("pending", "paid"),
//     allowNull: false,
//     defaultValue: "pending",
//   },
//   payment_date: { type: DataTypes.DATE, allowNull: true },
//   created_by: { type: DataTypes.BIGINT, allowNull: false },
//     vendor_name: { type: DataTypes.STRING, allowNull: true },              // ✅ add this
//   type_of_supply_or_service: { type: DataTypes.STRING, allowNull: true }, // ✅ add this
//   is_deleted: { type: DataTypes.BOOLEAN, defaultValue: false },
// }, {
//   timestamps: true,
//   underscored: true,
// });

// CreditPurchase.belongsTo(Branch, { as: "branch", foreignKey: "branch_id" });
// CreditPurchase.belongsTo(User, { as: "creator", foreignKey: "created_by" });
// CreditPurchase.belongsTo(ExpenseCategory, { as: "category", foreignKey: "category_id" });

// module.exports = CreditPurchase;



const { DataTypes } = require("sequelize");
const {sequelize} = require("../config/database");
const Branch = require("./branch.model");
const User = require("./user.model");
const ExpenseCategory = require("./expenseCategory.model");
const ExpenseNewItem = require("./expenseNewItem.model"); // reuse

const CreditPurchase = sequelize.define("credit_purchase", {
  id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
  branch_id: { type: DataTypes.BIGINT, allowNull: false },
  category_id: { type: DataTypes.BIGINT, allowNull: true },
  description: { type: DataTypes.TEXT, allowNull: true },
  subtotal: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
  tax_total: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
  total_amount: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
  payment_status: {
    type: DataTypes.ENUM("pending", "paid"),
    allowNull: false,
    defaultValue: "pending",
  },
  payment_date: { type: DataTypes.DATE, allowNull: true },
  actual_bill_date: {
  type: DataTypes.DATEONLY,
  allowNull: true,
},
  remark: {
  type: DataTypes.TEXT,
  allowNull: true, // keep true in DB (validation will be in controller)
},
  created_by: { type: DataTypes.BIGINT, allowNull: false },
    vendor_name: { type: DataTypes.STRING, allowNull: true },              // ✅ add this
  type_of_supply_or_service: { type: DataTypes.STRING, allowNull: true }, // ✅ add this
  is_deleted: { type: DataTypes.BOOLEAN, defaultValue: false },
}, {
  timestamps: true,
  underscored: true,
});

CreditPurchase.belongsTo(Branch, { as: "branch", foreignKey: "branch_id" });
CreditPurchase.belongsTo(User, { as: "creator", foreignKey: "created_by" });
CreditPurchase.belongsTo(ExpenseCategory, { as: "category", foreignKey: "category_id" });

module.exports = CreditPurchase;
