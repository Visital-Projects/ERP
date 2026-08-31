const HomeScreen = require('../models/homescreen.model');
const path = require('path');

// =====================
// Helper: format response
// =====================
const formatHomeScreenResponse = (record) => {
  if (!record) return null;
  const json = record.toJSON();
  return {
    id: json.id,
    logo: json.logo,
    homescreen_left_image: json.homescreen_left_image,
    homescreen_right_image: json.homescreen_right_image,
    created_at: json.created_at,
    updated_at: json.updated_at
  };
};

// =====================
// GET Home Screen (only one expected)
// =====================
exports.getHomeScreen = async (req, res) => {
  try {
    const home = await HomeScreen.findOne();
    if (!home) return res.status(404).json({ success: false, message: 'Home Screen not found' });

    res.json({ success: true, data: formatHomeScreenResponse(home) });
  } catch (error) {
    console.error('Get Home Screen Error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// =====================
// CREATE Home Screen (only once, super admin only)
// =====================
exports.createHomeScreen = async (req, res) => {
  try {
    if (req.user.type !== 'company') {
      return res.status(403).json({ success: false, message: 'Only super admin can create Home Screen' });
    }

    const existing = await HomeScreen.findOne();
    if (existing) {
      return res.status(400).json({ success: false, message: 'Home Screen already exists. Use update instead.' });
    }

    const logo = req.files?.logo ? path.join('uploads/homeimages', req.files.logo[0].filename) : null;
    const homescreen_left_image = req.files?.homescreen_left_image ? path.join('uploads/homeimages', req.files.homescreen_left_image[0].filename) : null;
    const homescreen_right_image = req.files?.homescreen_right_image ? path.join('uploads/homeimages', req.files.homescreen_right_image[0].filename) : null;

    const home = await HomeScreen.create({
      logo,
      homescreen_left_image,
      homescreen_right_image,
      created_at: new Date(),
      updated_at: new Date()
    });

    res.status(201).json({ success: true, message: 'Home Screen created', data: formatHomeScreenResponse(home) });
  } catch (error) {
    console.error('Create Home Screen Error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// =====================
// UPDATE Home Screen (super admin only)
// =====================
exports.updateHomeScreen = async (req, res) => {
  try {
    if (req.user.type !== 'company') {
      return res.status(403).json({ success: false, message: 'Only super admin can update Home Screen' });
    }

    const home = await HomeScreen.findOne();
    if (!home) return res.status(404).json({ success: false, message: 'Home Screen not found' });

    const logo = req.files?.logo ? path.join('uploads/homeimages', req.files.logo[0].filename) : home.logo;
    const homescreen_left_image = req.files?.homescreen_left_image ? path.join('uploads/homeimages', req.files.homescreen_left_image[0].filename) : home.homescreen_left_image;
    const homescreen_right_image = req.files?.homescreen_right_image ? path.join('uploads/homeimages', req.files.homescreen_right_image[0].filename) : home.homescreen_right_image;

    await home.update({
      logo,
      homescreen_left_image,
      homescreen_right_image,
      updated_at: new Date()
    });

    res.json({ success: true, message: 'Home Screen updated', data: formatHomeScreenResponse(home) });
  } catch (error) {
    console.error('Update Home Screen Error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// =====================
// DELETE Home Screen (NOT ALLOWED)
// =====================
exports.deleteHomeScreen = async (req, res) => {
  return res.status(405).json({ success: false, message: 'Delete operation is not allowed for Home Screen' });
};
