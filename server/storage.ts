import { User, Task, Note, StudySession, Settings, InsertUser, InsertTask, InsertNote, InsertStudySession, InsertSettings, TaskStatus } from "@shared/schema";

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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private tasks: Map<number, Task>;
  private studySessions: Map<number, StudySession>;
  private notes: Map<number, Note>;
  private settings: Map<number, Settings>;
  
  private userId: number = 1;
  private taskId: number = 1;
  private sessionId: number = 1;
  private noteId: number = 1;
  
  constructor() {
    this.users = new Map();
    this.tasks = new Map();
    this.studySessions = new Map();
    this.notes = new Map();
    this.settings = new Map();
    
    // Add a default user
    this.createUser({
      username: "jamie_doe",
      password: "password123",
      displayName: "Jamie Doe",
      email: "jamie.doe@example.com"
    });
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const now = new Date();
    const user: User = {
      id,
      ...insertUser,
      createdAt: now
    };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  // Task methods
  async getTasks(userId: number): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(
      (task) => task.userId === userId
    );
  }
  
  async getTasksByStatus(userId: number, status: string): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(
      (task) => task.userId === userId && task.status === status
    );
  }
  
  async getTasksBySubject(userId: number, subject: string): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(
      (task) => task.userId === userId && task.subject === subject
    );
  }
  
  async getTaskById(id: number): Promise<Task | undefined> {
    return this.tasks.get(id);
  }
  
  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = this.taskId++;
    const now = new Date();
    const task: Task = {
      id,
      ...insertTask,
      status: TaskStatus.PENDING,
      createdAt: now
    };
    this.tasks.set(id, task);
    return task;
  }
  
  async updateTask(id: number, updates: Partial<Task>): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (!task) return undefined;
    
    const updatedTask = { ...task, ...updates };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }
  
  async deleteTask(id: number): Promise<boolean> {
    return this.tasks.delete(id);
  }
  
  // Study session methods
  async getStudySessions(userId: number): Promise<StudySession[]> {
    return Array.from(this.studySessions.values()).filter(
      (session) => session.userId === userId
    );
  }
  
  async getStudySessionById(id: number): Promise<StudySession | undefined> {
    return this.studySessions.get(id);
  }
  
  async getStudySessionsBySubject(userId: number, subject: string): Promise<StudySession[]> {
    return Array.from(this.studySessions.values()).filter(
      (session) => session.userId === userId && session.subject === subject
    );
  }
  
  async getStudySessionsByDateRange(userId: number, startDate: Date, endDate: Date): Promise<StudySession[]> {
    return Array.from(this.studySessions.values()).filter(
      (session) => {
        return session.userId === userId && 
               session.date >= startDate &&
               session.date <= endDate;
      }
    );
  }
  
  async createStudySession(insertSession: InsertStudySession): Promise<StudySession> {
    const id = this.sessionId++;
    const now = new Date();
    const session: StudySession = {
      id,
      ...insertSession,
      createdAt: now
    };
    this.studySessions.set(id, session);
    return session;
  }
  
  async updateStudySession(id: number, updates: Partial<StudySession>): Promise<StudySession | undefined> {
    const session = this.studySessions.get(id);
    if (!session) return undefined;
    
    const updatedSession = { ...session, ...updates };
    this.studySessions.set(id, updatedSession);
    return updatedSession;
  }
  
  async deleteStudySession(id: number): Promise<boolean> {
    return this.studySessions.delete(id);
  }
  
  // Note methods
  async getNotes(userId: number): Promise<Note[]> {
    return Array.from(this.notes.values()).filter(
      (note) => note.userId === userId
    );
  }
  
  async getNoteById(id: number): Promise<Note | undefined> {
    return this.notes.get(id);
  }
  
  async getNotesBySubject(userId: number, subject: string): Promise<Note[]> {
    return Array.from(this.notes.values()).filter(
      (note) => note.userId === userId && note.subject === subject
    );
  }
  
  async createNote(insertNote: InsertNote): Promise<Note> {
    const id = this.noteId++;
    const now = new Date();
    const note: Note = {
      id,
      ...insertNote,
      createdAt: now,
      updatedAt: now
    };
    this.notes.set(id, note);
    return note;
  }
  
  async updateNote(id: number, updates: Partial<Note>): Promise<Note | undefined> {
    const note = this.notes.get(id);
    if (!note) return undefined;
    
    const updatedNote = { 
      ...note, 
      ...updates,
      updatedAt: new Date()
    };
    this.notes.set(id, updatedNote);
    return updatedNote;
  }
  
  async deleteNote(id: number): Promise<boolean> {
    return this.notes.delete(id);
  }
  
  // Settings methods
  async getSettings(userId: number): Promise<Settings | undefined> {
    return this.settings.get(userId);
  }
  
  async createOrUpdateSettings(insertSettings: InsertSettings): Promise<Settings> {
    const userId = insertSettings.userId;
    const settings: Settings = {
      ...insertSettings
    };
    this.settings.set(userId, settings);
    return settings;
  }
}

export const storage = new MemStorage();
