// import React, { useEffect, useMemo, useState } from "react";
// import { Modal, Button, Table, Form, Row, Col } from "react-bootstrap";
// import { Pencil, Trash, Eye } from "react-bootstrap-icons";
// import StarRating from "../../../components/StarRating.jsx";

// import {
//   getAppraisalsWithTargetAndOverall,
//   createAppraisal,
//   updateAppraisal,
//   deleteAppraisal,
//   getIndicatorsByBranchName,
//   getAppraisalById,
// } from "../../../services/appraisalService";

// import { getBranches, getCompetencies } from "../../../services/indicatorService";
// import { getEmployees } from "../../../services/hrmService";

// export default function AppraisalList() {
//   // ------------------ state ------------------
//   const [data, setData] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const [branches, setBranches] = useState([]);
//   const [employees, setEmployees] = useState([]);
//   const [competencies, setCompetencies] = useState([]);

//   const [branchRatings, setBranchRatings] = useState({});
//   const [isEdit, setIsEdit] = useState(false);
//   const [editId, setEditId] = useState(null);
//   const [showModal, setShowModal] = useState(false);

//   // cache: branchId -> { department: string, designation: string }
//   const [deptDesigByBranch, setDeptDesigByBranch] = useState({});

//   // View modal
//   const [showViewModal, setShowViewModal] = useState(false);
//   const [viewData, setViewData] = useState({
//     branch: "-",
//     department: "-",
//     designation: "-",
//     employee: "-",
//     appraisal_date: "-",
//     remark: "-",
//     indicatorRatings: {}, // { competencyName: number }
//     appraisalRatings: {}, // { competencyName: number }
//   });

//   // table controls
//   const [entriesPerPage, setEntriesPerPage] = useState(10);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [search, setSearch] = useState("");

//   const [form, setForm] = useState({
//     branch: "",
//     employee: "",
//     appraisal_date: "",
//     ratings: {},
//     remark: "",
//   });

//   // ------------------ helpers ------------------
//   const parseRatings = (raw) => {
//     if (raw == null) return {};
//     let value = raw;
//     while (typeof value === "string") {
//       try {
//         value = JSON.parse(value);
//       } catch {
//         break;
//       }
//     }
//     if (typeof value !== "object" || value === null) return {};
//     const out = {};
//     for (const [k, v] of Object.entries(value)) {
//       const num = Number(v);
//       out[k] = Number.isFinite(num) ? num : 0;
//     }
//     return out;
//   };

//   const toMonth = (val) => {
//     if (!val) return "-";
//     if (typeof val === "string") {
//       const m = val.match(/^(\d{4}-\d{2})/);
//       if (m) return m[1];
//       const d = new Date(val);
//       if (!Number.isNaN(d.getTime())) {
//         const mm = String(d.getMonth() + 1).padStart(2, "0");
//         return `${d.getFullYear()}-${mm}`;
//       }
//       return "-";
//     }
//     if (typeof val === "object" && val.date) {
//       const d = new Date(val.date);
//       if (!Number.isNaN(d.getTime())) {
//         const mm = String(d.getMonth() + 1).padStart(2, "0");
//         return `${d.getFullYear()}-${mm}`;
//       }
//     }
//     return "-";
//   };

//   const competenciesByType = useMemo(() => {
//     return competencies.reduce((acc, comp) => {
//       const typeName = comp?.performanceType?.name || "Other";
//       if (!acc[typeName]) acc[typeName] = [];
//       acc[typeName].push(comp);
//       return acc;
//     }, {});
//   }, [competencies]);

//   // ------------------ initial load ------------------
//   useEffect(() => {
//     (async () => {
//       try {
//         const [list, branchRes, empRes, compRes] = await Promise.all([
//           getAppraisalsWithTargetAndOverall(),
//           getBranches(),
//           getEmployees(),
//           getCompetencies(),
//         ]);
//         setData(list || []);
//         setBranches(branchRes?.data || []);
//         setEmployees(empRes || []);
//         setCompetencies(compRes?.data || []);
//       } catch (err) {
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     })();
//   }, []);

//   const getDepartmentForRow = (row) => {
//     if (row?.department_detail?.name) return row.department_detail.name;
//     const branchId = row?.branch_detail?.id ?? row?.branch;
//     return deptDesigByBranch[String(branchId)]?.department || "-";
//   };

//   const getDesignationForRow = (row) => {
//     if (row?.designation_detail?.name) return row.designation_detail.name;
//     const branchId = row?.branch_detail?.id ?? row?.branch;
//     return deptDesigByBranch[String(branchId)]?.designation || "-";
//   };

