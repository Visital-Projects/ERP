// const BillPaid = require('../models/bill_paid.model');
// const WorkingZone = require('../models/workingZone.model');
// const Vendor = require('../models/vendorName.model');
// const Tax = require('../models/tax.model');
// const Employee = require('../models/employee.model');
const { BillPaid, WorkingZone, Vendor, Tax, Employee } = require('../models');


// Helper: rounding
function round2(v) {
  return Number(Number(v || 0).toFixed(2));
}

// Compute GST
function calculateGST(baseAmount, taxConfig) {
  const cgstR = Number(taxConfig?.cgst_rate || 0);
  const sgstR = Number(taxConfig?.sgst_rate || 0);
  const igstR = Number(taxConfig?.igst_rate || 0);
  const calcType = (taxConfig?.calculation_type || 'exclusive').toLowerCase();
  const R_total = cgstR + sgstR + igstR;

  let taxable = null;
  let cgstAmt = 0, sgstAmt = 0, igstAmt = 0, totalTax = 0, grandTotal = 0;

  if (calcType === 'exclusive') {
    taxable = Number(baseAmount);
    cgstAmt = round2(taxable * (cgstR / 100));
    sgstAmt = round2(taxable * (sgstR / 100));
    igstAmt = round2(taxable * (igstR / 100));
    totalTax = round2(cgstAmt + sgstAmt + igstAmt);
    grandTotal = round2(taxable + totalTax);
  } else {
    if (R_total === 0) {
      taxable = Number(baseAmount);
      cgstAmt = sgstAmt = igstAmt = totalTax = 0;
      grandTotal = round2(baseAmount);
    } else {
      taxable = Number(baseAmount) / (1 + R_total / 100);
      cgstAmt = round2(taxable * (cgstR / 100));
      sgstAmt = round2(taxable * (sgstR / 100));
      igstAmt = round2(taxable * (igstR / 100));
      totalTax = round2(cgstAmt + sgstAmt + igstAmt);
      grandTotal = round2(Number(baseAmount));
      taxable = round2(taxable);
    }
  }

  return {
    taxable_amount: taxable,
    calculation_type: calcType,
    cgst_amount: cgstAmt,
    sgst_amount: sgstAmt,
    igst_amount: igstAmt,
    total_tax: totalTax,
    grand_total: grandTotal
  };
}

// Multi-tenant helper
async function getCompanyId(req) {
  if (!req.user) return null;
  if (req.user.type?.toLowerCase() === "company") return req.user.id;

  const emp = await Employee.findOne({
    where: { user_id: req.user.id },
    attributes: ["created_by"]
  });
  return emp?.created_by || req.user.id;
}

