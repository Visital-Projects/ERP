// import React, { useEffect, useState } from "react";
// import { Modal, Form } from "react-bootstrap";
// import {
//   getAwards,
//   createAward,
//   updateAward,
//   deleteAward,
//   getEmployees,
// } from "../../../services/hrmService";
// import {
//   getAwardTypes, // ? award type service
// } from "../../../services/awardTypeService";
// import "bootstrap-icons/font/bootstrap-icons.css";
// import "bootstrap/dist/css/bootstrap.min.css";
// import { confirmAlert } from "react-confirm-alert";
// import "react-confirm-alert/src/react-confirm-alert.css";
// import BreadCrumb from "../../../components/BreadCrumb";
// import { useNavigate, useLocation } from "react-router-dom"; // ? Added
// import { Button } from "react-bootstrap";
// import { OverlayTrigger, Tooltip } from "react-bootstrap";
// import { toast } from "react-toastify";

// const AwardList = () => {
//   const [awards, setAwards] = useState([]);
//   const [employees, setEmployees] = useState([]);
//   const [awardTypes, setAwardTypes] = useState([]);
//   const [showModal, setShowModal] = useState(false);
//   const [editingAward, setEditingAward] = useState(null);
//   const [formData, setFormData] = useState({
//     employee: "",
//     award_type: "",
//     date: "",
//     gift: "",
//     description: "",
//   });
//   const [searchTerm, setSearchTerm] = useState("");
//   const [currentPage, setCurrentPage] = useState(1);
//   const [entriesPerPage, setEntriesPerPage] = useState(10);
//   const navigate = useNavigate(); // ? Added
//   const location = useLocation(); // ? Added
//   const [isClosingModal, setIsClosingModal] = useState(false); // ? animation state
//   const [validated, setValidated] = useState(false);  // validation

//   useEffect(() => {
//     fetchData();
//   }, []);

//   const fetchData = async () => {
//     try {
//       const [awardData, employeeData, awardTypeData] = await Promise.all([
//         getAwards(),
//         getEmployees(),
//         getAwardTypes(),
//       ]);
//       console.log("Award Types:", awardTypeData);
//       setAwards(awardData);
//       setEmployees(employeeData);
//       setAwardTypes(awardTypeData);
//     } catch (error) {
//       console.error("Failed to fetch data:", error);
//     }
//   };

//   const getEmployeeName = (id) => {
//     const emp = employees.find((e) => Number(e.employee_id) === Number(id));
//     return emp?.name || `ID: ${id}`;
//   };

//   // FIXED: Properly handle award_type object
//   const getAwardTypeName = (awardType) => {
//     if (!awardType) return "Not specified";

//     // Extract ID from object or use directly if it's already an ID
//     const awardTypeId = awardType.id || awardType;

//     // Find the award type name
//     const type = awardTypes.find((t) => Number(t.id) === Number(awardTypeId));

//     return type?.name || `ID: ${awardTypeId}`;
//   };

//   const openModal = (award = null) => {
//     if (award) {
//       setEditingAward(award);
//       setFormData({
//         employee: award.employee_id,
//         award_type: award.award_type?.id || award.award_type, // Handle both object and ID
//         date: award.date,
//         gift: award.gift,
//         description: award.description,
//       });
//     } else {
//       setEditingAward(null);
//       setFormData({
//         employee: "",
//         award_type: "",
//         date: "",
//         gift: "",
//         description: "",
//       });
//     }
//     setShowModal(true);
//   };

//   // ? Closing modal with animation
//   const closeModal = () => {
//     setIsClosingModal(true);
//     setTimeout(() => {
//       setShowModal(false);
//       setIsClosingModal(false);

//       // reset editingAward and formData
//       setEditingAward(null);
//       setFormData({
//         employee: "",
//         award_type: "",
//         date: "",
//         gift: "",
//         description: "",
//       });
//     }, 400);
//   };

//   const handleChange = (e) =>
//     setFormData({ ...formData, [e.target.name]: e.target.value });

