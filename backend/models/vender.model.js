const { DataTypes } = require("sequelize");
const {sequelize} = require("../config/database");
const User = require("./user.model");

const Vender = sequelize.define(
  "Vender",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    vender_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "Auto-incremented per user",
    },
    name: {
      type: DataTypes.STRING(191),
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(191),
      allowNull: true,
    },
    tax_number: {
      type: DataTypes.STRING(191),
      allowNull: true,
    },
    password: {
      type: DataTypes.STRING(191),
      allowNull: true,
    },
    contact: {
      type: DataTypes.STRING(191),
      allowNull: true,
    },
    avatar: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    is_active: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    email_verified_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    billing_name: {
      type: DataTypes.STRING(191),
      allowNull: true,
    },
    billing_country: {
      type: DataTypes.STRING(191),
      allowNull: true,
    },
    billing_state: {
      type: DataTypes.STRING(191),
      allowNull: true,
    },
    billing_city: {
      type: DataTypes.STRING(191),
      allowNull: true,
    },
    billing_phone: {
      type: DataTypes.STRING(191),
      allowNull: true,
    },
    billing_zip: {
      type: DataTypes.STRING(191),
      allowNull: true,
    },
    billing_address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    shipping_name: {
      type: DataTypes.STRING(191),
      allowNull: true,
    },
    shipping_country: {
      type: DataTypes.STRING(191),
      allowNull: true,
    },
    shipping_state: {
      type: DataTypes.STRING(191),
      allowNull: true,
    },
    shipping_city: {
      type: DataTypes.STRING(191),
      allowNull: true,
    },
    shipping_phone: {
      type: DataTypes.STRING(191),
      allowNull: true,
    },
    shipping_zip: {
      type: DataTypes.STRING(191),
      allowNull: true,
    },
    shipping_address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    lang: {
      type: DataTypes.STRING(191),
      allowNull: false,
      defaultValue: "en",
    },
    balance: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 0,
    },
    remember_token: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "venders",
    timestamps: false, // manual timestamps
  }
);

// ===============================
// RELATIONSHIP
// ===============================
Vender.belongsTo(User, {
  foreignKey: "created_by",
  as: "creator",
});

module.exports = Vender;
