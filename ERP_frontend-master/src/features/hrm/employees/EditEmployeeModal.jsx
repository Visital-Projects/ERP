import React from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";

const EditEmployeeModal = ({
  show,
  loading,
  employee,
  branches,
  departments,
  designations,
  onChange,
  onClose,
  onSubmit,
}) => {
  if (!employee) return null;

  return (
    <Modal show={show} onHide={onClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Edit Employee</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading ? (
          <div className="text-center py-4">
            <Spinner animation="border" />
          </div>
        ) : (
          <Form>
            <h6 className="fw-bold text-success">Personal Detail</h6>
            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    value={employee.name || ""}
                    onChange={(e) => onChange("name", e.target.value)}
                  />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={employee.email || ""}
                    onChange={(e) => onChange("email", e.target.value)}
                  />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label>Date of Birth</Form.Label>
                  <Form.Control
                    type="date"
                    value={employee.dob || ""}
                    onChange={(e) => onChange("dob", e.target.value)}
                  />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label>Phone</Form.Label>
                  <Form.Control
                    value={employee.phone || ""}
                    onChange={(e) => onChange("phone", e.target.value)}
                  />
                </Form.Group>
              </div>
              <div className="col-12">
                <Form.Group>
                  <Form.Label>Address</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={employee.address || ""}
                    onChange={(e) => onChange("address", e.target.value)}
                  />
                </Form.Group>
              </div>
              {/* <div className="col-md-6">
                <Form.Group>
                  <Form.Label>Salary Type</Form.Label>
                  <Form.Select
                    value={employee.salary_type || ""}
                    onChange={(e) => onChange("salary_type", e.target.value)}
                  >
                    <option value="">Select</option>
                    <option value="monthly">Monthly</option>
                    <option value="hourly">Hourly</option>
                  </Form.Select>
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label>Basic Salary</Form.Label>
                  <Form.Control
                    type="number"
                    value={employee.basic_salary || ""}
                    onChange={(e) => onChange("basic_salary", e.target.value)}
                  />
                </Form.Group>
              </div> */}
            </div>

            <h6 className="fw-bold text-success">Company Detail</h6>
            <div className="row g-3 mb-3">
              <div className="col-md-4">
                <Form.Group>
                  <Form.Label>Branch</Form.Label>
                  <Form.Select
                    value={employee.branch_id || ""}
                    onChange={(e) => onChange("branch_id", e.target.value)}
                  >
                    <option value="">Select</option>
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </div>
              <div className="col-md-4">
                <Form.Group>
                  <Form.Label>Department</Form.Label>
                  <Form.Select
                    value={employee.department_id || ""}
                    onChange={(e) => onChange("department_id", e.target.value)}
                  >
                    <option value="">Select</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </div>
              <div className="col-md-4">
                <Form.Group>
                  <Form.Label>Designation</Form.Label>
                  <Form.Select
                    value={employee.designation_id || ""}
                    onChange={(e) => onChange("designation_id", e.target.value)}
                  >
                    <option value="">Select</option>
                    {designations.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label>Date of Joining</Form.Label>
                  <Form.Control
                    type="date"
                    value={employee.company_doj || ""}
                    onChange={(e) => onChange("company_doj", e.target.value)}
                  />
                </Form.Group>
              </div>
            </div>

            <h6 className="fw-bold text-success">Document Detail</h6>
            <div className="mb-3">
              <Form.Group>
                <Form.Label>Documents</Form.Label>
                <Form.Control
                  type="text"
                  value={employee.documents?.join(", ") || ""}
                  onChange={(e) =>
                    onChange("documents", e.target.value.split(",").map((d) => d.trim()))
                  }
                />
                <Form.Text className="text-muted">
                  Separate multiple types with commas (e.g. PAN, Aadhaar)
                </Form.Text>
              </Form.Group>
            </div>

            <h6 className="fw-bold text-success">Bank Account Detail</h6>
            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label>Account Holder Name</Form.Label>
                  <Form.Control
                    value={employee.account_holder_name || ""}
                    onChange={(e) => onChange("account_holder_name", e.target.value)}
                  />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label>Account Number</Form.Label>
                  <Form.Control
                    value={employee.account_number || ""}
                    onChange={(e) => onChange("account_number", e.target.value)}
                  />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label>Bank Name</Form.Label>
                  <Form.Control
                    value={employee.bank_name || ""}
                    onChange={(e) => onChange("bank_name", e.target.value)}
                  />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label>Bank Identifier Code</Form.Label>
                  <Form.Control
                    value={employee.bank_identifier_code || ""}
                    onChange={(e) => onChange("bank_identifier_code", e.target.value)}
                  />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label>Branch Location</Form.Label>
                  <Form.Control
                    value={employee.branch_location || ""}
                    onChange={(e) => onChange("branch_location", e.target.value)}
                  />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label>Tax Payer ID</Form.Label>
                  <Form.Control
                    value={employee.tax_payer_id || ""}
                    onChange={(e) => onChange("tax_payer_id", e.target.value)}
                  />
                </Form.Group>
              </div>
            </div>
          </Form>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="success" onClick={onSubmit}>
          Save Changes
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditEmployeeModal;