//   const handleSubmit = async () => {
//     const payload = {
//       employee_id: Number(formData.employee),
//       award_type: Number(formData.award_type), // ? send award type id
//       date: formData.date,
//       gift: formData.gift,
//       description: formData.description,
//       created_by: 1,
//     };

//     try {
//       if (editingAward) {
//         await updateAward(editingAward.id, payload);
//         toast.success("Award successfully updated.", { icon: false });
//       } else {
//         await createAward(payload);
//         toast.success("Award successfully created.", { icon: false });
//       }
//       closeModal();
//       await fetchData();
//     } catch (error) {
//       console.error("Failed to save award:", error);
//       toast.error("Failed to save award. Please try again.");
//     }
//   };

//   const handleDelete = (id) => {
//     confirmAlert({
//       customUI: ({ onClose }) => (
//         <div className="custom-confirm-modal bg-white p-4 rounded shadow text-center">
//           <div style={{ fontSize: "50px", color: "#ff9900" }}>?</div>
//           <h4 className="fw-bold mt-2">Are you sure?</h4>
//           <p>This action cannot be undone. Do you want to continue?</p>
//           <div className="d-flex justify-content-center mt-3">
//             <button className="btn btn-danger me-2 px-4" onClick={onClose}>
//               No
//             </button>
//             <button
//               className="btn btn-success px-4"
//               onClick={async () => {
//                 try {
//                   await deleteAward(id);
//                   await fetchData();
//                   toast.success("Award deleted successfully.", { icon: false });
//                 } catch (err) {
//                   console.error("Failed to delete award:", err);
//                   toast.error("Failed to delete award.");
//                 }
//                 onClose();
//               }}
//             >
//               Yes
//             </button>
//           </div>
//         </div>
//       ),
//     });
//   };

//   const filteredAwards = awards.filter((award) => {
//     const search = searchTerm.toLowerCase();
//     return (
//       getEmployeeName(award.employee_id).toLowerCase().includes(search) ||
//       getAwardTypeName(award.award_type).toLowerCase().includes(search) ||
//       (award.gift && award.gift.toLowerCase().includes(search)) ||
//       (award.description && award.description.toLowerCase().includes(search))
//     );
//   });

//   const pageCount = Math.ceil(filteredAwards.length / entriesPerPage);
//   const startIndex = (currentPage - 1) * entriesPerPage;
//   const currentAwards = filteredAwards.slice(
//     startIndex,
//     startIndex + entriesPerPage
//   );

//   const handlePageChange = (pageNumber) => {
//     setCurrentPage(pageNumber);
//   };

//   return (
//     <div className="container mt-4">
//       {/* ? Modal Animation Styles */}
//       <style>{`
//         @keyframes slideInUp {
//           from { transform: translateY(100%); opacity: 0; }
//           to { transform: translateY(0); opacity: 1; }
//         }
//         @keyframes slideOutUp {
//           from { transform: translateY(0); opacity: 1; }
//           to { transform: translateY(-100%); opacity: 0; }
//         }
//         .custom-slide-modal.open .modal-dialog {
//           animation: slideInUp 0.7s ease forwards;
//         }
//         .custom-slide-modal.closing .modal-dialog {
//           animation: slideOutUp 0.7s ease forwards;
//         }
//       `}</style>

//       <div className="d-flex justify-content-between align-items-center mb-3">
//         <div>
//           <h4 className="mb-0 fw-bold">Manage Award</h4>
//           <BreadCrumb pathname={location.pathname} onNavigate={navigate} />
//         </div>
//         <OverlayTrigger
//           placement="top"
//           overlay={(props) => <Tooltip {...props}>Create</Tooltip>}
//         >
//           <Button variant="success" onClick={() => openModal()}>
//               <i className="bi bi-plus-lg"></i>
//           </Button>
//         </OverlayTrigger>
//       </div>

