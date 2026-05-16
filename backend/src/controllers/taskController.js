const prisma = require("../utils/prisma");
const { AppError, asyncHandler } = require("../utils/errors");
const { validate, taskCreateSchema, taskUpdateSchema, assignSchema } = require("../utils/validators");
const { markOverdueTasks, isProjectMember } = require("../utils/tasks");

const taskInclude = {
  assignee: { select: { id: true, name: true, email: true } },
  creator: { select: { id: true, name: true, email: true } },
  project: { select: { id: true, name: true } }
};

const ensureTaskAccess = async (taskId, user) => {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      project: {
        include: {
          members: { where: { userId: user.id } }
        }
      }
    }
  });

  if (!task) {
    throw new AppError("Task not found", 404);
  }

  if (user.role !== "ADMIN" && task.project.members.length === 0) {
    throw new AppError("You do not have access to this task", 403);
  }

  return task;
};

const ensureTaskAdmin = async (taskId, user) => {
  const task = await ensureTaskAccess(taskId, user);
  if (user.role === "ADMIN") {
    return task;
  }

  const member = task.project.members[0];
  if (!member || member.role !== "ADMIN") {
    throw new AppError("Project admin access is required", 403);
  }

  return task;
};

const listTasks = asyncHandler(async (req, res) => {
  await markOverdueTasks(req.params.id);
  const tasks = await prisma.task.findMany({
    where: { projectId: req.params.id },
    include: taskInclude,
    orderBy: [{ status: "asc" }, { createdAt: "desc" }]
  });

  res.json(tasks);
});

const createTask = asyncHandler(async (req, res) => {
  const data = validate(taskCreateSchema, req.body);

  if (data.assigneeId && !(await isProjectMember(req.params.id, data.assigneeId))) {
    throw new AppError("Assignee must be a member of this project", 400);
  }

  const task = await prisma.task.create({
    data: {
      title: data.title,
      description: data.description || null,
      status: data.status || "TODO",
      priority: data.priority,
      projectId: req.params.id,
      assigneeId: data.assigneeId || null,
      createdBy: req.user.id,
      dueDate: data.dueDate ? new Date(data.dueDate) : null
    },
    include: taskInclude
  });

  res.status(201).json(task);
});

const updateTask = asyncHandler(async (req, res) => {
  const existing = await ensureTaskAccess(req.params.id, req.user);
  const data = validate(taskUpdateSchema, req.body);
  const isAdmin = req.user.role === "ADMIN" || existing.project.members[0]?.role === "ADMIN";

  if (!isAdmin) {
    const disallowed = Object.keys(data).filter((key) => key !== "status");
    if (disallowed.length > 0) {
      throw new AppError("Members can update task status only", 403);
    }
  }

  if (data.assigneeId && !(await isProjectMember(existing.projectId, data.assigneeId))) {
    throw new AppError("Assignee must be a member of this project", 400);
  }

  const updateData = {};
  for (const key of ["title", "description", "status", "priority", "assigneeId"]) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      updateData[key] = data[key] || null;
    }
  }

  if (Object.prototype.hasOwnProperty.call(data, "dueDate")) {
    updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
  }

  const task = await prisma.task.update({
    where: { id: req.params.id },
    data: updateData,
    include: taskInclude
  });

  res.json(task);
});

const deleteTask = asyncHandler(async (req, res) => {
  await ensureTaskAdmin(req.params.id, req.user);
  await prisma.task.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

const assignTask = asyncHandler(async (req, res) => {
  const existing = await ensureTaskAdmin(req.params.id, req.user);
  const data = validate(assignSchema, req.body);

  if (!(await isProjectMember(existing.projectId, data.assigneeId))) {
    throw new AppError("Assignee must be a member of this project", 400);
  }

  const task = await prisma.task.update({
    where: { id: req.params.id },
    data: { assigneeId: data.assigneeId },
    include: taskInclude
  });

  res.json(task);
});

module.exports = { listTasks, createTask, updateTask, deleteTask, assignTask };
