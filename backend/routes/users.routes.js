
const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth.middleware');
const UserController = require('../controllers/user.controller');
const upload = require('../middlewares/upload.middleware'); // ✅ multer

// Create user
router.post('/', auth, UserController.createUser); // 👈 Add this in controller too

router.get('/', auth, UserController.getAllUsers);
router.get('/checkuserexists', auth, UserController.checkUserExists);
router.get('/search', auth, UserController.searchUsers);
router.get('/change-mode', auth, UserController.changeUserMode);
router.get('/view', auth, UserController.filterUserView); // 👈 Already exists in controller
router.get('/:id', auth, UserController.getUserById);
router.put('/:id', auth,upload.single('avatar'), UserController.updateUser);
// router.put('/:id', auth, upload.single('avatar'), UserController.updateUser);
router.put('/change-password/:id', auth, UserController.changePassword);
router.delete('/:id', auth, UserController.deleteUser);
router.get('/:id/info/:type', auth, UserController.getUserInfoByType);
// router.patch('/:id/toggle-login', auth, UserController.toggleLoginStatus); // 👈 Add to controller
// router.post('/clients', auth, UserController.createClient);
//----------------------------------------------------------------------------------------------------
// 🔹 New route: Add user (company creates system user without employee record)
router.post('/add', auth, UserController.addUser); // ✅ Newly added
//----------------------------------------------------------------------------------------------------

module.exports = router;
