const prisma = require("./prisma");

const markOverdueTasks = async (projectId = null) => {
  const now = new Date();
  const where = {
    dueDate: { lt: now },
    status: { not: "DONE" }
  };

  if (projectId) {
    where.projectId = projectId;
  }

  await prisma.task.updateMany({
    where,
    data: { status: "OVERDUE" }
  });
};

const isProjectMember = async (projectId, userId) => {
  const member = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId } }
  });
  return Boolean(member);
};

module.exports = { markOverdueTasks, isProjectMember };
