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
      className="bg-white dark:bg-dark-500 rounded-xl p-4 shadow-card"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-dark-100 dark:text-light-300 text-sm">{title}</p>
          <h3 className="text-2xl font-bold">{value}</h3>
          {trend && (
            <p className={`text-xs ${trend.isPositive ? 'text-secondary' : 'text-warning'}`}>
              {trend.isPositive ? (
                <ArrowUpIcon className="inline h-3 w-3 mr-1" />
              ) : (
                <ArrowDownIcon className="inline h-3 w-3 mr-1" />
              )}
              {trend.value}
            </p>
          )}
        </div>
        <div className={`${iconBgColor} p-2 rounded-lg`}>
          <div className={`${iconColor}`}>{icon}</div>
        </div>
      </div>
    </motion.div>
  );
};

export default StatsCard;
