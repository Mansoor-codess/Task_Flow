const prisma = require("../utils/prisma");
const { AppError, asyncHandler } = require("../utils/errors");
const { validate, projectSchema, memberSchema } = require("../utils/validators");
const { markOverdueTasks } = require("../utils/tasks");

const projectInclude = {
  owner: { select: { id: true, name: true, email: true, role: true } },
  members: {
    include: { user: { select: { id: true, name: true, email: true, role: true } } },
    orderBy: { id: "asc" }
  },
  _count: { select: { tasks: true } }
};

const listProjects = asyncHandler(async (req, res) => {
  const where =
    req.user.role === "ADMIN"
      ? {}
      : {
          members: {
            some: { userId: req.user.id }
          }
        };

  const projects = await prisma.project.findMany({
    where,
    include: projectInclude,
    orderBy: { createdAt: "desc" }
  });

  res.json(projects);
});

const createProject = asyncHandler(async (req, res) => {
  const data = validate(projectSchema, req.body);
  const project = await prisma.project.create({
    data: {
      name: data.name,
      description: data.description || null,
      ownerId: req.user.id,
      members: {
        create: {
          userId: req.user.id,
          role: "ADMIN"
        }
      }
    },
    include: projectInclude
  });

  res.status(201).json(project);
});

const getProject = asyncHandler(async (req, res) => {
  await markOverdueTasks(req.params.id);
  const project = await prisma.project.findUnique({
    where: { id: req.params.id },
    include: {
      ...projectInclude,
      tasks: {
        include: {
          assignee: { select: { id: true, name: true, email: true } },
          creator: { select: { id: true, name: true, email: true } }
        },
        orderBy: { createdAt: "desc" }
      }
    }
  });

  if (!project) {
    throw new AppError("Project not found", 404);
  }

  res.json(project);
});

const updateProject = asyncHandler(async (req, res) => {
  const data = validate(projectSchema, req.body);
  const project = await prisma.project.update({
    where: { id: req.params.id },
    data: {
      name: data.name,
      description: data.description || null
    },
    include: projectInclude
  });

  res.json(project);
});

const deleteProject = asyncHandler(async (req, res) => {
  await prisma.project.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

const addMember = asyncHandler(async (req, res) => {
  const data = validate(memberSchema, req.body);
  const user = await prisma.user.findUnique({ where: { email: data.email } });

  if (!user) {
    throw new AppError("No user exists with that email", 404);
  }

  const member = await prisma.projectMember.upsert({
    where: { projectId_userId: { projectId: req.params.id, userId: user.id } },
    update: { role: data.role },
    create: {
      projectId: req.params.id,
      userId: user.id,
      role: data.role
    },
    include: { user: { select: { id: true, name: true, email: true, role: true } } }
  });

  res.status(201).json(member);
});

const removeMember = asyncHandler(async (req, res) => {
  const project = await prisma.project.findUnique({ where: { id: req.params.id } });
  if (!project) {
    throw new AppError("Project not found", 404);
  }

  if (project.ownerId === req.params.userId) {
    throw new AppError("Project owner cannot be removed", 400);
  }

  await prisma.projectMember.delete({
    where: { projectId_userId: { projectId: req.params.id, userId: req.params.userId } }
  });

  await prisma.task.updateMany({
    where: { projectId: req.params.id, assigneeId: req.params.userId },
    data: { assigneeId: null }
  });

  res.status(204).send();
});

module.exports = {
  listProjects,
  createProject,
  getProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember
};
