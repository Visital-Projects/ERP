



const Employee = require("../models/employee.model");
const AttendanceEmployee = require("../models/attendance.model");
const Shift = require("../models/shift.model");
const User = require("../models/user.model");
const Branch = require("../models/branch.model");
const Department = require("../models/department.model");
const Skill = require("../models/skill.model");
const Designation = require("../models/designation.model");
const Allowance = require("../models/allowance.model");
const Overtime = require("../models/overtime.model");


const { Op } = require("sequelize");
const dayjs = require("dayjs");
const customParseFormat = require("dayjs/plugin/customParseFormat");
dayjs.extend(customParseFormat);
const isSameOrBefore = require("dayjs/plugin/isSameOrBefore");
const isSameOrAfter = require("dayjs/plugin/isSameOrAfter");
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

// Add timezone handling (optional, ensures IST)
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Kolkata");
// ============================
// 🔹 Role helpers
// ============================
function isSuper(req) { return (req.user?.roles || []).some(r => (r.name || '').toLowerCase() === 'super admin'); }
function isCompany(req) { return (req.user?.type || '').toLowerCase() === 'company'; }
function isEmployee(req) { return (req.user?.type || '').toLowerCase() === 'employee'; }
function isBranchManager(req) { return (req.user?.type || '').toLowerCase() === 'branch manager'; }
function isDepartmentHead(req) {
  return (req.user?.type || '').toLowerCase() === 'department head';
}

// ============================
// 🔹 Helpers
// ============================
// async function getCompanyId(req) {
//   if (!req.user) return null;
//   const type = (req.user.type || "").toLowerCase();
//   if (['company', 'admin', 'super admin'].includes(type)) return req.user.id;
//   try {
//     const emp = await Employee.findOne({ where: { user_id: req.user.id }, attributes: ['created_by'], raw: true });
//     if (emp?.created_by) return Number(emp.created_by);
//   } catch (err) { console.error(err.message); }
//   return req.user.creator_id || req.user.id;
// }

async function getCompanyId(req) {
  try {
    if (!req.user) return null;
    
    // ???? Pehle check karo user khud company hai ya nahi
    const type = (req.user.type || '').toLowerCase();
    if (['company', 'admin', 'super admin'].includes(type)) {
      return req.user.id;
    }

    // ???? Agar employee hai (employees table mein entry hai)
    const emp = await Employee.findOne({
      where: { user_id: req.user.id },
      attributes: ['created_by'],
      raw: true,
    });
    if (emp?.created_by) return Number(emp.created_by);
    
    // ???? FIX: Branchless users (jaise accountant) ke liye users table se created_by lekar aao
    const userRecord = await User.findOne({
      where: { id: req.user.id },
      attributes: ['created_by'],
      raw: true,
    });
    
    console.log('???? User Record created_by:', userRecord?.created_by);
    return Number(userRecord?.created_by) || null;
    
  } catch (err) {
    console.error('getCompanyId Error:', err);
    return null;
  }
}

// async function getUserBranchId(userId) {
//   const emp = await Employee.findOne({ where: { user_id: userId }, attributes: ['branch_id'], raw: true });
//   return emp?.branch_id || null;
// }

async function getUserBranchId(userId) {
  if (!userId) return null;
  const emp = await Employee.findOne({
    where: { user_id: userId },
    attributes: ['branch_id'],
    raw: true,
  });
  return emp?.branch_id || null;
}

//-----------------------------------------------
// async function getUserEmployeeRecord(userId) {
//   return await Employee.findOne({
//     where: { user_id: userId, deleted_at: null },
//     attributes: ['branch_id', 'created_by'],
//     raw: true,
//   });
// }
//-----------------------------------------------


async function isCreatedByBranchManager(emp) {
  if (!emp?.created_by) return false;
  const creator = await User.findByPk(emp.created_by, { attributes: ['type'], raw: true });
  return creator && creator.type && creator.type.toLowerCase() === 'branch manager';
}

// async function getAllUserIdsUnderCompanyBranch(companyId, branchId) {
//   if (!companyId) return [];
//   const users = await User.findAll({ where: { created_by: companyId }, attributes: ['id'], raw: true });
//   const userIds = users.map(u => Number(u.id));
//   const baseSet = new Set([Number(companyId), ...userIds]);
//   if (branchId) {
//       //----------------------------------------------- new added
//     // if (userIds.length === 0) return [Number(companyId)];
//     //-----------------------------------------------

      
//     const emps = await Employee.findAll({ where: { user_id: { [Op.in]: userIds }, branch_id: branchId }, attributes: ['user_id'], raw: true });
//     const branchUserIds = emps.map(e => Number(e.user_id));
//     return [...new Set([Number(companyId), ...branchUserIds])];
//   }
//   return Array.from(baseSet);
// }


async function getAllUserIdsUnderCompanyBranch(companyId, branchId = null) {
  if (!companyId) return [];

  const users = await User.findAll({
    where: { created_by: companyId },
    attributes: ['id'],
    raw: true,
  });
  const userIds = users.map(u => Number(u.id));
  const baseSet = new Set([Number(companyId), ...userIds]);

  if (branchId) {
    if (userIds.length === 0) return [Number(companyId)];
    const emps = await Employee.findAll({
      where: {
        user_id: { [Op.in]: userIds },
        branch_id: branchId,
      },
      attributes: ['user_id'],
      raw: true
    });
    const branchUserIds = emps.map(e => Number(e.user_id));
    return [...new Set([Number(companyId), ...branchUserIds])];
  }

  return Array.from(baseSet);
}



function diffMinutes(t1, t2) { return Math.floor((t2.getTime() - t1.getTime()) / (1000 * 60)); }
function minutesToHHMMSS(minutes) { if (!minutes || minutes <= 0) return "00:00:00"; const h = String(Math.floor(minutes / 60)).padStart(2, "0"); const m = String(minutes % 60).padStart(2, "0"); return `${h}:${m}:00`; }

function timeToHours(time) {
  if (!time || time === "00:00:00") return 0;
  const [h, m, s] = time.split(":").map(Number);
  return h + m / 60 + s / 3600;
}


function timeToMinutes(time) {
  if (!time || time === "00:00:00") return 0;
  const [h, m, s] = time.split(":").map(Number);
  return h * 60 + m + Math.floor(s / 60);
}


// exports.verifyAttendanceByEmpId = async (req, res) => {
//   try {
//     const { empid } = req.params;
//     const { timestamp } = req.body;

//     if (!timestamp)
//       return res.status(400).json({ success: false, message: "Timestamp required" });

//     const now = dayjs.tz(timestamp, "Asia/Kolkata");
//     if (!now.isValid())
//       return res.status(400).json({ success: false, message: "Invalid timestamp format" });

//     const formattedTime = now.format("YYYY-MM-DD HH:mm:ss");
//     const today = now.format("YYYY-MM-DD");

//     // ============================
//     // 🔹 Find Employee
//     // ============================
//     const employee = await Employee.findOne({ where: { employee_id: empid } });
//     if (!employee)
//       return res.status(404).json({ success: false, message: "Employee not found" });

//     // 🔹 Branch config
//     const branch = await Branch.findByPk(employee.branch_id, {
//       attributes: ["name", "clock_out"]
//     });
//     const branchClockOutEnabled = branch?.clock_out ?? false;
//     const branchName = branch?.name || null;

//     // 🔹 Get Department
//     let departmentName = null, departmentId = null;
//     if (employee.department_id) {
//       const department = await Department.findByPk(employee.department_id, {
//         attributes: ["id", "name"],
//       });
//       departmentId = department?.id || null;
//       departmentName = department?.name || null;
//     }

//     // ✅ Validate biometric ID
//     if (!employee.biometric_emp_id || employee.biometric_emp_id === "NULL") {
//       return res.status(400).json({
//         success: false,
//         message: "Attendance not allowed: Employee has no biometric ID assigned",
//       });
//     }

//     // ============================
//     // 🔹 Auto Detect Shift (Clock-IN Only)
//     // ============================
//     // const allShifts = await Shift.findAll({ raw: true });
//     // let shift = null;

//     // for (const s of allShifts) {
//     //   let start = dayjs.tz(`${today} ${s.start_time}`, "Asia/Kolkata");
//     //   let end = dayjs.tz(`${today} ${s.end_time}`, "Asia/Kolkata");

//     //   if (end.isBefore(start)) {
//     //     if (now.isBefore(end)) start = start.subtract(1, "day");
//     //     else end = end.add(1, "day");
//     //   }

//     //   if (now.isSameOrAfter(start) && now.isSameOrBefore(end)) {
//     //     shift = s;
//     //     break;
//     //   }
//     // }

//     // if (!shift)
//     //   return res.status(400).json({ success: false, message: "No shift found for current time" });
    
//     const allShifts = await Shift.findAll({ raw: true });
//     let shift = null;
//     for (const s of allShifts) {
//       let start = dayjs.tz(`${today} ${s.start_time}`, "Asia/Kolkata");
//       let end = dayjs.tz(`${today} ${s.end_time}`, "Asia/Kolkata");
    
//       if (end.isBefore(start)) {
//         if (now.isBefore(end)) start = start.subtract(1, "day");
//         else end = end.add(1, "day");
//       }
    
//       // ✅ NEW FIX: 2-hour start window ONLY
//       const windowEnd = start.add(2, "hour");
    
//       if (now.isSameOrAfter(start) && now.isSameOrBefore(windowEnd)) {
//         shift = s;
//         break;
//       }
//     }

//     // ============================
//     // 🔹 RBAC Check
//     // ============================
//     if (!isSuper(req)) {
//       const companyId = await getCompanyId(req);
//       const branchId = await getUserBranchId(req.user.id);
//       if (!companyId)
//         return res.status(403).json({ success: false, message: "Unauthorized" });

//       if (isCompany(req)) {
//         const allowed = await getAllUserIdsUnderCompanyBranch(companyId, null);
//         if (!allowed.includes(employee.created_by))
//           return res.status(403).json({ success: false, message: "Forbidden" });
//       } else if (isBranchManager(req)) {
//         if (employee.branch_id !== branchId && employee.created_by !== req.user.id)
//           return res.status(403).json({ success: false, message: "Forbidden" });
//       } else if (isDepartmentHead(req)) {
//         if (employee.branch_id !== branchId)
//           return res.status(403).json({ success: false, message: "Forbidden" });

//         const creator = await User.findByPk(employee.created_by, {
//           attributes: ["type"], raw: true
//         });

//         const cType = creator?.type?.toLowerCase() || "";
//         if (!["branch manager", "company"].includes(cType))
//           return res.status(400).json({
//             success: false,
//             message: "Employee not created by Branch Manager / Company",
//           });
//       } else if (isEmployee(req)) {
//         return res.status(403).json({ success: false, message: "Employees cannot punch" });
//       }
//     }

//     // ============================
//     // ✅ Clock-in / Clock-out Logic
//     // ============================
//     const record = await AttendanceEmployee.findOne({
//       where: { employee_id: employee.employee_id, date: today },
//     });

//     // ✅ Branch allows Clock-Out → Handle both punches
//     if (branchClockOutEnabled) {
//       // ✅ If already clocked-in → Perform clock-out
//       if (record) {
//         if (record.clock_out !== "00:00:00") {
//           return res.status(400).json({
//             success: false,
//             message: "Already completed attendance for today",
//           });
//         }

//         const minWorkMinutes = 60; // 1 hour
//         const inTime = dayjs.tz(record.clock_in, "Asia/Kolkata");
//         const outTime = now;

//         const shiftInfo = await Shift.findByPk(record.shift_id, { raw: true });
//         const shiftStart = dayjs.tz(`${today} ${shiftInfo.start_time}`, "Asia/Kolkata");

//         let actualWorkedMinutes;
//         if (outTime.isBefore(inTime)) {
//           const nextDayOutTime = outTime.add(1, 'day');
//           actualWorkedMinutes = diffMinutes(inTime.toDate(), nextDayOutTime.toDate());
//         } else {
//           actualWorkedMinutes = diffMinutes(inTime.toDate(), outTime.toDate());
//         }

