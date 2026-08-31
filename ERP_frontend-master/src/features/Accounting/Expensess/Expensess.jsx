import React, { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Table,
  Button,
  Row,
  Col,
  Card,
  Form,
  Badge,
  Dropdown,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import { Plus, Download } from "react-bootstrap-icons";
import expenseService from "../../../services/expensessService";
import { toast } from "react-toastify";
import branchService from "../../../services/branchService";
import categoryService from "../../../services/expenseCategory";
import BreadCrumb from "../../../components/BreadCrumb";
import ConfirmDeleteModal from "../../../components/ConfirmDeleteModal";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Select from "react-select";
import EditExpenseModal from "./EditExpenseModal";
import ViewExpenseModal from "./ViewExpensedetails";
import PdfViewerModal from "./PdfViewerModal";
import PreviewExpenseModal from "./PreviewModal";

const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  if (typeof dateStr === "string") {
    const raw = dateStr.split("T")[0];
    const parts = raw.split("-");
    if (parts.length === 3) {
      const [year, month, day] = parts;
      if (year.length === 4) {
        return `${day.padStart(2, "0")}/${month.padStart(2, "0")}/${year}`;
      }
    }
  }
  const d = new Date(dateStr);
  return Number.isNaN(d.getTime()) ? "-" : d.toLocaleDateString("en-GB");
};

