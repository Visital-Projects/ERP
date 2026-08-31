// routes/profile.js

const express = require('express');
const router = express.Router();
const User = require('../models/user.model'); // ✅ Correct

const auth = require('../middlewares/auth.middleware'); // ✅ CORRECT

const upload = require('../middlewares/upload.middleware');
const path = require('path');



// GET /api/profile
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});


// router.get('/', auth, async (req, res) => {
//   try {
//     const user = await User.findByPk(req.user.id);
//     res.json(user);
//   } catch (err) {
//     res.status(500).json({ message: 'Server error' });
//   }
// });


// POST /api/profile
// router.put('/', auth, async (req, res) => {
//   try {
//     const { name, email } = req.body;

//     const user = await User.findByPk(req.user.id);
//     if (!user) return res.status(404).json({ message: 'User not found' });

//     user.name = name ?? user.name;
//     user.email = email ?? user.email;

//     await user.save();

//     res.json({ message: 'Profile updated', user });
//   } catch (err) {
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// PUT /api/profile
router.put(
  '/',
  auth,
  upload.single('avatar'), // ✅ Multer middleware for avatar upload
  async (req, res) => {
    try {
      const { name, email } = req.body;
      const user = await User.findByPk(req.user.id);
      if (!user) return res.status(404).json({ message: 'User not found' });

      user.name = name ?? user.name;
      user.email = email ?? user.email;

      // ✅ Handle avatar upload
      if (req.file) {
        user.avatar = path.join('uploads', 'avatars', req.file.filename);
      }

      await user.save();
      res.json({ message: 'Profile updated', user });
    } catch (err) {
      console.error('updateProfile error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);





module.exports = router;
