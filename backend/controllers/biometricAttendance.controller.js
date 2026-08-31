
const dayjs = require("../utils/dayjs");
// const utc = require("dayjs/plugin/utc");
// const timezone = require("dayjs/plugin/timezone");
const { Op } = require("sequelize");
// dayjs.extend(utc);
// dayjs.extend(timezone);
// dayjs.tz.setDefault("Asia/Kolkata");

const Employee = require("../models/employee.model");
const AttendanceEmployee = require("../models/attendance.model");
const Shift = require("../models/shift.model");
const BiometricAttendanceLog = require("../models/biometricAttendanceLog.model");
const Overtime = require("../models/overtime.model");

const Skill = require("../models/skill.model");
const Branch = require("../models/branch.model");
const Designation = require("../models/designation.model");
const Allowance = require("../models/allowance.model");


// ============================
// 🔹 Helpers
// ============================
function diffMinutes(t1, t2) {
  return Math.floor((t2.getTime() - t1.getTime()) / (1000 * 60));
}

function minutesToHHMMSS(minutes) {
  if (!minutes || minutes <= 0) return "00:00:00";
  const h = String(Math.floor(minutes / 60)).padStart(2, "0");
  const m = String(minutes % 60).padStart(2, "0");
  return `${h}:${m}:00`;
}



