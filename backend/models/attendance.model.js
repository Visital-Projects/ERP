



// const { DataTypes } = require("sequelize");
// const sequelize = require("../config/database");
// const Employee = require("./employee.model");

// const AttendanceEmployee = sequelize.define("AttendanceEmployee", {
//   id: {
//     type: DataTypes.BIGINT.UNSIGNED,
//     autoIncrement: true,
//     primaryKey: true
//   },
//   employee_id: {
//     type: DataTypes.BIGINT.UNSIGNED,
//     references: {
//       model: Employee,
//       key: "id"
//     }
//   },
//   date: {
//     type: DataTypes.DATEONLY,
//     allowNull: false
//   },
//   status: {
//     type: DataTypes.ENUM("Present", "Absent", "Leave"),
//     defaultValue: "Present"
//   },
//   clock_in: {
//     type: DataTypes.STRING, // store exact timestamp
//     allowNull: true
//   },
//   clock_out: {
//     type: DataTypes.STRING, // store exact timestamp
//     allowNull: true
//   },
//   late: {
//     type: DataTypes.INTEGER,
//     defaultValue: 0
//   },
//   early_leaving: {
//     type: DataTypes.INTEGER,
//     defaultValue: 0
//   },
//   overtime: {
//     type: DataTypes.INTEGER,
//     defaultValue: 0
//   },
//  total_rest: {
//   type: DataTypes.INTEGER, // minutes or seconds
//   defaultValue: 0 // ✅ important!
//   },
//   created_by: {
//     type: DataTypes.INTEGER,
//     allowNull: true
//   }
// }, {
//   tableName: "attendance_employees",
//   timestamps: false
// });

// // AttendanceEmployee.belongsTo(Employee, { foreignKey: "employee_id" });
// AttendanceEmployee.belongsTo(Employee, { foreignKey: "employee_id", as: "employee" });

// module.exports = AttendanceEmployee;




const { DataTypes } = require("sequelize");
const {sequelize} = require("../config/database");
const Employee = require("./employee.model");
const Shift = require("./shift.model");
const AttendanceEmployee = sequelize.define("AttendanceEmployee", {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },

employee_id: {
    type: DataTypes.STRING(50), // store string code like "133"
    allowNull: false
  },
  shift_id: {
  type: DataTypes.BIGINT.UNSIGNED,
  allowNull: true,
  references: {
    model: "shifts",
    key: "id"
  },
  onDelete: "SET NULL"
},

  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM("Present", "Absent", "Leave","Half Day"),
    defaultValue: "Present"
  },
  clock_in: {
    type: DataTypes.STRING, // store exact timestamp
    allowNull: true
  },
  clock_out: {
    type: DataTypes.STRING, // store exact timestamp
    allowNull: true
  },
  late: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  early_leaving: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  overtime: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
 total_rest: {
  type: DataTypes.INTEGER, // minutes or seconds
  defaultValue: 0 // ✅ important!
  },
  reason: {
  type: DataTypes.STRING(500),
  allowNull: true,
  defaultValue: null
},

  created_by: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: "attendance_employees",
  timestamps: false
});

// AttendanceEmployee.belongsTo(Employee, { foreignKey: "employee_id" });
// AttendanceEmployee.belongsTo(Employee, { foreignKey: "employee_id", as: "employee" });
AttendanceEmployee.belongsTo(Employee, { foreignKey: "employee_id", targetKey: "employee_id", as: "employee" });

AttendanceEmployee.belongsTo(Shift, { foreignKey: "shift_id", as: "shift" });

module.exports = AttendanceEmployee;

