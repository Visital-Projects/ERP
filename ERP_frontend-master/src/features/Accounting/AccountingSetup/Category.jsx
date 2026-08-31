import React, { useState, useEffect } from "react";
import { Table, Button, Form, Pagination, Modal } from "react-bootstrap";
import { Plus, PencilSquare, Trash } from "react-bootstrap-icons";
import { fetchCategories, createCategory, updateCategory, deleteCategory, fetchAccountTypes, fetchChartAccounts } from "../../../services/AccountingSetup";
import { useOutletContext } from "react-router-dom";

const Category = () => {
  const { openAddForm, resetOpenAddForm } = useOutletContext();
  const [data, setData] = useState([]);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [accountTypes, setAccountTypes] = useState([]);
const [chartAccounts, setChartAccounts] = useState([]);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ name: "", type: "", account: "" });
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    const result = await fetchCategories();
    setData(result || []);
  };

  useEffect(() => {
    fetchData();
  }, []);
useEffect(() => {
  const loadData = async () => {
    await fetchData(); // fetch categories
    const types = await fetchAccountTypes();
    setAccountTypes(types || []);
    const accounts = await fetchChartAccounts();
    setChartAccounts(accounts || []);
  };
  loadData();
}, []);
  useEffect(() => {
    if (openAddForm) {
      handleAdd();       // open modal automatically
      resetOpenAddForm(); // reset parent flag
    }
  }, [openAddForm]);

  const handleAdd = () => {
    setEditingItem(null);
    setFormData({ name: "", type: "", account: "" });
    setShowModal(true);
  };

const handleEdit = (item) => {
  setEditingItem(item);
  setFormData({
    name: item.name,
    type: item.type,
    account: item.chart_account_id,
    color: item.color || "#00ff00"
  });
  setShowModal(true);
};

  const handleCloseModal = () => setShowModal(false);

const handleSave = async () => {
  setSaving(true);

  // Build payload according to API
  const payload = {
    name: formData.name,
    type: Number(formData.type),
    chart_account_id: Number(formData.account),
    color: formData.color || "#00ff00", // default color
  };

  let response;
  if (editingItem) {
    response = await updateCategory(editingItem.id, payload);
  } else {
    response = await createCategory(payload);
  }

  if (response?.success) {
    fetchData();
    setShowModal(false);
  } else {
    alert(response?.message || "Error saving category");
  }

  setSaving(false);
};

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete?")) return;
    const response = await deleteCategory(id);
    if (response?.success) fetchData();
    else alert(response?.message || "Delete failed");
  };

  // Pagination + search
  const filteredData = data.filter((item) =>
    JSON.stringify(item).toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalPages = Math.ceil(filteredData.length / entriesPerPage);
  const indexOfLast = currentPage * entriesPerPage;
  const indexOfFirst = indexOfLast - entriesPerPage;
  const currentData = filteredData.slice(indexOfFirst, indexOfLast);

  return (
    <div className="p-3 bg-white rounded" style={{ boxShadow: "0px 0px 10px 4px rgba(0, 0, 0, 0.1)" }}>
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
          placeholder="Search Categories..."
          style={{ maxWidth: "250px" }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Table bordered hover responsive>
        <thead className="table-light">
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Account</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {currentData.length > 0 ? (
            currentData.map((item) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.accountType?.name || ""}</td>
<td>{item.chartAccount?.name || ""}</td>
                <td>
                  <Button variant="info" size="sm" className="me-2" onClick={() => handleEdit(item)}>
                    <PencilSquare />
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => handleDelete(item.id)}>
                    <Trash />
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-center text-muted">
                No Categories found
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
      <Modal show={showModal} onHide={handleCloseModal} backdrop="static" keyboard={false} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editingItem ? "Edit" : "Add"} Category</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-2">
              <Form.Label>
                Name <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </Form.Group>
<Form.Group className="mb-2">
  <Form.Label>
    Type <span className="text-danger">*</span>
  </Form.Label>
  <Form.Select
    value={formData.type || ""}
    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
  >
    <option value="">Select Type</option>
    {accountTypes.map((type) => (
      <option key={type.id} value={type.id}>
        {type.name}
      </option>
    ))}
  </Form.Select>
</Form.Group>

<Form.Group className="mb-2">
  <Form.Label>Account</Form.Label>
  <Form.Select
    value={formData.account || ""}
    onChange={(e) => setFormData({ ...formData, account: e.target.value })}
    disabled={!formData.type} // disable if no type selected
  >
    <option value="">Select Account</option>
    {chartAccounts
      .filter(acc => acc.accountType?.id === Number(formData.type))
      .map((acc) => (
        <option key={acc.id} value={acc.id}>
          {acc.code}-{acc.name}
        </option>
      ))
    }
  </Form.Select>
</Form.Group>
<Form.Group className="mb-2">
  <Form.Label>Color</Form.Label>
  <Form.Control
    type="color"
    value={formData.color || "#00ff00"}
    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
  />
</Form.Group>

          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : editingItem ? "Update" : "Create"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Category;
