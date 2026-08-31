


// const { Op, Sequelize } = require('sequelize');
// const ExcelJS = require("exceljs");
// const moment = require('moment');

// const Payslip = require("../models/payslip.model");
// const Employee = require("../models/employee.model");
// const Allowance = require("../models/allowance.model");
// const Commission = require("../models/commission.model");
// const Loan = require("../models/loan.model");
// const Overtime = require("../models/overtime.model");
// const OtherPayment = require("../models/otherPayment.model");
// const SaturationDeduction = require("../models/saturationDeduction.model");
// const User = require("../models/user.model");

// const Branch = require("../models/branch.model"); 
// const Department = require("../models/department.model"); 
// const Designation = require("../models/designation.model"); 
// const PayslipType = require("../models/payslipType.model");

// const Leave = require("../models/leave.model");
// const ExpenseNew = require("../models/expenseNew.model");
// const DeductionOption = require("../models/deductionOption.model");
// const Holiday = require("../models/holiday.model"); 
// const AttendanceEmployee = require("../models/attendance.model"); 
// const Skill = require("../models/skill.model"); // 🟢 ADDED for skill-based salary

// async function getCompanyId(req) {
//   try {
//     if (!req.user) return null;
    
//     // ???? Pehle check karo user khud company hai ya nahi
//     const type = (req.user.type || '').toLowerCase();
//     if (['company', 'admin', 'super admin'].includes(type)) {
//       return req.user.id;
//     }

//     // ???? Agar employee hai (employees table mein entry hai)
//     const emp = await Employee.findOne({
//       where: { user_id: req.user.id },
//       attributes: ['created_by'],
//       raw: true,
//     });
//     if (emp?.created_by) return Number(emp.created_by);
    
//     // ???? FIX: Branchless users (jaise accountant) ke liye users table se created_by lekar aao
//     const userRecord = await User.findOne({
//       where: { id: req.user.id },
//       attributes: ['created_by'],
//       raw: true,
//     });
    
//     console.log('???? User Record created_by:', userRecord?.created_by);
//     return Number(userRecord?.created_by) || null;
    
//   } catch (err) {
//     console.error('getCompanyId Error:', err);
//     return null;
//   }
// }

// function isSuper(req) {
//   return (req.user?.roles || []).some(r => (r.name || '').toLowerCase() === 'super admin');
// }

// function isCompany(req) {
//   return (req.user?.type || '').toLowerCase() === 'company';
// }

// function isEmployee(req) {
//   return (req.user?.type || '').toLowerCase() === 'employee';
// }

// // 🟩 ADD THIS MISSING HELPER FUNCTION
// function isCompanyUser(req) {
//   const userType = (req.user?.type || '').toLowerCase();
//   return ['company', 'admin', 'super admin'].includes(userType);
// }

// async function getUserBranchId(userId) {
//   if (!userId) return null;
//   const emp = await Employee.findOne({
//     where: { user_id: userId },
//     attributes: ['branch_id'],
//     raw: true,
//   });
//   return emp?.branch_id || null;
// }

// async function getAllUserIdsUnderCompanyBranch(companyId, branchId = null) {
//   if (!companyId) return [];

//   const users = await User.findAll({
//     where: { created_by: companyId },
//     attributes: ['id'],
//     raw: true,
//   });
//   const userIds = users.map(u => Number(u.id));
//   const baseSet = new Set([Number(companyId), ...userIds]);

//   if (branchId) {
//     if (userIds.length === 0) return [Number(companyId)];
//     const emps = await Employee.findAll({
//       where: {
//         user_id: { [Op.in]: userIds },
//         branch_id: branchId,
//       },
//       attributes: ['user_id'],
//       raw: true
//     });
//     const branchUserIds = emps.map(e => Number(e.user_id));
//     return [...new Set([Number(companyId), ...branchUserIds])];
//   }

//   return Array.from(baseSet);
// }

// function computeValue(amount, type, baseSalary) {
//   const val = parseFloat(amount) || 0;
//   const normalizedType = (type || "").toLowerCase();
//   return (normalizedType === "percentage" || normalizedType === "percent") ? (baseSalary * val) / 100 : val;
// }

// // 🟩 IMPROVED: Calculate working days excluding holidays
// async function getWorkingDaysExcludingHolidays(startDate, endDate, companyId) {
//   try {
//     const start = moment(startDate);
//     const end = moment(endDate);
//     let workingDays = 0;
    
//     console.log("📅 Calculating working days for:", {
//       startDate: start.format('YYYY-MM-DD'),
//       endDate: end.format('YYYY-MM-DD'),
//       companyId
//     });

//     // Get all holidays in the date range
//     const holidays = await Holiday.findAll({
//       where: {
//         created_by: companyId,
//         [Op.or]: [
//           // Single day holidays
//           {
//             date: { [Op.between]: [startDate, endDate] },
//             end_date: { [Op.eq]: Sequelize.col('date') } // Single day holiday
//           },
//           // Multi-day holidays that overlap with our date range
//           {
//             date: { [Op.lte]: endDate },
//             end_date: { [Op.gte]: startDate }
//           }
//         ]
//       },
//       attributes: ['date', 'end_date'],
//       raw: true
//     });
    
//     console.log("🎯 Holidays found:", holidays.length);
    
//     // Create a set of all holiday dates
//     const holidayDates = new Set();
//     holidays.forEach(holiday => {
//       const holidayStart = moment(holiday.date);
//       const holidayEnd = moment(holiday.end_date || holiday.date);
      
//       let current = holidayStart.clone();
//       while (current.isSameOrBefore(holidayEnd)) {
//         if (current.isBetween(start, end, null, '[]')) {
//           holidayDates.add(current.format('YYYY-MM-DD'));
//         }
//         current.add(1, 'day');
//       }
//     });

//     console.log("📋 Holiday dates:", Array.from(holidayDates));

//     // Count working days (Monday to Friday) excluding holidays
//     let current = start.clone();
//     while (current.isSameOrBefore(end)) {
//       const dayOfWeek = current.day();
//       const dateStr = current.format('YYYY-MM-DD');
      
//       // Check if it's a weekday (1=Monday to 5=Friday) and not a holiday
//       if (dayOfWeek >= 1 && dayOfWeek <= 5 && !holidayDates.has(dateStr)) {
//         workingDays++;
//       }
//       current.add(1, 'day');
//     }
    
//     console.log("📊 Total working days:", workingDays);
//     return workingDays;
    
//   } catch (error) {
//     console.error('❌ Error calculating working days:', error);
//     // Fallback: calculate weekdays without holidays
//     return getWeekdaysBetween(startDate, endDate);
//   }
// }

// // 🟩 NEW FUNCTION: Calculate weekdays (fallback)
// function getWeekdaysBetween(startDate, endDate) {
//   const start = moment(startDate);
//   const end = moment(endDate);
//   let weekdays = 0;
  
//   let current = start.clone();
//   while (current.isSameOrBefore(end)) {
//     const dayOfWeek = current.day();
//     if (dayOfWeek >= 1 && dayOfWeek <= 5) {
//       weekdays++;
//     }
//     current.add(1, 'day');
//   }
  
//   return weekdays;
// }

// // 🟢 NEW: Helper function to calculate PF and ESI deductions
// function calculateDeduction(deduction, applicableAmount) {
//   const amount = parseFloat(deduction.amount || 0);
//   const type = String(deduction.type || '').toLowerCase();
  
//   if (type === 'percentage') {
//     return (amount / 100) * applicableAmount;
//   }
//   return amount; // fixed amount
// }

// // 🟢 NEW: Helper function to calculate salary from skill
// async function calculateSalaryFromSkill(skillId, branchId) {
//   try {
//     // Get skill wages
//     const skill = await Skill.findByPk(skillId);
//     if (!skill) return 0;
    
//     // Get branch working days
//     const branch = await Branch.findByPk(branchId);
//     if (!branch) return Number(skill.wages); // Fallback to skill wages only
    
//     // Calculate: skill wages × branch working days
//     return Number(skill.wages) * Number(branch.working_days || 26);
//   } catch (error) {
//     console.error('calculateSalaryFromSkill error:', error);
//     return 0;
//   }
// }

// // 🟩 NEW: Check if month is current or past
// function isPastMonth(month, year) {
//   const currentDate = moment();
//   const selectedDate = moment(`${year}-${month}-01`);
//   return selectedDate.isBefore(currentDate, 'month');
// }

// function isCurrentMonth(month, year) {
//   const currentDate = moment();
//   const selectedDate = moment(`${year}-${month}-01`);
//   return selectedDate.isSame(currentDate, 'month');
// }

// async function getNetSalaryCalculation(req, employeeId, month = null, year = null) {
//   return new Promise(async (resolve, reject) => {
//     const mockRes = {
//       statusCode: 200,
//       status: function(code) {
//         this.statusCode = code;
//         return this;
//       },
//       json: function(data) {
//         if (this.statusCode >= 400) {
//           console.error("❌ getNetSalaryCalculation - Error response:", data);
//           reject(new Error(data.message || `Calculation failed with status ${this.statusCode}`));
//         } else {
//           console.log("✅ getNetSalaryCalculation - Success response received");
//           resolve(data);
//         }
//       }
//     };

//     try {
//       const mockReq = {
//         params: { employeeId },
//         user: req.user,
//         query: { month, year }
//       };

//       console.log("🔍 getNetSalaryCalculation calling calculateNetSalary with:", {
//         employeeId, 
//         month, 
//         year,
//         user: req.user?.id
//       });

//       await exports.calculateNetSalary(mockReq, mockRes);
//     } catch (error) {
//       console.error("❌ getNetSalaryCalculation - Unexpected error:", error);
//       reject(new Error("Unexpected error in salary calculation: " + error.message));
//     }
//   });
// }

// // 🟢 ADDED: calculateNetSalary function from setsalary controller (UPDATED VERSION)
// exports.calculateNetSalary = async (req, res) => {
//   try {
//     const employeeBusinessId = req.params.employeeId;
//     if (!employeeBusinessId)
//       return res.status(400).json({ success: false, message: 'employeeId required' });

//     const companyId = await getCompanyId(req);
//     if (!companyId)
//       return res.status(403).json({ success: false, message: 'Unable to resolve company for current user' });

//     // Get target month and year from query parameters
//     const { month, year } = req.query;
//     const targetMonth = month ? parseInt(month) : moment().month() + 1;
//     const targetYear = year ? parseInt(year) : moment().year();
    
//     const startOfMonth = moment(`${targetYear}-${targetMonth.toString().padStart(2, '0')}-01`).startOf('month').format('YYYY-MM-DD');
//     const endOfMonth = moment(`${targetYear}-${targetMonth.toString().padStart(2, '0')}-01`).endOf('month').format('YYYY-MM-DD');
//     const startOfYear = moment(`${targetYear}-01-01`).startOf('year').format('YYYY-MM-DD');
//     const endOfYear = moment(`${targetYear}-12-31`).endOf('year').format('YYYY-MM-DD');
    
//     console.log(`🎯 Calculating salary for ${targetMonth}/${targetYear}`);

//     // Get employee with all required data
//     const employee = await Employee.findOne({
//       where: { employee_id: employeeBusinessId, deleted_at: null },
//       attributes: [
//         'id',
//         'employee_id',
//         'name',
//         'email',
//         'branch_id',
//         'salary',
//         'salary_type',
//         'created_by',
//         'skill_id',
//         'designation_id'
//       ],
//       include: [
//         {
//           model: Skill,
//           as: 'skill',
//           attributes: ['id', 'name', 'wages']
//         },
//         {
//           model: Branch,
//           as: 'branch',
//           attributes: ['id', 'name', 'working_days', 'working_hours']
//         },
//         {
//           model: Designation,
//           as: 'designation',
//           attributes: ['id', 'name', 'overtime_rate']
//         }
//       ]
//     });
    
//     if (!employee)
//       return res.status(404).json({ success: false, message: 'Employee not found' });

//     // Get skill wages and branch data
//     const skillWages = Number(employee.skill?.wages || 0);
//     const branchWorkingDays = Number(employee.branch?.working_days || 26);
//     const branchWorkingHours = Number(employee.branch?.working_hours || 8);
//     const designationOvertimeRate = Number(employee.designation?.overtime_rate || 1);

//     // Calculate Base Salary = Skill Wages × Branch Working Days
//     const baseSalary = skillWages * branchWorkingDays;
//     console.log(`💰 Base Salary Calculation: ${skillWages} × ${branchWorkingDays} = ${baseSalary}`);

//     // Get user IDs for access control
//     const userEmployeeRecord = await Employee.findOne({
//       where: { user_id: req.user.id },
//       attributes: ['branch_id', 'created_by'],
//       raw: true,
//     });

//     let userIds = [];
//     if (userEmployeeRecord && userEmployeeRecord.branch_id) {
//       const branchId = userEmployeeRecord.branch_id;
//       userIds = await getAllUserIdsUnderCompanyBranch(companyId, branchId);
//     } else {
//       userIds = await getAllUserIdsUnderCompanyBranch(companyId, null);
//     }

//     // Month-wise filtering for salary components
//     const commonWhereClause = {
//       created_by: { [Op.in]: userIds },
//       created_at: {
//         [Op.between]: [startOfMonth, endOfMonth]
//       }
//     };

//     // Fetch all payroll components
//     const [allowances, commissions, loans, saturationDeductions, otherPayments, overtimes, employeeAdvances] =
//       await Promise.all([
//         Allowance.findAll({ 
//           where: { 
//             employee_id: employee.employee_id, 
//             ...commonWhereClause 
//           } 
//         }),
//         Commission.findAll({ 
//           where: { 
//             employee_id: employee.id, 
//             ...commonWhereClause 
//           } 
//         }), 
//         Loan.findAll({ 
//           where: { 
//             employee_id: employee.employee_id, 
//             ...commonWhereClause 
//           } 
//         }),
//         SaturationDeduction.findAll({ 
//           where: { 
//             employee_id: employee.employee_id, 
//             ...commonWhereClause 
//           } 
//         }),
//         OtherPayment.findAll({ 
//           where: { 
//             employee_id: employee.employee_id, 
//             ...commonWhereClause 
//           } 
//         }),
//         Overtime.findAll({ 
//           where: { 
//             employee_id: employee.employee_id, 
//             ...commonWhereClause 
//           } 
//         }),
//         ExpenseNew.findAll({ 
//           where: { 
//             employee_id: employee.employee_id, 
//             created_by: { [Op.in]: userIds }, 
//             payments_status: 'paid',
//             payment_date: {
//               [Op.between]: [startOfMonth, endOfMonth]
//             }
//           } 
//         }),
//       ]);

//     // 🟢 FIXED: Calculate allowances
//     const allowancesList = allowances.map((i) => {
//       let computedAmount = 0;
//       const rawAmount = parseFloat(i.amount || 0);
      
//       if (String(i.type || '').toLowerCase() === 'percentage') {
//         computedAmount = (rawAmount / 100) * baseSalary;
//       } else {
//         computedAmount = rawAmount * branchWorkingDays;
//       }
      
//       return {
//         id: i.id,
//         title: i.title,
//         type: i.type,
//         raw_amount: rawAmount,
//         computed_amount: Number(computedAmount.toFixed(2)),
//         created_at: i.created_at,
//       };
//     });

//     const commissionsList = commissions.map((i) => ({
//       id: i.id,
//       title: i.title,
//       type: i.type,
//       raw_amount: parseFloat(i.amount || 0),
//       computed_amount: Number(computeValue(i.amount, i.type, baseSalary).toFixed(2)),
//       created_at: i.created_at,
//     }));

//     const otherPaymentsList = otherPayments.map((i) => ({
//       id: i.id,
//       title: i.title,
//       type: i.type,
//       raw_amount: parseFloat(i.amount || 0),
//       computed_amount: Number(computeValue(i.amount, i.type, baseSalary).toFixed(2)),
//       created_at: i.created_at,
//     }));

//     const overtimeList = overtimes.map((o) => {
//       const otHours = parseFloat(o.hours || o.ot_hours || 0);
//       const hourlyRate = skillWages / branchWorkingHours;
//       const overtimeAmount = designationOvertimeRate * hourlyRate * otHours;
      
//       return {
//         id: o.id,
//         title: o.title,
//         date: o.date,
//         ot_hours: otHours,
//         hourly_rate: Number(hourlyRate.toFixed(2)),
//         overtime_rate: designationOvertimeRate,
//         computed_amount: Number(overtimeAmount.toFixed(2)),
//         created_at: o.created_at,
//       };
//     });

//     const loansList = loans.map((i) => ({
//       id: i.id,
//       title: i.title,
//       type: i.type,
//       raw_amount: parseFloat(i.amount || 0),
//       computed_amount: Number(computeValue(i.amount, i.type, baseSalary).toFixed(2)),
//       created_at: i.created_at,
//     }));

//     // 🟢 CRITICAL FIX: Use TITLE field for PF/ESI identification (same as set salary)
//     const saturationList = saturationDeductions.map((sd) => {
//       const rawAmount = parseFloat(sd.amount || 0);
//       const type = String(sd.type || '').toLowerCase();
//       // 🟢 Use title field to identify PF/ESI deductions
//       const deductionType = String(sd.title || '').toUpperCase();
      
//       return {
//         id: sd.id,
//         title: sd.title,
//         type: sd.type,
//         deduction_type: deductionType, // 🟢 Changed from deduction_option
//         raw_amount: rawAmount,
//         computed_amount: 0, // Will be calculated later
//         created_at: sd.created_at,
//       };
//     });

//     const advancesList = employeeAdvances.map(a => ({
//       id: a.id,
//       title: 'Advance Payment',
//       payment_date: a.payment_date,
//       total_amount: Number(a.total_amount || 0),
//       computed_amount: Number(a.total_amount || 0),
//       created_at: a.created_at,
//     }));

//     const sum = (arr) => arr.reduce((a, b) => a + b.computed_amount, 0);

//     // Calculate totals
//     const allowancesTotal = sum(allowancesList);
//     const commissionsTotal = sum(commissionsList);
//     const otherPaymentsTotal = sum(otherPaymentsList);
//     const overtimeTotal = sum(overtimeList);
//     const loansTotal = sum(loansList);
//     const advancesTotal = sum(advancesList);

//     // Calculate PF/ESI applicable amounts
//     const pfApplicableAmount = baseSalary + overtimeTotal + allowancesTotal;
//     const esiApplicableAmount = baseSalary + allowancesTotal + otherPaymentsTotal + commissionsTotal;

//     // 🟢 CRITICAL FIX: Process saturation deductions using TITLE field
//     let totalPFDeduction = 0;
//     let totalESIDeduction = 0;
//     let otherDeductions = 0;
    
//     saturationList.forEach(sd => {
//       const deductionType = String(sd.deduction_type || '').toUpperCase();
//       const rawAmount = sd.raw_amount;
//       const type = String(sd.type || '').toLowerCase();
      
//       let applicableAmount = 0;
//       if (deductionType === 'PF') {
//         applicableAmount = pfApplicableAmount;
//       } else if (deductionType === 'ESI') {
//         applicableAmount = esiApplicableAmount;
//       } else {
//         applicableAmount = baseSalary;
//       }
      
//       let computedAmount = 0;
//       if (type === 'percentage') {
//         computedAmount = (rawAmount / 100) * applicableAmount;
//       } else {
//         computedAmount = rawAmount;
//       }
      
//       sd.computed_amount = Number(computedAmount.toFixed(2));
      
//       if (deductionType === 'PF') {
//         totalPFDeduction += computedAmount;
//       } else if (deductionType === 'ESI') {
//         totalESIDeduction += computedAmount;
//       } else {
//         otherDeductions += computedAmount;
//       }
      
//       console.log(`   ${sd.title} (${deductionType} - ${type}): ${rawAmount}${type === 'percentage' ? '%' : ''} → ${computedAmount}`);
//     });
    
//     const saturationTotal = totalPFDeduction + totalESIDeduction + otherDeductions;

//     // 🟢 Leave calculation
//     const leavesUpToCurrentMonth = await Leave.findAll({
//       where: {
//         employee_id: employee.id,
//         status: 'Approved',
//         [Op.or]: [
//           { start_date: { [Op.between]: [startOfYear, endOfMonth] } },
//           { end_date: { [Op.between]: [startOfYear, endOfMonth] } },
//           {
//             [Op.and]: [
//               { start_date: { [Op.lte]: startOfYear } },
//               { end_date: { [Op.gte]: endOfMonth } }
//             ]
//           }
//         ]
//       },
//       attributes: ['id', 'start_date', 'end_date', 'total_leave_days'],
//       raw: true
//     });
    
//     const cumulativeLeavesUpToCurrent = leavesUpToCurrentMonth.reduce((sum, leave) => {
//       const days = parseFloat(leave.total_leave_days || 0);
//       return sum + (isNaN(days) ? 0 : days);
//     }, 0);
    
//     let deductibleLeavesThisMonth = 0;
//     let freeLeavesRemaining = 18;
//     let cumulativeDeductibleLeaves = 0;
    
//     if (cumulativeLeavesUpToCurrent > 18) {
//       deductibleLeavesThisMonth = cumulativeLeavesUpToCurrent - 18;
//       freeLeavesRemaining = 0;
//       cumulativeDeductibleLeaves = deductibleLeavesThisMonth;
//     } else {
//       freeLeavesRemaining = 18 - cumulativeLeavesUpToCurrent;
//       deductibleLeavesThisMonth = 0;
//       cumulativeDeductibleLeaves = 0;
//     }
    
//     const dailySalary = baseSalary / 30;
//     const leaveDeductionThisMonth = deductibleLeavesThisMonth * dailySalary;

//     // Calculate final totals
//     const additionsTotal = allowancesTotal + commissionsTotal + otherPaymentsTotal + overtimeTotal;
//     const gross = baseSalary + additionsTotal;
//     const deductionsTotal = loansTotal + saturationTotal + advancesTotal + leaveDeductionThisMonth;
//     const netSalary = Number((gross - deductionsTotal).toFixed(2));
    
//     console.log(`✅ Final Calculation:`);
//     console.log(`   Gross Salary: ${gross}`);
//     console.log(`   Total Deductions: ${deductionsTotal}`);
//     console.log(`   Net Salary: ${netSalary}`);
    
//     return res.status(200).json({
//       success: true,
//       data: {
//         period: {
//           month: targetMonth,
//           year: targetYear,
//           start_date: startOfMonth,
//           end_date: endOfMonth,
//           display: moment(`${targetYear}-${targetMonth.toString().padStart(2, '0')}-01`).format('MMMM YYYY')
//         },
//         employee: {
//           employee_id: employee.employee_id,
//           name: employee.name,
//           branch_id: employee.branch_id,
//           salary_type: employee.salary_type,
//           base_salary_calculation: {
//             skill_wages: skillWages,
//             branch_working_days: branchWorkingDays,
//             calculated_base_salary: baseSalary
//           },
//           stored_salary: employee.salary,
//         },
//         progressive_leave_summary: {
//           cumulative_leaves_upto_current: cumulativeLeavesUpToCurrent,
//           current_month_leaves: 0, // You might want to calculate this too
//           free_leaves_allowed: 18,
//           free_leaves_remaining: freeLeavesRemaining,
//           deductible_leaves_this_month: deductibleLeavesThisMonth,
//           cumulative_deductible_leaves: cumulativeDeductibleLeaves,
//           daily_salary: Number(dailySalary.toFixed(2)),
//           leave_deduction_this_month: Number(leaveDeductionThisMonth.toFixed(2))
//         },
//         breakdown: {
//           base_salary_calculation: {
//             skill_wages: skillWages,
//             branch_working_days: branchWorkingDays,
//             calculated_amount: baseSalary
//           },
//           base_salary: baseSalary,
//           allowances: allowancesList,
//           allowances_total: allowancesTotal,
//           commissions: commissionsList,
//           commissions_total: commissionsTotal,
//           other_payments: otherPaymentsList,
//           other_payments_total: otherPaymentsTotal,
//           overtime: overtimeList,
//           overtime_calculation: {
//             skill_wages: skillWages,
//             branch_working_hours: branchWorkingHours,
//             designation_overtime_rate: designationOvertimeRate,
//             hourly_rate: Number((skillWages / branchWorkingHours).toFixed(2))
//           },
//           overtime_total: overtimeTotal,
//           loans: loansList,
//           loans_total: loansTotal,
//           saturation_deductions: saturationList,
//           saturation_deduction_breakdown: {
//             pf_deductions: {
//               applicable_amount: pfApplicableAmount,
//               total: totalPFDeduction
//             },
//             esi_deductions: {
//               applicable_amount: esiApplicableAmount,
//               total: totalESIDeduction
//             },
//             other_deductions: otherDeductions
//           },
//           saturation_total: saturationTotal,
//           advances: advancesList,
//           advances_total: advancesTotal,
//           totals: {
//             additions: additionsTotal,
//             deductions: deductionsTotal,
//             gross,
//             net: netSalary,
//           },
//         },
//       },
//     });
//   } catch (err) {
//     console.error('❌ Calculate Net Salary Error:', err);
//     return res.status(500).json({ success: false, message: 'Server Error', error: err.message });
//   }
// };



// exports.bulkCreatePayslipsForMonth = async (req, res) => {
//   try {
//     console.log('🚀 START bulkCreatePayslipsForMonth');

//     const { month, year, branch_ids, recalculate_existing = false } = req.body;
    
//     if (!month || !year) {
//       return res.status(400).json({ 
//         success: false, 
//         message: "Month and year are required" 
//       });
//     }

//     const companyId = await getCompanyId(req);
//     if (!companyId && !isSuper(req)) {
//       return res.status(403).json({ success: false, message: 'Unauthorized' });
//     }

//     const userId = req.user.id;
//     const userType = (req.user.type || "").toLowerCase();
//     const salary_month = `${year}-${String(month).padStart(2, "0")}`;

//     console.log("🎯 Bulk Payslip Generation Request:", {
//       month,
//       year,
//       salary_month,
//       branch_ids,
//       recalculate_existing,
//       userType,
//       userId,
//       companyId
//     });

//     // Check if month is in future
//     const currentDate = moment();
//     const requestedDate = moment(`${year}-${month}-01`);

//     if (requestedDate.isAfter(currentDate, 'month')) {
//       return res.status(400).json({
//         success: false,
//         message: "Cannot generate payslips for future months",
//         data: [],
//         summary: {
//           month: parseInt(month),
//           year: parseInt(year),
//           salary_month,
//           error: "Future month not allowed"
//         }
//       });
//     }

//     // =======================================================
//     // 🔹 BRANCH ACCESS & VALIDATION
//     // =======================================================
//     let targetBranchIds = [];

//     const isAccountant = userType === 'accountant';
    
//     if (isSuper(req)) {
//       console.log('👑 Super Admin - Full branch access');
//       if (branch_ids && branch_ids.length > 0) {
//         targetBranchIds = branch_ids;
//       } else {
//         const allBranches = await Branch.findAll({
//           attributes: ["id"],
//           raw: true,
//         });
//         targetBranchIds = allBranches.map(b => b.id);
//       }
//     } else if (isCompany(req) || isAccountant) {
//       console.log('🏢 Company User/Accountant - Company branches access');
      
//       if (branch_ids && branch_ids.length > 0) {
//         const validBranches = await Branch.findAll({
//           where: { 
//             id: { [Op.in]: branch_ids },
//             created_by: companyId 
//           },
//           attributes: ["id"],
//           raw: true,
//         });
//         targetBranchIds = validBranches.map(b => b.id);
        
//         if (targetBranchIds.length === 0) {
//           return res.status(400).json({ 
//             success: false, 
//             message: "No valid branches found for the company" 
//           });
//         }
//       } else {
//         const companyBranches = await Branch.findAll({
//           where: { created_by: companyId },
//           attributes: ["id"],
//           raw: true,
//         });
//         targetBranchIds = companyBranches.map(b => b.id);
        
//         if (targetBranchIds.length === 0) {
//           return res.status(404).json({ 
//             success: false, 
//             message: "No branches found for this company" 
//           });
//         }
//       }
//     } else {
//       console.log('🏢 Branch User - Limited branch access');
//       const branchUser = await Employee.findOne({
//         where: { user_id: userId },
//         attributes: ["branch_id"],
//         raw: true,
//       });

//       if (!branchUser || !branchUser.branch_id) {
//         return res.status(403).json({ success: false, message: "Branch not found for user" });
//       }

//       targetBranchIds = [branchUser.branch_id];
//     }

//     if (targetBranchIds.length === 0) {
//       return res.status(404).json({ 
//         success: false, 
//         message: "No branches found for access" 
//       });
//     }

//     console.log('🎯 Final Target Branch IDs:', targetBranchIds);

//     // =======================================================
//     // 🔹 GET ALL EMPLOYEES
//     // =======================================================
//     const salaryMonthEnd = moment(`${year}-${month}-01`).endOf('month');

//     const allEmployees = await Employee.findAll({
//       where: { 
//         branch_id: { [Op.in]: targetBranchIds },
//         deleted_at: null
//       },
//       attributes: ["id", "employee_id", "name", "salary", "branch_id", "company_doj"],
//       raw: true
//     });

//     if (allEmployees.length === 0) {
//       return res.status(404).json({ 
//         success: false, 
//         message: "No employees found for the specified branches",
//         data: []
//       });
//     }

//     console.log(`👥 Found ${allEmployees.length} total employees across ${targetBranchIds.length} branches`);

//     // Filter employees by date of joining
//     const eligibleEmployees = allEmployees.filter(employee => {
//       if (!employee.company_doj) {
//         return true;
//       }
      
//       const joinDate = moment(employee.company_doj);
//       const isEligible = joinDate.isSameOrBefore(salaryMonthEnd, 'day');
      
//       if (!isEligible) {
//         console.log(`⏩ SKIPPING employee ${employee.name} (${employee.employee_id}) - Joined: ${joinDate.format('YYYY-MM-DD')}, Payslip Month: ${salary_month}`);
//       }
      
//       return isEligible;
//     });

//     console.log(`📊 Employee Eligibility Summary:`, {
//       total_employees: allEmployees.length,
//       eligible_employees: eligibleEmployees.length,
//       skipped_employees: allEmployees.length - eligibleEmployees.length,
//       eligibility_rate: ((eligibleEmployees.length / allEmployees.length) * 100).toFixed(2) + '%'
//     });

//     if (eligibleEmployees.length === 0) {
//       return res.status(404).json({ 
//         success: false, 
//         message: `No eligible employees found for ${salary_month}. All employees joined after this month.`,
//         data: [],
//         summary: {
//           month: parseInt(month),
//           year: parseInt(year),
//           salary_month,
//           total_employees: allEmployees.length,
//           eligible_employees: 0,
//           skipped_due_to_doj: allEmployees.length
//         }
//       });
//     }

//     // =======================================================
//     // 🔹 CHECK EXISTING PAYSLIPS
//     // =======================================================
//     const existingPayslips = await Payslip.findAll({
//       where: {
//         employee_id: { [Op.in]: eligibleEmployees.map(emp => emp.employee_id) },
//         salary_month,
//         is_deleted: false
//       }
//     });

//     console.log(`🔍 Found ${existingPayslips.length} existing payslips for ${salary_month}`);

//     if (existingPayslips.length > 0 && !recalculate_existing) {
//       console.log(`ℹ️ ${existingPayslips.length} payslips already exist for ${salary_month}, returning existing data`);
      
//       const transformedPayslips = await Promise.all(
//         existingPayslips.map(async (payslip) => {
//           const employee = eligibleEmployees.find(emp => {
//             const empId = String(emp.employee_id);
//             const payslipId = String(payslip.employee_id);
//             return empId === payslipId;
//           });
          
//           return {
//             ...payslip.toJSON(),
//             status: payslip.status === 1 ? "paid" : "unpaid",
//             employee: employee ? {
//               id: employee.id,
//               name: employee.name,
//               employee_id: employee.employee_id
//             } : {
//               id: null,
//               name: "Employee Not Found",
//               employee_id: payslip.employee_id
//             }
//           };
//         })
//       );

//       return res.status(200).json({
//         success: true,
//         message: `Payslips already exist for ${salary_month}. Returning existing data. Use recalculate_existing=true to update with current payroll data.`,
//         data: transformedPayslips,
//         summary: {
//           month: parseInt(month),
//           year: parseInt(year),
//           salary_month,
//           total_employees: allEmployees.length,
//           eligible_employees: eligibleEmployees.length,
//           existing_payslips: existingPayslips.length,
//           skipped_due_to_doj: allEmployees.length - eligibleEmployees.length,
//           action: "retrieved_existing",
//           note: "Set recalculate_existing=true to update payslips with current payroll data"
//         }
//       });
//     }

//     // =======================================================
//     // 🔹 PROCESS EMPLOYEES
//     // =======================================================
//     const results = {
//       total_employees: allEmployees.length,
//       eligible_employees: eligibleEmployees.length,
//       total_branches: targetBranchIds.length,
//       payslips_created: 0,
//       payslips_updated: 0,
//       payslips_failed: 0,
//       skipped_due_to_doj: allEmployees.length - eligibleEmployees.length,
//       branch_wise_summary: {},
//       details: [],
//       payslips: []
//     };

//     const BATCH_SIZE = 5; // Increased batch size for better performance
//     const batches = [];
    
//     for (let i = 0; i < eligibleEmployees.length; i += BATCH_SIZE) {
//       batches.push(eligibleEmployees.slice(i, i + BATCH_SIZE));
//     }

//     console.log(`🔄 Processing ${batches.length} batches of ${eligibleEmployees.length} eligible employees`);
//     if (recalculate_existing && existingPayslips.length > 0) {
//       console.log(`🔄 RECALCULATION MODE: Will update ${existingPayslips.length} existing payslips with current payroll data`);
//     }

//     for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
//       const batch = batches[batchIndex];
//       console.log(`📦 Processing batch ${batchIndex + 1}/${batches.length} with ${batch.length} employees`);
      
//       // Process each employee in parallel within the batch
//       const batchPromises = batch.map(async (employee) => {
//         try {
//           console.log(`🔍 Processing employee: ${employee.name} (ID: ${employee.employee_id})`);

