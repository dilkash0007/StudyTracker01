import { useEffect, useState } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Calendar from "@/pages/Calendar";
import Tasks from "@/pages/Tasks";
import Notes from "@/pages/Notes";
import Progress from "@/pages/Progress";
import Settings from "@/pages/Settings";
import Dock from "@/components/Dock";
import Header from "@/components/Header";
import NotificationBar from "@/components/NotificationBar";
import { AppProvider } from "@/context/AppContext";
import useLocalStorage from "@/hooks/useLocalStorage";

function App() {
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [colorMode, setColorMode] = useLocalStorage<"light" | "dark">("theme", "light");
  
  const toggleColorMode = () => {
    setColorMode(prevMode => prevMode === "light" ? "dark" : "light");
  };
  
  useEffect(() => {
    document.documentElement.classList.toggle("dark", colorMode === "dark");
  }, [colorMode]);
  
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <div className="min-h-screen flex flex-col relative bg-light-200 dark:bg-dark-600 text-dark-600 dark:text-light-100 font-sans">
          <NotificationBar isOpen={notificationOpen} onClose={() => setNotificationOpen(false)} />
          <Header 
            onNotificationToggle={() => setNotificationOpen(!notificationOpen)} 
            colorMode={colorMode}
            onColorModeToggle={toggleColorMode}
          />
          
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/calendar" component={Calendar} />
            <Route path="/tasks" component={Tasks} />
            <Route path="/notes" component={Notes} />
            <Route path="/progress" component={Progress} />
            <Route path="/settings" component={Settings} />
            <Route component={NotFound} />
          </Switch>
          
          <Dock />
        </div>
        <Toaster />
      </AppProvider>
    </QueryClientProvider>
  );
}

export default App;
