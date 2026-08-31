const { DataTypes } = require("sequelize");
const {sequelize} = require("../config/database");
const Branch = require("./branch.model");

const BranchFundRequest = sequelize.define(
  "BranchFundRequest",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    branch_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    paidAmount: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
    },
    remainingAmount: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
    },
    reason: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("pending", "paid","received", "rejected"),
      defaultValue: "pending",
    },
    transaction_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    created_by: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
    },
  },
  {
    tableName: "branch_fund_requests",
    timestamps: true,       // ✅ Enable automatic timestamps
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

// ✅ Associations
BranchFundRequest.belongsTo(Branch, { foreignKey: "branch_id" });

module.exports = BranchFundRequest;
