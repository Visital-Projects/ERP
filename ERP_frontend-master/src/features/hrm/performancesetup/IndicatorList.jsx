// import React, { useEffect, useState } from "react";
// import {
//   getIndicators,
//   createIndicator,
//   updateIndicator,
//   deleteIndicator,
//   getCompetencies,
// } from "../../../services/indicatorService";
// import branchService from "../../../services/branchService";
// import departmentService from "../../../services/departmentService";
// import designationService from "../../../services/designationService";
// import { Modal, Button, Table, Form } from "react-bootstrap";
// import { Pencil, Trash, Eye } from "react-bootstrap-icons";
// import StarRating from "../../../components/StarRating.jsx";

// const IndicatorList = () => {
//   const [indicators, setIndicators] = useState([]);
//   const [showModal, setShowModal] = useState(false);
//   const [viewModal, setViewModal] = useState(false);
//   const [search, setSearch] = useState("");
//   const [currentPage, setCurrentPage] = useState(1);
//   const [entriesPerPage, setEntriesPerPage] = useState(10);
//   const [filteredData, setFilteredData] = useState([]);
//   const [selectedIndicator, setSelectedIndicator] = useState(null);
//   const [form, setForm] = useState({
//     branch: "",
//     department: "",
//     designation: "",
//     rating: {},
//   });
//   const [branches, setBranches] = useState([]);
//   const [departments, setDepartments] = useState([]);
//   const [designations, setDesignations] = useState([]);
//   const [allDepartments, setAllDepartments] = useState([]);
//   const [allDesignations, setAllDesignations] = useState([]);
//   const [competencies, setCompetencies] = useState([]);
//   const [editId, setEditId] = useState(null);

//   const [isClosing, setIsClosing] = useState(false);
//   const [isClosingView, setIsClosingView] = useState(false);

//   useEffect(() => {
//     fetchInitialData();
//   }, []);

//   useEffect(() => {
//     const filtered = indicators.filter((item) => {
//       return (
//         getNameById(branches, item.branch)
//           ?.toLowerCase()
//           .includes(search.toLowerCase()) ||
//         getNameById(allDepartments, item.department)
//           ?.toLowerCase()
//           .includes(search.toLowerCase()) ||
//         getNameById(allDesignations, item.designation)
//           ?.toLowerCase()
//           .includes(search.toLowerCase()) ||
//         item.created_user_detail?.name
//           ?.toLowerCase()
//           .includes(search.toLowerCase())
//       );
//     });
//     setFilteredData(filtered);
//     setCurrentPage(1);
//   }, [search, indicators, branches, allDepartments, allDesignations]);

//   // Pagination logic
//   const indexOfLastEntry = currentPage * entriesPerPage;
//   const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
//   const currentEntries = filteredData.slice(
//     indexOfFirstEntry,
//     indexOfLastEntry
//   );

//   const fetchInitialData = async () => {
//     const [indRes, branchRes, compRes, deptRes, desigRes] = await Promise.all([
//       getIndicators(),
//       branchService.getAll(),
//       getCompetencies(),
//       departmentService.getAll(),
//       designationService.getAll(),
//     ]);

//     const parsedIndicators = indRes.data.map((ind) => ({
//       ...ind,
//       rating:
//         typeof ind.rating === "string" ? JSON.parse(ind.rating) : ind.rating,
//     }));

//     setIndicators(parsedIndicators);
//     setBranches(branchRes.data);
//     setCompetencies(compRes.data);
//     setAllDepartments(deptRes.data); // full list for table search/display
//     setAllDesignations(desigRes.data); // full list for table search/display
//   };

//   // Fetch departments when branch changes (for form)
//   useEffect(() => {
//     if (form.branch) {
//       branchService.getDepartmentsByBranch(form.branch).then((res) => {
//         setDepartments(res.data);
//         setForm((prev) => ({ ...prev, department: "", designation: "" }));
//         setDesignations([]);
//       });
//     } else {
//       setDepartments([]);
//       setForm((prev) => ({ ...prev, department: "", designation: "" }));
//       setDesignations([]);
//     }
//   }, [form.branch]);

