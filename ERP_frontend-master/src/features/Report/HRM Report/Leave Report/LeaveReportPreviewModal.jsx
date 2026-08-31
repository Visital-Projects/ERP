import React from "react";
import { Modal, Table, Button, Badge, Row, Col } from "react-bootstrap";
import { Download, Printer } from "react-bootstrap-icons";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const LeaveReportPreviewModal = ({ show, onHide, data, title }) => {
  const formatINRForPDF = (value) =>
    `Rs. ${new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: 2,
    }).format(value || 0)}`;

  // const handleExportExcel = () => {
  //   const exportData = data.map((item) => ({
  //     "Employee ID": item["Employee ID"],
  //     "Employee Name": item["Employee Name"],
  //     "Site": item.Site,
  //     "Approved Leaves": item["Approved Leaves"],
  //     "Rejected Leaves": item["Rejected Leaves"],
  //     "Pending Leaves": item["Pending Leaves"],
  //     "Total Leaves": item["Total Leaves"]
  //   }));
    
  //   const worksheet = XLSX.utils.json_to_sheet(exportData);
  //   const workbook = XLSX.utils.book_new();
  //   XLSX.utils.book_append_sheet(workbook, worksheet, "Leave Report");
  //   XLSX.writeFile(workbook, `LeaveReport_${new Date().toISOString().split('T')[0]}.xlsx`);
  // };

  const handleExportExcel = () => {
  const exportData = data.map((item) => ({
    "Employee ID": item["Employee ID"],
    "Employee Name": item["Employee Name"],
    "Site": item.Site,
    "Approved Leaves": item["Approved Leaves"],
    "Rejected Leaves": item["Rejected Leaves"],
    "Pending Leaves": item["Pending Leaves"],
    "Total Leaves": item["Total Leaves"]
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);

  // Set column widths to make Site column readable
  const colWidths = [
    { wch: 15 }, // Employee ID
    { wch: 20 }, // Employee Name
    { wch: 40 }, // Site - wider for long names
    { wch: 15 }, // Approved
    { wch: 15 }, // Rejected
    { wch: 15 }, // Pending
    { wch: 15 }  // Total
  ];
  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Leave Report");
  XLSX.writeFile(workbook, `LeaveReport_${new Date().toISOString().split('T')[0]}.xlsx`);
};
  const handleExportPDF = () => {
    const doc = new jsPDF("l", "mm", "a4");

    doc.setFontSize(14);
    doc.text(title, 14, 15);

    autoTable(doc, {
      head: [[
        "Employee ID",
        "Employee Name",
        "Site",
        "Approved",
        "Rejected",
        "Pending",
        "Total"
      ]],
      body: data.map((item) => [
        item["Employee ID"],
        item["Employee Name"],
        item.Site,
        item["Approved Leaves"].toString(),
        item["Rejected Leaves"].toString(),
        item["Pending Leaves"].toString(),
        item["Total Leaves"].toString()
      ]),
      startY: 22,
      theme: "striped",
      styles: { fontSize: 9 },
      headStyles: { fillColor: [72, 66, 109], textColor: 255 },
    });

    doc.save(`LeaveReport_${new Date().toISOString().split("T")[0]}.pdf`);
  };


  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton className="bg-light">
        <Modal.Title>
          <h5 className="mb-0">{title} - Preview</h5>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-0">
        <div className="p-3 border-bottom">
          <div className="d-flex justify-content-end gap-2 mb-3">
          </div>
        </div>
        
        <div className="table-responsive" style={{ maxHeight: "400px" }}>
          <Table bordered hover size="sm" className="mb-0">
            <thead className="bg-light sticky-top">
              <tr>
                <th>Employee ID</th>
                <th>Employee Name</th>
                <th>Site</th>
                <th>Approved</th>
                <th>Rejected</th>
                <th>Pending</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={index}>
                  <td className="fw-semibold">{item["Employee ID"]}</td>
                  <td className="text-capitalize">{item["Employee Name"]}</td>
                 <td
  className="small text-wrap"
  style={{ whiteSpace: "normal", wordBreak: "break-word" }}
>
  {item.Site}
</td>
                  <td>
                    <Badge bg="success" className="fs-6">
                      {item["Approved Leaves"]}
                    </Badge>
                  </td>
                  <td>
                    <Badge bg="danger" className="fs-6">
                      {item["Rejected Leaves"]}
                    </Badge>
                  </td>
                  <td>
                    <Badge bg="warning" className="fs-6">
                      {item["Pending Leaves"]}
                    </Badge>
                  </td>
                  <td>
                    <Badge bg="info" className="fs-6">
                      {item["Total Leaves"]}
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
              <div className="fw-bold">{data.length}</div>
            </div>
            <div className="col-md-3">
              <div className="small text-muted">Total Approved</div>
              <div className="fw-bold text-success">
                {data.reduce((sum, item) => sum + item["Approved Leaves"], 0)}
              </div>
            </div>
            <div className="col-md-3">
              <div className="small text-muted">Total Rejected</div>
              <div className="fw-bold text-danger">
                {data.reduce((sum, item) => sum + item["Rejected Leaves"], 0)}
              </div>
            </div>
            <div className="col-md-3">
              <div className="small text-muted">Total Pending</div>
              <div className="fw-bold text-warning">
                {data.reduce((sum, item) => sum + item["Pending Leaves"], 0)}
              </div>
            </div>
          </div>
        </div>
      </Modal.Body>
        <Row className="my-3">
          <Col className="d-flex gap-2 justify-content-end">
            <Button variant="success" onClick={handleExportExcel}>
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
    </Modal>
  );
};

export default LeaveReportPreviewModal;