// const express = require('express');
// const router = express.Router();
// const controller = require('../controllers/loanOption.controller');
// const auth = require('../middlewares/auth.middleware');

// router.get('/', auth, controller.getAll);
// router.get('/:id', auth, controller.getById);
// router.post('/', auth, controller.create);
// router.put('/:id', auth, controller.update);
// router.delete('/:id', auth, controller.delete);

// module.exports = router;


const express = require("express");
const router = express.Router();
const controller = require("../controllers/loanOption.controller");
const auth = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/authorize");

// Role/Permission mapping
// manage loan option → access list
// create loan option → create
// edit loan option → update
// delete loan option → delete

router.get( "/", auth, authorize("manage loan option"), controller.getAll );

router.get( "/:id", auth, authorize("manage loan option"), controller.getById );

router.post(  "/",  auth,  authorize("create loan option"),  controller.create );

router.put( "/:id",  auth,  authorize("edit loan option"),  controller.update );

router.delete( "/:id",  auth,  authorize("delete loan option"),  controller.delete );

module.exports = router;
