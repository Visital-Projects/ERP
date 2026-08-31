import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Table,
  Button,
  Row,
  Col,
  Card,
  Form,
  Modal,
  Badge,
  Dropdown,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import { Plus, Download } from "react-bootstrap-icons";
import creditPurchaseService from "../../../services/expensessService";
import { toast } from "react-toastify";
import branchService from "../../../services/branchService";
import categoryService from "../../../services/expenseCategory";
import CreditPurchaseModal from "./CreditPurchaseModal";
import ViewCredDocumentsModal from "./ViewCredDocumentsModal";
import BreadCrumb from "../../../components/BreadCrumb";
import ConfirmDeleteModal from "../../../components/ConfirmDeleteModal";
import { redirectToRepresentativeBranchWallet } from "../Banking/walletAccountingHelpers";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import PreviewCreditPurchaseModal from "./PreviewCreditPurchaseModal";
import { VscPreview } from "react-icons/vsc";
import Select from "react-select";
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

const CreditPurchase = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [creditPurchases, setCreditPurchases] = useState([]);
  const [loading, setLoading] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));
  const [branches, setBranches] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showDocsModal, setShowDocsModal] = useState(false);
  const [currentDocuments, setCurrentDocuments] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  // Filters
  const [taxableFilter, setTaxableFilter] = useState("all");
  const [siteFilter, setSiteFilter] = useState("");
  const [paymentHeadFilter, setPaymentHeadFilter] = useState("");
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewData, setPreviewData] = useState([]);
  const [vendorSearch, setVendorSearch] = useState("");

const [dateFilterType, setDateFilterType] = useState("all");
const [selectedDate, setSelectedDate] = useState("");
const [selectedMonth, setSelectedMonth] = useState("");
const [startDate, setStartDate] = useState("");
const [endDate, setEndDate] = useState("");
const [prefillData, setPrefillData] = useState(null);
const [fromWallet, setFromWallet] = useState(false);
const [dateFilterBasis, setDateFilterBasis] = useState("billDate");

  const fetchCreditPurchases = async () => {
    setLoading(true);
    try {
      const response = await creditPurchaseService.getAllCreditPurchases();
      if (response.success) {
        setCreditPurchases(response.data || []);
      } else {
        toast.error("Failed to fetch credit purchases");
      }
    } catch (error) {
      console.error("Error fetching credit purchases:", error);
      toast.error("Failed to fetch credit purchases");
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
      setBranches(branchList);
      setCategories(categoryList);
    } catch (err) {
      console.error(err);
    }
  };

const handleStatusToggle = async (purchase) => {
  try {
    const currentStatus = String(purchase?.payment_status || "pending").toLowerCase();
    const newStatus = currentStatus === "pending" ? "Paid" : "Pending";

    const formData = new FormData();
    formData.append("payment_status", newStatus);

    const response = await creditPurchaseService.payCreditPurchase(purchase.id, formData);

    if (newStatus === "Paid") {
      toast.success("Status updated to Paid");
      const targetBranchId =
        response?.data?.creditPurchase?.branch_id ||
        response?.data?.branch_id ||
        getSiteId(purchase);

      if (targetBranchId) {
        await redirectToRepresentativeBranchWallet(targetBranchId, navigate, {
          toastInstance: toast,
          fallbackRoute: null,
        });
        return;
      } else {
        toast.warning("Could not identify the site for this purchase.");
      }
    } else {
      toast.warning("Status updated to Pending");
    }

    fetchCreditPurchases(); // refresh table
  } catch (err) {
    console.error("Status update failed:", err);
    toast.error(err.message || "Failed to update status");
  }
};