//   // Fetch designations when department changes (for form)
//   useEffect(() => {
//     if (form.department) {
//       departmentService
//         .getDesignationsByDepartment(form.department)
//         .then((res) => {
//           setDesignations(res.data);
//           setForm((prev) => ({ ...prev, designation: "" }));
//         });
//     } else {
//       setDesignations([]);
//       setForm((prev) => ({ ...prev, designation: "" }));
//     }
//   }, [form.department]);

//   const handleRatingChange = (value, key) => {
//     setForm((prev) => ({
//       ...prev,
//       rating: {
//         ...prev.rating,
//         [key]: value,
//       },
//     }));
//   };

//   const handleSubmit = async () => {
//     const payload = {
//       branch: form.branch,
//       department: form.department,
//       designation: form.designation,
//       rating: form.rating,
//     };

//     if (editId) {
//       await updateIndicator(editId, payload);
//     } else {
//       await createIndicator(payload);
//     }

//     setShowModal(false);
//     setEditId(null);
//     setForm({ branch: "", department: "", designation: "", rating: {} });
//     fetchInitialData();
//   };

//   const handleEdit = (indicator) => {
//     setForm({
//       branch: indicator.branch,
//       department: indicator.department,
//       designation: indicator.designation,
//       rating: { ...indicator.rating },
//     });
//     setEditId(indicator.id);
//     setShowModal(true);
//   };

//   const handleDelete = async (id) => {
//     if (window.confirm("Are you sure you want to delete this indicator?")) {
//       await deleteIndicator(id);
//       fetchInitialData();
//     }
//   };

//   const handleClose = () => {
//     setIsClosing(true);
//     setTimeout(() => {
//       setShowModal(false);
//       setIsClosing(false);
//       setEditId(null);
//       setForm({ branch: "", department: "", designation: "", rating: {} });
//     }, 700); // match animation duration
//   };

//   const handleCloseView = () => {
//     setIsClosingView(true);
//     setTimeout(() => {
//       setViewModal(false);
//       setIsClosingView(false);
//       setSelectedIndicator(null);
//     }, 700);
//   };

//   const getNameById = (list, id) => {
//     const item = list.find((el) => el.id === id);
//     return item ? item.name : "";
//   };

//   const groupedCompetencies = competencies.reduce((acc, comp) => {
//     const type = comp.performanceType?.name || "Other";
//     if (!acc[type]) acc[type] = [];
//     acc[type].push(comp);
//     return acc;
//   }, {});

//   return (
//     <div className="container mt-4">
//       <div className="d-flex justify-content-between align-items-center mb-3">
//         <h4>Manage Indicator</h4>
//         <Button variant="success" onClick={() => setShowModal(true)}>
//           +
//         </Button>
//       </div>

//       <div className="d-flex justify-content-between mb-3">
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
//           style={{ width: "250px" }}
//         />
//       </div>

//       <Table striped bordered hover responsive>
//         <thead>
//           <tr>
//             <th>Branch</th>
//             <th>Department</th>
//             <th>Designation</th>
//             <th>Overall Rating</th>
//             <th>Added By</th>
//             <th>Created At</th>
//             <th>Action</th>
//           </tr>
//         </thead>
//         <tbody>
//           {currentEntries.length > 0 ? (
//             currentEntries.map((item) => {
//               const ratings = item.rating
//                 ? Object.values(item.rating)
//                     .map(Number)
//                     .filter((r) => !isNaN(r))
//                 : [];
//               const avgRating =
//                 ratings.length > 0
//                   ? (
//                       ratings.reduce((a, b) => a + b, 0) / ratings.length
//                     ).toFixed(1)
//                   : 0;
//               return (
//                 <tr key={item.id}>
//                   <td>{getNameById(branches, item.branch)}</td>
//                   <td>{getNameById(allDepartments, item.department)}</td>
//                   <td>{getNameById(allDesignations, item.designation)}</td>
//                   <td>
//                     <div className="d-flex align-items-center">
//                       <StarRating value={parseFloat(avgRating)} readOnly />
//                       {/* <span className="ms-2 fw-bold">({avgRating})</span> */}
//                     </div>
//                   </td>
//                   <td>{item.created_user_detail?.name || "Company"}</td>
//                   <td>{new Date(item.created_at).toLocaleDateString()}</td>
//                   <td>
//                     <Button
//                       size="sm"
//                       variant="warning"
//                       className="me-1"
//                       onClick={() => {
//                         setSelectedIndicator(item);
//                         setViewModal(true);
//                       }}
//                     >
//                       <Eye />
//                     </Button>
//                     <Button
//                       size="sm"
//                       variant="info"
//                       className="me-1"
//                       onClick={() => handleEdit(item)}
//                     >
//                       <Pencil />
//                     </Button>
//                     <Button
//                       size="sm"
//                       variant="danger"
//                       onClick={() => handleDelete(item.id)}
//                     >
//                       <Trash />
//                     </Button>
//                   </td>
//                 </tr>
//               );
//             })
//           ) : (
//             <tr>
//               <td colSpan="7" className="text-center">
//                 No records found
//               </td>
//             </tr>
//           )}
//         </tbody>
//       </Table>

