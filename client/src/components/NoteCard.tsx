import { motion } from 'framer-motion';
import { Note } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { EditIcon, TrashIcon } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { toast } from '@/hooks/use-toast';

interface NoteCardProps {
  note: Note;
}

const NoteCard = ({ note }: NoteCardProps) => {
  const queryClient = useQueryClient();
  
  // Delete note mutation
  const deleteNoteMutation = useMutation({
    mutationFn: () => {
      return apiRequest('DELETE', `/api/notes/${note.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notes'] });
      toast({
        title: "Note deleted",
        description: `"${note.title}" has been removed`,
        variant: "default",
      });
    },
    onError: () => {
      toast({
        title: "Failed to delete note",
        description: "Please try again later",
        variant: "destructive",
      });
    }
  });
  
  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete "${note.title}"?`)) {
      deleteNoteMutation.mutate();
    }
  };
  
  const relativeTime = note.updatedAt 
    ? formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })
    : formatDistanceToNow(new Date(note.createdAt), { addSuffix: true });
  
  return (
    <motion.div 
      className="task-item p-4 bg-light-200 dark:bg-dark-400 rounded-lg"
      whileHover={{ y: -2, boxShadow: '0 6px 8px -1px rgba(0, 0, 0, 0.1), 0 4px 6px -1px rgba(0, 0, 0, 0.06)' }}
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
    >
      <div className="flex justify-between items-start">
        <h4 className="font-medium">{note.title}</h4>
        <div className="flex space-x-1">
          <button 
            className="text-dark-100 dark:text-light-300 hover:text-primary"
            aria-label="Edit note"
          >
            <EditIcon className="h-4 w-4" />
          </button>
          <button 
            className="text-dark-100 dark:text-light-300 hover:text-danger"
            onClick={handleDelete}
            aria-label="Delete note"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
      <p className="text-sm text-dark-100 dark:text-light-300 mt-2 line-clamp-3">
        {note.content}
      </p>
      <div className="flex justify-between items-center mt-3">
        <span className="text-xs text-dark-100 dark:text-light-300">{relativeTime}</span>
        {note.subject && (
          <span className="px-2 py-1 bg-primary bg-opacity-10 text-primary text-xs rounded-full">
            {note.subject}
          </span>
        )}
      </div>
    </motion.div>
  );
};

export default NoteCard;
