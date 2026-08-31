

const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/database');



const CompanyPolicy = sequelize.define('CompanyPolicy', {
    id: {
    type: DataTypes.BIGINT.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
    },
    branch: {
    type: DataTypes.INTEGER,
    allowNull: false,
    },
    title: {
    type: DataTypes.STRING,
    allowNull: false,
    },
    description: {
    type: DataTypes.TEXT,
    allowNull: false,
    },
    attachment: {
    type: DataTypes.STRING,
    allowNull: true,
    },
    created_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    },
    created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    },
    updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    }
    }, {
    tableName: 'company_policies',
    timestamps: false
    });
    
module.exports = CompanyPolicy;



