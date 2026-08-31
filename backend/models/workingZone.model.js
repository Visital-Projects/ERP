// // models/workingZone.model.js
// const { DataTypes } = require('sequelize');
// const sequelize = require('../config/database'); // Your Sequelize config
// // const PlantName = require('./plant_name.model'); // The PlantName model

// const WorkingZone = sequelize.define('WorkingZone', {
//     id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
//     plant_name: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
//     name: { type: DataTypes.STRING(191), allowNull: false },
//     created_by: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
//     created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
//     updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
// }, {
//     tableName: 'working_zone',
//     timestamps: false
// });

// // Setup foreign key relationship
// // WorkingZone.belongsTo(PlantName, { foreignKey: 'plant_name', as: 'plant' });

// module.exports = WorkingZone;





const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/database');
const Branch = require('./branch.model'); // Import Branch model

const WorkingZone = sequelize.define('WorkingZone', {
  id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
  branch_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
  name: { type: DataTypes.STRING(191), allowNull: false },
  created_by: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: 'working_zone',
  timestamps: false
});

// Association with Branch
WorkingZone.belongsTo(Branch, { foreignKey: 'branch_id', as: 'branch' });

module.exports = WorkingZone;
