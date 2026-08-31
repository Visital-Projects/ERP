



import React, { useState, useEffect } from "react";
import axios from "axios";
import { Modal, Button } from "react-bootstrap";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "./payslip.css";

const PayslipModal = ({ show, onHide, employee, onSalaryUpdated }) => {

  const [images, setImages] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newSalary, setNewSalary] = useState("");
  const [remark, setRemark] = useState("");
  const [loading, setLoading] = useState(false);

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

    const input = document.getElementById("payslipModalContent");

    const canvas = await html2canvas(input, { scale: 2, useCORS: true });

    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");

    const pdfWidth = pdf.internal.pageSize.getWidth();

    const pdfHeight = pdf.internal.pageSize.getHeight();

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

    pdf.save(`${empDetails.name}_Payslip.pdf`);

  };

  /* ===============================
     UPDATE SALARY
  =============================== */

  const updateSalary = async () => {

    try {

      setLoading(true);

      const token = localStorage.getItem("token");

      const payload = {

        employee_id: employee.employee_id,

        salary_month: employee.salary_month,

        salary: Number(newSalary),

        remark: remark

      };

      const res = await axios.put(
        `${BASE_URL}/api/grossSalary/update`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (res.data.success) {

        alert("Salary updated successfully");

        setShowEditModal(false);

        if (onSalaryUpdated) {
          onSalaryUpdated();
        }

        onHide();

      }

    } catch (err) {

      console.error(err);

      alert("Failed to update salary");

    } finally {

      setLoading(false);

    }

  };

  return (
    <>

      <Modal show={show} onHide={onHide} size="lg" centered>

        <Modal.Header closeButton>

          <Modal.Title>Employee Payslip</Modal.Title>

        </Modal.Header>

        <Modal.Body id="payslipModalContent" className="payslip-modal-body">

          <div className="payslip-container">

            <div className="payslip-header">

              <h5>Venkateswar Engineering Works</h5>

              <p>Salary Slip for the Month of {empDetails.salaryMonth}</p>

            </div>

            <div className="payslip-details">

              <div>

                <p><strong>Emp ID:</strong> {empDetails.id}</p>

                <p><strong>Department:</strong> {empDetails.department}</p>

                <p><strong>Date of Joining:</strong> {empDetails.joiningDateDisplay}</p>

                <p><strong>No. of Present Days:</strong> {employee.attendance}</p>

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

                  <td>Basic Salary</td>

                  <td className="text-end">
                    {formatCurrency(employee.fixed_gross_per_month)}
                  </td>

                  <td className="border-left">Per Day Salary</td>

                  <td className="text-end">
                    {formatCurrency(employee.per_day_payment)}
                  </td>

                </tr>

                <tr>

                  <td>Attendance Days</td>

                  <td className="text-end">{employee.attendance}</td>

                  <td className="border-left">National Holiday</td>

                  <td className="text-end">{employee.nh}</td>

                </tr>

                <tr>

                  <td>Total Days</td>

                  <td className="text-end">{employee.total}</td>

                  <td className="border-left">Net Salary</td>

                  <td className="text-end">
                    {formatCurrency(employee.salary_value)}
                  </td>

                </tr>

                <tr className="payslip-net-row">

                  <td colSpan="4">

                    Net Pay : {formatCurrency(employee.salary_value)}

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

          {employee.status !== "paid" && (

            <Button
              variant="warning"
              onClick={() => {
                setNewSalary(employee.salary);
                setRemark("");
                setShowEditModal(true);
              }}
            >
              Edit Salary
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

      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>

        <Modal.Header closeButton>

          <Modal.Title>Update Salary</Modal.Title>

        </Modal.Header>

        <Modal.Body>

          <div className="mb-3">

            <label>New Salary</label>

            <input
              type="number"
              className="form-control"
              value={newSalary}
              onChange={(e) => setNewSalary(e.target.value)}
            />

          </div>

          <div className="mb-3">

            <label>Remark</label>

            <textarea
              className="form-control"
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
            />

          </div>

        </Modal.Body>

        <Modal.Footer>

          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>

          <Button variant="primary" onClick={updateSalary} disabled={loading}>
            {loading ? "Updating..." : "Update Salary"}
          </Button>

        </Modal.Footer>

      </Modal>

    </>
  );

};

export default PayslipModal;