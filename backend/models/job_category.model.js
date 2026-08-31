const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/database');

const JobCategory = sequelize.define('JobCategory', {
id: {
type: DataTypes.BIGINT.UNSIGNED,
autoIncrement: true,
primaryKey: true,
},
title: {
type: DataTypes.STRING(191),
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
tableName: 'job_categories',
timestamps: true,
createdAt: 'created_at',
updatedAt: 'updated_at',
});

module.exports = JobCategory;

