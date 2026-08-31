

// // controllers/base_amount.controller.js
// const BaseAmount = require('../models/base_amount.model');
// const JobMode = require('../models/job_mode.model');
// const PlantName = require('../models/plant_name.model');
// const ContractPeriod = require('../models/contract_period.model');
// const Tax = require('../models/tax.model');
// const Employee = require('../models/employee.model');

// // helper: rounding
// function round2(v) {
//   return Number(Number(v || 0).toFixed(2));
// }

// // compute GST
// function calculateGST(baseAmount, taxConfig) {
//   const cgstR = Number(taxConfig?.cgst_rate || 0);
//   const sgstR = Number(taxConfig?.sgst_rate || 0);
//   const igstR = Number(taxConfig?.igst_rate || 0);
//   const calcType = (taxConfig?.calculation_type || 'exclusive').toLowerCase();
//   const R_total = cgstR + sgstR + igstR;

//   let taxable = null;
//   let cgstAmt = 0, sgstAmt = 0, igstAmt = 0, totalTax = 0, grandTotal = 0;

//   if (calcType === 'exclusive') {
//     taxable = Number(baseAmount);
//     const preciseTax = taxable * (R_total / 100.0);

//     cgstAmt = round2(taxable * (cgstR / 100.0));
//     sgstAmt = round2(taxable * (sgstR / 100.0));
//     igstAmt = round2(taxable * (igstR / 100.0));

//     const adjustment = round2(preciseTax - (cgstAmt + sgstAmt + igstAmt));
//     if (adjustment !== 0) {
//       if (igstAmt !== 0) igstAmt = round2(igstAmt + adjustment);
//       else if (sgstAmt !== 0) sgstAmt = round2(sgstAmt + adjustment);
//       else cgstAmt = round2(cgstAmt + adjustment);
//     }

//     totalTax = round2(cgstAmt + sgstAmt + igstAmt);
//     grandTotal = round2(taxable + totalTax);
//   } else {
//     if (R_total === 0) {
//       taxable = Number(baseAmount);
//       cgstAmt = sgstAmt = igstAmt = totalTax = 0;
//       grandTotal = round2(baseAmount);
//     } else {
//       taxable = Number(baseAmount) / (1 + R_total / 100.0);
//       const preciseTax = Number(baseAmount) - taxable;

//       cgstAmt = round2(taxable * (cgstR / 100.0));
//       sgstAmt = round2(taxable * (sgstR / 100.0));
//       igstAmt = round2(taxable * (igstR / 100.0));

//       const adjustment = round2(preciseTax - (cgstAmt + sgstAmt + igstAmt));
//       if (adjustment !== 0) {
//         if (igstAmt !== 0) igstAmt = round2(igstAmt + adjustment);
//         else if (sgstAmt !== 0) sgstAmt = round2(sgstAmt + adjustment);
//         else cgstAmt = round2(cgstAmt + adjustment);
//       }

//       totalTax = round2(cgstAmt + sgstAmt + igstAmt);
//       grandTotal = round2(Number(baseAmount));
//       taxable = round2(taxable);
//     }
//   }

//   return {
//     taxable_amount: taxable === null ? null : round2(taxable),
//     calculation_type: calcType,
//     cgst_amount: round2(cgstAmt),
//     sgst_amount: round2(sgstAmt),
//     igst_amount: round2(igstAmt),
//     total_tax: round2(totalTax),
//     grand_total: round2(grandTotal)
//   };
// }

// // ==============================
// // Multi-tenant company helper
// // ==============================
// async function getCompanyId(req) {
//   if (!req.user) return null;

//   const type = req.user.type?.toLowerCase();

//   if (type === "company") return req.user.id;

//   if (type === "employee") {
//     const emp = await Employee.findOne({
//       where: { user_id: req.user.id },
//       attributes: ["created_by"],
//     });
//     if (emp?.created_by) return emp.created_by;
//   }

