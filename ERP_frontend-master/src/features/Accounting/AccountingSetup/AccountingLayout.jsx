// import React, { useState, useEffect } from "react";
// import { NavLink, Outlet, useLocation } from "react-router-dom";
// import { FaChevronRight, FaPlus } from "react-icons/fa";
// import { Breadcrumb, Button } from "react-bootstrap";
// import { Plus } from "lucide-react";

// const tabs = [
//   { name: "Taxes", path: "/accounting/accountingsetup/tax" },
//   // { name: "Category", path: "/accounting/accountingsetup/category" },
//   { name: "Unit", path: "/accounting/accountingsetup/units" },
//   { name: "Payment Head", path: "/accounting/accountingsetup/payment-head" },
// ];

// const AccountingLayout = () => {
//   const location = useLocation();
//   const pathParts = location.pathname.split("/").filter(Boolean);

//   // State to notify child components to open "Add" modal
//   const [openAddForm, setOpenAddForm] = useState(false);
  
//   const currentTab = tabs.find(tab => location.pathname.startsWith(tab.path));

// const handleAddClick = () => {
//   setOpenAddForm(true); // just open
// };

// const resetOpenAddForm = () => setOpenAddForm(false); 

//   return (
//     <>
//       {/* Header + Add Button */}
//       <div className="d-flex justify-content-between align-items-center p-4 pb-2">
//         <h4>{currentTab?.name ? `Manage ${currentTab.name}` : ""}</h4>
//         {currentTab && (
//           <Button variant="success" size="sm" onClick={handleAddClick}>
//             <Plus />
//           </Button>
//         )}
//       </div>

//       {/* Breadcrumb */}
//       <Breadcrumb className="px-4 pt-2 pb-2">
//         <Breadcrumb.Item linkAs={NavLink} linkProps={{ to: "/accounting" }}>
//           Accounting
//         </Breadcrumb.Item>
//         {pathParts.slice(1).map((part, index) => {
//           const pathTo = "/" + pathParts.slice(0, index + 2).join("/");
//           const name = part.charAt(0).toUpperCase() + part.slice(1).replace("-", " ");
//           return (
//             <Breadcrumb.Item
//               key={pathTo}
//               linkAs={NavLink}
//               linkProps={{ to: pathTo }}
//               active={index === pathParts.length - 2}
//             >
//               {name}
//             </Breadcrumb.Item>
//           );
//         })}
//       </Breadcrumb>

//       <div className="d-flex px-4 gap-4">
//         {/* Sidebar */}
//         <div
//           className="rounded bg-light overflow-hidden"
//           style={{
//             width: "300px",
//             height: "max-content",
//             boxShadow: "0 0 10px 4px rgba(0,0,0,0.1)",
//           }}
//         >
//           {tabs.map((tab) => (
//             <NavLink
//               key={tab.name}
//               to={tab.path}
//               className={({ isActive }) =>
//                 `d-flex justify-content-between align-items-center px-4 py-3 text-decoration-none ${
//                   isActive ? "bg-success text-white" : "bg-white text-dark"
//                 }`
//               }
//             >
//               {tab.name}
//               <FaChevronRight />
//             </NavLink>
//           ))}
//         </div>

//         {/* Content */}
//         <div className="flex-grow-1">
//           <Outlet context={{ openAddForm, resetOpenAddForm }} />
//         </div>
//       </div>
//     </>
//   );
// };

// export default AccountingLayout;







import React, { useState, useEffect } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { FaChevronRight, FaPlus } from "react-icons/fa";
import { Breadcrumb, Button } from "react-bootstrap";
import { Plus } from "lucide-react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

const tabs = [
  { name: "Taxes", path: "/accounting/accountingsetup/tax" },
  // { name: "Category", path: "/accounting/accountingsetup/category" },
  { name: "Unit", path: "/accounting/accountingsetup/units" },
  { name: "Payment Head", path: "/accounting/accountingsetup/payment-head" },
];

const AccountingLayout = () => {
  const location = useLocation();
  const pathParts = location.pathname.split("/").filter(Boolean);

  // State to notify child components to open "Add" modal
  const [openAddForm, setOpenAddForm] = useState(false);

  const currentTab = tabs.find((tab) => location.pathname.startsWith(tab.path));

  const handleAddClick = () => {
    setOpenAddForm(true); // just open
  };

  const resetOpenAddForm = () => setOpenAddForm(false);

  return (
    <>
      {/* Header + Add Button */}
      <div className="d-flex justify-content-between align-items-center p-4 pb-0">
        <h4>{currentTab?.name ? `Manage ${currentTab.name}` : ""}</h4>
        {currentTab && (
          <OverlayTrigger overlay={<Tooltip>Create</Tooltip>}>
            <Button variant="success" onClick={handleAddClick}>
              <i className="bi bi-plus-lg fs-6"></i>
            </Button>
          </OverlayTrigger>
        )}
      </div>

      {/* Breadcrumb */}
      <Breadcrumb 
        className="ms-4 mt-0 mb-0" 
        style={{ 
          fontSize: ".75rem",
          "--bs-breadcrumb-divider-color": "#198754 "
        }}
      >
        <Breadcrumb.Item linkAs={NavLink} linkProps={{ to: "/accounting" }}>
          <span className="text-success">Accounting</span>
        </Breadcrumb.Item>

        {pathParts.slice(1).map((part, index) => {
          const pathTo = "/" + pathParts.slice(0, index + 2).join("/");
          const name =
            part.charAt(0).toUpperCase() + part.slice(1).replace("-", " ");
          return (
            <Breadcrumb.Item
              className="text-success"
              key={pathTo}
              linkAs={NavLink}
              linkProps={{ to: pathTo }}
              active={index === pathParts.length - 2}
            >
              <span className="text-success">{name}</span>
            </Breadcrumb.Item>
          );
        })}
      </Breadcrumb>

      {/* Additional CSS for breadcrumb arrows */}
      <style>{`
  /* Set breadcrumb arrow (divider) to Bootstrap 3 success green, less bold */
  .breadcrumb {
    --bs-breadcrumb-divider: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8'%3E%3Cpolyline points='2,0 6,4 2,8' stroke='%235cb85c' fill='none' stroke-width='1'/%3E%3C/svg%3E");
  }
`}</style>



      <div className="d-flex px-4 gap-4">
        {/* Sidebar */}
        <div
          className="rounded bg-light overflow-hidden"
          style={{
            width: "300px",
            height: "max-content",
            boxShadow: "0 0 10px 4px rgba(0,0,0,0.1)",
          }}
        >
          {tabs.map((tab) => (
            <NavLink
              key={tab.name}
              to={tab.path}
              className={({ isActive }) =>
                `d-flex justify-content-between align-items-center px-4 py-3 text-decoration-none ${
                  isActive ? "bg-success text-white" : "bg-white text-dark"
                }`
              }
            >
              {tab.name}
              <FaChevronRight />
            </NavLink>
          ))}
        </div>

        {/* Content */}
        <div className="flex-grow-1">
          <Outlet context={{ openAddForm, resetOpenAddForm }} />
        </div>
      </div>
    </>
  );
};

export default AccountingLayout;