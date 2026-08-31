// // const { DataTypes } = require('sequelize');
// // const sequelize = require('../config/database');

// // const Job = sequelize.define('Job', {
// // id: {
// // type: DataTypes.BIGINT.UNSIGNED,
// // autoIncrement: true,
// // primaryKey: true,
// // },
// // title: {
// // type: DataTypes.STRING,
// // allowNull: false,
// // },
// // description: {
// // type: DataTypes.TEXT,
// // allowNull: true,
// // },
// // requirement: {
// // type: DataTypes.TEXT,
// // allowNull: true,
// // },
// // branch: {
// // type: DataTypes.INTEGER,
// // allowNull: false,
// // },
// // category: {
// // type: DataTypes.INTEGER,
// // allowNull: false,
// // },
// // skill: {
// // type: DataTypes.TEXT,
// // allowNull: true,
// // },
// // position: {
// // type: DataTypes.INTEGER,
// // allowNull: true,
// // },
// // start_date: {
// // type: DataTypes.DATEONLY,
// // allowNull: true,
// // },
// // end_date: {
// // type: DataTypes.DATEONLY,
// // allowNull: true,
// // },
// // status: {
// // type: DataTypes.STRING,
// // allowNull: true,
// // },
// // applicant: {
// // type: DataTypes.STRING,
// // allowNull: true,
// // },
// // visibility: {
// // type: DataTypes.STRING,
// // allowNull: true,
// // },
// // code: {
// // type: DataTypes.STRING,
// // allowNull: true,
// // },
// // custom_question: {
// // type: DataTypes.STRING,
// // allowNull: true,
// // },
// // created_by: {
// // type: DataTypes.INTEGER,
// // allowNull: false,
// // },
// // }, {
// // tableName: 'jobs',
// // timestamps: true,
// // });

// // module.exports = Job;



// const { DataTypes } = require('sequelize');
// const sequelize = require('../config/database');

// const Job = sequelize.define('Job', {
// id: {
// type: DataTypes.BIGINT.UNSIGNED,
// autoIncrement: true,
// primaryKey: true,
// },
// title: {
// type: DataTypes.STRING(191),
// allowNull: false,
// },
// description: {
// type: DataTypes.TEXT,
// allowNull: true,
// },
// requirement: {
// type: DataTypes.TEXT,
// allowNull: true,
// },
// branch: {
// type: DataTypes.INTEGER,
// allowNull: false,
// defaultValue: 0,
// },
// category: {
// type: DataTypes.INTEGER,
// allowNull: false,
// defaultValue: 0,
// },
// skill: {
// type: DataTypes.TEXT,
// allowNull: true,
// },
// position: {
// type: DataTypes.INTEGER,
// allowNull: true,
// },
// start_date: {
// type: DataTypes.DATEONLY,
// allowNull: true,
// },
// end_date: {
// type: DataTypes.DATEONLY,
// allowNull: true,
// },
// status: {
// type: DataTypes.STRING(191),
// allowNull: true,
// },
// applicant: {
// type: DataTypes.STRING(191),
// allowNull: true,
// },
// visibility: {
// type: DataTypes.STRING(191),
// allowNull: true,
// },
// code: {
// type: DataTypes.STRING(191),
// allowNull: true,
// },
// custom_question: {
// type: DataTypes.STRING(191),
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
// tableName: 'jobs',
// timestamps: true,
// createdAt: 'created_at',
// updatedAt: 'updated_at',
// });

// module.exports = Job;




const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/database');

const Job = sequelize.define('Job', {
id: {
type: DataTypes.BIGINT.UNSIGNED,
autoIncrement: true,
primaryKey: true,
},
title: {
type: DataTypes.STRING(191),
allowNull: false,
},
description: {
type: DataTypes.TEXT,
allowNull: true,
},
requirement: {
type: DataTypes.TEXT,
allowNull: true,
},
branch: {
type: DataTypes.INTEGER,
allowNull: false,
defaultValue: 0,
},
category: {
type: DataTypes.INTEGER,
allowNull: false,
defaultValue: 0,
},
skill: {
type: DataTypes.TEXT,
allowNull: true,
},
position: {
type: DataTypes.INTEGER,
allowNull: true,
},
start_date: {
type: DataTypes.DATEONLY,
allowNull: true,
},
end_date: {
type: DataTypes.DATEONLY,
allowNull: true,
},
status: {
type: DataTypes.STRING(191),
allowNull: true,
},
applicant: {
type: DataTypes.STRING(191),
allowNull: true,
},
visibility: {
type: DataTypes.STRING(191),
allowNull: true,
},
code: {
type: DataTypes.STRING(191),
allowNull: true,
},
custom_question: {
type: DataTypes.STRING(191),
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
tableName: 'jobs',
timestamps: true,
createdAt: 'created_at',
updatedAt: 'updated_at',
});

module.exports = Job;