//   const emp = await Employee.findOne({
//     where: { user_id: req.user.id },
//     attributes: ["created_by"],
//   });
//   if (emp?.created_by) return emp.created_by;

//   return req.user.id;
// }


// // exports.create = async (req, res) => {
// //   try {
// //     const companyId = await getCompanyId(req);
// //     if (!companyId) return res.status(403).json({ message: "Unable to resolve company" });

// //     if (req.user.type?.toLowerCase() === "employee") {
// //       return res.status(403).json({ message: "Not allowed to create BaseAmount" });
// //     }

// //     let { job_mode_id, plant_id, po_wo_id, base_amount } = req.body;
// //     if (!job_mode_id || !plant_id || !po_wo_id || base_amount === undefined) {
// //       return res.status(400).json({ message: "All fields are required" });
// //     }

// //     base_amount = parseFloat(base_amount);
// //     if (isNaN(base_amount) || base_amount < 0) {
// //       return res.status(400).json({ message: "base_amount must be non-negative number" });
// //     }

// //     // Validate job_mode, plant, contract
// //     const jm = await JobMode.findOne({ where: { id: job_mode_id, created_by: companyId } });
// //     if (!jm) return res.status(400).json({ message: "Invalid job_mode_id for this company" });

// //     const plant = await PlantName.findOne({ where: { id: plant_id, created_by: companyId } });
// //     if (!plant) return res.status(400).json({ message: "Invalid plant_id for this company" });

// //     const contract = await ContractPeriod.findOne({ where: { id: po_wo_id, created_by: companyId } });
// //     if (!contract) return res.status(400).json({ message: "Invalid po_wo_id for this company" });

// //     if (String(contract.job_mode_id) !== String(job_mode_id) || String(contract.plant_id) !== String(plant_id)) {
// //       return res.status(400).json({ message: "Contract PO/WO does not match provided job_mode or plant" });
// //     }

// //     // Tax config
// //     let taxConfig = null;
// //     try {
// //       const plantTax = await Tax.findOne({ where: { plant_id, created_by: companyId }, order: [['id','DESC']] });
// //       if (plantTax) taxConfig = {
// //         cgst_rate: Number(plantTax.cgst_rate || 0),
// //         sgst_rate: Number(plantTax.sgst_rate || 0),
// //         igst_rate: Number(plantTax.igst_rate || 0),
// //         calculation_type: plantTax.calculation_type || 'exclusive'
// //       };
// //     } catch { taxConfig = null; }

// //     // override request
// //     taxConfig = taxConfig || {};
// //     if (req.body.cgst_rate !== undefined) taxConfig.cgst_rate = Number(req.body.cgst_rate);
// //     if (req.body.sgst_rate !== undefined) taxConfig.sgst_rate = Number(req.body.sgst_rate);
// //     if (req.body.igst_rate !== undefined) taxConfig.igst_rate = Number(req.body.igst_rate);
// //     if (req.body.calculation_type !== undefined) taxConfig.calculation_type = req.body.calculation_type;

// //     taxConfig = taxConfig || { cgst_rate:0, sgst_rate:0, igst_rate:0, calculation_type:'exclusive' };

// //     const computed = calculateGST(base_amount, taxConfig);

// //     const data = await BaseAmount.create({
// //       job_mode_id,
// //       plant_id,
// //       po_wo_id,
// //       base_amount: base_amount.toFixed(2),
// //       cgst_rate: (taxConfig.cgst_rate || 0).toFixed(2),
// //       sgst_rate: (taxConfig.sgst_rate || 0).toFixed(2),
// //       igst_rate: (taxConfig.igst_rate || 0).toFixed(2),
// //       calculation_type: taxConfig.calculation_type || 'exclusive',
// //       taxable_amount: computed.taxable_amount !== null ? computed.taxable_amount.toFixed(2) : null,
// //       cgst_amount: computed.cgst_amount.toFixed(2),
// //       sgst_amount: computed.sgst_amount.toFixed(2),
// //       igst_amount: computed.igst_amount.toFixed(2),
// //       total_tax: computed.total_tax.toFixed(2),
// //       grand_total: computed.grand_total.toFixed(2),
// //       created_by: companyId
// //     });

