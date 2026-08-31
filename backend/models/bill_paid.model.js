const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/database');  // ✅ Import your Sequelize instance
const BillPaid = sequelize.define('BillPaid', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  workingZone_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false
  },
  vendor_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false
  },
  base_amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0
  },
  cgst_amount: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  sgst_amount: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  igst_amount: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  total_tax: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  bill_received_in_gst: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  calculation_type: {
    type: DataTypes.ENUM('inclusive', 'exclusive'),
    defaultValue: 'exclusive'
  },
  created_by: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: true
  }
}, {
  tableName: 'bill_paid',
  timestamps: true,
  createdAt: 'created_at',   // ✅ Map correct column
  updatedAt: 'updated_at'    // ✅ Map correct column
});

// Associations (optional, if you load associations later)

//   BillPaid.belongsTo(WorkingZone, { as: 'workingZone', foreignKey: 'workingZone_id' });
//   BillPaid.belongsTo(Vendor, { as: 'vendor', foreignKey: 'vendor_id' });


module.exports = BillPaid;
