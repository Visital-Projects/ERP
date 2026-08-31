import apiClient from "./apiClient";

// ✅ Get all BillPaid records
export const getAllBillPaid = async () => {
  const res = await apiClient.get("/bill-paid"); // matches router.get('/')
  return res.data.data; // backend sends { success, data: [...] }
};

// ✅ Get BillPaid by ID
export const getBillPaidById = async (id) => {
  const res = await apiClient.get(`/bill-paid/${id}`);
  return res.data.data;
};

// ✅ Create BillPaid
export const createBillPaid = async (billData) => {
  const payload = {
    workingZone_id: billData.workingZone_id,
    vendor_id: billData.vendor_id,
    base_amount: billData.base_amount,
    cgst_rate: billData.cgst_rate,       // optional override
    sgst_rate: billData.sgst_rate,       // optional override
    igst_rate: billData.igst_rate,       // optional override
    calculation_type: billData.calculation_type, // optional
  };
  const res = await apiClient.post("/bill-paid", payload);
  return res.data;
};

// ✅ Update BillPaid
// export const updateBillPaid = async (id, billData) => {
//   const payload = {
//     ...(billData.workingZone_id && { workingZone_id: billData.workingZone_id }),
//     ...(billData.vendor_id && { vendor_id: billData.vendor_id }),
//     ...(billData.base_amount !== undefined && { base_amount: billData.base_amount }),
//     ...(billData.cgst_rate !== undefined && { cgst_rate: billData.cgst_rate }),
//     ...(billData.sgst_rate !== undefined && { sgst_rate: billData.sgst_rate }),
//     ...(billData.igst_rate !== undefined && { igst_rate: billData.igst_rate }),
//     ...(billData.calculation_type && { calculation_type: billData.calculation_type }),
//   };
//   const res = await apiClient.patch(`/bill-paid/${id}`, payload);
//   return res.data;
// };

// ✅ Update BillPaid (Fixed)
export const updateBillPaid = async (id, billData) => {
  const payload = {};

  if (billData.workingZone_id) payload.workingZone_id = billData.workingZone_id;
  if (billData.vendor_id) payload.vendor_id = billData.vendor_id;

  if (billData.base_amount !== "" && billData.base_amount !== undefined)
    payload.base_amount = Number(billData.base_amount);

  if (billData.cgst_rate !== "" && billData.cgst_rate !== undefined)
    payload.cgst_rate = Number(billData.cgst_rate);

  if (billData.sgst_rate !== "" && billData.sgst_rate !== undefined)
    payload.sgst_rate = Number(billData.sgst_rate);

  if (billData.igst_rate !== "" && billData.igst_rate !== undefined)
    payload.igst_rate = Number(billData.igst_rate);

  if (billData.calculation_type)
    payload.calculation_type = billData.calculation_type;

  const res = await apiClient.patch(`/bill-paid/${id}`, payload);
  return res.data;
};

// ✅ Delete BillPaid
export const deleteBillPaid = async (id) => {
  const res = await apiClient.delete(`/bill-paid/${id}`);
  return res.data;
};

const billPaidService = {
  getAllBillPaid,
  getBillPaidById,
  createBillPaid,
  updateBillPaid,
  deleteBillPaid,
};

export default billPaidService;
