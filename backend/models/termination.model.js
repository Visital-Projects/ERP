
/*
// const { DataTypes } = require('sequelize');
// const sequelize = require('../config/database');
// const Employee = require('./employee.model');

// const Termination = sequelize.define('Termination', {
// id: {
// type: DataTypes.BIGINT.UNSIGNED,
// primaryKey: true,
// autoIncrement: true
// },
// employee_id: {
// type: DataTypes.INTEGER,
// allowNull: false
// },
// notice_date: {
// type: DataTypes.DATEONLY,
// allowNull: false
// },
// termination_date: {
// type: DataTypes.DATEONLY,
// allowNull: false
// },
// termination_type: {
// type: DataTypes.STRING,
// allowNull: true
// },
// description: {
// type: DataTypes.STRING,
// allowNull: true
// },
// created_by: {
// type: DataTypes.INTEGER,
// allowNull: false
// },
// created_at: {
// type: DataTypes.DATE,
// allowNull: true
// },
// updated_at: {
// type: DataTypes.DATE,
// allowNull: true
// }
// }, {
// tableName: 'terminations',
// timestamps: false
// });

// // Relationships
// Termination.belongsTo(Employee, { foreignKey: 'employee_id', as: 'employee' });

// module.exports = Termination;

*/



const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/database');
const Employee = require('./employee.model');

const Termination = sequelize.define('Termination', {
id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
},
employee_id: {
    type: DataTypes.INTEGER,
    allowNull: false
},
notice_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
},
termination_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
},
termination_type: {
    type: DataTypes.STRING,
    allowNull: true
},
description: {
    type: DataTypes.STRING,
    allowNull: true
},
created_by: {
    type: DataTypes.INTEGER,
    allowNull: false
},


// ✅ NEW COLUMN
is_black_list: {
    type: DataTypes.TINYINT,
    allowNull: true,
    defaultValue: null
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
    defaultValue: null
  }
}, {
tableName: 'terminations',
timestamps: false
});

Termination.belongsTo(Employee, { foreignKey: 'employee_id', as: 'employee' });

module.exports = Termination;

