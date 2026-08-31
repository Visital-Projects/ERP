

// src/services/productService.js

const baseURL = import.meta.env.VITE_BASE_URL;

// 🔹 Helper function to get Authorization headers
const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

// 🔹 Get all products
export const fetchProducts = async () => {
  try {
    const res = await fetch(`${baseURL}/api/products`, {
      headers: getAuthHeaders(),
    });
    const json = await res.json();
    return json.code === 200 ? json.data : [];
  } catch (err) {
    console.error("Error fetching products:", err);
    return [];
  }
};

// 🔹 Get single product by ID
export const fetchProductById = async (id) => {
  try {
    const res = await fetch(`${baseURL}/api/products/${id}`, {
      headers: getAuthHeaders(),
    });
    const json = await res.json();
    return json.code === 200 ? json.data : null;
  } catch (err) {
    console.error("Error fetching product:", err);
    return null;
  }
};

// 🔹 Create product with file upload support
export const createProduct = async (productData) => {
  try {
    const formData = new FormData();

    formData.append('name', productData.name);
    formData.append('sale_price', parseFloat(productData.sale_price));

    // ✅ Add SKU field
    if (productData.sku && productData.sku.trim() !== '') {
      formData.append('sku', productData.sku.trim());
    }

    if (productData.purchase_price)
      formData.append('purchase_price', parseFloat(productData.purchase_price));
    if (productData.quantity !== undefined && productData.quantity !== null)
      formData.append('quantity', parseInt(productData.quantity));
    formData.append('description', productData.description || '');
    formData.append('type', productData.type);
    if (productData.category_id) formData.append('category_id', productData.category_id);
    if (productData.unit_id) formData.append('unit_id', productData.unit_id);
    if (productData.tax_id) formData.append('tax_id', productData.tax_id);
    if (productData.sale_chartaccount_id) formData.append('sale_chartaccount_id', productData.sale_chartaccount_id);
    if (productData.expense_chartaccount_id) formData.append('expense_chartaccount_id', productData.expense_chartaccount_id);
    if (productData.pro_image instanceof File) formData.append('pro_image', productData.pro_image);

    const res = await fetch(`${baseURL}/api/products`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: formData,
    });

    return await res.json();
  } catch (err) {
    console.error('Error creating product:', err);
    return { code: 500, error: err.message };
  }
};



// 🔹 Update product with file upload support (FIXED)
export const updateProduct = async (id, productData) => {
  try {
    const formData = new FormData();

    // Required fields
    formData.append("name", productData.name);
    formData.append("sale_price", parseFloat(productData.sale_price));
    formData.append("description", productData.description || "");
    formData.append("type", productData.type);

    // ✅ Add SKU field for update
    if (productData.sku && productData.sku.trim() !== '') {
      formData.append('sku', productData.sku.trim());
    }

    // Optional fields
    if (productData.purchase_price)
      formData.append("purchase_price", parseFloat(productData.purchase_price));
    if (productData.quantity !== undefined && productData.quantity !== null)
      formData.append("quantity", parseInt(productData.quantity));
    if (productData.category_id)
      formData.append("category_id", productData.category_id);
    if (productData.unit_id)
      formData.append("unit_id", productData.unit_id);
    if (productData.tax_id)
      formData.append("tax_id", productData.tax_id);
    if (productData.sale_chartaccount_id)
      formData.append("sale_chartaccount_id", productData.sale_chartaccount_id);
    if (productData.expense_chartaccount_id)
      formData.append("expense_chartaccount_id", productData.expense_chartaccount_id);

    // File
    if (productData.pro_image instanceof File)
      formData.append("pro_image", productData.pro_image);

    // Try POST first (common for Laravel), if fails try PUT
    const res = await fetch(`${baseURL}/api/products/${id}`, {
      method: "POST", // Most Laravel backends use POST for updates
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: formData,
    });

    // If POST returns HTML error, try PUT
    const responseText = await res.text();

    try {
      // Try to parse as JSON first
      return JSON.parse(responseText);
    } catch (parseError) {
      // If JSON parsing fails, try PUT method
      console.log('POST method failed, trying PUT...');

      const putRes = await fetch(`${baseURL}/api/products/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      return await putRes.json();
    }
  } catch (err) {
    console.error("Error updating product:", err);
    return { code: 500, error: err.message };
  }
};

// 🔹 Delete product
export const deleteProduct = async (id) => {
  try {
    const res = await fetch(`${baseURL}/api/products/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return await res.json();
  } catch (err) {
    console.error("Error deleting product:", err);
    return { code: 500, error: err.message };
  }
};