//           // Check if payslip already exists for this month
//           const existingPayslip = await Payslip.findOne({
//             where: {
//               employee_id: employee.employee_id,
//               salary_month,
//               is_deleted: false
//             }
//           });

//           // 🟢 Calculate salary using the same method as createPayslipsForMonth
//           let netSalaryData;
//           try {
//             const mockReq = {
//               params: { employeeId: employee.employee_id },
//               user: req.user || { id: companyId, type: 'company' },
//               query: { month, year }
//             };
            
//             const calculationPromise = new Promise((resolve, reject) => {
//               const mockRes = {
//                 statusCode: 200,
//                 status: function(code) {
//                   this.statusCode = code;
//                   return this;
//                 },
//                 json: function(data) {
//                   if (this.statusCode >= 400) {
//                     reject(new Error(data.message || `HTTP ${this.statusCode}`));
//                   } else {
//                     resolve(data);
//                   }
//                 }
//               };
              
//               exports.calculateNetSalary(mockReq, mockRes).catch(reject);
//             });
            
//             const result = await calculationPromise;
            
//             if (!result || !result.success) {
//               throw new Error(result?.message || 'Calculation returned unsuccessful');
//             }
            
//             netSalaryData = result.data;
            
//           } catch (error) {
//             console.error("❌ Salary calculation error for", employee.name, ":", error.message);
//             throw error;
//           }

//           // Extract values (same as createPayslipsForMonth)
//           const net_payble = netSalaryData.breakdown?.totals?.net || 0;
//           const leaveDeduction = netSalaryData.progressive_leave_summary?.leave_deduction_this_month || 0;
//           const baseSalary = netSalaryData.employee?.base_salary_calculation?.calculated_base_salary || 
//                             netSalaryData.employee?.stored_salary || 
//                             employee.salary || 
//                             0;

//           // 🟢 Create component_details (same as createPayslipsForMonth)
//           const component_details = {
//             base_salary_calculation: netSalaryData.employee?.base_salary_calculation || {},
//             allowances: netSalaryData.breakdown?.allowances || [],
//             commissions: netSalaryData.breakdown?.commissions || [],
//             other_payments: netSalaryData.breakdown?.other_payments || [],
//             loans: netSalaryData.breakdown?.loans || [],
//             saturation_deductions: netSalaryData.breakdown?.saturation_deductions || [],
//             saturation_deduction_breakdown: netSalaryData.breakdown?.saturation_deduction_breakdown || {},
//             overtimes: netSalaryData.breakdown?.overtime || [],
//             overtime_calculation: netSalaryData.breakdown?.overtime_calculation || {},
//             advances: netSalaryData.breakdown?.advances || [],
//             progressive_leave_summary: netSalaryData.progressive_leave_summary || {},
//             totals: netSalaryData.breakdown?.totals || {},
//             period: netSalaryData.period || {},
//             calculation_timestamp: new Date().toISOString(),
//             calculation_method: 'skill_based',
//             version: '2.0'
//           };

//           let payslip;
//           let action = 'created';

//           if (existingPayslip) {
//             // UPDATE existing payslip with current data
//             console.log(`🔄 UPDATING existing payslip for ${employee.name} with current payroll data`);
            
//             payslip = await existingPayslip.update({
//               basic_salary: baseSalary,
//               allowance: netSalaryData.breakdown?.allowances_total || 0,
//               commission: netSalaryData.breakdown?.commissions_total || 0,
//               overtime: netSalaryData.breakdown?.overtime_total || 0,
//               other_payment: netSalaryData.breakdown?.other_payments_total || 0,
//               loan: netSalaryData.breakdown?.loans_total || 0,
//               saturation_deduction: netSalaryData.breakdown?.saturation_total || 0,
//               advance_payment: netSalaryData.breakdown?.advances_total || 0,
//               leave_deduction: leaveDeduction,
//               net_payble,
//               component_details: component_details,
//               updated_at: new Date()
//             });

//             action = 'updated';
//             results.payslips_updated++;
//           } else {
//             // Create new payslip
//             console.log(`✅ CREATING new payslip for ${employee.name}`);
            
//             payslip = await Payslip.create({
//               employee_id: employee.employee_id,
//               employee_primary_id: employee.id,
//               created_by: userId,
//               salary_month,
//               basic_salary: baseSalary,
//               allowance: netSalaryData.breakdown?.allowances_total || 0,
//               commission: netSalaryData.breakdown?.commissions_total || 0,
//               overtime: netSalaryData.breakdown?.overtime_total || 0,
//               other_payment: netSalaryData.breakdown?.other_payments_total || 0,
//               loan: netSalaryData.breakdown?.loans_total || 0,
//               saturation_deduction: netSalaryData.breakdown?.saturation_total || 0,
//               advance_payment: netSalaryData.breakdown?.advances_total || 0,
//               leave_deduction: leaveDeduction,
//               net_payble,
//               status: 0,
//               component_details: component_details,
//             });

//             action = 'created';
//             results.payslips_created++;
//           }

//           // Update branch summary
//           if (!results.branch_wise_summary[employee.branch_id]) {
//             results.branch_wise_summary[employee.branch_id] = {
//               created: 0,
//               updated: 0,
//               failed: 0
//             };
//           }

//           if (action === 'created') {
//             results.branch_wise_summary[employee.branch_id].created++;
//           } else {
//             results.branch_wise_summary[employee.branch_id].updated++;
//           }

//           // Add to details
//           results.details.push({
//             employee_id: employee.employee_id,
//             employee_name: employee.name,
//             branch_id: employee.branch_id,
//             status: action,
//             payslip_id: payslip.id,
//             net_payble: net_payble,
//             note: action === 'updated' ? 'Updated with current payroll data' : 'New payslip created'
//           });

//           // Return minimal payslip data for batch processing
//           return {
//             success: true,
//             payslip_id: payslip.id,
//             employee_id: employee.employee_id,
//             employee_name: employee.name,
//             action: action,
//             net_payble: net_payble,
//             status: "unpaid"
//           };

//         } catch (employeeError) {
//           console.error(`❌ Failed to process payslip for ${employee.name}:`, employeeError.message);
//           results.payslips_failed++;
          
//           if (!results.branch_wise_summary[employee.branch_id]) {
//             results.branch_wise_summary[employee.branch_id] = {
//               created: 0,
//               updated: 0,
//               failed: 0
//             };
//           }
//           results.branch_wise_summary[employee.branch_id].failed++;

//           results.details.push({
//             employee_id: employee.employee_id,
//             employee_name: employee.name,
//             branch_id: employee.branch_id,
//             status: 'failed',
//             reason: employeeError.message
//           });

//           return {
//             success: false,
//             employee_id: employee.employee_id,
//             employee_name: employee.name,
//             error: employeeError.message
//           };
//         }
//       });

//       // Wait for all employees in this batch to complete
//       const batchResults = await Promise.all(batchPromises);
      
//       // Add successful results to payslips array
//       batchResults.forEach(result => {
//         if (result.success) {
//           results.payslips.push(result);
//         }
//       });

//       // Add delay between batches to prevent overwhelming the system
//       if (batchIndex < batches.length - 1) {
//         await new Promise(resolve => setTimeout(resolve, 500));
//       }
//     }

//     // =======================================================
//     // 🔹 FINAL RESPONSE
//     // =======================================================
//     const totalProcessed = results.payslips_created + results.payslips_updated;
//     const successRate = results.eligible_employees > 0 ? ((totalProcessed / results.eligible_employees) * 100).toFixed(2) + '%' : '0%';

//     const response = {
//       success: true,
//       message: recalculate_existing ? 
//         "Bulk payslip recalculation completed" : 
//         "Bulk payslip generation completed",
//       data: results.payslips,
//       summary: {
//         month: parseInt(month),
//         year: parseInt(year),
//         salary_month,
//         total_branches: results.total_branches,
//         total_employees: results.total_employees,
//         eligible_employees: results.eligible_employees,
//         payslips_created: results.payslips_created,
//         payslips_updated: results.payslips_updated,
//         payslips_failed: results.payslips_failed,
//         skipped_due_to_doj: results.skipped_due_to_doj,
//         success_rate: successRate,
//         recalculated: recalculate_existing,
//         action: recalculate_existing ? 'recalculated_existing' : 'generated_new'
//       },
//       branch_wise_summary: results.branch_wise_summary,
//       details: results.details
//     };

//     console.log(`📊 FINAL PAYSLIP GENERATION SUMMARY:`);
//     console.log(`   - Total Employees: ${results.total_employees}`);
//     console.log(`   - Eligible Employees: ${results.eligible_employees}`);
//     console.log(`   - Payslips Created: ${results.payslips_created}`);
//     console.log(`   - Payslips Updated: ${results.payslips_updated}`);
//     console.log(`   - Payslips Failed: ${results.payslips_failed}`);
//     console.log(`   - Skipped due to DOJ: ${results.skipped_due_to_doj}`);

//     return res.status(200).json(response);

//   } catch (err) {
//     console.error("❌ Error in bulk payslip generation:", err);
//     return res.status(500).json({ 
//       success: false, 
//       message: "Failed to generate payslips in bulk",
//       error: err.message,
//       data: []
//     });
//   }
// };


// // exports.getAllPayslips = async (req, res) => {
// //   try {
// //     console.log('???? START getAllPayslips');
// //     console.log('???? User Info - ID:', req.user.id, 'Type:', req.user.type);

// //     const companyId = await getCompanyId(req);
// //     if (!companyId && !isSuper(req)) {
// //       return res.status(403).json({ success: false, message: 'Unauthorized' });
// //     }

// //     const userEmployeeRecord = await Employee.findOne({
// //       where: { user_id: req.user.id },
// //       attributes: ['branch_id', 'created_by'],
// //       raw: true,
// //     });

// //     console.log('???? User Employee Record:', userEmployeeRecord);

// //     let userBranchId = null;

// //     if (userEmployeeRecord && userEmployeeRecord.branch_id) {
// //       console.log('???? Branch User - Fetching payslips');
// //       userBranchId = userEmployeeRecord.branch_id;
// //     } else {
// //       console.log('???? Branchless User - Fetching payslips');
// //     }

// //     const userType = (req.user.type || '').toLowerCase();
// //     const isAccountant = userType === 'accountant';
    
// //     console.log('???? User Type Check:', { userType, isAccountant, isCompany: isCompany(req), isSuper: isSuper(req), isEmployee: isEmployee(req) });

// //     if (!isCompany(req) && !isSuper(req) && !isAccountant && userEmployeeRecord && !userBranchId) {
// //       console.log('???? RESTRICTING: Branch user without branch assignment');
// //       return res.status(403).json({ success: false, message: 'No branch assigned' });
// //     }

// //     // FIX 1: Handle parameter order correctly
// //     const { month, year } = req.params;
    
// //     // Debug log for parameters
// //     console.log('???? Received Parameters:', { month, year, params: req.params });
    
// //     // Determine actual month and year (handle swapped parameters)
// //     let actualMonth, actualYear;
    
// //     if (parseInt(month) > 12) {
// //       // If month > 12, it's likely the year was passed as month
// //       console.log('???? Swapping month/year parameters (month > 12)');
// //       actualYear = parseInt(month);
// //       actualMonth = parseInt(year);
// //     } else {
// //       actualMonth = parseInt(month);
// //       actualYear = parseInt(year);
// //     }
    
// //     // Validate month and year
// //     if (!actualMonth || !actualYear || isNaN(actualMonth) || isNaN(actualYear) || actualMonth < 1 || actualMonth > 12) {
// //       return res.status(400).json({ 
// //         success: false, 
// //         message: "Invalid month or year. Month must be between 1-12 and year must be valid.",
// //         received: { month, year },
// //         interpreted: { actualMonth, actualYear }
// //       });
// //     }
    
// //     console.log('???? Final Month/Year:', { actualMonth, actualYear });

// //     const branch_ids = req.query.branch_ids ? 
// //       (Array.isArray(req.query.branch_ids) ? req.query.branch_ids : [req.query.branch_ids]) : 
// //       undefined;

// //     // FIX 2: Create multiple possible salary_month formats
// //     const salary_month = `${actualYear}-${String(actualMonth).padStart(2, "0")}`;
// //     const salary_month_variations = [
// //       salary_month, // "2025-01"
// //       `${actualYear}-${actualMonth}`, // "2025-1"
// //       `${actualMonth}-${actualYear}`, // "1-2025" (what your curl shows)
// //       `${actualMonth}/${actualYear}`, // "1/2025"
// //       `${String(actualMonth).padStart(2, "0")}-${actualYear}`, // "01-2025"
// //       `${actualYear}${String(actualMonth).padStart(2, "0")}`, // "202501"
// //       `${actualYear}-${String(actualMonth).padStart(2, "0")}-01`, // "2025-01-01"
// //     ];

// //     console.log("🚀 Fetching Payslips Request:", {
// //       original_params: { month, year },
// //       actual_params: { actualMonth, actualYear },
// //       salary_month: salary_month,
// //       salary_month_variations: salary_month_variations,
// //       branch_ids,
// //       userType: req.user.type,
// //       userId: req.user.id,
// //       companyId,
// //       userBranchId,
// //       isAccountant
// //     });

// //     // FIX 3: Less restrictive future month check (comment out or modify as needed)
// //     const currentDate = moment();
// //     const requestedDate = moment(`${actualYear}-${String(actualMonth).padStart(2, "0")}-01`);
    
// //     console.log('???? Date Check:', {
// //       currentDate: currentDate.format('YYYY-MM-DD'),
// //       requestedDate: requestedDate.format('YYYY-MM-DD'),
// //       isFuture: requestedDate.isAfter(currentDate, 'month')
// //     });

// //     if (requestedDate.isAfter(currentDate, 'month')) {
// //       console.log('???? Requesting future month data, allowing with warning');
// //       // Optional: You can decide whether to allow future months
// //       // return res.status(400).json({
// //       //   success: false,
// //       //   message: "Cannot fetch payslips for future months",
// //       //   data: []
// //       // });
// //     }

// //     let targetBranchIds = [];

// //     if (isSuper(req)) {
// //       console.log('???? Super Admin - Full branch access');
// //       if (branch_ids && branch_ids.length > 0) {
// //         targetBranchIds = branch_ids;
// //       } else {
// //         const allBranches = await Branch.findAll({
// //           attributes: ["id"],
// //           raw: true,
// //         });
// //         targetBranchIds = allBranches.map(b => b.id);
// //       }
// //     } else if (isCompany(req) || isAccountant) {
// //       console.log('???? Company User/Accountant - Company branches access');
      
// //       if (branch_ids && branch_ids.length > 0) {
// //         const validBranches = await Branch.findAll({
// //           where: { 
// //             id: { [Op.in]: branch_ids },
// //             created_by: companyId 
// //           },
// //           attributes: ["id"],
// //           raw: true,
// //         });
// //         targetBranchIds = validBranches.map(b => b.id);
        
// //         if (targetBranchIds.length === 0) {
// //           return res.status(400).json({ 
// //             success: false, 
// //             message: "No valid branches found for the company" 
// //           });
// //         }
// //       } else {
// //         const companyBranches = await Branch.findAll({
// //           where: { created_by: companyId },
// //           attributes: ["id"],
// //           raw: true,
// //         });
// //         targetBranchIds = companyBranches.map(b => b.id);
        
// //         if (targetBranchIds.length === 0) {
// //           console.log('???? No branches found for company:', companyId);
// //           // Don't return error here, just continue with empty array
// //         }
// //       }
// //     } else {
// //       console.log('???? Branch User/Employee - Limited branch access');
// //       if (!userBranchId) {
// //         return res.status(403).json({ success: false, message: 'No branch assigned' });
// //       }
// //       targetBranchIds = [userBranchId];
// //     }

// //     if (targetBranchIds.length === 0 && !isSuper(req)) {
// //       console.log('???? No branch access for user');
// //       // Return empty data instead of error for better UX
// //       return res.status(200).json({
// //         success: true,
// //         message: "No branch access available",
// //         data: [],
// //         summary: {
// //           month: actualMonth,
// //           year: actualYear,
// //           salary_month: `${actualMonth}-${actualYear}`,
// //           total_payslips: 0,
// //           total_unpaid: 0,
// //           total_paid: 0,
// //           total_amount: 0
// //         }
// //       });
// //     }

// //     console.log('???? Final Target Branch IDs:', targetBranchIds);

// //     // =======================================================
// //     // 🔹 FIXED: GET PAYSLIPS WITH MULTIPLE FORMATS
// //     // =======================================================
// //     console.log('???? Querying payslips with salary_month variations');
    
// //     const payslips = await Payslip.findAll({
// //       where: {
// //         salary_month: { [Op.in]: salary_month_variations },
// //         is_deleted: false,
// //         created_by: companyId
// //       },
// //       order: [["created_at", "DESC"]],
// //       raw: true
// //     });

// //     console.log(`🔍 Found ${payslips.length} payslips for month ${actualMonth}/${actualYear}`);

// //     // Debug: Check database for available months
// //     if (payslips.length === 0) {
// //       // Get a sample of available salary months for debugging
// //       const sampleMonths = await Payslip.findAll({
// //         where: { 
// //           is_deleted: false,
// //           created_by: companyId 
// //         },
// //         attributes: ['salary_month'],
// //         group: ['salary_month'],
// //         order: [['salary_month', 'DESC']],
// //         limit: 5,
// //         raw: true,
// //       });
      
// //       console.log('???? Sample of available salary months in database:', sampleMonths);
      
// //       return res.status(200).json({ 
// //         success: true, 
// //         message: `No payslips found for ${actualMonth}/${actualYear}`,
// //         data: [],
// //         debug_info: {
// //           requested_format: `${actualMonth}-${actualYear}`,
// //           tried_formats: salary_month_variations,
// //           available_months: sampleMonths.map(m => m.salary_month),
// //           company_id: companyId
// //         },
// //         summary: {
// //           month: actualMonth,
// //           year: actualYear,
// //           salary_month: `${actualMonth}-${actualYear}`,
// //           total_payslips: 0,
// //           total_unpaid: 0,
// //           total_paid: 0,
// //           total_amount: 0
// //         }
// //       });
// //     }

// //     // =======================================================
// //     // 🔹 GET EMPLOYEE DATA WITH SKILLS (FIXED BASED ON YOUR STRUCTURE)
// //     // =======================================================
// //     const employeeIdsFromPayslips = [...new Set(payslips.map(p => p.employee_id).filter(Boolean))];
// //     console.log(`👥 Employee IDs from payslips:`, employeeIdsFromPayslips);

// //     if (employeeIdsFromPayslips.length === 0) {
// //       console.log('⚠️ No employee IDs found in payslips');
// //       return res.status(200).json({
// //         success: true,
// //         message: `Payslips found but no valid employee IDs`,
// //         data: payslips.map(p => ({
// //           ...p,
// //           status: p.status === 1 ? "paid" : "unpaid",
// //           employee: null,
// //           salary_month_display: `${actualMonth}-${actualYear}`
// //         })),
// //         total: payslips.length,
// //         summary: {
// //           month: actualMonth,
// //           year: actualYear,
// //           salary_month: `${actualMonth}-${actualYear}`,
// //           total_payslips: payslips.length,
// //           total_unpaid: payslips.filter(p => p.status !== 1).length,
// //           total_paid: payslips.filter(p => p.status === 1).length,
// //           total_amount: payslips.reduce((sum, p) => sum + (parseFloat(p.net_payble) || 0), 0)
// //         }
// //       });
// //     }

// //     // Convert employee IDs to numbers for querying
// //     const numericEmployeeIds = employeeIdsFromPayslips
// //       .map(id => {
// //         if (id === null || id === undefined) return null;
// //         const numId = Number(id);
// //         return isNaN(numId) ? id : numId;
// //       })
// //       .filter(id => id !== null);

// //     console.log(`🔢 Converted Employee IDs for query:`, numericEmployeeIds);

// //     // FIXED: Include Skill in the employee query based on your getSalaryByEmployee structure
// //     const employeesData = await Employee.findAll({
// //       where: { 
// //         employee_id: { [Op.in]: numericEmployeeIds },
// //         deleted_at: null
// //       },
// //       attributes: [
// //         "id", "employee_id", "name", "salary", "branch_id", 
// //         "created_by", "department_id", "designation_id", "salary_type",
// //         "company_doj", "skill_id"  // Added skill_id
// //       ],
// //       include: [
// //         { 
// //           model: Branch, 
// //           as: "branch", 
// //           attributes: ["id", "name"], 
// //           required: false 
// //         },
// //         { 
// //           model: Department, 
// //           as: "department", 
// //           attributes: ["id", "name"], 
// //           required: false 
// //         },
// //         { 
// //           model: Designation, 
// //           as: "designation", 
// //           attributes: ["id", "name"], 
// //           required: false 
// //         },
// //         { 
// //           model: Skill, 
// //           as: "skill",  // Based on your getSalaryByEmployee code
// //           attributes: ["id", "name", "wages"], 
// //           required: false 
// //         },
// //       ],
// //       raw: false
// //     });

// //     console.log(`🔍 Found ${employeesData.length} employees matching payslip data`);

// //     const employeeMap = {};
// //     employeesData.forEach(emp => {
// //       const empIdStr = String(emp.employee_id);
// //       employeeMap[empIdStr] = emp;
      
// //       // Also add numeric key for compatibility
// //       const numId = Number(emp.employee_id);
// //       if (!isNaN(numId)) {
// //         employeeMap[numId] = emp;
// //       }
// //     });

// //     console.log('📋 Employee Map Keys (first 5):', Object.keys(employeeMap).slice(0, 5));

// //     // Filter payslips based on branch access
// //     const validPayslips = payslips.filter(p => {
// //       const employee = employeeMap[p.employee_id];
// //       if (!employee) {
// //         console.log(`❌ Employee not found for payslip ${p.id}, employee_id: ${p.employee_id}`);
// //         return false;
// //       }
      
// //       // Check if employee's branch is in target branches
// //       const hasAccess = targetBranchIds.includes(employee.branch_id);
// //       if (!hasAccess) {
// //         console.log(`⚠️ No branch access for employee ${employee.employee_id}, branch: ${employee.branch_id}`);
// //       }
// //       return hasAccess;
// //     });

// //     console.log(`✅ Valid payslips after branch filtering: ${validPayslips.length}`);

// //     if (validPayslips.length === 0) {
// //       return res.status(200).json({
// //         success: true,
// //         message: "No payslips found for your branch access",
// //         data: [],
// //         summary: {
// //           month: actualMonth,
// //           year: actualYear,
// //           salary_month: `${actualMonth}-${actualYear}`,
// //           total_payslips: 0,
// //           total_unpaid: 0,
// //           total_paid: 0,
// //           total_amount: 0
// //         }
// //       });
// //     }

// //     // =======================================================
// //     // 🔹 GET ALL SATURATION DEDUCTIONS
// //     // =======================================================
// //     const employeeIds = [...new Set(validPayslips.map(p => {
// //       const emp = employeeMap[p.employee_id];
// //       return emp ? String(emp.employee_id) : null;
// //     }).filter(Boolean))];
    
// //     console.log(`📊 Getting saturation deductions for ${employeeIds.length} employees`);
    
// //     // Date ranges for consistent filtering
// //     const startOfMonth = moment(`${actualYear}-${String(actualMonth).padStart(2, "0")}-01`).startOf('month').format('YYYY-MM-DD');
// //     const endOfMonth = moment(`${actualYear}-${String(actualMonth).padStart(2, "0")}-01`).endOf('month').format('YYYY-MM-DD');
    
// //     const allSaturationDeductions = employeeIds.length > 0
// //       ? await SaturationDeduction.findAll({
// //           where: { 
// //             employee_id: { [Op.in]: employeeIds },
// //             created_at: {
// //               [Op.between]: [startOfMonth, endOfMonth]
// //             }
// //           },
// //           include: [
// //             { 
// //               model: DeductionOption, 
// //               as: "deductionOption", 
// //               attributes: ["id", "name"], 
// //               required: false 
// //             }
// //           ],
// //           attributes: ["id", "employee_id", "amount", "title", "deduction_option", "type", "created_at"],
// //           raw: true
// //         })
// //       : [];

// //     console.log(`🔍 Found ${allSaturationDeductions.length} saturation deductions for ${actualMonth}/${actualYear}`);

// //     // Group saturation deductions by employee_id
// //     const saturationDeductionMap = {};
// //     for (const d of allSaturationDeductions) {
// //       if (!saturationDeductionMap[d.employee_id]) {
// //         saturationDeductionMap[d.employee_id] = [];
// //       }
      
// //       const deductionName = d["deductionOption.name"] || d.title || "N/A";
// //       const deductionAmount = Number(d.amount || 0);
// //       const deductionType = d.type || "fixed";
      
// //       let computedAmount = deductionAmount;
// //       if (deductionType === "percentage") {
// //         const employee = employeeMap[d.employee_id];
// //         const baseSalary = employee ? parseFloat(employee.salary || 0) : 0;
// //         computedAmount = (baseSalary * deductionAmount) / 100;
// //       }
      
// //       saturationDeductionMap[d.employee_id].push({
// //         id: d.id,
// //         name: deductionName,
// //         type: deductionType,
// //         amount: deductionAmount,
// //         computed_amount: Number(computedAmount.toFixed(2)),
// //         created_at: d.created_at
// //       });
// //     }

// //     // =======================================================
// //     // 🔹 PROCESS ALL PAYSLIPS WITH BASIC ENRICHMENT
// //     // =======================================================
// //     const enrichedPayslips = await Promise.all(
// //       validPayslips.map(async (p) => {
// //         try {
// //           const emp = employeeMap[p.employee_id] || {};
// //           const branch = emp.branch || {};
// //           const dept = emp.department || {};
// //           const desig = emp.designation || {};
// //           const skill = emp.skill || {}; // Get skill from employee
          
// //           // Get skill wages (based on your getSalaryByEmployee structure)
// //           const skillWages = skill ? Number(skill.wages || 0) : 0;
// //           const skillName = skill ? skill.name : null;
// //           const skillId = skill ? skill.id : null;

// //           // Parse component_details if it exists
// //           let componentDetails = {};
// //           try {
// //             if (p.component_details && typeof p.component_details === 'string') {
// //               componentDetails = JSON.parse(p.component_details);
// //             } else if (p.component_details && typeof p.component_details === 'object') {
// //               componentDetails = p.component_details;
// //             }
// //           } catch (error) {
// //             console.error("Error parsing component_details for payslip", p.id, error);
// //           }

// //           // Get detailed saturation deductions for this employee
// //           const employeeSaturationDeductions = saturationDeductionMap[emp.employee_id] || [];
// //           const saturationDeductionTotal = employeeSaturationDeductions.reduce((sum, sd) => sum + sd.computed_amount, 0);

// //           // Calculate totals - skill wages are part of base salary in your system
// //           // According to your net salary response, skill_wages is 800 and is part of base_salary_calculation
// //           const additionsTotal =
// //             Number(p.allowance || 0) +
// //             Number(p.commission || 0) +
// //             Number(p.overtime || 0) +
// //             Number(p.other_payment || 0);
// //             // Note: skill_wages is NOT added here because it's already in basic_salary

// //           const deductionsTotal =
// //             Number(p.loan || 0) +
// //             Number(p.saturation_deduction || 0) +
// //             Number(p.advance_payment || 0) +
// //             Number(p.leave_deduction || 0);

// //           const grossSalary = Number(p.basic_salary || 0) + additionsTotal;
// //           const netPayable = Number(p.net_payble || 0);

// //           // Get payslip type
// //           const salaryTypeIds = emp.salary_type ? [emp.salary_type] : [];
// //           const payslipTypes = salaryTypeIds.length > 0
// //             ? await PayslipType.findAll({ 
// //                 where: { id: salaryTypeIds }, 
// //                 attributes: ["id", "name"], 
// //                 raw: true 
// //               })
// //             : [];
// //           const payslipTypeMap = {};
// //           payslipTypes.forEach(t => { 
// //             payslipTypeMap[t.id] = t; 
// //           });

// //           // Check if skill wages are already included in basic_salary
// //           // In your net salary response, basic_salary includes skill_wages
// //           const baseSalaryIncludesSkillWages = skillWages > 0;
// //           const skillWagesBreakdown = skillWages > 0 ? [{
// //             id: skillId,
// //             name: skillName,
// //             wages: skillWages,
// //             wages_formatted: `₹${Number(skillWages).toLocaleString('en-IN')}`,
// //             note: "Included in basic salary calculation"
// //           }] : [];

// //           return {
// //             id: p.id,
// //             employee_id: p.employee_id,
// //             salary_month: p.salary_month,
// //             salary_month_display: `${actualMonth}-${actualYear}`,
// //             basic_salary: Number(p.basic_salary || 0),
// //             allowance: Number(p.allowance || 0),
// //             commission: Number(p.commission || 0),
// //             overtime: Number(p.overtime || 0),
// //             other_payment: Number(p.other_payment || 0),
// //             skill_wages: skillWages, // Skill wages (from skill table)
// //             loan: Number(p.loan || 0),
// //             saturation_deduction: Number(p.saturation_deduction || 0),
// //             advance_payment: Number(p.advance_payment || 0),
// //             leave_deduction: Number(p.leave_deduction || 0),
// //             net_payble: Number(p.net_payble || 0),
// //             status: p.status === 1 ? "paid" : "unpaid",
// //             created_at: p.created_at,
// //             updated_at: p.updated_at,
// //             employee: {
// //               id: emp.id || null,
// //               employee_id: emp.employee_id || null,
// //               name: emp.name || "N/A",
// //               company_doj: emp.company_doj || null,
// //               branch: { 
// //                 id: branch.id || null, 
// //                 name: branch.name || "N/A" 
// //               },
// //               department: { 
// //                 id: dept.id || null, 
// //                 name: dept.name || "N/A" 
// //               },
// //               designation: { 
// //                 id: desig.id || null, 
// //                 name: desig.name || "N/A" 
// //               },
// //               salary: emp.salary || 0,
// //               skill: skillWages > 0 ? {
// //                 id: skillId,
// //                 name: skillName,
// //                 wages: skillWages,
// //                 wages_formatted: `₹${Number(skillWages).toLocaleString('en-IN')}`
// //               } : null,
// //               total_skill_wages: skillWages,
// //               total_skill_wages_formatted: skillWages > 0 ? `₹${skillWages.toLocaleString('en-IN')}` : "₹0"
// //             },
// //             payslipType: payslipTypeMap[emp.salary_type] || null,
// //             component_details: componentDetails,
// //             calculation_breakdown: {
// //               base_salary: {
// //                 amount: Number(p.basic_salary || 0),
// //                 includes_skill_wages: baseSalaryIncludesSkillWages,
// //                 skill_wages_breakdown: skillWagesBreakdown
// //               },
// //               additions: {
// //                 allowances: Number(p.allowance || 0),
// //                 commissions: Number(p.commission || 0),
// //                 other_payments: Number(p.other_payment || 0),
// //                 overtime: Number(p.overtime || 0),
// //                 total_additions: additionsTotal
// //               },
// //               deductions: {
// //                 loans: Number(p.loan || 0),
// //                 saturation_deductions: Number(p.saturation_deduction || 0),
// //                 advances: Number(p.advance_payment || 0),
// //                 leave_deduction: Number(p.leave_deduction || 0),
// //                 breakdown: employeeSaturationDeductions,
// //                 total_deductions: deductionsTotal
// //               },
// //               gross_salary: grossSalary,
// //               net_payable: netPayable
// //             },
// //             skill_wages_breakdown: {
// //               skill: skillWages > 0 ? {
// //                 id: skillId,
// //                 name: skillName,
// //                 wages: skillWages,
// //                 wages_formatted: `₹${Number(skillWages).toLocaleString('en-IN')}`
// //               } : null,
// //               total: skillWages,
// //               total_formatted: skillWages > 0 ? `₹${skillWages.toLocaleString('en-IN')}` : "₹0",
// //               note: skillWages > 0 
// //                 ? "Skill wages are included in basic salary calculation" 
// //                 : "No skill wages applied"
// //             },
// //             saturation_deduction_breakdown: employeeSaturationDeductions,
// //             calculation_context: {
// //               month: actualMonth,
// //               year: actualYear,
// //               is_past_month: moment(`${actualYear}-${actualMonth}-01`).isBefore(moment(), 'month'),
// //               note: "Payslip data from database",
// //               dynamic_calculation: false,
// //               includes_skill_wages: skillWages > 0,
// //               skill_integration_type: "base_salary_inclusion"
// //             }
// //           };
// //         } catch (error) {
// //           console.error(`❌ Error processing payslip ${p.id}:`, error);
// //           return {
// //             ...p,
// //             salary_month_display: `${actualMonth}-${actualYear}`,
// //             status: p.status === 1 ? "paid" : "unpaid",
// //             employee: {
// //               id: null,
// //               employee_id: p.employee_id,
// //               name: "N/A",
// //               company_doj: null,
// //               branch: { id: null, name: "N/A" },
// //               department: { id: null, name: "N/A" },
// //               designation: { id: null, name: "N/A" },
// //               salary: 0,
// //               skill: null,
// //               total_skill_wages: 0
// //             },
// //             calculation_breakdown: {
// //               base_salary: {
// //                 amount: Number(p.basic_salary || 0),
// //                 includes_skill_wages: false,
// //                 skill_wages_breakdown: []
// //               },
// //               additions: {
// //                 allowances: Number(p.allowance || 0),
// //                 commissions: Number(p.commission || 0),
// //                 other_payments: Number(p.other_payment || 0),
// //                 overtime: Number(p.overtime || 0),
// //                 total_additions: 0
// //               },
// //               deductions: {
// //                 loans: Number(p.loan || 0),
// //                 saturation_deductions: Number(p.saturation_deduction || 0),
// //                 advances: Number(p.advance_payment || 0),
// //                 leave_deduction: Number(p.leave_deduction || 0),
// //                 breakdown: [],
// //                 total_deductions: 0
// //               },
// //               gross_salary: Number(p.basic_salary || 0),
// //               net_payable: Number(p.net_payble || 0)
// //             },
// //             skill_wages_breakdown: {
// //               skill: null,
// //               total: 0,
// //               note: "Error loading skill wages"
// //             },
// //             calculation_context: {
// //               error: "Failed to process payslip",
// //               note: "Using basic data"
// //             }
// //           };
// //         }
// //       })
// //     );