// //     return res.status(201).json({ success: true, data, computed, tax_source: taxConfig ? 'plant/local-or-override':'default' });
// //   } catch (err) {
// //     console.error('Error creating base_amount:', err);
// //     return res.status(500).json({ message: 'Server error', error: err.message });
// //   }
// // };



// exports.create = async (req, res) => {
//   try {
//     const companyId = await getCompanyId(req);
//     if (!companyId) return res.status(403).json({ message: "Unable to resolve company" });

//     if (req.user.type?.toLowerCase() === "employee") {
//       return res.status(403).json({ message: "Not allowed to create BaseAmount" });
//     }

//     let { job_mode_id, branch_id, po_wo_id, base_amount } = req.body;
//     if (!job_mode_id || !branch_id || !po_wo_id || base_amount === undefined) {
//       return res.status(400).json({ message: "All fields are required" });
//     }

//     base_amount = parseFloat(base_amount);
//     if (isNaN(base_amount) || base_amount < 0) {
//       return res.status(400).json({ message: "base_amount must be non-negative number" });
//     }

//     // Validate job_mode and branch
//     const jm = await JobMode.findOne({ where: { id: job_mode_id, created_by: companyId } });
//     if (!jm) return res.status(400).json({ message: "Invalid job_mode_id for this company" });

//     const branch = await Branch.findOne({ where: { id: branch_id, created_by: companyId } });
//     if (!branch) return res.status(400).json({ message: "Invalid branch_id for this company" });

//     const contract = await ContractPeriod.findOne({ where: { id: po_wo_id, created_by: companyId } });
//     if (!contract) return res.status(400).json({ message: "Invalid po_wo_id for this company" });

//     // Check contract consistency
//     if (String(contract.job_mode_id) !== String(job_mode_id) || String(contract.branch_id) !== String(branch_id)) {
//       return res.status(400).json({ message: "Contract PO/WO does not match provided job_mode or branch" });
//     }

//     // Tax config
//     let taxConfig = {};
//     if (req.body.cgst_rate !== undefined) taxConfig.cgst_rate = Number(req.body.cgst_rate);
//     if (req.body.sgst_rate !== undefined) taxConfig.sgst_rate = Number(req.body.sgst_rate);
//     if (req.body.igst_rate !== undefined) taxConfig.igst_rate = Number(req.body.igst_rate);
//     if (req.body.calculation_type !== undefined) taxConfig.calculation_type = req.body.calculation_type;

//     const computed = calculateGST(base_amount, taxConfig);

//     const data = await BaseAmount.create({
//       job_mode_id,
//       branch_id,
//       po_wo_id,
//       base_amount: base_amount.toFixed(2),
//       cgst_rate: (taxConfig.cgst_rate || 0).toFixed(2),
//       sgst_rate: (taxConfig.sgst_rate || 0).toFixed(2),
//       igst_rate: (taxConfig.igst_rate || 0).toFixed(2),
//       calculation_type: taxConfig.calculation_type || 'exclusive',
//       taxable_amount: computed.taxable_amount !== null ? computed.taxable_amount.toFixed(2) : null,
//       cgst_amount: computed.cgst_amount.toFixed(2),
//       sgst_amount: computed.sgst_amount.toFixed(2),
//       igst_amount: computed.igst_amount.toFixed(2),
//       total_tax: computed.total_tax.toFixed(2),
//       grand_total: computed.grand_total.toFixed(2),
//       created_by: companyId
//     });

//     return res.status(201).json({ success: true, data, computed, tax_source: 'override' });
//   } catch (err) {
//     console.error('Error creating base_amount:', err);
//     return res.status(500).json({ message: 'Server error', error: err.message });
//   }
// };


