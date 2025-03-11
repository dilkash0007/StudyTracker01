import { motion } from 'framer-motion';
import { StudySession } from '@/types';

interface CalendarDayProps {
  day: number;
  isCurrentMonth: boolean;
  isToday?: boolean;
  studySessions?: StudySession[];
  onClick?: () => void;
}

const CalendarDay = ({ day, isCurrentMonth, isToday = false, studySessions = [], onClick }: CalendarDayProps) => {
  // Group sessions by subject for better display
  const sessionsToShow = studySessions.slice(0, 3); // Show max 3 sessions
  const hasMoreSessions = studySessions.length > 3;
  
  // Get color based on subject
  const getSubjectColor = (subject: string) => {
    switch (subject.toLowerCase()) {
      case 'physics':
        return 'bg-primary text-white';
      case 'mathematics':
      case 'math':
        return 'bg-secondary text-white';
      case 'chemistry':
        return 'bg-warning text-white';
      case 'literature':
        return 'bg-info text-white';
      case 'history':
        return 'bg-danger text-white';
      default:
        return 'bg-primary text-white';
    }
  };
  
  return (
    <motion.div 
      className={`calendar-day p-1 h-28 rounded-lg ${
        !isCurrentMonth 
          ? 'inactive text-dark-100 dark:text-dark-200' 
          : isToday 
            ? 'bg-primary bg-opacity-10 border border-primary' 
            : 'hover:bg-light-200 dark:hover:bg-dark-400'
      }`}
      whileHover={isCurrentMonth ? { scale: 1.02 } : {}}
      onClick={onClick}
    >
      <div className={`p-1 ${isToday ? 'font-bold' : ''}`}>{day}</div>
      {isCurrentMonth && sessionsToShow.length > 0 && (
        <div className="px-1">
          {sessionsToShow.map((session, index) => (
            <div 
              key={index}
              className={`text-xs p-1 ${getSubjectColor(session.subject)} rounded mb-1 truncate`}
              title={`${session.subject}: ${session.description || ''}`}
            >
              {session.subject}
            </div>
          ))}
          {hasMoreSessions && (
            <div className="text-xs text-dark-100 dark:text-light-300 text-right">
              +{studySessions.length - 3} more
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default CalendarDay;
