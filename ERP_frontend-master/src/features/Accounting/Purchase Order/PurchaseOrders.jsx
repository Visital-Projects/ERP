// PurchaseOrders.jsx
import React, { useEffect, useState } from "react";
import { Table, Badge, Card, Button, Collapse, Form, Row, Col, OverlayTrigger, Tooltip, Dropdown } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ChevronDown, ChevronUp, Plus } from "react-bootstrap-icons";
import purchaseService from "../../../services/purchaseService";
import PurchaseOrderModal from "./PurchaseOrderModal";
import BreadCrumb from "../../../components/BreadCrumb";
import ConfirmDeleteModal from "../../../components/ConfirmDeleteModal";
import ViewDocumentsModal from "./ViewDocumentsModal";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { VscPreview } from "react-icons/vsc"; 
import PreviewPurchaseModal from "./PreviewPurchaseModal";
import { LuRefreshCcw } from "react-icons/lu";
import branchService from "../../../services/branchService";
import '../ExpenseCreate.css'
import DraftPurchaseOrders from "./DraftPurchaseOrders";

const PurchaseOrders = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [purchases, setPurchases] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [showDocsModal, setShowDocsModal] = useState(false);
  const [currentDocuments, setCurrentDocuments] = useState([]);
  const [showDrafts, setShowDrafts] = useState(() => {
  return JSON.parse(localStorage.getItem("poShowDrafts")) || false;
});
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewData, setPreviewData] = useState([]);
  const [branches, setBranches] = useState([]);
  const [branchMap, setBranchMap] = useState({});
  const [formData, setFormData] = useState({
    po_number: "",
    vendor_name: "",
    po_date: "",
    delivery_date: "",
    status: "Draft",
    branch_id: "",
    line_items: [{ item_name: "", quantity: "", unit_price: "" }],
  });

const [filters, setFilters] = useState(() => {
  return JSON.parse(localStorage.getItem("poFilters")) || {
    status: "",
    po_date: "",
    delivery_date: "",
    vendor_name: "",
  };
});
const [selectedIds, setSelectedIds] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  const fetchPurchases = async () => {
    try {
      const res = await purchaseService.getAllPurchases();
      
    if (res?.success) {
      const modifiedData = res.data.map(po => ({
        ...po,
        status: po.status === "Success" ? "Issued" : po.status,
      }));
      setPurchases(modifiedData);
    }
  } catch (error) {
      console.error("Error fetching purchase orders:", error);
      toast.error("Failed to fetch purchase orders");
    }
  };

  useEffect(() => {
    fetchPurchases();
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      const data = await branchService.getAll();
      setBranches(data);
      const map = {};
      data.forEach(branch => {
        map[branch.id] = branch.name;
      });
      setBranchMap(map);
    } catch (error) {
      console.error("Error fetching branches:", error);
    }
  };

const handleShowModal = (purchase = null) => {
  if (purchase) {
    setSelectedPurchase(purchase);
    setFormData({
      po_number: purchase.po_number || "",
      vendor_name: purchase.vendor_name || "",
      po_date: purchase.po_date?.split("T")[0] || "",
      delivery_date: purchase.delivery_date?.split("T")[0] || "",
      status: purchase.status || "Draft",
      branch_id: purchase.branch_id || "",
      line_items:
        purchase.line_items?.map((li) => ({
          item_name: li.item_name,
          quantity: li.quantity,
          unit_price: li.unit_price,
          unit_id: li.unit_id || "",
        })) || [],
      // ✅ Parse the stringified "document" field
      documents: (() => {
        try {
          return purchase.document
            ? JSON.parse(purchase.document)
            : [];
        } catch (e) {
          return [];
        }
      })(),
    });
  } else {
    setSelectedPurchase(null);
    setFormData({
      po_number: "",
      vendor_name: "",
      po_date: "",
      delivery_date: "",
      status: "Draft",
      branch_id: "",
      line_items: [{ item_name: "", quantity: "", unit_price: "" }],
      documents: [],
    });
  }

  setShowModal(true);
};


  const handleLineItemChange = (index, field, value) => {
    const updatedItems = [...formData.line_items];
    updatedItems[index][field] = value;
    setFormData((prev) => ({ ...prev, line_items: updatedItems }));
  };

  const addLineItem = () => {
    setFormData((prev) => ({
      ...prev,
      line_items: [...prev.line_items, { item_name: "", quantity: "", unit_price: "" }],
    }));
  };

  const removeLineItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      line_items: prev.line_items.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    try {
      if (selectedPurchase) {
        await purchaseService.updatePurchaseOrder(selectedPurchase.id, formData);
        toast.success("Purchase Order updated successfully");
      } else {
        await purchaseService.createPurchaseOrder(formData);
        toast.success("Purchase Order created successfully");
      }
      setShowModal(false);
      fetchPurchases();
    } catch (error) {
      console.error("Error saving purchase:", error);
      toast.error("Failed to save purchase order");
    }
  };

  const handleDelete = (id) => {
    ConfirmDeleteModal({
      title: "Delete Purchase Order",
      message: "This action cannot be undone. Do you want to continue?",
      iconColor: "#ff9900",
      onConfirm: async () => {
        await purchaseService.deletePurchaseOrder(id);
        toast.success("Purchase Order deleted successfully");
        fetchPurchases();
      },
    });
  };