const handleDeleteCreditPurchase = (purchaseId) => {
  ConfirmDeleteModal({
    title: "Delete Credit Purchase",
    message: "Are you sure you want to delete this credit purchase? This action cannot be undone.",
    iconColor: "#dc3545",
    onConfirm: async () => {
      try {
        await creditPurchaseService.deleteCreditPurchase(purchaseId);
        toast.success("Credit purchase deleted successfully!");
        fetchCreditPurchases();
      } catch (error) {
        toast.error(error.message || "Failed to delete credit purchase");
      }
    },
  });
};

  useEffect(() => {
    fetchCreditPurchases();
    fetchDropdownData();
  }, []);

  useEffect(() => {
    fetchCreditPurchases();
  }, []);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const id = queryParams.get("id");
    if (id) {
      handlePreviewCreditPurchase(id);
    }
    
    if (location.state?.openCreateModal) {
      if (location.state.fromWallet) {
        setFromWallet(true);
        setPrefillData({
          branchId: location.state.branchId,
          amount: location.state.amount,
          description: location.state.description,
          transactionDate: location.state.transactionDate
        });
      } else {
        setFromWallet(false);
        setPrefillData(null);
      }
      setEditingPurchase(null);
      setShowModal(true);
      // Clear state to avoid reopening on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.search, location.state]);

  const openCreateModal = () => {
    navigate("/accounting/expenses/credit-purchase/create");
  };

  const openEditModal = (purchase) => {
    navigate(`/accounting/expenses/credit-purchase/edit/${purchase.id}`);
  };

  // Filters
  // const filteredPurchases = creditPurchases.filter((cp) => {
  //   if (taxableFilter === "taxable") {
  //     return cp.items.some((i) => i.is_taxable);
  //   } else if (taxableFilter === "non-taxable") {
  //     return cp.items.every((i) => !i.is_taxable);
  //   }
  //   return true;
  // });

  const getSiteId = (cp) => {
  return (
    cp.purchase_order?.branch_id ||
    cp.branch_id ||
    cp.branch?.id ||
    cp.site?.id ||
    cp.branch?.branch_id ||
    ""
  );
};

const getSiteName = (cp) => {
  const siteId = getSiteId(cp);
  const branch = branches.find((b) => String(b.id) === String(siteId));
  return (
    branch?.name ||
    cp.purchase_order?.branch?.name ||
    cp.branch?.name ||
    cp.site?.name ||
    cp.branch_name ||
    cp.site_name ||
    "-"
  );
};

const getPaymentHeadName = (cp) => {
  const paymentHead = categories.find(
    (head) => String(head.id) === String(cp.category_id)
  );
  return paymentHead?.name || cp.category_name || cp.payment_head || "-";
};

const sanitizeDocPath = (doc) => {
  if (!doc) return "";
  return doc.startsWith("/") ? doc.slice(1) : doc;
};

const baseUrl =
  import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_BASE_URL;

const downloadDocument = async (doc) => {
  if (!doc) return;
  try {
    const sanitized = sanitizeDocPath(doc);
    const url = `${baseUrl}/${sanitized}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch document");
    const blob = await response.blob();
    saveAs(blob, sanitized.split("/").pop());
    toast.success("Document download started");
  } catch (error) {
    console.error("Download failed:", error);
    toast.error("Failed to download document");
  }
};

const downloadRowDocuments = async (docs = []) => {
  if (!docs.length) {
    toast.warning("No documents available to download");
    return;
  }

  if (docs.length === 1) {
    return downloadDocument(docs[0]);
  }

  try {
    const zip = new JSZip();
    for (const doc of docs) {
      const sanitized = sanitizeDocPath(doc);
      const url = `${baseUrl}/${sanitized}`;
      const response = await fetch(url);
      if (!response.ok) continue;
      const blob = await response.blob();
      zip.file(sanitized.split("/").pop(), blob);
    }

    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, "credit_purchase_documents.zip");
    toast.success("Documents downloaded as ZIP");
  } catch (error) {
    console.error("ZIP download failed:", error);
    toast.error("Failed to download documents");
  }
};

const filteredPurchases = creditPurchases.filter((cp) => {
  // 1️⃣ Taxable filter
  if (taxableFilter === "taxable") {
    if (!cp.items.some((i) => i.is_taxable)) return false;
  } else if (taxableFilter === "non-taxable") {
    if (!cp.items.every((i) => !i.is_taxable)) return false;
  }

  // 2️⃣ Site filter
  if (siteFilter) {
    const siteId = getSiteId(cp);
    if (!siteId || String(siteId) !== String(siteFilter)) return false;
  }

  // 3️⃣ Payment head filter
  if (paymentHeadFilter) {
    if (!cp.category_id || String(cp.category_id) !== String(paymentHeadFilter))
      return false;
  }

  // 4️⃣ Date filter (based on actual bill date or entry date)
  if (dateFilterType !== "all") {
    const filterDateVal = dateFilterBasis === "billDate" 
      ? (cp.actual_bill_date || cp.createdAt) 
      : (cp.createdAt || cp.actual_bill_date);
    if (!filterDateVal) return false;
    const entryDate = new Date(filterDateVal);

    if (dateFilterType === "daily" && selectedDate) {
      if (filterDateVal?.slice(0, 10) !== selectedDate) return false;
    }

    if (dateFilterType === "monthly" && selectedMonth) {
      const month = (entryDate.getMonth() + 1)
        .toString()
        .padStart(2, "0");
      if (month !== selectedMonth) return false;
    }

    if (dateFilterType === "custom" && startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (entryDate < start || entryDate > end) return false;
    }
  }

  // 5️⃣ Vendor search
  if (vendorSearch) {
    if (!cp.vendor_name?.toLowerCase().includes(vendorSearch.toLowerCase()))
      return false;
  }

  return true;
});

const sortedPurchases = [...filteredPurchases].sort((a, b) => {
  const dateAVal = dateFilterBasis === "billDate" 
    ? (a.actual_bill_date || a.createdAt) 
    : (a.createdAt || a.actual_bill_date);
  const dateBVal = dateFilterBasis === "billDate" 
    ? (b.actual_bill_date || b.createdAt) 
    : (b.createdAt || b.actual_bill_date);
  
  const dateA = new Date(dateAVal || 0);
  const dateB = new Date(dateBVal || 0);
  return dateB - dateA;
});
const handlePreviewCredit = () => {
  if (sortedPurchases.length === 0) {
    toast.warning("No GST purchases found for selected filters.");
    return;
  }

  const rows = sortedPurchases.map((cp) => ({
    ...cp,
    paymentHead: getPaymentHeadName(cp),
    site: getSiteName(cp),
    taxableLabel: cp.items?.some((i) => i.is_taxable) ? "Yes" : "No",
  }));

  setPreviewData(rows);
  setShowPreviewModal(true);
};

const handlePreviewCreditPurchase = async (purchaseId) => {
  try {
    const res = await creditPurchaseService.getCreditPurchaseById(purchaseId);
    const cp = res?.data || res;
    if (!cp) {
      toast.warning("Purchase details not found.");
      return;
    }

    const rows = [
      {
        ...cp,
        paymentHead: getPaymentHeadName(cp),
        site: getSiteName(cp),
        taxableLabel: cp.items?.some((i) => i.is_taxable) ? "Yes" : "No",
      },
    ];

    setPreviewData(rows);
    setShowPreviewModal(true);
  } catch (err) {
    console.error("Preview purchase failed:", err);
    toast.error(err.message || "Failed to load purchase preview");
  }
};

const handleDownloadCreditPDF = () => {
  if (sortedPurchases.length === 0) {
    toast.warning("No data to export");
    return;
  }

  const doc = new jsPDF();
  doc.setFontSize(14);
  doc.text("Credit Purchase Report", 14, 15);

  const columns = [
    "Payment Head",
    "Vendor",
    "Site",
    "Supply Type",
    "Taxable",
    "Tax",
    "Total",
    "Status",
  ];

  const rows = sortedPurchases.map((cp) => {
    const { subtotalBase, taxTotal, totalAmount } = recalculatePurchaseTotals(cp);
    return [
      getPaymentHeadName(cp),
      cp.vendor_name,
      getSiteName(cp),
      cp.type_of_supply_or_service,
      cp.items?.some((i) => i.is_taxable) ? "Yes" : "No",
      taxTotal.toFixed(2),
      totalAmount.toFixed(2),
      cp.payment_status,
    ];
  });

  autoTable(doc, {
    head: [columns],
    body: rows,
    startY: 25,
    styles: { fontSize: 9 },
  });

  doc.save("Credit_Purchase_Report.pdf");
};
const handleDownloadCreditExcel = () => {
  if (sortedPurchases.length === 0) {
    toast.warning("No data to export");
    return;
  }

const sheetData = [
  ["Payment Head","Vendor","Site","Bill Date","Supply Type","Total","Status"],
  ...sortedPurchases.map(cp => {
    const { subtotalBase, taxTotal, totalAmount } = recalculatePurchaseTotals(cp);
    return [
      getPaymentHeadName(cp),
      cp.vendor_name,
      getSiteName(cp),
      formatDate(cp.actual_bill_date),
      cp.type_of_supply_or_service,
      totalAmount.toFixed(2),
      cp.payment_status
    ];
  }),
  ["","","","Subtotal (Before Tax):","", extraTotals.subTotal, ""],
  ["","","","Tax Amount:","", extraTotals.taxAmount, ""],
  ["","","","Total (Subtotal + Tax):","", extraTotals.sTotal, ""],
  ["","","","Paid Amount:","", extraTotals.paidAmount, ""],
  ["","","","Pending Amount:","", extraTotals.pendingAmount, ""],
];
  const ws = XLSX.utils.aoa_to_sheet(sheetData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Credit Purchases");

  XLSX.writeFile(wb, "Credit_Purchase_Report.xlsx");
};
  // Pagination
  const indexOfLast = currentPage * entriesPerPage;
  const indexOfFirst = indexOfLast - entriesPerPage;
  const currentPurchases = sortedPurchases.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(sortedPurchases.length / entriesPerPage) || 1;
const recalculatePurchaseTotals = (cp) => {
  let subtotalBase = 0;
  let taxTotal = 0;
  let totalAmount = 0;

  const items = Array.isArray(cp.items) ? cp.items : [];
  items.forEach((item) => {
    const sub = parseFloat(item.subtotal || 0);
    const rate = parseFloat(item.tax_rate || 0);
    const isTaxable = item.is_taxable !== false;

    let itemBase = sub;
    let itemTax = 0;
    let itemTotal = sub;

    if (isTaxable && rate > 0) {
      // Note: Backend stores the BASE amount in 'subtotal'. 
      // Tax and Total are calculated based on this base.
      itemTax = sub * (rate / 100);
      itemBase = sub;
      itemTotal = sub + itemTax;
    }

    subtotalBase += itemBase;
    taxTotal += itemTax;
    totalAmount += itemTotal;
  });

  return { subtotalBase, taxTotal, totalAmount };
};

const calculateTotals = (purchases) => {
  return purchases.reduce(
    (acc, cp) => {
      const { totalAmount, taxTotal } = recalculatePurchaseTotals(cp);
      acc.totalAmount += totalAmount;
      acc.totalTax += taxTotal;
      return acc;
    },
    { totalAmount: 0, totalTax: 0 }
  );
};
const filteredTotals = calculateTotals(filteredPurchases);
const allTotals = calculateTotals(creditPurchases);
const calculateExtraTotals = (purchases) => {
  return purchases.reduce(
    (acc, cp) => {
      const { subtotalBase, taxTotal, totalAmount } = recalculatePurchaseTotals(cp);

      acc.subTotal += subtotalBase;
      acc.taxAmount += taxTotal;
      acc.sTotal += totalAmount;

      if (cp.payment_status?.toLowerCase() === "paid") {
        acc.paidAmount += totalAmount;
      } else {
        acc.pendingAmount += totalAmount;
      }

      return acc;
    },
    {
      subTotal: 0,
      taxAmount: 0,
      sTotal: 0,
      paidAmount: 0,
      pendingAmount: 0,
    }
  );
};

const extraTotals = calculateExtraTotals(filteredPurchases);
const formatINR = (value) => {
  return Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};



  return (
    <div className="container-fluid py-3 my-4">
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap">
        <div>
          <h4>GST Purchases</h4>
          <BreadCrumb pathname={location?.pathname || ""} />
        </div>
        <OverlayTrigger overlay={<Tooltip>Add New GST Purchase</Tooltip>}>
          <Button size="md" variant="success" onClick={openCreateModal}>
            <i className="bi bi-plus-lg"></i>
          </Button>
        </OverlayTrigger>
      </div>

      <Card className="p-4 shadow-sm">
<Row className="align-items-center justify-content-between mb-5 flex-wrap">
  <Col md={1}>
    <Form.Select
      value={entriesPerPage}
      onChange={(e) => {
        setEntriesPerPage(Number(e.target.value));
        setCurrentPage(1);
      }}
    >
      <option value={10}>10</option>
      <option value={25}>25</option>
      <option value={50}>50</option>
      <option value={100}>100</option>
    </Form.Select>
  </Col>

  {/* Right-aligned controls */}
  <Col md="auto" className="ms-auto d-flex align-items-center gap-2">
    <Form.Select
      value={taxableFilter}
      onChange={(e) => setTaxableFilter(e.target.value)}
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
  }}
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
    onChange={(e) => setSelectedDate(e.target.value)}
  />
)}

{dateFilterType === "monthly" && (
  <Form.Select
    value={selectedMonth}
    onChange={(e) => setSelectedMonth(e.target.value)}
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
  <div className="d-flex gap-2">
    <Form.Control
      type="date"
      value={startDate}
      onChange={(e) => setStartDate(e.target.value)}
    />
    <Form.Control
      type="date"
      value={endDate}
      onChange={(e) => setEndDate(e.target.value)}
    />
  </div>
)}

    <div style={{ minWidth: "200px" }}>
      <Select
        value={
          [
            { value: "", label: "All Sites" },
            ...branches.map((branch) => ({
              value: branch.id,
              label: branch.name,
            })),
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
          ...branches.map((branch) => ({
            value: branch.id,
            label: branch.name,
          })),
        ]}
        isSearchable={true}
        placeholder="Search Site"
      />
    </div>

    <Form.Select
      value={paymentHeadFilter}
      onChange={(e) => {
        setPaymentHeadFilter(e.target.value);
        setCurrentPage(1);
      }}
      style={{ minWidth: "200px" }}
    >
      <option value="">All Descriptions</option>
      {categories.map((head) => (
        <option key={head.id} value={head.id}>
          {head.name}
        </option>
      ))}
    </Form.Select>

    <Form.Control
      type="text"
      placeholder="Search Vendor..."
      value={vendorSearch}
      onChange={(e) => {
        setVendorSearch(e.target.value);
        setCurrentPage(1);
      }}
      className="m-0"
      style={{ maxWidth: "200px", height: "38px" }}
    />

    <Dropdown>
      <Dropdown.Toggle size="sm" variant="success">
        <Download />
      </Dropdown.Toggle>

      <Dropdown.Menu>
        <Dropdown.Item onClick={handleDownloadCreditExcel}>
          Download Excel
        </Dropdown.Item>
        <Dropdown.Item onClick={handleDownloadCreditPDF}>
          Download PDF
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  </Col>
</Row>


<div className="table-responsive">
  <Table hover striped className="text-center">
    <thead className="table-light">
      <tr>
        <th>Transaction Date</th>
        <th>Site</th>
        <th>Vendor</th>
        <th>Total Amount (₹)</th>
        <th>Tax</th>
        <th>Bill Date</th>
        <th>Supply Type</th>
        <th>Payment Status</th>
        <th>Actions</th>
      </tr>
    </thead>

    <tbody>
      {loading ? (
        <tr>
          <td
            colSpan={9}
            className="text-center align-middle"
            style={{ height: "250px" }}
          >
            <div className="d-flex justify-content-center align-items-center h-100">
              <div
                className="spinner-border text-success"
                role="status"
                style={{ width: "3rem", height: "3rem" }}
              >
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          </td>
        </tr>
      ) : currentPurchases.length > 0 ? (
        currentPurchases.map((cp) => (
          <tr key={cp.id}>
            <td>{formatDate(cp.createdAt)}</td>

            <td
              style={{
                maxWidth: "180px",
                whiteSpace: "normal",
                wordBreak: "break-word",
                overflowWrap: "break-word",
              }}
            >
              {getSiteName(cp)}
            </td>

            <td
              style={{
                maxWidth: "180px",
                whiteSpace: "normal",
                wordBreak: "break-word",
                overflowWrap: "break-word",
              }}
            >
              {cp.vendor_name}
            </td>

            <td>₹{formatINR(recalculatePurchaseTotals(cp).totalAmount)}</td>
            <td>₹{formatINR(recalculatePurchaseTotals(cp).taxTotal)}</td>
            <td>{formatDate(cp.actual_bill_date)}</td>
            <td>{cp.type_of_supply_or_service}</td>

            <td>
              <Badge
                bg={
                  cp.payment_status?.toLowerCase() === "paid"
                    ? "success"
                    : "warning"
                }
              >
                {cp.payment_status}
              </Badge>
            </td>
<td>
  <div className="d-flex align-items-center justify-content-center gap-2 text-nowrap">
    {/* ================= COMPANY & ACCOUNTANT ================= */}
    {(user?.type === "company" || user?.type === "Accountant") && (
        <>
          {/* ✏️ Edit Button */}
          <OverlayTrigger placement="top" overlay={<Tooltip>Edit Purchase</Tooltip>}>
            <span className="d-inline-block">
              <Button
                size="sm"
                variant="info"
                onClick={() => openEditModal(cp)}
              >
                <i className="bi bi-pencil text-white"></i>
              </Button>
            </span>
          </OverlayTrigger>

          {/* 🔄 Status Toggle Button */}
          {cp.payment_status?.toLowerCase() !== "paid" && (
            <OverlayTrigger placement="top" overlay={<Tooltip>Mark as Paid</Tooltip>}>
              <Button
                size="sm"
                variant="success"
                className="border"
                onClick={() => {
                  ConfirmDeleteModal({
                    title: "Confirm Status Change",
                    message: "Are you sure you want to mark this purchase as Paid?",
                    iconColor: "#198754",
                    onConfirm: async () => await handleStatusToggle(cp),
                  });
                }}
              >
                <i className="bi bi-hourglass-bottom"></i>
              </Button>
            </OverlayTrigger>
          )}
        </>
      )}

    {/* ================= BRANCH MANAGER ================= */}
    {user?.type === "Branch Manager" && (
        <>
          <OverlayTrigger placement="top" overlay={<Tooltip>Edit Purchase</Tooltip>}>
            <span className="d-inline-block">
              <Button
                size="sm"
                variant="info"
                onClick={() => openEditModal(cp)}
              >
                <i className="bi bi-pencil text-white"></i>
              </Button>
            </span>
          </OverlayTrigger>

          {cp.payment_status?.toLowerCase() !== "paid" && (
            <OverlayTrigger placement="top" overlay={<Tooltip>Mark as Paid</Tooltip>}>
              <Button
                size="sm"
                variant="success"
                className="border"
                onClick={() => {
                  ConfirmDeleteModal({
                    title: "Confirm Status Change",
                    message: "Are you sure you want to mark this purchase as Paid?",
                    iconColor: "#198754",
                    onConfirm: async () => await handleStatusToggle(cp),
                  });
                }}
              >
                <i className="bi bi-hourglass-bottom"></i>
              </Button>
            </OverlayTrigger>
          )}
        </>
      )}

    {/* ================= VIEW / DOWNLOAD DOCUMENTS (ALL ROLES) ================= */}
    {(() => {
      const rowDocuments =
        cp.items?.filter((item) => item.document).map((item) => item.document) || [];
      return (
        <>
          <OverlayTrigger
            placement="top"
            overlay={<Tooltip>Preview Purchase</Tooltip>}
          >
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handlePreviewCreditPurchase(cp.id)}
            >
              <VscPreview />
            </Button>
          </OverlayTrigger>

          {rowDocuments.length > 0 && (
            <>
              <OverlayTrigger
                placement="top"
                overlay={<Tooltip>View Documents</Tooltip>}
              >
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setCurrentDocuments(rowDocuments);
                    setShowDocsModal(true);
                  }}
                >
                  <i className="bi bi-file-earmark-richtext"></i>
                </Button>
              </OverlayTrigger>

              <OverlayTrigger
                placement="top"
                overlay={<Tooltip>Download Document</Tooltip>}
              >
                <Button
                  size="sm"
                  variant="dark"
                  onClick={() => downloadRowDocuments(rowDocuments)}
                >
                  <i className="bi bi-printer"></i>
                </Button>
              </OverlayTrigger>
            </>
          )}
        </>
      );
    })()}

    {/* ================= DELETE BUTTON (ALL ROLES) ================= */}
    <OverlayTrigger
      placement="top"
      overlay={<Tooltip>Delete Purchase</Tooltip>}
    >
      <Button
        size="sm"
        variant="danger"
        onClick={() => handleDeleteCreditPurchase(cp.id)}
      >
        <i className="bi bi-trash"></i>
      </Button>
    </OverlayTrigger>

  </div>
</td>
          </tr>
        ))
      ) : (
        <tr>
          <td colSpan={11} className="text-center">
            No GST purchases found.
          </td>
        </tr>
      )}
    </tbody>

    <tfoot>
      <tr className="table-light fw-bold">
        <td colSpan={7} className="text-end">
          Total:
        </td>
        <td>₹{filteredTotals.totalAmount.toLocaleString("en-IN")}</td>
        <td>₹{filteredTotals.totalTax.toLocaleString("en-IN")}</td>
        <td colSpan={2}></td>
      </tr>
    </tfoot>
  </Table>

  {/* Pagination */}
  <div className="d-flex justify-content-between align-items-center mt-3">
    <div className="small text-muted ms-2">
      Showing{" "}
      {filteredPurchases.length === 0 ? 0 : indexOfFirst + 1} to{" "}
      {Math.min(indexOfLast, filteredPurchases.length)} of{" "}
      {filteredPurchases.length} entries
    </div>

    <div>
      <ul className="pagination pagination-sm mb-0">
        <li
          className={`page-item ${
            currentPage === 1 ? "disabled" : ""
          }`}
        >
          <button
            className="page-link"
            onClick={() =>
              setCurrentPage((p) => Math.max(p - 1, 1))
            }
          >
            &laquo;
          </button>
        </li>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map(
          (page) => (
            <li
              key={page}
              className={`page-item ${
                currentPage === page ? "active" : ""
              }`}
            >
              <button
                className="page-link"
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            </li>
          )
        )}

        <li
          className={`page-item ${
            currentPage === totalPages ? "disabled" : ""
          }`}
        >
          <button
            className="page-link"
            onClick={() =>
              setCurrentPage((p) =>
                Math.min(p + 1, totalPages)
              )
            }
          >
            &raquo;
          </button>
        </li>
      </ul>
    </div>
  </div>
</div>

      </Card>

      <CreditPurchaseModal
        show={showModal}
        handleClose={() => {
          setShowModal(false);
          setPrefillData(null);
          setFromWallet(false);
        }}
        branches={branches}
        categories={categories}
        editingPurchase={editingPurchase}
        prefillData={prefillData}
        fromWallet={fromWallet}
        onSuccess={fetchCreditPurchases}
      />
      <ViewCredDocumentsModal
        show={showDocsModal}
        onHide={() => setShowDocsModal(false)}
        documents={currentDocuments}
      />
      <PreviewCreditPurchaseModal
  show={showPreviewModal}
  onHide={() => setShowPreviewModal(false)}
  previewData={previewData}
  handleDownloadExcel={handleDownloadCreditExcel}
  handleDownloadPDF={handleDownloadCreditPDF}
/>
    </div>
  );
};

export default CreditPurchase;
