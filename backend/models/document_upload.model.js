const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/database');
const Role = require('./role.model');

const DocumentUpload = sequelize.define('DocumentUpload', {
id: {
type: DataTypes.BIGINT.UNSIGNED,
primaryKey: true,
autoIncrement: true
},
name: {
type: DataTypes.STRING,
allowNull: false
},
role: {
type: DataTypes.INTEGER,
allowNull: false
},
document: {
type: DataTypes.STRING,
allowNull: false
},
description: {
type: DataTypes.TEXT,
allowNull: true
},
created_by: {
type: DataTypes.INTEGER,
allowNull: false
},
created_at: {
type: DataTypes.DATE,
defaultValue: null
},
updated_at: {
type: DataTypes.DATE,
defaultValue: null
}
}, {
tableName: 'ducument_uploads',
timestamps: false
});

DocumentUpload.belongsTo(Role, {
foreignKey: 'role',
as: 'roleDetails'
});

module.exports = DocumentUpload;
