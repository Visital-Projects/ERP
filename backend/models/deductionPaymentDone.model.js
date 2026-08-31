// models/deductionPaymentDone.model.js
const { DataTypes } = require("sequelize");
const {sequelize} = require("../config/database");

const DeductionPaymentDone = sequelize.define("DeductionPaymentDone", {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  job_mode_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
  plant_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
  contract_period_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
  base_amount_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },

  tds: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0.0 },
  others: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0.0 },
  salaries: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0.0 },
  esi: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0.0 },
  epf: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0.0 },
  pt: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0.0 },

  created_by: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
}, {
  tableName: "deduction_payment_done",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at"
});

module.exports = DeductionPaymentDone;
