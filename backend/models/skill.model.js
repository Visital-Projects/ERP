const { DataTypes } = require("sequelize");
const {sequelize} = require("../config/database"); 

const Skill = sequelize.define(
  "Skill",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    wages: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
  },
  {
    tableName: "skills",
    timestamps: true,
    paranoid: true, // enables deleted_at
    underscored: true,
  }
);

module.exports = Skill;
