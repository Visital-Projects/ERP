import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import BreadCrumb from "../../../components/BreadCrumb";
import SaleInvoiceForm from "./SaleInvoiceForm";
import salebillService from "../../../services/salebillService";
import moment from "moment";
import { Spinner } from "react-bootstrap";

const SaleInvoiceEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState(null);

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
          const stateStr = String(
            saleBill.buyer_state_code ||
              saleBill.consignee_state_code ||
              saleBill.buyer_state ||
              saleBill.consignee_state ||
              ""
          ).toLowerCase();
          const isInterState =
            stateStr &&
            stateStr !== "21" &&
            !stateStr.includes("odisha") &&
            stateStr !== "od";

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
        service_name: service.service_name || "",
        description: service.description || "",
        hsn_sac: service.hsn_sac || "",
        unit: service.unit || "",
        quantity: service.quantity != null ? Number(service.quantity) : 1,
        rate: service.rate != null ? Number(service.rate) : 0,
        is_taxable: service.is_taxable != null ? service.is_taxable : true,
        gst_mode: service.gst_mode || "exclusive",
        cgst,
        sgst,
        igst,
        tax_rate: service.tax_rate != null ? Number(service.tax_rate) : taxRate,
      };
    });

    return {
      ...saleBill,
      invoice_number: saleBill.invoice_number || "",
      invoice_date: saleBill.invoice_date
        ? moment(saleBill.invoice_date).format("YYYY-MM-DD")
        : "",
      status: saleBill.status || "pending",
      irn: saleBill.irn || "",
      ack_no: saleBill.ack_no || "",
      ack_date: saleBill.ack_date
        ? moment(saleBill.ack_date).format("YYYY-MM-DD")
        : "",
      consignee_name: saleBill.consignee_name || "",
      consignee_address: saleBill.consignee_address || "",
      consignee_gstin: saleBill.consignee_gstin || "",
      consignee_state: saleBill.consignee_state || "",
      consignee_state_code: saleBill.consignee_state_code || "",
      buyer_name: saleBill.buyer_name || "",
      buyer_address: saleBill.buyer_address || "",
      buyer_gstin: saleBill.buyer_gstin || "",
      buyer_state: saleBill.buyer_state || "",
      buyer_state_code: saleBill.buyer_state_code || "",
      delivery_note: saleBill.delivery_note || "",
      payment_terms: saleBill.payment_terms || "",
      reference_no: saleBill.reference_no || "",
      other_references: saleBill.other_references || "",
      buyer_order_no: saleBill.buyer_order_no || "",
      buyer_order_date: saleBill.buyer_order_date
        ? moment(saleBill.buyer_order_date).format("YYYY-MM-DD")
        : "",
      dispatch_doc_no: saleBill.dispatch_doc_no || "",
      delivery_note_date: saleBill.delivery_note_date
        ? moment(saleBill.delivery_note_date).format("YYYY-MM-DD")
        : "",
      dispatched_through: saleBill.dispatched_through || "",
      destination: saleBill.destination || "",
      terms_of_delivery: saleBill.terms_of_delivery || "",
      company_pan: saleBill.company_pan || "",
      assigned_to: saleBill.assigned_to != null ? String(saleBill.assigned_to) : "",
      bank_name: saleBill.bank_name || "",
      account_number: saleBill.account_number || "",
      ifsc_code: saleBill.ifsc_code || "",
      bank_branch: saleBill.bank_branch || "",
      services,
    };
  };

  const numberToWords = (num) => {
    if (num === 0) return "zero rupees only";
    const a = [
      "",
      "one",
      "two",
      "three",
      "four",
      "five",
      "six",
      "seven",
      "eight",
      "nine",
      "ten",
      "eleven",
      "twelve",
      "thirteen",
      "fourteen",
      "fifteen",
      "sixteen",
      "seventeen",
      "eighteen",
      "nineteen",
    ];
    const b = [
      "",
      "",
      "twenty",
      "thirty",
      "forty",
      "fifty",
      "sixty",
      "seventy",
      "eighty",
      "ninety",
    ];

    const toWords = (n) => {
      if (n < 20) return a[n];
      if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? " " + a[n % 10] : "");
      if (n < 1000)
        return (
          a[Math.floor(n / 100)] +
          " hundred" +
          (n % 100 ? " " + toWords(n % 100) : "")
        );
      if (n < 100000)
        return (
          toWords(Math.floor(n / 1000)) +
          " thousand" +
          (n % 1000 ? " " + toWords(n % 1000) : "")
        );
      if (n < 10000000)
        return (
          toWords(Math.floor(n / 100000)) +
          " lakh" +
          (n % 100000 ? " " + toWords(n % 100000) : "")
        );
      return (
        toWords(Math.floor(n / 10000000)) +
        " crore" +
        (n % 10000000 ? " " + toWords(n % 10000000) : "")
      );
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
      taxable_value: service.is_taxable
        ? gstMode === "inclusive"
          ? baseAmount - taxAmount
          : baseAmount
        : baseAmount,
    };
  };

  useEffect(() => {
    const fetchBill = async () => {
      if (!id) {
        toast.error("Invalid Sale Invoice ID");
        navigate("/works/salebills");
        return;
      }

      setLoading(true);
      try {
        const res = await salebillService.getSaleBillById(id);
        const billData = res?.data || res;
        if (!billData) {
          toast.error("Sale Invoice not found");
          navigate("/works/salebills");
          return;
        }
        setFormData(normalizeSaleBill(billData));
      } catch (err) {
        console.error("Failed to load sale bill details for editing:", err);
        toast.error("Failed to load sale bill details for editing");
        navigate("/works/salebills");
      } finally {
        setLoading(false);
      }
    };

    fetchBill();
  }, [id, navigate]);

  const handleUpdate = async (payload) => {
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
      await salebillService.updateSaleBill(id, updatedPayload);
      toast.success("Sale bill updated successfully");
      navigate("/works/salebills");
    } catch (error) {
      console.error("Error updating sale bill:", error);
      const apiMsg = error?.message || error?.response?.data?.message || "";
      if (apiMsg.toLowerCase().includes("validation error") || apiMsg.toLowerCase().includes("unique")) {
        toast.error("Invoice Number already exists! Please use a unique Invoice Number.");
      } else if (apiMsg) {
        toast.error(apiMsg);
      } else {
        toast.error("Failed to update sale bill");
      }
    }
  };

  if (loading) {
    return (
      <div className="container-fluid py-5 text-center">
        <Spinner animation="border" variant="success" />
        <p className="mt-2 text-muted">Loading Sale Invoice details...</p>
      </div>
    );
  }

  if (!formData) {
    return null;
  }

  return (
    <div className="container-fluid py-3 my-4">
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap">
        <div>
          <h4>Edit Sale Invoice</h4>
          <BreadCrumb
            pathname={`/works/salebills/edit/${id}`}
            lastLabel="Edit Sale Invoice"
            dynamicNames={{ works: "Works", salebills: "Sale Invoice" }}
          />
        </div>
      </div>

      <SaleInvoiceForm
        formData={formData}
        setFormData={setFormData}
        onSave={handleUpdate}
        onCancel={() => navigate("/works/salebills")}
        isEdit={true}
      />
    </div>
  );
};

export default SaleInvoiceEdit;
