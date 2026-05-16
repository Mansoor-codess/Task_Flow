const { z } = require("zod");

const roleEnum = z.enum(["ADMIN", "MEMBER"]);
const statusEnum = z.enum(["TODO", "IN_PROGRESS", "DONE", "OVERDUE"]);
const priorityEnum = z.enum(["LOW", "MEDIUM", "HIGH"]);

const nonEmptyString = (field) =>
  z.string({ required_error: `${field} is required` }).trim().min(1, `${field} is required`);

const futureDate = z
  .string()
  .datetime("Due date must be a valid ISO date")
  .refine((value) => new Date(value).getTime() >= Date.now(), "Due date cannot be in the past");

const signupSchema = z.object({
  name: nonEmptyString("Name").max(80, "Name is too long"),
  email: z.string().trim().email("A valid email is required").toLowerCase(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: roleEnum.optional()
});

const loginSchema = z.object({
  email: z.string().trim().email("A valid email is required").toLowerCase(),
  password: z.string().min(1, "Password is required")
});

const projectSchema = z.object({
  name: nonEmptyString("Project name").max(120, "Project name is too long"),
  description: z.string().trim().max(1000, "Description is too long").optional().nullable()
});

const memberSchema = z.object({
  email: z.string().trim().email("A valid member email is required").toLowerCase(),
  role: roleEnum.default("MEMBER")
});

const taskCreateSchema = z.object({
  title: nonEmptyString("Task title").max(160, "Task title is too long"),
  description: z.string().trim().max(2000, "Description is too long").optional().nullable(),
  status: statusEnum.optional(),
  priority: priorityEnum.default("MEDIUM"),
  assigneeId: z.string().trim().optional().nullable(),
  dueDate: futureDate.optional().nullable()
});

const taskUpdateSchema = z.object({
  title: z.string().trim().min(1, "Task title cannot be empty").max(160, "Task title is too long").optional(),
  description: z.string().trim().max(2000, "Description is too long").optional().nullable(),
  status: statusEnum.optional(),
  priority: priorityEnum.optional(),
  assigneeId: z.string().trim().optional().nullable(),
  dueDate: z
    .string()
    .datetime("Due date must be a valid ISO date")
    .optional()
    .nullable()
});

const assignSchema = z.object({
  assigneeId: nonEmptyString("Assignee")
});

const validate = (schema, data) => {
  const result = schema.safeParse(data);
  if (!result.success) {
    const details = result.error.flatten().fieldErrors;
    const error = new Error("Validation failed");
    error.statusCode = 400;
    error.details = details;
    throw error;
  }
  return result.data;
};

module.exports = {
  validate,
  signupSchema,
  loginSchema,
  projectSchema,
  memberSchema,
  taskCreateSchema,
  taskUpdateSchema,
  assignSchema
};
