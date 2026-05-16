const jwt = require("jsonwebtoken");
const prisma = require("../utils/prisma");
const { AppError, asyncHandler } = require("../utils/errors");

const auth = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization;
  const token = header && header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    throw new AppError("Authentication token is required", 401);
  }

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch (_error) {
    throw new AppError("Invalid or expired token", 401);
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.id },
    select: { id: true, name: true, email: true, role: true, createdAt: true }
  });

  if (!user) {
    throw new AppError("User no longer exists", 401);
  }

  req.user = user;
  next();
});

module.exports = auth;
