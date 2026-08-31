const Terms = require('../models/terms.model');

// =====================
// Helper: format response
// =====================
const formatTermsResponse = (record) => {
  if (!record) return null;
  const json = record.toJSON();
  return {
    id: json.id,
    page_name: json.page_name,
    page_type: json.page_type,
    page_content: json.page_content,
    page_url: json.page_url,
    show_in_header: json.show_in_header,
    show_in_footer: json.show_in_footer,
    require_login: json.require_login,
    created_at: json.created_at,
    updated_at: json.updated_at
  };
};

// =====================
// GET Terms & Conditions (only one expected)
// =====================
exports.getTerms = async (req, res) => {
  try {
    const terms = await Terms.findOne();
    if (!terms) return res.status(404).json({ success: false, message: 'Terms & Conditions not found' });

    res.json({ success: true, data: formatTermsResponse(terms) });
  } catch (error) {
    console.error('Get Terms Error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// =====================
// CREATE Terms & Conditions (only once, super admin only)
// =====================
exports.createTerms = async (req, res) => {
  try {
    if (req.user.type !== 'company') {
      return res.status(403).json({ success: false, message: 'Only super admin can create Terms & Conditions' });
    }

    const existing = await Terms.findOne();
    if (existing) {
      return res.status(400).json({ success: false, message: 'Terms & Conditions already exist. Use update instead.' });
    }

    const { page_name, page_type, page_content, page_url, show_in_header, show_in_footer, require_login } = req.body;

    const terms = await Terms.create({
      page_name,
      page_type,
      page_content,
      page_url,
      show_in_header,
      show_in_footer,
      require_login,
      created_at: new Date(),
      updated_at: new Date()
    });

    res.status(201).json({ success: true, message: 'Terms & Conditions created', data: formatTermsResponse(terms) });
  } catch (error) {
    console.error('Create Terms Error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// =====================
// UPDATE Terms & Conditions (super admin only)
// =====================
exports.updateTerms = async (req, res) => {
  try {
    if (req.user.type !== 'company') {
      return res.status(403).json({ success: false, message: 'Only super admin can update Terms & Conditions' });
    }

    const terms = await Terms.findOne();
    if (!terms) return res.status(404).json({ success: false, message: 'Terms & Conditions not found' });

    const { page_name, page_type, page_content, page_url, show_in_header, show_in_footer, require_login } = req.body;

    await terms.update({
      page_name,
      page_type,
      page_content,
      page_url,
      show_in_header,
      show_in_footer,
      require_login,
      updated_at: new Date()
    });

    res.json({ success: true, message: 'Terms & Conditions updated', data: formatTermsResponse(terms) });
  } catch (error) {
    console.error('Update Terms Error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// =====================
// DELETE Terms & Conditions (NOT ALLOWED)
// =====================
exports.deleteTerms = async (req, res) => {
  return res.status(405).json({ success: false, message: 'Delete operation is not allowed for Terms & Conditions' });
};
