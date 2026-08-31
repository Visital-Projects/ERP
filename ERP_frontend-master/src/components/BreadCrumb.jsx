// import React from "react";
// import { ChevronRight, Home } from "lucide-react";
// import { Link } from "react-router-dom";
// import { Button } from "react-bootstrap";

// // Main Breadcrumb Component
// const BreadCrumb = ({ pathname, onNavigate }) => {
//   // Route mapping for better display names
//   const routeNames = {
//     // Main routes
//     "": "Dashboard",
//     employees: "Employees",
//     create: "Create Employee",
//     edit: "Edit Employee",
//     profile: "Profile",
//     attendance: "Attendance",
//     leaves: "Leave Management",
//     trainer: "Trainer",
//     training: "Training",

//     // HRM Admin Setup
//     hrm: "HRM",
//     hradminsetup: "HR Admin Setup",
//     award: "Award",
//     transfer: "Transfers",
//     resignation: "Resignations",
//     promotion: "Promotions",
//     complaint: "Complaints",
//     warning: "Warnings",
//     termination: "Terminations",
//     announcement: "Announcements",
//     holidays: "Holidays",

//     // Payroll
//     payroll: "Payroll",
//     "set-salary": "Set Salary",

//     // Recruitment
//     recruitment: "Recruitment",
//     recruitments: "Recruitments",
//     job: "Jobs",
//     jobs: "Jobs",
//     "custom-questions": "Custom Questions",

//     // Company
//     "company-policy": "Company Policy",
//     "employee-assets": "Employee Assets",
//     event: "Events",
//     indicator: "Indicators",
//     appraisal: "Appraisals",
//     goaltracking: "Goal Tracking",
//     meeting: "Meetings",
//     "meeting-calendar": "Meeting Calendar",
//     "document-setup": "Document Setup",

//     // Users & System
//     users: "Users",
//     roles: "Roles",
//     hrmsystemsetup: "HRM System Setup",

//     // Master Data
//     branch: "Branch",
//     department: "Department",
//     designation: "Designation",
//     "leave-type": "Leave Types",
//     "document-type": "Document Types",
//     "payslip-type": "Payslip Types",
//     "allowance-option": "Allowance Options",
//     "goal-type": "Goal Types",
//     "training-type": "Training Types",
//     "award-type": "Award Types",
//     "termination-type": "Termination Types",
//     "job-category": "Job Categories",
//     "job-stage": "Job Stages",
//     "performance-type": "Performance Types",
//     competencies: "Competencies",
//     "loan-option": "Loan Options",
//     "deduction-option": "Deduction Options",

//     // Actions
//     view: "View Details",
//   };

//   // Function to generate breadcrumb items
//   const generateBreadcrumbs = () => {
//     const pathnames = pathname.split("/").filter((x) => x);
//     const breadcrumbs = [];

//     // Add home/dashboard as first item
//     breadcrumbs.push({
//       name: "Dashboard",
//       path: "/",
//       isLast: pathnames.length === 0,
//     });

//     // Generate breadcrumbs from path segments
//     let currentPath = "";

//     pathnames.forEach((segment, index) => {
//       currentPath += `/${segment}`;

//       let displayName;

//       if (/^\d+$/.test(segment)) {
//         // Numeric ID ? map based on parent route
//         const parent = pathnames[index - 1];

//         if (parent === "set-salary") {
//           displayName = "Set Employee Salary";
//         } else if (parent === "employees") {
//           displayName = "Employee Details";
//         } else {
//           displayName = `ID: ${segment}`; // fallback}
//         }
//       } else {
//         displayName =
//           routeNames[segment] ||
//           segment.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
//       }

//       breadcrumbs.push({
//         name: displayName,
//         path: currentPath,
//         isLast: index === pathnames.length - 1,
//       });
//     });

//     return breadcrumbs;
//   };

//   const breadcrumbs = generateBreadcrumbs();

