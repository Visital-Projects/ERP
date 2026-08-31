import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Alert, Button, Card, Row, Col, Image, Spinner } from "react-bootstrap";
import {
  getEmployeeById,
  getEmployeeDocuments,
} from "../../../services/hrmService";
import branchService from "../../../services/branchService";
import departmentService from "../../../services/departmentService";
import designationService from "../../../services/designationService";
import { getEmployeeByEmployeeId } from "../../../services/hrmService";
import BreadCrumb from "../../../components/BreadCrumb";
import { Dropdown, ButtonGroup } from "react-bootstrap";
import skillService from "../../../services/skillService";

const EmployeeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const BASE_URL = import.meta.env.VITE_BASE_URL;
  const [employee, setEmployee] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [branches, setBranches] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [skills, setSkills] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log("🔄 Fetching employee details for ID:", id);

        // Fetch all data including skills
        const [empData, docsData, branchRes, deptRes, desigRes, skillsRes] =
          await Promise.all([
            getEmployeeByEmployeeId(id),
            getEmployeeDocuments(id),
            branchService.getAll(),
            departmentService.getAll(),
            designationService.getAll(),
            skillService.getAll(), // Fetch all skills for fallback
          ]);

        console.log("📊 Employee data received:", empData);
        console.log("🔍 Skill property in employee:", empData?.skill);
        console.log("🔍 Skill ID in employee:", empData?.skill_id);
        console.log("📊 All skills fetched:", skillsRes);

        if (!empData) {
          throw new Error("Employee not found");
        }

        setEmployee(empData);
        setDocuments(docsData || []);
        setBranches(branchRes || []);
        setDepartments(deptRes || []);
        setDesignations(desigRes || []);
        setSkills(skillsRes || []);
      } catch (error) {
        console.error("❌ Error loading employee details:", error);
        setError(error.message || "Failed to load employee details");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const getNameById = (list, id) => {
    if (!id || !list || !Array.isArray(list)) return "-";
    const match = list.find((item) => String(item.id) === String(id));
    return match?.name || "-";
  };

  // Function to get skill name with multiple fallbacks
  // const getSkillName = () => {
  //   if (!employee) return "-";

  //   // Debug: Log what we have
  //   console.log("🔍 getSkillName called with:", {
  //     employeeSkill: employee.skill,
  //     skill_id: employee.skill_id,
  //     skillsListLength: skills.length,
  //   });

  //   // 1. Try direct skill relation from API
  //   if (employee.skill && employee.skill.name) {
  //     console.log("✅ Found skill from relation:", employee.skill.name);
  //     return employee.skill.name;
  //   }

  //   // 2. Try to find skill by ID in the skills list
  //   if (employee.skill_id && skills.length > 0) {
  //     const foundSkill = skills.find(
  //       (s) =>
  //         String(s.id) === String(employee.skill_id) ||
  //         s.id === employee.skill_id
  //     );
  //     if (foundSkill?.name) {
  //       console.log("✅ Found skill from skills list:", foundSkill.name);
  //       return foundSkill.name;
  //     }
  //   }

  //   // 3. Check for legacy field name
  //   if (employee.skills) {
  //     console.log("✅ Found legacy skills field:", employee.skills);
  //     return employee.skills;
  //   }

  //   // 4. If skill_id exists but no match found
  //   if (employee.skill_id) {
  //     console.log("⚠️ Skill ID exists but no name found:", employee.skill_id);
  //     return `Skill ID: ${employee.skill_id}`;
  //   }

  //   console.log("❌ No skill data found");
  //   return "-";
  // };

  const getSkillName = () => {
    if (!employee) return "-";

    if (employee.skill?.name) {
      return employee.skill.name;
    }

    if (employee.skill_id && skills.length) {
      const skill = skills.find(
        (s) => Number(s.id) === Number(employee.skill_id)
      );
      return skill?.name || "-";
    }

    return "-";
  };

  if (loading) {
    return (
      <div
        className="container mt-5 d-flex justify-content-center align-items-center"
        style={{ minHeight: "60vh" }}
      >
        <div className="text-center">
          <Spinner animation="border" variant="success" className="mb-3" />
          <p className="text-muted">Loading employee details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <Alert variant="danger">
          <Alert.Heading>Error Loading Employee</Alert.Heading>
          <p>{error}</p>
          <hr />
          <div className="d-flex justify-content-end">
            <Button
              variant="outline-danger"
              onClick={() => navigate("/employees")}
            >
              Back to Employees
            </Button>
          </div>
        </Alert>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="container mt-5">
        <Alert variant="warning">
          <Alert.Heading>Employee Not Found</Alert.Heading>
          <p>
            The employee you're looking for doesn't exist or has been removed.
          </p>
          <hr />
          <div className="d-flex justify-content-end">
            <Button
              variant="outline-warning"
              onClick={() => navigate("/employees")}
            >
              Back to Employees
            </Button>
          </div>
        </Alert>
      </div>
    );
  }

  const headerStyle = {
    display: "flex",
    alignItems: "center",
    fontWeight: "600",
    fontSize: "18px",
    position: "relative",
    marginBottom: "8px",
  };

  const verticalBar = {
    width: "4px",
    height: "30px",
    backgroundColor: "#6FD943",
    borderRadius: "0 3px 3px 0",
    marginRight: "10px",
    marginLeft: "-26px",
  };

  const renderCardHeader = (title) => (
    <div style={headerStyle}>
      <div style={verticalBar}></div>
      {title}
    </div>
  );

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4 className="fw-bold">Employee Details</h4>
          <BreadCrumb pathname={location.pathname} onNavigate={navigate} />
        </div>
        <div className="d-flex gap-2">
          {/* <Dropdown as={ButtonGroup}>
            <Dropdown.Toggle
              variant="white"
              className="text-success border"
              style={{ borderColor: "#6FD943" }}
            >
              {" "}
              Joining Letter
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item href="#">
                <i className="bi bi-download me-2"></i> PDF
              </Dropdown.Item>
              <Dropdown.Item href="#">
                <i className="bi bi-download me-2"></i> DOC
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
          <Dropdown as={ButtonGroup}>
            <Dropdown.Toggle
              variant="white"
              className="text-success border"
              style={{ borderColor: "#6FD943" }}
            >
              {" "}
              Experience Certificate
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item href="#">
                <i className="bi bi-download me-2"></i> PDF
              </Dropdown.Item>
              <Dropdown.Item href="#">
                <i className="bi bi-download me-2"></i> DOC
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
          <Dropdown as={ButtonGroup}>
            <Dropdown.Toggle
              variant="white"
              className="text-success border"
              style={{ borderColor: "#46ea00ff" }}
            >
              {" "}
              NOC
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item href="#">
                <i className="bi bi-download me-2"></i> PDF
              </Dropdown.Item>
              <Dropdown.Item href="#">
                <i className="bi bi-download me-2"></i> DOC
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown> */}
          <Button
            className="border-0 px-2 d-flex justify-content-center align-items-center"
            style={{
              backgroundColor: "#3EC9D6",
              color: "#fff",
              height: "40px",
              width: "40px",
            }}
            onClick={() => navigate(`/employees/edit/${id}`)}
          >
            <i className="bi bi-pencil fs-6"></i>
          </Button>
        </div>
      </div>

      <Row className="g-4">
        {/* Personal Detail */}
        <Col md={6}>
          <Card
            style={{ width: "100%", minHeight: "270px" }}
            className="shadow-sm"
          >
            <Card.Body>
              {renderCardHeader("Personal Details")}
              <hr />
              <Row>
                <Col md={6}>
                  <DetailRow label="Employee ID" value={employee.employee_id} />
                  <DetailRow label="Phone" value={employee.phone} />
                  <DetailRow label="Date of Birth" value={employee.dob} />
                  <DetailRow
                    label="Aadhaar Number"
                    value={employee.aadhaar_number}
                  />
                  <DetailRow
                    label="Father's Name"
                    value={employee.father_name}
                  />
                  <DetailRow label="UAN Number" value={employee.uan_number} />
                </Col>
                <Col md={6}>
                  <DetailRow label="Name" value={employee.name} />
                  <DetailRow label="Email" value={employee.email} />
                  <DetailRow label="Address" value={employee.address} />
                  <DetailRow label="IP Number" value={employee.ip_number} />
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>

        {/* Company Detail */}
        <Col md={6}>
          <Card
            style={{ width: "100%", minHeight: "270px" }}
            className="shadow-sm"
          >
            <Card.Body>
              {renderCardHeader("Company Details")}
              <hr />
              <Row>
                <Col md={6}>
                  <DetailRow
                    label="Site"
                    value={
                      employee.branch?.name ||
                      getNameById(branches, employee.branch_id)
                    }
                  />
                  <DetailRow
                    label="Department"
                    value={
                      employee.department?.name ||
                      getNameById(departments, employee.department_id)
                    }
                  />
                  {/* Skills Field */}
                  <DetailRow label="Skills" value={getSkillName()} />
                </Col>
                <Col md={6}>
                  <DetailRow
                    label="Designation"
                    value={
                      employee.designation?.name ||
                      getNameById(designations, employee.designation_id)
                    }
                  />
                  <DetailRow
                    label="Date of Joining"
                    value={employee.company_doj}
                  />
                </Col>
                <DetailRow label="Gate Pass No" value={employee.gatepassno} />
              </Row>
            </Card.Body>
          </Card>
        </Col>

        {/* Document Detail */}
        <Col md={6}>
          <Card
            style={{
              width: "100%",
              minHeight: "270px",
              overflow: "hidden",
            }}
            className="shadow-sm"
          >
            <Card.Body
              style={{
                maxHeight: "270px",
                overflowY: "auto",
                scrollbarWidth: "thin",
              }}
            >
              {renderCardHeader("Document Details")}
              <hr />
              <Row>
                {documents.length > 0 ? (
                  documents.map((doc) => {
                    const correctUrl = doc.document_value.startsWith("http")
                      ? doc.document_value
                      : `${BASE_URL}/uploads/misc/${doc.document_value}`;

                    const finalUrl = correctUrl
                      .replace(/%5B/gi, "[")
                      .replace(/%5D/gi, "]");

                    return (
                      <Col key={doc.id} md={6} className="mb-3">
                        <p style={{ fontWeight: "bold" }}>
                          {doc.document?.name || "Unknown Document"} :
                          <a
                            href={finalUrl}
                            target="_blank"
                            rel="noreferrer"
                            style={{ color: "green", marginLeft: "5px" }}
                          >
                            View
                          </a>
                        </p>
                      </Col>
                    );
                  })
                ) : (
                  <Alert variant="info">No documents available.</Alert>
                )}
              </Row>
            </Card.Body>
          </Card>
        </Col>

        {/* Bank Account Detail */}
        <Col md={6}>
          <Card
            style={{ width: "100%", minHeight: "270px" }}
            className="shadow-sm"
          >
            <Card.Body>
              {renderCardHeader("Bank Account Details")}
              <hr />
              <Row>
                <Col md={6}>
                  <DetailRow
                    label="Account Holder Name"
                    value={employee.account_holder_name}
                  />
                  <DetailRow label="Bank Name" value={employee.bank_name} />
                  <DetailRow
                    label="Site Location"
                    value={employee.branch_location}
                  />
                </Col>
                <Col md={6}>
                  <DetailRow
                    label="Account Number"
                    value={employee.account_number}
                  />
                  <DetailRow
                    label="Bank Identifier Code"
                    value={employee.bank_identifier_code}
                  />
                  <DetailRow
                    label="Tax Payer Id"
                    value={employee.tax_payer_id}
                  />
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

// ✅ Reusable component for bold label + normal value
const DetailRow = ({ label, value }) => (
  <p style={{ marginBottom: "10px" }}>
    <span style={{ fontWeight: "bold" }}>{label}: </span>
    <span>{value || "-"}</span>
  </p>
);

export default EmployeeDetail;
