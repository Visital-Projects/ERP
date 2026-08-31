import React, { useState, useEffect } from "react";
import { Card, Table, Button, Spinner, Alert } from "react-bootstrap";
import { PencilSquare, Trash, Plus } from "react-bootstrap-icons";
import AllowanceModal from "./AllowanceModal";
import allowanceService from "../../../../services/allowanceService";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

import { toast } from "react-toastify";

const AllowanceCard = ({ employeeId, employeeName, createdBy }) => {
  const [allowances, setAllowances] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modalShow, setModalShow] = useState(false);
  const [editingAllowance, setEditingAllowance] = useState(null);

  // Fetch allowances by employee
  const fetchAllowances = async () => {
    if (!employeeId) {
      setAllowances([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await allowanceService.getAllowancesByEmployee(employeeId);
      setAllowances(data || []);
    } catch (err) {
      console.error("Fetch allowances error:", err);

      setAllowances([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllowances();
  }, [employeeId]);

  // Open modal to edit
  const handleEdit = (allowance) => {
    setEditingAllowance(allowance);
    setModalShow(true);
  };

  // Delete allowance
  // const handleDelete = async (id) => {
  //   if (!window.confirm("Are you sure you want to delete this allowance?"))
  //     return;
  //   try {
  //     await allowanceService.deleteAllowance(id);
  //     fetchAllowances();
  //     alert("Allowance deleted successfully");
  //   } catch (err) {
  //     console.error("Delete allowance error:", err);
  //     alert("Failed to delete allowance");
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
            {/* Cancel Button */}
            <button className="btn btn-danger me-2 px-4" onClick={onClose}>
              No
            </button>

            {/* Confirm Button */}
            <button
              className="btn btn-success px-4"
              onClick={async () => {
                try {
                  await allowanceService.deleteAllowance(id); // ✅ API call
                  await fetchAllowances(); // ✅ refresh list
                  toast.success("Allowance successfully deleted.", {
                    icon: false,
                  });
                } catch (err) {
                  console.error("Delete allowance error:", err);
                  alert("Failed to delete allowance");
                }
                onClose(); // close modal
              }}
            >
              Yes
            </button>
          </div>
        </div>
      ),
    });
  };
  // After add/edit, refresh table
  // const handleSave = () => {
  //   fetchAllowances();
  //   setEditingAllowance(null);
  //   setModalShow(false);
  // };

  // After add/edit, refresh table
  const handleSave = async (updatedAllowance) => {
    if (updatedAllowance) {
      // Optimistically update UI
      setAllowances((prev) => {
        const exists = prev.find((a) => a.id === updatedAllowance.id);
        if (exists) {
          toast.success("Allowance successfully updated.", {
            icon: false,
          });
          return prev.map((a) =>
            a.id === updatedAllowance.id ? updatedAllowance : a
          );
        }
        toast.success("Allowance successfully created.", {
          icon: false,
        });
        return [...prev, updatedAllowance];
      });
    } else {
      // fallback fetch if nothing returned
      await fetchAllowances();
    }

    setEditingAllowance(null);
    setModalShow(false);
  };

  return (
    // <Card >
    //   <Card.Header className="d-flex justify-content-between align-items-center">
    <Card
      style={{
        height: "385px",
        overflowY: "scroll",
        scrollbarWidth: "none",
        msOverflowStyle: "none",
      }}
      className="p-3 pt-2 shadow-sm rounded-3"
    >
      <Card.Header
        className="d-flex justify-content-between align-items-center card-header pb-3 pt-3"
        style={{ position: "sticky", top: 0, zIndex: 2 }}
      >
        <h5>Allowances</h5>

        {/* <Button
          variant="success"
          onClick={() => setModalShow(true)}
          disabled={!employeeId}
        >
          <Plus />
        </Button> */}

        <OverlayTrigger
          placement="top"
          overlay={
            <Tooltip id="tooltip" className="custom-tooltip">
              Add Allowance
            </Tooltip>
          }
        >
          <Button
            variant="success"
            onClick={() => setModalShow(true)}
            disabled={!employeeId}
          >
            <Plus />
          </Button>
        </OverlayTrigger>
      </Card.Header>
      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}

        <div
          className="table-responsive"
          style={{ maxHeight: "250px", overflowY: "auto" }}
        >
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="success" />
            </div>
          ) : (
            <Table striped hover  >
              <thead>
                <tr>
                  <th style={{ position: "sticky", top: 0, zIndex: 2 }}>
                    EMPLOYEE NAME
                  </th>
                  <th style={{ position: "sticky", top: 0, zIndex: 2 }}>
                    OPTION
                  </th>
                  <th style={{ position: "sticky", top: 0, zIndex: 2 }}>
                    TITLE
                  </th>
                  <th style={{ position: "sticky", top: 0, zIndex: 2 }}>
                    TYPE
                  </th>
                  <th style={{ position: "sticky", top: 0, zIndex: 2 }}>
                    AMOUNT
                  </th>
                  <th style={{ position: "sticky", top: 0, zIndex: 2 }}>
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody>
                {allowances.length > 0 ? (
                  allowances.map((a) => (
                    <tr key={a.id}>
                      <td>{a.employee?.name || employeeName || "N/A"}</td>
                      <td>{a.allowance_option}</td>
                      <td>{a.title}</td>
                      <td>{a.type}</td>
                      <td>₹{a.amount}</td>
                      <td className="d-flex gap-2">
                        {/* <Button
                        size="sm"
                        variant="info"
                        onClick={() => handleEdit(a)}
                        // style={{ width: "30px", height: "30px" }}
                      >
                        <PencilSquare size={14} />
                      </Button> */}

                        <OverlayTrigger
                          placement="top"
                          overlay={
                            <Tooltip id="tooltip" className="custom-tooltip">
                              Edit
                            </Tooltip>
                          }
                        >
                          <Button
                            size="sm"
                            variant="info"
                            onClick={() => handleEdit(a)}
                            // style={{ width: "30px", height: "30px" }}
                          >
                            {/* <PencilSquare size={14} /> */}
                            <i className="bi bi-pencil text-white"></i>
                          </Button>
                        </OverlayTrigger>
                        {/* <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDelete(a.id)}
                        // style={{ width: "30px", height: "30px" }}
                      >
                        <Trash size={14} />
                      </Button> */}

                        <OverlayTrigger
                          placement="top"
                          overlay={
                            <Tooltip id="tooltip" className="custom-tooltip">
                              Delete
                            </Tooltip>
                          }
                        >
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleDelete(a.id)}
                            // style={{ width: "30px", height: "30px" }}
                          >
                            <Trash size={14} />
                          </Button>
                        </OverlayTrigger>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center">
                      {employeeId
                        ? "No allowance found for this employee"
                        : "No employee selected"}
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          )}
        </div>
      </Card.Body>

      {/* Modal */}
      {modalShow && (
        <AllowanceModal
          show={modalShow}
          onHide={() => {
            setModalShow(false);
            setEditingAllowance(null);
          }}
          allowance={editingAllowance}
          employeeId={employeeId}
          employeeName={employeeName}
          createdBy={createdBy}
          onSave={handleSave}
        />
      )}
    </Card>
  );
};

export default AllowanceCard;
