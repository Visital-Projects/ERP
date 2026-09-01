import React, { useEffect, useState, useMemo } from "react";
import moment from "moment";
import { useLocation, useNavigate } from "react-router-dom";
import { Table, Button, Card, Row, Col, Form, Modal, Pagination } from "react-bootstrap";
import { toast } from "react-toastify";
import { Plus, PencilSquare, Trash, Eye } from "react-bootstrap-icons";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import BreadCrumb from "../../../components/BreadCrumb";
import SaleBillModal from "./SaleBillModal";
import salebillService from "../../../services/salebillService";
import branchService from "../../../services/branchService";
import XLSX from "xlsx-js-style";
import ConfirmDeleteModal from "../../../components/ConfirmDeleteModal";
import Select from "react-select";
import { Download } from "react-bootstrap-icons";

const SaleBills = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [saleBills, setSaleBills] = useState([]);
  const [branches, setBranches] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedSaleBill, setSelectedSaleBill] = useState(null);
  const [formData, setFormData] = useState({});
  const [filters, setFilters] = useState({ 
    status: "", 
    invoice_date: "", 
    site: "", 
    period: "all",
    startDate: "",
    endDate: ""
  });
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewSaleBill, setPreviewSaleBill] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  // Payment states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentFormData, setPaymentFormData] = useState({
    sale_bill_id: "",
    payment_date: moment().format("YYYY-MM-DD"),
    amount_received: "",
    tds: "",
    deductions: "",
    payment_mode: "bank",
    reference_no: "",
    notes: "",
  });
  const [billPayments, setBillPayments] = useState([]);
  const [activePaymentBill, setActivePaymentBill] = useState(null);
  const [paymentSummary, setPaymentSummary] = useState({
    bill_total: 0,
    total_received: 0,
    total_tds: 0,
    total_deductions: 0,
    total_settled: 0,
    pending_amount: 0,
  });
  const [listPaymentSummaries, setListPaymentSummaries] = useState({});

  const normalizeSaleBill = (saleBill) => {
    const services = (saleBill.services || []).map((service) => {
      const taxRate = Number(service.tax_rate || 0);
      let cgst = service.cgst != null ? Number(service.cgst) : 0;
      let sgst = service.sgst != null ? Number(service.sgst) : 0;
      let igst = service.igst != null ? Number(service.igst) : 0;

      // Fallback if the backend didn't save the split or everything is 0 but we have a taxRate
      if (taxRate > 0 && cgst === 0 && sgst === 0 && igst === 0) {
        if (Number(service.igst_amount) > 0) {
          igst = taxRate;
        } else if (Number(service.cgst_amount) > 0 || Number(service.sgst_amount) > 0) {
          cgst = taxRate / 2;
          sgst = taxRate / 2;
        } else {
          // Fallback based on state info: Odisha state code is "21"
          const stateStr = String(saleBill.buyer_state_code || saleBill.consignee_state_code || saleBill.buyer_state || saleBill.consignee_state || "").toLowerCase();
          const isInterState = stateStr && stateStr !== "21" && !stateStr.includes("odisha") && stateStr !== "od";
          
          if (isInterState) {
            igst = taxRate;
          } else {
            cgst = taxRate / 2;
            sgst = taxRate / 2;
          }
        }
      }

      return {
        ...service,
        cgst,
        sgst,
        igst,
        quantity: service.quantity != null ? Number(service.quantity) : 0,
        rate: service.rate != null ? Number(service.rate) : 0,
        is_taxable: service.is_taxable != null ? service.is_taxable : true,
        gst_mode: service.gst_mode || "exclusive",
      };
    });

    return {
      ...saleBill,
      invoice_date: saleBill.invoice_date ? moment(saleBill.invoice_date).format("YYYY-MM-DD") : "",
      ack_date: saleBill.ack_date ? moment(saleBill.ack_date).format("YYYY-MM-DD") : "",
      buyer_order_date: saleBill.buyer_order_date ? moment(saleBill.buyer_order_date).format("YYYY-MM-DD") : "",
      delivery_note_date: saleBill.delivery_note_date ? moment(saleBill.delivery_note_date).format("YYYY-MM-DD") : "",
      services,
    };
  };

  const numberToWords = (num) => {
    if (num === 0) return "zero rupees only";
    const a = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
    const b = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];

    const toWords = (n) => {
      if (n < 20) return a[n];
      if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? " " + a[n % 10] : "");
      if (n < 1000) return a[Math.floor(n / 100)] + " hundred" + (n % 100 ? " " + toWords(n % 100) : "");
      if (n < 100000) return toWords(Math.floor(n / 1000)) + " thousand" + (n % 1000 ? " " + toWords(n % 1000) : "");
      if (n < 10000000) return toWords(Math.floor(n / 100000)) + " lakh" + (n % 100000 ? " " + toWords(n % 100000) : "");
      return toWords(Math.floor(n / 10000000)) + " crore" + (n % 10000000 ? " " + toWords(n % 10000000) : "");
    };

    const rupees = Math.floor(num);
    const paise = Math.round((num - rupees) * 100);
    let words = toWords(rupees) + " rupees";
    if (paise) words += " and " + toWords(paise) + " paise";
    return words + " only";
  };

  const calculateServiceTotals = (service) => {
    const quantity = Number(service.quantity || 0);
    const rate = Number(service.rate || 0);
    const baseAmount = quantity * rate;
    const cgst = Number(service.cgst || 0);
    const sgst = Number(service.sgst || 0);
    const igst = Number(service.igst || 0);
    const totalTaxRate = cgst + sgst + igst;
    const gstMode = service.gst_mode || "exclusive";

    let taxAmount = 0;
    let totalAmount = baseAmount;

    if (service.is_taxable) {
      if (gstMode === "inclusive") {
        totalAmount = baseAmount;
        const taxableValue = baseAmount / (1 + totalTaxRate / 100 || 1);
        taxAmount = baseAmount - taxableValue;
      } else {
        taxAmount = (baseAmount * totalTaxRate) / 100;
        totalAmount = baseAmount + taxAmount;
      }
    }

    const totalAmountWords = numberToWords(totalAmount);
    const taxAmountWords = numberToWords(taxAmount);

    const cgstAmount = (cgst / 100) * baseAmount;
    const sgstAmount = (sgst / 100) * baseAmount;
    const igstAmount = (igst / 100) * baseAmount;

    return {
      ...service,
      amount: baseAmount,
      cgst_amount: cgstAmount,
      sgst_amount: sgstAmount,
      igst_amount: igstAmount,
      tax_amount: taxAmount,
      total_amount: totalAmount,
      tax_amount_words: taxAmountWords,
      total_amount_words: totalAmountWords,
      tax_rate: totalTaxRate,
      taxable_value: service.is_taxable ? (gstMode === "inclusive" ? baseAmount - taxAmount : baseAmount) : baseAmount,
    };
  };

  const fetchSaleBills = async () => {
    try {
      const res = await salebillService.getAllSaleBills();
      const normalizedBills = (res?.success ? res.data : res) || [];
      setSaleBills(normalizedBills);

      // Frontend Fix: Fetch summaries for each bill to show "Paid" amounts correctly
      normalizedBills.forEach(async (bill) => {
        try {
          const res = await salebillService.getPaymentsByBill(bill.id);
          if (res?.summary) {
            setListPaymentSummaries(prev => ({
              ...prev,
              [bill.id]: res.summary
            }));
          }
        } catch (error) {
          console.error(`Failed to fetch summary for bill ${bill.id}`);
        }
      });
    } catch (error) {
      console.error("Error fetching sale bills:", error);
      toast.error("Failed to fetch sale bills");
    }
  };

  useEffect(() => {
    fetchSaleBills();
    const fetchBranches = async () => {
      try {
        const res = await branchService.getAll();
        if (res && Array.isArray(res)) {
          setBranches(res);
        } else if (res && res.data && Array.isArray(res.data)) {
          setBranches(res.data);
        }
      } catch (error) {
        console.error("Error fetching branches:", error);
      }
    };
    fetchBranches();
  }, []);

  useEffect(() => {
    if (location.state?.proformaData) {
      const p = location.state.proformaData;
      setFormData({
        invoice_number: "",
        invoice_date: moment().format("YYYY-MM-DD"),
        status: "pending",
        consignee_name: p.consignee_name || "",
        consignee_address: p.consignee_address || "",
        consignee_gstin: p.consignee_gstin || "",
        consignee_state: p.consignee_state || "",
        consignee_state_code: p.consignee_state_code || "",
        buyer_name: p.buyer_name || p.consignee_name || "",
        buyer_address: p.buyer_address || "",
        buyer_gstin: p.buyer_gstin || "",
        buyer_state: p.buyer_state || "",
        buyer_state_code: p.buyer_state_code || "",
        assigned_to: String(p.assigned_to || ""),
        services: p.services || [],
        // Pre-fill from proforma
        reference_no: p.invoice_number || "",
        other_references: "Converted from Proforma",
      });
      setShowModal(true);
      // Clear state so it doesn't reopen on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const availableYears = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = 0; i < 10; i++) {
      years.push(String(currentYear - i));
    }
    return years;
  }, []);

  const clearForm = () => {
    setSelectedSaleBill(null);
    setFormData({
      invoice_number: "",
      invoice_date: "",
      status: "pending",
      irn: "",
      ack_no: "",
      ack_date: "",
      consignee_name: "",
      consignee_address: "",
      consignee_gstin: "",
      consignee_state: "",
      consignee_state_code: "",
      buyer_name: "",
      buyer_address: "",
      buyer_gstin: "",
      buyer_state: "",
      buyer_state_code: "",
      delivery_note: "",
      payment_terms: "",
      reference_no: "",
      other_references: "",
      buyer_order_no: "",
      buyer_order_date: "",
      dispatch_doc_no: "",
      delivery_note_date: "",
      dispatched_through: "",
      destination: "",
      terms_of_delivery: "",
      company_pan: "",
      assigned_to: "",
      bank_name: "",
      account_number: "",
      ifsc_code: "",
      bank_branch: "",
      services: [],
    });
  };

  const openCreate = () => {
    navigate("/works/salebills/create");
  };

  const openEdit = (saleBill) => {
    navigate(`/works/salebills/edit/${saleBill.id}`);
  };

  const openPreview = async (saleBill) => {
    try {
      const res = await salebillService.getSaleBillById(saleBill.id);
      const billData = res?.data || res;
      setPreviewSaleBill(normalizeSaleBill(billData));
      setShowPreviewModal(true);
    } catch (error) {
      console.error("Error loading sale bill for preview:", error);
      toast.error("Failed to load sale bill details for preview");
    }
  };

  const handleSave = async (payload) => {
    // Transform empty strings to null to ensure the backend overwrites existing values 
    // instead of ignoring them as falsy values in the update query.
    const transformEmptyToNull = (obj) => {
      const newObj = { ...obj };
      for (const key in newObj) {
        if (newObj[key] === "") {
          newObj[key] = null;
        }
      }
      return newObj;
    };

    const cleanedPayload = transformEmptyToNull(payload);
    delete cleanedPayload.assignedBranch;

    if (cleanedPayload.assigned_to != null) {
      cleanedPayload.assigned_to = Number(cleanedPayload.assigned_to);
    }

    const updatedPayload = {
      ...cleanedPayload,
      services: cleanedPayload.services.map(calculateServiceTotals),
    };

    try {
      if (selectedSaleBill) {
        await salebillService.updateSaleBill(selectedSaleBill.id, updatedPayload);
        toast.success("Sale bill updated successfully");
      } else {
        await salebillService.createSaleBill(updatedPayload);
        toast.success("Sale bill created successfully");
      }
      setShowModal(false);
      fetchSaleBills();
    } catch (error) {
      console.error("Error saving sale bill:", error);
      toast.error("Failed to save sale bill");
    }
  };

  const openPaymentModal = async (saleBill) => {
    setActivePaymentBill(saleBill);
    setPaymentFormData({
      sale_bill_id: saleBill.id,
      payment_date: moment().format("YYYY-MM-DD"),
      amount_received: "",
      tds: "",
      deductions: "",
      payment_mode: "bank",
      reference_no: "",
      notes: "",
    });
    
    try {
      const res = await salebillService.getPaymentsByBill(saleBill.id);
      setBillPayments(res?.data || []);
      if (res?.summary) {
        setPaymentSummary(res.summary);
      } else {
        throw new Error("No summary returned");
      }
    } catch (error) {
      console.error("Error fetching payments:", error);
      toast.warning("Could not fetch payment history (Status Error), but you can still add new payments.");
      
      // Fallback calculation for the header
      const totalAmount = saleBill.services?.reduce((sum, s) => {
        const total = Number(s.total_amount != null ? s.total_amount : 0);
        return sum + (total || (Number(s.rate || 0) * Number(s.quantity || 0)));
      }, 0) || 0;
      
      setPaymentSummary({
        bill_total: totalAmount,
        total_received: Number(saleBill.received_amount || 0),
        pending_amount: totalAmount - Number(saleBill.received_amount || 0),
      });
      setBillPayments([]);
    } finally {
      setShowPaymentModal(true);
    }
  };

  const handlePaymentSave = async () => {
    const amount = Number(paymentFormData.amount_received || 0);
    const tds = Number(paymentFormData.tds || 0);
    const deductions = Number(paymentFormData.deductions || 0);

    if (amount + tds + deductions <= 0) {
      toast.warning("Please enter a valid amount, TDS, or deduction");
      return;
    }

    try {
      if (paymentFormData.id) {
        await salebillService.updatePayment(paymentFormData.id, paymentFormData);
        toast.success("Payment updated successfully");
      } else {
        await salebillService.createPayment(paymentFormData);
        toast.success("Payment added successfully");
      }
      
      // Refresh payments list and summary
      const res = await salebillService.getPaymentsByBill(activePaymentBill.id);
      setBillPayments(res?.data || []);
      if (res?.summary) {
        setPaymentSummary(res.summary);
      }
      
      setPaymentFormData(prev => ({
        ...prev,
        id: undefined,
        amount_received: "",
        tds: "",
        deductions: "",
        reference_no: "",
        notes: ""
      }));
      
      fetchSaleBills();
    } catch (error) {
      console.error("Error saving payment:", error);
      toast.error(`Failed to save payment: ${error.message || "Server Error"}`);
    }
  };

  const handleEditPayment = (payment) => {
    setPaymentFormData({
      id: payment.id,
      sale_bill_id: payment.sale_bill_id,
      payment_date: moment(payment.payment_date).format("YYYY-MM-DD"),
      amount_received: payment.amount_received,
      tds: payment.tds || "",
      deductions: payment.deductions || "",
      payment_mode: payment.payment_mode || "cash",
      reference_no: payment.reference_no || "",
      notes: payment.notes || "",
    });
  };

  const handleDeletePayment = async (paymentId) => {
    if (!window.confirm("Are you sure you want to delete this payment?")) return;
    
    try {
      await salebillService.deletePayment(paymentId);
      toast.success("Payment deleted successfully");
      
      const res = await salebillService.getPaymentsByBill(activePaymentBill.id);
      setBillPayments(res?.data || []);
      if (res?.summary) {
        setPaymentSummary(res.summary);
      }
      fetchSaleBills();
    } catch (error) {
      console.error("Error deleting payment:", error);
      toast.error(`Failed to delete payment: ${error.message || "Server Error"}`);
    }
  };

  const handleDownloadExcel = () => {
    if (!filteredSaleBills.length) {
      toast.warning("No sale bills to export");
      return;
    }

    const wsData = [];
    
    // Header Row 1: Title
    wsData.push(["Sale Invoice Report"]);
    
    // Header Row 2: Metadata/Filter Info
    const periodLabel = filters.period === "custom" 
      ? `Period: ${filters.startDate} to ${filters.endDate}` 
      : `Period: ${filters.invoice_date || "All"}`;
    const siteLabel = filters.site 
      ? `Site: ${branches.find(b => String(b.id) === String(filters.site))?.name || "All"}` 
      : "Site: All";
    wsData.push([`${periodLabel} | ${siteLabel}`]);
    
    // Header Row 3: Gap
    wsData.push([]);
    
    // Header Row 4: Column Headers
    const headers = [
      "Sl No", "Invoice No", "Date", "Status", "Consignee", "Buyer", "Site", 
      "Service Description", "HSN/SAC", "Qty", "Rate", "Taxable Value", 
      "CGST (%)", "CGST Amt", "SGST (%)", "SGST Amt", "IGST (%)", "IGST Amt", "Service Total",
      "Bill Total", "Received", "TDS", "Deduction", "Difference"
    ];
    wsData.push(headers);

    let slNo = 1;
    filteredSaleBills.forEach((sb) => {
      const siteName = branches.find((b) => String(b.id) === String(sb.assigned_to))?.name || sb.branch_name || sb.assigned_to || "-";
      
      const sbData = normalizeSaleBill(sb);

      const billTotalAmount = sbData.services?.reduce((sum, s) => {
        const total = Number(s.total_amount != null ? s.total_amount : 0);
        return sum + (total || (Number(s.rate || 0) * Number(s.quantity || 0)));
      }, 0) || 0;

      const summary = listPaymentSummaries[sb.id];
      const received = Number(summary ? summary.total_received : (sb.received_amount || sb.total_received || 0)); 
      const tds = Number(summary ? summary.total_tds : (sb.total_tds || sb.tds || 0));
      const deduction = Number(summary ? summary.total_deductions : (sb.total_deductions || sb.deductions || 0));
      const diff = Number(summary ? (summary.bill_total - (summary.total_received || 0) - (summary.total_tds || 0) - (summary.total_deductions || 0) - (summary.advance_amount || 0)) : (billTotalAmount - received - tds - deduction));

      (sbData.services || []).forEach((s, index) => {
        const quantity = Number(s.quantity || 0);
        const rate = Number(s.rate || 0);
        const totals = calculateServiceTotals(s);
        
        const isFirst = index === 0;

        wsData.push([
          slNo++,
          sb.invoice_number || "-",
          sb.invoice_date ? moment(sb.invoice_date).format("DD-MM-YYYY") : "-",
          sb.status || "-",
          sb.consignee_name || "-",
          sb.buyer_name || "-",
          siteName,
          s.description || s.service_name || "-",
          s.hsn_sac || "-",
          quantity,
          rate,
          totals.taxable_value,
          Number(s.cgst || 0) > 0 ? `${s.cgst}%` : "0%",
          totals.cgst_amount,
          Number(s.sgst || 0) > 0 ? `${s.sgst}%` : "0%",
          totals.sgst_amount,
          Number(s.igst || 0) > 0 ? `${s.igst}%` : "0%",
          totals.igst_amount,
          totals.total_amount,
          isFirst ? billTotalAmount : "",
          isFirst ? received : "",
          isFirst ? tds : "",
          isFirst ? deduction : "",
          isFirst ? diff : ""
        ]);
      });
    });

    // Totals at bottom
    const grandTaxable = wsData.slice(4).reduce((sum, row) => sum + (typeof row[11] === 'number' ? row[11] : 0), 0);
    const grandCGST = wsData.slice(4).reduce((sum, row) => sum + (typeof row[13] === 'number' ? row[13] : 0), 0);
    const grandSGST = wsData.slice(4).reduce((sum, row) => sum + (typeof row[15] === 'number' ? row[15] : 0), 0);
    const grandIGST = wsData.slice(4).reduce((sum, row) => sum + (typeof row[17] === 'number' ? row[17] : 0), 0);
    const grandTotalVal = wsData.slice(4).reduce((sum, row) => sum + (typeof row[18] === 'number' ? row[18] : 0), 0);
    const grandBillTotal = wsData.slice(4).reduce((sum, row) => sum + (typeof row[19] === 'number' ? row[19] : 0), 0);
    const grandReceived = wsData.slice(4).reduce((sum, row) => sum + (typeof row[20] === 'number' ? row[20] : 0), 0);
    const grandTDS = wsData.slice(4).reduce((sum, row) => sum + (typeof row[21] === 'number' ? row[21] : 0), 0);
    const grandDeduction = wsData.slice(4).reduce((sum, row) => sum + (typeof row[22] === 'number' ? row[22] : 0), 0);
    const grandDifference = wsData.slice(4).reduce((sum, row) => sum + (typeof row[23] === 'number' ? row[23] : 0), 0);

    wsData.push([]);
    wsData.push(["", "", "", "", "", "", "", "", "", "", "TOTALS:", grandTaxable, "", grandCGST, "", grandSGST, "", grandIGST, grandTotalVal, grandBillTotal, grandReceived, grandTDS, grandDeduction, grandDifference]);

    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Styling
    const range = XLSX.utils.decode_range(ws["!ref"]);
    
    // Merge titles
    ws["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: headers.length - 1 } }
    ];

    // Column widths
    ws["!cols"] = headers.map((h, i) => ({ wch: i === 7 ? 40 : i === 4 || i === 5 ? 35 : 15 }));

    // Define styles
    const titleStyle = {
      fill: { fgColor: { rgb: "92D050" } },
      font: { bold: true, size: 14 },
      alignment: { horizontal: "center", vertical: "center" },
      border: { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } }
    };
    const subTitleStyle = {
      fill: { fgColor: { rgb: "C6E0B4" } },
      font: { bold: true },
      alignment: { horizontal: "center" },
      border: { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } }
    };
    const headerStyle = {
      fill: { fgColor: { rgb: "E9ECEF" } },
      font: { bold: true },
      alignment: { horizontal: "center" },
      border: { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } }
    };
    const dataStyle = {
      border: { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } }
    };
    const amountStyle = {
      numFmt: "#,##,##0.00",
      border: { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } }
    };
    const footerStyle = {
      fill: { fgColor: { rgb: "70AD47" } },
      font: { bold: true, color: { rgb: "000000" } },
      numFmt: "#,##,##0.00",
      border: { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } }
    };

    // Apply styles
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cell_ref = XLSX.utils.encode_cell({ r: R, c: C });
        if (!ws[cell_ref]) ws[cell_ref] = { t: "s", v: "" };

        if (R === 0) ws[cell_ref].s = titleStyle;
        else if (R === 1) ws[cell_ref].s = subTitleStyle;
        else if (R === 3) ws[cell_ref].s = headerStyle;
        else if (R > 3 && R < wsData.length - 1) {
          if (C >= 9 && typeof ws[cell_ref].v === 'number') {
            ws[cell_ref].s = amountStyle;
            ws[cell_ref].t = "n";
          } else {
            ws[cell_ref].s = dataStyle;
          }
        } else if (R === wsData.length - 1) {
          if (C >= 10) {
            ws[cell_ref].s = footerStyle;
            if (typeof ws[cell_ref].v === 'number') ws[cell_ref].t = "n";
          }
        }
      }
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sale Invoices");
    XLSX.writeFile(wb, `Sale_Invoices_${moment().format("YYYYMMDD")}.xlsx`);
  };

  const handleDelete = (id) => {
    ConfirmDeleteModal({
      title: "Delete Sale Bill",
      message: "This action cannot be undone. Continue?",
      iconColor: "#ff0000",
      onConfirm: async () => {
        await salebillService.deleteSaleBill(id);
        toast.success("Sale bill deleted successfully");
        fetchSaleBills();
      },
    });
  };

  const filteredSaleBills = (saleBills || []).filter((item) => {
    const matchesStatus = !filters.status || item.status?.toLowerCase() === filters.status?.toLowerCase();
    const matchesSite = !filters.site || String(item.assigned_to) === String(filters.site);
    
    let matchesDate = true;
    if (item.invoice_date) {
      const itemDate = moment(item.invoice_date);
      const { period, invoice_date, startDate, endDate } = filters;

      switch (period) {
        case "daily":
          matchesDate = !invoice_date || itemDate.format("YYYY-MM-DD") === invoice_date;
          break;
        case "weekly":
          if (invoice_date) {
            const start = moment(invoice_date).startOf("week");
            const end = moment(invoice_date).endOf("week");
            matchesDate = itemDate.isBetween(start, end, "day", "[]");
          }
          break;
        case "monthly":
          matchesDate = !invoice_date || itemDate.format("YYYY-MM") === invoice_date;
          break;
        case "yearly":
          matchesDate = !invoice_date || itemDate.format("YYYY") === invoice_date;
          break;
        case "custom":
          if (startDate || endDate) {
            const start = startDate ? moment(startDate).startOf("day") : null;
            const end = endDate ? moment(endDate).endOf("day") : null;
            if (start && end) matchesDate = itemDate.isBetween(start, end, "day", "[]");
            else if (start) matchesDate = itemDate.isSameOrAfter(start, "day");
            else if (end) matchesDate = itemDate.isSameOrBefore(end, "day");
          } else {
            // If no custom dates, fallback to single invoice_date for backward compatibility if it exists
            matchesDate = !invoice_date || (item.invoice_date?.slice(0, 10) === invoice_date);
          }
          break;
        case "all":
          matchesDate = true;
          break;
        default:
          matchesDate = true;
      }
    } else {
      // If item has no date, only show if no date filter is active
      matchesDate = !filters.invoice_date && !filters.startDate && !filters.endDate;
    }

    return matchesStatus && matchesDate && matchesSite;
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    if (name === "period") {
      setFilters((prev) => ({
        ...prev,
        period: value,
        invoice_date: value === "yearly" ? moment().format("YYYY") : 
                      value === "monthly" ? moment().format("YYYY-MM") : 
                      (value === "daily" || value === "weekly") ? moment().format("YYYY-MM-DD") : "",
        startDate: "",
        endDate: ""
      }));
    } else {
      setFilters((prev) => ({ ...prev, [name]: value }));
    }
    setCurrentPage(1); 
  };



  const getStartDateForOpeningBalance = () => {
    const { period, invoice_date, startDate } = filters;
    if (period === "monthly" && invoice_date) return moment(invoice_date, "YYYY-MM").startOf("month");
    if (period === "yearly" && invoice_date) return moment(invoice_date, "YYYY").startOf("year");
    if (period === "daily" && invoice_date) return moment(invoice_date, "YYYY-MM-DD").startOf("day");
    if (period === "weekly" && invoice_date) return moment(invoice_date, "YYYY-MM-DD").startOf("week");
    if (period === "custom" && startDate) return moment(startDate).startOf("day");
    return null;
  };

  const startDateForOB = getStartDateForOpeningBalance();

  let openingBalance = 0;
  if (startDateForOB) {
    (saleBills || []).forEach(sb => {
      const matchesSite = !filters.site || String(sb.assigned_to) === String(filters.site);
      if (!matchesSite) return;

      if (sb.invoice_date) {
        const itemDate = moment(sb.invoice_date);
        if (itemDate.isBefore(startDateForOB)) {
          const totalAmount = sb.services?.reduce((sum, s) => {
            const total = Number(s.total_amount != null ? s.total_amount : 0);
            return sum + (total || (Number(s.rate || 0) * Number(s.quantity || 0)));
          }, 0) || 0;

          const summary = listPaymentSummaries[sb.id];
          const received = Number(summary ? summary.total_received : (sb.received_amount || sb.total_received || 0)); 
          const tds = Number(summary ? summary.total_tds : (sb.total_tds || sb.tds || 0));
          const deduction = Number(summary ? summary.total_deductions : (sb.total_deductions || sb.deductions || 0));
          const diff = Number(summary ? (summary.bill_total - (summary.total_received || 0) - (summary.total_tds || 0) - (summary.total_deductions || 0) - (summary.advance_amount || 0)) : (totalAmount - received - tds - deduction));
          
          openingBalance += diff;
        }
      }
    });
  }

  // PDF Generation Function - Exact Match to Image Format
  const generatePDF = (bill) => {
    if (!bill) return;

    const doc = new jsPDF("p", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const left = 12;
    const right = pageWidth - 12;

    // Page border
    doc.setDrawColor(0);
    doc.setLineWidth(0.4);
    doc.rect(10, 8, pageWidth - 20, pageHeight - 16);

    // ========== COMPANY HEADER: LOGO + INFO (LEFT) + METADATA TABLE (RIGHT) ==========
    const logoW = 25;
    const logoH = 25;
    try {
      doc.addImage("https://s6.imgcdn.dev/YASucH.png", "PNG", left, 12, logoW, logoH);
    } catch (err) {
      doc.rect(left, 12, logoW, logoH);
    }

    // Company details (left of center)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("VENKATESWAR ENGINEERING WORKS", left + logoW + 3, 15);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.text("WORKSHOP : - INNAYAT NAGAR,", left + logoW + 3, 19);
    doc.text("BADACHANA, TAHASIL DARPAN,", left + logoW + 3, 21.5);
    doc.text("NH - 5, JAJPUR, PIN - 754296,", left + logoW + 3, 24);
    doc.text("OFFICE : -DUPLEX NO. 5, SOMU VILLA,", left + logoW + 3, 26.5);
    doc.text("NANDAN VIHAR, KALARAHRIAGA", left + logoW + 3, 29);
    doc.text("PATIA, BHUBANESWAR.", left + logoW + 3, 31.5);
    doc.text("GSTIN/UIN : 21ARXPK7658Q1ZO", left + logoW + 3, 34);

    // Metadata table on right (2-column grid with borders - EXPANDED)
    const metaX = pageWidth / 2 + 5;
    const col1 = metaX;
    const col2 = metaX + (right - metaX) / 2;
    const cellH = 6; // Increased height for more space
    let metaY = 12;

    doc.setDrawColor(0);
    doc.setLineWidth(0.3);
    
    // Draw outer borders and structure
    const tableTop = metaY;
    const tableLeft = col1 - 1;
    const tableRight = right;
    const metaTableBottomY = tableTop + (cellH * 7);

    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");

    // Row 1
    doc.text("Invoice No.", col1 + 0.5, metaY + 1.5);
    doc.text("Dated", col2 + 0.5, metaY + 1.5);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.text(bill.invoice_number || "-", col1 + 1, metaY + 2.5);
    doc.text(bill.invoice_date ? new Date(bill.invoice_date).toLocaleDateString("en-IN") : "-", col2 + 1, metaY + 2.5);
    metaY += cellH;
    doc.line(tableLeft, metaY, tableRight, metaY);

    // Row 2
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.text("Delivery Note", col1 + 0.5, metaY + 1.5);
    doc.text("Mode/Terms of Payment", col2 + 0.5, metaY + 1.5);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.text(bill.delivery_note || "-", col1 + 1, metaY + 2.5);
    doc.text(bill.payment_terms || "-", col2 + 1, metaY + 2.5);
    metaY += cellH;
    doc.line(tableLeft, metaY, tableRight, metaY);

    // Row 3
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.text("Reference No. & Date", col1 + 0.5, metaY + 1.5);
    doc.text("Other References", col2 + 0.5, metaY + 1.5);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.text(bill.reference_no || "-", col1 + 1, metaY + 2.5);
    doc.text(bill.other_references || "-", col2 + 1, metaY + 2.5);
    metaY += cellH;
    doc.line(tableLeft, metaY, tableRight, metaY);

    // Row 4
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.text("Buyer's Order No.", col1 + 0.5, metaY + 1.5);
    doc.text("Dated", col2 + 0.5, metaY + 1.5);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.text(bill.buyer_order_no || "-", col1 + 1, metaY + 2.5);
    doc.text(bill.buyer_order_date ? new Date(bill.buyer_order_date).toLocaleDateString("en-IN") : "-", col2 + 1, metaY + 2.5);
    metaY += cellH;
    doc.line(tableLeft, metaY, tableRight, metaY);

    // Row 5
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.text("Dispatch Doc No.", col1 + 0.5, metaY + 1.5);
    doc.text("Delivery Note Date", col2 + 0.5, metaY + 1.5);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.text(bill.dispatch_doc_no || "-", col1 + 1, metaY + 2.5);
    doc.text(bill.delivery_note_date ? new Date(bill.delivery_note_date).toLocaleDateString("en-IN") : "-", col2 + 1, metaY + 2.5);
    metaY += cellH;
    doc.line(tableLeft, metaY, tableRight, metaY);

    // Row 6
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.text("Dispatched through", col1 + 0.5, metaY + 1.5);
    doc.text("Destination", col2 + 0.5, metaY + 1.5);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.text(bill.dispatched_through || "-", col1 + 1, metaY + 2.5);
    doc.text(bill.destination || "-", col2 + 1, metaY + 2.5);
    metaY += cellH;
    doc.line(tableLeft, metaY, tableRight, metaY);

    // Row 7
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.text("Terms of Delivery", col1 + 0.5, metaY + 1.5);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.text(bill.terms_of_delivery || "-", col1 + 1, metaY + 2.5);
    metaY += cellH;
    doc.line(tableLeft, metaY, tableRight, metaY);

    // Draw table borders (left, right, top, middle divider)
    doc.line(tableLeft, tableTop, tableLeft, metaY); // Left border
    doc.line(tableRight, tableTop, tableRight, metaY); // Right border
    doc.line(tableLeft, tableTop, tableRight, tableTop); // Top border
    doc.line(col2, tableTop, col2, metaY); // Middle column divider

    // ========== CONSIGNEE & BUYER BOXES (SIDE-BY-SIDE SMALLER WIDTH) ==========
    const cY = metaY + 2;
    const boxW = 70; // Smaller width for each box
    const consigneeX = left;
    const buyerX = left + boxW + 5;

    // Consignee Box (LEFT)
    doc.rect(consigneeX, cY, boxW, 20);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text("Consignee (Ship to)", consigneeX + 2, cY + 4);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.text(`Name : ${bill.consignee_name || "-"}`, consigneeX + 2, cY + 8);
    doc.text(`GSTIN : ${bill.consignee_gstin || "-"}`, consigneeX + 2, cY + 12);
    doc.text(`Address : ${bill.consignee_address || "-"}`, consigneeX + 2, cY + 16);

    // Buyer Box (RIGHT)
    doc.rect(buyerX, cY, boxW, 20);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text("Buyer (Bill to)", buyerX + 2, cY + 4);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.text(`Name : ${bill.buyer_name || "-"}`, buyerX + 2, cY + 8);
    doc.text(`GSTIN : ${bill.buyer_gstin || "-"}`, buyerX + 2, cY + 12);
    doc.text(`Address : ${bill.buyer_address || "-"}`, buyerX + 2, cY + 16);

    // ========== SERVICES TABLE ==========
    const services = bill.services || [];
    const tableau = services.map((service, idx) => {
      const qty = Number(service.quantity || 0);
      const rate = Number(service.rate || 0);
      const amt = qty * rate;
      return [
        idx + 1,
        service.service_name || "MRP Operation & Maintenance Contract",
        service.hsn_sac || "-",
        qty.toLocaleString("en-IN"),
        `₹ ${rate.toFixed(2)}`,
        service.unit || "MTS",
        `₹ ${amt.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
      ];
    });

    autoTable(doc, {
      head: [["Sl No", "Description of Services", "HSN/SAC", "Quantity", "Rate", "per", "Amount"]],
      body: tableau,
      startY: cY + 22,
      theme: "grid",
      headStyles: { fillColor: [220, 220, 220], textColor: 0, fontStyle: "bold", halign: "center", fontSize: 8 },
      styles: { fontSize: 8, cellPadding: 1.5, halign: "right" },
      columnStyles: {
        0: { halign: "center", cellWidth: 8 },
        1: { halign: "left", cellWidth: 65 },
        2: { halign: "center", cellWidth: 16 },
        3: { cellWidth: 18 },
        4: { cellWidth: 16 },
        5: { cellWidth: 12, halign: "center" },
        6: { cellWidth: 22 }
      }
    });

    let currentY = doc.lastAutoTable.finalY + 3;

    // ========== TOTALS & TAX SECTION ==========
    const subTotal = services.reduce((sum, s) => sum + (Number(s.quantity || 0) * Number(s.rate || 0)), 0);
    const totalTax = services.reduce((sum, s) => sum + Number(s.tax_amount || 0), 0);
    const grandTotal = subTotal + totalTax;
    const roundedUp = 0.40; // Example rounding

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text("IGST", right - 70, currentY + 4, { align: "left" });
    doc.text(`₹ ${totalTax.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`, right - 8, currentY + 4, { align: "right" });

    doc.text("Rounded Up/off", right - 70, currentY + 8, { align: "left" });
    doc.text(`₹ ${roundedUp.toFixed(2)}`, right - 8, currentY + 8, { align: "right" });

    doc.setFont("helvetica", "bold");
    doc.text("Total", right - 70, currentY + 12, { align: "left" });
    doc.text(`₹ ${(grandTotal + roundedUp).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`, right - 8, currentY + 12, { align: "right" });

    currentY += 20;

    // ========== AMOUNT IN WORDS ==========
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(`Amount Chargeable (in words): ${numberToWords(grandTotal)}`, left, currentY);
    currentY += 6;
    doc.text(`Tax Amount (in words): ${numberToWords(totalTax)}`, left, currentY);

    currentY += 10;

    // ========== DECLARATION & BANK DETAILS ==========
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text("Declaration:", left, currentY);
    currentY += 4;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.text("We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.", left, currentY);

    currentY += 8;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text("BANK DETAILS:", left, currentY);
    currentY += 4;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.text(`AXIS BANK LIMITED, A/C NO. 911020042168303, IFSC: UTIB0000550, BRANCH BIDANASI, CUTTACK, ODISHA.`, left, currentY);

    currentY += 8;
    doc.setFont("helvetica", "italic");
    doc.setFontSize(7);
    doc.text("This is a Computer Generated Invoice", pageWidth / 2, currentY, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(`Company's PAN: ${bill.company_pan || "ARXPK7658Q"}`, right - 30, currentY, { align: "right" });

    doc.save(`SaleBill_${bill.invoice_number || Date.now()}.pdf`);
  };

  return (
    <div className="page-content">
      <h4 className="mb-1">Sale Invoice</h4>
      <BreadCrumb pathname={location?.pathname || ""} lastLabel="Sale Invoice" />

      <Card>
        <Card.Body>
          <div className="d-flex flex-wrap align-items-end gap-3 mb-4 pb-3 border-bottom">
            <div style={{ minWidth: "140px" }}>
              <Form.Group>
                <Form.Label className="fw-semibold mb-1">Status</Form.Label>
                <Form.Select name="status" value={filters.status} onChange={handleFilterChange}>
                  <option value="">All Status</option>
                  <option value="pending">pending</option>
                  <option value="paid">paid</option>
                </Form.Select>
              </Form.Group>
            </div>
            <div style={{ minWidth: "140px" }}>
              <Form.Group>
                <Form.Label className="fw-semibold mb-1">Select Period</Form.Label>
                <Form.Select name="period" value={filters.period} onChange={handleFilterChange}>
                  <option value="all">All Period</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                  <option value="custom">Custom</option>
                </Form.Select>
              </Form.Group>
            </div>
            
            {filters.period === "custom" ? (
              <>
                <div style={{ minWidth: "140px" }}>
                  <Form.Group>
                    <Form.Label className="fw-semibold mb-1">Start Date</Form.Label>
                    <Form.Control type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} />
                  </Form.Group>
                </div>
                <div style={{ minWidth: "140px" }}>
                  <Form.Group>
                    <Form.Label className="fw-semibold mb-1">End Date</Form.Label>
                    <Form.Control type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} />
                  </Form.Group>
                </div>
              </>
            ) : filters.period !== "all" ? (
              <div style={{ minWidth: "140px" }}>
                <Form.Group>
                  <Form.Label className="fw-semibold mb-1">
                    {filters.period === "monthly" ? "Select Month" : filters.period === "yearly" ? "Select Year" : filters.period === "weekly" ? "Select Week" : "Select Date"}
                  </Form.Label>
                  {filters.period === "yearly" ? (
                    <Form.Select name="invoice_date" value={filters.invoice_date} onChange={handleFilterChange}>
                      {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
                    </Form.Select>
                  ) : (
                    <Form.Control 
                      type={filters.period === "monthly" ? "month" : "date"} 
                      name="invoice_date" 
                      value={filters.invoice_date} 
                      onChange={handleFilterChange} 
                    />
                  )}
                </Form.Group>
              </div>
            ) : null}

            <div className="flex-grow-1" style={{ minWidth: "200px", maxWidth: "300px" }}>
              <Form.Group>
                <Form.Label className="fw-semibold mb-1">Select Site</Form.Label>
                <Select
                  options={[
                    { value: "", label: "All Sites" },
                    ...branches.map((b) => ({ value: String(b.id), label: b.name })),
                  ]}
                  value={
                    filters.site
                      ? {
                          value: filters.site,
                          label: branches.find((b) => String(b.id) === String(filters.site))?.name || "All Sites",
                        }
                      : { value: "", label: "All Sites" }
                  }
                  onChange={(selected) =>
                    setFilters((prev) => ({ ...prev, site: selected ? selected.value : "" }))
                  }
                  isSearchable={true}
                  placeholder="Search Site..."
                  styles={{
                    control: (base) => ({
                      ...base,
                      borderColor: "#dee2e6",
                      minHeight: "38px",
                    }),
                  }}
                />
              </Form.Group>
            </div>
            <div className="ms-auto d-flex gap-2">
              <Button variant="success" onClick={handleDownloadExcel} title="Download Excel" className="px-3">
                <Download size={16} className="me-1" /> Excel
              </Button>
              <Button variant="primary" onClick={openCreate} className="px-3">
                <Plus size={16} /> Create Sale Invoice
              </Button>
            </div>
          </div>

          <div className="table-responsive">
            <Table striped hover bordered>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Invoice</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Site</th>
                  <th>Total</th>
                  <th>Received</th>
                  <th>TDS</th>
                  <th>Deduction</th>
                  <th>Difference</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {startDateForOB && currentPage === 1 && (
                  <tr className="fw-bold" style={{ backgroundColor: '#f8f9fa' }}>
                    <td></td>
                    <td className="text-primary" style={{ fontStyle: "italic" }}>Opening Balance</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td className="text-danger">₹{(Number(openingBalance) || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td></td>
                  </tr>
                )}
                {filteredSaleBills
                  .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                  .map((sb, index) => {
                    const actualIndex = (currentPage - 1) * itemsPerPage + index + 1;
                    const totalAmount = sb.services?.reduce((sum, s) => {
                      const total = Number(s.total_amount != null ? s.total_amount : 0);
                      return sum + (total || (Number(s.rate || 0) * Number(s.quantity || 0)));
                    }, 0) || 0;

                    // Use real-time summary if fetched, otherwise fallback to bill data
                    const summary = listPaymentSummaries[sb.id];
                    const received = Number(summary ? summary.total_received : (sb.received_amount || sb.total_received || 0)); 
                    const tds = Number(summary ? summary.total_tds : (sb.total_tds || sb.tds || 0));
                    const deduction = Number(summary ? summary.total_deductions : (sb.total_deductions || sb.deductions || 0));
                    const difference = Number(summary ? (summary.bill_total - (summary.total_received || 0) - (summary.total_tds || 0) - (summary.total_deductions || 0) - (summary.advance_amount || 0)) : (totalAmount - received - tds - deduction));

                    return (
                      <tr key={sb.id || actualIndex}>
                        <td>{actualIndex}</td>
                        <td>{sb.invoice_number || "-"}</td>
                        <td>{sb.invoice_date ? moment(sb.invoice_date).format("DD-MM-YYYY") : "-"}</td>
                        <td>
                          <span className={`badge bg-${sb.status === "paid" || sb.status === "settled" ? "success" : sb.status === "partial" ? "warning" : "danger"}`}>
                            {sb.status === "paid" || sb.status === "settled" ? "paid" : sb.status === "partial" ? "partial" : "pending"}
                          </span>
                        </td>
                        <td>{branches.find((b) => String(b.id) === String(sb.assigned_to))?.name || sb.branch_name || "-"}</td>
                        <td className="fw-bold">₹{(Number(totalAmount) || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td className="text-success fw-bold">₹{(Number(received) || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td className="text-muted fw-bold">₹{(Number(tds) || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td className="text-muted fw-bold">₹{(Number(deduction) || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td className="text-danger fw-bold">₹{(Number(difference) || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td>
                          <div className="d-flex gap-1">
                            <Button variant="outline-primary" size="sm" onClick={() => openPaymentModal(sb)} title="Manage Payments">
                              ₹
                            </Button>
                            <Button variant="info" size="sm" onClick={() => openPreview(sb)}>
                              <Eye />
                            </Button>
                            <Button variant="warning" size="sm" onClick={() => openEdit(sb)}>
                              <PencilSquare />
                            </Button>
                            <Button variant="danger" size="sm" onClick={() => handleDelete(sb.id)}>
                              <Trash />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                {filteredSaleBills.length === 0 && (
                  <tr>
                    <td colSpan="11" className="text-center">
                      No sale Invoices found
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot className="table-light fw-bold">
                <tr>
                  <td colSpan="5" className="text-end">
                    GRAND TOTAL:
                  </td>
                  <td>
                    ₹{(filteredSaleBills.reduce((sum, sb) => {
                      const total = (sb.services || []).reduce((sSum, s) => sSum + Number(s.total_amount || (Number(s.rate || 0) * Number(s.quantity || 0))), 0);
                      return sum + total;
                    }, 0) || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="text-success">
                    ₹{(filteredSaleBills.reduce((sum, sb) => {
                      const summary = listPaymentSummaries[sb.id];
                      const received = Number(summary ? summary.total_received : (sb.received_amount || sb.total_received || 0));
                      return sum + received;
                    }, 0) || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="text-muted">
                    ₹{(filteredSaleBills.reduce((sum, sb) => {
                      const summary = listPaymentSummaries[sb.id];
                      const tds = Number(summary ? summary.total_tds : (sb.total_tds || sb.tds || 0));
                      return sum + tds;
                    }, 0) || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="text-muted">
                    ₹{(filteredSaleBills.reduce((sum, sb) => {
                      const summary = listPaymentSummaries[sb.id];
                      const deduction = Number(summary ? summary.total_deductions : (sb.total_deductions || sb.deductions || 0));
                      return sum + deduction;
                    }, 0) || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="text-danger">
                    ₹{((filteredSaleBills.reduce((sum, sb) => {
                      const total = (sb.services || []).reduce((sSum, s) => sSum + Number(s.total_amount || (Number(s.rate || 0) * Number(s.quantity || 0))), 0);
                      const summary = listPaymentSummaries[sb.id];
                      const received = Number(summary ? summary.total_received : (sb.received_amount || sb.total_received || 0));
                      const tds = Number(summary ? summary.total_tds : (sb.total_tds || sb.tds || 0));
                      const deduction = Number(summary ? summary.total_deductions : (sb.total_deductions || sb.deductions || 0));
                      const diff = Number(summary ? (summary.bill_total - (summary.total_received || 0) - (summary.total_tds || 0) - (summary.total_deductions || 0) - (summary.advance_amount || 0)) : (total - received - tds - deduction));
                      return sum + diff;
                    }, 0) || 0) + (startDateForOB ? Number(openingBalance) : 0)).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </Table>
          </div>

          {filteredSaleBills.length > itemsPerPage && (
            <div className="d-flex justify-content-center mt-3">
              <Pagination>
                <Pagination.First onClick={() => setCurrentPage(1)} disabled={currentPage === 1} />
                <Pagination.Prev onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} />
                
                {[...Array(Math.ceil(filteredSaleBills.length / itemsPerPage))].map((_, i) => (
                  <Pagination.Item
                    key={i + 1}
                    active={i + 1 === currentPage}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </Pagination.Item>
                )).slice(Math.max(0, currentPage - 3), Math.min(Math.ceil(filteredSaleBills.length / itemsPerPage), currentPage + 2))}

                <Pagination.Next
                  onClick={() => setCurrentPage((p) => Math.min(Math.ceil(filteredSaleBills.length / itemsPerPage), p + 1))}
                  disabled={currentPage === Math.ceil(filteredSaleBills.length / itemsPerPage)}
                />
                <Pagination.Last
                  onClick={() => setCurrentPage(Math.ceil(filteredSaleBills.length / itemsPerPage))}
                  disabled={currentPage === Math.ceil(filteredSaleBills.length / itemsPerPage)}
                />
              </Pagination>
            </div>
          )}
        </Card.Body>
      </Card>

      <SaleBillModal
        show={showModal}
        onHide={() => setShowModal(false)}
        formData={formData}
        setFormData={setFormData}
        onSave={handleSave}
        isEdit={!!selectedSaleBill}
      />

      {/* Preview Modal - Exact match to image format */}
      <Modal size="xl" centered dialogClassName="modal-dialog-centered" className="salebill-preview-center" show={showPreviewModal} onHide={() => setShowPreviewModal(false)} backdrop="static" keyboard={false}>
        <Modal.Header closeButton>
          <div className="d-flex w-100 justify-content-between align-items-center">
            <h5 className="mb-0">Tax Invoice Preview</h5>
            <Button variant="primary" onClick={() => previewSaleBill && generatePDF(previewSaleBill)}>
              Download PDF
            </Button>
          </div>
        </Modal.Header>
        <Modal.Body style={{ backgroundColor: "#f5f5f5", display: "flex", justifyContent: "center", alignItems: "flex-start", padding: "30px" }}>
          {previewSaleBill ? (
            <div style={{ backgroundColor: "white", padding: "20px", fontFamily: "Arial, sans-serif", width: "100%", maxWidth: "1100px", boxShadow: "0 0 12px rgba(0,0,0,0.1)", border: "1px solid #ddd" }}>
              {/* Header Section */}
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #000", paddingBottom: "10px", marginBottom: "10px" }}>
                <div style={{ width: "120px" }}>
                  <img src="https://s6.imgcdn.dev/YASucH.png" alt="Logo" style={{ width: "100%" }} />
                </div>
                <div style={{ textAlign: "center", flex: 1 }}>
                  <h5 style={{ margin: 0, fontWeight: "bold" }}>VENKATESWAR ENGINEERING WORKS</h5>
                  <p style={{ margin: 0, fontSize: "10px" }}>WORKSHOP : INNAYAT NAGAR, BADACHANA, TAHASIL DARPAN</p>
                  <p style={{ margin: 0, fontSize: "10px" }}>NH - 5, JAJPUR, PIN - 754296</p>
                  <p style={{ margin: 0, fontSize: "10px" }}>GSTIN/UIN : 21ARXPK7658Q1ZO</p>
                </div>
                <div style={{ textAlign: "right", width: "100px" }}>
                  <p style={{ margin: 0, fontWeight: "bold", fontSize: "12px" }}>e-Invoice</p>
                  <div style={{ width: "60px", height: "60px", border: "1px solid #000", marginTop: "5px", marginLeft: "auto" }}></div>
                </div>
              </div>

              {/* Title */}
              <h4 style={{ textAlign: "center", fontWeight: "bold", margin: "15px 0" }}>TAX INVOICE</h4>

              {/* Invoice Details */}
              <div style={{ marginBottom: "15px" }}>
                <table style={{ width: "100%", fontSize: "11px" }}>
                  <tbody>
                    <tr>
                      <td style={{ width: "25%" }}><strong>Invoice No :</strong> {previewSaleBill.invoice_number || "-"}</td>
                      <td style={{ width: "25%" }}><strong>Date :</strong> {previewSaleBill.invoice_date ? new Date(previewSaleBill.invoice_date).toLocaleDateString("en-IN") : "-"}</td>
                      <td style={{ width: "25%" }}><strong>Status :</strong> {previewSaleBill.status || "-"}</td>
                      <td style={{ width: "25%" }}><strong>IRN :</strong> {previewSaleBill.irn || "-"}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Consignee and Buyer */}
              <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
                <div style={{ flex: 1, border: "1px solid #ddd", padding: "8px" }}>
                  <h6 style={{ fontWeight: "bold", marginBottom: "5px" }}>Consignee (Ship to)</h6>
                  <p style={{ margin: 0, fontSize: "10px" }}><strong>Name :</strong> {previewSaleBill.consignee_name || "-"}</p>
                  <p style={{ margin: 0, fontSize: "10px" }}><strong>GSTIN :</strong> {previewSaleBill.consignee_gstin || "-"}</p>
                  <p style={{ margin: 0, fontSize: "10px" }}><strong>Address :</strong> {previewSaleBill.consignee_address || "-"}</p>
                  <p style={{ margin: 0, fontSize: "10px" }}><strong>State :</strong> {previewSaleBill.consignee_state || "-"} ({previewSaleBill.consignee_state_code || "-"})</p>
                </div>
                <div style={{ flex: 1, border: "1px solid #ddd", padding: "8px" }}>
                  <h6 style={{ fontWeight: "bold", marginBottom: "5px" }}>Buyer (Bill to)</h6>
                  <p style={{ margin: 0, fontSize: "10px" }}><strong>Name :</strong> {previewSaleBill.buyer_name || "-"}</p>
                  <p style={{ margin: 0, fontSize: "10px" }}><strong>GSTIN :</strong> {previewSaleBill.buyer_gstin || "-"}</p>
                  <p style={{ margin: 0, fontSize: "10px" }}><strong>Address :</strong> {previewSaleBill.buyer_address || "-"}</p>
                  <p style={{ margin: 0, fontSize: "10px" }}><strong>State :</strong> {previewSaleBill.buyer_state || "-"} ({previewSaleBill.buyer_state_code || "-"})</p>
                </div>
              </div>

              {/* Services Table */}
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "10px", marginBottom: "15px" }}>
                <thead>
                  <tr style={{ backgroundColor: "#e9ecef", border: "1px solid #000" }}>
                    <th style={{ border: "1px solid #000", padding: "6px", textAlign: "center" }}>Sl No</th>
                    <th style={{ border: "1px solid #000", padding: "6px", textAlign: "center" }}>Description of Services</th>
                    <th style={{ border: "1px solid #000", padding: "6px", textAlign: "center" }}>HSN/SAC</th>
                    <th style={{ border: "1px solid #000", padding: "6px", textAlign: "center" }}>Quantity</th>
                    <th style={{ border: "1px solid #000", padding: "6px", textAlign: "center" }}>Rate</th>
                    <th style={{ border: "1px solid #000", padding: "6px", textAlign: "center" }}>per</th>
                    <th style={{ border: "1px solid #000", padding: "6px", textAlign: "center" }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {(previewSaleBill.services || []).map((service, idx) => {
                    const quantity = Number(service.quantity || 0);
                    const rate = Number(service.rate || 0);
                    const amount = quantity * rate;
                    return (
                      <tr key={idx}>
                        <td style={{ border: "1px solid #000", padding: "6px", textAlign: "center" }}>{idx + 1}</td>
                        <td style={{ border: "1px solid #000", padding: "6px" }}>
                          <div>{service.service_name || "-"}</div>
                          {service.description && <div>{service.description}</div>}
                        </td>
                        <td style={{ border: "1px solid #000", padding: "6px", textAlign: "center" }}>{service.hsn_sac || "-"}</td>
                        <td style={{ border: "1px solid #000", padding: "6px", textAlign: "right" }}>{quantity.toLocaleString()}</td>
                        <td style={{ border: "1px solid #000", padding: "6px", textAlign: "right" }}>₹ {rate.toFixed(2)}</td>
                        <td style={{ border: "1px solid #000", padding: "6px", textAlign: "center" }}>{service.unit || "MTS"}</td>
                        <td style={{ border: "1px solid #000", padding: "6px", textAlign: "right" }}>₹ {amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Amount in Words */}
              <div style={{ marginBottom: "15px" }}>
                <p style={{ fontSize: "11px", margin: 0 }}>
                  <strong>Amount Chargeable (in words):</strong> {numberToWords((previewSaleBill.services || []).reduce((sum, s) => sum + (Number(s.quantity || 0) * Number(s.rate || 0)), 0) + (previewSaleBill.services || []).reduce((sum, s) => sum + Number(s.tax_amount || 0), 0))}
                </p>
              </div>

              {/* Tax Summary Table */}
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "10px", marginBottom: "15px" }}>
                <thead>
                  <tr style={{ backgroundColor: "#e9ecef", border: "1px solid #000" }}>
                    <th style={{ border: "1px solid #000", padding: "6px", textAlign: "center" }}>HSN/SAC</th>
                    <th style={{ border: "1px solid #000", padding: "6px", textAlign: "center" }}>Taxable Value</th>
                    <th style={{ border: "1px solid #000", padding: "6px", textAlign: "center" }}>IGST</th>
                    <th style={{ border: "1px solid #000", padding: "6px", textAlign: "center" }}>Total</th>
                    <th style={{ border: "1px solid #000", padding: "6px", textAlign: "center" }}>Rate</th>
                    <th style={{ border: "1px solid #000", padding: "6px", textAlign: "center" }}>Amount</th>
                    <th style={{ border: "1px solid #000", padding: "6px", textAlign: "center" }}>Tax Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {(previewSaleBill.services || []).map((service, idx) => {
                    const taxableValue = Number(service.amount || 0);
                    const igstRate = Number(service.igst || service.tax_rate || 0);
                    const igstAmount = Number(service.tax_amount || 0);
                    const total = taxableValue + igstAmount;
                    return (
                      <tr key={idx}>
                        <td style={{ border: "1px solid #000", padding: "6px" }}>{service.hsn_sac || "-"}</td>
                        <td style={{ border: "1px solid #000", padding: "6px", textAlign: "right" }}>₹ {taxableValue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                        <td style={{ border: "1px solid #000", padding: "6px", textAlign: "center" }}>{igstRate}%</td>
                        <td style={{ border: "1px solid #000", padding: "6px", textAlign: "right" }}>₹ {total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                        <td style={{ border: "1px solid #000", padding: "6px", textAlign: "center" }}>{igstRate}%</td>
                        <td style={{ border: "1px solid #000", padding: "6px", textAlign: "right" }}>₹ {taxableValue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                        <td style={{ border: "1px solid #000", padding: "6px", textAlign: "right" }}>₹ {igstAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                      </tr>
                    );
                  })}
                  <tr style={{ fontWeight: "bold" }}>
                    <td style={{ border: "1px solid #000", padding: "6px" }}><strong>Total</strong></td>
                    <td style={{ border: "1px solid #000", padding: "6px", textAlign: "right" }}><strong>₹ {(previewSaleBill.services || []).reduce((sum, s) => sum + Number(s.amount || 0), 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</strong></td>
                    <td style={{ border: "1px solid #000", padding: "6px" }}></td>
                    <td style={{ border: "1px solid #000", padding: "6px", textAlign: "right" }}><strong>₹ {((previewSaleBill.services || []).reduce((sum, s) => sum + Number(s.amount || 0), 0) + (previewSaleBill.services || []).reduce((sum, s) => sum + Number(s.tax_amount || 0), 0)).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</strong></td>
                    <td style={{ border: "1px solid #000", padding: "6px" }}></td>
                    <td style={{ border: "1px solid #000", padding: "6px" }}></td>
                    <td style={{ border: "1px solid #000", padding: "6px", textAlign: "right" }}><strong>₹ {(previewSaleBill.services || []).reduce((sum, s) => sum + Number(s.tax_amount || 0), 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</strong></td>
                  </tr>
                </tbody>
              </table>

              {/* Tax Amount in Words */}
              <div style={{ marginBottom: "15px" }}>
                <p style={{ fontSize: "11px", margin: 0 }}>
                  <strong>Tax Amount (in words):</strong> {numberToWords((previewSaleBill.services || []).reduce((sum, s) => sum + Number(s.tax_amount || 0), 0))}
                </p>
              </div>

              {/* Declaration */}
              <div style={{ marginBottom: "10px" }}>
                <p style={{ fontSize: "10px", margin: 0 }}>
                  <strong>Declaration:</strong> We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.
                </p>
              </div>

              {/* Bank Details */}
              <div style={{ marginBottom: "10px" }}>
                <p style={{ fontSize: "10px", margin: 0 }}>
                  <strong>BANK DETAILS:</strong> {previewSaleBill.bank_name || "AXIS BANK LIMITED"}, A/C NO. {previewSaleBill.account_number || "911020042168303"}, IFSC: {previewSaleBill.ifsc_code || "UTIB0000550"}, BRANCH {previewSaleBill.bank_branch || "BIDANASI, CUTTACK, ODISHA"}.
                </p>
              </div>

              {/* Footer */}
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "15px", borderTop: "1px solid #ddd", paddingTop: "8px" }}>
                <p style={{ fontSize: "9px", fontStyle: "italic", margin: 0 }}>This is a Computer Generated Invoice</p>
                <p style={{ fontSize: "9px", margin: 0 }}><strong>Company's PAN:</strong> {previewSaleBill.company_pan || "ARXPK7658Q"}</p>
              </div>
            </div>
          ) : (
            <p>No preview data available</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPreviewModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Payment Modal */}
      <Modal show={showPaymentModal} onHide={() => setShowPaymentModal(false)} size="lg" centered backdrop="static" keyboard={false}>
        <Modal.Header closeButton>
          <Modal.Title>Manage Payments - {activePaymentBill?.invoice_number}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row className="mb-4">
            <Col md={12}>
              <div className="p-3 bg-light rounded border d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-muted small">Total Bill Amount</div>
                  <h4 className="mb-0">₹{(Math.round(paymentSummary.bill_total || 0) || 0).toLocaleString("en-IN")}</h4>
                </div>
                <div className="text-center">
                  <div className="text-muted small">Settled (Rec + TDS + Ded)</div>
                  <h5 className="mb-0 text-success">₹{(Math.round(paymentSummary.total_settled || 0) || 0).toLocaleString("en-IN")}</h5>
                </div>
                <div className="text-end">
                  <div className="text-muted small">Difference</div>
                  <h5 className="mb-0 text-danger">
                    ₹{(Math.round((paymentSummary.bill_total || 0) - (paymentSummary.total_received || 0) - (paymentSummary.total_tds || 0) - (paymentSummary.total_deductions || 0) - (paymentSummary.advance_amount || 0)) || 0).toLocaleString("en-IN")}
                  </h5>
                </div>
              </div>
            </Col>
          </Row>

          <Card className="mb-4">
            <Card.Header className="bg-white fw-bold">{paymentFormData.id ? "Edit Payment" : "Add New Payment"}</Card.Header>
            <Card.Body>
              <Form>
                <Row className="g-3">
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label className="small">Payment Date</Form.Label>
                      <Form.Control 
                        type="date" 
                        value={paymentFormData.payment_date} 
                        onChange={(e) => setPaymentFormData({...paymentFormData, payment_date: e.target.value})}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label className="small">Amount Received</Form.Label>
                      <Form.Control 
                        type="number" 
                        placeholder="0.00"
                        value={paymentFormData.amount_received} 
                        onChange={(e) => setPaymentFormData({...paymentFormData, amount_received: e.target.value})}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label className="small">Payment Mode</Form.Label>
                      <Form.Select 
                        value={paymentFormData.payment_mode} 
                        onChange={(e) => setPaymentFormData({...paymentFormData, payment_mode: e.target.value})}
                      >
                        <option value="bank">Bank Transfer</option>
                        <option value="cash">Cash</option>
                        <option value="cheque">Cheque</option>
                        <option value="upi">UPI</option>
                        <option value="neft">NEFT</option>
                        <option value="proforma">Proforma Credit</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label className="small">TDS</Form.Label>
                      <Form.Control 
                        type="number" 
                        placeholder="0.00"
                        value={paymentFormData.tds} 
                        onChange={(e) => setPaymentFormData({...paymentFormData, tds: e.target.value})}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label className="small">Deductions</Form.Label>
                      <Form.Control 
                        type="number" 
                        placeholder="0.00"
                        value={paymentFormData.deductions} 
                        onChange={(e) => setPaymentFormData({...paymentFormData, deductions: e.target.value})}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label className="small">Reference No</Form.Label>
                      <Form.Control 
                        placeholder="Optional"
                        value={paymentFormData.reference_no} 
                        onChange={(e) => setPaymentFormData({...paymentFormData, reference_no: e.target.value})}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label className="small">Notes</Form.Label>
                      <Form.Control 
                        placeholder="Optional"
                        value={paymentFormData.notes} 
                        onChange={(e) => setPaymentFormData({...paymentFormData, notes: e.target.value})}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={12} className="d-flex justify-content-end gap-2">
                    {paymentFormData.id && (
                      <Button variant="secondary" size="sm" onClick={() => setPaymentFormData(prev => ({ ...prev, id: undefined, amount_received: "", tds: "", deductions: "", reference_no: "", notes: "" }))}>
                        Cancel
                      </Button>
                    )}
                    <Button variant="success" size="sm" onClick={handlePaymentSave}>
                      {paymentFormData.id ? "Update Payment" : "Save Payment"}
                    </Button>
                  </Col>
                </Row>
              </Form>
            </Card.Body>
          </Card>

          <h6 className="fw-bold mb-3">Payment History</h6>
          <div className="table-responsive">
            <Table striped bordered size="sm" className="small">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Received</th>
                  <th>TDS</th>
                  <th>Deduction</th>
                  <th>Total</th>
                  <th>Mode</th>
                  <th>Ref No</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {billPayments.length > 0 ? (
                  billPayments.map((p) => (
                    <tr key={p.id}>
                      <td>{moment(p.payment_date).format("DD-MM-YYYY")}</td>
                      <td className="fw-bold">₹{Number(p.amount_received || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                      <td className="text-muted">₹{Number(p.tds || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                      <td className="text-muted">₹{Number(p.deductions || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                      <td className="fw-bold text-success">
                        ₹{(Number(p.amount_received || 0) + Number(p.tds || 0) + Number(p.deductions || 0)).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                      <td>{p.payment_mode}</td>
                      <td>{p.reference_no || "-"}</td>
                      <td>
                        <Button variant="link" className="text-primary p-0 me-2" onClick={() => handleEditPayment(p)} title="Edit">
                          <PencilSquare size={14} />
                        </Button>
                        <Button variant="link" className="text-danger p-0" onClick={() => handleDeletePayment(p.id)} title="Delete">
                          <Trash size={14} />
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-3 text-muted">No payments recorded for this bill</td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPaymentModal(false)}>Close</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default SaleBills;