//   // ------------------ prefetch dept/desig ------------------
//   useEffect(() => {
//     const run = async () => {
//       if (!branches || branches.length === 0) return;
//       try {
//         const pairs = await Promise.all(
//           branches.map(async (b) => {
//             try {
//               const res = await getIndicatorsByBranchName(b.name);
//               const first = Array.isArray(res) && res.length > 0 ? res[0] : null;
//               return [
//                 String(b.id),
//                 {
//                   department: first?.department_detail?.name || "",
//                   designation: first?.designation_detail?.name || "",
//                 },
//               ];
//             } catch {
//               return [String(b.id), { department: "", designation: "" }];
//             }
//           })
//         );
//         setDeptDesigByBranch(Object.fromEntries(pairs));
//       } catch (e) {
//         console.error(e);
//       }
//     };
//     run();
//   }, [branches]);

//   // ------------------ handlers ------------------
//   const handleBranchChange = async (branchId) => {
//     setForm((prev) => ({ ...prev, branch: String(branchId) }));
//     try {
//       const branchObj = branches.find((b) => b.id === parseInt(branchId));
//       if (!branchObj) {
//         setBranchRatings({});
//         return;
//       }
//       const res = await getIndicatorsByBranchName(branchObj.name);
//       const parsedIndicatorRatings =
//         res && res.length > 0 ? parseRatings(res[0].rating) : {};
//       setBranchRatings(parsedIndicatorRatings);
//     } catch (err) {
//       console.error(err);
//       setBranchRatings({});
//     }
//   };

//   const handleDelete = async (id) => {
//     if (!window.confirm("Are you sure you want to delete this appraisal?")) return;
//     try {
//       await deleteAppraisal(id);
//       const list = await getAppraisalsWithTargetAndOverall();
//       setData(list || []);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const handleRatingChange = (competencyName, value) => {
//     setForm((prev) => ({
//       ...prev,
//       ratings: { ...prev.ratings, [competencyName]: value },
//     }));
//   };

//   const handleSave = async () => {
//     try {
//       const payload = {
//         branch: form.branch,
//         employee: form.employee,
//         appraisal_date: form.appraisal_date,
//         rating: JSON.stringify(form.ratings),
//         remark: form.remark,
//       };
//       if (isEdit) {
//         await updateAppraisal(editId, payload);
//       } else {
//         await createAppraisal(payload);
//       }

//       const list = await getAppraisalsWithTargetAndOverall();
//       setData(list || []);
//       setShowModal(false);
//       setForm({ branch: "", employee: "", appraisal_date: "", ratings: {}, remark: "" });
//       setBranchRatings({});
//       setIsEdit(false);
//       setEditId(null);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const handleEdit = async (row) => {
//     try {
//       setIsEdit(true);
//       setEditId(row.id);
//       const appraisal = await getAppraisalById(row.id);
//       const branchId = appraisal?.branch_detail?.id ?? appraisal?.branch ?? row.branch ?? "";
//       const employeeId = appraisal?.employee_detail?.id ?? appraisal?.employee ?? row.employee ?? "";
//       const parsedRatings = parseRatings(appraisal?.rating);

//       setForm({
//         branch: String(branchId || ""),
//         employee: String(employeeId || ""),
//         appraisal_date: toMonth(appraisal?.appraisal_date || row.appraisal_date),
//         ratings: parsedRatings,
//         remark: appraisal?.remark || "",
//       });

//       await handleBranchChange(String(branchId));
//       setShowModal(true);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const handleView = async (row) => {
//     try {
//       const appraisal = await getAppraisalById(row.id);
//       const branchName = appraisal?.branch_detail?.name ?? row?.branch_detail?.name ?? "";
//       const branchId = appraisal?.branch_detail?.id ?? row?.branch_detail?.id ?? appraisal?.branch ?? row?.branch;

//       let indicatorRatings = {};
//       let department = appraisal?.department_detail?.name || row?.department_detail?.name || "-";
//       let designation = appraisal?.designation_detail?.name || row?.designation_detail?.name || "-";

//       if (branchName) {
//         const res = await getIndicatorsByBranchName(branchName);
//         const first = Array.isArray(res) && res.length > 0 ? res[0] : null;
//         indicatorRatings = first ? parseRatings(first.rating) : {};
//         if (department === "-" && first?.department_detail?.name) department = first.department_detail.name;
//         if (designation === "-" && first?.designation_detail?.name) designation = first.designation_detail.name;
//       }

//       const appraisalRatings = parseRatings(appraisal?.rating);
//       setViewData({
//         branch: branchName || "-",
//         department: department || "-",
//         designation: designation || "-",
//         employee: appraisal?.employee_detail?.name ?? row?.employee_detail?.name ?? "-",
//         appraisal_date: toMonth(appraisal?.appraisal_date || row?.appraisal_date),
//         remark: appraisal?.remark || "-",
//         indicatorRatings,
//         appraisalRatings,
//       });
//       setShowViewModal(true);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   // ------------------ filtering & pagination ------------------
//   const normalized = (s) => (s || "").toString().toLowerCase();
//   const filteredData = useMemo(() => {
//     if (!search.trim()) return data;
//     const term = normalized(search);
//     return (data || []).filter((row) => {
//       const branchName = row?.branch_detail?.name || "";
//       const empName = row?.employee_detail?.name || "";
//       const dept = getDepartmentForRow(row);
//       const desig = getDesignationForRow(row);
//       const remark = row?.remark || "";
//       return (
//         normalized(branchName).includes(term) ||
//         normalized(empName).includes(term) ||
//         normalized(dept).includes(term) ||
//         normalized(desig).includes(term) ||
//         normalized(remark).includes(term)
//       );
//     });
//   }, [data, search, deptDesigByBranch]);

