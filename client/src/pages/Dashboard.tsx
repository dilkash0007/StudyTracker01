import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import StatsCard from '@/components/StatsCard';
import TaskItem from '@/components/TaskItem';
import { Stats, Task, StudySession } from '@/types';
import { Clock, CheckSquare, Flame, Target, ArrowUpIcon } from 'lucide-react';
import SubjectDistributionChart from '@/components/charts/SubjectDistributionChart';
import WeeklyProgressChart from '@/components/charts/WeeklyProgressChart';
import { format } from 'date-fns';

const Dashboard = () => {
  // Fetch stats data
  const { data: stats, isLoading: statsLoading } = useQuery<Stats>({
    queryKey: ['/api/stats'],
  });
  
  // Fetch tasks data
  const { data: tasks, isLoading: tasksLoading } = useQuery<Task[]>({
    queryKey: ['/api/tasks'],
  });
  
  // Fetch today's study sessions
  const { data: studySessions, isLoading: sessionsLoading } = useQuery<StudySession[]>({
    queryKey: ['/api/study-sessions'],
  });
  
  // Format time as hours:minutes (1h 30m)
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h${mins > 0 ? ` ${mins}m` : ''}`;
  };
  
  // Filter sessions for today
  const todaysSessions = studySessions?.filter(session => {
    const sessionDate = new Date(session.date);
    const today = new Date();
    return sessionDate.toDateString() === today.toDateString();
  }) || [];
  
  // Sort sessions by start time
  const sortedSessions = [...todaysSessions].sort((a, b) => {
    return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
  });
  
  // Filter tasks by status (pending only) and sort by due date
  const upcomingTasks = tasks
    ? [...tasks]
        .filter(task => task.status === 'pending')
        .sort((a, b) => {
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        })
        .slice(0, 4)
    : [];
  
  // Container animation
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };
  
  // Item animation
  const itemAnimation = {
    hidden: { y: 20, opacity: 0 },
    show: { 
      y: 0, 
      opacity: 1,
      transition: { 
        type: "spring",
        stiffness: 100,
        damping: 12
      }
    }
  };
  
  return (
    <main className="flex-1 overflow-auto">
      <div className="container mx-auto p-4 pb-24">
        <motion.div 
          className="mb-6"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ 
            type: "spring",
            stiffness: 100,
            damping: 15
          }}
        >
          <h2 className="text-2xl font-bold">Dashboard</h2>
          <p className="text-dark-100 dark:text-light-300">Welcome to your study tracker! Start adding your study sessions and tasks.</p>
        </motion.div>
        
        {/* Quick Stats */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
          variants={container}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={itemAnimation}>
            <StatsCard 
              title="Study Hours"
              value={statsLoading ? "0" : `${stats?.totalStudyHours.toFixed(1) || "0"}`}
              icon={<Clock className="h-5 w-5" />}
              iconBgColor="bg-primary bg-opacity-20"
              iconColor="text-primary"
              trend={{ value: "Start tracking your study hours", isPositive: true }}
            />
          </motion.div>
          
          <motion.div variants={itemAnimation}>
            <StatsCard 
              title="Tasks Completed"
              value={statsLoading ? "0/0" : `${stats?.completedTasks || "0"}/${stats?.totalTasks || "0"}`}
              icon={<CheckSquare className="h-5 w-5" />}
              iconBgColor="bg-secondary bg-opacity-20"
              iconColor="text-secondary"
              trend={{ value: "Add and complete tasks", isPositive: true }}
            />
          </motion.div>
          
          <motion.div variants={itemAnimation}>
            <StatsCard 
              title="Study Streak"
              value={statsLoading ? "0 days" : `${stats?.streak || "0"} days`}
              icon={<Flame className="h-5 w-5" />}
              iconBgColor="bg-warning bg-opacity-20"
              iconColor="text-warning"
              trend={{ value: "Study daily to build a streak", isPositive: true }}
            />
          </motion.div>
          
          <motion.div variants={itemAnimation}>
            <StatsCard 
              title="Goal Progress"
              value="0%"
              icon={<Target className="h-5 w-5" />}
              iconBgColor="bg-info bg-opacity-20"
              iconColor="text-info"
              trend={{ value: "Set goals in settings", isPositive: true }}
            />
          </motion.div>
        </motion.div>
        
        {/* Today's Schedule and Upcoming Tasks */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6"
          variants={container}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={itemAnimation} className="lg:col-span-2">
            <div className="bg-white dark:bg-dark-500 rounded-xl p-4 shadow-card h-full">
              <h3 className="text-lg font-semibold mb-4">Today's Schedule</h3>
              
              {sessionsLoading ? (
                <div className="flex justify-center items-center h-40">
                  <p>Loading today's schedule...</p>
                </div>
              ) : sortedSessions.length === 0 ? (
                <div className="flex flex-col justify-center items-center h-40 text-dark-100 dark:text-light-300">
                  <p>No study sessions scheduled for today</p>
                  <button className="mt-4 p-2 border border-primary text-primary rounded-lg text-sm font-medium hover:bg-primary hover:text-white transition duration-300">
                    Add Study Session
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {sortedSessions.map((session) => (
                    <div key={session.id} className="flex items-center p-2 rounded-lg hover:bg-light-200 dark:hover:bg-dark-400 transition-colors duration-200">
                      <div className="w-16 text-center">
                        <span className="text-dark-100 dark:text-light-300 text-sm">
                          {format(new Date(session.startTime), 'h:mm a')}
                        </span>
                      </div>
                      <div className={`w-2 h-12 ${
                        session.subject.toLowerCase() === 'physics' ? 'bg-primary' :
                        session.subject.toLowerCase() === 'mathematics' || session.subject.toLowerCase() === 'math' ? 'bg-secondary' :
                        session.subject.toLowerCase() === 'chemistry' ? 'bg-warning' :
                        session.subject.toLowerCase() === 'literature' ? 'bg-info' : 'bg-primary'
                      } rounded-full mx-4`}></div>
                      <div className="flex-1">
                        <h4 className="font-medium">{session.subject} Study Session</h4>
                        <p className="text-sm text-dark-100 dark:text-light-300">{session.description || 'No description'}</p>
                      </div>
                      <div className="text-sm text-dark-100 dark:text-light-300">
                        {formatTime(session.duration)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
          
          <motion.div variants={itemAnimation}>
            <div className="bg-white dark:bg-dark-500 rounded-xl p-4 shadow-card h-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Upcoming Tasks</h3>
                <button className="text-primary text-sm font-medium">View All</button>
              </div>
              
              {tasksLoading ? (
                <div className="flex justify-center items-center h-40">
                  <p>Loading upcoming tasks...</p>
                </div>
              ) : upcomingTasks.length === 0 ? (
                <div className="flex flex-col justify-center items-center h-40 text-dark-100 dark:text-light-300">
                  <p>No upcoming tasks</p>
                  <p className="text-sm mt-2 text-center">Add tasks to track your upcoming assignments</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingTasks.map((task) => (
                    <TaskItem key={task.id} task={task} showActions={false} />
                  ))}
                </div>
              )}
              
              <button className="w-full mt-4 p-2 border border-primary text-primary rounded-lg text-sm font-medium hover:bg-primary hover:text-white transition duration-300">
                Add New Task
              </button>
            </div>
          </motion.div>
        </motion.div>
        
        {/* Progress Charts */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          variants={container}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={itemAnimation} className="bg-white dark:bg-dark-500 rounded-xl p-4 shadow-card">
            <h3 className="text-lg font-semibold mb-4">Time Per Subject</h3>
            {statsLoading ? (
              <div className="flex justify-center items-center h-64">
                <p>Loading subject distribution...</p>
              </div>
            ) : stats?.subjectDistribution && stats.subjectDistribution.length > 0 ? (
              <SubjectDistributionChart data={stats.subjectDistribution} height={250} />
            ) : (
              <div className="flex flex-col justify-center items-center h-64 text-dark-100 dark:text-light-300">
                <p>No study data available</p>
                <p className="text-sm mt-2">Track your study sessions to see your time distribution</p>
              </div>
            )}
          </motion.div>
          
          <motion.div variants={itemAnimation} className="bg-white dark:bg-dark-500 rounded-xl p-4 shadow-card">
            <h3 className="text-lg font-semibold mb-4">Weekly Progress</h3>
            {statsLoading ? (
              <div className="flex justify-center items-center h-64">
                <p>Loading weekly progress...</p>
              </div>
            ) : stats?.dailyStats && stats.dailyStats.length > 0 ? (
              <WeeklyProgressChart data={stats.dailyStats} height={250} />
            ) : (
              <div className="flex flex-col justify-center items-center h-64 text-dark-100 dark:text-light-300">
                <p>No progress data available</p>
                <p className="text-sm mt-2">Add study sessions to track your weekly progress</p>
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
};

export default Dashboard;
