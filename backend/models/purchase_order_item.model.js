// const { DataTypes } = require("sequelize");
// const sequelize = require("../config/database");

// const PurchaseOrderItem = sequelize.define("purchase_order_item", {
//   id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
//   purchase_order_id: { type: DataTypes.BIGINT, allowNull: false },
//   item_name: { type: DataTypes.STRING(255), allowNull: false },
//   quantity: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
//   unit_price: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
//   line_total: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
// }, {
//   timestamps: true,
//   createdAt: "created_at",
//   updatedAt: "updated_at",
//   tableName: "purchase_order_items",
// });

// module.exports = PurchaseOrderItem;




const { DataTypes } = require("sequelize");
const {sequelize} = require("../config/database");
const Unit = require("./unit.model"); // Import Unit

const PurchaseOrderItem = sequelize.define(
  "purchase_order_item",
  {
    id: { 
      type: DataTypes.BIGINT, 
      autoIncrement: true, 
      primaryKey: true 
    },
    purchase_order_id: { 
      type: DataTypes.BIGINT, 
      allowNull: false 
    },
    item_name: { 
      type: DataTypes.STRING(255), 
      allowNull: false 
    },
    quantity: { 
      type: DataTypes.DECIMAL(10, 2), 
      allowNull: false 
    },
    unit_price: { 
      type: DataTypes.DECIMAL(12, 2), 
      allowNull: false 
    },
    line_total: { 
      type: DataTypes.DECIMAL(12, 2), 
      allowNull: false 
    },
    // ✅ Correct unit_id definition (no trailing comma)
    unit_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: "product_service_units", // table name
        key: "id"
      }
    }
  },
  {
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    tableName: "purchase_order_items"
  }
);

// Association with Unit
PurchaseOrderItem.belongsTo(Unit, {
  foreignKey: "unit_id",
  as: "unit"
});

module.exports = PurchaseOrderItem;
