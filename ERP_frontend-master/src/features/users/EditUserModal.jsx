
// import React, { useState, useEffect } from "react";
// import "./EditUserModal.css";
// import { Modal, Button, Form, Alert } from "react-bootstrap";
// import { Link } from "react-router-dom";

// const EditUserModal = ({
//   isOpen,
//   onClose,
//   userData,
//   onSubmit,
//   roles,
//   isClosingModal,
//   handleCloseModal,
// }) => {
//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [type, setType] = useState("");
//   const [is_active, setIsActive] = useState(1);
//   const [avatar, setAvatar] = useState(null);
//   const [avatarPreview, setAvatarPreview] = useState("");
//   const [error, setError] = useState("");
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const BASE_URL = import.meta.env.VITE_BASE_URL;

//   // useEffect(() => {
//   //   if (isOpen && userData) {
//   //     setName(userData.name || "");
//   //     setEmail(userData.email || "");
//   //     setType(userData.type || "");
//   //     setIsActive(userData.is_active !== undefined ? userData.is_active : 1);
//   //     setAvatar(null);
//   //     setAvatarPreview(userData.avatar ? `${BASE_URL}/${userData.avatar}` : "");
//   //     setError("");
//   //   }
//   // }, [isOpen, userData]);
//   useEffect(() => {
//   if (isOpen && userData) {
//     setName(userData.name || "");
//     setEmail(userData.email || "");
//     setIsActive(userData.is_active !== undefined ? userData.is_active : 1);
//     setAvatar(null);
//     setAvatarPreview(userData.avatar ? `${BASE_URL}/${userData.avatar}` : "");
//     setError("");

//     // Fix role selection
//     if (userData.role_id) {
//       setType(userData.role_id.toString());
//     } else if (userData.type && roles.length > 0) {
//       // fallback: match by name if id is missing
//       const matchedRole = roles.find(
//         (role) => role.name.toLowerCase() === userData.type.toLowerCase()
//       );
//       setType(matchedRole ? matchedRole.id.toString() : "");
//     } else {
//       setType("");
//     }
//   }
// }, [isOpen, userData, roles]);


//   const handleFileChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setAvatar(file);
//       // Create preview
//       const reader = new FileReader();
//       reader.onload = (e) => {
//         setAvatarPreview(e.target.result);
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");
//     setIsSubmitting(true);

//     try {
//       const formData = new FormData();
//       formData.append("name", name);
//       formData.append("email", email);
//       formData.append("type", type);
//       formData.append("is_active", is_active ? 1 : 0);
      
//       if (avatar) {
//         formData.append("avatar", avatar);
//       }

//       await onSubmit(userData.id, formData);
//     } catch (error) {
//       console.error("Error in handleSubmit:", error);
//       setError(error.response?.data?.message || "Failed to update user");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   if (!isOpen) return null;

//   return (
//     <Modal
//       show={isOpen}
//       onHide={handleCloseModal}
//         backdrop="true"
//       keyboard={false}
//       centered
//       className={`custom-slide-modal ${isClosingModal ? "closing" : "open"}`}
//       style={{ overflowY: "auto", scrollbarWidth: "none" }}
//     >
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
//       <Modal.Header>
//         <Modal.Title className="d-flex justify-content-between w-100 align-items-center">
//           Edit User{" "}
//           <button
//             onClick={handleCloseModal}
//             type="button"
//             className="btn-close"
//             aria-label="Close"
//           ></button>
//         </Modal.Title>
//       </Modal.Header>

//       <Form onSubmit={handleSubmit}>
//         <Modal.Body>
//           {error && (
//             <Alert variant="danger" className="py-2">
//               {error}
//             </Alert>
//           )}

//           {/* Avatar Preview and Upload */}
//           <Form.Group className="mb-3 text-center">
//             <Form.Label>Avatar</Form.Label>
//             <div className="mb-2">
//               <img
//                 src={avatarPreview || `${BASE_URL}/uploads/avatars/avatar.png`}
//                 alt="Avatar Preview"
//                 className="rounded-circle"
//                 style={{
//                   width: "80px",
//                   height: "80px",
//                   objectFit: "cover",
//                   border: "2px solid #dee2e6"
//                 }}
//               />
//             </div>
//             <Form.Control
//               type="file"
//               accept="image/*"
//               onChange={handleFileChange}
//               disabled={isSubmitting}
//             />
//           </Form.Group>

//           <Form.Group className="mb-3">
//             <Form.Label>
//               Name <span className="text-danger">*</span>
//             </Form.Label>
//             <Form.Control
//               type="text"
//               value={name}
//               onChange={(e) => setName(e.target.value)}
//               required
//               disabled={isSubmitting}
//             />
//           </Form.Group>

