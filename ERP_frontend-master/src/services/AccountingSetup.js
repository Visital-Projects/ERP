// src/services/accountingSetupService.js

const baseURL = import.meta.env.VITE_BASE_URL;

// 🔹 Helper function to get Authorization headers
const getAuthHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

// 🔹 Fetch Taxes
export const fetchTaxes = async () => {
  try {
    const res = await fetch(`${baseURL}/api/taxes`, {
      headers: getAuthHeaders(),
    });
    const json = await res.json();
    return json.success ? json.data : [];
  } catch (err) {
    console.error("Error fetching taxes:", err);
    return [];
  }
};

// 🔹 Create or Update Tax
export const saveTax = async (tax, editingItem = null) => {
  try {
    const url = editingItem
      ? `${baseURL}/api/taxes/${editingItem.id}`
      : `${baseURL}/api/taxes`;
    const method = editingItem ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: getAuthHeaders(),
      body: JSON.stringify(tax),
    });
    return await res.json();
  } catch (err) {
    console.error("Error saving tax:", err);
    return { success: false, message: err.message };
  }
};

// 🔹 Delete Tax
export const deleteTax = async (id) => {
  try {
    const res = await fetch(`${baseURL}/api/taxes/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return await res.json();
  } catch (err) {
    console.error("Error deleting tax:", err);
    return { success: false, message: err.message };
  }
};

// fetch unit
export const fetchUnits = async () => {
  try {
    const res = await fetch(`${baseURL}/api/units`, {
      headers: getAuthHeaders(),
    });
    const json = await res.json();
    return json.success ? json.data : [];
  } catch (err) {
    console.error("Error fetching units:", err);
    return [];
  }
};
// 🔹 Create Unit
export const createUnit = async (unit) => {
  try {
    const res = await fetch(`${baseURL}/api/units`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(unit),
    });
    return await res.json();
  } catch (err) {
    console.error("Error creating unit:", err);
    return { success: false, message: err.message };
  }
};

// 🔹 Update Unit
export const updateUnit = async (id, unit) => {
  try {
    const res = await fetch(`${baseURL}/api/units/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(unit),
    });
    return await res.json();
  } catch (err) {
    console.error("Error updating unit:", err);
    return { success: false, message: err.message };
  }
};


// Delete Unit
export const deleteUnit = async (id) => {
  try {
    const res = await fetch(`${baseURL}/api/units/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return await res.json();
  } catch (err) {
    console.error("Error deleting unit:", err);
    return { success: false, message: err.message };
  }
};



// 🔹 Fetch Categories
export const fetchCategories = async () => {
  try {
    const res = await fetch(`${baseURL}/api/categories`, {
      headers: getAuthHeaders(),
    });
    const json = await res.json();
    console.log("API response:", json); // 🔹 see what it actually returns

    // Adjust according to the API response structure
    // For example, if API returns an array directly:
    return Array.isArray(json) ? json : json.data || [];
  } catch (err) {
    console.error("Error fetching categories:", err);
    return [];
  }
};

// 🔹 Create Category
export const createCategory = async (category) => {
  try {
    const res = await fetch(`${baseURL}/api/categories`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(category),
    });
    return await res.json();
  } catch (err) {
    console.error("Error creating category:", err);
    return { success: false, message: err.message };
  }
};

// 🔹 Update Category
export const updateCategory = async (id, category) => {
  try {
    const res = await fetch(`${baseURL}/api/categories/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(category),
    });
    return await res.json();
  } catch (err) {
    console.error("Error updating category:", err);
    return { success: false, message: err.message };
  }
};

