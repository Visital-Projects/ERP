const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/database');

const PayslipType = sequelize.define('PayslipType', {
  id: { 
      type: DataTypes.INTEGER,
      autoIncrement: true, 
      primaryKey: true 
      
  },
  name: { 
      type: DataTypes.STRING(20), 
      allowNull: false 
      
  },
  created_by: { 
      type: DataTypes.INTEGER, 
      allowNull: false 
      
  },
  created_at: { 
      type: DataTypes.DATE, 
      defaultValue: DataTypes.NOW 
      
  },
  updated_at: { 
      type: DataTypes.DATE, 
      defaultValue: DataTypes.NOW 
      
  },
  deleted_at: {  
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: null
  }

},
// {
//   tableName: 'payslip_types',
//   timestamps: true,
//   deletedAt: 'deleted_at',  // 🔹 soft delete column
//   paranoid: true,           // 🔹 ensures destroy() = soft delete

// });
    {
  tableName: 'payslip_types',
  timestamps: true,         // 🔹 enable createdAt & updatedAt
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',  // 🔹 soft delete column
  paranoid: true,           // 🔹 ensures destroy() = soft delete
});


module.exports = PayslipType;
