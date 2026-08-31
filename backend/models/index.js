
// const sequelize = require('../config/database');

// // Import models
// const Branch = require('./branch.model');
// const WorkingZone = require('./workingZone.model');
// const Vendor = require('./vendorName.model');
// const BillPaid = require('./bill_paid.model');  // check actual filename
// const Tax = require('./tax.model');
// const Employee = require('./employee.model');

// const Payslip = require("./payslip.model");

// const ChartOfAccount = require('./chart_of_account.model');
// const ChartOfAccountParent = require('./chart_of_account_parent.model');
// const ChartOfAccountType = require('./chart_of_account_type.model');
// const ChartOfAccountSubType = require('./chart_of_account_sub_type.model');


// // ================== Associations ==================



// // In your association file (index.js or wherever)
// Payslip.belongsTo(Employee, {
//   foreignKey: "employee_id",        // field in Payslip table
//   targetKey: "employee_id",         // field in Employee table to match
//   as: "employee"
// });

// Employee.hasMany(Payslip, {
//   foreignKey: "employee_id",        // field in Payslip table
//   sourceKey: "employee_id",         // field in Employee table to match
//   as: "payslips"
// });


// // Branch → WorkingZone
// Branch.hasMany(WorkingZone, { as: 'working_zones', foreignKey: 'branch_id' });

// // WorkingZone → Vendor
// WorkingZone.hasMany(Vendor, { as: 'vendors', foreignKey: 'working_zone' });
// // ❌ REMOVE duplicate Vendor.belongsTo here

// // Vendor → BillPaid
// Vendor.hasMany(BillPaid, { as: 'bills', foreignKey: 'vendor_id' });
// BillPaid.belongsTo(Vendor, { as: 'vendor', foreignKey: 'vendor_id' });

// // BillPaid → WorkingZone
// BillPaid.belongsTo(WorkingZone, { as: 'workingZone', foreignKey: 'workingZone_id' });

// // ChartOfAccountParent → Type & SubType
// ChartOfAccountParent.belongsTo(ChartOfAccountType, { foreignKey: 'type', as: 'accountType' });
// ChartOfAccountParent.belongsTo(ChartOfAccountSubType, { foreignKey: 'sub_type', as: 'accountSubType' });

// ChartOfAccountParent.belongsTo(ChartOfAccount, {
//   foreignKey: 'account',   // column in chart_of_account_parents
//   targetKey: 'id',         // primary key in chart_of_accounts
//   as: 'accountCode'
// });

// // ChartOfAccount → Type & SubType
// ChartOfAccount.belongsTo(ChartOfAccountType, { foreignKey: 'type', as: 'accountType' });
// ChartOfAccount.belongsTo(ChartOfAccountSubType, { foreignKey: 'sub_type', as: 'accountSubType' });

// // ChartOfAccount → Parent
// ChartOfAccount.belongsTo(ChartOfAccountParent, { foreignKey: 'parent', as: 'parentAccount' });



// // ==================================================

// // Export all models
// module.exports = {
//   sequelize,
//   Branch,
//   WorkingZone,
//   Vendor,
//   BillPaid,
//   Tax,
//   Employee,
//   Payslip,
//   ChartOfAccount,
//   ChartOfAccountParent,
//   ChartOfAccountType,
//   ChartOfAccountSubType,
// };


const {sequelize} = require('../config/database');

// Models
const Branch = require('./branch.model');
const WorkingZone = require('./workingZone.model');
const Vendor = require('./vendorName.model');
const BillPaid = require('./bill_paid.model');
const Tax = require('./tax.model');
const Employee = require('./employee.model');
const Payslip = require('./payslip.model');

const ChartOfAccount = require('./chart_of_account.model');
const ChartOfAccountParent = require('./chart_of_account_parent.model');
const ChartOfAccountType = require('./chart_of_account_type.model');
const ChartOfAccountSubType = require('./chart_of_account_sub_type.model');

// ================== Associations ==================


Payslip.belongsTo(Employee, { foreignKey: "employee_id", targetKey: "id", as: "employee" });
Employee.hasMany(Payslip, { foreignKey: "employee_id", sourceKey: "id", as: "payslips" });

// Branch → WorkingZone
Branch.hasMany(WorkingZone, { as: 'working_zones', foreignKey: 'branch_id' });

// WorkingZone → Vendor
WorkingZone.hasMany(Vendor, { as: 'vendors', foreignKey: 'working_zone' });

// Vendor → BillPaid
Vendor.hasMany(BillPaid, { as: 'bills', foreignKey: 'vendor_id' });
BillPaid.belongsTo(Vendor, { as: 'vendor', foreignKey: 'vendor_id' });

// BillPaid → WorkingZone
BillPaid.belongsTo(WorkingZone, { as: 'workingZone', foreignKey: 'workingZone_id' });

// ================== Chart of Accounts ==================

// ChartOfAccount → Type & SubType
ChartOfAccount.belongsTo(ChartOfAccountType, { foreignKey: 'type', as: 'accountType' });
ChartOfAccount.belongsTo(ChartOfAccountSubType, { foreignKey: 'sub_type', as: 'accountSubType' });

// ChartOfAccount → Parent
ChartOfAccount.belongsTo(ChartOfAccountParent, { foreignKey: 'parent', as: 'parentAccount' });

// ChartOfAccountParent → Type & SubType
ChartOfAccountParent.belongsTo(ChartOfAccountType, { foreignKey: 'type', as: 'accountType' });
ChartOfAccountParent.belongsTo(ChartOfAccountSubType, { foreignKey: 'sub_type', as: 'accountSubType' });

// ChartOfAccountParent → ChartOfAccount (by id)
ChartOfAccountParent.belongsTo(ChartOfAccount, {
  foreignKey: 'account',  // points to ChartOfAccount.id
  targetKey: 'id',
  as: 'accountCode'
});

// ================== Export ==================
module.exports = {
  sequelize,
  Branch,
  WorkingZone,
  Vendor,
  BillPaid,
  Tax,
  Employee,
  Payslip,
  ChartOfAccount,
  ChartOfAccountParent,
  ChartOfAccountType,
  ChartOfAccountSubType
};