//           <Form.Group className="mb-3">
//             <Form.Label>
//               Email <span className="text-danger">*</span>
//             </Form.Label>
//             <Form.Control
//               type="email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               required
//               disabled={isSubmitting}
//             />
//           </Form.Group>

//           <Form.Group className="mb-3">
//             <Form.Label>
//               User Role <span className="text-danger">*</span>
//             </Form.Label>
//             <div className="d-flex gap-2">
//               <Form.Select
//                 value={type}
//                 onChange={(e) => setType(e.target.value)}
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
//               <Link to="/users/roles">
//                 <Button
//                   variant="outline-success"
//                   style={{ textWrap: "nowrap" }}
//                 >
//                   + Create Role
//                 </Button>
//               </Link>
//             </div>
//           </Form.Group>

//           <Form.Group className="mb-3">
//             <Form.Label>Status</Form.Label>
//             <Form.Select
//               value={is_active}
//               onChange={(e) => setIsActive(Number(e.target.value))}
//               disabled={isSubmitting}
//             >
//               <option value={1}>Active</option>
//               <option value={0}>Inactive</option>
//             </Form.Select>
//           </Form.Group>
//         </Modal.Body>

//         <Modal.Footer>
//           <Button 
//             variant="secondary" 
//             onClick={handleCloseModal}
//             disabled={isSubmitting}
//           >
//             Cancel
//           </Button>
//           <Button 
//             variant="success" 
//             type="submit"
//             disabled={isSubmitting}
//           >
//             {isSubmitting ? "Updating..." : "Update User"}
//           </Button>
//         </Modal.Footer>
//       </Form>
//     </Modal>
//   );
// };

// export default EditUserModal;




import React, { useState, useEffect } from "react";
import "./EditUserModal.css";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";

const EditUserModal = ({
  isOpen,
  onClose,
  userData,
  onSubmit,
  roles,
  isClosingModal,
  handleCloseModal,
}) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [type, setType] = useState("");
  const [is_active, setIsActive] = useState(1);
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const BASE_URL = import.meta.env.VITE_BASE_URL;

  // useEffect(() => {
  //   if (isOpen && userData) {
  //     setName(userData.name || "");
  //     setEmail(userData.email || "");
  //     setType(userData.type || "");
  //     setIsActive(userData.is_active !== undefined ? userData.is_active : 1);
  //     setAvatar(null);
  //     setAvatarPreview(userData.avatar ? `${BASE_URL}/${userData.avatar}` : "");
  //     setError("");
  //   }
  // }, [isOpen, userData]);
  useEffect(() => {
  if (isOpen && userData) {
    setName(userData.name || "");
    setEmail(userData.email || "");
    setIsActive(userData.is_active !== undefined ? userData.is_active : 1);
    setAvatar(null);
    setAvatarPreview(userData.avatar ? `${BASE_URL}/${userData.avatar}` : "");
    setError("");

    // Fix role selection
    if (userData.role_id) {
      setType(userData.role_id.toString());
    } else if (userData.type && roles.length > 0) {
      // fallback: match by name if id is missing
      const matchedRole = roles.find(
        (role) => role.name.toLowerCase() === userData.type.toLowerCase()
      );
      setType(matchedRole ? matchedRole.id.toString() : "");
    } else {
      setType("");
    }
  }
}, [isOpen, userData, roles]);


  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("type", type);
      formData.append("is_active", is_active ? 1 : 0);
      
      if (avatar) {
        formData.append("avatar", avatar);
      }

      await onSubmit(userData.id, formData);
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      setError(error.response?.data?.message || "Failed to update user");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
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
          Edit User{" "}
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

          {/* Avatar Preview and Upload */}
          <Form.Group className="mb-3 text-center">
            <Form.Label>Avatar</Form.Label>
            <div className="mb-2">
              <img
                src={avatarPreview || `${BASE_URL}/uploads/avatars/avatar.png`}
                alt="Avatar Preview"
                className="rounded-circle"
                style={{
                  width: "80px",
                  height: "80px",
                  objectFit: "cover",
                  border: "2px solid #dee2e6"
                }}
              />
            </div>
            <Form.Control
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={isSubmitting}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>
              Name <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
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
                value={type}
                onChange={(e) => setType(e.target.value)}
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
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Status</Form.Label>
            <Form.Select
              value={is_active}
              onChange={(e) => setIsActive(Number(e.target.value))}
              disabled={isSubmitting}
            >
              <option value={1}>Active</option>
              <option value={0}>Inactive</option>
            </Form.Select>
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
          <Button 
            variant="success" 
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Updating..." : "Update User"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default EditUserModal;