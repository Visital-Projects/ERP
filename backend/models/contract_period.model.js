// // models/contract_period.model.js
// const { DataTypes } = require('sequelize');
// const sequelize = require('../config/database');
// const JobMode = require('./job_mode.model');
// const PlantName = require('./plant_name.model');
// const Branch = require('./branch.model'); // 

// const ContractPeriod = sequelize.define(
//   'ContractPeriod',
//   {
//     id: {
//       type: DataTypes.BIGINT.UNSIGNED,
//       autoIncrement: true,
//       primaryKey: true,
//       allowNull: false
//     },
//     job_mode_id: {
//       type: DataTypes.BIGINT.UNSIGNED,
//       allowNull: false
//     },
//     branch_id: {                         // NEW column
//       type: DataTypes.BIGINT.UNSIGNED,
//       allowNull: true
//     },
//     po_wo_number: {
//       type: DataTypes.STRING(191),
//       allowNull: false
//     },
//     created_by: {
//       type: DataTypes.BIGINT.UNSIGNED,
//       allowNull: true
//     },
//     created_at: {
//       type: DataTypes.DATE,
//       defaultValue: DataTypes.NOW
//     },
//     updated_at: {
//       type: DataTypes.DATE,
//       defaultValue: DataTypes.NOW
//     }
//   },
//   {
//     tableName: 'contract_period',
//     timestamps: true,
//     createdAt: 'created_at',
//     updatedAt: 'updated_at',
//     underscored: true,
//     freezeTableName: true
//   }
// );

// // Associations
// ContractPeriod.belongsTo(JobMode, { foreignKey: 'job_mode_id', as: 'job_mode' });
// ContractPeriod.belongsTo(Branch, { foreignKey: 'branch_id', as: 'branch' });

// module.exports = ContractPeriod;



// models/contract_period.model.js
const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/database');
const JobMode = require('./job_mode.model');
const Branch = require('./branch.model');

const ContractPeriod = sequelize.define(
  'ContractPeriod',
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    job_mode_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    branch_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
    },
    po_wo_number: {
      type: DataTypes.STRING(191),
      allowNull: false,
      defaultValue: ''
    },
    created_by: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'contract_period',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
    freezeTableName: true,
  }
);

// Associations
ContractPeriod.belongsTo(JobMode, { foreignKey: 'job_mode_id', as: 'job_mode' });
ContractPeriod.belongsTo(Branch, { foreignKey: 'branch_id', as: 'branch' });

module.exports = ContractPeriod;

