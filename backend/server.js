
require('dotenv').config();

// Load core modules
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Load Cron AFTER app setup
require("./cron/autoAbsent.cron");




// ================= MODEL IMPORTS =================
const SaleBill = require("./models/saleBill.model");
const SaleBillPayment = require("./models/saleBillPayment.model");
const Branch = require("./models/branch.model");
const User = require('./models/user.model');
const auth = require('./middlewares/auth.middleware');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/users.routes');
const profileRoutes = require('./routes/profile');
const employeeRoutes = require('./routes/employee.routes');
const designationRoutes = require('./routes/designation.routes');
const attendanceRoutes = require('./routes/attendance.routes');
const leaveRoutes = require('./routes/leave.routes');

const appraisalRoutes = require('./routes/appraisal.routes');
const permissionRoutes = require('./routes/permission.routes');
const roleUserRoutes = require('./routes/role.routes');
const branchRoutes = require('./routes/branch.routes');
const departmentRoutes = require('./routes/department.routes');
const salaryRoutes = require('./routes/employeeSalary.routes');
const allowanceRoutes = require('./routes/allowance.routes');

const saturationDeductionRoutes = require('./routes/saturationDeduction.routes');
const otherPaymentRoutes = require('./routes/otherPayment.routes');
const companyContributionRoutes = require('./routes/companyContribution.routes');
const trainerRoutes = require('./routes/trainer.routes');
const trainingRoutes = require('./routes/training.routes');
const trainingTypeRoutes = require('./routes/trainingType.routes');
const eventRoutes = require('./routes/event.routes');
const setSalaryRoutes = require('./routes/setSalary.routes');


const journalEntryRoutes = require('./routes/journalEntry.routes');

const leaveTypeRoutes = require('./routes/leave_type.routes');
const holidayRoutes = require('./routes/holiday.routes');
const announcementRoutes = require('./routes/announcement.routes');
// const announcement_employeeRoutes = require('./routes/announcement_employee.routes');
const award_typeRoutes = require('./routes/award_type.routes');
const awardRoutes = require('./routes/award.routes');
const documentRoutes = require('./routes/document.routes');
const document_employeeRoutes = require('./routes/employee_document.routes');
const transferRoutes = require('./routes/transfer.routes');
const bankTransferRoutes = require('./routes/bank_transfer.routes');
const resignationRoutes = require('./routes/resignation.routes');
const promotionRoutes = require('./routes/promotion.routes');
const complaintRoutes = require('./routes/complaint.routes');
const terminationTypeRoutes = require('./routes/termination_type.routes');
const terminationRoues = require('./routes/termination.routes');
const warningRoutes = require('./routes/warning.routes');
//Performance setup
const competenciesRoutes = require('./routes/competency.routes');

const GoalType = require('./models/goal_type.model');
const clientRoutes = require('./routes/client.routes');
const unitRoutes = require('./routes/unit.routes');
const Category = require('./models/category.model'); 
const stockReportRoutes = require('./routes/stockReport.routes'); // ✅ Fixed path
const payslipTypeRoutes = require('./routes/payslipType.routes');
const allowanceOptionRoutes = require('./routes/allowanceOption.routes');
//tax
const taxRoutes = require('./routes/tax.routes');
const chartOfAccountTypeRoutes = require('./routes/chart_of_account_type.routes');

const aboutus = require('./routes/aboutus.routes');
const privacypolicy = require('./routes/privacyPolicy.routes');
const terms = require('./routes/terms.routes');
const homescreen = require('./routes/homescreen.routes');
const accounts = require('./routes/accounts.routes');

const productRoutes = require('./routes/product.routes');
const productStockRoutes = require("./routes/productstock.routes");

const revenueRoutes = require('./routes/revenue.routes');

const venderRoutes = require("./routes/vender.routes");

const billRoutes = require("./routes/bill.routes");

const expenseRoutes = require("./routes/expense.routes");

const otPaymentRoutes = require("./routes/otPayment.routes");

const grossSalaryRoutes = require("./routes/grossSalary.routes");

const saleBillRoutes = require("./routes/saleBill.routes");

const proformaBillRoutes = require("./routes/proformaBill.routes");

const saleBillPaymentRoutes = require("./routes/saleBillPayment.routes")

const proformaBillPaymentRoutes = require("./routes/proformaBillPayment.routes")