const handleFilterChange = (field, value) => {
  setFilters((prev) => {
    const updated = { ...prev, [field]: value };
    localStorage.setItem("poFilters", JSON.stringify(updated));
    return updated;
  });
};

  const filteredPurchases = purchases.filter((po) => {
    return (
      (!filters.status || po.status === filters.status) &&
      (!filters.vendor_name || po.vendor_name === filters.vendor_name) &&
      (!filters.po_date || po.po_date?.split("T")[0] === filters.po_date) &&
      (!filters.delivery_date || po.delivery_date?.split("T")[0] === filters.delivery_date)
    );
  });

const handleDownloadExcel = () => {
  if (!filteredPurchases || filteredPurchases.length === 0) {
    toast.warning("No purchase orders available to download.");
    return;
  }

  const sheetData = [
    ["PO Number", "Vendor Name", "Branch", "Status", "PO Date", "Delivery Date", "Total"],
  ];

  filteredPurchases.forEach((po) => {
    const total = po.line_items?.reduce((sum, item) => sum + Number(item.line_total || 0), 0);
    sheetData.push([
      po.po_number,
      po.vendor_name,
      branchMap[po.branch_id] || po.branch_id,
      po.status,
      po.po_date ? new Date(po.po_date).toLocaleDateString() : "-",
      po.delivery_date ? new Date(po.delivery_date).toLocaleDateString() : "-",
      total,
    ]);
  });

  const ws = XLSX.utils.aoa_to_sheet(sheetData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Purchase Orders");
  XLSX.writeFile(wb, `PurchaseOrders_${new Date().toISOString().split("T")[0]}.xlsx`);
};


const handleDownloadPDF = () => {
  if (!filteredPurchases || filteredPurchases.length === 0) {
    toast.warning("No purchase orders available to download.");
    return;
  }

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  doc.setFontSize(16);
  doc.text("Purchase Orders Report", 14, 15);

  const tableColumn = ["PO Number", "Vendor Name", "Branch", "Status", "PO Date", "Delivery Date", "Total"];
  const tableRows = filteredPurchases.map((po) => [
    po.po_number,
    po.vendor_name,
    branchMap[po.branch_id] || po.branch_id,
    po.status,
    po.po_date ? new Date(po.po_date).toLocaleDateString() : "-",
    po.delivery_date ? new Date(po.delivery_date).toLocaleDateString() : "-",
    po.line_items?.reduce((sum, item) => sum + Number(item.line_total || 0), 0),
  ]);

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 25,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [22, 160, 133] },
  });

  doc.save(`PurchaseOrders_${new Date().toISOString().split("T")[0]}.pdf`);
};


