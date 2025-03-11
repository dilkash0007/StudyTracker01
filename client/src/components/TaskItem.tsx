import { motion } from 'framer-motion';
import { useState } from 'react';
import { Task } from '@/types';
import { format } from 'date-fns';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Checkbox } from '@/components/ui/checkbox';
import { EditIcon, TrashIcon } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface TaskItemProps {
  task: Task;
  showActions?: boolean;
}

const TaskItem = ({ task, showActions = true }: TaskItemProps) => {
  const [isChecked, setIsChecked] = useState(task.status === 'completed');
  const queryClient = useQueryClient();
  
  // Get badge color based on priority
  const getBadgeColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-danger bg-opacity-10 text-danger';
      case 'medium':
        return 'bg-warning bg-opacity-10 text-warning';
      case 'low':
        return 'bg-info bg-opacity-10 text-info';
      default:
        return 'bg-secondary bg-opacity-10 text-secondary';
    }
  };
  
  // Format due date
  const formatDueDate = (dueDate: Date | undefined) => {
    if (!dueDate) return 'No due date';
    
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    
    if (new Date(dueDate).toDateString() === today.toDateString()) {
      return `Due Today, ${format(new Date(dueDate), 'h:mm a')}`;
    } else if (new Date(dueDate).toDateString() === tomorrow.toDateString()) {
      return `Due Tomorrow, ${format(new Date(dueDate), 'h:mm a')}`;
    } else {
      return `Due ${format(new Date(dueDate), 'MMM d, yyyy')}`;
    }
  };
  
  // Update task status mutation
  const updateTaskMutation = useMutation({
    mutationFn: (data: Partial<Task>) => {
      return apiRequest('PATCH', `/api/tasks/${task.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      if (!isChecked) {
        toast({
          title: "Task completed",
          description: `"${task.title}" marked as complete`,
          variant: "success",
        });
      }
    },
    onError: () => {
      setIsChecked(!isChecked); // Revert UI state on error
      toast({
        title: "Failed to update task",
        description: "Please try again later",
        variant: "destructive",
      });
    }
  });
  
  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: () => {
      return apiRequest('DELETE', `/api/tasks/${task.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      toast({
        title: "Task deleted",
        description: `"${task.title}" has been removed`,
        variant: "default",
      });
    },
    onError: () => {
      toast({
        title: "Failed to delete task",
        description: "Please try again later",
        variant: "destructive",
      });
    }
  });
  
  const handleCheckboxChange = () => {
    const newStatus = !isChecked ? 'completed' : 'pending';
    setIsChecked(!isChecked);
    updateTaskMutation.mutate({ status: newStatus });
  };
  
  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete "${task.title}"?`)) {
      deleteTaskMutation.mutate();
    }
  };
  
  return (
    <motion.div 
      className={`task-item p-4 bg-white dark:bg-dark-500 rounded-xl shadow-sm ${task.status === 'completed' ? 'opacity-70' : ''}`}
      whileHover={{ 
        y: -3, 
        boxShadow: '0 8px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        transition: { type: 'spring', stiffness: 300, damping: 15 }
      }}
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-start gap-3">
          <Checkbox 
            checked={isChecked} 
            onCheckedChange={handleCheckboxChange}
            className="mt-1 h-4 w-4 rounded-sm"
          />
          <div>
            <h4 className={`font-medium ${task.status === 'completed' ? 'line-through text-dark-100 dark:text-light-400' : ''}`}>
              {task.title}
            </h4>
            {task.description && (
              <p className="text-xs text-dark-100 dark:text-light-300 mt-1 max-w-md">{task.description}</p>
            )}
            {task.subject && (
              <span className="inline-block mt-1.5 text-xs text-dark-100 dark:text-light-400 bg-light-300 dark:bg-dark-400 px-2 py-0.5 rounded">
                {task.subject}
              </span>
            )}
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 mt-2 sm:mt-0 ml-7 sm:ml-0">
          <span className={`px-2 py-1 text-xs font-medium ${getBadgeColor(task.priority)} rounded-full`}>
            {task.status === 'completed' ? 'Completed' : task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
          </span>
          {task.dueDate && (
            <span className="text-xs text-dark-100 dark:text-light-300 bg-light-100 dark:bg-dark-400 px-2 py-1 rounded-full">
              {formatDueDate(task.dueDate)}
            </span>
          )}
          {showActions && (
            <div className="flex space-x-2">
              {task.status !== 'completed' && (
                <motion.button 
                  className="text-dark-100 dark:text-light-300 hover:text-primary bg-light-100 dark:bg-dark-400 p-1.5 rounded-full"
                  aria-label="Edit task"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <EditIcon className="h-3.5 w-3.5" />
                </motion.button>
              )}
              <motion.button 
                className="text-dark-100 dark:text-light-300 hover:text-danger bg-light-100 dark:bg-dark-400 p-1.5 rounded-full"
                onClick={handleDelete}
                aria-label="Delete task"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <TrashIcon className="h-3.5 w-3.5" />
              </motion.button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default TaskItem;
