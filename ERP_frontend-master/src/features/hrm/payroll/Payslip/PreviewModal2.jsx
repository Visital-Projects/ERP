// ExcelPreviewModal.jsx
import React from "react";
import { Modal, Table, Button } from "react-bootstrap";

const ExcelPreviewModal = ({
  show,
  onHide,
  previewData,
  month,
  year,
  onDownload
}) => {
  return (
    <Modal
      show={show}
      onHide={onHide}
      size="xl"
      className="p-0"
      dialogClassName="invoice-preview-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title>
          Excel Preview - {month} {year}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="preview-table">
          <Table striped bordered hover>
            <thead>
              <tr>
                {previewData.length > 0 &&
                  Object.keys(previewData[0]).map((key) => (
                    <th key={key}>{key}</th>
                  ))}
              </tr>
            </thead>
            <tbody>
              {previewData.map((row, index) => (
                <tr key={index}>
                  {Object.entries(row).map(([key, value], cellIndex) => (
                    <td
                      key={cellIndex}
                      style={{
                        whiteSpace: "normal",
                        wordBreak: "normal",
                        overflowWrap: "break-word",
                        maxWidth: key === "BRANCH" || key === "DEPARTMENT" ? "180px" : "auto"
                      }}
                    >
                      {value}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="secondary"
          onClick={onHide}
        >
          Close
        </Button>
        <Button
          variant="success"
          onClick={() => {
            onDownload();
            onHide();
          }}
        >
          Download Excel
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ExcelPreviewModal;