const handlePreview = () => {
  if (!filteredPurchases || filteredPurchases.length === 0) {
    toast.warning("No purchase orders available for preview.");
    return;
  }

  const previewRows = filteredPurchases.map((po) => {
    const total = po.line_items?.reduce((sum, item) => sum + Number(item.line_total || 0), 0);
    return {
      po_number: po.po_number,
      vendor_name: po.vendor_name,
      branch: branchMap[po.branch_id] || po.branch_id,
      status: po.status,
      po_date: po.po_date ? new Date(po.po_date).toLocaleDateString() : "-",
      delivery_date: po.delivery_date ? new Date(po.delivery_date).toLocaleDateString() : "-",
      total,
    };
  });

  setPreviewData(previewRows);
  setShowPreviewModal(true);
};

  const indexOfLast = currentPage * entriesPerPage;
  const indexOfFirst = indexOfLast - entriesPerPage;
  const currentPurchases = filteredPurchases.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredPurchases.length / entriesPerPage);

  const handlePageChange = (page) => setCurrentPage(page);
  const handleEntriesChange = (e) => {
    setEntriesPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const uniqueVendors = [...new Set(purchases.map((po) => po.vendor_name))];
  const uniqueStatuses = [...new Set(purchases.map((po) => po.status))];
  const uniquePoDates = [...new Set(purchases.map((po) => po.po_date?.split("T")[0]))];
  const uniqueDeliveryDates = [...new Set(purchases.map((po) => po.delivery_date?.split("T")[0]))];
  const handleBulkDelete = () => {
  if (selectedIds.length === 0) return;

  ConfirmDeleteModal({
    title: "Delete Selected Purchase Orders",
    message: `You are about to delete ${selectedIds.length} purchase order(s). This action cannot be undone.`,
    iconColor: "#ff0000",
    onConfirm: async () => {
      try {
        await Promise.all(selectedIds.map((id) => purchaseService.deletePurchaseOrder(id)));
        toast.success(`${selectedIds.length} Purchase Order(s) deleted successfully`);
        setSelectedIds([]);
        fetchPurchases();
      } catch (err) {
        console.error(err);
        toast.error("Failed to delete selected purchase orders");
      }
    },
  });
};


  return (
    <div className="container-fluid py-3 my-4">
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap">
        <div>
          <h4 className="mb-1">Purchase Orders</h4>
          <BreadCrumb pathname={location?.pathname || ""} lastLabel="Purchase Orders" />
        </div>
        <div className="d-flex align-items-center gap-2">
          <OverlayTrigger
            placement="top"
            overlay={<Tooltip id="tooltip-add">Add New Purchase Order</Tooltip>}
          >
            <Button size="sm" variant="success" className="rounded-1 px-3 py-2" onClick={() => handleShowModal()}>
              <Plus />
            </Button>
          </OverlayTrigger>
        </div>
      </div>
      <Card className="p-3 mb-3 shadow-sm">
        <Row className="g-3 align-items-end justify-content-end">
          <Col md={2}>
            <Form.Label>Status</Form.Label>
            <Form.Select
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
            >
              <option value="">All</option>
              {uniqueStatuses.map((status, i) => (
                <option key={i} value={status}>
                  {status}
                </option>
              ))}
            </Form.Select>
          </Col>
          <Col md={2}>
            <Form.Label>Vendor Name</Form.Label>
            <Form.Select
              value={filters.vendor_name}
              onChange={(e) => handleFilterChange("vendor_name", e.target.value)}
            >
              <option value="">All</option>
              {uniqueVendors.map((vendor, i) => (
                <option key={i} value={vendor}>
                  {vendor}
                </option>
              ))}
            </Form.Select>
          </Col>
          <Col md={2}>
            <Form.Label>PO Date</Form.Label>
            <Form.Select
              value={filters.po_date}
              onChange={(e) => handleFilterChange("po_date", e.target.value)}
            >
              <option value="">All</option>
              {uniquePoDates.map((date, i) => (
                <option key={i} value={date}>
                  {date}
                </option>
              ))}
            </Form.Select>
          </Col>
          <Col md={2}>
            <Form.Label>Delivery Date</Form.Label>
            <Form.Select
              value={filters.delivery_date}
              onChange={(e) => handleFilterChange("delivery_date", e.target.value)}
            >
              <option value="">All</option>
              {uniqueDeliveryDates.map((date, i) => (
                <option key={i} value={date}>
                  {date}
                </option>
              ))}
            </Form.Select>
          </Col>
          <Col md={2} className="d-flex">
            <OverlayTrigger placement="top" overlay={<Tooltip>Preview Purchase Orders</Tooltip>}>
              <Button size="sm" variant="info" onClick={handlePreview} className="px-3 py-2">
                <VscPreview />
              </Button>
            </OverlayTrigger>

            <OverlayTrigger placement="top" overlay={<Tooltip>Download Purchase Orders</Tooltip>}>
              <Dropdown>
                <Dropdown.Toggle size="sm" variant="success" className="me-2 px-3 py-2">
                  <i className="bi bi-download"></i>
                </Dropdown.Toggle>

                <Dropdown.Menu>
                  <Dropdown.Item onClick={handleDownloadExcel}>
                    <i className="bi bi-file-earmark-excel me-1"></i>Download Excel
                  </Dropdown.Item>
                  <Dropdown.Item onClick={handleDownloadPDF}>
                    <i className="bi bi-file-earmark-pdf me-1"></i>Download PDF
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </OverlayTrigger>

            <OverlayTrigger
              placement="top"
              overlay={<Tooltip id="tooltip-reset">Reset Filters</Tooltip>}
            >
              <Button size="sm"
                variant="danger" className="px-3 py-2"
                onClick={() => {
      setFilters({ status: "", po_date: "", delivery_date: "", vendor_name: "" });
      localStorage.removeItem("poFilters");
    }}
              >
                <LuRefreshCcw />
              </Button>
            </OverlayTrigger>
          </Col>
        </Row>
      </Card>
{showDrafts && (
  <div className="draft-banner">
    <i className="bi bi-pencil-square fs-5 text-primary"></i>
    Viewing <strong>Draft Purchase Orders</strong> — only unsent or pending entries are displayed.
  </div>
)}

      <Card className="p-4 shadow-sm">
        <Row className="mb-5 justify-content-between">
          <Col md={1}>
            <Form.Select
              value={entriesPerPage}
              onChange={handleEntriesChange}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </Form.Select>
          </Col>
          <Col md={3} className="d-flex align-items-center justify-content-end">
            {/* <OverlayTrigger
              placement="top"
              overlay={<Tooltip id="tooltip-toggle">
                {showDrafts ? "View All Purchase Orders" : "View Draft Purchase Orders"}
              </Tooltip>}
            >
              <Button
                size="sm"
                variant={showDrafts ? "secondary" : "primary"}
                className="rounded-1 d-flex align-items-center gap-1 px-3 py-2"
onClick={async () => {
  try {
    if (!showDrafts) {
      const localDrafts = JSON.parse(localStorage.getItem("poDrafts")) || [];
      setPurchases(localDrafts);
      toast.success("Showing drafted purchase orders");
    } else {
      await fetchPurchases();
      toast.success("Showing all purchase orders");
    }
    setShowDrafts((prev) => {
  const newVal = !prev;
  localStorage.setItem("poShowDrafts", JSON.stringify(newVal));
  return newVal;
});
  } catch (error) {
    toast.error("Failed to switch purchase order view");
  }
}}              >
                {showDrafts ? (
                  <>
                    <i className="bi bi-card-list"></i> View All
                  </>
                ) : (
                  <>
                    <i className="bi bi-pencil-square"></i> View Drafts
                  </>
                )}
              </Button>
            </OverlayTrigger> */}
          </Col>
        </Row>{showDrafts ? (
  <DraftPurchaseOrders branchMap={branchMap} />
) : (
        <div className="table-responsive">
          <Table striped hover className="text-center table-animate">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>PO Number</th>
                <th>Vendor Name</th>
                <th>Assign To</th>
                <th>Status</th>
                <th>PO Date</th>
                <th>Delivery Date</th>
                <th>Total</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentPurchases.length > 0 ? (
                currentPurchases.map((po, index) => {
                  const subTotal = po.line_items.reduce(
                    (sum, item) => sum + Number(item.line_total),
                    0
                  );
                  return (
                    <React.Fragment key={po.id}>
                      <tr>
                        <td>{indexOfFirst + index + 1}</td>
                        <td>
                          <Button
                            variant="outline-success"
                            className="px-3 py-2"
                            onClick={() => navigate(`/purchase-orders/${po.id}`)}
                          >{po.po_number}</Button></td>
                        <td>{po.vendor_name}</td>
                        <td>{branchMap[po.branch_id] || po.branch_id}</td>
                        <td>
                          <Badge
                            bg={
                              po.status === "Received"
                                ? "success"
                                : po.status === "Approved"
                                ? "warning"
                                : po.status === "Rejected"
                                ? "danger"
                                : "secondary"
                            }
                          >
                            {po.status}
                          </Badge>
                        </td>
                        <td>{new Date(po.po_date).toLocaleDateString()}</td>
                        <td>{new Date(po.delivery_date).toLocaleDateString()}</td>
                        <td>₹{subTotal.toLocaleString("en-IN")}</td>
                        <td>
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip id={`tooltip-view-${po.id}`}>View Purchase Order</Tooltip>}
                          >
                            <Button
                              size="sm"
                              variant="warning"
                              onClick={() => navigate(`/purchase-orders/${po.id}`)}
                              className="me-1"
                            >
                              <i className="bi bi-eye"></i>
                            </Button>
                          </OverlayTrigger>
                          <OverlayTrigger placement="top" overlay={<Tooltip>View documents</Tooltip>}>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => {
                                setCurrentDocuments(po.document);
                                setShowDocsModal(true);
                              }}
                            >
                              <i class="bi bi-file-earmark-richtext"></i>
                            </Button>
                          </OverlayTrigger>
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip id={`tooltip-edit-${po.id}`}>Edit Purchase Order</Tooltip>}
                          >
                            <Button
                              size="sm"
                              variant="info"
                              className="me-1"
                              onClick={() => handleShowModal(po)}
                            >
                              <i className="bi bi-pencil text-white"></i>
                            </Button>
                          </OverlayTrigger>
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip id={`tooltip-delete-${po.id}`}>Delete Purchase Order</Tooltip>}
                          >
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleDelete(po.id)}
                            >
                              <i className="bi bi-trash text-white"></i>
                            </Button>
                          </OverlayTrigger>
                        </td>
                      </tr>
                    </React.Fragment>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="10" className="text-center text-muted">
                    No purchase orders found.
                  </td>
                </tr>
              )}
            </tbody>

          </Table>
        </div>)}
        {filteredPurchases.length > 0 && (
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mt-2">
            <span className="mb-2 mb-md-0 sm">
              Showing{" "}
              {filteredPurchases.length === 0 ? 0 : indexOfFirst + 1} to{" "}
              {Math.min(indexOfFirst + entriesPerPage, filteredPurchases.length)} of{" "}
              {filteredPurchases.length} entries
            </span>

            <nav>
              <ul className="pagination pagination-sm mb-0">
                <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                  <button className="page-link" onClick={() => setCurrentPage(1)}>
                    «
                  </button>
                </li>
                {(() => {
                  const pages = [];
                  const totalNumbers = 5;
                  const totalBlocks = totalNumbers + 2;

                  if (totalPages > totalBlocks) {
                    let startPage = Math.max(2, currentPage - 1);
                    let endPage = Math.min(totalPages - 1, currentPage + 1);
                    if (currentPage <= 3) {
                      startPage = 2;
                      endPage = 4;
                    }
                    if (currentPage >= totalPages - 2) {
                      startPage = totalPages - 3;
                      endPage = totalPages - 1;
                    }

                    pages.push(
                      <li key={1} className={`page-item ${currentPage === 1 ? "active" : ""}`}>
                        <button className="page-link" onClick={() => handlePageChange(1)}>1</button>
                      </li>
                    );

                    if (startPage > 2) {
                      pages.push(
                        <li key="start-ellipsis" className="page-item disabled">
                          <span className="page-link">…</span>
                        </li>
                      );
                    }

                    for (let i = startPage; i <= endPage; i++) {
                      pages.push(
                        <li key={i} className={`page-item ${currentPage === i ? "active" : ""}`}>
                          <button className="page-link" onClick={() => handlePageChange(i)}>{i}</button>
                        </li>
                      );
                    }

                    if (endPage < totalPages - 1) {
                      pages.push(
                        <li key="end-ellipsis" className="page-item disabled">
                          <span className="page-link">…</span>
                        </li>
                      );
                    }

                    pages.push(
                      <li key={totalPages} className={`page-item ${currentPage === totalPages ? "active" : ""}`}>
                        <button className="page-link" onClick={() => handlePageChange(totalPages)}>{totalPages}</button>
                      </li>
                    );
                  } else {
                    for (let i = 1; i <= totalPages; i++) {
                      pages.push(
                        <li key={i} className={`page-item ${currentPage === i ? "active" : ""}`}>
                          <button className="page-link" onClick={() => handlePageChange(i)}>{i}</button>
                        </li>
                      );
                    }
                  }
                  return pages;
                })()}
                <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                  <button className="page-link" onClick={() => setCurrentPage((p) => p + 1)}>»</button>
                </li>
              </ul>
            </nav>
          </div>
        )}
      </Card>

      {/* Modal */}
      <PurchaseOrderModal
        show={showModal}
        onHide={() => setShowModal(false)}
        formData={formData}
        setFormData={setFormData}
        selectedPurchase={selectedPurchase}
        handleSave={handleSave}
        addLineItem={addLineItem}
        removeLineItem={removeLineItem}
        handleLineItemChange={handleLineItemChange}
      />
      <ViewDocumentsModal
        show={showDocsModal}
        onHide={() => setShowDocsModal(false)}
        documents={currentDocuments}
      />
      <PreviewPurchaseModal
        show={showPreviewModal}
        onHide={() => setShowPreviewModal(false)}
        data={previewData}
      />
    </div>
  );
};

export default PurchaseOrders;
