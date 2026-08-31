// // Enhanced GoalTrackingList.jsx with search and pagination
// import React, { useEffect, useState } from 'react';
// import goalTrackingService from '../../../services/goalTrackingService';
// import goalTypeService from '../../../services/goalTypeService';
// import branchService from '../../../services/branchService';
// import { Modal, Button, Table, Form, Spinner, Alert, ProgressBar } from 'react-bootstrap';
// import { Pencil, Trash, Plus } from 'react-bootstrap-icons';
// import StarRating from '../../../components/StarRating.jsx';

// const GoalTrackingList = () => {
//   const [indicators, setIndicators] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [showModal, setShowModal] = useState(false);
//   const [editingIndicator, setEditingIndicator] = useState(null);
//   const [branches, setBranches] = useState([]);
//   const [goalTypes, setGoalTypes] = useState([]);

//   const [formData, setFormData] = useState({
//     branch: '',
//     goal_type: '',
//     start_date: '',
//     end_date: '',
//     subject: '',
//     target_achievement: '',
//     description: '',
//     rating: 0,
//     status: '',
//     progress: 0,
//   });

//   const [searchTerm, setSearchTerm] = useState('');
//   const [entriesPerPage, setEntriesPerPage] = useState(10);
//   const [currentPage, setCurrentPage] = useState(1);

//   const statusOptions = [
//     { label: 'Not Started', value: 0, variant: 'secondary' },
//     { label: 'In Progress', value: 1, variant: 'primary' },
//     { label: 'Completed', value: 2, variant: 'success' },
//   ];

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setLoading(true);
//         const [indicatorsRes, branchesRes, goalTypesRes] = await Promise.all([
//           goalTrackingService.getGoalTrackings(),
//           branchService.getAll(),
//           goalTypeService.getAll()
//         ]);
//         setIndicators(indicatorsRes.data);
//         setBranches(branchesRes.data);
//         setGoalTypes(goalTypesRes.data);
//         setError(null);
//       } catch (err) {
//         setError('Failed to load data. Please try again later.');
//         console.error('Error fetching data:', err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchData();
//   }, []);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//   };

