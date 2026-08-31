// const { DataTypes } = require('sequelize');
// const sequelize = require('../config/database');
// const Branch = require('./branch.model');
// const Department = require('./department.model');
// const User = require('./user.model'); // employee

// const Announcement = sequelize.define('Announcement', {
//   id: {
//     type: DataTypes.BIGINT.UNSIGNED,
//     primaryKey: true,
//     autoIncrement: true
//   },
//   title: {
//     type: DataTypes.STRING(191),
//     allowNull: true
//   },
//   start_date: {
//     type: DataTypes.DATEONLY,
//     allowNull: false
//   },
//   end_date: {
//     type: DataTypes.DATEONLY,
//     allowNull: false
//   },
//   branch_id: {
//     type: DataTypes.INTEGER,
//     allowNull: false,
//     defaultValue: 0
//   },
//   department_id: {
//     type: DataTypes.STRING(191),
//     allowNull: false,
//     defaultValue: '0'
//   },
//   employee_id: {
//     type: DataTypes.STRING(191),
//     allowNull: false,
//     defaultValue: '0'
//   },
//   description: {
//     type: DataTypes.STRING(191),
//     allowNull: true
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
//   tableName: 'announcements',
// //   timestamps: true
// timestamps: true,
//   createdAt: 'created_at',
//   updatedAt: 'updated_at',
// });

// // ✅ Associations
// Announcement.belongsTo(Branch, {
//   foreignKey: 'branch_id',
//   as: 'branch'
// });

// Announcement.belongsTo(Department, {
//   foreignKey: 'department_id',
//   targetKey: 'id',
//   as: 'department'
// });

// Announcement.belongsTo(User, {
//   foreignKey: 'employee_id',
//   targetKey: 'id',
//   as: 'employee'
// });

// module.exports = Announcement;







const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/database');
const Branch = require('./branch.model');
const Department = require('./department.model');
// pivot model will be imported after definition to avoid circular dependency
const AnnouncementEmployee = require('./announcement_employee.model');
const Employee = require('./employee.model');


const Announcement = sequelize.define('Announcement', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(191),
    allowNull: true
  },
  start_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  end_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  branch_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  department_id: {
    type: DataTypes.STRING(191),  // stored as JSON string in Laravel
    allowNull: false,
    defaultValue: '0'
  },
  employee_id: {
    type: DataTypes.STRING(191),  // also stored as JSON string in Laravel
    allowNull: false,
    defaultValue: '0'
  },
  description: {
    type: DataTypes.STRING(191),
    allowNull: true
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  deleted_at: {               // 🔹 New soft delete column
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: null
  }
},  {
  tableName: 'announcements',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

// ✅ Associations
Announcement.belongsTo(Branch, {
  foreignKey: 'branch_id',
  as: 'branch'
});

Announcement.belongsTo(Department, {
  foreignKey: 'department_id',
  targetKey: 'id',
  as: 'department'
});
//--------------------------------------------------
// 🔑 Many-to-many
Announcement.belongsToMany(Employee, {
  through: AnnouncementEmployee,
  foreignKey: 'announcement_id',
  otherKey: 'employee_id',
  as: 'employees',
});

Employee.belongsToMany(Announcement, {
  through: AnnouncementEmployee,
  foreignKey: 'employee_id',
  otherKey: 'announcement_id',
  as: 'announcements',
});

module.exports = Announcement;

//--------------------------------------------------
// ❌ remove belongsTo(User) here
// ✅ instead: setup pivot relation in index.js or after importing models
// Announcement.belongsToMany(Employee, { 
//   through: AnnouncementEmployee, 
//   foreignKey: 'announcement_id', 
//   otherKey: 'employee_id', 
//   as: 'employees' 
// });