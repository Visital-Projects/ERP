// import React, { useEffect, useState, useRef } from "react";
// import Modal from "react-modal";
// import { createRole, updateRole, fetchPermissions } from "../../../services/roleService";
// import './RoleFormModal.css';

// Modal.setAppElement("#root");
// const normalizePermission = (name) =>
//   name.toLowerCase().replace(/[\s_-]+/g, ' ').trim();

// const PERMISSIONS_BY_TAB = {
//   Staff: [
//     { name: "User", actions: ["Manage", "Create", "Edit", "Delete"] },
//     { name: "Role", actions: ["Manage", "Create", "Edit", "Delete"] },
//     { name: "Client", actions: ["Manage", "Create", "Edit", "Delete"] },
//     { name: "Product & service", actions: ["Manage", "Create", "Edit", "Delete"] },
//     { name: "Constant unit", actions: ["Manage", "Create", "Edit", "Delete"] },
//     { name: "Constant tax", actions: ["Manage", "Create", "Edit", "Delete"] },
//     { name: "Constant category", actions: ["Manage", "Create", "Edit", "Delete"] },
//     { name: "Zoom meeting", actions: ["Manage", "Create", "Delete", "Show"] },
//     { name: "Company settings", actions: ["Manage"] },
//     { name: "Permission", actions: ["Manage", "Create", "Edit", "Delete"] },
//   ],
//   CRM: [
//     { name: "Crm dashboard", actions: ["Show"] },
//     { name: "Lead", actions: ["View", "Move", "Manage", "Create", "Edit", "Delete"] },
//     { name: "Convert", actions: ["lead to deal"] },
//     { name: "Pipeline", actions: ["Manage", "Create", "Edit", "Delete"] },
//     { name: "Lead stage", actions: ["Manage", "Create", "Edit", "Delete"] },
//     { name: "Source", actions: ["Manage", "Create", "Edit", "Delete"] },
//     { name: "Label", actions: ["Manage", "Create", "Edit", "Delete"] },
//     { name: "Lead email", actions: ["Create"] },
//     { name: "Lead call", actions: ["Create", "Edit", "Delete"] },
//     { name: "Deal", actions: ["View", "Move", "Manage", "Create", "Edit", "Delete"] },
//     { name: "Stage", actions: ["Manage", "Create", "Edit", "Delete"] },
//     { name: "Task", actions: ["View", "Create", "Edit", "Delete"] },
//     { name: "Form builder", actions: ["Manage", "Create", "Edit", "Delete"] },
//     { name: "Form response", actions: ["View"] },
//     { name: "Form field", actions: ["Manage", "Create", "Edit", "Delete"] },
//     { name: "Contract", actions: ["Manage", "Create", "Edit", "Delete", "Show"] },
//     { name: "Contract type", actions: ["Manage", "Create", "Edit", "Delete"] },
//   ],
//   Project: [
//     { name: "Project dashboard", actions: ["Show"] },
//     { name: "Project", actions: ["View", "Manage", "Create", "Edit", "Delete"] },
//     { name: "Milestone", actions: ["View", "Create", "Edit", "Delete"] },
//     { name: "Grant chart", actions: ["View"] },
//     { name: "Project stage", actions: ["Manage", "Create", "Edit", "Delete"] },
//     { name: "Timesheet", actions: ["View", "Manage", "Create", "Edit", "Delete"] },
//     { name: "Project expense", actions: ["Manage", "Create", "Edit", "Delete"] },
//     { name: "Project task", actions: ["View", "Manage", "Create", "Edit", "Delete"] },
//     { name: "Activity", actions: ["View"] },
//     { name: "CRM activity", actions: ["View"] },
//     { name: "Project task stage", actions: ["Manage", "Create", "Edit", "Delete"] },
//     { name: "Bug report", actions: ["Move", "Manage", "Create", "Edit", "Delete"] },
//     { name: "Bug status", actions: ["Manage", "Create", "Edit", "Delete"] },
//   ],
//   HRM: [
//     { name: "Hrm dashboard", actions: ["Show"] },
//     { name: "Employee", actions: ["View", "Manage", "Create", "Edit", "Delete"] },
//     { name: "Employee profile", actions: ["Manage", "Show"] },
//     { name: "Department", actions: ["View", "Manage", "Create", "Edit", "Delete"] },
//     { name: "Designation", actions: ["View", "Manage", "Create", "Edit", "Delete"] },
//     { name: "Branch", actions: ["Manage", "Create", "Edit", "Delete"] },
//     { name: "Document type", actions: ["Manage", "Create", "Edit", "Delete"] },
//     { name: "Document", actions: ["Manage", "Create", "Edit", "Delete"] },
//     { name: "Payslip type", actions: ["Manage", "Create", "Edit", "Delete"] },
//     { name: "Allowance", actions: ["Create", "Edit", "Delete"] },
//     { name: "Commission", actions: ["Create", "Edit", "Delete"] },
//     { name: "Allowance option", actions: ["Manage", "Create", "Edit", "Delete"] },
//     { name: "Loan option", actions: ["Manage", "Create", "Edit", "Delete"] },
//     { name: "Deduction option", actions: ["Manage", "Create", "Edit", "Delete"] },
//     { name: "Loan", actions: ["Create", "Edit", "Delete"] },
//     { name: "Saturation deduction", actions: ["Create", "Edit", "Delete"] },
//     { name: "Other payment", actions: ["Create", "Edit", "Delete"] },
//     { name: "Overtime", actions: ["Create", "Edit", "Delete"] },
//     { name: "Set salary", actions: ["Manage", "Create", "Edit"] },
//     { name: "Pay slip", actions: ["Manage", "Create"] },
//     { name: "Company policy", actions: ["Manage", "Create", "Edit", "Delete"] },
//     { name: "Appraisal", actions: ["Manage", "Create", "Edit", "Delete", "Show"] },
//     { name: "Goal tracking", actions: ["Manage", "Create", "Edit", "Delete"] },
//     { name: "Goal type", actions: ["Manage", "Create", "Edit", "Delete"] },
//     { name: "Indicator", actions: ["Manage", "Create", "Edit", "Delete", "Show"] },
//     { name: "Event", actions: ["Manage", "Create", "Edit", "Delete"] },
//     { name: "Meeting", actions: ["Manage", "Create", "Edit", "Delete"] },
//     { name: "Training", actions: ["Manage", "Create", "Edit", "Delete", "Show"] },
//     { name: "Trainer", actions: ["Manage", "Create", "Edit", "Delete"] },
//     { name: "Training type", actions: ["Manage", "Create", "Edit", "Delete"] },
//     { name: "Award", actions: ["Manage", "Create", "Edit", "Delete"] },
//     { name: "Award type", actions: ["Manage", "Create", "Edit", "Delete"] },
//     { name: "Resignation", actions: ["Manage", "Create", "Edit", "Delete"] },
//     { name: "Travel", actions: ["Manage", "Create", "Edit", "Delete"] },
//     { name: "Promotion", actions: ["Manage", "Create", "Edit", "Delete"] },
//     { name: "Complaint", actions: ["Manage", "Create", "Edit", "Delete"] },
//     { name: "Warning", actions: ["Manage", "Create", "Edit", "Delete"] },
//     { name: "Termination", actions: ["Manage", "Create", "Edit", "Delete"] },
//     { name: "Termination type", actions: ["Manage", "Create", "Edit", "Delete"] },
//     { name: "Job application", actions: ["Move", "Manage", "Create", "Delete", "Show"] },
//     { name: "Job application note", actions: ["Add", "Delete"] },
//     { name: "Job onBoard", actions: ["Manage"] },
//     { name: "Job category", actions: ["Manage", "Create", "Edit", "Delete"] },
//     { name: "Job", actions: ["Manage", "Create", "Edit", "Delete", "Show"] },
//     { name: "Job stage", actions: ["Manage", "Create", "Edit", "Delete"] },
//     { name: "Custom question", actions: ["Manage", "Create", "Edit", "Delete"] },
//     { name: "Interview schedule", actions: ["Create", "Edit", "Delete", "Show"] },
//     { name: "Career", actions: ["Show"] },
//     { name: "Estimation", actions: ["View", "Create", "Edit", "Delete"] },
//     { name: "Holiday", actions: ["Manage", "Create", "Edit", "Delete"] },
//     { name: "Transfer", actions: ["Manage", "Create", "Edit", "Delete"] },
//     { name: "Announcement", actions: ["Manage", "Create", "Edit", "Delete"] },
//     { name: "Leave", actions: ["Manage", "Create", "Edit", "Delete"] },
//     { name: "Leave type", actions: ["Manage", "Create", "Edit", "Delete"] },
//     { name: "Attendance", actions: ["Manage", "Create", "Edit", "Delete"] },
//   ],
//   Account: [
//     { name: "Account dashboard", actions: ["Show"] },
//     { name: "Proposal", actions: ["Manage", "Create", "Edit", "Delete", "Show", "Send", "Duplicate"] },
//     { name: "Invoice", actions: ["Manage", "Create", "Edit", "Delete", "Show", "Send", "Create Payment", "Delete Payment", "Duplicate", "convert", "copy"] },
//     { name: "Bill", actions: ["Manage", "Create", "Edit", "Delete", "Show", "Send", "Create Payment", "Delete Payment", "Duplicate"] },
//     { name: "Revenue", actions: ["Manage", "Create", "Edit", "Delete"] },
//     { name: "Payment", actions: ["Manage", "Create", "Edit", "Delete"] },
//     { name: "Proposal product", actions: ["Delete"] },
//     { name: "Invoice product", actions: ["Delete"] },
//     { name: "Bill product", actions: ["Delete"] },
//     { name: "Goal", actions: ["Manage", "Create", "Edit", "Delete"] },
//     { name: "Credit note", actions: ["Manage", "Create", "Edit", "Delete"] },
//     { name: "Debit note", actions: ["Manage", "Create", "Edit", "Delete"] },
//     { name: "Bank account", actions: ["Manage", "Create", "Edit", "Delete"] },
//     { name: "Bank transfer", actions: ["Manage", "Create", "Edit", "Delete"] },
//     { name: "Transaction", actions: ["Manage"] },
//     { name: "Customer", actions: ["Manage", "Create", "Edit", "Delete", "Show"] },
//     { name: "Vender", actions: ["Manage", "Create", "Edit", "Delete", "Show"] },
//     { name: "Constant custom field", actions: ["Manage", "Create", "Edit", "Delete"] },
//     { name: "Assets", actions: ["Manage", "Create", "Edit", "Delete"] },
//     { name: "Chart of account", actions: ["Manage", "Create", "Edit", "Delete"] },
//     { name: "Journal entry", actions: ["Manage", "Create", "Edit", "Delete", "Show"] },
//     { name: "Report", actions: ["Manage", "Income", "Expense", "Loss & Profit", "Tax", "Invoice", "Bill", "Balance Sheet", "Ledger", "Trial Balance", "Income VS Expense"] },
//     { name: "Job Mode", actions: ["Manage", "Create", "Edit", "Delete"] },
//   { name: "Plant Name", actions: ["Manage", "Create", "Edit", "Delete"] },
//   { name: "Contract Period", actions: ["Manage", "Create", "Edit", "Delete"] },
//   { name: "Base Amount", actions: ["Manage", "Create", "Edit", "Delete"] },
//   { name: "Deduction Payment Done", actions: ["Manage", "Create", "Edit", "Delete"] },
//   { name: "Payment Received", actions: ["Manage", "Create", "Edit", "Delete"] },

