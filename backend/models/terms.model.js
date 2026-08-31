const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/database');

const Terms = sequelize.define('Terms', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },

  page_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  page_type: {
    type: DataTypes.ENUM('content', 'url'),
    allowNull: false,
    defaultValue: 'content',
  },

  page_content: {
    type: DataTypes.TEXT,
    allowNull: true,
  },

  page_url: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  show_in_header: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  show_in_footer: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  require_login: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },

  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'terms_conditions',
  timestamps: false,

  hooks: {
    beforeValidate: (instance) => {
      const type = instance.page_type === 'url' ? 'url' : 'content';
      instance.page_type = type;

      if (type === 'content') {
        if (!instance.page_content || String(instance.page_content).trim().length === 0) {
          throw new Error('When page_type is "content" you must provide page_content.');
        }
        instance.page_url = null;
      } else {
        if (!instance.page_url || String(instance.page_url).trim().length === 0) {
          throw new Error('When page_type is "url" you must provide page_url.');
        }
        instance.page_content = null;
      }
    },
    beforeCreate: (instance) => {
      instance.created_at = new Date();
      instance.updated_at = new Date();
    },
    beforeUpdate: (instance) => {
      instance.updated_at = new Date();
    }
  }
});

module.exports = Terms;
