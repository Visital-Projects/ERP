const { DataTypes } = require("sequelize");
const {sequelize} = require("../config/database");

const JobApplication = sequelize.define(
  "JobApplication",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    job: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(191),
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(191),
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING(191),
      allowNull: true,
    },
    profile: {
      type: DataTypes.STRING(191),
      allowNull: true,
    },
    resume: {
      type: DataTypes.STRING(191),
      allowNull: true,
    },
    cover_letter: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    dob: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    gender: {
      type: DataTypes.STRING(191),
      allowNull: true,
    },
    country: {
      type: DataTypes.STRING(191),
      allowNull: true,
    },
    state: {
      type: DataTypes.STRING(191),
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING(191),
      allowNull: true,
    },
    stage: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    skill: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    is_archive: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    // custom_question: {
    // type: DataTypes.TEXT,
    // allowNull: true,
    // },
    // custom_question: {
    //   type: DataTypes.STRING(191),
    //   allowNull: true,
    // },
    custom_question: {
        type: DataTypes.JSON,
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
  },
  {
    tableName: "job_applications",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = JobApplication;