// 🔹 Delete Category
export const deleteCategory = async (id) => {
  try {
    const res = await fetch(`${baseURL}/api/categories/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return await res.json();
  } catch (err) {
    console.error("Error deleting category:", err);
    return { success: false, message: err.message };
  }
};


// 🔹 Fetch Units


// 🔹 Fetch Custom Fields
export const fetchCustomFields = async () => {
  try {
    const res = await fetch(`${baseURL}/api/custom-fields`, {
      headers: getAuthHeaders(),
    });
    const json = await res.json();
    return json.success ? json.data : [];
  } catch (err) {
    console.error("Error fetching custom fields:", err);
    return [];
  }
};

export const fetchAccountTypes = async () => {
  try {
    const res = await fetch(`${baseURL}/api/chart-of-account-types`, {
      headers: getAuthHeaders(),
    });
    const json = await res.json();
    return json.success ? json.data : [];
  } catch (error) {
    console.error("Error fetching account types:", error);
    return [];
  }
};

export const fetchChartAccounts = async () => {
  try {
    const res = await fetch(`${baseURL}/api/chart-of-account`, {
      headers: getAuthHeaders(),
    });
    const json = await res.json();
    return json.success ? json.data : [];
  } catch (error) {
    console.error("Error fetching chart accounts:", error);
    return [];
  }
};


export const fetchParentAccounts = async () => {
  try {
    const res = await fetch(`${baseURL}/api/chart-of-account-parent`, {
      headers: getAuthHeaders(),
    });
    const json = await res.json();
    return json.success ? json.data : [];
  } catch (error) {
    console.error("Error fetching parent accounts:", error);
    return [];
  }
};

export const createChartAccount = async (account) => {
  try {
    const res = await fetch(`${baseURL}/api/chart-of-account`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(account),
    });
    return await res.json(); // returns { success, message, data }
  } catch (err) {
    console.error("Error creating chart account:", err);
    return { success: false, message: err.message };
  }
};
// 🔹 Delete Chart of Account
export const deleteChartAccount = async (id) => {
  try {
    const res = await fetch(`${baseURL}/api/chart-of-account/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return await res.json();
  } catch (err) {
    console.error("Error deleting chart account:", err);
    return { success: false, message: err.message };
  }
};
export const updateChartAccount = async (id, account) => {
  try {
    const res = await fetch(`${baseURL}/api/chart-of-account/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(account),
    });
    return await res.json(); // { success, message, data }
  } catch (err) {
    console.error("Error updating chart account:", err);
    return { success: false, message: err.message };
  }
};

export const createParentAccount = async (parent) => {
  try {
    const res = await fetch(`${baseURL}/api/chart-of-account-parent`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(parent),
    });
    return await res.json();
  } catch (err) {
    console.error("Error creating parent account:", err);
    return { success: false, message: err.message };
  }
};



// BANK TRANSFER
// 🔹 Fetch all bank transfers
export const fetchBankTransfers = async () => {
  try {
    const res = await fetch(`${baseURL}/api/bank-transfers`, {
      headers: getAuthHeaders(),
    });
    const json = await res.json();
    return json.success ? json.data : [];
  } catch (err) {
    console.error("Error fetching bank transfers:", err);
    return [];
  }
};

// 🔹 Create a new bank transfer
export const createBankTransfer = async (transfer) => {
  try {
    const res = await fetch(`${baseURL}/api/bank-transfers`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(transfer),
    });
    return await res.json();
  } catch (err) {
    console.error("Error creating bank transfer:", err);
    return { success: false, message: err.message };
  }
};

// 🔹 Update bank transfer
export const updateBankTransfer = async (id, transfer) => {
  try {
    const res = await fetch(`${baseURL}/api/bank-transfers/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(transfer),
    });
    return await res.json();
  } catch (err) {
    console.error("Error updating bank transfer:", err);
    return { success: false, message: err.message };
  }
};

// 🔹 Delete bank transfer
export const deleteBankTransfer = async (id) => {
  try {
    const res = await fetch(`${baseURL}/api/bank-transfers/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return await res.json();
  } catch (err) {
    console.error("Error deleting bank transfer:", err);
    return { success: false, message: err.message };
  }
};

export const fetchRevenues = async () => {
  try {
    const res = await fetch(`${baseURL}/api/revenues`, {
      headers: getAuthHeaders(),
    });
    const json = await res.json();
    return json.success ? json.data : [];
  } catch (err) {
    console.error("Error fetching revenues:", err);
    return [];
  }
};
export const createRevenue = async (formData) => {
  try {
    const res = await fetch(`${baseURL}/api/revenues`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: formData, // FormData object
    });

    // Check if server returned JSON
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch {
      console.error("Server response is not JSON:", text);
      return { success: false, message: "Invalid server response" };
    }
  } catch (err) {
    console.error("Error creating revenue:", err);
    return { success: false, message: err.message };
  }
};

// 🔹 Update Revenue
export const updateRevenue = async (id, formData) => {
  try {
    const res = await fetch(`${baseURL}/api/revenues/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        // Note: Do NOT set 'Content-Type' when sending FormData
      },
      body: formData, // FormData object
    });

    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch {
      console.error("Server response is not JSON:", text);
      return { success: false, message: "Invalid server response" };
    }
  } catch (err) {
    console.error("Error updating revenue:", err);
    return { success: false, message: err.message };
  }
};

// 🔹 Delete Revenue
export const deleteRevenue = async (id) => {
  try {
    const res = await fetch(`${baseURL}/api/revenues/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    const json = await res.json();
    return json;
  } catch (err) {
    console.error("Error deleting revenue:", err);
    return { success: false, message: err.message };
  }
};
