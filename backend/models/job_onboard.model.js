const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/database');
const JobApplication = require('./job_application.model');

const JobOnBoard = sequelize.define('JobOnBoard', {
id: {
type: DataTypes.BIGINT.UNSIGNED,
autoIncrement: true,
primaryKey: true,
},
application: {
type: DataTypes.INTEGER,
allowNull: false,
},
joining_date: {
type: DataTypes.DATEONLY,
allowNull: true,
},
status: {
type: DataTypes.STRING(191),
allowNull: true,
},
convert_to_employee: {
type: DataTypes.INTEGER,
allowNull: false,
defaultValue: 0,
},
job_type: {
type: DataTypes.STRING(191),
allowNull: true,
},
days_of_week: {
type: DataTypes.INTEGER,
allowNull: true,
},
salary: {
type: DataTypes.INTEGER,
allowNull: true,
},
salary_type: {
type: DataTypes.STRING(191),
allowNull: true,
},
salary_duration: {
type: DataTypes.STRING(191),
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
},
}, {
tableName: 'job_on_boards',
timestamps: true,
createdAt: 'created_at',
updatedAt: 'updated_at',
});

JobOnBoard.belongsTo(JobApplication, {
foreignKey: 'application',
as: 'application_data',
});

module.exports = JobOnBoard;

