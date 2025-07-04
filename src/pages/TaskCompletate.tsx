
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { RotateCcw, Download } from "lucide-react";
import TaskEditModal from "@/components/TaskEditModal";
import { TaskImages } from "@/components/TaskImages";
import TaskCard from "@/components/TaskCard";
import MobileTaskCard from "@/components/MobileTaskCard";
import TaskFilters from "@/components/TaskFilters";
import { useIsMobile } from "@/hooks/use-mobile";
import type { Tables } from "@/integrations/supabase/types";

type Task = Tables<"task"> & {
  casa: Tables<"casa"> | null;
  mezzi: Tables<"mezzi"> | null;
};

const TaskCompletate = () => {
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [imageRefresh, setImageRefresh] = useState(0);
  const [selectedCasa, setSelectedCasa] = useState("all");
  const [selectedPriorita, setSelectedPriorita] = useState("all");

  const { data: tasks, isLoading } = useQuery({
    queryKey: ['completedTasks'],
    queryFn: async () => {
      console.log('Caricamento task completate...');
      const { data, error } = await supabase
        .from('task')
        .select(`
          *,
          casa:casa_id(id, nome, indirizzo),
          mezzi:mezzo_id(id, nome, tipo)
        `)
        .eq('stato', 'completata')
        .order('data_completamento', { ascending: false, nullsFirst: false })
        .order('data_creazione', { ascending: false });
      
      if (error) {
        console.error('Errore caricamento task completate:', error);
        throw error;
      }
      
      console.log('Task completate caricate:', data?.length || 0);
      return data as Task[];
    },
  });

  const handleRestoreTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('task')
        .update({ stato: 'da_fare', data_completamento: null })
        .eq('id', taskId);

      if (error) throw error;

      toast.success("Task ripristinata con successo!");
      queryClient.invalidateQueries({ queryKey: ['completedTasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['completedTasksCount'] });
      queryClient.invalidateQueries({ queryKey: ['allTasksCount'] });
    } catch (error) {
      console.error('Errore nel ripristinare la task:', error);
      toast.error("Errore nel ripristinare la task");
    }
  };

  const handleArchiveTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('task')
        .update({ stato: 'archiviata' })
        .eq('id', taskId);

      if (error) throw error;

      toast.success("Task archiviata con successo!");
      queryClient.invalidateQueries({ queryKey: ['completedTasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['completedTasksCount'] });
      queryClient.invalidateQueries({ queryKey: ['allTasksCount'] });
    } catch (error) {
      console.error('Errore nell\'archiviare la task:', error);
      toast.error("Errore nell'archiviare la task");
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
  };

  const handleClearFilters = () => {
    setSelectedCasa("all");
    setSelectedPriorita("all");
  };

  // Filtra le task completate in base ai filtri selezionati
  const filteredTasks = tasks?.filter(task => {
    if (selectedCasa !== "all" && task.casa_id !== selectedCasa) return false;
    if (selectedPriorita !== "all" && task.priorita !== selectedPriorita) return false;
    
    return true;
  }) || [];

  return (
    <div className={`space-y-6 ${isMobile ? 'px-4 py-4' : ''}`}>
      <div className="flex items-center justify-between">
        <h1 className={`font-bold tracking-tight ${isMobile ? 'text-2xl' : 'text-3xl'}`}>Task Completate</h1>
        <Button variant="outline" size={isMobile ? "sm" : "default"}>
          <Download className="h-4 w-4 mr-2" />
          {isMobile ? "Esporta" : "Esporta Report"}
        </Button>
      </div>

      {/* Tasks List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className={`font-semibold ${isMobile ? 'text-xl' : 'text-2xl'}`}>Task Completate</h2>
          <Badge variant="secondary" className={isMobile ? 'text-xs' : ''}>{filteredTasks.length} tasks</Badge>
        </div>

        <TaskFilters
          selectedCasa={selectedCasa}
          selectedPriorita={selectedPriorita}
          onCasaChange={setSelectedCasa}
          onPrioritaChange={setSelectedPriorita}
          onClearFilters={handleClearFilters}
        />

        {isLoading ? (
          <div className="text-center py-8">Caricamento tasks completate...</div>
        ) : filteredTasks.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                {tasks?.length === 0 ? "Nessuna task completata" : "Nessuna task trovata con i filtri selezionati"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className={isMobile ? "space-y-4" : "grid gap-6 md:grid-cols-2 lg:grid-cols-3"}>
            {filteredTasks.map((task) => (
              isMobile ? (
                <MobileTaskCard
                  key={task.id}
                  task={task}
                  onRestore={handleRestoreTask}
                  onArchive={handleArchiveTask}
                  onEdit={handleEditTask}
                  showRestoreButton={true}
                  showArchiveButton={true}
                  showEditButton={true}
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
                  onArchive={handleArchiveTask}
                  onEdit={handleEditTask}
                  showRestoreButton={true}
                  showArchiveButton={true}
                  showEditButton={true}
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

      {/* Edit Task Modal */}
      {editingTask && (
        <TaskEditModal
          task={editingTask}
          isOpen={!!editingTask}
          onClose={() => setEditingTask(null)}
          onUpdate={() => {
            setEditingTask(null);
            queryClient.invalidateQueries({ queryKey: ['completedTasks'] });
          }}
        />
      )}
    </div>
  );
};

export default TaskCompletate;
