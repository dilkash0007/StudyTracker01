import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Settings as SettingsType } from '@/types';
import { apiRequest } from '@/lib/queryClient';
import { toast } from '@/hooks/use-toast';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const Settings = () => {
  const queryClient = useQueryClient();
  
  // Fetch user settings
  const { data: settings, isLoading } = useQuery<SettingsType>({
    queryKey: ['/api/settings'],
  });
  
  // Local state for form fields
  const [formData, setFormData] = useState({
    displayName: "Jamie Doe",
    email: "jamie.doe@example.com",
    password: "••••••••",
    theme: "dark",
    accentColor: "#007AFF",
    showAnimations: true,
    showTaskDueTimes: true,
    fontSize: "medium",
    notificationSettings: {
      studyReminders: true,
      taskDeadlines: true,
      progressUpdates: true,
      soundAlerts: false,
      notificationTime: "15 minutes before"
    }
  });
  
  // Update settings when data is loaded
  useState(() => {
    if (settings) {
      setFormData(prev => ({
        ...prev,
        theme: settings.theme,
        accentColor: settings.accentColor,
        showAnimations: settings.showAnimations,
        showTaskDueTimes: settings.showTaskDueTimes,
        fontSize: settings.fontSize,
        notificationSettings: settings.notificationSettings
      }));
    }
  });
  
  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: (data: Partial<SettingsType>) => {
      return apiRequest('POST', '/api/settings', {
        ...data,
        userId: 1 // Default user ID
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      toast({
        title: "Settings updated",
        description: "Your settings have been saved successfully",
        variant: "success",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to update settings",
        description: `Error: ${error}`,
        variant: "destructive",
      });
    }
  });
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle switch changes
  const handleSwitchChange = (name: string, checked: boolean) => {
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: checked
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: checked }));
    }
  };
  
  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  // Handle account form submission
  const handleAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Account updated",
      description: "Your account information has been updated",
      variant: "success",
    });
  };
  
  // Handle appearance form submission
  const handleAppearanceSubmit = () => {
    updateSettingsMutation.mutate({
      userId: 1,
      theme: formData.theme,
      accentColor: formData.accentColor,
      showAnimations: formData.showAnimations,
      showTaskDueTimes: formData.showTaskDueTimes,
      fontSize: formData.fontSize
    });
  };
  
  // Handle notification form submission
  const handleNotificationSubmit = () => {
    updateSettingsMutation.mutate({
      userId: 1,
      notificationSettings: formData.notificationSettings
    });
  };
  
  // Handle data export
  const handleExportData = () => {
    toast({
      title: "Data export initiated",
      description: "Your study data will be prepared for download",
      variant: "default",
    });
  };
  
  // Handle account deletion
  const handleDeleteAccount = () => {
    if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      toast({
        title: "Account deletion requested",
        description: "Your account will be deleted within 24 hours",
        variant: "destructive",
      });
    }
  };
  
  // Accent color options
  const accentColors = [
    { name: "Blue", value: "#007AFF" },
    { name: "Purple", value: "#5856D6" },
    { name: "Green", value: "#34C759" },
    { name: "Red", value: "#FF3B30" },
    { name: "Yellow", value: "#FFCC00" },
    { name: "Pink", value: "#FF2D55" }
  ];
  
  // Font size options
  const fontSizes = [
    { label: "Small", value: "small" },
    { label: "Medium", value: "medium" },
    { label: "Large", value: "large" }
  ];
  
  // Notification time options
  const notificationTimes = [
    { label: "5 minutes before", value: "5 minutes before" },
    { label: "15 minutes before", value: "15 minutes before" },
    { label: "30 minutes before", value: "30 minutes before" },
    { label: "1 hour before", value: "1 hour before" }
  ];
  
  return (
    <main className="flex-1 overflow-auto">
      <div className="container mx-auto p-4 pb-24">
        <motion.div 
          className="mb-6"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <h2 className="text-2xl font-bold">Settings</h2>
          <p className="text-dark-100 dark:text-light-300">Customize your study tracking experience</p>
        </motion.div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Account Settings */}
          <motion.div 
            className="bg-white dark:bg-dark-500 rounded-xl p-4 shadow-card"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="text-lg font-semibold mb-4">Account</h3>
            
            <div className="flex items-center mb-6">
              <Avatar className="w-16 h-16 mr-4">
                <AvatarFallback className="bg-primary text-white text-2xl font-medium">
                  JD
                </AvatarFallback>
              </Avatar>
              <div>
                <h4 className="font-medium">{formData.displayName}</h4>
                <p className="text-sm text-dark-100 dark:text-light-300">{formData.email}</p>
                <button className="text-primary text-sm mt-1">Change Profile Picture</button>
              </div>
            </div>
            
            <form onSubmit={handleAccountSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Display Name</label>
                <Input 
                  type="text" 
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleInputChange}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <Input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <Input 
                  type="password" 
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full"
                />
                <button className="text-primary text-sm mt-1">Change Password</button>
              </div>
              
              <Button 
                type="submit" 
                className="w-full mt-4"
              >
                Save Changes
              </Button>
            </form>
          </motion.div>
          
          {/* Appearance Settings */}
          <motion.div 
            className="bg-white dark:bg-dark-500 rounded-xl p-4 shadow-card"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-lg font-semibold mb-4">Appearance</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-3">Theme</label>
                <div className="grid grid-cols-3 gap-3">
                  <button 
                    className={`flex flex-col items-center p-3 rounded-lg border ${
                      formData.theme === 'light' 
                        ? 'border-primary' 
                        : 'border-light-300 dark:border-dark-300'
                    } bg-light-200 dark:bg-dark-400`}
                    onClick={() => handleSelectChange('theme', 'light')}
                  >
                    <div className="w-full h-10 bg-white rounded-md mb-2"></div>
                    <span className="text-sm">Light</span>
                  </button>
                  <button 
                    className={`flex flex-col items-center p-3 rounded-lg border ${
                      formData.theme === 'dark' 
                        ? 'border-primary' 
                        : 'border-light-300 dark:border-dark-300'
                    } bg-light-200 dark:bg-dark-400`}
                    onClick={() => handleSelectChange('theme', 'dark')}
                  >
                    <div className="w-full h-10 bg-dark-600 rounded-md mb-2"></div>
                    <span className="text-sm">Dark</span>
                  </button>
                  <button 
                    className={`flex flex-col items-center p-3 rounded-lg border ${
                      formData.theme === 'system' 
                        ? 'border-primary' 
                        : 'border-light-300 dark:border-dark-300'
                    } bg-light-200 dark:bg-dark-400`}
                    onClick={() => handleSelectChange('theme', 'system')}
                  >
                    <div className="w-full h-10 bg-gradient-to-r from-white to-dark-600 rounded-md mb-2"></div>
                    <span className="text-sm">System</span>
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Accent Color</label>
                <div className="flex space-x-3">
                  {accentColors.map((color) => (
                    <button 
                      key={color.value}
                      className={`w-8 h-8 rounded-full ${
                        formData.accentColor === color.value 
                          ? 'ring-2 ring-offset-2' 
                          : ''
                      }`}
                      style={{ backgroundColor: color.value, ringColor: color.value }}
                      onClick={() => handleSelectChange('accentColor', color.value)}
                      aria-label={`Set accent color to ${color.name}`}
                    />
                  ))}
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-sm">Show animations</label>
                  <Switch 
                    checked={formData.showAnimations} 
                    onCheckedChange={(checked) => handleSwitchChange('showAnimations', checked)}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-sm">Show task due times</label>
                  <Switch 
                    checked={formData.showTaskDueTimes} 
                    onCheckedChange={(checked) => handleSwitchChange('showTaskDueTimes', checked)}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Font Size</label>
                <Select 
                  value={formData.fontSize}
                  onValueChange={(value) => handleSelectChange('fontSize', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select font size" />
                  </SelectTrigger>
                  <SelectContent>
                    {fontSizes.map(size => (
                      <SelectItem key={size.value} value={size.value}>
                        {size.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                onClick={handleAppearanceSubmit}
                disabled={updateSettingsMutation.isPending}
                className="w-full mt-2"
              >
                {updateSettingsMutation.isPending ? "Saving..." : "Save Appearance Settings"}
              </Button>
            </div>
          </motion.div>
          
          {/* Notification Settings */}
          <motion.div 
            className="bg-white dark:bg-dark-500 rounded-xl p-4 shadow-card"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-lg font-semibold mb-4">Notifications</h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium">Study Reminders</label>
                  <Switch 
                    checked={formData.notificationSettings.studyReminders} 
                    onCheckedChange={(checked) => handleSwitchChange('notificationSettings.studyReminders', checked)}
                  />
                </div>
                <p className="text-xs text-dark-100 dark:text-light-300">Receive reminders before scheduled study sessions</p>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium">Task Deadlines</label>
                  <Switch 
                    checked={formData.notificationSettings.taskDeadlines} 
                    onCheckedChange={(checked) => handleSwitchChange('notificationSettings.taskDeadlines', checked)}
                  />
                </div>
                <p className="text-xs text-dark-100 dark:text-light-300">Receive alerts for upcoming task deadlines</p>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium">Progress Updates</label>
                  <Switch 
                    checked={formData.notificationSettings.progressUpdates} 
                    onCheckedChange={(checked) => handleSwitchChange('notificationSettings.progressUpdates', checked)}
                  />
                </div>
                <p className="text-xs text-dark-100 dark:text-light-300">Receive weekly summaries of your study progress</p>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium">Sound Alerts</label>
                  <Switch 
                    checked={formData.notificationSettings.soundAlerts} 
                    onCheckedChange={(checked) => handleSwitchChange('notificationSettings.soundAlerts', checked)}
                  />
                </div>
                <p className="text-xs text-dark-100 dark:text-light-300">Play sounds for notifications and timer completions</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Notification Time</label>
                <Select 
                  value={formData.notificationSettings.notificationTime}
                  onValueChange={(value) => handleSelectChange('notificationSettings.notificationTime', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select notification time" />
                  </SelectTrigger>
                  <SelectContent>
                    {notificationTimes.map(time => (
                      <SelectItem key={time.value} value={time.value}>
                        {time.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                onClick={handleNotificationSubmit}
                disabled={updateSettingsMutation.isPending}
                className="w-full"
              >
                {updateSettingsMutation.isPending ? "Saving..." : "Save Notification Settings"}
              </Button>
              
              <div className="pt-2 border-t border-light-300 dark:border-dark-300 mt-4">
                <h4 className="font-medium mb-2">Data & Privacy</h4>
                <Button 
                  variant="outline" 
                  className="w-full mb-2 border-primary text-primary hover:bg-primary hover:text-white"
                  onClick={handleExportData}
                >
                  Export Study Data
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full border-danger text-danger hover:bg-danger hover:text-white"
                  onClick={handleDeleteAccount}
                >
                  Delete Account
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
};

export default Settings;
