// const { DataTypes } = require("sequelize");
// const sequelize = require("../config/database");
// const Branch = require("./branch.model");
// const ExpenseCategory = require("./expenseCategory.model");
// const User = require("./user.model");
// const Employee = require("./employee.model");
// const ExpenseNewItem = require("./expenseNewItem.model");

// const ExpenseNew = sequelize.define(
//   "ExpenseNew",
//   {
//     id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
//     branch_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: Branch, key: "id" } },
  
//     employee_id: {type: DataTypes.INTEGER,allowNull: true},
    
//     payment_date: { type: DataTypes.DATEONLY, allowNull: false },
//     subtotal: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
//     tax_total: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
//     total_amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
//     payments_status: { type: DataTypes.STRING(255), allowNull: false, defaultValue: "paid" },
//     created_by: { type: DataTypes.INTEGER, allowNull: false, references: { model: User, key: "id" } },
//     description: { type: DataTypes.TEXT, allowNull: true },
//     category_id: { type: DataTypes.INTEGER, allowNull: true, references: { model: ExpenseCategory, key: "id" } },
//     document: { type: DataTypes.STRING(255), allowNull: true }, // stores uploaded file path
//     is_deleted: { type: DataTypes.BOOLEAN, defaultValue: false },
//     created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
//     updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    
    
//   },
//   {
//     tableName: "expenses_news",
//     timestamps: true,
//     createdAt: "created_at",
//     updatedAt: "updated_at",
//     defaultScope: { where: { is_deleted: false } },
//   }
// );

// // Associations
// // ExpenseNew.belongsTo(Branch, { foreignKey: "branch_id" });

// ExpenseNew.belongsTo(Branch, { foreignKey: "branch_id", as: "branch" });
// ExpenseNew.belongsTo(User, { foreignKey: "created_by", as: "creator" });
// ExpenseNew.belongsTo(ExpenseCategory, { foreignKey: "category_id", as: "category" });
// ExpenseNew.belongsTo(Employee, { foreignKey: "employee_id", as: "employee" });
// ExpenseNew.hasMany(ExpenseNewItem, {
//   foreignKey: "expense_id",
//   as: "items",
//   onDelete: "CASCADE",
//   hooks: true,
// });
// ExpenseNewItem.belongsTo(ExpenseNew, { foreignKey: "expense_id", as: "expense" });

// module.exports = ExpenseNew;



const { DataTypes } = require("sequelize");
const {sequelize} = require("../config/database");
const Branch = require("./branch.model");
const ExpenseCategory = require("./expenseCategory.model");
const User = require("./user.model");
const Employee = require("./employee.model");
const ExpenseNewItem = require("./expenseNewItem.model");

const ExpenseNew = sequelize.define(
  "ExpenseNew",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    branch_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: Branch, key: "id" } },
  
    employee_id: {type: DataTypes.INTEGER,allowNull: true},
    
    payment_date: { type: DataTypes.DATEONLY, allowNull: false },
    subtotal: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    tax_total: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    total_amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    payments_status: { type: DataTypes.STRING(255), allowNull: false, defaultValue: "paid" },
    actual_bill_date:{
        type: DataTypes.DATEONLY,
        allowNull:true
    },
    created_by: { type: DataTypes.INTEGER, allowNull: false, references: { model: User, key: "id" } },
    description: { type: DataTypes.TEXT, allowNull: true },
    remark: {
  type: DataTypes.TEXT,
  allowNull: true,
},
vendor_name: { type: DataTypes.STRING(255), allowNull: true },
    type_of_supply_or_service: { type: DataTypes.STRING(255), allowNull: true },
    category_id: { type: DataTypes.INTEGER, allowNull: true, references: { model: ExpenseCategory, key: "id" } },
    document: { type: DataTypes.STRING(255), allowNull: true }, // stores uploaded file path
    is_deleted: { type: DataTypes.BOOLEAN, defaultValue: false },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    
    
  },
  {
    tableName: "expenses_news",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    defaultScope: { where: { is_deleted: false } },
  }
);

// Associations
// ExpenseNew.belongsTo(Branch, { foreignKey: "branch_id" });

ExpenseNew.belongsTo(Branch, { foreignKey: "branch_id", as: "branch" });
ExpenseNew.belongsTo(User, { foreignKey: "created_by", as: "creator" });
ExpenseNew.belongsTo(ExpenseCategory, { foreignKey: "category_id", as: "category" });
ExpenseNew.belongsTo(Employee, { foreignKey: "employee_id", as: "employee" });
ExpenseNew.hasMany(ExpenseNewItem, {
  foreignKey: "expense_id",
  as: "items",
  onDelete: "CASCADE",
  hooks: true,
});
ExpenseNewItem.belongsTo(ExpenseNew, { foreignKey: "expense_id", as: "expense" });

module.exports = ExpenseNew;
