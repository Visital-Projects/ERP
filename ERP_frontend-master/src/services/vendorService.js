// // src/services/vendorService.js
// import apiClient from "./apiClient";

// // ✅ Get all vendors
// const getAllVendors = async () => {
//   const res = await apiClient.get("/vendor-names");
//   return res.data.data;
// };

// // ✅ Get vendor by ID
// const getVendorById = async (id) => {
//   const res = await apiClient.get(`/vendor-names/${id}`);
//   return res.data.data;
// };

// // ✅ Create vendor
// const createVendor = async (vendorData) => {
//   const res = await apiClient.post("/vendor-names", vendorData);
//   return res.data.data;
// };

// // ✅ Update vendor
// const updateVendor = async (vendorId, vendorData) => {
//   const res = await apiClient.put(`/vendor-names/${vendorId}`, vendorData);
//   return res.data.data;
// };

// // ✅ Delete vendor
// const deleteVendor = async (vendorId) => {
//   const res = await apiClient.delete(`/vendor-names/${vendorId}`);
//   return res.data;
// };

// const vendorService = {
//   getAllVendors,
//   getVendorById,
//   createVendor,
//   updateVendor,
//   deleteVendor,
// };

// export default vendorService;


// src/services/vendorService.js
import apiClient from "./apiClient";

// ✅ Get all vendors (includes working zone info from backend)
const getAllVendors = async () => {
  const res = await apiClient.get("/vendor-names"); // matches router.get('/')
  return res.data.data; // backend sends { success, data: [...] }
};

// ✅ Get vendor by ID
const getVendorById = async (id) => {
  const res = await apiClient.get(`/vendor-names/${id}`); // matches router.get('/:id')
  return res.data.data;
};

// ✅ Create vendor
const createVendor = async (vendorData) => {
  const payload = {
    working_zone_id: vendorData.working_zone_id,
    name: vendorData.name,
  };
  const res = await apiClient.post("/vendor-names", payload); // matches router.post('/')
  return res.data.data;
};

// ✅ Update vendor
const updateVendor = async (vendorId, vendorData) => {
  const payload = {
    name: vendorData.name,
    working_zone_id: vendorData.working_zone_id, // optional — controller checks if sent
  };
  const res = await apiClient.put(`/vendor-names/${vendorId}`, payload); // matches router.put('/:id')
  return res.data.data;
};

// ✅ Delete vendor
const deleteVendor = async (vendorId) => {
  const res = await apiClient.delete(`/vendor-names/${vendorId}`); // matches router.delete('/:id')
  return res.data;
};

const vendorService = {
  getAllVendors,
  getVendorById,
  createVendor,
  updateVendor,
  deleteVendor,
};

export default vendorService;
