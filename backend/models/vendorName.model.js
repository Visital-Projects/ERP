// const { DataTypes } = require('sequelize');
// const sequelize = require('../config/database');
// // const WorkingZone = require('./workingZone.model');

// const VendorName = sequelize.define('VendorName', {
//     id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
//     working_zone: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
//     name: { type: DataTypes.STRING(191), allowNull: false },
//     created_by: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
//     created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
//     updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
// }, {
//     tableName: 'vendor_name',
//     timestamps: false
// });

// // Association
// // VendorName.belongsTo(WorkingZone, { foreignKey: 'working_zone', as: 'workingZone' });

// module.exports = VendorName;





// models/vendorName.model.js
const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/database');
const WorkingZone = require('./workingZone.model');

const VendorName = sequelize.define('VendorName', {
  id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
  working_zone: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
  name: { type: DataTypes.STRING(191), allowNull: false },
  created_by: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: 'vendor_name',
  timestamps: false
});

// ✅ Fix association
VendorName.belongsTo(WorkingZone, { foreignKey: 'working_zone', as: 'workingZone' });

module.exports = VendorName;
