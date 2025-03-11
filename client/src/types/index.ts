// Types for the application

export interface User {
  id: number;
  username: string;
  displayName?: string;
  email?: string;
  createdAt: Date;
}

export interface Task {
  id: number;
  userId: number;
  title: string;
  description?: string;
  dueDate?: Date;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'completed';
  subject?: string;
  createdAt: Date;
}

export interface StudySession {
  id: number;
  userId: number;
  subject: string;
  duration: number; // in minutes
  date: Date;
  startTime: Date;
  endTime: Date;
  description?: string;
  createdAt: Date;
}

export interface Note {
  id: number;
  userId: number;
  title: string;
  content?: string;
  subject?: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationSettings {
  studyReminders: boolean;
  taskDeadlines: boolean;
  progressUpdates: boolean;
  soundAlerts: boolean;
  notificationTime: string;
}

export interface Settings {
  userId: number;
  theme: string;
  accentColor: string;
  showAnimations: boolean;
  showTaskDueTimes: boolean;
  fontSize: string;
  notificationSettings: NotificationSettings;
}

export interface Stats {
  totalStudyHours: number;
  completedTasks: number;
  totalTasks: number;
  subjectDistribution: {
    subject: string;
    minutes: number;
    percentage: number;
  }[];
  streak: number;
  dailyStats: {
    date: Date;
    minutes: number;
    subject: string;
  }[];
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  timestamp: Date;
  type: 'reminder' | 'success' | 'warning';
  isRead: boolean;
}
