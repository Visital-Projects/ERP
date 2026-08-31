import React from "react";
import { Modal, Table, Button, Badge, Row, Col } from "react-bootstrap";
import { Download, Printer } from "react-bootstrap-icons";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import '../../Report.css'

const MonthlyAttendancePreviewModal = ({ show, onHide, data, title }) => {
  const handleExportExcel = () => {
    const exportData = data.map((item) => ({
      "Employee ID": item["Employee ID"],
      "Name": item["Name"],
      "Department": item.Department,
      "Designation": item.Designation,
      "Site": item.Site,
      "Present Days": item["Present Days"],
      "Leave Days": item["Leave Days"],
      "Overtime (hours)": item["Overtime (hours)"],
      "Early Leave (hours)": item["Early Leave (hours)"],
      "Late (hours)": item["Late (hours)"],
      "Attendance %": item["Attendance %"]
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(exportData);
          worksheet["!cols"] = [
    { wch: 12 }, 
    { wch: 25 }, 
    { wch: 25 }, 
    { wch: 25 },
    { wch: 32 }, 
    { wch: 14 }, 
    { wch: 14 }, 
    { wch: 18 }, 
    { wch: 20 }, 
    { wch: 14 }, 
  ];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance Report");
    XLSX.writeFile(workbook, `AttendanceReport_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF("l", "mm", "a4");

    doc.setFontSize(14);
    doc.text(title, 14, 15);

    autoTable(doc, {
      head: [[
        "Employee ID",
        "Name",
        "Department",
        "Present Days",
        "Leave Days",
        "Overtime (hrs)",
        "Early Leave (hrs)",
        "Late (hrs)",
        "Attendance %"
      ]],
      body: data.map((item) => [
        item["Employee ID"],
        item["Name"],
        item.Department,
        item["Present Days"].toString(),
        item["Leave Days"].toString(),
        item["Overtime (hours)"],
        item["Early Leave (hours)"],
        item["Late (hours)"],
        item["Attendance %"]
      ]),
      startY: 22,
      theme: "striped",
      styles: { fontSize: 9 },
      headStyles: { fillColor: [72, 66, 109], textColor: 255 },
    });

    doc.save(`AttendanceReport_${new Date().toISOString().split("T")[0]}.pdf`);
  };

const getAttendanceBadgeClass = (percent) => {
  if (!percent) return "secondary"; // ✅ FINAL FIX

  const perc = parseInt(
    percent.toString().replace("%", ""),
    10
  );

  if (perc >= 90) return "success";
  if (perc >= 80) return "warning";
  return "danger";
};


  // Calculate totals
  const calculateTotals = () => {
    return {
      totalPresent: data.reduce((sum, item) => sum + item["Present Days"], 0),
      totalLeave: data.reduce((sum, item) => sum + item["Leave Days"], 0),
      totalOvertime: data.reduce((sum, item) => sum + parseFloat(item["Overtime (hours)"]), 0).toFixed(2),
      totalEarlyLeave: data.reduce((sum, item) => sum + parseFloat(item["Early Leave (hours)"]), 0).toFixed(2),
      totalLate: data.reduce((sum, item) => sum + parseFloat(item["Late (hours)"]), 0).toFixed(2),
      totalEmployees: data.length
    };
  };

  const totals = calculateTotals();

  return (
<Modal
  show={show}
  onHide={onHide}
  size="xl"
  dialogClassName="invoice-preview-modal"
>
      <Modal.Header closeButton className="bg-light">
        <Modal.Title>
          <h5 className="mb-0">{title} - Preview</h5>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-0">
        
        <div className="table-responsive" style={{ maxHeight: "400px" }}>
          <Table bordered hover size="sm" className="mb-0">
            <thead className="bg-light sticky-top">
              <tr>
                <th>Employee ID</th>
                <th>Name</th>
                <th>Department</th>
                <th>Present</th>
                <th>Leave</th>
                <th>Overtime</th>
                <th>Early Leave</th>
                <th>Late</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={index}>
                  <td className="fw-semibold">{item["Employee ID"]}</td>
                  <td className="text-capitalize">{item["Name"]}</td>
                  <td>
                    <Badge bg="info" className="fs-8">
                      {item.Department}
                    </Badge>
                  </td>
                  <td>
                    <strong>{item["Present Days"]}</strong>
                  </td>
                  <td className={item["Leave Days"] > 3 ? 'text-danger' : ''}>
                    {item["Leave Days"]}
                  </td>
                  <td>
                    {item["Overtime (hours)"]}
                  </td>
                  <td>
                    {item["Early Leave (hours)"]}
                  </td>
                  <td>
                    {item["Late (hours)"]}
                  </td>
                  <td>
                    <Badge bg={getAttendanceBadgeClass(item["Attendance %"])} className="fs-6">
                      {item["Attendance %"]}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
        
        <div className="p-3 border-top bg-light">
          <div className="row">
            <div className="col-md-3">
              <div className="small text-muted">Total Employees</div>
              <div className="fw-bold">{totals.totalEmployees}</div>
            </div>
            <div className="col-md-2">
              <div className="small text-muted">Total Present</div>
              <div className="fw-bold">{totals.totalPresent}</div>
            </div>
            <div className="col-md-2">
              <div className="small text-muted">Total Leave</div>
              <div className="fw-bold">{totals.totalLeave}</div>
            </div>
            <div className="col-md-2">
              <div className="small text-muted">Total Overtime</div>
              <div className="fw-bold">{totals.totalOvertime} hrs</div>
            </div>
            <div className="col-md-3">
              <div className="small text-muted">Total Late</div>
              <div className="fw-bold">{totals.totalLate} hrs</div>
            </div>
          </div>
        </div>
        
        <Row className="my-3">
          <Col className="d-flex gap-2 justify-content-end">
            <Button variant="success" size="sm" onClick={handleExportExcel}>
              Export Excel
            </Button>
            <Button variant="danger" size="sm" onClick={handleExportPDF}>
              Export PDF
            </Button>
            
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
        </Col>
          </Row>
      </Modal.Body>
    </Modal>
  );
};

export default MonthlyAttendancePreviewModal;