// //     // =======================================================
// //     // 🔹 CALCULATE SUMMARY STATISTICS
// //     // =======================================================
// //     const totalAmount = enrichedPayslips.reduce((sum, p) => sum + Number(p.net_payble || 0), 0);
// //     const totalSkillWagesAmount = enrichedPayslips.reduce((sum, p) => sum + Number(p.skill_wages || 0), 0);
// //     const unpaidPayslips = enrichedPayslips.filter(p => p.status === "unpaid");
// //     const paidPayslips = enrichedPayslips.filter(p => p.status === "paid");
    
// //     // Count employees with skill wages
// //     const employeesWithSkills = enrichedPayslips.filter(p => p.skill_wages > 0).length;

// //     // =======================================================
// //     // 🔹 FINAL RESPONSE
// //     // =======================================================
// //     return res.status(200).json({
// //       success: true,
// //       message: `Payslips fetched successfully for ${actualMonth}/${actualYear}`,
// //       data: enrichedPayslips,
// //       total: enrichedPayslips.length,
// //       summary: {
// //         month: actualMonth,
// //         year: actualYear,
// //         salary_month: `${actualMonth}-${actualYear}`,
// //         total_employees: employeesData.length,
// //         total_payslips: enrichedPayslips.length,
// //         total_unpaid: unpaidPayslips.length,
// //         total_paid: paidPayslips.length,
// //         total_amount: Number(totalAmount.toFixed(2)),
// //         total_skill_wages: Number(totalSkillWagesAmount.toFixed(2)),
// //         employees_with_skills: employeesWithSkills,
// //         note: "Payslip data retrieved from database"
// //       },
// //       filter_info: {
// //         requested_month: actualMonth,
// //         requested_year: actualYear,
// //         original_params: { month, year },
// //         salary_month_formats_tried: salary_month_variations,
// //         branch_filter_applied: targetBranchIds.length > 0,
// //         branch_ids: targetBranchIds,
// //         message: `Showing ${enrichedPayslips.length} payslips for ${actualMonth}/${actualYear}`
// //       },
// //       user_access_info: {
// //         user_type: req.user.type,
// //         company_id: companyId,
// //         branch_access: targetBranchIds,
// //         access_level: isSuper(req) ? 'super_admin' : (isCompany(req) || isAccountant) ? 'company_wide' : 'branch_limited'
// //       },
// //       skill_breakdown: {
// //         total_skill_wages: Number(totalSkillWagesAmount.toFixed(2)),
// //         employees_with_skills: employeesWithSkills,
// //         average_skill_wages_per_employee: employeesWithSkills > 0 
// //           ? Number((totalSkillWagesAmount / employeesWithSkills).toFixed(2)) 
// //           : 0,
// //         note: "Skill wages are included in basic salary calculation"
// //       }
// //     });

// //   } catch (error) {
// //     console.error("❌ Error fetching payslips:", error);
// //     res.status(500).json({
// //       success: false,
// //       message: "Internal server error",
// //       error: error.message,
// //       stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
// //     });
// //   }
// // };

// exports.getAllPayslips = async (req, res) => {
//   try {
//     console.log('🚀 START getAllPayslips');
//     console.log('👤 User Info - ID:', req.user.id, 'Type:', req.user.type);

//     // Get company ID
//     const companyId = await getCompanyId(req);
//     if (!companyId && !isSuper(req)) {
//       return res.status(403).json({ success: false, message: 'Unauthorized' });
//     }

//     // Get user employee record for branch info
//     const userEmployeeRecord = await Employee.findOne({
//       where: { user_id: req.user.id },
//       attributes: ['branch_id', 'created_by'],
//       raw: true,
//     });

//     console.log('🔍 User Employee Record:', userEmployeeRecord);

//     // Determine if user is a branch user or branchless
//     let userBranchId = null;
//     if (userEmployeeRecord && userEmployeeRecord.branch_id) {
//       console.log('🏢 Branch User detected');
//       userBranchId = userEmployeeRecord.branch_id;
//     } else {
//       console.log('👤 Branchless User detected');
//     }

//     const userType = (req.user.type || '').toLowerCase();
//     const isAccountant = userType === 'accountant';
    
//     console.log('🔍 User Type Check:', { 
//       userType, 
//       isAccountant, 
//       isCompany: isCompany(req), 
//       isSuper: isSuper(req), 
//       isEmployee: isEmployee(req) 
//     });

//     // Handle branch user without branch assignment
//     if (!isCompany(req) && !isSuper(req) && !isAccountant && userEmployeeRecord && !userBranchId) {
//       console.log('❌ Branch user without branch assignment');
//       return res.status(403).json({ success: false, message: 'No branch assigned' });
//     }

//     // **FIX 1: Handle parameter order correctly**
//     let { month, year } = req.params;
    
//     console.log('📅 Received Parameters:', { month, year, params: req.params });
    
//     // Validate and convert parameters
//     if (!month || !year) {
//       return res.status(400).json({ 
//         success: false, 
//         message: "Month and year are required in the URL path",
//         example: "/api/payslips/2026/1 or /api/payslips/1/2026"
//       });
//     }

//     // Convert to integers
//     const monthInt = parseInt(month);
//     const yearInt = parseInt(year);
    
//     // Determine which is month and which is year
//     let actualMonth, actualYear;
    
//     if (monthInt > 12 && yearInt <= 12) {
//       // If month > 12 and year <= 12, they are swapped
//       console.log('🔄 Swapping month/year parameters (month > 12, year <= 12)');
//       actualYear = monthInt;
//       actualMonth = yearInt;
//     } else if (yearInt > 12 && monthInt <= 12) {
//       // Year is correctly > 12, month is <= 12
//       actualYear = yearInt;
//       actualMonth = monthInt;
//     } else if (monthInt <= 12 && yearInt > 1000) {
//       // Standard format: /2026/1
//       actualYear = yearInt;
//       actualMonth = monthInt;
//     } else if (yearInt <= 12 && monthInt > 1000) {
//       // Swapped format: /1/2026
//       actualYear = monthInt;
//       actualMonth = yearInt;
//     } else {
//       // Default assumption: first param is year, second is month
//       console.log('⚠️ Could not determine format, using default assumption');
//       actualYear = monthInt > 1000 ? monthInt : yearInt;
//       actualMonth = monthInt <= 12 ? monthInt : (yearInt <= 12 ? yearInt : 1);
//     }

//     // **FIX 2: Validate month and year**
//     if (!actualMonth || !actualYear || isNaN(actualMonth) || isNaN(actualYear)) {
//       return res.status(400).json({ 
//         success: false, 
//         message: "Invalid month or year format",
//         received: { month, year },
//         interpreted: { actualMonth, actualYear }
//       });
//     }

//     if (actualMonth < 1 || actualMonth > 12) {
//       return res.status(400).json({ 
//         success: false, 
//         message: "Invalid month. Month must be between 1-12.",
//         actualMonth: actualMonth
//       });
//     }

//     if (actualYear < 2000 || actualYear > 2100) {
//       return res.status(400).json({ 
//         success: false, 
//         message: "Invalid year. Year must be between 2000-2100.",
//         actualYear: actualYear
//       });
//     }

//     console.log('✅ Final Month/Year:', { actualMonth, actualYear });

//     // **FIX 3: Handle branch IDs from query**
//     const branch_ids = req.query.branch_ids ? 
//       (Array.isArray(req.query.branch_ids) ? req.query.branch_ids : [req.query.branch_ids]) : 
//       undefined;

//     // **FIX 4: Create comprehensive salary_month formats**
//     const salaryMonthFormats = [
//       `${actualYear}-${String(actualMonth).padStart(2, "0")}`, // "2026-01"
//       `${actualYear}-${actualMonth}`, // "2026-1"
//       `${actualMonth}-${actualYear}`, // "1-2026"
//       `${actualMonth}/${actualYear}`, // "1/2026"
//       `${String(actualMonth).padStart(2, "0")}-${actualYear}`, // "01-2026"
//       `${actualYear}${String(actualMonth).padStart(2, "0")}`, // "202601"
//       `${actualYear}-${String(actualMonth).padStart(2, "0")}-01`, // "2026-01-01"
//       moment(`${actualYear}-${actualMonth}-01`).format('YYYY-MM'), // Moment.js format
//       moment(`${actualYear}-${actualMonth}-01`).format('MM-YYYY'), // Alternative format
//     ];

//     // Remove duplicates
//     const salary_month_variations = [...new Set(salaryMonthFormats)];

//     console.log("🔍 Fetching Payslips Request:", {
//       original_params: { month, year },
//       actual_params: { actualMonth, actualYear },
//       salary_month_variations: salary_month_variations,
//       branch_ids,
//       userType: req.user.type,
//       userId: req.user.id,
//       companyId,
//       userBranchId,
//       isAccountant
//     });

//     // Check if month is in future
//     const currentDate = moment();
//     const requestedDate = moment(`${actualYear}-${String(actualMonth).padStart(2, "0")}-01`);
    
//     console.log('📅 Date Check:', {
//       currentDate: currentDate.format('YYYY-MM-DD'),
//       requestedDate: requestedDate.format('YYYY-MM-DD'),
//       isFuture: requestedDate.isAfter(currentDate, 'month')
//     });

//     if (requestedDate.isAfter(currentDate, 'month')) {
//       console.log('⚠️ Requesting future month data, allowing with warning');
//       // Allow future months but return empty
//     }

//     // **FIX 5: Determine target branch IDs**
//     let targetBranchIds = [];

//     if (isSuper(req)) {
//       console.log('👑 Super Admin - Full branch access');
//       if (branch_ids && branch_ids.length > 0) {
//         targetBranchIds = branch_ids;
//       } else {
//         const allBranches = await Branch.findAll({
//           attributes: ["id"],
//           raw: true,
//         });
//         targetBranchIds = allBranches.map(b => b.id);
//       }
//     } else if (isCompany(req) || isAccountant) {
//       console.log('🏢 Company User/Accountant - Company branches access');
      
//       if (branch_ids && branch_ids.length > 0) {
//         const validBranches = await Branch.findAll({
//           where: { 
//             id: { [Op.in]: branch_ids },
//             created_by: companyId 
//           },
//           attributes: ["id"],
//           raw: true,
//         });
//         targetBranchIds = validBranches.map(b => b.id);
        
//         if (targetBranchIds.length === 0) {
//           console.log('⚠️ No valid branches found for specified IDs');
//         }
//       } else {
//         const companyBranches = await Branch.findAll({
//           where: { created_by: companyId },
//           attributes: ["id"],
//           raw: true,
//         });
//         targetBranchIds = companyBranches.map(b => b.id);
        
//         if (targetBranchIds.length === 0) {
//           console.log('⚠️ No branches found for company:', companyId);
//         }
//       }
//     } else {
//       console.log('🏢 Branch User/Employee - Limited branch access');
//       if (!userBranchId) {
//         return res.status(403).json({ success: false, message: 'No branch assigned' });
//       }
//       targetBranchIds = [userBranchId];
//     }

//     console.log('✅ Final Target Branch IDs:', targetBranchIds);

//     // **FIX 6: First, check if there are ANY payslips in the database**
//     const allPayslipsCount = await Payslip.count({
//       where: {
//         is_deleted: false,
//         created_by: companyId
//       }
//     });

//     console.log('📊 Total payslips in database for company:', allPayslipsCount);

//     // Get a sample of available months for debugging
//     const sampleMonths = await Payslip.findAll({
//       where: { 
//         is_deleted: false,
//         created_by: companyId 
//       },
//       attributes: ['salary_month'],
//       group: ['salary_month'],
//       order: [['salary_month', 'DESC']],
//       limit: 10,
//       raw: true,
//     });

//     console.log('📅 Available salary months in database:', sampleMonths.map(m => m.salary_month));

//     // **FIX 7: Query payslips with comprehensive search**
//     console.log('🔍 Querying payslips with salary_month variations:', salary_month_variations);
    
//     const payslips = await Payslip.findAll({
//       where: {
//         [Op.or]: [
//           { salary_month: { [Op.in]: salary_month_variations } },
//           {
//             [Op.and]: [
//               { is_deleted: false },
//               { created_by: companyId },
//               Sequelize.where(
//                 Sequelize.fn('DATE_FORMAT', Sequelize.col('created_at'), '%Y-%m'),
//                 `${actualYear}-${String(actualMonth).padStart(2, '0')}`
//               )
//             ]
//           }
//         ]
//       },
//       is_deleted: false,
//       created_by: companyId
//     });

//     console.log(`🔍 Found ${payslips.length} payslips for month ${actualMonth}/${actualYear}`);

//     // If no payslips found, return informative response
//     if (payslips.length === 0) {
//       // Check if there are employees for this company
//       const employeeCount = await Employee.count({
//         where: { 
//           deleted_at: null,
//           created_by: companyId 
//         }
//       });

//       // Check if payslips might exist for this company in other months
//       const otherMonths = await Payslip.findAll({
//         where: { 
//           is_deleted: false,
//           created_by: companyId 
//         },
//         attributes: ['salary_month'],
//         group: ['salary_month'],
//         order: [['salary_month', 'DESC']],
//         raw: true,
//       });

//       const responseData = {
//         success: true,
//         message: `No payslips found for ${actualMonth}/${actualYear}`,
//         data: [],
//         debug_info: {
//           requested_format: `${actualMonth}-${actualYear}`,
//           tried_formats: salary_month_variations,
//           available_months: otherMonths.map(m => m.salary_month),
//           company_id: companyId,
//           total_payslips_in_db: allPayslipsCount,
//           total_employees: employeeCount,
//           note: employeeCount === 0 ? 'No employees found for this company' : 
//                 otherMonths.length === 0 ? 'No payslips exist yet. Generate payslips first.' :
//                 'Try generating payslips for this month using the bulk-create endpoint'
//         },
//         summary: {
//           month: actualMonth,
//           year: actualYear,
//           salary_month: `${actualMonth}-${actualYear}`,
//           total_payslips: 0,
//           total_unpaid: 0,
//           total_paid: 0,
//           total_amount: 0
//         },
//         suggestions: [
//           employeeCount === 0 ? 'Add employees first' : null,
//           'Use POST /api/payslips/bulk-create to generate payslips',
//           'Check if you have the correct company/branch access'
//         ].filter(Boolean)
//       };

//       return res.status(200).json(responseData);
//     }

//     // **FIX 8: Get employee data**
//     const employeeIdsFromPayslips = [...new Set(payslips.map(p => p.employee_id).filter(Boolean))];
//     console.log(`👥 Employee IDs from payslips:`, employeeIdsFromPayslips);

//     if (employeeIdsFromPayslips.length === 0) {
//       console.log('⚠️ No employee IDs found in payslips');
//       return res.status(200).json({
//         success: true,
//         message: `Payslips found but no valid employee IDs`,
//         data: payslips.map(p => ({
//           ...p,
//           status: p.status === 1 ? "paid" : "unpaid",
//           employee: null,
//           salary_month_display: `${actualMonth}-${actualYear}`
//         })),
//         total: payslips.length,
//         summary: {
//           month: actualMonth,
//           year: actualYear,
//           salary_month: `${actualMonth}-${actualYear}`,
//           total_payslips: payslips.length,
//           total_unpaid: payslips.filter(p => p.status !== 1).length,
//           total_paid: payslips.filter(p => p.status === 1).length,
//           total_amount: payslips.reduce((sum, p) => sum + (parseFloat(p.net_payble) || 0), 0)
//         }
//       });
//     }

//     // Convert employee IDs for querying
//     const numericEmployeeIds = employeeIdsFromPayslips
//       .map(id => {
//         if (id === null || id === undefined) return null;
//         const numId = Number(id);
//         return isNaN(numId) ? id : numId;
//       })
//       .filter(id => id !== null);

//     console.log(`🔢 Converted Employee IDs for query:`, numericEmployeeIds);

//     // Get employee data with all relationships
//     const employeesData = await Employee.findAll({
//       where: { 
//         employee_id: { [Op.in]: numericEmployeeIds },
//         deleted_at: null
//       },
//       attributes: [
//         "id", "employee_id", "name", "salary", "branch_id", 
//         "created_by", "department_id", "designation_id", "salary_type",
//         "company_doj", "skill_id"
//       ],
//       include: [
//         { 
//           model: Branch, 
//           as: "branch", 
//           attributes: ["id", "name"], 
//           required: false 
//         },
//         { 
//           model: Department, 
//           as: "department", 
//           attributes: ["id", "name"], 
//           required: false 
//         },
//         { 
//           model: Designation, 
//           as: "designation", 
//           attributes: ["id", "name"], 
//           required: false 
//         },
//         { 
//           model: Skill, 
//           as: "skill",
//           attributes: ["id", "name", "wages"], 
//           required: false 
//         },
//       ],
//       raw: false
//     });

//     console.log(`🔍 Found ${employeesData.length} employees matching payslip data`);

//     const employeeMap = {};
//     employeesData.forEach(emp => {
//       const empIdStr = String(emp.employee_id);
//       employeeMap[empIdStr] = emp;
      
//       // Also add numeric key for compatibility
//       const numId = Number(emp.employee_id);
//       if (!isNaN(numId)) {
//         employeeMap[numId] = emp;
//       }
//     });

//     console.log('📋 Employee Map Keys (first 5):', Object.keys(employeeMap).slice(0, 5));

//     // **FIX 9: Filter payslips based on branch access**
//     const validPayslips = payslips.filter(p => {
//       // Skip if no employee_id
//       if (!p.employee_id) {
//         console.log(`❌ Payslip ${p.id} has no employee_id`);
//         return false;
//       }
      
//       const employee = employeeMap[p.employee_id];
//       if (!employee) {
//         console.log(`❌ Employee not found for payslip ${p.id}, employee_id: ${p.employee_id}`);
//         return false;
//       }
      
//       // If no target branches (company user with no branches), allow all
//       if (targetBranchIds.length === 0 && (isCompany(req) || isAccountant || isSuper(req))) {
//         return true;
//       }
      
//       // Check if employee's branch is in target branches
//       const hasAccess = targetBranchIds.includes(employee.branch_id);
//       if (!hasAccess) {
//         console.log(`⚠️ No branch access for employee ${employee.employee_id}, branch: ${employee.branch_id}`);
//       }
//       return hasAccess;
//     });

//     console.log(`✅ Valid payslips after branch filtering: ${validPayslips.length}`);

//     if (validPayslips.length === 0) {
//       return res.status(200).json({
//         success: true,
//         message: "No payslips found for your branch access",
//         data: [],
//         summary: {
//           month: actualMonth,
//           year: actualYear,
//           salary_month: `${actualMonth}-${actualYear}`,
//           total_payslips: 0,
//           total_unpaid: 0,
//           total_paid: 0,
//           total_amount: 0
//         }
//       });
//     }

//     // **FIX 10: Get saturation deductions**
//     const employeeIds = [...new Set(validPayslips.map(p => {
//       const emp = employeeMap[p.employee_id];
//       return emp ? String(emp.employee_id) : null;
//     }).filter(Boolean))];
    
//     console.log(`📊 Getting saturation deductions for ${employeeIds.length} employees`);
    
//     // Date ranges for filtering
//     const startOfMonth = moment(`${actualYear}-${String(actualMonth).padStart(2, "0")}-01`).startOf('month').format('YYYY-MM-DD');
//     const endOfMonth = moment(`${actualYear}-${String(actualMonth).padStart(2, "0")}-01`).endOf('month').format('YYYY-MM-DD');
    
//     const allSaturationDeductions = employeeIds.length > 0
//       ? await SaturationDeduction.findAll({
//           where: { 
//             employee_id: { [Op.in]: employeeIds },
//             created_at: {
//               [Op.between]: [startOfMonth, endOfMonth]
//             }
//           },
//           include: [
//             { 
//               model: DeductionOption, 
//               as: "deductionOption", 
//               attributes: ["id", "name"], 
//               required: false 
//             }
//           ],
//           attributes: ["id", "employee_id", "amount", "title", "deduction_option", "type", "created_at"],
//           raw: true
//         })
//       : [];

//     console.log(`🔍 Found ${allSaturationDeductions.length} saturation deductions`);

//     // Group saturation deductions by employee_id
//     const saturationDeductionMap = {};
//     for (const d of allSaturationDeductions) {
//       if (!saturationDeductionMap[d.employee_id]) {
//         saturationDeductionMap[d.employee_id] = [];
//       }
      
//       const deductionName = d["deductionOption.name"] || d.title || "N/A";
//       const deductionAmount = Number(d.amount || 0);
//       const deductionType = d.type || "fixed";
      
//       let computedAmount = deductionAmount;
//       if (deductionType === "percentage") {
//         const employee = employeeMap[d.employee_id];
//         const baseSalary = employee ? parseFloat(employee.salary || 0) : 0;
//         computedAmount = (baseSalary * deductionAmount) / 100;
//       }
      
//       saturationDeductionMap[d.employee_id].push({
//         id: d.id,
//         name: deductionName,
//         type: deductionType,
//         amount: deductionAmount,
//         computed_amount: Number(computedAmount.toFixed(2)),
//         created_at: d.created_at
//       });
//     }

//     // **FIX 11: Process and enrich payslips**
//     const enrichedPayslips = await Promise.all(
//       validPayslips.map(async (p) => {
//         try {
//           const emp = employeeMap[p.employee_id] || {};
//           const branch = emp.branch || {};
//           const dept = emp.department || {};
//           const desig = emp.designation || {};
//           const skill = emp.skill || {};
          
//           // Get skill wages
//           const skillWages = skill ? Number(skill.wages || 0) : 0;
//           const skillName = skill ? skill.name : null;
//           const skillId = skill ? skill.id : null;

//           // Parse component_details
//           let componentDetails = {};
//           try {
//             if (p.component_details && typeof p.component_details === 'string') {
//               componentDetails = JSON.parse(p.component_details);
//             } else if (p.component_details && typeof p.component_details === 'object') {
//               componentDetails = p.component_details;
//             }
//           } catch (error) {
//             console.error("Error parsing component_details for payslip", p.id, error);
//           }

//           // Get saturation deductions for this employee
//           const employeeSaturationDeductions = saturationDeductionMap[p.employee_id] || [];
//           const saturationDeductionTotal = employeeSaturationDeductions.reduce((sum, sd) => sum + sd.computed_amount, 0);

//           // Calculate totals
//           const additionsTotal =
//             Number(p.allowance || 0) +
//             Number(p.commission || 0) +
//             Number(p.overtime || 0) +
//             Number(p.other_payment || 0);

//           const deductionsTotal =
//             Number(p.loan || 0) +
//             Number(p.saturation_deduction || 0) +
//             Number(p.advance_payment || 0) +
//             Number(p.leave_deduction || 0);

//           const grossSalary = Number(p.basic_salary || 0) + additionsTotal;
//           const netPayable = Number(p.net_payble || 0);

//           // Get payslip type
//           const salaryTypeIds = emp.salary_type ? [emp.salary_type] : [];
//           const payslipTypes = salaryTypeIds.length > 0
//             ? await PayslipType.findAll({ 
//                 where: { id: salaryTypeIds }, 
//                 attributes: ["id", "name"], 
//                 raw: true 
//               })
//             : [];
//           const payslipTypeMap = {};
//           payslipTypes.forEach(t => { 
//             payslipTypeMap[t.id] = t; 
//           });

//           // Skill wages breakdown
//           const skillWagesBreakdown = skillWages > 0 ? [{
//             id: skillId,
//             name: skillName,
//             wages: skillWages,
//             wages_formatted: `₹${Number(skillWages).toLocaleString('en-IN')}`,
//             note: "Included in basic salary calculation"
//           }] : [];

//           return {
//             id: p.id,
//             employee_id: p.employee_id,
//             salary_month: p.salary_month,
//             salary_month_display: `${actualMonth}-${actualYear}`,
//             basic_salary: Number(p.basic_salary || 0),
//             allowance: Number(p.allowance || 0),
//             commission: Number(p.commission || 0),
//             overtime: Number(p.overtime || 0),
//             other_payment: Number(p.other_payment || 0),
//             skill_wages: skillWages,
//             loan: Number(p.loan || 0),
//             saturation_deduction: Number(p.saturation_deduction || 0),
//             advance_payment: Number(p.advance_payment || 0),
//             leave_deduction: Number(p.leave_deduction || 0),
//             net_payble: Number(p.net_payble || 0),
//             status: p.status === 1 ? "paid" : "unpaid",
//             created_at: p.created_at,
//             updated_at: p.updated_at,
//             employee: {
//               id: emp.id || null,
//               employee_id: emp.employee_id || null,
//               name: emp.name || "N/A",
//               company_doj: emp.company_doj || null,
//               branch: { 
//                 id: branch.id || null, 
//                 name: branch.name || "N/A" 
//               },
//               department: { 
//                 id: dept.id || null, 
//                 name: dept.name || "N/A" 
//               },
//               designation: { 
//                 id: desig.id || null, 
//                 name: desig.name || "N/A" 
//               },
//               salary: emp.salary || 0,
//               skill: skillWages > 0 ? {
//                 id: skillId,
//                 name: skillName,
//                 wages: skillWages,
//                 wages_formatted: `₹${Number(skillWages).toLocaleString('en-IN')}`
//               } : null,
//               total_skill_wages: skillWages,
//               total_skill_wages_formatted: skillWages > 0 ? `₹${skillWages.toLocaleString('en-IN')}` : "₹0"
//             },
//             payslipType: payslipTypeMap[emp.salary_type] || null,
//             component_details: componentDetails,
//             calculation_breakdown: {
//               base_salary: {
//                 amount: Number(p.basic_salary || 0),
//                 includes_skill_wages: skillWages > 0,
//                 skill_wages_breakdown: skillWagesBreakdown
//               },
//               additions: {
//                 allowances: Number(p.allowance || 0),
//                 commissions: Number(p.commission || 0),
//                 other_payments: Number(p.other_payment || 0),
//                 overtime: Number(p.overtime || 0),
//                 total_additions: additionsTotal
//               },
//               deductions: {
//                 loans: Number(p.loan || 0),
//                 saturation_deductions: Number(p.saturation_deduction || 0),
//                 advances: Number(p.advance_payment || 0),
//                 leave_deduction: Number(p.leave_deduction || 0),
//                 breakdown: employeeSaturationDeductions,
//                 total_deductions: deductionsTotal
//               },
//               gross_salary: grossSalary,
//               net_payable: netPayable
//             },
//             skill_wages_breakdown: {
//               skill: skillWages > 0 ? {
//                 id: skillId,
//                 name: skillName,
//                 wages: skillWages,
//                 wages_formatted: `₹${Number(skillWages).toLocaleString('en-IN')}`
//               } : null,
//               total: skillWages,
//               total_formatted: skillWages > 0 ? `₹${skillWages.toLocaleString('en-IN')}` : "₹0",
//               note: skillWages > 0 
//                 ? "Skill wages are included in basic salary calculation" 
//                 : "No skill wages applied"
//             },
//             saturation_deduction_breakdown: employeeSaturationDeductions,
//             calculation_context: {
//               month: actualMonth,
//               year: actualYear,
//               is_past_month: moment(`${actualYear}-${actualMonth}-01`).isBefore(moment(), 'month'),
//               note: "Payslip data from database",
//               dynamic_calculation: false,
//               includes_skill_wages: skillWages > 0,
//               skill_integration_type: "base_salary_inclusion"
//             }
//           };
//         } catch (error) {
//           console.error(`❌ Error processing payslip ${p.id}:`, error);
//           return {
//             ...p,
//             salary_month_display: `${actualMonth}-${actualYear}`,
//             status: p.status === 1 ? "paid" : "unpaid",
//             employee: {
//               id: null,
//               employee_id: p.employee_id,
//               name: "N/A",
//               company_doj: null,
//               branch: { id: null, name: "N/A" },
//               department: { id: null, name: "N/A" },
//               designation: { id: null, name: "N/A" },
//               salary: 0,
//               skill: null,
//               total_skill_wages: 0
//             },
//             calculation_breakdown: {
//               base_salary: {
//                 amount: Number(p.basic_salary || 0),
//                 includes_skill_wages: false,
//                 skill_wages_breakdown: []
//               },
//               additions: {
//                 allowances: Number(p.allowance || 0),
//                 commissions: Number(p.commission || 0),
//                 other_payments: Number(p.other_payment || 0),
//                 overtime: Number(p.overtime || 0),
//                 total_additions: 0
//               },
//               deductions: {
//                 loans: Number(p.loan || 0),
//                 saturation_deductions: Number(p.saturation_deduction || 0),
//                 advances: Number(p.advance_payment || 0),
//                 leave_deduction: Number(p.leave_deduction || 0),
//                 breakdown: [],
//                 total_deductions: 0
//               },
//               gross_salary: Number(p.basic_salary || 0),
//               net_payable: Number(p.net_payble || 0)
//             },
//             skill_wages_breakdown: {
//               skill: null,
//               total: 0,
//               note: "Error loading skill wages"
//             },
//             calculation_context: {
//               error: "Failed to process payslip",
//               note: "Using basic data"
//             }
//           };
//         }
//       })
//     );

//     // **FIX 12: Calculate summary statistics**
//     const totalAmount = enrichedPayslips.reduce((sum, p) => sum + Number(p.net_payble || 0), 0);
//     const totalSkillWagesAmount = enrichedPayslips.reduce((sum, p) => sum + Number(p.skill_wages || 0), 0);
//     const unpaidPayslips = enrichedPayslips.filter(p => p.status === "unpaid");
//     const paidPayslips = enrichedPayslips.filter(p => p.status === "paid");
//     const employeesWithSkills = enrichedPayslips.filter(p => p.skill_wages > 0).length;

//     // **FIX 13: Return final response**
//     return res.status(200).json({
//       success: true,
//       message: `Payslips fetched successfully for ${actualMonth}/${actualYear}`,
//       data: enrichedPayslips,
//       total: enrichedPayslips.length,
//       summary: {
//         month: actualMonth,
//         year: actualYear,
//         salary_month: `${actualMonth}-${actualYear}`,
//         total_employees: employeesData.length,
//         total_payslips: enrichedPayslips.length,
//         total_unpaid: unpaidPayslips.length,
//         total_paid: paidPayslips.length,
//         total_amount: Number(totalAmount.toFixed(2)),
//         total_skill_wages: Number(totalSkillWagesAmount.toFixed(2)),
//         employees_with_skills: employeesWithSkills,
//         note: "Payslip data retrieved from database"
//       },
//       filter_info: {
//         requested_month: actualMonth,
//         requested_year: actualYear,
//         original_params: { month, year },
//         salary_month_formats_tried: salary_month_variations,
//         branch_filter_applied: targetBranchIds.length > 0,
//         branch_ids: targetBranchIds,
//         message: `Showing ${enrichedPayslips.length} payslips for ${actualMonth}/${actualYear}`
//       },
//       user_access_info: {
//         user_type: req.user.type,
//         company_id: companyId,
//         branch_access: targetBranchIds,
//         access_level: isSuper(req) ? 'super_admin' : (isCompany(req) || isAccountant) ? 'company_wide' : 'branch_limited'
//       },
//       skill_breakdown: {
//         total_skill_wages: Number(totalSkillWagesAmount.toFixed(2)),
//         employees_with_skills: employeesWithSkills,
//         average_skill_wages_per_employee: employeesWithSkills > 0 
//           ? Number((totalSkillWagesAmount / employeesWithSkills).toFixed(2)) 
//           : 0,
//         note: "Skill wages are included in basic salary calculation"
//       }
//     });

//   } catch (error) {
//     console.error("❌ Error fetching payslips:", error);
//     res.status(500).json({
//       success: false,
//       message: "Internal server error while fetching payslips",
//       error: error.message,
//       stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
//       debug: {
//         params: req.params,
//         user_id: req.user?.id,
//         user_type: req.user?.type
//       }
//     });
//   }
// };

// exports.createPayslipsForMonth = async (req, res) => {
//   try {
//     console.log('🚀 START createPayslipsForMonth');
    
//     const { employee_id, month, year } = req.body;
    
//     // Validate required fields
//     if (!employee_id) {
//       return res.status(400).json({ 
//         success: false, 
//         message: "employee_id is required" 
//       });
//     }
    
//     // Use current month/year if not provided
//     const currentMonth = month || moment().month() + 1;
//     const currentYear = year || moment().year();
    
//     console.log('📅 Creating payslip for:', {
//       employee_id,
//       month: currentMonth,
//       year: currentYear
//     });

//     // Get company ID
//     let companyId = await getCompanyId(req);
    
//     // Find employee
//     const employee = await Employee.findOne({
//       where: { 
//         employee_id: employee_id.toString(),
//         deleted_at: null 
//       }
//     });
    
//     if (!employee) {
//       return res.status(404).json({ 
//         success: false, 
//         message: `Employee not found with ID: ${employee_id}`
//       });
//     }

//     // Format salary month
//     const salary_month = `${currentYear}-${String(currentMonth).padStart(2, "0")}`;
    
//     // Check for existing payslip
//     const existing = await Payslip.findOne({ 
//       where: { 
//         employee_id: employee.employee_id,
//         salary_month 
//       } 
//     });
    
//     if (existing) {
//       return res.status(400).json({ 
//         success: false, 
//         message: "Payslip already exists for this month",
//         payslip_id: existing.id
//       });
//     }

//     // Calculate salary
//     let netSalaryData;
//     try {
//       const mockReq = {
//         params: { employeeId: employee.employee_id },
//         user: req.user || { id: companyId, type: 'company' },
//         query: { month: currentMonth, year: currentYear }
//       };
      
//       const calculationPromise = new Promise((resolve, reject) => {
//         const mockRes = {
//           statusCode: 200,
//           status: function(code) {
//             this.statusCode = code;
//             return this;
//           },
//           json: function(data) {
//             if (this.statusCode >= 400) {
//               reject(new Error(data.message || `HTTP ${this.statusCode}`));
//             } else {
//               resolve(data);
//             }
//           }
//         };
        