//   const handleRatingChange = (value) => setFormData(prev => ({ ...prev, rating: value }));

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       if (editingIndicator) {
//         await goalTrackingService.updateGoalTracking(editingIndicator.id, formData);
//       } else {
//         await goalTrackingService.createGoalTracking(formData);
//       }
//       const { data } = await goalTrackingService.getGoalTrackings();
//       setIndicators(data);
//       setShowModal(false);
//       resetForm();
//     } catch (err) {
//       console.error('Error saving goal tracking:', err);
//       setError('Failed to save data. Please try again.');
//     }
//   };

//   const resetForm = () => {
//     setFormData({
//       branch: '',
//       goal_type: '',
//       start_date: '',
//       end_date: '',
//       subject: '',
//       target_achievement: '',
//       description: '',
//       rating: 0,
//       status: '',
//       progress: 0,
//     });
//     setEditingIndicator(null);
//   };

//   const handleEdit = (indicator) => {
//     setEditingIndicator(indicator);
//     setFormData({ ...indicator });
//     setShowModal(true);
//   };

//   const handleDelete = async (id) => {
//     if (window.confirm('Are you sure you want to delete this goal tracking?')) {
//       try {
//         await goalTrackingService.deleteGoalTracking(id);
//         const { data } = await goalTrackingService.getGoalTrackings();
//         setIndicators(data);
//       } catch (err) {
//         console.error('Error deleting goal tracking:', err);
//         setError('Failed to delete. Please try again.');
//       }
//     }
//   };

//   const filteredIndicators = indicators.filter(indicator =>
//     indicator.subject.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   const pageCount = Math.ceil(filteredIndicators.length / entriesPerPage);
//   const startIndex = (currentPage - 1) * entriesPerPage;
//   const currentIndicators = filteredIndicators.slice(startIndex, startIndex + entriesPerPage);

//   const getStatusInfo = (value) => statusOptions.find(opt => opt.value === value) || { label: '-', variant: 'secondary' };
//   const getBranchName = (id) => branches.find(b => b.id === id)?.name || id;
//   const getGoalTypeName = (id) => goalTypes.find(g => g.id === id)?.name || id;

//   return (
//     <div className="container mt-4">
//       <div className="d-flex justify-content-between align-items-center mb-3">
//         <h4 className="fw-bold">Goal Tracking</h4>
//         <Button variant="success" onClick={() => { resetForm(); setShowModal(true); }}>
//           <Plus />
//         </Button>
//       </div>

//       <div className="bg-white p-3 rounded shadow-sm mb-4">
//         <div className="d-flex justify-content-between align-items-center mb-3">
//           <div className="d-flex align-items-center">
//             <select
//               className="form-select me-2"
//               value={entriesPerPage}
//               onChange={(e) => { setEntriesPerPage(Number(e.target.value)); setCurrentPage(1); }}
//               style={{ width: '100px' }}
//             >
//               <option value="10">10</option>
//               <option value="25">25</option>
//               <option value="50">50</option>
//               <option value="100">100</option>
//             </select>
//             <span>entries per page</span>
//           </div>
//           <input
//             type="text"
//             className="form-control"
//             placeholder="Search by subject..."
//             value={searchTerm}
//             onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
//             style={{ maxWidth: '250px' }}
//           />
//         </div>

//         {loading ? (
//           <div className="text-center my-5">
//             {/* <Spinner animation="border" variant="primary" /> */}
//           </div>
//         ) : (
//           <Table striped bordered hover responsive>
//             <thead  >
//               <tr>

//                 <th>Branch</th>
//                 <th>Goal Type</th>
//                 <th>Subject</th>
//                 <th>Target</th>
//                 <th>Status</th>
//                 <th>Start</th>
//                 <th>End</th>
//                 <th>Rating</th>
//                 <th>Progress</th>
//                 <th>Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {currentIndicators.map((item, idx) => {
//                 const status = getStatusInfo(item.status);
//                 return (
//                   <tr key={item.id}>

//                     <td>{getBranchName(item.branch)}</td>
//                     <td>{getGoalTypeName(item.goal_type)}</td>
//                     <td>{item.subject}</td>
//                     <td>{item.target_achievement}</td>
//                     <td><span className={`badge bg-${status.variant}`}>{status.label}</span></td>
//                     <td>{item.start_date}</td>
//                     <td>{item.end_date}</td>
//                     <td><StarRating value={parseInt(item.rating)} showValue={false} readOnly /></td>
//                     <td>
//                       <div className="text-center fw-semibold mb-1">{item.progress}%</div>
//                       <ProgressBar now={item.progress} variant={item.progress < 50 ? 'danger' : item.progress < 100 ? 'info' : 'success'} style={{ height: '10px' }} />
//                     </td>
//                    <td>
//   <Button
//     size="sm"
//     variant="info"
//     className="me-2"
//     onClick={() => handleEdit(item)}
//   >
//     <Pencil color="white" />
//   </Button>
//   <Button
//     size="sm"
//     variant="danger"
//     onClick={() => handleDelete(item.id)}
//   >
//     <Trash color="white" />
//   </Button>
// </td>

//                   </tr>
//                 );
//               })}
//             </tbody>
//           </Table>
//         )}

//         <div className="d-flex justify-content-between align-items-center">
//           <span>
//             Showing {filteredIndicators.length === 0 ? 0 : startIndex + 1} to {Math.min(startIndex + entriesPerPage, filteredIndicators.length)} of {filteredIndicators.length} entries
//           </span>
//           <nav>
//             <ul className="pagination pagination-sm mb-0">
//               {Array.from({ length: pageCount }, (_, i) => i + 1).map(page => (
//                 <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
//                   <button className="page-link" onClick={() => setCurrentPage(page)}>{page}</button>
//                 </li>
//               ))}
//             </ul>
//           </nav>
//         </div>
//       </div>

//       {/* Modal form same as in your original implementation */}
//        <Modal show={showModal} onHide={() => setShowModal(false)} centered>
//         <Modal.Header closeButton>
//           <Modal.Title>{editingIndicator ? 'Edit' : 'Create'} Goal Tracking</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <Form onSubmit={handleSubmit}>
//             <Form.Group className="mb-2">
//               <Form.Label>Branch</Form.Label>
//               <Form.Select name="branch" value={formData.branch} onChange={handleChange} required>
//                 <option value="">Select Branch</option>
//                 {branches.map(branch => (
//                   <option key={branch.id} value={branch.id}>{branch.name}</option>
//                 ))}
//               </Form.Select>
//             </Form.Group>

//             <Form.Group className="mb-2">
//               <Form.Label>Goal Type</Form.Label>
//               <Form.Select name="goal_type" value={formData.goal_type} onChange={handleChange} required>
//                 <option value="">Select Goal Type</option>
//                 {goalTypes.map(type => (
//                   <option key={type.id} value={type.id}>{type.name}</option>
//                 ))}
//               </Form.Select>
//             </Form.Group>

//             <Form.Group className="mb-2">
//               <Form.Label>Subject</Form.Label>
//               <Form.Control type="text" name="subject" value={formData.subject} onChange={handleChange} required />
//             </Form.Group>

//             <Form.Group className="mb-2">
//               <Form.Label>Target Achievement</Form.Label>
//               <Form.Control type="text" name="target_achievement" value={formData.target_achievement} onChange={handleChange} required />
//             </Form.Group>

//             <Form.Group className="mb-2">
//               <Form.Label>Start Date</Form.Label>
//               <Form.Control type="date" name="start_date" value={formData.start_date} onChange={handleChange} required />
//             </Form.Group>

//             <Form.Group className="mb-2">
//               <Form.Label>End Date</Form.Label>
//               <Form.Control type="date" name="end_date" value={formData.end_date} onChange={handleChange} required />
//             </Form.Group>

//             <Form.Group className="mb-2">
//               <Form.Label>Status</Form.Label>
//               <Form.Select name="status" value={formData.status} onChange={handleChange} required>
//                 <option value="">Select Status</option>
//                 {statusOptions.map(opt => (
//                   <option key={opt.value} value={opt.value}>{opt.label}</option>
//                 ))}
//               </Form.Select>
//             </Form.Group>

//             {editingIndicator && (
//               <Form.Group className="mb-2">
//                 <Form.Label>Progress</Form.Label>
//                 <ProgressBar now={formData.progress} label={`${formData.progress}%`} className="mb-2" />
//                 <Form.Range name="progress" min="0" max="100" value={formData.progress} onChange={handleChange} />
//               </Form.Group>
//             )}

//             <Form.Group className="mb-2">
//               <Form.Label>Rating</Form.Label>
//               <StarRating value={formData.rating} onChange={handleRatingChange} />
//             </Form.Group>

//             <Form.Group className="mb-2">
//               <Form.Label>Description</Form.Label>
//               <Form.Control as="textarea" rows={2} name="description" value={formData.description} onChange={handleChange} />
//             </Form.Group>

//             <div className="d-flex justify-content-end">
//               <Button variant="secondary" onClick={() => setShowModal(false)} className="me-2">Cancel</Button>
//               <Button variant="success" type="submit">{editingIndicator ? 'Update' : 'Create'}</Button>
//             </div>
//           </Form>
//         </Modal.Body>
//       </Modal>
//     </div>
//   );
// };

// export default GoalTrackingList;

// Enhanced GoalTrackingList.jsx with search and pagination
import React, { useEffect, useState } from "react";
import goalTrackingService from "../../../services/goalTrackingService";
import goalTypeService from "../../../services/goalTypeService";
import branchService from "../../../services/branchService";
import {
  Modal,
  Button,
  Table,
  Form,
  Spinner,
  Alert,
  ProgressBar,
} from "react-bootstrap";
import { Pencil, Trash, Plus } from "react-bootstrap-icons";
import StarRating from "../../../components/StarRating.jsx";

const GoalTrackingList = () => {
  const [indicators, setIndicators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingIndicator, setEditingIndicator] = useState(null);
  const [branches, setBranches] = useState([]);
  const [goalTypes, setGoalTypes] = useState([]);
  const [isClosingModal, setIsClosingModal] = useState(false);

  const [formData, setFormData] = useState({
    branch: "",
    goal_type: "",
    start_date: "",
    end_date: "",
    subject: "",
    target_achievement: "",
    description: "",
    rating: 0,
    status: "",
    progress: 0,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const statusOptions = [
    { label: "Not Started", value: 0, variant: "secondary" },
    { label: "In Progress", value: 1, variant: "primary" },
    { label: "Completed", value: 2, variant: "success" },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [indicatorsRes, branchesRes, goalTypesRes] = await Promise.all([
          goalTrackingService.getGoalTrackings(),
          branchService.getAll(),
          goalTypeService.getAll(),
        ]);

        // FIX: Handle potential undefined responses
        setIndicators(
          Array.isArray(indicatorsRes?.data) ? indicatorsRes.data : []
        );
        setBranches(Array.isArray(branchesRes?.data) ? branchesRes.data : []);
        setGoalTypes(
          Array.isArray(goalTypesRes?.data) ? goalTypesRes.data : []
        );
        setError(null);
      } catch (err) {
        setError("Failed to load data. Please try again later.");
        console.error("Error fetching data:", err);
        // Ensure arrays are set to empty on error
        setIndicators([]);
        setBranches([]);
        setGoalTypes([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRatingChange = (value) =>
    setFormData((prev) => ({ ...prev, rating: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingIndicator) {
        await goalTrackingService.updateGoalTracking(
          editingIndicator.id,
          formData
        );
      } else {
        await goalTrackingService.createGoalTracking(formData);
      }
      const { data } = await goalTrackingService.getGoalTrackings();
      setIndicators(Array.isArray(data) ? data : []);
      setShowModal(false);
      resetForm();
    } catch (err) {
      console.error("Error saving goal tracking:", err);
      setError("Failed to save data. Please try again.");
    }
  };

  const resetForm = () => {
    setFormData({
      branch: "",
      goal_type: "",
      start_date: "",
      end_date: "",
      subject: "",
      target_achievement: "",
      description: "",
      rating: 0,
      status: "",
      progress: 0,
    });
    setEditingIndicator(null);
  };

  const handleEdit = (indicator) => {
    setEditingIndicator(indicator);
    setFormData({ ...indicator });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this goal tracking?")) {
      try {
        await goalTrackingService.deleteGoalTracking(id);
        const { data } = await goalTrackingService.getGoalTrackings();
        setIndicators(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error deleting goal tracking:", err);
        setError("Failed to delete. Please try again.");
      }
    }
  };

  //  Modal close with animation
  const handleCloseModal = () => {
    setIsClosingModal(true);
    setTimeout(() => {
      setShowModal(false);
      setIsClosingModal(false);
    }, 400);
  };

  // FIX: Ensure indicators is always an array before filtering
  const filteredIndicators = Array.isArray(indicators)
    ? indicators.filter((indicator) =>
        indicator.subject?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const pageCount = Math.ceil(filteredIndicators.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;

  // FIX: Ensure currentIndicators is always an array
  const currentIndicators = Array.isArray(filteredIndicators)
    ? filteredIndicators.slice(startIndex, startIndex + entriesPerPage)
    : [];

  const getStatusInfo = (value) =>
    statusOptions.find((opt) => opt.value === value) || {
      label: "-",
      variant: "secondary",
    };

  // FIX: Add array checks for these functions
  const getBranchName = (id) => {
    if (!Array.isArray(branches)) return id;
    const branch = branches.find((b) => b.id === id);
    return branch?.name || id;
  };

  const getGoalTypeName = (id) => {
    if (!Array.isArray(goalTypes)) return id;
    const goalType = goalTypes.find((g) => g.id === id);
    return goalType?.name || id;
  };

  return (
    <div className="container mt-4">
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

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="fw-bold">Goal Tracking</h4>
        <Button
          variant="success"
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
        >
          <Plus />
        </Button>
      </div>

      <div className="bg-white p-3 rounded shadow-sm mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="d-flex align-items-center">
            <select
              className="form-select me-2"
              value={entriesPerPage}
              onChange={(e) => {
                setEntriesPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              style={{ width: "100px" }}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
            <span>entries per page</span>
          </div>
          <input
            type="text"
            className="form-control"
            placeholder="Search by subject..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            style={{ maxWidth: "250px" }}
          />
        </div>

        {loading ? (
          <div className="text-center my-5">
            {/* <Spinner animation="border" variant="primary" /> */}
          </div>
        ) : (
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Branch</th>
                <th>Goal Type</th>
                <th>Subject</th>
                <th>Target</th>
                <th>Status</th>
                <th>Start</th>
                <th>End</th>
                <th>Rating</th>
                <th>Progress</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {/* FIX: Added safe mapping with array check */}
              {Array.isArray(currentIndicators) &&
              currentIndicators.length > 0 ? (
                currentIndicators.map((item, idx) => {
                  const status = getStatusInfo(item.status);
                  return (
                    <tr key={item.id || idx}>
                      <td>{getBranchName(item.branch)}</td>
                      <td>{getGoalTypeName(item.goal_type)}</td>
                      <td>{item.subject || "-"}</td>
                      <td>{item.target_achievement || "-"}</td>
                      <td>
                        <span className={`badge bg-${status.variant}`}>
                          {status.label}
                        </span>
                      </td>
                      <td>{item.start_date || "-"}</td>
                      <td>{item.end_date || "-"}</td>
                      <td>
                        <StarRating
                          value={parseInt(item.rating) || 0}
                          showValue={false}
                          readOnly
                        />
                      </td>
                      <td>
                        <div className="text-center fw-semibold mb-1">
                          {item.progress || 0}%
                        </div>
                        <ProgressBar
                          now={item.progress || 0}
                          variant={
                            item.progress < 50
                              ? "danger"
                              : item.progress < 100
                              ? "info"
                              : "success"
                          }
                          style={{ height: "10px" }}
                        />
                      </td>
                      <td>
                        <Button
                          size="sm"
                          variant="info"
                          className="me-2"
                          onClick={() => handleEdit(item)}
                        >
                          <Pencil color="white" />
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash color="white" />
                        </Button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="10" className="text-center">
                    No records found
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        )}

        <div className="d-flex justify-content-between align-items-center">
          <span>
            Showing {filteredIndicators.length === 0 ? 0 : startIndex + 1} to{" "}
            {Math.min(startIndex + entriesPerPage, filteredIndicators.length)}{" "}
            of {filteredIndicators.length} entries
          </span>
          <nav>
            <ul className="pagination pagination-sm mb-0">
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
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  </li>
                )
              )}
            </ul>
          </nav>
        </div>
      </div>

      {/* Modal form same as in your original implementation */}
      <Modal
        show={showModal}
        onHide={handleCloseModal}
        centered
        className={`custom-slide-modal ${isClosingModal ? "closing" : "open"}`}
        style={{ overflowY: "auto", scrollbarWidth: "none" }}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {editingIndicator ? "Edit" : "Create"} Goal Tracking
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-2">
              <Form.Label>Branch</Form.Label>
              <Form.Select
                name="branch"
                value={formData.branch}
                onChange={handleChange}
                required
              >
                <option value="">Select Branch</option>
                {Array.isArray(branches) &&
                  branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name}
                    </option>
                  ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Goal Type</Form.Label>
              <Form.Select
                name="goal_type"
                value={formData.goal_type}
                onChange={handleChange}
                required
              >
                <option value="">Select Goal Type</option>
                {Array.isArray(goalTypes) &&
                  goalTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Subject</Form.Label>
              <Form.Control
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Target Achievement</Form.Label>
              <Form.Control
                type="text"
                name="target_achievement"
                value={formData.target_achievement}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Start Date</Form.Label>
              <Form.Control
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>End Date</Form.Label>
              <Form.Control
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Status</Form.Label>
              <Form.Select
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
              >
                <option value="">Select Status</option>
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            {editingIndicator && (
              <Form.Group className="mb-2">
                <Form.Label>Progress</Form.Label>
                <ProgressBar
                  now={formData.progress}
                  label={`${formData.progress}%`}
                  className="mb-2"
                />
                <Form.Range
                  name="progress"
                  min="0"
                  max="100"
                  value={formData.progress}
                  onChange={handleChange}
                />
              </Form.Group>
            )}

            <Form.Group className="mb-2">
              <Form.Label>Rating</Form.Label>
              <StarRating
                value={formData.rating}
                onChange={handleRatingChange}
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="description"
                value={formData.description}
                onChange={handleChange}
              />
            </Form.Group>

            <div className="d-flex justify-content-end">
              <Button
                variant="secondary"
                onClick={handleCloseModal}
                className="me-2"
              >
                Cancel
              </Button>
              <Button variant="success" type="submit">
                {editingIndicator ? "Update" : "Create"}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default GoalTrackingList;
