import React, { useState, useEffect } from "react";
import {
  Form,
  Button,
  Card,
  Row,
  Col,
  Alert,
  Spinner,
  Image,
  InputGroup,
  Badge,
} from "react-bootstrap";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  getEmployeeByEmployeeId,
  updateEmployee,
  getRequiredDocuments,
  getEmployeeDocuments,
} from "../../../services/hrmService";
import branchService from "../../../services/branchService";
import departmentService from "../../../services/departmentService";
import designationService from "../../../services/designationService";
import "./EmployeeForm.css";
import { toast } from "react-toastify";
import skillService from "../../../services/skillService";

const EmployeeEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Form state - UPDATED WITH NEW FIELDS
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    dob: "",
    gender: "Male",
    email: "",
    address: "",
    branch_id: "",
    department_id: "",
    designation_id: "",
    company_doj: "",
    account_holder_name: "",
    account_number: "",
    bank_name: "",
    bank_identifier_code: "",
    branch_location: "",
    tax_payer_id: "",
    aadhaar_number: "",
    // NEW FIELDS
    uan_number: "",
    ip_number: "",
    father_name: "",
skill_id: "",
    gatepassno: "",
  });
const [skillsList, setSkillsList] = useState([]);
  // Phone number state (without +91 prefix)
  const [phoneNumber, setPhoneNumber] = useState("");

  // Component state
  const [branches, setBranches] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [requiredDocs, setRequiredDocs] = useState([]);
  const [existingDocs, setExistingDocs] = useState({});
  const [docFiles, setDocFiles] = useState({});
  const [docPreviews, setDocPreviews] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [employeeId, setEmployeeId] = useState(id);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return dateString;
    return dateString.split(" ")[0];
  };

  // Get the full phone number with +91 prefix for display and submission
  const getFullPhoneNumber = () => {
    return `+91${phoneNumber}`;
  };

  // Handle phone number input - only allow numbers and limit to 10 digits
  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, ""); // Remove non-digits
    if (value.length <= 10) {
      setPhoneNumber(value);
    }
  };

  // Handle UAN number input (12 digits only)
  const handleUanChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 12) {
      setFormData((prev) => ({ ...prev, uan_number: value }));
    }
  };

  // Handle IP number input (10 digits only)
  const handleIpChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 10) {
      setFormData((prev) => ({ ...prev, ip_number: value }));
    }
  };

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
const [branchesRes, docsRes, employeeRes, existingDocsRes, skillsRes] =
  await Promise.all([
    branchService.getAll(),
    getRequiredDocuments(),
    getEmployeeByEmployeeId(id),
    getEmployeeDocuments(id),
    skillService.getAll(), // ✅ NEW
  ]);
