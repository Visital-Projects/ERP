
// const { DataTypes } = require('sequelize');
// const sequelize = require('../config/database');

// const User = require('./user.model');
// const Department = require('./department.model');
// const Branch = require('./branch.model');
// const Designation = require('./designation.model');
// const PayslipType = require('./payslipType.model');


// const Employee = sequelize.define('Employee', {
//   id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
//   user_id: { type: DataTypes.BIGINT.UNSIGNED },
//   name: { type: DataTypes.STRING, allowNull: false },
//   dob: { type: DataTypes.DATE },
//   gender: { type: DataTypes.STRING },
//   phone: { type: DataTypes.STRING, unique: true },
//   address: { type: DataTypes.TEXT },
//   email: { type: DataTypes.STRING, unique: true },
//   password: { type: DataTypes.STRING },
//   employee_id: { type: DataTypes.STRING }, 
//   biometric_emp_id: { type: DataTypes.JSON, allowNull: true, defaultValue: null },
//   branch_id: { type: DataTypes.INTEGER },
//   department_id: { type: DataTypes.INTEGER },
//   designation_id: { type: DataTypes.INTEGER },
//   company_doj: { type: DataTypes.DATE },
//   documents: { type: DataTypes.TEXT },
//   account_holder_name: { type: DataTypes.STRING },
//   account_number: { type: DataTypes.STRING },
//   bank_name: { type: DataTypes.STRING },
//   bank_identifier_code: { type: DataTypes.STRING },
//   branch_location: { type: DataTypes.STRING },
//   tax_payer_id: { type: DataTypes.STRING },
//   account: { type: DataTypes.STRING, allowNull: true, defaultValue: null },
//   salary_type: { type: DataTypes.INTEGER, allowNull: true, defaultValue: null },
//   salary: { type: DataTypes.DECIMAL(10, 2), allowNull: true, defaultValue: null },
//   aadhaar_number: { type: DataTypes.STRING(12), allowNull: true, unique: true, validate: {
//       isNumeric: true,
//       len: [12, 12],
//     }
//   },
//   employee_type: { type: DataTypes.STRING, allowNull: true },
//   is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
//   created_by: { type: DataTypes.INTEGER },
//   created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
//   updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
//   deleted_at: { type: DataTypes.DATE, allowNull: true, defaultValue: null },
//   rejoin_reason: { type: DataTypes.TEXT, allowNull: true, defaultValue: null },
  
//   // 🆕 NEW FIELDS
//   uan_number: { type: DataTypes.STRING(20), allowNull: true, defaultValue: null },
//   ip_number: { type: DataTypes.STRING(20), allowNull: true, defaultValue: null },
//   father_name: { type: DataTypes.STRING, allowNull: true, defaultValue: null },
//   skills: {
//     type: DataTypes.ENUM('High Skills', 'Skills', 'Semi Skills', 'Unskills'),
//     allowNull: true,
//     defaultValue: 'Unskills',
//   },

  
// }, {
//   tableName: 'employees',
//   timestamps: false,
//   paranoid: false

// });

// // Associations
// Employee.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
// Employee.belongsTo(Department, { foreignKey: 'department_id', as: 'department' });
// Employee.belongsTo(Branch, { foreignKey: 'branch_id', as: 'branch' });
// Employee.belongsTo(Designation, { foreignKey: 'designation_id', as: 'designation' });
// Employee.belongsTo(PayslipType, { foreignKey: 'salary_type', as: 'salaryType' });



// module.exports = Employee;





const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/database');

const User = require('./user.model');
const Department = require('./department.model');
const Branch = require('./branch.model');
const Designation = require('./designation.model');
const PayslipType = require('./payslipType.model');
const Skill = require('./skill.model');

const Employee = sequelize.define('Employee', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.BIGINT.UNSIGNED },
  name: { type: DataTypes.STRING, allowNull: false },
  dob: { type: DataTypes.DATE },
  gender: { type: DataTypes.STRING },
  phone: { type: DataTypes.STRING, unique: true },
  address: { type: DataTypes.TEXT },
  email: { type: DataTypes.STRING, unique: true },
  password: { type: DataTypes.STRING },
  employee_id: { type: DataTypes.STRING }, 
  biometric_emp_id: { type: DataTypes.JSON, allowNull: true, defaultValue: null },
  branch_id: { type: DataTypes.INTEGER },
  department_id: { type: DataTypes.INTEGER },
  designation_id: { type: DataTypes.INTEGER },
  company_doj: { type: DataTypes.DATE },
  documents: { type: DataTypes.TEXT },
  account_holder_name: { type: DataTypes.STRING },
  account_number: { type: DataTypes.STRING },
  bank_name: { type: DataTypes.STRING },
  bank_identifier_code: { type: DataTypes.STRING },
  branch_location: { type: DataTypes.STRING },
  tax_payer_id: { type: DataTypes.STRING },
  account: { type: DataTypes.STRING, allowNull: true, defaultValue: null },
  salary_type: { type: DataTypes.INTEGER, allowNull: true, defaultValue: null },
  salary: { type: DataTypes.DECIMAL(10, 2), allowNull: true, defaultValue: null },
  basic_salary: { type: DataTypes.DECIMAL(10, 2), allowNull: true, defaultValue: null },
  aadhaar_number: { type: DataTypes.STRING(12), allowNull: true, unique: true, validate: {
      isNumeric: true,
      len: [12, 12],
    }
  },
  employee_type: { type: DataTypes.STRING, allowNull: true },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
  created_by: { type: DataTypes.INTEGER },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  deleted_at: { type: DataTypes.DATE, allowNull: true, defaultValue: null },
  rejoin_reason: { type: DataTypes.TEXT, allowNull: true, defaultValue: null },
  
  // 🆕 NEW FIELDS
  uan_number: { type: DataTypes.STRING(20), allowNull: true, defaultValue: null },
  ip_number: { type: DataTypes.STRING(20), allowNull: true, defaultValue: null },
  father_name: { type: DataTypes.STRING, allowNull: true, defaultValue: null },
//   skills: {
//     type: DataTypes.ENUM('High Skills', 'Skills', 'Semi Skills', 'Unskills'),
//     allowNull: true,
//     defaultValue: 'Unskills',
//   },
  gatepassno: { type: DataTypes.STRING(50), allowNull: true, defaultValue: null },
  skill_id: {
  type: DataTypes.INTEGER,
  allowNull: true,
},

  
}, {
  tableName: 'employees',
  timestamps: false,
  paranoid: false

});

// Associations
Employee.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Employee.belongsTo(Department, { foreignKey: 'department_id', as: 'department' });
Employee.belongsTo(Branch, { foreignKey: 'branch_id', as: 'branch' });
Employee.belongsTo(Designation, { foreignKey: 'designation_id', as: 'designation' });
Employee.belongsTo(PayslipType, { foreignKey: 'salary_type', as: 'salaryType' });
Employee.belongsTo(Skill, {
  foreignKey: 'skill_id',
  as: 'skill',
});


module.exports = Employee;




