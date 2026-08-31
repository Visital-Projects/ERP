// import React, { useEffect, useState } from "react";
// import {
//   Container,
//   Spinner,
//   Alert,
//   Button,
//   Modal,
//   Form,
// } from "react-bootstrap";
// import { fetchAboutUs, updateAboutUs } from "../../services/aboutService";
// import "./About.css";
// import { CKEditor } from "@ckeditor/ckeditor5-react";
// import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

// const About = () => {
//   const [aboutUs, setAboutUs] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [showEdit, setShowEdit] = useState(false);
//   const [formData, setFormData] = useState({ page_content: "" });

//   const user = JSON.parse(localStorage.getItem("user"));
//   const isSuperAdmin = user?.type === "company";

//   useEffect(() => {
//     const loadAboutUs = async () => {
//       try {
//         const result = await fetchAboutUs();
//         if (result.success) {
//           setAboutUs(result.data);
//           setFormData({ page_content: result.data.page_content });
//         } else {
//           setError(result.message || "Failed to load About Us content");
//         }
//       } catch (err) {
//         setError(
//           err.response?.data?.message ||
//             err.message ||
//             "Failed to load About Us"
//         );
//       } finally {
//         setLoading(false);
//       }
//     };
//     loadAboutUs();
//   }, []);

//   const handleSave = async () => {
//     try {
//       const updated = await updateAboutUs(aboutUs.id, formData);
//       if (updated.success) {
//         setAboutUs(updated.data);
//         setShowEdit(false);
//       }
//     } catch (err) {
//       alert(err.response?.data?.message || "Failed to update About Us");
//     }
//   };

//   return (
//     <div className="about-page">
//       {/* Top Banner */}
//       <div className="top-offer">
//         70% Special Offer. Don’t Miss it. The offer ends in 72 hours.
//       </div>

//       {/* Page Header */}
//       <Container className="py-5">
//         {loading ? (
//           <div className="text-center">
//             <Spinner animation="border" role="status">
//               <span className="visually-hidden">Loading...</span>
//             </Spinner>
//             <p className="mt-2">Loading About Us content...</p>
//           </div>
//         ) : error ? (
//           <Alert variant="danger">
//             <Alert.Heading>Error</Alert.Heading>
//             <p>{error}</p>
//           </Alert>
//         ) : aboutUs ? (
//           <div>
//             {aboutUs.page_name && (
//               <h2 className="terms-title">{aboutUs.page_name}</h2>
//             )}

//             <div
//               className="about-content"
//               dangerouslySetInnerHTML={{ __html: aboutUs.page_content }}
//             />
//             {isSuperAdmin && (
//               <Button
//                 variant="primary"
//                 className="mt-3 mb-4"
//                 onClick={() => setShowEdit(true)}
//               >
//                 Edit About Us
//               </Button>
//             )}
//           </div>
//         ) : (
//           <Alert variant="info">
//             <Alert.Heading>No Content Available</Alert.Heading>
//             <p>No About Us content has been created yet.</p>
//           </Alert>
//         )}
//       </Container>
//       {/* <Modal show={showEdit} onHide={() => setShowEdit(false)} size="lg">
//         <Modal.Header closeButton>
//           <Modal.Title>Edit About Us</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <Form>
//             <Form.Group>
//               <Form.Label>Page Content</Form.Label>
//               <Form.Control
//                 as="textarea"
//                 rows={8}
//                 value={formData.page_content}
//                 onChange={(e) =>
//                   setFormData({ ...formData, page_content: e.target.value })
//                 }
//               />
//             </Form.Group>
//           </Form>
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={() => setShowEdit(false)}>
//             Cancel
//           </Button>
//           <Button variant="success" onClick={handleSave}>
//             Save Changes
//           </Button>
//         </Modal.Footer>
//       </Modal> */}
//       <Modal show={showEdit} onHide={() => setShowEdit(false)} size="lg">
//   <Modal.Header closeButton>
//     <Modal.Title>Edit About Us</Modal.Title>
//   </Modal.Header>
//   <Modal.Body>
//     <Form>
//       {/* ✅ Page Name Input */}
//       <Form.Group className="mb-3">
//         <Form.Label>
//           Page Name <span className="text-danger">*</span>
//         </Form.Label>
//         <Form.Control
//           type="text"
//           placeholder="Enter page name"
//           value={formData.page_name}
//           onChange={(e) =>
//             setFormData({ ...formData, page_name: e.target.value })
//           }
//         />
//       </Form.Group>
// <Form.Group>
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

//     </Form>
//   </Modal.Body>
//   <Modal.Footer>
//     <Button variant="secondary" onClick={() => setShowEdit(false)}>
//       Cancel
//     </Button>
//     <Button variant="success" onClick={handleSave}>
//       Save Changes
//     </Button>
//   </Modal.Footer>
// </Modal>
//     </div>
//   );
// };

// export default About;

