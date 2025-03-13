var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express3 from "express";

// server/routes.ts
import express from "express";
import { createServer } from "http";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  TaskPriority: () => TaskPriority,
  TaskStatus: () => TaskStatus,
  insertNoteSchema: () => insertNoteSchema,
  insertPomodoroSessionSchema: () => insertPomodoroSessionSchema,
  insertSettingsSchema: () => insertSettingsSchema,
  insertStudySessionSchema: () => insertStudySessionSchema,
  insertTaskSchema: () => insertTaskSchema,
  insertUserSchema: () => insertUserSchema,
  notes: () => notes,
  pomodoroSessions: () => pomodoroSessions,
  settings: () => settings,
  studySessions: () => studySessions,
  tasks: () => tasks,
  users: () => users
});
import {
  pgTable,
  text,
  serial,
  integer,
  boolean,
  timestamp,
  jsonb
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name"),
  email: text("email"),
  createdAt: timestamp("created_at").defaultNow()
});
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  displayName: true,
  email: true
});
var tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  dueDate: timestamp("due_date"),
  priority: text("priority").notNull().default("medium"),
  status: text("status").notNull().default("pending"),
  subject: text("subject"),
  createdAt: timestamp("created_at").defaultNow()
});
var insertTaskSchema = createInsertSchema(tasks).pick({
  userId: true,
  title: true,
  description: true,
  dueDate: true,
  priority: true,
  subject: true
});
var studySessions = pgTable("study_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  subject: text("subject").notNull(),
  duration: integer("duration").notNull(),
  // in minutes
  date: timestamp("date").notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow()
});
var insertStudySessionSchema = createInsertSchema(studySessions).pick({
  userId: true,
  subject: true,
  duration: true,
  date: true,
  startTime: true,
  endTime: true,
  description: true
});
var notes = pgTable("notes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  content: text("content"),
  subject: text("subject"),
  tags: text("tags").array(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var insertNoteSchema = createInsertSchema(notes).pick({
  userId: true,
  title: true,
  content: true,
  subject: true,
  tags: true
});
var settings = pgTable("settings", {
  userId: integer("user_id").primaryKey(),
  theme: text("theme").default("light"),
  accentColor: text("accent_color").default("#007AFF"),
  showAnimations: boolean("show_animations").default(true),
  showTaskDueTimes: boolean("show_task_due_times").default(true),
  fontSize: text("font_size").default("medium"),
  notificationSettings: jsonb("notification_settings").default({
    studyReminders: true,
    taskDeadlines: true,
    progressUpdates: true,
    soundAlerts: false,
    notificationTime: "15 minutes before"
  })
});
var insertSettingsSchema = createInsertSchema(settings).pick({
  userId: true,
  theme: true,
  accentColor: true,
  showAnimations: true,
  showTaskDueTimes: true,
  fontSize: true,
  notificationSettings: true
});
var pomodoroSessions = pgTable("pomodoro_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  duration: integer("duration").notNull(),
  // in minutes
  type: text("type").notNull(),
  // 'work' or 'break'
  completed: boolean("completed").notNull().default(true),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  createdAt: timestamp("created_at").defaultNow()
});
var insertPomodoroSessionSchema = createInsertSchema(
  pomodoroSessions
).pick({
  userId: true,
  duration: true,
  type: true,
  completed: true,
  timestamp: true
});
var TaskPriority = {
  HIGH: "high",
  MEDIUM: "medium",
  LOW: "low"
};
var TaskStatus = {
  PENDING: "pending",
  COMPLETED: "completed"
};

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
neonConfig.webSocketConstructor = ws;
var pool;
var db;
if (!process.env.DATABASE_URL) {
  console.warn(
    "DATABASE_URL not set. Using in-memory mode instead. Data will not persist after server restart."
  );
  pool = { end: () => Promise.resolve() };
  db = {
    select: () => ({ from: () => [] }),
    insert: () => ({ values: () => ({ returning: () => [] }) }),
    update: () => ({ set: () => ({ where: () => ({ returning: () => [] }) }) }),
    delete: () => ({ where: () => ({ returning: () => [] }) })
  };
} else {
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzle({ client: pool, schema: schema_exports });
}

// server/storage.ts
import { eq, and, gte, lte, desc } from "drizzle-orm";
import * as fs from "fs";
import * as path from "path";
var isInMemoryMode = !process.env.DATABASE_URL;
var USER_DATA_FILE = path.join(process.cwd(), "data", "users.json");
var TASKS_DATA_FILE = path.join(process.cwd(), "data", "tasks.json");
var NOTES_DATA_FILE = path.join(process.cwd(), "data", "notes.json");
var SESSIONS_DATA_FILE = path.join(process.cwd(), "data", "sessions.json");
var SETTINGS_DATA_FILE = path.join(process.cwd(), "data", "settings.json");
var POMODORO_DATA_FILE = path.join(process.cwd(), "data", "pomodoro.json");
if (!fs.existsSync(path.join(process.cwd(), "data"))) {
  try {
    fs.mkdirSync(path.join(process.cwd(), "data"), { recursive: true });
  } catch (err) {
    console.error("Failed to create data directory:", err);
  }
}
var initializeDataFile = (filePath, defaultData) => {
  if (!fs.existsSync(filePath)) {
    try {
      fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
    } catch (err) {
      console.error(`Failed to create ${filePath}:`, err);
    }
  }
};
var defaultUsers = [
  {
    id: 1,
    username: "demo",
    password: "password",
    displayName: "Demo User",
    email: "demo@example.com",
    createdAt: /* @__PURE__ */ new Date()
  }
];
var defaultTasks = [
  {
    id: 1,
    userId: 1,
    title: "Complete Math Assignment",
    description: "Finish calculus problems on page 45",
    dueDate: new Date(Date.now() + 864e5),
    // Tomorrow
    priority: "high",
    status: "pending",
    subject: "Mathematics",
    createdAt: /* @__PURE__ */ new Date()
  },
  {
    id: 2,
    userId: 1,
    title: "Read Biology Chapter",
    description: "Read chapter 5 on cell reproduction",
    dueDate: new Date(Date.now() + 1728e5),
    // Day after tomorrow
    priority: "medium",
    status: "pending",
    subject: "Biology",
    createdAt: /* @__PURE__ */ new Date()
  }
];
var defaultStudySessions = [
  {
    id: 1,
    userId: 1,
    subject: "Mathematics",
    duration: 60,
    // 60 minutes
    date: /* @__PURE__ */ new Date(),
    startTime: new Date(Date.now() - 72e5),
    // 2 hours ago
    endTime: new Date(Date.now() - 36e5),
    // 1 hour ago
    description: "Studied calculus",
    createdAt: /* @__PURE__ */ new Date()
  }
];
var defaultNotes = [
  {
    id: 1,
    userId: 1,
    title: "Calculus Notes",
    content: "# Derivatives\n- Power rule: d/dx(x^n) = n*x^(n-1)\n- Product rule: d/dx(f*g) = f'g + fg'",
    subject: "Mathematics",
    tags: ["calculus", "derivatives"],
    createdAt: /* @__PURE__ */ new Date(),
    updatedAt: /* @__PURE__ */ new Date()
  }
];
var defaultSettings = [
  {
    userId: 1,
    theme: "light",
    accentColor: "#007AFF",
    showAnimations: true,
    showTaskDueTimes: true,
    fontSize: "medium",
    notificationSettings: {
      studyReminders: true,
      taskDeadlines: true,
      progressUpdates: true,
      soundAlerts: false,
      notificationTime: "15 minutes before"
    }
  }
];
var defaultPomodoroSessions = [];
initializeDataFile(USER_DATA_FILE, defaultUsers);
initializeDataFile(TASKS_DATA_FILE, defaultTasks);
initializeDataFile(NOTES_DATA_FILE, defaultNotes);
initializeDataFile(SESSIONS_DATA_FILE, defaultStudySessions);
initializeDataFile(SETTINGS_DATA_FILE, defaultSettings);
initializeDataFile(POMODORO_DATA_FILE, defaultPomodoroSessions);
var loadDataFromFile = (filePath) => {
  try {
    const fileData = fs.readFileSync(filePath, "utf8");
    const parsedData = JSON.parse(fileData);
    return parsedData.map((item) => {
      const newItem = { ...item };
      for (const key in newItem) {
        if (typeof newItem[key] === "string" && (key.includes("date") || key.includes("Date") || key.includes("time") || key.includes("Time") || key === "createdAt" || key === "updatedAt")) {
          newItem[key] = new Date(newItem[key]);
        }
      }
      return newItem;
    });
  } catch (err) {
    console.error(`Failed to load data from ${filePath}:`, err);
    return [];
  }
};
var saveDataToFile = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(`Failed to save data to ${filePath}:`, err);
  }
};
var mockUsers = loadDataFromFile(USER_DATA_FILE);
var mockTasks = loadDataFromFile(TASKS_DATA_FILE);
var mockStudySessions = loadDataFromFile(SESSIONS_DATA_FILE);
var mockNotes = loadDataFromFile(NOTES_DATA_FILE);
var mockSettings = loadDataFromFile(SETTINGS_DATA_FILE);
var mockPomodoroSessions = loadDataFromFile(POMODORO_DATA_FILE);
var DatabaseStorage = class {
  // User methods
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  async getUserByUsername(username) {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  async createUser(insertUser) {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  async updateUser(id, updates) {
    const [updatedUser] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return updatedUser;
  }
  // Task methods
  async getTasks(userId) {
    return await db.select().from(tasks).where(eq(tasks.userId, userId)).orderBy(desc(tasks.createdAt));
  }
  async getTasksByStatus(userId, status) {
    return await db.select().from(tasks).where(and(eq(tasks.userId, userId), eq(tasks.status, status))).orderBy(desc(tasks.createdAt));
  }
  async getTasksBySubject(userId, subject) {
    return await db.select().from(tasks).where(and(eq(tasks.userId, userId), eq(tasks.subject, subject))).orderBy(desc(tasks.createdAt));
  }
  async getTaskById(id) {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task;
  }
  async createTask(insertTask) {
    const taskToInsert = {
      ...insertTask,
      status: TaskStatus.PENDING
    };
    const [task] = await db.insert(tasks).values(taskToInsert).returning();
    return task;
  }
  async updateTask(id, updates) {
    const [updatedTask] = await db.update(tasks).set(updates).where(eq(tasks.id, id)).returning();
    return updatedTask;
  }
  async deleteTask(id) {
    const [deletedTask] = await db.delete(tasks).where(eq(tasks.id, id)).returning();
    return !!deletedTask;
  }
  // Study session methods
  async getStudySessions(userId) {
    return await db.select().from(studySessions).where(eq(studySessions.userId, userId)).orderBy(desc(studySessions.date));
  }
  async getStudySessionById(id) {
    const [session] = await db.select().from(studySessions).where(eq(studySessions.id, id));
    return session;
  }
  async getStudySessionsBySubject(userId, subject) {
    return await db.select().from(studySessions).where(
      and(
        eq(studySessions.userId, userId),
        eq(studySessions.subject, subject)
      )
    ).orderBy(desc(studySessions.date));
  }
  async getStudySessionsByDateRange(userId, startDate, endDate) {
    return await db.select().from(studySessions).where(
      and(
        eq(studySessions.userId, userId),
        gte(studySessions.date, startDate),
        lte(studySessions.date, endDate)
      )
    ).orderBy(desc(studySessions.date));
  }
  async createStudySession(insertSession) {
    const [session] = await db.insert(studySessions).values(insertSession).returning();
    return session;
  }
  async updateStudySession(id, updates) {
    const [updatedSession] = await db.update(studySessions).set(updates).where(eq(studySessions.id, id)).returning();
    return updatedSession;
  }
  async deleteStudySession(id) {
    const [deletedSession] = await db.delete(studySessions).where(eq(studySessions.id, id)).returning();
    return !!deletedSession;
  }
  // Note methods
  async getNotes(userId) {
    return await db.select().from(notes).where(eq(notes.userId, userId)).orderBy(desc(notes.updatedAt));
  }
  async getNoteById(id) {
    const [note] = await db.select().from(notes).where(eq(notes.id, id));
    return note;
  }
  async getNotesBySubject(userId, subject) {
    return await db.select().from(notes).where(and(eq(notes.userId, userId), eq(notes.subject, subject))).orderBy(desc(notes.updatedAt));
  }
  async createNote(insertNote) {
    const now = /* @__PURE__ */ new Date();
    const noteToInsert = {
      ...insertNote,
      updatedAt: now
    };
    const [note] = await db.insert(notes).values(noteToInsert).returning();
    return note;
  }
  async updateNote(id, updates) {
    const updatesToApply = {
      ...updates,
      updatedAt: /* @__PURE__ */ new Date()
    };
    const [updatedNote] = await db.update(notes).set(updatesToApply).where(eq(notes.id, id)).returning();
    return updatedNote;
  }
  async deleteNote(id) {
    const [deletedNote] = await db.delete(notes).where(eq(notes.id, id)).returning();
    return !!deletedNote;
  }
  // Settings methods
  async getSettings(userId) {
    const [setting] = await db.select().from(settings).where(eq(settings.userId, userId));
    return setting;
  }
  async createOrUpdateSettings(insertSettings) {
    const existingSettings = await this.getSettings(insertSettings.userId);
    if (existingSettings) {
      const [updatedSettings] = await db.update(settings).set(insertSettings).where(eq(settings.userId, insertSettings.userId)).returning();
      return updatedSettings;
    } else {
      const [newSettings] = await db.insert(settings).values(insertSettings).returning();
      return newSettings;
    }
  }
  // Pomodoro methods
  async getPomodoroSessions(userId) {
    try {
      return await db.select().from(pomodoroSessions).where(eq(pomodoroSessions.userId, userId)).orderBy(desc(pomodoroSessions.timestamp));
    } catch (error) {
      console.error("Failed to get pomodoro sessions:", error);
      return [];
    }
  }
  async createPomodoroSession(insertSession) {
    try {
      const [newSession] = await db.insert(pomodoroSessions).values(insertSession).returning();
      return newSession;
    } catch (error) {
      console.error("Failed to create pomodoro session:", error);
      throw error;
    }
  }
};
var MockStorage = class {
  // User methods
  async getUser(id) {
    return mockUsers.find((user) => user.id === id);
  }
  async getUserByUsername(username) {
    return mockUsers.find((user) => user.username === username);
  }
  async createUser(insertUser) {
    const newId = mockUsers.length > 0 ? Math.max(...mockUsers.map((u) => u.id)) + 1 : 1;
    const newUser = {
      id: newId,
      ...insertUser,
      createdAt: /* @__PURE__ */ new Date()
    };
    mockUsers.push(newUser);
    saveDataToFile(USER_DATA_FILE, mockUsers);
    return newUser;
  }
  async updateUser(id, updates) {
    const index = mockUsers.findIndex((user) => user.id === id);
    if (index === -1) return void 0;
    mockUsers[index] = { ...mockUsers[index], ...updates };
    saveDataToFile(USER_DATA_FILE, mockUsers);
    return mockUsers[index];
  }
  // Task methods
  async getTasks(userId) {
    return mockTasks.filter((task) => task.userId === userId);
  }
  async getTasksByStatus(userId, status) {
    return mockTasks.filter(
      (task) => task.userId === userId && task.status === status
    );
  }
  async getTasksBySubject(userId, subject) {
    return mockTasks.filter(
      (task) => task.userId === userId && task.subject === subject
    );
  }
  async getTaskById(id) {
    return mockTasks.find((task) => task.id === id);
  }
  async createTask(insertTask) {
    const newId = mockTasks.length > 0 ? Math.max(...mockTasks.map((t) => t.id)) + 1 : 1;
    const newTask = {
      id: newId,
      ...insertTask,
      status: "pending",
      createdAt: /* @__PURE__ */ new Date()
    };
    mockTasks.push(newTask);
    saveDataToFile(TASKS_DATA_FILE, mockTasks);
    return newTask;
  }
  async updateTask(id, updates) {
    const index = mockTasks.findIndex((task) => task.id === id);
    if (index === -1) return void 0;
    mockTasks[index] = { ...mockTasks[index], ...updates };
    saveDataToFile(TASKS_DATA_FILE, mockTasks);
    return mockTasks[index];
  }
  async deleteTask(id) {
    const index = mockTasks.findIndex((task) => task.id === id);
    if (index === -1) return false;
    mockTasks.splice(index, 1);
    saveDataToFile(TASKS_DATA_FILE, mockTasks);
    return true;
  }
  // Study session methods
  async getStudySessions(userId) {
    return mockStudySessions.filter((session) => session.userId === userId);
  }
  async getStudySessionById(id) {
    return mockStudySessions.find((session) => session.id === id);
  }
  async getStudySessionsBySubject(userId, subject) {
    return mockStudySessions.filter(
      (session) => session.userId === userId && session.subject === subject
    );
  }
  async getStudySessionsByDateRange(userId, startDate, endDate) {
    return mockStudySessions.filter((session) => {
      return session.userId === userId && session.date >= startDate && session.date <= endDate;
    });
  }
  async createStudySession(insertSession) {
    const newId = mockStudySessions.length > 0 ? Math.max(...mockStudySessions.map((s) => s.id)) + 1 : 1;
    const newSession = {
      id: newId,
      ...insertSession,
      createdAt: /* @__PURE__ */ new Date()
    };
    mockStudySessions.push(newSession);
    saveDataToFile(SESSIONS_DATA_FILE, mockStudySessions);
    return newSession;
  }
  async updateStudySession(id, updates) {
    const index = mockStudySessions.findIndex((session) => session.id === id);
    if (index === -1) return void 0;
    mockStudySessions[index] = { ...mockStudySessions[index], ...updates };
    saveDataToFile(SESSIONS_DATA_FILE, mockStudySessions);
    return mockStudySessions[index];
  }
  async deleteStudySession(id) {
    const index = mockStudySessions.findIndex((session) => session.id === id);
    if (index === -1) return false;
    mockStudySessions.splice(index, 1);
    saveDataToFile(SESSIONS_DATA_FILE, mockStudySessions);
    return true;
  }
  // Note methods
  async getNotes(userId) {
    return mockNotes.filter((note) => note.userId === userId);
  }
  async getNoteById(id) {
    return mockNotes.find((note) => note.id === id);
  }
  async getNotesBySubject(userId, subject) {
    return mockNotes.filter(
      (note) => note.userId === userId && note.subject === subject
    );
  }
  async createNote(insertNote) {
    const newId = mockNotes.length > 0 ? Math.max(...mockNotes.map((n) => n.id)) + 1 : 1;
    const newNote = {
      id: newId,
      ...insertNote,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
    mockNotes.push(newNote);
    saveDataToFile(NOTES_DATA_FILE, mockNotes);
    return newNote;
  }
  async updateNote(id, updates) {
    const index = mockNotes.findIndex((note) => note.id === id);
    if (index === -1) return void 0;
    mockNotes[index] = {
      ...mockNotes[index],
      ...updates,
      updatedAt: /* @__PURE__ */ new Date()
    };
    saveDataToFile(NOTES_DATA_FILE, mockNotes);
    return mockNotes[index];
  }
  async deleteNote(id) {
    const index = mockNotes.findIndex((note) => note.id === id);
    if (index === -1) return false;
    mockNotes.splice(index, 1);
    saveDataToFile(NOTES_DATA_FILE, mockNotes);
    return true;
  }
  // Settings methods
  async getSettings(userId) {
    return mockSettings.find((setting) => setting.userId === userId);
  }
  async createOrUpdateSettings(insertSettings) {
    const index = mockSettings.findIndex(
      (setting) => setting.userId === insertSettings.userId
    );
    if (index === -1) {
      const newSettings = { ...insertSettings };
      mockSettings.push(newSettings);
      saveDataToFile(SETTINGS_DATA_FILE, mockSettings);
      return newSettings;
    } else {
      mockSettings[index] = { ...mockSettings[index], ...insertSettings };
      saveDataToFile(SETTINGS_DATA_FILE, mockSettings);
      return mockSettings[index];
    }
  }
  // Pomodoro methods
  async getPomodoroSessions(userId) {
    return mockPomodoroSessions.filter((session) => session.userId === userId);
  }
  async createPomodoroSession(insertSession) {
    const newId = mockPomodoroSessions.length > 0 ? Math.max(...mockPomodoroSessions.map((s) => s.id)) + 1 : 1;
    const newSession = {
      id: newId,
      ...insertSession,
      createdAt: /* @__PURE__ */ new Date()
    };
    mockPomodoroSessions.push(newSession);
    saveDataToFile(POMODORO_DATA_FILE, mockPomodoroSessions);
    return newSession;
  }
};
var storage = isInMemoryMode ? new MockStorage() : new DatabaseStorage();

// server/routes.ts
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
async function registerRoutes(app2) {
  const apiRouter = express.Router();
  app2.use("/api", apiRouter);
  const validateRequest = (schema) => {
    return (req, res, next) => {
      try {
        req.body = schema.parse(req.body);
        next();
      } catch (error) {
        if (error instanceof ZodError) {
          const validationError = fromZodError(error);
          res.status(400).json({ error: validationError.message });
        } else {
          res.status(500).json({ error: "Server error during validation" });
        }
      }
    };
  };
  apiRouter.post("/auth/login", async (req, res) => {
    const { username, password } = req.body;
    const user = await storage.getUserByUsername(username);
    if (!user || user.password !== password) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });
  apiRouter.post(
    "/auth/register",
    validateRequest(insertUserSchema),
    async (req, res) => {
      try {
        const { username } = req.body;
        const existingUser = await storage.getUserByUsername(username);
        if (existingUser) {
          return res.status(409).json({ error: "Username already exists" });
        }
        const user = await storage.createUser(req.body);
        const { password: _, ...userWithoutPassword } = user;
        res.status(201).json(userWithoutPassword);
      } catch (error) {
        res.status(500).json({ error: "Failed to register user" });
      }
    }
  );
  apiRouter.get("/tasks", async (req, res) => {
    const userId = 1;
    const tasks2 = await storage.getTasks(userId);
    res.json(tasks2);
  });
  apiRouter.get("/tasks/status/:status", async (req, res) => {
    const userId = 1;
    const status = req.params.status;
    const tasks2 = await storage.getTasksByStatus(userId, status);
    res.json(tasks2);
  });
  apiRouter.get("/tasks/subject/:subject", async (req, res) => {
    const userId = 1;
    const subject = req.params.subject;
    const tasks2 = await storage.getTasksBySubject(userId, subject);
    res.json(tasks2);
  });
  apiRouter.get("/tasks/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const task = await storage.getTaskById(id);
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }
    res.json(task);
  });
  apiRouter.post(
    "/tasks",
    validateRequest(insertTaskSchema),
    async (req, res) => {
      const task = await storage.createTask(req.body);
      res.status(201).json(task);
    }
  );
  apiRouter.patch("/tasks/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const updatedTask = await storage.updateTask(id, req.body);
    if (!updatedTask) {
      return res.status(404).json({ error: "Task not found" });
    }
    res.json(updatedTask);
  });
  apiRouter.delete("/tasks/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const deleted = await storage.deleteTask(id);
    if (!deleted) {
      return res.status(404).json({ error: "Task not found" });
    }
    res.status(204).send();
  });
  apiRouter.get("/study-sessions", async (req, res) => {
    const userId = 1;
    const studySessions2 = await storage.getStudySessions(userId);
    res.json(studySessions2);
  });
  apiRouter.get("/study-sessions/date-range", async (req, res) => {
    const userId = 1;
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ error: "Start and end dates are required" });
    }
    const studySessions2 = await storage.getStudySessionsByDateRange(
      userId,
      new Date(startDate),
      new Date(endDate)
    );
    res.json(studySessions2);
  });
  apiRouter.get("/study-sessions/subject/:subject", async (req, res) => {
    const userId = 1;
    const subject = req.params.subject;
    const studySessions2 = await storage.getStudySessionsBySubject(
      userId,
      subject
    );
    res.json(studySessions2);
  });
  apiRouter.get("/study-sessions/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const studySession = await storage.getStudySessionById(id);
    if (!studySession) {
      return res.status(404).json({ error: "Study session not found" });
    }
    res.json(studySession);
  });
  apiRouter.post(
    "/study-sessions",
    validateRequest(insertStudySessionSchema),
    async (req, res) => {
      const studySession = await storage.createStudySession(req.body);
      res.status(201).json(studySession);
    }
  );
  apiRouter.patch("/study-sessions/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const updatedStudySession = await storage.updateStudySession(id, req.body);
    if (!updatedStudySession) {
      return res.status(404).json({ error: "Study session not found" });
    }
    res.json(updatedStudySession);
  });
  apiRouter.delete("/study-sessions/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const deleted = await storage.deleteStudySession(id);
    if (!deleted) {
      return res.status(404).json({ error: "Study session not found" });
    }
    res.status(204).send();
  });
  apiRouter.get("/notes", async (req, res) => {
    const userId = 1;
    const notes2 = await storage.getNotes(userId);
    res.json(notes2);
  });
  apiRouter.get("/notes/subject/:subject", async (req, res) => {
    const userId = 1;
    const subject = req.params.subject;
    const notes2 = await storage.getNotesBySubject(userId, subject);
    res.json(notes2);
  });
  apiRouter.get("/notes/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const note = await storage.getNoteById(id);
    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }
    res.json(note);
  });
  apiRouter.post(
    "/notes",
    validateRequest(insertNoteSchema),
    async (req, res) => {
      const note = await storage.createNote(req.body);
      res.status(201).json(note);
    }
  );
  apiRouter.patch("/notes/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const updatedNote = await storage.updateNote(id, req.body);
    if (!updatedNote) {
      return res.status(404).json({ error: "Note not found" });
    }
    res.json(updatedNote);
  });
  apiRouter.delete("/notes/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const deleted = await storage.deleteNote(id);
    if (!deleted) {
      return res.status(404).json({ error: "Note not found" });
    }
    res.status(204).send();
  });
  apiRouter.get("/settings", async (req, res) => {
    const userId = 1;
    const settings2 = await storage.getSettings(userId);
    if (!settings2) {
      return res.status(404).json({ error: "Settings not found" });
    }
    res.json(settings2);
  });
  apiRouter.post(
    "/settings",
    validateRequest(insertSettingsSchema),
    async (req, res) => {
      const settings2 = await storage.createOrUpdateSettings(req.body);
      res.status(201).json(settings2);
    }
  );
  apiRouter.get("/stats", async (req, res) => {
    const userId = 1;
    const tasks2 = await storage.getTasks(userId);
    const completedTasks = tasks2.filter((task) => task.status === "completed");
    const now = /* @__PURE__ */ new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(now);
    endOfWeek.setDate(now.getDate() + (6 - now.getDay()));
    endOfWeek.setHours(23, 59, 59, 999);
    const studySessions2 = await storage.getStudySessionsByDateRange(
      userId,
      startOfWeek,
      endOfWeek
    );
    const totalStudyMinutes = studySessions2.reduce(
      (total, session) => total + session.duration,
      0
    );
    const totalStudyHours = totalStudyMinutes / 60;
    const subjectMap = {};
    studySessions2.forEach((session) => {
      if (!subjectMap[session.subject]) {
        subjectMap[session.subject] = 0;
      }
      subjectMap[session.subject] += session.duration;
    });
    const subjectDistribution = Object.entries(subjectMap).map(
      ([subject, minutes]) => ({
        subject,
        minutes,
        percentage: Math.round(minutes / totalStudyMinutes * 100)
      })
    );
    const streak = 5;
    res.json({
      totalStudyHours,
      completedTasks: completedTasks.length,
      totalTasks: tasks2.length,
      subjectDistribution,
      streak,
      dailyStats: studySessions2.map((session) => ({
        date: session.date,
        minutes: session.duration,
        subject: session.subject
      }))
    });
  });
  apiRouter.get("/pomodoro-sessions", async (req, res) => {
    const userId = 1;
    const sessions = await storage.getPomodoroSessions(userId);
    res.json(sessions);
  });
  apiRouter.post(
    "/pomodoro-sessions",
    validateRequest(insertPomodoroSessionSchema),
    async (req, res) => {
      try {
        const session = await storage.createPomodoroSession(req.body);
        res.status(201).json(session);
      } catch (error) {
        res.status(500).json({ error: "Failed to create pomodoro session" });
      }
    }
  );
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express2 from "express";
import fs2 from "fs";
import path3, { dirname as dirname2 } from "path";
import { fileURLToPath as fileURLToPath2 } from "url";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path2, { dirname } from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { fileURLToPath } from "url";
var __filename = fileURLToPath(import.meta.url);
var __dirname = dirname(__filename);
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    themePlugin(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path2.resolve(__dirname, "client", "src"),
      "@shared": path2.resolve(__dirname, "shared")
    }
  },
  root: path2.resolve(__dirname, "client"),
  build: {
    outDir: path2.resolve(__dirname, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var __filename2 = fileURLToPath2(import.meta.url);
var __dirname2 = dirname2(__filename2);
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path3.resolve(
        __dirname2,
        "..",
        "client",
        "index.html"
      );
      let template = await fs2.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path3.resolve(__dirname2, "public");
  if (!fs2.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express2.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path3.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express3();
app.use(express3.json());
app.use(express3.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path4 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path4.startsWith("/api")) {
      let logLine = `${req.method} ${path4} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5e3;
  server.listen(
    {
      port,
      host: "localhost"
    },
    () => {
      log(`serving on port ${port}`);
    }
  );
})();
