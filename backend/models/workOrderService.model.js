// models/workOrderService.model.js
const { DataTypes } = require("sequelize");
const {sequelize} = require("../config/database");
const WorkOrder = require("./workOrder.model");

const WorkOrderService = sequelize.define("work_order_service", {
  id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
  work_order_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    // references: { model: "work_orders", key: "id" },
    references: { model: "new_work_orders", key: "id" },
    onDelete: "CASCADE",
  },
  service_code: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.STRING, allowNull: true },
  unit: { type: DataTypes.STRING, allowNull: true },
  quantity: { type: DataTypes.FLOAT, allowNull: false },
  rate: { type: DataTypes.FLOAT, allowNull: false },
  amount: { type: DataTypes.FLOAT, allowNull: false },
});

WorkOrder.hasMany(WorkOrderService, { foreignKey: "work_order_id", as: "services" });
WorkOrderService.belongsTo(WorkOrder, { foreignKey: "work_order_id", as: "workOrder" });

module.exports = WorkOrderService;
