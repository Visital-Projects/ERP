const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/database');

const JobStage = sequelize.define('JobStage', {
id: {
type: DataTypes.BIGINT.UNSIGNED,
autoIncrement: true,
primaryKey: true,
},
title: {
type: DataTypes.STRING(191),
allowNull: false,
},
order: {
type: DataTypes.INTEGER,
allowNull: false,
defaultValue: 0,
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
tableName: 'job_stages',
timestamps: true,
createdAt: 'created_at',
updatedAt: 'updated_at',
});

module.exports = JobStage;