//         exports.calculateNetSalary(mockReq, mockRes).catch(reject);
//       });
      
//       const result = await calculationPromise;
      
//       if (!result || !result.success) {
//         throw new Error(result?.message || 'Calculation returned unsuccessful');
//       }
      
//       netSalaryData = result.data;
      
//     } catch (error) {
//       console.error("❌ Salary calculation error:", error.message);
//       return res.status(500).json({ 
//         success: false, 
//         message: "Failed to calculate net salary: " + error.message
//       });
//     }

//     // Extract values
//     const net_payble = netSalaryData.breakdown?.totals?.net || 0;
//     const leaveDeduction = netSalaryData.progressive_leave_summary?.leave_deduction_this_month || 0;
//     const baseSalary = netSalaryData.employee?.base_salary_calculation?.calculated_base_salary || 
//                       netSalaryData.employee?.stored_salary || 
//                       employee.salary || 
//                       0;

//     // Create component_details
//     const component_details = {
//       base_salary_calculation: netSalaryData.employee?.base_salary_calculation || {},
//       allowances: netSalaryData.breakdown?.allowances || [],
//       commissions: netSalaryData.breakdown?.commissions || [],
//       other_payments: netSalaryData.breakdown?.other_payments || [],
//       loans: netSalaryData.breakdown?.loans || [],
//       saturation_deductions: netSalaryData.breakdown?.saturation_deductions || [],
//       saturation_deduction_breakdown: netSalaryData.breakdown?.saturation_deduction_breakdown || {},
//       overtimes: netSalaryData.breakdown?.overtime || [],
//       overtime_calculation: netSalaryData.breakdown?.overtime_calculation || {},
//       advances: netSalaryData.breakdown?.advances || [],
//       progressive_leave_summary: netSalaryData.progressive_leave_summary || {},
//       totals: netSalaryData.breakdown?.totals || {},
//       period: netSalaryData.period || {},
//       calculation_timestamp: new Date().toISOString(),
//       calculation_method: 'skill_based',
//       version: '2.0'
//     };

//     // Create the payslip
//     const payslip = await Payslip.create({
//       employee_id: employee.employee_id,
//       employee_primary_id: employee.id,
//       created_by: req.user?.id || companyId || 1,
//       salary_month,
//       basic_salary: baseSalary,
//       allowance: netSalaryData.breakdown?.allowances_total || 0,
//       commission: netSalaryData.breakdown?.commissions_total || 0,
//       overtime: netSalaryData.breakdown?.overtime_total || 0,
//       other_payment: netSalaryData.breakdown?.other_payments_total || 0,
//       loan: netSalaryData.breakdown?.loans_total || 0,
//       saturation_deduction: netSalaryData.breakdown?.saturation_total || 0,
//       advance_payment: netSalaryData.breakdown?.advances_total || 0,
//       leave_deduction: leaveDeduction,
//       net_payble,
//       status: 0,
//       component_details: component_details,
//     });

//     // Return success response with complete breakdown
//     return res.status(201).json({
//       success: true,
//       message: "Payslip created successfully",
//       data: {
//         period: netSalaryData.period || {
//           month: currentMonth,
//           year: currentYear,
//           start_date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`,
//           end_date: moment(`${currentYear}-${currentMonth}-01`).endOf('month').format('YYYY-MM-DD'),
//           display: moment(`${currentYear}-${currentMonth}-01`).format('MMMM YYYY')
//         },
//         employee: {
//           employee_id: employee.employee_id,
//           name: employee.name,
//           branch_id: employee.branch_id,
//           salary_type: employee.salary_type,
//           base_salary_calculation: netSalaryData.employee?.base_salary_calculation || {
//             skill_wages: 0,
//             branch_working_days: 0,
//             calculated_base_salary: baseSalary
//           },
//           stored_salary: employee.salary || 0
//         },
//         progressive_leave_summary: netSalaryData.progressive_leave_summary || {
//           cumulative_leaves_upto_current: 0,
//           current_month_leaves: 0,
//           free_leaves_allowed: 18,
//           free_leaves_remaining: 18,
//           deductible_leaves_this_month: 0,
//           cumulative_deductible_leaves: 0,
//           daily_salary: Number((baseSalary / 30).toFixed(2)),
//           leave_deduction_this_month: leaveDeduction
//         },
//         breakdown: {
//           base_salary_calculation: netSalaryData.employee?.base_salary_calculation || {
//             skill_wages: 0,
//             branch_working_days: 0,
//             calculated_amount: baseSalary
//           },
//           base_salary: baseSalary,
//           allowances: netSalaryData.breakdown?.allowances || [],
//           allowances_total: netSalaryData.breakdown?.allowances_total || 0,
//           commissions: netSalaryData.breakdown?.commissions || [],
//           commissions_total: netSalaryData.breakdown?.commissions_total || 0,
//           other_payments: netSalaryData.breakdown?.other_payments || [],
//           other_payments_total: netSalaryData.breakdown?.other_payments_total || 0,
//           overtime: netSalaryData.breakdown?.overtime || [],
//           overtime_calculation: netSalaryData.breakdown?.overtime_calculation || {
//             skill_wages: 0,
//             branch_working_hours: 8,
//             designation_overtime_rate: 1,
//             hourly_rate: 0
//           },
//           overtime_total: netSalaryData.breakdown?.overtime_total || 0,
//           loans: netSalaryData.breakdown?.loans || [],
//           loans_total: netSalaryData.breakdown?.loans_total || 0,
//           saturation_deductions: netSalaryData.breakdown?.saturation_deductions || [],
//           saturation_deduction_breakdown: netSalaryData.breakdown?.saturation_deduction_breakdown || {
//             pf_deductions: {
//               applicable_amount: 0,
//               total: 0
//             },
//             esi_deductions: {
//               applicable_amount: 0,
//               total: 0
//             },
//             other_deductions: 0
//           },
//           saturation_total: netSalaryData.breakdown?.saturation_total || 0,
//           advances: netSalaryData.breakdown?.advances || [],
//           advances_total: netSalaryData.breakdown?.advances_total || 0,
//           totals: {
//             additions: netSalaryData.breakdown?.totals?.additions || 0,
//             deductions: netSalaryData.breakdown?.totals?.deductions || 0,
//             gross: netSalaryData.breakdown?.totals?.gross || baseSalary,
//             net: net_payble
//           }
//         }
//       },
//       payslip: {
//         id: payslip.id,
//         employee_id: payslip.employee_id,
//         salary_month: payslip.salary_month,
//         basic_salary: payslip.basic_salary,
//         allowance: payslip.allowance,
//         commission: payslip.commission,
//         overtime: payslip.overtime,
//         other_payment: payslip.other_payment,
//         loan: payslip.loan,
//         saturation_deduction: payslip.saturation_deduction,
//         advance_payment: payslip.advance_payment,
//         leave_deduction: payslip.leave_deduction,
//         net_payble: payslip.net_payble,
//         status: payslip.status === 1 ? "paid" : "unpaid",
//         created_at: payslip.created_at,
//         updated_at: payslip.updated_at
//       }
//     });
    
//   } catch (err) {
//     console.error("❌ Error creating payslip:", err.message);
//     return res.status(500).json({ 
//       success: false, 
//       message: "Server error: " + err.message
//     });
//   }
// };


// exports.softDeletePayslip = async (req, res) => {
//   try {
//     const { employee_id } = req.params; // Changed from req.body to req.params

//     console.log("???? Soft delete request:", {
//       employeeId: employee_id,
//       userId: req.user.id,
//       userType: req.user.type
//     });

//     if (!employee_id) {
//       return res.status(400).json({ success: false, message: "Employee ID is required" });
//     }

//     const companyId = await getCompanyId(req);
//     if (!companyId) {
//       return res.status(403).json({ success: false, message: "Unauthorized" });
//     }

//     const userId = req.user.id;
//     const userType = (req.user.type || "").toLowerCase();

//     // 1?? Find the payslip with better debugging
//     const payslip = await Payslip.findOne({
//       where: { 
//         employee_id: employee_id,
//         is_deleted: false 
//       },
//       include: [
//         {
//           model: Employee,
//           as: "employee",
//           attributes: ["id", "name", "employee_id", "salary_type", "branch_id", "created_by"],
//           required: false,
//           include: [
//             { model: Branch, as: "branch", attributes: ["id", "name"], required: false },
//           ],
//         },
//       ],
//     });

//     console.log("???? Payslip search result:", {
//       payslipFound: !!payslip,
//       employeeId: employee_id,
//       payslipData: payslip ? {
//         id: payslip.id,
//         employee_id: payslip.employee_id,
//         is_deleted: payslip.is_deleted
//       } : null
//     });

//     if (!payslip) {
//       // Check if payslip exists but is already deleted
//       const deletedPayslip = await Payslip.findOne({
//         where: { employee_id: employee_id },
//         paranoid: false // Include soft-deleted records
//       });

//       if (deletedPayslip) {
//         return res.status(404).json({ 
//           success: false, 
//           message: "Payslip already deleted",
//           debug: {
//             employeeId: employee_id,
//             deletedAt: deletedPayslip.deleted_at
//           }
//         });
//       } else {
//         return res.status(404).json({ 
//           success: false, 
//           message: "Payslip not found for this employee",
//           debug: {
//             employeeId: employee_id // FIXED: Changed from payslipId to employeeId
//           }
//         });
//       }
//     }

//     // 2?? Permission check
//     if (!["company", "admin", "super admin", "accountant"].includes(userType)) {
//       const branchUser = await Employee.findOne({
//         where: { user_id: userId },
//         attributes: ["branch_id"],
//         raw: true,
//       });

//       if (!branchUser || !branchUser.branch_id) {
//         return res.status(403).json({ success: false, message: "Branch not found for user" });
//       }

//       if (!payslip.employee || Number(branchUser.branch_id) !== Number(payslip.employee.branch_id)) {
//         return res.status(403).json({
//           success: false,
//           message: "Cannot delete payslip from another branch",
//           debug: {
//             userBranch: branchUser.branch_id,
//             employeeBranch: payslip.employee?.branch_id
//           }
//         });
//       }
//     }

//     // 3?? Additional check for company users
//     if (["company", "admin", "super admin"].includes(userType)) {
//       const companyUsers = await User.findAll({
//         where: { created_by: companyId },
//         attributes: ['id'],
//         raw: true,
//       });
//       const allowedCreatorIds = companyUsers.map(u => u.id).concat(companyId);

//       if (payslip.employee && !allowedCreatorIds.includes(payslip.employee.created_by)) {
//         return res.status(403).json({
//           success: false,
//           message: 'Cannot delete payslip of employee from another company',
//         });
//       }
//     }

//     // 4?? Soft delete the payslip
//     const deletedAt = new Date();
//     const [updateCount] = await Payslip.update(
//       { 
//         is_deleted: true, 
//         deleted_at: deletedAt, 
//         deleted_by: userId 
//       },
//       { 
//         where: { employee_id: employee_id }
//       }
//     );

//     console.log("? Payslip soft delete result:", {
//       updateCount,
//       employeeId: employee_id,
//       deletedAt: deletedAt
//     });

//     if (updateCount === 0) {
//       return res.status(500).json({
//         success: false,
//         message: "Failed to delete payslip - no rows updated"
//       });
//     }

//     // 5?? Prepare response
//     const response = {
//       id: payslip.id,
//       employee_id: payslip.employee_id,
//       salary_month: payslip.salary_month,
//       net_payble: payslip.net_payble,
//       employee: payslip.employee
//         ? {
//             id: payslip.employee.id,
//             name: payslip.employee.name,
//             employee_id: payslip.employee.employee_id,
//             salary_type: payslip.employee.salary_type,
//             branch: payslip.employee.branch
//               ? { id: payslip.employee.branch.id, name: payslip.employee.branch.name }
//               : null,
//           }
//         : null,
//       deleted: true,
//       deleted_at: deletedAt,
//       deleted_by: userId,
//     };

//     res.status(200).json({
//       success: true,
//       message: "Payslip deleted successfully",
//       data: response,
//     });

//   } catch (error) {
//     console.error("? Error deleting payslip:", error);
//     res.status(500).json({
//       success: false,
//       message: "Internal server error",
//       error: error.message,
//     });
//   }
// };



// exports.bulkPayment = async (req, res) => {
//   try {
//     console.log('???? START bulkPayment');
//     console.log('???? User Info - ID:', req.user.id, 'Type:', req.user.type);

//     // 🟩 FIXED: Use the SAME permission logic as getAllPayslips
//     const companyId = await getCompanyId(req);
    
//     // 🟩 FIXED: Remove the strict permission check that's causing the issue
//     // The working functions don't have this immediate rejection
//     if (!companyId && !isSuper(req)) {
//       console.log('???? Checking user access without immediate rejection...');
//       // Don't reject immediately like the working functions
//     }

//     // 🟩 FIXED: Use EXACTLY the same logic as getAllPayslips
//     const userEmployeeRecord = await Employee.findOne({
//       where: { user_id: req.user.id },
//       attributes: ['branch_id', 'created_by'],
//       raw: true,
//     });

//     console.log('???? User Employee Record:', userEmployeeRecord);

//     let userBranchId = null;

//     if (userEmployeeRecord && userEmployeeRecord.branch_id) {
//       console.log('???? Branch User - Processing bulk payment');
//       userBranchId = userEmployeeRecord.branch_id;
//     } else {
//       console.log('???? Branchless User - Processing bulk payment');
//       // No branch restriction for branchless users (like getAllPayslips)
//     }

//     const userType = (req.user.type || '').toLowerCase();
//     const isAccountant = userType === 'accountant';
    
//     console.log('???? User Type Check:', { 
//       userType, 
//       isAccountant, 
//       isCompany: isCompany(req), 
//       isSuper: isSuper(req), 
//       isEmployee: isEmployee(req) 
//     });

//     // 🟩 FIXED: Use the EXACT same logic as getAllPayslips
//     if (!isCompany(req) && !isSuper(req) && !isAccountant && userEmployeeRecord && !userBranchId) {
//       console.log('???? RESTRICTING: Branch user without branch assignment');
//       return res.status(403).json({ success: false, message: 'No branch assigned' });
//     }

//     const { month, year, branch_ids, payment_mode, remarks } = req.body;

//     console.log('???? Request body:', { month, year, branch_ids, payment_mode, remarks });

//     if (!month || !year) {
//       return res.status(400).json({
//         success: false,
//         message: "Month and year are required.",
//       });
//     }

//     const salary_month = `${year}-${String(month).padStart(2, '0')}`;
//     console.log('???? Salary month:', salary_month);

//     // 🟩 FIXED: Use the SAME branch access logic as getAllPayslips
//     let targetBranchIds = [];

//     if (isSuper(req)) {
//       console.log('???? Super Admin - Full branch access');
//       if (branch_ids && branch_ids.length > 0) {
//         targetBranchIds = Array.isArray(branch_ids) ? branch_ids : [branch_ids];
//       } else {
//         const allBranches = await Branch.findAll({
//           attributes: ["id"],
//           raw: true,
//         });
//         targetBranchIds = allBranches.map(b => b.id);
//       }
//     } else if (isCompany(req) || isAccountant) {
//       console.log('???? Company User/Accountant - Company branches access');
      
//       if (branch_ids && branch_ids.length > 0) {
//         const branchIdsArray = Array.isArray(branch_ids) ? branch_ids : [branch_ids];
//         const validBranches = await Branch.findAll({
//           where: { 
//             id: { [Op.in]: branchIdsArray },
//             created_by: companyId 
//           },
//           attributes: ["id"],
//           raw: true,
//         });
//         targetBranchIds = validBranches.map(b => b.id);
        
//         if (targetBranchIds.length === 0) {
//           return res.status(400).json({ 
//             success: false, 
//             message: "No valid branches found for the company" 
//           });
//         }
//       } else {
//         const companyBranches = await Branch.findAll({
//           where: { created_by: companyId },
//           attributes: ["id"],
//           raw: true,
//         });
//         targetBranchIds = companyBranches.map(b => b.id);
        
//         if (targetBranchIds.length === 0) {
//           return res.status(404).json({ 
//             success: false, 
//             message: "No branches found for this company" 
//           });
//         }
//       }
//     } else {
//       console.log('???? Branch User/Employee - Limited branch access');
//       if (!userBranchId) {
//         return res.status(403).json({ success: false, message: 'No branch assigned' });
//       }
//       targetBranchIds = [userBranchId];
//     }

//     if (targetBranchIds.length === 0) {
//       return res.status(404).json({ 
//         success: false, 
//         message: "No branches found for access" 
//       });
//     }

//     console.log('???? Final Target Branch IDs:', targetBranchIds);

//     // 🟩 FIXED: Date validation (same as other functions)
//     const currentDate = moment();
//     const requestedDate = moment(`${year}-${month}-01`);

//     if (requestedDate.isAfter(currentDate, 'month')) {
//       return res.status(400).json({
//         success: false,
//         message: "Cannot process bulk payment for future months",
//       });
//     }

//     // Ensure associations exist (same as getAllPayslips)
//     if (!Payslip.associations.employee) {
//       Payslip.belongsTo(Employee, { 
//         foreignKey: 'employee_id', 
//         targetKey: 'employee_id',
//         as: 'employee' 
//       });
//     }

//     // ✅ Step 1: Get eligible employees (SAME LOGIC as getAllPayslips)
//     const salaryMonthStart = moment(`${year}-${month}-01`).startOf('month');
//     const salaryMonthEnd = moment(`${year}-${month}-01`).endOf('month');

//     console.log('???? Fetching eligible employees for branches:', targetBranchIds);

//     const allEmployees = await Employee.findAll({
//       where: { 
//         branch_id: { [Op.in]: targetBranchIds },
//         deleted_at: null
//       },
//       attributes: ["id", "employee_id", "name", "branch_id", "company_doj"],
//       raw: false
//     });

//     console.log('???? Found employees:', allEmployees.length);

//     // Filter employees who joined during or before the payslip month (SAME as getAllPayslips)
//     const eligibleEmployees = allEmployees.filter(employee => {
//       if (!employee.company_doj) return true;
//       const joinDate = moment(employee.company_doj);
//       return joinDate.isSameOrBefore(salaryMonthEnd, 'day');
//     });

//     console.log('???? Eligible employees after DOJ check:', eligibleEmployees.length);

//     if (eligibleEmployees.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: `No eligible employees found for ${salary_month} in the accessible branches.`,
//         user_access_info: {
//           user_type: req.user.type,
//           company_id: companyId,
//           branch_access: targetBranchIds,
//           access_level: isSuper(req) ? 'super_admin' : (isCompany(req) || isAccountant) ? 'company_wide' : 'branch_limited'
//         }
//       });
//     }

//     const eligibleEmployeeIds = eligibleEmployees.map(emp => emp.employee_id);
//     console.log('???? Eligible employee IDs:', eligibleEmployeeIds);

//     // ✅ Step 2: Fetch unpaid payslips for eligible employees
//     const unpaidPayslips = await Payslip.findAll({
//       where: {
//         salary_month,
//         status: 0, // unpaid
//         is_deleted: false,
//         employee_id: { [Op.in]: eligibleEmployeeIds }
//       },
//       include: [
//         {
//           model: Employee,
//           as: "employee",
//           attributes: ["id", "name", "branch_id", "department_id"],
//         },
//       ],
//     });

//     console.log('???? Unpaid payslips found:', unpaidPayslips.length);

//     if (!unpaidPayslips || unpaidPayslips.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: `No unpaid payslips found for ${salary_month} in the accessible branches.`,
//         user_access_info: {
//           user_type: req.user.type,
//           company_id: companyId,
//           branch_access: targetBranchIds,
//           access_level: isSuper(req) ? 'super_admin' : (isCompany(req) || isAccountant) ? 'company_wide' : 'branch_limited',
//           eligible_employees: eligibleEmployees.length,
//           processed_payslips: 0
//         }
//       });
//     }

//     console.log(`???? Found ${unpaidPayslips.length} unpaid payslips for bulk payment`);

//     // ✅ Step 3: Process payments
//     let totalSalaryAmount = 0;
//     const updatedPayslips = [];
//     const paidAt = new Date();

//     console.log('???? Starting to process payslips...');

//     for (const payslip of unpaidPayslips) {
//       try {
//         const netPayble = parseFloat(payslip.net_payble || 0);
//         totalSalaryAmount += netPayble;
        
//         payslip.status = 1;
//         payslip.updated_at = paidAt;

//         // Fix for tax_total
//         if ("tax_total" in payslip.dataValues && payslip.tax_total === undefined) {
//           payslip.tax_total = 0;
//         }

//         // Optional additional info
//         payslip.payment_mode = payment_mode || "bank transfer";
//         payslip.remarks = remarks || "Bulk payment processed";

//         await payslip.save();

//         updatedPayslips.push({
//           id: payslip.id,
//           employee_name: payslip.employee?.name || "N/A",
//           salary_month: payslip.salary_month,
//           net_payble: netPayble,
//           status: "paid",
//           updated_at: paidAt,
//         });

//         console.log(`✅ Processed payslip for ${payslip.employee?.name || 'N/A'}: ₹${netPayble}`);
//       } catch (payslipError) {
//         console.error(`❌ Error processing payslip ${payslip.id}:`, payslipError);
//         // Continue with other payslips even if one fails
//       }
//     }

//     console.log('???? Total salary amount:', totalSalaryAmount);
//     console.log('???? Updated payslips count:', updatedPayslips.length);

//     // ✅ Step 4: Create descriptive message
//     const monthNames = [
//       "January", "February", "March", "April", "May", "June",
//       "July", "August", "September", "October", "November", "December"
//     ];
    
//     const [yearPart, monthPart] = salary_month.split('-');
//     const monthName = monthNames[parseInt(monthPart) - 1] || monthPart;
//     const formattedYear = yearPart;
    
//     const salaryDeductionDescription = `${monthName} ${formattedYear} salary of ₹${totalSalaryAmount.toLocaleString('en-IN')} deducted from total income`;

//     // ✅ Step 5: Return response (SAME format as other functions)
//     return res.status(200).json({
//       success: true,
//       message: `${updatedPayslips.length} payslips marked as paid successfully for ${salary_month}.`,
//       salary_deduction_info: {
//         month: `${monthName} ${formattedYear}`,
//         total_amount: totalSalaryAmount,
//         description: salaryDeductionDescription,
//         payslips_count: updatedPayslips.length,
//         salary_month: salary_month
//       },
//       data: updatedPayslips,
//       // 🟩 FIXED: Use the SAME user_access_info format as getAllPayslips
//       user_access_info: {
//         user_type: req.user.type,
//         company_id: companyId,
//         branch_access: targetBranchIds,
//         access_level: isSuper(req) ? 'super_admin' : (isCompany(req) || isAccountant) ? 'company_wide' : 'branch_limited',
//         eligible_employees: eligibleEmployees.length,
//         processed_payslips: updatedPayslips.length
//       }
//     });
//   } catch (error) {
//     console.error("❌ Bulk payment error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error during bulk payment.",
//       error: error.message,
//       stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
//     });
//   }
// };









const { sequelize } = require('../models');   // adjust path if needed

const { Op, Sequelize } = require('sequelize');
const ExcelJS = require("exceljs");
const moment = require('moment');

const Payslip = require("../models/payslip.model");
const Employee = require("../models/employee.model");
const Allowance = require("../models/allowance.model");
const Commission = require("../models/commission.model");
const Loan = require("../models/loan.model");
const Overtime = require("../models/overtime.model");
const OtherPayment = require("../models/otherPayment.model");
const SaturationDeduction = require("../models/saturationDeduction.model");
const User = require("../models/user.model");

const Branch = require("../models/branch.model"); 
const Department = require("../models/department.model"); 
const Designation = require("../models/designation.model"); 
const PayslipType = require("../models/payslipType.model");

const Leave = require("../models/leave.model");
const ExpenseNew = require("../models/expenseNew.model");
const DeductionOption = require("../models/deductionOption.model");
const Holiday = require("../models/holiday.model"); 
const AttendanceEmployee = require("../models/attendance.model");
const Skill = require("../models/skill.model"); // 🟢 ADDED for skill-based salary

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

function isSuper(req) {
  return (req.user?.roles || []).some(r => (r.name || '').toLowerCase() === 'super admin');
}

function isCompany(req) {
  return (req.user?.type || '').toLowerCase() === 'company';
}

function isEmployee(req) {
  return (req.user?.type || '').toLowerCase() === 'employee';
}

// 🟩 ADD THIS MISSING HELPER FUNCTION
function isCompanyUser(req) {
  const userType = (req.user?.type || '').toLowerCase();
  return ['company', 'admin', 'super admin'].includes(userType);
}

async function getUserBranchId(userId) {
  if (!userId) return null;
  const emp = await Employee.findOne({
    where: { user_id: userId },
    attributes: ['branch_id'],
    raw: true,
  });
  return emp?.branch_id || null;
}

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

function computeValue(amount, type, baseSalary) {
  const val = parseFloat(amount) || 0;
  const normalizedType = (type || "").toLowerCase();
  return (normalizedType === "percentage" || normalizedType === "percent") ? (baseSalary * val) / 100 : val;
}

// 🟩 IMPROVED: Calculate working days excluding holidays
async function getWorkingDaysExcludingHolidays(startDate, endDate, companyId) {
  try {
    const start = moment(startDate);
    const end = moment(endDate);
    let workingDays = 0;
    
    console.log("📅 Calculating working days for:", {
      startDate: start.format('YYYY-MM-DD'),
      endDate: end.format('YYYY-MM-DD'),
      companyId
    });

    // Get all holidays in the date range
    const holidays = await Holiday.findAll({
      where: {
        created_by: companyId,
        [Op.or]: [
          // Single day holidays
          {
            date: { [Op.between]: [startDate, endDate] },
            end_date: { [Op.eq]: Sequelize.col('date') } // Single day holiday
          },
          // Multi-day holidays that overlap with our date range
          {
            date: { [Op.lte]: endDate },
            end_date: { [Op.gte]: startDate }
          }
        ]
      },
      attributes: ['date', 'end_date'],
      raw: true
    });
    
    console.log("🎯 Holidays found:", holidays.length);
    
    // Create a set of all holiday dates
    const holidayDates = new Set();
    holidays.forEach(holiday => {
      const holidayStart = moment(holiday.date);
      const holidayEnd = moment(holiday.end_date || holiday.date);
      
      let current = holidayStart.clone();
      while (current.isSameOrBefore(holidayEnd)) {
        if (current.isBetween(start, end, null, '[]')) {
          holidayDates.add(current.format('YYYY-MM-DD'));
        }
        current.add(1, 'day');
      }
    });

    console.log("📋 Holiday dates:", Array.from(holidayDates));

    // Count working days (Monday to Friday) excluding holidays
    let current = start.clone();
    while (current.isSameOrBefore(end)) {
      const dayOfWeek = current.day();
      const dateStr = current.format('YYYY-MM-DD');
      
      // Check if it's a weekday (1=Monday to 5=Friday) and not a holiday
      if (dayOfWeek >= 1 && dayOfWeek <= 5 && !holidayDates.has(dateStr)) {
        workingDays++;
      }
      current.add(1, 'day');
    }
    
    console.log("📊 Total working days:", workingDays);
    return workingDays;
    
  } catch (error) {
    console.error('❌ Error calculating working days:', error);
    // Fallback: calculate weekdays without holidays
    return getWeekdaysBetween(startDate, endDate);
  }
}

// 🟩 NEW FUNCTION: Calculate weekdays (fallback)
function getWeekdaysBetween(startDate, endDate) {
  const start = moment(startDate);
  const end = moment(endDate);
  let weekdays = 0;
  
  let current = start.clone();
  while (current.isSameOrBefore(end)) {
    const dayOfWeek = current.day();
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      weekdays++;
    }
    current.add(1, 'day');
  }
  
  return weekdays;
}

// 🟢 NEW: Helper function to calculate PF and ESI deductions
function calculateDeduction(deduction, applicableAmount) {
  const amount = parseFloat(deduction.amount || 0);
  const type = String(deduction.type || '').toLowerCase();
  
  if (type === 'percentage') {
    return (amount / 100) * applicableAmount;
  }
  return amount; // fixed amount
}

// 🟢 NEW: Helper function to calculate salary from skill
async function calculateSalaryFromSkill(skillId, branchId) {
  try {
    // Get skill wages
    const skill = await Skill.findByPk(skillId);
    if (!skill) return 0;
    
    // Get branch working days
    const branch = await Branch.findByPk(branchId);
    if (!branch) return Number(skill.wages); // Fallback to skill wages only
    
    // Calculate: skill wages × branch working days
    return Number(skill.wages) * Number(branch.working_days || 26);
  } catch (error) {
    console.error('calculateSalaryFromSkill error:', error);
    return 0;
  }
}

// 🟩 NEW: Check if month is current or past
function isPastMonth(month, year) {
  const currentDate = moment();
  const selectedDate = moment(`${year}-${month}-01`);
  return selectedDate.isBefore(currentDate, 'month');
}

function isCurrentMonth(month, year) {
  const currentDate = moment();
  const selectedDate = moment(`${year}-${month}-01`);
  return selectedDate.isSame(currentDate, 'month');
}

async function getNetSalaryCalculation(req, employeeId, month = null, year = null) {
  return new Promise(async (resolve, reject) => {
    const mockRes = {
      statusCode: 200,
      status: function(code) {
        this.statusCode = code;
        return this;
      },
      json: function(data) {
        if (this.statusCode >= 400) {
          console.error("❌ getNetSalaryCalculation - Error response:", data);
          reject(new Error(data.message || `Calculation failed with status ${this.statusCode}`));
        } else {
          console.log("✅ getNetSalaryCalculation - Success response received");
          resolve(data);
        }
      }
    };

    try {
      const mockReq = {
        params: { employeeId },
        user: req.user,
        query: { month, year }
      };

      console.log("🔍 getNetSalaryCalculation calling calculateNetSalary with:", {
        employeeId, 
        month, 
        year,
        user: req.user?.id
      });

      await exports.calculateNetSalary(mockReq, mockRes);
    } catch (error) {
      console.error("❌ getNetSalaryCalculation - Unexpected error:", error);
      reject(new Error("Unexpected error in salary calculation: " + error.message));
    }
  });
}

