const express = require("express");
const auth = require("../middleware/auth");
const { updateTask, deleteTask, assignTask } = require("../controllers/taskController");

const router = express.Router();

router.use(auth);

router.put("/:id", updateTask);
router.delete("/:id", deleteTask);
router.patch("/:id/assign", assignTask);

module.exports = router;
