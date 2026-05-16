require("dotenv").config();

const express = require("express");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const authRoutes = require("./routes/authRoutes");
const projectRoutes = require("./routes/projectRoutes");
const taskRoutes = require("./routes/taskRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const errorHandler = require("./middleware/errorHandler");
const prisma = require("./utils/prisma");

const app = express();
const port = process.env.PORT || 5000;

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET must be set");
}

app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",") : "http://localhost:5173",
    credentials: true
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false
  })
);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/dashboard", dashboardRoutes);

const staticDir = path.join(__dirname, "..", "public");
app.use(express.static(staticDir));

app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api")) {
    return next();
  }

  res.sendFile(path.join(staticDir, "index.html"));
});

app.use((_req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use(errorHandler);

const server = app.listen(port, () => {
  console.log(`API running on port ${port}`);
});

const shutdown = async () => {
  await prisma.$disconnect();
  server.close(() => process.exit(0));
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