//   ],
//   POS: [
//     { name: "Pos dashboard", actions: ["Show"] },
//     { name: "Warehouse", actions: ["Manage", "Create", "Edit", "Delete", "Show"] },
//     { name: "Quotation", actions: ["Manage", "Create", "Edit", "Delete", "Show", "convert"] },
//     { name: "Purchase", actions: ["Manage", "Create", "Edit", "Delete", "Show", "Send", "Create Payment", "Delete Payment"] },
//     { name: "Pos", actions: ["Manage", "Show"] },
//     { name: "Barcode", actions: ["Create"] },
//   ]
// };

// const RoleFormModal = ({ isOpen, onClose, onSuccess, role }) => {
//   const [name, setName] = useState("");
//   const [activeTab, setActiveTab] = useState("Staff");
//   const [permissions, setPermissions] = useState([]);
//   const [formData, setFormData] = useState({ permission_ids: [] });
//   const [isLoading, setIsLoading] = useState(true);
//   const masterCheckboxRef = useRef(null);

//   useEffect(() => {
//     const loadPermissions = async () => {
//       setIsLoading(true);
//       try {
//         const data = await fetchPermissions();
//         console.log("Permissions from API:", data.map(p => p.name));
//         setPermissions(data);
//       } catch (err) {
//         console.error("Permission fetch failed", err);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     if (isOpen) {
//       loadPermissions();
//     }
//   }, [isOpen]);

//   useEffect(() => {
//     if (role) {
//       setName(role.name || "");
//       setFormData({ permission_ids: (role.permissions || []).map(p => p.id) });
//     } else {
//       setName("");
//       setFormData({ permission_ids: [] });
//     }
//   }, [role]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const payload = {
//       name,
//       permissions: formData.permission_ids,
//       guard_name: "web"
//     };
//     try {
//       if (role?.id) {
//         await updateRole(role.id, payload);
//       } else {
//         await createRole(payload);
//       }
//       onClose();
//       onSuccess();
//     } catch (err) {
//       console.error("Failed to save role:", err);
//     }
//   };

//   const handleCheckboxChange = (id) => {
//     setFormData((prev) => ({
//       ...prev,
//       permission_ids: prev.permission_ids.includes(id)
//         ? prev.permission_ids.filter((pid) => pid !== id)
//         : [...prev.permission_ids, id],
//     }));
//   };

//   const handleModuleCheck = (module, checked) => {
//     const updatedPermissions = [...formData.permission_ids];

//     module.actions.forEach((action) => {
//       const perm = permissions.find(
//         (p) =>
//           p.name.toLowerCase() === `${action.toLowerCase()} ${module.name.toLowerCase()}`
//       );

//       if (perm) {
//         if (checked && !updatedPermissions.includes(perm.id)) {
//           updatedPermissions.push(perm.id);
//         } else if (!checked && updatedPermissions.includes(perm.id)) {
//           const idx = updatedPermissions.indexOf(perm.id);
//           updatedPermissions.splice(idx, 1);
//         }
//       } else {
//         console.log(`Permission not found: ${action} ${module.name}`);
//       }
//     });

//     setFormData({ ...formData, permission_ids: updatedPermissions });
//   };

//   const handleTabMasterCheck = () => {
//     const allIds = PERMISSIONS_BY_TAB[activeTab].flatMap((module) =>
//       module.actions
//         .map((action) => {
//           const perm = permissions.find(
//             (p) =>
//               p.name.toLowerCase() === `${action.toLowerCase()} ${module.name.toLowerCase()}`
//           );
//           return perm ? perm.id : null;
//         })
//         .filter(Boolean)
//     );

//     if (allIds.length === 0) return;

//     const isAllChecked = allIds.every((id) =>
//       formData.permission_ids.includes(id)
//     );

//     const updated = isAllChecked
//       ? formData.permission_ids.filter((id) => !allIds.includes(id))
//       : [...new Set([...formData.permission_ids, ...allIds])];

//     setFormData((prev) => ({ ...prev, permission_ids: updated }));
//   };

//   const allPermissionIds = PERMISSIONS_BY_TAB[activeTab].flatMap((module) =>
//     module.actions
//       .map((action) => {
//         const perm = permissions.find(
//           (p) =>
//             p.name.toLowerCase() === `${action.toLowerCase()} ${module.name.toLowerCase()}`
//         );
//         return perm ? perm.id : null;
//       })
//       .filter(Boolean)
//   );

//   const allChecked =
//     allPermissionIds.length > 0 &&
//     allPermissionIds.every((id) => formData.permission_ids.includes(id));
//   const someChecked =
//     !allChecked &&
//     allPermissionIds.some((id) => formData.permission_ids.includes(id));

//   useEffect(() => {
//     if (masterCheckboxRef.current) {
//       masterCheckboxRef.current.indeterminate = someChecked;
//     }
//   }, [someChecked, formData]);