// import React, { useEffect, useState } from "react";
// import {
//   Container,
//   Spinner,
//   Alert,
//   Button,
//   Modal,
//   Form,
// } from "react-bootstrap";
// import { fetchAboutUs, updateAboutUs } from "../../services/aboutService";
// import "./About.css";
// import { CKEditor } from "@ckeditor/ckeditor5-react";
// import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
// import BreadCrumb from "../../components/BreadCrumb";
// import { useNavigate, useLocation } from "react-router-dom"; // ? Added
// import { OverlayTrigger, Tooltip } from "react-bootstrap";

// const About = () => {
//   const [aboutUs, setAboutUs] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [showEdit, setShowEdit] = useState(false);
//   const [formData, setFormData] = useState({ page_content: "" });
//   const navigate = useNavigate(); // ? Added

//   const user = JSON.parse(localStorage.getItem("user"));
//   const isSuperAdmin = user?.type === "company";

//   useEffect(() => {
//     const loadAboutUs = async () => {
//       setLoading(true); // ✅ Start loading before fetch
//       try {
//         const result = await fetchAboutUs();
//         if (result.success && result.data) {
//           setAboutUs(result.data);
//           setFormData(prev => ({
//             ...prev,
//             page_name: result.data.page_name || "About Us", // ✅ Ensure page_name is set
//             page_content: result.data.page_content || "",   // ✅ Fallback to empty string
//           }));
//         } else {
//           setError(result.message || "Failed to load About Us content");
//         }
//       } catch (err) {
//         setError(
//           err?.response?.data?.message ||
//           err?.message ||
//           "Failed to load About Us"
//         );
//       } finally {
//         setLoading(false); // ✅ End loading after fetch
//       }
//     };

//     loadAboutUs();
//   }, []);

//   const handleSave = async () => {
//     try {
//       const updated = await updateAboutUs(aboutUs.id, formData);
//       if (updated.success) {
//         setAboutUs(updated.data);
//         setShowEdit(false);
//       }
//     } catch (err) {
//       alert(err.response?.data?.message || "Failed to update About Us");
//     }
//   };

//   return (
//     <div className="about-page">
//       {/* Top Banner */}

//       {/* Page Header */}
//       <Container className="py-5">
//         {loading ? (
//           <div className="text-center d-flex flex-column justify-content-center align-items-center " style={{ height: "60vh" }}>
//             <Spinner animation="border" role="status" variant="success">
//               <span className="visually-hidden">Loading...</span>
//             </Spinner>
//             <p className="mt-2">Loading About Us content...</p>
//           </div>
//         ) : error ? (
//           <Alert variant="danger">
//             <Alert.Heading>Error</Alert.Heading>
//             <p>{error}</p>
//           </Alert>
//         ) : aboutUs ? (
//           <div>
//             {aboutUs.page_name && <div className="d-flex justify-content-between align-items-center mb-3">
//               <div>
//                 <h4 className="mb-0 fw-bold">{aboutUs.page_name}</h4>
//                 <BreadCrumb pathname={location.pathname} onNavigate={navigate} />
//               </div>
//               <OverlayTrigger
//                 placement="top"
//                 overlay={(props) => <Tooltip {...props}>Edit</Tooltip>}
//               >
//                 {
//                   isSuperAdmin && <Button variant="success" onClick={() => setShowEdit(true)}>
//                     <i className="bi bi-pencil-fill"></i>
//                   </Button>
//                 }
//               </OverlayTrigger>
//             </div>
//             }
//             <div
//               className="about-content"
//               dangerouslySetInnerHTML={{ __html: aboutUs.page_content }}
//             />
//             {/* {isSuperAdmin && (
//               <Button
//                 variant="success"
//                 className="mt-3 mb-4"
//                 onClick={() => setShowEdit(true)}
//               >
//                 Edit About Us
//               </Button>
//             )} */}
//           </div>
//         ) : (
//           <Alert variant="info">
//             <Alert.Heading>No Content Available</Alert.Heading>
//             <p>No About Us content has been created yet.</p>
//           </Alert>
//         )}
//       </Container>
//       {/* <Modal show={showEdit} onHide={() => setShowEdit(false)} size="lg">
//         <Modal.Header closeButton>
//           <Modal.Title>Edit About Us</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <Form>
//             <Form.Group>
//               <Form.Label>Page Content</Form.Label>
//               <Form.Control
//                 as="textarea"
//                 rows={8}
//                 value={formData.page_content}
//                 onChange={(e) =>
//                   setFormData({ ...formData, page_content: e.target.value })
//                 }
//               />
//             </Form.Group>
//           </Form>
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={() => setShowEdit(false)}>
//             Cancel
//           </Button>
//           <Button variant="success" onClick={handleSave}>
//             Save Changes
//           </Button>
//         </Modal.Footer>
//       </Modal> */}
//       <Modal show={showEdit} onHide={() => setShowEdit(false)} size="lg">
//         <Modal.Header closeButton>
//           <Modal.Title>Edit About Us</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <Form>
//             {/* ✅ Page Name Input */}
//             <Form.Group className="mb-3">
//               <Form.Label>
//                 Page Name <span className="text-danger">*</span>
//               </Form.Label>
//               <Form.Control
//                 type="text"
//                 placeholder="Enter page name"
//                 value={formData.page_name}
//                 onChange={(e) =>
//                   setFormData({ ...formData, page_name: e.target.value })
//                 }
//               />
//             </Form.Group>
//             <Form.Group>
//               <Form.Label>Page Content</Form.Label>
//               <CKEditor
//                 editor={ClassicEditor}
//                 data={formData.page_content}
//                 config={{
//                   toolbar: [
//                     'heading', '|',
//                     'bold', 'italic', 'underline', 'link',
//                     'bulletedList', 'numberedList', 'blockQuote',
//                     '|', 'undo', 'redo'
//                   ]
//                 }}
//                 onChange={(event, editor) => {
//                   const data = editor.getData();
//                   setFormData({ ...formData, page_content: data });
//                 }}
//               />
//             </Form.Group>

