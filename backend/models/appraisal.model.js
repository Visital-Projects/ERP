// module.exports = (sequelize, DataTypes) => {
// const Appraisal = sequelize.define('Appraisal', {
// id: {
// type: DataTypes.INTEGER,
// autoIncrement: true,
// primaryKey: true,
// },
// employee_id: {
// type: DataTypes.INTEGER,
// allowNull: false,
// },
// performance_type_id: {
// type: DataTypes.INTEGER,
// allowNull: false,
// },
// rating: {
// type: DataTypes.INTEGER,
// allowNull: false,
// },
// remarks: {
// type: DataTypes.TEXT,
// allowNull: true,
// },
// date: {
// type: DataTypes.DATEONLY,
// allowNull: false,
// },
// }, {
// tableName: 'appraisals',
// timestamps: true,
// });

// return Appraisal;
// };





const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/database');
const Branch = require('./branch.model');
const Employee = require('./employee.model');

const Appraisal = sequelize.define('Appraisal', {
id: {
type: DataTypes.BIGINT.UNSIGNED,
autoIncrement: true,
primaryKey: true,
},
branch: {
type: DataTypes.INTEGER,
allowNull: false,
defaultValue: 0,
},
employee: {
type: DataTypes.INTEGER,
allowNull: false,
defaultValue: 0,
},
rating: {
type: DataTypes.STRING(191),
allowNull: true,
},
appraisal_date: {
type: DataTypes.STRING(191),
allowNull: true,
},
customer_experience: {
type: DataTypes.INTEGER,
defaultValue: 0,
},
marketing: {
type: DataTypes.INTEGER,
defaultValue: 0,
},
administration: {
type: DataTypes.INTEGER,
defaultValue: 0,
},
professionalism: {
type: DataTypes.INTEGER,
defaultValue: 0,
},
integrity: {
type: DataTypes.INTEGER,
defaultValue: 0,
},
attendance: {
type: DataTypes.INTEGER,
defaultValue: 0,
},
remark: {
type: DataTypes.TEXT,
allowNull: true,
},
created_by: {
type: DataTypes.INTEGER,
allowNull: false,
},
created_at: {
type: DataTypes.DATE,
allowNull: true,
},
updated_at: {
type: DataTypes.DATE,
allowNull: true,
}
}, {
tableName: 'appraisals',
timestamps: true,
createdAt: 'created_at',
updatedAt: 'updated_at',
});

// Associations
Appraisal.belongsTo(Branch, { foreignKey: 'branch', as: 'branch_detail' });
Appraisal.belongsTo(Employee, { foreignKey: 'employee', as: 'employee_detail' });

module.exports = Appraisal;


