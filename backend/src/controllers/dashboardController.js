const prisma = require("../utils/prisma");
const { asyncHandler } = require("../utils/errors");
const { markOverdueTasks } = require("../utils/tasks");

const dashboard = asyncHandler(async (req, res) => {
  await markOverdueTasks();

  const projectFilter =
    req.user.role === "ADMIN"
      ? {}
      : {
          project: {
            members: { some: { userId: req.user.id } }
          }
        };

  const [totalTasks, grouped, overdueTasks, recentActivity] = await Promise.all([
    prisma.task.count({ where: projectFilter }),
    prisma.task.groupBy({
      by: ["status"],
      where: projectFilter,
      _count: { status: true }
    }),
    prisma.task.findMany({
      where: { ...projectFilter, status: "OVERDUE" },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true } }
      },
      orderBy: { dueDate: "asc" },
      take: 10
    }),
    prisma.task.findMany({
      where: projectFilter,
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true } }
      },
      orderBy: { updatedAt: "desc" },
      take: 8
    })
  ]);

  const tasksByStatus = {
    TODO: 0,
    IN_PROGRESS: 0,
    DONE: 0,
    OVERDUE: 0
  };

  for (const item of grouped) {
    tasksByStatus[item.status] = item._count.status;
  }

  res.json({ totalTasks, tasksByStatus, overdueTasks, recentActivity });
});

module.exports = { dashboard };