//         if (actualWorkedMinutes < minWorkMinutes) {
//           return res.status(400).json({
//             success: false,
//             message: `Clock-out not allowed before completing at least ${minWorkMinutes / 60} hour of work.`,
//           });
//         }

//         record.clock_out = formattedTime;

//         let totalWorkedMinutesFromShiftStart;
//         if (outTime.isBefore(shiftStart)) {
//           const nextDayOutTime = outTime.add(1, 'day');
//           totalWorkedMinutesFromShiftStart = diffMinutes(shiftStart.toDate(), nextDayOutTime.toDate());
//         } else {
//           totalWorkedMinutesFromShiftStart = diffMinutes(shiftStart.toDate(), outTime.toDate());
//         }

//         record.total_work = minutesToHHMMSS(actualWorkedMinutes);

//         let shiftEnd = dayjs.tz(`${today} ${shiftInfo.end_time}`, "Asia/Kolkata");
//         if (shiftEnd.isBefore(shiftStart)) {
//           shiftEnd = shiftEnd.add(1, 'day');
//         }
//         const shiftDurationMinutes = diffMinutes(shiftStart.toDate(), shiftEnd.toDate());
//         record.late = "00:00:00";

//         if (totalWorkedMinutesFromShiftStart < shiftDurationMinutes) {
//           const earlyLeavingMinutes = shiftDurationMinutes - totalWorkedMinutesFromShiftStart;
//           record.early_leaving = minutesToHHMMSS(earlyLeavingMinutes);
//           record.overtime = "00:00:00";
//         } else if (totalWorkedMinutesFromShiftStart > shiftDurationMinutes) {
//           const overtimeMinutes = totalWorkedMinutesFromShiftStart - shiftDurationMinutes;
//           record.overtime = minutesToHHMMSS(overtimeMinutes);
//           record.early_leaving = "00:00:00";
//         } else {
//           record.early_leaving = "00:00:00";
//           record.overtime = "00:00:00";
//         }

//         await record.save();

//         // 🧩 Auto Store Overtime into Overtime Table
//         if (record.overtime && record.overtime !== "00:00:00") {
//           const [h, m, s] = record.overtime.split(":").map(Number);
//           const overtimeHours = parseFloat((h + m / 60 + s / 3600).toFixed(2));
//           const convertedDays = parseFloat((overtimeHours / 8).toFixed(2));

//           const dateObj = new Date(record.date);
//           const total_days_in_month = new Date(dateObj.getFullYear(), dateObj.getMonth() + 1, 0).getDate();

//           const monthly_salary = employee.salary || 0;
//           const daily_rate = parseFloat((monthly_salary / total_days_in_month).toFixed(2));
//           const ot_amount = parseFloat((daily_rate * convertedDays).toFixed(2));

//           let overtimeRecord = await Overtime.findOne({
//             where: {
//               employee_id: employee.employee_id,
//               date: record.date,
//               deleted_at: null,
//             },
//           });

//           if (!overtimeRecord) {
//             await Overtime.create({
//               employee_id: employee.employee_id,
//               date: record.date,
//               title: "Automatic Overtime Entry",
//               number_of_days: convertedDays,
//               hours: overtimeHours,
//               rate: daily_rate,
//               ot_amount,
//               type: "Auto",
//               created_by: req.user?.id || null,
//             });
//           } else {
//             await overtimeRecord.update({
//               hours: overtimeHours,
//               number_of_days: convertedDays,
//               rate: daily_rate,
//               ot_amount,
//               type: "Auto",
//             });
//           }
//         }

//         // 🧩 MONTHLY EXTRA OVERTIME LOGIC (after 26 attendances)
//         const attendanceMonth = now.format("YYYY-MM");
//         const totalMonthlyAttendance = await AttendanceEmployee.count({
//           where: {
//             employee_id: employee.employee_id,
//             date: { [Op.like]: `${attendanceMonth}-%` },
//             status: "Present"
//           }
//         });

//         if (totalMonthlyAttendance > 26) {
//           const extraDays = totalMonthlyAttendance - 26;
//           const dateObj = new Date(record.date);
//           const total_days_in_month = new Date(dateObj.getFullYear(), dateObj.getMonth() + 1, 0).getDate();

//           const monthly_salary = employee.salary || 0;
//           const daily_rate = parseFloat((monthly_salary / total_days_in_month).toFixed(2));
//           const ot_amount = parseFloat((daily_rate * extraDays).toFixed(2));

//           let monthlyOvertimeRecord = await Overtime.findOne({
//             where: {
//               employee_id: employee.employee_id,
//               title: "Monthly Extra Attendance",
//               deleted_at: null,
//               date: { [Op.like]: `${attendanceMonth}-%` },
//             },
//           });

//           if (!monthlyOvertimeRecord) {
//             await Overtime.create({
//               employee_id: employee.employee_id,
//               date: record.date,
//               title: "Monthly Extra Attendance",
//               number_of_days: extraDays,
//               hours: extraDays * 8,
//               rate: daily_rate,
//               ot_amount,
//               type: "Monthly Auto",
//               created_by: req.user?.id || null,
//             });
//           } else {
//             await monthlyOvertimeRecord.update({
//               number_of_days: extraDays,
//               hours: extraDays * 8,
//               rate: daily_rate,
//               ot_amount,
//               type: "Monthly Auto",
//             });
//           }
//         }

//         // ✅ Return Response
//         const shiftDetails = await Shift.findByPk(record.shift_id, {
//           attributes: ["id", "title", "start_time", "end_time"],
//           raw: true
//         });

//         const empData = {
//           id: employee.id,
//           name: employee.name,
//           employee_id: employee.employee_id,
//           branch_id: employee.branch_id,
//           branch_name: branchName,
//           department_id: departmentId,
//           department_name: departmentName,
//           created_by: employee.created_by
//         };

//         return res.json({
//           success: true,
//           message: "Clock-out recorded successfully",
//           data: {
//             id: record.id,
//             date: record.date,
//             shift: shiftDetails,
//             status: record.status,
//             clock_in: record.clock_in,
//             clock_out: record.clock_out,
//             late: record.late,
//             early_leaving: record.early_leaving,
//             overtime: record.overtime,
//             employee: empData
//           }
//         });
//       }
//     } else {
//       if (record) {
//         return res.status(400).json({
//           success: false,
//           message: "Already clocked in today",
//         });
//       }
//     }

//     // ============================
//     // ✅ Create Clock-In
//     // ============================
//     const attendance = await AttendanceEmployee.create({
//       employee_id: employee.employee_id,
//       shift_id: shift.id,
//       date: today,
//       status: "Present",
//       clock_in: formattedTime,
//       clock_out: "00:00:00",
//       late: "00:00:00",
//       early_leaving: "00:00:00",
//       overtime: "00:00:00",
//       total_rest: 0,
//       created_by: req.user?.id || null,
//     });

//     return res.json({
//       success: true,
//       message: "Clock-in recorded successfully",
//       data: {
//         id: attendance.id,
//         date: attendance.date,
//         shift: {
//           id: shift.id,
//           title: shift.title,
//           start_time: shift.start_time,
//           end_time: shift.end_time,
//         },
//         status: attendance.status,
//         clock_in: attendance.clock_in,
//         clock_out: attendance.clock_out,
//         employee: {
//           id: employee.id,
//           name: employee.name,
//           employee_id: employee.employee_id,
//           branch_id: employee.branch_id,
//           branch_name: branchName,
//           department_id: departmentId,
//           department_name: departmentName,
//           created_by: employee.created_by,
//         },
//       },
//     });

//   } catch (err) {
//     console.error("Verify Attendance Error:", err);
//     res.status(500).json({ success: false, error: err.message });
//   }
// };