//   // const isModuleChecked = (module) => {
//   //   const modulePermissionIds = module.actions
//   //     .map((action) => {
//   //       const perm = permissions.find(
//   //         (p) =>
//   //           p.name.toLowerCase() === `${action.toLowerCase()} ${module.name.toLowerCase()}`
//   //       );
//   //       return perm ? perm.id : null;
//   //     })
//   //     .filter(Boolean);

//   //   if (modulePermissionIds.length === 0) return false;

//   //   return modulePermissionIds.every((id) =>
//   //     formData.permission_ids.includes(id)
//   //   );

//   // };
//   const isModuleChecked = (module) => {
//     return module.actions.some((action) => {
//       const perm = permissions.find(
//         (p) =>
//           p.name.toLowerCase() ===
//           `${action.toLowerCase()} ${module.name.toLowerCase()}`
//       );
//       return perm && formData.permission_ids.includes(perm.id);
//     });
//   };

//   return (
//     <Modal
//       isOpen={isOpen}
//       onRequestClose={onClose}
//       contentLabel="Role Form"
//       className="role-modal"
//       overlayClassName="modal-overlay"
//     >
//       <h3 className="text-xl font-semibold mb-4">
//         {role ? "Edit Role" : "Create New Role"}
//       </h3>
//       <form onSubmit={handleSubmit}>
//         <div className="form-group mb-6">
//           <label className="block font-medium mb-1">Name *</label>
//           <input
//             value={name}
//             onChange={(e) => setName(e.target.value)}
//             required
//             className="w-full border px-3 py-2 rounded"
//           />
//         </div>

//         {/* Tabs Section */}
//         <div className="flex flex-wrap gap-2 mb-4">
//           {Object.keys(PERMISSIONS_BY_TAB).map((tab) => (
//             <button
//               key={tab}
//               type="button"
//               className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === tab
//                 ? "bg-blue-500 text-white"
//                 : "bg-gray-200 text-gray-700 hover:bg-gray-300"
//                 }`}
//               onClick={() => setActiveTab(tab)}
//             >
//               {tab}
//             </button>
//           ))}
//         </div>

//         <div className="mb-6">
//           <h2 className="text-lg font-semibold mb-3">
//             {activeTab === "Staff" && "Assign General Permission to Roles"}
//             {activeTab === "CRM" && "Assign CRM related Permission to Roles"}
//             {activeTab === "Project" && "Assign Project related Permission to Roles"}
//             {activeTab === "HRM" && "Assign HRM related Permission to Roles"}
//             {activeTab === "Account" && "Assign Account related Permission to Roles"}
//             {activeTab === "POS" && "Assign POS related Permission to Roles"}
//           </h2>

//           <div className="border rounded overflow-hidden">
//             {/* Header */}
//             <div className="flex items-center px-4 py-2 bg-gray-100 border-b">
//               <input
//                 type="checkbox"
//                 ref={masterCheckboxRef}
//                 checked={allChecked}
//                 onChange={handleTabMasterCheck}
//                 className="form-checkbox h-4 w-4 text-green-500 mr-2"
//               />
//               <span className="font-medium mr-4">MODULE</span>
//               <span className="font-medium">PERMISSIONS</span>
//             </div>

//             {/* Module List */}
//             {isLoading ? (
//               <div className="text-center py-8">
//                 <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto"></div>
//                 <p className="mt-2 text-gray-600">Loading permissions...</p>
//               </div>
//             ) : (
//               <div className="divide-y">
//                 {PERMISSIONS_BY_TAB[activeTab].map((module) => {
//                   const moduleChecked = isModuleChecked(module);

//                   return (
//                     <div key={module.name} className="flex flex-col sm:flex-row px-4 py-3">
//                       <div className="flex items-center w-full sm:w-1/3 mb-2 sm:mb-0">
//                         <input
//                           type="checkbox"
//                           checked={moduleChecked}
//                           onChange={(e) => handleModuleCheck(module, e.target.checked)}
//                           className="form-checkbox h-4 w-4 text-green-500 mr-2"
//                         />

//                         <span className="font-medium">{module.name}</span>
//                       </div>

//                       <div className="flex flex-wrap gap-3 w-full sm:w-2/3">
//                         {module.actions.map((action) => {
//                           const perm = permissions.find(
//                             (p) => p.name.toLowerCase() === `${action} ${module.name}`.toLowerCase()
//                           );

//                           return (
//                             <label key={`${module.name}-${action}`} className="flex items-center">
//                               <input
//                                 type="checkbox"
//                                 checked={perm ? formData.permission_ids.includes(perm.id) : false}
//                                 onChange={() => perm && handleCheckboxChange(perm.id)}
//                                 disabled={!perm}
//                                 className={`form-checkbox h-4 w-4 text-green-500 mr-1 ${!perm ? 'opacity-50' : ''}`}
//                               />
//                               <span className="text-sm">{action}</span>
//                             </label>
//                           );
//                         })}
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>
//             )}
//           </div>
//         </div>

//         <div className="form-actions flex justify-end space-x-2">
//           <button
//             type="submit"
//             className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
//           >
//             Save
//           </button>
//           <button
//             type="button"
//             className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
//             onClick={onClose}
//           >
//             Cancel
//           </button>
//         </div>
//       </form>
//     </Modal>
//   );
// };

// export default RoleFormModal;

// import React, { useEffect, useState, useRef } from "react";
// import Modal from "react-modal";
// import { createRole, updateRole, fetchPermissions } from "../../../services/roleService";
// import './RoleFormModal.css';

// Modal.setAppElement("#root");
// const normalizePermission = (name) =>
//   name.toLowerCase().replace(/[\s_-]+/g, ' ').trim();