setSkillsList(Array.isArray(skillsRes) ? skillsRes : []);
        setBranches(Array.isArray(branchesRes) ? branchesRes : []);
        setRequiredDocs(Array.isArray(docsRes) ? docsRes : []);

        if (employeeRes) {
          // Extract phone number without +91 prefix
          let phoneWithoutPrefix = employeeRes.phone || "";
          if (phoneWithoutPrefix.startsWith("+91")) {
            phoneWithoutPrefix = phoneWithoutPrefix.substring(3);
          }

          const employeeData = {
            name: employeeRes.name || "",
            phone: employeeRes.phone || "",
            dob: formatDate(employeeRes.dob),
            gender: employeeRes.gender || "Male",
            email: employeeRes.email || "",
            address: employeeRes.address || "",
            branch_id: employeeRes.branch_id || "",
            department_id: employeeRes.department_id || "",
            designation_id: employeeRes.designation_id || "",
            company_doj: formatDate(employeeRes.company_doj),
            account_holder_name: employeeRes.account_holder_name || "",
            account_number: employeeRes.account_number || "",
            bank_name: employeeRes.bank_name || "",
            bank_identifier_code: employeeRes.bank_identifier_code || "",
            branch_location: employeeRes.branch_location || "",
            tax_payer_id: employeeRes.tax_payer_id || "",
            aadhaar_number: employeeRes.aadhaar_number || "",
            // NEW FIELDS
            uan_number: employeeRes.uan_number || "",
            ip_number: employeeRes.ip_number || "",
            father_name: employeeRes.father_name || "",
            // skills: employeeRes.skills || "Unskills",
            skill_id: employeeRes.skill_id || "",
            gatepassno: employeeRes.gatepassno || "",
          };

          setFormData(employeeData);
          setPhoneNumber(phoneWithoutPrefix);
          setEmployeeId(employeeRes.employee_id || id);

          // Fetch departments and designations using new services
          if (employeeRes.branch_id) {
            const deptRes = await departmentService.getByBranch(
              employeeRes.branch_id
            );
            setDepartments(Array.isArray(deptRes) ? deptRes : []);

            if (employeeRes.department_id) {
              const desigRes = await designationService.getByDepartment(
                employeeRes.department_id
              );
              setDesignations(Array.isArray(desigRes) ? desigRes : []);

              setFormData((prev) => ({
                ...prev,
                branch_id: employeeRes.branch_id,
                department_id: employeeRes.department_id,
                designation_id: employeeRes.designation_id,
              }));
            }
          }
        }

        if (existingDocsRes) {
          const docsMap = {};
          const newPreviews = {};

          existingDocsRes.forEach((doc) => {
            docsMap[doc.document_id] = {
              id: doc.id, // Store the employee_document ID
              document_id: doc.document_id,
              document_value: doc.document_value,
            };
            if (doc.document_value) {
              newPreviews[doc.document_id] =
                doc.document_value.startsWith("http") ||
                doc.document_value.startsWith("data:image")
                  ? doc.document_value
                  : `https://erpcopy2.vnvision.in/uploads/misc/${doc.document_value}`;
            }
          });

          setExistingDocs(docsMap);
          setDocPreviews((prev) => ({ ...prev, ...newPreviews }));
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Department and designation fetch effects
  useEffect(() => {
    const fetchDepartments = async () => {
      if (!formData.branch_id) {
        setDepartments([]);
        setDesignations([]);
        return;
      }

      try {
        const deptRes = await departmentService.getByBranch(formData.branch_id);
        setDepartments(Array.isArray(deptRes) ? deptRes : []);

        setFormData((prev) => {
          const departmentExists = deptRes?.some(
            (d) => d.id === prev.department_id
          );
          return {
            ...prev,
            department_id: departmentExists ? prev.department_id : "",
            designation_id: "",
          };
        });

        setDesignations([]);
      } catch (err) {
        console.error("Error fetching departments:", err);
      }
    };

    if (formData.branch_id) fetchDepartments();
  }, [formData.branch_id]);

  // Department ? Designation effect
  useEffect(() => {
    const fetchDesignations = async () => {
      if (!formData.department_id) {
        setDesignations([]);
        return;
      }

      try {
        const desigRes = await designationService.getByDepartment(
          formData.department_id
        );
        setDesignations(Array.isArray(desigRes) ? desigRes : []);

        setFormData((prev) => {
          const designationExists = desigRes?.some(
            (d) => d.id === prev.designation_id
          );
          return {
            ...prev,
            designation_id: designationExists ? prev.designation_id : "",
          };
        });
      } catch (err) {
        console.error("Error fetching designations:", err);
      }
    };

    if (formData.department_id) fetchDesignations();
  }, [formData.department_id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDocFileChange = (docId, e) => {
    const file = e.target.files[0];
    if (file) {
      setDocFiles((prev) => ({ ...prev, [docId]: file }));

      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setDocPreviews((prev) => ({
            ...prev,
            [docId]: event.target.result,
          }));
        };
        reader.readAsDataURL(file);
      } else {
        setDocPreviews((prev) => ({
          ...prev,
          [docId]: file.name,
        }));
      }
    }
  };

  const removeDocument = (docId) => {
    const newFiles = { ...docFiles };
    const newPreviews = { ...docPreviews };
    delete newFiles[docId];
    delete newPreviews[docId];
    setDocFiles(newFiles);
    setDocPreviews(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Validate phone number
    if (!phoneNumber || phoneNumber.length !== 10) {
      setError("Please enter a valid 10-digit phone number");
      setIsSubmitting(false);
      return;
    }

    try {
      // Validate required fields
      const requiredFields = {
        name: "Name",
        email: "Email",
        branch_id: "Site",
        department_id: "Department",
        designation_id: "Designation",
        dob: "Date of Birth",
        company_doj: "Date of Joining",
      };

      const missingFields = Object.entries(requiredFields)
        .filter(([field]) => !formData[field])
        .map(([_, name]) => name);

      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
      }

      // Prepare FormData for API - include employee data AND documents
      const formDataToSend = new FormData();

      // Append all form data (employee information)
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== null && key !== "phone") {
          formDataToSend.append(key, value);
        }
      });

      // Append phone number with +91 prefix
      formDataToSend.append("phone", getFullPhoneNumber());

      // Append document files - your backend expects them in the format it can parse
      Object.entries(docFiles).forEach(([docId, file]) => {
        formDataToSend.append(`document_${docId}`, file);
      });

      console.log("Sending employee update with documents:", {
        employeeId,
        phone: getFullPhoneNumber(),
        documentCount: Object.keys(docFiles).length,
        documents: Object.keys(docFiles),
      });

      // Update employee (this will handle documents too)
      const response = await updateEmployee(employeeId, formDataToSend);

      if (!response || !response.success) {
        throw new Error(
          response?.message || "Update failed without error message"
        );
      }

      toast.success("Employee data successfully updated.", {
        icon: false,
      });

      // navigate("/employees", {
      navigate(`/employees/${employeeId}`, {
        state: {
          success: `Employee ${formData.name} updated successfully!`,
          employeeId: employeeId,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (err) {
      console.error("Update error:", {
        error: err,
        response: err.response?.data,
      });
      setError(
        err.message ||
          "Failed to update employee. Please check console for details."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mt-4">
      <nav
        aria-label="breadcrumb"
        className="mb-4 d-flex justify-content-between align-items-center"
      >
        <div>
          <ol className="breadcrumb mb-0">
            <li className="breadcrumb-item">
              <Link to="/" className="text-success">
                Home
              </Link>
            </li>
            <li className="breadcrumb-item">
              <Link to="/employees" className="text-success">
                Employees
              </Link>
            </li>
            <li
              className="breadcrumb-item active text-muted"
              aria-current="page"
            >
              #EMP
              {employeeId ? String(employeeId).padStart(5, "0") : "Loading..."}
            </li>
          </ol>
        </div>
        <div
          className="text-secondary"
          style={{ fontWeight: 500, fontSize: "1.1rem" }}
        >
          {employeeId
            ? `EMP ID: ${String(employeeId).padStart(5, "0")}`
            : "Loading ID..."}
        </div>
      </nav>

      <div className="p-2">
        {error && (
          <Alert variant="danger" className="mb-4">
            {error}
          </Alert>
        )}

        <Form onSubmit={handleSubmit} noValidate>
          <Row className="mb-4">
            <Col md={6} className="mb-4 mb-md-0">
              <Card className="border-0 shadow-sm h-100">
                <Card.Body>
                  <h5 className="mb-3 text-primary">Personal Detail</h5>

                  <Row className="mb-3">
                    <Col md={6}>
                      <Form.Group controlId="name">
                        <Form.Label className="fw-bold">
                          Name <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="py-2"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group controlId="phone">
                        <Form.Label className="fw-bold">
                          Phone <span className="text-danger">*</span>
                        </Form.Label>
                        <InputGroup className="">
                          <InputGroup.Text className="bg-light border-end-0">
                            +91
                          </InputGroup.Text>
                          <Form.Control
                            type="tel"
                            value={phoneNumber}
                            onChange={handlePhoneChange}
                            placeholder="Enter 10-digit phone number"
                            required
                            maxLength={10}
                            className="border-start-0"
                          />
                        </InputGroup>
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* Father's Name + Gender in one row */}
                  <Row className="mb-3">
                    <Col md={6}>
                      <Form.Group controlId="father_name">
                        <Form.Label className="fw-bold">
                          Father's Name
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="father_name"
                          value={formData.father_name}
                          onChange={handleChange}
                          placeholder="Enter father's name"
                          className="py-2"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group controlId="gender">
                        <Form.Label className="fw-bold">
                          Gender <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Select
                          name="gender"
                          value={formData.gender}
                          onChange={handleChange}
                          required
                          className="py-2"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* DOB - Full width */}
                  <Row className="mb-3">
                    <Col md={12}>
                      <Form.Group controlId="dob">
                        <Form.Label className="fw-bold">
                          Date of Birth <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                          type="date"
                          name="dob"
                          value={formData.dob}
                          onChange={handleChange}
                          required
                          className="py-2"
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* UAN Number + IP Number in one row */}
                  <Row className="mb-3">
                    <Col md={6}>
                      <Form.Group controlId="uan_number">
                        <Form.Label className="fw-bold">UAN Number</Form.Label>
                        <Form.Control
                          type="text"
                          name="uan_number"
                          value={formData.uan_number}
                          onChange={handleUanChange}
                          placeholder="12-digit UAN number"
                          maxLength={12}
                          className="py-2"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group controlId="ip_number">
                        <Form.Label className="fw-bold">IP Number</Form.Label>
                        <Form.Control
                          type="text"
                          name="ip_number"
                          value={formData.ip_number}
                          onChange={handleIpChange}
                          placeholder="10-digit IP number"
                          maxLength={10}
                          className="py-2"
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* Aadhaar Number Field - Display Only */}
                  {/* <Row className="mb-3">
                    <Col md={12}>
                      <Form.Group controlId="aadhaar_number">
                        <Form.Label className="fw-bold">
                          Aadhaar Number
                        </Form.Label>
                        <div className="px-3 py-2 border rounded "
                        >
                          {formData.aadhaar_number || "Not provided"}
                        </div>
                        <Form.Text className="text-muted">
                          Aadhaar number cannot be modified
                        </Form.Text>
                      </Form.Group>
                    </Col>
                  </Row> */}

                  <Row className="mb-3">
                    <Col md={12}>
                      <Form.Group controlId="aadhaar_number">
                        <Form.Label className="fw-bold">
                          Aadhaar Number<span className="text-danger">*</span>
                          <Badge bg="success" className="ms-2">
                            Verified
                          </Badge>
                        </Form.Label>
                        <Form.Control
                          type="text"
                          value={formData.aadhaar_number}
                          readOnly
                          className={`py-2 bg-success-subtle`}
                        />
                        <Form.Text className="text-muted">
                          Aadhaar number cannot be modified
                        </Form.Text>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row className="mb-3">
                    <Col md={12}>
                      <Form.Group controlId="email">
                        <Form.Label className="fw-bold">
                          Email <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="py-2"
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={12}>
                      <Form.Group controlId="address">
                        <Form.Label className="fw-bold">
                          Address <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={3}
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          required
                          className="py-2"
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>

            <Col md={6}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Body>
                  <h5 className="mb-3 text-primary">Company Detail</h5>

                  <Form.Group className="mb-3" controlId="employeeId">
                    <Form.Label className="fw-bold">Employee ID</Form.Label>
                    <div
                      className="px-3 py-2 text-secondary border border-secondary rounded"
                      style={{ fontWeight: 500 }}
                    >
                      {employeeId
                        ? `#EMP${String(employeeId).padStart(5, "0")}`
                        : "Loading..."}
                    </div>
                  </Form.Group>

                  <Row>
                    <Col md={6}>
                      <Form.Group controlId="branch_id" className="mb-3">
                        <Form.Label className="fw-bold">
                          Site <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Select
                          name="branch_id"
                          value={formData.branch_id}
                          onChange={handleChange}
                          required
                          className="py-2"
                        >
                          <option value="">Select Site</option>
                          {branches.map((branch) => (
                            <option key={branch.id} value={branch.id}>
                              {branch.name}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group controlId="department_id" className="mb-3">
                        <Form.Label className="fw-bold">
                          Department <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Select
                          name="department_id"
                          value={formData.department_id}
                          onChange={handleChange}
                          required
                          disabled={!formData.branch_id}
                          className="py-2"
                        >
                          <option value="">Select Department</option>
                          {departments.map((dept) => (
                            <option key={dept.id} value={dept.id}>
                              {dept.name}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group controlId="designation_id" className="mb-3">
                        <Form.Label className="fw-bold">
                          Designation <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Select
                          name="designation_id"
                          value={formData.designation_id}
                          onChange={handleChange}
                          required
                          disabled={!formData.department_id}
                          className="py-2"
                        >
                          <option value="">Select Designation</option>
                          {designations.map((designation) => (
                            <option key={designation.id} value={designation.id}>
                              {designation.name}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group controlId="company_doj" className="mb-3">
                        <Form.Label className="fw-bold">
                          Date of Joining <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                          type="date"
                          name="company_doj"
                          value={formData.company_doj}
                          onChange={handleChange}
                          required
                          className="py-2"
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* Skills - Added to Company Details */}
                  <Row>
                    <Col md={12}>
                      <Form.Group controlId="skills" className="mb-3">
                        <Form.Label className="fw-bold">Skills</Form.Label>
<Form.Select
  name="skill_id"
  value={formData.skill_id}
  onChange={handleChange}
>
  <option value="">Select Skill</option>
  {skillsList.map((skill) => (
    <option key={skill.id} value={skill.id}>
      {skill.name}
    </option>
  ))}
</Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* Gate Pass Number */}
                  <Row className="mb-3">
                    <Col md={12}>
                      <Form.Group controlId="gatepassno">
                        <Form.Label className="fw-bold">
                          Gate Pass Number
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="gatepassno"
                          value={formData.gatepassno}
                          onChange={handleChange}
                          placeholder="Enter gate pass number"
                          className="py-2"
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Card
                className="border-0 shadow-sm "
                style={{
                  width: "100%",
                  minHeight: "340px",
                  overflow: "hidden",
                }}
              >
                <Card.Body
                  style={{
                    maxHeight: "340px", // ✅ Limit height of inner content
                    overflowY: "auto", // ✅ Enable vertical scroll
                    scrollbarWidth: "thin", // ✅ For Firefox (thin scrollbar)
                  }}
                >
                  <Card.Title className="mb-4 text-primary">
                    Documents
                  </Card.Title>

                  {requiredDocs.length === 0 ? (
                    <Alert variant="info">No documents required</Alert>
                  ) : (
                    <div className="d-flex flex-column gap-3">
                      {requiredDocs.map((doc) => {
                        const existingDoc = existingDocs[doc.id];
                        const preview =
                          docPreviews[doc.id] ||
                          (existingDoc?.document_value
                            ? existingDoc.document_value.startsWith("http") ||
                              existingDoc.document_value.startsWith(
                                "data:image"
                              )
                              ? existingDoc.document_value
                              : `https://erpcopy2.vnvision.in/uploads/misc/${existingDoc.document_value}`
                            : null);

                        return (
                          <div key={doc.id} className="border-bottom pb-3">
                            <div className="d-flex align-items-start gap-3">
                              <div
                                className="flex-shrink-0"
                                style={{ width: "120px" }}
                              >
                                <span className="fw-semibold text-dark">
                                  {doc.name}{" "}
                                  <span className="text-danger">*</span>
                                </span>
                              </div>

                              <div className="flex-grow-1">
                                <Form.Group controlId={`document-${doc.id}`}>
                                  <div className="d-flex align-items-center gap-2">
                                    <Form.Control
                                      type="file"
                                      id={`document-${doc.id}`}
                                      className="d-none"
                                      onChange={(e) =>
                                        handleDocFileChange(doc.id, e)
                                      }
                                      accept=".jpg,.jpeg,.png,.pdf"
                                    />

                                    <label
                                      htmlFor={`document-${doc.id}`}
                                      className="btn btn-outline-success flex-grow-1 text-start py-2"
                                    >
                                      <i className="bi bi-cloud-arrow-up me-2"></i>
                                      {existingDoc
                                        ? "Change file"
                                        : "Choose file"}
                                    </label>

                                    {(preview || existingDoc) && (
                                      <div className="d-flex align-items-center ms-3">
                                        {preview && (
                                          <>
                                            {preview.startsWith("data:image") ||
                                            preview.match(
                                              /\.(jpg|jpeg|png)$/i
                                            ) ? (
                                              <Image
                                                src={preview}
                                                alt="Preview"
                                                width={40}
                                                height={40}
                                                className="rounded me-2 border"
                                                onError={(e) => {
                                                  e.target.onerror = null;
                                                  e.target.src =
                                                    "/placeholder-image.jpg";
                                                }}
                                              />
                                            ) : (
                                              <div className="d-flex align-items-center">
                                                <i className="bi bi-file-earmark-text fs-4 me-2"></i>
                                                <span
                                                  className="text-truncate"
                                                  style={{ maxWidth: "100px" }}
                                                >
                                                  {preview.split("/").pop()
                                                    .length > 15
                                                    ? `${preview
                                                        .split("/")
                                                        .pop()
                                                        .substring(0, 15)}...`
                                                    : preview.split("/").pop()}
                                                </span>
                                              </div>
                                            )}
                                            <Button
                                              variant="link"
                                              size="sm"
                                              className="text-danger p-0 ms-2"
                                              onClick={() =>
                                                removeDocument(doc.id)
                                              }
                                              title="Remove document"
                                            >
                                              <i className="bi bi-x-lg"></i>
                                            </Button>
                                          </>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </Form.Group>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>

            <Col md={6}>
              <Card
                className="border-0 shadow-sm "
                style={{ minHeight: "330px" }}
              >
                <Card.Body>
                  <h5 className="mb-3 text-primary">Bank Account Detail </h5>

                  <Row>
                    <Col md={6}>
                      <Form.Group
                        controlId="account_holder_name"
                        className="mb-3"
                      >
                        <Form.Label className="fw-bold">
                          Account Holder Name{" "}
                          <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="account_holder_name"
                          value={formData.account_holder_name}
                          onChange={handleChange}
                          className="py-2"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group controlId="account_number" className="mb-3">
                        <Form.Label className="fw-bold">
                          Account Number <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="account_number"
                          value={formData.account_number}
                          onChange={handleChange}
                          className="py-2"
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group controlId="bank_name" className="mb-3">
                        <Form.Label className="fw-bold">
                          Bank Name <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="bank_name"
                          value={formData.bank_name}
                          onChange={handleChange}
                          className="py-2"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group
                        controlId="bank_identifier_code"
                        className="mb-3"
                      >
                        <Form.Label className="fw-bold">
                          Bank Identifier Code{" "}
                          <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="bank_identifier_code"
                          value={formData.bank_identifier_code}
                          onChange={handleChange}
                          className="py-2"
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group controlId="branch_location" className="mb-3">
                        <Form.Label className="fw-bold">
                          Branch Location <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="branch_location"
                          value={formData.branch_location}
                          onChange={handleChange}
                          className="py-2"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group controlId="tax_payer_id" className="mb-0">
                        <Form.Label className="fw-bold">
                          Tax Payer ID <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="tax_payer_id"
                          value={formData.tax_payer_id}
                          onChange={handleChange}
                          className="py-2"
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <div className="d-flex justify-content-end gap-3 mt-4">
            <Button
              variant="secondary"
              onClick={() => navigate("/employees")}
              disabled={isSubmitting}
              className="px-4 py-2"
            >
              Cancel
            </Button>
            <Button
              variant="success"
              type="submit"
              className="px-4 py-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Updating..." : "Update Employee"}
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default EmployeeEdit;
