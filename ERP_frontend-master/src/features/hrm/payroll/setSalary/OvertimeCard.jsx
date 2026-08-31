import React, { useEffect, useState, useMemo } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Row,
  Col,
  Spinner,
  Card,
} from "react-bootstrap";
import { Plus, PencilSquare, Trash, ArrowClockwise } from "react-bootstrap-icons";
import overtimeService from "../../../../services/overtimeService";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { toast } from "react-toastify";
const emptyForm = {
  title: "",
  number_of_days: "",
  hours: "",
  rate: "",
  type: "Regular",
};

const OvertimeCard = ({ employeeId, employeeName }) => {
  const [overtimes, setOvertimes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingOvertime, setEditingOvertime] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [isClosingModal, setIsClosingModal] = useState(false);
  const [validationErrors, setValidationErrors] = useState({}); // ✅ new state
  const [selectedDate, setSelectedDate] = useState("");

  const currency = useMemo(
    () =>
      new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }),
    []
  );

  const fetchOvertimes = async () => {
    if (!employeeId) return;
    setLoading(true);
    try {
      const data = await overtimeService.getOvertimesByEmployee(employeeId);
      setOvertimes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch overtimes:", err);
      setOvertimes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOvertimes();
  }, [employeeId]);

  const openAdd = () => {
    if (!employeeId) {
      alert("Please select an employee first");
      return;
    }
    setEditingOvertime(null);
    setForm(emptyForm);
    setValidationErrors({});
    setShowModal(true);
  };

  const openEdit = (ot) => {
    setEditingOvertime(ot);
    setForm({
      title: ot.title || "",
      number_of_days: ot.number_of_days ?? "",
      hours: ot.hours ?? "",
      rate: ot.rate ?? "",
      type: ot.type || "Regular",
    });
    setValidationErrors({});
    setShowModal(true);
  };

  const handleDelete = (id) => {
    confirmAlert({
      customUI: ({ onClose }) => (
        <div className="custom-confirm-modal bg-white p-4 rounded shadow text-center">
          <div style={{ fontSize: "50px", color: "#ff9900" }}>❗</div>
          <h4 className="fw-bold mt-2">Are you sure?</h4>
          <p>This action cannot be undone. Do you want to continue?</p>

          <div className="d-flex justify-content-center mt-3">
            <button className="btn btn-danger me-2 px-4" onClick={onClose}>
              No
            </button>

            <button
              className="btn btn-success px-4"
              onClick={async () => {
                try {
                  const ok = await overtimeService.deleteOvertime(id);
                  if (ok) {
                    setOvertimes((prev) => prev.filter((ot) => ot.id !== id));
                    toast.success("Overtime successfully deleted.", {
                      icon: false,
                    });
                  } else {
                    alert("Delete failed");
                  }
                } catch (err) {
                  console.error("Failed to delete overtime:", err);
                  alert("Failed to delete overtime");
                }
                onClose();
              }}
            >
              Yes
            </button>
          </div>
        </div>
      ),
    });
  };

  const handleModalClose = () => {
    setIsClosingModal(true);
    setTimeout(() => {
      setShowModal(false);
      setIsClosingModal(false);
      setEditingOvertime(null);
      setForm(emptyForm);
      setValidationErrors({});
    }, 700);
  };

  // ✅ Enhanced Validation
  const handleSave = async () => {
    const { title, number_of_days, hours, rate, type } = form;
    const errors = {};

    if (!title.trim()) errors.title = "Overtime title is required";
    if (!number_of_days || Number(number_of_days) <= 0)
      errors.number_of_days = "Enter valid number of days";
    if (!hours || Number(hours) <= 0)
      errors.hours = "Enter valid number of hours";
    if (!rate || Number(rate) <= 0) errors.rate = "Enter valid rate";

    setValidationErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const payload = {
      title: String(title).trim(),
      number_of_days: Number(number_of_days),
      hours: Number(hours),
      rate: Number(rate),
      type: type || "Regular",
    };

    setSaving(true);
    try {
      if (editingOvertime) {
        await overtimeService.updateOvertime(editingOvertime.id, payload);
        toast.success("Overtime successfully updated.", {
          icon: false,
        });
      } else {
        await overtimeService.createOvertime({
          employee_id: Number(employeeId),
          ...payload,
        });
        toast.success("Overtime successfully created.", {
          icon: false,
        });
      }
      handleModalClose();
      await fetchOvertimes();
    } catch (err) {
      console.error("Error saving overtime:", err);
      const msg = err?.response?.data?.message || "Failed to save overtime";
      setValidationErrors({ general: msg });
    } finally {
      setSaving(false);
    }
  };

  const onChange = (key) => (e) => {
    const v = e.target.value;
    setForm((f) => ({ ...f, [key]: v }));
    setValidationErrors((prev) => ({ ...prev, [key]: "" })); // clear inline error
  };
