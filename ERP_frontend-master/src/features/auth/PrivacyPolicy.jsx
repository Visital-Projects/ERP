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
//   fetchPrivacy,
//   createPrivacy,
//   updatePrivacy,
// } from "../../services/privacyService";
// import "./TermsAndConditions.css";
// import { CKEditor } from "@ckeditor/ckeditor5-react";
// import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

// const PrivacyPolicy = () => {
//   const [privacy, setPrivacy] = useState(null);
//   const [formData, setFormData] = useState({
//     page_name: "",
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

//   // Load Privacy Policy
//   useEffect(() => {
//     const loadPrivacy = async () => {
//       try {
//         const res = await fetchPrivacy();
//         if (res?.data) {
//           setPrivacy(res.data);
//           setFormData(res.data);
//         } else {
//           setError("Privacy Policy not found");
//         }
//       } catch (err) {
//         setError(
//           err.response?.data?.message ||
//             err.message ||
//             "Failed to load Privacy Policy"
//         );
//       } finally {
//         setLoading(false);
//       }
//     };
//     loadPrivacy();
//   }, []);

//   // Handle Save (create/update)
//   // const handleSave = async () => {
//   //   try {
//   //     let res;
//   //     if (!privacy) {
//   //       res = await createPrivacy(formData);
//   //     } else {
//   //       res = await updatePrivacy(formData);
//   //     }
//   //     if (res.success) {
//   //       setPrivacy(res.data);
//   //       setShowEdit(false);
//   //     }
//   //   } catch (err) {
//   //     alert(err.response?.data?.message || "Failed to save Privacy Policy");
//   //   }
//   // };

//   const handleSave = async () => {
//     try {
//       let res;
//       if (!privacy) {
//         // create new privacy policy
//         res = await createPrivacy(formData);
//       } else {
//         // update existing privacy policy
//         res = await updatePrivacy(privacy._id, formData);
//       }

//       if (res.success) {
//         setPrivacy(res.data);
//         setShowEdit(false);
//       }
//     } catch (err) {
//       alert(err.response?.data?.message || "Failed to save Privacy Policy");
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
//         {/* <h2 className="terms-title">Privacy Policy</h2> */}

//         {error && (
//           <Alert variant="danger">
//             <Alert.Heading>Error</Alert.Heading>
//             <p>{error}</p>
//           </Alert>
//         )}

//         {privacy ? (
//           <>
//             <h2 className="terms-title">{privacy.page_name}</h2>
//             {/* <p className="terms-text">{privacy.page_content}</p> */}
//                         <div
//   className="terms-text"
//   dangerouslySetInnerHTML={{ __html: privacy.page_content }}
// />

//             {/* Only company can edit */}
//             {isCompany && (
//               <Button variant="primary" className="mb-4" onClick={() => setShowEdit(true)}>
//                 Edit Policy
//               </Button>
//             )}
//           </>
//         ) : (
//           <Alert variant="info">
//             <p>No Privacy Policy found.</p>
//             {isCompany && (
//               <Button variant="success"  onClick={() => setShowEdit(true)}>
//                 Create Policy
//               </Button>
//             )}
//           </Alert>
//         )}
//       </Container>

//       <Modal show={showEdit} onHide={() => setShowEdit(false)} size="lg">
//         <Modal.Header closeButton>
//           <Modal.Title>
//             {privacy ? "Edit Privacy Policy" : "Create Privacy Policy"}
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
//             {privacy ? "Update" : "Create"}
//           </Button>
//         </Modal.Footer>
//       </Modal>
//     </div>
//   );
// };

// export default PrivacyPolicy;

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
  fetchPrivacy,
  createPrivacy,
  updatePrivacy,
} from "../../services/privacyService";
import "./TermsAndConditions.css";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import BreadCrumb from "../../components/BreadCrumb";
import { useNavigate, useLocation } from "react-router-dom"; // ? Added
import { OverlayTrigger, Tooltip } from "react-bootstrap";

const PrivacyPolicy = () => {
  const [privacy, setPrivacy] = useState(null);
  const [formData, setFormData] = useState({
    page_name: "",
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

  // Load Privacy Policy
  useEffect(() => {
    const loadPrivacy = async () => {
      try {
        const res = await fetchPrivacy();
        if (res?.data) {
          setPrivacy(res.data);
          setFormData(res.data);
        } else {
          setError("Privacy Policy not found");
        }
      } catch (err) {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to load Privacy Policy"
        );
      } finally {
        setLoading(false);
      }
    };
    loadPrivacy();
  }, []);

  // Handle Save (create/update)
  // const handleSave = async () => {
  //   try {
  //     let res;
  //     if (!privacy) {
  //       res = await createPrivacy(formData);
  //     } else {
  //       res = await updatePrivacy(formData);
  //     }
  //     if (res.success) {
  //       setPrivacy(res.data);
  //       setShowEdit(false);
  //     }
  //   } catch (err) {
  //     alert(err.response?.data?.message || "Failed to save Privacy Policy");
  //   }
  // };

  const handleSave = async () => {
    setUpdateChanges(true);
    try {
      let res;
      if (!privacy) {
        // create new privacy policy
        res = await createPrivacy(formData);
      } else {
        // update existing privacy policy
        res = await updatePrivacy(privacy._id, formData);
      }

      if (res.success) {
        setPrivacy(res.data);
        setShowEdit(false);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save Privacy Policy");
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
        <p className="mt-2">Privacy Policy</p>
      </div>
    );
  }

  return (
    <div className="terms-page">
      {/* Top Banner */}

      <Container className="mt-4">
        {/* <h2 className="terms-title">Privacy Policy</h2> */}

        {error && (
          <Alert variant="danger">
            <Alert.Heading>Error</Alert.Heading>
            <p>{error}</p>
          </Alert>
        )}

        {privacy ? (
          <>
            {privacy.page_name && (
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <h4 className="mb-0 fw-bold">{privacy.page_name}</h4>
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
            {/* <p className="terms-text">{privacy.page_content}</p> */}
            <div
              className="terms-text"
              dangerouslySetInnerHTML={{ __html: privacy.page_content }}
            />

            {/* Only company can edit */}
            {/* {isCompany && (
              <Button
                variant="primary"
                className="mb-4"
                onClick={() => setShowEdit(true)}
              >
                Edit Policy
              </Button>
            )} */}
          </>
        ) : (
          <Alert variant="info">
            <p>No Privacy Policy found.</p>
            {/* {isCompany && (
              <Button variant="success" onClick={() => setShowEdit(true)}>
                Create Policy
              </Button>
            )} */}
          </Alert>
        )}
      </Container>

      <Modal show={showEdit} onHide={() => setShowEdit(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {privacy ? "Edit Privacy Policy" : "Create Privacy Policy"}
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
              <Spinner animation="border" size="sm" />
            ) : (
              "Save changes"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default PrivacyPolicy;
