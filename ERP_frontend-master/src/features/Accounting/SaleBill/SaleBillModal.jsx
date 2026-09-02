import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import { toast } from "react-toastify";
import branchService from "../../../services/branchService";
import { fetchUnits, createUnit } from "../../../services/AccountingSetup";
import Select from "react-select";

const SaleBillModal = ({ show, onHide, formData, setFormData, onSave, isEdit }) => {
  const [errors, setErrors] = useState({});
  const [branches, setBranches] = useState([]);
  const [units, setUnits] = useState([]);
  const [newUnitNames, setNewUnitNames] = useState([]);
  const [creatingUnitIndex, setCreatingUnitIndex] = useState(-1);

  const normalizeServices = (services = []) => {
    return services.map((service) => {
      const taxRate = Number(service.tax_rate || 0);
      let cgst = service.cgst != null ? Number(service.cgst) : 0;
      let sgst = service.sgst != null ? Number(service.sgst) : 0;
      let igst = service.igst != null ? Number(service.igst) : 0;

      // Only default to split if all are literally 0/missing but taxRate is present
      if (taxRate > 0 && cgst === 0 && sgst === 0 && igst === 0) {
         if (Number(service.igst_amount) > 0) {
             igst = taxRate;
         } else if (Number(service.cgst_amount) > 0 || Number(service.sgst_amount) > 0) {
             cgst = taxRate / 2;
             sgst = taxRate / 2;
         }
         // Do not auto fallback to state assumption here as we don't always have global formData scope.
         // That's handled by SaleBills.jsx which maps the entire bill correctly beforehand.
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
  };

  useEffect(() => {
    const loadLookups = async () => {
      const [branchData, unitData] = await Promise.all([branchService.getAll(), fetchUnits()]);
      setBranches(branchData || []);
      setUnits(unitData || []);
    };

    if (show) {
      loadLookups();
    }

    if (show && !formData.services?.length) {
      setFormData((prev) => ({
        ...prev,
        status: prev.status || "pending",
        services: normalizeServices([
          {
            service_name: "",
            description: "",
            hsn_sac: "",
            unit: "",
            quantity: 1,
            rate: 0,
            is_taxable: true,
            gst_mode: "exclusive",
            cgst: 0,
            sgst: 0,
            igst: 0,
          },
        ]),
      }));
    } else if (show && formData.services?.length) {
      const normalizedServices = normalizeServices(formData.services);
      if (JSON.stringify(normalizedServices) !== JSON.stringify(formData.services)) {
        setFormData((prev) => ({ ...prev, services: normalizedServices }));
      }
    }
  }, [show, formData.services, setFormData]);

  useEffect(() => {
    setNewUnitNames((formData.services || []).map(() => ""));
  }, [formData.services?.length]);

  const handleNewUnitNameChange = (index, value) => {
    setNewUnitNames((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handleAddUnit = async (index) => {
    const unitName = (newUnitNames[index] || "").trim();
    if (!unitName) {
      toast.warning("Enter a unit name to add");
      return;
    }

    setCreatingUnitIndex(index);
    try {
      const response = await createUnit({ name: unitName });
      const createdUnit = response?.data || response;

      if (createdUnit?.id) {
        setUnits((prev) => [...prev, createdUnit]);
        handleServiceChange(index, "unit", createdUnit.name || unitName);
        setNewUnitNames((prev) => {
          const next = [...prev];
          next[index] = "";
          return next;
        });
        toast.success("Unit added successfully");
      } else {
        toast.error(response?.message || "Failed to create unit");
      }
    } catch (error) {
      console.error("Failed to create unit:", error);
      toast.error(error?.message || "Failed to create unit");
    } finally {
      setCreatingUnitIndex(-1);
    }
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

    const main = Math.floor(num);
    const paise = Math.round((num - main) * 100);
    let result = toWords(main) + " rupees";
    if (paise > 0) result += " and " + toWords(paise) + " paise";
    return result + " only";
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.invoice_number?.trim()) newErrors.invoice_number = "Invoice number required";
    if (!formData.invoice_date) newErrors.invoice_date = "Invoice date required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInput = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleServiceChange = (index, field, value) => {
    const services = [...(formData.services || [])];
    let normalizedValue = value;

    if (field === "is_taxable") {
      normalizedValue = Boolean(value);
    } else if (["quantity", "rate", "cgst", "sgst", "igst"].includes(field)) {
      if (value === "") {
        normalizedValue = "";
      } else {
        let str = String(value);
        if (/^0[0-9]+(\.[0-9]*)?$/.test(str)) {
          str = str.replace(/^0+/, '');
          if (str.startsWith('.')) str = '0' + str;
          if (str === '') str = '0';
        }
        if (field === "quantity" && str.includes('.')) {
          const parts = str.split('.');
          if (parts[1] && parts[1].length > 3) {
            str = parts[0] + '.' + parts[1].slice(0, 3);
          }
        }
        normalizedValue = str;
      }
    }

    services[index] = {
      ...services[index],
      [field]: normalizedValue,
    };
    setFormData((prev) => ({ ...prev, services }));
  };

  const addService = () => {
    setFormData((prev) => ({
      ...prev,
      services: [
        ...((prev.services && Array.isArray(prev.services)) ? prev.services : []),
        {
          service_name: "",
          description: "",
          hsn_sac: "",
          unit: "",
          quantity: 1,
          rate: 0,
          cgst: 0,
          sgst: 0,
          igst: 0,
          is_taxable: true,
          gst_mode: "exclusive",
        },
      ],
    }));
  };

  const removeService = (idx) => {
    const services = [...(formData.services || [])];
    services.splice(idx, 1);
    setFormData((prev) => ({ ...prev, services }));
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSave(formData);
  };

  const summaryTotals = (formData.services || []).reduce(
    (acc, service) => {
      const quantity = Number(service.quantity || 0);
      const rate = Number(service.rate || 0);
      const baseAmount = quantity * rate;
      const cgst = Number(service.cgst || 0);
      const sgst = Number(service.sgst || 0);
      const igst = Number(service.igst || 0);
      const totalTaxRate = cgst + sgst + igst;
      const gstMode = service.gst_mode || "exclusive";

      let lineTax = 0;
      let lineTotal = baseAmount;
      let taxableValue = baseAmount;

      if (service.is_taxable) {
        if (gstMode === "inclusive") {
          lineTotal = baseAmount;
          taxableValue = baseAmount / (1 + totalTaxRate / 100 || 1);
          lineTax = baseAmount - taxableValue;
        } else {
          lineTax = (baseAmount * totalTaxRate) / 100;
          lineTotal = baseAmount + lineTax;
        }
      }

      acc.subTotal += taxableValue;
      acc.taxTotal += lineTax;
      acc.grandTotal += lineTotal;
      return acc;
    },
    { subTotal: 0, taxTotal: 0, grandTotal: 0 }
  );

  return (
    <>
      <style>{`
        .sale-invoice-wide-modal .modal-dialog {
          max-width: 95vw !important;
          width: 95vw !important;
          margin: 1.5rem auto !important;
        }
        @media (min-width: 1600px) {
          .sale-invoice-wide-modal .modal-dialog {
            max-width: 1520px !important;
            width: 1520px !important;
          }
        }
        .sale-invoice-wide-modal .modal-content {
          border-radius: 8px;
          border: none;
          box-shadow: 0 10px 30px rgba(0,0,0,0.15);
        }
      `}</style>
      <Modal
        show={show}
        onHide={onHide}
        backdrop="static"
        keyboard={false}
        centered
        className="sale-invoice-wide-modal"
        dialogClassName="sale-invoice-wide-modal"
      >
        <Modal.Header closeButton className="py-2 px-4 bg-light border-bottom">
          <Modal.Title className="fs-5 fw-bold text-dark">
            {isEdit ? "Edit" : "Create"} Sale Invoice
          </Modal.Title>
        </Modal.Header>
        <Modal.Body
          className="p-3 p-md-4"
          style={{
            maxHeight: "calc(92vh - 110px)",
            overflowY: "auto",
            overflowX: "hidden",
            backgroundColor: "#f8f9fa",
          }}
        >
          <Form>
          {/* Section 1: Basic Invoice Information */}
          <div className="p-3 mb-3 bg-white border rounded shadow-sm">
            <Row className="g-2">
              <Col md={4} sm={6}>
                <Form.Group>
                  <Form.Label className="small fw-semibold mb-1">
                    Invoice Number <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    size="sm"
                    name="invoice_number"
                    value={formData.invoice_number || ""}
                    onChange={handleInput}
                    isInvalid={!!errors.invoice_number}
                    placeholder="e.g. INV-001"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.invoice_number}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={4} sm={6}>
                <Form.Group>
                  <Form.Label className="small fw-semibold mb-1">
                    Invoice Date <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    size="sm"
                    type="date"
                    name="invoice_date"
                    value={formData.invoice_date || ""}
                    onChange={handleInput}
                    isInvalid={!!errors.invoice_date}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.invoice_date}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={4} sm={12}>
                <Form.Group>
                  <Form.Label className="small fw-semibold mb-1">Assigned To (Site / Branch)</Form.Label>
                  <Select
                    options={branches.map((branch) => ({
                      value: String(branch.id),
                      label: branch.name,
                    }))}
                    value={
                      formData.assigned_to
                        ? {
                            value: String(formData.assigned_to),
                            label: branches.find((b) => String(b.id) === String(formData.assigned_to))?.name || "",
                          }
                        : null
                    }
                    onChange={(selected) => {
                      const selectedBranch = selected ? branches.find((b) => String(b.id) === String(selected.value)) : null;
                      setFormData((prev) => ({
                        ...prev,
                        assigned_to: selected ? selected.value : "",
                        assignedBranch: selectedBranch,
                      }));
                    }}
                    placeholder="Select Branch"
                    isSearchable={true}
                    isClearable={true}
                    styles={{
                      control: (base) => ({
                        ...base,
                        borderColor: "#ced4da",
                        minHeight: "31px",
                        height: "31px",
                        fontSize: "0.875rem",
                      }),
                      valueContainer: (base) => ({
                        ...base,
                        padding: "0 6px",
                      }),
                      input: (base) => ({
                        ...base,
                        margin: "0px",
                      }),
                      indicatorsContainer: (base) => ({
                        ...base,
                        height: "31px",
                      }),
                    }}
                  />
                </Form.Group>
              </Col>
            </Row>
          </div>

          {/* Section 2: Consignee & Buyer Information side-by-side */}
          <Row className="g-3 mb-3">
            {/* Consignee Box */}
            <Col lg={6}>
              <div className="p-3 bg-white border rounded shadow-sm h-100">
                <h6 className="fw-bold text-primary mb-2 border-bottom pb-1" style={{ fontSize: "0.95rem" }}>
                  Consignee Details
                </h6>
                <Row className="g-2">
                  <Col sm={6}>
                    <Form.Group>
                      <Form.Label className="small fw-semibold mb-1">Consignee Name</Form.Label>
                      <Form.Control size="sm" name="consignee_name" value={formData.consignee_name || ""} onChange={handleInput} placeholder="Name" />
                    </Form.Group>
                  </Col>
                  <Col sm={6}>
                    <Form.Group>
                      <Form.Label className="small fw-semibold mb-1">GSTIN</Form.Label>
                      <Form.Control size="sm" name="consignee_gstin" value={formData.consignee_gstin || ""} onChange={handleInput} placeholder="GSTIN" />
                    </Form.Group>
                  </Col>
                  <Col sm={12}>
                    <Form.Group>
                      <Form.Label className="small fw-semibold mb-1">Address</Form.Label>
                      <Form.Control size="sm" name="consignee_address" value={formData.consignee_address || ""} onChange={handleInput} placeholder="Full address" />
                    </Form.Group>
                  </Col>
                  <Col sm={6}>
                    <Form.Group>
                      <Form.Label className="small fw-semibold mb-1">State</Form.Label>
                      <Form.Control size="sm" name="consignee_state" value={formData.consignee_state || ""} onChange={handleInput} placeholder="State" />
                    </Form.Group>
                  </Col>
                  <Col sm={6}>
                    <Form.Group>
                      <Form.Label className="small fw-semibold mb-1">State Code</Form.Label>
                      <Form.Control size="sm" name="consignee_state_code" value={formData.consignee_state_code || ""} onChange={handleInput} placeholder="Code (e.g. 27)" />
                    </Form.Group>
                  </Col>
                </Row>
              </div>
            </Col>

            {/* Buyer Box */}
            <Col lg={6}>
              <div className="p-3 bg-white border rounded shadow-sm h-100">
                <h6 className="fw-bold text-primary mb-2 border-bottom pb-1" style={{ fontSize: "0.95rem" }}>
                  Buyer Details
                </h6>
                <Row className="g-2">
                  <Col sm={6}>
                    <Form.Group>
                      <Form.Label className="small fw-semibold mb-1">Buyer Name</Form.Label>
                      <Form.Control size="sm" name="buyer_name" value={formData.buyer_name || ""} onChange={handleInput} placeholder="Name" />
                    </Form.Group>
                  </Col>
                  <Col sm={6}>
                    <Form.Group>
                      <Form.Label className="small fw-semibold mb-1">GSTIN</Form.Label>
                      <Form.Control size="sm" name="buyer_gstin" value={formData.buyer_gstin || ""} onChange={handleInput} placeholder="GSTIN" />
                    </Form.Group>
                  </Col>
                  <Col sm={12}>
                    <Form.Group>
                      <Form.Label className="small fw-semibold mb-1">Address</Form.Label>
                      <Form.Control size="sm" name="buyer_address" value={formData.buyer_address || ""} onChange={handleInput} placeholder="Full address" />
                    </Form.Group>
                  </Col>
                  <Col sm={6}>
                    <Form.Group>
                      <Form.Label className="small fw-semibold mb-1">State</Form.Label>
                      <Form.Control size="sm" name="buyer_state" value={formData.buyer_state || ""} onChange={handleInput} placeholder="State" />
                    </Form.Group>
                  </Col>
                  <Col sm={6}>
                    <Form.Group>
                      <Form.Label className="small fw-semibold mb-1">State Code</Form.Label>
                      <Form.Control size="sm" name="buyer_state_code" value={formData.buyer_state_code || ""} onChange={handleInput} placeholder="Code (e.g. 27)" />
                    </Form.Group>
                  </Col>
                </Row>
              </div>
            </Col>
          </Row>

          {/* Section 3: E-Invoice, Dispatch & References */}
          <div className="p-3 mb-3 bg-white border rounded shadow-sm">
            <h6 className="fw-bold text-secondary mb-2 border-bottom pb-1" style={{ fontSize: "0.95rem" }}>
              E-Invoice &amp; Dispatch References
            </h6>
            <Row className="g-2">
              <Col lg={3} md={4} sm={6}>
                <Form.Group>
                  <Form.Label className="small fw-semibold mb-1">IRN</Form.Label>
                  <Form.Control size="sm" name="irn" value={formData.irn || ""} onChange={handleInput} placeholder="IRN number" />
                </Form.Group>
              </Col>
              <Col lg={3} md={4} sm={6}>
                <Form.Group>
                  <Form.Label className="small fw-semibold mb-1">Ack No</Form.Label>
                  <Form.Control size="sm" name="ack_no" value={formData.ack_no || ""} onChange={handleInput} placeholder="Ack No" />
                </Form.Group>
              </Col>
              <Col lg={3} md={4} sm={6}>
                <Form.Group>
                  <Form.Label className="small fw-semibold mb-1">Ack Date</Form.Label>
                  <Form.Control size="sm" type="date" name="ack_date" value={formData.ack_date || ""} onChange={handleInput} />
                </Form.Group>
              </Col>
              <Col lg={3} md={4} sm={6}>
                <Form.Group>
                  <Form.Label className="small fw-semibold mb-1">Reference No</Form.Label>
                  <Form.Control size="sm" name="reference_no" value={formData.reference_no || ""} onChange={handleInput} placeholder="Ref No" />
                </Form.Group>
              </Col>
              <Col lg={3} md={4} sm={6}>
                <Form.Group>
                  <Form.Label className="small fw-semibold mb-1">Other References</Form.Label>
                  <Form.Control size="sm" name="other_references" value={formData.other_references || ""} onChange={handleInput} placeholder="Other refs" />
                </Form.Group>
              </Col>
              <Col lg={3} md={4} sm={6}>
                <Form.Group>
                  <Form.Label className="small fw-semibold mb-1">Buyer Order No</Form.Label>
                  <Form.Control size="sm" name="buyer_order_no" value={formData.buyer_order_no || ""} onChange={handleInput} placeholder="Order No" />
                </Form.Group>
              </Col>
              <Col lg={3} md={4} sm={6}>
                <Form.Group>
                  <Form.Label className="small fw-semibold mb-1">Buyer Order Date</Form.Label>
                  <Form.Control size="sm" type="date" name="buyer_order_date" value={formData.buyer_order_date || ""} onChange={handleInput} />
                </Form.Group>
              </Col>
              <Col lg={3} md={4} sm={6}>
                <Form.Group>
                  <Form.Label className="small fw-semibold mb-1">Dispatch Doc No</Form.Label>
                  <Form.Control size="sm" name="dispatch_doc_no" value={formData.dispatch_doc_no || ""} onChange={handleInput} placeholder="Doc No" />
                </Form.Group>
              </Col>
              <Col lg={3} md={4} sm={6}>
                <Form.Group>
                  <Form.Label className="small fw-semibold mb-1">Delivery Note Date</Form.Label>
                  <Form.Control size="sm" type="date" name="delivery_note_date" value={formData.delivery_note_date || ""} onChange={handleInput} />
                </Form.Group>
              </Col>
              <Col lg={3} md={4} sm={6}>
                <Form.Group>
                  <Form.Label className="small fw-semibold mb-1">Dispatched Through</Form.Label>
                  <Form.Control size="sm" name="dispatched_through" value={formData.dispatched_through || ""} onChange={handleInput} placeholder="Carrier/Transport" />
                </Form.Group>
              </Col>
              <Col lg={3} md={4} sm={6}>
                <Form.Group>
                  <Form.Label className="small fw-semibold mb-1">Destination</Form.Label>
                  <Form.Control size="sm" name="destination" value={formData.destination || ""} onChange={handleInput} placeholder="City/Place" />
                </Form.Group>
              </Col>
              <Col lg={3} md={4} sm={6}>
                <Form.Group>
                  <Form.Label className="small fw-semibold mb-1">Terms of Delivery</Form.Label>
                  <Form.Control size="sm" name="terms_of_delivery" value={formData.terms_of_delivery || ""} onChange={handleInput} placeholder="Delivery terms" />
                </Form.Group>
              </Col>
            </Row>
          </div>

          {/* Section 4: Services / Items */}
          <div className="p-3 mb-3 bg-white border rounded shadow-sm">
            <div className="d-flex justify-content-between align-items-center mb-2 border-bottom pb-1">
              <h6 className="fw-bold text-dark mb-0" style={{ fontSize: "0.95rem" }}>
                Services / Items
              </h6>
              <Button variant="outline-primary" size="sm" className="px-2 py-0" onClick={addService}>
                + Add Service
              </Button>
            </div>

            {(formData.services || []).map((service, idx) => {
              const quantity = Number(service.quantity || 0);
              const rate = Number(service.rate || 0);
              const baseAmount = quantity * rate;
              const cgst = Number(service.cgst || 0);
              const sgst = Number(service.sgst || 0);
              const igst = Number(service.igst || 0);
              const totalTaxRate = cgst + sgst + igst;
              const gstMode = service.gst_mode || "exclusive";

              let lineTax = 0;
              let lineTotal = baseAmount;

              if (service.is_taxable) {
                if (gstMode === "inclusive") {
                  lineTotal = baseAmount;
                  const taxableValue = baseAmount / (1 + totalTaxRate / 100 || 1);
                  lineTax = baseAmount - taxableValue;
                } else {
                  lineTax = (baseAmount * totalTaxRate) / 100;
                  lineTotal = baseAmount + lineTax;
                }
              }

              const totalInWords = numberToWords(lineTotal);

              return (
                <div key={idx} className="mb-2 p-2 border rounded bg-light position-relative">
                  {formData.services?.length > 1 && (
                    <Button
                      variant="outline-danger"
                      size="sm"
                      className="position-absolute end-0 top-0 m-1 py-0 px-1"
                      style={{ fontSize: "0.75rem", lineHeight: 1.2 }}
                      onClick={() => removeService(idx)}
                      title="Remove Item"
                    >
                      &times;
                    </Button>
                  )}

                  {/* Row 1: Basic Service Info & Quantity / Rate */}
                  <Row className="g-2 mb-2">
                    <Col lg={3} md={4} sm={6}>
                      <Form.Group>
                        <Form.Label className="small fw-semibold mb-0">Service Name</Form.Label>
                        <Form.Control
                          size="sm"
                          placeholder="Service Name"
                          value={service.service_name || ""}
                          onChange={(e) => handleServiceChange(idx, "service_name", e.target.value)}
                        />
                      </Form.Group>
                    </Col>
                    <Col lg={3} md={4} sm={6}>
                      <Form.Group>
                        <Form.Label className="small fw-semibold mb-0">Description</Form.Label>
                        <Form.Control
                          size="sm"
                          placeholder="Description"
                          value={service.description || ""}
                          onChange={(e) => handleServiceChange(idx, "description", e.target.value)}
                        />
                      </Form.Group>
                    </Col>
                    <Col lg={2} md={4} sm={4}>
                      <Form.Group>
                        <Form.Label className="small fw-semibold mb-0">HSN/SAC</Form.Label>
                        <Form.Control
                          size="sm"
                          placeholder="HSN/SAC"
                          value={service.hsn_sac || ""}
                          onChange={(e) => handleServiceChange(idx, "hsn_sac", e.target.value)}
                        />
                      </Form.Group>
                    </Col>
                    <Col lg={2} md={4} sm={4}>
                      <Form.Group>
                        <Form.Label className="small fw-semibold mb-0">Unit</Form.Label>
                        <Form.Select
                          size="sm"
                          value={service.unit || ""}
                          onChange={(e) => handleServiceChange(idx, "unit", e.target.value)}
                        >
                          <option value="">Select Unit</option>
                          {units.map((unitItem) => (
                            <option key={unitItem.id || unitItem} value={unitItem.name || unitItem}>
                              {unitItem.name || unitItem}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col lg={1} md={2} sm={2}>
                      <Form.Group>
                        <Form.Label className="small fw-semibold mb-0">Qty</Form.Label>
                        <Form.Control
                          size="sm"
                          type="number"
                          placeholder="Qty"
                          value={service.quantity !== undefined && service.quantity !== null ? service.quantity : ""}
                          onChange={(e) => handleServiceChange(idx, "quantity", e.target.value)}
                          min="0.001"
                          step="0.001"
                        />
                      </Form.Group>
                    </Col>
                    <Col lg={1} md={2} sm={2}>
                      <Form.Group>
                        <Form.Label className="small fw-semibold mb-0">Rate</Form.Label>
                        <Form.Control
                          size="sm"
                          type="number"
                          placeholder="Rate"
                          value={service.rate !== undefined && service.rate !== null ? service.rate : ""}
                          onChange={(e) => handleServiceChange(idx, "rate", e.target.value)}
                          min={0}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* Add unit quick creator row if selected */}
                  <Row className="g-2 mb-2">
                    <Col md={4} sm={6}>
                      <div className="d-flex gap-1">
                        <Form.Control
                          size="sm"
                          type="text"
                          placeholder="Add new unit name"
                          value={newUnitNames[idx] || ""}
                          onChange={(e) => handleNewUnitNameChange(idx, e.target.value)}
                        />
                        <Button
                          size="sm"
                          variant="outline-secondary"
                          className="text-nowrap py-0 px-2"
                          onClick={() => handleAddUnit(idx)}
                          disabled={creatingUnitIndex === idx}
                        >
                          {creatingUnitIndex === idx ? "..." : "+ Unit"}
                        </Button>
                      </div>
                    </Col>
                  </Row>

                  {/* Row 2: Tax Configuration & Calculation */}
                  <Row className="g-2 align-items-center">
                    <Col xs="auto">
                      <Form.Check
                        type="checkbox"
                        id={`taxable-check-${idx}`}
                        label={<span className="small fw-semibold">Taxable</span>}
                        checked={!!service.is_taxable}
                        onChange={(e) => handleServiceChange(idx, "is_taxable", e.target.checked)}
                      />
                    </Col>
                    <Col xs="auto">
                      <Form.Select
                        size="sm"
                        value={service.gst_mode || "exclusive"}
                        onChange={(e) => handleServiceChange(idx, "gst_mode", e.target.value)}
                        style={{ width: "110px" }}
                      >
                        <option value="exclusive">Exclusive</option>
                        <option value="inclusive">Inclusive</option>
                      </Form.Select>
                    </Col>
                    <Col xs="auto">
                      <div className="d-flex align-items-center gap-1">
                        <span className="small fw-semibold text-nowrap text-secondary">CGST (%)</span>
                        <Form.Control
                          size="sm"
                          type="number"
                          placeholder="CGST %"
                          value={service.cgst !== undefined && service.cgst !== null ? service.cgst : ""}
                          onChange={(e) => handleServiceChange(idx, "cgst", e.target.value)}
                          min={0}
                          style={{ width: "65px" }}
                          title="CGST (%)"
                        />
                      </div>
                    </Col>
                    <Col xs="auto">
                      <div className="d-flex align-items-center gap-1">
                        <span className="small fw-semibold text-nowrap text-secondary">SGST (%)</span>
                        <Form.Control
                          size="sm"
                          type="number"
                          placeholder="SGST %"
                          value={service.sgst !== undefined && service.sgst !== null ? service.sgst : ""}
                          onChange={(e) => handleServiceChange(idx, "sgst", e.target.value)}
                          min={0}
                          style={{ width: "65px" }}
                          title="SGST (%)"
                        />
                      </div>
                    </Col>
                    <Col xs="auto">
                      <div className="d-flex align-items-center gap-1">
                        <span className="small fw-semibold text-nowrap text-secondary">IGST (%)</span>
                        <Form.Control
                          size="sm"
                          type="number"
                          placeholder="IGST %"
                          value={service.igst !== undefined && service.igst !== null ? service.igst : ""}
                          onChange={(e) => handleServiceChange(idx, "igst", e.target.value)}
                          min={0}
                          style={{ width: "65px" }}
                          title="IGST (%)"
                        />
                      </div>
                    </Col>
                    <Col xs="auto" className="ms-auto d-flex align-items-center gap-3">
                      <div className="small text-muted">
                        Tax: <strong className="text-dark">₹{lineTax.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 3 })}</strong> ({totalTaxRate}%)
                      </div>
                      <div className="small">
                        Total: <strong className="text-success fs-6">₹{lineTotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 3 })}</strong>
                      </div>
                    </Col>
                  </Row>
                  {totalInWords && (
                    <div className="text-muted mt-1" style={{ fontSize: "0.75rem" }}>
                      <em>In words: {totalInWords}</em>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Section 5: Terms, Delivery & Banking Details */}
          <div className="p-3 mb-3 bg-white border rounded shadow-sm">
            <h6 className="fw-bold text-secondary mb-2 border-bottom pb-1" style={{ fontSize: "0.95rem" }}>
              Terms &amp; Bank Details
            </h6>
            <Row className="g-2 mb-2">
              <Col md={4} sm={6}>
                <Form.Group>
                  <Form.Label className="small fw-semibold mb-1">Status</Form.Label>
                  <Form.Select size="sm" name="status" value={formData.status || "pending"} onChange={handleInput}>
                    <option value="pending">pending</option>
                    <option value="paid">paid</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4} sm={6}>
                <Form.Group>
                  <Form.Label className="small fw-semibold mb-1">Payment Terms</Form.Label>
                  <Form.Control size="sm" name="payment_terms" value={formData.payment_terms || ""} onChange={handleInput} placeholder="e.g. Net 30 days" />
                </Form.Group>
              </Col>
              <Col md={4} sm={12}>
                <Form.Group>
                  <Form.Label className="small fw-semibold mb-1">Delivery Note</Form.Label>
                  <Form.Control size="sm" name="delivery_note" value={formData.delivery_note || ""} onChange={handleInput} placeholder="Delivery notes" />
                </Form.Group>
              </Col>
            </Row>

            <Row className="g-2">
              <Col lg={3} md={6} sm={6}>
                <Form.Group>
                  <Form.Label className="small fw-semibold mb-1">Company PAN</Form.Label>
                  <Form.Control size="sm" name="company_pan" value={formData.company_pan || ""} onChange={handleInput} placeholder="PAN Number" />
                </Form.Group>
              </Col>
              <Col lg={3} md={6} sm={6}>
                <Form.Group>
                  <Form.Label className="small fw-semibold mb-1">Bank Name</Form.Label>
                  <Form.Control size="sm" name="bank_name" value={formData.bank_name || ""} onChange={handleInput} placeholder="Bank Name" />
                </Form.Group>
              </Col>
              <Col lg={3} md={6} sm={6}>
                <Form.Group>
                  <Form.Label className="small fw-semibold mb-1">Account Number</Form.Label>
                  <Form.Control size="sm" name="account_number" value={formData.account_number || ""} onChange={handleInput} placeholder="Account No" />
                </Form.Group>
              </Col>
              <Col lg={3} md={6} sm={6}>
                <Form.Group>
                  <Form.Label className="small fw-semibold mb-1">IFSC Code</Form.Label>
                  <Form.Control size="sm" name="ifsc_code" value={formData.ifsc_code || ""} onChange={handleInput} placeholder="IFSC Code" />
                </Form.Group>
              </Col>
            </Row>
          </div>

          {/* Section 6: Grand Totals Summary Card */}
          <div className="p-3 bg-light rounded border d-flex flex-wrap justify-content-between align-items-center gap-2">
            <div className="text-center flex-fill">
              <div className="text-muted small fw-semibold">Subtotal (Taxable)</div>
              <h6 className="mb-0 fw-bold">₹{summaryTotals.subTotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 3 })}</h6>
            </div>
            <div className="text-center flex-fill border-start border-end px-2">
              <div className="text-muted small fw-semibold">Total Tax</div>
              <h6 className="mb-0 text-danger fw-bold">₹{summaryTotals.taxTotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 3 })}</h6>
            </div>
            <div className="text-center flex-fill">
              <div className="text-muted small fw-semibold">Grand Total</div>
              <h5 className="mb-0 text-success fw-bold">₹{summaryTotals.grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 3 })}</h5>
            </div>
          </div>
        </Form>
      </Modal.Body>
      <Modal.Footer className="py-2 px-3 bg-light border-top">
        <Button variant="secondary" size="sm" onClick={onHide}>
          Cancel
        </Button>
        <Button variant="success" size="sm" className="px-3" onClick={handleSubmit}>
          {isEdit ? "Update Sale Invoice" : "Create Sale Invoice"}
        </Button>
      </Modal.Footer>
      </Modal>
    </>
  );
};

export default SaleBillModal;