// const PERMISSIONS_BY_TAB = {
//   Staff: [
//     { name: "User", actions: ["Manage", "Create", "Edit", "Delete"] },
//     { name: "Role", actions: ["Manage", "Create", "Edit", "Delete"] },
//     { name: "Client", actions: ["Manage", "Create", "Edit", "Delete"] },
//     { name: "Product & service", actions: ["Manage", "Create", "Edit", "Delete"] },
//     { name: "Constant unit", actions: ["Manage", "Create", "Edit", "Delete"] },
//     { name: "Constant tax", actions: ["Manage", "Create", "Edit", "Delete"] },
//     { name: "Constant category", actions: ["Manage", "Create", "Edit", "Delete"] },
//     { name: "Zoom meeting", actions: ["Manage", "Create", "Delete", "Show"] },
//     { name: "Company settings", actions: ["Manage"] },
//     { name: "Permission", actions: ["Manage", "Create", "Edit", "Delete"] },
//   ],
//   CRM: [
//     { name: "Crm dashboard", actions: ["Show"] },
//     { name: "Lead", actions: ["View", "Move", "Manage", "Create", "Edit", "Delete"] },
//     { name: "Convert", actions: ["lead to deal"] },
//     { name: "Pipeline", actions: ["Manage", "Create", "Edit", "Delete"] },
//     { name: "Lead stage", actions: ["Manage", "Create", "Edit", "Delete"] },
//     { name: "Source", actions: ["Manage", "Create", "Edit", "Delete"] },
//     { name: "Label", actions: ["Manage", "Create", "Edit", "Delete"] },
//     { name: "Lead email", actions: ["Create"] },
//     { name: "Lead call", actions: ["Create", "Edit", "Delete"] },
//     { name: "Deal", actions: ["View", "Move", "Manage", "Create", "Edit", "Delete"] },
//     { name: "Stage", actions: ["Manage", "Create", "Edit", "Delete"] },
//     { name: "Task", actions: ["View", "Create", "Edit", "Delete"] },
//     { name: "Form builder", actions: ["Manage", "Create", "Edit", "Delete"] },
//     { name: "Form response", actions: ["View"] },
//     { name: "Form field", actions: ["Manage", "Create", "Edit", "Delete"] },
//     { name: "Contract", actions: ["Manage", "Create", "Edit", "Delete", "Show"] },
//     { name: "Contract type", actions: ["Manage", "Create", "Edit", "Delete"] },
//   ],
//   Project: [
//     { name: "Project dashboard", actions: ["Show"] },
//     { name: "Project", actions: ["View", "Manage", "Create", "Edit", "Delete"] },
//     { name: "Milestone", actions: ["View", "Create", "Edit", "Delete"] },
//     { name: "Grant chart", actions: ["View"] },
//     { name: "Project stage", actions: ["Manage", "Create", "Edit", "Delete"] },
//     { name: "Timesheet", actions: ["View", "Manage", "Create", "Edit", "Delete"] },
//     { name: "Project expense", actions: ["Manage", "Create", "Edit", "Delete"] },
//     { name: "Project task", actions: ["View", "Manage", "Create", "Edit", "Delete"] },
//     { name: "Activity", actions: ["View"] },
//     { name: "CRM activity", actions: ["View"] },
//     { name: "Project task stage", actions: ["Manage", "Create", "Edit", "Delete"] },
//     { name: "Bug report", actions: ["Move", "Manage", "Create", "Edit", "Delete"] },
//     { name: "Bug status", actions: ["Manage", "Create", "Edit", "Delete"] },
//   ],
//   HRM: [
//     { name: "Hrm dashboard", actions: ["Show"] },
//     { name: "Employee", actions: ["View", "Manage", "Create", "Edit", "Delete"] },
//     { name: "Employee profile", actions: ["Manage", "Show"] },
//     { name: "Department", actions: ["View", "Manage", "Create", "Edit", "Delete"] },
//     { name: "Designation", actions: ["View", "Manage", "Create", "Edit", "Delete"] },
//     { name: "Branch", actions: ["Manage", "Create", "Edit", "Delete"] },
//     { name: "Document type", actions: ["Manage", "Create", "Edit", "Delete"] },
//     { name: "Document", actions: ["Manage", "Create", "Edit", "Delete"] },
//     { name: "Payslip type", actions: ["Manage", "Create", "Edit", "Delete"] },
//     { name: "Allowance", actions: ["Create", "Edit", "Delete"] },
//     { name: "Commission", actions: ["Create", "Edit", "Delete"] },
//     { name: "Allowance option", actions: ["Manage", "Create", "Edit", "Delete"] },
//     { name: "Loan option", actions: ["Manage", "Create", "Edit", "Delete"] },
//     { name: "Deduction option", actions: ["Manage", "Create", "Edit", "Delete"] },
//     { name: "Loan", actions: ["Create", "Edit", "Delete"] },
//     { name: "Saturation deduction", actions: ["Create", "Edit", "Delete"] },
//     { name: "Other payment", actions: ["Create", "Edit", "Delete"] },
//     { name: "Overtime", actions: ["Create", "Edit", "Delete"] },
//     { name: "Set salary", actions: ["Manage", "Create", "Edit"] },
//     { name: "Pay slip", actions: ["Manage", "Create"] },
//     { name: "Company policy", actions: ["Manage", "Create", "Edit", "Delete"] },
//     { name: "Appraisal", actions: ["Manage", "Create", "Edit", "Delete", "Show"] },
//     { name: "Goal tracking", actions: ["Manage", "Create", "Edit", "Delete"] },
//     { name: "Goal type", actions: ["Manage", "Create", "Edit", "Delete"] },
//     { name: "Indicator", actions: ["Manage", "Create", "Edit", "Delete", "Show"] },
//     { name: "Event", actions: ["Manage", "Create", "Edit", "Delete"] },
//     { name: "Meeting", actions: ["Manage", "Create", "Edit", "Delete"] },
//     { name: "Training", actions: ["Manage", "Create", "Edit", "Delete", "Show"] },
//     { name: "Trainer", actions: ["Manage", "Create", "Edit", "Delete"] },
//     { name: "Training type", actions: ["Manage", "Create", "Edit", "Delete"] },
//     { name: "Award", actions: ["Manage", "Create", "Edit", "Delete"] },
//     { name: "Award type", actions: ["Manage", "Create", "Edit", "Delete"] },
//     { name: "Resignation", actions: ["Manage", "Create", "Edit", "Delete"] },
//     { name: "Travel", actions: ["Manage", "Create", "Edit", "Delete"] },
//     { name: "Promotion", actions: ["Manage", "Create", "Edit", "Delete"] },
//     { name: "Complaint", actions: ["Manage", "Create", "Edit", "Delete"] },
//     { name: "Warning", actions: ["Manage", "Create", "Edit", "Delete"] },
//     { name: "Termination", actions: ["Manage", "Create", "Edit", "Delete"] },
//     { name: "Termination type", actions: ["Manage", "Create", "Edit", "Delete"] },
//     { name: "Job application", actions: ["Move", "Manage", "Create", "Delete", "Show"] },
//     { name: "Job application note", actions: ["Add", "Delete"] },
//     { name: "Job onBoard", actions: ["Manage"] },
//     { name: "Job category", actions: ["Manage", "Create", "Edit", "Delete"] },
//     { name: "Job", actions: ["Manage", "Create", "Edit", "Delete", "Show"] },
//     { name: "Job stage", actions: ["Manage", "Create", "Edit", "Delete"] },
//     { name: "Custom question", actions: ["Manage", "Create", "Edit", "Delete"] },
//     { name: "Interview schedule", actions: ["Create", "Edit", "Delete", "Show"] },
//     { name: "Career", actions: ["Show"] },
//     { name: "Estimation", actions: ["View", "Create", "Edit", "Delete"] },
//     { name: "Holiday", actions: ["Manage", "Create", "Edit", "Delete"] },
//     { name: "Transfer", actions: ["Manage", "Create", "Edit", "Delete"] },
//     { name: "Announcement", actions: ["Manage", "Create", "Edit", "Delete"] },
//     { name: "Leave", actions: ["Manage", "Create", "Edit", "Delete"] },
//     { name: "Leave type", actions: ["Manage", "Create", "Edit", "Delete"] },
//     { name: "Attendance", actions: ["Manage", "Create", "Edit", "Delete"] },
//   ],
//   Account: [
//     { name: "Account dashboard", actions: ["Show"] },
//     { name: "Proposal", actions: ["Manage", "Create", "Edit", "Delete", "Show", "Send", "Duplicate"] },
//     { name: "Invoice", actions: ["Manage", "Create", "Edit", "Delete", "Show", "Send", "Create Payment", "Delete Payment", "Duplicate", "convert", "copy"] },
//     { name: "Bill", actions: ["Manage", "Create", "Edit", "Delete", "Show", "Send", "Create Payment", "Delete Payment", "Duplicate"] },
//     { name: "Revenue", actions: ["Manage", "Create", "Edit", "Delete"] },
//     { name: "Payment", actions: ["Manage", "Create", "Edit", "Delete"] },
//     { name: "Proposal product", actions: ["Delete"] },
//     { name: "Invoice product", actions: ["Delete"] },
//     { name: "Bill product", actions: ["Delete"] },
//     { name: "Goal", actions: ["Manage", "Create", "Edit", "Delete"] },
//     { name: "Credit note", actions: ["Manage", "Create", "Edit", "Delete"] },
//     { name: "Debit note", actions: ["Manage", "Create", "Edit", "Delete"] },
//     { name: "Bank account", actions: ["Manage", "Create", "Edit", "Delete"] },
//     { name: "Bank transfer", actions: ["Manage", "Create", "Edit", "Delete"] },
//     { name: "Transaction", actions: ["Manage"] },
//     { name: "Customer", actions: ["Manage", "Create", "Edit", "Delete", "Show"] },
//     { name: "Vender", actions: ["Manage", "Create", "Edit", "Delete", "Show"] },
//     { name: "Constant custom field", actions: ["Manage", "Create", "Edit", "Delete"] },
//     { name: "Assets", actions: ["Manage", "Create", "Edit", "Delete"] },
//     { name: "Chart of account", actions: ["Manage", "Create", "Edit", "Delete"] },
//     { name: "Journal entry", actions: ["Manage", "Create", "Edit", "Delete", "Show"] },
//     { name: "Report", actions: ["Manage", "Income", "Expense", "Loss & Profit", "Tax", "Invoice", "Bill", "Balance Sheet", "Ledger", "Trial Balance", "Income VS Expense"] },
//     { name: "Job Mode", actions: ["Manage", "Create", "Edit", "Delete"] },
//     { name: "Plant Name", actions: ["Manage", "Create", "Edit", "Delete"] },
//     { name: "Contract Period", actions: ["Manage", "Create", "Edit", "Delete"] },
//     { name: "Base Amount", actions: ["Manage", "Create", "Edit", "Delete"] },
//     { name: "Deduction Payment Done", actions: ["Manage", "Create", "Edit", "Delete"] },
//     { name: "Payment Received", actions: ["Manage", "Create", "Edit", "Delete"] },
//     { name: "Working Zone", actions: ["Manage", "Create", "Edit", "Delete"] },
//     { name: "vendor", actions: ["Manage", "Create", "Edit", "Delete"] },
//     { name: "manpower_salary", actions: ["Manage", "Create", "Edit", "Delete"] },
//     { name: "month", actions: ["Manage", "Create", "Edit", "Delete"] },
//     { name: "Report Plant Wise", actions: ["Manage"] },
//     // { name: "manage plant wise manpower salary reports", actions: ["Manage"] },
//     { name: "Plant Wise Manpower Salary Reports", actions: ["Manage"] },
//     { name: "Branch Wallet", actions: ["Manage", "Create", "Edit", "Delete"] },

