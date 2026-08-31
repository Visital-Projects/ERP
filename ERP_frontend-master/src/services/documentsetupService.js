

// src/services/documentService.js
import apiClient from "./apiClient";

// ✅ Get all documents (auto-handles company/employee access)
const getAllDocuments = async () => {
  const res = await apiClient.get("/document-uploads");
  return res.data.data; // returns array of documents
};

// ✅ Get document by ID
const getDocumentById = async (documentId) => {
  const res = await apiClient.get(`/document-uploads/${documentId}`);
  return res.data.data; // returns document object
};

// ✅ Create document (with file upload)
const createDocument = async (formData) => {
  const res = await apiClient.post("/document-uploads", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data.data; // returns created document object
};

// ✅ Update document (with optional file update)
const updateDocument = async (documentId, formData) => {
  const res = await apiClient.put(`/document-uploads/${documentId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data.data; // returns updated document object
};

// ✅ Delete document
const deleteDocument = async (documentId) => {
  const res = await apiClient.delete(`/document-uploads/${documentId}`);
  return res.data; // returns { success: true, message: "Document deleted" }
};

const documentService = {
  getAllDocuments,
  getDocumentById,
  createDocument,
  updateDocument,
  deleteDocument,
};

export default documentService;