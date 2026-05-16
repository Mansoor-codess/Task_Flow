const express = require("express");
const auth = require("../middleware/auth");
const { requireGlobalAdmin, requireProjectAccess, requireProjectAdmin } = require("../middleware/roleCheck");
const {
  listProjects,
  createProject,
  getProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember
} = require("../controllers/projectController");
const { listTasks, createTask } = require("../controllers/taskController");

const router = express.Router();

router.use(auth);

router.get("/", listProjects);
router.post("/", requireGlobalAdmin, createProject);
router.get("/:id", requireProjectAccess, getProject);
router.put("/:id", requireProjectAdmin, updateProject);
router.delete("/:id", requireProjectAdmin, deleteProject);
router.post("/:id/members", requireProjectAdmin, addMember);
router.delete("/:id/members/:userId", requireProjectAdmin, removeMember);
router.get("/:id/tasks", requireProjectAccess, listTasks);
router.post("/:id/tasks", requireProjectAdmin, createTask);

module.exports = router;
