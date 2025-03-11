import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Task } from '@/types';
import { FilterIcon, PlusIcon } from 'lucide-react';
import TaskItem from '@/components/TaskItem';
import { apiRequest } from '@/lib/queryClient';
import { toast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Checkbox } from "@/components/ui/checkbox";
import { format, formatDistanceToNow } from 'date-fns';

const taskFormSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().optional(),
  dueDate: z.coerce.date().optional().nullable(),
  priority: z.enum(["high", "medium", "low"]),
  subject: z.string().optional(),
  userId: z.number().default(1), // Default user ID
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

const Tasks = () => {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    priority: {
      high: true,
      medium: true,
      low: true,
      completed: true
    },
    dueDate: "all",
    subject: "all"
  });

  const queryClient = useQueryClient();

  // Fetch tasks
  const { data: tasks, isLoading } = useQuery<Task[]>({
    queryKey: ['/api/tasks'],
  });

  // Add new task mutation
  const createTaskMutation = useMutation({
    mutationFn: (data: TaskFormValues) => {
      return apiRequest('POST', '/api/tasks', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      setIsDialogOpen(false);
      form.reset();
      toast({
        title: "Task created",
        description: "Your new task has been created successfully",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to create task",
        description: `Error: ${error}`,
        variant: "destructive",
      });
    }
  });

  // Form for adding new tasks
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: "",
      description: "",
      dueDate: null,
      priority: "medium",
      subject: ""
    }
  });

  const onSubmit = (values: TaskFormValues) => {
    createTaskMutation.mutate(values);
  };

  // Filter tasks based on active tab and filters
  const filteredTasks = tasks?.filter(task => {
    // Filter by tab
    if (activeTab === "today") {
      if (!task.dueDate) return false;
      const today = new Date();
      const dueDate = new Date(task.dueDate);
      if (dueDate.toDateString() !== today.toDateString()) return false;
    } else if (activeTab === "upcoming") {
      if (!task.dueDate) return false;
      const today = new Date();
      const dueDate = new Date(task.dueDate);
      if (dueDate <= today) return false;
    } else if (activeTab === "completed") {
      if (task.status !== "completed") return false;
    }

    // Apply filters
    if (!selectedFilters.priority[task.status === "completed" ? "completed" : task.priority]) return false;

    if (selectedFilters.dueDate !== "all" && task.dueDate) {
      const dueDate = new Date(task.dueDate);
      const today = new Date();
      
      if (selectedFilters.dueDate === "today" && dueDate.toDateString() !== today.toDateString()) return false;
      
      if (selectedFilters.dueDate === "thisWeek") {
        const endOfWeek = new Date();
        endOfWeek.setDate(today.getDate() + (7 - today.getDay()));
        if (dueDate > endOfWeek || dueDate < today) return false;
      }
      
      if (selectedFilters.dueDate === "thisMonth") {
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        if (dueDate > endOfMonth || dueDate < today) return false;
      }
    }

    if (selectedFilters.subject !== "all" && task.subject !== selectedFilters.subject) return false;

    return true;
  });

  // Calculate task stats
  const completedTaskCount = tasks?.filter(task => task.status === "completed").length || 0;
  const totalTaskCount = tasks?.length || 0;
  const completionRate = totalTaskCount > 0 ? Math.round((completedTaskCount / totalTaskCount) * 100) : 0;

  // Calculate priority distribution
  const priorityCounts = {
    high: tasks?.filter(task => task.priority === "high" && task.status !== "completed").length || 0,
    medium: tasks?.filter(task => task.priority === "medium" && task.status !== "completed").length || 0,
    low: tasks?.filter(task => task.priority === "low" && task.status !== "completed").length || 0
  };

  const totalPriorityCounts = priorityCounts.high + priorityCounts.medium + priorityCounts.low;
  const priorityDistribution = {
    high: totalPriorityCounts > 0 ? Math.round((priorityCounts.high / totalPriorityCounts) * 100) : 0,
    medium: totalPriorityCounts > 0 ? Math.round((priorityCounts.medium / totalPriorityCounts) * 100) : 0,
    low: totalPriorityCounts > 0 ? Math.round((priorityCounts.low / totalPriorityCounts) * 100) : 0
  };

  // Handle filter changes
  const handlePriorityFilterChange = (priority: string) => {
    setSelectedFilters(prev => ({
      ...prev,
      priority: {
        ...prev.priority,
        [priority]: !prev.priority[priority as keyof typeof prev.priority]
      }
    }));
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

  const subjects = [
    { label: "All Subjects", value: "all" },
    { label: "Physics", value: "Physics" },
    { label: "Mathematics", value: "Mathematics" },
    { label: "Chemistry", value: "Chemistry" },
    { label: "Literature", value: "Literature" },
    { label: "History", value: "History" }
  ];

  const dueDateOptions = [
    { label: "All", value: "all" },
    { label: "Today", value: "today" },
    { label: "This Week", value: "thisWeek" },
    { label: "This Month", value: "thisMonth" }
  ];

  return (
    <main className="flex-1 overflow-auto">
      <div className="container mx-auto p-4 pb-24">
        <motion.div 
          className="mb-6"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <h2 className="text-2xl font-bold">Tasks</h2>
          <p className="text-dark-100 dark:text-light-300">Manage your study assignments and deadlines</p>
        </motion.div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Task Lists */}
          <div className="lg:col-span-3">
            <motion.div 
              className="bg-white dark:bg-dark-500 rounded-xl p-4 shadow-card"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex justify-between items-center mb-4">
                <div className="flex space-x-4">
                  <button 
                    className={`px-3 py-1 rounded-lg text-sm ${activeTab === "all" ? "bg-primary text-white" : "hover:bg-light-200 dark:hover:bg-dark-400"}`}
                    onClick={() => setActiveTab("all")}
                  >
                    All Tasks
                  </button>
                  <button 
                    className={`px-3 py-1 rounded-lg text-sm ${activeTab === "today" ? "bg-primary text-white" : "hover:bg-light-200 dark:hover:bg-dark-400"}`}
                    onClick={() => setActiveTab("today")}
                  >
                    Today
                  </button>
                  <button 
                    className={`px-3 py-1 rounded-lg text-sm ${activeTab === "upcoming" ? "bg-primary text-white" : "hover:bg-light-200 dark:hover:bg-dark-400"}`}
                    onClick={() => setActiveTab("upcoming")}
                  >
                    Upcoming
                  </button>
                  <button 
                    className={`px-3 py-1 rounded-lg text-sm ${activeTab === "completed" ? "bg-primary text-white" : "hover:bg-light-200 dark:hover:bg-dark-400"}`}
                    onClick={() => setActiveTab("completed")}
                  >
                    Completed
                  </button>
                </div>
                <div>
                  <button 
                    className="px-3 py-1 bg-primary text-white rounded-lg text-sm flex items-center"
                    onClick={() => setIsDialogOpen(true)}
                  >
                    <PlusIcon className="h-4 w-4 mr-1" /> New Task
                  </button>
                </div>
              </div>
              
              {isLoading ? (
                <div className="flex justify-center items-center h-60">
                  <p>Loading tasks...</p>
                </div>
              ) : filteredTasks && filteredTasks.length > 0 ? (
                <motion.div 
                  className="space-y-3"
                  variants={container}
                  initial="hidden"
                  animate="show"
                >
                  {filteredTasks.map((task) => (
                    <TaskItem key={task.id} task={task} />
                  ))}
                </motion.div>
              ) : (
                <div className="flex flex-col justify-center items-center h-60 text-dark-100 dark:text-light-300">
                  <p>No tasks found</p>
                  <button 
                    className="mt-4 p-2 border border-primary text-primary rounded-lg text-sm font-medium hover:bg-primary hover:text-white transition duration-200"
                    onClick={() => setIsDialogOpen(true)}
                  >
                    Add New Task
                  </button>
                </div>
              )}
            </motion.div>
          </div>
          
          {/* Task Filters & Stats */}
          <div>
            <motion.div 
              className="bg-white dark:bg-dark-500 rounded-xl p-4 shadow-card mb-6"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-lg font-semibold mb-3">Filters</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <Checkbox 
                      checked={selectedFilters.priority.high}
                      onCheckedChange={() => handlePriorityFilterChange("high")}
                      className="mr-2"
                    />
                    <span>High Priority</span>
                  </label>
                  <span className="text-xs bg-danger bg-opacity-10 text-danger px-2 py-1 rounded-full">
                    {priorityCounts.high}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <Checkbox 
                      checked={selectedFilters.priority.medium}
                      onCheckedChange={() => handlePriorityFilterChange("medium")}
                      className="mr-2"
                    />
                    <span>Medium Priority</span>
                  </label>
                  <span className="text-xs bg-warning bg-opacity-10 text-warning px-2 py-1 rounded-full">
                    {priorityCounts.medium}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <Checkbox 
                      checked={selectedFilters.priority.low}
                      onCheckedChange={() => handlePriorityFilterChange("low")}
                      className="mr-2"
                    />
                    <span>Low Priority</span>
                  </label>
                  <span className="text-xs bg-info bg-opacity-10 text-info px-2 py-1 rounded-full">
                    {priorityCounts.low}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <Checkbox 
                      checked={selectedFilters.priority.completed}
                      onCheckedChange={() => handlePriorityFilterChange("completed")}
                      className="mr-2"
                    />
                    <span>Completed</span>
                  </label>
                  <span className="text-xs bg-secondary bg-opacity-10 text-secondary px-2 py-1 rounded-full">
                    {completedTaskCount}
                  </span>
                </div>
                
                <div className="pt-2 border-t mt-2">
                  <label className="block mb-2 text-sm font-medium">Due Date</label>
                  <Select 
                    value={selectedFilters.dueDate}
                    onValueChange={(value) => setSelectedFilters(prev => ({ ...prev, dueDate: value }))}
                  >
                    <SelectTrigger className="w-full bg-light-200 dark:bg-dark-400">
                      <SelectValue placeholder="Select due date filter" />
                    </SelectTrigger>
                    <SelectContent>
                      {dueDateOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="pt-2">
                  <label className="block mb-2 text-sm font-medium">Subject</label>
                  <Select 
                    value={selectedFilters.subject}
                    onValueChange={(value) => setSelectedFilters(prev => ({ ...prev, subject: value }))}
                  >
                    <SelectTrigger className="w-full bg-light-200 dark:bg-dark-400">
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map(subject => (
                        <SelectItem key={subject.value} value={subject.value}>
                          {subject.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              className="bg-white dark:bg-dark-500 rounded-xl p-4 shadow-card"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="text-lg font-semibold mb-3">Task Stats</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Completion Rate</span>
                    <span>{completionRate}%</span>
                  </div>
                  <div className="w-full bg-light-300 dark:bg-dark-400 rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: `${completionRate}%` }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Priority Distribution</span>
                  </div>
                  <div className="flex h-4 rounded-lg overflow-hidden">
                    <div className="bg-danger h-full" style={{ width: `${priorityDistribution.high}%` }}></div>
                    <div className="bg-warning h-full" style={{ width: `${priorityDistribution.medium}%` }}></div>
                    <div className="bg-info h-full" style={{ width: `${priorityDistribution.low}%` }}></div>
                  </div>
                  <div className="flex text-xs justify-between mt-1 px-1">
                    <span>High</span>
                    <span>Medium</span>
                    <span>Low</span>
                  </div>
                </div>
                
                <div className="pt-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Total Tasks</span>
                    <span>{totalTaskCount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Completed</span>
                    <span>{completedTaskCount}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Add New Task Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
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
                      <Input placeholder="Task title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Task description (optional)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date</FormLabel>
                    <FormControl>
                      <Input 
                        type="datetime-local" 
                        value={field.value ? new Date(field.value).toISOString().slice(0, 16) : ''} 
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value ? new Date(value) : null);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select subject (optional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {subjects.filter(s => s.value !== "all").map(subject => (
                          <SelectItem key={subject.value} value={subject.value}>
                            {subject.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="submit" disabled={createTaskMutation.isPending}>
                  {createTaskMutation.isPending ? "Adding..." : "Add Task"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </main>
  );
};

export default Tasks;
