// models/assetMaintenance.model.js
const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/database');
const Asset = require('./asset.model');

const AssetMaintenanceLog = sequelize.define('AssetMaintenanceLog', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    asset_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Asset,
            key: 'id',
        },
    },
    maintenance_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    cost: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
    },
    performed_by: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    next_due_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
    },
    created_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
}, {
    tableName: 'asset_company_maintenance_logs',
    timestamps: true,
    underscored: true, // ✅ important: maps createdAt → created_at

});

// Association
Asset.hasMany(AssetMaintenanceLog, { foreignKey: 'asset_id', as: 'maintenanceLogs' });
AssetMaintenanceLog.belongsTo(Asset, { foreignKey: 'asset_id', as: 'asset' });

module.exports = AssetMaintenanceLog;

