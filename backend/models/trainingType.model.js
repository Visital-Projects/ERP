// const { DataTypes } = require('sequelize');
// const sequelize = require('../config/database');

// const TrainingType = sequelize.define('TrainingType', {
//   id: {
//     type: DataTypes.BIGINT.UNSIGNED,
//     primaryKey: true,
//     autoIncrement: true
//   },
//   name: DataTypes.STRING,
//   created_by: DataTypes.INTEGER,
//   created_at: DataTypes.DATE,
//   updated_at: DataTypes.DATE
// }, {
//   tableName: 'training_types',
//   timestamps: false
// });

// module.exports = TrainingType;

const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/database');

const TrainingType = sequelize.define('TrainingType', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(191),
    allowNull: false,
  },
  created_by: {
    type: DataTypes.INTEGER,
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
  tableName: 'training_types',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = TrainingType;
