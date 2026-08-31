const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/database');

const AboutUs = sequelize.define('AboutUs', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },

  // UI: "Page Name" field
  page_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  // UI: radio choice between "Page Content" and "Page URL"
  // stored explicitly so backend knows which option was chosen
  page_type: {
    type: DataTypes.ENUM('content', 'url'),
    allowNull: false,
    defaultValue: 'content',
  },

  // rich text HTML from editor (Page Content)
  page_content: {
    type: DataTypes.TEXT,
    allowNull: true,
  },

  // optional static/external URL if Page URL chosen
  page_url: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  // toggles shown in the modal: Header, Footer, Login
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

  // timestamps (kept as in your project style)
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'about_us',
  timestamps: false,

  hooks: {
    // enforce that user selects exactly one kind and persist only relevant field
    beforeValidate: (instance) => {
      // normalize page_type if someone passes weird data
      const type = instance.page_type === 'url' ? 'url' : 'content';
      instance.page_type = type;

      if (type === 'content') {
        if (!instance.page_content || String(instance.page_content).trim().length === 0) {
          throw new Error('When page_type is "content" you must provide page_content.');
        }
        // ensure URL is not stored when content is chosen
        instance.page_url = null;
      } else { // url
        if (!instance.page_url || String(instance.page_url).trim().length === 0) {
          throw new Error('When page_type is "url" you must provide page_url.');
        }
        // ensure content is not stored when URL is chosen
        instance.page_content = null;
      }
    },

    // keep updated_at fresh
    beforeCreate: (instance) => {
      instance.created_at = new Date();
      instance.updated_at = new Date();
    },
    beforeUpdate: (instance) => {
      instance.updated_at = new Date();
    }
  }
});

module.exports = AboutUs;
