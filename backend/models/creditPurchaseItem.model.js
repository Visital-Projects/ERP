const { DataTypes } = require("sequelize");
const {sequelize} = require("../config/database");
const CreditPurchase = require("./creditPurchase.model");

const CreditPurchaseItem = sequelize.define("credit_purchase_item", {
  id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
  credit_purchase_id: { type: DataTypes.BIGINT, allowNull: false },
  item_name: { type: DataTypes.STRING, allowNull: false },
  subtotal: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
  is_taxable: { type: DataTypes.BOOLEAN, defaultValue: false },
  tax_rate: { type: DataTypes.FLOAT, defaultValue: 0 },
  tax_type: { type: DataTypes.ENUM("exclusive", "inclusive"), allowNull: true },
  tax_total: { type: DataTypes.FLOAT, defaultValue: 0 },
  total_amount: { type: DataTypes.FLOAT, defaultValue: 0 },
  document: { type: DataTypes.STRING, allowNull: true },
}, {
  timestamps: true,
  underscored: true,
});

CreditPurchaseItem.belongsTo(CreditPurchase, { foreignKey: "credit_purchase_id" });
CreditPurchase.hasMany(CreditPurchaseItem, { as: "items", foreignKey: "credit_purchase_id" });

module.exports = CreditPurchaseItem;