//       <div className="bg-white p-3 rounded shadow-sm">
//         {/* Search + Entries Per Page */}
//         <div className="d-flex justify-content-between">
//           <div className="col-12 col-md-6 d-flex align-items-center mb-2 mb-md-0">
//             <select
//               className="form-select me-2"
//               value={entriesPerPage}
//               onChange={(e) => {
//                 setEntriesPerPage(Number(e.target.value));
//                 setCurrentPage(1);
//               }}
//               style={{ width: "80px" }}
//             >
//               {/* <option value="5">5</option> */}
//               <option value="10">10</option>
//               <option value="25">25</option>
//               <option value="50">50</option>
//               <option value="100">100</option>
//             </select>
//           </div>
//           <div >
//             <input
//               type="text"
//               className="form-control form-control-sm"
//               style={{ maxWidth: "250px" }}
//               placeholder="Search..."
//               value={searchTerm}
//               onChange={(e) => {
//                 setSearchTerm(e.target.value);
//                 setCurrentPage(1);
//               }}
//             />
//           </div>
//         </div>

//         {/* Table inside scroll container */}
//         <div className="table-responsive">
//           <table className="table table-hover table-bordered mb-0 table-striped">
//             <thead className="table-light">
//               <tr>
//                 <th>Employee</th>
//                 <th>Award Type</th>
//                 <th>Date</th>
//                 <th>Gift</th>
//                 <th>Description</th>
//                 <th style={{ minWidth: "100px" }}>Action</th>
//               </tr>
//             </thead>
//             <tbody>
//               {currentAwards.length > 0 ? (
//                 currentAwards.map((award) => (
//                   <tr key={award.id}>
//                     <td>{getEmployeeName(award.employee_id)}</td>
//                     <td>{getAwardTypeName(award.award_type)}</td>
//                     <td>
//                       {award.date
//                         ? new Date(award.date).toLocaleDateString()
//                         : "-"}
//                     </td>
//                     <td>{award.gift || "-"}</td>
//                     <td>{award.description || "-"}</td>
//                     <td>
//                       <OverlayTrigger
//                         placement="top"
//                         overlay={<Tooltip>Edit</Tooltip>}
//                       >
//                         <button
//                           className="btn btn-sm btn-info me-2"
//                           onClick={() => openModal(award)}
//                         >
//                           <i className="bi bi-pencil-fill"></i>
//                         </button>
//                       </OverlayTrigger>
//                       <OverlayTrigger
//                         placement="top"
//                         overlay={<Tooltip>Delete</Tooltip>}
//                       >
//                         <button
//                           className="btn btn-sm btn-danger"
//                           onClick={() => handleDelete(award.id)}
//                         >
//                           <i className="bi bi-trash-fill"></i>
//                         </button>
//                       </OverlayTrigger>
//                     </td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan="6" className="text-center">
//                     No award records found.
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>

//         {/* Pagination */}
//         <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mt-2">
//           <span className="mb-2 mb-md-0">
//             Showing {filteredAwards.length === 0 ? 0 : startIndex + 1} to{" "}
//             {Math.min(startIndex + entriesPerPage, filteredAwards.length)} of{" "}
//             {filteredAwards.length} entries
//           </span>
//           <nav>
//             <ul className="pagination pagination-sm mb-0">
//               {/* Left Arrow */}
//               <li
//                 className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
//               >
//                 <button
//                   className="page-link"
//                   onClick={() => setCurrentPage((p) => p - 1)}
//                   disabled={currentPage === 1}
//                 >
//                   «
//                 </button>
//               </li>

//               {/* Page Numbers */}
//               {Array.from({ length: pageCount }, (_, i) => i + 1).map(
//                 (page) => (
//                   <li
//                     key={page}
//                     className={`page-item ${
//                       currentPage === page ? "active" : ""
//                     }`}
//                   >
//                     <button
//                       className="page-link"
//                       onClick={() => handlePageChange(page)}
//                     >
//                       {page}
//                     </button>
//                   </li>
//                 )
//               )}

