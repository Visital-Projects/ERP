
import React, { useEffect, useState } from "react";
import {
  Card,
  Button,
  Modal,
  Form,
  Spinner,
  Alert,
  Table,
} from "react-bootstrap";
import { Plus, PencilSquare } from "react-bootstrap-icons";
import { useNavigate } from "react-router-dom";
import apiClient from "../../../../services/apiClient";
// import { fetchAllAccounts } from "../../../../services/accountnameService";
import payslipTypeService from "../../../../services/paysliptypeService";
import skillService from "../../../../services/skillService";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

const SalaryCard = ({ employee, fetchEmployee }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [salaryData, setSalaryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [accounts, setAccounts] = useState([]);
  const [payslipTypes, setPayslipTypes] = useState([]);
  const [accountsLoading, setAccountsLoading] = useState(false);
  const [payslipTypesLoading, setPayslipTypesLoading] = useState(false);
  const [formData, setFormData] = useState({
    employee_type: "", // Default value
    salary_type: "",
    salary: "",
    skill_id: "",
    basic_salary: "",
    // account: "",
  });

  const [skills, setSkills] = useState([]);
  const [skillsLoading, setSkillsLoading] = useState(false);

  const navigate = useNavigate();
  const [isClosingModal, setIsClosingModal] = useState(false);

  // Fetch accounts and payslip types on component mount
  useEffect(() => {
    fetchAccountsList();
    fetchPayslipTypes();
    fetchSkills();
  }, []);

  useEffect(() => {
    if (employee && employee.employee_id) {
      fetchSalary();
    }
  }, [employee]);

  const fetchAccountsList = async () => {
    try {
      setAccountsLoading(true);
      const data = await fetchAllAccounts();
      console.log("RAW ACCOUNTS DATA:", data);

      if (data && data.length > 0) {
        console.log("FIRST ACCOUNT OBJECT:", data[0]);
        console.log("Available keys in first account:", Object.keys(data[0]));
      }

      setAccounts(data || []);
    } catch (err) {
      console.error("Error loading accounts:", err);
      setError("Failed to load accounts");
    } finally {
      setAccountsLoading(false);
    }
  };

  const fetchPayslipTypes = async () => {
    try {
      setPayslipTypesLoading(true);
      const data = await payslipTypeService.getAll();
      console.log("Payslip Types Data:", data);
      setPayslipTypes(data || []);
    } catch (err) {
      console.error("Error loading payslip types:", err);
      setError("Failed to load payslip types");
    } finally {
      setPayslipTypesLoading(false);
    }
  };

  const fetchSalary = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiClient.get(`/set-salary/${employee.employee_id}`);
      console.log("Salary API Response:", res.data);
      setSalaryData(res.data.data);

      setFormData({
        employee_type: res.data.data.employee_type || "", // Set default if not available
        salary_type: res.data.data.salary_type
          ? String(res.data.data.salary_type)
          : "",
        salary: res.data.data.salary || "",
        basic_salary: res.data.data.basic_salary || "",
        account: res.data.data.account || "",
        skill_id: res.data.data.skill_id || "",
      });
    } catch (err) {
      console.error("Error fetching salary", err);
      setError(err.response?.data?.message || "Failed to fetch salary data");
    } finally {
      setLoading(false);
    }
  };

  const fetchSkills = async () => {
    try {
      setSkillsLoading(true);
      const data = await skillService.getAll();
      console.log("SKILLS LIST:", data);
      setSkills(data || []);
    } catch (err) {
      console.error("Failed to load skills", err);
      setError("Failed to load skills");
    } finally {
      setSkillsLoading(false);
    }
  };

  const handleOpen = () => {
    setModalOpen(true);
  };

  const handleClose = () => {
    setIsClosingModal(true);
    setTimeout(() => {
      setModalOpen(false);
      setIsClosingModal(false);
    }, 700);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // If skill is changed → auto fill salary
    if (name === "skill_id") {
      const selectedSkill = skills.find(
        (skill) => skill.id.toString() === value.toString()
      );

      setFormData((prev) => ({
        ...prev,
        skill_id: value,
        salary: selectedSkill ? selectedSkill.wages : "",
      }));

      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  useEffect(() => {
    if (!formData.skill_id || skills.length === 0) return;

    const selectedSkill = skills.find(
      (skill) => skill.id.toString() === formData.skill_id.toString()
    );

    if (selectedSkill) {
      setFormData((prev) => ({
        ...prev,
        salary: selectedSkill.wages,
      }));
    }
  }, [formData.skill_id, skills]);

  const handleSubmit = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      if (
        !formData.employee_type ||
        !formData.salary_type ||
        !formData.skill_id ||
        !formData.basic_salary
      ) {
        setError("Please fill all required fields");
        return;
      }
      const payload = {
        employee_type: formData.employee_type,
        salary_type: formData.salary_type,
        skill_id: formData.skill_id,
        basic_salary: formData.basic_salary,
        // account: formData.account (if required later)
      };

      await apiClient.put(`/set-salary/${employee.employee_id}`, payload);

      setSuccess("Salary updated successfully!");
      setTimeout(() => {
        setModalOpen(false);
        fetchSalary();
        if (fetchEmployee) fetchEmployee();
      }, 1000);
    } catch (err) {
      console.error("Failed to update salary:", err);
      setError(err.response?.data?.message || "Failed to update salary");
    } finally {
      setSaving(false);
    }
  };

  const getAccountDisplayName = (account) => {
    if (!account) return "Unknown Account";

    console.log("Account object for display:", account);

    const bankName = account.bank || account.bank_name || account.BANK;
    console.log("Extracted bank name:", bankName);

    if (bankName) {
      return bankName;
    }

    const accountName = account.name || account.account_name || account.NAME;
    if (accountName) {
      return accountName;
    }

    const accountId = account.id || account.account_id || account._id;
    return `Account ${accountId}`;
  };

  const getAccountId = (account) => {
    return account.id || account.account_id || account._id;
  };

  const getPayslipTypeName = (payslipTypeId) => {
    if (!payslipTypeId) return "--";

    const payslipType = payslipTypes.find(
      (type) => type.id?.toString() === payslipTypeId.toString()
    );

    return payslipType?.name || `Type ${payslipTypeId}`;
  };

  const getAccountName = (accountId) => {
    if (!accountId) return "--";

    const account = accounts.find((acc) => {
      const accId = getAccountId(acc);
      return accId != null && accId.toString() === accountId.toString();
    });

    if (account) {
      return getAccountDisplayName(account);
    }

    return `Account ${accountId}`;
  };
  const getSkillName = (skillId) => {
    if (!skillId) return "--";
    const skill = skills.find((s) => s.id.toString() === skillId.toString());
    return skill?.name || "--";
  };
  const handleUpdateSkill = () => {
    if (!employee?.employee_id) return;
    navigate(`/employees/${employee.employee_id}`);
  };

  if (loading || accountsLoading || payslipTypesLoading) {
    return (
      <Card style={{ height: "340px" }}>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <strong>Employee Salary</strong>
          <Button variant="success" size="sm" onClick={handleOpen}>
            <Plus size={16} />
          </Button>
        </Card.Header>
        <Card.Body className="d-flex justify-content-center align-items-center">
          <Spinner animation="border" variant="success" />
        </Card.Body>
      </Card>
    );
  }

  return (
    <>
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

      <Card style={{ height: "384px" }} className="ps-3 pe-3">
        <Card.Header className="d-flex justify-content-between align-items-center mb-3 card-header">
          <h5 className="mb-0"> Employee Salary</h5>
          <OverlayTrigger
            placement="top"
            overlay={
              <Tooltip id="tooltip">
                {salaryData &&
                (salaryData.salary ||
                  salaryData.salary_type ||
                  salaryData.account)
                  ? "Edit"
                  : "Add Salary"}
              </Tooltip>
            }
          >
            <Button variant="success" onClick={handleOpen}>
              {salaryData &&
              (salaryData.salary ||
                salaryData.salary_type ||
                salaryData.account) ? (
                <PencilSquare />
              ) : (
                <Plus />
              )}
            </Button>
          </OverlayTrigger>
        </Card.Header>

        <Card.Body>
          {error && !salaryData ? (
            <div className="text-center py-4">
              <Alert variant="danger">{error}</Alert>
              <Button variant="outline-primary" size="sm" onClick={fetchSalary}>
                Try Again
              </Button>
            </div>
          ) : !salaryData ? (
            <div className="text-center py-4">
              <p className="text-muted">No salary data found</p>
              <Button variant="primary" size="sm" onClick={handleOpen}>
                Set Salary
              </Button>
            </div>
          ) : (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Employee Type</th>
                  <th>Payslip Type</th>
                  <th>Salary</th>
                  <th>Basic Salary</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{salaryData.employee_type || "--"}</td>
                  <td>{getPayslipTypeName(salaryData.salary_type)}</td>
                  <td>
  ₹{salaryData.salary
    ? Number(salaryData.salary).toLocaleString("en-IN")
    : "--"}
</td>
<td>
  ₹{salaryData.basic_salary
    ? Number(salaryData.basic_salary).toLocaleString("en-IN")
    : "--"}
</td>
                </tr>
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Salary Modal */}
      <Modal
        show={modalOpen}
        onHide={handleClose}
        centered
        className={`custom-slide-modal ${isClosingModal ? "closing" : "open"}`}
        style={{ overflowY: "auto", scrollbarWidth: "none" }}
      >
        <Modal.Header closeButton></Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}

          <Form>
            <Form.Group className="mb-3">
              <Form.Label>
                Employee Type <span className="text-danger">*</span>
              </Form.Label>
              <Form.Select
                name="employee_type"
                value={formData.employee_type}
                onChange={handleChange}
                required
              >
                <option value="">Select Employee Type</option>
                <option value="Permanent">Permanent</option>
                <option value="Contractual">Contractual</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                Payslip Type <span className="text-danger">*</span>
              </Form.Label>
              <Form.Select
                name="salary_type"
                value={formData.salary_type}
                onChange={handleChange}
                required
              >
                <option value="">Select Payslip Type</option>
                {payslipTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>
                Skill <span className="text-danger">*</span>
              </Form.Label>

              {/* Read-only display */}
              <Form.Control
                type="text"
                value={getSkillName(formData.skill_id)}
                disabled
              />

              {/* Hidden field to keep logic & payload intact */}
              <Form.Control
                type="hidden"
                name="skill_id"
                value={formData.skill_id}
              />

              {/* Update Skill link */}
              <div
                className="mt-1 text-success"
                style={{ cursor: "pointer", fontSize: "13px" }}
                onClick={handleUpdateSkill}
              >
                Update skill
              </div>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                Salary <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="number"
                name="salary"
                placeholder="Enter Salary"
                value={formData.salary}
                onChange={handleChange}
                disabled={true}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>
                Basic Salary <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="number"
                name="basic_salary"
                placeholder="Enter Basic Salary"
                value={formData.basic_salary}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose} disabled={saving}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleSubmit} disabled={saving}>
            {saving ? <Spinner animation="border" size="sm" /> : "Save Changes"}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default SalaryCard;
