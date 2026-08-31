// src/models/billProducts.model.js

const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/database'); // Adjust path to your sequelize instance
const Bill = require('./bill.model'); // Parent Bill model
const Product = require('./product.model'); // Product/Service model

const BillProduct = sequelize.define('BillProduct', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  bill_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    references: {
      model: Bill,
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  product_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    references: {
      model: Product,
      key: 'id'
    }
  },
  quantity: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 1
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  discount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  tax: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0
  },
  
  description: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  is_deleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'bill_products',
  timestamps: false,
  underscored: true
});

// Associations
Bill.hasMany(BillProduct, { foreignKey: 'bill_id', as: 'products' });
BillProduct.belongsTo(Bill, { foreignKey: 'bill_id' });

Product.hasMany(BillProduct, { foreignKey: 'product_id' });
BillProduct.belongsTo(Product, { foreignKey: 'product_id' });

module.exports = BillProduct;
