import React, { useState, useEffect } from "react";
import {
  Modal,
  Button,
  Form,
  Row,
  Col,
  InputGroup,
  Spinner,
} from "react-bootstrap";
import branchService from "../../../services/branchService";
import {
  FaEdit,
  FaTrash,
  FaMapMarkerAlt,
  FaPhone,
  FaLocationArrow,
  FaToggleOn,
  FaToggleOff,
} from "react-icons/fa"; // <-- added FaToggleOn / FaToggleOff
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";

const BranchList = () => {
  const [branches, setBranches] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newBranch, setNewBranch] = useState({
    name: "",
    branch_address: "",
    contact_number: "",
    co_ordinates: "",
    // HIGHLIGHTED AREA START: add clock_out initial state
    clock_out: false,
    working_days: "",
    working_hours: "",
  });
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [isClosing, setIsClosing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [togglingIds, setTogglingIds] = useState([]); // <-- per-branch toggling state
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      const res = await branchService.getAll();
      let data = res.data || res;
      data = data.sort((a, b) => b.id - a.id);
      setBranches(data);
    } catch (error) {
      console.error("Failed to fetch branches:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: newBranch.name.trim(),
        branch_address: newBranch.branch_address.trim() || null,
        contact_number: newBranch.contact_number.trim() || null,
        co_ordinates: newBranch.co_ordinates.trim() || null,
        // HIGHLIGHTED AREA START: include clock_out in create/update payload
        clock_out: !!newBranch.clock_out,
        working_days: Number(newBranch.working_days),
        working_hours: Number(newBranch.working_hours),
      };

      if (editId) {
        await branchService.update(editId, payload);
        toast.success("Site successfully updated.", { icon: false });
      } else {
        await branchService.create(payload);
        toast.success("Site successfully created.", { icon: false });
      }

      resetForm();
      handleCloseModal();
      fetchBranches();

      if (location.state?.from) {
        navigate("/employees/create", {
          state: { from: location.pathname },
        });
      }
    } catch (error) {
      console.error("Error saving Site:", error);
      toast.error("Failed to save Site", { icon: false });
    }
  };

  const resetForm = () => {
    setNewBranch({
      name: "",
      branch_address: "",
      contact_number: "",
      co_ordinates: "",
      // HIGHLIGHTED AREA START: reset clock_out
      clock_out: false,
      working_days: "",
      working_hours: "",
    });
    setEditId(null);
  };

  const handleEdit = (branch) => {
    setEditId(branch.id);
    setNewBranch({
      name: branch.name || "",
      branch_address: branch.branch_address || "",
      contact_number: branch.contact_number || "",
      co_ordinates: branch.co_ordinates || "",
      // HIGHLIGHTED AREA START: populate clock_out into modal when editing
      clock_out: !!branch.clock_out,
      working_days: branch.working_days || "",
      working_hours: branch.working_hours || "",
    });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    confirmAlert({
      customUI: ({ onClose }) => (
        <div className="custom-confirm-modal bg-white p-4 rounded shadow text-center">
          <div style={{ fontSize: "50px", color: "#ff9900" }}>❗</div>
          <h4 className="fw-bold mt-2">Are you sure?</h4>
          <p>This action can not be undone. Do you want to continue?</p>
          <div className="d-flex justify-content-center mt-3">
            <Button variant="danger" className="me-2 px-4" onClick={onClose}>
              No
            </Button>
            <Button
              variant="success"
              className="px-4"
              onClick={async () => {
                try {
                  await branchService.remove(id);
                  fetchBranches();
                  onClose();
                  toast.success("Site deleted successfully.", {
                    icon: false,
                  });
                } catch (error) {
                  console.error("Error deleting Site:", error);
                  toast.error("Failed to delete Site", { icon: false });
                }
              }}
            >
              Yes
            </Button>
          </div>
        </div>
      ),
    });
  };

  // HIGHLIGHTED AREA START: toggle clock_out handler (enable / disable)
  const handleToggleClockOut = async (branch) => {
    // Prevent duplicate toggles for same branch
    if (togglingIds.includes(branch.id)) return;

    // Mark toggling
    setTogglingIds((s) => [...s, branch.id]);

    // Optimistic update: flip locally immediately
    const prevBranches = branches;
    setBranches((prev) =>
      prev.map((b) =>
        b.id === branch.id ? { ...b, clock_out: !b.clock_out } : b
      )
    );

    try {
      const payload = {
        name: branch.name || "",
        branch_address: branch.branch_address || null,
        contact_number: branch.contact_number || null,
        co_ordinates: branch.co_ordinates || null,
        clock_out: !branch.clock_out, // flip value
      };
      await branchService.update(branch.id, payload);

      toast.success(
        `Clock-out ${!branch.clock_out ? "enabled" : "disabled"} for site.`,
        { icon: false }
      );
    } catch (err) {
      console.error("Failed to toggle clock-out:", err);
      // rollback optimistic update
      setBranches(prevBranches);
      toast.error("Failed to toggle Clock-out", { icon: false });
    } finally {
      // remove toggling marker
      setTogglingIds((s) => s.filter((id) => id !== branch.id));
    }
  };
  // HIGHLIGHTED AREA END

  const handleCloseModal = () => {
    setIsClosing(true);
    setTimeout(() => {
      setShowModal(false);
      setIsClosing(false);
      resetForm();
    }, 400);
  };

  const filteredBranches = branches.filter(
    (b) =>
      b.name?.toLowerCase().includes(search.toLowerCase()) ||
      b.branch_address?.toLowerCase().includes(search.toLowerCase()) ||
      b.contact_number?.includes(search)
  );

  const startIndex = (currentPage - 1) * entriesPerPage;
  const currentBranches = filteredBranches.slice(
    startIndex,
    startIndex + entriesPerPage
  );
  const pageCount = Math.ceil(filteredBranches.length / entriesPerPage);

  return (
    <div className="bg-white p-3 rounded shadow-sm">
      <style>{`
  .entries-select:focus {
    border-color: #6FD943 !important;
    box-shadow: 0 0 0px 4px #70d94360 !important;
  }
`}</style>
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
        .branch-info-item {
          display: flex;
          align-items: center;
          margin-bottom: 5px;
          font-size: 0.85rem;
        }
        .branch-info-icon {
          margin-right: 8px;
          color: #6c757d;
          min-width: 16px;
        }
      `}</style>

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="fw-bold">Manage Site</h5>
        <OverlayTrigger placement="top" overlay={<Tooltip>Create</Tooltip>}>
          <Button variant="success" onClick={() => setShowModal(true)}>
            <i className="bi bi-plus-lg fs-6"></i>
          </Button>
        </OverlayTrigger>
      </div>

      {/* Search + Entries Per Page */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex align-items-center">
          <select
            className="form-select me-2 ms-2 "
            value={entriesPerPage}
            onChange={(e) => {
              setEntriesPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            style={{ width: "80px" }}
          >
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>
        <Form.Control
          type="text"
          className="form-control-sm"
          style={{ maxWidth: "250px" }}
          placeholder="Search..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
        />
      </div>

      {/* Table */}
      <div className="table-responsive">
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="success" />
          </div>
        ) : (
          <table className="table table-bordered table-hover table-striped">
            <thead className="table-light">
              <tr>
                <th>Site Name</th>
                <th>Contact Information</th>
                {/* HIGHLIGHTED AREA START: added Clock-out header */}
                <th style={{ width: "160px" }}>Clock-out</th>
                {/* HIGHLIGHTED AREA END */}
                <th>Work Days</th>
                <th>Work Hours</th>

                <th style={{ width: "120px" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {currentBranches.length > 0 ? (
                currentBranches.map((branch) => (
                  <tr key={branch.id}>
                    <td>
                      <div className="fw-semibold">{branch.name}</div>
                      {branch.branch_address && (
                        <div className="branch-info-item">
                          <FaMapMarkerAlt
                            className="branch-info-icon"
                            size={12}
                          />
                          <small className="text-muted">
                            {branch.branch_address}
                          </small>
                        </div>
                      )}
                    </td>
                    <td>
                      {branch.contact_number && (
                        <div className="branch-info-item">
                          <FaPhone className="branch-info-icon" size={12} />
                          <small>{branch.contact_number}</small>
                        </div>
                      )}
                      {branch.co_ordinates && (
                        <div className="branch-info-item">
                          <FaLocationArrow
                            className="branch-info-icon"
                            size={12}
                          />
                          <small className="text-muted">
                            {branch.co_ordinates}
                          </small>
                        </div>
                      )}
                      {!branch.contact_number && !branch.co_ordinates && (
                        <small className="text-muted">No contact info</small>
                      )}
                    </td>

                    {/* /* HIGHLIGHTED AREA START: replace Clock-out <td> with bar-style toggle switch */}
                    <td className="text-center align-middle">
                      {/* Toggle container */}
                      <div
                        className={`bar-toggle ${
                          branch.clock_out ? "on" : "off"
                        } ${togglingIds.includes(branch.id) ? "disabled" : ""}`}
                        role="switch"
                        aria-checked={branch.clock_out}
                        aria-label={
                          branch.clock_out
                            ? "Disable Clock-out"
                            : "Enable Clock-out"
                        }
                        onClick={() => {
                          if (!togglingIds.includes(branch.id))
                            handleToggleClockOut(branch);
                        }}
                        onKeyDown={(e) => {
                          if (
                            (e.key === "Enter" || e.key === " ") &&
                            !togglingIds.includes(branch.id)
                          ) {
                            e.preventDefault();
                            handleToggleClockOut(branch);
                          }
                        }}
                        tabIndex={0}
                        style={{
                          display: "inline-block",
                          cursor: togglingIds.includes(branch.id)
                            ? "not-allowed"
                            : "pointer",
                        }}
                      >
                        <div className="bar-track">
                          <div className="bar-knob" />
                        </div>
                        <div className="bar-label">
                          {togglingIds.includes(branch.id) ? (
                            <span className="d-flex align-items-center">
                              <Spinner
                                animation="border"
                                size="sm"
                                className="me-2"
                              />
                              <small>Updating...</small>
                            </span>
                          ) : branch.clock_out ? (
                            <span>
                              <strong>Enabled</strong>
                            </span>
                          ) : (
                            <span className="text-muted">
                              <strong>Disabled</strong>
                            </span>
                          )}
                        </div>
                      </div>

                      <style jsx>{`
                        .bar-toggle {
                          display: flex;
                          align-items: center;
                          gap: 8px;
                          user-select: none;
                        }
                        /* HIGHLIGHTED SIZE CHANGES: reduce width/height/knob size */
                        .bar-track {
                          width: 44px; /* reduced width */
                          height: 22px; /* reduced height */
                          border-radius: 16px;
                          background: #e2e6ea;
                          position: relative;
                          transition: background 0.18s ease;
                          padding: 2px; /* reduced padding */
                          box-sizing: border-box;
                        }
                        .bar-knob {
                          width: 18px; /* reduced knob */
                          height: 18px; /* reduced knob */
                          border-radius: 50%;
                          background: #fff;
                          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
                          transform: translateX(0);
                          transition: transform 0.18s ease,
                            background 0.18s ease;
                        }
                        /* translateX = (track.innerWidth - knob.width) = (44 - 2*2 - 18) = 22px */
                        .bar-toggle.on .bar-track {
                          background: #42c96a;
                        }
                        .bar-toggle.on .bar-knob {
                          transform: translateX(22px);
                        } /* adjusted translate */
                        .bar-toggle.off .bar-knob {
                          transform: translateX(0);
                        }
                        .bar-toggle.disabled {
                          opacity: 0.65;
                          pointer-events: none;
                        }
                        .bar-label {
                          font-size: 0.82rem;
                          min-width: 64px;
                          text-align: left;
                        }
                      `}</style>
                    </td>

                    <td className="text-center">
                      {branch.working_days ?? "-"}
                    </td>
                    <td className="text-center">
                      {branch.working_hours ?? "-"}
                    </td>

                    <td>
                      <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip>Edit</Tooltip>}
                      >
                        <Button
                          className="btn btn-info btn-sm me-2 square-btn"
                          onClick={() => handleEdit(branch)}
                        >
                          <i className="bi bi-pencil text-white"></i>
                        </Button>
                      </OverlayTrigger>
                      <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip>Delete</Tooltip>}
                      >
                        <Button
                          className="btn btn-danger btn-sm square-btn"
                          onClick={() => handleDelete(branch.id)}
                        >
                          <FaTrash />
                        </Button>
                      </OverlayTrigger>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center">
                    No Sites found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      <div className="d-flex justify-content-between align-items-center">
        <div className="small text-muted">
          Showing {filteredBranches.length === 0 ? 0 : startIndex + 1} to{" "}
          {Math.min(startIndex + entriesPerPage, filteredBranches.length)} of{" "}
          {filteredBranches.length} entries
        </div>
        <div>
          <ul className="pagination pagination-sm mb-0">
            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
              <button
                className="page-link"
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                «
              </button>
            </li>
            {Array.from({ length: pageCount }, (_, i) => (
              <li
                key={i + 1}
                className={`page-item ${currentPage === i + 1 ? "active" : ""}`}
              >
                <button
                  className="page-link"
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </button>
              </li>
            ))}
            <li
              className={`page-item ${
                currentPage === pageCount ? "disabled" : ""
              }`}
            >
              <button
                className="page-link"
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                »
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Modal: uses native browser constraint validation for required fields */}
      <Modal
        show={showModal}
        onHide={handleCloseModal}
        centered
        size="md"
        className={`custom-slide-modal ${isClosing ? "closing" : "open"}`}
        style={{ overflowY: "auto", scrollbarWidth: "none" }}
      >
        <Form onSubmit={handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>{editId ? "Edit Site" : "Create Site"}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    Site Name <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={newBranch.name}
                    onChange={(e) =>
                      setNewBranch({ ...newBranch, name: e.target.value })
                    }
                    placeholder="Enter Site name"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    Site Address <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={newBranch.branch_address}
                    onChange={(e) =>
                      setNewBranch({
                        ...newBranch,
                        branch_address: e.target.value,
                      })
                    }
                    placeholder="Enter full Site address"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    Contact Number <span className="text-danger">*</span>
                  </Form.Label>
                  <InputGroup>
                    <InputGroup.Text className="bg-light border-end-0">
                      +91
                    </InputGroup.Text>

                    <Form.Control
                      type="tel"
                      value={newBranch.contact_number}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, ""); // digits only
                        if (value.length <= 10) {
                          setNewBranch({ ...newBranch, contact_number: value });
                        }
                      }}
                      placeholder="Enter 10-digit phone number"
                      required
                      maxLength={10}
                      pattern="\d{10}" // ???? ensures exactly 10 digits
                      title="Please enter a valid 10-digit phone number" // ???? tooltip message on invalid
                      className="border-start-0"
                    />
                  </InputGroup>
                  <Form.Text className="text-muted">
                    Enter 10-digit phone number
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    Coordinates <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={newBranch.co_ordinates}
                    onChange={(e) =>
                      setNewBranch({
                        ...newBranch,
                        co_ordinates: e.target.value,
                      })
                    }
                    placeholder="e.g., 20.2961,85.8245"
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* HIGHLIGHTED AREA START: Clock-out checkbox in modal */}
            <Row>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    id="clock_out_checkbox"
                    label="Enable Clock-out for this site"
                    checked={!!newBranch.clock_out}
                    onChange={(e) =>
                      setNewBranch({
                        ...newBranch,
                        clock_out: e.target.checked,
                      })
                    }
                  />
                  {/* <Form.Text className="text-muted">
                    When enabled, employees at this site can clock-out.
                  </Form.Text> */}
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Working Days (per month)</Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    max="31"
                    value={newBranch.working_days}
                    onChange={(e) =>
                      setNewBranch({
                        ...newBranch,
                        working_days: e.target.value,
                      })
                    }
                    placeholder="e.g. 26"
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Working Hours (per day)</Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    max="24"
                    value={newBranch.working_hours}
                    onChange={(e) =>
                      setNewBranch({
                        ...newBranch,
                        working_hours: e.target.value,
                      })
                    }
                    placeholder="e.g. 8"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* HIGHLIGHTED AREA END */}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button variant="success" type="submit">
              {editId ? "Update Site" : "Create Site"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default BranchList;
