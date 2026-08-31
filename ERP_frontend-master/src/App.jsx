import "./css/app.css";
import "./css/style.css";
import "./css/main-style.css";
import "./css/date-rangepicker.css";
import "./css/responsive.css";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "bootstrap-icons/font/bootstrap-icons.css";

import LoginPage from "./features/auth/LoginPage";
import PrivateRoute from "./components/PrivateRoute";
import MainLayout from "./layouts/MainLayout";
import DashboardPage from "./features/dashboard/AccountingDashboard/DashboardPage";
import EmployeeList from "./features/hrm/employees/EmployeeList";
import EmployeeCreate from "./features/hrm/employees/EmployeeCreate";
import EmployeeEdit from "./features/hrm/employees/EmployeeEdit";
import EmployeeDetail from "./features/hrm/employees/EmployeeDetail";
import Profile from "./features/Profile";

import AttendanceList from "./features/hrm/attendance/AttendanceList";
import LeaveList from "./features/hrm/leave/LeaveList";
import Trainer from "./features/hrm/trainersetup/trainer";
import AwardList from "./features/hrm/hradminsetup/AwardList";
import TransferList from "./features/hrm/hradminsetup/TransferList";
import ResignationList from "./features/hrm/hradminsetup/ResignationList";
import PromotionList from "./features/hrm/hradminsetup/PromotionList";
import ComplaintList from "./features/hrm/hradminsetup/ComplaintList";
import WarningList from "./features/hrm/hradminsetup/WarningList";
import TerminationList from "./features/hrm/hradminsetup/TerminationList";
import AnnouncementList from "./features/hrm/hradminsetup/AnnouncementList";
import HolidaysList from "./features/hrm/hradminsetup/HolidaysList";
import TrainingList from "./features/hrm/trainersetup/TrainingList";
import SetSalaryList from "./features/hrm/payroll/setSalary/SetSalaryList";
import ViewSetSalary from "./features/hrm/payroll/setSalary/ViewSetSalary";

import UserList from "./features/users/UserList";
import RoleList from "./features/users/roles/RoleList";

import ManageMasterData from "./features/hrm/hrmsystemsetup/ManageMasterData";
import BranchList from "./features/hrm/hrmsystemsetup/BranchList";
import DepartmentList from "./features/hrm/hrmsystemsetup/DepartmentList";
import DesignationList from "./features/hrm/hrmsystemsetup/DesignationList";
import LeaveTypeList from "./features/hrm/hrmsystemsetup/LeaveTypeList";
import DocumentList from "./features/hrm/hrmsystemsetup/DocumentList";
import PayslipTypeList from "./features/hrm/hrmsystemsetup/PayslipTypeList";
import AllowanceTypeList from "./features/hrm/hrmsystemsetup/AllowanceTypeList";
import GoalTypeList from "./features/hrm/hrmsystemsetup/GoalTypeList";
import TrainingTypeList from "./features/hrm/hrmsystemsetup/TrainingTypeList";
import AwardTypeList from "./features/hrm/hrmsystemsetup/AwardTypeList";
import TerminationTypeList from "./features/hrm/hrmsystemsetup/TerminationTypeList";
import JobCategoryList from "./features/hrm/hrmsystemsetup/JobCategoryList";
import JobStageList from "./features/hrm/hrmsystemsetup/JobStageList";
import PerformanceTypeList from "./features/hrm/hrmsystemsetup/PerformanceTypeList";
import CompetencyList from "./features/hrm/hrmsystemsetup/CompetencyList";
import LoanOptionList from "./features/hrm/hrmsystemsetup/LoanOptionList";
import DeductionOptionList from "./features/hrm/hrmsystemsetup/DeductionOptionList";
import CustomQuestionList from "./features/hrm/recruitmentsetup/CustomQuestionList";
import JobCreate from "./features/hrm/recruitmentsetup/JobCreate";
import JobList from "./features/hrm/recruitmentsetup/JobList";
import JobEdit from "./features/hrm/recruitmentsetup/JobEdit";
import JobDetailsPage from "./features/hrm/recruitmentsetup/JobDetailsPage";
import CompanyPolicyList from "./features/hrm/CompanyPolicyList";
import AssetList from "./features/hrm/AssetList";
import EventList from "./features/hrm/EventList";
import IndicatorList from "./features/hrm/performancesetup/IndicatorList";
import AppraisalList from "./features/hrm/performancesetup/AppraisalList";
import GoalTrackingList from "./features/hrm/performancesetup/GoalTrackingList";
import MeetingList from "./features/hrm/MeetingList";
import CalendarPage from "./features/hrm/CalendarPage";
import DocumentSetup from "./features/hrm/DocumentSetup";
// import SkillsList from "./features/hrm/SkillsList";
import SkillsList from "./features/hrm/hrmsystemsetup/SkillsList";

