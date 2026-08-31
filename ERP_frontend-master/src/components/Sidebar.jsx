import React, { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  FaTachometerAlt,
  FaUserCog,
  FaUserTie,
  FaChevronDown,
  FaChevronRight,
  FaBalanceScale,
  FaBriefcase,
  FaBell,
  FaSlidersH,
  FaTimes,
  FaTools,
  FaWarehouse,
  FaChartBar,
  FaBars,
} from "react-icons/fa";
import PermissionWith from "../hooks/PermissionWith";
import "./Sidebar.css";
import axios from "axios";
import { useSelector } from "react-redux";

const Sidebar = ({ isOpen, isCollapsed, toggleCollapse, openMenus, toggleMenu, onClose }) => {
  const [images, setImages] = useState(null);
  const BASE_URL = import.meta.env.VITE_BASE_URL;
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const { data } = await axios.get(`${BASE_URL}/api/homescreen`);
        if (data.success) {
          setImages(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch home images:", err);
      }
    };
    fetchImages();
  }, [BASE_URL]);
  const location = useLocation();
  const isActive = (path) => location.pathname.includes(path);
  const { user } = useSelector((state) => state.auth);

  return (
    <>
      <aside className={`sidebar ${isOpen ? "open" : ""} ${isCollapsed ? "collapsed" : ""}`}>
        <div
          className="sidebar-header d-flex justify-content-between align-items-center sticky-top bg-white"
          style={{
            top: 0,
            zIndex: 1020, // stays above other sidebar content
            borderBottom: "1px solid #ddd",
            padding: "20px",
          }}
        >
          <div
            className="logo"
            style={{ display: "flex", alignItems: "center" }}
          >
            {!isCollapsed && (
              <>
                <img
                  src="/Erpfavico.jpg"
                  alt="VEW"
                  style={{ width: "50px", marginRight: "10px", marginTop: "-5px", transition: "all 0.3s ease" }}
                />
                <h2 style={{ margin: "-3PX ", marginLeft: "10PX" }}>VEW</h2>
              </>
            )}
          </div>
          
          <div className="d-flex align-items-center">
            {/* Collapse Toggle Button (Desktop) */}
            <button 
              className="btn btn-sm btn-light border d-none d-lg-block" 
              onClick={toggleCollapse}
              style={{ marginLeft: isCollapsed ? "0" : "10px" }}
            >
              <FaBars />
            </button>
            
            {/* Close Button (Mobile) */}
            <button className="btn btn-light border d-lg-none" onClick={onClose}>
              <FaTimes />
            </button>
          </div>
        </div>

        <nav className="sidebar-nav">
          {/* Dashboard */}
          <PermissionWith
            permission={["show hrm dashboard", "show account dashboard"]}
          >
            <div className="menu-group">
              <div
                className={`menu-item ${openMenus.dashboard ? "selected" : ""}`}
                onClick={() => isCollapsed ? toggleCollapse() : toggleMenu("dashboard")}
                title={isCollapsed ? "Dashboard" : ""}
              >
                <div className="menu-item-content">
                  <div className="menu-item-icon-parent">
                    <FaTachometerAlt className="menu-item-icon" />
                  </div>
                  {!isCollapsed && <span className="menu-item-text">Dashboard</span>}
                </div>
                {!isCollapsed && (
                  <span className="arrow-icon">
                    {openMenus.dashboard ? <FaChevronDown /> : <FaChevronRight />}
                  </span>
                )}
              </div>

              {openMenus.dashboard && !isCollapsed && (
                <div className="submenu">
                  {/* ???? UPDATED: Show HRM Dashboard ONLY if user has HRM dashboard permission */}
                  <PermissionWith permission="show hrm dashboard">
                    <NavLink
                      to="/hrmdashboard"
                      className={`submenu-item ${
                        isActive("/hrmdashboard") ? "active" : ""
                      }`}
                      onClick={onClose}
                    >
                      HRM Dashboard
                    </NavLink>
                  </PermissionWith>

                  {/* ???? UPDATED: Show Accounting Dashboard ONLY if user has account dashboard permission */}
                  <PermissionWith permission="show account dashboard">
                    <NavLink
                      to="/dashboard"
                      className={`submenu-item ${
                        isActive("/dashboard") ? "active" : ""
                      }`}
                      onClick={onClose}
                    >
                      Accounting Dashboard
                    </NavLink>
                  </PermissionWith>
                </div>
              )}
            </div>
          </PermissionWith>

          {/* HRM System */}
          <PermissionWith permission="manage employee">
            <div className="menu-group">
              <div
                className={`menu-item ${openMenus.hrm ? "selected" : ""}`}
                onClick={() => isCollapsed ? toggleCollapse() : toggleMenu("hrm")}
                title={isCollapsed ? "HRM System" : ""}
              >
                <div className="menu-item-content">
                  <div className="menu-item-icon">
                    <div className="menu-item-icon-parent">
                      <FaUserTie className="menu-item-icon" />
                    </div>
                  </div>
                  {!isCollapsed && <span className="menu-item-text">HRM System</span>}
                </div>
                {!isCollapsed && (
                  <span className="arrow-icon">
                    {openMenus.hrm ? <FaChevronDown /> : <FaChevronRight />}
                  </span>
                )}
              </div>

              {openMenus.hrm && (
                <div className="submenu">
                  <PermissionWith permission="manage employee">
                    <NavLink
                      to="/employees"
                      className="submenu-item"
                      onClick={onClose}
                    >
                      Site & Employee Setup
                    </NavLink>
                  </PermissionWith>
                  <PermissionWith permission="manage set salary">
                    <div
                      className={`submenu-item has-nested ${
                        openMenus.payroll ? "selected" : ""
                      }`}
                      onClick={() => toggleMenu("payroll")}
                    >
                      Payroll Setup
                      <span className="arrow-icon">
                        {openMenus.payroll ? (
                          <FaChevronDown />
                        ) : (
                          <FaChevronRight />
                        )}
                      </span>
                    </div>
                  </PermissionWith>
                  {openMenus.payroll && (
                    <div className="nested-submenu">
                      <PermissionWith permission="manage set salary">
                        <NavLink
                          to="/payroll/set-salary"
                          className="submenu-item"
                          onClick={onClose}
                        >
                          Set Salary
                        </NavLink>
                      </PermissionWith>
                      {/* <PermissionWith permission="manage pay slip">
                        <NavLink
                          to="/hrm/payroll-setup/payslip"
                          className="submenu-item"
                          onClick={onClose}
                        >
                          Payslip
                        </NavLink>
                      </PermissionWith> */}
                      <PermissionWith permission="manage pay slip">
                        <NavLink
                          to="/payroll-setup/payslip"
                          className="submenu-item"
                          onClick={onClose}
                        >
                          {" "}
                          Payslip
                        </NavLink>
                      </PermissionWith>
                    </div>
                  )}
                  <PermissionWith permission="manage leave">
                    <div
                      className={`submenu-item has-nested ${
                        openMenus.leave ? "selected" : ""
                      }`}
                      onClick={() => toggleMenu("leave")}
                    >
                      Leave Management
                      <span className="arrow-icon">
                        {openMenus.leave ? (
                          <FaChevronDown />
                        ) : (
                          <FaChevronRight />
                        )}
                      </span>
                    </div>
                  </PermissionWith>
                  {openMenus.leave && (
                    <div className="nested-submenu">
                      <PermissionWith permission="manage leave">
                        <NavLink
                          to="/leaves"
                          className="submenu-item"
                          onClick={onClose}
                        >
                          Manage Leave
                        </NavLink>
                      </PermissionWith>
                    </div>
                  )}

                  <PermissionWith permission="manage attendance">
                    <div
                      className={`submenu-item has-nested ${
                        openMenus.attendance ? "selected" : ""
                      }`}
                      onClick={() => toggleMenu("attendance")}
                    >
                      Attendance
                      <span className="arrow-icon">
                        {openMenus.attendance ? (
                          <FaChevronDown />
                        ) : (
                          <FaChevronRight />
                        )}
                      </span>
                    </div>
                  </PermissionWith>
                  {openMenus.attendance && (
                    <div className="nested-submenu">
                      <PermissionWith permission="create attendance">
                        <NavLink
                          to="/attendance"
                          className="submenu-item"
                          onClick={onClose}
                        >
                          Mark Attendance
                        </NavLink>
                      </PermissionWith>
                      <PermissionWith permission="manage biometric attendance">
                        {/* <NavLink
                          to="/hrm/attendance/bulk"
                          className="submenu-item"
                          onClick={onClose}
                        >
                          Bulk Attendance
                        </NavLink> */}
                      </PermissionWith>
                    </div>
                  )}
                  {/* <PermissionWith permission="manage appraisal">
                    <div
                      className={`submenu-item has-nested ${
                        openMenus.performance ? "selected" : ""
                      }`}
                      onClick={() => toggleMenu("performance")}
                    >
                      Performance Setup
                      <span className="arrow-icon">
                        {openMenus.performance ? (
                          <FaChevronDown />
                        ) : (
                          <FaChevronRight />
                        )}
                      </span>
                    </div>
                  </PermissionWith> */}
                  {/* {openMenus.performance && (
                    <div className="nested-submenu">
                      <PermissionWith permission="manage indicator">
                        <NavLink
                          to="/indicator"
                          className="submenu-item"
                          onClick={onClose}
                        >
                          Indicator
                        </NavLink>
                      </PermissionWith>
                      <PermissionWith permission="manage appraisal">
                        <NavLink
                          to="/appraisal"
                          className="submenu-item"
                          onClick={onClose}
                        >
                          Appraisal
                        </NavLink>
                      </PermissionWith>
                      <PermissionWith permission="manage goal tracking">
                        <NavLink
                          to="/goaltracking"
                          className="submenu-item"
                          onClick={onClose}
                        >
                          Goal Tracking
                        </NavLink>
                      </PermissionWith>
                    </div>
                  )} */}
                  <PermissionWith permission="manage award">
                    <div
                      className={`submenu-item has-nested ${
                        openMenus.admin ? "selected" : ""
                      }`}
                      onClick={() => toggleMenu("admin")}
                    >
                      HR Admin Setup
                      <span className="arrow-icon">
                        {openMenus.admin ? (
                          <FaChevronDown />
                        ) : (
                          <FaChevronRight />
                        )}
                      </span>
                    </div>
                  </PermissionWith>
                  {openMenus.admin && (
                    <div className="nested-submenu">
                      <PermissionWith permission="manage award">
                        <NavLink
                          to="/hrm/hradminsetup/award"
                          className="submenu-item"
                          onClick={onClose}
                        >
                          Award
                        </NavLink>
                      </PermissionWith>
                      <PermissionWith permission="manage transfer">
                        <NavLink
                          to="/hrm/hradminsetup/transfer"
                          className="submenu-item"
                          onClick={onClose}
                        >
                          Transfer
                        </NavLink>
                      </PermissionWith>
                      <PermissionWith permission="manage resignation">
                        <NavLink
                          to="/hrm/hradminsetup/resignation"
                          className="submenu-item"
                          onClick={onClose}
                        >
                          Resignation
                        </NavLink>
                      </PermissionWith>
                      <PermissionWith permission="manage promotion">
                        <NavLink
                          to="/hrm/hradminsetup/promotion"
                          className="submenu-item"
                          onClick={onClose}
                        >
                          Promotion
                        </NavLink>
                      </PermissionWith>
                      <PermissionWith permission="manage complaint">
                        <NavLink
                          to="/hrm/hradminsetup/complaint"
                          className="submenu-item"
                          onClick={onClose}
                        >
                          Complaints
                        </NavLink>
                      </PermissionWith>
                      <PermissionWith permission="manage warning">
                        <NavLink
                          to="/hrm/hradminsetup/warning"
                          className="submenu-item"
                          onClick={onClose}
                        >
                          Warning
                        </NavLink>
                      </PermissionWith>
                      <PermissionWith permission="manage termination">
                        <NavLink
                          to="/hrm/hradminsetup/termination"
                          className="submenu-item"
                          onClick={onClose}
                        >
                          Termination
                        </NavLink>
                      </PermissionWith>
                      <PermissionWith permission="manage announcement">
                        <NavLink
                          to="/hrm/hradminsetup/announcement"
                          className="submenu-item"
                          onClick={onClose}
                        >
                          Announcement
                        </NavLink>
                      </PermissionWith>
                      <PermissionWith permission="manage holiday">
                        <NavLink
                          to="/hrm/hradminsetup/holidays"
                          className="submenu-item"
                          onClick={onClose}
                        >
                          Holidays
                        </NavLink>
                      </PermissionWith>
                    </div>
                  )}
                  {/* <PermissionWith permission="manage document">
                    <NavLink
                      to="/document-setup"
                      className="submenu-item"
                      onClick={onClose}
                    >
                      Document Setup
                    </NavLink>
                  </PermissionWith> */}
                  <PermissionWith permission="manage company policy">
                    <NavLink
                      to="/company-policy"
                      className="submenu-item"
                      onClick={onClose}
                    >
                      Company Policy
                    </NavLink>
                  </PermissionWith>
                  {/* <PermissionWith permission="manage assets">
                    <NavLink
                      to="/employee-assets"
                      className="submenu-item"
                      onClick={onClose}
                    >
                      Employees Asset Setup
                    </NavLink>
                  </PermissionWith> */}
                  <PermissionWith permission="manage branch">
                    <NavLink
                      to="/hrmsystemsetup/branch"
                      // className={`submenu-item ${
                      //   location.pathname.includes("/") ? "active" : ""
                      // }`}
                      // onClick={onClose}
                      className={({ isActive, isPending }) => {
                        const active =
                          location.pathname.startsWith("/hrmsystemsetup");
                        return "submenu-item" + (active ? " active" : "");
                      }}
                      onClick={onClose}
                    >
                      HRM System Setup
                    </NavLink>
                  </PermissionWith>
                </div>
              )}
            </div>
          </PermissionWith>
          <PermissionWith permission="show account dashboard">
            <div className="menu-group">
              <div
                className={`menu-item ${
                  openMenus.accounting ? "selected" : ""
                }`}
                onClick={() => isCollapsed ? toggleCollapse() : toggleMenu("accounting")}
                title={isCollapsed ? "Accounting System" : ""}
              >
                <div className="menu-item-content">
                  <div className="menu-item-icon-parent">
                    <FaBalanceScale className="menu-item-icon" />
                  </div>
                  {!isCollapsed && <span className="menu-item-text">Accounting System</span>}
                </div>
                {!isCollapsed && (
                  <span className="arrow-icon">
                    {openMenus.accounting ? (
                      <FaChevronDown />
                    ) : (
                      <FaChevronRight />
                    )}
                  </span>
                )}
              </div>
              {openMenus.accounting && (
                <div className="submenu">
                  <NavLink
                    to={
                      // user?.type === "Branch Manager"
                      user?.type === "Branch Manager" ||
                      user?.type === "Branch Manager "
                        ? "/accounting/branch-wallets/all/details"
                        : "/accounting/branch-wallets"
                    }
                    className="submenu-item"
                    onClick={onClose}
                  >
                    Wallet
                  </NavLink>
                  <div>
                    {/* Main Expenses Link */}
                    <div
                      className={`submenu-item has-nested ${
                        openMenus.expenses ? "selected" : ""
                      }`}
                      onClick={() => toggleMenu("expenses")}
                    >
                      Expenses
                      <span className="arrow-icon">
                        {openMenus.expenses ? (
                          <FaChevronDown />
                        ) : (
                          <FaChevronRight />
                        )}
                      </span>
                    </div>

                    {/* Nested Submenu */}
                    {openMenus.expenses && (
                      <div className="nested-submenu">
                        {/* <PermissionWith permission="manage cash purchase"> */}
                        <NavLink
                          to="/accounting/expenses"
                          className="submenu-item"
                          onClick={onClose}
                          end
                        >
                          Non-GST Purchase
                        </NavLink>
                        {/* </PermissionWith> */}

                        {/* ✅ Always show Credit Purchase now */}
                        {/* <PermissionWith permission="manage credit purchase"> */}
                        <NavLink
                          to="/accounting/expenses/credit-purchase"
                          className="submenu-item"
                          onClick={onClose}
                        >
                          GST Purchase
                        </NavLink>
                        {/* </PermissionWith> */}
                      </div>
                    )}
                  </div>

                  {/* <PermissionWith permission="manage purchase order">
                    <NavLink
                      to="/accounting/income"
                      className="submenu-item"
                      onClick={onClose}
                    >
                      Incomes
                    </NavLink>
                  </PermissionWith> */}

                  <PermissionWith permission="manage purchase order">
                    <NavLink
                      to="/purchases/orders"
                      className="submenu-item"
                      onClick={onClose}
                    >
                      Purchase Orders
                    </NavLink>
                  </PermissionWith>

                  <PermissionWith permission="manage work order">
                    <NavLink
                      to="/works/orders"
                      className="submenu-item"
                      onClick={onClose}
                    >
                      Work Orders
                    </NavLink>
                  </PermissionWith>

                  <PermissionWith permission="manage sale bill">
                    <NavLink
                      to="/works/salebills"
                      className="submenu-item"
                      onClick={onClose}
                    >
                      Sale Invoice
                    </NavLink>
                  </PermissionWith>

                  <PermissionWith permission="manage proforma bill">
                    <NavLink
                      to="/works/proformabills"
                      className="submenu-item"
                      onClick={onClose}
                    >
                      Proforma Invoice
                    </NavLink>
                  </PermissionWith>

                  <PermissionWith permission="manage vendor">
                    <NavLink
                      to="/accounting/accountingsetup/tax"
                      className="submenu-item"
                      onClick={onClose}
                    >
                      Accounting setup
                    </NavLink>
                  </PermissionWith>
                </div>
              )}
            </div>
          </PermissionWith>

          {/* User Management */}
          <PermissionWith permission="manage user">
            <div className="menu-group">
              <div
                className={`menu-item ${
                  openMenus.userManagement ? "selected" : ""
                }`}
                onClick={() => isCollapsed ? toggleCollapse() : toggleMenu("userManagement")}
                title={isCollapsed ? "User Management" : ""}
              >
                <div className="menu-item-content">
                  <div className="menu-item-icon-parent">
                    <FaUserCog className="menu-item-icon" />
                  </div>
                  {!isCollapsed && <span className="menu-item-text">User Management</span>}
                </div>
                {!isCollapsed && (
                  <span className="arrow-icon">
                    {openMenus.userManagement ? (
                      <FaChevronDown />
                    ) : (
                      <FaChevronRight />
                    )}
                  </span>
                )}
              </div>
              {openMenus.userManagement && (
                <div className="submenu">
                  <PermissionWith permission="manage user">
                    <NavLink
                      to="/users"
                      className="submenu-item"
                      onClick={onClose}
                    >
                      User
                    </NavLink>
                  </PermissionWith>
                  <PermissionWith permission="manage role">
                    <NavLink
                      to="/users/roles"
                      className="submenu-item"
                      onClick={onClose}
                    >
                      Role
                    </NavLink>
                  </PermissionWith>
                </div>
              )}
            </div>
          </PermissionWith>

          {/* Products System */}
          {/* <PermissionWith permission="manage product & service">
            <NavLink to="/products" className="menu-item" onClick={onClose}>
              <div className="menu-item-content">
                <div className="menu-item-icon-parent">

                  <FaBriefcase className="menu-item-icon" />
                </div>
                <span className="menu-item-text">Products System</span>
              </div>
            </NavLink>
          </PermissionWith> */}

          {/* <PermissionWith permission="manage product & service">
            <div className="menu-group">
              <div
                className={`menu-item ${
                  openMenus.productSystem ? "selected" : ""
                }`}
                onClick={() => toggleMenu("productSystem")}
              >
                <div className="menu-item-content">
                  <div className="menu-item-icon-parent">
                    <FaUserCog className="menu-item-icon" />
                  </div>
                  <span className="menu-item-text">Products System</span>
                </div>
                <span className="arrow-icon">
                  {openMenus.productSystem ? (
                    <FaChevronDown />
                  ) : (
                    <FaChevronRight />
                  )}
                </span>
              </div>

              {openMenus.productSystem && (
                <div className="submenu">
                  <PermissionWith permission="manage product">
                  <NavLink
                    to="/products"
                    className="submenu-item"
                    onClick={onClose}
                  >
                    Product
                  </NavLink>
                  </PermissionWith>

                  <PermissionWith permission="manage stock">
                  <NavLink
                    to="/stock"
                    className="submenu-item"
                    onClick={onClose}
                  >
                    Stock
                  </NavLink>
                  </PermissionWith>
                </div>
              )}
            </div>
          </PermissionWith> */}

          {/* Notification Template */}
          <PermissionWith permission="manage notification">
            <NavLink
              to={isCollapsed ? "#" : "/notification-template"}
              className="menu-item"
              onClick={(e) => {
                if (isCollapsed) {
                  e.preventDefault();
                  toggleCollapse();
                } else {
                  onClose();
                }
              }}
              title={isCollapsed ? "Notification Template" : ""}
            >
              <div className="menu-item-content">
                <div className="menu-item-icon-parent">
                  <FaBell className="menu-item-icon" />
                </div>
                {!isCollapsed && <span className="menu-item-text">Notification Template</span>}
              </div>
            </NavLink>
          </PermissionWith>

          {/* System Setup */}
          {/* <PermissionWith permission="manage system settings">
            <div className="menu-group">
              <div
                className={`menu-item ${
                  openMenus.systemSetup ? "selected" : ""
                }`}
                onClick={() => toggleMenu("systemSetup")}
              >
                <div className="menu-item-content">
                  <FaSlidersH className="menu-item-icon" />
                  <span className="menu-item-text">System Setup</span>
                </div>
                <span className="arrow-icon">
                  {openMenus.systemSetup ? (
                    <FaChevronDown />
                  ) : (
                    <FaChevronRight />
                  )}
                </span>
              </div>
              {openMenus.systemSetup && (
                <div className="submenu">
                  <PermissionWith permission="manage company settings">
                    <NavLink
                      to="/system/company"
                      className="submenu-item"
                      onClick={onClose}
                    >
                      Company Settings
                    </NavLink>
                  </PermissionWith>
                  <PermissionWith permission="manage business settings">
                    <NavLink
                      to="/system/business"
                      className="submenu-item"
                      onClick={onClose}
                    >
                      Business Settings
                    </NavLink>
                  </PermissionWith>
                  <PermissionWith permission="manage print settings">
                    <NavLink
                      to="/system/print"
                      className="submenu-item"
                      onClick={onClose}
                    >
                      Print Settings
                    </NavLink>
                  </PermissionWith>
                </div>
              )}
            </div>
          </PermissionWith> */}

          {/* <PermissionWith permission="manage assets">
            <div className="menu-group">
              <div
                className={`menu-item ${
                  openMenus.assetsSystem ? "selected" : ""
                }`}
                onClick={() => toggleMenu("assetsSystem")}
              >
                <div className="menu-item-content">
                  <div className="menu-item-icon-parent">
                    <FaWarehouse className="menu-item-icon" />
                  </div>
                  <span className="menu-item-text">Assets System</span>
                </div>
                <span className="arrow-icon">
                  {openMenus.assetsSystem ? (
                    <FaChevronDown />
                  ) : (
                    <FaChevronRight />
                  )}
                </span>
              </div>

              {openMenus.assetsSystem && (
                <div className="submenu">
                  <PermissionWith permission="manage assets">
                    <NavLink
                      to="/assets"
                      className="submenu-item"
                      onClick={onClose}
                    >
                      Assets
                    </NavLink>
                  </PermissionWith>
                </div>
              )}
            </div>
          </PermissionWith> */}

          {/* Settings */}
          <PermissionWith permission="manage company settings">
            <div className="menu-group">
              <div
                className={`menu-item ${openMenus.settings ? "selected" : ""}`}
                onClick={() => isCollapsed ? toggleCollapse() : toggleMenu("settings")}
                title={isCollapsed ? "Settings" : ""}
              >
                <div className="menu-item-content">
                  <div className="menu-item-icon-parent">
                    <FaTools className="menu-item-icon" />
                  </div>
                  {!isCollapsed && <span className="menu-item-text">Settings</span>}
                </div>
                {!isCollapsed && (
                  <span className="arrow-icon">
                    {openMenus.settings ? <FaChevronDown /> : <FaChevronRight />}
                  </span>
                )}
              </div>
              {openMenus.settings && (
                <div className="submenu">
                  <PermissionWith permission="manage company settings">
                    <NavLink
                      to="/aboutus"
                      className="submenu-item"
                      onClick={onClose}
                    >
                      AboutUs
                    </NavLink>
                  </PermissionWith>

                  <PermissionWith permission="manage company settings">
                    <NavLink
                      to="/terms_and_conditions"
                      className="submenu-item"
                      onClick={onClose}
                    >
                      Terms & Condition
                    </NavLink>
                  </PermissionWith>

                  <PermissionWith permission="manage company settings">
                    <NavLink
                      to="/Privacy_policy"
                      className="submenu-item"
                      onClick={onClose}
                    >
                      Privacy Policy
                    </NavLink>
                  </PermissionWith>
                </div>
              )}
            </div>
          </PermissionWith>

{/* <PermissionWith> */}
  {/* permission="manage work order" */}
{/* Report Section */}
<div className="menu-group">
  <div
    className={`menu-item ${openMenus.report ? "selected" : ""}`}
    onClick={() => isCollapsed ? toggleCollapse() : toggleMenu("report")}
    title={isCollapsed ? "Report" : ""}
  >
    <div className="menu-item-content">
      <div className="menu-item-icon-parent">
        <FaChartBar className="menu-item-icon" />
      </div>
      {!isCollapsed && <span className="menu-item-text">Report</span>}
    </div>
    {!isCollapsed && (
      <span className="arrow-icon">
        {openMenus.report ? <FaChevronDown /> : <FaChevronRight />}
      </span>
    )}
  </div>

  {openMenus.report && (
    <div className="submenu">
      {/* HRM under Report */}
      <div
        className={`submenu-item has-nested ${
          openMenus.reportHrm ? "selected" : ""
        }`}
        onClick={() => toggleMenu("reportHrm")}
      >
        HRM
        <span className="arrow-icon">
          {openMenus.reportHrm ? <FaChevronDown /> : <FaChevronRight />}
        </span>
      </div>

      {openMenus.reportHrm && (
        <div className="nested-submenu">
          <NavLink
            to="/reports/hrm-sites"
            className="submenu-item"
            onClick={onClose}
          >
            Sites Report
          </NavLink>
          <NavLink
            to="/reports/hrm-payroll"
            className="submenu-item"
            onClick={onClose}
          >
            Payroll
          </NavLink>
          <NavLink
            to="/reports/hrm-leave"
            className="submenu-item"
            onClick={onClose}
          >
            Leave
          </NavLink>
          <NavLink
            to="/reports/hrm-attendance"
            className="submenu-item"
            onClick={onClose}
          >
            Attendance Report
          </NavLink>
        </div>
      )}

      {/* Accounting under Report */}
      <div
        className={`submenu-item has-nested ${
          openMenus.reportAccounting ? "selected" : ""
        }`}
        onClick={() => toggleMenu("reportAccounting")}
      >
        Accounting
        <span className="arrow-icon">
          {openMenus.reportAccounting ? (
            <FaChevronDown />
          ) : (
            <FaChevronRight />
          )}
        </span>
      </div>

      {openMenus.reportAccounting && (
        <div className="nested-submenu">
          {/* ✅ Always show Expense Summary */}
          <NavLink
            to="/reports/expense-summary"
            className="submenu-item"
            onClick={onClose}
          >
            Expense Summary
          </NavLink>

          {/* ✅ Hide other reports for Branch Manager, show all for Company/Accountant */}
          {(user?.type === "company" || user?.type === "Accountant") && (
            <>
              <NavLink
                to="/reports/income-summary"
                className="submenu-item"
                onClick={onClose}
              >
                Income Summary
              </NavLink>
              
              <NavLink
                to="/reports/income-expense-summary"
                className="submenu-item"
                onClick={onClose}
              >
                Income vs Expense Summary
              </NavLink>
              
              <NavLink
                to="/reports/tax-summary"
                className="submenu-item"
                onClick={onClose}
              >
                Tax Summary
              </NavLink>
              
              <NavLink
                to="/reports/invoice-summary"
                className="submenu-item"
                onClick={onClose}
              >
                Invoice Summary
              </NavLink>
            </>
          )}
        </div>
      )}
    </div>
  )}
</div>
{/* </PermissionWith> */}

        </nav>
      </aside>

      {isOpen && (
        <div className="sidebar-overlay d-lg-none" onClick={onClose}></div>
      )}
    </>
  );
};

export default Sidebar;
