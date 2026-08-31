




// const { DataTypes } = require('sequelize');
// const sequelize = require('../config/database');
// const Employee = require('./employee.model');

// const Asset = sequelize.define('Asset', {
//   id: {
//     type: DataTypes.BIGINT.UNSIGNED,
//     primaryKey: true,
//     autoIncrement: true
//   },
//   employee_id: {
//     type: DataTypes.STRING(255), // To support comma-separated employee ids if needed
//     allowNull: true
//   },
//   name: {
//     type: DataTypes.STRING(191),
//     allowNull: false
//   },
//   purchase_date: {
//     type: DataTypes.DATEONLY,
//     allowNull: false
//   },
//   supported_date: {
//     type: DataTypes.DATEONLY,
//     allowNull: false
//   },
//   amount: {
//     type: DataTypes.DECIMAL(10, 2),
//     allowNull: false
//   },
//   description: {
//     type: DataTypes.TEXT,
//     allowNull: true
//   },
//   created_by: {
//     type: DataTypes.INTEGER,
//     allowNull: false
//   },
//   created_at: {
//     type: DataTypes.DATE,
//     defaultValue: DataTypes.NOW
//   },
//   updated_at: {
//     type: DataTypes.DATE,
//     defaultValue: DataTypes.NOW
//   }
// }, {
//   tableName: 'assets',
//   timestamps: false
// });

// module.exports = Asset;






const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/database');

const Asset = sequelize.define('Asset', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  purchase_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  purchase_cost: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true,
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('active', 'maintenance', 'disposed', 'inactive'),
    allowNull: true,
    defaultValue: 'active',
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'assets_company',
  timestamps: true,
  underscored: true,
  paranoid: true,           // ✅ enables soft delete
  deletedAt: 'deleted_at',  // ✅ column name for soft delete

});

module.exports = Asset;





