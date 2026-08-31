// import React, { useEffect, useState } from "react";
// import {
//   Container,
//   Spinner,
//   Alert,
//   Button,
//   Modal,
//   Form,
// } from "react-bootstrap";
// import {
//   fetchTerms,
//   createTerms,
//   updateTerms,
// } from "../../services/termService";
// import "./TermsAndConditions.css";
// import { CKEditor } from "@ckeditor/ckeditor5-react";
// import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

// const TermAndCondition = ({ token }) => {
//   const [terms, setTerms] = useState(null);
//   const [formData, setFormData] = useState({
//     page_name: "Terms & Conditions",
//     page_type: "content",
//     page_content: "",
//     page_url: "",
//     show_in_header: false,
//     show_in_footer: true,
//     require_login: false,
//   });
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [showEdit, setShowEdit] = useState(false);

//   // Get logged-in user from localStorage
//   const storedUser = JSON.parse(localStorage.getItem("user"));
//   const isCompany = storedUser?.type?.toLowerCase() === "company";

//   // Load Terms & Conditions
//   useEffect(() => {
//     const loadTerms = async () => {
//       try {
//         const res = await fetchTerms(token);
//         if (res?.data) {
//           setTerms(res.data);
//           setFormData(res.data);
//         } else {
//           setError("Terms & Conditions not found");
//         }
//       } catch (err) {
//         setError(
//           err.response?.data?.message ||
//             err.message ||
//             "Failed to load Terms & Conditions"
//         );
//       } finally {
//         setLoading(false);
//       }
//     };
//     loadTerms();
//   }, [token]);

//   // Handle Save (create/update)
//   const handleSave = async () => {
//     try {
//       let res;
//       if (!terms) {
//         res = await createTerms(formData, token);
//       } else {
//         res = await updateTerms(terms._id, formData, token);
//       }

//       if (res.success) {
//         setTerms(res.data);
//         setShowEdit(false);
//       }
//     } catch (err) {
//       alert(err.response?.data?.message || "Failed to save Terms & Conditions");
//     }
//   };

//   if (loading) {
//     return (
//       <div className="text-center my-5">
//         <Spinner animation="border" />
//       </div>
//     );
//   }

//   return (
//     <div className="terms-page">
//       {/* Top Banner */}
//       <div className="top-banner">
//         <p>70% Special Offer. Don’t Miss it. The offer ends in 72 hours.</p>
//       </div>

//       <Container className="mt-4">
//         {/* <h2 className="terms-title">Terms and Conditions</h2> */}

//         {error && (
//           <Alert variant="danger">
//             <Alert.Heading>Error</Alert.Heading>
//             <p>{error}</p>
//           </Alert>
//         )}

//         {terms ? (
//           <>
//             <h2 className="terms-title">{terms.page_name}</h2>
//             {/* <p className="terms-text">{terms.page_content}</p> */}
//                                   <div
//   className="terms-text"
//   dangerouslySetInnerHTML={{ __html: terms.page_content }}
// />
//             {/* Only company can edit */}
//             {isCompany && (
//               <Button variant="primary" className="mb-4" onClick={() => setShowEdit(true)}>
//                 Edit Terms & Conditions
//               </Button>
//             )}
//           </>
//         ) : (
//           <Alert variant="info">
//             <p>No Terms & Conditions found.</p>
//             {isCompany && (
//               <Button variant="success" onClick={() => setShowEdit(true)}>
//                 Create Terms & Conditions
//               </Button>
//             )}
//           </Alert>
//         )}
//       </Container>

//       {/* Edit Modal */}
//       <Modal show={showEdit} onHide={() => setShowEdit(false)} size="lg">
//         <Modal.Header closeButton>
//           <Modal.Title>
//             {terms ? "Edit Terms & Conditions" : "Create Terms & Conditions"}
//           </Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <Form>
// <Form.Group className="mb-3">
//   <Form.Label>Page Name</Form.Label>
//   <Form.Control
//     type="text"
//     name="page_name"
//     value={formData.page_name}
//     onChange={(e) =>
//       setFormData({ ...formData, page_name: e.target.value })
//     }
//   />
// </Form.Group>

// <Form.Group className="mb-3">
//   <Form.Label>Page Content</Form.Label>
//   <CKEditor
//     editor={ClassicEditor}
//     data={formData.page_content}
//     config={{
//       toolbar: [
//         'heading', '|',
//         'bold', 'italic', 'underline', 'link',
//         'bulletedList', 'numberedList', 'blockQuote',
//         '|', 'undo', 'redo'
//       ]
//     }}
//     onChange={(event, editor) => {
//       const data = editor.getData();
//       setFormData({ ...formData, page_content: data });
//     }}
//   />
// </Form.Group>

//           </Form>
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={() => setShowEdit(false)}>
//             Cancel
//           </Button>
//           <Button variant="success" onClick={handleSave}>
//             {terms ? "Update" : "Create"}
//           </Button>
//         </Modal.Footer>
//       </Modal>
//     </div>
//   );
// };

