import React, { useState, useEffect } from "react";
import axios from "axios";
import { Modal, Button } from "react-bootstrap";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "./payslip.css";

const OTPayslipModal = ({ show, onHide, employee, onOTUpdated }) => {
  const [images, setImages] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newOTPayment, setNewOTPayment] = useState("");
  const [remark, setRemark] = useState("");
  const [loading, setLoading] = useState(false);
  const [otData, setOtData] = useState(null);

  const BASE_URL = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const { data } = await axios.get(`${BASE_URL}/api/homescreen`);
        if (data.success) {
          setImages(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch home images:", err);
      }
    };

    fetchImages();
  }, [BASE_URL]);

  // Fetch OT payment data when employee changes
  useEffect(() => {
    const fetchOTData = async () => {
      if (!employee || !employee.employee_id || !employee.salary_month) return;
      
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${BASE_URL}/api/otPayment/ot-payslips/?${employee.salary_month}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        
        if (response.data.success) {
          setOtData(response.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch OT data:", err);
      }
    };

    fetchOTData();
  }, [employee, BASE_URL]);

  if (!employee) return null;

  /* ===============================
     FORMAT DATE
  =============================== */
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch (error) {
      return dateString;
    }
  };

  /* ===============================
     EMPLOYEE DETAILS
  =============================== */
  const getEmployeeDetails = () => {
    const details = employee.employee || {};

    return {
      name: details.name || "N/A",
      position: details.designation?.name || "-",
      department: details.department?.name || "-",
      branch: details.branch?.name || "-",
      joiningDateDisplay: details.company_doj
        ? formatDate(details.company_doj)
        : "N/A",
      presentDays: employee.attendance ?? "N/A",
      salaryMonth: employee.salary_month || "N/A",
      id: employee.employee_id || "N/A"
    };
  };

  const empDetails = getEmployeeDetails();

  /* ===============================
     GET OT DETAILS
  =============================== */
  const getOTDetails = () => {
    // Use otData from API if available, otherwise fallback to employee object
    const otRecord = otData || employee.ot_payment || {};
    
    return {
      otHours: Number(employee.overtime) || 0,
      otRate: Number(employee.ot_rate) || 0,
      otPayment: Number(otRecord.ot_payment) || Number(employee.ot_payment) || 0,
      totalOTAmount: Number(otRecord.ot_payment) || Number(employee.ot_payment) || 0,
      status: otRecord.status || employee.status || "unpaid",
      remark: otRecord.remark || "",
      updatedBy: otRecord.updated_by || null,
      updatedAt: otRecord.updated_at || null
    };
  };

  const otDetails = getOTDetails();

  /* ===============================
     FORMAT CURRENCY
  =============================== */
  const formatCurrency = (value) => {
    const num = Number(value);
    if (isNaN(num)) return "₹0.00";
    return `₹${num.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  /* ===============================
     DOWNLOAD PDF
  =============================== */
  const downloadPayslipPDF = async () => {
    const input = document.getElementById("otPayslipModalContent");
    const canvas = await html2canvas(input, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${empDetails.name}_OT_Payslip.pdf`);
  };

  /* ===============================
     UPDATE OT PAYMENT
     Using the API you provided
  =============================== */
  const updateOTPayment = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const payload = {
        employee_id: employee.employee_id,
        salary_month: employee.salary_month,
        ot_payment: Number(newOTPayment),
        remark: remark
      };

      const res = await axios.put(
        `${BASE_URL}/api/otPayment/update`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (res.data.success) {
        alert("OT payment updated successfully");
        setShowEditModal(false);
        
        // Refresh OT data
        const refreshResponse = await axios.get(
          `${BASE_URL}/api/otPayment/ot-payslips/?${employee.salary_month}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        
        if (refreshResponse.data.success) {
          setOtData(refreshResponse.data.data);
        }
        
        if (onOTUpdated) {
          onOTUpdated();
        }
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to update OT payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal show={show} onHide={onHide} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Overtime (OT) Payment Details</Modal.Title>
        </Modal.Header>
        <Modal.Body id="otPayslipModalContent" className="payslip-modal-body">
          <div className="payslip-container">
            <div className="payslip-header">
              <h5>Venkateswar Engineering Works</h5>
              <p>Overtime Details for the Month of {empDetails.salaryMonth}</p>
            </div>

            <div className="payslip-details">
              <div>
                <p><strong>Emp ID:</strong> {empDetails.id}</p>
                <p><strong>Department:</strong> {empDetails.department}</p>
                <p><strong>Date of Joining:</strong> {empDetails.joiningDateDisplay}</p>
                <p><strong>No. of Present Days:</strong> {empDetails.presentDays}</p>
              </div>
              <div>
                <p><strong>Employee Name:</strong> {empDetails.name}</p>
                <p><strong>Designation:</strong> {empDetails.position}</p>
                <p><strong>Site:</strong> {empDetails.branch}</p>
              </div>
            </div>

            <table className="payslip-table-new">
              <thead>
                <tr>
                  <th>Description</th>
                  <th className="text-end">Value</th>
                  <th className="border-left">Description</th>
                  <th className="text-end">Value</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>OT Hours</td>
                  <td className="text-end">{otDetails.otHours.toFixed(2)}</td>
                  <td className="border-left">OT Rate (per hour)</td>
                  <td className="text-end">{formatCurrency(otDetails.otRate)}</td>
                </tr>

                <tr>
                  <td>OT Payment</td>
                  <td className="text-end">{formatCurrency(otDetails.otPayment)}</td>
                  <td className="border-left">Total OT Amount</td>
                  <td className="text-end">{formatCurrency(otDetails.totalOTAmount)}</td>
                </tr>

                <tr>
                  {/* <td>Status</td>
                  <td className="text-end">
                    <span className={`badge ${otDetails.status === "paid" ? "bg-success" : "bg-warning"}`}>
                      {otDetails.status === "paid" ? "Paid" : "Unpaid"}
                    </span>
                  </td> */}
                  <td className="border-left">Calculation</td>
                  <td className="text-end">
                    {otDetails.otHours} hrs × {formatCurrency(otDetails.otRate)} = {formatCurrency(otDetails.totalOTAmount)}
                  </td>
                </tr>

                {otDetails.remark && (
                  <tr>
                    <td colSpan="2">Remark</td>
                    <td colSpan="2" className="border-left">{otDetails.remark}</td>
                  </tr>
                )}

                {otDetails.updatedAt && (
                  <tr>
                    <td colSpan="2">Last Updated</td>
                    <td colSpan="2" className="border-left">
                      {formatDate(otDetails.updatedAt)}
                    </td>
                  </tr>
                )}

                <tr className="payslip-net-row">
                  <td colSpan="4">
                    Total OT Amount : {formatCurrency(otDetails.totalOTAmount)}
                  </td>
                </tr>

                <tr>
                  <td colSpan="4" className="signature">
                    Signature
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Modal.Body>

        <Modal.Footer>
          {otDetails.status !== "paid" && (
            <Button
              variant="warning"
              onClick={() => {
                setNewOTPayment(otDetails.otPayment);
                setRemark(otDetails.remark || "");
                setShowEditModal(true);
              }}
            >
              Edit OT Payment
            </Button>
          )}
          <Button variant="secondary" onClick={onHide}>
            Close
          </Button>
          <Button variant="success" onClick={downloadPayslipPDF}>
            Download as PDF
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit OT Payment Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Update OT Payment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <label>New OT Payment Amount (₹)</label>
            <input
              type="number"
              className="form-control"
              value={newOTPayment}
              onChange={(e) => setNewOTPayment(e.target.value)}
              placeholder="Enter OT payment amount"
            />
            <small className="text-muted">
              Current OT payment: {formatCurrency(otDetails.otPayment)}
            </small>
          </div>

          <div className="mb-3">
            <label>Remark (Optional)</label>
            <textarea
              className="form-control"
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder="Add a remark..."
              rows="3"
            />
          </div>

          <div className="mb-3">
            <label>Calculation Summary</label>
            <div className="p-2 bg-light rounded">
              <p className="mb-1">OT Hours: {otDetails.otHours} hrs</p>
              <p className="mb-1">OT Rate: {formatCurrency(otDetails.otRate)}/hr</p>
              <p className="mb-0 fw-bold">Calculated Amount: {formatCurrency(otDetails.otHours * otDetails.otRate)}</p>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={updateOTPayment} 
            disabled={loading || !newOTPayment}
          >
            {loading ? "Updating..." : "Update OT Payment"}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default OTPayslipModal;