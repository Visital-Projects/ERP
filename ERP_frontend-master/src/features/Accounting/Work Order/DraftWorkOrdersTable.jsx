import React, { useState, useEffect } from "react";
import { Table, Badge, Button, OverlayTrigger, Tooltip } from "react-bootstrap";
import { toast } from "react-toastify";
import WorkOrderModal from "./WorkOrderModal";
import ConfirmDeleteModal from "../../../components/ConfirmDeleteModal";

const DraftWorkOrdersTable = () => {
  const [drafts, setDrafts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedDraft, setSelectedDraft] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    const savedDrafts = JSON.parse(localStorage.getItem("woDrafts") || "[]");
    setDrafts(savedDrafts);
  }, []);

  // delete draft with confirmation modal
  const handleDeleteDraft = (index) => {
    ConfirmDeleteModal({
      title: "Delete Draft?",
      message: "Are you sure you want to delete this work order draft?",
      iconColor: "#dc3545",
      onConfirm: async () => {
        const updatedDrafts = drafts.filter((_, i) => i !== index);
        localStorage.setItem("woDrafts", JSON.stringify(updatedDrafts));
        setDrafts(updatedDrafts);
        toast.success("Draft deleted successfully");
      },
    });
  };

const handleEditDraft = (draft) => {
  // Prefill the form with draft data, but keep modal in CREATE mode
  setFormData({ ...draft });
  setSelectedDraft(draft); // <-- important: ensures WorkOrderModal opens in create mode
  setShowModal(true);
};

const refreshDrafts = () => {
  const savedDrafts = JSON.parse(localStorage.getItem("woDrafts") || "[]");
  setDrafts(savedDrafts);
};

  return (
    <>
      {drafts.length ? (
        <div className="table-responsive mt-1">
          <Table hover striped>
            <thead className="table-light text-center">
              <tr>
                <th>#</th>
                <th>WO Number</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Assigned To</th>
                <th>Issue Date</th>
                <th>Expected Date</th>
                <th>Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody className="text-center">
              {drafts.map((wo, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{wo.wo_number || "-"}</td>
                  <td><Badge bg="secondary">{wo.status || "-"}</Badge></td>
                  <td>
                    <Badge
                      bg={
                        wo.priority === "Emergency" || wo.priority === "High"
                          ? "danger"
                          : wo.priority === "Medium"
                          ? "warning"
                          : "secondary"
                      }
                    >
                      {wo.priority || "-"}
                    </Badge>
                  </td>
                  <td>{wo.assigned_to || "-"}</td>
                  <td>{wo.issue_date ? new Date(wo.issue_date).toLocaleDateString() : "-"}</td>
                  <td>{wo.expected_date ? new Date(wo.expected_date).toLocaleDateString() : "-"}</td>
                  <td>{wo.amount ? `₹${parseFloat(wo.amount).toFixed(2)}` : "-"}</td>
                  <td>
                    <OverlayTrigger placement="top" overlay={<Tooltip>Edit Draft</Tooltip>}>
                      <Button
                        size="sm"
                        variant="info"
                        className="me-2"
                        onClick={() => handleEditDraft(wo)}
                      >
                        <i className="bi bi-pencil text-white"></i>
                      </Button>
                    </OverlayTrigger>

                    <OverlayTrigger placement="top" overlay={<Tooltip>Delete Draft</Tooltip>}>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDeleteDraft(index)}
                      >
                        <i className="bi bi-trash text-white"></i>
                      </Button>
                    </OverlayTrigger>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      ) : (
        <p className="text-center text-muted">No draft work orders found.</p>
      )}

{showModal && (
  <WorkOrderModal
    show={showModal}
    onHide={() => setShowModal(false)}
    formData={formData}
    setFormData={setFormData}
    selectedWorkOrder={null} // ✅ Force create mode
    onDraftSaved={refreshDrafts}
    handleSave={async (payload) => {
      try {
        const workOrderService = (await import("../../../services/workOrderService")).default;
        await workOrderService.createWorkOrder(payload);
        toast.success("Work order created successfully!");

        // ✅ Remove the draft that was used to create this WO
        if (selectedDraft?.id) {
          const updatedDrafts = drafts.filter((d) => d.id !== selectedDraft.id);
          localStorage.setItem("woDrafts", JSON.stringify(updatedDrafts));
          setDrafts(updatedDrafts);
        }

        setShowModal(false);
      } catch (err) {
        console.error("Error creating work order:", err);
        toast.error("Failed to create work order.");
      }
    }}
  />
)}

    </>
  );
};

export default DraftWorkOrdersTable;
