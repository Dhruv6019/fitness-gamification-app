import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { FitnessApp } from "@/pages/FitnessApp";
import { initializeDefaultData } from "@/utils/localStorage";

const queryClient = new QueryClient();

// Initialize default data
initializeDefaultData();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <FitnessApp />
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