exports.calculateNetSalary = async (req, res) => {
  try {
    const employeeBusinessId = req.params.employeeId;
    if (!employeeBusinessId)
      return res.status(400).json({ success: false, message: 'employeeId required' });

    const companyId = await getCompanyId(req);
    if (!companyId)
      return res.status(403).json({ success: false, message: 'Unable to resolve company for current user' });

    // 🟢 Get target month and year
    const { month, year } = req.query;
    const targetMonth = month ? parseInt(month) : moment().month() + 1;
    const targetYear = year ? parseInt(year) : moment().year();
    
    const startOfMonth = moment(`${targetYear}-${targetMonth.toString().padStart(2, '0')}-01`).startOf('month').format('YYYY-MM-DD');
    const endOfMonth = moment(`${targetYear}-${targetMonth.toString().padStart(2, '0')}-01`).endOf('month').format('YYYY-MM-DD');
    const startOfYear = moment(`${targetYear}-01-01`).startOf('year').format('YYYY-MM-DD');
    const endOfYear = moment(`${targetYear}-12-31`).endOf('year').format('YYYY-MM-DD');
    
    console.log(`🎯 Calculating salary for ${targetMonth}/${targetYear}`);
    console.log(`📅 Month Range: ${startOfMonth} to ${endOfMonth}`);

    // 🟢 Fetch employee with related data
    const employee = await Employee.findOne({
      where: { employee_id: employeeBusinessId, deleted_at: null },
      attributes: [
        'id',
        'employee_id',
        'name',
        'email',
        'branch_id',
        'salary',
        'salary_type',
        'created_by',
        'skill_id',
        'designation_id',
        'department_id'
      ],
      include: [
        {
          model: Skill,
          as: 'skill',
          attributes: ['id', 'name', 'wages']
        },
        {
          model: Branch,
          as: 'branch',
          attributes: ['id', 'name', 'working_days', 'working_hours']
        },
        {
          model: Designation,
          as: 'designation',
          attributes: ['id', 'name', 'overtime_rate']
        },
        {
            model: Department,
            as:'department',
            attributes: ['id', 'name']
        }
      ]
    });
    
    if (!employee)
      return res.status(404).json({ success: false, message: 'Employee not found' });

    // 🟢 VALIDATION: Check if employee has required data
    if (!employee.skill_id || !employee.skill) {
      return res.status(400).json({ 
        success: false, 
        message: 'Employee skill not set. Please set skill first.' 
      });
    }

    if (!employee.branch_id || !employee.branch) {
      return res.status(400).json({ 
        success: false, 
        message: 'Employee branch not found' 
      });
    }

    // 🟢 Access control (same as before)
    const userType = (req.user?.type || '').toLowerCase();
    
    if (userType === 'employee') {
      const self = await Employee.findOne({ where: { user_id: req.user.id } });
      if (!self || String(self.employee_id) !== String(employeeBusinessId)) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: can only view your own salary',
        });
      }
    } else {
      const userEmployeeRecord = await Employee.findOne({
        where: { user_id: req.user.id },
        attributes: ['branch_id', 'created_by'],
        raw: true,
      });
    
      if (userEmployeeRecord && userEmployeeRecord.branch_id) {
        const userBranchId = userEmployeeRecord.branch_id;
        if (String(employee.branch_id) !== String(userBranchId)) {
          return res.status(403).json({
            success: false,
            message: 'Forbidden: can only view salary of employees in your branch',
          });
        }
      } else {
        if (isCompanyUser(req)) {
          const companyUsers = await User.findAll({
            where: { created_by: companyId },
            attributes: ['id'],
            raw: true,
          });
          const allowedCreatorIds = companyUsers.map(u => u.id).concat(companyId);
    
          if (!allowedCreatorIds.includes(employee.created_by)) {
            return res.status(403).json({
              success: false,
              message: 'Forbidden: not your company employee',
            });
          }
        }
      }
    }

    // 🟢 Get employee data
    const skillWages = Number(employee.skill?.wages || 0);
    const branchWorkingDays = Number(employee.branch?.working_days || 26);
    const branchWorkingHours = Number(employee.branch?.working_hours || 8);
    const designationOvertimeRate = Number(employee.designation?.overtime_rate || 1);

    // 🟢 STEP 1: Fetch Attendance Data (FIXED - including early_leaving column)
    let attendanceData = [];
    try {
      attendanceData = await AttendanceEmployee.findAll({
        where: {
          employee_id: employee.employee_id,
          date: {
            [Op.between]: [startOfMonth, endOfMonth]
          }
        },
        attributes: ['id', 'date', 'status', 'clock_in', 'clock_out', 'total_rest', 'overtime', 'early_leaving'],
        order: [['date', 'ASC']],
        raw: true
      });
      
      console.log(`📅 Found ${attendanceData.length} attendance records for the month`);
      
    } catch (attendanceError) {
      console.warn('⚠️ Error fetching attendance:', attendanceError.message);
    }

    // 🟢 Calculate Actual Working Days Based on Attendance (SIMPLE VERSION)
    let actualWorkingDays = 0;
    let attendanceOvertimeHours = 0;
    let earlyLeavingHours = 0;

    if (attendanceData.length > 0) {
      attendanceData.forEach(record => {
        if (record.status === 'Present') {
          actualWorkingDays += 1;
        } else if (record.status === 'Half Day') {
          actualWorkingDays += 0.5;
        }
        
        // 🟢 Overtime (HH:mm:ss → hours) - FIXED
        if (record.overtime && record.overtime !== '00:00:00') {
          const [h, m, s] = String(record.overtime).split(':').map(Number);
          attendanceOvertimeHours += h + m / 60 + s / 3600;
        }
        
        // 🟢 EARLY LEAVING CALCULATION (HH:mm:ss → hours)
        if (record.early_leaving && record.early_leaving !== '00:00:00') {
          const [h, m, s] = String(record.early_leaving).split(':').map(Number);
          earlyLeavingHours += h + m / 60 + s / 3600;
        }
      });
      
      console.log(`📊 Actual working days from attendance: ${actualWorkingDays.toFixed(1)} days`);
      console.log(`⏰ Total overtime hours from attendance: ${attendanceOvertimeHours.toFixed(2)} hours`);
      console.log(`🏃 Total early leaving hours from attendance: ${earlyLeavingHours.toFixed(2)} hours`);
      
      // Log attendance summary
      const presentCount = attendanceData.filter(r => r.status === 'Present').length;
      const halfDayCount = attendanceData.filter(r => r.status === 'Half Day').length;
      const absentCount = attendanceData.filter(r => r.status === 'Absent').length;
      console.log(`📊 Attendance Summary: ${presentCount} Present + ${halfDayCount} Half Day + ${absentCount} Absent`);
      
    } else {
      console.log(`📊 No attendance data found for the month.`);
    }

    // 🟢 FIXED: Calculate working days for salary - ALWAYS use actualWorkingDays
    const workingDaysForSalary = actualWorkingDays;
    
    // ✅ KEEP THIS LOGIC (from first calculateNetSalary)
    const normalWorkingDays = Math.min(actualWorkingDays, branchWorkingDays);
    const excessWorkingDays = Math.max(actualWorkingDays - branchWorkingDays, 0);

    // 🟢 STEP 2: Calculate Base Salary = Skill Wages × Actual Working Days
    const baseSalary = skillWages * workingDaysForSalary;
    console.log(`💰 Base Salary Calculation: ${skillWages} (skill wages) × ${workingDaysForSalary} (actual working days) = ${baseSalary.toFixed(2)}`);

    // Calculate hourly rate for overtime (BASE only)
    const baseHourlyRate = skillWages / branchWorkingHours;
    console.log(`⏰ Base Hourly Rate: ${skillWages} / ${branchWorkingHours} = ₹${baseHourlyRate.toFixed(2)} per hour`);

    // Get user IDs for access control
    const userEmployeeRecord = await Employee.findOne({
      where: { user_id: req.user.id },
      attributes: ['branch_id', 'created_by'],
      raw: true,
    });

    let userIds = [];

    if (userEmployeeRecord && userEmployeeRecord.branch_id) {
      const branchId = userEmployeeRecord.branch_id;
      userIds = await getAllUserIdsUnderCompanyBranch(companyId, branchId);
    } else {
      userIds = await getAllUserIdsUnderCompanyBranch(companyId, null);
    }
    
    console.log('🔍 Allowed User IDs:', userIds);

    // 🟢 STEP 3: Get All Components
    const [allowances, saturationDeductions, commissions, loans, otherPayments, overtimes, employeeAdvances] =
      await Promise.all([
        Allowance.findAll({ 
          where: { 
            employee_id: employee.employee_id,
            created_by: { [Op.in]: userIds }
          },
          raw: true
        }),
        SaturationDeduction.findAll({ 
          where: { 
            employee_id: employee.employee_id,
            created_by: { [Op.in]: userIds }
          },
          raw: true
        }),
        Commission.findAll({ 
          where: { 
            employee_id: employee.id,
            created_by: { [Op.in]: userIds },
            created_at: { [Op.between]: [startOfMonth, endOfMonth] }
          },
          raw: true
        }), 
        Loan.findAll({ 
          where: { 
            employee_id: employee.employee_id,
            created_by: { [Op.in]: userIds },
            created_at: { [Op.between]: [startOfMonth, endOfMonth] }
          },
          raw: true
        }),
        OtherPayment.findAll({ 
          where: { 
            employee_id: employee.employee_id,
            created_by: { [Op.in]: userIds },
            created_at: { [Op.between]: [startOfMonth, endOfMonth] }
          },
          raw: true
        }),
        Overtime.findAll({ 
          where: { 
            employee_id: employee.employee_id,
            created_by: { [Op.in]: userIds },
            created_at: { [Op.between]: [startOfMonth, endOfMonth] }
          },
          raw: true
        }),
        ExpenseNew.findAll({ 
          where: { 
            employee_id: employee.employee_id, 
            created_by: { [Op.in]: userIds }, 
            payments_status: 'paid',
            payment_date: {
              [Op.between]: [startOfMonth, endOfMonth]
            }
          },
          raw: true
        }),
      ]);

    console.log(`📊 Data Count for ${targetMonth}/${targetYear}:`);
    console.log(`   Allowances: ${allowances.length}`);
    console.log(`   Saturation Deductions: ${saturationDeductions.length}`);
    console.log(`   Commissions: ${commissions.length}`);
    console.log(`   Loans: ${loans.length}`);
    console.log(`   Other Payments: ${otherPayments.length}`);
    console.log(`   Overtimes: ${overtimes.length}`);
    console.log(`   Advances: ${employeeAdvances.length}`);

    // 🟢 STEP 4: Calculate Allowances based on ACTUAL working days (SIMPLE VERSION)
    const allowancesList = allowances.map((i) => {
      let computedAmount = 0;
      const rawAmount = parseFloat(i.amount || 0);
      
      if (String(i.type || '').toLowerCase() === 'percentage') {
        computedAmount = (rawAmount / 100) * baseSalary;
      } else {
        computedAmount = rawAmount * workingDaysForSalary;
      }
      
      return {
        id: i.id,
        title: i.title,
        type: i.type,
        raw_amount: rawAmount,
        computed_amount: Number(computedAmount.toFixed(2)),
        created_at: i.created_at,
        is_permanent: true,
        calculation_note: String(i.type || '').toLowerCase() === 'percentage' 
          ? `${rawAmount}% of actual base salary (₹${baseSalary.toFixed(2)})` 
          : `₹${rawAmount} × ${workingDaysForSalary.toFixed(1)} actual working days`
      };
    });

    const allowancesTotal = allowancesList.reduce((sum, item) => sum + item.computed_amount, 0);
    console.log(`💰 Total Allowances: ₹${allowancesTotal.toFixed(2)} (based on ${workingDaysForSalary.toFixed(1)} actual days)`);

    // 🟢 FIXED: Calculate DAILY allowance rate for overtime calculation
    const dailyAllowanceRate = workingDaysForSalary > 0 ? allowancesTotal / workingDaysForSalary : 0;
    const allowanceHourlyRate = dailyAllowanceRate / branchWorkingHours;

    console.log(`📊 Daily Allowance Rate: ${allowancesTotal.toFixed(2)} / ${workingDaysForSalary.toFixed(1)} = ₹${dailyAllowanceRate.toFixed(2)} per day`);
    console.log(`⏰ Allowance Hourly Rate: ${dailyAllowanceRate.toFixed(2)} / ${branchWorkingHours} = ₹${allowanceHourlyRate.toFixed(2)} per hour`);

    // 🟢 STEP 5: Calculate Overtime (SIMPLE VERSION)
    const overtimeList = [];

    // 1. Overtime from Overtime table
    overtimes.forEach((o) => {
      const otHours = parseFloat(o.hours || o.ot_hours || 0);
      
      if (otHours > 0) {
        const baseOvertimeAmount = designationOvertimeRate * baseHourlyRate * otHours;
        const allowanceOvertimeAmount = designationOvertimeRate * allowanceHourlyRate * otHours;
        const totalOvertimeAmount = baseOvertimeAmount + allowanceOvertimeAmount;
        
        overtimeList.push({
          id: o.id,
          title: o.title || 'Overtime',
          date: o.date,
          ot_hours: otHours,
          base_hourly_rate: Number(baseHourlyRate.toFixed(2)),
          allowance_hourly_rate: Number(allowanceHourlyRate.toFixed(2)),
          overtime_rate: designationOvertimeRate,
          base_overtime_amount: Number(baseOvertimeAmount.toFixed(2)),
          allowance_overtime_amount: Number(allowanceOvertimeAmount.toFixed(2)),
          computed_amount: Number(totalOvertimeAmount.toFixed(2)),
          created_at: o.created_at,
          source: 'overtime_table'
        });
      }
    });

    // 2. Overtime from Attendance records
    if (attendanceOvertimeHours > 0 && overtimes.length === 0) {
      const baseOvertimeAmount = designationOvertimeRate * baseHourlyRate * attendanceOvertimeHours;
      const allowanceOvertimeAmount = designationOvertimeRate * allowanceHourlyRate * attendanceOvertimeHours;
      const totalOvertimeAmount = baseOvertimeAmount + allowanceOvertimeAmount;
      
      overtimeList.push({
        id: 'attendance-overtime',
        title: 'Overtime from Attendance',
        date: 'Various dates',
        ot_hours: attendanceOvertimeHours,
        base_hourly_rate: Number(baseHourlyRate.toFixed(2)),
        allowance_hourly_rate: Number(allowanceHourlyRate.toFixed(2)),
        overtime_rate: designationOvertimeRate,
        base_overtime_amount: Number(baseOvertimeAmount.toFixed(2)),
        allowance_overtime_amount: Number(allowanceOvertimeAmount.toFixed(2)),
        computed_amount: Number(totalOvertimeAmount.toFixed(2)),
        created_at: new Date(),
        source: 'attendance_records'
      });
    }

    const overtimeTotal = overtimeList.reduce((sum, item) => sum + item.computed_amount, 0);
    const baseOvertimeTotal = overtimeList.reduce((sum, item) => sum + item.base_overtime_amount, 0);
    const allowanceOvertimeTotal = overtimeList.reduce((sum, item) => sum + item.allowance_overtime_amount, 0);
    
    console.log(`💰 Overtime Breakdown: ${overtimeList.length} records, Base ₹${baseOvertimeTotal.toFixed(2)} + Allowances ₹${allowanceOvertimeTotal.toFixed(2)} = Total ₹${overtimeTotal.toFixed(2)}`);

    // 🟢 STEP 6: Calculate Other Components
    const computeValue = (amount, type, base) => {
      const rawAmount = parseFloat(amount || 0);
      if (String(type || '').toLowerCase() === 'percentage') {
        return (rawAmount / 100) * base;
      }
      return rawAmount;
    };

    const commissionsList = commissions.map((i) => ({
      id: i.id,
      title: i.title,
      type: i.type,
      raw_amount: parseFloat(i.amount || 0),
      computed_amount: Number(computeValue(i.amount, i.type, baseSalary).toFixed(2)),
      created_at: i.created_at,
      is_permanent: false,
    }));

    const otherPaymentsList = otherPayments.map((i) => ({
      id: i.id,
      title: i.title,
      type: i.type,
      raw_amount: parseFloat(i.amount || 0),
      computed_amount: Number(computeValue(i.amount, i.type, baseSalary).toFixed(2)),
      created_at: i.created_at,
      is_permanent: false,
    }));

    const loansList = loans.map((i) => ({
      id: i.id,
      title: i.title,
      type: i.type,
      raw_amount: parseFloat(i.amount || 0),
      computed_amount: Number(computeValue(i.amount, i.type, baseSalary).toFixed(2)),
      created_at: i.created_at,
      is_permanent: false,
    }));

    const advancesList = employeeAdvances.map(a => ({
      id: a.id,
      title: 'Advance Payment',
      payment_date: a.payment_date,
      total_amount: Number(a.total_amount || 0),
      computed_amount: Number(a.total_amount || 0),
      created_at: a.created_at,
      is_permanent: false,
    }));

    const commissionsTotal = commissionsList.reduce((sum, item) => sum + item.computed_amount, 0);
    const otherPaymentsTotal = otherPaymentsList.reduce((sum, item) => sum + item.computed_amount, 0);
    const loansTotal = loansList.reduce((sum, item) => sum + item.computed_amount, 0);
    const advancesTotal = advancesList.reduce((sum, item) => sum + item.computed_amount, 0);

    // 🟢 STEP 7: Early leaving deduction
    const earlyLeavingDeductionTotal = earlyLeavingHours * (baseHourlyRate + allowanceHourlyRate);
    console.log(`🏃 Early Leaving Deduction: ${earlyLeavingHours.toFixed(2)} hours × (₹${baseHourlyRate.toFixed(2)} + ₹${allowanceHourlyRate.toFixed(2)}) = ₹${earlyLeavingDeductionTotal.toFixed(2)}`);

    // 🟢 STEP 8: Calculate Saturation Deductions (PF/ESI ONLY) - FIXED FORMULA
    // ✅ FIXED PF & ESI BASES (from first calculateNetSalary)
    const pfApplicableAmount = baseSalary + overtimeTotal + allowancesTotal - earlyLeavingDeductionTotal;
    const esiApplicableAmount = baseSalary + allowancesTotal + commissionsTotal + otherPaymentsTotal;

    console.log(`💵 PF Applicable Amount: ${pfApplicableAmount.toFixed(2)} (Base + Overtime + Allowances - Early Leaving)`);
    console.log(`💵 ESI Applicable Amount: ${esiApplicableAmount.toFixed(2)} (Base + Allowances)`);

    let totalPFDeduction = 0;
    let totalESIDeduction = 0;

    saturationDeductions.forEach(sd => {
      const deductionType = String(sd.title || '').toUpperCase();
      const rawAmount = parseFloat(sd.amount || 0);
      const type = String(sd.type || '').toLowerCase();
      
      if (deductionType === 'PF' || deductionType === 'ESI') {
        let applicableAmount = deductionType === 'PF' ? pfApplicableAmount : esiApplicableAmount;
        let computedAmount = 0;
        
        if (type === 'percentage') {
          computedAmount = (rawAmount / 100) * applicableAmount;
        } else {
          computedAmount = rawAmount;
        }
        
        if (deductionType === 'PF') {
          totalPFDeduction += computedAmount;
        } else if (deductionType === 'ESI') {
          totalESIDeduction += computedAmount;
        }
      }
    });

    const saturationTotal = totalPFDeduction + totalESIDeduction;
    const validSaturationDeductions = saturationDeductions.map(sd => ({
      id: sd.id,
      title: sd.title,
      type: sd.type,
      deduction_type: String(sd.title || '').toUpperCase(),
      raw_amount: parseFloat(sd.amount || 0),
      computed_amount: String(sd.title || '').toUpperCase() === 'PF' ? totalPFDeduction : totalESIDeduction,
      created_at: sd.created_at,
      is_permanent: true,
    }));

    console.log(`💸 Deductions Summary:`);
    console.log(`   PF Deductions: ${totalPFDeduction.toFixed(2)}`);
    console.log(`   ESI Deductions: ${totalESIDeduction.toFixed(2)}`);
    console.log(`   Total Saturation Deductions: ${saturationTotal.toFixed(2)}`);
    console.log(`   Loans: ${loansTotal.toFixed(2)}`);
    console.log(`   Advances: ${advancesTotal.toFixed(2)}`);
    console.log(`   Early Leaving Deduction: ${earlyLeavingDeductionTotal.toFixed(2)}`);

    // 🟢 STEP 9: Progressive Annual Leave Calculation
    console.log(`🔍 Progressive Annual Leave Calculation for Year: ${targetYear}`);
    
    const leavesUpToCurrentMonth = await Leave.findAll({
      where: {
        employee_id: employee.id,
        status: 'Approved',
        [Op.or]: [
          {
            start_date: { 
              [Op.between]: [startOfYear, endOfMonth]
            }
          },
          {
            end_date: { 
              [Op.between]: [startOfYear, endOfMonth]
            }
          },
          {
            [Op.and]: [
              { start_date: { [Op.lte]: startOfYear } },
              { end_date: { [Op.gte]: endOfMonth } }
            ]
          }
        ]
      },
      attributes: ['id', 'start_date', 'end_date', 'total_leave_days'],
      raw: true
    });
    
    const cumulativeLeavesUpToCurrent = leavesUpToCurrentMonth.reduce((sum, leave) => {
      const days = parseFloat(leave.total_leave_days || 0);
      return sum + (isNaN(days) ? 0 : days);
    }, 0);
    
    let deductibleLeavesThisMonth = 0;
    let freeLeavesRemaining = 18;
    
    if (cumulativeLeavesUpToCurrent > 18) {
      deductibleLeavesThisMonth = cumulativeLeavesUpToCurrent - 18;
      freeLeavesRemaining = 0;
    } else {
      freeLeavesRemaining = 18 - cumulativeLeavesUpToCurrent;
      deductibleLeavesThisMonth = 0;
    }
    
    const currentMonthLeaves = await Leave.findAll({
      where: {
        employee_id: employee.id,
        status: 'Approved',
        [Op.or]: [
          {
            start_date: { [Op.between]: [startOfMonth, endOfMonth] }
          },
          {
            end_date: { [Op.between]: [startOfMonth, endOfMonth] }
          },
          {
            [Op.and]: [
              { start_date: { [Op.lte]: startOfMonth } },
              { end_date: { [Op.gte]: endOfMonth } }
            ]
          }
        ]
      },
      attributes: ['id', 'start_date', 'end_date', 'total_leave_days'],
      raw: true 
    });
    
    const currentMonthLeaveDays = currentMonthLeaves.reduce((sum, leave) => {
      const days = parseFloat(leave.total_leave_days || 0);
      return sum + (isNaN(days) ? 0 : days);
    }, 0);
    
    // Daily salary based on ACTUAL working days
    const dailySalary = workingDaysForSalary > 0 ? baseSalary / workingDaysForSalary : 0;
    const leaveDeductionThisMonth = deductibleLeavesThisMonth * dailySalary;
    
    console.log(`📊 Progressive Leave Summary:`);
    console.log(`   Cumulative Leaves: ${cumulativeLeavesUpToCurrent} days`);
    console.log(`   Current Month Leaves: ${currentMonthLeaveDays} days`);
    console.log(`   Free Leaves Remaining: ${freeLeavesRemaining} days`);
    console.log(`   Deductible Leaves This Month: ${deductibleLeavesThisMonth} days`);
    console.log(`   Daily Salary: ₹${dailySalary.toFixed(2)}`);
    console.log(`   Leave Deduction: ₹${leaveDeductionThisMonth.toFixed(2)}`);

    // 🟢 STEP 10: Calculate Gross Salary
    const additionsTotal = allowancesTotal + commissionsTotal + otherPaymentsTotal + overtimeTotal;
    const gross = baseSalary + additionsTotal;
    
    console.log(`💰 Gross Salary Calculation:`);
    console.log(`   Base Salary (actual): ${baseSalary.toFixed(2)}`);
    console.log(`   Allowances: ${allowancesTotal.toFixed(2)}`);
    console.log(`   Commissions: ${commissionsTotal.toFixed(2)}`);
    console.log(`   Other Payments: ${otherPaymentsTotal.toFixed(2)}`);
    console.log(`   Overtime: ${overtimeTotal.toFixed(2)}`);
    console.log(`   Total Additions: ${additionsTotal.toFixed(2)}`);
    console.log(`   Gross Salary: ${gross.toFixed(2)}`);

    // 🟢 STEP 11: Calculate Total Deductions and Net Salary
    const deductionsTotal = loansTotal + saturationTotal + advancesTotal + leaveDeductionThisMonth + earlyLeavingDeductionTotal;
    const netSalary = Number((gross - deductionsTotal).toFixed(2));
    
    console.log(`✅ Final Calculation:`);
    console.log(`   Gross Salary: ${gross.toFixed(2)}`);
    console.log(`   Total Deductions: ${deductionsTotal.toFixed(2)}`);
    console.log(`   Net Salary: ${netSalary}`);

    // 🟢 Calculate what full month salary would be (for reference)
    const fullMonthBaseSalary = skillWages * branchWorkingDays;
    const salaryAdjustment = baseSalary - fullMonthBaseSalary;
    const attendancePercentage = attendanceData.length > 0 ? (actualWorkingDays / branchWorkingDays) * 100 : 0;
    
    // 🟢 Return response (keeping the same format as before)
    return res.status(200).json({
      success: true,
      data: {
        period: {
          month: targetMonth,
          year: targetYear,
          start_date: startOfMonth,
          end_date: endOfMonth,
          display: moment(`${targetYear}-${targetMonth.toString().padStart(2, '0')}-01`).format('MMMM YYYY')
        },
        employee: {
          employee_id: employee.employee_id,
          name: employee.name,
          branch_id: employee.branch_id,
          salary_type: employee.salary_type,
          base_salary_calculation: {
            skill_wages: skillWages,
            branch_planned_working_days: branchWorkingDays,
            actual_working_days: Number(actualWorkingDays.toFixed(1)),
            normal_working_days: normalWorkingDays,
            excess_working_days: excessWorkingDays,
            attendance_percentage: Number(attendancePercentage.toFixed(2)),
            calculated_base_salary: Number(baseSalary.toFixed(2)),
            full_month_base_salary: Number(fullMonthBaseSalary.toFixed(2)),
            salary_adjustment: Number(salaryAdjustment.toFixed(2))
          },
          stored_salary: employee.salary,
        },
        attendance_summary: {
          planned_working_days: branchWorkingDays,
          actual_working_days: Number(actualWorkingDays.toFixed(1)),
          normal_working_days: normalWorkingDays,
          excess_working_days: excessWorkingDays,
          attendance_percentage: Number(attendancePercentage.toFixed(2)),
          attendance_records_count: attendanceData.length,
          overtime_hours: Number(attendanceOvertimeHours.toFixed(2)),
          early_leaving_hours: Number(earlyLeavingHours.toFixed(2)),
          note: attendanceData.length > 0 
            ? `Salary calculated based on actual attendance (${attendanceData.filter(r => r.status === 'Present').length} Present + ${attendanceData.filter(r => r.status === 'Half Day').length} Half Day)` 
            : 'No attendance data found. Salary calculated based on 0 working days.'
        },
        progressive_leave_summary: {
          cumulative_leaves_upto_current: cumulativeLeavesUpToCurrent,
          current_month_leaves: currentMonthLeaveDays,
          free_leaves_allowed: 18,
          free_leaves_remaining: freeLeavesRemaining,
          deductible_leaves_this_month: deductibleLeavesThisMonth,
          daily_salary: Number(dailySalary.toFixed(2)),
          leave_deduction_this_month: Number(leaveDeductionThisMonth.toFixed(2))
        },
        breakdown: {
          base_salary_calculation: {
            skill_wages: skillWages,
            branch_planned_working_days: branchWorkingDays,
            actual_working_days: Number(actualWorkingDays.toFixed(1)),
            normal_working_days: normalWorkingDays,
            excess_working_days: excessWorkingDays,
            calculated_amount: Number(baseSalary.toFixed(2))
          },
          base_salary: Number(baseSalary.toFixed(2)),
          
          allowances: allowancesList,
          allowances_total: Number(allowancesTotal.toFixed(2)),
          
          allowance_rate_calculation: {
            daily_allowance_rate: Number(dailyAllowanceRate.toFixed(2)),
            allowance_hourly_rate: Number(allowanceHourlyRate.toFixed(2)),
            note: 'Daily allowance rate calculated for accurate overtime calculation'
          },
          
          commissions: commissionsList,
          commissions_total: Number(commissionsTotal.toFixed(2)),
          
          other_payments: otherPaymentsList,
          other_payments_total: Number(otherPaymentsTotal.toFixed(2)),
          
          overtime: overtimeList,
          overtime_calculation: {
            base_hourly_rate: Number(baseHourlyRate.toFixed(2)),
            allowance_hourly_rate: Number(allowanceHourlyRate.toFixed(2)),
            designation_overtime_rate: designationOvertimeRate,
          },
          overtime_total: Number(overtimeTotal.toFixed(2)),
          overtime_breakdown: {
            base_overtime_total: Number(baseOvertimeTotal.toFixed(2)),
            allowance_overtime_total: Number(allowanceOvertimeTotal.toFixed(2))
          },
          
          loans: loansList,
          loans_total: Number(loansTotal.toFixed(2)),
          
          early_leaving_deduction: {
            early_leaving_hours: Number(earlyLeavingHours.toFixed(2)),
            deduction_rate: Number((baseHourlyRate + allowanceHourlyRate).toFixed(2)),
            total_deduction: Number(earlyLeavingDeductionTotal.toFixed(2))
          },
          
          saturation_deductions: validSaturationDeductions,
          saturation_deduction_breakdown: {
            pf_deductions: {
              applicable_amount: Number(pfApplicableAmount.toFixed(2)),
              total: Number(totalPFDeduction.toFixed(2)),
              calculation_note: 'Base + Overtime + Allowances - Early Leaving'
            },
            esi_deductions: {
              applicable_amount: Number(esiApplicableAmount.toFixed(2)),
              total: Number(totalESIDeduction.toFixed(2)),
              calculation_note: 'Base + Allowances'
            }
          },
          saturation_total: Number(saturationTotal.toFixed(2)),
          
          advances: advancesList,
          advances_total: Number(advancesTotal.toFixed(2)),
          
          totals: {
            additions: Number(additionsTotal.toFixed(2)),
            deductions: Number(deductionsTotal.toFixed(2)),
            gross: Number(gross.toFixed(2)),
            net: netSalary,
            full_month_comparison: {
              full_month_base_salary: Number(fullMonthBaseSalary.toFixed(2)),
              adjustment_due_to_attendance: Number(salaryAdjustment.toFixed(2))
            }
          },
        },
      },
    });
  } catch (err) {
    console.error('❌ Calculate Net Salary Error:', err);
    return res.status(500).json({ success: false, message: 'Server Error', error: err.message });
  }
};


