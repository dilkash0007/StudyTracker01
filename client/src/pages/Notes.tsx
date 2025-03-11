import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Note } from '@/types';
import { PlusIcon, FolderIcon, SearchIcon } from 'lucide-react';
import NoteCard from '@/components/NoteCard';
import { apiRequest } from '@/lib/queryClient';
import { toast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const noteFormSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  content: z.string().optional(),
  subject: z.string().optional(),
  tags: z.array(z.string()).optional(),
  userId: z.number().default(1), // Default user ID
});

type NoteFormValues = z.infer<typeof noteFormSchema>;

// Predefined folders and tags
const folders = [
  { id: 'all', label: 'All Notes' },
  { id: 'Physics', label: 'Physics' },
  { id: 'Mathematics', label: 'Mathematics' },
  { id: 'Chemistry', label: 'Chemistry' },
  { id: 'Literature', label: 'Literature' }
];

const predefinedTags = [
  { id: 'important', label: '#important' },
  { id: 'formulas', label: '#formulas' },
  { id: 'exam', label: '#exam' },
  { id: 'lab', label: '#lab' },
  { id: 'research', label: '#research' }
];

const Notes = () => {
  const [activeFolder, setActiveFolder] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  const queryClient = useQueryClient();

  // Fetch notes
  const { data: notes, isLoading } = useQuery<Note[]>({
    queryKey: ['/api/notes'],
  });

  // Add new note mutation
  const createNoteMutation = useMutation({
    mutationFn: (data: NoteFormValues) => {
      return apiRequest('POST', '/api/notes', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notes'] });
      setIsDialogOpen(false);
      form.reset();
      toast({
        title: "Note created",
        description: "Your new note has been created successfully",
        variant: "success",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to create note",
        description: `Error: ${error}`,
        variant: "destructive",
      });
    }
  });

  // Form for adding new notes
  const form = useForm<NoteFormValues>({
    resolver: zodResolver(noteFormSchema),
    defaultValues: {
      title: "",
      content: "",
      subject: "",
      tags: []
    }
  });

  const onSubmit = (values: NoteFormValues) => {
    // Include selected tags
    values.tags = selectedTags;
    createNoteMutation.mutate(values);
  };

  // Filter notes based on active folder, search query, and selected tags
  const filteredNotes = notes?.filter(note => {
    // Filter by folder (subject)
    if (activeFolder !== 'all' && note.subject !== activeFolder) return false;

    // Filter by search query
    if (searchQuery && !note.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !note.content?.toLowerCase().includes(searchQuery.toLowerCase())) return false;

    return true;
  });

  // Toggle tag selection
  const toggleTag = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      setSelectedTags(prev => prev.filter(tag => tag !== tagId));
    } else {
      setSelectedTags(prev => [...prev, tagId]);
    }
  };

  // Container animation
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
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
        >
          <h2 className="text-2xl font-bold">Notes</h2>
          <p className="text-dark-100 dark:text-light-300">Organize and manage your study notes</p>
        </motion.div>
        
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <motion.div 
              className="bg-white dark:bg-dark-500 rounded-xl p-4 shadow-card"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Folders</h3>
                <button className="text-primary hover:text-primary-dark">
                  <PlusIcon className="h-5 w-5" />
                </button>
              </div>
              
              <div className="space-y-1">
                {folders.map(folder => (
                  <button 
                    key={folder.id}
                    className={`w-full text-left p-2 rounded-lg flex items-center ${
                      activeFolder === folder.id 
                        ? 'bg-primary text-white' 
                        : 'hover:bg-light-200 dark:hover:bg-dark-400'
                    }`}
                    onClick={() => setActiveFolder(folder.id)}
                  >
                    <FolderIcon className="h-4 w-4 mr-2" /> {folder.label}
                  </button>
                ))}
              </div>
              
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {predefinedTags.map(tag => (
                    <span 
                      key={tag.id}
                      className={`px-2 py-1 text-sm rounded-full cursor-pointer ${
                        selectedTags.includes(tag.id)
                          ? 'bg-primary bg-opacity-10 text-primary' 
                          : 'bg-light-200 dark:bg-dark-400'
                      }`}
                      onClick={() => toggleTag(tag.id)}
                    >
                      {tag.label}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
          
          {/* Notes List */}
          <div className="lg:col-span-4">
            <motion.div 
              className="bg-white dark:bg-dark-500 rounded-xl p-4 shadow-card"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex justify-between items-center mb-4">
                <div className="flex space-x-4">
                  <h3 className="text-lg font-semibold">{folders.find(f => f.id === activeFolder)?.label || 'All Notes'}</h3>
                  <div className="relative">
                    <Input 
                      type="text" 
                      placeholder="Search notes..." 
                      className="pl-8 pr-4 py-1 rounded-lg text-sm w-64"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <SearchIcon className="absolute left-3 top-2 h-4 w-4 text-dark-100" />
                  </div>
                </div>
                <Button 
                  onClick={() => setIsDialogOpen(true)}
                  size="sm"
                  className="bg-primary text-white"
                >
                  <PlusIcon className="h-4 w-4 mr-1" /> New Note
                </Button>
              </div>
              
              {isLoading ? (
                <div className="flex justify-center items-center h-60">
                  <p>Loading notes...</p>
                </div>
              ) : filteredNotes && filteredNotes.length > 0 ? (
                <motion.div 
                  className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
                  variants={container}
                  initial="hidden"
                  animate="show"
                >
                  {filteredNotes.map((note) => (
                    <NoteCard key={note.id} note={note} />
                  ))}
                </motion.div>
              ) : (
                <div className="flex flex-col justify-center items-center h-60 text-dark-100 dark:text-light-300">
                  <p>No notes found</p>
                  <Button 
                    onClick={() => setIsDialogOpen(true)}
                    className="mt-4"
                    variant="outline"
                  >
                    Add New Note
                  </Button>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Add New Note Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Add New Note</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Note title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Note content" 
                        {...field} 
                        className="min-h-[150px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject</FormLabel>
                    <FormControl>
                      <select
                        className="w-full p-2 rounded-lg border border-light-300 dark:border-dark-300 bg-light-200 dark:bg-dark-400"
                        {...field}
                      >
                        <option value="">Select subject</option>
                        {folders.filter(f => f.id !== 'all').map(folder => (
                          <option key={folder.id} value={folder.id}>{folder.label}</option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div>
                <FormLabel>Tags</FormLabel>
                <div className="flex flex-wrap gap-2 mt-2">
                  {predefinedTags.map(tag => (
                    <span 
                      key={tag.id}
                      className={`px-2 py-1 text-sm rounded-full cursor-pointer ${
                        selectedTags.includes(tag.id)
                          ? 'bg-primary bg-opacity-10 text-primary' 
                          : 'bg-light-200 dark:bg-dark-400'
                      }`}
                      onClick={() => toggleTag(tag.id)}
                    >
                      {tag.label}
                    </span>
                  ))}
                </div>
              </div>
              
              <DialogFooter>
                <Button type="submit" disabled={createNoteMutation.isPending}>
                  {createNoteMutation.isPending ? "Creating..." : "Create Note"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </main>
  );
};

export default Notes;
