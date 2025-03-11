import express, { type Express } from "express";
import type { Server } from "http";
import { createServer } from "http";
import { storage } from "./storage";
import { insertTaskSchema, insertNoteSchema, insertStudySessionSchema, insertSettingsSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // API prefix
  const apiRouter = express.Router();
  app.use("/api", apiRouter);
  
  // Error handling middleware for Zod validations
  const validateRequest = (schema: any) => {
    return (req: express.Request, res: express.Response, next: express.NextFunction) => {
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
  
  // Authentication endpoint (simple mock for this demo)
  apiRouter.post("/auth/login", async (req, res) => {
    const { username, password } = req.body;
    const user = await storage.getUserByUsername(username);
    
    if (!user || user.password !== password) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });
  
  // Tasks routes
  apiRouter.get("/tasks", async (req, res) => {
    const userId = 1; // For demo, we'll use a fixed user ID
    const tasks = await storage.getTasks(userId);
    res.json(tasks);
  });
  
  apiRouter.get("/tasks/status/:status", async (req, res) => {
    const userId = 1;
    const status = req.params.status;
    const tasks = await storage.getTasksByStatus(userId, status);
    res.json(tasks);
  });
  
  apiRouter.get("/tasks/subject/:subject", async (req, res) => {
    const userId = 1;
    const subject = req.params.subject;
    const tasks = await storage.getTasksBySubject(userId, subject);
    res.json(tasks);
  });
  
  apiRouter.get("/tasks/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const task = await storage.getTaskById(id);
    
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }
    
    res.json(task);
  });
  
  apiRouter.post("/tasks", validateRequest(insertTaskSchema), async (req, res) => {
    const task = await storage.createTask(req.body);
    res.status(201).json(task);
  });
  
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
  
  // Study sessions routes
  apiRouter.get("/study-sessions", async (req, res) => {
    const userId = 1;
    const studySessions = await storage.getStudySessions(userId);
    res.json(studySessions);
  });
  
  apiRouter.get("/study-sessions/date-range", async (req, res) => {
    const userId = 1;
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ error: "Start and end dates are required" });
    }
    
    const studySessions = await storage.getStudySessionsByDateRange(
      userId,
      new Date(startDate as string),
      new Date(endDate as string)
    );
    
    res.json(studySessions);
  });
  
  apiRouter.get("/study-sessions/subject/:subject", async (req, res) => {
    const userId = 1;
    const subject = req.params.subject;
    const studySessions = await storage.getStudySessionsBySubject(userId, subject);
    res.json(studySessions);
  });
  
  apiRouter.get("/study-sessions/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const studySession = await storage.getStudySessionById(id);
    
    if (!studySession) {
      return res.status(404).json({ error: "Study session not found" });
    }
    
    res.json(studySession);
  });
  
  apiRouter.post("/study-sessions", validateRequest(insertStudySessionSchema), async (req, res) => {
    const studySession = await storage.createStudySession(req.body);
    res.status(201).json(studySession);
  });
  
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
  
  // Notes routes
  apiRouter.get("/notes", async (req, res) => {
    const userId = 1;
    const notes = await storage.getNotes(userId);
    res.json(notes);
  });
  
  apiRouter.get("/notes/subject/:subject", async (req, res) => {
    const userId = 1;
    const subject = req.params.subject;
    const notes = await storage.getNotesBySubject(userId, subject);
    res.json(notes);
  });
  
  apiRouter.get("/notes/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const note = await storage.getNoteById(id);
    
    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }
    
    res.json(note);
  });
  
  apiRouter.post("/notes", validateRequest(insertNoteSchema), async (req, res) => {
    const note = await storage.createNote(req.body);
    res.status(201).json(note);
  });
  
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
  
  // Settings routes
  apiRouter.get("/settings", async (req, res) => {
    const userId = 1;
    const settings = await storage.getSettings(userId);
    
    if (!settings) {
      return res.status(404).json({ error: "Settings not found" });
    }
    
    res.json(settings);
  });
  
  apiRouter.post("/settings", validateRequest(insertSettingsSchema), async (req, res) => {
    const settings = await storage.createOrUpdateSettings(req.body);
    res.status(201).json(settings);
  });
  
  // Stats routes for dashboard and progress tracking
  apiRouter.get("/stats", async (req, res) => {
    const userId = 1;
    
    // Get tasks
    const tasks = await storage.getTasks(userId);
    const completedTasks = tasks.filter(task => task.status === "completed");
    
    // Get study sessions for the current week
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(now);
    endOfWeek.setDate(now.getDate() + (6 - now.getDay()));
    endOfWeek.setHours(23, 59, 59, 999);
    
    const studySessions = await storage.getStudySessionsByDateRange(userId, startOfWeek, endOfWeek);
    
    // Calculate total study hours
    const totalStudyMinutes = studySessions.reduce((total, session) => total + session.duration, 0);
    const totalStudyHours = totalStudyMinutes / 60;
    
    // Calculate subject distribution
    const subjectMap: Record<string, number> = {};
    studySessions.forEach(session => {
      if (!subjectMap[session.subject]) {
        subjectMap[session.subject] = 0;
      }
      subjectMap[session.subject] += session.duration;
    });
    
    const subjectDistribution = Object.entries(subjectMap).map(([subject, minutes]) => ({
      subject,
      minutes,
      percentage: Math.round((minutes / totalStudyMinutes) * 100)
    }));
    
    // Calculate study streak
    // For demo, we'll just return a fixed value
    const streak = 5;
    
    res.json({
      totalStudyHours,
      completedTasks: completedTasks.length,
      totalTasks: tasks.length,
      subjectDistribution,
      streak,
      dailyStats: studySessions.map(session => ({
        date: session.date,
        minutes: session.duration,
        subject: session.subject
      }))
    });
  });
  
  const httpServer = createServer(app);
  return httpServer;
}