//     { name: "Purchase Order", actions: ["Manage", "Create", "Edit", "Delete"] },
//     { name: "Work Order", actions: ["Manage", "Create", "Edit", "Delete"] },
//     { name: "Expense", actions: ["Manage", "Create", "Edit", "Delete"] },
//     { name: "Fund Request", actions: ["Manage", "Create", "Edit"] },
//   ],
//   POS: [
//     { name: "Pos dashboard", actions: ["Show"] },
//     { name: "Warehouse", actions: ["Manage", "Create", "Edit", "Delete", "Show"] },
//     { name: "Quotation", actions: ["Manage", "Create", "Edit", "Delete", "Show", "convert"] },
//     { name: "Purchase", actions: ["Manage", "Create", "Edit", "Delete", "Show", "Send", "Create Payment", "Delete Payment"] },
//     { name: "Pos", actions: ["Manage", "Show"] },
//     { name: "Barcode", actions: ["Create"] },
//   ]
// };

// const RoleFormModal = ({ isOpen, onClose, onSuccess, role }) => {
//   const [name, setName] = useState("");
//   const [activeTab, setActiveTab] = useState("Staff");
//   const [permissions, setPermissions] = useState([]);
//   const [formData, setFormData] = useState({ permission_ids: [] });
//   const [isLoading, setIsLoading] = useState(true);
//   const masterCheckboxRef = useRef(null);

//   useEffect(() => {
//     const loadPermissions = async () => {
//       setIsLoading(true);
//       try {
//         const data = await fetchPermissions();
//         console.log("Permissions from API:", data.map(p => p.name));
//         setPermissions(data);
//       } catch (err) {
//         console.error("Permission fetch failed", err);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     if (isOpen) {
//       loadPermissions();
//     }
//   }, [isOpen]);

//   useEffect(() => {
//     if (role) {
//       setName(role.name || "");
//       setFormData({ permission_ids: (role.permissions || []).map(p => p.id) });
//     } else {
//       setName("");
//       setFormData({ permission_ids: [] });
//     }
//   }, [role]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const payload = {
//       name,
//       permissions: formData.permission_ids,
//       guard_name: "web"
//     };
//     try {
//       if (role?.id) {
//         await updateRole(role.id, payload);
//       } else {
//         await createRole(payload);
//       }
//       onClose();
//       onSuccess();
//     } catch (err) {
//       console.error("Failed to save role:", err);
//     }
//   };

//   const handleCheckboxChange = (id) => {
//     setFormData((prev) => ({
//       ...prev,
//       permission_ids: prev.permission_ids.includes(id)
//         ? prev.permission_ids.filter((pid) => pid !== id)
//         : [...prev.permission_ids, id],
//     }));
//   };

//   const findPermission = (action, moduleName) => {
//     const expectedName = `${action} ${moduleName}`.toLowerCase().replace(/[\s_-]+/g, ' ').trim();

//     return permissions.find(p => {
//       const normalizedPermission = p.name.toLowerCase().replace(/[\s_-]+/g, ' ').trim();
//       return normalizedPermission === expectedName;
//     });
//   };

//   const handleModuleCheck = (module, checked) => {
//     const updatedPermissions = [...formData.permission_ids];

//     module.actions.forEach((action) => {
//       const perm = findPermission(action, module.name);

//       if (perm) {
//         if (checked && !updatedPermissions.includes(perm.id)) {
//           updatedPermissions.push(perm.id);
//         } else if (!checked && updatedPermissions.includes(perm.id)) {
//           const idx = updatedPermissions.indexOf(perm.id);
//           updatedPermissions.splice(idx, 1);
//         }
//       } else {
//         console.log(`Permission not found: ${action} ${module.name}`);
//       }
//     });

//     setFormData({ ...formData, permission_ids: updatedPermissions });
//   };

//   const handleTabMasterCheck = () => {
//     const allIds = PERMISSIONS_BY_TAB[activeTab].flatMap((module) =>
//       module.actions
//         .map((action) => {
//           const perm = findPermission(action, module.name);
//           return perm ? perm.id : null;
//         })
//         .filter(Boolean)
//     );

//     if (allIds.length === 0) return;

//     const isAllChecked = allIds.every((id) =>
//       formData.permission_ids.includes(id)
//     );

//     const updated = isAllChecked
//       ? formData.permission_ids.filter((id) => !allIds.includes(id))
//       : [...new Set([...formData.permission_ids, ...allIds])];

//     setFormData((prev) => ({ ...prev, permission_ids: updated }));
//   };

//   const allPermissionIds = PERMISSIONS_BY_TAB[activeTab].flatMap((module) =>
//     module.actions
//       .map((action) => {
//         const perm = findPermission(action, module.name);
//         return perm ? perm.id : null;
//       })
//       .filter(Boolean)
//   );

//   const allChecked =
//     allPermissionIds.length > 0 &&
//     allPermissionIds.every((id) => formData.permission_ids.includes(id));
//   const someChecked =
//     !allChecked &&
//     allPermissionIds.some((id) => formData.permission_ids.includes(id));

//   useEffect(() => {
//     if (masterCheckboxRef.current) {
//       masterCheckboxRef.current.indeterminate = someChecked;
//     }
//   }, [someChecked, formData]);

//   const isModuleChecked = (module) => {
//     return module.actions.some((action) => {
//       const perm = findPermission(action, module.name);
//       return perm && formData.permission_ids.includes(perm.id);
//     });
//   };

//   return (
//     <Modal
//       isOpen={isOpen}
//       onRequestClose={onClose}
//       contentLabel="Role Form"
//       className="role-modal"
//       overlayClassName="modal-overlay"
//     >
//       <h3 className="text-xl font-semibold mb-4">
//         {role ? "Edit Role" : "Create New Role"}
//       </h3>
//       <form onSubmit={handleSubmit}>
//         <div className="form-group mb-6">
//           <label className="block font-medium mb-1">Name *</label>
//           <input
//             value={name}
//             onChange={(e) => setName(e.target.value)}
//             required
//             className="w-full border px-3 py-2 rounded"
//           />
//         </div>

//         {/* Tabs Section */}
//         <div className="flex flex-wrap gap-2 mb-4">
//           {Object.keys(PERMISSIONS_BY_TAB).map((tab) => (
//             <button
//               key={tab}
//               type="button"
//               className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === tab
//                 ? "bg-blue-500 text-white"
//                 : "bg-gray-200 text-gray-700 hover:bg-gray-300"
//                 }`}
//               onClick={() => setActiveTab(tab)}
//             >
//               {tab}
//             </button>
//           ))}
//         </div>

//         <div className="mb-6">
//           <h2 className="text-lg font-semibold mb-3">
//             {activeTab === "Staff" && "Assign General Permission to Roles"}
//             {activeTab === "CRM" && "Assign CRM related Permission to Roles"}
//             {activeTab === "Project" && "Assign Project related Permission to Roles"}
//             {activeTab === "HRM" && "Assign HRM related Permission to Roles"}
//             {activeTab === "Account" && "Assign Account related Permission to Roles"}
//             {activeTab === "POS" && "Assign POS related Permission to Roles"}
//           </h2>

//           <div className="border rounded overflow-hidden">
//             {/* Header */}
//             <div className="flex items-center px-4 py-2 bg-gray-100 border-b">
//               <input
//                 type="checkbox"
//                 ref={masterCheckboxRef}
//                 checked={allChecked}
//                 onChange={handleTabMasterCheck}
//                 className="form-checkbox h-4 w-4 text-green-500 mr-2"
//               />
//               <span className="font-medium mr-4">MODULE</span>
//               <span className="font-medium">PERMISSIONS</span>
//             </div>

