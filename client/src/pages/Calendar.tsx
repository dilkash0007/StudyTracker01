import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { StudySession } from '@/types';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import CalendarDay from '@/components/CalendarDay';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isToday, 
  addMonths, 
  subMonths,
  startOfWeek,
  endOfWeek,
  isSameDay,
  parseISO
} from 'date-fns';

const Calendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // Fetch study sessions
  const { data: studySessions, isLoading } = useQuery<StudySession[]>({
    queryKey: ['/api/study-sessions'],
  });
  
  // Navigate to previous/next month
  const handlePreviousMonth = () => {
    setCurrentMonth(prevMonth => subMonths(prevMonth, 1));
  };
  
  const handleNextMonth = () => {
    setCurrentMonth(prevMonth => addMonths(prevMonth, 1));
  };
  
  const handleToday = () => {
    setCurrentMonth(new Date());
  };
  
  // Generate calendar days
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });
  
  // Get study sessions for a specific day
  const getSessionsForDay = (day: Date) => {
    if (!studySessions) return [];
    
    return studySessions.filter(session => {
      const sessionDate = parseISO(session.date.toString());
      return isSameDay(sessionDate, day);
    });
  };
  
  return (
    <main className="flex-1 overflow-auto">
      <div className="container mx-auto p-4 pb-24">
        <motion.div 
          className="mb-6"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <h2 className="text-2xl font-bold">Calendar</h2>
          <p className="text-dark-100 dark:text-light-300">Organize your study schedule</p>
        </motion.div>
        
        <motion.div 
          className="bg-white dark:bg-dark-500 rounded-xl p-4 shadow-card"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold">{format(currentMonth, 'MMMM yyyy')}</h3>
            <div className="flex space-x-2">
              <button 
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-light-200 dark:hover:bg-dark-400"
                onClick={handlePreviousMonth}
                aria-label="Previous month"
              >
                <ChevronLeftIcon className="h-5 w-5" />
              </button>
              <button 
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-light-200 dark:hover:bg-dark-400"
                onClick={handleNextMonth}
                aria-label="Next month"
              >
                <ChevronRightIcon className="h-5 w-5" />
              </button>
              <button 
                className="ml-2 px-3 py-1 bg-primary text-white rounded-lg text-sm"
                onClick={handleToday}
              >
                Today
              </button>
            </div>
          </div>
          
          {/* Calendar Header */}
          <div className="grid grid-cols-7 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center text-dark-100 dark:text-light-300 font-medium">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {isLoading ? (
              <div className="col-span-7 flex justify-center items-center py-20">
                <p>Loading calendar...</p>
              </div>
            ) : (
              calendarDays.map((day, i) => (
                <CalendarDay 
                  key={i}
                  day={day.getDate()}
                  isCurrentMonth={isSameMonth(day, currentMonth)}
                  isToday={isToday(day)}
                  studySessions={getSessionsForDay(day)}
                />
              ))
            )}
          </div>
        </motion.div>
      </div>
    </main>
  );
};

export default Calendar;
