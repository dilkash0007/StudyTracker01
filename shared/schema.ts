import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name"),
  email: text("email"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  displayName: true,
  email: true,
});

// Tasks schema
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  dueDate: timestamp("due_date"),
  priority: text("priority").notNull().default("medium"),
  status: text("status").notNull().default("pending"),
  subject: text("subject"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTaskSchema = createInsertSchema(tasks).pick({
  userId: true,
  title: true,
  description: true,
  dueDate: true,
  priority: true,
  subject: true,
});

// Study sessions schema
export const studySessions = pgTable("study_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  subject: text("subject").notNull(),
  duration: integer("duration").notNull(), // in minutes
  date: timestamp("date").notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertStudySessionSchema = createInsertSchema(studySessions).pick({
  userId: true,
  subject: true,
  duration: true,
  date: true,
  startTime: true,
  endTime: true,
  description: true,
});

// Notes schema
export const notes = pgTable("notes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  content: text("content"),
  subject: text("subject"),
  tags: text("tags").array(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertNoteSchema = createInsertSchema(notes).pick({
  userId: true,
  title: true,
  content: true,
  subject: true,
  tags: true,
});

// Settings schema
export const settings = pgTable("settings", {
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
    notificationTime: "15 minutes before",
  }),
});

export const insertSettingsSchema = createInsertSchema(settings).pick({
  userId: true,
  theme: true,
  accentColor: true,
  showAnimations: true,
  showTaskDueTimes: true,
  fontSize: true,
  notificationSettings: true,
});

// Type definitions
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;

export type StudySession = typeof studySessions.$inferSelect;
export type InsertStudySession = z.infer<typeof insertStudySessionSchema>;

export type Note = typeof notes.$inferSelect;
export type InsertNote = z.infer<typeof insertNoteSchema>;

export type Settings = typeof settings.$inferSelect;
export type InsertSettings = z.infer<typeof insertSettingsSchema>;

// Priority and status enums for frontend
export const TaskPriority = {
  HIGH: "high",
  MEDIUM: "medium",
  LOW: "low"
} as const;

export const TaskStatus = {
  PENDING: "pending",
  COMPLETED: "completed"
} as const;