//             {/* Module List */}
//             {isLoading ? (
//               <div className="text-center py-8">
//                 <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto"></div>
//                 <p className="mt-2 text-gray-600">Loading permissions...</p>
//               </div>
//             ) : (
//               <div className="divide-y">
//                 {PERMISSIONS_BY_TAB[activeTab].map((module) => {
//                   const moduleChecked = isModuleChecked(module);

//                   return (
//                     <div key={module.name} className="flex flex-col sm:flex-row px-4 py-3">
//                       <div className="flex items-center w-full sm:w-1/3 mb-2 sm:mb-0">
//                         <input
//                           type="checkbox"
//                           checked={moduleChecked}
//                           onChange={(e) => handleModuleCheck(module, e.target.checked)}
//                           className="form-checkbox h-4 w-4 text-green-500 mr-2"
//                         />

//                         <span className="font-medium">{module.name}</span>
//                       </div>

//                       <div className="flex flex-wrap gap-3 w-full sm:w-2/3">
//                         {module.actions.map((action) => {
//                           const perm = findPermission(action, module.name);

//                           return (
//                             <label key={`${module.name}-${action}`} className="flex items-center">
//                               <input
//                                 type="checkbox"
//                                 checked={perm ? formData.permission_ids.includes(perm.id) : false}
//                                 onChange={() => perm && handleCheckboxChange(perm.id)}
//                                 disabled={!perm}
//                                 className={`form-checkbox h-4 w-4 text-green-500 mr-1 ${!perm ? 'opacity-50' : ''}`}
//                               />
//                               <span className="text-sm">{action}</span>
//                             </label>
//                           );
//                         })}
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>
//             )}
//           </div>
//         </div>

//         <div className="form-actions flex justify-end space-x-2">
//           <button
//             type="submit"
//             className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
//           >
//             Save
//           </button>
//           <button
//             type="button"
//             className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
//             onClick={onClose}
//           >
//             Cancel
//           </button>
//         </div>
//       </form>
//     </Modal>
//   );
// };

// export default RoleFormModal;

import React, { useEffect, useState, useRef } from "react";
import Modal from "react-modal";
import {
  createRole,
  updateRole,
  fetchPermissions,
} from "../../../services/roleService";
import "./RoleFormModal.css";
import { toast } from "react-toastify";

Modal.setAppElement("#root");
const normalizePermission = (name) =>
  name
    .toLowerCase()
    .replace(/[\s_-]+/g, " ")
    .trim();

