
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";
import Layout from "@/components/Layout";
import MobileOptimizedLayout from "@/components/MobileOptimizedLayout";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import NuovaTask from "./pages/NuovaTask";
import TaskCompletate from "./pages/TaskCompletate";
import Archiviati from "./pages/Archiviati";
import EsportaReport from "./pages/EsportaReport";
import ImportCSV from "./pages/ImportCSV";
import Profilo from "./pages/Profilo";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Caricamento...</div>;
  }

  const LayoutComponent = isMobile ? MobileOptimizedLayout : Layout;

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <Routes>
            {!user ? (
              <>
                <Route path="/login" element={<Login />} />
                <Route path="*" element={<Login />} />
              </>
            ) : (
              <Route path="/" element={<LayoutComponent><Index /></LayoutComponent>}>
                <Route index element={<Dashboard />} />
                <Route path="nuova-task" element={<NuovaTask />} />
                <Route path="task-completate" element={<TaskCompletate />} />
                <Route path="archiviati" element={<Archiviati />} />
                <Route path="esporta-report" element={<EsportaReport />} />
                <Route path="import-csv" element={<ImportCSV />} />
                <Route path="profilo" element={<Profilo />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            )}
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
