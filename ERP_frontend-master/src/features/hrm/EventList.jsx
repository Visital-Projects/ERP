import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
} from "../../services/eventService";
import {
  getBranches,
  getDepartments,
  getEmployees,
} from "../../services/hrmService";

import "./EventList.css";

const EventList = () => {
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [formData, setFormData] = useState({
    branch_id: "",
    department_id: "",
    employee_id: "",
    title: "",
    start_date: "",
    end_date: "",
    color: "",
    description: "",
  });

  const [branches, setBranches] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    fetchData();
    fetchDropdowns();
  }, []);

  const fetchData = async () => {
    const res = await getEvents();
    if (Array.isArray(res)) {
      const formatted = res.map((event) => ({
        id: event.id,
        title: event.title,
        start: event.start_date,
        end: event.end_date,
        color: event.color,
        extendedProps: {
          branch_id: event.branch_id,
          department_id: event.department_id,
          employee_id: event.employee_id,
          description: event.description,
        },
      }));
      setEvents(formatted);
    }
  };

  const fetchDropdowns = async () => {
    setBranches(await getBranches());
    setDepartments(await getDepartments());
    setEmployees(await getEmployees());
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDateChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleCreate = async () => {
    const payload = {
      ...formData,
      department_id: formData.department_id.toString(),
      employee_id: formData.employee_id.toString(),
    };
    if (editMode) {
      await updateEvent(selectedEventId, payload);
    } else {
      await createEvent(payload);
    }
    resetForm();
    fetchData();
  };

  const handleEdit = (event) => {
    setFormData({
      branch_id: event.extendedProps.branch_id || "",
      department_id: event.extendedProps.department_id || "",
      employee_id: event.extendedProps.employee_id || "",
      title: event.title,
      start_date: event.start,
      end_date: event.end,
      color: event.color || "",
      description: event.extendedProps.description || "",
    });
    setSelectedEventId(event.id);
    setEditMode(true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      await deleteEvent(id);
      fetchData();
    }
  };

  const resetForm = () => {
    setFormData({
      branch_id: "",
      department_id: "",
      employee_id: "",
      title: "",
      start_date: "",
      end_date: "",
      color: "",
      description: "",
    });
    setEditMode(false);
    setSelectedEventId(null);
    setShowModal(false);
  };

  return (
    <div className="container mt-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4 className="fw-bold">Event</h4>
          <p className="text-success small">Dashboard &gt; Event</p>
        </div>
        <Button variant="success" onClick={() => setShowModal(true)}  className="btn btn-success d-flex align-items-center justify-content-center"
          style={{ width: '38px', height: '38px', borderRadius: '6px' }}>
           <i className="bi bi-plus-lg fs-6"></i>
        </Button>
      </div>

      <div className="row">
        <div className="col-md-8 mb-4">
          <div className="card p-3">
            <h5 className="mb-3">Calendar</h5>
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              events={events}
              eventClick={(info) => handleEdit(info.event)}
              headerToolbar={{
                left: "prev today next",
                center: "title",
                right: "dayGridMonth timeGridWeek timeGridDay",
              }}
              height="auto"
            />
          </div>
        </div>
        <div className="col-md-4">
          <div className="card p-3">
            <h5>Upcoming Events</h5>
            {events.map((event) => (
              <div key={event.id} className="card p-2 mb-2 shadow-sm">
                <div className="d-flex justify-content-between align-items-center">
                  <h6 className="mb-0">{event.title}</h6>
                  <div>
                    <Button
                      variant="info"
                      size="sm"
                      className="me-2"
                      onClick={() => handleEdit(event)}
                    >
                      <i className="bi bi-pencil-fill text-white"></i>
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(event.id)}
                    >
                      <i className="bi bi-trash-fill text-white"></i>
                    </Button>
                  </div>
                </div>
                <p className="mb-1">
                  <strong>Start Date :</strong>{" "}
                  {new Date(event.start).toDateString()}
                </p>
                <p className="mb-1">
                  <strong>End Date :</strong>{" "}
                  {new Date(event.end).toDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Create/Edit Modal */}
      <Modal show={showModal} onHide={resetForm} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editMode ? "Edit Event" : "Create New Event"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Branch<span className="text-danger">*</span></Form.Label>
                  <Form.Select name="branch_id" value={formData.branch_id} onChange={handleInputChange}>
                    <option value="">Select Branch</option>
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Department<span className="text-danger">*</span></Form.Label>
                  <Form.Select name="department_id" value={formData.department_id} onChange={handleInputChange}>
                    <option value="">Select Department</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Employee<span className="text-danger">*</span></Form.Label>
                  <Form.Select name="employee_id" value={formData.employee_id} onChange={handleInputChange}>
                    <option value="">Select Employee</option>
                    {employees.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mt-3">
              <Form.Label>Event Title<span className="text-danger">*</span></Form.Label>
              <Form.Control name="title" placeholder="Enter Event Title" value={formData.title} onChange={handleInputChange} />
            </Form.Group>

            <Row className="mt-3">
              <Col>
                <Form.Label>Start Date</Form.Label>
                <Form.Control type="date" name="start_date" value={formData.start_date} onChange={(e) => handleDateChange("start_date", e.target.value)} />
              </Col>
              <Col>
                <Form.Label>End Date</Form.Label>
                <Form.Control type="date" name="end_date" value={formData.end_date} onChange={(e) => handleDateChange("end_date", e.target.value)} />
              </Col>
            </Row>

            <Form.Group className="mt-3">
              <Form.Label>Event Color</Form.Label>
              <div className="d-flex gap-2">
                {["#74c0d7ff", "#be7070ff", "#d0be91ff", "#69b97cff"].map((color) => (
                  <div
                    key={color}
                    className="color-circle"
                    style={{
                      backgroundColor: color,
                      border: formData.color === color ? "2px solid black" : "1px solid #ccc",
                      width: 30,
                      height: 30,
                      borderRadius: "50%",
                      cursor: "pointer",
                    }}
                    onClick={() => setFormData({ ...formData, color })}
                  />
                ))}
              </div>
            </Form.Group>

            <Form.Group className="mt-3">
              <Form.Label>Event Description</Form.Label>
              <Form.Control as="textarea" name="description" rows={3} placeholder="Enter Event Description" value={formData.description} onChange={handleInputChange} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={resetForm}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleCreate}>
            {editMode ? "Update" : "Create"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default EventList;
