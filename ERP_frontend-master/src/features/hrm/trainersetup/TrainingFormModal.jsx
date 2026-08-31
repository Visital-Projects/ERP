import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import { createTraining, updateTraining } from "../../../services/hrmService";

const TrainingFormModal = ({
  show,
  onHide,
  onRefresh,
  editData,
  branches,
  trainers,
  trainingTypes,
  employees,
}) => {
  const [form, setForm] = useState({
    branch: "",
    trainer_option: "Internal",
    training_type: "",
    trainer: "",
    employee: "",
    training_cost: "",
    start_date: "",
    end_date: "",
    description: "",
  });

  // Fill form when editing
  useEffect(() => {
    if (show && editData) {
      setForm({
        branch: editData.branch?.toString() || "",
        trainer_option: editData.trainer_option === 2 ? "External" : "Internal",
        training_type: editData.training_type?.toString() || "",
        trainer: editData.trainer?.toString() || "",
        employee: editData.employee?.toString() || "",
        training_cost: editData.training_cost?.toString() || "",
        start_date: editData.start_date || "",
        end_date: editData.end_date || "",
        description: editData.description || "",
      });
    } else if (show) {
      // Reset on create
      setForm({
        branch: "",
        trainer_option: "Internal",
        training_type: "",
        trainer: "",
        employee: "",
        training_cost: "",
        start_date: "",
        end_date: "",
        description: "",
      });
    }
  }, [show, editData]);
  const [isClosingModal, setIsClosingModal] = useState(false); // ✅ for animation

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (
      !form.branch ||
      !form.trainer_option ||
      !form.training_type ||
      !form.trainer ||
      !form.employee ||
      !form.start_date ||
      !form.end_date
    ) {
      alert("Please fill all required fields.");
      return;
    }

    const payload = {
      branch: parseInt(form.branch),
      trainer_option: form.trainer_option === "Internal" ? 1 : 2,
      training_type: parseInt(form.training_type),
      trainer: parseInt(form.trainer),
      employee: parseInt(form.employee),
      training_cost: parseFloat(form.training_cost) || 0,
      start_date: form.start_date,
      end_date: form.end_date,
      description: form.description,
    };

    console.log("Submitting payload:", payload); // ✅ Debug payload

    try {
      if (editData) {
        await updateTraining(editData.id, payload);
      } else {
        await createTraining(payload);
      }
      handleCloseModal();
      onRefresh();
    } catch (error) {
      console.error("Failed to submit training:", error);
      alert("Failed to submit training. Check console for details.");
    }
  };
  // Custom close handler with animation
  const handleCloseModal = () => {
    setIsClosingModal(true);
    setTimeout(() => {
      setIsClosingModal(false);
      onHide();
    }, 400); // match CSS duration
  };

  return (
    // <Modal show={show} onHide={onHide} centered size="lg">

    //   <Modal.Header closeButton>
    //     <Modal.Title>
    //       {editData ? "Edit Training" : "Create Training"}
    //     </Modal.Title>
    //   </Modal.Header>
    //   <Modal.Body>
    //     <Form onSubmit={handleSubmit}>
    //       <Row>
    //         <Col md={6}>
    //           <Form.Group className="mb-3">
    //             <Form.Label>Branch</Form.Label>
    //             <Form.Select
    //               name="branch"
    //               value={form.branch}
    //               onChange={handleChange}
    //             >
    //               <option value="">Select Branch</option>
    //               {branches.map((b) => (
    //                 <option key={b.id} value={b.id.toString()}>
    //                   {b.name}
    //                 </option>
    //               ))}
    //             </Form.Select>
    //           </Form.Group>

    //           <Form.Group className="mb-3">
    //             <Form.Label>Trainer Option</Form.Label>
    //             <Form.Select
    //               name="trainer_option"
    //               value={form.trainer_option}
    //               onChange={handleChange}
    //             >
    //               <option value="Internal">Internal</option>
    //               <option value="External">External</option>
    //             </Form.Select>
    //           </Form.Group>

    //           <Form.Group className="mb-3">
    //             <Form.Label>Trainer</Form.Label>
    //             <Form.Select
    //               name="trainer"
    //               value={form.trainer}
    //               onChange={handleChange}
    //             >
    //               <option value="">Select Trainer</option>
    //               {trainers.map((t) => (
    //                 <option key={t.id} value={t.id.toString()}>
    //                   {t.name || `${t.firstname} ${t.lastname}`}
    //                 </option>
    //               ))}
    //             </Form.Select>
    //           </Form.Group>

    //           <Form.Group className="mb-3">
    //             <Form.Label>Training Cost</Form.Label>
    //             <Form.Control
    //               type="number"
    //               name="training_cost"
    //               value={form.training_cost}
    //               onChange={handleChange}
    //               placeholder="Enter cost"
    //             />
    //           </Form.Group>
    //         </Col>

    //         <Col md={6}>
    //           <Form.Group className="mb-3">
    //             <Form.Label>Training Type</Form.Label>
    //             <Form.Select
    //               name="training_type"
    //               value={form.training_type}
    //               onChange={handleChange}
    //             >
    //               <option value="">Select Type</option>
    //               {trainingTypes.map((t) => (
    //                 <option key={t.id} value={t.id.toString()}>
    //                   {t.name}
    //                 </option>
    //               ))}
    //             </Form.Select>
    //           </Form.Group>

    //           <Form.Group className="mb-3">
    //             <Form.Label>Employee</Form.Label>
    //             <Form.Select
    //               name="employee"
    //               value={form.employee}
    //               onChange={handleChange}
    //             >
    //               <option value="">Select Employee</option>
    //               {employees.map((e) => (
    //                 <option key={e.id} value={e.id.toString()}>
    //                   {e.name}
    //                 </option>
    //               ))}
    //             </Form.Select>
    //           </Form.Group>

    //           <Form.Group className="mb-3">
    //             <Form.Label>Start Date</Form.Label>
    //             <Form.Control
    //               type="date"
    //               name="start_date"
    //               value={form.start_date}
    //               onChange={handleChange}
    //             />
    //           </Form.Group>

    //           <Form.Group className="mb-3">
    //             <Form.Label>End Date</Form.Label>
    //             <Form.Control
    //               type="date"
    //               name="end_date"
    //               value={form.end_date}
    //               onChange={handleChange}
    //             />
    //           </Form.Group>
    //         </Col>
    //       </Row>

    //       <Form.Group className="mb-3">
    //         <Form.Label>Description</Form.Label>
    //         <Form.Control
    //           as="textarea"
    //           name="description"
    //           value={form.description}
    //           onChange={handleChange}
    //           rows={3}
    //           placeholder="Enter description"
    //         />
    //       </Form.Group>

    //       <div className="text-end">
    //         <Button variant="secondary" onClick={onHide} className="me-2">
    //           Cancel
    //         </Button>
    //         <Button variant="success" type="submit">
    //           {editData ? "Update" : "Create"}
    //         </Button>
    //       </div>
    //     </Form>
    //   </Modal.Body>
    // </Modal>
    <>
      <Modal
        show={show}
        onHide={handleCloseModal}
        centered
        size="lg"
        backdrop={true}
        className={`custom-slide-modal ${isClosingModal ? "closing" : "open"}`}
        style={{ overflowY: "auto", scrollbarWidth: "none" }}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {editData ? "Edit Training" : "Create Training"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Branch</Form.Label>
                  <Form.Select
                    name="branch"
                    value={form.branch}
                    onChange={handleChange}
                  >
                    <option value="">Select Branch</option>
                    {branches.map((b) => (
                      <option key={b.id} value={b.id.toString()}>
                        {b.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Trainer Option</Form.Label>
                  <Form.Select
                    name="trainer_option"
                    value={form.trainer_option}
                    onChange={handleChange}
                  >
                    <option value="Internal">Internal</option>
                    <option value="External">External</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Trainer</Form.Label>
                  <Form.Select
                    name="trainer"
                    value={form.trainer}
                    onChange={handleChange}
                  >
                    <option value="">Select Trainer</option>
                    {trainers.map((t) => (
                      <option key={t.id} value={t.id.toString()}>
                        {t.name || $`{t.firstname} ${t.lastname}`}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Training Cost</Form.Label>
                  <Form.Control
                    type="number"
                    name="training_cost"
                    value={form.training_cost}
                    onChange={handleChange}
                    placeholder="Enter cost"
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Training Type</Form.Label>
                  <Form.Select
                    name="training_type"
                    value={form.training_type}
                    onChange={handleChange}
                  >
                    <option value="">Select Type</option>
                    {trainingTypes.map((t) => (
                      <option key={t.id} value={t.id.toString()}>
                        {t.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Employee</Form.Label>
                  <Form.Select
                    name="employee"
                    value={form.employee}
                    onChange={handleChange}
                  >
                    <option value="">Select Employee</option>
                    {employees.map((e) => (
                      <option key={e.id} value={e.id.toString()}>
                        {e.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Start Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="start_date"
                    value={form.start_date}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>End Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="end_date"
                    value={form.end_date}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                placeholder="Enter description"
              />
            </Form.Group>

            <div className="text-end">
              <Button
                variant="secondary"
                onClick={handleCloseModal}
                className="me-2"
              >
                Cancel
              </Button>
              <Button variant="success" type="submit">
                {editData ? "Update" : "Create"}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default TrainingFormModal;