//               {/* Right Arrow */}
//               <li
//                 className={`page-item ${
//                   currentPage === pageCount ? "disabled" : ""
//                 }`}
//               >
//                 <button
//                   className="page-link"
//                   onClick={() => setCurrentPage((p) => p + 1)}
//                   disabled={currentPage === pageCount}
//                 >
//                   »
//                 </button>
//               </li>
//             </ul>
//           </nav>
//         </div>
//       </div>

//       {/* Modal */}
//       <Modal
//         show={showModal}
//         onHide={closeModal}
//         centered
//         className={`custom-slide-modal ${isClosingModal ? "closing" : "open"}`}
//         style={{ overflowY: "auto", scrollbarWidth: "none" }}
//       >
//         <Modal.Header closeButton>
//           <Modal.Title>
//             {editingAward ? "Edit Award" : "Create Award"}
//           </Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <Form>
//             <Form.Group controlId="employee">
//               <Form.Label>Employee <span className="text-danger">*</span></Form.Label>
//               <Form.Select
//                 name="employee"
//                 value={formData.employee}
//                 onChange={handleChange}
//                 disabled={!!editingAward}
//                 required
//                 >
//                 <option value="">Select employee </option>
//                 {employees.map((emp) => (
//                   <option key={emp.employee_id} value={emp.employee_id}>
//                     {emp.name}
//                   </option>
//                 ))}
//               </Form.Select>
//             </Form.Group>

//             <Form.Group className="mt-2" controlId="award_type">
//               <Form.Label>Award Type <span className="text-danger">*</span></Form.Label>
//               <Form.Select
//                 name="award_type"
//                 value={formData.award_type}
//                 onChange={handleChange}
//                 required
//               >
//                 <option value="">Select award type</option>
//                 {awardTypes.map((type) => (
//                   <option key={type.id} value={type.id}>
//                     {type.name}
//                   </option>
//                 ))}
//               </Form.Select>
//             </Form.Group>

//             <Form.Group className="mt-2" controlId="date">
//               <Form.Label>Date <span className="text-danger">*</span></Form.Label>
//               <Form.Control
//                 type="date"
//                 name="date"
//                 value={formData.date}
//                 onChange={handleChange}
//               />
//             </Form.Group>

//             <Form.Group className="mt-2" controlId="gift">
//               <Form.Label>Gift <span className="text-danger">*</span></Form.Label>
//               <Form.Control
//                 type="text"
//                 name="gift"
//                 value={formData.gift}
//                 onChange={handleChange}
//                 required
//               />
//             </Form.Group>

//             <Form.Group className="mt-2" controlId="description">
//               <Form.Label>Description <span className="text-danger">*</span></Form.Label>
//               <Form.Control
//                 as="textarea"
//                 name="description"
//                 rows={3}
//                 value={formData.description}
//                 onChange={handleChange}
//                 required
//               />
//             </Form.Group>
//           </Form>
//         </Modal.Body>
//         <Modal.Footer>
//           <button className="btn btn-secondary" onClick={closeModal}>
//             Cancel
//           </button>
//           <button className="btn btn-success" onClick={handleSubmit}>
//             {editingAward ? "Update" : "Create"}
//           </button>
//         </Modal.Footer>
//       </Modal>
//     </div>
//   );
// };

// export default AwardList;

import React, { useEffect, useState } from "react";
import { Modal, Form } from "react-bootstrap";
import {
  getAwards,
  createAward,
  updateAward,
  deleteAward,
  getEmployees,
} from "../../../services/hrmService";
import {
  getAwardTypes, // ? award type service
} from "../../../services/awardTypeService";
import "bootstrap-icons/font/bootstrap-icons.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import BreadCrumb from "../../../components/BreadCrumb";
import { useNavigate, useLocation } from "react-router-dom"; // ? Added
import { Button } from "react-bootstrap";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { toast } from "react-toastify";
import { Spinner } from "react-bootstrap";