exports.verifyAttendanceByEmpId = async (req, res) => {
  try {
    const { empid } = req.params;
    const { timestamp } = req.body;

    if (!timestamp) {
      return res.status(400).json({
        success: false,
        message: "Timestamp required",
      });
    }

    const now = dayjs.tz(timestamp, "Asia/Kolkata");
    if (!now.isValid()) {
      return res.status(400).json({
        success: false,
        message: "Invalid timestamp format",
      });
    }

    const today = now.format("YYYY-MM-DD");
    const yesterday = now.subtract(1, "day").format("YYYY-MM-DD");

    const employee = await Employee.findOne({
      where: { employee_id: empid },
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    // ============================
    // 🔥 STEP 1: FIND OPEN CLOCK-IN FROM PREVIOUS DATE
    // ============================
    const previousOpen = await AttendanceEmployee.findOne({
      where: {
        employee_id: employee.employee_id,
        date: yesterday,
        clock_out: "00:00:00",
        open_shift_flag: 1,
        clock_in: { [Op.ne]: "00:00:00" }, // ❌ absent safe
      },
      order: [["id", "DESC"]],
    });

    // ============================
    // ✅ CLOCK-OUT (PRIORITY)
    // ============================
    if (previousOpen) {
      const inTime = dayjs.tz(
        `${previousOpen.date} ${previousOpen.clock_in}`,
        "Asia/Kolkata"
      );

      const workedMinutes = diffMinutes(
        inTime.toDate(),
        now.toDate()
      );

      if (workedMinutes < 60) {
        return res.status(400).json({
          success: false,
          message: "Minimum 1 hour required before clock-out",
        });
      }

      previousOpen.clock_out = now.format("HH:mm:ss");
      previousOpen.open_shift_flag = 0;
      previousOpen.total_work = minutesToHHMMSS(workedMinutes);

      const shift = await Shift.findByPk(previousOpen.shift_id, { raw: true });

      if (shift) {
        let shiftStart = dayjs.tz(
          `${previousOpen.date} ${shift.start_time}`,
          "Asia/Kolkata"
        );
        let shiftEnd = dayjs.tz(
          `${previousOpen.date} ${shift.end_time}`,
          "Asia/Kolkata"
        );

        if (shiftEnd.isBefore(shiftStart)) {
          shiftEnd = shiftEnd.add(1, "day");
        }

        const shiftMinutes = diffMinutes(
          shiftStart.toDate(),
          shiftEnd.toDate()
        );

        if (workedMinutes > shiftMinutes) {
          previousOpen.overtime = minutesToHHMMSS(
            workedMinutes - shiftMinutes
          );
          previousOpen.early_leaving = "00:00:00";
        } else {
          previousOpen.overtime = "00:00:00";
          previousOpen.early_leaving = minutesToHHMMSS(
            shiftMinutes - workedMinutes
          );
        }
      }

      await previousOpen.save();
     


      return res.json({
        success: true,
        message: "Clock-out recorded against previous day",
      });
    }

    // ============================
    // 🔒 STEP 2: BLOCK DOUBLE IN SAME DAY
    // ============================
    const todayOpen = await AttendanceEmployee.findOne({
      where: {
        employee_id: employee.employee_id,
        date: today,
        clock_out: "00:00:00",
        open_shift_flag: 1,
      },
    });

    if (todayOpen) {
      return res.status(400).json({
        success: false,
        message: "Already clocked in today. Please clock-out first.",
      });
    }

    // ============================
    // ✅ STEP 3: CLOCK-IN (NEW DAY)
    // ============================
    const shifts = await Shift.findAll({ raw: true });
    let matchedShift = null;

    for (const s of shifts) {
      const shiftStart = dayjs.tz(
        `${today} ${s.start_time}`,
        "Asia/Kolkata"
      );
      const windowEnd = shiftStart.add(2, "hour");

      if (
        now.isSameOrAfter(shiftStart) &&
        now.isSameOrBefore(windowEnd)
      ) {
        matchedShift = s;
        break;
      }
    }

    if (!matchedShift) {
      return res.status(400).json({
        success: false,
        message: "Clock-in outside allowed shift window",
      });
    }

    await AttendanceEmployee.create({
      employee_id: employee.employee_id,
      shift_id: matchedShift.id,
      date: today,
      status: "Present",
      clock_in: now.format("HH:mm:ss"),
      clock_out: "00:00:00",
      open_shift_flag: 1,
      late: "00:00:00",
      early_leaving: "00:00:00",
      overtime: "00:00:00",
      total_rest: 0,
      created_by: req.user?.id || null,
    });

    return res.json({
      success: true,
      message: "Clock-in recorded successfully",
    });

  } catch (err) {
    console.error("Verify Attendance Error:", err);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};



exports.getAllAttendances = async (req, res) => {
  try {
    console.log('🎯 START getAllAttendances');
    console.log('🔍 User Info - ID:', req.user.id, 'Type:', req.user.type);

    // 🟢 SUPER ADMIN: Full access
    if (isSuper(req)) {
      console.log('🟡 Super Admin Access');
      const attendances = await AttendanceEmployee.findAll({
        include: [
          {
            model: Employee,
            as: "employee",
            attributes: ["id","name","employee_id","branch_id","department_id","employee_type","created_by"],
            where: { deleted_at: null }, // Only employees not deleted
            include: [
              { model: Branch, as: "branch", attributes: ["name"] },
              { model: Department, as: "department", attributes: ["name"] }
            ]
          },
          { model: Shift, as: "shift", attributes: ["id","title","start_time","end_time","break_minutes"] }
        ],
        order: [["date", "DESC"]]
      });
      
      console.log('🟡 Super Admin Attendances Count:', attendances.length);
      const data = attendances.map(a => ({
        id: a.id,
        date: a.date,
        status: a.status,
        clock_in: a.clock_in,
        clock_out: a.clock_out,
        late: a.late,
        early_leaving: a.early_leaving,
        overtime: a.overtime,
        total_rest: a.total_rest,
        reason: a.reason || null,
        created_by: a.created_by,
        shift: a.shift ? {
          id: a.shift.id,
          title: a.shift.title,
          start_time: a.shift.start_time,
          end_time: a.shift.end_time,
          break_minutes: a.shift.break_minutes
        } : null,
        employee: {
          id: a.employee.id,
          name: a.employee.name,
          employee_id: a.employee.employee_id,
          branch_id: a.employee.branch_id,
          department_id: a.employee.department_id,
          branch_name: a.employee.branch?.name || null,
          department_name: a.employee.department?.name || null,
          employee_type: a.employee.employee_type || "Permanent",
          created_by: a.employee.created_by
        }
      }));
      return res.json({ success: true, data });
    }

    // 🟢 Check if user exists in employees table (has branch)
    const userEmployeeRecord = await Employee.findOne({
      where: { user_id: req.user.id },
      attributes: ['branch_id', 'created_by'],
      raw: true,
    });

    console.log('🔍 User Employee Record:', userEmployeeRecord);

    let attendances = [];

    if (userEmployeeRecord && userEmployeeRecord.branch_id) {
      // 🟢 CASE 1: User has employee record with branch → BRANCH-LEVEL ACCESS
      console.log('🟡 Branch User Access');
      const branchId = userEmployeeRecord.branch_id;
      console.log('🔍 Branch ID:', branchId);
      
      // Get company ID for branch users
      const companyId = await getCompanyId(req);
      console.log('🔍 Company ID for Branch User:', companyId);
      
      if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

      // 🟢 STEP 1: Get ALL EMPLOYEES in the same branch under this company
      const branchEmployees = await Employee.findAll({
        where: {
          branch_id: branchId,
          deleted_at: null,
        },
        attributes: ['employee_id'],
        raw: true,
      });

      const branchEmployeeIds = branchEmployees.map(e => String(e.employee_id));
      console.log('🔍 Branch Employee IDs:', branchEmployeeIds);

      if (branchEmployeeIds.length === 0) {
        console.log('🔍 No employees found in this branch');
        return res.json({ success: true, data: [] });
      }

      // 🟢 STEP 2: Fetch attendances for employees in the same branch
      attendances = await AttendanceEmployee.findAll({
        where: {
          employee_id: { [Op.in]: branchEmployeeIds },
        },
        include: [
          {
            model: Employee,
            as: "employee",
            attributes: ["id","name","employee_id","branch_id","department_id","employee_type","created_by"],
            where: { deleted_at: null }, // Only employees not deleted
            include: [
              { model: Branch, as: "branch", attributes: ["name"] },
              { model: Department, as: "department", attributes: ["name"] }
            ]
          },
          { model: Shift, as: "shift", attributes: ["id","title","start_time","end_time","break_minutes"] }
        ],
        order: [["date", "DESC"]]
      });

      console.log('🔍 Branch User Attendances Count:', attendances.length);

    } else {
      // 🟢 CASE 2: User doesn't have employee record (no branch) → COMPANY ACCESS
      console.log('🟡 Branchless User Access (COMPANY ACCESS)');
      
      const companyId = await getCompanyId(req);
      console.log('🔍 Company ID for Branchless User:', companyId);
      
      if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

      // 🟢 STEP 1: Get ALL EMPLOYEES under this company
      const allowedUserIds = await getAllUserIdsUnderCompanyBranch(companyId, null);
      console.log('🔍 Allowed User IDs:', allowedUserIds);

      const companyEmployees = await Employee.findAll({
        where: {
          created_by: { [Op.in]: allowedUserIds },
          deleted_at: null,
        },
        attributes: ['employee_id'],
        raw: true,
      });

      const companyEmployeeIds = companyEmployees.map(e => String(e.employee_id));
      console.log('🔍 Company Employee IDs:', companyEmployeeIds);

      if (companyEmployeeIds.length === 0) {
        console.log('🔍 No employees found in this company');
        return res.json({ success: true, data: [] });
      }

      // 🟢 STEP 2: Fetch attendances for employees in the company
      attendances = await AttendanceEmployee.findAll({
        where: {
          employee_id: { [Op.in]: companyEmployeeIds },
        },
        include: [
          {
            model: Employee,
            as: "employee",
            attributes: ["id","name","employee_id","branch_id","department_id","employee_type","created_by"],
            where: { deleted_at: null }, // Only employees not deleted
            include: [
              { model: Branch, as: "branch", attributes: ["name"] },
              { model: Department, as: "department", attributes: ["name"] }
            ]
          },
          { model: Shift, as: "shift", attributes: ["id","title","start_time","end_time","break_minutes"] }
        ],
        order: [["date", "DESC"]]
      });
      
      console.log('🔍 Branchless User - Company Attendances Count:', attendances.length);
    }

    console.log('🔍 Final Attendances Count:', attendances.length);
    
    const data = attendances.map(a => ({
      id: a.id,
      date: a.date,
      status: a.status,
      clock_in: a.clock_in,
      clock_out: a.clock_out,
      late: a.late,
      early_leaving: a.early_leaving,
      overtime: a.overtime,
      total_rest: a.total_rest,
      reason: a.reason || null,
      created_by: a.created_by,
      shift: a.shift ? {
        id: a.shift.id,
        title: a.shift.title,
        start_time: a.shift.start_time,
        end_time: a.shift.end_time,
        break_minutes: a.shift.break_minutes
      } : null,
      employee: {
        id: a.employee.id,
        name: a.employee.name,
        employee_id: a.employee.employee_id,
        branch_id: a.employee.branch_id,
        department_id: a.employee.department_id,
        branch_name: a.employee.branch?.name || null,
        department_name: a.employee.department?.name || null,
        employee_type: a.employee.employee_type || "Permanent",
        created_by: a.employee.created_by
      }
    }));
    
    console.log('✅ END getAllAttendances - Success');
    return res.json({ success: true, data });

  } catch (err) {
    console.error('❌ Get All Attendances Error:', err);
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

exports.getAttendanceById = async (req, res) => {
  try {
    console.log('🎯 START getAttendanceById');
    console.log('🔍 User Info - ID:', req.user.id, 'Type:', req.user.type);
    
    const { id } = req.params;
    
    const attendance = await AttendanceEmployee.findOne({
      where: { id: id },
      include: [
        {
          model: Employee,
          as: "employee",
          attributes: ["id","name","employee_id","branch_id","department_id","created_by"],
          where: { deleted_at: null }, // Only employees not deleted
          include: [
            { model: Branch, as: "branch", attributes: ["name"] },
            { model: Department, as: "department", attributes: ["name"] }
          ]
        },
        { model: Shift, as: "shift", attributes: ["id","title","start_time","end_time","break_minutes"] }
      ]
    });

    if (!attendance) {
      return res.status(404).json({ success: false, message: "Attendance not found" });
    }

    // 🟢 Super Admin → full access
    if (isSuper(req)) {
      const data = {
        id: attendance.id,
        date: attendance.date,
        status: attendance.status,
        clock_in: attendance.clock_in,
        clock_out: attendance.clock_out,
        late: attendance.late,
        early_leaving: attendance.early_leaving,
        overtime: attendance.overtime,
        total_rest: attendance.total_rest,
        reason: attendance.reason || null,
        created_by: attendance.created_by,
        shift: attendance.shift || null,
        employee: {
          id: attendance.employee.id,
          name: attendance.employee.name,
          employee_id: attendance.employee.employee_id,
          branch_id: attendance.employee.branch_id,
          department_id: attendance.employee.department_id,
          branch_name: attendance.employee.branch?.name || null,
          department_name: attendance.employee.department?.name || null,
          created_by: attendance.employee.created_by
        }
      };
      return res.json({ success: true, data });
    }

    // 🟢 Check if user exists in employees table (has branch)
    const userEmployeeRecord = await Employee.findOne({
      where: { user_id: req.user.id },
      attributes: ['branch_id', 'created_by'],
      raw: true,
    });

    console.log('🔍 User Employee Record:', userEmployeeRecord);

    if (userEmployeeRecord && userEmployeeRecord.branch_id) {
      // 🟢 CASE 1: User has employee record with branch → BRANCH-LEVEL ACCESS
      const companyId = await getCompanyId(req);
      if (!companyId) {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
      }

      // 🟢 STEP 1: Get the employee linked to the attendance
      const attendanceEmployee = await Employee.findOne({
        where: { employee_id: String(attendance.employee_id), deleted_at: null },
        raw: true,
      });

      if (!attendanceEmployee) {
        return res.status(404).json({ success: false, message: 'Employee linked to attendance not found' });
      }

      // 🟢 STEP 2: Check if the attendance employee belongs to the same branch as the current user
      const employeeBranchId = attendanceEmployee.branch_id || null;
      
      console.log('🔍 Attendance Employee Branch ID:', employeeBranchId);
      console.log('🔍 Current User Branch ID:', userEmployeeRecord.branch_id);

      if (String(employeeBranchId) !== String(userEmployeeRecord.branch_id)) {
        return res.status(403).json({ success: false, message: 'Forbidden: attendance belongs to different branch' });
      }

    } else {
      // 🟢 CASE 2: User doesn't have employee record (no branch) → COMPANY ACCESS
      console.log('🟡 Branchless User - Company attendance access');
      
      const companyId = await getCompanyId(req);
      if (!companyId) {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
      }

      // 🟢 Check if attendance belongs to company
      const allowedUserIds = await getAllUserIdsUnderCompanyBranch(companyId, null);
      
      const attendanceEmployee = await Employee.findOne({
        where: { employee_id: String(attendance.employee_id), deleted_at: null },
        raw: true,
      });

      if (!attendanceEmployee) {
        return res.status(404).json({ success: false, message: 'Employee linked to attendance not found' });
      }

      if (!allowedUserIds.map(String).includes(String(attendanceEmployee.created_by))) {
        return res.status(403).json({ success: false, message: 'Forbidden: attendance not in your company scope' });
      }
    }

    // ✅ Return formatted attendance
    const data = {
      id: attendance.id,
      date: attendance.date,
      status: attendance.status,
      clock_in: attendance.clock_in,
      clock_out: attendance.clock_out,
      late: attendance.late,
      early_leaving: attendance.early_leaving,
      overtime: attendance.overtime,
      total_rest: attendance.total_rest,
      reason: attendance.reason || null,
      created_by: attendance.created_by,
      shift: attendance.shift || null,
      employee: {
        id: attendance.employee.id,
        name: attendance.employee.name,
        employee_id: attendance.employee.employee_id,
        branch_id: attendance.employee.branch_id,
        department_id: attendance.employee.department_id,
        branch_name: attendance.employee.branch?.name || null,
        department_name: attendance.employee.department?.name || null,
        created_by: attendance.employee.created_by
      }
    };
    
    console.log('✅ END getAttendanceById - Success');
    return res.json({ success: true, data });

  } catch (err) {
    console.error('❌ Get Attendance By ID Error:', err);
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

exports.updateEarlyLeaving = async (req, res) => {
  try {
    const { empid } = req.params;
    const { date, clock_out, reason } = req.body || {};

    if (!empid || !date || !clock_out)
      return res.status(400).json({
        success: false,
        message: "empid, date, and clock_out are required",
      });

    // ✅ Normalize clock_out
    let formattedClockOut = clock_out;
    if (/^\d{2}:\d{2}:\d{2}$/.test(clock_out)) {
      formattedClockOut = `${date} ${clock_out}`;
    } else if (!/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(clock_out)) {
      return res.status(400).json({
        success: false,
        message:
          "clock_out must be in either 'YYYY-MM-DD HH:mm:ss' or 'HH:mm:ss' format",
      });
    }

    const employee = await Employee.findOne({ where: { employee_id: empid } });
    if (!employee)
      return res
        .status(404)
        .json({ success: false, message: "Employee not found" });

    // 🔒 RBAC
    if (!isSuper(req)) {
      const branchId = await getUserBranchId(req.user.id);

      if (isEmployee(req))
        return res
          .status(403)
          .json({ success: false, message: "Employees cannot update attendance" });

      if (isBranchManager(req)) {
        if (employee.branch_id !== branchId && employee.created_by !== req.user.id)
          return res
            .status(403)
            .json({
              success: false,
              message: "Forbidden: Not your branch or created employee",
            });
      }

      if (isCompany(req)) {
        const companyId = await getCompanyId(req);
        const allowed = await getAllUserIdsUnderCompanyBranch(companyId, null);
        if (!allowed.includes(employee.created_by))
          return res.status(403).json({ success: false, message: "Forbidden" });
      }
    }

    const attendance = await AttendanceEmployee.findOne({
      where: { employee_id: employee.employee_id, date },
      include: [{ model: Shift, as: "shift" }],
    });

    if (!attendance)
      return res
        .status(404)
        .json({ success: false, message: "Attendance not found for this date" });

    // 🚫 Prevent conflict: if overtime already exists
    if (attendance.overtime && attendance.overtime !== "00:00:00") {
      return res.status(400).json({
        success: false,
        message:
          "Cannot mark early leaving because overtime is already recorded for this date.",
      });
    }

    // ==========================
    // ✅ Shift Time Validation
    // ==========================
    const shiftStartTime = attendance.shift?.start_time || "09:00:00";
    let shiftEndTime = attendance.shift?.end_time || "17:00:00";

    let shiftStart = dayjs(`${date} ${shiftStartTime}`);
    let shiftEnd = dayjs(`${date} ${shiftEndTime}`);

    // ✅ Handle cross-midnight shifts (e.g. 23:00–07:00)
    if (shiftEnd.isBefore(shiftStart)) {
      shiftEnd = shiftEnd.add(1, "day"); // shift ends next day
    }

    // ✅ Parse actual clock_out and handle next-day punches correctly
    let actualClockOut = dayjs(formattedClockOut);
    if (actualClockOut.isBefore(shiftStart)) {
      // If clock-out is before shift start (e.g., 04:00 for 23:00–07:00),
      // treat it as next day
      actualClockOut = actualClockOut.add(1, "day");
    }

    // 🚫 Validate — if after shift end → reject
    if (actualClockOut.isAfter(shiftEnd)) {
      return res.status(400).json({
        success: false,
        message: `Invalid clock-out: cannot be after shift end (${shiftEndTime}).`,
      });
    }

    // ✅ If before shift end → calculate early leaving
    let earlyLeavingMinutes = 0;
    if (actualClockOut.isBefore(shiftEnd)) {
      earlyLeavingMinutes = shiftEnd.diff(actualClockOut, "minute");
    }

    const formatMinutesToTime = (mins) => {
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`;
    };

    const formattedEarlyLeaving = formatMinutesToTime(earlyLeavingMinutes);

    await AttendanceEmployee.update(
      {
        clock_out: actualClockOut.format("YYYY-MM-DD HH:mm:ss"),
        early_leaving: formattedEarlyLeaving,
        reason: reason || null,
        updated_at: new Date(),
      },
      { where: { id: attendance.id }, individualHooks: true }
    );

    const updatedAttendance = await AttendanceEmployee.findByPk(attendance.id, {
      include: [{ model: Shift, as: "shift" }],
    });

    const branch = await Branch.findByPk(employee.branch_id);
    const department = await Department.findByPk(employee.department_id);

    res.json({
      success: true,
      message: `Early leaving updated for ${employee.name} on ${date}`,
      data: [
        {
          id: updatedAttendance.id,
          date: updatedAttendance.date,
          status: updatedAttendance.status,
          clock_in: updatedAttendance.clock_in,
          clock_out: updatedAttendance.clock_out,
          late: updatedAttendance.late,
          early_leaving: updatedAttendance.early_leaving,
          overtime: updatedAttendance.overtime,
          total_rest: updatedAttendance.total_rest,
          reason: updatedAttendance.reason,
          created_by: updatedAttendance.created_by,
          shift: {
            id: updatedAttendance.shift.id,
            title: updatedAttendance.shift.title,
            start_time: updatedAttendance.shift.start_time,
            end_time: updatedAttendance.shift.end_time,
            break_minutes: updatedAttendance.shift.break_minutes,
          },
          employee: {
            id: employee.id,
            name: employee.name,
            employee_id: employee.employee_id,
            branch_id: employee.branch_id,
            department_id: employee.department_id,
            branch_name: branch?.name || null,
            department_name: department?.name || null,
            employee_type: employee.employee_type,
            created_by: employee.created_by,
          },
        },
      ],
    });
  } catch (err) {
    console.error("Update Early Leaving Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// const Overtime = require("../models/overtime.model");


// exports.updateOvertime = async (req, res) => {
//   try {
//     const { empid } = req.params; // This is "133"
//     const { date, clock_out, reason } = req.body;

//     // 🔹 Basic validation
//     if (!empid || !date || !clock_out) {
//       return res.status(400).json({
//         success: false,
//         message: "empid, date, and clock_out are required",
//       });
//     }

//     // 🔹 Validate HH:MM:SS format
//     const timePattern = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])$/;
//     if (!timePattern.test(clock_out)) {
//       return res.status(400).json({
//         success: false,
//         message: "Clock_out must be in HH:MM:SS format",
//       });
//     }

//     // 🔍 Find employee by employee_id (like "133")
//     const employee = await Employee.findOne({ where: { employee_id: empid } });
//     if (!employee) {
//       return res.status(404).json({ success: false, message: "Employee not found" });
//     }

//     // 🔒 RBAC checks
//     if (!isSuper(req)) {
//       const branchId = await getUserBranchId(req.user.id);

//       if (isEmployee(req)) {
//         return res.status(403).json({ success: false, message: "Employees cannot update overtime" });
//       }

//       if (isCompany(req)) {
//         const companyId = await getCompanyId(req);
//         const allowed = await getAllUserIdsUnderCompanyBranch(companyId, null);
//         if (!allowed.includes(employee.created_by))
//           return res.status(403).json({ success: false, message: "Forbidden" });
//       }

//       if (isBranchManager(req)) {
//         if (employee.branch_id !== branchId && employee.created_by !== req.user.id) {
//           return res.status(403).json({
//             success: false,
//             message: "Forbidden: Not your branch or created employee",
//           });
//         }
//       }
//     }

//     // 🔍 Find attendance record using employee.employee_id
//     const attendance = await AttendanceEmployee.findOne({
//       where: { employee_id: employee.employee_id, date },
//     });
//     if (!attendance) {
//       return res.status(404).json({ success: false, message: "Attendance not found for this date" });
//     }

//     // ❌ Prevent conflict with early leaving
//     if (attendance.early_leaving && attendance.early_leaving !== "00:00:00") {
//       return res.status(400).json({
//         success: false,
//         message: "Cannot mark overtime because early leaving is already recorded for this date.",
//       });
//     }

//     // ✅ Get shift info for overtime calculation
//     const shiftInfo = await Shift.findByPk(attendance.shift_id, { raw: true });
//     if (!shiftInfo) {
//       return res.status(404).json({ success: false, message: "Shift not found" });
//     }

//     // ✅ Calculate overtime based on clock-out time (same logic as clock-out)
//     const shiftStart = dayjs.tz(`${date} ${shiftInfo.start_time}`, "Asia/Kolkata");
//     let shiftEnd = dayjs.tz(`${date} ${shiftInfo.end_time}`, "Asia/Kolkata");

//     // Handle overnight shift
//     if (shiftEnd.isBefore(shiftStart)) {
//       shiftEnd = shiftEnd.add(1, 'day');
//     }

//     // Create clock-out datetime
//     const clockOutTime = dayjs.tz(`${date} ${clock_out}`, "Asia/Kolkata");
    
//     // Handle overnight clock-out (if clock-out is before shift start, it's next day)
//     let actualClockOutTime = clockOutTime;
//     if (clockOutTime.isBefore(shiftStart)) {
//       actualClockOutTime = clockOutTime.add(1, 'day');
//     }

//     // ✅ Calculate work duration from SHIFT START TIME to CLOCK-OUT TIME
//     const totalWorkedMinutesFromShiftStart = diffMinutes(shiftStart.toDate(), actualClockOutTime.toDate());
//     const shiftDurationMinutes = diffMinutes(shiftStart.toDate(), shiftEnd.toDate());

//     // ✅ Calculate overtime
//     let overtimeMinutes = 0;
//     let overtime = "00:00:00";

//     if (totalWorkedMinutesFromShiftStart > shiftDurationMinutes) {
//       // Worked more than shift duration → Overtime
//       overtimeMinutes = totalWorkedMinutesFromShiftStart - shiftDurationMinutes;
//       overtime = minutesToHHMMSS(overtimeMinutes);
//     }

//     // ✅ Update attendance record with new clock_out and calculated overtime
//     await AttendanceEmployee.update({ 
//       clock_out: `${date} ${clock_out}`,
//       overtime,
//       reason 
//     }, { 
//       where: { id: attendance.id } 
//     });

//     // 🔹 Convert overtime to hours & converted days
//     const [h, m, s] = overtime.split(":").map(Number);
//     const overtimeHours = parseFloat((h + m / 60 + s / 3600).toFixed(2));
//     const convertedDays = parseFloat((overtimeHours / 8).toFixed(2));

//     // 🔹 Calculate daily_rate & ot_amount
//     const dateObj = new Date(date);
//     const total_days_in_month = new Date(dateObj.getFullYear(), dateObj.getMonth() + 1, 0).getDate();
//     const monthly_salary = employee.salary || 0;
//     const daily_rate = parseFloat((monthly_salary / total_days_in_month).toFixed(2));
//     const ot_amount = parseFloat((daily_rate * convertedDays).toFixed(2));

//     // 🔹 Find or create/update overtime record using employee.employee_id (string)
//     let overtimeRecord = await Overtime.findOne({
//       where: {
//         employee_id: employee.employee_id, // ✅ Use string "133"
//         date,
//         deleted_at: null,
//       },
//     });

//     if (!overtimeRecord) {
//       // Create new overtime record
//       overtimeRecord = await Overtime.create({
//         employee_id: employee.employee_id, // ✅ Store "133"
//         date,
//         title: "Manual Overtime Entry",
//         number_of_days: convertedDays,
//         hours: overtimeHours,
//         rate: daily_rate,
//         ot_amount,
//         type: "Manual Entry",
//         created_by: req.user.id,
//       });
//     } else {
//       // Update existing record
//       await overtimeRecord.update({
//         hours: overtimeHours,
//         number_of_days: convertedDays,
//         rate: daily_rate,
//         ot_amount,
//       });
//     }

//     // ✅ Response
//     res.json({
//       success: true,
//       message: `Overtime updated for ${employee.name} on ${date}`,
//       data: {
//         employee: {
//           id: employee.id,
//           name: employee.name,
//           employee_id: employee.employee_id, // ✅ "133"
//           branch_id: employee.branch_id,
//         },
//         date,
//         clock_out: `${date} ${clock_out}`,
//         calculated_overtime: overtime,
//         overtimeHours,
//         convertedDays,
//         monthly_salary,
//         daily_rate,
//         ot_amount,
//         reason,
//         calculation_details: {
//           shift_start: shiftStart.format('YYYY-MM-DD HH:mm:ss'),
//           shift_end: shiftEnd.format('YYYY-MM-DD HH:mm:ss'),
//           actual_clock_out: actualClockOutTime.format('YYYY-MM-DD HH:mm:ss'),
//           total_worked_minutes: totalWorkedMinutesFromShiftStart,
//           shift_duration_minutes: shiftDurationMinutes,
//           overtime_minutes: overtimeMinutes
//         }
//       },
//     });
//   } catch (err) {
//     console.error("Update Overtime Error:", err);
//     res.status(500).json({ success: false, error: err.message });
//   }
// };


//previous one
// exports.updateOvertime = async (req, res) => {
//   try {
//     const { empid } = req.params;
//     const { date, clock_out, reason } = req.body;

//     const employee = await Employee.findOne({ where: { employee_id: empid } });
//     if (!employee) return res.status(404).json({ success: false, message: "Employee not found" });

//     const attendance = await AttendanceEmployee.findOne({
//       where: { employee_id: employee.employee_id, date },
//       order: [["id", "DESC"]],
//     });

//     if (!attendance)
//       return res.status(404).json({ success: false, message: "Attendance not found" });

//     const shift = await Shift.findByPk(attendance.shift_id, { raw: true });

//     let shiftStart = dayjs.tz(`${date} ${shift.start_time}`, "Asia/Kolkata");
//     let shiftEnd = dayjs.tz(`${date} ${shift.end_time}`, "Asia/Kolkata");
//     if (shiftEnd.isBefore(shiftStart)) shiftEnd = shiftEnd.add(1, "day");

//     let actualOut = dayjs.tz(`${date} ${clock_out}`, "Asia/Kolkata");
//     if (actualOut.isBefore(shiftStart)) actualOut = actualOut.add(1, "day");

//     const workedFromShiftStart = diffMinutes(shiftStart.toDate(), actualOut.toDate());
//     const shiftMinutes = diffMinutes(shiftStart.toDate(), shiftEnd.toDate());

//     let overtime = "00:00:00";
//     if (workedFromShiftStart > shiftMinutes) {
//       overtime = minutesToHHMMSS(workedFromShiftStart - shiftMinutes);
//     }

//     await attendance.update({
//       clock_out: `${date} ${clock_out}`,
//       overtime,
//       reason,
//     });

//     // 🔥 Aggregate daily OT
//     const dayRecords = await AttendanceEmployee.findAll({
//       where: { employee_id: employee.employee_id, date },
//       attributes: ["overtime"],
//       raw: true,
//     });

//     const totalOTMinutes = dayRecords.reduce(
//       (sum, r) => sum + timeToMinutes(r.overtime),
//       0
//     );

//     const totalOT = minutesToHHMMSS(totalOTMinutes);

//     return res.json({
//       success: true,
//       message: "Overtime updated and aggregated successfully",
//       total_daily_overtime: totalOT,
//     });

//   } catch (err) {
//     console.error("Update Overtime Error:", err);
//     res.status(500).json({ success: false, error: err.message });
//   }
// };


// ============================
// 🔥 UPDATE OVERTIME WITH SALARY LOGIC
// ============================

// exports.updateOvertime = async (req, res) => {
//   try {
//     const { empid } = req.params;
//     const { date, clock_out, reason } = req.body;

//     // 🔹 Employee with salary dependencies
//     const employee = await Employee.findOne({
//       where: { employee_id: empid },
//       include: [
//         { model: Skill, as: "skill", attributes: ["wages"] },
//         { model: Branch, as: "branch", attributes: ["working_hours"] },
//         { model: Designation, as: "designation", attributes: ["overtime_rate"] }
//       ]
//     });

//     if (!employee)
//       return res.status(404).json({ success: false, message: "Employee not found" });

//     const attendance = await AttendanceEmployee.findOne({
//       where: { employee_id: employee.employee_id, date },
//       order: [["id", "DESC"]],
//     });

//     if (!attendance)
//       return res.status(404).json({ success: false, message: "Attendance not found" });

//     const shift = await Shift.findByPk(attendance.shift_id, { raw: true });

//     let shiftStart = dayjs.tz(`${date} ${shift.start_time}`, "Asia/Kolkata");
//     let shiftEnd = dayjs.tz(`${date} ${shift.end_time}`, "Asia/Kolkata");

//     if (shiftEnd.isBefore(shiftStart))
//       shiftEnd = shiftEnd.add(1, "day");

//     let actualOut = dayjs.tz(`${date} ${clock_out}`, "Asia/Kolkata");

//     if (actualOut.isBefore(shiftStart))
//       actualOut = actualOut.add(1, "day");

//     const workedFromShiftStart = diffMinutes(
//       shiftStart.toDate(),
//       actualOut.toDate()
//     );

//     const shiftMinutes = diffMinutes(
//       shiftStart.toDate(),
//       shiftEnd.toDate()
//     );

//     let overtime = "00:00:00";
//     let overtimeHours = 0;

//     if (workedFromShiftStart > shiftMinutes) {
//       const overtimeMinutes = workedFromShiftStart - shiftMinutes;
//       overtime = minutesToHHMMSS(overtimeMinutes);
//       overtimeHours = overtimeMinutes / 60;
//     }

//     // ==============================
//     // 🔥 SALARY BASED OT CALCULATION
//     // ==============================

//     const skillWages = Number(employee.skill?.wages || 0);
//     const branchWorkingHours = Number(employee.branch?.working_hours || 8);
//     const overtimeRate = Number(employee.designation?.overtime_rate || 1);

//     const baseHourlyRate = skillWages / branchWorkingHours;

//     // 🔹 Calculate Allowances (per day logic same as salary controller)
//     const allowances = await Allowance.findAll({
//       where: { employee_id: employee.employee_id }
//     });

//     let allowancesTotalPerDay = 0;

//     allowances.forEach(a => {
//       if (String(a.type).toLowerCase() === "percentage") {
//         allowancesTotalPerDay += (parseFloat(a.amount) / 100) * skillWages;
//       } else {
//         allowancesTotalPerDay += parseFloat(a.amount);
//       }
//     });

//     const allowanceHourlyRate =
//       branchWorkingHours > 0
//         ? allowancesTotalPerDay / branchWorkingHours
//         : 0;

//     const overtimeAmount =
//       (baseHourlyRate + allowanceHourlyRate) *
//       overtimeRate *
//       overtimeHours;

//     // ==============================
//     // 🔹 Update Attendance
//     // ==============================

//     await attendance.update({
//       clock_out: `${date} ${clock_out}`,
//       overtime,
//       reason,
//     });

//     // ==============================
//     // 🔹 Store in Overtime Table
//     // ==============================

//     if (overtimeHours > 0) {

//   if (!req.user || !req.user.id) {
//     throw new Error("User ID missing for overtime creation");
//   }

//   const overtimeDecimalHours = Number(overtimeHours.toFixed(2));
//   const numberOfDays = Number((overtimeHours / branchWorkingHours).toFixed(2));

//   await Overtime.create({
//     employee_id: employee.employee_id,
//     date,
//     title: "Automatic Overtime Entry",
//     number_of_days: numberOfDays,
//     hours: overtimeDecimalHours,
//     rate: overtimeRate,
//     ot_amount: Number(overtimeAmount.toFixed(2)),
//     type: "Auto",
//     created_by: req.user.id   // ✅ FIXED
//   });
// }



//     // 🔥 Aggregate daily OT
//     const dayRecords = await AttendanceEmployee.findAll({
//       where: { employee_id: employee.employee_id, date },
//       attributes: ["overtime"],
//       raw: true,
//     });

//     const totalOTMinutes = dayRecords.reduce(
//       (sum, r) => sum + timeToMinutes(r.overtime),
//       0
//     );

//     const totalOT = minutesToHHMMSS(totalOTMinutes);

//     return res.json({
//       success: true,
//       message: "Overtime updated, calculated and stored successfully",
//       total_daily_overtime: totalOT,
//       overtime_amount: Number(overtimeAmount.toFixed(2))
//     });

//   } catch (err) {
//     console.error("Update Overtime Error:", err);
//     res.status(500).json({ success: false, error: err.message });
//   }
// };


exports.updateOvertime = async (req, res) => {
  try {
    console.log("🚀 ===== UPDATE OVERTIME START =====");

    const { empid } = req.params;
    const { date, clock_out, reason } = req.body;

    console.log("📥 INPUT:", { empid, date, clock_out, reason });
    console.log("👤 USER:", req.user);

    // 🔹 Employee
    const employee = await Employee.findOne({
      where: { employee_id: empid },
      include: [
        { model: Skill, as: "skill", attributes: ["wages"] },
        { model: Branch, as: "branch", attributes: ["working_hours"] },
        { model: Designation, as: "designation", attributes: ["overtime_rate"] }
      ]
    });

    console.log("👨‍💼 Employee:", employee?.employee_id);

    if (!employee) {
      console.log("❌ Employee not found");
      return res.status(404).json({ success: false, message: "Employee not found" });
    }

    // 🔹 Attendance
    const attendance = await AttendanceEmployee.findOne({
      where: { employee_id: employee.employee_id, date },
      order: [["id", "DESC"]],
    });

    console.log("📅 Attendance record:", attendance?.id);

    if (!attendance) {
      console.log("❌ Attendance not found");
      return res.status(404).json({ success: false, message: "Attendance not found" });
    }

    const shift = await Shift.findByPk(attendance.shift_id, { raw: true });
    console.log("⏰ Shift:", shift);

    let shiftStart = dayjs.tz(`${date} ${shift.start_time}`, "Asia/Kolkata");
    let shiftEnd = dayjs.tz(`${date} ${shift.end_time}`, "Asia/Kolkata");

    if (shiftEnd.isBefore(shiftStart)) shiftEnd = shiftEnd.add(1, "day");

    let actualOut = dayjs.tz(`${date} ${clock_out}`, "Asia/Kolkata");
    if (actualOut.isBefore(shiftStart)) actualOut = actualOut.add(1, "day");

    const workedFromShiftStart = diffMinutes(shiftStart.toDate(), actualOut.toDate());
    const shiftMinutes = diffMinutes(shiftStart.toDate(), shiftEnd.toDate());

    console.log("⏱ Worked Minutes:", workedFromShiftStart);
    console.log("🕘 Shift Minutes:", shiftMinutes);

    let overtime = "00:00:00";
    let overtimeHours = 0;

    if (workedFromShiftStart > shiftMinutes) {
      const overtimeMinutes = workedFromShiftStart - shiftMinutes;
      overtime = minutesToHHMMSS(overtimeMinutes);
      overtimeHours = overtimeMinutes / 60;
    }

    console.log("🧮 Overtime:", overtime, "| Hours:", overtimeHours);

    // 🔥 SALARY BASED CALC
    const skillWages = Number(employee.skill?.wages || 0);
    const branchWorkingHours = Number(employee.branch?.working_hours || 8);
    const overtimeRate = Number(employee.designation?.overtime_rate || 1);

    console.log("💰 Wages:", skillWages, "Working Hours:", branchWorkingHours, "OT Rate:", overtimeRate);

    const baseHourlyRate = skillWages / branchWorkingHours;

    const allowances = await Allowance.findAll({
      where: { employee_id: employee.employee_id }
    });

    console.log("🎁 Allowances count:", allowances.length);

    let allowancesTotalPerDay = 0;
    allowances.forEach(a => {
      if (String(a.type).toLowerCase() === "percentage") {
        allowancesTotalPerDay += (parseFloat(a.amount) / 100) * skillWages;
      } else {
        allowancesTotalPerDay += parseFloat(a.amount);
      }
    });

    const allowanceHourlyRate = branchWorkingHours > 0
      ? allowancesTotalPerDay / branchWorkingHours
      : 0;

    const overtimeAmount =
      (baseHourlyRate + allowanceHourlyRate) *
      overtimeRate *
      overtimeHours;

    console.log("💸 OT Amount:", overtimeAmount);

    // 🔹 Update Attendance
    await attendance.update({
      clock_out: `${date} ${clock_out}`,
      overtime,
      reason,
    });

    console.log("✅ Attendance updated");

    // 🔹 Insert into Overtime table
    if (overtimeHours > 0) {

      if (!req.user || !req.user.id) {
        console.log("❌ User missing ID");
        throw new Error("User ID missing for overtime creation");
      }

      const overtimeDecimalHours = Number(overtimeHours.toFixed(2));
      const numberOfDays = Number((overtimeHours / branchWorkingHours).toFixed(2));

      const payload = {
        employee_id: employee.employee_id,
        date,
        title: "Automatic Overtime Entry",
        number_of_days: numberOfDays,
        hours: overtimeDecimalHours,
        rate: overtimeRate,
        ot_amount: Number(overtimeAmount.toFixed(2)),
        type: "Auto",
        created_by: req.user.id
      };

      console.log("📦 OT INSERT PAYLOAD:", payload);

      try {
        const created = await Overtime.create(payload);
        console.log("✅ Overtime inserted ID:", created.id);
      } catch (e) {
        console.error("❌ Overtime INSERT FAILED:", e);
      }

    } else {
      console.log("⚠ No overtime hours → skipping insert");
    }

    // 🔹 Aggregate
    const dayRecords = await AttendanceEmployee.findAll({
      where: { employee_id: employee.employee_id, date },
      attributes: ["overtime"],
      raw: true,
    });

    const totalOTMinutes = dayRecords.reduce(
      (sum, r) => sum + timeToMinutes(r.overtime),
      0
    );

    const totalOT = minutesToHHMMSS(totalOTMinutes);

    console.log("📊 Total OT:", totalOT);

    console.log("🏁 ===== UPDATE OVERTIME END =====");

    return res.json({
      success: true,
      message: "Overtime updated, calculated and stored successfully",
      total_daily_overtime: totalOT,
      overtime_amount: Number(overtimeAmount.toFixed(2))
    });

  } catch (err) {
    console.error("🔥 FINAL ERROR:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};



exports.patchAttendanceStatus = async (req, res) => {
  try {
    const { empid } = req.params;
    const { date, status, clock_in, clock_out, reason } = req.body;

    if (!date || !status)
      return res.status(400).json({ success: false, message: "date and status are required" });

    const todayDate = dayjs(date).format("YYYY-MM-DD");

    const employee = await Employee.findOne({ where: { employee_id: empid } });
    if (!employee)
      return res.status(404).json({ success: false, message: "Employee not found" });

    // ✅ Biometric validation
    if (!employee.biometric_emp_id && status.toLowerCase() === "present") {
      return res.status(400).json({
        success: false,
        message: "Attendance not allowed: Employee has no biometric ID assigned",
      });
    }

    // 🔒 RBAC checks
    if (!isSuper(req)) {
      const companyId = await getCompanyId(req);
      const branchId = await getUserBranchId(req.user.id);

      if (isEmployee(req))
        return res.status(403).json({ success: false, message: "Employees cannot mark attendance" });

      if (isBranchManager(req)) {
        if (employee.branch_id !== branchId && employee.created_by !== req.user.id)
          return res.status(403).json({ success: false, message: "Forbidden: Not your branch or created employee" });
      }

      if (isCompany(req)) {
        const allowed = await getAllUserIdsUnderCompanyBranch(companyId, null);
        if (!allowed.includes(employee.created_by))
          return res.status(403).json({ success: false, message: "Forbidden" });
      }
    }

    // ============================
    // 🔹 Case 1: Mark Present
    // ============================
    if (status.toLowerCase() === "present") {
      const nowIn = dayjs.tz(clock_in || new Date(), "Asia/Kolkata");
      const nowOut = dayjs.tz(clock_out || clock_in || new Date(), "Asia/Kolkata");

      const formattedIn = nowIn.format("YYYY-MM-DD HH:mm:ss");
      const formattedOut = nowOut.format("YYYY-MM-DD HH:mm:ss");

      // Auto-detect shift
      const allShifts = await Shift.findAll({ raw: true });
      let shift = null;

      for (const s of allShifts) {
          let start = dayjs.tz(`${todayDate} ${s.start_time}`, "Asia/Kolkata");
          let end = dayjs.tz(`${todayDate} ${s.end_time}`, "Asia/Kolkata");
        
          if (end.isBefore(start)) {
            if (nowIn.isBefore(end)) {
              start = start.subtract(1, "day");
            } else {
              end = end.add(1, "day");
            }
          }
        
          // ✅ NEW FIX: 2-hour start window ONLY
          const windowEnd = start.add(2, "hour");
        
          if (nowIn.isSameOrAfter(start) && nowIn.isSameOrBefore(windowEnd)) {
            shift = s;
            break;
          }
        }

      if (!shift)
        return res.status(400).json({ success: false, message: "No shift found for the given time" });

      // Prevent double marking
      const exists = await AttendanceEmployee.findOne({
        where: { employee_id: employee.employee_id, date: todayDate },
      });
      if (exists)
        return res.status(400).json({ success: false, message: "Attendance already marked for this date" });

      // ===============================
      // ✅ UPDATED: EARLY LEAVING / OVERTIME LOGIC (SAME AS CLOCK-OUT FUNCTION)
      // ===============================
      const shiftInfo = shift;
      const shiftStart = dayjs.tz(`${todayDate} ${shiftInfo.start_time}`, "Asia/Kolkata");
      let shiftEnd = dayjs.tz(`${todayDate} ${shiftInfo.end_time}`, "Asia/Kolkata");

      // Handle overnight shift
      if (shiftEnd.isBefore(shiftStart)) {
        shiftEnd = shiftEnd.add(1, 'day');
      }

      // Calculate total work from SHIFT START TIME to CLOCK-OUT TIME
      let totalWorkedMinutesFromShiftStart;
      if (nowOut.isBefore(shiftStart)) {
        const nextDayOutTime = nowOut.add(1, 'day');
        totalWorkedMinutesFromShiftStart = diffMinutes(shiftStart.toDate(), nextDayOutTime.toDate());
      } else {
        totalWorkedMinutesFromShiftStart = diffMinutes(shiftStart.toDate(), nowOut.toDate());
      }

      const shiftDurationMinutes = diffMinutes(shiftStart.toDate(), shiftEnd.toDate());

      // ✅ Calculate overtime and early leaving based on WORK FROM SHIFT START TIME vs SHIFT DURATION
      let earlyLeaving = "00:00:00";
      let overtime = "00:00:00";

      if (totalWorkedMinutesFromShiftStart < shiftDurationMinutes) {
        // Worked less than shift duration from shift start → Early Leaving
        const earlyLeavingMinutes = shiftDurationMinutes - totalWorkedMinutesFromShiftStart;
        earlyLeaving = minutesToHHMMSS(earlyLeavingMinutes);
      } else if (totalWorkedMinutesFromShiftStart > shiftDurationMinutes) {
        // Worked more than shift duration from shift start → Overtime
        const overtimeMinutes = totalWorkedMinutesFromShiftStart - shiftDurationMinutes;
        overtime = minutesToHHMMSS(overtimeMinutes);
      }

      // Calculate actual work time from clock-in to clock-out for total_work
      let actualWorkedMinutes;
      if (nowOut.isBefore(nowIn)) {
        const nextDayOutTime = nowOut.add(1, 'day');
        actualWorkedMinutes = diffMinutes(nowIn.toDate(), nextDayOutTime.toDate());
      } else {
        actualWorkedMinutes = diffMinutes(nowIn.toDate(), nowOut.toDate());
      }

      // Helper functions
      function diffMinutes(date1, date2) {
        return Math.abs((date2 - date1) / (1000 * 60));
      }

      function minutesToHHMMSS(minutes) {
        const hrs = Math.floor(minutes / 60);
        const mins = Math.floor(minutes % 60);
        const secs = Math.floor((minutes % 1) * 60);
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      }

      // ✅ Create Attendance
      const attendance = await AttendanceEmployee.create({
        employee_id: employee.employee_id,
        shift_id: shift.id,
        date: todayDate,
        status: "Present",
        clock_in: formattedIn,
        clock_out: formattedOut,
        late: "00:00:00",
        early_leaving: earlyLeaving,
        overtime: overtime,
        total_work: minutesToHHMMSS(actualWorkedMinutes),
        total_rest: 0,
        created_by: req.user?.id || null,
      });

      // ✅ Auto Store Overtime into Overtime Table (if overtime exists)
      if (overtime && overtime !== "00:00:00") {
        const [h, m, s] = overtime.split(":").map(Number);
        const overtimeHours = parseFloat((h + m / 60 + s / 3600).toFixed(2));
        const convertedDays = parseFloat((overtimeHours / 8).toFixed(2));

        const dateObj = new Date(todayDate);
        const total_days_in_month = new Date(dateObj.getFullYear(), dateObj.getMonth() + 1, 0).getDate();

        const monthly_salary = employee.salary || 0;
        const daily_rate = parseFloat((monthly_salary / total_days_in_month).toFixed(2));
        const ot_amount = parseFloat((daily_rate * convertedDays).toFixed(2));

        await Overtime.create({
          employee_id: employee.employee_id,
          date: todayDate,
          title: "Manual Overtime Entry",
          number_of_days: convertedDays,
          hours: overtimeHours,
          rate: daily_rate,
          ot_amount,
          type: "Manual",
          created_by: req.user?.id || null,
        });
      }

      // ✅ Get Branch & Department Info
      const branch = await Branch.findByPk(employee.branch_id, { attributes: ["name"] });
      const department = await Department.findByPk(employee.department_id, { attributes: ["name"] });

      // ✅ Return unified success response
      return res.json({
        success: true,
        message: "Attendance marked as Present successfully",
        data: {
          id: attendance.id,
          date: attendance.date,
          shift: {
            id: shift.id,
            title: shift.title,
            start_time: shift.start_time,
            end_time: shift.end_time,
          },
          status: attendance.status,
          clock_in: attendance.clock_in,
          clock_out: attendance.clock_out,
          late: attendance.late,
          early_leaving: attendance.early_leaving,
          overtime: attendance.overtime,
          total_work: attendance.total_work,
          employee: {
            id: employee.id,
            name: employee.name,
            employee_id: employee.employee_id,
            branch_id: employee.branch_id,
            branch_name: branch?.name || null,
            department_id: employee.department_id,
            department_name: department?.name || null,
            created_by: employee.created_by,
          },
        },
      });
    }

    // ============================
    // 🔹 Case 2: Mark Absent
    // ============================
    if (status.toLowerCase() === "absent") {
      const absentReason = reason || "Manually marked absent";

      const [attendance, created] = await AttendanceEmployee.findOrCreate({
        where: { employee_id: employee.employee_id, date: todayDate },
        defaults: {
          shift_id: null,
          status: "Absent",
          clock_in: "00:00:00",
          clock_out: "00:00:00",
          late: "00:00:00",
          early_leaving: "00:00:00",
          overtime: "00:00:00",
          total_work: "00:00:00",
          total_rest: 0,
          reason: absentReason,
          created_by: req.user?.id || null,
        },
      });

      if (!created) {
        await attendance.update({
          status: "Absent",
          reason: absentReason,
        });
      }

      return res.json({
        success: true,
        message: "Attendance marked as Absent",
        data: attendance,
      });
    }

    // ============================
    // 🔹 Invalid status
    // ============================
    return res.status(400).json({
      success: false,
      message: "Invalid status — only 'Present' or 'Absent' allowed",
    });

  } catch (err) {
    console.error("patchAttendanceStatus Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};
// ============================
// 🔹 Delete Attendance
// ============================
exports.deleteAttendance = async (req, res) => {
  try {
    const { id } = req.params;

    const attendance = await AttendanceEmployee.findByPk(id, {
      include: [{ model: Employee, as: "employee" }]
    });

    if (!attendance)
      return res.status(404).json({ success: false, message: "Attendance not found" });

    // RBAC checks
    if (!isSuper(req)) {
      const branchId = await getUserBranchId(req.user.id);

      if (isEmployee(req)) 
        return res.status(403).json({ success: false, message: "Employees cannot delete attendance" });

      if (isCompany(req)) {
        const companyId = await getCompanyId(req);
        const allowed = await getAllUserIdsUnderCompanyBranch(companyId, null);
        if (!allowed.includes(attendance.created_by))
          return res.status(403).json({ success: false, message: "Forbidden" });
      }

      if (isBranchManager(req)) {
        // Branch Manager: own branch OR employees they created
        if (attendance.employee?.branch_id !== branchId && attendance.employee?.created_by !== req.user.id)
          return res.status(403).json({ success: false, message: "Forbidden: Not your branch or created employee" });
      }
    }

    await attendance.destroy();

    res.json({ success: true, message: "Attendance deleted successfully" });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getAllAttendancesdate = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date)
      return res.status(400).json({ success: false, message: "Date is required" });

    const dateObj = dayjs(date, "YYYY-MM-DD", true);
    if (!dateObj.isValid())
      return res.status(400).json({ success: false, message: "Invalid date format" });

    const formattedDate = dateObj.format("YYYY-MM-DD");

    const companyId = await getCompanyId(req);
    const userId = req.user.id;

    if (!companyId && !isSuper(req))
      return res.status(403).json({ success: false, message: "Unauthorized" });

    // ============================
    // 🔹 Role-Based + Company Isolation (via created_by)
    // ============================
    let employeeWhere = {};

    if (isSuper(req)) {
      employeeWhere = {}; // Super can see all employees
    } 
    else {
      // 🔹 All non-super roles: restrict to employees created by this company
      const allowedUserIds = await getAllUserIdsUnderCompanyBranch(companyId, null);
      employeeWhere = { created_by: { [Op.in]: allowedUserIds } };

      if (isBranchManager(req)) {
        const branchId = await getUserBranchId(userId);
        employeeWhere = {
          created_by: { [Op.in]: allowedUserIds },
          branch_id: branchId // ✅ Only this branch
        };
      } else if (isDepartmentHead(req)) {
        const deptEmp = await Employee.findOne({
          where: { user_id: userId },
          attributes: ["branch_id"],
          raw: true
        });
        if (!deptEmp?.branch_id) {
          return res.status(403).json({ success: false, message: "Branch not assigned" });
        }
        employeeWhere = {
          created_by: { [Op.in]: allowedUserIds },
          branch_id: deptEmp.branch_id // ✅ Only this branch
        };
      } else if (isEmployee(req)) {
        const emp = await Employee.findOne({
          where: { user_id: userId },
          attributes: ["employee_id"],
          raw: true
        });
        if (!emp) {
          return res.status(404).json({ success: false, message: "Employee record not found" });
        }
        employeeWhere = { employee_id: emp.employee_id }; // ✅ Only self
      }
    }

    // ============================
    // 🔹 Fetch Attendance Records
    // ============================
    const records = await AttendanceEmployee.findAll({
      where: { date: formattedDate },
      include: [
        {
          model: Employee,
          as: "employee",
          attributes: [
            "id",
            "name",
            "employee_id",
            "branch_id",
            "department_id",
            "employee_type",
            "created_by"
          ],
          where: employeeWhere,
          required: true,
          include: [
            { model: Branch, as: "branch", attributes: ["name"], required: false },
            { model: Department, as: "department", attributes: ["name"], required: false }
          ]
        },
        {
          model: Shift,
          as: "shift",
          attributes: ["id", "title", "start_time", "end_time", "break_minutes"],
          required: false
        }
      ],
      order: [["id", "ASC"]]
    });

    if (!records.length)
      return res.status(404).json({
        success: false,
        message: `No attendance records found for ${formattedDate}`
      });

    // ============================
    // 🔹 Format Response
    // ============================
    const data = records.map(a => ({
      id: a.id,
      date: a.date,
      status: a.status,
      clock_in: a.clock_in,
      clock_out: a.clock_out,
      late: a.late,
      early_leaving: a.early_leaving,
      overtime: a.overtime,
      total_rest: a.total_rest,
      reason: a.reason || null,
      created_by: a.created_by,
      shift: a.shift ? {
        id: a.shift.id,
        title: a.shift.title,
        start_time: a.shift.start_time,
        end_time: a.shift.end_time,
        break_minutes: a.shift.break_minutes
      } : null,
      employee: {
        id: a.employee.id,
        name: a.employee.name,
        employee_id: a.employee.employee_id,
        branch_id: a.employee.branch_id,
        department_id: a.employee.department_id,
        branch_name: a.employee.branch?.name || null,
        department_name: a.employee.department?.name || null,
        employee_type: a.employee.employee_type || "Permanent",
        created_by: a.employee.created_by
      }
    }));

    res.json({ success: true, data });

  } catch (err) {
    console.error("getAllAttendancesdate Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};
// ============================
// ============================
// GET /api/attendance/month-end?month=YYYY-MM
// ============================
// exports.getMonthEndAttendance = async (req, res) => {
//   try {
//     const { month } = req.query;
//     if (!month || !/^\d{4}-\d{2}$/.test(month)) {
//       return res.status(400).json({ success: false, message: "Invalid month format (YYYY-MM)" });
//     }

//     const companyId = await getCompanyId(req);
//     const userId = req.user.id;

//     let employeeWhere = {};

//     // RBAC filters
//     if (isSuper(req)) employeeWhere = {};
//     else if (isCompany(req)) {
//       const allowedUserIds = await getAllUserIdsUnderCompanyBranch(companyId, null);
//       employeeWhere = { created_by: { [Op.in]: allowedUserIds } };
//     } else if (isBranchManager(req)) {
//       const branchId = await getUserBranchId(userId);
//       employeeWhere = { branch_id: branchId };
//     } else if (isDepartmentHead(req)) {
//       const deptEmp = await Employee.findOne({ where: { user_id: userId }, attributes: ["branch_id"], raw: true });
//       if (!deptEmp?.branch_id)
//         return res.status(403).json({ success: false, message: "Branch not assigned" });
//       employeeWhere = { branch_id: deptEmp.branch_id };
//     } else if (isEmployee(req)) {
//       const emp = await Employee.findOne({ where: { user_id: userId }, attributes: ["id"], raw: true });
//       if (!emp) return res.status(404).json({ success: false, message: "Employee record not found" });
//       employeeWhere = { id: emp.id };
//     }

//     // Month start/end
//     const startDate = dayjs(`${month}-01`).startOf("month");
//     const endDate = dayjs(startDate).endOf("month");
//     const totalDays = endDate.diff(startDate, "day") + 1;

//     // Fetch employees in scope
//     const employees = await Employee.findAll({
//       where: employeeWhere,
//       include: [
//         { model: Branch, as: "branch", attributes: ["name"] },
//         { model: Department, as: "department", attributes: ["name"] },
//       ]
//     });

//     if (!employees.length) {
//       return res.status(404).json({ success: false, message: "No employees found" });
//     }

//     const summaries = [];

//     for (const emp of employees) {
//       // Attendance records for employee in month
//       const attendanceRecords = await AttendanceEmployee.findAll({
//         where: {
//           employee_id: emp.id,
//           date: { [Op.between]: [startDate.format("YYYY-MM-DD"), endDate.format("YYYY-MM-DD")] }
//         },
//         attributes: ["status", "late", "early_leaving", "overtime"],
//         raw: true
//       });

//       // Compute summary
//       const presentDays = attendanceRecords.filter(a => a.status === "Present").length;
//       const absentDays = totalDays - presentDays;
//       const lateDays = attendanceRecords.filter(a => a.late && a.late !== "00:00:00").length;
//       const earlyLeavingDays = attendanceRecords.filter(a => a.early_leaving && a.early_leaving !== "00:00:00").length;
//       const totalOvertimeMinutes = attendanceRecords.reduce((sum, a) => sum + timeToMinutes(a.overtime), 0);
//       const totalOvertime = minutesToHHMMSS(totalOvertimeMinutes);

//       summaries.push({
//         employee_id: emp.employee_id,
//         name: emp.name,
//         branch_name: emp.branch?.name || null,
//         department_name: emp.department?.name || null,
//         total_days: totalDays,
//         present_days: presentDays,
//         absent_days: absentDays,
//         late_days: lateDays,
//         early_leaving_days: earlyLeavingDays,
//         total_overtime: totalOvertime
//       });
//     }

//     return res.json({
//       success: true,
//       month,
//       summary_count: summaries.length,
//       summary: summaries
//     });

//   } catch (err) {
//     console.error("Month-End Attendance Error:", err);
//     return res.status(500).json({ success: false, error: err.message });
//   }
// };

exports.getMonthEndAttendance = async (req, res) => {
  try {
    const { month } = req.query;
    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({
        success: false,
        message: "Invalid month format (YYYY-MM)"
      });
    }

    const companyId = await getCompanyId(req);
    const userId = req.user.id;

    let employeeWhere = {};

    // ============================
    // 🔒 RBAC Filters
    // ============================
    if (isSuper(req)) {
      employeeWhere = {};
    } else if (isCompany(req)) {
      const allowedUserIds = await getAllUserIdsUnderCompanyBranch(companyId, null);
      employeeWhere = { created_by: { [Op.in]: allowedUserIds } };
    } else if (isBranchManager(req)) {
      const branchId = await getUserBranchId(userId);
      employeeWhere = { branch_id: branchId };
    } else if (isDepartmentHead(req)) {
      const deptEmp = await Employee.findOne({
        where: { user_id: userId },
        attributes: ["branch_id"],
        raw: true
      });
      if (!deptEmp?.branch_id) {
        return res.status(403).json({
          success: false,
          message: "Branch not assigned"
        });
      }
      employeeWhere = { branch_id: deptEmp.branch_id };
    } else if (isEmployee(req)) {
      const emp = await Employee.findOne({
        where: { user_id: userId },
        attributes: ["id"],
        raw: true
      });
      if (!emp) {
        return res.status(404).json({
          success: false,
          message: "Employee record not found"
        });
      }
      employeeWhere = { id: emp.id };
    }

    // ============================
    // 📅 Month Range
    // ============================
    const startDate = dayjs(`${month}-01`).startOf("month");
    const endDate = startDate.endOf("month");
    const totalDays = endDate.diff(startDate, "day") + 1;

    // ============================
    // 👥 Employees
    // ============================
    const employees = await Employee.findAll({
      where: employeeWhere,
      include: [
        { model: Branch, as: "branch", attributes: ["name"] },
        { model: Department, as: "department", attributes: ["name"] }
      ]
    });

    if (!employees.length) {
      return res.status(404).json({
        success: false,
        message: "No employees found"
      });
    }

    const summaries = [];

    // ============================
    // 🔁 Per Employee Summary
    // ============================
    for (const emp of employees) {
      const attendanceRecords = await AttendanceEmployee.findAll({
        where: {
          employee_id: emp.employee_id, // ✅ IMPORTANT
          date: {
            [Op.between]: [
              startDate.format("YYYY-MM-DD"),
              endDate.format("YYYY-MM-DD")
            ]
          }
        },
        attributes: [
          "date",
          "status",
          "late",
          "early_leaving",
          "overtime"
        ],
        raw: true
      });

      // ============================
      // 🧠 GROUP BY DATE (CRITICAL FIX)
      // ============================
      const byDate = {};

      for (const rec of attendanceRecords) {
        if (!byDate[rec.date]) {
          byDate[rec.date] = {
            present: false,
            late: false,
            early: false,
            overtimeMinutes: 0
          };
        }

        if (rec.status === "Present") {
          byDate[rec.date].present = true;
        }

        if (rec.late && rec.late !== "00:00:00") {
          byDate[rec.date].late = true;
        }

        if (rec.early_leaving && rec.early_leaving !== "00:00:00") {
          byDate[rec.date].early = true;
        }

        byDate[rec.date].overtimeMinutes += timeToMinutes(rec.overtime);
      }

      // ============================
      // 📊 Aggregates
      // ============================
      const presentDays = Object.values(byDate).filter(d => d.present).length;
      const lateDays = Object.values(byDate).filter(d => d.late).length;
      const earlyLeavingDays = Object.values(byDate).filter(d => d.early).length;
      const totalOvertimeMinutes = Object.values(byDate)
        .reduce((sum, d) => sum + d.overtimeMinutes, 0);

      const totalOvertime = minutesToHHMMSS(totalOvertimeMinutes);
      const absentDays = totalDays - presentDays;

      summaries.push({
        employee_id: emp.employee_id,
        name: emp.name,
        branch_name: emp.branch?.name || null,
        department_name: emp.department?.name || null,
        total_days: totalDays,
        present_days: presentDays,
        absent_days: absentDays,
        late_days: lateDays,
        early_leaving_days: earlyLeavingDays,
        total_overtime: totalOvertime
      });
    }

    return res.json({
      success: true,
      month,
      summary_count: summaries.length,
      summary: summaries
    });

  } catch (err) {
    console.error("Month-End Attendance Error:", err);
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
};


// exports.getEmployeeMonthlyAttendance = async (req, res) => {
//   try {
//     const { empid } = req.params;
//     const { month, year } = req.query; // optional month/year filters

//     // ============================
//     // 🔹 Find Employee
//     // ============================
//     const employee = await Employee.findOne({
//       where: { employee_id: empid },
//       attributes: ["id", "name", "employee_id", "branch_id", "department_id", "employee_type", "created_by"],
//       include: [
//         { model: Branch, as: "branch", attributes: ["name"] },
//         { model: Department, as: "department", attributes: ["name"] }
//       ]
//     });

//     if (!employee)
//       return res.status(404).json({ success: false, message: "Employee not found" });

//     const now = dayjs().tz("Asia/Kolkata");
//     const targetYear = year ? Number(year) : now.year();
//     const targetMonth = month ? Number(month) : null;

//     let startDate, endDate, viewType;

//     // ============================
//     // 🔹 Determine Range
//     // ============================
//     if (targetMonth) {
//       // Month view
//       startDate = dayjs(`${targetYear}-${String(targetMonth).padStart(2, "0")}-01`).startOf("day");
//       endDate = startDate.endOf("month");

//       // Limit to today if current month/year
//       if (targetYear === now.year() && targetMonth === now.month() + 1) {
//         endDate = now.endOf("day");
//       }

//       // Prevent future
//       if (targetYear > now.year() || (targetYear === now.year() && targetMonth > now.month() + 1)) {
//         return res.status(400).json({ success: false, message: "Cannot view future month attendance" });
//       }

//       viewType = "month";
//     } else {
//       // Year view
//       startDate = dayjs(`${targetYear}-01-01`).startOf("day");
//       endDate = dayjs(`${targetYear}-12-31`).endOf("day");

//       // Limit to today if current year
//       if (targetYear === now.year()) {
//         endDate = now.endOf("day");
//       }

//       // Prevent future year
//       if (targetYear > now.year()) {
//         return res.status(400).json({ success: false, message: "Cannot view future year attendance" });
//       }

//       viewType = "year";
//     }

//     // ============================
//     // 🔹 Fetch Attendance Data
//     // ============================
//     const attendances = await AttendanceEmployee.findAll({
//       where: {
//         employee_id: empid,
//         date: {
//           [Op.between]: [startDate.format("YYYY-MM-DD"), endDate.format("YYYY-MM-DD")]
//         }
//       },
//       include: [
//         {
//           model: Shift,
//           as: "shift",
//           attributes: ["id", "title", "start_time", "end_time", "break_minutes"]
//         },
//         {
//           model: Employee,
//           as: "employee",
//           attributes: [
//             "id",
//             "name",
//             "employee_id",
//             "branch_id",
//             "department_id",
//             "employee_type",
//             "created_by"
//           ],
//           include: [
//             { model: Branch, as: "branch", attributes: ["name"] },
//             { model: Department, as: "department", attributes: ["name"] }
//           ]
//         }
//       ],
//       attributes: [
//         "id",
//         "date",
//         "status",
//         "clock_in",
//         "clock_out",
//         "late",
//         "early_leaving",
//         "overtime",
//         "total_rest",
//         "reason",
//         "created_by"
//       ],
//       order: [["date", "ASC"]]
//     });

//     // ============================
//     // 🔹 Fill Missing Dates as Absent
//     // ============================
//     const allDates = [];
//     let d = startDate.clone();
//     while (d.isSameOrBefore(endDate)) {
//       allDates.push(d.format("YYYY-MM-DD"));
//       d = d.add(1, "day");
//     }

//     const existingDates = attendances.map(a => a.date);
//     const absentDays = allDates.filter(d => !existingDates.includes(d));

//     const absentRecords = absentDays.map(date => ({
//       id: null,
//       date,
//       status: "Absent",
//       clock_in: "00:00:00",
//       clock_out: "00:00:00",
//       late: "00:00:00",
//       early_leaving: "00:00:00",
//       overtime: "00:00:00",
//       total_rest: 0,
//       reason: "Auto-marked absent",
//       created_by: employee.created_by,
//       shift: null,
//       employee: {
//         id: employee.id,
//         name: employee.name,
//         employee_id: employee.employee_id,
//         branch_id: employee.branch_id,
//         department_id: employee.department_id,
//         branch_name: employee.branch?.name || null,
//         department_name: employee.department?.name || null,
//         employee_type: employee.employee_type,
//         created_by: employee.created_by
//       }
//     }));

//     // ============================
//     // 🔹 Combine All Records
//     // ============================
//     const allRecords = [
//       ...attendances.map(a => ({
//         id: a.id,
//         date: a.date,
//         status: a.status,
//         clock_in: a.clock_in,
//         clock_out: a.clock_out,
//         late: a.late,
//         early_leaving: a.early_leaving,
//         overtime: a.overtime,
//         total_rest: a.total_rest,
//         reason: a.reason,
//         created_by: a.created_by,
//         shift: a.shift || null,
//         employee: {
//           id: a.employee.id,
//           name: a.employee.name,
//           employee_id: a.employee.employee_id,
//           branch_id: a.employee.branch_id,
//           department_id: a.employee.department_id,
//           branch_name: a.employee.branch?.name || null,
//           department_name: a.employee.department?.name || null,
//           employee_type: a.employee.employee_type,
//           created_by: a.employee.created_by
//         }
//       })),
//       ...absentRecords
//     ].sort((a, b) => new Date(a.date) - new Date(b.date));

//     // ============================
//     // 🔹 Response
//     // ============================
//     res.json({
//       success: true,
//       data: allRecords
//     });

//   } catch (err) {
//     console.error("getEmployeeMonthlyAttendance Error:", err);
//     res.status(500).json({ success: false, message: "Failed to fetch employee attendance", error: err.message });
//   }
// };

exports.getEmployeeMonthlyAttendance = async (req, res) => {
  try {
    const { empid } = req.params;
    const { month, year } = req.query;

    // ============================
    // 🔹 Find Employee
    // ============================
    const employee = await Employee.findOne({
      where: { employee_id: empid },
      attributes: [
        "id",
        "name",
        "employee_id",
        "branch_id",
        "department_id",
        "employee_type",
        "created_by"
      ],
      include: [
        { model: Branch, as: "branch", attributes: ["name"] },
        { model: Department, as: "department", attributes: ["name"] }
      ]
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found"
      });
    }

    const now = dayjs().tz("Asia/Kolkata");
    const targetYear = year ? Number(year) : now.year();
    const targetMonth = month ? Number(month) : null;

    let startDate, endDate;

    // ============================
    // 🔹 Date Range
    // ============================
    if (targetMonth) {
      startDate = dayjs(
        `${targetYear}-${String(targetMonth).padStart(2, "0")}-01`
      ).startOf("day");

      endDate = startDate.endOf("month");

      if (
        targetYear === now.year() &&
        targetMonth === now.month() + 1
      ) {
        endDate = now.endOf("day");
      }

      if (
        targetYear > now.year() ||
        (targetYear === now.year() && targetMonth > now.month() + 1)
      ) {
        return res.status(400).json({
          success: false,
          message: "Cannot view future month attendance"
        });
      }
    } else {
      startDate = dayjs(`${targetYear}-01-01`).startOf("day");
      endDate = dayjs(`${targetYear}-12-31`).endOf("day");

      if (targetYear === now.year()) {
        endDate = now.endOf("day");
      }

      if (targetYear > now.year()) {
        return res.status(400).json({
          success: false,
          message: "Cannot view future year attendance"
        });
      }
    }

    // ============================
    // 🔹 Fetch Attendance
    // ============================
    const attendances = await AttendanceEmployee.findAll({
      where: {
        employee_id: empid,
        date: {
          [Op.between]: [
            startDate.format("YYYY-MM-DD"),
            endDate.format("YYYY-MM-DD")
          ]
        }
      },
      include: [
        {
          model: Shift,
          as: "shift",
          attributes: ["id", "title", "start_time", "end_time", "break_minutes"]
        }
      ],
      attributes: [
        "id",
        "date",
        "status",
        "clock_in",
        "clock_out",
        "late",
        "early_leaving",
        "overtime",
        "total_rest",
        "reason",
        "created_by"
      ],
      order: [["date", "ASC"], ["id", "ASC"]]
    });

    // ============================
    // 🔥 GROUP BY DATE (DAILY OT FIX)
    // ============================
    const groupedByDate = {};

    for (const a of attendances) {
      if (!groupedByDate[a.date]) {
        groupedByDate[a.date] = {
          overtimeMinutes: 0,
          records: []
        };
      }

      groupedByDate[a.date].overtimeMinutes += timeToMinutes(a.overtime);
      groupedByDate[a.date].records.push(a);
    }

    // ============================
    // 🔹 Fill Missing Dates as Absent
    // ============================
    const allDates = [];
    let d = startDate.clone();
    while (d.isSameOrBefore(endDate)) {
      allDates.push(d.format("YYYY-MM-DD"));
      d = d.add(1, "day");
    }

    const result = [];

    for (const date of allDates) {
      if (!groupedByDate[date]) {
        // Absent day
        result.push({
          id: null,
          date,
          status: "Absent",
          clock_in: "00:00:00",
          clock_out: "00:00:00",
          late: "00:00:00",
          early_leaving: "00:00:00",
          overtime: "00:00:00",
          daily_overtime: "00:00:00",
          total_rest: 0,
          reason: "Auto-marked absent",
          shift: null,
          employee: {
            id: employee.id,
            name: employee.name,
            employee_id: employee.employee_id,
            branch_id: employee.branch_id,
            department_id: employee.department_id,
            branch_name: employee.branch?.name || null,
            department_name: employee.department?.name || null,
            employee_type: employee.employee_type,
            created_by: employee.created_by
          }
        });
        continue;
      }

      const dayData = groupedByDate[date];
      const dailyOT = minutesToHHMMSS(dayData.overtimeMinutes);

      // push ALL shifts but with same daily_overtime
      for (const a of dayData.records) {
        result.push({
          id: a.id,
          date: a.date,
          status: a.status,
          clock_in: a.clock_in,
          clock_out: a.clock_out,
          late: a.late,
          early_leaving: a.early_leaving,
          overtime: a.overtime,          // per-shift
          daily_overtime: dailyOT,       // ✅ aggregated
          total_rest: a.total_rest,
          reason: a.reason,
          shift: a.shift || null,
          employee: {
            id: employee.id,
            name: employee.name,
            employee_id: employee.employee_id,
            branch_id: employee.branch_id,
            department_id: employee.department_id,
            branch_name: employee.branch?.name || null,
            department_name: employee.department?.name || null,
            employee_type: employee.employee_type,
            created_by: employee.created_by
          }
        });
      }
    }

    // ============================
    // 🔹 Response
    // ============================
    return res.json({
      success: true,
      data: result
    });

  } catch (err) {
    console.error("getEmployeeMonthlyAttendance Error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch employee attendance",
      error: err.message
    });
  }
};


