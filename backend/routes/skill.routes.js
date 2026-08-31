const express = require("express");
const router = express.Router();
const skillController = require("../controllers/skill.controller");
const auth = require("../middlewares/auth.middleware");

router.post("/", auth, skillController.createSkill);
router.get("/", auth, skillController.getAllSkills);
router.get("/:id", auth, skillController.getSkillById);
router.patch("/:id", auth, skillController.updateSkill);
router.delete("/:id", auth, skillController.deleteSkill);

module.exports = router;
