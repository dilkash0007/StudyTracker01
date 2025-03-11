import { useState } from 'react';
import { motion } from 'framer-motion';
import { BellIcon, MoonIcon, SunIcon } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface HeaderProps {
  onNotificationToggle: () => void;
  colorMode: 'light' | 'dark';
  onColorModeToggle: () => void;
}

const Header = ({ onNotificationToggle, colorMode, onColorModeToggle }: HeaderProps) => {
  return (
    <header className="border-b border-light-300 dark:border-dark-400 bg-white dark:bg-dark-500 shadow-sm">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <motion.h1 
            className="text-xl font-semibold"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            StudyOS
          </motion.h1>
          <div className="hidden md:flex space-x-2">
            <button className="px-3 py-1 text-sm rounded-md hover:bg-light-200 dark:hover:bg-dark-400">File</button>
            <button className="px-3 py-1 text-sm rounded-md hover:bg-light-200 dark:hover:bg-dark-400">Edit</button>
            <button className="px-3 py-1 text-sm rounded-md hover:bg-light-200 dark:hover:bg-dark-400">View</button>
            <button className="px-3 py-1 text-sm rounded-md hover:bg-light-200 dark:hover:bg-dark-400">Window</button>
            <button className="px-3 py-1 text-sm rounded-md hover:bg-light-200 dark:hover:bg-dark-400">Help</button>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-light-200 dark:hover:bg-dark-400"
            onClick={onNotificationToggle}
            aria-label="Toggle notifications"
          >
            <BellIcon className="h-5 w-5" />
          </motion.button>
          
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-light-200 dark:hover:bg-dark-400"
            onClick={onColorModeToggle}
            aria-label="Toggle dark mode"
          >
            {colorMode === 'dark' ? (
              <SunIcon className="h-5 w-5" />
            ) : (
              <MoonIcon className="h-5 w-5" />
            )}
          </motion.button>
          
          <Avatar>
            <AvatarFallback className="bg-primary text-white">
              JD
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
};

export default Header;