//   return (
//     <small
//     // className="flex items-center space-x-2 text-sm text-gray-600 mb-6 bg-white p-3 rounded-lg shadow-sm border"
//     >
//       {breadcrumbs.map((breadcrumb, index) => (
//         <React.Fragment key={breadcrumb.path}>
//           {index > 0 && (
//             <ChevronRight
//               className="text-success"
//               size={14}
//               strokeWidth={1.5}
//             />
//           )}

//           {breadcrumb.isLast ? (
//             <span className="text-success">{breadcrumb.name}</span>
//           ) : (
//             <Link
//               to={breadcrumb.path}
//               // onClick={() => onNavigate(breadcrumb.path)}
//               // className="hover:text-blue-600 transition-colors duration-200 cursor-pointer text-left"
//               className="text-success cursor-pointer"
//             >
//               {breadcrumb.name}
//             </Link>
//           )}
//         </React.Fragment>
//       ))}
//     </small>
//   );
// };

// export default BreadCrumb;





// import React from "react";
// import { ChevronRight, Home } from "lucide-react";
// import { Link } from "react-router-dom";
// import { Button } from "react-bootstrap";
// import { isValidPath } from "../utils/isValidPath";

// // Main Breadcrumb Component
// const BreadCrumb = ({ pathname, onNavigate, lastLabel, dynamicNames   }) => {
//   // Route mapping for better display names
//   const routeNames = {
//     // Main routes
//     "": "Dashboard",
//     employees: "Employees",
//     create: "Create Employee",
//     edit: "Edit Employee",
//     profile: "Profile",
//     attendance: "Attendance",
//     leaves: "Leave Management",
//     trainer: "Trainer",
//     training: "Training",

//     // HRM Admin Setup
//     hrm: "HRM",
//     hradminsetup: "HR Admin Setup",
//     award: "Award",
//     transfer: "Transfers",
//     resignation: "Resignations",
//     promotion: "Promotions",
//     complaint: "Complaints",
//     warning: "Warnings",
//     termination: "Terminations",
//     announcement: "Announcements",
//     holidays: "Holidays",

//     // Payroll
//     payroll: "Payroll",
//     "set-salary": "Set Salary",

//     // Recruitment
//     recruitment: "Recruitment",
//     recruitments: "Recruitments",
//     job: "Jobs",
//     jobs: "Jobs",
//     "custom-questions": "Custom Questions",

//     // Company
//     "company-policy": "Company Policy",
//     "employee-assets": "Employee Assets",
//     event: "Events",
//     indicator: "Indicators",
//     appraisal: "Appraisals",
//     goaltracking: "Goal Tracking",
//     meeting: "Meetings",
//     "meeting-calendar": "Meeting Calendar",
//     "document-setup": "Document Setup",

//     // Users & System
//     users: "Users",
//     roles: "Roles",
//     hrmsystemsetup: "HRM System Setup",

//     // Master Data
//     branch: "Branch",
//     department: "Department",
//     designation: "Designation",
//     "leave-type": "Leave Types",
//     "document-type": "Document Types",
//     "payslip-type": "Payslip Types",
//     "allowance-option": "Allowance Options",
//     "goal-type": "Goal Types",
//     "training-type": "Training Types",
//     "award-type": "Award Types",
//     "termination-type": "Termination Types",
//     "job-category": "Job Categories",
//     "job-stage": "Job Stages",
//     "performance-type": "Performance Types",
//     competencies: "Competencies",
//     "loan-option": "Loan Options",
//     "deduction-option": "Deduction Options",

//     // Actions
//     view: "View Details",
//     branchWallets: "Branch Wallets",
// transactions: "Transactions",
// expenses: "Expenses",          // list page
// expensess: "Create Expense",   // create page
// details: "Details",  
//   };

//   // Function to generate breadcrumb items
//   const generateBreadcrumbs = () => {
//     const pathnames = pathname.split("/").filter((x) => x);
//     const breadcrumbs = [];

