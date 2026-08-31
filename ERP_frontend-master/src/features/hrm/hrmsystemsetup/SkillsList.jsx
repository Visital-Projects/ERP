import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import skillService from "../../../services/skillService";
import { FaTrash, FaEdit } from "react-icons/fa";
import { confirmAlert } from "react-confirm-alert";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { toast } from "react-toastify";

const SkillsList = () => {
  const [skills, setSkills] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [skill, setSkill] = useState({ name: "", wages: "" });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    setLoading(true);

    const list = await skillService.getAll();

    console.log("FINAL SKILLS LIST:", list);

    setSkills(list);
    setLoading(false);
  };

  const validateForm = () => {
    const e = {};
    if (!skill.name.trim()) e.name = "Skill name is required";
    if (skill.wages === "" || isNaN(skill.wages) || Number(skill.wages) <= 0)
      e.wages = "Wages must be greater than 0";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      if (editId) {
        await skillService.update(editId, skill);
        toast.success("Skill updated successfully");
      } else {
        await skillService.create({
          name: skill.name.trim(),
          wages: Number(skill.wages),
        });
        toast.success("Skill created successfully");
      }
      setSkill({ name: "", wages: "" });
      setEditId(null);
      setShowModal(false);
      fetchSkills();
    } catch (err) {
      toast.error("Error saving skill");
    }
  };

  const handleEdit = (s) => {
    setEditId(s.id);
    setSkill({ name: s.name, wages: Number(s.wages) });
    setShowModal(true);
  };

  // const handleDelete = (id) => {
  //   confirmAlert({
  //     customUI: ({ onClose }) => (
  //       <div className="bg-white p-4 rounded shadow text-center">
  //         <h5>Delete this skill?</h5>
  //         <div className="d-flex justify-content-center mt-3">
  //           <Button variant="danger" className="me-2" onClick={onClose}>
  //             No
  //           </Button>
  //           <Button
  //             variant="success"
  //             onClick={async () => {
  //               await skillService.remove(id);
  //               fetchSkills();
  //               onClose();
  //               toast.success("Skill deleted");
  //             }}
  //           >
  //             Yes
  //           </Button>
  //         </div>
  //       </div>
  //     ),
  //   });
  // };




  const handleDelete = (id) => {
    confirmAlert({
      customUI: ({ onClose }) => (
        <div className="custom-confirm-modal bg-white p-4 rounded shadow text-center">
          <div style={{ fontSize: "50px", color: "#ff9900" }}>❗</div>
          <h4 className="fw-bold mt-2">Are you sure?</h4>
          <p>This action cannot be undone. Do you want to continue?</p>
          <div className="d-flex justify-content-center mt-3">
            <Button variant="danger" className="me-2 px-4" onClick={onClose}>
              No
            </Button>
            <Button
              variant="success"
              className="px-4"
              onClick={async () => {
                await skillService.remove(id);
                fetchSkills();
                onClose();
                toast.success("Skill deleted successfully.", {
                  icon: false,
                });
              }}  
            >
              Yes
            </Button>
          </div>
        </div>
      ),
    });
  };

  return (
    <div className="bg-white p-3 rounded shadow-sm">
      <div className="d-flex justify-content-between mb-3">
        <h5>Manage Skills</h5>
        <Button
          variant="success"
          onClick={() => {
            setEditId(null);
            setSkill({ name: "", wages: "" });
            setShowModal(true);
          }}
        >
          +
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="success" />
        </div>
      ) : (
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Skill Name</th>
              <th>Wages</th>
              <th width="120">Action</th>
            </tr>
          </thead>
          <tbody>
            {skills.map((s) => (
              <tr key={s.id}>
                <td>{s.name}</td>
                <td>{s.wages}</td>
                <td>
                  {/* <Button
                    size="sm"
                    variant="info"
                    className="me-2"
                    onClick={() => handleEdit(s)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleDelete(s.id)}
                  >
                    <FaTrash />
                  </Button> */}
                  <OverlayTrigger
                    placement="top"
                    overlay={<Tooltip>Edit</Tooltip>}
                  >
                    <Button
                      className="btn btn-info btn-sm me-2"
                      onClick={() => handleEdit(s)}
                    >
                      <i className="bi bi-pencil text-white"></i>
                    </Button>
                  </OverlayTrigger>
                  <OverlayTrigger
                    placement="top"
                    overlay={<Tooltip>Delete</Tooltip>}
                  >
                    <Button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(s.id)}
                    >
                      <FaTrash />
                    </Button>
                  </OverlayTrigger>
                </td>
              </tr>
            ))}
            {skills.length === 0 && (
              <tr>
                <td colSpan="3" className="text-center">
                  No skills found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {/* Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editId ? "Edit Skill" : "Create Skill"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Skill Name *</Form.Label>
            <Form.Control
              value={skill.name}
              onChange={(e) => setSkill({ ...skill, name: e.target.value })}
              className={errors.name ? "is-invalid" : ""}
            />
            <div className="invalid-feedback">{errors.name}</div>
          </Form.Group>

          <Form.Group>
            <Form.Label>Wages *</Form.Label>
            <Form.Control
              type="number"
              value={skill.wages}
              onChange={(e) => setSkill({ ...skill, wages: e.target.value })}
              className={errors.wages ? "is-invalid" : ""}
            />
            <div className="invalid-feedback">{errors.wages}</div>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleSave}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default SkillsList; 