import PermissionWith from "./hooks/PermissionWith";
import PermissionLoader from "./components/PermissionLoader";
import { FaRegistered } from "react-icons/fa";
import About from "./features/auth/About";
import TermAndCondition from "./features/auth/TermAndCondition";
import PrivacyPolicy from "./features/auth/PrivacyPolicy";
import Register from "./features/auth/RegisterPage";

// Accounting Imports Start
import AccountingLayout from "./features/Accounting/AccountingSetup/AccountingLayout";
import Taxes from "./features/Accounting/AccountingSetup/Taxes";
import Units from "./features/Accounting/AccountingSetup/Units";
import Category from "./features/Accounting/AccountingSetup/Category";
import PayslipPage from "./features/hrm/payroll/Payslip/PayslipPage";
import Assets from "./features/Assets System/assets";
import BranchWalletDetails from "./features/Accounting/Banking/BranchWalletDetails";
import PurchaseOrders from "./features/Accounting/Purchase Order/PurchaseOrders";
import WorkOrders from "./features/Accounting/Work Order/WorkOrders";
import SaleBills from "./features/Accounting/SaleBill/SaleBills";
import SaleInvoiceCreate from "./features/Accounting/SaleBill/SaleInvoiceCreate";
import SaleInvoiceEdit from "./features/Accounting/SaleBill/SaleInvoiceEdit";
import ProformaBills from "./features/Accounting/ProformaBill/ProformaBills";
import ExpensessCreate from "./features/Accounting/Expensess/ExpensessCreate";
import BranchWallet from "./features/Accounting/Banking/Branchwallet";
import Expenses from "./features/Accounting/Expensess/Expensess";
import ExpenseDetails from "./features/Accounting/Expensess/ExpensesDetails";
import FundRequestList from "./features/Accounting/Banking/FundRequestList";
import PaymentHead from "./features/Accounting/AccountingSetup/PaymentHead";
import WorkOrderDetails from "./features/Accounting/Work Order/WorkOrderDetails";
import AllBranchTransactions from "./features/Accounting/Banking/AllBranchTransactions";
import Income from "./features/Accounting/Income/Income";
import PurchaseOrderDetails from "./features/Accounting/Purchase Order/PurchaseOrderDetails";
import CreditPurchase from "./features/Accounting/Expensess/CreditPurchase";
import CreditPurchaseCreate from "./features/Accounting/Expensess/CreditPurchaseCreate";

import Product from "./features/Product/product";
import Stock from "./features/Product/stock";
import HrmDashbordPage from "./features/dashboard/HrmDashbordPage";
import TaxSummary1 from "./features/Report/AccountingReport/TaxSummary1";
import TaxSummary from "./features/Report/AccountingReport/Tax Summary/TaxSummary";
import InvoiceSummary from "./features/Report/AccountingReport/Invoice Summary/InvoiceSummary";
import ExpenseSummary from "./features/Report/AccountingReport/Expense Summary/ExpenseSummary";
import IncomeVsExpense from "./features/Report/AccountingReport/Income vs Expense/IncomeVsExpense";
import IncomeSummary from './features/Report/AccountingReport/Income Summary/IncomeSummary'
import PayrollReport from "./features/Report/HRM Report/PayRoll/PayrollReport";
import MonthlyAttendanceReport from "./features/Report/HRM Report/Attendance Report/Attendance";
import LeaveReport from "./features/Report/HRM Report/Leave Report/LeaveReport";
import HRAnalyticsReport from "./features/Report/HRM Report/Site Report/SiteReport";
// import BulkAttendanceForm from "./features/hrm/attendance/BulkAttendanceForm";

