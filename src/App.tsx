import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import NuovaTask from "./pages/NuovaTask";
import TaskCompletate from "./pages/TaskCompletate";
import ImportCSV from "./pages/ImportCSV";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

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

    return () => subscription.unsubscribe();
  }, []);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            {isAuthenticated ? (
              <Route path="/" element={<Layout><Dashboard /></Layout>} />
            ) : (
              <Route path="/" element={<Login />} />
            )}
            <Route 
              path="/nuova-task" 
              element={
                isAuthenticated ? (
                  <Layout><NuovaTask /></Layout>
                ) : (
                  <Login />
                )
              } 
            />
            <Route 
              path="/task-completate" 
              element={
                isAuthenticated ? (
                  <Layout><TaskCompletate /></Layout>
                ) : (
                  <Login />
                )
              } 
            />
            <Route 
              path="/import-csv" 
              element={
                isAuthenticated ? (
                  <Layout><ImportCSV /></Layout>
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
