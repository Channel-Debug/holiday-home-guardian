
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";
import Layout from "./components/Layout";
import MobileOptimizedLayout from "./components/MobileOptimizedLayout";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import NuovaTask from "./pages/NuovaTask";
import TaskCompletate from "./pages/TaskCompletate";
import ImportCSV from "./pages/ImportCSV";
import NotFound from "./pages/NotFound";
import Profilo from "./pages/Profilo";

const queryClient = new QueryClient();

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setIsAuthenticated(!!session);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-blue-600 font-medium">Caricamento...</p>
        </div>
      </div>
    );
  }

  const LayoutComponent = isMobile ? MobileOptimizedLayout : Layout;

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            {isAuthenticated ? (
              <Route path="/" element={<LayoutComponent><Dashboard /></LayoutComponent>} />
            ) : (
              <Route path="/" element={<Login />} />
            )}
            <Route 
              path="/nuova-task" 
              element={
                isAuthenticated ? (
                  <LayoutComponent><NuovaTask /></LayoutComponent>
                ) : (
                  <Login />
                )
              } 
            />
            <Route 
              path="/task-completate" 
              element={
                isAuthenticated ? (
                  <LayoutComponent><TaskCompletate /></LayoutComponent>
                ) : (
                  <Login />
                )
              } 
            />
            <Route 
              path="/import-csv" 
              element={
                isAuthenticated ? (
                  <LayoutComponent><ImportCSV /></LayoutComponent>
                ) : (
                  <Login />
                )
              } 
            />
            <Route 
              path="/profilo" 
              element={
                isAuthenticated ? (
                  <LayoutComponent><Profilo /></LayoutComponent>
                ) : (
                  <Login />
                )
              } 
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