function App() {
  return (
    <PermissionLoader>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route path="/register" element={<Register />} />

        <Route
          path="/"
          element={
            <PrivateRoute>
              <MainLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="hrmdashboard" replace />} />

          <Route path="/profile" element={<Profile />} />

          {/* Dashboard */}
          {/* <Route
            path="dashboard"
            element={
              <PermissionWith permission="show hrm dashboard">
                <DashboardPage />
              </PermissionWith>
            }
          />
          <Route
            path="hrmdashboard"
            element={
              <PermissionWith permission="show hrm dashboard">
                <HrmDashbordPage />
              </PermissionWith>
            }
          /> */}

          {/* Dashboard Routes */}
          {/* ???? FIX: Each dashboard route checks its OWN specific permission */}
          <Route
            path="dashboard"
            element={
              <PermissionWith permission="show account dashboard">
                <DashboardPage />
              </PermissionWith>
            }
          />
          <Route
            path="hrmdashboard"
            element={
              <PermissionWith permission="show hrm dashboard">
                <HrmDashbordPage />
              </PermissionWith>
            }
          />
          <Route path="/aboutus" element={<About />} />
          <Route path="/terms_and_conditions" element={<TermAndCondition />} />
          <Route path="/Privacy_policy" element={<PrivacyPolicy />} />

          {/* Employees */}
          <Route
            path="employees"
            element={
              <PermissionWith permission="manage employee">
                <EmployeeList />
              </PermissionWith>
            }
          />

          <Route
            path="employees/create"
            element={
              <PermissionWith permission="create employee">
                <EmployeeCreate />
              </PermissionWith>
            }
          />

          <Route
            path="/employees/edit/:id"
            element={
              <PermissionWith permission="edit employee">
                <EmployeeEdit />
              </PermissionWith>
            }
          />

          <Route
            path="/employees/:id"
            element={
              <PermissionWith permission="view employee">
                <EmployeeDetail />
              </PermissionWith>
            }
          />

          {/* Attendance */}
          <Route
            path="/attendance"
            element={
              <PermissionWith permission="manage attendance">
                <AttendanceList />
              </PermissionWith>
            }
          />
          <Route
            path="/bulk-attendance"
            element={
              <PermissionWith permission="manage attendance">
                {/* <BulkAttendanceForm /> */}
              </PermissionWith>
            }
          />

          {/* Leaves */}
          <Route
            path="leaves"
            element={
              <PermissionWith permission="manage leave">
                <LeaveList />
              </PermissionWith>
            }
          />

          {/* Trainer */}
          <Route
            path="trainer"
            element={
              <PermissionWith permission="manage trainer">
                <Trainer />
              </PermissionWith>
            }
          />

          {/* Training */}
          <Route
            path="training"
            element={
              <PermissionWith permission="manage training">
                <TrainingList />
              </PermissionWith>
            }
          />

          {/* HR Admin Setup */}
          <Route
            path="hrm/hradminsetup/award"
            element={
              <PermissionWith permission="manage award">
                <AwardList />
              </PermissionWith>
            }
          />

          <Route
            path="hrm/hradminsetup/transfer"
            element={
              <PermissionWith permission="manage transfer">
                <TransferList />
              </PermissionWith>
            }
          />

          <Route
            path="hrm/hradminsetup/resignation"
            element={
              <PermissionWith permission="manage resignation">
                <ResignationList />
              </PermissionWith>
            }
          />

          <Route
            path="hrm/hradminsetup/promotion"
            element={
              <PermissionWith permission="manage promotion">
                <PromotionList />
              </PermissionWith>
            }
          />

          <Route
            path="hrm/hradminsetup/complaint"
            element={
              <PermissionWith permission="manage complaint">
                <ComplaintList />
              </PermissionWith>
            }
          />

          <Route
            path="hrm/hradminsetup/warning"
            element={
              <PermissionWith permission="manage warning">
                <WarningList />
              </PermissionWith>
            }
          />

          <Route
            path="hrm/hradminsetup/termination"
            element={
              <PermissionWith permission="manage termination">
                <TerminationList />
              </PermissionWith>
            }
          />

          <Route
            path="hrm/hradminsetup/announcement"
            element={
              <PermissionWith permission="manage announcement">
                <AnnouncementList />
              </PermissionWith>
            }
          />

          <Route
            path="hrm/hradminsetup/holidays"
            element={
              <PermissionWith permission="manage holiday">
                <HolidaysList />
              </PermissionWith>
            }
          />

          {/* Payroll */}
          <Route
            path="/payroll/set-salary"
            element={
              <PermissionWith permission="manage set salary">
                <SetSalaryList />
              </PermissionWith>
            }
          />

          <Route
            path="/payroll/set-salary/:id"
            element={
              <PermissionWith permission="edit set salary">
                <ViewSetSalary />
              </PermissionWith>
            }
          />
          <Route
            path="/payroll-setup/payslip"
            element={
              <PermissionWith permission="manage pay slip">
                <PayslipPage />
              </PermissionWith>
            }
          />
          {/* Custom Questions */}
          <Route
            path="/custom-questions"
            element={
              <PermissionWith permission="manage custom question">
                <CustomQuestionList />
              </PermissionWith>
            }
          />

          {/* Job */}
          <Route
            path="/job/create"
            element={
              <PermissionWith permission="create job">
                <JobCreate />
              </PermissionWith>
            }
          />

          <Route
            path="/recruitment/job"
            element={
              <PermissionWith permission="manage job">
                <JobList />
              </PermissionWith>
            }
          />

          <Route
            path="/recruitments/jobs/edit/:id"
            element={
              <PermissionWith permission="edit job">
                <JobEdit />
              </PermissionWith>
            }
          />

          <Route
            path="/recruitments/jobs/view/:id"
            element={
              <PermissionWith permission="show job">
                <JobDetailsPage />
              </PermissionWith>
            }
          />

          {/* Company Policy */}
          <Route
            path="/company-policy"
            element={
              <PermissionWith permission="manage company policy">
                <CompanyPolicyList />
              </PermissionWith>
            }
          />

          {/* Assets */}
          <Route
            path="/employee-assets"
            element={
              <PermissionWith permission="manage assets">
                <AssetList />
              </PermissionWith>
            }
          />

          {/* Events */}
          <Route
            path="/event"
            element={
              <PermissionWith permission="manage event">
                <EventList />
              </PermissionWith>
            }
          />

          {/* Performance */}
          <Route
            path="/indicator"
            element={
              <PermissionWith permission="manage indicator">
                <IndicatorList />
              </PermissionWith>
            }
          />

          <Route
            path="/appraisal"
            element={
              <PermissionWith permission="manage appraisal">
                <AppraisalList />
              </PermissionWith>
            }
          />

          <Route
            path="/goaltracking"
            element={
              <PermissionWith permission="manage goal tracking">
                <GoalTrackingList />
              </PermissionWith>
            }
          />

          {/* Meetings */}
          <Route
            path="/meeting"
            element={
              <PermissionWith permission="manage meeting">
                <MeetingList />
              </PermissionWith>
            }
          />

          <Route
            path="/meeting-calendar"
            element={
              <PermissionWith permission="view calendar">
                <CalendarPage />
              </PermissionWith>
            }
          />

          {/* Documents */}
          <Route
            path="/document-setup"
            element={
              <PermissionWith permission="manage document">
                <DocumentSetup />
              </PermissionWith>
            }
          />

          {/* Users */}
          <Route
            path="users"
            element={
              <PermissionWith permission="manage user">
                <UserList />
              </PermissionWith>
            }
          />

          <Route
            path="users/roles"
            element={
              <PermissionWith permission="manage role">
                <RoleList />
              </PermissionWith>
            }
          />

          {/* HRM System Setup */}
          <Route
            path="/hrmsystemsetup"
            element={
              <PermissionWith permission="manage branch">
                <ManageMasterData />
              </PermissionWith>
            }
          >
            <Route
              path="branch"
              element={
                <PermissionWith permission="manage branch">
                  <BranchList />
                </PermissionWith>
              }
            />
            <Route
              path="department"
              element={
                <PermissionWith permission="manage department">
                  <DepartmentList />
                </PermissionWith>
              }
            />
            <Route
              path="designation"
              element={
                <PermissionWith permission="manage designation">
                  <DesignationList />
                </PermissionWith>
              }
            />
            <Route
              path="leave-type"
              element={
                <PermissionWith permission="manage leave type">
                  <LeaveTypeList />
                </PermissionWith>
              }
            />
            <Route
              path="document-type"
              element={
                <PermissionWith permission="manage document type">
                  <DocumentList />
                </PermissionWith>
              }
            />
            <Route
              path="payslip-type"
              element={
                <PermissionWith permission="manage payslip type">
                  <PayslipTypeList />
                </PermissionWith>
              }
            />
            <Route
              path="allowance-option"
              element={
                <PermissionWith permission="manage allowance option">
                  <AllowanceTypeList />
                </PermissionWith>
              }
            />
            <Route
              path="goal-type"
              element={
                <PermissionWith permission="manage goal type">
                  <GoalTypeList />
                </PermissionWith>
              }
            />
            <Route
              path="training-type"
              element={
                <PermissionWith permission="manage training type">
                  <TrainingTypeList />
                </PermissionWith>
              }
            />
            <Route
              path="award-type"
              element={
                <PermissionWith permission="manage award type">
                  <AwardTypeList />
                </PermissionWith>
              }
            />
            <Route
              path="termination-type"
              element={
                <PermissionWith permission="manage termination type">
                  <TerminationTypeList />
                </PermissionWith>
              }
            />
            <Route
              path="job-category"
              element={
                <PermissionWith permission="manage job category">
                  <JobCategoryList />
                </PermissionWith>
              }
            />
            <Route
              path="job-stage"
              element={
                <PermissionWith permission="manage job stage">
                  <JobStageList />
                </PermissionWith>
              }
            />
            <Route
              path="performance-type"
              element={
                <PermissionWith permission="manage performance type">
                  <PerformanceTypeList />
                </PermissionWith>
              }
            />
            <Route
              path="competencies"
              element={
                <PermissionWith permission="Manage Competencies">
                  <CompetencyList />
                </PermissionWith>
              }
            />
            <Route
              path="loan-option"
              element={
                <PermissionWith permission="manage loan option">
                  <LoanOptionList />
                </PermissionWith>
              }
            />
            <Route
              path="deduction-option"
              element={
                <PermissionWith permission="manage deduction option">
                  <DeductionOptionList />
                </PermissionWith>
              }
            />

            <Route
              path="skills"
              element={
                // <PermissionWith permission="manage skills">
                  <SkillsList />
                // </PermissionWith>
              }
            />
          </Route>

          {/* Accouting Routes */}
          <Route path="accounting/branch-wallets" element={<BranchWallet />} />
          <Route
            path="accounting/branch-wallets/:branchId/transactions"
            element={<BranchWalletDetails />}
          />
          <Route
            path="/accounting/branch-wallets/all/details"
            element={<BranchWalletDetails fetchAllForManager={true} />}
          />
          <Route path="purchases/orders" element={<PurchaseOrders />} />
          <Route
            path="/purchase-orders/:id"
            element={<PurchaseOrderDetails />}
          />
          <Route path="works/orders" element={<WorkOrders />} />
          <Route path="works/orders/:id" element={<WorkOrderDetails />} />
          <Route
            path="works/salebills"
            element={
              <PermissionWith permission="manage sale bill">
                <SaleBills />
              </PermissionWith>
            }
          />
          <Route
            path="works/salebills/create"
            element={
              <PermissionWith permission="manage sale bill">
                <SaleInvoiceCreate />
              </PermissionWith>
            }
          />
          <Route
            path="works/salebills/edit/:id"
            element={
              <PermissionWith permission="manage sale bill">
                <SaleInvoiceEdit />
              </PermissionWith>
            }
          />
          <Route
            path="works/proformabills"
            element={
              <PermissionWith permission="manage proforma bill">
                <ProformaBills />
              </PermissionWith>
            }
          />
          <Route path="/accounting/expenses" element={<Expenses />} />
          <Route
            path="/accounting/expenses/:branchId/details"
            element={<ExpenseDetails />}
          />
          <Route
            path="accounting/expensess/create"
            element={<ExpensessCreate />}
          />
          <Route
            path="accounting/expensess/edit/:id"
            element={<ExpensessCreate />}
          />
          <Route
            path="accounting/expenses/edit/:id"
            element={<ExpensessCreate />}
          />
          <Route
            path="/accounting/expenses/all/details"
            element={<ExpenseDetails fetchAllForManager={true} />}
          />
          <Route path="/fund-requests" element={<FundRequestList />} />
          <Route
            path="/accounting/branch-wallets/transactions"
            element={<AllBranchTransactions />}
          />
          {/* <Route path="/reports/income-expense-summary" element={<TaxSummary1 />} /> */}
          <Route path="/reports/tax-summary" element={<TaxSummary />} />
          <Route path="/reports/invoice-summary" element={<InvoiceSummary />} />
          <Route path="/reports/Expense-summary" element={<ExpenseSummary />} />
          <Route path="/reports/income-summary" element={<IncomeSummary />} />
          <Route path="/reports/income-expense-summary" element={<IncomeVsExpense />} />
          <Route path="/reports/hrm-payroll" element={<PayrollReport />} />
          <Route path="/reports/hrm-attendance" element={<MonthlyAttendanceReport />} />
          <Route path="/reports/hrm-leave" element={<LeaveReport />} />
          <Route path="/reports/hrm-sites" element={<HRAnalyticsReport />} />
          <Route path="/accounting/income" element={<Income />} />
          <Route
            path="/accounting/expenses/credit-purchase"
            element={<CreditPurchase />}
          />
          <Route
            path="/accounting/expenses/credit-purchase/create"
            element={<CreditPurchaseCreate />}
          />
          <Route
            path="/accounting/expenses/credit-purchase/edit/:id"
            element={<CreditPurchaseCreate />}
          />
          <Route
            path="accounting/accountingsetup/"
            element={<AccountingLayout />}
          >
            <Route index element={<Taxes />} />
            <Route path="tax" element={<Taxes />} />
            <Route path="category" element={<Category />} />
            <Route path="units" element={<Units />} />
            <Route path="payment-head" element={<PaymentHead />} />
          </Route>

          <Route
            path="/assets"
            element={
              <PermissionWith permission="manage assets">
                <Assets />
              </PermissionWith>
            }
          />

          {/* Products System */}
          <Route
            path="products"
            element={
              // <PermissionWith permission="manage product & service">
              <Product />
              // </PermissionWith>
            }
          />
          <Route
            path="stock"
            element={
              // <PermissionWith permission="manage product & service">
              <Stock />
              // </PermissionWith>
            }
          />

       

          {/* Default redirect for root path */}
          <Route path="/" element={<Navigate to="/hrmsystemsetup/branch" />} />
        </Route>

        {/* 404 Route */}
        <Route path="*" element={<div>404 - Page not found</div>} />
      </Routes>
    </PermissionLoader>
  );
}

export default App;