// // ==============================
// // GET ALL
// // ==============================



// exports.getAll = async (req, res) => {
//   try {
//     const companyId = await getCompanyId(req);
//     if (!companyId) return res.status(403).json({ message: "Unable to resolve company" });

//     const data = await BaseAmount.findAll({
//       where: { created_by: companyId },
//       include: [
//         { model: JobMode, as:'job_mode', attributes:['id','name'] },
//         { model: PlantName, as:'plant', attributes:['id','name'] },
//         { model: ContractPeriod, as:'contract_period', attributes:['id','po_wo_number'] }
//       ],
//       order:[['id','DESC']]
//     });

//     return res.json({ success:true, data });
//   } catch (err) {
//     console.error('Error fetching base_amounts:', err);
//     return res.status(500).json({ message:'Server error', error:err.message });
//   }
// };

// // ==============================
// // GET BY ID
// // ==============================
// exports.getById = async (req,res)=>{
//   try {
//     const companyId = await getCompanyId(req);
//     if (!companyId) return res.status(403).json({ message:"Unable to resolve company" });

//     const data = await BaseAmount.findOne({
//       where: { id:req.params.id, created_by: companyId },
//       include:[
//         { model: JobMode, as:'job_mode', attributes:['id','name'] },
//         { model: PlantName, as:'plant', attributes:['id','name'] },
//         { model: ContractPeriod, as:'contract_period', attributes:['id','po_wo_number'] }
//       ]
//     });

//     if (!data) return res.status(404).json({ message:'Record not found' });
//     return res.json({ success:true, data });
//   } catch(err){
//     console.error('Error fetching base_amount by id:',err);
//     return res.status(500).json({ message:'Server error', error:err.message });
//   }
// };

// // ==============================
// // UPDATE
// // ==============================
// exports.update = async (req,res)=>{
//   try {
//     const companyId = await getCompanyId(req);
//     if (!companyId) return res.status(403).json({ message:"Unable to resolve company" });

//     if (req.user.type?.toLowerCase() === 'employee') {
//       return res.status(403).json({ message:"Not allowed to update BaseAmount" });
//     }

//     const record = await BaseAmount.findOne({ where:{ id:req.params.id, created_by:companyId }});
//     if (!record) return res.status(404).json({ message:'Record not found' });

//     let { job_mode_id, plant_id, po_wo_id } = req.body;
//     let base_amount = req.body.base_amount !== undefined ? parseFloat(req.body.base_amount) : parseFloat(record.base_amount);

//     if (job_mode_id || plant_id || po_wo_id) {
//       const contract = await ContractPeriod.findOne({ where:{ id: po_wo_id || record.po_wo_id, created_by: companyId } });
//       if (!contract) return res.status(400).json({ message:'Invalid po_wo_id for this company' });

//       const newJobMode = job_mode_id || record.job_mode_id;
//       const newPlant = plant_id || record.plant_id;

//       if (String(contract.job_mode_id)!==String(newJobMode) || String(contract.plant_id)!==String(newPlant)) {
//         return res.status(400).json({ message:'Contract PO/WO does not match provided job_mode or plant' });
//       }
//     }

//     if (isNaN(base_amount) || base_amount<0) return res.status(400).json({ message:'base_amount must be non-negative number' });

//     const newPlantId = plant_id || record.plant_id;
//     let taxConfig = null;
//     try {
//       const plantTax = await Tax.findOne({ where:{ plant_id:newPlantId, created_by:companyId }, order:[['id','DESC']] });
//       if (plantTax) taxConfig = {
//         cgst_rate:Number(plantTax.cgst_rate||0),
//         sgst_rate:Number(plantTax.sgst_rate||0),
//         igst_rate:Number(plantTax.igst_rate||0),
//         calculation_type:plantTax.calculation_type||'exclusive'
//       };
//     } catch { taxConfig=null; }