exports.biometricIngest = async (req, res) => {
  try {
    const { employee_code, log_datetime, log_time, device_sn } = req.body;

    if (!employee_code || !log_datetime || !log_time || !device_sn) {
      return res.status(400).json({
        success: false,
        message: "employee_code, log_datetime, log_time, device_sn are required",
      });
    }

    const empId = parseInt(employee_code, 10);
    if (Number.isNaN(empId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid employee_code",
      });
    }

    const punchTime = dayjs.tz(log_datetime, "Asia/Kolkata");
    if (!punchTime.isValid()) {
      return res.status(400).json({
        success: false,
        message: "Invalid log_datetime format",
      });
    }

    // 🔥 Fetch employee WITH salary dependencies (dynamic)
    const employee = await Employee.findOne({
      where: { employee_id: empId },
      include: [
        { model: Skill, as: "skill", attributes: ["wages"] },
        { model: Branch, as: "branch", attributes: ["working_hours"] },
        { model: Designation, as: "designation", attributes: ["overtime_rate"] }
      ]
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    const biometricLog = await BiometricAttendanceLog.create({
      employee_code: empId,
      log_datetime: punchTime.toDate(),
      log_time,
      device_sn,
      source: "biometric",
      processed: 0,
    });

    const today = punchTime.format("YYYY-MM-DD");
    const yesterday = punchTime.subtract(1, "day").format("YYYY-MM-DD");
    const punchHHMMSS = punchTime.format("HH:mm:ss");

    // ===============================
    // FIND OPEN SHIFT
    // ===============================
    const openAttendance = await AttendanceEmployee.findOne({
      where: {
        employee_id: empId,
        open_shift_flag: 1,
        clock_in: { [Op.ne]: "00:00:00" },
        date: { [Op.in]: [today, yesterday] },
      },
      order: [["date", "ASC"]],
    });

    // ===============================
    // CLOCK OUT
    // ===============================
    if (openAttendance) {

      const inTime = dayjs.tz(
        `${openAttendance.date} ${openAttendance.clock_in}`,
        "Asia/Kolkata"
      );

      let actualOutTime = punchTime;
      if (actualOutTime.isBefore(inTime)) {
        actualOutTime = actualOutTime.add(1, "day");
      }

      const workedMinutes = diffMinutes(
        inTime.toDate(),
        actualOutTime.toDate()
      );

      if (workedMinutes < 60) {
        await biometricLog.update({ processed: 1 });
        return res.json({
          success: true,
          message: "Punch ignored: minimum 1 hour gap required",
        });
      }

      const shift = await Shift.findByPk(openAttendance.shift_id, { raw: true });

      let shiftStart = dayjs.tz(
        `${openAttendance.date} ${shift.start_time}`,
        "Asia/Kolkata"
      );
      let shiftEnd = dayjs.tz(
        `${openAttendance.date} ${shift.end_time}`,
        "Asia/Kolkata"
      );

      if (shiftEnd.isBefore(shiftStart)) {
        shiftEnd = shiftEnd.add(1, "day");
      }

      const shiftMinutes = diffMinutes(
        shiftStart.toDate(),
        shiftEnd.toDate()
      );

      openAttendance.clock_out = punchHHMMSS;
      openAttendance.open_shift_flag = 0;
      openAttendance.total_work = minutesToHHMMSS(workedMinutes);

      let overtimeHours = 0;

      if (workedMinutes > shiftMinutes) {
        const overtimeMinutes = workedMinutes - shiftMinutes;
        openAttendance.overtime = minutesToHHMMSS(overtimeMinutes);
        overtimeHours = overtimeMinutes / 60;
        openAttendance.early_leaving = "00:00:00";
      } else {
        openAttendance.overtime = "00:00:00";
        openAttendance.early_leaving = minutesToHHMMSS(
          shiftMinutes - workedMinutes
        );
      }

      await openAttendance.save();

      // ==========================================
      // 🔥 DYNAMIC OVERTIME INSERT
      // ==========================================
      if (overtimeHours > 0) {

        // 🔹 Salary & Working Hours
const skillWages = Number(employee.skill?.wages || 0);
const branchWorkingHours = Number(employee.branch?.working_hours || 8);
const overtimeRate = Number(employee.designation?.overtime_rate || 1);

// 🔹 Base hourly
const baseHourlyRate =
  branchWorkingHours > 0
    ? skillWages / branchWorkingHours
    : 0;

// 🔹 Fetch Allowances (same logic as salary controller)
const allowances = await Allowance.findAll({
  where: { employee_id: empId }
});

let allowancesTotalPerDay = 0;

allowances.forEach(a => {
  if (String(a.type).toLowerCase() === "percentage") {
    allowancesTotalPerDay +=
      (parseFloat(a.amount) / 100) * skillWages;
  } else {
    allowancesTotalPerDay += parseFloat(a.amount);
  }
});

// 🔹 Allowance per hour
const allowanceHourlyRate =
  branchWorkingHours > 0
    ? allowancesTotalPerDay / branchWorkingHours
    : 0;

// 🔹 FINAL OVERTIME AMOUNT
const overtimeAmount =
  (baseHourlyRate + allowanceHourlyRate) *
  overtimeRate *
  overtimeHours;


        const overtimeDecimalHours = Number(overtimeHours.toFixed(2));
        const numberOfDays = Number(
          (overtimeHours / branchWorkingHours).toFixed(2)
        );

        let existing = await Overtime.findOne({
          where: {
            employee_id: empId,
            date: openAttendance.date,
            deleted_at: null
          }
        });

        if (existing) {
          await existing.update({
            hours: overtimeDecimalHours,
            number_of_days: numberOfDays,
            rate: overtimeRate,
            ot_amount: Number(overtimeAmount.toFixed(2)),
            type: "Auto"
          });
        } else {
          await Overtime.create({
            employee_id: empId,
            date: openAttendance.date,
            title: "Automatic Overtime Entry",
            number_of_days: numberOfDays,
            hours: overtimeDecimalHours,
            rate: overtimeRate,
            ot_amount: Number(overtimeAmount.toFixed(2)),
            type: "Auto",
            created_by: employee.created_by
          });
        }
      }

      await biometricLog.update({ processed: 1 });

      return res.json({
        success: true,
        message: "Biometric clock-out recorded",
      });
    }

    // ===============================
    // CLOCK IN
    // ===============================
    const shifts = await Shift.findAll({ raw: true });
    let matchedShift = null;

    for (const s of shifts) {
      let shiftStart = dayjs.tz(`${today} ${s.start_time}`, "Asia/Kolkata");
      const windowEnd = shiftStart.add(2, "hour");

      if (
        punchTime.isSameOrAfter(shiftStart) &&
        punchTime.isSameOrBefore(windowEnd)
      ) {
        matchedShift = s;
        break;
      }
    }

    if (!matchedShift) {
      await biometricLog.update({ processed: 1 });
      return res.json({
        success: false,
        message: "Punch ignored: outside allowed shift window",
      });
    }

    await AttendanceEmployee.create({
      employee_id: empId,
      shift_id: matchedShift.id,
      date: today,
      status: "Present",
      clock_in: punchHHMMSS,
      clock_out: "00:00:00",
      open_shift_flag: 1,
      late: "00:00:00",
      early_leaving: "00:00:00",
      overtime: "00:00:00",
      total_rest: 0,
      created_by: employee.created_by,
    });

    await biometricLog.update({ processed: 1 });

    return res.json({
      success: true,
      message: "Biometric clock-in recorded",
    });

  } catch (err) {
    if (err.name === "SequelizeUniqueConstraintError") {
  return res.json({
    success: true,
    message: "Duplicate skipped",
  });
}

// minimal structured logging
console.error({
  type: "BIOMETRIC_ERROR",
  message: err.message,
  time: new Date().toISOString(),
});
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};
