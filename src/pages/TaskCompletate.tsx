
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RotateCcw, Search } from "lucide-react";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

type CompletedTask = Tables<"task"> & {
  casa: Tables<"casa"> | null;
};

const TaskCompletate = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [user, setUser] = useState<any>(null);

  const { data: completedTasks, refetch } = useQuery({
    queryKey: ['completed-tasks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('task')
        .select(`
          *,
          casa (*)
        `)
        .eq('stato', 'completata')
        .order('data_completamento', { ascending: false });
      
      if (error) throw error;
      return data as CompletedTask[];
    },
  });

  const handleRestoreTask = async (taskId: string) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      const { error: updateError } = await supabase
        .from('task')
        .update({
          stato: 'da_fare',
          data_completamento: null,
        })
        .eq('id', taskId);

      if (updateError) throw updateError;

      const { error: logError } = await supabase
        .from('task_logs')
        .insert({
          task_id: taskId,
          azione: 'ripristinata',
          utente_id: userData.user?.id,
        });

      if (logError) throw logError;

      toast.success('Task ripristinata con successo!');
      refetch();
    } catch (error) {
      console.error('Errore nel ripristinare la task:', error);
      toast.error('Errore nel ripristinare la task');
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

  const filteredTasks = completedTasks?.filter(task =>
    task.descrizione?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.casa?.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.operatore?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Task Completate</h1>
        <p className="text-gray-600">
          {completedTasks?.length || 0} task completate
        </p>
      </div>

      {/* Ricerca */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Cerca nelle task completate..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Lista Task Completate */}
      <div className="space-y-4">
        {filteredTasks && filteredTasks.length > 0 ? (
          filteredTasks.map((task) => (
            <Card key={task.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={getPriorityVariant(task.priorita || '')}>
                        {task.priorita?.toUpperCase()}
                      </Badge>
                      <span className="font-semibold text-lg">{task.casa?.nome}</span>
                    </div>
                    
                    <p className="text-gray-700 mb-3">{task.descrizione}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Rilevato da:</span> {task.rilevato_da}
                      </div>
                      {task.operatore && (
                        <div>
                          <span className="font-medium">Operatore:</span> {task.operatore}
                        </div>
                      )}
                      <div>
                        <span className="font-medium">Creata il:</span>{' '}
                        {task.data_creazione ? new Date(task.data_creazione).toLocaleDateString('it-IT') : 'N/A'}
                      </div>
                      <div>
                        <span className="font-medium">Completata il:</span>{' '}
                        {task.data_completamento ? new Date(task.data_completamento).toLocaleDateString('it-IT') : 'N/A'}
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRestoreTask(task.id)}
                    className="ml-4"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Ripristina
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-gray-500 py-8">
                {searchTerm ? 'Nessuna task trovata per la ricerca' : 'Nessuna task completata'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TaskCompletate;