//     taxConfig = taxConfig || {};
//     if (req.body.cgst_rate!==undefined) taxConfig.cgst_rate = Number(req.body.cgst_rate);
//     if (req.body.sgst_rate!==undefined) taxConfig.sgst_rate = Number(req.body.sgst_rate);
//     if (req.body.igst_rate!==undefined) taxConfig.igst_rate = Number(req.body.igst_rate);
//     if (req.body.calculation_type!==undefined) taxConfig.calculation_type = req.body.calculation_type;

//     taxConfig = taxConfig || { cgst_rate:0, sgst_rate:0, igst_rate:0, calculation_type:'exclusive' };
//     const computed = calculateGST(base_amount, taxConfig);

//     const updatePayload = {
//       ...(job_mode_id && { job_mode_id }),
//       ...(plant_id && { plant_id }),
//       ...(po_wo_id && { po_wo_id }),
//       ...(req.body.base_amount !== undefined && { base_amount: base_amount.toFixed(2) }),
//       cgst_rate:(taxConfig.cgst_rate||0).toFixed(2),
//       sgst_rate:(taxConfig.sgst_rate||0).toFixed(2),
//       igst_rate:(taxConfig.igst_rate||0).toFixed(2),
//       calculation_type: taxConfig.calculation_type || 'exclusive',
//       taxable_amount: computed.taxable_amount !== null ? computed.taxable_amount.toFixed(2) : null,
//       cgst_amount: computed.cgst_amount.toFixed(2),
//       sgst_amount: computed.sgst_amount.toFixed(2),
//       igst_amount: computed.igst_amount.toFixed(2),
//       total_tax: computed.total_tax.toFixed(2),
//       grand_total: computed.grand_total.toFixed(2)
//     };

//     await record.update(updatePayload);
//     return res.json({ success:true, data:record });
//   } catch(err){
//     console.error('Error updating base_amount:',err);
//     return res.status(500).json({ message:'Server error', error:err.message });
//   }
// };

// // ==============================
// // DELETE
// // ==============================
// exports.remove = async (req,res)=>{
//   try {
//     const companyId = await getCompanyId(req);
//     if (!companyId) return res.status(403).json({ message:"Unable to resolve company" });

//     if (req.user.type?.toLowerCase() === 'employee') {
//       return res.status(403).json({ message:"Not allowed to delete BaseAmount" });
//     }

//     const record = await BaseAmount.findOne({ where:{ id:req.params.id, created_by:companyId }});
//     if (!record) return res.status(404).json({ message:'Record not found' });

//     await record.destroy();
//     return res.json({ success:true, message:'Deleted successfully' });
//   } catch(err){
//     console.error('Error deleting base_amount:',err);
//     return res.status(500).json({ message:'Server error', error:err.message });
//   }
// };






const BaseAmount = require('../models/base_amount.model');
const JobMode = require('../models/job_mode.model');
const Branch = require('../models/branch.model');   // ✅ FIXED: use Branch instead of PlantName
const ContractPeriod = require('../models/contract_period.model');
const Tax = require('../models/tax.model');
const Employee = require('../models/employee.model');

// helper: rounding
function round2(v) {
  return Number(Number(v || 0).toFixed(2));
}

