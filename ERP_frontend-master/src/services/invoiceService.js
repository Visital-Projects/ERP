

// src/services/invoiceService.js
import apiClient from "./apiClient"; // Axios instance with baseURL + auth headers

// Fetch all invoices
export const fetchAllInvoices = async () => {
  const { data } = await apiClient.get("/invoices");
  return data.data; // backend sends { success, data }
};

// Fetch single invoice
export const fetchInvoiceById = async (id) => {
  const { data } = await apiClient.get(`/invoices/${id}`);
  return data.data;
};

// Create new invoice
export const createInvoice = async (payload) => {
  const { data } = await apiClient.post("/invoices", payload);
  return data.data;
};

// Update invoice
export const updateInvoice = async (id, payload) => {
  const { data } = await apiClient.put(`/invoices/${id}`, payload);
  return data.data;
};

// Delete invoice
export const deleteInvoice = async (id) => {
  const { data } = await apiClient.delete(`/invoices/${id}`);
  return data;
};

// Download Invoice PDF
// export const downloadInvoicePDF = async (id) => {
//   const { data } = await apiClient.get(`/invoices/${id}/pdf`);
//   if (data.success && data.pdfPath) {
//     // Trigger browser download
//     const link = document.createElement("a");
//     link.href = data.pdfPath; // assuming server serves static files correctly
//     link.download = `invoice_${id}.pdf`;
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   }
// };

// services/invoiceService.js
export const downloadInvoicePDF = async (id) => {
  try {
    const response = await apiClient.get(`/invoices/${id}/pdf`, {
      responseType: "blob", // ✅ IMPORTANT
    });

    // Create blob link
    const fileURL = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = fileURL;
    link.setAttribute("download", `invoice_${id}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    console.error("Error downloading PDF", error);
    alert("Failed to download PDF.");
  }
};
