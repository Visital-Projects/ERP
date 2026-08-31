import React, { useState } from "react";
import { Modal, Button, Image, Dropdown } from "react-bootstrap";
import JSZip from "jszip";
import { saveAs } from "file-saver";

const ViewDocumentsModal = ({ show, onHide, documents }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!documents || documents.length === 0) return null;

  const sanitizedDocs = Array.isArray(documents) ? documents : JSON.parse(documents);
  const total = sanitizedDocs.length;

  const handlePrev = () => setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev));
  const handleNext = () => setCurrentIndex((prev) => (prev < total - 1 ? prev + 1 : prev));

  const currentDoc = sanitizedDocs[currentIndex];
  const docUrl = `${import.meta.env.VITE_BASE_URL}/${currentDoc.replace(/^\/?/, "")}`;
  const isPdf = currentDoc.toLowerCase().endsWith(".pdf");

  // Download a single document
  const downloadDoc = async (doc) => {
    try {
      const sanitized = doc.startsWith("/") ? doc.slice(1) : doc;
      const url = `${import.meta.env.VITE_BASE_URL}/${sanitized}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch file");
      const blob = await response.blob();

      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = sanitized.split("/").pop();
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Download failed. Try opening in a new tab.");
    }
  };

  // Download all documents in a ZIP
  const downloadAllDocs = async () => {
    try {
      const zip = new JSZip();
      const folder = zip.folder("documents");

      for (const doc of sanitizedDocs) {
        const sanitized = doc.startsWith("/") ? doc.slice(1) : doc;
        const url = `${import.meta.env.VITE_BASE_URL}/${sanitized}`;
        const response = await fetch(url);
        if (!response.ok) continue;
        const blob = await response.blob();
        folder.file(sanitized.split("/").pop(), blob);
      }

      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, "documents.zip");
    } catch (error) {
      console.error("Failed to download ZIP:", error);
      alert("Failed to download all documents.");
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="xl" centered dialogClassName="d-flex justify-content-center align-items-center" backdrop="static" keyboard={false}>
      <Modal.Header className="d-flex justify-content-between align-items-center px-0 pt-0">
        <Modal.Title>
          Document {currentIndex + 1} / {total}
        </Modal.Title>

        <div className="d-flex align-items-center gap-2">
          <Dropdown>
            <Dropdown.Toggle variant="success" size="sm">
              <i className="bi bi-download"></i>
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => downloadDoc(currentDoc)}>
                Download Current
              </Dropdown.Item>
              <Dropdown.Item onClick={downloadAllDocs}>
                Download All (ZIP)
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>

          <button type="button" className="btn-close" aria-label="Close" onClick={onHide}></button>
        </div>
      </Modal.Header>

      <Modal.Body className="text-center p-0">
        {isPdf ? (
          <div
            style={{
              width: "100%",
              height: "400px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "#f0f0f0",
              cursor: "pointer",
            }}
            onClick={() => window.open(docUrl, "_blank")}
            title="Click to view PDF"
          >
            <i className="bi bi-filetype-pdf" style={{ fontSize: "4rem", color: "#d9534f" }}></i>
          </div>
        ) : (
          <Image
            src={docUrl}
            fluid
            style={{ maxHeight: "600px", objectFit: "contain" }}
          />
        )}
      </Modal.Body>

      <Modal.Footer className="justify-content-between">
        <Button variant="secondary" onClick={handlePrev} disabled={currentIndex === 0}>
          Previous
        </Button>
        <Button variant="secondary" onClick={handleNext} disabled={currentIndex === total - 1}>
          Next
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ViewDocumentsModal;
