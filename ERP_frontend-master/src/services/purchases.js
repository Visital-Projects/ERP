// src/services/purchases.js
const baseURL = import.meta.env.VITE_BASE_URL;

const getAuthHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

// 🔹 Fetch all suppliers
export const fetchSuppliers = async () => {
  try {
    const res = await fetch(`${baseURL}/api/venders`, { headers: getAuthHeaders() });
    const json = await res.json();
    return json.success ? json.data : [];
  } catch (err) {
    console.error("Error fetching suppliers:", err);
    return [];
  }
};

// 🔹 Create supplier
export const createSupplier = async (supplierData) => {
  try {
    const res = await fetch(`${baseURL}/api/venders`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(supplierData),
    });
    return await res.json();
  } catch (err) {
    console.error("Error creating supplier:", err);
    return { success: false, message: err.message };
  }
};

// 🔹 Update supplier
export const updateSupplier = async (id, supplierData) => {
  try {
    const res = await fetch(`${baseURL}/api/venders/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(supplierData),
    });
    return await res.json();
  } catch (err) {
    console.error("Error updating supplier:", err);
    return { success: false, message: err.message };
  }
};

// 🔹 Delete supplier
export const deleteSupplier = async (id) => {
  try {
    const res = await fetch(`${baseURL}/api/venders/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return await res.json();
  } catch (err) {
    console.error("Error deleting supplier:", err);
    return { success: false, message: err.message };
  }
};

// 🔹 Fetch supplier by ID
export const fetchSupplierById = async (id) => {
  try {
    const res = await fetch(`${baseURL}/api/venders/${id}`, { headers: getAuthHeaders() });
    const json = await res.json();
    return json.success ? json.data : null;
  } catch (err) {
    console.error("Error fetching supplier by ID:", err);
    return null;
  }
};
