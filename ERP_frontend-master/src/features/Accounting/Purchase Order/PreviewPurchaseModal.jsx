import { Modal, Table } from "react-bootstrap";

const PreviewPurchaseModal = ({ show, onHide, data }) => (
  <Modal size="lg" show={show} onHide={onHide} backdrop="static" keyboard={false}>
    <Modal.Header closeButton>
      <Modal.Title>Purchase Orders Preview</Modal.Title>
    </Modal.Header>
    <Modal.Body className="table-responsive">
      <Table hover striped>
        <thead>
          <tr>
            <th>PO Number</th>
            <th>Vendor Name</th>
            <th>Site</th>
            <th>Status</th>
            <th>PO Date</th>
            <th>Delivery Date</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {data.map((po, idx) => (
            <tr key={idx}>
              <td>{po.po_number}</td>
              <td>{po.vendor_name}</td>
              <td>{po.branch}</td>
              <td>{po.status}</td>
              <td>{po.po_date}</td>
              <td>{po.delivery_date}</td>
              <td>{po.total}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Modal.Body>
  </Modal>
);
export default PreviewPurchaseModal