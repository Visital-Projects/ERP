
const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/database');
const Branch = require('./branch.model');
const Department = require('./department.model');
const Designation = require('./designation.model');
const User = require('./user.model');

const Indicator = sequelize.define('Indicator', {
id: {
type: DataTypes.BIGINT.UNSIGNED,
primaryKey: true,
autoIncrement: true
},
branch: {
type: DataTypes.INTEGER,
allowNull: false,
defaultValue: 0
},
department: {
type: DataTypes.INTEGER,
allowNull: false,
defaultValue: 0
},
designation: {
type: DataTypes.INTEGER,
allowNull: false,
defaultValue: 0
},
rating: {
type: DataTypes.STRING(191),
allowNull: true
},
customer_experience: {
type: DataTypes.INTEGER,
allowNull: false,
defaultValue: 0
},
marketing: {
type: DataTypes.INTEGER,
allowNull: false,
defaultValue: 0
},
administration: {
type: DataTypes.INTEGER,
allowNull: false,
defaultValue: 0
},
professionalism: {
type: DataTypes.INTEGER,
allowNull: false,
defaultValue: 0
},
integrity: {
type: DataTypes.INTEGER,
allowNull: false,
defaultValue: 0
},
attendance: {
type: DataTypes.INTEGER,
allowNull: false,
defaultValue: 0
},
created_user: {
type: DataTypes.INTEGER,
allowNull: false
},
created_by: {
type: DataTypes.INTEGER,
allowNull: false
},
created_at: {
type: DataTypes.DATE,
allowNull: true
},
updated_at: {
type: DataTypes.DATE,
allowNull: true
}
}, {
tableName: 'indicators',
timestamps: true,
createdAt: 'created_at',
updatedAt: 'updated_at'
});

// Associations
Indicator.belongsTo(Branch, { foreignKey: 'branch', as: 'branch_detail' });
Indicator.belongsTo(Department, { foreignKey: 'department', as: 'department_detail' });
Indicator.belongsTo(Designation, { foreignKey: 'designation', as: 'designation_detail' });
Indicator.belongsTo(User, { foreignKey: 'created_user', as: 'created_user_detail' });

module.exports = Indicator;