//       {/* Create/Edit Modal */}
//       <Modal
//         show={showModal}
//         onHide={handleClose}
//         size="lg"
//         className={`custom-slide-modal ${isClosing ? "closing" : "open"}`}
//         style={{ overflowY: "auto", scrollbarWidth: "none" }}
//       >
//         <Modal.Header closeButton>
//           <Modal.Title>
//             {editId ? "Edit Indicator" : "Create New Indicator"}
//           </Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <Form>
//             <Form.Group className="mb-3">
//               <Form.Label>Branch</Form.Label>
//               <Form.Select
//                 value={form.branch}
//                 onChange={(e) => setForm({ ...form, branch: e.target.value })}
//               >
//                 <option value="">Select Branch</option>
//                 {branches.map((b) => (
//                   <option key={b.id} value={b.id}>
//                     {b.name}
//                   </option>
//                 ))}
//               </Form.Select>
//             </Form.Group>

//             <Form.Group className="mb-3 row">
//               <div className="col-md-6">
//                 <Form.Label>Department</Form.Label>
//                 <Form.Select
//                   value={form.department}
//                   onChange={(e) =>
//                     setForm({ ...form, department: e.target.value })
//                   }
//                   disabled={!departments.length}
//                 >
//                   <option value="">Select Department</option>
//                   {departments.map((d) => (
//                     <option key={d.id} value={d.id}>
//                       {d.name}
//                     </option>
//                   ))}
//                 </Form.Select>
//               </div>
//               <div className="col-md-6">
//                 <Form.Label>Designation</Form.Label>
//                 <Form.Select
//                   value={form.designation}
//                   onChange={(e) =>
//                     setForm({ ...form, designation: e.target.value })
//                   }
//                   disabled={!designations.length}
//                 >
//                   <option value="">Select Designation</option>
//                   {designations.map((d) => (
//                     <option key={d.id} value={d.id}>
//                       {d.name}
//                     </option>
//                   ))}
//                 </Form.Select>
//               </div>
//             </Form.Group>

//             <div className="mt-4">
//               {Object.entries(groupedCompetencies).map(([type, comps]) => (
//                 <div key={type} className="mb-4">
//                   <h6 className="mt-3 mb-2">
//                     <strong>{type}</strong>
//                   </h6>
//                   <hr />
//                   {comps.map((comp) => (
//                     <div
//                       key={comp.id}
//                       className="d-flex justify-content-between align-items-center mb-3"
//                     >
//                       <Form.Label className="mb-0" style={{ width: "60%" }}>
//                         {comp.name}
//                       </Form.Label>
//                       <div style={{ width: "40%" }}>
//                         <StarRating
//                           value={form.rating[comp.name] || 0}
//                           onChange={(val) => handleRatingChange(val, comp.name)}
//                         />
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               ))}
//             </div>
//           </Form>
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={handleClose}>
//             Cancel
//           </Button>
//           <Button variant="success" onClick={handleSubmit}>
//             {editId ? "Update" : "Create"}
//           </Button>
//         </Modal.Footer>
//       </Modal>

