

const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/database');

const LoanOption = sequelize.define('LoanOption', {
id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
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
},
deleted_at: {  
    type: DataTypes.DATE,
    allowNull: true,
  }
}, {
  tableName: 'loan_options',
  timestamps: true,        
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',  
  paranoid: true          
});


module.exports = LoanOption;

// }, {
// tableName: 'loan_options',
// timestamps: true,
// createdAt: 'created_at',
// updatedAt: 'updated_at'
// });