//   const totalPages = Math.max(1, Math.ceil(filteredData.length / entriesPerPage));
//   const page = Math.min(currentPage, totalPages);
//   const startIdx = (page - 1) * entriesPerPage;
//   const visible = filteredData.slice(startIdx, startIdx + entriesPerPage);

//   useEffect(() => {
//     setCurrentPage(1);
//   }, [search, entriesPerPage]);

//   // ------------------ render ------------------
//   return (
//     <div className="p-4 bg-white rounded-xl shadow-md">
//       {/* HEADER */}
//       <div className="d-flex justify-content-between align-items-center mb-3">
//         <h4>Manage Indicator</h4>
//         <Button variant="success" onClick={() => setShowModal(true)}>+</Button>
//       </div>

//       {/* TOP CONTROLS */}
//       <div className="d-flex justify-content-between mb-3 flex-wrap gap-2">
//         <div className="d-flex align-items-center">
//           <Form.Select
//             value={entriesPerPage}
//             onChange={(e) => {
//               setEntriesPerPage(Number(e.target.value));
//               setCurrentPage(1);
//             }}
//             className="me-2"
//             style={{ width: "80px" }}
//           >
//             <option value={10}>10</option>
//             <option value={25}>25</option>
//             <option value={50}>50</option>
//           </Form.Select>
//           <span>entries per page</span>
//         </div>
//         <Form.Control
//           type="text"
//           placeholder="Search..."
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//           style={{ maxWidth: "250px" }}
//         />
//       </div>

//       {/* TABLE (Responsive inside card) */}
//       <div className="table-responsive" style={{ maxHeight: "400px", overflowY: "auto" }}>
//         <Table striped bordered hover>
//           <thead>
//             <tr>
//               <th>Branch</th>
//               <th>Employee</th>
//               <th>Target Rating</th>
//               <th>Overall Rating</th>
//               <th>Appraisal Month</th>
//               <th>Action</th>
//             </tr>
//           </thead>
//           <tbody>
//             {(visible || []).map((row) => (
//               <tr key={row.id}>
//                 <td>{row.branch}</td>
//                 <td>{row.employee}</td>
//                 <td><StarRating value={row.targetRating || 0} readOnly /></td>
//                 <td><StarRating value={row.overallRating || 0} readOnly /></td>
//                 <td>{toMonth(row.appraisalDate)}</td>
//                 <td>
//                   <Button size="sm" variant="warning" className="me-1" onClick={() => handleView(row)}>
//                     <Eye />
//                   </Button>
//                   <Button size="sm" variant="info" className="me-1" onClick={() => handleEdit(row)}>
//                     <Pencil />
//                   </Button>
//                   <Button size="sm" variant="danger" onClick={() => handleDelete(row.id)}>
//                     <Trash />
//                   </Button>
//                 </td>
//               </tr>
//             ))}
//             {visible.length === 0 && (
//               <tr>
//                 <td colSpan={8} className="text-center text-muted">No records found.</td>
//               </tr>
//             )}
//           </tbody>
//         </Table>
//       </div>

//       {/* PAGINATION */}
//       <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mt-2">
//         <div>
//           Showing {filteredData.length === 0 ? 0 : startIdx + 1} to{" "}
//           {Math.min(startIdx + visible.length, filteredData.length)} of {filteredData.length} entries
//         </div>
//         <div className="d-flex gap-2">
//           <Button
//             size="sm"
//             variant="outline-secondary"
//             disabled={page <= 1}
//             onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
//           >
//             Prev
//           </Button>
//           <span className="align-self-center">Page {page} / {totalPages}</span>
//           <Button
//             size="sm"
//             variant="outline-secondary"
//             disabled={page >= totalPages}
//             onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
//           >
//             Next
//           </Button>
//         </div>
//       </div>

//       {/* Modals stay same ... */}
//       {/* CREATE/EDIT MODAL + VIEW MODAL code unchanged */}
//       <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" backdrop="static">
//         <Modal.Header closeButton>
//           <Modal.Title>{isEdit ? "Edit Appraisal" : "Create Appraisal"}</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <Form>
//             <Row>
//               <Col md={6}>
//                 <Form.Group className="mb-3">
//                   <Form.Label>Branch *</Form.Label>
//                   <Form.Select
//                     value={form.branch}
//                     onChange={(e) => handleBranchChange(e.target.value)}
//                     required
//                   >
//                     <option value="">Select Branch</option>
//                     {branches.map((b) => (
//                       <option key={b.id} value={String(b.id)}>{b.name}</option>
//                     ))}
//                   </Form.Select>
//                 </Form.Group>
//               </Col>
//               <Col md={6}>
//                 <Form.Group className="mb-3">
//                   <Form.Label>Appraisal Month *</Form.Label>
//                   <Form.Control
//                     type="month"
//                     value={form.appraisal_date}
//                     onChange={(e) => setForm((p) => ({ ...p, appraisal_date: e.target.value }))}
//                     required
//                   />
//                 </Form.Group>
//               </Col>
//             </Row>

