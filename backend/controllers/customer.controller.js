// controllers/customerController.js
const Customer = require("../models/customer.model");

// Function to generate new customer_id
async function generateCustomerId() {
  const lastCustomer = await Customer.findOne({
    order: [["id", "DESC"]],
  });

  let newNumber = 1;
  if (lastCustomer && lastCustomer.customer_id) {
    const lastNumber = parseInt(lastCustomer.customer_id.replace("#CUST", ""));
    newNumber = lastNumber + 1;
  }

  // Format: #CUST00001
  return "#CUST" + newNumber.toString().padStart(5, "0");
}

exports.createCustomer = async (req, res) => {
  try {
    const newCustomerId = await generateCustomerId();

    // Assume created_by comes from req.user.id (after authentication middleware)
    const createdBy = req.user?.id || req.body.created_by; // fallback to body if req.user is undefined

    if (!createdBy) {
      return res.status(400).json({ success: false, message: "created_by is required" });
    }

    const customer = await Customer.create({
      ...req.body,
      customer_id: newCustomerId,
      created_by: createdBy,  // Ensure created_by is set
    });

    res.status(201).json({ success: true, data: customer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// ✅ Get all customers
exports.getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.findAll();
    res.json({ success: true, data: customers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get single customer
exports.getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.params.id);
    if (!customer) return res.status(404).json({ success: false, message: "Customer not found" });
    res.json({ success: true, data: customer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Update customer
exports.updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.params.id);
    if (!customer) return res.status(404).json({ success: false, message: "Customer not found" });

    await customer.update(req.body);
    res.json({ success: true, data: customer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Delete customer
exports.deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.params.id);
    if (!customer) return res.status(404).json({ success: false, message: "Customer not found" });

    await customer.destroy();
    res.json({ success: true, message: "Customer deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
