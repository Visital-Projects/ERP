const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");
const Employee = require("./employee.model"); 

const GrossSalary = sequelize.define(
  "GrossSalary",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    employee_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
     
    },

    salary_month: {
      type: DataTypes.STRING,
      allowNull: false,
      
    },

    fixed_gross_per_month: {
      type: DataTypes.FLOAT,
      allowNull: false
    },

    per_day_payment: {
      type: DataTypes.FLOAT,
      allowNull: false
    },

    nh: {
      type: DataTypes.FLOAT,
      defaultValue: 0
    },

    attendance: {
      type: DataTypes.FLOAT,
      defaultValue: 0
    },

    total: {
      type: DataTypes.FLOAT,
      allowNull: false
    },

    salary: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    remark: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM("paid", "unpaid"),
      defaultValue: "unpaid",
    },

    paid_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    
    is_deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "gross_salaries",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at"
  }
);


GrossSalary.belongsTo(Employee, {
  foreignKey: "employee_id",   // column in ot_payments
  targetKey: "employee_id",    // column in employees table
  as: "employee",
});

module.exports = GrossSalary;
