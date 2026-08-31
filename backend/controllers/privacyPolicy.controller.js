const PrivacyPolicy = require('../models/privacyPolicy.model');

// =====================
// Helper: format response
// =====================
const formatPrivacyPolicyResponse = (record) => {
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
// GET Privacy Policy (only one expected)
// =====================
exports.getPrivacyPolicy = async (req, res) => {
  try {
    const policy = await PrivacyPolicy.findOne();
    if (!policy) return res.status(404).json({ success: false, message: 'Privacy Policy not found' });

    res.json({ success: true, data: formatPrivacyPolicyResponse(policy) });
  } catch (error) {
    console.error('Get Privacy Policy Error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// =====================
// CREATE Privacy Policy (only once, super admin only)
// =====================
exports.createPrivacyPolicy = async (req, res) => {
  try {
    if (req.user.type !== 'company') {
      return res.status(403).json({ success: false, message: 'Only super admin can create Privacy Policy' });
    }

    const existing = await PrivacyPolicy.findOne();
    if (existing) {
      return res.status(400).json({ success: false, message: 'Privacy Policy already exists. Use update instead.' });
    }

    const { page_name, page_type, page_content, page_url, show_in_header, show_in_footer, require_login } = req.body;

    const policy = await PrivacyPolicy.create({
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

    res.status(201).json({ success: true, message: 'Privacy Policy created', data: formatPrivacyPolicyResponse(policy) });
  } catch (error) {
    console.error('Create Privacy Policy Error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// =====================
// UPDATE Privacy Policy (super admin only)
// =====================
exports.updatePrivacyPolicy = async (req, res) => {
  try {
    if (req.user.type !== 'company') {
      return res.status(403).json({ success: false, message: 'Only super admin can update Privacy Policy' });
    }

    const policy = await PrivacyPolicy.findOne();
    if (!policy) return res.status(404).json({ success: false, message: 'Privacy Policy not found' });

    const { page_name, page_type, page_content, page_url, show_in_header, show_in_footer, require_login } = req.body;

    await policy.update({
      page_name,
      page_type,
      page_content,
      page_url,
      show_in_header,
      show_in_footer,
      require_login,
      updated_at: new Date()
    });

    res.json({ success: true, message: 'Privacy Policy updated', data: formatPrivacyPolicyResponse(policy) });
  } catch (error) {
    console.error('Update Privacy Policy Error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// =====================
// DELETE Privacy Policy (NOT ALLOWED)
// =====================
exports.deletePrivacyPolicy = async (req, res) => {
  return res.status(405).json({ success: false, message: 'Delete operation is not allowed for Privacy Policy' });
};