//     // Add home/dashboard as first item
//     breadcrumbs.push({
//       name: "Dashboard",
//       path: "/",
//       isLast: pathnames.length === 0,
//     });

//     // Generate breadcrumbs from path segments
//     let currentPath = "";

//     pathnames.forEach((segment, index) => {
//       currentPath += `/${segment}`;

//       let displayName;
// if (/^\d+$/.test(segment)) {
//   // Use dynamicNames if provided
//   if (dynamicNames && dynamicNames[segment]) {
//     displayName = dynamicNames[segment];
//   } else {
//     const parent = pathnames[index - 1];
//     if (parent === "set-salary") displayName = "Set Employee Salary";
//     else if (parent === "employees") displayName = "Employee Details";
//     else if (parent === "expenses") displayName = "Expense Details"; // fallback for expenses
//     else displayName = `ID: ${segment}`;
//   }
// } else {
//   displayName =
//     routeNames[segment] ||
//     segment.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
// }


//       // breadcrumbs.push({
//       //   name: displayName,
//       //   path: currentPath,
//       //   isLast: index === pathnames.length - 1,
//       // });
//       if (isValidPath(currentPath) || index === pathnames.length - 1) {
//   breadcrumbs.push({
//     name: displayName,
//     path: currentPath,
//     isLast: index === pathnames.length - 1,
//   });
// }
//     });

//     return breadcrumbs;
//   };

// const breadcrumbs = generateBreadcrumbs();

// if (lastLabel && breadcrumbs.length > 0) {
//   breadcrumbs[breadcrumbs.length - 1].name = lastLabel;
// }

//   return (
//     <small
//     // className="flex items-center space-x-2 text-sm text-gray-600 mb-6 bg-white p-3 rounded-lg shadow-sm border"
//     >
//       {breadcrumbs.map((breadcrumb, index) => (
//         <React.Fragment key={breadcrumb.path}>
//           {index > 0 && (
//             <ChevronRight
//               className="text-success"
//               size={14}
//               strokeWidth={1.5}
//             />
//           )}

//           {breadcrumb.isLast ? (
//             <span className="text-success">{breadcrumb.name}</span>
//           ) : (
//             <Link
//               to={breadcrumb.path}
//               // onClick={() => onNavigate(breadcrumb.path)}
//               // className="hover:text-blue-600 transition-colors duration-200 cursor-pointer text-left"
//               className="text-success cursor-pointer"
//             >
//               {breadcrumb.name}
//             </Link>
//           )}
//         </React.Fragment>
//       ))}
//     </small>
//   );
// };

// export default BreadCrumb;







import React from "react";
import { ChevronRight, Home } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "react-bootstrap";
import { isValidPath } from "../utils/isValidPath";