// compute GST
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
    const preciseTax = taxable * (R_total / 100.0);

    cgstAmt = round2(taxable * (cgstR / 100.0));
    sgstAmt = round2(taxable * (sgstR / 100.0));
    igstAmt = round2(taxable * (igstR / 100.0));

    const adjustment = round2(preciseTax - (cgstAmt + sgstAmt + igstAmt));
    if (adjustment !== 0) {
      if (igstAmt !== 0) igstAmt = round2(igstAmt + adjustment);
      else if (sgstAmt !== 0) sgstAmt = round2(sgstAmt + adjustment);
      else cgstAmt = round2(cgstAmt + adjustment);
    }

    totalTax = round2(cgstAmt + sgstAmt + igstAmt);
    grandTotal = round2(taxable + totalTax);
  } else {
    if (R_total === 0) {
      taxable = Number(baseAmount);
      cgstAmt = sgstAmt = igstAmt = totalTax = 0;
      grandTotal = round2(baseAmount);
    } else {
      taxable = Number(baseAmount) / (1 + R_total / 100.0);
      const preciseTax = Number(baseAmount) - taxable;

      cgstAmt = round2(taxable * (cgstR / 100.0));
      sgstAmt = round2(taxable * (sgstR / 100.0));
      igstAmt = round2(taxable * (igstR / 100.0));

      const adjustment = round2(preciseTax - (cgstAmt + sgstAmt + igstAmt));
      if (adjustment !== 0) {
        if (igstAmt !== 0) igstAmt = round2(igstAmt + adjustment);
        else if (sgstAmt !== 0) sgstAmt = round2(sgstAmt + adjustment);
        else cgstAmt = round2(cgstAmt + adjustment);
      }

      totalTax = round2(cgstAmt + sgstAmt + igstAmt);
      grandTotal = round2(Number(baseAmount));
      taxable = round2(taxable);
    }
  }

  return {
    taxable_amount: taxable === null ? null : round2(taxable),
    calculation_type: calcType,
    cgst_amount: round2(cgstAmt),
    sgst_amount: round2(sgstAmt),
    igst_amount: round2(igstAmt),
    total_tax: round2(totalTax),
    grand_total: round2(grandTotal)
  };
}

// ==============================
// Multi-tenant company helper
// ==============================
async function getCompanyId(req) {
  if (!req.user) return null;

  const type = req.user.type?.toLowerCase();

  if (type === "company") return req.user.id;

  if (type === "employee") {
    const emp = await Employee.findOne({
      where: { user_id: req.user.id },
      attributes: ["created_by"],
    });
    if (emp?.created_by) return emp.created_by;
  }

  const emp = await Employee.findOne({
    where: { user_id: req.user.id },
    attributes: ["created_by"],
  });
  if (emp?.created_by) return emp.created_by;

  return req.user.id;
}


