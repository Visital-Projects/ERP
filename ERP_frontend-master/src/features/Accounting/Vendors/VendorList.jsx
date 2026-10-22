import React, { useState, useEffect } from "react";
import { Table, Button, Form, Modal, Card, Spinner, OverlayTrigger, Tooltip } from "react-bootstrap";
import { FaPlus, FaPencilAlt, FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";
import BreadCrumb from "../../../components/BreadCrumb";
import ConfirmDeleteModal from "../../../components/ConfirmDeleteModal";
import vendorService from "../../../services/vendorService";

const VendorList = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  // Fetch vendors from existing vendor_name table
  const fetchVendors = async () => {
    setLoading(true);
    try {
      const data = await vendorService.getAllVendors();
      setVendors(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching vendors:", error);
      toast.error(error.response?.data?.message || "Failed to load vendors");
      setVendors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  // Filter vendors by Vendor Name
  const filteredVendors = vendors.filter((v) => {
    if (!searchTerm.trim()) return true;
    return (v.name || "").toLowerCase().includes(searchTerm.trim().toLowerCase());
  });

  // Pagination calculation
  const totalPages = Math.ceil(filteredVendors.length / entriesPerPage) || 1;
  const indexOfLast = currentPage * entriesPerPage;
  const indexOfFirst = indexOfLast - entriesPerPage;
  const currentVendors = filteredVendors.slice(indexOfFirst, indexOfLast);

  // Handlers for Add / Edit
  const handleOpenAdd = () => {
    setEditingVendor(null);
    setFormData({ name: "", address: "", phone: "" });
    setErrors({});
    setShowModal(true);
  };

  const handleOpenEdit = (vendor) => {
    setEditingVendor(vendor);
    setFormData({
      name: vendor.name || "",
      address: vendor.address || "",
      phone: vendor.phone || "",
    });
    setErrors({});
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingVendor(null);
    setFormData({ name: "", address: "", phone: "" });
    setErrors({});
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name?.trim()) {
      newErrors.name = "Vendor Name is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Save / Update Vendor
  const handleSaveVendor = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);
    try {
      const payload = {
        name: formData.name.trim(),
        address: formData.address.trim(),
        phone: formData.phone.trim(),
      };

      if (editingVendor) {
        // Update existing record
        await vendorService.updateVendor(editingVendor.id, payload);
        toast.success("Vendor updated successfully");
      } else {
        // Create new record
        await vendorService.createVendor(payload);
        toast.success("Vendor created successfully");
      }

      handleCloseModal();
      await fetchVendors();
    } catch (error) {
      console.error("Error saving vendor:", error);
      toast.error(error.response?.data?.message || "Failed to save vendor");
    } finally {
      setSaving(false);
    }
  };

  // Delete Vendor
  const handleDeleteVendor = (vendorId) => {
    ConfirmDeleteModal({
      title: "Delete Vendor",
      message: "Are you sure you want to delete this vendor? This action cannot be undone.",
      iconColor: "#dc3545",
      onConfirm: async () => {
        try {
          await vendorService.deleteVendor(vendorId);
          toast.success("Vendor deleted successfully");
          await fetchVendors();
        } catch (error) {
          console.error("Error deleting vendor:", error);
          toast.error(error.response?.data?.message || "Failed to delete vendor");
        }
      },
    });
  };

  return (
    <div className="container-fluid py-3 my-4">
      {/* Header Row */}
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap">
        <div>
          <h4>Vendors</h4>
          <BreadCrumb pathname="/accounting/vendors" dynamicNames={{ vendors: "Vendors" }} />
        </div>
        <OverlayTrigger overlay={<Tooltip>Add New Vendor</Tooltip>}>
          <Button size="md" variant="success" onClick={handleOpenAdd}>
            <FaPlus />
          </Button>
        </OverlayTrigger>
      </div>

      {/* SECTION 1 — TOOLBAR */}
      <Card className="p-3 mb-4 shadow-sm">
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
          {/* Entries per page */}
          <div className="d-flex align-items-center">
            <Form.Select
              value={entriesPerPage}
              onChange={(e) => {
                setEntriesPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              style={{ width: "80px", height: "38px" }}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </Form.Select>
          </div>

          {/* Search */}
          <div className="d-flex align-items-center ms-auto">
            <Form.Control
              type="text"
              placeholder="Search Vendor Name..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              style={{ width: "220px", height: "38px" }}
            />
          </div>
        </div>
      </Card>

      {/* SECTION 2 — TABLE */}
      <Card className="p-4 shadow-sm">
        <div className="table-responsive">
          <Table hover striped className="text-center align-middle">
            <thead className="table-light">
              <tr>
                <th style={{ width: "80px" }}>#</th>
                <th className="text-start">Vendor Name</th>
                <th className="text-start">Address</th>
                <th className="text-start">Phone No</th>
                <th style={{ width: "140px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-5">
                    <div className="d-flex justify-content-center align-items-center">
                      <Spinner animation="border" variant="success" />
                      <span className="ms-2">Loading vendors...</span>
                    </div>
                  </td>
                </tr>
              ) : currentVendors.length > 0 ? (
                currentVendors.map((vendor, index) => (
                  <tr key={vendor.id}>
                    <td>{indexOfFirst + index + 1}</td>
                    <td className="text-start fw-semibold">{vendor.name || "-"}</td>
                    <td className="text-start">{vendor.address || "-"}</td>
                    <td className="text-start">{vendor.phone || "-"}</td>
                    <td>
                      <div className="d-flex justify-content-center gap-2">
                        <OverlayTrigger overlay={<Tooltip>Edit Vendor</Tooltip>}>
                          <Button
                            size="sm"
                            variant="info"
                            onClick={() => handleOpenEdit(vendor)}
                          >
                            <FaPencilAlt className="text-white" />
                          </Button>
                        </OverlayTrigger>

                        <OverlayTrigger overlay={<Tooltip>Delete Vendor</Tooltip>}>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleDeleteVendor(vendor.id)}
                          >
                            <FaTrash className="text-white" />
                          </Button>
                        </OverlayTrigger>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-4 text-muted">
                    No vendors found.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="d-flex justify-content-between align-items-center mt-3 flex-wrap gap-2">
          <div className="small text-muted">
            Showing {filteredVendors.length > 0 ? indexOfFirst + 1 : 0} to{" "}
            {Math.min(indexOfLast, filteredVendors.length)} of {filteredVendors.length} entries
          </div>
          <div>
            <ul className="pagination pagination-sm mb-0">
              <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                <button
                  className="page-link"
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                >
                  &laquo;
                </button>
              </li>
              {[...Array(totalPages)].map((_, i) => {
                const page = i + 1;
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 2 && page <= currentPage + 2)
                ) {
                  return (
                    <li
                      key={page}
                      className={`page-item ${currentPage === page ? "active" : ""}`}
                    >
                      <button className="page-link" onClick={() => setCurrentPage(page)}>
                        {page}
                      </button>
                    </li>
                  );
                } else if (page === currentPage - 3 || page === currentPage + 3) {
                  return (
                    <li key={page} className="page-item disabled">
                      <span className="page-link">...</span>
                    </li>
                  );
                }
                return null;
              })}
              <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                <button
                  className="page-link"
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  &raquo;
                </button>
              </li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Add / Edit Vendor Modal */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editingVendor ? "Edit Vendor" : "Add Vendor"}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSaveVendor}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>
                Vendor Name <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter vendor name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                isInvalid={!!errors.name}
                autoFocus
              />
              <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Address</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                placeholder="Enter address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Phone No</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter phone number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal} disabled={saving}>
              Cancel
            </Button>
            <Button variant="success" type="submit" disabled={saving}>
              {saving ? "Saving..." : editingVendor ? "Update Vendor" : "Save Vendor"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default VendorList;
