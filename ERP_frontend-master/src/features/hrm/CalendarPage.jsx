import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { getMeetings, deleteMeeting, updateMeeting } from "../../services/meetingService";
import { Button, Modal, Form } from "react-bootstrap";
import { FaEdit, FaTrash } from "react-icons/fa";

const CalendarPage = () => {
  const [meetings, setMeetings] = useState([]);
  const [events, setEvents] = useState([]);

  // Edit Modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentMeeting, setCurrentMeeting] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    time: "",
    note: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      const meetingsData = await getMeetings();
      setMeetings(meetingsData);

      // Map to FullCalendar events by combining date + time
      setEvents(
        meetingsData.map((m) => {
          // combine date and time for event start and end (assuming same)
          const startDateTime = `${m.date}T${m.time}`;
          return {
            id: m.id,
            title: m.title,
            start: startDateTime,
            end: startDateTime, // you can add duration if needed
          };
        })
      );
    } catch (error) {
      console.error("Error loading meetings:", error);
    }
  };

  const handleEventClick = (info) => {
    alert(`Meeting: ${info.event.title}`);
  };

  const handleEdit = (id) => {
    const meeting = meetings.find((m) => m.id === id);
    if (!meeting) return;

    setCurrentMeeting(meeting);
    setFormData({
      title: meeting.title || "",
      date: meeting.date || "",
      time: meeting.time ? meeting.time.slice(0, 5) : "", // "HH:mm"
      note: meeting.note || "",
    });
    setShowEditModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this meeting?")) {
      try {
        await deleteMeeting(id);
        fetchMeetings();
      } catch (error) {
        console.error("Failed to delete meeting:", error);
      }
    }
  };

  const handleModalClose = () => {
    setShowEditModal(false);
    setCurrentMeeting(null);
    setFormData({
      title: "",
      date: "",
      time: "",
      note: "",
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    if (!formData.title || !formData.date || !formData.time) {
      alert("Please fill title, date, and time.");
      return;
    }

    setSaving(true);
    try {
      // API expects separate date and time, so send as-is
      await updateMeeting(currentMeeting.id, {
        title: formData.title,
        date: formData.date,
        time: formData.time + ":00", // append seconds if needed
        note: formData.note,
      });

      await fetchMeetings();
      handleModalClose();
    } catch (error) {
      console.error("Failed to update meeting:", error);
      alert("Failed to update meeting. Try again.");
    }
    setSaving(false);
  };

  return (
    <div className="container-fluid py-3">
      <div className="row">
        {/* Calendar Section */}
        <div className="col-lg-8 col-md-7 mb-3">
          <div className="card shadow-sm p-3">
            <h5 className="mb-3">Calendar</h5>
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "dayGridMonth,timeGridWeek,timeGridDay",
              }}
              events={events}
              eventClick={handleEventClick}
              height="70vh"
            />
          </div>
        </div>

        {/* Meeting List Section */}
        <div className="col-lg-4 col-md-5">
          <div className="card shadow-sm p-3 h-100">
            <h5 className="mb-3">Meeting List</h5>
            <div style={{ maxHeight: "65vh", overflowY: "auto" }}>
              {meetings.length === 0 && (
                <p className="text-muted">No meetings scheduled.</p>
              )}
              {meetings.map((m) => (
                <div
                  key={m.id}
                  className="d-flex justify-content-between align-items-center border rounded p-2 mb-2"
                >
                  <div>
                    <strong>{m.title}</strong>
                    <div className="text-muted" style={{ fontSize: "0.9em" }}>
                      Date: {m.date} <br />
                      Time: {m.time.slice(0, 5)} {/* show HH:mm */}
                    </div>
                  </div>
                  <div className="d-flex gap-2">
                    <Button
                      variant="info"
                      size="sm"
                      onClick={() => handleEdit(m.id)}
                    >
                      <FaEdit />
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(m.id)}
                    >
                      <FaTrash />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Meeting Modal */}
      <Modal show={showEditModal} onHide={handleModalClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Meeting</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="meetingTitle" className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter meeting title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
              />
            </Form.Group>

            <Form.Group controlId="meetingDate" className="mb-3">
              <Form.Label>Date</Form.Label>
              <Form.Control
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
              />
            </Form.Group>

            <Form.Group controlId="meetingTime" className="mb-3">
              <Form.Label>Time</Form.Label>
              <Form.Control
                type="time"
                name="time"
                value={formData.time}
                onChange={handleInputChange}
              />
            </Form.Group>

            <Form.Group controlId="meetingNote" className="mb-3">
              <Form.Label>Note</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Enter notes (optional)"
                name="note"
                value={formData.note}
                onChange={handleInputChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleModalClose} disabled={saving}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default CalendarPage;