// Main Breadcrumb Component
const BreadCrumb = ({ pathname, onNavigate, lastLabel, dynamicNames   }) => {
  // Route mapping for better display names
  const routeNames = {
    // Main routes
    "": "Dashboard",
    employees: "Employees",
    create: "Create Employee",
    edit: "Edit Employee",
    profile: "Profile",
    attendance: "Attendance",
    leaves: "Leave Management",
    trainer: "Trainer",
    training: "Training",

    // HRM Admin Setup
    hrm: "HRM",
    hradminsetup: "HR Admin Setup",
    award: "Award",
    transfer: "Transfers",
    resignation: "Resignations",
    promotion: "Promotions",
    complaint: "Complaints",
    warning: "Warnings",
    termination: "Terminations",
    announcement: "Announcements",
    holidays: "Holidays",

    // Payroll
    payroll: "Payroll",
    "set-salary": "Set Salary",

    // Recruitment
    recruitment: "Recruitment",
    recruitments: "Recruitments",
    job: "Jobs",
    jobs: "Jobs",
    "custom-questions": "Custom Questions",

    // Company
    "company-policy": "Company Policy",
    "employee-assets": "Employee Assets",
    event: "Events",
    indicator: "Indicators",
    appraisal: "Appraisals",
    goaltracking: "Goal Tracking",
    meeting: "Meetings",
    "meeting-calendar": "Meeting Calendar",
    "document-setup": "Document Setup",

    // Users & System
    users: "Users",
    roles: "Roles",
    hrmsystemsetup: "HRM System Setup",

    // Master Data
    branch: "Site",
    department: "Department",
    designation: "Designation",
    "leave-type": "Leave Types",
    "document-type": "Document Types",
    "payslip-type": "Payslip Types",
    "allowance-option": "Allowance Options",
    "goal-type": "Goal Types",
    "training-type": "Training Types",
    "award-type": "Award Types",
    "termination-type": "Termination Types",
    "job-category": "Job Categories",
    "job-stage": "Job Stages",
    "performance-type": "Performance Types",
    competencies: "Competencies",
    "loan-option": "Loan Options",
    "deduction-option": "Deduction Options",

    // Actions
    view: "View Details",
    branchWallets: "Branch Wallets",
transactions: "Transactions",
expenses: "Expenses",          // list page
expensess: "Create Expense",   // create page
details: "Details",  
  };

  // Function to generate breadcrumb items
  const generateBreadcrumbs = () => {
    const pathnames = (pathname || "").split("/").filter((x) => x);
    const breadcrumbs = [];

    // Add home/dashboard as first item
    breadcrumbs.push({
      name: "Dashboard",
      path: "/",
      isLast: pathnames.length === 0,
    });

    // Generate breadcrumbs from path segments
    let currentPath = "";

    pathnames.forEach((segment, index) => {
      currentPath += `/${segment}`;

      let displayName;
if (/^\d+$/.test(segment)) {
  // Use dynamicNames if provided
  if (dynamicNames && dynamicNames[segment]) {
    displayName = dynamicNames[segment];
  } else {
    const parent = pathnames[index - 1];
    if (parent === "set-salary") displayName = "Set Employee Salary";
    else if (parent === "employees") displayName = "Employee Details";
    else if (parent === "expenses") displayName = "Expense Details"; // fallback for expenses
    else displayName = `ID: ${segment}`;
  }
} else {
  displayName =
    routeNames[segment] ||
    segment.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}


      // breadcrumbs.push({
      //   name: displayName,
      //   path: currentPath,
      //   isLast: index === pathnames.length - 1,
      // });
      if (isValidPath(currentPath) || index === pathnames.length - 1) {
  breadcrumbs.push({
    name: displayName,
    path: currentPath,
    isLast: index === pathnames.length - 1,
  });
}
    });

    return breadcrumbs;
  };

const breadcrumbs = generateBreadcrumbs();

if (lastLabel && breadcrumbs.length > 0) {
  breadcrumbs[breadcrumbs.length - 1].name = lastLabel;
}

  return (
    <small
    // className="flex items-center space-x-2 text-sm text-gray-600 mb-6 bg-white p-3 rounded-lg shadow-sm border"
    >
      {breadcrumbs.map((breadcrumb, index) => (
        <React.Fragment key={breadcrumb.path}>
          {index > 0 && (
            <ChevronRight
              className="text-success"
              size={14}
              strokeWidth={1.5}
            />
          )}

          {breadcrumb.isLast ? (
            <span className="text-success">{breadcrumb.name}</span>
          ) : (
            <Link
              to={breadcrumb.path}
              // onClick={() => onNavigate(breadcrumb.path)}
              // className="hover:text-blue-600 transition-colors duration-200 cursor-pointer text-left"
              className="text-success cursor-pointer"
            >
              {breadcrumb.name}
            </Link>
          )}
        </React.Fragment>
      ))}
    </small>
  );
};

export default BreadCrumb;