exports.bulkCreatePayslipsForMonth = async (req, res) => {
  try {
    console.log('🚀 START bulkCreatePayslipsForMonth');

    const { month, year, branch_ids, recalculate_existing = false } = req.body;
    
    if (!month || !year) {
      return res.status(400).json({ 
        success: false, 
        message: "Month and year are required" 
      });
    }

    const companyId = await getCompanyId(req);
    if (!companyId && !isSuper(req)) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const userId = req.user.id;
    const userType = (req.user.type || "").toLowerCase();
    const salary_month = `${year}-${String(month).padStart(2, "0")}`;

    console.log("🎯 Bulk Payslip Generation Request:", {
      month,
      year,
      salary_month,
      branch_ids,
      recalculate_existing,
      userType,
      userId,
      companyId
    });

    // Check if month is in future
    const currentDate = moment();
    const requestedDate = moment(`${year}-${month}-01`);

    if (requestedDate.isAfter(currentDate, 'month')) {
      return res.status(400).json({
        success: false,
        message: "Cannot generate payslips for future months",
        data: [],
        summary: {
          month: parseInt(month),
          year: parseInt(year),
          salary_month,
          error: "Future month not allowed"
        }
      });
    }

    // =======================================================
    // 🔹 BRANCH ACCESS & VALIDATION
    // =======================================================
    let targetBranchIds = [];

    const isAccountant = userType === 'accountant';
    
    if (isSuper(req)) {
      console.log('👑 Super Admin - Full branch access');
      if (branch_ids && branch_ids.length > 0) {
        targetBranchIds = branch_ids;
      } else {
        const allBranches = await Branch.findAll({
          attributes: ["id"],
          raw: true,
        });
        targetBranchIds = allBranches.map(b => b.id);
      }
    } else if (isCompany(req) || isAccountant) {
      console.log('🏢 Company User/Accountant - Company branches access');
      
      if (branch_ids && branch_ids.length > 0) {
        const validBranches = await Branch.findAll({
          where: { 
            id: { [Op.in]: branch_ids },
            created_by: companyId 
          },
          attributes: ["id"],
          raw: true,
        });
        targetBranchIds = validBranches.map(b => b.id);
        
        if (targetBranchIds.length === 0) {
          return res.status(400).json({ 
            success: false, 
            message: "No valid branches found for the company" 
          });
        }
      } else {
        const companyBranches = await Branch.findAll({
          where: { created_by: companyId },
          attributes: ["id"],
          raw: true,
        });
        targetBranchIds = companyBranches.map(b => b.id);
        
        if (targetBranchIds.length === 0) {
          return res.status(404).json({ 
            success: false, 
            message: "No branches found for this company" 
          });
        }
      }
    } else {
      console.log('🏢 Branch User - Limited branch access');
      const branchUser = await Employee.findOne({
        where: { user_id: userId },
        attributes: ["branch_id"],
        raw: true,
      });

      if (!branchUser || !branchUser.branch_id) {
        return res.status(403).json({ success: false, message: "Branch not found for user" });
      }

      targetBranchIds = [branchUser.branch_id];
    }

    if (targetBranchIds.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "No branches found for access" 
      });
    }

    console.log('🎯 Final Target Branch IDs:', targetBranchIds);

    // =======================================================
    // 🔹 GET ALL EMPLOYEES WITH SKILL DATA
    // =======================================================
    const salaryMonthEnd = moment(`${year}-${month}-01`).endOf('month');

    const allEmployees = await Employee.findAll({
      where: { 
        branch_id: { [Op.in]: targetBranchIds },
        deleted_at: null
      },
      attributes: ["id", "employee_id", "name", "salary", "branch_id", "company_doj", "skill_id", "designation_id"],
      include: [
        {
          model: Skill,
          as: 'skill',
          attributes: ['id', 'name', 'wages'],
          required: false
        },
        {
          model: Designation,
          as: 'designation',
          attributes: ['id', 'name', 'overtime_rate'],
          required: false
        },
        {
          model: Branch,
          as: 'branch',
          attributes: ['id', 'name', 'working_days', 'working_hours'],
          required: false
        }
      ],
      raw: false
    });

    if (allEmployees.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "No employees found for the specified branches",
        data: []
      });
    }

    console.log(`👥 Found ${allEmployees.length} total employees across ${targetBranchIds.length} branches`);

    // Filter employees by date of joining
    const eligibleEmployees = allEmployees.filter(employee => {
      if (!employee.company_doj) {
        return true;
      }
      
      const joinDate = moment(employee.company_doj);
      const isEligible = joinDate.isSameOrBefore(salaryMonthEnd, 'day');
      
      if (!isEligible) {
        console.log(`⏩ SKIPPING employee ${employee.name} (${employee.employee_id}) - Joined: ${joinDate.format('YYYY-MM-DD')}, Payslip Month: ${salary_month}`);
      }
      
      return isEligible;
    });

    console.log(`📊 Employee Eligibility Summary:`, {
      total_employees: allEmployees.length,
      eligible_employees: eligibleEmployees.length,
      skipped_employees: allEmployees.length - eligibleEmployees.length,
      eligibility_rate: ((eligibleEmployees.length / allEmployees.length) * 100).toFixed(2) + '%'
    });

    if (eligibleEmployees.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: `No eligible employees found for ${salary_month}. All employees joined after this month.`,
        data: [],
        summary: {
          month: parseInt(month),
          year: parseInt(year),
          salary_month,
          total_employees: allEmployees.length,
          eligible_employees: 0,
          skipped_due_to_doj: allEmployees.length
        }
      });
    }

    // =======================================================
    // 🔹 CHECK EXISTING PAYSLIPS
    // =======================================================
    const existingPayslips = await Payslip.findAll({
      where: {
        employee_id: { [Op.in]: eligibleEmployees.map(emp => emp.employee_id) },
        salary_month,
        is_deleted: false
      }
    });

    console.log(`🔍 Found ${existingPayslips.length} existing payslips for ${salary_month}`);

    if (existingPayslips.length > 0 && !recalculate_existing) {
      console.log(`ℹ️ ${existingPayslips.length} payslips already exist for ${salary_month}, returning existing data`);
      
      const transformedPayslips = await Promise.all(
        existingPayslips.map(async (payslip) => {
          const employee = eligibleEmployees.find(emp => {
            const empId = String(emp.employee_id);
            const payslipId = String(payslip.employee_id);
            return empId === payslipId;
          });
          
          return {
            ...payslip.toJSON(),
            status: payslip.status === 1 ? "paid" : "unpaid",
            employee: employee ? {
              id: employee.id,
              name: employee.name,
              employee_id: employee.employee_id,
              skill: employee.skill,
              designation: employee.designation
            } : {
              id: null,
              name: "Employee Not Found",
              employee_id: payslip.employee_id
            }
          };
        })
      );

      return res.status(200).json({
        success: true,
        message: `Payslips already exist for ${salary_month}. Returning existing data. Use recalculate_existing=true to update with current payroll data.`,
        data: transformedPayslips,
        summary: {
          month: parseInt(month),
          year: parseInt(year),
          salary_month,
          total_employees: allEmployees.length,
          eligible_employees: eligibleEmployees.length,
          existing_payslips: existingPayslips.length,
          skipped_due_to_doj: allEmployees.length - eligibleEmployees.length,
          action: "retrieved_existing",
          note: "Set recalculate_existing=true to update payslips with current payroll data"
        }
      });
    }

    // =======================================================
    // 🔹 PROCESS EMPLOYEES
    // =======================================================
    const results = {
      total_employees: allEmployees.length,
      eligible_employees: eligibleEmployees.length,
      total_branches: targetBranchIds.length,
      payslips_created: 0,
      payslips_updated: 0,
      payslips_failed: 0,
      skipped_due_to_doj: allEmployees.length - eligibleEmployees.length,
      branch_wise_summary: {},
      details: [],
      payslips: []
    };

    const BATCH_SIZE = 5;
    const batches = [];
    
    for (let i = 0; i < eligibleEmployees.length; i += BATCH_SIZE) {
      batches.push(eligibleEmployees.slice(i, i + BATCH_SIZE));
    }

    console.log(`🔄 Processing ${batches.length} batches of ${eligibleEmployees.length} eligible employees`);
    if (recalculate_existing && existingPayslips.length > 0) {
      console.log(`🔄 RECALCULATION MODE: Will update ${existingPayslips.length} existing payslips with current payroll data`);
    }

    // 🟢 Get user IDs for access control in salary calculation
    let userIds = [];
    if (isSuper(req)) {
      // Super admin has access to all users in the company
      userIds = await getAllUserIdsUnderCompanyBranch(null, null);
    } else if (isCompany(req) || isAccountant) {
      // Company users have access to their company's users
      userIds = await getAllUserIdsUnderCompanyBranch(companyId, null);
    } else {
      // Branch user - get user IDs for their branch
      const branchUser = await Employee.findOne({
        where: { user_id: userId },
        attributes: ["branch_id"],
        raw: true,
      });
      if (branchUser && branchUser.branch_id) {
        userIds = await getAllUserIdsUnderCompanyBranch(companyId, branchUser.branch_id);
      } else {
        userIds = await getAllUserIdsUnderCompanyBranch(companyId, null);
      }
    }

    console.log(`🔍 Allowed User IDs for salary calculation: ${userIds.length} users`);

    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      console.log(`📦 Processing batch ${batchIndex + 1}/${batches.length} with ${batch.length} employees`);
      
      // Process each employee in parallel within the batch
      const batchPromises = batch.map(async (employee) => {
        try {
          console.log(`🔍 Processing employee: ${employee.name} (ID: ${employee.employee_id})`);

          // Check if employee has skill (required for new calculation)
          if (!employee.skill_id || !employee.skill) {
            console.warn(`⚠️ Employee ${employee.name} has no skill assigned. Skipping payslip generation.`);
            results.payslips_failed++;
            results.details.push({
              employee_id: employee.employee_id,
              employee_name: employee.name,
              branch_id: employee.branch_id,
              status: 'failed',
              reason: 'No skill assigned. Please set employee skill first.'
            });
            return {
              success: false,
              employee_id: employee.employee_id,
              employee_name: employee.name,
              error: 'No skill assigned'
            };
          }

          // Check if employee has branch (required for working days/hours)
          if (!employee.branch_id || !employee.branch) {
            console.warn(`⚠️ Employee ${employee.name} has no branch assigned. Skipping payslip generation.`);
            results.payslips_failed++;
            results.details.push({
              employee_id: employee.employee_id,
              employee_name: employee.name,
              branch_id: employee.branch_id,
              status: 'failed',
              reason: 'No branch assigned. Please set employee branch first.'
            });
            return {
              success: false,
              employee_id: employee.employee_id,
              employee_name: employee.name,
              error: 'No branch assigned'
            };
          }

          // Check if payslip already exists for this month
          const existingPayslip = await Payslip.findOne({
            where: {
              employee_id: employee.employee_id,
              salary_month,
              is_deleted: false
            }
          });

          // 🟢 Calculate salary using the UPDATED calculateNetSalary logic
          let netSalaryData;
          try {
            // Get necessary data for salary calculation
            const skillWages = Number(employee.skill?.wages || 0);
            const branchWorkingDays = Number(employee.branch?.working_days || 26);
            const branchWorkingHours = Number(employee.branch?.working_hours || 8);
            const designationOvertimeRate = Number(employee.designation?.overtime_rate || 1);

            // Set date ranges
            const startOfMonth = moment(`${year}-${month.toString().padStart(2, '0')}-01`).startOf('month').format('YYYY-MM-DD');
            const endOfMonth = moment(`${year}-${month.toString().padStart(2, '0')}-01`).endOf('month').format('YYYY-MM-DD');
            const startOfYear = moment(`${year}-01-01`).startOf('year').format('YYYY-MM-DD');
            const endOfYear = moment(`${year}-12-31`).endOf('year').format('YYYY-MM-DD');

            // 🟢 STEP 1: Fetch attendance data (WITH EARLY LEAVING COLUMN)
            let attendanceData = [];
            try {
              attendanceData = await AttendanceEmployee.findAll({
                where: {
                  employee_id: employee.employee_id,
                  date: { [Op.between]: [startOfMonth, endOfMonth] }
                },
                attributes: ['id', 'date', 'status', 'clock_in', 'clock_out', 'total_rest', 'overtime', 'early_leaving'],
                order: [['date', 'ASC']],
                raw: true
              });
              console.log(`📅 Found ${attendanceData.length} attendance records for ${employee.name}`);
            } catch (attendanceError) {
              console.warn(`⚠️ Error fetching attendance for ${employee.name}:`, attendanceError.message);
            }

            // 🟢 STEP 2: Calculate actual working days from attendance (WITH EARLY LEAVING)
            let actualWorkingDays = 0;
            let attendanceOvertimeHours = 0;
            let earlyLeavingHours = 0; // Initialize early leaving hours

            if (attendanceData.length > 0) {
              attendanceData.forEach(record => {
                if (record.status === 'Present') {
                  actualWorkingDays += 1;
                } else if (record.status === 'Half Day') {
                  actualWorkingDays += 0.5;
                }
                
                // 🟢 Overtime (HH:mm:ss → hours)
                if (record.overtime && record.overtime !== '00:00:00') {
                  const [h, m, s] = String(record.overtime).split(':').map(Number);
                  attendanceOvertimeHours += h + m / 60 + s / 3600;
                }
                
                // 🟢 EARLY LEAVING CALCULATION (HH:mm:ss → hours) - FIXED
                if (record.early_leaving && record.early_leaving !== '00:00:00') {
                  const [h, m, s] = String(record.early_leaving).split(':').map(Number);
                  earlyLeavingHours += h + m / 60 + s / 3600;
                }
              });
              
              console.log(`📊 ${employee.name}: Attendance Summary`);
              console.log(`   Actual Working Days: ${actualWorkingDays.toFixed(1)}`);
              console.log(`   Overtime Hours: ${attendanceOvertimeHours.toFixed(2)}`);
              console.log(`   Early Leaving Hours: ${earlyLeavingHours.toFixed(2)}`);
            }

            // ✅ KEEP THIS LOGIC (from calculateNetSalary)
            const normalWorkingDays = Math.min(actualWorkingDays, branchWorkingDays);
            const excessWorkingDays = Math.max(actualWorkingDays - branchWorkingDays, 0);

            const workingDaysForSalary = actualWorkingDays;

            // 🟢 STEP 3: Calculate Base Salary
            const baseSalary = Number((skillWages * workingDaysForSalary).toFixed(2));
            const baseHourlyRate = Number((skillWages / branchWorkingHours).toFixed(4));

            console.log(`💰 ${employee.name}: Base Salary Calculation`);
            console.log(`   Skill Wages: ₹${skillWages}`);
            console.log(`   Working Days: ${workingDaysForSalary}`);
            console.log(`   Base Salary: ₹${baseSalary}`);
            console.log(`   Base Hourly Rate: ₹${baseHourlyRate}/hour`);

            // 🟢 STEP 4: Fetch allowances (PERMANENT - no month filter)
            const allowances = await Allowance.findAll({ 
              where: { 
                employee_id: employee.employee_id,
                created_by: { [Op.in]: userIds }
              },
              raw: true
            });

            // 🟢 STEP 5: Calculate Allowances based on ACTUAL working days
            let allowancesTotal = 0;
            allowances.forEach((i) => {
              const rawAmount = parseFloat(i.amount || 0);
              let computedAmount = 0;

              if (String(i.type || '').toLowerCase() === 'percentage') {
                computedAmount = (rawAmount / 100) * baseSalary;
              } else {
                computedAmount = rawAmount * workingDaysForSalary;
              }
              allowancesTotal += computedAmount;
            });

            allowancesTotal = Number(allowancesTotal.toFixed(2));

            // 🟢 FIXED: Calculate DAILY allowance rate for overtime calculation
            const dailyAllowanceRate = workingDaysForSalary > 0 ? Number((allowancesTotal / workingDaysForSalary).toFixed(4)) : 0;
            const allowanceHourlyRate = Number((dailyAllowanceRate / branchWorkingHours).toFixed(4));

            console.log(`💰 ${employee.name}: Allowance Calculation`);
            console.log(`   Total Allowances: ₹${allowancesTotal.toFixed(2)}`);
            console.log(`   Daily Allowance Rate: ₹${dailyAllowanceRate.toFixed(4)}`);
            console.log(`   Allowance Hourly Rate: ₹${allowanceHourlyRate.toFixed(4)}`);

            // 🟢 STEP 6: Fetch other components
            const commonWhereClause = {
              created_by: { [Op.in]: userIds },
              created_at: { [Op.between]: [startOfMonth, endOfMonth] }
            };

            const [commissions, loans, otherPayments, overtimes, employeeAdvances] = await Promise.all([
              Commission.findAll({ where: { employee_id: employee.id, ...commonWhereClause }, raw: true }),
              Loan.findAll({ where: { employee_id: employee.employee_id, ...commonWhereClause }, raw: true }),
              OtherPayment.findAll({ where: { employee_id: employee.employee_id, ...commonWhereClause }, raw: true }),
              Overtime.findAll({ where: { employee_id: employee.employee_id, ...commonWhereClause }, raw: true }),
              ExpenseNew.findAll({
                where: {
                  employee_id: employee.employee_id,
                  created_by: { [Op.in]: userIds },
                  payments_status: 'paid',
                  payment_date: { [Op.between]: [startOfMonth, endOfMonth] }
                },
                raw: true
              })
            ]);

            // 🟢 STEP 7: Calculate other components
            const computeValue = (amount, type, base) => {
              const rawAmount = parseFloat(amount || 0);
              if (String(type || '').toLowerCase() === 'percentage') {
                return (rawAmount / 100) * base;
              }
              return rawAmount;
            };

            const commissionsTotal = Number(commissions.reduce((sum, c) => sum + computeValue(c.amount, c.type, baseSalary), 0).toFixed(2));
            const otherPaymentsTotal = Number(otherPayments.reduce((sum, op) => sum + computeValue(op.amount, op.type, baseSalary), 0).toFixed(2));
            const loansTotal = Number(loans.reduce((sum, l) => sum + computeValue(l.amount, l.type, baseSalary), 0).toFixed(2));
            const advancesTotal = Number(employeeAdvances.reduce((sum, adv) => sum + Number(adv.total_amount || 0), 0).toFixed(2));

            console.log(`📊 ${employee.name}: Other Components`);
            console.log(`   Commissions: ₹${commissionsTotal}`);
            console.log(`   Other Payments: ₹${otherPaymentsTotal}`);
            console.log(`   Loans: ₹${loansTotal}`);
            console.log(`   Advances: ₹${advancesTotal}`);

            // 🟢 STEP 8: Calculate Overtime (includes base + allowances using daily allowance rate)
            let overtimeTotal = 0;
            let baseOvertimeTotal = 0;
            let allowanceOvertimeTotal = 0;

            overtimes.forEach((o) => {
              const otHours = parseFloat(o.hours || o.ot_hours || 0);
              if (otHours > 0) {
                const baseOvertimeAmount = designationOvertimeRate * baseHourlyRate * otHours;
                const allowanceOvertimeAmount = designationOvertimeRate * allowanceHourlyRate * otHours;
                baseOvertimeTotal += baseOvertimeAmount;
                allowanceOvertimeTotal += allowanceOvertimeAmount;
                overtimeTotal += baseOvertimeAmount + allowanceOvertimeAmount;
              }
            });

            // Add attendance overtime if no overtime records exist
            if (attendanceOvertimeHours > 0) {
              const baseOvertimeAmount = designationOvertimeRate * baseHourlyRate * attendanceOvertimeHours;
              const allowanceOvertimeAmount = designationOvertimeRate * allowanceHourlyRate * attendanceOvertimeHours;
              baseOvertimeTotal += baseOvertimeAmount;
              allowanceOvertimeTotal += allowanceOvertimeAmount;
              overtimeTotal += baseOvertimeAmount + allowanceOvertimeAmount;
            }

            baseOvertimeTotal = Number(baseOvertimeTotal.toFixed(2));
            allowanceOvertimeTotal = Number(allowanceOvertimeTotal.toFixed(2));
            overtimeTotal = Number(overtimeTotal.toFixed(2));

            console.log(`⏰ ${employee.name}: Overtime Calculation`);
            console.log(`   Base Overtime: ₹${baseOvertimeTotal.toFixed(2)}`);
            console.log(`   Allowance Overtime: ₹${allowanceOvertimeTotal.toFixed(2)}`);
            console.log(`   Total Overtime: ₹${overtimeTotal.toFixed(2)}`);

            // 🟢 STEP 9: Early leaving deduction (FIXED)
            const earlyLeavingDeductionTotal = earlyLeavingHours * (baseHourlyRate + allowanceHourlyRate);
            console.log(`🏃 ${employee.name}: Early Leaving Deduction`);
            console.log(`   Early Leaving Hours: ${earlyLeavingHours.toFixed(2)}`);
            console.log(`   Rate: (₹${baseHourlyRate.toFixed(2)} + ₹${allowanceHourlyRate.toFixed(2)}) = ₹${(baseHourlyRate + allowanceHourlyRate).toFixed(2)}/hour`);
            console.log(`   Deduction: ₹${earlyLeavingDeductionTotal.toFixed(2)}`);

            // 🟢 STEP 10: Fetch saturation deductions (PERMANENT - PF/ESI ONLY)
            const saturationDeductions = await SaturationDeduction.findAll({ 
              where: { 
                employee_id: employee.employee_id,
                created_by: { [Op.in]: userIds }
              },
              raw: true
            });

            // 🟢 STEP 11: Calculate Saturation Deductions (PF/ESI ONLY) - UPDATED FORMULA
            let totalPFDeduction = 0;
            let totalESIDeduction = 0;
            
            // ✅ FIXED PF & ESI BASES (from updated calculateNetSalary)
            const pfApplicableAmount = baseSalary + overtimeTotal + allowancesTotal - earlyLeavingDeductionTotal;
            const esiApplicableAmount = baseSalary + allowancesTotal;

            console.log(`💵 ${employee.name}: PF/ESI Applicable Amounts`);
            console.log(`   PF Applicable: ₹${pfApplicableAmount.toFixed(2)} (Base:${baseSalary.toFixed(2)} + Overtime:${overtimeTotal.toFixed(2)} + Allowances:${allowancesTotal.toFixed(2)} - Early Leaving:${earlyLeavingDeductionTotal.toFixed(2)})`);
            console.log(`   ESI Applicable: ₹${esiApplicableAmount.toFixed(2)} (Base:${baseSalary.toFixed(2)} + Allowances:${allowancesTotal.toFixed(2)})`);

            saturationDeductions.forEach(sd => {
              const deductionType = String(sd.title || '').toUpperCase();
              const rawAmount = parseFloat(sd.amount || 0);
              const type = String(sd.type || '').toLowerCase();
              
              if (deductionType === 'PF') {
                let computedAmount = 0;
                if (type === 'percentage') {
                  computedAmount = (rawAmount / 100) * pfApplicableAmount;
                } else {
                  computedAmount = rawAmount;
                }
                totalPFDeduction += computedAmount;
              } else if (deductionType === 'ESI') {
                let computedAmount = 0;
                if (type === 'percentage') {
                  computedAmount = (rawAmount / 100) * esiApplicableAmount;
                } else {
                  computedAmount = rawAmount;
                }
                totalESIDeduction += computedAmount;
              }
            });

            totalPFDeduction = Number(totalPFDeduction.toFixed(2));
            totalESIDeduction = Number(totalESIDeduction.toFixed(2));
            const saturationTotal = Number((totalPFDeduction + totalESIDeduction).toFixed(2));

            console.log(`💸 ${employee.name}: Deductions Calculation`);
            console.log(`   PF Deduction: ₹${totalPFDeduction.toFixed(2)}`);
            console.log(`   ESI Deduction: ₹${totalESIDeduction.toFixed(2)}`);
            console.log(`   Total Saturation Deductions: ₹${saturationTotal.toFixed(2)}`);

            // 🟢 STEP 12: Fetch leaves for progressive annual leave calculation
            const leavesUpToCurrentMonth = await Leave.findAll({
              where: {
                employee_id: employee.id,
                status: 'Approved',
                [Op.or]: [
                  { start_date: { [Op.between]: [startOfYear, endOfMonth] } },
                  { end_date: { [Op.between]: [startOfYear, endOfMonth] } },
                  {
                    [Op.and]: [
                      { start_date: { [Op.lte]: startOfYear } },
                      { end_date: { [Op.gte]: endOfMonth } }
                    ]
                  }
                ]
              },
              attributes: ['id', 'total_leave_days'],
              raw: true
            });

            // 🟢 STEP 13: Calculate Leave Deductions
            let leaveDeductionThisMonth = 0;
            const cumulativeLeavesUpToCurrent = leavesUpToCurrentMonth.reduce((sum, leave) => {
              const days = parseFloat(leave.total_leave_days || 0);
              return sum + (isNaN(days) ? 0 : days);
            }, 0);

            if (cumulativeLeavesUpToCurrent > 18) {
              const deductibleLeavesThisMonth = cumulativeLeavesUpToCurrent - 18;
              const dailySalary = workingDaysForSalary > 0 ? Number((baseSalary / workingDaysForSalary).toFixed(2)) : 0;
              leaveDeductionThisMonth = Number((deductibleLeavesThisMonth * dailySalary).toFixed(2));
              console.log(`🍃 ${employee.name}: Leave Deduction = ${deductibleLeavesThisMonth} days × ₹${dailySalary.toFixed(2)} = ₹${leaveDeductionThisMonth.toFixed(2)}`);
            } else {
              console.log(`🍃 ${employee.name}: No leave deduction (${cumulativeLeavesUpToCurrent}/18 leaves used)`);
            }

            // 🟢 STEP 14: Calculate Gross and Net Salary
            const additionsTotal = Number((allowancesTotal + commissionsTotal + otherPaymentsTotal + overtimeTotal).toFixed(2));
            const gross = Number((baseSalary + additionsTotal).toFixed(2));
            const deductionsTotal = Number((loansTotal + saturationTotal + advancesTotal + leaveDeductionThisMonth + earlyLeavingDeductionTotal).toFixed(2));
            const net_payble = Number((gross - deductionsTotal).toFixed(2));

            console.log(`✅ Salary calculation successful for ${employee.name}:`);
            console.log(`   Normal Working Days: ${normalWorkingDays}`);
            console.log(`   Excess Working Days: ${excessWorkingDays}`);
            console.log(`   Base Salary: ₹${baseSalary}`);
            console.log(`   Actual Working Days: ${actualWorkingDays}`);
            console.log(`   Allowances: ₹${allowancesTotal}`);
            console.log(`   Overtime: ₹${overtimeTotal}`);
            console.log(`   PF Deduction: ₹${totalPFDeduction}`);
            console.log(`   ESI Deduction: ₹${totalESIDeduction}`);
            console.log(`   Early Leaving Deduction: ₹${earlyLeavingDeductionTotal.toFixed(2)}`);
            console.log(`   Gross: ₹${gross}`);
            console.log(`   Total Deductions: ₹${deductionsTotal}`);
            console.log(`   Net Payable: ₹${net_payble}`);

            // Construct the complete netSalaryData object
            netSalaryData = {
              period: {
                month: parseInt(month),
                year: parseInt(year),
                start_date: startOfMonth,
                end_date: endOfMonth,
                display: moment(`${year}-${month.toString().padStart(2, '0')}-01`).format('MMMM YYYY')
              },
              employee: {
                employee_id: employee.employee_id,
                name: employee.name,
                base_salary_calculation: {
                  skill_wages: skillWages,
                  branch_planned_working_days: branchWorkingDays,
                  actual_working_days: Number(actualWorkingDays.toFixed(1)),
                  normal_working_days: normalWorkingDays,
                  excess_working_days: excessWorkingDays,
                  calculated_base_salary: baseSalary,
                  full_month_base_salary: Number((skillWages * branchWorkingDays).toFixed(2))
                }
              },
              attendance_summary: {
                planned_working_days: branchWorkingDays,
                actual_working_days: Number(actualWorkingDays.toFixed(1)),
                normal_working_days: normalWorkingDays,
                excess_working_days: excessWorkingDays,
                attendance_records_count: attendanceData.length,
                overtime_hours: Number(attendanceOvertimeHours.toFixed(2)),
                early_leaving_hours: Number(earlyLeavingHours.toFixed(2))
              },
              progressive_leave_summary: {
                cumulative_leaves_upto_current: cumulativeLeavesUpToCurrent,
                leave_deduction_this_month: leaveDeductionThisMonth
              },
              breakdown: {
                base_salary: baseSalary,
                allowances_total: allowancesTotal,
                commissions_total: commissionsTotal,
                other_payments_total: otherPaymentsTotal,
                overtime_total: overtimeTotal,
                overtime_breakdown: {
                  base_overtime_total: baseOvertimeTotal,
                  allowance_overtime_total: allowanceOvertimeTotal
                },
                loans_total: loansTotal,
                saturation_total: saturationTotal,
                saturation_deduction_breakdown: {
                  pf_deductions: {
                    total: totalPFDeduction,
                    applicable_amount: pfApplicableAmount
                  },
                  esi_deductions: {
                    total: totalESIDeduction,
                    applicable_amount: esiApplicableAmount
                  }
                },
                advances_total: advancesTotal,
                early_leaving_deduction: {
                  early_leaving_hours: Number(earlyLeavingHours.toFixed(2)),
                  deduction_rate: Number((baseHourlyRate + allowanceHourlyRate).toFixed(2)),
                  total_deduction: Number(earlyLeavingDeductionTotal.toFixed(2))
                },
                totals: {
                  additions: additionsTotal,
                  deductions: deductionsTotal,
                  gross: gross,
                  net: net_payble
                }
              }
            };

          } catch (error) {
            console.error("❌ Salary calculation error for", employee.name, ":", error.message);
            throw error;
          }

          // Extract values from the calculation
          const net_payble = netSalaryData.breakdown?.totals?.net || 0;
          const leaveDeduction = netSalaryData.progressive_leave_summary?.leave_deduction_this_month || 0;
          const baseSalary = netSalaryData.employee?.base_salary_calculation?.calculated_base_salary || 
                            netSalaryData.employee?.stored_salary || 
                            employee.salary || 
                            0;
          const skillWages = netSalaryData.employee?.base_salary_calculation?.skill_wages || 0;

          // Store the ENTIRE netSalaryData as component_details
          const component_details = netSalaryData;

          // Extract component totals from breakdown for the payslip columns
          const allowancesTotal = netSalaryData.breakdown?.allowances_total || 0;
          const commissionsTotal = netSalaryData.breakdown?.commissions_total || 0;
          const otherPaymentsTotal = netSalaryData.breakdown?.other_payments_total || 0;
          const overtimeTotal = netSalaryData.breakdown?.overtime_total || 0;
          const loansTotal = netSalaryData.breakdown?.loans_total || 0;
          const saturationTotal = netSalaryData.breakdown?.saturation_total || 0;
          const advancesTotal = netSalaryData.breakdown?.advances_total || 0;
          const pfDeduction = netSalaryData.breakdown?.saturation_deduction_breakdown?.pf_deductions?.total || 0;
          const esiDeduction = netSalaryData.breakdown?.saturation_deduction_breakdown?.esi_deductions?.total || 0;
          const pfApplicableAmount = netSalaryData.breakdown?.saturation_deduction_breakdown?.pf_deductions?.applicable_amount || 0;
          const esiApplicableAmount = netSalaryData.breakdown?.saturation_deduction_breakdown?.esi_deductions?.applicable_amount || 0;
          const earlyLeavingHours = netSalaryData.attendance_summary?.early_leaving_hours || 0;
          const earlyLeavingDeductionTotal = netSalaryData.breakdown?.early_leaving_deduction?.total_deduction || 0;
          const grossSalary = netSalaryData.breakdown?.totals?.gross || 0;
          const additionsTotal = netSalaryData.breakdown?.totals?.additions || 0;
          const deductionsTotal = netSalaryData.breakdown?.totals?.deductions || 0;
          const attendanceRecordsCount = netSalaryData.attendance_summary?.attendance_records_count || 0;
          const overtimeHours = netSalaryData.attendance_summary?.overtime_hours || 0;
          const normalWorkingDays = netSalaryData.employee?.base_salary_calculation?.normal_working_days || 0;
          const excessWorkingDays = netSalaryData.employee?.base_salary_calculation?.excess_working_days || 0;
          const plannedWorkingDays = netSalaryData.employee?.base_salary_calculation?.branch_planned_working_days || 0;
          const actualWorkingDays = netSalaryData.employee?.base_salary_calculation?.actual_working_days || 0;

          console.log(`💰 Employee ${employee.name} totals:`);
          console.log(`   - Normal Working Days: ${normalWorkingDays}`);
          console.log(`   - Excess Working Days: ${excessWorkingDays}`);
          console.log(`   - Base Salary: ₹${baseSalary}`);
          console.log(`   - Allowances: ₹${allowancesTotal}`);
          console.log(`   - Overtime: ₹${overtimeTotal}`);
          console.log(`   - PF Deduction (${pfApplicableAmount}): ₹${pfDeduction}`);
          console.log(`   - ESI Deduction (${esiApplicableAmount}): ₹${esiDeduction}`);
          console.log(`   - Early Leaving Deduction: ₹${earlyLeavingDeductionTotal.toFixed(2)}`);
          console.log(`   - Total Saturation Deductions: ₹${saturationTotal}`);
          console.log(`   - Net Payable: ₹${net_payble}`);

          let payslip;
          let action = 'created';

          if (existingPayslip) {
            // UPDATE existing payslip with current data
            console.log(`🔄 UPDATING existing payslip for ${employee.name} with current payroll data`);
            
            payslip = await existingPayslip.update({
              basic_salary: baseSalary,
              allowance: allowancesTotal,
              commission: commissionsTotal,
              overtime: overtimeTotal,
              other_payment: otherPaymentsTotal,
              gross_salary: grossSalary,
              skill_wages: skillWages,
              loan: loansTotal,
              saturation_deduction: saturationTotal,
              pf_deduction: pfDeduction,
              esi_deduction: esiDeduction,
              pf_applicable_amount: pfApplicableAmount,
              esi_applicable_amount: esiApplicableAmount,
              advance_payment: advancesTotal,
              leave_deduction: leaveDeduction,
              net_payble,
              component_details: component_details,
              updated_at: new Date()
            });

            action = 'updated';
            results.payslips_updated++;
          } else {
            // Create new payslip
            console.log(`✅ CREATING new payslip for ${employee.name}`);
            
            payslip = await Payslip.create({
              employee_id: employee.employee_id,
              employee_primary_id: employee.id,
              created_by: userId,
              salary_month,
              basic_salary: baseSalary,
              allowance: allowancesTotal,
              commission: commissionsTotal,
              overtime: overtimeTotal,
              other_payment: otherPaymentsTotal,
              gross_salary: grossSalary,
              skill_wages: skillWages,
              loan: loansTotal,
              saturation_deduction: saturationTotal,
              pf_deduction: pfDeduction,
              esi_deduction: esiDeduction,
              pf_applicable_amount: pfApplicableAmount,
              esi_applicable_amount: esiApplicableAmount,
              advance_payment: advancesTotal,
              leave_deduction: leaveDeduction,
              net_payble,
              status: 0,
              component_details: component_details,
            });

            action = 'created';
            results.payslips_created++;
          }

          // Update branch summary
          if (!results.branch_wise_summary[employee.branch_id]) {
            results.branch_wise_summary[employee.branch_id] = {
              created: 0,
              updated: 0,
              failed: 0
            };
          }

          if (action === 'created') {
            results.branch_wise_summary[employee.branch_id].created++;
          } else {
            results.branch_wise_summary[employee.branch_id].updated++;
          }

          // Add to details
          results.details.push({
            employee_id: employee.employee_id,
            employee_name: employee.name,
            branch_id: employee.branch_id,
            status: action,
            payslip_id: payslip.id,
            net_payble: net_payble,
            base_salary: baseSalary,
            gross_salary: grossSalary,
            early_leaving_hours: earlyLeavingHours,
            early_leaving_deduction: earlyLeavingDeductionTotal,
            normal_working_days: normalWorkingDays,
            excess_working_days: excessWorkingDays,
            actual_working_days: actualWorkingDays,
            planned_working_days: plannedWorkingDays,
            skill_wages: skillWages,
            saturation_deduction: saturationTotal,
            pf_deduction: pfDeduction,
            esi_deduction: esiDeduction,
            pf_applicable_amount: pfApplicableAmount,
            esi_applicable_amount: esiApplicableAmount,
            note: action === 'updated' ? 'Updated with current payroll data (UPDATED PF/ESI calculation)' : 'New payslip created (UPDATED PF/ESI calculation)',
            calculation_note: 'PF/ESI calculation updated with correct applicable amounts including early leaving deduction'
          });

          // Return complete payslip data for batch processing
          return {
            success: true,
            payslip_id: payslip.id,
            employee_id: employee.employee_id,
            employee_name: employee.name,
            action: action,
            net_payble: net_payble,
            status: "unpaid",
            calculation_type: 'attendance_based_fixed_updated',
            actual_working_days: actualWorkingDays,
            normal_working_days: normalWorkingDays,
            excess_working_days: excessWorkingDays,
            planned_working_days: plannedWorkingDays,
            base_salary: baseSalary,
            allowances_total: allowancesTotal,
            overtime_total: overtimeTotal,
            commissions_total: commissionsTotal,
            other_payments_total: otherPaymentsTotal,
            gross_salary: grossSalary,
            saturation_deduction: saturationTotal,
            pf_deduction: pfDeduction,
            esi_deduction: esiDeduction,
            pf_applicable_amount: pfApplicableAmount,
            esi_applicable_amount: esiApplicableAmount,
            early_leaving_hours: earlyLeavingHours,
            early_leaving_deduction: earlyLeavingDeductionTotal,
            loans_total: loansTotal,
            advances_total: advancesTotal,
            leave_deduction: leaveDeduction,
            additions_total: additionsTotal,
            deductions_total: deductionsTotal,
            allowance_calculation_method: 'per_day_basis',
            pf_calculation_method: 'Base + Overtime + Allowances - Early Leaving',
            esi_calculation_method: 'Base + Allowances',
            skill_wages: skillWages,
            attendance_records_count: attendanceRecordsCount,
            overtime_hours: overtimeHours
          };

        } catch (employeeError) {
          console.error(`❌ Failed to process payslip for ${employee.name}:`, employeeError.message);
          results.payslips_failed++;
          
          if (!results.branch_wise_summary[employee.branch_id]) {
            results.branch_wise_summary[employee.branch_id] = {
              created: 0,
              updated: 0,
              failed: 0
            };
          }
          results.branch_wise_summary[employee.branch_id].failed++;

          results.details.push({
            employee_id: employee.employee_id,
            employee_name: employee.name,
            branch_id: employee.branch_id,
            status: 'failed',
            reason: employeeError.message,
            error_type: employeeError.name
          });

          return {
            success: false,
            employee_id: employee.employee_id,
            employee_name: employee.name,
            error: employeeError.message,
            error_type: employeeError.name
          };
        }
      });

      // Wait for all employees in this batch to complete
      const batchResults = await Promise.all(batchPromises);
      
      // Add successful results to payslips array
      batchResults.forEach(result => {
        if (result.success) {
          results.payslips.push(result);
        }
      });

      // Add delay between batches to prevent overwhelming the system
      if (batchIndex < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    // =======================================================
    // 🔹 FINAL RESPONSE
    // =======================================================
    const totalProcessed = results.payslips_created + results.payslips_updated;
    const successRate = results.eligible_employees > 0 ? ((totalProcessed / results.eligible_employees) * 100).toFixed(2) + '%' : '0%';

    // Calculate attendance statistics
    const attendanceStats = {
      total_employees: results.eligible_employees,
      payslips_generated: totalProcessed,
      average_normal_working_days: 0,
      average_excess_working_days: 0,
      average_early_leaving_hours: 0,
      total_base_salary: 0,
      total_gross_salary: 0,
      total_early_leaving_deduction: 0,
      total_pf_deduction: 0,
      total_esi_deduction: 0,
      total_net_payable: 0
    };

    if (results.payslips.length > 0) {
      // Calculate statistics from successful payslips
      const totalNormalDays = results.payslips.reduce((sum, p) => sum + (p.normal_working_days || 0), 0);
      const totalExcessDays = results.payslips.reduce((sum, p) => sum + (p.excess_working_days || 0), 0);
      const totalEarlyLeavingHours = results.payslips.reduce((sum, p) => sum + (p.early_leaving_hours || 0), 0);
      const totalBaseSalary = results.payslips.reduce((sum, p) => sum + (p.base_salary || 0), 0);
      const totalGrossSalary = results.payslips.reduce((sum, p) => sum + (p.gross_salary || 0), 0);
      const totalEarlyLeavingDeduction = results.payslips.reduce((sum, p) => sum + (p.early_leaving_deduction || 0), 0);
      const totalPFDeduction = results.payslips.reduce((sum, p) => sum + (p.pf_deduction || 0), 0);
      const totalESIDeduction = results.payslips.reduce((sum, p) => sum + (p.esi_deduction || 0), 0);
      const totalNetPayable = results.payslips.reduce((sum, p) => sum + (p.net_payble || 0), 0);
      
      attendanceStats.average_normal_working_days = Number((totalNormalDays / results.payslips.length).toFixed(1));
      attendanceStats.average_excess_working_days = Number((totalExcessDays / results.payslips.length).toFixed(1));
      attendanceStats.average_early_leaving_hours = Number((totalEarlyLeavingHours / results.payslips.length).toFixed(2));
      attendanceStats.total_base_salary = Number(totalBaseSalary.toFixed(2));
      attendanceStats.total_gross_salary = Number(totalGrossSalary.toFixed(2));
      attendanceStats.total_early_leaving_deduction = Number(totalEarlyLeavingDeduction.toFixed(2));
      attendanceStats.total_pf_deduction = Number(totalPFDeduction.toFixed(2));
      attendanceStats.total_esi_deduction = Number(totalESIDeduction.toFixed(2));
      attendanceStats.total_net_payable = Number(totalNetPayable.toFixed(2));
    }

    const response = {
      success: true,
      message: recalculate_existing ? 
        "Bulk payslip recalculation completed with UPDATED PF/ESI calculation including early leaving" : 
        "Bulk payslip generation completed with UPDATED PF/ESI calculation including early leaving",
      data: results.payslips,
      summary: {
        month: parseInt(month),
        year: parseInt(year),
        salary_month,
        total_branches: results.total_branches,
        total_employees: results.total_employees,
        eligible_employees: results.eligible_employees,
        payslips_created: results.payslips_created,
        payslips_updated: results.payslips_updated,
        payslips_failed: results.payslips_failed,
        skipped_due_to_doj: results.skipped_due_to_doj,
        success_rate: successRate,
        recalculated: recalculate_existing,
        action: recalculate_existing ? 'recalculated_existing' : 'generated_new',
        calculation_method: 'attendance_based_fixed_updated',
        allowance_calculation: 'per_day_basis',
        pf_calculation_method: 'Base + Overtime + Allowances - Early Leaving',
        esi_calculation_method: 'Base + Allowances',
        early_leaving_included: true,
        attendance_statistics: attendanceStats
      },
      branch_wise_summary: results.branch_wise_summary,
      details: results.details
    };

    console.log(`📊 FINAL PAYSLIP GENERATION SUMMARY:`);
    console.log(`   - Total Employees: ${results.total_employees}`);
    console.log(`   - Eligible Employees: ${results.eligible_employees}`);
    console.log(`   - Payslips Created: ${results.payslips_created}`);
    console.log(`   - Payslips Updated: ${results.payslips_updated}`);
    console.log(`   - Payslips Failed: ${results.payslips_failed}`);
    console.log(`   - Skipped due to DOJ: ${results.skipped_due_to_doj}`);
    console.log(`   - Total Base Salary: ₹${attendanceStats.total_base_salary}`);
    console.log(`   - Total Gross Salary: ₹${attendanceStats.total_gross_salary}`);
    console.log(`   - Total Net Payable: ₹${attendanceStats.total_net_payable}`);
    console.log(`   - Total PF Deduction: ₹${attendanceStats.total_pf_deduction}`);
    console.log(`   - Total ESI Deduction: ₹${attendanceStats.total_esi_deduction}`);
    console.log(`   - Total Early Leaving Deduction: ₹${attendanceStats.total_early_leaving_deduction}`);
    console.log(`   - Average Early Leaving Hours: ${attendanceStats.average_early_leaving_hours}`);
    console.log(`   - Calculation Method: Updated PF/ESI calculation with early leaving`);
    console.log(`   - PF Calculation: Base + Overtime + Allowances - Early Leaving`);
    console.log(`   - ESI Calculation: Base + Allowances`);
    console.log(`   - Success Rate: ${successRate}`);

    return res.status(200).json(response);

  } catch (err) {
    console.error("❌ Error in bulk payslip generation:", err);
    console.error("Error stack:", err.stack);
    return res.status(500).json({ 
      success: false, 
      message: "Failed to generate payslips in bulk",
      error: err.message,
      error_type: err.name,
      data: []
    });
  }
};


