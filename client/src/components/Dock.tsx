import { useLocation, Link } from 'wouter';
import { motion } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { 
  HomeIcon, 
  CalendarIcon, 
  ListChecksIcon, 
  StickyNoteIcon, 
  LineChartIcon, 
  SettingsIcon 
} from 'lucide-react';

const Dock = () => {
  const [location] = useLocation();
  const { setActiveSection } = useApp();
  
  const navigationItems = [
    { path: '/', icon: HomeIcon, label: 'Dashboard' },
    { path: '/calendar', icon: CalendarIcon, label: 'Calendar' },
    { path: '/tasks', icon: ListChecksIcon, label: 'Tasks' },
    { path: '/notes', icon: StickyNoteIcon, label: 'Notes' },
    { path: '/progress', icon: LineChartIcon, label: 'Progress' },
    { path: '/settings', icon: SettingsIcon, label: 'Settings' }
  ];
  
  return (
    <motion.div 
      className="dock fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white dark:bg-dark-500 rounded-2xl shadow-dock p-2 flex space-x-2 z-50"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      {navigationItems.map((item) => {
        const isActive = location === item.path;
        
        return (
          <Link 
            key={item.path} 
            href={item.path}
            onClick={() => setActiveSection(item.path)}
          >
            <motion.button
              className={`dock-item w-12 h-12 flex items-center justify-center rounded-xl ${
                isActive 
                  ? 'bg-primary text-white' 
                  : 'hover:bg-light-200 dark:hover:bg-dark-400 text-dark-100 dark:text-light-300'
              }`}
              whileHover={{ scale: 1.2 }}
              aria-label={item.label}
              title={item.label}
            >
              <item.icon className="w-5 h-5" />
            </motion.button>
          </Link>
        );
      })}
    </motion.div>
  );
};

export default Dock;
