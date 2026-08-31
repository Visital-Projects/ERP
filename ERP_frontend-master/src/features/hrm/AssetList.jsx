import React, { useEffect, useState } from "react";
import {
  Button,
  Table,
  Modal,
  Form,
  Badge,
  InputGroup,
  FormControl,
  Pagination,
} from "react-bootstrap";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { Trash, Pencil, Plus, X } from "react-bootstrap-icons";
import employeeAssetService from "../../services/employeeAssetService";
import { getEmployees } from "../../services/hrmService";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import { useNavigate, useLocation } from "react-router-dom"; // ✅ Added
import BreadCrumb from "../../components/BreadCrumb";

const AssetList = () => {
  const [assets, setAssets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const navigate = useNavigate(); // ✅ Added
  const location = useLocation(); // ✅ Added
  const [formData, setFormData] = useState({
    name: "",
    purchase_date: "",
    supported_date: "",
    amount: "",
    description: "",
  });
  const [isClosingModal, setIsClosingModal] = useState(false); // ✅ added

  useEffect(() => {
    fetchAssets();
    fetchEmployees();
  }, []);

  const fetchAssets = async () => {
    try {
      const res = await employeeAssetService.getAll();
      setAssets(res?.data?.data || []);
    } catch (err) {
      console.error("Failed to fetch assets:", err);
    }
  };

  const fetchEmployees = async () => {
    try {
      const data = await getEmployees();
      setEmployees(data || []);
    } catch (err) {
      console.error("Failed to fetch employees:", err);
    }
  };

  const handleShowModal = () => {
    setFormData({
      name: "",
      purchase_date: "",
      supported_date: "",
      amount: "",
      description: "",
    });
    setSelectedEmployees([]);
    setEditingAsset(null);
    setShowModal(true);
  };

  const handleEdit = (asset) => {
    const assignedEmployees = asset.employee_id?.split(",") || [];
    setFormData({
      name: asset.name,
      purchase_date: asset.purchase_date,
      supported_date: asset.supported_date,
      amount: asset.amount,
      description: asset.description,
    });
    setSelectedEmployees(
      employees.filter((emp) => assignedEmployees.includes(emp.id.toString()))
    );
    setEditingAsset(asset);
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleEmployeeSelect = (employee) => {
    if (!selectedEmployees.some((emp) => emp.id === employee.id)) {
      setSelectedEmployees([...selectedEmployees, employee]);
    }
    setEmployeeSearch("");
    setShowEmployeeDropdown(false);
  };

  const removeEmployee = (employeeId) => {
    setSelectedEmployees(
      selectedEmployees.filter((emp) => emp.id !== employeeId)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        employee_id: selectedEmployees.map((emp) => emp.id).join(","),
      };

      if (editingAsset) {
        await employeeAssetService.update(editingAsset.id, payload);
      } else {
        await employeeAssetService.create(payload);
      }
      fetchAssets();
      handleCloseModal();
    } catch (err) {
      console.error("Error saving asset:", err);
    }
  };

  // const handleDelete = async (id) => {
  //   if (window.confirm("Are you sure you want to delete this asset?")) {
  //     try {
  //       await employeeAssetService.delete(id);
  //       fetchAssets();
  //     } catch (err) {
  //       console.error("Failed to delete asset:", err);
  //     }
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
                  await employeeAssetService.delete(id); // ✅ delete asset
                  await fetchAssets(); // ✅ refresh list
                } catch (err) {
                  console.error("Failed to delete asset:", err);
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

  // ✅ Animated modal close
  const handleCloseModal = () => {
    setIsClosingModal(true);
    setTimeout(() => {
      setShowModal(false);
      setIsClosingModal(false);
    }, 400);
  };

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(employeeSearch.toLowerCase()) &&
      !selectedEmployees.some((selected) => selected.id === emp.id)
  );

  const filteredAssets = assets.filter(
    (asset) =>
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (asset.description &&
        asset.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const paginatedAssets = filteredAssets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredAssets.length / itemsPerPage);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return "$ 0.00";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
      .format(amount)
      .replace("$", "$ ");
  };

  return (
    <div className="container mt-4">
      {/* ✅ Inline CSS Animations */}
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
       
        <BreadCrumb pathname={location.pathname} onNavigate={navigate} />
        <Button
          className="btn btn-success d-flex align-items-center justify-content-center"
          style={{ width: "38px", height: "38px", borderRadius: "6px" }}
          variant="success"
          onClick={handleShowModal}
        >
          <i className="bi bi-plus-lg fs-6"></i>
        </Button>
      </div>

      <div className=" shadow-sm d-flex justify-content-between mb-5">
        <div className="d-flex align-items-center">
          <Form.Select
            value={itemsPerPage}
            onChange={(e) => setCurrentPage(1)}
            style={{ width: "80px" }}
            className="me-2"
          >
            
           <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </Form.Select>
          <span>entries per page</span>
        </div>
        <FormControl
          placeholder="Search..."
          style={{ width: "300px" }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Table striped bordered hover responsive>
        <thead className="table-light">
          <tr>
            <th>NAME</th>
            <th>USERS</th>
            <th>PURCHASE DATE</th>
            <th>SUPPORTED DATE</th>
            <th>AMOUNT</th>
            <th>DESCRIPTION</th>
            <th>ACTION</th>
          </tr>
        </thead>
        <tbody>
          {paginatedAssets.length > 0 ? (
            paginatedAssets.map((asset) => (
              <tr key={asset.id}>
                <td>{asset.name}</td>
                <td>
                  {asset.employee_id?.split(",").map((id) => {
                    const emp = employees.find((e) => e.id == id);
                    return emp ? (
                      <OverlayTrigger
                        key={id}
                        placement="top"
                        overlay={
                          <Tooltip id={`tooltip-${id}`}>{emp.name}</Tooltip>
                        }
                      >
                        <Badge
                          bg="light"
                          text="dark"
                          className="me-1 user-badge"
                          style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "50%",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: 0,
                            position: "relative",
                            zIndex: 1,
                            transition: "transform 0.2s",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.zIndex = 10)
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.zIndex = 1)
                          }
                        >
                          <i
                            className="bi bi-person-fill"
                            style={{ fontSize: "1.2rem" }}
                          ></i>
                        </Badge>
                      </OverlayTrigger>
                    ) : null;
                  })}
                </td>
                <td>{formatDate(asset.purchase_date)}</td>
                <td>{formatDate(asset.supported_date)}</td>
                <td>{formatCurrency(asset.amount)}</td>
                <td>{asset.description}</td>
                <td>
                  <Button
                    variant="info"
                    size="sm"
                    onClick={() => handleEdit(asset)}
                    className="me-1"
                  >
                    <i className="bi bi-pencil-fill text-white"></i>
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(asset.id)}
                  >
                    <i className="bi bi-trash-fill text-white"></i>
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="text-center py-4">
                No assets found
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      <div className="d-flex justify-content-between align-items-center mt-3">
        <div>
          Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
          {Math.min(currentPage * itemsPerPage, filteredAssets.length)} of{" "}
          {filteredAssets.length} entries
        </div>
        <Pagination>
          <Pagination.Prev
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          />
          {[...Array(totalPages)].map((_, idx) => (
            <Pagination.Item
              key={idx + 1}
              active={idx + 1 === currentPage}
              onClick={() => setCurrentPage(idx + 1)}
            >
              {idx + 1}
            </Pagination.Item>
          ))}
          <Pagination.Next
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          />
        </Pagination>
      </div>

      {/* Create/Edit Modal */}
      <Modal
        show={showModal}
        onHide={handleCloseModal}
        centered
        className={`custom-slide-modal ${isClosingModal ? "closing" : "open"}`}
        style={{ overflowY: "auto", scrollbarWidth: "none" }}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {editingAsset ? "Edit Asset" : "Create New Assets"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Employee</Form.Label>
              <div className="position-relative">
                {/* Selected employees chips */}
                <div className="d-flex flex-wrap gap-2 mb-2 p-2 border rounded">
                  {selectedEmployees.map((employee) => (
                    <Badge
                      key={employee.id}
                      bg="light"
                      text="dark"
                      className="d-flex align-items-center"
                    >
                      {employee.name}
                      <X
                        className="ms-1"
                        style={{ cursor: "pointer", fontSize: "0.75rem" }}
                        onClick={() => removeEmployee(employee.id)}
                      />
                    </Badge>
                  ))}
                </div>

                {/* Employee search and dropdown */}
                <div className="position-relative">
                  <FormControl
                    placeholder="Select Employee"
                    value={employeeSearch}
                    onChange={(e) => setEmployeeSearch(e.target.value)}
                    onFocus={() => setShowEmployeeDropdown(true)}
                  />
                  {showEmployeeDropdown && (
                    <div
                      className="position-absolute w-100 bg-white border mt-1 rounded shadow-sm"
                      style={{
                        zIndex: 1000,
                        maxHeight: "200px",
                        overflowY: "auto",
                      }}
                    >
                      {filteredEmployees.length > 0 ? (
                        filteredEmployees.map((employee) => (
                          <div
                            key={employee.id}
                            className="px-3 py-2 hover-bg cursor-pointer"
                            onClick={() => handleEmployeeSelect(employee)}
                          >
                            {employee.name}
                          </div>
                        ))
                      ) : (
                        <div className="px-3 py-2 text-muted">
                          No employees found
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Purchase Date <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="date"
                name="purchase_date"
                value={formData.purchase_date}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Supported Date <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="date"
                name="supported_date"
                value={formData.supported_date}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Amount</Form.Label>
              <Form.Control
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter Description"
              />
            </Form.Group>

            <div className="d-flex justify-content-end">
              <Button
                variant="secondary"
                onClick={handleCloseModal}
                className="me-2"
              >
                Cancel
              </Button>
              <Button variant="success" type="submit">
                {editingAsset ? "Update" : "Create"}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      <style jsx>{`
        .hover-bg:hover {
          background-color: #f8f9fa;
        }
        .cursor-pointer {
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default AssetList;
