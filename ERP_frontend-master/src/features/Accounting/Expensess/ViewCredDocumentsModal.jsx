import React, { useState } from "react";
import { Modal, Button, Image, Dropdown, Table } from "react-bootstrap";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { toast } from "react-toastify";

const ViewCredDocumentsModal = ({ show, onHide, documents = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const baseUrl =
    import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_BASE_URL;

  if (!documents || documents.length === 0)
    return (
      <Modal show={show} onHide={onHide} centered backdrop="static" keyboard={false}>
        <Modal.Header closeButton>
          <Modal.Title>View Attached Documents</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center text-muted py-4">
            No documents uploaded.
          </div>
        </Modal.Body>
      </Modal>
    );

  const sanitizedDocs = Array.isArray(documents)
    ? documents
    : JSON.parse(documents);
  const total = sanitizedDocs.length;
  const currentDoc = sanitizedDocs[currentIndex];
  const fileName = currentDoc?.split("/").pop();
  const isPdf = fileName?.toLowerCase().endsWith(".pdf");
  const docUrl = `${baseUrl}/${currentDoc.startsWith("/") ? currentDoc.slice(1) : currentDoc}`;

  // Single file download
  const handleDownload = async (doc) => {
    try {
      const sanitized = doc.startsWith("/") ? doc.slice(1) : doc;
      const url = `${baseUrl}/${sanitized}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch file");
      const blob = await response.blob();
      saveAs(blob, sanitized.split("/").pop());
      toast.success("Download started");
    } catch (error) {
      console.error(error);
      toast.error("Failed to download file");
    }
  };

  // Download all files as ZIP
  const downloadAllDocs = async () => {
    try {
      const zip = new JSZip();
      const folder = zip.folder("credit-purchase-documents");

      for (const doc of sanitizedDocs) {
        const sanitized = doc.startsWith("/") ? doc.slice(1) : doc;
        const url = `${baseUrl}/${sanitized}`;
        const response = await fetch(url);
        if (!response.ok) continue;
        const blob = await response.blob();
        folder.file(sanitized.split("/").pop(), blob);
      }

      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, "credit_purchase_documents.zip");
      toast.success("All documents downloaded as ZIP");
    } catch (error) {
      console.error("ZIP download failed:", error);
      toast.error("Failed to download all documents");
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="xl" centered dialogClassName="d-flex align-items-center justify-content-center" backdrop="static" keyboard={false}>
      {/* Header */}
      <Modal.Header className="d-flex justify-content-between align-items-center">
        <Modal.Title>
          Documents ({currentIndex + 1}/{total})
        </Modal.Title>
        <div className="d-flex align-items-center gap-2">
          <Dropdown>
            <Dropdown.Toggle variant="success" size="sm">
              <i className="bi bi-download"></i>
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => handleDownload(currentDoc)}>
                Download Current
              </Dropdown.Item>
              <Dropdown.Item onClick={downloadAllDocs}>
                Download All (ZIP)
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
          <button
            type="button"
            className="btn-close"
            aria-label="Close"
            onClick={onHide}
          ></button>
        </div>
      </Modal.Header>

      {/* Body */}
      <Modal.Body className="p-3 text-center">
        {isPdf ? (
          <div
            className="d-flex justify-content-center align-items-center border rounded bg-light"
            style={{ height: "400px", cursor: "pointer" }}
            onClick={() => window.open(docUrl, "_blank")}
            title="Click to open PDF"
          >
            <i
              className="bi bi-filetype-pdf"
              style={{ fontSize: "4rem", color: "#d9534f" }}
            ></i>
          </div>
        ) : (
          <Image
            src={docUrl}
            fluid
            style={{
              maxHeight: "500px",
              objectFit: "contain",
              borderRadius: "8px",
            }}
          />
        )}

        {/* File name below */}
        {/* <div className="mt-3 text-muted">{fileName}</div> */}
      </Modal.Body>

      {/* Footer */}
      <Modal.Footer className="justify-content-between">
        <Button
          variant="secondary"
          onClick={() =>
            setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev))
          }
          disabled={currentIndex === 0}
        >
          Previous
        </Button>
        <Button
          variant="secondary"
          onClick={() =>
            setCurrentIndex((prev) =>
              prev < total - 1 ? prev + 1 : prev
            )
          }
          disabled={currentIndex === total - 1}
        >
          Next
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ViewCredDocumentsModal;
