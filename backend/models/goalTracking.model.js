const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/database');
const Branch = require('./branch.model');
const GoalType = require('./goal_type.model');

const GoalTracking = sequelize.define('GoalTracking', {
id: {
type: DataTypes.BIGINT.UNSIGNED,
autoIncrement: true,
primaryKey: true,
},
branch: {
type: DataTypes.INTEGER,
allowNull: false,
},
goal_type: {
type: DataTypes.INTEGER,
allowNull: false,
},
start_date: {
type: DataTypes.DATEONLY,
allowNull: false,
},
end_date: {
type: DataTypes.DATEONLY,
allowNull: false,
},
subject: {
type: DataTypes.STRING(191),
allowNull: true,
},
rating: {
type: DataTypes.STRING(191),
allowNull: true,
},
target_achievement: {
type: DataTypes.STRING(191),
allowNull: true,
},
description: {
type: DataTypes.TEXT,
allowNull: true,
},
status: {
type: DataTypes.INTEGER,
allowNull: false,
defaultValue: 0,
},
progress: {
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
tableName: 'goal_trackings',
timestamps: true,
createdAt: 'created_at',
updatedAt: 'updated_at',
});

GoalTracking.belongsTo(Branch, { foreignKey: 'branch', as: 'branch_detail' });
GoalTracking.belongsTo(GoalType, { foreignKey: 'goal_type', as: 'goal_type_detail' });

module.exports = GoalTracking;

