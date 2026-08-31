const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/database');

const CustomQuestion = sequelize.define('CustomQuestion', {
id: {
type: DataTypes.BIGINT.UNSIGNED,
autoIncrement: true,
primaryKey: true
},
question: {
type: DataTypes.STRING(191),
allowNull: false
},
is_required: {
type: DataTypes.STRING(191),
allowNull: true
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
tableName: 'custom_questions',
timestamps: true,
createdAt: 'created_at',
updatedAt: 'updated_at'
});

module.exports = CustomQuestion;

