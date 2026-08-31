const { DataTypes } = require("sequelize");
const {sequelize} = require("../config/database");

const Customer = sequelize.define("Customer", {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  customer_id: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(191),
    allowNull: true
  },
  phone: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  gst_number: DataTypes.STRING(30),
  pan_number: DataTypes.STRING(20),
  state_name: DataTypes.STRING(100),
  state_code: DataTypes.STRING(10),
  billing_address: DataTypes.TEXT,
  billing_city: DataTypes.STRING(100),
  billing_state: DataTypes.STRING(100),
  billing_zip: DataTypes.STRING(20),
  billing_country: DataTypes.STRING(100),
  shipping_address: DataTypes.TEXT,
  shipping_city: DataTypes.STRING(100),
  shipping_state: DataTypes.STRING(100),
  shipping_zip: DataTypes.STRING(20),
  shipping_country: DataTypes.STRING(100),
  is_active: {
    type: DataTypes.TINYINT,
    defaultValue: 1
  },
   balance: {
    type: DataTypes.DECIMAL(15, 2),  // money-safe field
    defaultValue: 0.00
  },
    created_by: {   // ✅ NEW FIELD
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false
  }
}, {
  tableName: "customers",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at"
});

module.exports = Customer;
