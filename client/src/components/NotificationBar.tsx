import { motion, AnimatePresence } from 'framer-motion';
import { XIcon, BellIcon, CheckIcon, AlertTriangleIcon } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { formatDistanceToNow } from 'date-fns';

interface NotificationBarProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationBar = ({ isOpen, onClose }: NotificationBarProps) => {
  const { notifications, dismissNotification } = useApp();
  
  // Group notifications by day
  const todayNotifications = notifications.filter(
    note => new Date(note.timestamp).toDateString() === new Date().toDateString()
  );
  
  const earlierNotifications = notifications.filter(
    note => new Date(note.timestamp).toDateString() !== new Date().toDateString()
  );
  
  // Get icon based on notification type
  const getIcon = (type: string) => {
    switch (type) {
      case 'reminder':
        return <BellIcon className="h-4 w-4" />;
      case 'success':
        return <CheckIcon className="h-4 w-4" />;
      case 'warning':
        return <AlertTriangleIcon className="h-4 w-4" />;
      default:
        return <BellIcon className="h-4 w-4" />;
    }
  };
  
  // Get background color based on notification type
  const getBackgroundColor = (type: string) => {
    switch (type) {
      case 'reminder':
        return 'bg-primary';
      case 'success':
        return 'bg-secondary';
      case 'warning':
        return 'bg-warning';
      default:
        return 'bg-primary';
    }
  };
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="notification-panel absolute top-0 left-0 right-0 bg-white dark:bg-dark-500 shadow-lg z-50"
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <div className="container mx-auto p-4">
            <div className="flex justify-between items-center border-b border-light-300 dark:border-dark-300 pb-2">
              <h2 className="text-lg font-semibold">Notifications</h2>
              <button 
                onClick={onClose}
                className="text-dark-100 dark:text-light-300 hover:text-dark-300 dark:hover:text-light-100"
                aria-label="Close notifications"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>
            
            <div className="py-2 space-y-3">
              {todayNotifications.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-dark-100 dark:text-light-300 mb-2">Today</h3>
                  
                  {todayNotifications.map((notification) => (
                    <div 
                      key={notification.id}
                      className="bg-light-200 dark:bg-dark-400 rounded-lg p-3 flex items-start space-x-3 mb-2"
                    >
                      <div className={`${getBackgroundColor(notification.type)} rounded-full p-2 text-white text-sm`}>
                        {getIcon(notification.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <h4 className="font-medium">{notification.title}</h4>
                          <span className="text-dark-100 dark:text-light-300 text-xs">
                            {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-sm text-dark-200 dark:text-light-300">{notification.message}</p>
                      </div>
                      <button 
                        className="text-dark-100 dark:text-light-300 hover:text-primary"
                        onClick={() => dismissNotification(notification.id)}
                        aria-label="Dismiss notification"
                      >
                        <XIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              {earlierNotifications.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-dark-100 dark:text-light-300 mb-2">Earlier</h3>
                  
                  {earlierNotifications.map((notification) => (
                    <div 
                      key={notification.id}
                      className="bg-light-200 dark:bg-dark-400 rounded-lg p-3 flex items-start space-x-3 mb-2"
                    >
                      <div className={`${getBackgroundColor(notification.type)} rounded-full p-2 text-white text-sm`}>
                        {getIcon(notification.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <h4 className="font-medium">{notification.title}</h4>
                          <span className="text-dark-100 dark:text-light-300 text-xs">
                            {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-sm text-dark-200 dark:text-light-300">{notification.message}</p>
                      </div>
                      <button 
                        className="text-dark-100 dark:text-light-300 hover:text-primary"
                        onClick={() => dismissNotification(notification.id)}
                        aria-label="Dismiss notification"
                      >
                        <XIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              {notifications.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-dark-100 dark:text-light-300">No notifications</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NotificationBar;
