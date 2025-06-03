
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CheckCircle } from "lucide-react";
import { TaskImages } from "@/components/TaskImages";
import TaskCard from "@/components/TaskCard";
import MobileTaskCard from "@/components/MobileTaskCard";
import { useMobile } from "@/hooks/use-mobile";
import type { Tables } from "@/integrations/supabase/types";

type CompletedTask = Tables<"task"> & {
  casa: Tables<"casa"> | null;
  mezzi: Tables<"mezzi"> | null;
};

const TaskCompletate = () => {
  const queryClient = useQueryClient();
  const isMobile = useMobile();
  const [imageRefresh, setImageRefresh] = useState(0);

  const { data: completedTasks, isLoading } = useQuery({
    queryKey: ['completed-tasks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('task')
        .select(`
          *,
          casa:casa_id(id, nome, indirizzo),
          mezzi:mezzo_id(id, nome, tipo)
        `)
        .eq('stato', 'completata')
        .order('data_completamento', { ascending: false });
      
      if (error) throw error;
      return data as CompletedTask[];
    },
  });

  const handleRestoreTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('task')
        .update({ 
          stato: 'da_fare',
          data_completamento: null
        })
        .eq('id', taskId);

      if (error) throw error;

      toast.success("Task ripristinata con successo!");
      queryClient.invalidateQueries({ queryKey: ['completed-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    } catch (error) {
      console.error('Errore nel ripristinare la task:', error);
      toast.error("Errore nel ripristinare la task");
    }
  };

  const totalCost = completedTasks?.reduce((sum, task) => {
    return sum + (task.costo_manutenzione || 0);
  }, 0) || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Task Completate</h1>
        <Badge variant="outline" className="text-lg px-3 py-1">
          <CheckCircle className="h-4 w-4 mr-2" />
          {completedTasks?.length || 0} completate
        </Badge>
      </div>

      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle>Riepilogo Costi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            €{totalCost.toFixed(2)} (IVA inclusa)
          </div>
          <p className="text-sm text-muted-foreground">
            Totale speso per {completedTasks?.length || 0} task completate
          </p>
        </CardContent>
      </Card>

      {/* Completed Tasks List */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Cronologia Completamenti</h2>

        {isLoading ? (
          <div className="text-center py-8">Caricamento task completate...</div>
        ) : !completedTasks || completedTasks.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nessuna task completata ancora</p>
            </CardContent>
          </Card>
        ) : (
          <div className={isMobile ? "space-y-4" : "grid gap-6 md:grid-cols-2 lg:grid-cols-3"}>
            {completedTasks.map((task) => (
              isMobile ? (
                <MobileTaskCard
                  key={task.id}
                  task={task}
                  onRestore={handleRestoreTask}
                  showRestoreButton={true}
                  showImageUpload={true}
                  onImageUploaded={() => setImageRefresh(prev => prev + 1)}
                  refresh={imageRefresh}
                >
                  <TaskImages taskId={task.id} />
                </MobileTaskCard>
              ) : (
                <TaskCard
                  key={task.id}
                  task={task}
                  onRestore={handleRestoreTask}
                  showRestoreButton={true}
                  showImageUpload={true}
                  onImageUploaded={() => setImageRefresh(prev => prev + 1)}
                  refresh={imageRefresh}
                >
                  <TaskImages taskId={task.id} />
                </TaskCard>
              )
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCompletate;