const formatINR = (value) => {
  return Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const recalculateExpenseTotals = (exp) => {
  let subtotalBase = 0;
  let taxTotal = 0;
  let totalAmount = 0;

  if (exp.items && exp.items.length > 0) {
    exp.items.forEach((item) => {
      const sub = parseFloat(item.subtotal || 0);
      const rate = parseFloat(item.tax_rate || 0);

      if (!item.is_taxable) {
        subtotalBase += sub;
        totalAmount += sub;
      } else {
        if (item.tax_type === "exclusive") {
          const tax = sub * (rate / 100);
          subtotalBase += sub;
          taxTotal += tax;
          totalAmount += sub + tax;
        } else {
          // inclusive
          const tax = sub * (rate / (100 + rate));
          subtotalBase += sub - tax;
          taxTotal += tax;
          totalAmount += sub;
        }
      }
    });
  } else {
    subtotalBase = parseFloat(exp.subtotal || 0);
    taxTotal = parseFloat(exp.tax_total || 0);
    totalAmount = parseFloat(exp.total_amount || 0);
  }

  return {
    subtotalBase,
    taxTotal,
    totalAmount,
  };
};

const Expenses = () => {
  const BASE_URL = import.meta.env.VITE_BASE_URL;
  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [branches, setBranches] = useState([]);
  const [categories, setCategories] = useState([]);

  // Modals
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewData, setPreviewData] = useState([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  // Filters
  const [taxableFilter, setTaxableFilter] = useState("all");
  const [siteFilter, setSiteFilter] = useState("");
  const [paymentHeadFilter, setPaymentHeadFilter] = useState("");
  const [vendorSearch, setVendorSearch] = useState("");
  const [dateFilterType, setDateFilterType] = useState("all");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [dateFilterBasis, setDateFilterBasis] = useState("billDate");

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const response = await expenseService.getAllExpenses();
      if (response?.success) {
        setExpenses(response.data || []);
      } else {
        toast.error("Failed to fetch expenses");
      }
    } catch (error) {
      console.error("Error fetching expenses:", error);
      toast.error("Failed to fetch expenses");
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdownData = async () => {
    try {
      const [branchList, categoryList] = await Promise.all([
        branchService.getAll(),
        categoryService.getAllCategories(),
      ]);
      setBranches(branchList || []);
      setCategories(categoryList || []);
    } catch (err) {
      console.error("Error fetching dropdowns:", err);
    }
  };

  useEffect(() => {
    fetchExpenses();
    fetchDropdownData();
  }, []);

  const getSiteId = (exp) => {
    return exp.branch_id || exp.branch?.id || "";
  };

  const getSiteName = (exp) => {
    const siteId = getSiteId(exp);
    const branch = branches.find((b) => String(b.id) === String(siteId));
    return (
      branch?.name ||
      exp.branch?.name ||
      exp.branch_name ||
      exp.site_name ||
      "-"
    );
  };

  const getPaymentHeadName = (exp) => {
    const cat = categories.find((c) => String(c.id) === String(exp.category_id));
    return cat ? cat.name : exp.category?.name || "-";
  };

  const getVendorName = (exp) => {
    return exp.vendor_name || exp.description || "-";
  };

  const getItemName = (exp) => {
    if (exp.items && exp.items.length > 0) {
      const names = exp.items.map((it) => it.item_name).filter(Boolean);
      if (names.length > 0) return names.join(", ");
    }
    return "-";
  };

  const handleDeleteExpense = (expenseId) => {
    ConfirmDeleteModal({
      title: "Delete Non-GST Purchase",
      message:
        "Are you sure you want to delete this purchase? This action cannot be undone.",
      iconColor: "#dc3545",
      onConfirm: async () => {
        try {
          await expenseService.deleteExpense(expenseId);
          toast.success("Non-GST Purchase deleted successfully!");
          fetchExpenses();
        } catch (error) {
          toast.error(error.message || "Failed to delete expense");
        }
      },
    });
  };

  // Filtering
  const filteredExpenses = useMemo(() => {
    return expenses.filter((exp) => {
      // 1. Taxable filter
      if (taxableFilter === "taxable") {
        if (!exp.items || !exp.items.some((i) => i.is_taxable)) return false;
      } else if (taxableFilter === "non-taxable") {
        if (exp.items && exp.items.some((i) => i.is_taxable)) return false;
      }

      // 2. Site filter
      if (siteFilter) {
        const siteId = getSiteId(exp);
        if (!siteId || String(siteId) !== String(siteFilter)) return false;
      }

      // 3. Payment Head filter
      if (paymentHeadFilter) {
        if (!exp.category_id || String(exp.category_id) !== String(paymentHeadFilter))
          return false;
      }

      // 4. Date filter
      if (dateFilterType !== "all") {
        const filterDateVal =
          dateFilterBasis === "billDate"
            ? exp.actual_bill_date || exp.payment_date || exp.created_at || exp.createdAt
            : exp.created_at || exp.createdAt || exp.payment_date || exp.actual_bill_date;

        if (!filterDateVal) return false;
        const entryDate = new Date(filterDateVal);

        if (dateFilterType === "daily" && selectedDate) {
          if (filterDateVal?.slice(0, 10) !== selectedDate) return false;
        }

        if (dateFilterType === "monthly" && selectedMonth) {
          const month = (entryDate.getMonth() + 1).toString().padStart(2, "0");
          if (month !== selectedMonth) return false;
        }

        if (dateFilterType === "custom" && startDate && endDate) {
          const start = new Date(startDate);
          const end = new Date(endDate);
          if (entryDate < start || entryDate > end) return false;
        }
      }

      // 5. Vendor search
      if (vendorSearch) {
        const vendor = getVendorName(exp).toLowerCase();
        if (!vendor.includes(vendorSearch.toLowerCase()))
          return false;
      }

      return true;
    });
  }, [
    expenses,
    taxableFilter,
    siteFilter,
    paymentHeadFilter,
    dateFilterType,
    dateFilterBasis,
    selectedDate,
    selectedMonth,
    startDate,
    endDate,
    vendorSearch,
  ]);

  const sortedExpenses = useMemo(() => {
    return [...filteredExpenses].sort((a, b) => {
      const dateAVal =
        dateFilterBasis === "billDate"
          ? a.actual_bill_date || a.payment_date || a.created_at || a.createdAt
          : a.created_at || a.createdAt || a.payment_date || a.actual_bill_date;
      const dateBVal =
        dateFilterBasis === "billDate"
          ? b.actual_bill_date || b.payment_date || b.created_at || b.createdAt
          : b.created_at || b.createdAt || b.payment_date || b.actual_bill_date;

      const dateA = new Date(dateAVal || 0);
      const dateB = new Date(dateBVal || 0);
      return dateB - dateA;
    });
  }, [filteredExpenses, dateFilterBasis]);

  // Pagination slice
  const indexOfLast = currentPage * entriesPerPage;
  const indexOfFirst = indexOfLast - entriesPerPage;
  const currentExpenses = sortedExpenses.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(sortedExpenses.length / entriesPerPage) || 1;

  // Exports
  const handleDownloadExcel = () => {
    if (sortedExpenses.length === 0) {
      toast.warning("No data to export");
      return;
    }

    const exportRows = sortedExpenses.map((exp) => {
      const { subtotalBase, totalAmount } = recalculateExpenseTotals(exp);
      return {
        "Transaction Date": formatDate(exp.created_at || exp.createdAt || exp.payment_date),
        Site: getSiteName(exp),
        Vendor: getVendorName(exp),
        "Sub Total (₹)": subtotalBase.toFixed(2),
        "Total Amount (₹)": totalAmount.toFixed(2),
        "Bill Date": formatDate(exp.actual_bill_date || exp.payment_date),
        "Supply Type": exp.type_of_supply_or_service || "-",
        Status: exp.payments_status || "paid",
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Non-GST Purchases");
    XLSX.writeFile(workbook, "Non_GST_Purchases_Report.xlsx");
    toast.success("Excel report downloaded");
  };

  const handleDownloadPDF = () => {
    if (sortedExpenses.length === 0) {
      toast.warning("No data to export");
      return;
    }

    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("Non-GST Purchases Report", 14, 15);

    const columns = [
      "Date",
      "Site",
      "Vendor",
      "Total",
      "Bill Date",
      "Supply Type",
      "Status",
    ];

    const rows = sortedExpenses.map((exp) => {
      const { totalAmount } = recalculateExpenseTotals(exp);
      return [
        formatDate(exp.created_at || exp.createdAt || exp.payment_date),
        getSiteName(exp),
        getVendorName(exp),
        totalAmount.toFixed(2),
        formatDate(exp.actual_bill_date || exp.payment_date),
        exp.type_of_supply_or_service || "-",
        exp.payments_status || "paid",
      ];
    });

    autoTable(doc, {
      head: [columns],
      body: rows,
      startY: 20,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [25, 135, 84] },
    });

    doc.save("Non_GST_Purchases_Report.pdf");
    toast.success("PDF report downloaded");
  };

  return (
    <div className="container-fluid py-3 my-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap">
        <div>
          <h4>Non-GST Purchases</h4>
          <BreadCrumb pathname="/accounting/expenses" dynamicNames={{ expenses: "Expenses" }} />
        </div>
        <OverlayTrigger overlay={<Tooltip>Add New Non-GST Purchase</Tooltip>}>
          <Button
            size="md"
            variant="success"
            onClick={() => navigate("/accounting/expensess/create")}
          >
            <Plus size={20} />
          </Button>
        </OverlayTrigger>
      </div>

      <Card className="p-4 shadow-sm">
        {/* Controls and Filter Bar */}
        <Row className="align-items-center justify-content-between mb-4 flex-wrap g-2">
          {/* Entries per page */}
          <Col md="auto">
            <Form.Select
              value={entriesPerPage}
              onChange={(e) => {
                setEntriesPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              style={{ width: "90px" }}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </Form.Select>
          </Col>

          {/* Filters */}
          <Col md="auto" className="ms-auto d-flex align-items-center flex-wrap gap-2">
            <Form.Select
              value={taxableFilter}
              onChange={(e) => {
                setTaxableFilter(e.target.value);
                setCurrentPage(1);
              }}
              style={{ width: "130px" }}
            >
              <option value="all">All</option>
              <option value="taxable">Taxable</option>
              <option value="non-taxable">Non-Taxable</option>
            </Form.Select>

            <Form.Select
              value={dateFilterBasis}
              onChange={(e) => {
                setDateFilterBasis(e.target.value);
                setCurrentPage(1);
              }}
              style={{ width: "130px" }}
            >
              <option value="billDate">Bill Date</option>
              <option value="entryDate">Entry Date</option>
            </Form.Select>

            <Form.Select
              value={dateFilterType}
              onChange={(e) => {
                setDateFilterType(e.target.value);
                setSelectedDate("");
                setSelectedMonth("");
                setStartDate("");
                setEndDate("");
                setCurrentPage(1);
              }}
              style={{ width: "140px" }}
            >
              <option value="all">All Dates</option>
              <option value="daily">Daily</option>
              <option value="monthly">Monthly</option>
              <option value="custom">Custom Range</option>
            </Form.Select>

            {dateFilterType === "daily" && (
              <Form.Control
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setCurrentPage(1);
                }}
                style={{ width: "150px" }}
              />
            )}

            {dateFilterType === "monthly" && (
              <Form.Select
                value={selectedMonth}
                onChange={(e) => {
                  setSelectedMonth(e.target.value);
                  setCurrentPage(1);
                }}
                style={{ width: "150px" }}
              >
                <option value="">Select Month</option>
                <option value="01">January</option>
                <option value="02">February</option>
                <option value="03">March</option>
                <option value="04">April</option>
                <option value="05">May</option>
                <option value="06">June</option>
                <option value="07">July</option>
                <option value="08">August</option>
                <option value="09">September</option>
                <option value="10">October</option>
                <option value="11">November</option>
                <option value="12">December</option>
              </Form.Select>
            )}

            {dateFilterType === "custom" && (
              <div className="d-flex gap-1">
                <Form.Control
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  style={{ width: "140px" }}
                />
                <Form.Control
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  style={{ width: "140px" }}
                />
              </div>
            )}

            {/* Site search */}
            <div style={{ minWidth: "180px" }}>
              <Select
                value={
                  [
                    { value: "", label: "All Sites" },
                    ...branches.map((b) => ({ value: b.id, label: b.name })),
                  ].find((opt) => String(opt.value) === String(siteFilter)) || {
                    value: "",
                    label: "All Sites",
                  }
                }
                onChange={(selected) => {
                  setSiteFilter(selected ? selected.value : "");
                  setCurrentPage(1);
                }}
                options={[
                  { value: "", label: "All Sites" },
                  ...branches.map((b) => ({ value: b.id, label: b.name })),
                ]}
                isSearchable={true}
                placeholder="Search Site"
              />
            </div>

            {/* Payment Head dropdown */}
            <Form.Select
              value={paymentHeadFilter}
              onChange={(e) => {
                setPaymentHeadFilter(e.target.value);
                setCurrentPage(1);
              }}
              style={{ minWidth: "180px" }}
            >
              <option value="">All Payment Heads</option>
              {categories.map((head) => (
                <option key={head.id} value={head.id}>
                  {head.name}
                </option>
              ))}
            </Form.Select>

            {/* Vendor search */}
            <Form.Control
              type="text"
              placeholder="Search Vendor..."
              value={vendorSearch}
              onChange={(e) => {
                setVendorSearch(e.target.value);
                setCurrentPage(1);
              }}
              style={{ maxWidth: "160px", height: "38px" }}
            />

            {/* Export Dropdown */}
            <Dropdown>
              <Dropdown.Toggle size="sm" variant="success">
                <Download className="me-1" /> Export
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={handleDownloadExcel}>Download Excel</Dropdown.Item>
                <Dropdown.Item onClick={handleDownloadPDF}>Download PDF</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Col>
        </Row>

        {/* Detailed Transactions Table */}
        <div className="table-responsive">
          <Table hover striped className="text-center">
            <thead className="table-light">
              <tr>
                <th>Transaction Date</th>
                <th>Site</th>
                <th>Vendor</th>
                <th>Total Amount (₹)</th>
                <th>Bill Date</th>
                <th>Supply Type</th>
                <th>Payment Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center align-middle" style={{ height: "200px" }}>
                    <div className="d-flex justify-content-center align-items-center h-100">
                      <div className="spinner-border text-success" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : currentExpenses.length > 0 ? (
                currentExpenses.map((exp) => {
                  const { totalAmount } = recalculateExpenseTotals(exp);
                  const rowDocuments =
                    exp.items?.filter((item) => item.document || item.document_url).map((item) => item.document || item.document_url) || [];

                  return (
                    <tr key={exp.id}>
                      <td>{formatDate(exp.created_at || exp.createdAt || exp.payment_date)}</td>
                      <td
                        style={{
                          maxWidth: "180px",
                          whiteSpace: "normal",
                          wordBreak: "break-word",
                          overflowWrap: "break-word",
                        }}
                      >
                        {getSiteName(exp)}
                      </td>
                      <td
                        style={{
                          maxWidth: "180px",
                          whiteSpace: "normal",
                          wordBreak: "break-word",
                          overflowWrap: "break-word",
                        }}
                      >
                        {getVendorName(exp)}
                      </td>
                      <td className="fw-semibold">₹{formatINR(totalAmount)}</td>
                      <td>{formatDate(exp.actual_bill_date || exp.payment_date)}</td>
                      <td>{exp.type_of_supply_or_service || "-"}</td>
                      <td>
                        <Badge bg={exp.payments_status?.toLowerCase() === "paid" ? "success" : "warning"}>
                          {exp.payments_status || "paid"}
                        </Badge>
                      </td>
                      <td>
                        <div className="d-flex align-items-center justify-content-center gap-2 text-nowrap">
                          {/* View Details */}
                          <OverlayTrigger placement="top" overlay={<Tooltip>View Details</Tooltip>}>
                            <Button
                              size="sm"
                              variant="warning"
                              onClick={() => {
                                setSelectedExpense(exp);
                                setShowViewModal(true);
                              }}
                            >
                              <i className="bi bi-eye text-white"></i>
                            </Button>
                          </OverlayTrigger>

                          {/* View Documents */}
                          {(rowDocuments.length > 0 || exp.document) && (
                            <OverlayTrigger placement="top" overlay={<Tooltip>View Documents</Tooltip>}>
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => {
                                  const docs = rowDocuments.length > 0 ? rowDocuments : [exp.document];
                                  setSelectedExpense({ ...exp, documents: docs });
                                  setShowPdfModal(true);
                                }}
                              >
                                <i className="bi bi-file-earmark-richtext"></i>
                              </Button>
                            </OverlayTrigger>
                          )}

                          {/* Edit Expense */}
                          {(user?.type === "company" ||
                            user?.type === "Accountant" ||
                            user?.type === "Branch Manager") && (
                            <OverlayTrigger placement="top" overlay={<Tooltip>Edit Purchase</Tooltip>}>
                              <Button
                                size="sm"
                                variant="info"
                                onClick={() => {
                                  navigate(`/accounting/expensess/edit/${exp.id}`, {
                                    state: {
                                      expenseId: exp.id,
                                      branchId: getSiteId(exp),
                                    },
                                  });
                                }}
                              >
                                <i className="bi bi-pencil text-white"></i>
                              </Button>
                            </OverlayTrigger>
                          )}

                          {/* Delete Expense */}
                          {(user?.type === "company" ||
                            user?.type === "Accountant" ||
                            user?.type === "Branch Manager") && (
                            <OverlayTrigger placement="top" overlay={<Tooltip>Delete Purchase</Tooltip>}>
                              <Button
                                size="sm"
                                variant="danger"
                                onClick={() => handleDeleteExpense(exp.id)}
                              >
                                <i className="bi bi-trash text-white"></i>
                              </Button>
                            </OverlayTrigger>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={10} className="text-center py-4">
                    No Non-GST purchases found.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="d-flex justify-content-between align-items-center mt-3 flex-wrap g-2">
          <div className="small text-muted">
            Showing {sortedExpenses.length > 0 ? indexOfFirst + 1 : 0} to{" "}
            {Math.min(indexOfLast, sortedExpenses.length)} of {sortedExpenses.length} entries
          </div>
          <div>
            <ul className="pagination pagination-sm mb-0">
              <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                <button className="page-link" onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}>
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
                    <li key={page} className={`page-item ${currentPage === page ? "active" : ""}`}>
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
                >
                  &raquo;
                </button>
              </li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Modals */}
      <ViewExpenseModal
        show={showViewModal}
        onHide={() => setShowViewModal(false)}
        expense={selectedExpense}
        branchName={selectedExpense ? getSiteName(selectedExpense) : ""}
        BASE_URL={BASE_URL}
        getCategoryName={(catId) => {
          const cat = categories.find((c) => String(c.id) === String(catId));
          return cat ? cat.name : "-";
        }}
      />

      <EditExpenseModal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        expense={editingExpense}
        onUpdated={() => {
          setShowEditModal(false);
          fetchExpenses();
        }}
      />

      <PdfViewerModal
        show={showPdfModal}
        onHide={() => setShowPdfModal(false)}
        documents={selectedExpense?.documents || []}
      />
    </div>
  );
};

export default Expenses;