//       {/* View Modal */}
//       <Modal
//         show={viewModal}
//         onHide={handleCloseView}
//         size="lg"
//         className={`custom-slide-modal ${isClosingView ? "closing" : "open"}`}
//         style={{ overflowY: "auto", scrollbarWidth: "none" }}
//       >
//         <Modal.Header closeButton>
//           <Modal.Title>Indicator Detail</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           {selectedIndicator && (
//             <>
//               <div className="d-flex justify-content-between">
//                 <div>
//                   <p>
//                     <strong>Branch :</strong>{" "}
//                     {getNameById(branches, selectedIndicator.branch)}
//                   </p>
//                   <p>
//                     <strong>Department :</strong>{" "}
//                     {getNameById(allDepartments, selectedIndicator.department)}
//                   </p>
//                 </div>
//                 <div>
//                   <p>
//                     <strong>Designation :</strong>{" "}
//                     {getNameById(
//                       allDesignations,
//                       selectedIndicator.designation
//                     )}
//                   </p>
//                 </div>
//               </div>
//               {Object.entries(groupedCompetencies).map(([type, comps]) => (
//                 <div key={type} className="mb-4">
//                   <h6 className="mt-3 mb-2">
//                     <strong>{type}</strong>
//                   </h6>
//                   <hr />
//                   {comps.map((comp) => {
//                     const ratingValue =
//                       selectedIndicator.rating?.[comp.name] || 0;
//                     return (
//                       <div
//                         key={comp.id}
//                         className="d-flex justify-content-between align-items-center mb-3"
//                       >
//                         <span>{comp.name}</span>
//                         <StarRating value={Number(ratingValue)} readOnly />
//                       </div>
//                     );
//                   })}
//                 </div>
//               ))}
//             </>
//           )}
//         </Modal.Body>
//       </Modal>
//     </div>
//   );
// };

// export default IndicatorList;

import React, { useEffect, useState } from "react";
import {
  getIndicators,
  createIndicator,
  updateIndicator,
  deleteIndicator,
  getCompetencies,
} from "../../../services/indicatorService";
import branchService from "../../../services/branchService";
import departmentService from "../../../services/departmentService";
import designationService from "../../../services/designationService";
import { Modal, Button, Table, Form } from "react-bootstrap";
import { Pencil, Trash, Eye } from "react-bootstrap-icons";
import StarRating from "../../../components/StarRating.jsx";
import "./IndicatorList.css";

