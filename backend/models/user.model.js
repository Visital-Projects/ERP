

const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/database');
const Role = require('./role.model');
const Permission = require('./permission.model');


// Pivot tables
const RoleUser = require('./roleuser.model');
const ModelHasPermission = require('./model_has_permissions.model');


const User = sequelize.define('User', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(191),
    allowNull: true,
  },
  email: {
    type: DataTypes.STRING(191),
    allowNull: false,
    unique: true,
  },
  email_verified_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  password: {
    type: DataTypes.STRING(191),
    allowNull: true,
  },
  plan: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  plan_expire_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  requested_plan: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  trial_plan: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  trial_expire_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  type: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  storage_limit: {
    type: DataTypes.DOUBLE,
    allowNull: false,
    defaultValue: 0,
  },
  avatar: {
    type: DataTypes.STRING(191),
    allowNull: false,
    defaultValue: 'uploads/avatars/avatar.png',
  },
  messenger_color: {
    type: DataTypes.STRING(191),
    allowNull: false,
    defaultValue: '#2180f3',
  },
  lang: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  default_pipeline: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  active_status: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: 0,
  },
  delete_status: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
  mode: {
    type: DataTypes.STRING(10),
    allowNull: false,
    defaultValue: 'light',
  },
  dark_mode: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: 0,
  },
  is_disable: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
  is_enable_login: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
  is_active: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
  referral_code: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  used_referral_code: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  commission_amount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  last_login_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  remember_token: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  is_email_verified: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: 0,
  },
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: true,
});



// ✅ Associations here
User.belongsToMany(Role, {
  through: RoleUser,
  foreignKey: 'model_id',    // user id
  otherKey: 'role_id',       // role id
  constraints: false,
  as: 'roles',
});

User.belongsToMany(Permission, {
  through: ModelHasPermission,
  foreignKey: 'model_id',       // user id
  otherKey: 'permission_id',    // permission id
  constraints: false,
  as: 'permissions',
});



module.exports = User;


