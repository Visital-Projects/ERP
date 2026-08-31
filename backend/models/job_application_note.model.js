// const { DataTypes } = require('sequelize');
// const sequelize = require('../config/database');

// const JobApplicationNote = sequelize.define('JobApplicationNote', {
// id: {
// type: DataTypes.BIGINT.UNSIGNED,
// autoIncrement: true,
// primaryKey: true,
// },
// application_id: {
// type: DataTypes.INTEGER,
// allowNull: false,
// },
// note_created: {
// type: DataTypes.INTEGER,
// allowNull: false,
// },
// note: {
// type: DataTypes.TEXT,
// allowNull: true,
// },
// created_by: {
// type: DataTypes.INTEGER,
// allowNull: false,
// },
// created_at: {
// type: DataTypes.DATE,
// allowNull: true,
// },
// updated_at: {
// type: DataTypes.DATE,
// allowNull: true,
// },
// }, {
// tableName: 'job_application_notes',
// timestamps: true,
// createdAt: 'created_at',
// updatedAt: 'updated_at',
// });

// module.exports = JobApplicationNote;



const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/database');
const JobApplication = require('./job_application.model'); // Import the JobApplication model

const JobApplicationNote = sequelize.define('JobApplicationNote', {
id: {
type: DataTypes.BIGINT.UNSIGNED,
autoIncrement: true,
primaryKey: true,
},
application_id: {
type: DataTypes.INTEGER,
allowNull: false,
},
note_created: {
type: DataTypes.INTEGER,
allowNull: false,
},
note: {
type: DataTypes.TEXT,
allowNull: true,
},
created_by: {
type: DataTypes.INTEGER,
allowNull: false,
},
created_at: {
type: DataTypes.DATE,
allowNull: true,
},
updated_at: {
type: DataTypes.DATE,
allowNull: true,
},
}, {
tableName: 'job_application_notes',
timestamps: true,
createdAt: 'created_at',
updatedAt: 'updated_at',
});

// Association: Each Note belongs to one Job Application
JobApplicationNote.belongsTo(JobApplication, {
foreignKey: 'application_id',
as: 'application',
});

module.exports = JobApplicationNote;