// ==============================
// CREATE
// ==============================
exports.create = async (req, res) => {
  try {
    const companyId = await getCompanyId(req);
    if (!companyId) return res.status(403).json({ message: "Unable to resolve company" });

    if (req.user.type?.toLowerCase() === "employee") {
      return res.status(403).json({ message: "Not allowed to create BaseAmount" });
    }

    let { job_mode_id, branch_id, po_wo_id, base_amount } = req.body;
    if (!job_mode_id || !branch_id || !po_wo_id || base_amount === undefined) {
      return res.status(400).json({ message: "All fields are required" });
    }

    base_amount = parseFloat(base_amount);
    if (isNaN(base_amount) || base_amount < 0) {
      return res.status(400).json({ message: "base_amount must be non-negative number" });
    }

    // Validate job_mode and branch
    const jm = await JobMode.findOne({ where: { id: job_mode_id, created_by: companyId } });
    if (!jm) return res.status(400).json({ message: "Invalid job_mode_id for this company" });

    const branch = await Branch.findOne({ where: { id: branch_id, created_by: companyId } });
    if (!branch) return res.status(400).json({ message: "Invalid branch_id for this company" });

    const contract = await ContractPeriod.findOne({ where: { id: po_wo_id, created_by: companyId } });
    if (!contract) return res.status(400).json({ message: "Invalid po_wo_id for this company" });

    // Check contract consistency
    if (String(contract.job_mode_id) !== String(job_mode_id) || String(contract.branch_id) !== String(branch_id)) {
      return res.status(400).json({ message: "Contract PO/WO does not match provided job_mode or branch" });
    }

    // Tax config
    let taxConfig = {};
    if (req.body.cgst_rate !== undefined) taxConfig.cgst_rate = Number(req.body.cgst_rate);
    if (req.body.sgst_rate !== undefined) taxConfig.sgst_rate = Number(req.body.sgst_rate);
    if (req.body.igst_rate !== undefined) taxConfig.igst_rate = Number(req.body.igst_rate);
    if (req.body.calculation_type !== undefined) taxConfig.calculation_type = req.body.calculation_type;

    const computed = calculateGST(base_amount, taxConfig);

    const data = await BaseAmount.create({
      job_mode_id,
      branch_id,   // ✅ FIXED
      po_wo_id,
      base_amount: base_amount.toFixed(2),
      cgst_rate: (taxConfig.cgst_rate || 0).toFixed(2),
      sgst_rate: (taxConfig.sgst_rate || 0).toFixed(2),
      igst_rate: (taxConfig.igst_rate || 0).toFixed(2),
      calculation_type: taxConfig.calculation_type || 'exclusive',
      taxable_amount: computed.taxable_amount !== null ? computed.taxable_amount.toFixed(2) : null,
      cgst_amount: computed.cgst_amount.toFixed(2),
      sgst_amount: computed.sgst_amount.toFixed(2),
      igst_amount: computed.igst_amount.toFixed(2),
      total_tax: computed.total_tax.toFixed(2),
      grand_total: computed.grand_total.toFixed(2),
      created_by: companyId
    });

    return res.status(201).json({ success: true, data, computed, tax_source: 'override' });
  } catch (err) {
    console.error('Error creating base_amount:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};


// ==============================
// GET ALL
// ==============================
exports.getAll = async (req, res) => {
  try {
    const companyId = await getCompanyId(req);
    if (!companyId) return res.status(403).json({ message: "Unable to resolve company" });

    const data = await BaseAmount.findAll({
      where: { created_by: companyId },
      include: [
        { model: JobMode, as: 'job_mode', attributes: ['id', 'name'] },
        { model: Branch, as: 'branch', attributes: ['id', 'name'] },   // ✅ FIXED
        { model: ContractPeriod, as: 'contract_period', attributes: ['id', 'po_wo_number'] }
      ],
      order: [['id', 'DESC']]
    });

    return res.json({ success: true, data });
  } catch (err) {
    console.error('Error fetching base_amounts:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ==============================
// GET BY ID
// ==============================
exports.getById = async (req,res)=>{
  try {
    const companyId = await getCompanyId(req);
    if (!companyId) return res.status(403).json({ message:"Unable to resolve company" });

    const data = await BaseAmount.findOne({
      where: { id:req.params.id, created_by: companyId },
      include:[
        { model: JobMode, as:'job_mode', attributes:['id','name'] },
        { model: Branch, as:'branch', attributes:['id','name'] },   // ✅ FIXED
        { model: ContractPeriod, as:'contract_period', attributes:['id','po_wo_number'] }
      ]
    });

    if (!data) return res.status(404).json({ message:'Record not found' });
    return res.json({ success:true, data });
  } catch(err){
    console.error('Error fetching base_amount by id:',err);
    return res.status(500).json({ message:'Server error', error:err.message });
  }
};

// ==============================
// UPDATE
// ==============================
exports.update = async (req,res)=>{
  try {
    const companyId = await getCompanyId(req);
    if (!companyId) return res.status(403).json({ message:"Unable to resolve company" });

    if (req.user.type?.toLowerCase() === 'employee') {
      return res.status(403).json({ message:"Not allowed to update BaseAmount" });
    }

    const record = await BaseAmount.findOne({ where:{ id:req.params.id, created_by:companyId }});
    if (!record) return res.status(404).json({ message:'Record not found' });

    let { job_mode_id, branch_id, po_wo_id } = req.body;
    let base_amount = req.body.base_amount !== undefined ? parseFloat(req.body.base_amount) : parseFloat(record.base_amount);

    if (job_mode_id || branch_id || po_wo_id) {
      const contract = await ContractPeriod.findOne({ where:{ id: po_wo_id || record.po_wo_id, created_by: companyId } });
      if (!contract) return res.status(400).json({ message:'Invalid po_wo_id for this company' });

      const newJobMode = job_mode_id || record.job_mode_id;
      const newBranch = branch_id || record.branch_id;

      if (String(contract.job_mode_id)!==String(newJobMode) || String(contract.branch_id)!==String(newBranch)) {
        return res.status(400).json({ message:'Contract PO/WO does not match provided job_mode or branch' });
      }
    }

    if (isNaN(base_amount) || base_amount<0) return res.status(400).json({ message:'base_amount must be non-negative number' });

    const newBranchId = branch_id || record.branch_id;
    let taxConfig = null;
    try {
      const branchTax = await Tax.findOne({ where:{ branch_id:newBranchId, created_by:companyId }, order:[['id','DESC']] });
      if (branchTax) taxConfig = {
        cgst_rate:Number(branchTax.cgst_rate||0),
        sgst_rate:Number(branchTax.sgst_rate||0),
        igst_rate:Number(branchTax.igst_rate||0),
        calculation_type:branchTax.calculation_type||'exclusive'
      };
    } catch { taxConfig=null; }

    taxConfig = taxConfig || {};
    if (req.body.cgst_rate!==undefined) taxConfig.cgst_rate = Number(req.body.cgst_rate);
    if (req.body.sgst_rate!==undefined) taxConfig.sgst_rate = Number(req.body.sgst_rate);
    if (req.body.igst_rate!==undefined) taxConfig.igst_rate = Number(req.body.igst_rate);
    if (req.body.calculation_type!==undefined) taxConfig.calculation_type = req.body.calculation_type;

    taxConfig = taxConfig || { cgst_rate:0, sgst_rate:0, igst_rate:0, calculation_type:'exclusive' };
    const computed = calculateGST(base_amount, taxConfig);

    const updatePayload = {
      ...(job_mode_id && { job_mode_id }),
      ...(branch_id && { branch_id }),
      ...(po_wo_id && { po_wo_id }),
      ...(req.body.base_amount !== undefined && { base_amount: base_amount.toFixed(2) }),
      cgst_rate:(taxConfig.cgst_rate||0).toFixed(2),
      sgst_rate:(taxConfig.sgst_rate||0).toFixed(2),
      igst_rate:(taxConfig.igst_rate||0).toFixed(2),
      calculation_type: taxConfig.calculation_type || 'exclusive',
      taxable_amount: computed.taxable_amount !== null ? computed.taxable_amount.toFixed(2) : null,
      cgst_amount: computed.cgst_amount.toFixed(2),
      sgst_amount: computed.sgst_amount.toFixed(2),
      igst_amount: computed.igst_amount.toFixed(2),
      total_tax: computed.total_tax.toFixed(2),
      grand_total: computed.grand_total.toFixed(2)
    };

    await record.update(updatePayload);
    return res.json({ success:true, data:record });
  } catch(err){
    console.error('Error updating base_amount:',err);
    return res.status(500).json({ message:'Server error', error:err.message });
  }
};

// ==============================
// DELETE
// ==============================
exports.remove = async (req,res)=>{
  try {
    const companyId = await getCompanyId(req);
    if (!companyId) return res.status(403).json({ message:"Unable to resolve company" });

    if (req.user.type?.toLowerCase() === 'employee') {
      return res.status(403).json({ message:"Not allowed to delete BaseAmount" });
    }

    const record = await BaseAmount.findOne({ where:{ id:req.params.id, created_by:companyId }});
    if (!record) return res.status(404).json({ message:'Record not found' });

    await record.destroy();
    return res.json({ success:true, message:'Deleted successfully' });
  } catch(err){
    console.error('Error deleting base_amount:',err);
    return res.status(500).json({ message:'Server error', error:err.message });
  }
};



