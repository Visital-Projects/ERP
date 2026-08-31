// const { DataTypes } = require('sequelize');
// const sequelize = require('../config/database');
// const Document = require('./document.model');
// const User = require('./user.model');

// const EmployeeDocument = sequelize.define('EmployeeDocument', {
//   id: {
//     type: DataTypes.BIGINT.UNSIGNED,
//     primaryKey: true,
//     autoIncrement: true,
//   },
//   employee_id: {
//     type: DataTypes.INTEGER,
//     allowNull: false,
//   },
//   document_id: {
//     type: DataTypes.INTEGER,
//     allowNull: false,
//   },
//   document_value: {
//     type: DataTypes.STRING(191),
//     allowNull: false,
//   },
//   created_by: {
//     type: DataTypes.INTEGER,
//     allowNull: true,
//   },
//   created_at: {
//     type: DataTypes.DATE,
//     allowNull: true,
//     defaultValue: null,
//   },
//   updated_at: {
//     type: DataTypes.DATE,
//     allowNull: true,
//     defaultValue: null,
//   },
// }, {
//   tableName: 'employee_documents',
//   timestamps: false,
// });

// // Associations
// EmployeeDocument.belongsTo(Document, {
//   foreignKey: 'document_id',
//   as: 'document'
// });

// EmployeeDocument.belongsTo(User, {
//   foreignKey: 'employee_id',
//   as: 'employee'
// });

// module.exports = EmployeeDocument;





const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/database');
const Document = require('./document.model');
const User = require('./user.model');

const EmployeeDocument = sequelize.define('EmployeeDocument', {
id: {
type: DataTypes.BIGINT.UNSIGNED,
primaryKey: true,
autoIncrement: true
},
employee_id: {
type: DataTypes.INTEGER,
allowNull: false
},
document_id: {
type: DataTypes.INTEGER,
allowNull: false
},
document_value: {
type: DataTypes.STRING(191),
allowNull: false
},
created_by: {
type: DataTypes.INTEGER,
allowNull: true
},
created_at: {
type: DataTypes.DATE,
allowNull: true,
defaultValue: null
},
updated_at: {
type: DataTypes.DATE,
allowNull: true,
defaultValue: null
}
}, {
tableName: 'employee_documents',
timestamps: false
});

EmployeeDocument.belongsTo(Document, { foreignKey: 'document_id', as: 'document' });
EmployeeDocument.belongsTo(User, { foreignKey: 'employee_id', as: 'employee' });

module.exports = EmployeeDocument;