// CREATE BILL_PAID
exports.create = async (req, res) => {
  try {
    const companyId = await getCompanyId(req);
    if (!companyId) return res.status(403).json({ message: "Unable to resolve company" });

    const { workingZone_id, vendor_id, base_amount } = req.body;
    if (!workingZone_id || !vendor_id || base_amount === undefined) {
      return res.status(400).json({ message: "workingZone_id, vendor_id and base_amount are required" });
    }

    const zone = await WorkingZone.findOne({ where: { id: workingZone_id, created_by: companyId } });
    if (!zone) return res.status(400).json({ message: "Invalid workingZone_id" });

    const vendor = await Vendor.findOne({ where: { id: vendor_id, created_by: companyId } });
    if (!vendor) return res.status(400).json({ message: "Invalid vendor_id" });

    // Tax config: latest for company
    let taxConfig = {};
    const tax = await Tax.findOne({
      where: { created_by: companyId },
      order: [['id', 'DESC']]
    });
    if (tax) {
      taxConfig = {
        cgst_rate: Number(tax.cgst_rate || 0),
        sgst_rate: Number(tax.sgst_rate || 0),
        igst_rate: Number(tax.igst_rate || 0),
        calculation_type: tax.calculation_type || 'exclusive'
      };
    }

    // Override with request values
    if (req.body.cgst_rate !== undefined) taxConfig.cgst_rate = Number(req.body.cgst_rate);
    if (req.body.sgst_rate !== undefined) taxConfig.sgst_rate = Number(req.body.sgst_rate);
    if (req.body.igst_rate !== undefined) taxConfig.igst_rate = Number(req.body.igst_rate);
    if (req.body.calculation_type !== undefined) taxConfig.calculation_type = req.body.calculation_type;

    const computed = calculateGST(parseFloat(base_amount), taxConfig);

    const data = await BillPaid.create({
      workingZone_id,
      vendor_id,
      base_amount: parseFloat(base_amount).toFixed(2),
      cgst_amount: computed.cgst_amount.toFixed(2),
      sgst_amount: computed.sgst_amount.toFixed(2),
      igst_amount: computed.igst_amount.toFixed(2),
      total_tax: computed.total_tax.toFixed(2),
      bill_received_in_gst: computed.grand_total.toFixed(2),
      calculation_type: taxConfig.calculation_type || 'exclusive',
      created_by: companyId
    });

    return res.status(201).json({ success: true, data, computed });
  } catch (err) {
    console.error('Error creating bill_paid:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};


// ==============================
// GET ALL
// ==============================
exports.getAll = async (req, res) => {
  try {
    const companyId = await getCompanyId(req);
    const data = await BillPaid.findAll({
      where: { created_by: companyId },
      include:[
        { model: WorkingZone, as:'workingZone', attributes:['id','name'] },
        { model: Vendor, as:'vendor', attributes:['id','name'] }
      ],
      order:[['id','DESC']]
    });
    return res.json({ success:true, data });
  } catch (err) {
    console.error('Error fetching bill_paid:', err);
    return res.status(500).json({ message:'Server error', error:err.message });
  }
};

// ==============================
// GET BY ID
// ==============================
exports.getById = async (req,res)=>{
  try {
    const companyId = await getCompanyId(req);
    const data = await BillPaid.findOne({
      where: { id:req.params.id, created_by: companyId },
      include:[
        { model: WorkingZone, as:'workingZone', attributes:['id','name'] },
        { model: Vendor, as:'vendor', attributes:['id','name'] }
      ]
    });
    if(!data) return res.status(404).json({ message:'Record not found' });
    return res.json({ success:true, data });
  } catch(err){
    console.error('Error fetching bill_paid by id:',err);
    return res.status(500).json({ message:'Server error', error:err.message });
  }
};

// ==============================
// UPDATE
// ==============================
// exports.update = async (req,res)=>{
//   try {
//     const companyId = await getCompanyId(req);
//     const record = await BillPaid.findOne({ where:{ id:req.params.id, created_by:companyId }});
//     if(!record) return res.status(404).json({ message:'Record not found' });

//     const { workingZone_id, vendor_id } = req.body;
//     const base_amount = req.body.base_amount !== undefined ? parseFloat(req.body.base_amount) : parseFloat(record.base_amount);

//     const zoneId = workingZone_id || record.workingZone_id;
//     const vendorId = vendor_id || record.vendor_id;

//     const zone = await WorkingZone.findOne({ where: { id: zoneId, created_by: companyId } });
//     if(!zone) return res.status(400).json({ message:'Invalid workingZone_id' });

//     const vendor = await Vendor.findOne({ where: { id: vendorId, created_by: companyId } });
//     if(!vendor) return res.status(400).json({ message:'Invalid vendor_id' });

//     // Tax config
//     let taxConfig = {};
//     const tax = await Tax.findOne({ where: { plant_id: zone.plant_id, created_by: companyId }, order:[['id','DESC']] });
//     if (tax) {
//       taxConfig = {
//         cgst_rate: Number(tax.cgst_rate || 0),
//         sgst_rate: Number(tax.sgst_rate || 0),
//         igst_rate: Number(tax.igst_rate || 0),
//         calculation_type: tax.calculation_type || 'exclusive'
//       };
//     }

//     if (req.body.cgst_rate !== undefined) taxConfig.cgst_rate = Number(req.body.cgst_rate);
//     if (req.body.sgst_rate !== undefined) taxConfig.sgst_rate = Number(req.body.sgst_rate);
//     if (req.body.igst_rate !== undefined) taxConfig.igst_rate = Number(req.body.igst_rate);
//     if (req.body.calculation_type !== undefined) taxConfig.calculation_type = req.body.calculation_type;

//     const computed = calculateGST(base_amount, taxConfig);

//     await record.update({
//       ...(workingZone_id && { workingZone_id }),
//       ...(vendor_id && { vendor_id }),
//       ...(req.body.base_amount !== undefined && { base_amount: base_amount.toFixed(2) }),
//       cgst_amount: computed.cgst_amount.toFixed(2),
//       sgst_amount: computed.sgst_amount.toFixed(2),
//       igst_amount: computed.igst_amount.toFixed(2),
//       total_tax: computed.total_tax.toFixed(2),
//       bill_received_in_gst: computed.grand_total.toFixed(2),
//       calculation_type: taxConfig.calculation_type || 'exclusive'
//     });

//     return res.json({ success:true, data:record });
//   } catch(err){
//     console.error('Error updating bill_paid:',err);
//     return res.status(500).json({ message:'Server error', error:err.message });
//   }
// };
exports.update = async (req, res) => {
  try {
    const companyId = await getCompanyId(req);

    // Find existing record
    const record = await BillPaid.findOne({
      where: { id: req.params.id, created_by: companyId }
    });
    if (!record) {
      return res.status(404).json({ message: "Record not found" });
    }

    const { workingZone_id, vendor_id } = req.body;
    const base_amount =
      req.body.base_amount !== undefined
        ? parseFloat(req.body.base_amount)
        : parseFloat(record.base_amount);

    const zoneId = workingZone_id || record.workingZone_id;
    const vendorId = vendor_id || record.vendor_id;

    // Validate WorkingZone
    const zone = await WorkingZone.findOne({
      where: { id: zoneId, created_by: companyId }
    });
    if (!zone) {
      return res.status(400).json({ message: "Invalid workingZone_id" });
    }

    // Validate Vendor
    const vendor = await Vendor.findOne({
      where: { id: vendorId, created_by: companyId }
    });
    if (!vendor) {
      return res.status(400).json({ message: "Invalid vendor_id" });
    }

    // Tax config
    let taxConfig = {
      cgst_rate: 0,
      sgst_rate: 0,
      igst_rate: 0,
      calculation_type: "exclusive"
    };

    // Fetch latest tax config for this company
    const tax = await Tax.findOne({
      where: { created_by: companyId },
      order: [["id", "DESC"]]
    });

    if (tax) {
      taxConfig = {
        cgst_rate: Number(tax.cgst_rate || 0),
        sgst_rate: Number(tax.sgst_rate || 0),
        igst_rate: Number(tax.igst_rate || 0),
        calculation_type: tax.calculation_type || "exclusive"
      };
    } else {
      console.warn(`⚠️ No Tax config found for companyId=${companyId}`);
    }

    // Override tax config from request body if provided
    if (req.body.cgst_rate !== undefined)
      taxConfig.cgst_rate = Number(req.body.cgst_rate);
    if (req.body.sgst_rate !== undefined)
      taxConfig.sgst_rate = Number(req.body.sgst_rate);
    if (req.body.igst_rate !== undefined)
      taxConfig.igst_rate = Number(req.body.igst_rate);
    if (req.body.calculation_type !== undefined)
      taxConfig.calculation_type = req.body.calculation_type;

    // Calculate GST
    const computed = calculateGST(base_amount, taxConfig);

    // Update record
    await record.update({
      ...(workingZone_id && { workingZone_id }),
      ...(vendor_id && { vendor_id }),
      ...(req.body.base_amount !== undefined && {
        base_amount: base_amount.toFixed(2)
      }),
      cgst_amount: computed.cgst_amount.toFixed(2),
      sgst_amount: computed.sgst_amount.toFixed(2),
      igst_amount: computed.igst_amount.toFixed(2),
      total_tax: computed.total_tax.toFixed(2),
      bill_received_in_gst: computed.grand_total.toFixed(2),
      calculation_type: taxConfig.calculation_type || "exclusive"
    });

    return res.json({ success: true, data: record });
  } catch (err) {
    console.error("❌ Error updating bill_paid:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ==============================
// DELETE
// ==============================
exports.remove = async (req,res)=>{
  try{
    const companyId = await getCompanyId(req);
    const record = await BillPaid.findOne({ where:{ id:req.params.id, created_by:companyId }});
    if(!record) return res.status(404).json({ message:'Record not found' });

    await record.destroy();
    return res.json({ success:true, message:'Deleted successfully' });
  }catch(err){
    console.error('Error deleting bill_paid:',err);
    return res.status(500).json({ message:'Server error', error:err.message });
  }
};
