
// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import "./UserFormModal.css";
// import { Modal, Button, Form, Alert } from "react-bootstrap";

// const UserFormModal = ({
//   isOpen,
//   onClose,
//   onSubmit,
//   isClosingModal,
//   handleCloseModal,
//   roles
// }) => {
//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [role_id, setRoleId] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const BASE_URL = import.meta.env.VITE_BASE_URL;

//   useEffect(() => {
//     if (isOpen) {
//       setName("");
//       setEmail("");
//       setRoleId("");
//       setPassword("");
//       setError("");
//     }
//   }, [isOpen]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");
//     setIsSubmitting(true);

//     // Validate form
//     if (!name || !email || !password || !role_id) {
//       setError("All fields are required");
//       setIsSubmitting(false);
//       return;
//     }

//     try {
//       // Prepare data according to backend expectations
//       const formData = {
//         name,
//         email,
//         password,
//         role_id: parseInt(role_id)
//       };

//       await onSubmit(formData);
//     } catch (error) {
//       console.error("Error in handleSubmit:", error);
//       setError(error.response?.data?.message || "Failed to create user");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   if (!isOpen) return null;

//   return (
//     <div>
//       <Modal
//         show={isOpen}
//         onHide={handleCloseModal}
//         backdrop="true"
//         keyboard={false}
//         centered
//         className={`custom-slide-modal ${isClosingModal ? "closing" : "open"}`}
//         style={{ overflowY: "auto", scrollbarWidth: "none" }}
//       >
//         <style>{`
//           @keyframes slideInUp {
//             from { transform: translateY(100%); opacity: 0; }
//             to { transform: translateY(0); opacity: 1; }
//           }
//           @keyframes slideOutUp {
//             from { transform: translateY(0); opacity: 1; }
//             to { transform: translateY(-100%); opacity: 0; }
//           }
//           .custom-slide-modal.open .modal-dialog {
//             animation: slideInUp 0.7s ease forwards;
//           }
//           .custom-slide-modal.closing .modal-dialog {
//             animation: slideOutUp 0.7s ease forwards;
//           }
//         `}</style>
//         <Modal.Header>
//           <Modal.Title className="d-flex justify-content-between w-100 align-items-center">
//             Create User{" "}
//             <button
//               onClick={handleCloseModal}
//               type="button"
//               className="btn-close"
//               aria-label="Close"
//             ></button>
//           </Modal.Title>
//         </Modal.Header>

//         <Form onSubmit={handleSubmit}>
//           <Modal.Body>
//             {error && (
//               <Alert variant="danger" className="py-2">
//                 {error}
//               </Alert>
//             )}

//             <Form.Group className="mb-3">
//               <Form.Label>
//                 Name <span className="text-danger">*</span>
//               </Form.Label>
//               <Form.Control
//                 type="text"
//                 placeholder="Enter User Name"
//                 value={name}
//                 onChange={(e) => setName(e.target.value)}
//                 required
//                 disabled={isSubmitting}
//               />
//             </Form.Group>

//             <Form.Group className="mb-3">
//               <Form.Label>
//                 Email <span className="text-danger">*</span>
//               </Form.Label>
//               <Form.Control
//                 type="email"
//                 placeholder="Enter User Email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 required
//                 disabled={isSubmitting}
//               />
//             </Form.Group>

//             <Form.Group className="mb-3">
//               <Form.Label>
//                 User Role <span className="text-danger">*</span>
//               </Form.Label>
//               <Form.Select
//                 value={role_id}
//                 onChange={(e) => setRoleId(e.target.value)}
//                 required
//                 disabled={isSubmitting}
//               >
//                 <option value="">Select Role</option>
//                 {roles.map((role) => (
//                   <option key={role.id} value={role.id}>
//                     {role.name}
//                   </option>
//                 ))}
//               </Form.Select>
//               <div className="mt-1 text-muted">
//                 Create role here.{" "}
//                 <span
//                   className="text-success"
//                   role="button"
//                   onClick={() => alert("Go to role creation page")}
//                 >
//                   Create role
//                 </span>
//               </div>
//             </Form.Group>

//             <Form.Group className="mb-3">
//               <Form.Label>
//                 Password <span className="text-danger">*</span>
//               </Form.Label>
//               <Form.Control
//                 type="password"
//                 placeholder="Enter Password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 required
//                 disabled={isSubmitting}
//                 minLength={6}
//               />
//               <Form.Text className="text-muted">
//                 Password must be at least 6 characters long
//               </Form.Text>
//             </Form.Group>
//           </Modal.Body>
//           <Modal.Footer>
//             <Button 
//               variant="secondary" 
//               onClick={handleCloseModal}
//               disabled={isSubmitting}
//             >
//               Cancel
//             </Button>
//             <Button 
//               variant="success" 
//               type="submit"
//               disabled={isSubmitting}
//             >
//               {isSubmitting ? "Creating..." : "Create User"}
//             </Button>
//           </Modal.Footer>
//         </Form>
//       </Modal>
//     </div>
//   );
// };

// export default UserFormModal;


import React, { useState, useEffect } from "react";
import axios from "axios";
import "./UserFormModal.css";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import { Link } from "react-router-dom"; // Add this import

const UserFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  isClosingModal,
  handleCloseModal,
  roles,
}) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role_id, setRoleId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const BASE_URL = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    if (isOpen) {
      setName("");
      setEmail("");
      setRoleId("");
      setPassword("");
      setError("");
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    // Validate form
    if (!name || !email || !password || !role_id) {
      setError("All fields are required");
      setIsSubmitting(false);
      return;
    }

    try {
      // Prepare data according to backend expectations
      const formData = {
        name,
        email,
        password,
        role_id: parseInt(role_id),
      };

      await onSubmit(formData);
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      setError(error.response?.data?.message || "Failed to create user");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div>
      <Modal
        show={isOpen}
        onHide={handleCloseModal}
        backdrop="true"
        keyboard={false}
        centered
        className={`custom-slide-modal ${isClosingModal ? "closing" : "open"}`}
        style={{ overflowY: "auto", scrollbarWidth: "none" }}
      >
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
        <Modal.Header>
          <Modal.Title className="d-flex justify-content-between w-100 align-items-center">
            Create User{" "}
            <button
              onClick={handleCloseModal}
              type="button"
              className="btn-close"
              aria-label="Close"
            ></button>
          </Modal.Title>
        </Modal.Header>

        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {error && (
              <Alert variant="danger" className="py-2">
                {error}
              </Alert>
            )}

            <Form.Group className="mb-3">
              <Form.Label>
                Name <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter User Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                Email <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter User Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                User Role <span className="text-danger">*</span>
              </Form.Label>
              <div className="d-flex gap-2">
                <Form.Select
                  value={role_id}
                  onChange={(e) => setRoleId(e.target.value)}
                  required
                  disabled={isSubmitting}
                >
                  <option value="">Select Role</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </Form.Select>
                <Link to="/users/roles">
                  <Button
                    variant="outline-success"
                    style={{ textWrap: "nowrap" }}
                  >
                    + Create Role
                  </Button>
                </Link>
              </div>
              <div className="mt-1 text-muted">
                Create role here.{" "}
                <Link
                  to="/users/roles"
                  className="text-success text-decoration-none"
                >
                  Create role
                </Link>
              </div>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                Password <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isSubmitting}
                minLength={6}
              />
              <Form.Text className="text-muted">
                Password must be at least 6 characters long
              </Form.Text>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={handleCloseModal}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button variant="success" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create User"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default UserFormModal;
