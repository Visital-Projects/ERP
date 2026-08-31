import React, { useEffect, useState } from "react";
import {
  getJobStages,
  createJobStage,
  updateJobStage,
  deleteJobStage,
} from "../../../services/jobStageService";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Modal, Button, Form } from "react-bootstrap";
import { FaEdit, FaTrash, FaGripVertical } from "react-icons/fa";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";

const SortableItem = ({ id, title, onEdit, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 15px",
    border: "1px solid #ddd",
    borderRadius: "5px",
    marginBottom: "8px",
    backgroundColor: "#fff",
    boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <div className="d-flex align-items-center">
        <FaGripVertical className="me-2 text-muted" />
        <strong>{title}</strong>
      </div>
      <div>
        <Button size="sm" variant="info" className="me-2" onClick={onEdit}>
          <FaEdit />
        </Button>
        <Button size="sm" variant="danger" onClick={onDelete}>
          <FaTrash />
        </Button>
      </div>
    </div>
  );
};

const JobStageList = () => {
  const [jobStages, setJobStages] = useState([]);
  const [formData, setFormData] = useState({ title: "" });
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [isClosing, setIsClosing] = useState(false); // ✅ for animation

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    loadJobStages();
  }, []);

  const loadJobStages = async () => {
    try {
      const data = await getJobStages(); // already an array
      setJobStages(data);
    } catch (err) {
      console.error("Failed to load job stages", err);
    }
  };

  const handleSave = async () => {
    try {
      if (!formData.title.trim()) {
        alert("Title is required");
        return;
      }

      if (editId) {
        await updateJobStage(editId, { title: formData.title });
      } else {
        await createJobStage({ title: formData.title });
      }

      handleCloseModal();
      setFormData({ title: "" });
      setEditId(null);
      loadJobStages();
    } catch (err) {
      console.error("Failed to save", err);
    }
  };

  const handleEdit = (item) => {
    setFormData({ title: item.title });
    setEditId(item.id);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    confirmAlert({
      customUI: ({ onClose }) => (
        <div className="custom-ui bg-white p-4 rounded shadow text-center">
          <h5>Are you sure</h5>
          <div style={{ fontSize: "50px", color: "#ff9900" }}>❗</div>
          <p>This action cannot be undone.</p>
          <Button variant="secondary" onClick={onClose} className="me-2">
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={async () => {
              await deleteJobStage(id);
              loadJobStages();
              onClose();
            }}
          >
            Delete
          </Button>
        </div>
      ),
    });
  };

  const handleCloseModal = () => {
    setIsClosing(true);
    setTimeout(() => {
      setShowModal(false);
      setIsClosing(false);
    }, 400); // match animation duration
  };
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = jobStages.findIndex((item) => item.id === active.id);
      const newIndex = jobStages.findIndex((item) => item.id === over?.id);
      const newList = arrayMove(jobStages, oldIndex, newIndex);
      setJobStages(newList);

      // TODO: Optionally call API to persist new order
    }
  };

  return (
    <div className="bg-white p-4 rounded shadow-sm">
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
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="fw-bold mb-0">Manage Job Stages</h5>
        <Button variant="success" onClick={() => setShowModal(true)}>
          +
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={jobStages.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          {jobStages.map((stage) => (
            <SortableItem
              key={stage.id}
              id={stage.id}
              title={stage.title}
              onEdit={() => handleEdit(stage)}
              onDelete={() => handleDelete(stage.id)}
            />
          ))}
        </SortableContext>
      </DndContext>

      <p className="text-muted small fw-bold mb-3">
        Note: You can easily change order of job stage using drag & drop.
      </p>

      {/* Modal */}
      {/* <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editId ? "Edit" : "Create"} Job Stage</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Title</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleSave}>
            {editId ? "Update" : "Create"}
          </Button>
        </Modal.Footer>
      </Modal> */}

      <Modal
        show={showModal}
        onHide={handleCloseModal}
        centered
        className={`custom-slide-modal ${isClosing ? "closing" : "open"}`}
        style={{ overflowY: "auto", scrollbarWidth: "none" }}
      >
        <Modal.Header closeButton>
          <Modal.Title>{editId ? "Edit" : "Create"} Job Stage</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Title</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleSave}>
            {editId ? "Update" : "Create"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default JobStageList;
