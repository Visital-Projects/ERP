const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Employee = require("./employee.model"); 

const OTPayment = sequelize.define(
  "OTPayment",
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

    basic_per_day: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },

    basic_per_hour: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },

    ot_hour: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },

    ot_rate: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },

    ot_payment: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    remark: {
      type: DataTypes.TEXT,
      allowNull: true,
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
    tableName: "ot_payments",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = OTPayment;


OTPayment.belongsTo(Employee, {
  foreignKey: "employee_id",   // column in ot_payments
  targetKey: "employee_id",    // column in employees table
  as: "employee",
});


module.exports = OTPayment;