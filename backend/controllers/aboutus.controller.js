const AboutUs = require('../models/aboutus.model');

// =====================
// Helper: format response
// =====================
const formatAboutUsResponse = (record) => {
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
// GET About Us (only one expected)
// =====================
exports.getAboutUs = async (req, res) => {
  try {
    const about = await AboutUs.findOne();
    if (!about) return res.status(404).json({ success: false, message: 'About Us page not found' });

    res.json({ success: true, data: formatAboutUsResponse(about) });
  } catch (error) {
    console.error('Get About Us Error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// =====================
// CREATE About Us (only once, super admin only)
// =====================
exports.createAboutUs = async (req, res) => {
  try {
    if (req.user.type !== 'company') {
      return res.status(403).json({ success: false, message: 'Only super admin can create About Us' });
    }

    const existing = await AboutUs.findOne();
    if (existing) {
      return res.status(400).json({ success: false, message: 'About Us already exists. Use update instead.' });
    }

    const { page_name, page_type, page_content, page_url, show_in_header, show_in_footer, require_login } = req.body;

    const about = await AboutUs.create({
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

    res.status(201).json({ success: true, message: 'About Us created', data: formatAboutUsResponse(about) });
  } catch (error) {
    console.error('Create About Us Error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// =====================
// UPDATE About Us (super admin only)
// =====================
exports.updateAboutUs = async (req, res) => {
  try {
    if (req.user.type !== 'company') {
      return res.status(403).json({ success: false, message: 'Only super admin can update About Us' });
    }

    const about = await AboutUs.findOne();
    if (!about) return res.status(404).json({ success: false, message: 'About Us not found' });

    const { page_name, page_type, page_content, page_url, show_in_header, show_in_footer, require_login } = req.body;

    await about.update({
      page_name,
      page_type,
      page_content,
      page_url,
      show_in_header,
      show_in_footer,
      require_login,
      updated_at: new Date()
    });

    res.json({ success: true, message: 'About Us updated', data: formatAboutUsResponse(about) });
  } catch (error) {
    console.error('Update About Us Error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// =====================
// DELETE About Us (NOT ALLOWED)
// =====================
exports.deleteAboutUs = async (req, res) => {
  return res.status(405).json({ success: false, message: 'Delete operation is not allowed for About Us' });
};