const AwardList = () => {
  const [awards, setAwards] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [awardTypes, setAwardTypes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingAward, setEditingAward] = useState(null);
  const [loading, setloading] = useState(true);

  const [validationErrors, setValidationErrors] = useState({});

  const [formData, setFormData] = useState({
    employee: "",
    award_type: "",
    date: "",
    gift: "",
    description: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const navigate = useNavigate(); // ? Added
  const location = useLocation(); // ? Added
  const [isClosingModal, setIsClosingModal] = useState(false); // ? animation state
  const [validated, setValidated] = useState(false); // validation

  useEffect(() => {
    fetchData();
  }, []);

  // const fetchData = async () => {
  //   try {
  //     const [awardData, employeeData, awardTypeData] = await Promise.all([
  //       getAwards(),
  //       getEmployees(),
  //       getAwardTypes(),
  //     ]);
  //     console.log("Award Types:", awardTypeData);
  //     setAwards(awardData);
  //     setEmployees(employeeData);
  //     setAwardTypes(awardTypeData);
  //   } catch (error) {
  //     console.error("Failed to fetch data:", error);
  //   } finally {
  //     setloading(false);
  //   }
  // };

  const fetchData = async () => {
    try {
      const [awardData, employeeData, awardTypeData] = await Promise.all([
        getAwards(),
        getEmployees(),
        getAwardTypes(),
      ]);

      // ✅ Filter only active employees
      const activeEmployees = employeeData.filter(
        (emp) => emp.is_active === true
      );

      console.log("Total employees:", employeeData.length);
      console.log("Active employees:", activeEmployees.length);

      setAwards(awardData);
      setEmployees(activeEmployees);
      setAwardTypes(awardTypeData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setloading(false);
    }
  };

  const getEmployeeName = (id) => {
    const emp = employees.find((e) => Number(e.employee_id) === Number(id));
    // return emp?.name || `ID: ${id}`;
    return emp ? `${emp.name} (Emp-ID: ${emp.employee_id})` : `ID: ${id}`;
  };

  // FIXED: Properly handle award_type object
  const getAwardTypeName = (awardType) => {
    if (!awardType) return "Not specified";

    // Extract ID from object or use directly if it's already an ID
    const awardTypeId = awardType.id || awardType;

    // Find the award type name
    const type = awardTypes.find((t) => Number(t.id) === Number(awardTypeId));

    return type?.name || `ID: ${awardTypeId}`;
  };

  const openModal = (award = null) => {
    if (award) {
      setEditingAward(award);
      setFormData({
        employee: award.employee_id,
        award_type: award.award_type?.id || award.award_type, // Handle both object and ID
        date: award.date,
        gift: award.gift,
        description: award.description,
      });
    } else {
      setEditingAward(null);
      setFormData({
        employee: "",
        award_type: "",
        date: "",
        gift: "",
        description: "",
      });
    }
    setShowModal(true);
  };

  // ? Closing modal with animation
  const closeModal = () => {
    setIsClosingModal(true);
    setTimeout(() => {
      setShowModal(false);
      setIsClosingModal(false);

      // reset editingAward and formData
      setEditingAward(null);
      setFormData({
        employee: "",
        award_type: "",
        date: "",
        gift: "",
        description: "",
      });
    }, 400);
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    const errors = {};
    if (!formData.employee) errors.employee = "Employee is required";
    if (!formData.award_type) errors.award_type = "Award type is required";
    if (!formData.date) errors.date = "Date is required";
    if (!formData.gift) errors.gift = "Gift is required";
    if (!formData.description) errors.description = "Description is required";

    setValidationErrors(errors);
    if (Object.keys(errors).length > 0) return; // stop if validation fails

    const payload = {
      employee_id: Number(formData.employee),
      award_type: Number(formData.award_type), // ? send award type id
      date: formData.date,
      gift: formData.gift,
      description: formData.description,
      created_by: 1,
    };

    try {
      if (editingAward) {
        await updateAward(editingAward.id, payload);
        toast.success("Award successfully updated.", { icon: false });
      } else {
        await createAward(payload);
        toast.success("Award successfully created.", { icon: false });
      }
      closeModal();
      await fetchData();
    } catch (error) {
      console.error("Failed to save award:", error);
      toast.error("Failed to save award. Please try again.");
    }
  };

  const handleDelete = (id) => {
    confirmAlert({
      customUI: ({ onClose }) => (
        <div className="custom-confirm-modal bg-white p-4 rounded shadow text-center">
          {/* <div style={{ fontSize: "50px", color: "#ff9900" }}>?</div> */}
          <div style={{ fontSize: "50px", color: "#ff9900" }}>❗</div>
          <h4 className="fw-bold mt-2">Are you sure?</h4>
          <p>This action cannot be undone. Do you want to continue?</p>
          <div className="d-flex justify-content-center mt-3">
            <button className="btn btn-danger me-2 px-4" onClick={onClose}>
              No
            </button>
            <button
              className="btn btn-success px-4"
              onClick={async () => {
                try {
                  await deleteAward(id);
                  await fetchData();
                  toast.success("Award deleted successfully.", { icon: false });
                } catch (err) {
                  console.error("Failed to delete award:", err);
                  toast.error("Failed to delete award.");
                }
                onClose();
              }}
            >
              Yes
            </button>
          </div>
        </div>
      ),
    });
  };

  const filteredAwards = awards.filter((award) => {
    const search = searchTerm.toLowerCase();
    return (
      getEmployeeName(award.employee_id).toLowerCase().includes(search) ||
      getAwardTypeName(award.award_type).toLowerCase().includes(search) ||
      (award.gift && award.gift.toLowerCase().includes(search)) ||
      (award.description && award.description.toLowerCase().includes(search))
    );
  });

  const pageCount = Math.ceil(filteredAwards.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const currentAwards = filteredAwards.slice(
    startIndex,
    startIndex + entriesPerPage
  );

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="container mt-4">
      {/* ? Modal Animation Styles */}
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
          animation: slideInUp 0.7s ease forwards;
        }
        .custom-slide-modal.closing .modal-dialog {
          animation: slideOutUp 0.7s ease forwards;
        }
      `}</style>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4 className="fw-bold">Manage Award</h4>
          <BreadCrumb pathname={location.pathname} onNavigate={navigate} />
        </div>
        <OverlayTrigger
          placement="top"
          overlay={(props) => <Tooltip {...props}>Create</Tooltip>}
        >
          <Button variant="success" onClick={() => openModal()}>
            <i className="bi bi-plus-lg"></i>
          </Button>
        </OverlayTrigger>
      </div>

      <div className="bg-white p-3 rounded shadow-sm mb-4">
        {/* Search + Entries Per Page */}
        <div className="d-flex justify-content-between mb-3">
          <div className="col-12 col-md-6 d-flex align-items-center mb-2 mb-md-0">
            <select
              className="form-select me-2"
              value={entriesPerPage}
              onChange={(e) => {
                setEntriesPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              style={{ width: "80px" }}
            >
              {/* <option value="5">5</option> */}
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
          <div>
            <input
              type="text"
              className="form-control form-control-sm mb-0"
              style={{ maxWidth: "250px" }}
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>

        {/* Table inside scroll container */}
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="success" />
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover table-bordered mb-0 table-striped">
              <thead className="table-light">
                <tr>
                  <th>Employee</th>
                  <th>Award Type</th>
                  <th>Date</th>
                  <th>Gift</th>
                  <th>Description</th>
                  <th style={{ minWidth: "100px" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {currentAwards.length > 0 ? (
                  currentAwards.map((award) => (
                    <tr key={award.id}>
                      <td>{getEmployeeName(award.employee_id)}</td>
                      <td>{getAwardTypeName(award.award_type)}</td>
                      <td>
                        {award.date
                          ? new Date(award.date).toLocaleDateString()
                          : "-"}
                      </td>
                      <td>{award.gift || "-"}</td>
                      <td
                        style={{
                          width: "250px", // fixed width
                          whiteSpace: "normal", // allow wrapping
                          wordWrap: "break-word",
                          // break long words
                        }}
                      >
                        {award.description || "-"}
                      </td>
                      <td>
                        <OverlayTrigger
                          placement="top"
                          overlay={<Tooltip>Edit</Tooltip>}
                        >
                          <button
                            className="btn btn-sm btn-info me-2"
                            onClick={() => openModal(award)}
                          >
                            <i className="bi bi-pencil-fill"></i>
                          </button>
                        </OverlayTrigger>
                        <OverlayTrigger
                          placement="top"
                          overlay={<Tooltip>Delete</Tooltip>}
                        >
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(award.id)}
                          >
                            <i className="bi bi-trash-fill"></i>
                          </button>
                        </OverlayTrigger>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center">
                      No award records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        {/* Pagination */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mt-2">
          <span className="mb-2 mb-md-0">
            Showing {filteredAwards.length === 0 ? 0 : startIndex + 1} to{" "}
            {Math.min(startIndex + entriesPerPage, filteredAwards.length)} of{" "}
            {filteredAwards.length} entries
          </span>
          <nav>
            <ul className="pagination pagination-sm mb-0">
              {/* Left Arrow */}
              <li
                className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
              >
                <button
                  className="page-link"
                  onClick={() => setCurrentPage((p) => p - 1)}
                  disabled={currentPage === 1}
                >
                  «
                </button>
              </li>

              {/* Page Numbers */}
              {Array.from({ length: pageCount }, (_, i) => i + 1).map(
                (page) => (
                  <li
                    key={page}
                    className={`page-item ${
                      currentPage === page ? "active" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </button>
                  </li>
                )
              )}

              {/* Right Arrow */}
              <li
                className={`page-item ${
                  currentPage === pageCount ? "disabled" : ""
                }`}
              >
                <button
                  className="page-link"
                  onClick={() => setCurrentPage((p) => p + 1)}
                  disabled={currentPage === pageCount}
                >
                  »
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Modal */}
      <Modal
        show={showModal}
        onHide={closeModal}
        centered
        className={`custom-slide-modal ${isClosingModal ? "closing" : "open"}`}
        style={{ overflowY: "auto", scrollbarWidth: "none" }}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {editingAward ? "Edit Award" : "Create Award"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="employee">
              <Form.Label>
                Employee <span className="text-danger">*</span>
              </Form.Label>
              <Form.Select
                name="employee"
                value={formData.employee}
                onChange={handleChange}
                disabled={!!editingAward}
                isInvalid={validationErrors.employee}
                required
              >
                <option value="">Select employee </option>
                {employees.map((emp) => (
                  <option key={emp.employee_id} value={emp.employee_id}>
                    {emp.name} (EMP-ID: {emp.employee_id})
                  </option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {validationErrors.employee}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mt-2" controlId="award_type">
              <Form.Label>
                Award Type <span className="text-danger">*</span>
              </Form.Label>
              <Form.Select
                name="award_type"
                value={formData.award_type}
                onChange={handleChange}
                isInvalid={validationErrors.award_type}
                required
              >
                <option value="">Select award type</option>
                {awardTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {validationErrors.award_type}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mt-2" controlId="date">
              <Form.Label>
                Date <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                max="9999-12-31"
                isInvalid={validationErrors.date}
              />
              <Form.Control.Feedback type="invalid">
                {validationErrors.date}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mt-2" controlId="gift">
              <Form.Label>
                Gift <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                name="gift"
                value={formData.gift}
                onChange={handleChange}
                isInvalid={validationErrors.gift}
                required
              />
              <Form.Control.Feedback type="invalid">
                {validationErrors.gift}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mt-2" controlId="description">
              <Form.Label>
                Description <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                as="textarea"
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                isInvalid={validationErrors.description}
                required
              />
              <Form.Control.Feedback type="invalid">
                {validationErrors.description}
              </Form.Control.Feedback>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <button className="btn btn-secondary" onClick={closeModal}>
            Cancel
          </button>
          <button className="btn btn-success" onClick={handleSubmit}>
            {editingAward ? "Update" : "Create"}
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AwardList;