const PERMISSIONS_BY_TAB = {
  Staff: [
    { name: "User", actions: ["Manage", "Create", "Edit", "Delete"] },
    { name: "Role", actions: ["Manage", "Create", "Edit", "Delete"] },
    { name: "Client", actions: ["Manage", "Create", "Edit", "Delete"] },
    {
      name: "Product & service",
      actions: ["Manage", "Create", "Edit", "Delete"],
    },
    { name: "Constant unit", actions: ["Manage", "Create", "Edit", "Delete"] },
    { name: "Constant tax", actions: ["Manage", "Create", "Edit", "Delete"] },
    {
      name: "Constant category",
      actions: ["Manage", "Create", "Edit", "Delete"],
    },
    { name: "Zoom meeting", actions: ["Manage", "Create", "Delete", "Show"] },
    { name: "Company settings", actions: ["Manage"] },
    { name: "Permission", actions: ["Manage", "Create", "Edit", "Delete"] },
  ],
  CRM: [
    { name: "Crm dashboard", actions: ["Show"] },
    {
      name: "Lead",
      actions: ["View", "Move", "Manage", "Create", "Edit", "Delete"],
    },
    { name: "Convert", actions: ["lead to deal"] },
    { name: "Pipeline", actions: ["Manage", "Create", "Edit", "Delete"] },
    { name: "Lead stage", actions: ["Manage", "Create", "Edit", "Delete"] },
    { name: "Source", actions: ["Manage", "Create", "Edit", "Delete"] },
    { name: "Label", actions: ["Manage", "Create", "Edit", "Delete"] },
    { name: "Lead email", actions: ["Create"] },
    { name: "Lead call", actions: ["Create", "Edit", "Delete"] },
    {
      name: "Deal",
      actions: ["View", "Move", "Manage", "Create", "Edit", "Delete"],
    },
    { name: "Stage", actions: ["Manage", "Create", "Edit", "Delete"] },
    { name: "Task", actions: ["View", "Create", "Edit", "Delete"] },
    { name: "Form builder", actions: ["Manage", "Create", "Edit", "Delete"] },
    { name: "Form response", actions: ["View"] },
    { name: "Form field", actions: ["Manage", "Create", "Edit", "Delete"] },
    {
      name: "Contract",
      actions: ["Manage", "Create", "Edit", "Delete", "Show"],
    },
    { name: "Contract type", actions: ["Manage", "Create", "Edit", "Delete"] },
  ],
  Project: [
    { name: "Project dashboard", actions: ["Show"] },
    {
      name: "Project",
      actions: ["View", "Manage", "Create", "Edit", "Delete"],
    },
    { name: "Milestone", actions: ["View", "Create", "Edit", "Delete"] },
    { name: "Grant chart", actions: ["View"] },
    { name: "Project stage", actions: ["Manage", "Create", "Edit", "Delete"] },
    {
      name: "Timesheet",
      actions: ["View", "Manage", "Create", "Edit", "Delete"],
    },
    {
      name: "Project expense",
      actions: ["Manage", "Create", "Edit", "Delete"],
    },
    {
      name: "Project task",
      actions: ["View", "Manage", "Create", "Edit", "Delete"],
    },
    { name: "Activity", actions: ["View"] },
    { name: "CRM activity", actions: ["View"] },
    {
      name: "Project task stage",
      actions: ["Manage", "Create", "Edit", "Delete"],
    },
    {
      name: "Bug report",
      actions: ["Move", "Manage", "Create", "Edit", "Delete"],
    },
    { name: "Bug status", actions: ["Manage", "Create", "Edit", "Delete"] },
  ],
  HRM: [
    { name: "Hrm dashboard", actions: ["Show"] },
    {
      name: "Employee",
      actions: ["View", "Manage", "Create", "Edit", "Delete"],
    },
    { name: "Employee profile", actions: ["Manage", "Show"] },
    {
      name: "Department",
      actions: ["View", "Manage", "Create", "Edit", "Delete"],
    },
    {
      name: "Designation",
      actions: ["View", "Manage", "Create", "Edit", "Delete"],
    },
    { name: "Branch", actions: ["Manage", "Create", "Edit", "Delete"] },
    { name: "Document type", actions: ["Manage", "Create", "Edit", "Delete"] },
    { name: "Document", actions: ["Manage", "Create", "Edit", "Delete"] },
    { name: "Payslip type", actions: ["Manage", "Create", "Edit", "Delete"] },
    { name: "Allowance", actions: ["Create", "Edit", "Delete"] },
    { name: "Commission", actions: ["Create", "Edit", "Delete"] },
    {
      name: "Allowance option",
      actions: ["Manage", "Create", "Edit", "Delete"],
    },
    { name: "Loan option", actions: ["Manage", "Create", "Edit", "Delete"] },
    {
      name: "Deduction option",
      actions: ["Manage", "Create", "Edit", "Delete"],
    },
    { name: "Loan", actions: ["Create", "Edit", "Delete"] },
    { name: "Saturation deduction", actions: ["Create", "Edit", "Delete"] },
    { name: "Other payment", actions: ["Create", "Edit", "Delete"] },
    { name: "Overtime", actions: ["Create", "Edit", "Delete"] },
    { name: "Set salary", actions: ["Manage", "Create", "Edit"] },
    { name: "Pay slip", actions: ["Manage", "Create"] },
    { name: "Company policy", actions: ["Manage", "Create", "Edit", "Delete"] },
    {
      name: "Appraisal",
      actions: ["Manage", "Create", "Edit", "Delete", "Show"],
    },
    { name: "Goal tracking", actions: ["Manage", "Create", "Edit", "Delete"] },
    { name: "Goal type", actions: ["Manage", "Create", "Edit", "Delete"] },
    {
      name: "Indicator",
      actions: ["Manage", "Create", "Edit", "Delete", "Show"],
    },
    { name: "Event", actions: ["Manage", "Create", "Edit", "Delete"] },
    { name: "Meeting", actions: ["Manage", "Create", "Edit", "Delete"] },
    {
      name: "Training",
      actions: ["Manage", "Create", "Edit", "Delete", "Show"],
    },
    { name: "Trainer", actions: ["Manage", "Create", "Edit", "Delete"] },
    { name: "Training type", actions: ["Manage", "Create", "Edit", "Delete"] },
    { name: "Award", actions: ["Manage", "Create", "Edit", "Delete"] },
    { name: "Award type", actions: ["Manage", "Create", "Edit", "Delete"] },
    { name: "Resignation", actions: ["Manage", "Create", "Edit", "Delete"] },
    { name: "Travel", actions: ["Manage", "Create", "Edit", "Delete"] },
    { name: "Promotion", actions: ["Manage", "Create", "Edit", "Delete"] },
    { name: "Complaint", actions: ["Manage", "Create", "Edit", "Delete"] },
    { name: "Warning", actions: ["Manage", "Create", "Edit", "Delete"] },
    { name: "Termination", actions: ["Manage", "Create", "Edit", "Delete"] },
    {
      name: "Termination type",
      actions: ["Manage", "Create", "Edit", "Delete"],
    },
    {
      name: "Job application",
      actions: ["Move", "Manage", "Create", "Delete", "Show"],
    },
    { name: "Job application note", actions: ["Add", "Delete"] },
    { name: "Job onBoard", actions: ["Manage"] },
    { name: "Job category", actions: ["Manage", "Create", "Edit", "Delete"] },
    { name: "Job", actions: ["Manage", "Create", "Edit", "Delete", "Show"] },
    { name: "Job stage", actions: ["Manage", "Create", "Edit", "Delete"] },
    {
      name: "Custom question",
      actions: ["Manage", "Create", "Edit", "Delete"],
    },
    {
      name: "Interview schedule",
      actions: ["Create", "Edit", "Delete", "Show"],
    },
    { name: "Career", actions: ["Show"] },
    { name: "Estimation", actions: ["View", "Create", "Edit", "Delete"] },
    { name: "Holiday", actions: ["Manage", "Create", "Edit", "Delete"] },
    { name: "Transfer", actions: ["Manage", "Create", "Edit", "Delete"] },
    { name: "Announcement", actions: ["Manage", "Create", "Edit", "Delete"] },
    { name: "Leave", actions: ["Manage", "Create", "Edit", "Delete"] },
    { name: "Leave type", actions: ["Manage", "Create", "Edit", "Delete"] },
    { name: "Attendance", actions: ["Manage", "Create", "Edit", "Delete"] },
  ],
  Account: [
    { name: "Account dashboard", actions: ["Show"] },
    {
      name: "Proposal",
      actions: [
        "Manage",
        "Create",
        "Edit",
        "Delete",
        "Show",
        "Send",
        "Duplicate",
      ],
    },
    {
      name: "Invoice",
      actions: [
        "Manage",
        "Create",
        "Edit",
        "Delete",
        "Show",
        "Send",
        "Create Payment",
        "Delete Payment",
        "Duplicate",
        "convert",
        "copy",
      ],
    },
    {
      name: "Bill",
      actions: [
        "Manage",
        "Create",
        "Edit",
        "Delete",
        "Show",
        "Send",
        "Create Payment",
        "Delete Payment",
        "Duplicate",
      ],
    },
    {
      name: "Sale Bill",
      actions: ["Manage", "Create", "Edit", "Delete"],
    },
    {
      name: "Proforma Bill",
      actions: ["Manage", "Create", "Edit", "Delete"],
    },
    { name: "Revenue", actions: ["Manage", "Create", "Edit", "Delete"] },
    { name: "Payment", actions: ["Manage", "Create", "Edit", "Delete"] },
    { name: "Proposal product", actions: ["Delete"] },
    { name: "Invoice product", actions: ["Delete"] },
    { name: "Bill product", actions: ["Delete"] },
    { name: "Goal", actions: ["Manage", "Create", "Edit", "Delete"] },
    { name: "Credit note", actions: ["Manage", "Create", "Edit", "Delete"] },
    { name: "Debit note", actions: ["Manage", "Create", "Edit", "Delete"] },
    { name: "Bank account", actions: ["Manage", "Create", "Edit", "Delete"] },
    { name: "Bank transfer", actions: ["Manage", "Create", "Edit", "Delete"] },
    { name: "Transaction", actions: ["Manage"] },
    {
      name: "Customer",
      actions: ["Manage", "Create", "Edit", "Delete", "Show"],
    },
    { name: "Vender", actions: ["Manage", "Create", "Edit", "Delete", "Show"] },
    {
      name: "Constant custom field",
      actions: ["Manage", "Create", "Edit", "Delete"],
    },
    { name: "Assets", actions: ["Manage", "Create", "Edit", "Delete"] },
    {
      name: "Chart of account",
      actions: ["Manage", "Create", "Edit", "Delete"],
    },
    {
      name: "Journal entry",
      actions: ["Manage", "Create", "Edit", "Delete", "Show"],
    },
    {
      name: "Report",
      actions: [
        "Manage",
        "Income",
        "Expense",
        "Loss & Profit",
        "Tax",
        "Invoice",
        "Bill",
        "Balance Sheet",
        "Ledger",
        "Trial Balance",
        "Income VS Expense",
      ],
    },
    { name: "Job Mode", actions: ["Manage", "Create", "Edit", "Delete"] },
    { name: "Plant Name", actions: ["Manage", "Create", "Edit", "Delete"] },
    {
      name: "Contract Period",
      actions: ["Manage", "Create", "Edit", "Delete"],
    },
    { name: "Base Amount", actions: ["Manage", "Create", "Edit", "Delete"] },
    {
      name: "Deduction Payment Done",
      actions: ["Manage", "Create", "Edit", "Delete"],
    },
    {
      name: "Payment Received",
      actions: ["Manage", "Create", "Edit", "Delete"],
    },
    { name: "Working Zone", actions: ["Manage", "Create", "Edit", "Delete"] },
    { name: "vendor", actions: ["Manage", "Create", "Edit", "Delete"] },
    {
      name: "manpower_salary",
      actions: ["Manage", "Create", "Edit", "Delete"],
    },
    { name: "month", actions: ["Manage", "Create", "Edit", "Delete"] },
    { name: "Report Plant Wise", actions: ["Manage"] },
    // { name: "manage plant wise manpower salary reports", actions: ["Manage"] },
    { name: "Plant Wise Manpower Salary Reports", actions: ["Manage"] },
    { name: "Branch Wallet", actions: ["Manage", "Create", "Edit", "Delete"] },
    { name: "Credit Purchase", actions: ["Manage", "Create", "Edit"] },

    { name: "Purchase Order", actions: ["Manage", "Create", "Edit", "Delete"] },
    { name: "Work Order", actions: ["Manage", "Create", "Edit", "Delete"] },
    { name: "Expense", actions: ["Manage", "Create", "Edit", "Delete"] },
    { name: "Fund Request", actions: ["Manage", "Create", "Edit"] },
    {
      name: "Work Order Invoice",
      actions: ["Manage", "Create", "Edit", "Delete"],
    },
    {
      name: "Purchase Order Invoice",
      actions: ["Manage", "Create", "Edit", "Delete"],
    },
    { name: "Income", actions: ["Manage", "Create", "Edit", "Delete"] },
  ],
  POS: [
    { name: "Pos dashboard", actions: ["Show"] },
    {
      name: "Warehouse",
      actions: ["Manage", "Create", "Edit", "Delete", "Show"],
    },
    {
      name: "Quotation",
      actions: ["Manage", "Create", "Edit", "Delete", "Show", "convert"],
    },
    {
      name: "Purchase",
      actions: [
        "Manage",
        "Create",
        "Edit",
        "Delete",
        "Show",
        "Send",
        "Create Payment",
        "Delete Payment",
      ],
    },
    { name: "Pos", actions: ["Manage", "Show"] },
    { name: "Barcode", actions: ["Create"] },
  ],
};

