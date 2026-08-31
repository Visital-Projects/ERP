// src/utils/validRoutes.js
export const validPaths = new Set([
  "/",
  "/dashboard",
  "/profile",

  // Employees
  "/employees",
  "/employees/create",
  "/employees/edit/:id",
  "/employees/:id",

  // Attendance & Leave
  "/attendance",
  "/leaves",

  // Trainer & Training
  "/trainer",
  "/training",

  // Payroll
  "/payroll/set-salary",
  "/payroll/set-salary/:id",
  "/payroll-setup/payslip",

  // Jobs
  "/job/create",
  "/recruitment/job",
  "/recruitments/jobs/edit/:id",
  "/recruitments/jobs/view/:id",

  // Company policy, assets, events
  "/company-policy",
  "/employee-assets",
  "/event",

  // Performance
  "/indicator",
  "/appraisal",
  "/goaltracking",

  // Meeting
  "/meeting",
  "/meeting-calendar",

  // Document setup
  "/document-setup",

  // Users & Roles
  "/users",
  "/users/roles",

  // HRM Setup
  "/hrmsystemsetup/branch",
  "/hrmsystemsetup/department",
  "/hrmsystemsetup/designation",
  "/hrmsystemsetup/leave-type",
  "/hrmsystemsetup/document-type",
  "/hrmsystemsetup/payslip-type",
  "/hrmsystemsetup/allowance-option",
  "/hrmsystemsetup/goal-type",
  "/hrmsystemsetup/training-type",
  "/hrmsystemsetup/award-type",
  "/hrmsystemsetup/termination-type",
  "/hrmsystemsetup/job-category",
  "/hrmsystemsetup/job-stage",
  "/hrmsystemsetup/performance-type",
  "/hrmsystemsetup/competencies",
  "/hrmsystemsetup/loan-option",
  "/hrmsystemsetup/deduction-option",

  // Accounting
  "/accounting/account",
  "/accounting/transfer",
  "/accounting/customer",
  "/sales/customers",
  "/customers/:id",
  "/sales/items",
  "/sales/invoices",
  "/sales/invoices/:id",
  "/sales/revenues",
  "/purchases/suppliers",
  "/suppliers/:id",
  "/accounting/bills",
  "/accounting/accountingsetup/tax",
  "/accounting/accountingsetup/category",
  "/accounting/accountingsetup/units",
  "/double-entry/chart-of-accounts",
  "/double-entry/journal-account",
  "/double-entry/journal/create",
  "/double-entry/Ledger-summary",
  "/accounting/vendors",
  "/accounting/work-zones",
  "/accounting/manpower",
  "/assets",
"/accounting/wallet",
"/accounting/branch-wallets",
"/accounting/branch-wallets/:branchId/transactions",
"/accounting/expenses",
"/accounting/expenses/:branchId/details",
"/accounting/branch-wallets/transactions",
]);
