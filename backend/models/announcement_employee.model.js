// const { DataTypes } = require('sequelize');
// const sequelize = require('../config/database');
// const Announcement = require('./announcement.model');
// const Employee = require('./employee.model');

// const AnnouncementEmployee = sequelize.define('AnnouncementEmployee', {
//   id: {
//     type: DataTypes.BIGINT.UNSIGNED,
//     primaryKey: true,
//     autoIncrement: true,
//   },
//   announcement_id: {
//     type: DataTypes.INTEGER,
//     allowNull: false,
//     references: {
//       model: 'announcements',
//       key: 'id',
//     },
//   },
//   employee_id: {
//     type: DataTypes.INTEGER,
//     allowNull: false,
//     references: {
//       model: 'employees',
//       key: 'id',
//     },
//   },
//   created_by: {
//     type: DataTypes.INTEGER,
//     allowNull: false,
//   },
//   created_at: {
//     type: DataTypes.DATE,
//     allowNull: true,
//   },
//   updated_at: {
//     type: DataTypes.DATE,
//     allowNull: true,
//   },
// }, {
//   tableName: 'announcement_employees',
//   timestamps: true,
//   createdAt: 'created_at',   // 🔥 Map timestamps correctly
//   updatedAt: 'updated_at',
// });

// Announcement.belongsToMany(Employee, {
//   through: AnnouncementEmployee,
//   foreignKey: 'announcement_id',
//   otherKey: 'employee_id',
// });

// Employee.belongsToMany(Announcement, {
//   through: AnnouncementEmployee,
//   foreignKey: 'employee_id',
//   otherKey: 'announcement_id',
// });

// module.exports = AnnouncementEmployee;










// models/announcementEmployee.model.js
// const { DataTypes } = require('sequelize');
// const sequelize = require('../config/database');
// const Announcement = require('./announcement.model');
// const Employee = require('./employee.model');

// const AnnouncementEmployee = sequelize.define('AnnouncementEmployee', {
//   id: {
//     type: DataTypes.BIGINT.UNSIGNED,
//     primaryKey: true,
//     autoIncrement: true
//   },
//   announcement_id: {
//     type: DataTypes.INTEGER,
//     allowNull: false
//   },
//   employee_id: {
//     type: DataTypes.INTEGER, // references employees.id
//     allowNull: false
//   },
//   created_by: {
//     type: DataTypes.INTEGER,
//     allowNull: false
//   },
//   created_at: {
//     type: DataTypes.DATE,
//     allowNull: true,
//     defaultValue: null
//   },
//   updated_at: {
//     type: DataTypes.DATE,
//     allowNull: true,
//     defaultValue: null
//   }
// }, {
//   tableName: 'announcement_employees',
//   timestamps: true,
//   createdAt: 'created_at',
//   updatedAt: 'updated_at'
// });

// // ✅ Associations
// AnnouncementEmployee.belongsTo(Announcement, {
//   foreignKey: 'announcement_id',
//   as: 'announcement'
// });

// AnnouncementEmployee.belongsTo(Employee, {
//   foreignKey: 'employee_id',
//   as: 'employee'
// });

// // You may also add reverse associations if needed:
// Announcement.hasMany(AnnouncementEmployee, {
//   foreignKey: 'announcement_id',
//   as: 'announcementEmployees'
// });

// Employee.hasMany(AnnouncementEmployee, {
//   foreignKey: 'employee_id',
//   as: 'employeeAnnouncements'
// });

// module.exports = AnnouncementEmployee;



// models/announcementEmployee.model.js
const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/database');

const AnnouncementEmployee = sequelize.define('AnnouncementEmployee', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  announcement_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  employee_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'announcement_employees',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = AnnouncementEmployee;