//             <Form.Group className="mb-3">
//               <Form.Label>Employee *</Form.Label>
//               <Form.Select
//                 value={form.employee}
//                 onChange={(e) => setForm((p) => ({ ...p, employee: e.target.value }))}
//                 required
//               >
//                 <option value="">Select Employee</option>
//                 {employees.map((emp) => (
//                   <option key={emp.id} value={String(emp.id)}>{emp.name}</option>
//                 ))}
//               </Form.Select>
//             </Form.Group>

//             <Form.Group className="mb-3">
//               <Form.Label>Remark</Form.Label>
//               <Form.Control
//                 as="textarea"
//                 rows={2}
//                 value={form.remark}
//                 onChange={(e) => setForm((p) => ({ ...p, remark: e.target.value }))}
//                 placeholder="Enter remark"
//               />
//             </Form.Group>

//             {form.branch ? (
//               Object.entries(competenciesByType).map(([typeName, comps]) => (
//                 <div key={typeName} className="mb-4 p-3 border rounded">
//                   <h5 className="text-primary mb-3">{typeName}</h5>
//                   {/* Inside Create / Edit Modal */}
//                   {comps.map((comp) => {
//                     const targetRating = branchRatings[comp.name] ?? 0;
//                     const key = Object.keys(form.ratings).find(
//                       (k) => k.toLowerCase() === comp.name.toLowerCase()
//                     );
//                     const userRating = key ? form.ratings[key] : 0;

//                     return (
//                       <div key={comp.id} className="mb-3">
//                         <div className="d-flex justify-content-between align-items-center flex-wrap">
//                           <strong className="me-3">{comp.name}</strong>
//                           <div className="d-flex flex-nowrap" style={{ gap: "24px", minWidth: "220px" }}>
//                             <div className="text-center">
//                               <small className="d-block text-muted">Indicator</small>
//                               <StarRating value={targetRating} readOnly />
//                               <span className="ms-2">({targetRating})</span>
//                             </div>
//                             <div className="text-center">
//                               <small className="d-block text-muted">Appraisal</small>
//                               <StarRating
//                                 value={userRating}
//                                 onChange={(val) => handleRatingChange(comp.name, val)}
//                               />
//                               <span className="ms-2">({userRating})</span>
//                             </div>
//                           </div>
//                         </div>
//                       </div>
//                     );
//                   })}

//                 </div>
//               ))
//             ) : (
//               <p className="text-muted">👉 Please select a branch to see indicator values</p>
//             )}
//           </Form>
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
//           <Button
//             variant="primary"
//             onClick={handleSave}
//             disabled={!form.branch || !form.employee || !form.appraisal_date}
//           >
//             {isEdit ? "Update" : "Save"}
//           </Button>
//         </Modal.Footer>
//       </Modal>

//       {/* VIEW MODAL */}
//       <Modal show={showViewModal} onHide={() => setShowViewModal(false)} size="lg" centered>
//         <Modal.Header closeButton>
//           <Modal.Title>Appraisal Details</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <div className="mb-3">
//             <Row className="mb-2">
//               <Col md={6}><strong>Branch:</strong> {viewData.branch}</Col>
//               <Col md={6}><strong>Employee:</strong> {viewData.employee}</Col>
//             </Row>
//             <Row className="mb-2">
//               <Col md={6}><strong>Department:</strong> {viewData.department}</Col>
//               <Col md={6}><strong>Designation:</strong> {viewData.designation}</Col>
//             </Row>
//             <Row className="mb-2">
//               <Col md={6}><strong>Appraisal Month:</strong> {viewData.appraisal_date}</Col>
//               <Col md={6}><strong>Remark:</strong> {viewData.remark || "-"}</Col>
//             </Row>
//           </div>

//           <div className="border rounded p-3">
//             <h5 className="mb-3">Competency Ratings</h5>
//             {Object.entries(competenciesByType).map(([typeName, comps]) => (
//               <div key={typeName} className="mb-4">
//                 <h6 className="text-primary mb-2">{typeName}</h6>
//                 {comps.map((comp) => {
//                   const keysApp = Object.keys(viewData.appraisalRatings || {});
//                   const matchKeyApp = keysApp.find((k) => k.toLowerCase() === comp.name.toLowerCase());
//                   const appVal = matchKeyApp ? viewData.appraisalRatings[matchKeyApp] : 0;
//                   const indVal = viewData.indicatorRatings?.[comp.name] ?? 0;

