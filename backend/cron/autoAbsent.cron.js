
// const cron = require("node-cron");
// const dayjs = require("dayjs");
// const utc = require("dayjs/plugin/utc");
// const timezone = require("dayjs/plugin/timezone");
// dayjs.extend(utc);
// dayjs.extend(timezone);
// dayjs.tz.setDefault("Asia/Kolkata");

// const Employee = require("../models/employee.model");
// const AttendanceEmployee = require("../models/attendance.model");

// console.log("🟢 Auto-Absent Cron Loaded (TEST MODE - EVERY 5 SEC)");

// cron.schedule("*/5 * * * * *", async () => {
//   console.log("🚀 TEST Cron Running Every 5 Seconds");

//   try {
//     const today = dayjs().tz().format("YYYY-MM-DD");

//     const activeEmployees = await Employee.findAll({
//       where: { 
//         is_active: 1,
//         deleted_at: null,
//       },
//       attributes: ["employee_id", "name", "created_by", "biometric_emp_id"]
//     });

//     for (const emp of activeEmployees) {

//       // --------------------------------------------------
//       // 🚫 SKIP if biometric_emp_id is empty or not given
//       // --------------------------------------------------
//       if (
//         emp.biometric_emp_id === null ||
//         emp.biometric_emp_id === "" ||
//         emp.biometric_emp_id === "NULL" ||
//         (Array.isArray(emp.biometric_emp_id) && emp.biometric_emp_id.length === 0)
//       ) {
//         console.log(`⏸ SKIP (NO BIOMETRIC): ${emp.name}`);
//         continue;
//       }

//       // --------------------------------------------------
//       // ✔ Check today's attendance
//       // --------------------------------------------------
//       const attendance = await AttendanceEmployee.findOne({
//         where: { employee_id: emp.employee_id, date: today }
//       });

//       // --------------------------------------------------
//       // ❌ If no attendance → Mark Absent
//       // --------------------------------------------------
//       if (!attendance) {
//         await AttendanceEmployee.create({
//           employee_id: emp.employee_id,
//           shift_id: null,
//           date: today,
//           status: "Absent",
//           clock_in: "00:00:00",
//           clock_out: "00:00:00",
//           late: "00:00:00",
//           early_leaving: "00:00:00",
//           overtime: "00:00:00",
//           total_rest: 0,
//           created_by: emp.created_by
//         });

//         console.log(`❌ TEST ABSENT ADDED: ${emp.name} (${emp.employee_id})`);
//       } else {
//         console.log(`✔ Already Attendance: ${emp.name}`);
//       }
//     }

//   } catch (err) {
//     console.error("❌ TEST Cron Error:", err);
//   }
// });


// const cron = require("node-cron");
// const dayjs = require("dayjs");
// const utc = require("dayjs/plugin/utc");
// const timezone = require("dayjs/plugin/timezone");
// dayjs.extend(utc);
// dayjs.extend(timezone);
// dayjs.tz.setDefault("Asia/Kolkata");

// const Employee = require("../models/employee.model");
// const AttendanceEmployee = require("../models/attendance.model");

// console.log("🟢 Auto-Absent Cron Loaded (With biometric check)");

// cron.schedule("59 23 * * *", async () => {
//   console.log("⏳ Running Auto-Absent Cron at 11:59 PM");

//   try {
//     const today = dayjs().tz().format("YYYY-MM-DD");

//     const activeEmployees = await Employee.findAll({
//       where: { 
//         is_active: 1,
//         deleted_at: null,
//       },
//       attributes: ["employee_id", "name", "created_by", "biometric_emp_id"]
//     });

//     console.log(`👥 Total active employees: ${activeEmployees.length}`);

//     for (const emp of activeEmployees) {

//       // -----------------------------------------
//       // 🚫 SKIP if biometric_emp_id is empty/null
//       // -----------------------------------------
//       if (
//         emp.biometric_emp_id === null ||
//         emp.biometric_emp_id === "" ||
//         emp.biometric_emp_id === "NULL" ||
//         (Array.isArray(emp.biometric_emp_id) && emp.biometric_emp_id.length === 0)
//       ) {
//         console.log(`⏸ Skipped (No biometric): ${emp.name}`);
//         continue;
//       }

//       // -----------------------------------------
//       // ✔ Check Attendance
//       // -----------------------------------------
//       const attendance = await AttendanceEmployee.findOne({
//         where: { employee_id: emp.employee_id, date: today }
//       });

//       // ✔ If no attendance → Mark Absent
//       if (!attendance) {
//         await AttendanceEmployee.create({
//           employee_id: emp.employee_id,
//           shift_id: null,
//           date: today,
//           status: "Absent",
//           clock_in: "00:00:00",
//           clock_out: "00:00:00",
//           late: "00:00:00",
//           early_leaving: "00:00:00",
//           overtime: "00:00:00",
//           total_rest: 0,
//           created_by: emp.created_by
//         });

//         console.log(`❌ Marked Absent: ${emp.name}`);
//       }

//     }

//     console.log("✅ Auto-Absent Cron Completed Successfully");

//   } catch (err) {
//     console.error("❌ Cron Error:", err);
//   }
// });

const cron = require("node-cron");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Kolkata");

const Employee = require("../models/employee.model");
const AttendanceEmployee = require("../models/attendance.model");

console.log("🟢 Auto-Absent Smart Cron Loaded (Runs every minute)");

cron.schedule("* * * * *", async () => {
  try {
    const now = dayjs().tz("Asia/Kolkata");
    const currentTime = now.format("HH:mm");

    console.log("⏱ Cron Tick:", now.format("HH:mm:ss"));  // for testing

    if (currentTime !== "23:59") return;

    console.log("⏳ Running Auto-Absent at 11:59 PM IST...");

    const today = now.format("YYYY-MM-DD");

    const activeEmployees = await Employee.findAll({
      where: { is_active: 1, deleted_at: null },
      attributes: ["employee_id", "name", "created_by", "biometric_emp_id"]
    });

    for (const emp of activeEmployees) {
      if (!emp.biometric_emp_id || emp.biometric_emp_id === "NULL") {
        console.log(`⏸ SKIP (NO BIOMETRIC): ${emp.name}`);
        continue;
      }

      const attendance = await AttendanceEmployee.findOne({
        where: { employee_id: emp.employee_id, date: today }
      });

      if (!attendance) {
        await AttendanceEmployee.create({
          employee_id: emp.employee_id,
          shift_id: null,
          date: today,
          status: "Absent",
          clock_in: "00:00:00",
          clock_out: "00:00:00",
          late: "00:00:00",
          early_leaving: "00:00:00",
          overtime: "00:00:00",
          total_rest: 0,
          created_by: emp.created_by
        });

        console.log(`❌ ABSENT ADDED: ${emp.name} FOR DATE: ${today}`);
      }
    }

    console.log("✅ Auto-Absent 11:59 PM Task Finished");

  } catch (err) {
    console.error("❌ Cron Error:", err);
  }
});