const RoleFormModal = ({ isOpen, onClose, onSuccess, role }) => {
  const [name, setName] = useState("");
  const [activeTab, setActiveTab] = useState("Staff");
  const [permissions, setPermissions] = useState([]);
  const [formData, setFormData] = useState({ permission_ids: [] });
  const [isLoading, setIsLoading] = useState(true);
  const masterCheckboxRef = useRef(null);

  const [animateClass, setAnimateClass] = useState("");
  const [internalOpen, setInternalOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setInternalOpen(true);
      setTimeout(() => setAnimateClass("open"), 10); // tiny delay
    } else if (internalOpen) {
      setAnimateClass("closing");
      const timer = setTimeout(() => {
        setAnimateClass("");
        setInternalOpen(false); // actually close modal after animation
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    const loadPermissions = async () => {
      setIsLoading(true);
      try {
        const data = await fetchPermissions();
        console.log(
          "Permissions from API:",
          data.map((p) => p.name)
        );
        setPermissions(data);
      } catch (err) {
        console.error("Permission fetch failed", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      loadPermissions();
    }
  }, [isOpen]);

  useEffect(() => {
    if (role) {
      setName(role.name || "");
      setFormData({
        permission_ids: (role.permissions || []).map((p) => p.id),
      });
    } else {
      setName("");
      setFormData({ permission_ids: [] });
    }
  }, [role]);

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   const payload = {
  //     name,
  //     permissions: formData.permission_ids,
  //     guard_name: "web"
  //   };
  //   try {
  //     if (role?.id) {
  //       await updateRole(role.id, payload);
  //     } else {
  //       await createRole(payload);
  //     }
  //     onClose();
  //     onSuccess();
  //   } catch (err) {
  //     console.error("Failed to save role:", err);
  //   }
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name,
      permissions: formData.permission_ids,
      guard_name: "web",
    };

    try {
      if (role?.id) {
        await updateRole(role.id, payload);
        toast.success("Role updated successfully!", { icon: false });
      } else {
        await createRole(payload);
        toast.success("Role added successfully!", { icon: false });
      }

      onClose();
      onSuccess();
    } catch (err) {
      console.error("Failed to save role:", err);
      toast.error("Failed to save role. Please try again.", { icon: false });
    }
  };

  const handleCheckboxChange = (id) => {
    setFormData((prev) => ({
      ...prev,
      permission_ids: prev.permission_ids.includes(id)
        ? prev.permission_ids.filter((pid) => pid !== id)
        : [...prev.permission_ids, id],
    }));
  };

  const findPermission = (action, moduleName) => {
    const expectedName = `${action} ${moduleName}`
      .toLowerCase()
      .replace(/[\s_-]+/g, " ")
      .trim();

    return permissions.find((p) => {
      const normalizedPermission = p.name
        .toLowerCase()
        .replace(/[\s_-]+/g, " ")
        .trim();
      return normalizedPermission === expectedName;
    });
  };

  const handleModuleCheck = (module, checked) => {
    const updatedPermissions = [...formData.permission_ids];

    module.actions.forEach((action) => {
      const perm = findPermission(action, module.name);

      if (perm) {
        if (checked && !updatedPermissions.includes(perm.id)) {
          updatedPermissions.push(perm.id);
        } else if (!checked && updatedPermissions.includes(perm.id)) {
          const idx = updatedPermissions.indexOf(perm.id);
          updatedPermissions.splice(idx, 1);
        }
      } else {
        console.log(`Permission not found: ${action} ${module.name}`);
      }
    });

    setFormData({ ...formData, permission_ids: updatedPermissions });
  };

  const handleTabMasterCheck = () => {
    const allIds = PERMISSIONS_BY_TAB[activeTab].flatMap((module) =>
      module.actions
        .map((action) => {
          const perm = findPermission(action, module.name);
          return perm ? perm.id : null;
        })
        .filter(Boolean)
    );

    if (allIds.length === 0) return;

    const isAllChecked = allIds.every((id) =>
      formData.permission_ids.includes(id)
    );

    const updated = isAllChecked
      ? formData.permission_ids.filter((id) => !allIds.includes(id))
      : [...new Set([...formData.permission_ids, ...allIds])];

    setFormData((prev) => ({ ...prev, permission_ids: updated }));
  };

  const allPermissionIds = PERMISSIONS_BY_TAB[activeTab].flatMap((module) =>
    module.actions
      .map((action) => {
        const perm = findPermission(action, module.name);
        return perm ? perm.id : null;
      })
      .filter(Boolean)
  );

  const allChecked =
    allPermissionIds.length > 0 &&
    allPermissionIds.every((id) => formData.permission_ids.includes(id));
  const someChecked =
    !allChecked &&
    allPermissionIds.some((id) => formData.permission_ids.includes(id));

  useEffect(() => {
    if (masterCheckboxRef.current) {
      masterCheckboxRef.current.indeterminate = someChecked;
    }
  }, [someChecked, formData]);

  const isModuleChecked = (module) => {
    return module.actions.some((action) => {
      const perm = findPermission(action, module.name);
      return perm && formData.permission_ids.includes(perm.id);
    });
  };

  return (
    <Modal
      isOpen={internalOpen}
      onRequestClose={onClose}
      contentLabel="Role Form"
      className={`role-modal ${animateClass}`}
      overlayClassName="modal-overlay"
    >
      <h3 className="text-xl font-semibold mb-4">
        {role ? "Edit Role" : "Create New Role"}
      </h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group mb-6">
          <label className="block font-medium mb-1">
            Name <span className="text-danger">*</span>
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        {/* Tabs Section */}
        <div className="flex flex-wrap gap-2 mb-4">
          {Object.keys(PERMISSIONS_BY_TAB).map((tab) => (
            <button
              key={tab}
              type="button"
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">
            {activeTab === "Staff" && "Assign General Permission to Roles"}
            {activeTab === "CRM" && "Assign CRM related Permission to Roles"}
            {activeTab === "Project" &&
              "Assign Project related Permission to Roles"}
            {activeTab === "HRM" && "Assign HRM related Permission to Roles"}
            {activeTab === "Account" &&
              "Assign Account related Permission to Roles"}
            {activeTab === "POS" && "Assign POS related Permission to Roles"}
          </h2>

          <div className="border rounded overflow-hidden">
            {/* Header */}
            <div className="flex items-center px-4 py-2 bg-gray-100 border-b">
              <input
                type="checkbox"
                ref={masterCheckboxRef}
                checked={allChecked}
                onChange={handleTabMasterCheck}
                className="form-checkbox h-4 w-4 text-green-500 mr-2"
              />
              <span className="font-medium mr-4">MODULE</span>
              <span className="font-medium">PERMISSIONS</span>
            </div>

            {/* Module List */}
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading permissions...</p>
              </div>
            ) : (
              <div className="divide-y">
                {PERMISSIONS_BY_TAB[activeTab].map((module) => {
                  const moduleChecked = isModuleChecked(module);

                  return (
                    <div
                      key={module.name}
                      className="flex flex-col sm:flex-row px-4 py-3"
                    >
                      <div className="flex items-center w-full sm:w-1/3 mb-2 sm:mb-0">
                        <input
                          type="checkbox"
                          checked={moduleChecked}
                          onChange={(e) =>
                            handleModuleCheck(module, e.target.checked)
                          }
                          className="form-checkbox h-4 w-4 text-green-500 mr-2"
                        />

                        <span className="font-medium">{module.name}</span>
                      </div>

                      <div className="flex flex-wrap gap-3 w-full sm:w-2/3">
                        {module.actions.map((action) => {
                          const perm = findPermission(action, module.name);

                          return (
                            <label
                              key={`${module.name}-${action}`}
                              className="flex items-center"
                            >
                              <input
                                type="checkbox"
                                checked={
                                  perm
                                    ? formData.permission_ids.includes(perm.id)
                                    : false
                                }
                                onChange={() =>
                                  perm && handleCheckboxChange(perm.id)
                                }
                                disabled={!perm}
                                className={`form-checkbox h-4 w-4 text-green-500 mr-1 ${
                                  !perm ? "opacity-50" : ""
                                }`}
                              />
                              <span className="text-sm">{action}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="form-actions flex justify-end space-x-2">
          <button
            type="button"
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="px-4 py-2 bg-success text-white rounded hover:"
          >
            Save
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default RoleFormModal;