//                   return (
//                     <div key={comp.id} className="d-flex justify-content-between align-items-center py-2 border-bottom flex-wrap">
//                       <div className="fw-semibold me-3">{comp.name}</div>
//                       <div className="d-flex flex-nowrap" style={{ gap: "24px", minWidth: "220px" }}>
//                         <div className="text-center">
//                           <small className="d-block text-muted">Indicator</small>
//                           <StarRating value={indVal} readOnly />
//                           <span className="ms-2">({indVal})</span>
//                         </div>
//                         <div className="text-center">
//                           <small className="d-block text-muted">Appraisal</small>
//                           <StarRating value={appVal} readOnly />
//                           <span className="ms-2">({appVal})</span>
//                         </div>
//                       </div>
//                     </div>
//                   );
//                 })}

//               </div>
//             ))}
//           </div>
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={() => setShowViewModal(false)}>Close</Button>
//         </Modal.Footer>
//       </Modal>
//     </div>
//   );
// }

import React, { useEffect, useMemo, useState } from "react";
import { Modal, Button, Table, Form, Row, Col } from "react-bootstrap";
import { Pencil, Trash, Eye } from "react-bootstrap-icons";
import StarRating from "../../../components/StarRating.jsx";

import {
  getAppraisalsWithTargetAndOverall,
  createAppraisal,
  updateAppraisal,
  deleteAppraisal,
  getIndicatorsByBranchName,
  getAppraisalById,
} from "../../../services/appraisalService";

import {
  getBranches,
  getCompetencies,
} from "../../../services/indicatorService";
import { getEmployees } from "../../../services/hrmService";

