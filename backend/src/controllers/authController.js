const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../utils/prisma");
const { AppError, asyncHandler } = require("../utils/errors");
const { validate, signupSchema, loginSchema } = require("../utils/validators");

const tokenFor = (user) =>
  jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "7d"
  });

const publicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt
});

const signup = asyncHandler(async (req, res) => {
  const data = validate(signupSchema, req.body);
  const existing = await prisma.user.findUnique({ where: { email: data.email } });

  if (existing) {
    throw new AppError("Email is already registered", 409);
  }

  const password = await bcrypt.hash(data.password, 12);
  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password,
      role: data.role || "MEMBER"
    }
  });

  res.status(201).json({ token: tokenFor(user), user: publicUser(user) });
});

const login = asyncHandler(async (req, res) => {
  const data = validate(loginSchema, req.body);
  const user = await prisma.user.findUnique({ where: { email: data.email } });

  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  const matches = await bcrypt.compare(data.password, user.password);
  if (!matches) {
    throw new AppError("Invalid email or password", 401);
  }

  res.json({ token: tokenFor(user), user: publicUser(user) });
});

module.exports = { signup, login };
