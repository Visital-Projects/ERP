import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import {
    updateTraining,
    getEmployees,
    getTrainers,
    getTrainingTypes,
} from "../../../services/hrmService";

const performanceOptions = [
    { label: "Not Concluded", value: 0 },
    { label: "Poor", value: 1 },
    { label: "Average", value: 2 },
    { label: "Satisfactory", value: 3 },
    { label: "Excellent", value: 4 },
];

const statusOptions = [
    { label: "Pending", value: 0 },
    { label: "Completed", value: 1 },
    
];

const TrainingDetailsModal = ({ show, onHide, training, onRefresh }) => {
    const [performance, setPerformance] = useState(training.performance ?? 0);
    const [status, setStatus] = useState(training.status ?? 0);
    const [remarks, setRemarks] = useState(training.remarks || "");

    const [employees, setEmployees] = useState([]);
    const [trainers, setTrainers] = useState([]);
    const [trainingTypes, setTrainingTypes] = useState([]);

    useEffect(() => {
        getEmployees().then(setEmployees).catch(console.error);
        getTrainers().then(setTrainers).catch(console.error);
        getTrainingTypes().then(setTrainingTypes).catch(console.error);
    }, []);

    const getNameById = (arr, id) => {
        const item = arr.find((t) => Number(t.id) === Number(id));
        if (!item) return "N/A";
        return item.name || `${item.firstname || ""} ${item.lastname || ""}`.trim();
    };

    const handleSave = async () => {
        try {
            const payload = { performance, status, remarks };
            await updateTraining(training.id, payload);
            onHide();
            onRefresh();
        } catch (error) {
            console.error("Failed to update training details:", error);
        }
    };

    const getLabel = (options, value) => {
        const opt = options.find((o) => o.value === Number(value));
        return opt ? opt.label : value;
    };

    return (
        <Modal show={show} onHide={onHide} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>Training Details</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="row">
                    {/* LEFT SIDE DETAILS */}
                    <div className="col-md-6">
                        <table className="table table-borderless">
                            <tbody>
                                <tr>
                                    <th className="text-start" style={{ width: "40%" }}>Training Type</th>
                                    <td className="text-end">{getNameById(trainingTypes, training.training_type) || "N/A"}</td>
                                </tr>
                                <tr>
                                    <th className="text-start">Trainer</th>
                                    <td className="text-end">{getNameById(trainers, training.trainer) || "N/A"}</td>
                                </tr>
                                <tr>
                                    <th className="text-start">Training Cost</th>
                                    <td className="text-end">${training.training_cost?.toLocaleString() || "0.00"}</td>
                                </tr>
                                <tr>
                                    <th className="text-start">Start Date</th>
                                    <td className="text-end">{new Date(training.start_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                                </tr>
                                <tr>
                                    <th className="text-start">End Date</th>
                                    <td className="text-end">{new Date(training.end_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                                </tr>
                                <tr>
                                    <th className="text-start">Date</th>
                                    <td className="text-end">{new Date(training.created_at || new Date()).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                                </tr>
                            </tbody>
                        </table>

                        <div className="mt-3">
                            <strong>Description</strong>
                            <p className="mt-1">{training.description || "N/A"}</p>
                        </div>
                    </div>



                    {/* RIGHT SIDE - EMPLOYEE + UPDATE FORM */}
                   <div className="col-md-6">
  <h6><strong>Training Employee</strong></h6>

  <div className="d-flex align-items-center gap-3 border-bottom pb-3 mb-3">
    <img
      src="/default-user.png"
      width="48"
      height="48"
      className="rounded-circle border border-success p-1"
      alt="employee"
    />
    <div>
      <strong>{getNameById(employees, training.employee) || "N/A"}</strong>
      <p className="small m-0 text-muted">Namaste</p>
    </div>
  </div>

  <h6><strong>Update Status</strong></h6>

  <div className="row">
    <div className="col-md-6">
      <Form.Group className="mb-3">
        <Form.Label><strong>Performance</strong></Form.Label>
        <Form.Select
          value={performance}
          onChange={(e) => setPerformance(Number(e.target.value))}
        >
          {performanceOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Form.Select>
      </Form.Group>
    </div>

    <div className="col-md-6">
      <Form.Group className="mb-3">
        <Form.Label><strong>Status</strong></Form.Label>
        <Form.Select
          value={status}
          onChange={(e) => setStatus(Number(e.target.value))}
        >
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Form.Select>
      </Form.Group>
    </div>
  </div>

  <Form.Group className="mb-4">
    <Form.Label><strong>Remarks</strong></Form.Label>
    <Form.Control
      as="textarea"
      rows={3}
      placeholder="Remarks"
      value={remarks}
      onChange={(e) => setRemarks(e.target.value)}
    />
  </Form.Group>

   
</div>

                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="success" onClick={handleSave}>
                    Save
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default TrainingDetailsModal;