const filteredOvertimes = useMemo(() => {
  if (!selectedDate) return overtimes;

  return overtimes.filter((ot) => {
    if (!ot.date) return false;
    return ot.date === selectedDate;
  });
}, [overtimes, selectedDate]);
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

      <Card
        className="card p-3 pt-2 shadow-sm rounded-3"
        style={{
          overflowY: "scroll",
          overflowX: "hidden",
          height: "385px",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        <div
          className="d-flex justify-content-between align-items-center card-header pb-3 pt-3"
          style={{ position: "sticky", top: 0, zIndex: 10 }}
        >
          <h5 className="mb-0">Overtime</h5>
          {/* <OverlayTrigger placement="top" overlay={<Tooltip>Add Overtime</Tooltip>}>
            <Button
              variant="success"
              onClick={openAdd}
              disabled={!employeeId}
              className="d-flex align-items-center"
            >
              <Plus />
            </Button>
          </OverlayTrigger> */}
        </div>

        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="success" />
          </div>
        ) : (
          <div className="card-body mt-2">
            <div
              className="table-responsive"
              style={{ maxHeight: "250px", overflowY: "auto" }}
            >
              <Row className="mb-3 justify-content-start">
                <Col md={4}>
                  <Form.Group>
                    <Form.Label className="small">Filter by Date</Form.Label>
                    <Form.Control
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md="auto" className="d-flex align-items-end p-0 m-0">
                  <Button
                    variant="danger"
                    onClick={() => setSelectedDate("")}
                    className="mb-1"
                  >
                    <ArrowClockwise />
                  </Button>
                </Col>
              </Row>

              <Table striped hover className="mb-0">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Overtime Title</th>
                    <th>No. of Days</th>
                    <th>Hours</th>
                    <th>Rate</th>
                    <th>OT Amount</th>
                    {/* <th>Actions</th> */}
                  </tr>
                </thead>
                <tbody>
{filteredOvertimes.length > 0 ? (
  filteredOvertimes.map((ot) => (
                      <tr key={ot.id}>
                        <td>{employeeName || ot?.employee?.name || "—"}</td>
                        <td>{ot.title}</td>
                        <td>{ot.number_of_days}</td>
                        <td>{ot.hours}</td>
                        <td>₹{ot.rate}</td>
                        <td>
                          ₹
                          {ot.ot_amount
                            ? Number(ot.ot_amount).toFixed(2)
                            : (
                                Number(ot.hours || 0) * Number(ot.rate || 0)
                              ).toFixed(2)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center text-muted py-3">
                        No overtime records found for selected date
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          </div>
        )}

        {/* ✅ Modal with inline validation */}
        <Modal
          show={showModal}
          onHide={handleModalClose}
          centered
          className={`custom-slide-modal ${
            isClosingModal ? "closing" : "open"
          }`}
          style={{ overflowY: "auto", scrollbarWidth: "none" }}
        >
          <Modal.Header closeButton>
            <Modal.Title className="h6 mb-0">
              {editingOvertime ? "Edit Overtime" : "Add Overtime"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Row>
                <Col md={12} className="mb-3">
                  <Form.Label>
                    Overtime Title <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={form.title}
                    onChange={onChange("title")}
                    placeholder="e.g., Project Deadline"
                    isInvalid={!!validationErrors.title}
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.title}
                  </Form.Control.Feedback>
                </Col>

                <Col md={6} className="mb-3">
                  <Form.Label>
                    No. of Days <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    value={form.number_of_days}
                    onChange={onChange("number_of_days")}
                    isInvalid={!!validationErrors.number_of_days}
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.number_of_days}
                  </Form.Control.Feedback>
                </Col>

                <Col md={6} className="mb-3">
                  <Form.Label>
                    Hours <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    value={form.hours}
                    onChange={onChange("hours")}
                    isInvalid={!!validationErrors.hours}
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.hours}
                  </Form.Control.Feedback>
                </Col>

                <Col md={6} className="mb-3">
                  <Form.Label>
                    Rate <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    value={form.rate}
                    onChange={onChange("rate")}
                    isInvalid={!!validationErrors.rate}
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.rate}
                  </Form.Control.Feedback>
                </Col>

                <Col md={6} className="mb-3">
                  <Form.Label>Type</Form.Label>
                  <Form.Select value={form.type} onChange={onChange("type")}>
                    <option value="Regular">Regular</option>
                    <option value="Weekend">Weekend</option>
                    <option value="Holiday">Holiday</option>
                  </Form.Select>
                </Col>

                {validationErrors.general && (
                  <div className="text-danger small mt-1 ps-2">
                    {validationErrors.general}
                  </div>
                )}
              </Row>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleModalClose}>
              Cancel
            </Button>
            <Button variant="success" onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : editingOvertime ? "Update" : "Create"}
            </Button>
          </Modal.Footer>
        </Modal>
      </Card>
    </>
  );
};

export default OvertimeCard;
