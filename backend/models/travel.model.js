module.exports = (sequelize, DataTypes) => {
const Travel = sequelize.define(
'Travel',
{
id: {
type: DataTypes.INTEGER,
autoIncrement: true,
primaryKey: true,
},
employee_id: {
type: DataTypes.INTEGER,
allowNull: false,
},
start_date: {
type: DataTypes.DATEONLY,
allowNull: false,
},
end_date: {
type: DataTypes.DATEONLY,
allowNull: false,
},
purpose: {
type: DataTypes.STRING,
allowNull: false,
},
place: {
type: DataTypes.STRING,
allowNull: false,
},
description: {
type: DataTypes.TEXT,
allowNull: true,
},
},
{
tableName: 'travels',
timestamps: true,
}
);

return Travel;
};

