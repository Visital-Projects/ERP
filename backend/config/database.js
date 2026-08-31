
const { Sequelize } = require("sequelize");
require("dotenv").config();

// ==========================
// 🟢 ERP DATABASE (TARGET)
// ==========================
const erpDB = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "mysql",
    logging: false,

    timezone: "+05:30",               // 🔥 IMPORTANT
    dialectOptions: {
      useUTC: false,                  // 🔥 IMPORTANT
    },

    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

// ==========================
// 🔵 DMPS DATABASE (SOURCE)
// ==========================
const dmpsDB = new Sequelize(
  process.env.DMPS_DB_NAME,
  process.env.DMPS_DB_USER,
  process.env.DMPS_DB_PASS,
  {
    host: process.env.DMPS_DB_HOST,
    port: process.env.DMPS_DB_PORT,
    dialect: "mysql",
    logging: false,

    timezone: "+05:30",               // 🔥 IMPORTANT
    dialectOptions: {
      useUTC: false,                  // 🔥 IMPORTANT
    },

    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

// ==========================
// 🔍 CONNECTION TEST
// ==========================
async function testConnections() {
  try {
    await erpDB.authenticate();
    console.log("✅ ERP DB connected");

    await dmpsDB.authenticate();
    console.log("✅ DMPS DB connected");
  } catch (err) {
    console.error("❌ DB Connection failed:", err.message);
    process.exit(1);
  }
}

module.exports = {
  sequelize: erpDB,
  erpDB,
  dmpsDB,
  testConnections,
};