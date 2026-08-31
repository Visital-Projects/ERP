const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/database');

const Account = sequelize.define('Account', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },

  account_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  created_by: {
    type: DataTypes.BIGINT.UNSIGNED,   // company_id
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
  tableName: 'accounts',
  timestamps: false,

  hooks: {
    beforeCreate: (instance) => {
      instance.created_at = new Date();
      instance.updated_at = new Date();
    },
    beforeUpdate: (instance) => {
      instance.updated_at = new Date();
    }
  }
});

module.exports = Account;
