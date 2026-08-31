import React from 'react';
import { Modal, Button, Table } from 'react-bootstrap';

const LeaveDetailsModal = ({ show, onHide, employee }) => {
  if (!employee) return null;

  const getVariant = (type) => {
    switch(type) {
      case 'approved': return 'success';
      case 'rejected': return 'danger';
      case 'pending': return 'warning';
      default: return 'secondary';
    }
  };

  const getTitle = (type) => {
    switch(type) {
      case 'approved': return 'Approved';
      case 'rejected': return 'Rejected';
      case 'pending': return 'Pending';
      default: return '';
    }
  };

  const details = employee.leaveDetails?.[employee.leaveType] || [];

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          {getTitle(employee.leaveType)} Leaves - {employee.name}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="mb-4">
          <h6>Employee Details</h6>
          <div className="row">
            <div className="col-md-6">
              <p><strong>Employee ID:</strong> {employee.id}</p>
              <p><strong>Site:</strong> {employee.branch_name}</p>
            </div>
            <div className="col-md-6">
              <p><strong>Total {getTitle(employee.leaveType)} Leaves:</strong> {details.length}</p>
            </div>
          </div>
        </div>

        <Table responsive bordered>
          <thead className="table-light">
            <tr>
              <th>Leave Type</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Duration (Days)</th>
              <th>Reason</th>
              <th>Applied On</th>
            </tr>
          </thead>
          <tbody>
            {details.length > 0 ? (
              details.map((leave, index) => (
                <tr key={index}>
                  <td>{leave.leaveType}</td>
                  <td>{leave.startDate}</td>
                  <td>{leave.endDate}</td>
                  <td>{leave.totalDays}</td>
                  <td>{leave.reason || 'N/A'}</td>
                  <td>{leave.appliedOn}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center text-muted py-3">
                  No {employee.leaveType} leaves found
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default LeaveDetailsModal;