const IndicatorList = () => {
  const [indicators, setIndicators] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedIndicator, setSelectedIndicator] = useState(null);
  const [form, setForm] = useState({
    branch: "",
    department: "",
    designation: "",
    rating: {},
  });
  const [branches, setBranches] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [allDepartments, setAllDepartments] = useState([]);
  const [allDesignations, setAllDesignations] = useState([]);
  const [competencies, setCompetencies] = useState([]);
  const [editId, setEditId] = useState(null);

  const [isClosing, setIsClosing] = useState(false);
  const [isClosingView, setIsClosingView] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    const filtered = indicators.filter((item) => {
      return (
        getNameById(branches, item.branch)
          ?.toLowerCase()
          .includes(search.toLowerCase()) ||
        getNameById(allDepartments, item.department)
          ?.toLowerCase()
          .includes(search.toLowerCase()) ||
        getNameById(allDesignations, item.designation)
          ?.toLowerCase()
          .includes(search.toLowerCase()) ||
        item.created_user_detail?.name
          ?.toLowerCase()
          .includes(search.toLowerCase())
      );
    });
    setFilteredData(filtered);
    setCurrentPage(1);
  }, [search, indicators, branches, allDepartments, allDesignations]);

  // Pagination logic
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = filteredData.slice(
    indexOfFirstEntry,
    indexOfLastEntry
  );

  const fetchInitialData = async () => {
    try {
      const [indRes, branchRes, compRes, deptRes, desigRes] = await Promise.all(
        [
          getIndicators(),
          branchService.getAll(),
          getCompetencies(),
          departmentService.getAll(),
          designationService.getAll(),
        ]
      );

      const parsedIndicators = indRes.data.map((ind) => ({
        ...ind,
        rating:
          typeof ind.rating === "string" ? JSON.parse(ind.rating) : ind.rating,
      }));

      setIndicators(parsedIndicators);
      setBranches(branchRes.data || []);

      // FIX: Handle competencies response properly
      const competenciesData = Array.isArray(compRes?.data) ? compRes.data : [];
      setCompetencies(competenciesData);

      setAllDepartments(deptRes.data || []);
      setAllDesignations(desigRes.data || []);
    } catch (error) {
      console.error("Error fetching initial data:", error);
      // Set empty arrays on error
      setIndicators([]);
      setBranches([]);
      setCompetencies([]);
      setAllDepartments([]);
      setAllDesignations([]);
    }
  };

  // Fetch departments when branch changes (for form)
  useEffect(() => {
    if (form.branch) {
      branchService.getDepartmentsByBranch(form.branch).then((res) => {
        setDepartments(res.data || []);
        setForm((prev) => ({ ...prev, department: "", designation: "" }));
        setDesignations([]);
      });
    } else {
      setDepartments([]);
      setForm((prev) => ({ ...prev, department: "", designation: "" }));
      setDesignations([]);
    }
  }, [form.branch]);

  // Fetch designations when department changes (for form)
  useEffect(() => {
    if (form.department) {
      departmentService
        .getDesignationsByDepartment(form.department)
        .then((res) => {
          setDesignations(res.data || []);
          setForm((prev) => ({ ...prev, designation: "" }));
        });
    } else {
      setDesignations([]);
      setForm((prev) => ({ ...prev, designation: "" }));
    }
  }, [form.department]);

  const handleRatingChange = (value, key) => {
    setForm((prev) => ({
      ...prev,
      rating: {
        ...prev.rating,
        [key]: value,
      },
    }));
  };

  const handleSubmit = async () => {
    const payload = {
      branch: form.branch,
      department: form.department,
      designation: form.designation,
      rating: form.rating,
    };

    try {
      if (editId) {
        await updateIndicator(editId, payload);
      } else {
        await createIndicator(payload);
      }

      setShowModal(false);
      setEditId(null);
      setForm({ branch: "", department: "", designation: "", rating: {} });
      fetchInitialData();
    } catch (error) {
      console.error("Error saving indicator:", error);
    }
  };

  const handleEdit = (indicator) => {
    setForm({
      branch: indicator.branch,
      department: indicator.department,
      designation: indicator.designation,
      rating: { ...indicator.rating },
    });
    setEditId(indicator.id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this indicator?")) {
      try {
        await deleteIndicator(id);
        fetchInitialData();
      } catch (error) {
        console.error("Error deleting indicator:", error);
      }
    }
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setShowModal(false);
      setIsClosing(false);
      setEditId(null);
      setForm({ branch: "", department: "", designation: "", rating: {} });
    }, 700);
  };

  const handleCloseView = () => {
    setIsClosingView(true);
    setTimeout(() => {
      setViewModal(false);
      setIsClosingView(false);
      setSelectedIndicator(null);
    }, 700);
  };

  const getNameById = (list, id) => {
    if (!Array.isArray(list)) return "";
    const item = list.find((el) => el.id === id);
    return item ? item.name : "";
  };

  // FIX: Add proper error handling for groupedCompetencies
  const groupedCompetencies = Array.isArray(competencies)
    ? competencies.reduce((acc, comp) => {
        const type = comp.performanceType?.name || "Other";
        if (!acc[type]) acc[type] = [];
        acc[type].push(comp);
        return acc;
      }, {})
    : {};

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Manage Indicator</h4>
        <Button variant="success" onClick={() => setShowModal(true)}>
          +
        </Button>
      </div>

      <div className="d-flex justify-content-between mb-3">
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
          style={{ width: "250px" }}
        />
      </div>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Branch</th>
            <th>Department</th>
            <th>Designation</th>
            <th>Overall Rating</th>
            <th>Added By</th>
            <th>Created At</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {currentEntries.length > 0 ? (
            currentEntries.map((item) => {
              const ratings = item.rating
                ? Object.values(item.rating)
                    .map(Number)
                    .filter((r) => !isNaN(r))
                : [];
              const avgRating =
                ratings.length > 0
                  ? (
                      ratings.reduce((a, b) => a + b, 0) / ratings.length
                    ).toFixed(1)
                  : 0;
              return (
                <tr key={item.id}>
                  <td>{getNameById(branches, item.branch)}</td>
                  <td>{getNameById(allDepartments, item.department)}</td>
                  <td>{getNameById(allDesignations, item.designation)}</td>
                  <td>
                    <div className="d-flex align-items-center">
                      <StarRating value={parseFloat(avgRating)} readOnly />
                    </div>
                  </td>
                  <td>{item.created_user_detail?.name || "Company"}</td>
                  <td>{new Date(item.created_at).toLocaleDateString()}</td>
                  <td>
                    <Button
                      size="sm"
                      variant="warning"
                      className="me-1"
                      onClick={() => {
                        setSelectedIndicator(item);
                        setViewModal(true);
                      }}
                    >
                      <Eye />
                    </Button>
                    <Button
                      size="sm"
                      variant="info"
                      className="me-1"
                      onClick={() => handleEdit(item)}
                    >
                      <Pencil />
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash />
                    </Button>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="7" className="text-center">
                No records found
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      {/* Create/Edit Modal */}
      <Modal
        show={showModal}
        onHide={handleClose}
        size="lg"
        className={`custom-slide-modal ${isClosing ? "closing" : "open"}`}
        style={{ overflowY: "auto", scrollbarWidth: "none" }}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {editId ? "Edit Indicator" : "Create New Indicator"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Branch</Form.Label>
              <Form.Select
                value={form.branch}
                onChange={(e) => setForm({ ...form, branch: e.target.value })}
              >
                <option value="">Select Branch</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3 row">
              <div className="col-md-6">
                <Form.Label>Department</Form.Label>
                <Form.Select
                  value={form.department}
                  onChange={(e) =>
                    setForm({ ...form, department: e.target.value })
                  }
                  disabled={!departments.length}
                >
                  <option value="">Select Department</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </Form.Select>
              </div>
              <div className="col-md-6">
                <Form.Label>Designation</Form.Label>
                <Form.Select
                  value={form.designation}
                  onChange={(e) =>
                    setForm({ ...form, designation: e.target.value })
                  }
                  disabled={!designations.length}
                >
                  <option value="">Select Designation</option>
                  {designations.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </Form.Select>
              </div>
            </Form.Group>

            <div className="mt-4">
              {Object.keys(groupedCompetencies).length > 0 ? (
                Object.entries(groupedCompetencies).map(([type, comps]) => (
                  <div key={type} className="mb-4">
                    <h6 className="mt-3 mb-2">
                      <strong>{type}</strong>
                    </h6>
                    <hr />
                    {comps.map((comp) => (
                      <div
                        key={comp.id}
                        className="d-flex justify-content-between align-items-center mb-3"
                      >
                        <Form.Label className="mb-0" style={{ width: "60%" }}>
                          {comp.name}
                        </Form.Label>
                        <div style={{ width: "40%" }}>
                          <StarRating
                            value={form.rating[comp.name] || 0}
                            onChange={(val) =>
                              handleRatingChange(val, comp.name)
                            }
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ))
              ) : (
                <p className="text-muted text-center">
                  No competencies available
                </p>
              )}
            </div>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleSubmit}>
            {editId ? "Update" : "Create"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* View Modal */}
      <Modal
        show={viewModal}
        onHide={handleCloseView}
        size="lg"
        className={`custom-slide-modal ${isClosingView ? "closing" : "open"}`}
        style={{ overflowY: "auto", scrollbarWidth: "none" }}
      >
        <Modal.Header closeButton>
          <Modal.Title>Indicator Detail</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedIndicator && (
            <>
              <div className="d-flex justify-content-between">
                <div>
                  <p>
                    <strong>Branch :</strong>{" "}
                    {getNameById(branches, selectedIndicator.branch)}
                  </p>
                  <p>
                    <strong>Department :</strong>{" "}
                    {getNameById(allDepartments, selectedIndicator.department)}
                  </p>
                </div>
                <div>
                  <p>
                    <strong>Designation :</strong>{" "}
                    {getNameById(
                      allDesignations,
                      selectedIndicator.designation
                    )}
                  </p>
                </div>
              </div>
              {Object.keys(groupedCompetencies).length > 0 ? (
                Object.entries(groupedCompetencies).map(([type, comps]) => (
                  <div key={type} className="mb-4">
                    <h6 className="mt-3 mb-2">
                      <strong>{type}</strong>
                    </h6>
                    <hr />
                    {comps.map((comp) => {
                      const ratingValue =
                        selectedIndicator.rating?.[comp.name] || 0;
                      return (
                        <div
                          key={comp.id}
                          className="d-flex justify-content-between align-items-center mb-3"
                        >
                          <span>{comp.name}</span>
                          <StarRating value={Number(ratingValue)} readOnly />
                        </div>
                      );
                    })}
                  </div>
                ))
              ) : (
                <p className="text-muted text-center">
                  No competencies data available
                </p>
              )}
            </>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default IndicatorList;