// export default TermAndCondition;

import React, { useEffect, useState } from "react";
import {
  Container,
  Spinner,
  Alert,
  Button,
  Modal,
  Form,
} from "react-bootstrap";
import {
  fetchTerms,
  createTerms,
  updateTerms,
} from "../../services/termService";
import "./TermsAndConditions.css";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import BreadCrumb from "../../components/BreadCrumb";
import { useNavigate, useLocation } from "react-router-dom"; // ? Added
import { OverlayTrigger, Tooltip } from "react-bootstrap";

const TermAndCondition = ({ token }) => {
  const [terms, setTerms] = useState(null);
  const [formData, setFormData] = useState({
    page_name: "Terms & Conditions",
    page_type: "content",
    page_content: "",
    page_url: "",
    show_in_header: false,
    show_in_footer: true,
    require_login: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const [updateChanges, setUpdateChanges] = useState(false);

  // Get logged-in user from localStorage
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const isCompany = storedUser?.type?.toLowerCase() === "company";
  const navigate = useNavigate(); // ? Added

  // Load Terms & Conditions
  useEffect(() => {
    const loadTerms = async () => {
      try {
        const res = await fetchTerms(token);
        if (res?.data) {
          setTerms(res.data);
          setFormData(res.data);
        } else {
          setError("Terms & Conditions not found");
        }
      } catch (err) {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to load Terms & Conditions"
        );
      } finally {
        setLoading(false);
      }
    };
    loadTerms();
  }, [token]);

  // Handle Save (create/update)
  const handleSave = async () => {
    setUpdateChanges(true);
    try {
      let res;
      if (!terms) {
        res = await createTerms(formData, token);
      } else {
        res = await updateTerms(terms._id, formData, token);
      }

      if (res.success) {
        setTerms(res.data);
        setShowEdit(false);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save Terms & Conditions");
    } finally {
      setUpdateChanges(false);
    }
  };

  if (loading) {
    return (
      <div
        className="text-center my-5  d-flex flex-column justify-content-center align-items-center "
        style={{ height: "60vh" }}
      >
        <Spinner animation="border" variant="success" />
        <p className="mt-2">Term and Condition</p>
      </div>
    );
  }

  return (
    <div className="terms-page">
      {/* Top Banner */}

      <Container className="mt-4">
        {/* <h2 className="terms-title">Terms and Conditions</h2> */}

        {error && (
          <Alert variant="danger">
            <Alert.Heading>Error</Alert.Heading>
            <p>{error}</p>
          </Alert>
        )}

        {terms ? (
          <>
            {terms.page_name && (
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <h4 className="mb-0 fw-bold">{terms.page_name}</h4>
                  <BreadCrumb
                    pathname={location.pathname}
                    onNavigate={navigate}
                  />
                </div>
                <OverlayTrigger
                  placement="top"
                  overlay={(props) => <Tooltip {...props}>Edit</Tooltip>}
                >
                  {isCompany && (
                    <Button variant="success" onClick={() => setShowEdit(true)}>
                      <i className="bi bi-pencil-fill"></i>
                    </Button>
                  )}
                </OverlayTrigger>
              </div>
            )}
            {/* <p className="terms-text">{terms.page_content}</p> */}
            <div
              className="terms-text"
              dangerouslySetInnerHTML={{ __html: terms.page_content }}
            />
            {/* Only company can edit */}
            {/* {isCompany && (
              <Button variant="primary" className="mb-4" onClick={() => setShowEdit(true)}>
                Edit Terms & Conditions
              </Button>
            )} */}
          </>
        ) : (
          <Alert variant="info">
            <p>No Terms & Conditions found.</p>
            {isCompany && (
              <Button variant="success" onClick={() => setShowEdit(true)}>
                Create Terms & Conditions
              </Button>
            )}
          </Alert>
        )}
      </Container>

      {/* Edit Modal */}
      <Modal show={showEdit} onHide={() => setShowEdit(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {terms ? "Edit Terms & Conditions" : "Create Terms & Conditions"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Page Name</Form.Label>
              <Form.Control
                type="text"
                name="page_name"
                value={formData.page_name}
                onChange={(e) =>
                  setFormData({ ...formData, page_name: e.target.value })
                }
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Page Content</Form.Label>
              <CKEditor
                editor={ClassicEditor}
                data={formData.page_content}
                config={{
                  toolbar: [
                    "heading",
                    "|",
                    "bold",
                    "italic",
                    "underline",
                    "link",
                    "bulletedList",
                    "numberedList",
                    "blockQuote",
                    "|",
                    "undo",
                    "redo",
                  ],
                }}
                onChange={(event, editor) => {
                  const data = editor.getData();
                  setFormData({ ...formData, page_content: data });
                }}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEdit(false)}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleSave}>
            {updateChanges ? (
              <Spinner
                animation="border"
                size="sm"
              />
            ) : (
              "Save changes"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default TermAndCondition;
