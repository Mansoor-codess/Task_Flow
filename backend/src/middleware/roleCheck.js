const prisma = require("../utils/prisma");
const { AppError, asyncHandler } = require("../utils/errors");

const requireGlobalAdmin = (req, _res, next) => {
  if (req.user.role !== "ADMIN") {
    throw new AppError("Admin access is required", 403);
  }
  next();
};

const requireProjectAccess = asyncHandler(async (req, _res, next) => {
  const projectId = req.params.id || req.params.projectId;
  if (!projectId) {
    throw new AppError("Project id is required", 400);
  }

  const member = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId: req.user.id } }
  });

  if (!member && req.user.role !== "ADMIN") {
    throw new AppError("You do not have access to this project", 403);
  }

  req.projectMember = member;
  next();
});

const requireProjectAdmin = asyncHandler(async (req, _res, next) => {
  const projectId = req.params.id || req.params.projectId;
  if (!projectId) {
    throw new AppError("Project id is required", 400);
  }

  if (req.user.role === "ADMIN") {
    return next();
  }

  const member = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId: req.user.id } }
  });

  if (!member || member.role !== "ADMIN") {
    throw new AppError("Project admin access is required", 403);
  }

  req.projectMember = member;
  next();
});

module.exports = { requireGlobalAdmin, requireProjectAccess, requireProjectAdmin };
