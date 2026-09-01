import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import BreadCrumb from "../../../components/BreadCrumb";
import SaleInvoiceForm from "./SaleInvoiceForm";
import salebillService from "../../../services/salebillService";
import moment from "moment";

const SaleInvoiceCreate = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    invoice_number: "",
    invoice_date: moment().format("YYYY-MM-DD"),
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
        reference_no: p.invoice_number || "",
        other_references: "Converted from Proforma",
      });
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleSave = async (payload) => {
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
      services: (cleanedPayload.services || []).map(calculateServiceTotals),
    };

    try {
      await salebillService.createSaleBill(updatedPayload);
      toast.success("Sale bill created successfully");
      navigate("/works/salebills");
    } catch (error) {
      console.error("Error saving sale bill:", error);
      const apiMsg = error?.message || error?.response?.data?.message || "";
      if (apiMsg.toLowerCase().includes("validation error") || apiMsg.toLowerCase().includes("unique")) {
        toast.error("Invoice Number already exists! Please use a unique Invoice Number.");
      } else if (apiMsg) {
        toast.error(apiMsg);
      } else {
        toast.error("Failed to save sale bill");
      }
    }
  };

  return (
    <div className="container-fluid py-3 my-4">
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap">
        <div>
          <h4>Create Sale Invoice</h4>
          <BreadCrumb
            pathname="/works/salebills/create"
            lastLabel="Create Sale Invoice"
            dynamicNames={{ works: "Works", salebills: "Sale Invoice" }}
          />
        </div>
      </div>

      <SaleInvoiceForm
        formData={formData}
        setFormData={setFormData}
        onSave={handleSave}
        onCancel={() => navigate("/works/salebills")}
        isEdit={false}
      />
    </div>
  );
};

export default SaleInvoiceCreate;
