import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Stats } from '@/types';
import { Clock, Calendar, CheckSquare, ArrowRight } from 'lucide-react';
import SubjectDistributionChart from '@/components/charts/SubjectDistributionChart';
import WeeklyProgressChart from '@/components/charts/WeeklyProgressChart';
import DailyStudyTimeChart from '@/components/charts/DailyStudyTimeChart';
import ProductivityTrendsChart from '@/components/charts/ProductivityTrendsChart';
import { format, startOfWeek, addDays, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Progress = () => {
  // Fetch stats data
  const { data: stats, isLoading } = useQuery<Stats>({
    queryKey: ['/api/stats'],
  });

  // Mock data for weekly select
  const weekOptions = ['This Week', 'Last Week', '2 Weeks Ago', '3 Weeks Ago'];
  const monthOptions = ['Past Month', 'Past 3 Months', 'Past 6 Months', 'Past Year'];

  // Container animation
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  // Generate days of the week for streak display
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 0 });
  const dayLabels = Array.from({ length: 7 }, (_, i) => format(addDays(weekStart, i), 'EEE'));

  // Mock streak data - would be replaced with actual data in a production app
  const streakData = [
    { day: 'Mon', active: true },
    { day: 'Tue', active: true },
    { day: 'Wed', active: true },
    { day: 'Thu', active: false },
    { day: 'Fri', active: true },
    { day: 'Sat', active: true },
    { day: 'Sun', active: true, partial: true }
  ];

  return (
    <main className="flex-1 overflow-auto">
      <div className="container mx-auto p-4 pb-24">
        <motion.div 
          className="mb-6"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <h2 className="text-2xl font-bold">Progress Tracker</h2>
          <p className="text-dark-100 dark:text-light-300">Monitor your study performance and habits</p>
        </motion.div>
        
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {/* Summary Stats */}
          <motion.div 
            className="bg-white dark:bg-dark-500 rounded-xl p-4 shadow-card"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <h3 className="text-lg font-semibold mb-3">Study Summary</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Weekly Goal</span>
                  <span>{isLoading ? '0/0' : `${stats?.totalStudyHours.toFixed(1) || '0'}/20 hours`}</span>
                </div>
                <div className="w-full bg-light-300 dark:bg-dark-400 rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full" 
                    style={{ width: isLoading ? '0%' : `${Math.min((stats?.totalStudyHours || 0) / 20 * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Task Completion</span>
                  <span>{isLoading ? '0/0' : `${stats?.completedTasks || '0'}/${stats?.totalTasks || '0'} tasks`}</span>
                </div>
                <div className="w-full bg-light-300 dark:bg-dark-400 rounded-full h-2">
                  <div 
                    className="bg-secondary h-2 rounded-full" 
                    style={{ width: isLoading || stats?.totalTasks === 0 ? '0%' : `${(stats?.completedTasks || 0) / (stats?.totalTasks || 1) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Study Consistency</span>
                  <span>5/7 days</span>
                </div>
                <div className="w-full bg-light-300 dark:bg-dark-400 rounded-full h-2">
                  <div className="bg-warning h-2 rounded-full" style={{ width: '71.4%' }}></div>
                </div>
              </div>
              
              <div className="pt-2 border-t border-light-300 dark:border-dark-300">
                <div className="flex justify-between font-medium mb-2">
                  <span>Current Streak</span>
                  <span className="text-secondary">{isLoading ? '0' : `${stats?.streak || '0'} Days`}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Longest Streak</span>
                  <span>14 Days</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Average Daily Study</span>
                  <span>{isLoading || !stats?.dailyStats || stats.dailyStats.length === 0 
                    ? '0h' 
                    : `${(stats.dailyStats.reduce((acc, day) => acc + day.minutes, 0) / stats.dailyStats.length / 60).toFixed(1)}h`}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Subject Distribution */}
          <motion.div 
            className="bg-white dark:bg-dark-500 rounded-xl p-4 shadow-card"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="text-lg font-semibold mb-3">Subject Distribution</h3>
            {isLoading ? (
              <div className="flex justify-center items-center h-48">
                <p>Loading subject distribution...</p>
              </div>
            ) : stats?.subjectDistribution && stats.subjectDistribution.length > 0 ? (
              <>
                <SubjectDistributionChart data={stats.subjectDistribution} height={190} />
                <div className="space-y-2 text-sm mt-2">
                  {stats.subjectDistribution.map((subject, index) => (
                    <div key={index} className="flex items-center">
                      <div 
                        className={`w-3 h-3 rounded-full mr-2 ${
                          index === 0 ? 'bg-primary' :
                          index === 1 ? 'bg-secondary' :
                          index === 2 ? 'bg-warning' :
                          index === 3 ? 'bg-info' :
                          'bg-danger'
                        }`}
                      ></div>
                      <div className="flex justify-between w-full">
                        <span>{subject.subject}</span>
                        <span>{subject.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex justify-center items-center h-48 text-dark-100 dark:text-light-300">
                <p>No subject data available</p>
              </div>
            )}
          </motion.div>
          
          {/* Study Streak */}
          <motion.div 
            className="bg-white dark:bg-dark-500 rounded-xl p-4 shadow-card"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-lg font-semibold mb-3">Study Streak</h3>
            <div className="grid grid-cols-7 gap-2 mb-4">
              {/* Last 7 days heat map */}
              {streakData.map((day, index) => (
                <div key={index} className="text-center">
                  <div className="text-xs text-dark-100 dark:text-light-300 mb-1">{day.day}</div>
                  <div className={`w-full aspect-square rounded-lg ${
                    day.active 
                      ? day.partial ? 'bg-secondary opacity-50' : 'bg-secondary' 
                      : 'bg-light-300 dark:bg-dark-400'
                  }`}></div>
                </div>
              ))}
            </div>
            
            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <p>Loading daily study time...</p>
              </div>
            ) : stats?.dailyStats && stats.dailyStats.length > 0 ? (
              <DailyStudyTimeChart data={stats.dailyStats} height={140} />
            ) : (
              <div className="flex justify-center items-center h-40 text-dark-100 dark:text-light-300">
                <p>No daily study data available</p>
              </div>
            )}
            
            <div className="flex justify-between text-sm mt-3">
              <div className="text-center">
                <div className="font-medium text-xl">{isLoading ? '0' : stats?.streak || '0'}</div>
                <div className="text-dark-100 dark:text-light-300">Current Streak</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-xl">14</div>
                <div className="text-dark-100 dark:text-light-300">Best Streak</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-xl">75%</div>
                <div className="text-dark-100 dark:text-light-300">Consistency</div>
              </div>
            </div>
          </motion.div>
        </motion.div>
        
        {/* Time Tracking and Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weekly Progress */}
          <motion.div 
            className="bg-white dark:bg-dark-500 rounded-xl p-4 shadow-card"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold">Weekly Progress</h3>
              <Select defaultValue={weekOptions[0]}>
                <SelectTrigger className="w-36 h-8 text-sm">
                  <SelectValue placeholder="Select Week" />
                </SelectTrigger>
                <SelectContent>
                  {weekOptions.map(option => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <p>Loading weekly progress...</p>
              </div>
            ) : stats?.dailyStats && stats.dailyStats.length > 0 ? (
              <WeeklyProgressChart data={stats.dailyStats} height={250} />
            ) : (
              <div className="flex justify-center items-center h-64 text-dark-100 dark:text-light-300">
                <p>No weekly progress data available</p>
              </div>
            )}
          </motion.div>
          
          {/* Productivity Analysis */}
          <motion.div 
            className="bg-white dark:bg-dark-500 rounded-xl p-4 shadow-card"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold">Productivity Analysis</h3>
              <Select defaultValue={monthOptions[0]}>
                <SelectTrigger className="w-36 h-8 text-sm">
                  <SelectValue placeholder="Select Period" />
                </SelectTrigger>
                <SelectContent>
                  {monthOptions.map(option => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-light-200 dark:bg-dark-400 p-3 rounded-lg">
                <div className="text-sm text-dark-100 dark:text-light-300">Peak Study Time</div>
                <div className="font-medium">9:00 AM - 11:00 AM</div>
              </div>
              <div className="bg-light-200 dark:bg-dark-400 p-3 rounded-lg">
                <div className="text-sm text-dark-100 dark:text-light-300">Most Productive Day</div>
                <div className="font-medium">Tuesday</div>
              </div>
              <div className="bg-light-200 dark:bg-dark-400 p-3 rounded-lg">
                <div className="text-sm text-dark-100 dark:text-light-300">Avg. Session Length</div>
                <div className="font-medium">1.8 hours</div>
              </div>
              <div className="bg-light-200 dark:bg-dark-400 p-3 rounded-lg">
                <div className="text-sm text-dark-100 dark:text-light-300">Task Efficiency</div>
                <div className="font-medium">72%</div>
              </div>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <p>Loading productivity trends...</p>
              </div>
            ) : stats?.dailyStats ? (
              <ProductivityTrendsChart data={stats.dailyStats} height={160} />
            ) : (
              <div className="flex justify-center items-center h-40 text-dark-100 dark:text-light-300">
                <p>No productivity data available</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </main>
  );
};

export default Progress;
