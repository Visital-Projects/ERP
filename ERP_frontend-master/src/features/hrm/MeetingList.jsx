// src/pages/MeetingList.jsx
import React, { useEffect, useState } from "react";
import { Button, Table, Form, Modal, Pagination } from "react-bootstrap";
import Select from "react-select";
import { useNavigate } from "react-router-dom";
import {
  getMeetings,
  deleteMeeting,
  createMeeting,
  updateMeeting,
} from "../../services/meetingService";
import branchService from "../../services/branchService";
import { getEmployeesByBranch } from "../../services/hrmService";
import { FaEdit, FaTrash } from "react-icons/fa";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";

const MeetingList = () => {
  const [meetings, setMeetings] = useState([]);
  const [search, setSearch] = useState("");

  const [branches, setBranches] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [selectedBranch, setSelectedBranch] = useState(null);
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    date: "",
    time: "",
    note: "",
  });

  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  const navigate = useNavigate();

  useEffect(() => {
    fetchMeetings();
    fetchBranches();
  }, []);

  const fetchMeetings = async () => {
    const data = await getMeetings();
    setMeetings(Array.isArray(data) ? data : []);
  };

  const fetchBranches = async () => {
    try {
      const res = await branchService.getAll();
      setBranches(res.data || []);
    } catch (error) {
      console.error("Failed to fetch branches:", error);
    }
  };

  const handleBranchChange = async (branch) => {
    setSelectedBranch(branch);
    setSelectedDepartments([]);
    setSelectedEmployees([]);

    if (branch) {
      try {
        const deptRes = await branchService.getDepartmentsByBranch(
          branch.value
        );
        setDepartments(deptRes.data || []);

        const empRes = await getEmployeesByBranch(branch.value);
        setEmployees(empRes || []);
      } catch (error) {
        console.error("Failed to fetch departments or employees:", error);
      }
    } else {
      setDepartments([]);
      setEmployees([]);
    }
  };

  // const handleDelete = async (id) => {
  //   if (window.confirm("Are you sure you want to delete this meeting?")) {
  //     await deleteMeeting(id);
  //     fetchMeetings();
  //   }
  // };

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
                  await deleteMeeting(id);
                  {
                    /* ✅ meeting delete logic */
                  }
                  await fetchMeetings();
                  {
                    /* ✅ refresh meeting list */
                  }
                } catch (err) {
                  console.error("Failed to delete meeting:", err);
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

  const handleCreate = async (e) => {
    e.preventDefault();

    const payload = {
      branch_id: selectedBranch?.value,
      department_id: selectedDepartments.map((d) => d.value),
      employee_id: selectedEmployees.map((e) => e.value),
      title: formData.title,
      date: formData.date,
      time: formData.time,
      note: formData.note,
    };

    await createMeeting(payload);
    setShowCreateModal(false);
    resetForm();
    fetchMeetings();
  };

  // Reset form data and selections
  const resetForm = () => {
    setFormData({ title: "", date: "", time: "", note: "" });
    setSelectedBranch(null);
    setSelectedDepartments([]);
    setSelectedEmployees([]);
    setEditingId(null);
  };

  // Open Edit Modal and fill form with selected meeting data
  const handleEditClick = (meeting) => {
    setEditingId(meeting.id);
    setFormData({
      title: meeting.title,
      date: meeting.date,
      time: meeting.time,
      note: meeting.note || "",
    });

    // Set selected branch, departments, employees based on meeting data
    const branchObj = branches.find((b) => b.id === meeting.branch_id) || null;
    setSelectedBranch(
      branchObj ? { value: branchObj.id, label: branchObj.name } : null
    );

    // Departments and Employees come from meeting data as arrays?
    // Your example shows these are strings like '"[1,2,3]"' so parse them:
    let deptIds = [];
    let empIds = [];
    try {
      deptIds = meeting.department_id ? JSON.parse(meeting.department_id) : [];
      empIds = meeting.employee_id ? JSON.parse(meeting.employee_id) : [];
    } catch {
      deptIds = [];
      empIds = [];
    }

    const selectedDepts = departments
      .filter((d) => deptIds.includes(d.id))
      .map((d) => ({ value: d.id, label: d.name }));
    const selectedEmps = employees
      .filter((e) => empIds.includes(e.id))
      .map((e) => ({ value: e.id, label: e.name }));

    setSelectedDepartments(selectedDepts);
    setSelectedEmployees(selectedEmps);

    setShowEditModal(true);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Handle Edit Modal branch change (re-fetch departments and employees for the branch)
  const handleEditBranchChange = async (branch) => {
    setSelectedBranch(branch);
    setSelectedDepartments([]);
    setSelectedEmployees([]);

    if (branch) {
      try {
        const deptRes = await branchService.getDepartmentsByBranch(
          branch.value
        );
        setDepartments(deptRes.data || []);

        const empRes = await getEmployeesByBranch(branch.value);
        setEmployees(empRes || []);
      } catch (error) {
        console.error("Failed to fetch departments or employees:", error);
      }
    } else {
      setDepartments([]);
      setEmployees([]);
    }
  };

  // Save changes from Edit Modal
  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        branch_id: selectedBranch?.value,
        department_id: selectedDepartments.map((d) => d.value),
        employee_id: selectedEmployees.map((e) => e.value),
        title: formData.title,
        date: formData.date,
        time: formData.time,
        note: formData.note,
      };
      await updateMeeting(editingId, payload);
      setShowEditModal(false);
      resetForm();
      fetchMeetings();
    } catch (error) {
      console.error("Failed to update meeting:", error);
    } finally {
      setSaving(false);
    }
  };

  // Filter meetings by search term
  const filteredMeetings = meetings.filter((m) =>
    m.title?.toLowerCase().includes(search.toLowerCase())
  );

  // Pagination calculations
  const indexOfLast = currentPage * entriesPerPage;
  const indexOfFirst = indexOfLast - entriesPerPage;
  const currentMeetings = filteredMeetings.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredMeetings.length / entriesPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="p-3 bg-white rounded shadow-sm">
      {/* Header: Title and Add button */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4 className="fw-semibold mb-1">Manage Meetings</h4>
          <div className="text-success small">Dashboard &gt; Meetings</div>
        </div>

        {/* Wrap buttons in a flex container with gap */}
        <div className="d-flex gap-2">
          <Button
            variant="success"
            size="sm"
            onClick={() => setShowCreateModal(true)}
          >
            <i className="bi bi-plus-lg me-1"></i>
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate("/meeting-calendar")}
          >
            📅
          </Button>
        </div>
      </div>

      {/* Search and entries per page */}
      <div className="d-flex justify-content-between mb-4 align-items-center">
        <div className="d-flex align-items-center gap-2">
          <Form.Select
            value={entriesPerPage}
            onChange={(e) => {
              setEntriesPerPage(parseInt(e.target.value));
              setCurrentPage(1); // reset to first page on change
            }}
            style={{ width: "80px" }}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </Form.Select>
          <span>entries per page</span>
        </div>

        <Form.Control
          type="text"
          placeholder="Search by meeting title..."
          style={{ maxWidth: "250px" }}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1); // reset page on search
          }}
        />
      </div>

      {/* Meetings Table */}
      <div className="table-responsive">
        <Table hover className="mb-0 text-center">
          <thead className="table-light">
            <tr>
              <th>MEETING TITLE</th>
              <th>DATE</th>
              <th>TIME</th>
              <th>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {currentMeetings.length > 0 ? (
              currentMeetings.map((meeting) => (
                <tr key={meeting.id}>
                  <td>{meeting.title}</td>
                  <td>{meeting.date}</td>
                  <td>{meeting.time.slice(0, 5)}</td>
                  <td>
                    <div className="d-flex justify-content-center gap-2">
                      <Button
                        variant="info"
                        size="sm"
                        title="Edit"
                        onClick={() => handleEditClick(meeting)}
                      >
                        <i className="bi bi-pencil-fill text-white"></i>
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(meeting.id)}
                        title="Delete"
                      >
                        <i className="bi bi-trash-fill text-white"></i>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center py-4 text-muted">
                  No meetings found
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-end mt-3">
          <Pagination>
            <Pagination.First
              onClick={() => paginate(1)}
              disabled={currentPage === 1}
            />
            <Pagination.Prev
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
            />
            {[...Array(totalPages).keys()].map((x) => {
              const pageNum = x + 1;
              return (
                <Pagination.Item
                  key={pageNum}
                  active={pageNum === currentPage}
                  onClick={() => paginate(pageNum)}
                >
                  {pageNum}
                </Pagination.Item>
              );
            })}
            <Pagination.Next
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
            />
            <Pagination.Last
              onClick={() => paginate(totalPages)}
              disabled={currentPage === totalPages}
            />
          </Pagination>
        </div>
      )}

      {/* Create Meeting Modal */}
      <Modal
        show={showCreateModal}
        onHide={() => {
          setShowCreateModal(false);
          resetForm();
        }}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Create Meeting</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleCreate}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <Form.Label>Branch*</Form.Label>
                <Select
                  options={branches.map((b) => ({
                    value: b.id,
                    label: b.name,
                  }))}
                  value={selectedBranch}
                  onChange={handleBranchChange}
                  required
                />
              </div>
              <div className="col-md-6 mb-3">
                <Form.Label>Department*</Form.Label>
                <Select
                  isMulti
                  options={departments.map((d) => ({
                    value: d.id,
                    label: d.name,
                  }))}
                  value={selectedDepartments}
                  onChange={setSelectedDepartments}
                  required
                />
              </div>
              <div className="col-md-6 mb-3">
                <Form.Label>Employee*</Form.Label>
                <Select
                  isMulti
                  options={employees.map((e) => ({
                    value: e.id,
                    label: e.name,
                  }))}
                  value={selectedEmployees}
                  onChange={setSelectedEmployees}
                  required
                />
              </div>
              <div className="col-md-6 mb-3">
                <Form.Label>Meeting Title*</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />
              </div>
              <div className="col-md-6 mb-3">
                <Form.Label>Meeting Date*</Form.Label>
                <Form.Control
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  required
                />
              </div>
              <div className="col-md-6 mb-3">
                <Form.Label>Meeting Time*</Form.Label>
                <Form.Control
                  type="time"
                  value={formData.time}
                  onChange={(e) =>
                    setFormData({ ...formData, time: e.target.value })
                  }
                  required
                />
              </div>
              <div className="col-12 mb-3">
                <Form.Label>Meeting Note</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={formData.note}
                  onChange={(e) =>
                    setFormData({ ...formData, note: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="text-end">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" variant="success" className="ms-2">
                Create
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Edit Meeting Modal */}
      <Modal
        show={showEditModal}
        onHide={() => {
          setShowEditModal(false);
          resetForm();
        }}
        centered
      >
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
          <Button
            variant="secondary"
            onClick={() => {
              setShowEditModal(false);
              resetForm();
            }}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button variant="success" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Update"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default MeetingList;
