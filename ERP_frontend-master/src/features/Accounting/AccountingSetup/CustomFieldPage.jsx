import React, { useEffect, useState } from "react";
import { Table, Button, Form, Pagination, Modal } from "react-bootstrap";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import { useOutletContext } from "react-router-dom";

const CustomFieldPage = () => {
  const { openAddForm } = useOutletContext();
  const [data, setData] = useState([
    { id: 1, field: "Invoices", type: "text", module: "user" },
    { id: 2, field: "Services", type: "text", module: "Bill" },
    { id: 3, field: "Biju Kumari", type: "textarea", module: "vendor" },
  ]);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ field: "", type: "Text", module: "User" });

  useEffect(() => {
    if (openAddForm) handleAdd();
  }, [openAddForm]);

  const handleAdd = () => {
    setEditingItem(null);
    setFormData({ field: "", type: "Text", module: "User" });
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData(item);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to delete?")) return;
    setData((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSave = () => {
    if (editingItem) {
      setData((prev) =>
        prev.map((item) => (item.id === editingItem.id ? formData : item))
      );
    } else {
      setData((prev) => [...prev, { ...formData, id: Date.now() }]);
    }
    setShowModal(false);
  };

  // Filter + Pagination
  const filteredData = data.filter((item) =>
    JSON.stringify(item).toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalPages = Math.ceil(filteredData.length / entriesPerPage);
  const indexOfLast = currentPage * entriesPerPage;
  const indexOfFirst = indexOfLast - entriesPerPage;
  const currentData = filteredData.slice(indexOfFirst, indexOfLast);

  return (
    <div className="p-3">
      <div className="d-flex justify-content-between mb-3">
        <Form.Select
          value={entriesPerPage}
          onChange={(e) => setEntriesPerPage(Number(e.target.value))}
          style={{ width: "80px" }}
        >
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
        </Form.Select>
        <Form.Control
          type="text"
          placeholder="Search Custom Fields..."
          style={{ maxWidth: "250px" }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Table striped bordered hover responsive>
        <thead className="table-light">
          <tr>
            <th>CUSTOM FIELD</th>
            <th>TYPE</th>
            <th>MODULE</th>
            <th>ACTION</th>
          </tr>
        </thead>
        <tbody>
          {currentData.length > 0 ? (
            currentData.map((item) => (
              <tr key={item.id}>
                <td>{item.field}</td>
                <td>{item.type}</td>
                <td>{item.module}</td>
                <td>
                  <Button
                    variant="info"
                    size="sm"
                    className="me-2"
                    onClick={() => handleEdit(item)}
                  >
                    <FaEdit />
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(item.id)}
                  >
                    <FaTrash />
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-center text-muted">
                No Custom Fields found
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      {filteredData.length > entriesPerPage && (
        <Pagination className="justify-content-end">
          {Array.from({ length: totalPages }, (_, i) => (
            <Pagination.Item
              key={i + 1}
              active={i + 1 === currentPage}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </Pagination.Item>
          ))}
        </Pagination>
      )}

      {/* Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} backdrop="static" keyboard={false} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editingItem ? "Edit" : "Add"} Custom Field</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-2">
              <Form.Label>
                Custom Field Name <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                value={formData.field}
                onChange={(e) =>
                  setFormData({ ...formData, field: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>
                Type <span className="text-danger">*</span>
              </Form.Label>
              <Form.Select
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
              >
                <option>Text</option>
                <option>Textarea</option>
                <option>Number</option>
                <option>Date</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>
                Module <span className="text-danger">*</span>
              </Form.Label>
              <Form.Select
                value={formData.module}
                onChange={(e) =>
                  setFormData({ ...formData, module: e.target.value })
                }
              >
                <option>User</option>
                <option>Bill</option>
                <option>Vendor</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleSave}>
            {editingItem ? "Update" : "Create"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default CustomFieldPage;
