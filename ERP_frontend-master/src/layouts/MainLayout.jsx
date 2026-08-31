import React, { useState } from "react";
import Footer from "../components/Footer";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { Container, Row, Col } from "react-bootstrap";

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false); // default closed on mobile
  const [isCollapsed, setIsCollapsed] = useState(false); // desktop sidebar collapse state

  const [openMenus, setOpenMenus] = useState({
    dashboard: false,
    hrm: false,
    payroll: false,
    leave: false,
    attendance: false,
    admin: false,
    accounting: false,
    expenses: false,
    userManagement: false,
    productSystem: false,
    assetsSystem: false,
    settings: false,
    report: false,
    reportHrm: false,
    reportAccounting: false,
  });

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const toggleCollapse = () => setIsCollapsed((prev) => !prev);
  
  const toggleMenu = (key) =>
    setOpenMenus((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <Container fluid className="flex-grow-1">
        <Row className="h-100 g-0">
          {/* Sidebar */}
          <Col
            xs={sidebarOpen ? 12 : 0} // hide on small screens when closed
            md={sidebarOpen ? 4 : 0} // adjust width on tablets
            lg={isCollapsed ? "auto" : 2} // adjust width on large screens
            className={`sidebar-container ${
              sidebarOpen ? "open" : "collapsed"
            }`}
            style={{
              display:
                sidebarOpen || window.innerWidth >= 992 ? "block" : "none",
              transition: "all 0.3s ease",
              width: isCollapsed && window.innerWidth >= 992 ? "80px" : undefined,
            }}
          >
            <Sidebar
              isOpen={sidebarOpen}
              isCollapsed={isCollapsed}
              toggleCollapse={toggleCollapse}
              openMenus={openMenus}
              toggleMenu={toggleMenu}
              onClose={() => setSidebarOpen(false)} // ✅ pass close function
            />
          </Col>

          {/* Main Content */}
          <Col
            xs={12}
            md={12}
            lg={isCollapsed ? "" : 10}
            className="d-flex flex-column"
            style={{
              flex: isCollapsed && window.innerWidth >= 992 ? "1" : undefined,
            }}
          >
            {/* Sticky Header */}
            <div className="sticky-top bg-white shadow-sm z-3">
              <Header onToggleSidebar={toggleSidebar} />
            </div>

            <main className="flex-grow-1 overflow-auto">
              <Outlet />
            </main>

            <Footer />
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default MainLayout;