exports.getAllPayslips = async (req, res) => {
  try {
    console.log('🚀 START getAllPayslips');

    const companyId = await getCompanyId(req);
    if (!companyId && !isSuper(req)) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }
    
    // =======================================================
    // 🔐 ROLE & BRANCH ACCESS RESOLUTION
    // =======================================================
    const userEmployeeRecord = await Employee.findOne({
      where: { user_id: req.user.id },
      attributes: ['branch_id'],
      raw: true,
    });

    const userBranchId = userEmployeeRecord?.branch_id || null;
    const userType = (req.user.type || '').toLowerCase();
    const isAccountant = userType === 'accountant';

    if (!isCompany(req) && !isSuper(req) && !isAccountant && userEmployeeRecord && !userBranchId) {
      return res.status(403).json({ success: false, message: 'No branch assigned' });
    }

    let targetBranchIds = [];

    if (isSuper(req)) {
      const allBranches = await Branch.findAll({
        attributes: ['id'],
        raw: true,
      });
      targetBranchIds = allBranches.map(b => b.id);

    } else if (isCompany(req) || isAccountant) {
      const companyBranches = await Branch.findAll({
        where: { created_by: companyId },
        attributes: ['id'],
        raw: true,
      });
      targetBranchIds = companyBranches.map(b => b.id);

      if (targetBranchIds.length === 0) {
        return res.status(404).json({ success: false, message: 'No branches found for company' });
      }
    } else {
      targetBranchIds = [userBranchId];
    }

    console.log('🎯 Accessible Branch IDs:', targetBranchIds);

    const { month, year } = req.params;

    let actualMonth, actualYear;
    if (parseInt(month) > 12) {
      actualYear = parseInt(month);
      actualMonth = parseInt(year);
    } else {
      actualMonth = parseInt(month);
      actualYear = parseInt(year);
    }

    if (!actualMonth || !actualYear || actualMonth < 1 || actualMonth > 12) {
      return res.status(400).json({ success: false, message: 'Invalid month/year' });
    }

    const salary_month = `${actualYear}-${String(actualMonth).padStart(2, '0')}`;

    const payslips = await Payslip.findAll({
      where: { salary_month, is_deleted: false },
      raw: true
    });

    const enrichedPayslips = [];
    let totalGrossSalary = 0;
    let totalNetSalary = 0;

    for (const payslip of payslips) {
      const employee = await Employee.findOne({
        where: { employee_id: payslip.employee_id, deleted_at: null },
        include: [
          { model: Branch, as: 'branch' },
          { model: Department, as: 'department' },
          { model: Designation, as: 'designation' },
          { model: Skill, as: 'skill' }
        ]
      });

      if (!employee || !employee.skill || !employee.branch) continue;

      const branchWorkingDays = Number(employee.branch.working_days || 26);
      const branchWorkingHours = Number(employee.branch.working_hours || 8);
      const skillWages = Number(employee.skill.wages || 0);
      const overtimeRate = Number(employee.designation?.overtime_rate || 1);

      const startDate = moment(`${actualYear}-${actualMonth}-01`).startOf('month').format('YYYY-MM-DD');
      const endDate = moment(`${actualYear}-${actualMonth}-01`).endOf('month').format('YYYY-MM-DD');
      
      
      // ================= FETCH ADVANCE FROM expenses_news =================
      let advancePayment = 0;
      
      try {
        const advances = await ExpenseNew.findAll({
          where: {
            employee_id: employee.employee_id,
            payments_status: 'paid',
            payment_date: {
              [Op.between]: [startDate, endDate]
            }
          },
          attributes: ['subtotal'],
          raw: true
        });
      
        advancePayment = advances.reduce(
          (sum, a) => sum + Number(a.subtotal || 0),
          0
        );
      
        console.log(
          `💰 Advance fetched | Emp ${employee.employee_id}: ₹${advancePayment}`
        );
      
      } catch (err) {
        console.warn(
          `⚠️ Advance fetch failed | Emp ${employee.employee_id}:`,
          err.message
        );
      }


      const attendance = await AttendanceEmployee.findAll({
        where: {
          employee_id: employee.employee_id,
          date: { [Op.between]: [startDate, endDate] }
        },
        attributes: ['status', 'overtime', 'early_leaving'],
        raw: true
      });

      let actualWorkingDays = 0;
      let overtimeHours = 0;
      let earlyLeavingHours = 0;

      attendance.forEach(a => {
        if (a.status === 'Present') actualWorkingDays += 1;
        if (a.status === 'Half Day') actualWorkingDays += 0.5;

        if (a.overtime && a.overtime !== '00:00:00') {
          const [h, m, s] = String(a.overtime).split(':').map(Number);
          overtimeHours += h + m / 60 + s / 3600;
        }

        if (a.early_leaving && a.early_leaving !== '00:00:00') {
          const [h, m, s] = String(a.early_leaving).split(':').map(Number);
          earlyLeavingHours += h + m / 60 + s / 3600;
        }
      });

      // ================= AUTHORITATIVE RECALCULATION =================

      const baseSalary = skillWages * actualWorkingDays;

      const allowance = Number(payslip.allowance || 0);
      const commission = Number(payslip.commission || 0);
      const otherPayment = Number(payslip.other_payment || 0);
      const loan = Number(payslip.loan || 0);
      
      const leaveDeduction = Number(payslip.leave_deduction || 0);

      const baseHourlyRate = branchWorkingHours > 0 ? skillWages / branchWorkingHours : 0;
      const allowanceHourlyRate =
        actualWorkingDays > 0 ? (allowance / actualWorkingDays) / branchWorkingHours : 0;

      const overtimeAmount =
        overtimeHours * (baseHourlyRate + allowanceHourlyRate) * overtimeRate;

      const earlyLeavingDeduction =
        earlyLeavingHours * (baseHourlyRate + allowanceHourlyRate);

      const pfApplicableAmount =
        baseSalary + overtimeAmount + allowance - earlyLeavingDeduction;

      const esiApplicableAmount =
        baseSalary + allowance + commission + otherPayment;

      let pfPercentage = 12;
      let esiPercentage = 0.75;

      const saturation = await SaturationDeduction.findAll({
        where: { employee_id: employee.employee_id },
        raw: true
      });

      saturation.forEach(sd => {
        if (String(sd.title).toUpperCase() === 'PF') pfPercentage = Number(sd.amount);
        if (String(sd.title).toUpperCase() === 'ESI') esiPercentage = Number(sd.amount);
      });

      const pfDeduction = (pfPercentage / 100) * Math.max(0, pfApplicableAmount);
      const esiDeduction = (esiPercentage / 100) * Math.max(0, esiApplicableAmount);

      const grossSalary =
        baseSalary + allowance + commission + otherPayment + overtimeAmount;
        
      const totalDeduction = pfDeduction + esiDeduction + loan + advancePayment + leaveDeduction + earlyLeavingDeduction;

      const netPayable =
        grossSalary -
        (pfDeduction +
          esiDeduction +
          loan +
          advancePayment +
          leaveDeduction +
          earlyLeavingDeduction);

      // ================= ACCUMULATE TOTALS =================
      totalGrossSalary += Number(payslip.gross_salary || 0);
      totalNetSalary += Number(payslip.net_payble || 0);

      // ================= FINAL STRUCTURED RESPONSE =================

      enrichedPayslips.push({
        id: payslip.id,
        employee_id: payslip.employee_id,
        salary_month: payslip.salary_month,
        salary_month_display: `${actualMonth}-${actualYear}`,

        basic_salary: Number(baseSalary.toFixed(2)),
        allowance: Number(allowance.toFixed(2)),
        commission: Number(commission.toFixed(2)),
        overtime: Number(overtimeAmount.toFixed(2)),
        other_payment: Number(otherPayment.toFixed(2)),
        early_leaving: Number(earlyLeavingDeduction.toFixed(2)),

        gross_salary: Number(grossSalary.toFixed(2)),
        skill_wages: Number(skillWages.toFixed(2)),

        loan: Number(loan.toFixed(2)),
        saturation_deduction: Number((pfDeduction + esiDeduction).toFixed(2)),
        pf_deduction: Number(pfDeduction.toFixed(2)),
        esi_deduction: Number(esiDeduction.toFixed(2)),
        pf_applicable_amount: Number(pfApplicableAmount.toFixed(2)),
        esi_applicable_amount: Number(esiApplicableAmount.toFixed(2)),

        advance_payment: Number(advancePayment.toFixed(2)),
        leave_deduction: Number(leaveDeduction.toFixed(2)),
        total_deduction: Number(totalDeduction.toFixed(2)),
        net_payble: Number(netPayable.toFixed(2)),

        status: payslip.status === 1 ? 'paid' : 'unpaid',
        created_at: payslip.created_at,
        updated_at: payslip.updated_at,

        employee_details: {
          name: employee.name,
          email: employee.email,
          branch: employee.branch.name,
          department: employee.department?.name || 'N/A',
          designation: employee.designation?.name || 'N/A',
          skill: employee.skill.name,
          company_doj: employee.company_doj,
          company_doj_display: employee.company_doj
            ? moment(employee.company_doj).format('DD/MM/YYYY')
            : null
        },

        employee_additional_details: {
          branch: {
            id: employee.branch.id,
            name: employee.branch.name,
            working_days: branchWorkingDays,
            working_hours: branchWorkingHours
          },
          department: {
            id: employee.department?.id,
            name: employee.department?.name
          },
          designation: {
            id: employee.designation?.id,
            name: employee.designation?.name,
            overtime_rate: employee.designation?.overtime_rate
          },
          skill: {
            id: employee.skill.id,
            name: employee.skill.name,
            wages: employee.skill.wages
          },
          attendance: {
            branchWorkingDays: Number(branchWorkingDays.toFixed(2)),
            actualWorkingDays: Number(actualWorkingDays.toFixed(2)),
          },
          employee_basic: {
            employee_id: employee.employee_id,
            name: employee.name,
            email: employee.email,
            company_doj: employee.company_doj
          }
        }
      });
    }

    return res.status(200).json({
      success: true,
      data: enrichedPayslips,
      // ================= ADDED TOTALS TO RESPONSE =================
      summary: {
        total_gross_salary: Number(totalGrossSalary.toFixed(2)),
        total_net_salary: Number(totalNetSalary.toFixed(2)),
        total_payslips: enrichedPayslips.length
      }
    });

  } catch (err) {
    console.error('❌ getAllPayslips error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};


// exports.getAllPayslips = async (req, res) => {
//   try {
//     console.log('🚀 START getAllPayslips');

//     const companyId = await getCompanyId(req);
//     if (!companyId && !isSuper(req)) {
//       return res.status(403).json({ success: false, message: 'Unauthorized' });
//     }
    
//         // =======================================================
//     // 🔐 ROLE & BRANCH ACCESS RESOLUTION
//     // =======================================================
//     const userEmployeeRecord = await Employee.findOne({
//       where: { user_id: req.user.id },
//       attributes: ['branch_id'],
//       raw: true,
//     });

//     const userBranchId = userEmployeeRecord?.branch_id || null;
//     const userType = (req.user.type || '').toLowerCase();
//     const isAccountant = userType === 'accountant';

//     if (!isCompany(req) && !isSuper(req) && !isAccountant && userEmployeeRecord && !userBranchId) {
//       return res.status(403).json({ success: false, message: 'No branch assigned' });
//     }

//     let targetBranchIds = [];

//     if (isSuper(req)) {
//       const allBranches = await Branch.findAll({
//         attributes: ['id'],
//         raw: true,
//       });
//       targetBranchIds = allBranches.map(b => b.id);

//     } else if (isCompany(req) || isAccountant) {
//       const companyBranches = await Branch.findAll({
//         where: { created_by: companyId },
//         attributes: ['id'],
//         raw: true,
//       });
//       targetBranchIds = companyBranches.map(b => b.id);

//       if (targetBranchIds.length === 0) {
//         return res.status(404).json({ success: false, message: 'No branches found for company' });
//       }
//     } else {
//       targetBranchIds = [userBranchId];
//     }

//     console.log('🎯 Accessible Branch IDs:', targetBranchIds);

//     const { month, year } = req.params;

//     let actualMonth, actualYear;
//     if (parseInt(month) > 12) {
//       actualYear = parseInt(month);
//       actualMonth = parseInt(year);
//     } else {
//       actualMonth = parseInt(month);
//       actualYear = parseInt(year);
//     }

//     if (!actualMonth || !actualYear || actualMonth < 1 || actualMonth > 12) {
//       return res.status(400).json({ success: false, message: 'Invalid month/year' });
//     }

//     const salary_month = `${actualYear}-${String(actualMonth).padStart(2, '0')}`;

//     const payslips = await Payslip.findAll({
//       where: { salary_month, is_deleted: false },
//       raw: true
//     });

//     const enrichedPayslips = [];

//     for (const payslip of payslips) {
//       const employee = await Employee.findOne({
//         where: { employee_id: payslip.employee_id, deleted_at: null },
//         include: [
//           { model: Branch, as: 'branch' },
//           { model: Department, as: 'department' },
//           { model: Designation, as: 'designation' },
//           { model: Skill, as: 'skill' }
//         ]
//       });

//       if (!employee || !employee.skill || !employee.branch) continue;

//       const branchWorkingDays = Number(employee.branch.working_days || 26);
//       const branchWorkingHours = Number(employee.branch.working_hours || 8);
//       const skillWages = Number(employee.skill.wages || 0);
//       const overtimeRate = Number(employee.designation?.overtime_rate || 1);

//       const startDate = moment(`${actualYear}-${actualMonth}-01`).startOf('month').format('YYYY-MM-DD');
//       const endDate = moment(`${actualYear}-${actualMonth}-01`).endOf('month').format('YYYY-MM-DD');
      
      
//       // ================= FETCH ADVANCE FROM expenses_news =================
//         let advancePayment = 0;
        
//         try {
//           const advances = await ExpenseNew.findAll({
//             where: {
//               employee_id: employee.employee_id,
//               payments_status: 'paid',
//               payment_date: {
//                 [Op.between]: [startDate, endDate]
//               }
//             },
//             attributes: ['subtotal'],
//             raw: true
//           });
        
//           advancePayment = advances.reduce(
//             (sum, a) => sum + Number(a.subtotal || 0),
//             0
//           );
        
//           console.log(
//             `💰 Advance fetched | Emp ${employee.employee_id}: ₹${advancePayment}`
//           );
        
//         } catch (err) {
//           console.warn(
//             `⚠️ Advance fetch failed | Emp ${employee.employee_id}:`,
//             err.message
//           );
//         }


//       const attendance = await AttendanceEmployee.findAll({
//         where: {
//           employee_id: employee.employee_id,
//           date: { [Op.between]: [startDate, endDate] }
//         },
//         attributes: ['status', 'overtime', 'early_leaving'],
//         raw: true
//       });

//       let actualWorkingDays = 0;
//       let overtimeHours = 0;
//       let earlyLeavingHours = 0;

//       attendance.forEach(a => {
//         if (a.status === 'Present') actualWorkingDays += 1;
//         if (a.status === 'Half Day') actualWorkingDays += 0.5;

//         if (a.overtime && a.overtime !== '00:00:00') {
//           const [h, m, s] = String(a.overtime).split(':').map(Number);
//           overtimeHours += h + m / 60 + s / 3600;
//         }

//         if (a.early_leaving && a.early_leaving !== '00:00:00') {
//           const [h, m, s] = String(a.early_leaving).split(':').map(Number);
//           earlyLeavingHours += h + m / 60 + s / 3600;
//         }
//       });

//       // ================= AUTHORITATIVE RECALCULATION =================

//       const baseSalary = skillWages * actualWorkingDays;

//       const allowance = Number(payslip.allowance || 0);
//       const commission = Number(payslip.commission || 0);
//       const otherPayment = Number(payslip.other_payment || 0);
//       const loan = Number(payslip.loan || 0);
      
      
//       const leaveDeduction = Number(payslip.leave_deduction || 0);

//       const baseHourlyRate = branchWorkingHours > 0 ? skillWages / branchWorkingHours : 0;
//       const allowanceHourlyRate =
//         actualWorkingDays > 0 ? (allowance / actualWorkingDays) / branchWorkingHours : 0;

//       const overtimeAmount =
//         overtimeHours * (baseHourlyRate + allowanceHourlyRate) * overtimeRate;

//       const earlyLeavingDeduction =
//         earlyLeavingHours * (baseHourlyRate + allowanceHourlyRate);

//       const pfApplicableAmount =
//         baseSalary + overtimeAmount + allowance - earlyLeavingDeduction;

//       const esiApplicableAmount =
//         baseSalary + allowance + commission + otherPayment;

//       let pfPercentage = 12;
//       let esiPercentage = 0.75;

//       const saturation = await SaturationDeduction.findAll({
//         where: { employee_id: employee.employee_id },
//         raw: true
//       });

//       saturation.forEach(sd => {
//         if (String(sd.title).toUpperCase() === 'PF') pfPercentage = Number(sd.amount);
//         if (String(sd.title).toUpperCase() === 'ESI') esiPercentage = Number(sd.amount);
//       });

//       const pfDeduction = (pfPercentage / 100) * Math.max(0, pfApplicableAmount);
//       const esiDeduction = (esiPercentage / 100) * Math.max(0, esiApplicableAmount);

//       const grossSalary =
//         baseSalary + allowance + commission + otherPayment + overtimeAmount;
        
//       const totalDeduction = pfDeduction + esiDeduction + loan + advancePayment + leaveDeduction + earlyLeavingDeduction;

//       const netPayable =
//         grossSalary -
//         (pfDeduction +
//           esiDeduction +
//           loan +
//           advancePayment +
//           leaveDeduction +
//           earlyLeavingDeduction);

//       // ================= FINAL STRUCTURED RESPONSE =================

//       enrichedPayslips.push({
//         id: payslip.id,
//         employee_id: payslip.employee_id,
//         salary_month: payslip.salary_month,
//         salary_month_display: `${actualMonth}-${actualYear}`,

//         basic_salary: Number(baseSalary.toFixed(2)),
//         allowance: Number(allowance.toFixed(2)),
//         commission: Number(commission.toFixed(2)),
//         overtime: Number(overtimeAmount.toFixed(2)),
//         other_payment: Number(otherPayment.toFixed(2)),
//         early_leaving: Number(earlyLeavingDeduction.toFixed(2)),

//         gross_salary: Number(grossSalary.toFixed(2)),
//         skill_wages: Number(skillWages.toFixed(2)),

//         loan: Number(loan.toFixed(2)),
//         saturation_deduction: Number((pfDeduction + esiDeduction).toFixed(2)),
//         pf_deduction: Number(pfDeduction.toFixed(2)),
//         esi_deduction: Number(esiDeduction.toFixed(2)),
//         pf_applicable_amount: Number(pfApplicableAmount.toFixed(2)),
//         esi_applicable_amount: Number(esiApplicableAmount.toFixed(2)),
    

//         advance_payment: Number(advancePayment.toFixed(2)),
//         leave_deduction: Number(leaveDeduction.toFixed(2)),
//         total_deduction: Number(totalDeduction.toFixed(2)),
//         net_payble: Number(netPayable.toFixed(2)),

//         status: payslip.status === 1 ? 'paid' : 'unpaid',
//         created_at: payslip.created_at,
//         updated_at: payslip.updated_at,

//         employee_details: {
//           name: employee.name,
//           email: employee.email,
//           branch: employee.branch.name,
//           department: employee.department?.name || 'N/A',
//           designation: employee.designation?.name || 'N/A',
//           skill: employee.skill.name,
//           company_doj: employee.company_doj,
//           company_doj_display: employee.company_doj
//             ? moment(employee.company_doj).format('DD/MM/YYYY')
//             : null
//         },

//         employee_additional_details: {
//           branch: {
//             id: employee.branch.id,
//             name: employee.branch.name,
//             working_days: branchWorkingDays,
//             working_hours: branchWorkingHours
//           },
//           department: {
//             id: employee.department?.id,
//             name: employee.department?.name
//           },
//           designation: {
//             id: employee.designation?.id,
//             name: employee.designation?.name,
//             overtime_rate: employee.designation?.overtime_rate
//           },
//           skill: {
//             id: employee.skill.id,
//             name: employee.skill.name,
//             wages: employee.skill.wages
//           },
//           attendance: {
//             branchWorkingDays: Number(branchWorkingDays.toFixed(2)),
//             actualWorkingDays: Number(actualWorkingDays.toFixed(2)),
//           },
//           employee_basic: {
//             employee_id: employee.employee_id,
//             name: employee.name,
//             email: employee.email,
//             company_doj: employee.company_doj
//           }
//         }
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       data: enrichedPayslips
//     });

//   } catch (err) {
//     console.error('❌ getAllPayslips error:', err);
//     return res.status(500).json({ success: false, message: err.message });
//   }
// };



exports.createPayslipsForMonth = async (req, res) => {
  try {
    console.log('🚀 START createPayslipsForMonth');
    
    const { employee_id, month, year } = req.body;
    
    // Validate required fields
    if (!employee_id) {
      return res.status(400).json({ 
        success: false, 
        message: "employee_id is required" 
      });
    }
    
    // Use current month/year if not provided
    const currentMonth = month || moment().month() + 1;
    const currentYear = year || moment().year();
    
    console.log('📅 Creating payslip for:', {
      employee_id,
      month: currentMonth,
      year: currentYear
    });

    // Get company ID
    let companyId = await getCompanyId(req);
    
    // Find employee with all related data
    const employee = await Employee.findOne({
      where: { 
        employee_id: employee_id.toString(),
        deleted_at: null 
      },
      include: [
        {
          model: Skill,
          as: 'skill',
          attributes: ['id', 'name', 'wages']
        },
        {
          model: Branch,
          as: 'branch',
          attributes: ['id', 'name', 'working_days', 'working_hours']
        },
        {
          model: Designation,
          as: 'designation',
          attributes: ['id', 'name', 'overtime_rate']
        }
      ]
    });
    
    if (!employee) {
      return res.status(404).json({ 
        success: false, 
        message: `Employee not found with ID: ${employee_id}`
      });
    }

    // 🟢 Validate required data
    if (!employee.skill_id || !employee.skill) {
      return res.status(400).json({ 
        success: false, 
        message: 'Employee skill not set. Please set skill first.' 
      });
    }

    if (!employee.branch_id || !employee.branch) {
      return res.status(400).json({ 
        success: false, 
        message: 'Employee branch not found' 
      });
    }

    // Format salary month
    const salary_month = `${currentYear}-${String(currentMonth).padStart(2, "0")}`;
    
    // Check for existing payslip
    const existing = await Payslip.findOne({ 
      where: { 
        employee_id: employee.employee_id,
        salary_month,
        is_deleted: false 
      } 
    });
    
    if (existing) {
      return res.status(400).json({ 
        success: false, 
        message: "Payslip already exists for this month",
        payslip_id: existing.id
      });
    }

    // 🟢 CALCULATE SALARY USING THE FIXED METHOD (same as bulk payslip generation)
    let netSalaryData;
    try {
      // Get necessary data for salary calculation
      const skillWages = Number(employee.skill?.wages || 0);
      const branchWorkingDays = Number(employee.branch?.working_days || 26);
      const branchWorkingHours = Number(employee.branch?.working_hours || 8);
      const designationOvertimeRate = Number(employee.designation?.overtime_rate || 1);

      // Set date ranges
      const startOfMonth = moment(`${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`).startOf('month').format('YYYY-MM-DD');
      const endOfMonth = moment(`${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`).endOf('month').format('YYYY-MM-DD');
      const startOfYear = moment(`${currentYear}-01-01`).startOf('year').format('YYYY-MM-DD');
      const endOfYear = moment(`${currentYear}-12-31`).endOf('year').format('YYYY-MM-DD');

      // 🟢 STEP 1: Get Attendance Data
      let attendanceData = [];
      try {
        attendanceData = await AttendanceEmployee.findAll({
          where: {
            employee_id: employee.employee_id,
            date: { [Op.between]: [startOfMonth, endOfMonth] }
          },
          attributes: ['id', 'date', 'status', 'clock_in', 'clock_out', 'total_rest', 'overtime'],
          order: [['date', 'ASC']],
          raw: true
        });
        console.log(`📅 Found ${attendanceData.length} attendance records for ${employee.name}`);
      } catch (attendanceError) {
        console.warn(`⚠️ Error fetching attendance for ${employee.name}:`, attendanceError.message);
      }

      // 🟢 STEP 2: Calculate actual working days from attendance
      let actualWorkingDays = 0;
      let totalActualHours = 0;
      let attendanceOvertimeHours = 0;

      if (attendanceData.length > 0) {
        attendanceData.forEach(record => {
          if (record.status === 'Present') {
            actualWorkingDays += 1;
            if (record.clock_in && record.clock_out) {
              try {
                const clockIn = moment(record.clock_in, 'HH:mm:ss');
                const clockOut = moment(record.clock_out, 'HH:mm:ss');
                let hoursWorked = clockOut.diff(clockIn, 'hours', true);
                if (hoursWorked < 0) hoursWorked = 24 + hoursWorked;
                const restHours = (record.total_rest || 0) / 60;
                hoursWorked = Math.max(0, hoursWorked - restHours);
                totalActualHours += hoursWorked;
              } catch (timeError) {
                totalActualHours += branchWorkingHours;
              }
            } else {
              totalActualHours += branchWorkingHours;
            }
          } else if (record.status === 'Half Day') {
            actualWorkingDays += 0.5;
            totalActualHours += (branchWorkingHours / 2);
          }
          attendanceOvertimeHours += parseFloat(record.overtime) || 0;
        });
      }

      if (totalActualHours === 0) {
        totalActualHours = branchWorkingDays * branchWorkingHours;
      }

      const workingDaysForSalary = actualWorkingDays;

      // 🟢 STEP 3: Calculate Base Salary
      const baseSalary = Number((skillWages * workingDaysForSalary).toFixed(2));
      const baseHourlyRate = Number((skillWages / branchWorkingHours).toFixed(4));

      // Get user IDs for access control
      let userIds = [];
      const userEmployeeRecord = await Employee.findOne({
        where: { user_id: req.user.id },
        attributes: ['branch_id', 'created_by'],
        raw: true,
      });

      if (userEmployeeRecord && userEmployeeRecord.branch_id) {
        const branchId = userEmployeeRecord.branch_id;
        userIds = await getAllUserIdsUnderCompanyBranch(companyId, branchId);
      } else {
        userIds = await getAllUserIdsUnderCompanyBranch(companyId, null);
      }

      // 🟢 STEP 4: Fetch allowances (PERMANENT - no month filter)
      const allowances = await Allowance.findAll({ 
        where: { 
          employee_id: employee.employee_id,
          created_by: { [Op.in]: userIds }
        },
        raw: true
      });

      // 🟢 STEP 5: Calculate Allowances based on ACTUAL working days
      let allowancesTotal = 0;
      const allowancesList = allowances.map((i) => {
        const rawAmount = parseFloat(i.amount || 0);
        let computedAmount = 0;

        if (String(i.type || '').toLowerCase() === 'percentage') {
          computedAmount = (rawAmount / 100) * baseSalary;
        } else {
          computedAmount = rawAmount * workingDaysForSalary;
        }
        allowancesTotal += computedAmount;
        return {
          title: i.title,
          type: i.type,
          raw_amount: rawAmount,
          computed_amount: Number(computedAmount.toFixed(2))
        };
      });

      allowancesTotal = Number(allowancesTotal.toFixed(2));

      // 🟢 FIXED: Calculate DAILY allowance rate for overtime calculation
      const dailyAllowanceRate = workingDaysForSalary > 0 ? Number((allowancesTotal / workingDaysForSalary).toFixed(4)) : 0;
      const allowanceHourlyRate = Number((dailyAllowanceRate / branchWorkingHours).toFixed(4));

      console.log(`💰 ${employee.name}: Allowance Calculation`);
      console.log(`   Total Allowances: ₹${allowancesTotal.toFixed(2)}`);
      console.log(`   Daily Allowance Rate: ₹${dailyAllowanceRate.toFixed(4)}`);
      console.log(`   Allowance Hourly Rate: ₹${allowanceHourlyRate.toFixed(4)}`);

      // 🟢 STEP 6: Fetch other components
      const commonWhereClause = {
        created_by: { [Op.in]: userIds },
        created_at: { [Op.between]: [startOfMonth, endOfMonth] }
      };

      const [commissions, loans, otherPayments, overtimes, employeeAdvances] = await Promise.all([
        Commission.findAll({ where: { employee_id: employee.id, ...commonWhereClause }, raw: true }),
        Loan.findAll({ where: { employee_id: employee.employee_id, ...commonWhereClause }, raw: true }),
        OtherPayment.findAll({ where: { employee_id: employee.employee_id, ...commonWhereClause }, raw: true }),
        Overtime.findAll({ where: { employee_id: employee.employee_id, ...commonWhereClause }, raw: true }),
        ExpenseNew.findAll({
          where: {
            employee_id: employee.employee_id,
            created_by: { [Op.in]: userIds },
            payments_status: 'paid',
            payment_date: { [Op.between]: [startOfMonth, endOfMonth] }
          },
          raw: true
        })
      ]);

      // 🟢 STEP 7: Calculate other components
      const commissionsTotal = Number(commissions.reduce((sum, c) => sum + computeValue(c.amount, c.type, baseSalary), 0).toFixed(2));
      const otherPaymentsTotal = Number(otherPayments.reduce((sum, op) => sum + computeValue(op.amount, op.type, baseSalary), 0).toFixed(2));
      const loansTotal = Number(loans.reduce((sum, l) => sum + computeValue(l.amount, l.type, baseSalary), 0).toFixed(2));
      const advancesTotal = Number(employeeAdvances.reduce((sum, adv) => sum + Number(adv.total_amount || 0), 0).toFixed(2));

      // 🟢 STEP 8: Calculate Overtime (FIXED: includes base + allowances using daily allowance rate)
      let overtimeTotal = 0;
      let baseOvertimeTotal = 0;
      let allowanceOvertimeTotal = 0;

      overtimes.forEach((o) => {
        const otHours = parseFloat(o.hours || o.ot_hours || 0);
        if (otHours > 0) {
          const baseOvertimeAmount = designationOvertimeRate * baseHourlyRate * otHours;
          const allowanceOvertimeAmount = designationOvertimeRate * allowanceHourlyRate * otHours;
          baseOvertimeTotal += baseOvertimeAmount;
          allowanceOvertimeTotal += allowanceOvertimeAmount;
          overtimeTotal += baseOvertimeAmount + allowanceOvertimeAmount;
        }
      });

      // Add attendance overtime if no overtime records exist
      if (attendanceOvertimeHours > 0 && overtimes.length === 0) {
        const baseOvertimeAmount = designationOvertimeRate * baseHourlyRate * attendanceOvertimeHours;
        const allowanceOvertimeAmount = designationOvertimeRate * allowanceHourlyRate * attendanceOvertimeHours;
        baseOvertimeTotal += baseOvertimeAmount;
        allowanceOvertimeTotal += allowanceOvertimeAmount;
        overtimeTotal += baseOvertimeAmount + allowanceOvertimeAmount;
      }

      baseOvertimeTotal = Number(baseOvertimeTotal.toFixed(2));
      allowanceOvertimeTotal = Number(allowanceOvertimeTotal.toFixed(2));
      overtimeTotal = Number(overtimeTotal.toFixed(2));

      console.log(`⏰ ${employee.name}: Overtime Calculation`);
      console.log(`   Base Overtime: ₹${baseOvertimeTotal.toFixed(2)}`);
      console.log(`   Allowance Overtime: ₹${allowanceOvertimeTotal.toFixed(2)}`);
      console.log(`   Total Overtime: ₹${overtimeTotal.toFixed(2)}`);

      // 🟢 STEP 9: Fetch saturation deductions (PERMANENT - PF/ESI ONLY)
      const saturationDeductions = await SaturationDeduction.findAll({ 
        where: { 
          employee_id: employee.employee_id,
          created_by: { [Op.in]: userIds }
        },
        raw: true
      });

      // 🟢 STEP 10: Calculate Saturation Deductions (PF/ESI ONLY)
      let totalPFDeduction = 0;
      let totalESIDeduction = 0;
      
      // CRITICAL FIX: Use EXACT SAME calculations as calculateNetSalary
      const pfApplicableAmount = Number((baseSalary + baseOvertimeTotal + allowancesTotal).toFixed(2));
      const esiApplicableAmount = Number((baseSalary + allowancesTotal + otherPaymentsTotal + commissionsTotal).toFixed(2));

      console.log(`💵 ${employee.name}: PF/ESI Applicable Amounts`);
      console.log(`   PF Applicable: ₹${pfApplicableAmount} (Base:${baseSalary} + Overtime:${baseOvertimeTotal} + Allowances:${allowancesTotal})`);
      console.log(`   ESI Applicable: ₹${esiApplicableAmount} (Base:${baseSalary} + Allowances:${allowancesTotal} + Other:${otherPaymentsTotal} + Commissions:${commissionsTotal})`);

      saturationDeductions.forEach(sd => {
        const deductionType = String(sd.title || '').toUpperCase();
        const rawAmount = parseFloat(sd.amount || 0);
        const type = String(sd.type || '').toLowerCase();
        
        if (deductionType === 'PF' || deductionType === 'ESI') {
          let applicableAmount = deductionType === 'PF' ? pfApplicableAmount : esiApplicableAmount;
          let computedAmount = 0;
          
          if (type === 'percentage') {
            computedAmount = (rawAmount / 100) * applicableAmount;
          } else {
            computedAmount = rawAmount;
          }
          
          computedAmount = Number(computedAmount.toFixed(2));
          
          if (deductionType === 'PF') {
            totalPFDeduction += computedAmount;
          } else if (deductionType === 'ESI') {
            totalESIDeduction += computedAmount;
          }
        }
      });

      totalPFDeduction = Number(totalPFDeduction.toFixed(2));
      totalESIDeduction = Number(totalESIDeduction.toFixed(2));
      const saturationTotal = Number((totalPFDeduction + totalESIDeduction).toFixed(2));

      console.log(`💸 ${employee.name}: Deductions Calculation`);
      console.log(`   PF Deduction: ₹${totalPFDeduction}`);
      console.log(`   ESI Deduction: ₹${totalESIDeduction}`);
      console.log(`   Total Saturation Deductions: ₹${saturationTotal}`);

      // 🟢 STEP 11: Fetch leaves for progressive annual leave calculation
      const leavesUpToCurrentMonth = await Leave.findAll({
        where: {
          employee_id: employee.id,
          status: 'Approved',
          [Op.or]: [
            { start_date: { [Op.between]: [startOfYear, endOfMonth] } },
            { end_date: { [Op.between]: [startOfYear, endOfMonth] } },
            {
              [Op.and]: [
                { start_date: { [Op.lte]: startOfYear } },
                { end_date: { [Op.gte]: endOfMonth } }
              ]
            }
          ]
        },
        attributes: ['id', 'total_leave_days'],
        raw: true
      });

      // 🟢 STEP 12: Calculate Leave Deductions
      let leaveDeductionThisMonth = 0;
      const cumulativeLeavesUpToCurrent = leavesUpToCurrentMonth.reduce((sum, leave) => {
        const days = parseFloat(leave.total_leave_days || 0);
        return sum + (isNaN(days) ? 0 : days);
      }, 0);

      if (cumulativeLeavesUpToCurrent > 18) {
        const deductibleLeavesThisMonth = cumulativeLeavesUpToCurrent - 18;
        const dailySalary = workingDaysForSalary > 0 ? Number((baseSalary / workingDaysForSalary).toFixed(2)) : 0;
        leaveDeductionThisMonth = Number((deductibleLeavesThisMonth * dailySalary).toFixed(2));
      }

      // 🟢 STEP 13: Calculate Gross and Net Salary
      const additionsTotal = Number((allowancesTotal + commissionsTotal + otherPaymentsTotal + overtimeTotal).toFixed(2));
      const gross = Number((baseSalary + additionsTotal).toFixed(2));
      const deductionsTotal = Number((loansTotal + saturationTotal + advancesTotal + leaveDeductionThisMonth).toFixed(2));
      const net_payble = Number((gross - deductionsTotal).toFixed(2));

      console.log(`✅ Salary calculation successful for ${employee.name}:`);
      console.log(`   Base Salary: ₹${baseSalary}`);
      console.log(`   Actual Working Days: ${actualWorkingDays}`);
      console.log(`   Allowances: ₹${allowancesTotal}`);
      console.log(`   Overtime: ₹${overtimeTotal}`);
      console.log(`   PF Deduction: ₹${totalPFDeduction}`);
      console.log(`   ESI Deduction: ₹${totalESIDeduction}`);
      console.log(`   Gross: ₹${gross}`);
      console.log(`   Total Deductions: ₹${deductionsTotal}`);
      console.log(`   Net Payable: ₹${net_payble}`);

      // Construct the complete netSalaryData object
      netSalaryData = {
        period: {
          month: parseInt(currentMonth),
          year: parseInt(currentYear),
          start_date: startOfMonth,
          end_date: endOfMonth,
          display: moment(`${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`).format('MMMM YYYY')
        },
        employee: {
          employee_id: employee.employee_id,
          name: employee.name,
          base_salary_calculation: {
            skill_wages: skillWages,
            branch_planned_working_days: branchWorkingDays,
            actual_working_days: Number(actualWorkingDays.toFixed(1)),
            calculated_base_salary: baseSalary,
            full_month_base_salary: Number((skillWages * branchWorkingDays).toFixed(2))
          }
        },
        attendance_summary: {
          planned_working_days: branchWorkingDays,
          actual_working_days: Number(actualWorkingDays.toFixed(1)),
          attendance_records_count: attendanceData.length
        },
        progressive_leave_summary: {
          cumulative_leaves_upto_current: cumulativeLeavesUpToCurrent,
          leave_deduction_this_month: leaveDeductionThisMonth
        },
        breakdown: {
          base_salary: baseSalary,
          allowances_total: allowancesTotal,
          commissions_total: commissionsTotal,
          other_payments_total: otherPaymentsTotal,
          overtime_total: overtimeTotal,
          overtime_breakdown: {
            base_overtime_total: baseOvertimeTotal,
            allowance_overtime_total: allowanceOvertimeTotal
          },
          loans_total: loansTotal,
          saturation_total: saturationTotal,
          saturation_deduction_breakdown: {
            pf_deductions: {
              total: totalPFDeduction
            },
            esi_deductions: {
              total: totalESIDeduction
            }
          },
          advances_total: advancesTotal,
          totals: {
            additions: additionsTotal,
            deductions: deductionsTotal,
            gross: gross,
            net: net_payble
          }
        }
      };

    } catch (error) {
      console.error("❌ Salary calculation error for", employee.name, ":", error.message);
      console.error("Error stack:", error.stack);
      return res.status(500).json({ 
        success: false, 
        message: "Failed to calculate salary: " + error.message
      });
    }

    // Extract values from the calculation
    const net_payble = netSalaryData.breakdown?.totals?.net || 0;
    const leaveDeduction = netSalaryData.progressive_leave_summary?.leave_deduction_this_month || 0;
    const baseSalary = netSalaryData.employee?.base_salary_calculation?.calculated_base_salary || 
                      netSalaryData.employee?.stored_salary || 
                      employee.salary || 
                      0;
    const skillWages = netSalaryData.employee?.base_salary_calculation?.skill_wages || 0;

    // 🟢 Create component_details with corrected structure
    const component_details = netSalaryData;

    // Extract component totals from breakdown for the payslip columns
    const allowancesTotal = netSalaryData.breakdown?.allowances_total || 0;
    const commissionsTotal = netSalaryData.breakdown?.commissions_total || 0;
    const otherPaymentsTotal = netSalaryData.breakdown?.other_payments_total || 0;
    const overtimeTotal = netSalaryData.breakdown?.overtime_total || 0;
    const loansTotal = netSalaryData.breakdown?.loans_total || 0;
    const saturationTotal = netSalaryData.breakdown?.saturation_total || 0;
    const advancesTotal = netSalaryData.breakdown?.advances_total || 0;
    const pfDeduction = netSalaryData.breakdown?.saturation_deduction_breakdown?.pf_deductions?.total || 0;
    const esiDeduction = netSalaryData.breakdown?.saturation_deduction_breakdown?.esi_deductions?.total || 0;

    console.log(`💰 Employee ${employee.name} totals:`);
    console.log(`   - Base Salary: ₹${baseSalary}`);
    console.log(`   - Allowances: ₹${allowancesTotal}`);
    console.log(`   - Overtime: ₹${overtimeTotal}`);
    console.log(`   - Saturation Deductions: ₹${saturationTotal} (PF: ₹${pfDeduction}, ESI: ₹${esiDeduction})`);
    console.log(`   - Net Payable: ₹${net_payble}`);

    // Create the payslip
    const payslip = await Payslip.create({
      employee_id: employee.employee_id,
      employee_primary_id: employee.id,
      created_by: req.user?.id || companyId || 1,
      salary_month,
      basic_salary: baseSalary,
      allowance: allowancesTotal,
      commission: commissionsTotal,
      overtime: overtimeTotal,
      other_payment: otherPaymentsTotal,
      skill_wages: skillWages,
      loan: loansTotal,
      saturation_deduction: saturationTotal,
      advance_payment: advancesTotal,
      leave_deduction: leaveDeduction,
      net_payble,
      status: 0,
      component_details: component_details,
    });

    // 🟢 Return success response
    return res.status(201).json({
      success: true,
      message: "Payslip created successfully with FIXED per-day allowance calculation",
      data: component_details,
      payslip: {
        id: payslip.id,
        employee_id: payslip.employee_id,
        salary_month: payslip.salary_month,
        basic_salary: payslip.basic_salary,
        allowance: payslip.allowance,
        commission: payslip.commission,
        overtime: payslip.overtime,
        other_payment: payslip.other_payment,
        skill_wages: skillWages,
        loan: payslip.loan,
        saturation_deduction: payslip.saturation_deduction,
        pf_deduction: pfDeduction,
        esi_deduction: esiDeduction,
        advance_payment: payslip.advance_payment,
        leave_deduction: payslip.leave_deduction,
        net_payble: payslip.net_payble,
        status: payslip.status === 1 ? "paid" : "unpaid",
        created_at: payslip.created_at,
        updated_at: payslip.updated_at
      },
      summary: {
        month: currentMonth,
        year: currentYear,
        salary_month,
        base_salary: baseSalary,
        total_additions: netSalaryData.breakdown?.totals?.additions || 0,
        total_deductions: netSalaryData.breakdown?.totals?.deductions || 0,
        gross_salary: netSalaryData.breakdown?.totals?.gross || 0,
        net_salary: net_payble,
        attendance_based: true,
        attendance_percentage: attendanceData.length > 0 ? (actualWorkingDays / branchWorkingDays) * 100 : 0,
        actual_working_days: actualWorkingDays,
        calculation_method: 'attendance_based_fixed',
        allowance_calculation: 'per_day_basis'
      }
    });
    
  } catch (err) {
    console.error("❌ Error creating payslip:", err.message);
    console.error("Error stack:", err.stack);
    return res.status(500).json({ 
      success: false, 
      message: "Server error: " + err.message,
      error: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};


exports.softDeletePayslip = async (req, res) => {
  try {
    const { employee_id } = req.params; // Changed from req.body to req.params

    console.log("???? Soft delete request:", {
      employeeId: employee_id,
      userId: req.user.id,
      userType: req.user.type
    });

    if (!employee_id) {
      return res.status(400).json({ success: false, message: "Employee ID is required" });
    }

    const companyId = await getCompanyId(req);
    if (!companyId) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const userId = req.user.id;
    const userType = (req.user.type || "").toLowerCase();

    // 1?? Find the payslip with better debugging
    const payslip = await Payslip.findOne({
      where: { 
        employee_id: employee_id,
        is_deleted: false 
      },
      include: [
        {
          model: Employee,
          as: "employee",
          attributes: ["id", "name", "employee_id", "salary_type", "branch_id", "created_by"],
          required: false,
          include: [
            { model: Branch, as: "branch", attributes: ["id", "name"], required: false },
          ],
        },
      ],
    });

    console.log("???? Payslip search result:", {
      payslipFound: !!payslip,
      employeeId: employee_id,
      payslipData: payslip ? {
        id: payslip.id,
        employee_id: payslip.employee_id,
        is_deleted: payslip.is_deleted
      } : null
    });

    if (!payslip) {
      // Check if payslip exists but is already deleted
      const deletedPayslip = await Payslip.findOne({
        where: { employee_id: employee_id },
        paranoid: false // Include soft-deleted records
      });

      if (deletedPayslip) {
        return res.status(404).json({ 
          success: false, 
          message: "Payslip already deleted",
          debug: {
            employeeId: employee_id,
            deletedAt: deletedPayslip.deleted_at
          }
        });
      } else {
        return res.status(404).json({ 
          success: false, 
          message: "Payslip not found for this employee",
          debug: {
            employeeId: employee_id // FIXED: Changed from payslipId to employeeId
          }
        });
      }
    }

    // 2?? Permission check
    if (!["company", "admin", "super admin", "accountant"].includes(userType)) {
      const branchUser = await Employee.findOne({
        where: { user_id: userId },
        attributes: ["branch_id"],
        raw: true,
      });

      if (!branchUser || !branchUser.branch_id) {
        return res.status(403).json({ success: false, message: "Branch not found for user" });
      }

      if (!payslip.employee || Number(branchUser.branch_id) !== Number(payslip.employee.branch_id)) {
        return res.status(403).json({
          success: false,
          message: "Cannot delete payslip from another branch",
          debug: {
            userBranch: branchUser.branch_id,
            employeeBranch: payslip.employee?.branch_id
          }
        });
      }
    }

    // 3?? Additional check for company users
    if (["company", "admin", "super admin"].includes(userType)) {
      const companyUsers = await User.findAll({
        where: { created_by: companyId },
        attributes: ['id'],
        raw: true,
      });
      const allowedCreatorIds = companyUsers.map(u => u.id).concat(companyId);

      if (payslip.employee && !allowedCreatorIds.includes(payslip.employee.created_by)) {
        return res.status(403).json({
          success: false,
          message: 'Cannot delete payslip of employee from another company',
        });
      }
    }

    // 4?? Soft delete the payslip
    const deletedAt = new Date();
    const [updateCount] = await Payslip.update(
      { 
        is_deleted: true, 
        deleted_at: deletedAt, 
        deleted_by: userId 
      },
      { 
        where: { employee_id: employee_id }
      }
    );

    console.log("? Payslip soft delete result:", {
      updateCount,
      employeeId: employee_id,
      deletedAt: deletedAt
    });

    if (updateCount === 0) {
      return res.status(500).json({
        success: false,
        message: "Failed to delete payslip - no rows updated"
      });
    }

    // 5?? Prepare response
    const response = {
      id: payslip.id,
      employee_id: payslip.employee_id,
      salary_month: payslip.salary_month,
      net_payble: payslip.net_payble,
      employee: payslip.employee
        ? {
            id: payslip.employee.id,
            name: payslip.employee.name,
            employee_id: payslip.employee.employee_id,
            salary_type: payslip.employee.salary_type,
            branch: payslip.employee.branch
              ? { id: payslip.employee.branch.id, name: payslip.employee.branch.name }
              : null,
          }
        : null,
      deleted: true,
      deleted_at: deletedAt,
      deleted_by: userId,
    };

    res.status(200).json({
      success: true,
      message: "Payslip deleted successfully",
      data: response,
    });

  } catch (error) {
    console.error("? Error deleting payslip:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.bulkPayment = async (req, res) => {

  let transaction;

  try {

    // ✅ START TRANSACTION (CORRECT WAY)
    transaction = await sequelize.transaction();

    console.log('🚀 START bulkPayment');
    console.log('👤 User Info - ID:', req.user.id, 'Type:', req.user.type);

    const companyId = await getCompanyId(req);

    const userEmployeeRecord = await Employee.findOne({
      where: { user_id: req.user.id },
      attributes: ['branch_id', 'created_by'],
      raw: true,
      transaction
    });

    let userBranchId = userEmployeeRecord?.branch_id || null;

    const userType = (req.user.type || '').toLowerCase();
    const isAccountant = userType === 'accountant';

    if (!isCompany(req) && !isSuper(req) && !isAccountant && userEmployeeRecord && !userBranchId) {
      await transaction.rollback();
      return res.status(403).json({ success: false, message: 'No branch assigned' });
    }

    const { month, year, branch_ids, payment_mode, remarks } = req.body;

    if (!month || !year) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Month and year are required.",
      });
    }

    const salary_month = `${year}-${String(parseInt(month)).padStart(2, '0')}`;
    console.log('📅 Salary Month:', salary_month);

    let targetBranchIds = [];

    // ================= ROLE BASED ACCESS =================

    if (isSuper(req)) {

      if (branch_ids?.length) {
        targetBranchIds = Array.isArray(branch_ids) ? branch_ids : [branch_ids];
      } else {
        const allBranches = await Branch.findAll({
          attributes: ["id"],
          raw: true,
          transaction
        });
        targetBranchIds = allBranches.map(b => b.id);
      }

    } else if (isCompany(req) || isAccountant) {

      const companyBranches = await Branch.findAll({
        where: { created_by: companyId },
        attributes: ["id"],
        raw: true,
        transaction
      });

      targetBranchIds = companyBranches.map(b => b.id);

    } else {

      targetBranchIds = [userBranchId];
    }

    if (!targetBranchIds.length) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: "No branches found for access"
      });
    }

    // ================= ELIGIBLE EMPLOYEES =================

    const salaryMonthEnd = moment(`${year}-${month}-01`).endOf('month');

    const employees = await Employee.findAll({
      where: {
        branch_id: { [Op.in]: targetBranchIds },
        deleted_at: null
      },
      attributes: ["employee_id", "name", "company_doj"],
      raw: true,
      transaction
    });

    const eligibleEmployees = employees.filter(emp => {
      if (!emp.company_doj) return true;
      return moment(emp.company_doj).isSameOrBefore(salaryMonthEnd, 'day');
    });

    if (!eligibleEmployees.length) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: `No eligible employees found for ${salary_month}`
      });
    }

    const eligibleEmployeeIds = eligibleEmployees.map(emp =>
      Number(emp.employee_id)
    );

    // ================= FETCH UNPAID PAYSLIPS =================

    const unpaidPayslips = await Payslip.findAll({
      where: {
        salary_month,
        status: 0,              // unpaid
        is_deleted: false,
        employee_id: { [Op.in]: eligibleEmployeeIds }
      },
      transaction
    });

    if (!unpaidPayslips.length) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: `No unpaid payslips found for ${salary_month}`
      });
    }

    // ================= PROCESS BULK PAYMENT =================

    let totalGrossSalary = 0;
    let totalNetSalary = 0;
    const updatedPayslips = [];
    const paidAt = new Date();

    for (const payslip of unpaidPayslips) {

      const gross = Number(payslip.gross_salary || 0);
      const net = Number(payslip.net_payble || 0);

      totalGrossSalary += gross;
      totalNetSalary += net;

      payslip.status = 1;
      payslip.paid_at = paidAt;   
      payslip.payment_mode = payment_mode || "bank transfer";
      payslip.remarks = remarks || "Bulk payment processed";
      payslip.updated_at = paidAt;

      await payslip.save({ transaction });

      updatedPayslips.push({
        id: payslip.id,
        employee_id: payslip.employee_id,
        salary_month: payslip.salary_month,
        gross_salary: gross,
        net_payble: net,
        status: "paid",
        updated_at: paidAt,
      });
    }

    // ✅ COMMIT TRANSACTION
    await transaction.commit();

    // ================= RESPONSE FORMAT =================

    const monthNames = [
      "January","February","March","April","May","June",
      "July","August","September","October","November","December"
    ];

    const monthName = monthNames[parseInt(month) - 1];

    const salaryDeductionDescription =
      `${monthName} ${year} salary - Gross: ₹${totalGrossSalary.toLocaleString('en-IN',{minimumFractionDigits:2})} | Net: ₹${totalNetSalary.toLocaleString('en-IN',{minimumFractionDigits:2})}`;

    return res.status(200).json({
      success: true,
      message: `${updatedPayslips.length} payslips marked as paid successfully for ${salary_month}.`,
      summary: {
        total_gross_salary: Number(totalGrossSalary.toFixed(2)),
        total_net_salary: Number(totalNetSalary.toFixed(2)),
        total_payslips: updatedPayslips.length
      },
      salary_deduction_info: {
        month: `${monthName} ${year}`,
        gross_amount: Number(totalGrossSalary.toFixed(2)),
        net_amount: Number(totalNetSalary.toFixed(2)),
        description: salaryDeductionDescription,
        payslips_count: updatedPayslips.length,
        salary_month: salary_month
      },
      data: updatedPayslips,
      user_access_info: {
        user_type: req.user.type,
        company_id: companyId,
        branch_access: targetBranchIds,
        access_level: isSuper(req)
          ? 'super_admin'
          : (isCompany(req) || isAccountant)
            ? 'company_wide'
            : 'branch_limited',
        eligible_employees: eligibleEmployees.length,
        processed_payslips: updatedPayslips.length
      }
    });

  } catch (error) {

    if (transaction) await transaction.rollback();

    console.error("❌ Bulk payment error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error during bulk payment.",
      error: error.message
    });
  }
};

