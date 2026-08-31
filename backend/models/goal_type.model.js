

const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/database');

const GoalType = sequelize.define('GoalType', {
id: {
type: DataTypes.BIGINT.UNSIGNED,
autoIncrement: true,
primaryKey: true
},
name: {
type: DataTypes.STRING(191),
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
tableName: 'goal_types',
timestamps: true,
createdAt: 'created_at',
updatedAt: 'updated_at'
});

module.exports = GoalType;

