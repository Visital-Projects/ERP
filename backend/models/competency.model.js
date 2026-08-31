


const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/database');
const PerformanceType = require('./performanceType.model');

const Competency = sequelize.define('Competency', {
id: {
type: DataTypes.BIGINT.UNSIGNED,
autoIncrement: true,
primaryKey: true,
},
name: {
type: DataTypes.STRING(191),
allowNull: false,
},
type: {
type: DataTypes.INTEGER,
allowNull: false,
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
tableName: 'competencies',
timestamps: true,
createdAt: 'created_at',
updatedAt: 'updated_at',
});

Competency.belongsTo(PerformanceType, {
foreignKey: 'type',
as: 'performanceType',
});

module.exports = Competency;

