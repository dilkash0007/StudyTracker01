import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Task, StudySession, Note, Settings, Notification } from '@/types';
import { useQuery } from '@tanstack/react-query';

interface AppContextType {
  activeSection: string;
  setActiveSection: (section: string) => void;
  notifications: Notification[];
  markNotificationAsRead: (id: number) => void;
  dismissNotification: (id: number) => void;
}

const initialNotifications: Notification[] = [
  {
    id: 1,
    title: 'Study Reminder',
    message: 'Physics study session starts in 30 minutes',
    timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    type: 'reminder',
    isRead: false
  },
  {
    id: 2,
    title: 'Task Completed',
    message: 'You completed "Math Assignment #4"',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    type: 'success',
    isRead: false
  },
  {
    id: 3,
    title: 'Upcoming Deadline',
    message: 'Chemistry report due in 2 days',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
    type: 'warning',
    isRead: false
  }
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [activeSection, setActiveSection] = useState('/');
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);

  const markNotificationAsRead = (id: number) => {
    setNotifications(prevNotifications =>
      prevNotifications.map(notification =>
        notification.id === id ? { ...notification, isRead: true } : notification
      )
    );
  };

  const dismissNotification = (id: number) => {
    setNotifications(prevNotifications =>
      prevNotifications.filter(notification => notification.id !== id)
    );
  };

  // Update active section based on URL
  useEffect(() => {
    const path = window.location.pathname;
    setActiveSection(path);
  }, []);

  const value = {
    activeSection,
    setActiveSection,
    notifications,
    markNotificationAsRead,
    dismissNotification
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