export default function AppraisalList() {
  // ------------------ state ------------------
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [branches, setBranches] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [competencies, setCompetencies] = useState([]);

  const [branchRatings, setBranchRatings] = useState({});
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isClosingModal, setIsClosingModal] = useState(false);
  const [isClosingView, setIsClosingView] = useState(false);

  // cache: branchId -> { department: string, designation: string }
  const [deptDesigByBranch, setDeptDesigByBranch] = useState({});

  // View modal
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewData, setViewData] = useState({
    branch: "-",
    department: "-",
    designation: "-",
    employee: "-",
    appraisal_date: "-",
    remark: "-",
    indicatorRatings: {}, // { competencyName: number }
    appraisalRatings: {}, // { competencyName: number }
  });

  // table controls
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    branch: "",
    employee: "",
    appraisal_date: "",
    ratings: {},
    remark: "",
  });

  // ------------------ helpers ------------------
  const parseRatings = (raw) => {
    if (raw == null) return {};
    let value = raw;
    while (typeof value === "string") {
      try {
        value = JSON.parse(value);
      } catch {
        break;
      }
    }
    if (typeof value !== "object" || value === null) return {};
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      const num = Number(v);
      out[k] = Number.isFinite(num) ? num : 0;
    }
    return out;
  };

  const toMonth = (val) => {
    if (!val) return "-";
    if (typeof val === "string") {
      const m = val.match(/^(\d{4}-\d{2})/);
      if (m) return m[1];
      const d = new Date(val);
      if (!Number.isNaN(d.getTime())) {
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        return `${d.getFullYear()}-${mm}`;
      }
      return "-";
    }
    if (typeof val === "object" && val.date) {
      const d = new Date(val.date);
      if (!Number.isNaN(d.getTime())) {
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        return `${d.getFullYear()}-${mm}`;
      }
    }
    return "-";
  };

  const competenciesByType = useMemo(() => {
    // FIX: Add proper array check to prevent reduce error
    if (!competencies || !Array.isArray(competencies)) return {};

    return competencies.reduce((acc, comp) => {
      const typeName = comp?.performanceType?.name || "Other";
      if (!acc[typeName]) acc[typeName] = [];
      acc[typeName].push(comp);
      return acc;
    }, {});
  }, [competencies]);

  // ------------------ initial load ------------------
  useEffect(() => {
    (async () => {
      try {
        const [list, branchRes, empRes, compRes] = await Promise.all([
          getAppraisalsWithTargetAndOverall(),
          getBranches(),
          getEmployees(),
          getCompetencies(),
        ]);

        // FIX: Handle API responses properly
        setData(Array.isArray(list) ? list : []);
        setBranches(Array.isArray(branchRes?.data) ? branchRes.data : []);
        setEmployees(Array.isArray(empRes) ? empRes : []);
        setCompetencies(Array.isArray(compRes?.data) ? compRes.data : []);
      } catch (err) {
        console.error("Error loading data:", err);
        // Ensure all states are arrays even on error
        setData([]);
        setBranches([]);
        setEmployees([]);
        setCompetencies([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ------------------ animation close helpers ------------------
  const handleCloseModal = () => {
    setIsClosingModal(true);
    setTimeout(() => {
      setShowModal(false);
      setIsClosingModal(false);
    }, 400);
  };

  const handleCloseView = () => {
    setIsClosingView(true);
    setTimeout(() => {
      setShowViewModal(false);
      setIsClosingView(false);
    }, 400);
  };

  const getDepartmentForRow = (row) => {
    if (row?.department_detail?.name) return row.department_detail.name;
    const branchId = row?.branch_detail?.id ?? row?.branch;
    return deptDesigByBranch[String(branchId)]?.department || "-";
  };

  const getDesignationForRow = (row) => {
    if (row?.designation_detail?.name) return row.designation_detail.name;
    const branchId = row?.branch_detail?.id ?? row?.branch;
    return deptDesigByBranch[String(branchId)]?.designation || "-";
  };

  // ------------------ prefetch dept/desig ------------------
  useEffect(() => {
    const run = async () => {
      if (!branches || branches.length === 0) return;
      try {
        const pairs = await Promise.all(
          branches.map(async (b) => {
            try {
              const res = await getIndicatorsByBranchName(b.name);
              const first =
                Array.isArray(res) && res.length > 0 ? res[0] : null;
              return [
                String(b.id),
                {
                  department: first?.department_detail?.name || "",
                  designation: first?.designation_detail?.name || "",
                },
              ];
            } catch {
              return [String(b.id), { department: "", designation: "" }];
            }
          })
        );
        setDeptDesigByBranch(Object.fromEntries(pairs));
      } catch (e) {
        console.error(e);
      }
    };
    run();
  }, [branches]);

  // ------------------ handlers ------------------
  const handleBranchChange = async (branchId) => {
    setForm((prev) => ({ ...prev, branch: String(branchId) }));
    try {
      const branchObj = branches.find((b) => b.id === parseInt(branchId));
      if (!branchObj) {
        setBranchRatings({});
        return;
      }
      const res = await getIndicatorsByBranchName(branchObj.name);
      const parsedIndicatorRatings =
        res && res.length > 0 ? parseRatings(res[0].rating) : {};
      setBranchRatings(parsedIndicatorRatings);
    } catch (err) {
      console.error(err);
      setBranchRatings({});
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this appraisal?"))
      return;
    try {
      await deleteAppraisal(id);
      const list = await getAppraisalsWithTargetAndOverall();
      setData(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRatingChange = (competencyName, value) => {
    setForm((prev) => ({
      ...prev,
      ratings: { ...prev.ratings, [competencyName]: value },
    }));
  };

  const handleSave = async () => {
    try {
      const payload = {
        branch: form.branch,
        employee: form.employee,
        appraisal_date: form.appraisal_date,
        rating: JSON.stringify(form.ratings),
        remark: form.remark,
      };
      if (isEdit) {
        await updateAppraisal(editId, payload);
      } else {
        await createAppraisal(payload);
      }

      const list = await getAppraisalsWithTargetAndOverall();
      setData(Array.isArray(list) ? list : []);
      setShowModal(false);
      setForm({
        branch: "",
        employee: "",
        appraisal_date: "",
        ratings: {},
        remark: "",
      });
      setBranchRatings({});
      setIsEdit(false);
      setEditId(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = async (row) => {
    try {
      setIsEdit(true);
      setEditId(row.id);
      const appraisal = await getAppraisalById(row.id);
      const branchId =
        appraisal?.branch_detail?.id ?? appraisal?.branch ?? row.branch ?? "";
      const employeeId =
        appraisal?.employee_detail?.id ??
        appraisal?.employee ??
        row.employee ??
        "";
      const parsedRatings = parseRatings(appraisal?.rating);

      setForm({
        branch: String(branchId || ""),
        employee: String(employeeId || ""),
        appraisal_date: toMonth(
          appraisal?.appraisal_date || row.appraisal_date
        ),
        ratings: parsedRatings,
        remark: appraisal?.remark || "",
      });

      await handleBranchChange(String(branchId));
      setShowModal(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleView = async (row) => {
    try {
      const appraisal = await getAppraisalById(row.id);
      const branchName =
        appraisal?.branch_detail?.name ?? row?.branch_detail?.name ?? "";
      const branchId =
        appraisal?.branch_detail?.id ??
        row?.branch_detail?.id ??
        appraisal?.branch ??
        row?.branch;

      let indicatorRatings = {};
      let department =
        appraisal?.department_detail?.name ||
        row?.department_detail?.name ||
        "-";
      let designation =
        appraisal?.designation_detail?.name ||
        row?.designation_detail?.name ||
        "-";

      if (branchName) {
        const res = await getIndicatorsByBranchName(branchName);
        const first = Array.isArray(res) && res.length > 0 ? res[0] : null;
        indicatorRatings = first ? parseRatings(first.rating) : {};
        if (department === "-" && first?.department_detail?.name)
          department = first.department_detail.name;
        if (designation === "-" && first?.designation_detail?.name)
          designation = first.designation_detail.name;
      }

      const appraisalRatings = parseRatings(appraisal?.rating);
      setViewData({
        branch: branchName || "-",
        department: department || "-",
        designation: designation || "-",
        employee:
          appraisal?.employee_detail?.name ?? row?.employee_detail?.name ?? "-",
        appraisal_date: toMonth(
          appraisal?.appraisal_date || row?.appraisal_date
        ),
        remark: appraisal?.remark || "-",
        indicatorRatings,
        appraisalRatings,
      });
      setShowViewModal(true);
    } catch (err) {
      console.error(err);
    }
  };

  // ------------------ filtering & pagination ------------------
  const normalized = (s) => (s || "").toString().toLowerCase();
  const filteredData = useMemo(() => {
    if (!search.trim()) return data;
    const term = normalized(search);
    return (data || []).filter((row) => {
      const branchName = row?.branch_detail?.name || "";
      const empName = row?.employee_detail?.name || "";
      const dept = getDepartmentForRow(row);
      const desig = getDesignationForRow(row);
      const remark = row?.remark || "";
      return (
        normalized(branchName).includes(term) ||
        normalized(empName).includes(term) ||
        normalized(dept).includes(term) ||
        normalized(desig).includes(term) ||
        normalized(remark).includes(term)
      );
    });
  }, [data, search, deptDesigByBranch]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredData.length / entriesPerPage)
  );
  const page = Math.min(currentPage, totalPages);
  const startIdx = (page - 1) * entriesPerPage;
  const visible = filteredData.slice(startIdx, startIdx + entriesPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, entriesPerPage]);

  // ------------------ render ------------------
  return (
    <div className="p-4 bg-white rounded-xl shadow-md">
      {/* ✅ Inline CSS Animations */}
      <style>{`
        @keyframes slideInUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes slideOutUp {
          from { transform: translateY(0); opacity: 1; }
          to { transform: translateY(-100%); opacity: 0; }
        }
        .custom-slide-modal.open .modal-dialog {
          animation: slideInUp 0.4s ease forwards;
        }
        .custom-slide-modal.closing .modal-dialog {
          animation: slideOutUp 0.4s ease forwards;
        }
      `}</style>

      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Manage Indicator</h4>
        <Button variant="success" onClick={() => setShowModal(true)}>
          +
        </Button>
      </div>

      {/* TOP CONTROLS */}
      <div className="d-flex justify-content-between mb-3 flex-wrap gap-2">
        <div className="d-flex align-items-center">
          <Form.Select
            value={entriesPerPage}
            onChange={(e) => {
              setEntriesPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="me-2"
            style={{ width: "80px" }}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </Form.Select>
          <span>entries per page</span>
        </div>
        <Form.Control
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: "250px" }}
        />
      </div>

      {/* TABLE (Responsive inside card) */}
      <div
        className="table-responsive"
        style={{ maxHeight: "400px", overflowY: "auto" }}
      >
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Branch</th>
              <th>Employee</th>
              <th>Target Rating</th>
              <th>Overall Rating</th>
              <th>Appraisal Month</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {(visible || []).map((row) => (
              <tr key={row.id}>
                <td>{row.branch}</td>
                <td>{row.employee}</td>
                <td>
                  <StarRating value={row.targetRating || 0} readOnly />
                </td>
                <td>
                  <StarRating value={row.overallRating || 0} readOnly />
                </td>
                <td>{toMonth(row.appraisalDate)}</td>
                <td>
                  <Button
                    size="sm"
                    variant="warning"
                    className="me-1"
                    onClick={() => handleView(row)}
                  >
                    <Eye />
                  </Button>
                  <Button
                    size="sm"
                    variant="info"
                    className="me-1"
                    onClick={() => handleEdit(row)}
                  >
                    <Pencil />
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleDelete(row.id)}
                  >
                    <Trash />
                  </Button>
                </td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center text-muted">
                  No records found.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>

      {/* PAGINATION */}
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mt-2">
        <div>
          Showing {filteredData.length === 0 ? 0 : startIdx + 1} to{" "}
          {Math.min(startIdx + visible.length, filteredData.length)} of{" "}
          {filteredData.length} entries
        </div>
        <div className="d-flex gap-2">
          <Button
            size="sm"
            variant="outline-secondary"
            disabled={page <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          >
            Prev
          </Button>
          <span className="align-self-center">
            Page {page} / {totalPages}
          </span>
          <Button
            size="sm"
            variant="outline-secondary"
            disabled={page >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Modals stay same ... */}
      {/* CREATE/EDIT MODAL + VIEW MODAL code unchanged */}
      <Modal
        show={showModal}
        onHide={handleCloseModal}
        size="lg"
        backdrop="true"
        centered
        className={`custom-slide-modal ${isClosingModal ? "closing" : "open"}`}
        style={{ overflowY: "auto", scrollbarWidth: "none" }}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {isEdit ? "Edit Appraisal" : "Create Appraisal"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Branch *</Form.Label>
                  <Form.Select
                    value={form.branch}
                    onChange={(e) => handleBranchChange(e.target.value)}
                    required
                  >
                    <option value="">Select Branch</option>
                    {branches.map((b) => (
                      <option key={b.id} value={String(b.id)}>
                        {b.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Appraisal Month *</Form.Label>
                  <Form.Control
                    type="month"
                    value={form.appraisal_date}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, appraisal_date: e.target.value }))
                    }
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Employee *</Form.Label>
              <Form.Select
                value={form.employee}
                onChange={(e) =>
                  setForm((p) => ({ ...p, employee: e.target.value }))
                }
                required
              >
                <option value="">Select Employee</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={String(emp.id)}>
                    {emp.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Remark</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={form.remark}
                onChange={(e) =>
                  setForm((p) => ({ ...p, remark: e.target.value }))
                }
                placeholder="Enter remark"
              />
            </Form.Group>

            {form.branch ? (
              Object.entries(competenciesByType).map(([typeName, comps]) => (
                <div key={typeName} className="mb-4 p-3 border rounded">
                  <h5 className="text-primary mb-3">{typeName}</h5>
                  {/* Inside Create / Edit Modal */}
                  {comps.map((comp) => {
                    const targetRating = branchRatings[comp.name] ?? 0;
                    const key = Object.keys(form.ratings).find(
                      (k) => k.toLowerCase() === comp.name.toLowerCase()
                    );
                    const userRating = key ? form.ratings[key] : 0;

                    return (
                      <div key={comp.id} className="mb-3">
                        <div className="d-flex justify-content-between align-items-center flex-wrap">
                          <strong className="me-3">{comp.name}</strong>
                          <div
                            className="d-flex flex-nowrap"
                            style={{ gap: "24px", minWidth: "220px" }}
                          >
                            <div className="text-center">
                              <small className="d-block text-muted">
                                Indicator
                              </small>
                              <StarRating value={targetRating} readOnly />
                              <span className="ms-2">({targetRating})</span>
                            </div>
                            <div className="text-center">
                              <small className="d-block text-muted">
                                Appraisal
                              </small>
                              <StarRating
                                value={userRating}
                                onChange={(val) =>
                                  handleRatingChange(comp.name, val)
                                }
                              />
                              <span className="ms-2">({userRating})</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))
            ) : (
              <p className="text-muted">
                👉 Please select a branch to see indicator values
              </p>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button
            variant="success"
            onClick={handleSave}
            disabled={!form.branch || !form.employee || !form.appraisal_date}
          >
            {isEdit ? "Update" : "Save"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* VIEW MODAL */}
      <Modal
        show={showViewModal}
        onHide={handleCloseView}
        size="lg"
        backdrop={true}
        centered
        className={`custom-slide-modal ${isClosingView ? "closing" : "open"}`}
        style={{ overflowY: "auto", scrollbarWidth: "none" }}
      >
        <Modal.Header closeButton>
          <Modal.Title>Appraisal Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <Row className="mb-2">
              <Col md={6}>
                <strong>Branch:</strong> {viewData.branch}
              </Col>
              <Col md={6}>
                <strong>Employee:</strong> {viewData.employee}
              </Col>
            </Row>
            <Row className="mb-2">
              <Col md={6}>
                <strong>Department:</strong> {viewData.department}
              </Col>
              <Col md={6}>
                <strong>Designation:</strong> {viewData.designation}
              </Col>
            </Row>
            <Row className="mb-2">
              <Col md={6}>
                <strong>Appraisal Month:</strong> {viewData.appraisal_date}
              </Col>
              <Col md={6}>
                <strong>Remark:</strong> {viewData.remark || "-"}
              </Col>
            </Row>
          </div>

          <div className="border rounded p-3">
            <h5 className="mb-3">Competency Ratings</h5>
            {Object.entries(competenciesByType).map(([typeName, comps]) => (
              <div key={typeName} className="mb-4">
                <h6 className="text-primary mb-2">{typeName}</h6>
                {comps.map((comp) => {
                  const keysApp = Object.keys(viewData.appraisalRatings || {});
                  const matchKeyApp = keysApp.find(
                    (k) => k.toLowerCase() === comp.name.toLowerCase()
                  );
                  const appVal = matchKeyApp
                    ? viewData.appraisalRatings[matchKeyApp]
                    : 0;
                  const indVal = viewData.indicatorRatings?.[comp.name] ?? 0;

                  return (
                    <div
                      key={comp.id}
                      className="d-flex justify-content-between align-items-center py-2 border-bottom flex-wrap"
                    >
                      <div className="fw-semibold me-3">{comp.name}</div>
                      <div
                        className="d-flex flex-nowrap"
                        style={{ gap: "24px", minWidth: "220px" }}
                      >
                        <div className="text-center">
                          <small className="d-block text-muted">
                            Indicator
                          </small>
                          <StarRating value={indVal} readOnly />
                          <span className="ms-2">({indVal})</span>
                        </div>
                        <div className="text-center">
                          <small className="d-block text-muted">
                            Appraisal
                          </small>
                          <StarRating value={appVal} readOnly />
                          <span className="ms-2">({appVal})</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseView}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
