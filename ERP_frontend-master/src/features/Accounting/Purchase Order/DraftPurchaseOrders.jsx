import React, { useState, useEffect, useCallback } from "react";
import { Table, Badge, Button, OverlayTrigger, Tooltip } from "react-bootstrap";
import { toast } from "react-toastify";
import ConfirmDeleteModal from "../../../components/ConfirmDeleteModal";
import DraftPurchaseOrderModal from "./DraftPurchaseOrderModal";

const DraftPurchaseOrders = ({ branchMap }) => {
  const [drafts, setDrafts] = useState([]);
  const [selectedDraft, setSelectedDraft] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // ✅ useCallback so we can use it reliably in dependencies
  const loadDrafts = useCallback(() => {
    const savedDrafts = JSON.parse(localStorage.getItem("poDrafts") || "[]");
    setDrafts(savedDrafts);
  }, []);

  // ✅ Initial load and auto-refresh when localStorage changes
  useEffect(() => {
    loadDrafts();

    // ✅ Listen for localStorage changes (cross-tab or other components)
    const handleStorageChange = (e) => {
      if (e.key === "poDrafts") {
        loadDrafts();
      }
    };
    window.addEventListener("storage", handleStorageChange);

    return () => window.removeEventListener("storage", handleStorageChange);
  }, [loadDrafts]);

  // ✅ Refresh every time modal closes
  useEffect(() => {
    if (!showModal) loadDrafts();
  }, [showModal, loadDrafts]);

  const handleDeleteDraft = (index) => {
    ConfirmDeleteModal({
      title: "Delete Draft Purchase Order",
      message: "This draft will be permanently removed. Continue?",
      iconColor: "#ff0000",
      onConfirm: () => {
        const updated = drafts.filter((_, i) => i !== index);
        localStorage.setItem("poDrafts", JSON.stringify(updated));
        setDrafts(updated);
        toast.success("Draft deleted successfully");
        // ✅ Auto refresh table
        loadDrafts();
      },
    });
  };

  const handleEditDraft = (draft) => {
    setSelectedDraft(draft);
    setShowModal(true);
  };

  return (
    <>
      <DraftPurchaseOrderModal
        show={showModal}
        onHide={() => {
          setShowModal(false);
          setSelectedDraft(null);
          // ✅ Refresh after closing modal (handles save/create/draft cases)
          loadDrafts();
        }}
        draftData={selectedDraft}
        refreshDrafts={loadDrafts}
      />

      {drafts.length ? (
        <div className="table-responsive mt-1">
          <Table hover striped className="text-center">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>PO Number</th>
                <th>Status</th>
                <th>Site</th>
                <th>PO Date</th>
                <th>Delivery Date</th>
                <th>Total</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {drafts.map((po, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{po.po_number || "-"}</td>
                  <td>
                    <Badge bg="secondary">{po.status || "-"}</Badge>
                  </td>
                  <td>{branchMap[po.branch_id] || po.branch_id || "-"}</td>
                  <td>{po.po_date ? new Date(po.po_date).toLocaleDateString() : "-"}</td>
                  <td>{po.delivery_date ? new Date(po.delivery_date).toLocaleDateString() : "-"}</td>
                  <td>
                    {po.line_items?.reduce(
                      (sum, li) => sum + Number(li.unit_price * li.quantity || 0),
                      0
                    ) || 0}
                  </td>
                  <td>
                    <OverlayTrigger placement="top" overlay={<Tooltip>Edit Draft</Tooltip>}>
                      <Button
                        size="sm"
                        variant="info"
                        className="me-2"
                        onClick={() => handleEditDraft(po)}
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
        <p className="text-center text-muted">No draft purchase orders found.</p>
      )}
    </>
  );
};

export default DraftPurchaseOrders;
