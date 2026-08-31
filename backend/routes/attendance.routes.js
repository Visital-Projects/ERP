



// const express = require("express");
// const router = express.Router();
// const attendanceController = require("../controllers/attendance.controller");
// const auth = require('../middlewares/auth.middleware');
// // POST mark attendance
// // router.post("/attendance/verify",auth, attendanceController.markAttendance);
// router.get("/date",auth, attendanceController.getAllAttendancesdate);
// router.post("/attendance/verify/:empid",auth, attendanceController.verifyAttendanceByEmpId);
// router.post("/attendance/manual",auth, attendanceController.addManualAttendance);
// // ✅ CRUD operations
// router.get("/",auth, attendanceController.getAllAttendances);
// router.get("/:id",auth, attendanceController.getAttendanceById);
// router.put("/:id",auth, attendanceController.updateAttendance);
// router.delete("/:id", auth,attendanceController.deleteAttendance);
// router.patch("/overtime/:empid", auth, attendanceController.updateOvertime);


// // router.patch("/attendance/overtime/:employee_id", attendanceController.updateOvertime);
// module.exports = router;

const express = require("express");
const router = express.Router();
const attendanceController = require("../controllers/attendance.controller");
const auth = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/authorize');

// Get attendance by date → requires 'manage attendance'
router.get(
  "/date",
  auth,
  authorize("manage attendance"),
  attendanceController.getAllAttendancesdate
);

// Clock-in → requires 'create attendance'
router.post(
  "/attendance/verify/:empid",
  auth,
  authorize("create attendance"),
  attendanceController.verifyAttendanceByEmpId
);



// Get all attendance → requires 'manage attendance' (view all)
router.get(
  "/",
  auth,
  authorize("manage attendance"),
  attendanceController.getAllAttendances
);

router.get(
  "/:id",
  auth,
  authorize("manage attendance"),
  attendanceController.getAttendanceById
);

router.get(
  "/month-end",
  auth,
  authorize("manage attendance"),
  attendanceController.getMonthEndAttendance
);



router.patch(
  "/early-leaving/:empid",
  auth,
  authorize("edit attendance"),
  attendanceController.updateEarlyLeaving
);
router.get("/attendance-summary/:empid",  auth,
  authorize("manage attendance"),attendanceController.getEmployeeMonthlyAttendance);
router.patch(
  "/status/:empid",
  auth,
  authorize("edit attendance"),
  attendanceController.patchAttendanceStatus
);

// Delete attendance → requires 'delete attendance'
router.delete(
  "/:id",
  auth,
  authorize("delete attendance"),
  attendanceController.deleteAttendance
);

// Update overtime → requires 'edit attendance'
router.patch(
  "/overtime/:empid",
  auth,
  authorize("edit attendance"),
  attendanceController.updateOvertime
);




module.exports = router;