app.use(cors({
origin: '*', // allow your React app's URL
// origin: 'http://localhost:5173', // allow your React app's URL
credentials: true // if you're sending cookies or HTTP auth
}))


//upload company policy
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use("/reports", express.static(path.join(__dirname, "public/reports")));
app.use("/excel", express.static(path.join(__dirname, "excel")));
app.use("/invoices", express.static(path.join(__dirname,"invoices")));

// Middleware
app.use(express.json());



// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/designations', designationRoutes);
app.use('/api/attendances', attendanceRoutes);
app.use("/api/shifts",require('./routes/shift.routes'));
app.use('/api/leaves', leaveRoutes);
app.use('/api/holidays', require('./routes/holiday.routes'));
app.use('/api/payslips', require('./routes/payslip.routes'));
app.use('/api/announcements', require('./routes/announcement.routes'));
app.use('/api/documents', require('./routes/document.routes'));
app.use('/api/travels', require('./routes/travel.routes'));

app.use('/api/permissions', permissionRoutes);
app.use('/api/roleusers', roleUserRoutes);
app.use('/api/branches', branchRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/saturation-deductions', saturationDeductionRoutes);
app.use('/api/other-payments', otherPaymentRoutes);
app.use('/api/overtimes', require('./routes/overtime.routes'));
app.use('/api/company-contributions', companyContributionRoutes);
app.use('/api/payslips', require('./routes/payslip.routes'));
app.use('/api/trainers', trainerRoutes);
app.use('/api/trainings', trainingRoutes);
app.use('/api/training-types', trainingTypeRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/company-policies', require('./routes/companyPolicy.routes'));
app.use('/api/salaries', salaryRoutes);
app.use('/api/allowances', allowanceRoutes);
app.use('/api/commissions', require('./routes/commission.routes'));
app.use('/api/loans', require('./routes/loan.routes'));
app.use('/api/saturation-deductions', saturationDeductionRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/leave-types', leaveTypeRoutes);
app.use('/api/attendance', require('./routes/attendance.routes'));


// ✅ Biometric Attendance (NO AUTH)
app.use('/api', require('./routes/biometricAttendance.routes'));

app.use('/api/holidays', holidayRoutes);
// app.use('/api/announcements', announcementRoutes);
// app.use('/api/announcement-employees', announcement_employeeRoutes);
app.use('/api/award-types', award_typeRoutes);
app.use('/api/awards', awardRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/employee-documents', document_employeeRoutes);
app.use('/api/transfers', transferRoutes);
app.use('/api/bank-accounts',require('./routes/bank_account.routes'));
app.use('/api/bank-transfers', bankTransferRoutes);
app.use('/api/resignations', resignationRoutes);
app.use('/api/promotions', promotionRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/termination-types', terminationTypeRoutes);
app.use('/api/terminations', terminationRoues);
app.use('/api/warnings', warningRoutes);
app.use('/api/clients', clientRoutes); 
app.use('/api/units', unitRoutes); 
app.use('/api/categories', require('./routes/category.routes')); 
app.use('/api/stock-reports', stockReportRoutes); 
app.use('/api/set-salary', setSalaryRoutes);
app.use('/api/payslip-types', payslipTypeRoutes);
app.use('/api/allowance-options', allowanceOptionRoutes);
//Recruitment
app.use('/api/jobs', require('./routes/job.routes'));
app.use('/api/job-categories', require('./routes/job_category.routes'));
app.use('/api/job-stages', require('./routes/job_stage.routes'));
app.use('/api/job-applications', require('./routes/job_application.routes'));
app.use('/api/job-application-notes', require('./routes/job_application_note.routes'));
app.use('/api/job-onboards', require('./routes/job_onboard.routes'));
// Performance Setup
app.use('/api/indicators', require('./routes/indicator.routes'));
app.use('/api/appraisals', require('./routes/appraisal.routes'));
app.use('/api/goal-types', require('./routes/goal_type.routes'));
app.use('/api/goal-trackings', require('./routes/goalTracking.routes'));
app.use('/api/performance-types', require('./routes/performanceType.routes'));
app.use('/api/competencies', competenciesRoutes);
//custom question
app.use('/api/custom-questions', require('./routes/custom_question.routes'));
//loan option
app.use('/api/loan-options', require('./routes/loanOption.routes'));
//deduction option
app.use('/api/deduction-options', require('./routes/deductionOption.routes'));
//Meeting Setup
app.use('/api/meetings', require('./routes/meeting.routes'));
//Assets
app.use('/api/assets', require('./routes/asset.routes'));
// document setup by roles
app.use('/api/document-uploads', require('./routes/document_upload.routes'));
//tax
app.use('/api/taxes', taxRoutes); 
app.use('/api/chart-of-account-types', chartOfAccountTypeRoutes);
app.use('/api/chart-of-account-sub-types',require('./routes/chart_of_account_sub_type.routes'));
app.use('/api/chart-of-account',require('./routes/chart_of_account.routes'));
app.use('/api/chart-of-account-parent',require('./routes/chart_of_account_parent.routes'));

app.use("/api/expenses", require("./routes/expenseReportRoutes"));
app.use('/api/aboutus', aboutus);
app.use('/api/privacypolicy', privacypolicy);
app.use('/api/terms', terms);
app.use('/api/homescreen', homescreen);
app.use('/api/accounts', accounts)


// Accounting api

app.use('/api/job-modes', require('./routes/job_mode.routes'));
app.use('/api/plants', require('./routes/plant_name.routes'));
app.use('/api/contract-periods', require('./routes/contract_period.routes'));

app.use('/api/base-amounts', require('./routes/base_amount.routes'));
app.use("/api/payments-received", require('./routes/payment_received.routes'));
app.use("/api/deductions", require('./routes/deductionPaymentDone.routes'));
app.use("/api",require('./routes/report.routes'));
app.use("/api",require('./routes/generateReport.routes'));

app.use('/api/reports', require('./routes/reportPlant.routes'));
// app.use('/api/manpower-salaries', require('./routes/manpowerSalary.routes'));
app.use('/api/working-zones', require('./routes/workingZone.routes'));
app.use('/api/vendor-names', require('./routes/vendorName.routes'));
app.use('/api/bill-paid', require('./routes/bill_paid.routes'));
app.use('/api/branch-wallets',require('./routes/branchWallet.routes'));
app.use('/api/purchase-orders',require('./routes/purchase_order.routes'));
app.use('/api/work-orders',require('./routes/workOrder.routes'));
app.use('/api/fund-request',require('./routes/branchFundRequest.routes'));
app.use('/api/work-order-invoices',require('./routes/work_order_invoice.routes'));
app.use('/api/expense-category',require('./routes/expenseCategory.routes'));
app.use('/api/purchase-order-invoices',require('./routes/purchaseOrderInvoice.routes'));
app.use('/api/income',require('./routes/income.routes'));
app.use('/api/credit-purchase',require('./routes/creditPurchase.routes'));
//manpower salary report plant wise monthly
app.use('/api/reports/manpower-salary', require('./routes/manpowerSalary.routes'));
app.use('/api',require('./routes/report_payment'));
app.use('/api/invoices/raise',require('./routes/invoice_wo_po.routes'));

// app.use('/api/journalEntry', journalEntryRoutes);

app.use('/api/revenues', revenueRoutes);

app.use('/api/venders', venderRoutes);

app.use("/api/bills", billRoutes);

app.use("/api/expense", expenseRoutes);

//invoice api
app.use("/api/customers", require('./routes/customer.routes'));
app.use("/api/invoices", require('./routes/invoice.routes'));
app.use("/api/invoice-items", require('./routes/invoiceItem.routes'));
app.use("/api/taxes", require('./routes/invoiceTax.routes'));


app.use('/api/products', productRoutes); 
app.use("/api/productstock", productStockRoutes);
app.use('/api/skills',require('./routes/skill.routes'));


//   mobileauth
app.use("/api/auth",require('./routes/auth.mobile.routes'))

app.use("/api/excel", require("./routes/excel.routes"));

app.use("/api/otPayment", require("./routes/otPayment.routes"));

app.use("/api/grossSalary", require("./routes/grossSalary.routes"));

app.use("/api/salebill" , require("./routes/saleBill.routes"));

app.use("/api/proformabill" , require("./routes/proformaBill.routes"));

app.use(
  "/api/sale-bill-payments",
  require("./routes/saleBillPayment.routes")
);
app.use(
  "/api/profo-bill-payments",
  require("./routes/proformaBillPayment.routes")
);


// ================= RUN ASSOCIATIONS =================
const models = {
  SaleBill,
  SaleBillPayment,
  Branch,
};

Object.values(models).forEach((model) => {
  if (model.associate) {
    model.associate(models);
  }
});

// ✅ Start the server
const PORT = process.env.PORT || 3306;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});


