// src/pages/ManageMasterData.jsx
import React from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";

import BreadCrumb from "../../../components/BreadCrumb";

const tabs = [
  { path: "branch", label: "Site" },
  { path: "department", label: "Department" },
  { path: "designation", label: "Designation" },
  { path: "leave-type", label: "Leave Type" },
  { path: "document-type", label: "Document Type" },
  { path: "payslip-type", label: "Payslip Type" },
  { path: "loan-option", label: "Loan Option" },
  { path: "deduction-option", label: "Deduction Option" },
  // { path: "goal-type", label: "Goal Type" },
  // { path: "training-type", label: "Training Type" },
  { path: "award-type", label: "Award Type" },
  { path: "termination-type", label: "Termination Type" },
  { path: "allowance-option", label: "Allowance Option" },
  { path: "skills", label: "Skills" },

  // { path: "job-category", label: "Job Category" },
  // { path: "job-stage", label: "Job Stage" },
  // { path: "performance-type", label: "Performance Type" },
  // { path: "competencies", label: "Competencies" },
];

const ManageMasterData = () => {
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <div className="container mt-4">
      <h4 className="fw-bold">Manage Master Data</h4>
      {/* <p className="text-success small mb-3">Dashboard &gt; System Setup</p> */}
      <div className="pb-1">
        <BreadCrumb pathname={location.pathname} onNavigate={navigate} />
      </div>
      <div className="d-flex flex-wrap gap-2 mb-4 bg-white rounded-2 shadow-sm p-3">
        {tabs.map((tab) => (
          <NavLink
            key={tab.path}
            to={tab.path}
            className={({ isActive }) =>
              `btn btn-outline-success ${isActive ? "active" : ""}`
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </div>

      <Outlet />
    </div>
  );
};

export default ManageMasterData;
