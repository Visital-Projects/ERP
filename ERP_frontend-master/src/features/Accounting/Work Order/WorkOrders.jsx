// WorkOrders.jsx
import React, { useEffect, useState } from "react";
import { Table, Badge, Card, Button, Collapse, Row, Col, Form, OverlayTrigger, Tooltip, Modal, Dropdown } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ChevronDown, ChevronUp, Plus } from "react-bootstrap-icons";
import workOrderService from "../../../services/workOrderService";
import BreadCrumb from "../../../components/BreadCrumb";
import ConfirmDeleteModal from "../../../components/ConfirmDeleteModal";
import WorkOrderModal from "./WorkOrderModal";
import ViewDocumentsModal from "./ViewDocumentsOverlay";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { VscPreview } from "react-icons/vsc"; 
import PreviewWorkOrdersModal from "./PreviewWorkOrdersModal";
import { LuRefreshCcw } from "react-icons/lu";
import DraftWorkOrdersTable from "./DraftWorkOrdersTable";

const WorkOrders = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [workOrders, setWorkOrders] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);
  const [showDocsModal, setShowDocsModal] = useState(false);
const [currentDocIndex, setCurrentDocIndex] = useState(0);
const [currentDocs, setCurrentDocs] = useState([]);
const [showDrafts, setShowDrafts] = useState(
  JSON.parse(localStorage.getItem("woShowDrafts")) || false
);
const [showPreviewModal, setShowPreviewModal] = useState(false);
const [previewData, setPreviewData] = useState([]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "Open",
    priority: "Medium",
    assigned_to: "",
    issue_date: "",
    expected_date: "",
    expected_days: "",
    start_date: "",
    end_date: "",
    actual_days: "",
    documents: [],
    services: [],
    unit: "",
  });

