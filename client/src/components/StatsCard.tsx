import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { ArrowUpIcon, ArrowDownIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  iconBgColor: string;
  iconColor: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

const StatsCard = ({ title, value, icon, iconBgColor, iconColor, trend }: StatsCardProps) => {
  return (
    <motion.div 
      className="bg-white dark:bg-dark-500 rounded-xl p-5 shadow-card hover:shadow-lg transition-all duration-300 cursor-default"
      whileHover={{ 
        y: -5, 
        transition: { type: 'spring', stiffness: 300, damping: 10 } 
      }}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-dark-100 dark:text-light-300 text-sm font-medium">{title}</p>
          <motion.h3 
            className="text-2xl font-bold mt-1"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 100 }}
          >
            {value}
          </motion.h3>
          {trend && (
            <motion.p 
              className={`text-xs mt-1 ${trend.isPositive ? 'text-secondary' : 'text-warning'}`}
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              {trend.isPositive ? (
                <ArrowUpIcon className="inline h-3 w-3 mr-1" />
              ) : (
                <ArrowDownIcon className="inline h-3 w-3 mr-1" />
              )}
              {trend.value}
            </motion.p>
          )}
        </div>
        <motion.div 
          className={`${iconBgColor} p-3 rounded-xl`}
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ 
            type: 'spring', 
            stiffness: 260, 
            damping: 20,
            delay: 0.1 
          }}
          whileHover={{ 
            rotate: 5,
            scale: 1.1, 
            transition: { duration: 0.2 } 
          }}
        >
          <div className={`${iconColor}`}>{icon}</div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default StatsCard;
