


/*
// const { DataTypes } = require('sequelize');
// const sequelize = require('../config/database');
// const Employee = require('./employee.model');

// const Overtime = sequelize.define('Overtime', {
//   id: {
//     type: DataTypes.BIGINT.UNSIGNED,
//     autoIncrement: true,
//     primaryKey: true,
//     allowNull: false
//   },
//   employee_id: {
//     type: DataTypes.INTEGER,
//     allowNull: false
//   },
//   title: {
//     type: DataTypes.STRING(191),
//     allowNull: false
//   },
//   number_of_days: {
//     type: DataTypes.INTEGER,
//     allowNull: false
//   },
//   hours: {
//     type: DataTypes.INTEGER,
//     allowNull: false
//   },
//   rate: {
//     type: DataTypes.INTEGER,
//     allowNull: false
//   },
//   type: {
//     type: DataTypes.STRING(191),
//     allowNull: true
//   },
//   created_by: {
//     type: DataTypes.INTEGER,
//     allowNull: false
//   },
//   deleted_at: {                     
//     type: DataTypes.DATE,
//     allowNull: true
//   }
// }, {
//   tableName: 'overtimes',
//   timestamps: true,          
//   createdAt: 'created_at',   
//   updatedAt: 'updated_at'  ,
//   paranoid: true,                    
//   deletedAt: 'deleted_at'

// });

// Overtime.belongsTo(Employee, {
//   foreignKey: 'employee_id',
//   targetKey: 'employee_id',
//   as: 'employee'
// });

// module.exports = Overtime;


*/



const { DataTypes } = require("sequelize");
const {sequelize} = require("../config/database");
const Employee = require("./employee.model");

const Overtime = sequelize.define(
  "Overtime",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    employee_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATEONLY, // store per day
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(191),
      allowNull: false,
    },
    number_of_days: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    hours: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    rate: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0, // store daily_rate
    },
    ot_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0, // store calculated overtime pay
    },
    type: {
      type: DataTypes.STRING(191),
      allowNull: true,
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "overtimes",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    paranoid: true,
    deletedAt: "deleted_at",
  }
);

// Relation to Employee
Overtime.belongsTo(Employee, {
  foreignKey: "employee_id",
  targetKey: "employee_id",
  as: "employee",
});

module.exports = Overtime;

