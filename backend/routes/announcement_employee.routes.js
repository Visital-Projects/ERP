// const express = require('express');
// const router = express.Router();
// const auth = require('../middlewares/auth.middleware');
// const controller = require('../controllers/announcement_employee.controller');

// router.post('/assign',auth, controller.assignEmployeesToAnnouncement);
// router.get('/:announcement_id/employees',auth, controller.getEmployeesByAnnouncement);
// router.delete('/remove',auth, controller.removeEmployeeFromAnnouncement);

// module.exports = router;




// const express = require('express');
// const router = express.Router();
// const auth = require('../middlewares/auth.middleware');
// const authorize = require('../middlewares/authorize'); // ✅ import
// const controller = require('../controllers/announcement_employee.controller');

// // 🔹 Assign employees to an announcement
// router.post( '/assign', auth, authorize('assign announcement employees'),   // ✅ permission check
//   controller.assignEmployeesToAnnouncement
// );

// // 🔹 Get employees assigned to an announcement
// router.get( '/:announcement_id/employees', auth, authorize('view announcement employees'),     // ✅ permission check
//   controller.getEmployeesByAnnouncement
// );

// // 🔹 Remove employee from announcement
// router.delete( '/remove', auth, authorize('remove announcement employees'),   // ✅ permission check
//   controller.removeEmployeeFromAnnouncement
// );

// module.exports = router;