// exports.bulkPayment = async (req, res) => {
//   try {
//     console.log('???? START bulkPayment');
//     console.log('???? User Info - ID:', req.user.id, 'Type:', req.user.type);

//     // 🟩 FIXED: Use the SAME permission logic as getAllPayslips
//     const companyId = await getCompanyId(req);
    
//     // 🟩 FIXED: Remove the strict permission check that's causing the issue
//     // The working functions don't have this immediate rejection
//     if (!companyId && !isSuper(req)) {
//       console.log('???? Checking user access without immediate rejection...');
//       // Don't reject immediately like the working functions
//     }

//     // 🟩 FIXED: Use EXACTLY the same logic as getAllPayslips
//     const userEmployeeRecord = await Employee.findOne({
//       where: { user_id: req.user.id },
//       attributes: ['branch_id', 'created_by'],
//       raw: true,
//     });

//     console.log('???? User Employee Record:', userEmployeeRecord);

//     let userBranchId = null;

//     if (userEmployeeRecord && userEmployeeRecord.branch_id) {
//       console.log('???? Branch User - Processing bulk payment');
//       userBranchId = userEmployeeRecord.branch_id;
//     } else {
//       console.log('???? Branchless User - Processing bulk payment');
//       // No branch restriction for branchless users (like getAllPayslips)
//     }

//     const userType = (req.user.type || '').toLowerCase();
//     const isAccountant = userType === 'accountant';
    
//     console.log('???? User Type Check:', { 
//       userType, 
//       isAccountant, 
//       isCompany: isCompany(req), 
//       isSuper: isSuper(req), 
//       isEmployee: isEmployee(req) 
//     });

//     // 🟩 FIXED: Use the EXACT same logic as getAllPayslips
//     if (!isCompany(req) && !isSuper(req) && !isAccountant && userEmployeeRecord && !userBranchId) {
//       console.log('???? RESTRICTING: Branch user without branch assignment');
//       return res.status(403).json({ success: false, message: 'No branch assigned' });
//     }

//     const { month, year, branch_ids, payment_mode, remarks } = req.body;

//     console.log('???? Request body:', { month, year, branch_ids, payment_mode, remarks });

//     if (!month || !year) {
//       return res.status(400).json({
//         success: false,
//         message: "Month and year are required.",
//       });
//     }

//     const salary_month = `${year}-${String(month).padStart(2, '0')}`;
//     console.log('???? Salary month:', salary_month);

//     // 🟩 FIXED: Use the SAME branch access logic as getAllPayslips
//     let targetBranchIds = [];

//     if (isSuper(req)) {
//       console.log('???? Super Admin - Full branch access');
//       if (branch_ids && branch_ids.length > 0) {
//         targetBranchIds = Array.isArray(branch_ids) ? branch_ids : [branch_ids];
//       } else {
//         const allBranches = await Branch.findAll({
//           attributes: ["id"],
//           raw: true,
//         });
//         targetBranchIds = allBranches.map(b => b.id);
//       }
//     } else if (isCompany(req) || isAccountant) {
//       console.log('???? Company User/Accountant - Company branches access');
      
//       if (branch_ids && branch_ids.length > 0) {
//         const branchIdsArray = Array.isArray(branch_ids) ? branch_ids : [branch_ids];
//         const validBranches = await Branch.findAll({
//           where: { 
//             id: { [Op.in]: branchIdsArray },
//             created_by: companyId 
//           },
//           attributes: ["id"],
//           raw: true,
//         });
//         targetBranchIds = validBranches.map(b => b.id);
        
//         if (targetBranchIds.length === 0) {
//           return res.status(400).json({ 
//             success: false, 
//             message: "No valid branches found for the company" 
//           });
//         }
//       } else {
//         const companyBranches = await Branch.findAll({
//           where: { created_by: companyId },
//           attributes: ["id"],
//           raw: true,
//         });
//         targetBranchIds = companyBranches.map(b => b.id);
        
//         if (targetBranchIds.length === 0) {
//           return res.status(404).json({ 
//             success: false, 
//             message: "No branches found for this company" 
//           });
//         }
//       }
//     } else {
//       console.log('???? Branch User/Employee - Limited branch access');
//       if (!userBranchId) {
//         return res.status(403).json({ success: false, message: 'No branch assigned' });
//       }
//       targetBranchIds = [userBranchId];
//     }

//     if (targetBranchIds.length === 0) {
//       return res.status(404).json({ 
//         success: false, 
//         message: "No branches found for access" 
//       });
//     }

//     console.log('???? Final Target Branch IDs:', targetBranchIds);

//     // 🟩 FIXED: Date validation (same as other functions)
//     const currentDate = moment();
//     const requestedDate = moment(`${year}-${month}-01`);

//     if (requestedDate.isAfter(currentDate, 'month')) {
//       return res.status(400).json({
//         success: false,
//         message: "Cannot process bulk payment for future months",
//       });
//     }

//     // Ensure associations exist (same as getAllPayslips)
//     if (!Payslip.associations.employee) {
//       Payslip.belongsTo(Employee, { 
//         foreignKey: 'employee_id', 
//         targetKey: 'employee_id',
//         as: 'employee' 
//       });
//     }

//     // ✅ Step 1: Get eligible employees (SAME LOGIC as getAllPayslips)
//     const salaryMonthStart = moment(`${year}-${month}-01`).startOf('month');
//     const salaryMonthEnd = moment(`${year}-${month}-01`).endOf('month');

//     console.log('???? Fetching eligible employees for branches:', targetBranchIds);

//     const allEmployees = await Employee.findAll({
//       where: { 
//         branch_id: { [Op.in]: targetBranchIds },
//         deleted_at: null
//       },
//       attributes: ["id", "employee_id", "name", "branch_id", "company_doj"],
//       raw: false
//     });

//     console.log('???? Found employees:', allEmployees.length);

//     // Filter employees who joined during or before the payslip month (SAME as getAllPayslips)
//     const eligibleEmployees = allEmployees.filter(employee => {
//       if (!employee.company_doj) return true;
//       const joinDate = moment(employee.company_doj);
//       return joinDate.isSameOrBefore(salaryMonthEnd, 'day');
//     });

//     console.log('???? Eligible employees after DOJ check:', eligibleEmployees.length);

//     if (eligibleEmployees.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: `No eligible employees found for ${salary_month} in the accessible branches.`,
//         user_access_info: {
//           user_type: req.user.type,
//           company_id: companyId,
//           branch_access: targetBranchIds,
//           access_level: isSuper(req) ? 'super_admin' : (isCompany(req) || isAccountant) ? 'company_wide' : 'branch_limited'
//         }
//       });
//     }

//     const eligibleEmployeeIds = eligibleEmployees.map(emp => emp.employee_id);
//     console.log('???? Eligible employee IDs:', eligibleEmployeeIds);

//     // ✅ Step 2: Fetch unpaid payslips for eligible employees
//     const unpaidPayslips = await Payslip.findAll({
//       where: {
//         salary_month,
//         status: 0, // unpaid
//         is_deleted: false,
//         employee_id: { [Op.in]: eligibleEmployeeIds }
//       },
//       include: [
//         {
//           model: Employee,
//           as: "employee",
//           attributes: ["id", "name", "branch_id", "department_id"],
//         },
//       ],
//     });

//     console.log('???? Unpaid payslips found:', unpaidPayslips.length);

//     if (!unpaidPayslips || unpaidPayslips.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: `No unpaid payslips found for ${salary_month} in the accessible branches.`,
//         user_access_info: {
//           user_type: req.user.type,
//           company_id: companyId,
//           branch_access: targetBranchIds,
//           access_level: isSuper(req) ? 'super_admin' : (isCompany(req) || isAccountant) ? 'company_wide' : 'branch_limited',
//           eligible_employees: eligibleEmployees.length,
//           processed_payslips: 0
//         }
//       });
//     }

//     console.log(`???? Found ${unpaidPayslips.length} unpaid payslips for bulk payment`);

//     // ✅ Step 3: Process payments
//     let totalSalaryAmount = 0;
//     const updatedPayslips = [];
//     const paidAt = new Date();

//     console.log('???? Starting to process payslips...');

//     for (const payslip of unpaidPayslips) {
//       try {
//         const netPayble = parseFloat(payslip.net_payble || 0);
//         totalSalaryAmount += netPayble;
        
//         payslip.status = 1;
//         payslip.updated_at = paidAt;

//         // Fix for tax_total
//         if ("tax_total" in payslip.dataValues && payslip.tax_total === undefined) {
//           payslip.tax_total = 0;
//         }

//         // Optional additional info
//         payslip.payment_mode = payment_mode || "bank transfer";
//         payslip.remarks = remarks || "Bulk payment processed";

//         await payslip.save();

//         updatedPayslips.push({
//           id: payslip.id,
//           employee_name: payslip.employee?.name || "N/A",
//           salary_month: payslip.salary_month,
//           net_payble: netPayble,
//           status: "paid",
//           updated_at: paidAt,
//         });

//         console.log(`✅ Processed payslip for ${payslip.employee?.name || 'N/A'}: ₹${netPayble}`);
//       } catch (payslipError) {
//         console.error(`❌ Error processing payslip ${payslip.id}:`, payslipError);
//         // Continue with other payslips even if one fails
//       }
//     }

//     console.log('???? Total salary amount:', totalSalaryAmount);
//     console.log('???? Updated payslips count:', updatedPayslips.length);

//     // ✅ Step 4: Create descriptive message
//     const monthNames = [
//       "January", "February", "March", "April", "May", "June",
//       "July", "August", "September", "October", "November", "December"
//     ];
    
//     const [yearPart, monthPart] = salary_month.split('-');
//     const monthName = monthNames[parseInt(monthPart) - 1] || monthPart;
//     const formattedYear = yearPart;
    
//     const salaryDeductionDescription = `${monthName} ${formattedYear} salary of ₹${totalSalaryAmount.toLocaleString('en-IN')} deducted from total income`;

//     // ✅ Step 5: Return response (SAME format as other functions)
//     return res.status(200).json({
//       success: true,
//       message: `${updatedPayslips.length} payslips marked as paid successfully for ${salary_month}.`,
//       salary_deduction_info: {
//         month: `${monthName} ${formattedYear}`,
//         total_amount: totalSalaryAmount,
//         description: salaryDeductionDescription,
//         payslips_count: updatedPayslips.length,
//         salary_month: salary_month
//       },
//       data: updatedPayslips,
//       // 🟩 FIXED: Use the SAME user_access_info format as getAllPayslips
//       user_access_info: {
//         user_type: req.user.type,
//         company_id: companyId,
//         branch_access: targetBranchIds,
//         access_level: isSuper(req) ? 'super_admin' : (isCompany(req) || isAccountant) ? 'company_wide' : 'branch_limited',
//         eligible_employees: eligibleEmployees.length,
//         processed_payslips: updatedPayslips.length
//       }
//     });
//   } catch (error) {
//     console.error("❌ Bulk payment error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error during bulk payment.",
//       error: error.message,
//       stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
//     });
//   }
// };