//           </Form>
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={() => setShowEdit(false)}>
//             Cancel
//           </Button>
//           <Button variant="success" onClick={handleSave}>
//             Save Changes
//           </Button>
//         </Modal.Footer>
//       </Modal>
//     </div>
//   );
// };

// export default About;

import React, { useEffect, useState } from "react";
import {
  Container,
  Spinner,
  Alert,
  Button,
  Modal,
  Form,
} from "react-bootstrap";
import { fetchAboutUs, updateAboutUs } from "../../services/aboutService";
import "./About.css";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import BreadCrumb from "../../components/BreadCrumb";
import { useNavigate, useLocation } from "react-router-dom"; // ? Added
import { OverlayTrigger, Tooltip } from "react-bootstrap";

const About = () => {
  const [aboutUs, setAboutUs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const [formData, setFormData] = useState({ page_content: "" });
  const navigate = useNavigate(); // ? Added
  const [updateChanges, setUpdateChanges] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));
  const isSuperAdmin = user?.type === "company";

  useEffect(() => {
    const loadAboutUs = async () => {
      setLoading(true); // ✅ Start loading before fetch
      try {
        const result = await fetchAboutUs();
        if (result.success && result.data) {
          setAboutUs(result.data);
          setFormData((prev) => ({
            ...prev,
            page_name: result.data.page_name || "About Us", // ✅ Ensure page_name is set
            page_content: result.data.page_content || "", // ✅ Fallback to empty string
          }));
        } else {
          setError(result.message || "Failed to load About Us content");
        }
      } catch (err) {
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load About Us"
        );
      } finally {
        setLoading(false); // ✅ End loading after fetch
      }
    };

    loadAboutUs();
  }, []);

  const handleSave = async () => {
    setUpdateChanges(true);
    try {
      const updated = await updateAboutUs(aboutUs.id, formData);
      if (updated.success) {
        setAboutUs(updated.data);
        setShowEdit(false);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update About Us");
    } finally {
      setUpdateChanges(false);
    }
  };

  console.log(aboutUs);

  return (
    <div className="about-page">
      {/* Top Banner */}

      {/* Page Header */}
      <Container className=" mt-4">
        {loading ? (
          <div
            className="text-center d-flex flex-column justify-content-center align-items-center "
            style={{ height: "60vh" }}
          >
            <Spinner animation="border" role="status" variant="success">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
            <p className="mt-2">Loading About Us content...</p>
          </div>
        ) : error ? (
          <Alert variant="danger">
            <Alert.Heading>Error</Alert.Heading>
            <p>{error}</p>
          </Alert>
        ) : aboutUs ? (
          <div>
            {
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <h4 className="mb-0 fw-bold">{aboutUs.page_name}</h4>
                  <BreadCrumb
                    pathname={location.pathname}
                    onNavigate={navigate}
                  />
                </div>
                <OverlayTrigger
                  placement="top"
                  overlay={(props) => <Tooltip {...props}>Edit</Tooltip>}
                >
                  {
                    <Button variant="success" onClick={() => setShowEdit(true)}>
                      <i className="bi bi-pencil-fill"></i>
                    </Button>
                  }
                </OverlayTrigger>
              </div>
            }
            <div
              className="about-content"
              dangerouslySetInnerHTML={{ __html: aboutUs.page_content }}
            />
            {/* {isSuperAdmin && (
              <Button
                variant="success"
                className="mt-3 mb-4"
                onClick={() => setShowEdit(true)}
              >
                Edit About Us
              </Button>
            )} */}
          </div>
        ) : (
          <Alert variant="info">
            <Alert.Heading>No Content Available</Alert.Heading>
            <p>No About Us content has been created yet.</p>
          </Alert>
        )}
      </Container>
      {/* <Modal show={showEdit} onHide={() => setShowEdit(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit About Us</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Page Content</Form.Label>
              <Form.Control
                as="textarea"
                rows={8}
                value={formData.page_content}
                onChange={(e) =>
                  setFormData({ ...formData, page_content: e.target.value })
                }
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEdit(false)}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleSave}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal> */}
      <Modal show={showEdit} onHide={() => setShowEdit(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit About Us</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            {/* ✅ Page Name Input */}
            <Form.Group className="mb-3">
              <Form.Label>
                Page Name <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter page name"
                value={formData.page_name}
                onChange={(e) =>
                  setFormData({ ...formData, page_name: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group>
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

export default About;
