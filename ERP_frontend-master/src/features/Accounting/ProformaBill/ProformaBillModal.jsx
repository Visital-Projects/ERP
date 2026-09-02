import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import { toast } from "react-toastify";
import branchService from "../../../services/branchService";
import { fetchUnits, createUnit } from "../../../services/AccountingSetup";
import Select from "react-select";

const ProformaBillModal = ({ show, onHide, formData, setFormData, onSave, isEdit }) => {
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
         // That's handled by ProformaBills.jsx which maps the entire bill correctly beforehand.
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
    <Modal show={show} onHide={onHide} backdrop="static" keyboard={false} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>{isEdit ? "Edit" : "Create"} Proforma Invoice</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Row className="g-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Invoice Number</Form.Label>
                <Form.Control
                  name="invoice_number"
                  value={formData.invoice_number || ""}
                  onChange={handleInput}
                  isInvalid={!!errors.invoice_number}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.invoice_number}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Invoice Date</Form.Label>
                <Form.Control
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
            <Col md={6}>
              <Form.Group>
                <Form.Label>Assigned To</Form.Label>
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
                  onChange={(selected) =>
                    setFormData((prev) => ({ ...prev, assigned_to: selected ? selected.value : "" }))
                  }
                  placeholder="Select Branch"
                  isSearchable={true}
                  styles={{
                    control: (base) => ({
                      ...base,
                      borderColor: "#dee2e6",
                      minHeight: "38px",
                    }),
                  }}
                />
              </Form.Group>
            </Col>
          </Row>

          <h6 className="mt-3">Consignee</h6>
          <Row className="g-3">
            <Col md={6}> <Form.Group>
                <Form.Label>Name</Form.Label>
                <Form.Control name="consignee_name" value={formData.consignee_name || ""} onChange={handleInput} />
              </Form.Group></Col>
            <Col md={6}> <Form.Group>
                <Form.Label>GSTIN</Form.Label>
                <Form.Control name="consignee_gstin" value={formData.consignee_gstin || ""} onChange={handleInput} />
              </Form.Group></Col>
            <Col md={6}> <Form.Group>
                <Form.Label>Address</Form.Label>
                <Form.Control name="consignee_address" value={formData.consignee_address || ""} onChange={handleInput} />
              </Form.Group></Col>
            <Col md={3}><Form.Group>
                <Form.Label>State</Form.Label>
                <Form.Control name="consignee_state" value={formData.consignee_state || ""} onChange={handleInput} />
              </Form.Group></Col>
            <Col md={3}><Form.Group>
                <Form.Label>State Code</Form.Label>
                <Form.Control name="consignee_state_code" value={formData.consignee_state_code || ""} onChange={handleInput} />
              </Form.Group></Col>
          </Row>

          <h6 className="mt-3">Buyer</h6>
          <Row className="g-3">
            <Col md={6}><Form.Group>
                <Form.Label>Name</Form.Label>
                <Form.Control name="buyer_name" value={formData.buyer_name || ""} onChange={handleInput} />
              </Form.Group></Col>
            <Col md={6}><Form.Group>
                <Form.Label>GSTIN</Form.Label>
                <Form.Control name="buyer_gstin" value={formData.buyer_gstin || ""} onChange={handleInput} />
              </Form.Group></Col>
            <Col md={6}><Form.Group>
                <Form.Label>Address</Form.Label>
                <Form.Control name="buyer_address" value={formData.buyer_address || ""} onChange={handleInput} />
              </Form.Group></Col>
            <Col md={3}><Form.Group>
                <Form.Label>State</Form.Label>
                <Form.Control name="buyer_state" value={formData.buyer_state || ""} onChange={handleInput} />
              </Form.Group></Col>
            <Col md={3}><Form.Group>
                <Form.Label>State Code</Form.Label>
                <Form.Control name="buyer_state_code" value={formData.buyer_state_code || ""} onChange={handleInput} />
              </Form.Group></Col>
          </Row>

          <h6 className="mt-3">E-Invoice / References</h6>
          <Row className="g-3">
            <Col md={4}><Form.Group>
                <Form.Label>IRN</Form.Label>
                <Form.Control name="irn" value={formData.irn || ""} onChange={handleInput} />
              </Form.Group></Col>
            <Col md={4}><Form.Group>
                <Form.Label>Ack No</Form.Label>
                <Form.Control name="ack_no" value={formData.ack_no || ""} onChange={handleInput} />
              </Form.Group></Col>
            <Col md={4}><Form.Group>
                <Form.Label>Ack Date</Form.Label>
                <Form.Control type="date" name="ack_date" value={formData.ack_date || ""} onChange={handleInput} />
              </Form.Group></Col>
          </Row>

          <Row className="g-3">
            <Col md={4}><Form.Group>
                <Form.Label>Reference No</Form.Label>
                <Form.Control name="reference_no" value={formData.reference_no || ""} onChange={handleInput} />
              </Form.Group></Col>
            <Col md={4}><Form.Group>
                <Form.Label>Other References</Form.Label>
                <Form.Control name="other_references" value={formData.other_references || ""} onChange={handleInput} />
              </Form.Group></Col>
            <Col md={4}><Form.Group>
                <Form.Label>Buyer Order No</Form.Label>
                <Form.Control name="buyer_order_no" value={formData.buyer_order_no || ""} onChange={handleInput} />
              </Form.Group></Col>
          </Row>

          <Row className="g-3">
            <Col md={4}><Form.Group>
                <Form.Label>Buyer Order Date</Form.Label>
                <Form.Control type="date" name="buyer_order_date" value={formData.buyer_order_date || ""} onChange={handleInput} />
              </Form.Group></Col>
            <Col md={4}><Form.Group>
                <Form.Label>Dispatch Doc No</Form.Label>
                <Form.Control name="dispatch_doc_no" value={formData.dispatch_doc_no || ""} onChange={handleInput} />
              </Form.Group></Col>
            <Col md={4}><Form.Group>
                <Form.Label>Delivery Note Date</Form.Label>
                <Form.Control type="date" name="delivery_note_date" value={formData.delivery_note_date || ""} onChange={handleInput} />
              </Form.Group></Col>
          </Row>

          <Row className="g-3">
            <Col md={4}><Form.Group>
                <Form.Label>Dispatched Through</Form.Label>
                <Form.Control name="dispatched_through" value={formData.dispatched_through || ""} onChange={handleInput} />
              </Form.Group></Col>
            <Col md={4}><Form.Group>
                <Form.Label>Destination</Form.Label>
                <Form.Control name="destination" value={formData.destination || ""} onChange={handleInput} />
              </Form.Group></Col>
            <Col md={4}><Form.Group>
                <Form.Label>Terms of Delivery</Form.Label>
                <Form.Control name="terms_of_delivery" value={formData.terms_of_delivery || ""} onChange={handleInput} />
              </Form.Group></Col>
          </Row>

          <h6 className="mt-3">Services</h6>

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
              <div key={idx} className="mb-3 p-3 border rounded">
                {/* Row 1: Basic Details */}
                <Row className="g-2 mb-2">
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label className="small">Service Name</Form.Label>
                      <Form.Control
                        placeholder="Service Name"
                        value={service.service_name || ""}
                        onChange={(e) => handleServiceChange(idx, "service_name", e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label className="small">Description</Form.Label>
                      <Form.Control
                        placeholder="Description"
                        value={service.description || ""}
                        onChange={(e) => handleServiceChange(idx, "description", e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label className="small">HSN/SAC</Form.Label>
                      <Form.Control
                        placeholder="HSN/SAC"
                        value={service.hsn_sac || ""}
                        onChange={(e) => handleServiceChange(idx, "hsn_sac", e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="g-2 mb-2">
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label className="small">Unit</Form.Label>
                      <Form.Select
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
                      <div className="d-flex gap-2 mt-2">
                        <Form.Control
                          size="sm"
                          type="text"
                          placeholder="Add new unit"
                          value={newUnitNames[idx] || ""}
                          onChange={(e) => handleNewUnitNameChange(idx, e.target.value)}
                        />
                        <Button
                          size="sm"
                          variant="outline-primary"
                          onClick={() => handleAddUnit(idx)}
                          disabled={creatingUnitIndex === idx}
                        >
                          {creatingUnitIndex === idx ? "Adding..." : "Add"}
                        </Button>
                      </div>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label className="small">Qty</Form.Label>
                      <Form.Control
                        type="number"
                        placeholder="Qty"
                        value={service.quantity !== undefined && service.quantity !== null ? service.quantity : ""}
                        onChange={(e) => handleServiceChange(idx, "quantity", e.target.value)}
                        min="0.001"
                        step="0.001"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label className="small">Rate</Form.Label>
                      <Form.Control
                        type="number"
                        placeholder="Rate"
                        value={service.rate || 0}
                        onChange={(e) => handleServiceChange(idx, "rate", e.target.value)}
                        min={0}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* Row 3: Taxable + Mode */}
                <Row className="g-2 mb-2 align-items-end">
                  <Col md={2}>
                    <Form.Group>
                      <Form.Label className="small">Taxable</Form.Label>
                      <div className="pt-2">
                        <Form.Check
                          type="checkbox"
                          checked={!!service.is_taxable}
                          onChange={(e) => handleServiceChange(idx, "is_taxable", e.target.checked)}
                        />
                      </div>
                    </Form.Group>
                  </Col>
                  <Col md={2}>
                    <Form.Group>
                      <Form.Label className="small">Mode</Form.Label>
                      <Form.Select
                        value={service.gst_mode || "exclusive"}
                        onChange={(e) => handleServiceChange(idx, "gst_mode", e.target.value)}
                      >
                        <option value="exclusive">Exclusive</option>
                        <option value="inclusive">Inclusive</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={2}>
                    <Form.Group>
                      <Form.Label className="small">CGST %</Form.Label>
                      <Form.Control
                        type="number"
                        value={service.cgst || 0}
                        onChange={(e) => handleServiceChange(idx, "cgst", e.target.value)}
                        min={0}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={2}>
                    <Form.Group>
                      <Form.Label className="small">SGST %</Form.Label>
                      <Form.Control
                        type="number"
                        value={service.sgst || 0}
                        onChange={(e) => handleServiceChange(idx, "sgst", e.target.value)}
                        min={0}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={2}>
                    <Form.Group>
                      <Form.Label className="small">IGST %</Form.Label>
                      <Form.Control
                        type="number"
                        value={service.igst || 0}
                        onChange={(e) => handleServiceChange(idx, "igst", e.target.value)}
                        min={0}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* Row 4: Totals */}
                <Row className="g-2 mb-2">
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label className="small">Total Tax Rate</Form.Label>
                      <div className="pt-2">{totalTaxRate}%</div>
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label className="small">Total Tax Amount</Form.Label>
                      <div className="pt-2">₹{lineTax.toFixed(2)}</div>
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label className="small">Total Amount</Form.Label>
                      <div className="pt-2 fw-bold text-success">₹{lineTotal.toFixed(2)}</div>
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label className="small">Total Amount Words</Form.Label>
                      <div className="pt-2 text-muted">{totalInWords}</div>
                    </Form.Group>
                  </Col>
                </Row>

                {/* Row 5: Action */}
                <Row className="g-2">
                  <Col md={12} className="d-flex justify-content-end">
                    <Button variant="danger" size="sm" onClick={() => removeService(idx)}>
                      Remove Service
                    </Button>
                  </Col>
                </Row>
              </div>
            );
          })}

          <div className="mb-3">
            <Button variant="outline-primary" size="sm" onClick={addService}>
              Add Service
            </Button>
          </div>

          <Row className="g-3">
            <Col md={4}><Form.Group><Form.Label>Status</Form.Label><Form.Select name="status" value={formData.status || "pending"} onChange={handleInput}><option value="pending">pending</option><option value="paid">paid</option></Form.Select></Form.Group></Col>
            <Col md={4}><Form.Group><Form.Label>Payment Terms</Form.Label><Form.Control name="payment_terms" value={formData.payment_terms || ""} onChange={handleInput} /></Form.Group></Col>
            <Col md={4}><Form.Group><Form.Label>Delivery Note</Form.Label><Form.Control name="delivery_note" value={formData.delivery_note || ""} onChange={handleInput} /></Form.Group></Col>
          </Row>

          <Row className="g-3 mt-3">
            <Col md={3}><Form.Group><Form.Label>Company PAN</Form.Label><Form.Control name="company_pan" value={formData.company_pan || ""} onChange={handleInput} /></Form.Group></Col>
            <Col md={3}><Form.Group><Form.Label>Bank Name</Form.Label><Form.Control name="bank_name" value={formData.bank_name || ""} onChange={handleInput} /></Form.Group></Col>
            <Col md={3}><Form.Group><Form.Label>Account Number</Form.Label><Form.Control name="account_number" value={formData.account_number || ""} onChange={handleInput} /></Form.Group></Col>
            <Col md={3}><Form.Group><Form.Label>IFSC</Form.Label><Form.Control name="ifsc_code" value={formData.ifsc_code || ""} onChange={handleInput} /></Form.Group></Col>
          </Row>

          <div className="mt-4 p-3 bg-light rounded border d-flex justify-content-between align-items-center">
            <div className="text-center">
              <div className="text-muted small fw-bold">Subtotal (Taxable)</div>
              <h5 className="mb-0">₹{summaryTotals.subTotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 3 })}</h5>
            </div>
            <div className="text-center">
              <div className="text-muted small fw-bold">Total Tax</div>
              <h5 className="mb-0 text-danger">₹{summaryTotals.taxTotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 3 })}</h5>
            </div>
            <div className="text-center">
              <div className="text-muted small fw-bold">Grand Total</div>
              <h4 className="mb-0 text-success fw-bold">₹{summaryTotals.grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 3 })}</h4>
            </div>
          </div>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Cancel</Button>
        <Button variant="success" onClick={handleSubmit}>{isEdit ? "Update" : "Create"}</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ProformaBillModal;