const [filters, setFilters] = useState(
  JSON.parse(localStorage.getItem("woFilters")) || {
    status: "",
    priority: "",
    assigned_to: "",
    issue_date: "",
    expected_date: "",
  }
);

  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedIds, setSelectedIds] = useState([]);
  useEffect(() => {
    fetchWorkOrders();
  }, []);

  const fetchWorkOrders = async () => {
    try {
      const res = await workOrderService.getAllWorkOrders();
      if (res?.success) setWorkOrders(res.data);
    } catch (error) {
      console.error("Error fetching work orders:", error);
      toast.error("Failed to fetch work orders");
    }
  };

  const formatAmount = (value) => {
  if (!value || isNaN(value)) return "-";
  return `₹${Number(value).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};
  const formatForDatetimeLocal = (dateString) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    const offset = d.getTimezoneOffset();
    const localDate = new Date(d.getTime() - offset * 60 * 1000);
    return localDate.toISOString().slice(0, 16);
  };

const handleShowModal = (workOrder = null) => {
  if (workOrder) {
    setSelectedWorkOrder(workOrder);

    // Normalize documents (could be array, JSON string, or URLs)
    let docs = [];
    try {
      if (typeof workOrder.document === "string") {
        docs = JSON.parse(workOrder.document);
      } else if (Array.isArray(workOrder.document)) {
        docs = workOrder.document;
      }
    } catch {
      docs = [workOrder.document].filter(Boolean);
    }

    // Check if it's a draft
    const isDraft = workOrder.isDraft || false;

    if (isDraft) {
      // Draft layout (like create modal)
      setFormData({
        wo_number: workOrder.wo_number || "",
        title: workOrder.title || "",
        description: workOrder.description || "",
        status: workOrder.status || "In Progress",
        priority: workOrder.priority || "Medium",
        assigned_to: workOrder.assigned_to || "",
        wo_type: workOrder.wo_type || "",
        issue_date: workOrder.issue_date || "",
        expected_date: workOrder.expected_date || "",
        expected_days: workOrder.expected_days || "",
        start_date: "",
        end_date: "",
        actual_days: "",
        // amount: workOrder.amount || "",
        documents: docs || [],
        services: workOrder.services || [],
      });
    } else {
      // Existing normal logic for fully created work order
      setFormData({
        wo_number: workOrder.wo_number || "",
        title: workOrder.title || "",
        description: workOrder.description || "",
        status: workOrder.status || "In Progress",
        priority: workOrder.priority || "Medium",
        assigned_to: workOrder.assigned_to || workOrder.assignedBranch?.id || "",
        wo_type: workOrder.wo_type || "",
        issue_date: formatForDatetimeLocal(workOrder.issue_date),
        expected_date: formatForDatetimeLocal(workOrder.expected_date),
        expected_days: workOrder.expected_days || "",
        start_date: formatForDatetimeLocal(workOrder.start_date),
        end_date: formatForDatetimeLocal(workOrder.end_date),
        actual_days: workOrder.actual_days || "",
        // amount: workOrder.amount || "",
        documents: docs || [],
        services: workOrder.services || [],
      });
    }
  } else {
    // Reset for create
    setSelectedWorkOrder(null);
    setFormData({
      wo_number: "",
      title: "",
      description: "",
      status: "In Progress",
      priority: "Medium",
      assigned_to: "",
      wo_type: "",
      issue_date: "",
      expected_date: "",
      expected_days: "",
      start_date: "",
      end_date: "",
      actual_days: "",
      amount: "",
      documents: [],
      services: [],
    });
  }

  setShowModal(true);
};


const handleSave = async (payload) => {
  try {
    if (selectedWorkOrder) {
      await workOrderService.updateWorkOrder(selectedWorkOrder.id, payload);
      toast.success("Work Order updated successfully");
    } else {
      await workOrderService.createWorkOrder(payload);
      toast.success("Work Order created successfully");
    }

    setShowModal(false);
    fetchWorkOrders();
  } catch (error) {
    console.error("Error saving work order:", error);
    toast.error("Failed to save work order");
  }
};


  const handleDelete = (id) => {
    ConfirmDeleteModal({
      title: "Delete Work Order",
      message: "This action cannot be undone. Continue?",
      iconColor: "#ff0000",
      onConfirm: async () => {
        await workOrderService.deleteWorkOrder(id);
        toast.success("Work Order deleted successfully");
        fetchWorkOrders();
      },
    });
  };
const handleViewDocuments = (documentsArray) => {
  if (!documentsArray || !documentsArray.length) {
    toast.error("No documents found");
    return;
  }

  // Normalize documents (sometimes stored as JSON strings)
  let docs = [];
  try {
    if (typeof documentsArray[0] === "string" && documentsArray[0].startsWith("[")) {
      docs = JSON.parse(documentsArray[0]);
    } else {
      docs = documentsArray;
    }
  } catch {
    docs = documentsArray;
  }

  if (!docs.length) {
    toast.error("No valid documents found");
    return;
  }

  setCurrentDocs(docs);
  setCurrentDocIndex(0);
  setShowDocsModal(true);
};

const handleFilterChange = (e) => {
  const { name, value } = e.target;
  const updatedFilters = { ...filters, [name]: value };
  setFilters(updatedFilters);
  localStorage.setItem("woFilters", JSON.stringify(updatedFilters));
};

  const filteredWorkOrders = workOrders.filter((wo) => {
    return (
      (filters.status ? wo.status === filters.status : true) &&
      (filters.priority ? wo.priority === filters.priority : true) &&
      (filters.assigned_to
        ? (wo.assignedBranch?.name || "")
            .toLowerCase()
            .includes(filters.assigned_to.toLowerCase())
        : true) &&
(filters.issue_date
  ? new Date(wo.issue_date).toISOString().slice(0, 10) === filters.issue_date
  : true) &&
(filters.expected_date
  ? new Date(wo.expected_date).toISOString().slice(0, 10) === filters.expected_date
  : true)
    );
  });
const handleDownloadExcel = () => {
  if (!filteredWorkOrders.length) {
    toast.warning("No filtered work orders available.");
    return;
  }

  const sheetData = [
    ["WO Number", "Title", "Status", "Priority", "Assigned To", "Issue Date", "Expected Date","WO Amount",
    "Invoiced Amount",
    "Exceeded Amount",]
  ];

  filteredWorkOrders.forEach((wo) => {
    sheetData.push([
      wo.wo_number,
      wo.title || "-",
      wo.status,
      wo.priority,
      wo.assignedBranch?.name || "-",
      wo.issue_date ? new Date(wo.issue_date).toLocaleDateString() : "-",
      wo.expected_date ? new Date(wo.expected_date).toLocaleDateString() : "-",
        formatAmount(wo.work_order_amount),
  formatAmount(wo.total_invoiced_amount),
  formatAmount(wo.excess_amount),
    ]);
  });

  const ws = XLSX.utils.aoa_to_sheet(sheetData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Filtered Work Orders");
  XLSX.writeFile(wb, "Filtered_WorkOrders.xlsx");
};


const handleDownloadPDF = () => {
  if (!filteredWorkOrders.length) {
    toast.warning("No filtered work orders available.");
    return;
  }

  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text("Filtered Work Orders Report", 14, 15);

  const tableColumn = ["WO Number", "Title", "Status", "Priority", "Assigned To", "Issue Date", "Expected Date", "WO Amount",
  "Invoiced Amount",
  "Exceeded Amount",];
  const tableRows = filteredWorkOrders.map((wo) => [
    wo.wo_number,
    wo.title || "-",
    wo.status,
    wo.priority,
    wo.assignedBranch?.name || "-",
    wo.issue_date ? new Date(wo.issue_date).toLocaleDateString() : "-",
    wo.expected_date ? new Date(wo.expected_date).toLocaleDateString() : "-",
      formatAmount(wo.work_order_amount),
  formatAmount(wo.total_invoiced_amount),
  formatAmount(wo.excess_amount),
  ]);

  autoTable(doc, { head: [tableColumn], body: tableRows, startY: 25, styles: { fontSize: 9 } });
  doc.save("Filtered_WorkOrders.pdf");
};


const handlePreview = () => {
  if (!filteredWorkOrders.length) {
    toast.warning("No filtered work orders available for preview.");
    return;
  }

  const data = filteredWorkOrders.map((wo) => ({
    wo_number: wo.wo_number,
    title: wo.title || "-",
    status: wo.status,
    priority: wo.priority,
    assigned_to: wo.assignedBranch?.name || "-",
    issue_date: wo.issue_date ? new Date(wo.issue_date).toLocaleDateString() : "-",
    expected_date: wo.expected_date ? new Date(wo.expected_date).toLocaleDateString() : "-",
      work_order_amount: formatAmount(wo.work_order_amount),
  total_invoiced_amount: formatAmount(wo.total_invoiced_amount),
  excess_amount: formatAmount(wo.excess_amount),
  }));

  setPreviewData(data);
  setShowPreviewModal(true);
};


  const startIndex = (currentPage - 1) * entriesPerPage;
  const pageCount = Math.ceil(filteredWorkOrders.length / entriesPerPage);
  const paginatedWorkOrders = filteredWorkOrders.slice(
    startIndex,
    startIndex + entriesPerPage
  );

  const handleBulkDelete = () => {
  if (selectedIds.length === 0) return;

  ConfirmDeleteModal({
    title: "Delete Selected Work Orders",
    message: `You are about to delete ${selectedIds.length} work order(s). This action cannot be undone.`,
    iconColor: "#ff0000",
    onConfirm: async () => {
      try {
        await Promise.all(selectedIds.map((id) => workOrderService.deleteWorkOrder(id)));
        toast.success(`${selectedIds.length} Work Order(s) deleted successfully`);
        setSelectedIds([]);
        fetchWorkOrders();
      } catch (err) {
        console.error(err);
        toast.error("Failed to delete selected work orders");
      }
    },
  });
};

  return (
    <div className="container-fluid py-3 my-4">
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap">
        <div>
          <h4 className="mb-1">Work Orders</h4>
          <BreadCrumb pathname={location?.pathname || ""} lastLabel="Work Orders" />
        </div>
        <div className="d-flex align-items-center gap-2">
<OverlayTrigger placement="top" overlay={<Tooltip>Add New Work Order</Tooltip>}>
  <Button size="sm" variant="success" className="rounded-1 px-3 py-2" onClick={() => handleShowModal()}>
    <Plus />
  </Button>
</OverlayTrigger>
</div>
      </div>
      {/* Filter Section */}
      <Card className="p-4 shadow-sm mb-3">
        <Row className="g-3 align-items-end justify-content-end">
          <Col md={2}>
            <Form.Group>
              <Form.Label>Status</Form.Label>
              <Form.Select name="status" value={filters.status} onChange={handleFilterChange}>
                <option value="">All</option>
                <option value="Open">Open</option>
                <option value="Completed">Completed</option>
                <option value="In Progress">In Progress</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={2}>
  <Form.Group>
    <Form.Label>Priority</Form.Label>
    <Form.Select name="priority" value={filters.priority} onChange={handleFilterChange}>
      <option value="">All</option>
      {/* <option value="Emergency">Emergency</option> */}
      <option value="High">High</option>
      <option value="Medium">Medium</option>
      <option value="Low">Low</option>
    </Form.Select>
  </Form.Group>
</Col>
          <Col md={2}>
            <Form.Group>
              <Form.Label>Assigned Site</Form.Label>
              <Form.Select
                name="assigned_to"
                value={filters.assigned_to}
                onChange={handleFilterChange}
              >
                <option value="">All</option>
                {[...new Set(workOrders.map((wo) => wo.assignedBranch?.name))].map(
                  (branch, i) => (
                    <option key={i} value={branch}>
                      {branch}
                    </option>
                  )
                )}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={2}>
            <Form.Group>
              <Form.Label>Issue Date</Form.Label>
              <Form.Control
                type="date"
                name="issue_date"
                value={filters.issue_date}
                onChange={handleFilterChange}
              />
            </Form.Group>
          </Col>
          <Col md={2}>
            <Form.Group>
              <Form.Label>Expected Date</Form.Label>
              <Form.Control
                type="date"
                name="expected_date"
                value={filters.expected_date}
                onChange={handleFilterChange}
              />
            </Form.Group>
          </Col>
          <Col md={2} className="d-flex">        

<OverlayTrigger overlay={<Tooltip>Preview Work Orders</Tooltip>}>
  <Button size="sm" variant="info" onClick={handlePreview}>
    <VscPreview />
  </Button>
</OverlayTrigger>
<OverlayTrigger overlay={<Tooltip>Download Excel</Tooltip>}>
  <Dropdown>
    <Dropdown.Toggle size="sm" variant="success" className="me-2">
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
<OverlayTrigger placement="top" overlay={<Tooltip>Reset Filters</Tooltip>}>
<Button
  size="sm"
  variant="danger"
  onClick={() => {
    const reset = {
      status: "",
      priority: "",
      assigned_to: "",
      issue_date: "",
      expected_date: "",
    };
    setFilters(reset);
    localStorage.setItem("woFilters", JSON.stringify(reset));
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
    Viewing <strong>Draft Work Orders</strong> — only unsent or pending entries are displayed.
  </div>
)}
      {/* Table */}
      <Card className="p-4 shadow-sm">
        <Row className="mb-5 justify-content-between">
          <Col md={2}>
            <Form.Select
              value={entriesPerPage}
              onChange={(e) => {
                setEntriesPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </Form.Select>
          </Col>
          <Col md={4} className="d-flex justify-content-end mb-3">
  <OverlayTrigger
    placement="top"
    overlay={
      <Tooltip id="tooltip-toggle">
        {showDrafts ? "View All Work Orders" : "View Draft Work Orders"}
      </Tooltip>
    }
  >
    <Button
      size="sm"
      variant={showDrafts ? "secondary" : "primary"}
      className="rounded-1 d-flex align-items-center gap-1"
onClick={async () => {
  if (!showDrafts) {
    const drafts = JSON.parse(localStorage.getItem("woDrafts") || "[]");
    setWorkOrders(drafts);
    toast.success("Showing draft work orders");
  } else {
    fetchWorkOrders();
    toast.success("Showing all work orders");
  }

  const newShowDrafts = !showDrafts;
  setShowDrafts(newShowDrafts);
  localStorage.setItem("woShowDrafts", JSON.stringify(newShowDrafts));
}}

    >
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
  </OverlayTrigger>
  
{/* <OverlayTrigger placement="top" overlay={<Tooltip>Delete Selected</Tooltip>}>
  <Button
    size="sm"
    variant="danger"
    className="rounded-1 ms-2 px-3 py-2"
    disabled={selectedIds.length === 0}
    onClick={handleBulkDelete}
  >
    <i className="bi bi-trash"></i>
  </Button>
</OverlayTrigger> */}
</Col>

        </Row>

<div className="table-responsive">
  {showDrafts ? (
    <DraftWorkOrdersTable />
  ) : (
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
          <th>WO Amount</th>
<th>Invoiced Amount</th>
<th>Exceeded Amount</th>
          <th>Actions</th>
    {/* <th>
      <Form.Check
        type="checkbox"
        onChange={(e) =>
          setSelectedIds(
            e.target.checked ? paginatedWorkOrders.map((wo) => wo.id) : []
          )
        }
        checked={
          paginatedWorkOrders.length > 0 &&
          selectedIds.length === paginatedWorkOrders.length
        }
      />
    </th> */}
        </tr>
      </thead>
      <tbody className="text-center">
        {paginatedWorkOrders.length > 0 ? (
          paginatedWorkOrders.map((wo, index) => (
            <React.Fragment key={wo.id}>
              <tr>
                <td>{startIndex + index + 1}</td>
                <td>
                  <Button
                    variant="outline-success"
                    className="px-3 py-2"
                    onClick={() => navigate(`/works/orders/${wo.id}`)}
                  >
                    {wo.wo_number} 
                  </Button>
                </td>
                <td>
<Badge
  bg={
    wo.status === "Open"
      ? "info"
      : wo.status === "In Progress"
      ? "warning"
      : wo.status === "Paid"
      ? "success"
      : "secondary"
  }
  className="text-capitalize"
>
  {wo.status}
</Badge>

                </td>
                <td>
                  <Badge
                    bg={
                      wo.priority === "Emergency"
                        ? "danger"
                        : wo.priority === "High"
                        ? "danger"
                        : wo.priority === "Medium"
                        ? "warning"
                        : "secondary"
                    }
                  >
                    {wo.priority}
                  </Badge>
                </td>
                {/* <td>{wo.assignedBranch?.name || "-"}</td> */}
                <td style={{ whiteSpace: "normal", wordBreak: "break-word", maxWidth: "150px" }}>
  {wo.assignedBranch?.name || "-"}
</td>

                <td>{wo.issue_date ? new Date(wo.issue_date).toLocaleDateString() : "-"}</td>
                <td>{wo.expected_date ? new Date(wo.expected_date).toLocaleDateString() : "-"}</td>
    <td>{formatAmount(wo.work_order_amount)}</td>

<td>
  <span className="fw-semibold text-primary">
    {formatAmount(wo.total_invoiced_amount)}
  </span>
</td>

<td
  className={Number(wo.excess_amount) > 0 ? "text-danger fw-semibold" : "text-muted"}
>
  {formatAmount(wo.excess_amount)}
</td>



                      <td>
<OverlayTrigger placement="top" overlay={<Tooltip>View Work Order</Tooltip>}>
  <Button
    size="sm"
    variant="warning"
    className="me-2"
    onClick={() => navigate(`/works/orders/${wo.id}`)}
  >
    <i className="bi bi-eye text-white"></i>
  </Button>
</OverlayTrigger>
<OverlayTrigger placement="top" overlay={<Tooltip>View Documents</Tooltip>}>
  <Button
    size="sm"
    variant="secondary"
    onClick={() => handleViewDocuments(wo.document)}
  >
    <i className="bi bi-file-earmark-richtext"></i>
  </Button>
</OverlayTrigger>


<OverlayTrigger placement="top" overlay={<Tooltip>Edit Work Order</Tooltip>}>
  <Button
    size="sm"
    variant="info"
    className="me-2"
    onClick={() => handleShowModal(wo)}
  >
    <i className="bi bi-pencil text-white"></i>
  </Button>
</OverlayTrigger>
<OverlayTrigger placement="top" overlay={<Tooltip>Delete Work Order</Tooltip>}>
  <Button
    variant="danger"
    size="sm"
    className="me-2"
    onClick={() => handleDelete(wo.id)}
  >
    <i className="bi bi-trash text-white"></i>
  </Button>
</OverlayTrigger>

                      </td>
  {/* <td>
    <Form.Check
      type="checkbox"
      checked={selectedIds.includes(wo.id)}
      onChange={(e) => {
        if (e.target.checked) {
          setSelectedIds((prev) => [...prev, wo.id]);
        } else {
          setSelectedIds((prev) => prev.filter((id) => id !== wo.id));
        }
      }}
    />
  </td> */}
              </tr>
            </React.Fragment>
          ))
        ) : (
          <tr>
            <td colSpan="12" className="text-center text-muted">No work orders found.</td>
          </tr>
        )}
      </tbody>
    </Table>
  )}
</div>

<div className="d-flex justify-content-between align-items-center mt-3 flex-wrap">
  <p className="mb-0 small text-muted">
    Showing {filteredWorkOrders.length ? startIndex + 1 : 0} to{" "}
    {Math.min(startIndex + entriesPerPage, filteredWorkOrders.length)} of {filteredWorkOrders.length} entries
  </p>

  <ul className="pagination pagination-sm mb-0" style={{ gap: "0", justifyContent: "end", alignItems:'center' }}>
    <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
      <button className="page-link" onClick={() => setCurrentPage((p) => p - 1)}>
        &laquo;
      </button>
    </li>
    {Array.from({ length: pageCount }, (_, i) => i + 1).map((page) => (
      <li key={page} className={`page-item ${currentPage === page ? "active" : ""}`}>
        <button className="page-link" onClick={() => setCurrentPage(page)}>
          {page}
        </button>
      </li>
    ))}
    <li className={`page-item ${currentPage === pageCount || pageCount === 0 ? "disabled" : ""}`}>
      <button className="page-link" onClick={() => setCurrentPage((p) => p + 1)}>
        &raquo;
      </button>
    </li>
  </ul>
</div>

      </Card>
      <ViewDocumentsModal
  show={showDocsModal}
  onHide={() => setShowDocsModal(false)}
  docs={currentDocs}
  currentIndex={currentDocIndex}
  setCurrentIndex={setCurrentDocIndex}
/>
      <WorkOrderModal
        show={showModal}
        onHide={() => setShowModal(false)}
        formData={formData}
        setFormData={setFormData}
        selectedWorkOrder={selectedWorkOrder}
        handleSave={handleSave}
      />
      <PreviewWorkOrdersModal
        show={showPreviewModal}
        onHide={() => setShowPreviewModal(false)}
        data={previewData}
        handleDownloadExcel = {handleDownloadExcel}
        handleDownloadPDF = {handleDownloadPDF}
      />
    </div>
  );
};

export default WorkOrders;
