import { User, Task, Note, StudySession, Settings, InsertUser, InsertTask, InsertNote, InsertStudySession, InsertSettings, TaskStatus, users, tasks, studySessions, notes, settings } from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte, desc } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  
  // Task methods
  getTasks(userId: number): Promise<Task[]>;
  getTasksByStatus(userId: number, status: string): Promise<Task[]>;
  getTasksBySubject(userId: number, subject: string): Promise<Task[]>;
  getTaskById(id: number): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, task: Partial<Task>): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;
  
  // Study session methods
  getStudySessions(userId: number): Promise<StudySession[]>;
  getStudySessionById(id: number): Promise<StudySession | undefined>;
  getStudySessionsBySubject(userId: number, subject: string): Promise<StudySession[]>;
  getStudySessionsByDateRange(userId: number, startDate: Date, endDate: Date): Promise<StudySession[]>;
  createStudySession(session: InsertStudySession): Promise<StudySession>;
  updateStudySession(id: number, session: Partial<StudySession>): Promise<StudySession | undefined>;
  deleteStudySession(id: number): Promise<boolean>;
  
  // Note methods
  getNotes(userId: number): Promise<Note[]>;
  getNoteById(id: number): Promise<Note | undefined>;
  getNotesBySubject(userId: number, subject: string): Promise<Note[]>;
  createNote(note: InsertNote): Promise<Note>;
  updateNote(id: number, note: Partial<Note>): Promise<Note | undefined>;
  deleteNote(id: number): Promise<boolean>;
  
  // Settings methods
  getSettings(userId: number): Promise<Settings | undefined>;
  createOrUpdateSettings(settings: InsertSettings): Promise<Settings>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }
  
  // Task methods
  async getTasks(userId: number): Promise<Task[]> {
    return await db
      .select()
      .from(tasks)
      .where(eq(tasks.userId, userId))
      .orderBy(desc(tasks.createdAt));
  }
  
  async getTasksByStatus(userId: number, status: string): Promise<Task[]> {
    return await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.userId, userId), eq(tasks.status, status)))
      .orderBy(desc(tasks.createdAt));
  }
  
  async getTasksBySubject(userId: number, subject: string): Promise<Task[]> {
    return await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.userId, userId), eq(tasks.subject, subject)))
      .orderBy(desc(tasks.createdAt));
  }
  
  async getTaskById(id: number): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task;
  }
  
  async createTask(insertTask: InsertTask): Promise<Task> {
    const taskToInsert = {
      ...insertTask,
      status: TaskStatus.PENDING
    };
    const [task] = await db.insert(tasks).values(taskToInsert).returning();
    return task;
  }
  
  async updateTask(id: number, updates: Partial<Task>): Promise<Task | undefined> {
    const [updatedTask] = await db
      .update(tasks)
      .set(updates)
      .where(eq(tasks.id, id))
      .returning();
    return updatedTask;
  }
  
  async deleteTask(id: number): Promise<boolean> {
    const [deletedTask] = await db
      .delete(tasks)
      .where(eq(tasks.id, id))
      .returning();
    return !!deletedTask;
  }
  
  // Study session methods
  async getStudySessions(userId: number): Promise<StudySession[]> {
    return await db
      .select()
      .from(studySessions)
      .where(eq(studySessions.userId, userId))
      .orderBy(desc(studySessions.date));
  }
  
  async getStudySessionById(id: number): Promise<StudySession | undefined> {
    const [session] = await db.select().from(studySessions).where(eq(studySessions.id, id));
    return session;
  }
  
  async getStudySessionsBySubject(userId: number, subject: string): Promise<StudySession[]> {
    return await db
      .select()
      .from(studySessions)
      .where(and(eq(studySessions.userId, userId), eq(studySessions.subject, subject)))
      .orderBy(desc(studySessions.date));
  }
  
  async getStudySessionsByDateRange(userId: number, startDate: Date, endDate: Date): Promise<StudySession[]> {
    return await db
      .select()
      .from(studySessions)
      .where(
        and(
          eq(studySessions.userId, userId),
          gte(studySessions.date, startDate),
          lte(studySessions.date, endDate)
        )
      )
      .orderBy(desc(studySessions.date));
  }
  
  async createStudySession(insertSession: InsertStudySession): Promise<StudySession> {
    const [session] = await db.insert(studySessions).values(insertSession).returning();
    return session;
  }
  
  async updateStudySession(id: number, updates: Partial<StudySession>): Promise<StudySession | undefined> {
    const [updatedSession] = await db
      .update(studySessions)
      .set(updates)
      .where(eq(studySessions.id, id))
      .returning();
    return updatedSession;
  }
  
  async deleteStudySession(id: number): Promise<boolean> {
    const [deletedSession] = await db
      .delete(studySessions)
      .where(eq(studySessions.id, id))
      .returning();
    return !!deletedSession;
  }
  
  // Note methods
  async getNotes(userId: number): Promise<Note[]> {
    return await db
      .select()
      .from(notes)
      .where(eq(notes.userId, userId))
      .orderBy(desc(notes.updatedAt));
  }
  
  async getNoteById(id: number): Promise<Note | undefined> {
    const [note] = await db.select().from(notes).where(eq(notes.id, id));
    return note;
  }
  
  async getNotesBySubject(userId: number, subject: string): Promise<Note[]> {
    return await db
      .select()
      .from(notes)
      .where(and(eq(notes.userId, userId), eq(notes.subject, subject)))
      .orderBy(desc(notes.updatedAt));
  }
  
  async createNote(insertNote: InsertNote): Promise<Note> {
    const now = new Date();
    const noteToInsert = {
      ...insertNote,
      updatedAt: now
    };
    const [note] = await db.insert(notes).values(noteToInsert).returning();
    return note;
  }
  
  async updateNote(id: number, updates: Partial<Note>): Promise<Note | undefined> {
    const updatesToApply = {
      ...updates,
      updatedAt: new Date()
    };
    
    const [updatedNote] = await db
      .update(notes)
      .set(updatesToApply)
      .where(eq(notes.id, id))
      .returning();
    return updatedNote;
  }
  
  async deleteNote(id: number): Promise<boolean> {
    const [deletedNote] = await db
      .delete(notes)
      .where(eq(notes.id, id))
      .returning();
    return !!deletedNote;
  }
  
  // Settings methods
  async getSettings(userId: number): Promise<Settings | undefined> {
    const [setting] = await db.select().from(settings).where(eq(settings.userId, userId));
    return setting;
  }
  
  async createOrUpdateSettings(insertSettings: InsertSettings): Promise<Settings> {
    // Check if settings already exist for this user
    const existingSettings = await this.getSettings(insertSettings.userId);
    
    if (existingSettings) {
      // Update existing settings
      const [updatedSettings] = await db
        .update(settings)
        .set(insertSettings)
        .where(eq(settings.userId, insertSettings.userId))
        .returning();
      return updatedSettings;
    } else {
      // Create new settings
      const [newSettings] = await db
        .insert(settings)
        .values(insertSettings)
        .returning();
      return newSettings;
    }
  }
}

// Use DatabaseStorage instead of MemStorage
export const storage = new DatabaseStorage();
