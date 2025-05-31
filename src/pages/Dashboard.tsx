
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Home, AlertTriangle, Clock } from "lucide-react";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

type Task = Tables<"task"> & {
  casa: Tables<"casa"> | null;
};

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  const { data: tasks, refetch: refetchTasks } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('task')
        .select(`
          *,
          casa (*)
        `)
        .eq('stato', 'da_fare')
        .order('data_creazione', { ascending: false });
      
      if (error) throw error;
      return data as Task[];
    },
  });

  const { data: completedTasksCount } = useQuery({
    queryKey: ['completed-tasks-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('task')
        .select('*', { count: 'exact', head: true })
        .eq('stato', 'completata');
      
      if (error) throw error;
      return count || 0;
    },
  });

  const { data: casesCount } = useQuery({
    queryKey: ['cases-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('casa')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      return count || 0;
    },
  });

  const handleCompleteTask = async (taskId: string) => {
    try {
      const { error: updateError } = await supabase
        .from('task')
        .update({
          stato: 'completata',
          data_completamento: new Date().toISOString(),
        })
        .eq('id', taskId);

      if (updateError) throw updateError;

      const { error: logError } = await supabase
        .from('task_logs')
        .insert({
          task_id: taskId,
          azione: 'completata',
          utente_id: user?.id,
        });

      if (logError) throw logError;

      toast.success('Task completata con successo!');
      refetchTasks();
    } catch (error) {
      console.error('Errore nel completare la task:', error);
      toast.error('Errore nel completare la task');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'alta':
        return 'bg-red-500';
      case 'media':
        return 'bg-yellow-500';
      case 'bassa':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getPriorityVariant = (priority: string): "default" | "destructive" | "secondary" | "outline" => {
    switch (priority?.toLowerCase()) {
      case 'alta':
        return 'destructive';
      case 'media':
        return 'secondary';
      case 'bassa':
        return 'default';
      default:
        return 'outline';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Benvenuto, {user?.email}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Task Attive</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tasks?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Task da completare
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Task Completate</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTasksCount || 0}</div>
            <p className="text-xs text-muted-foreground">
              Totale completate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Case Gestite</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{casesCount || 0}</div>
            <p className="text-xs text-muted-foreground">
              Totale case
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Task Recenti */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Task Recenti da Completare
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tasks && tasks.length > 0 ? (
            <div className="space-y-4">
              {tasks.slice(0, 5).map((task) => (
                <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={getPriorityVariant(task.priorita || '')}>
                        {task.priorita?.toUpperCase()}
                      </Badge>
                      <span className="font-medium">{task.casa?.nome}</span>
                    </div>
                    <p className="text-gray-600 mb-2">{task.descrizione}</p>
                    <div className="text-sm text-gray-500">
                      <span>Rilevato da: {task.rilevato_da}</span>
                      {task.operatore && <span className="ml-4">Operatore: {task.operatore}</span>}
                    </div>
                  </div>
                  <Button 
                    onClick={() => handleCompleteTask(task.id)}
                    className="ml-4"
                  >
                    Completa
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">
              Nessuna task attiva al momento
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
