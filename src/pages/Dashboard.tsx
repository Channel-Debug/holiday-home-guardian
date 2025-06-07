import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Plus, CheckCircle, Calendar, AlertTriangle } from "lucide-react";
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

const Dashboard = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [imageRefresh, setImageRefresh] = useState(0);
  const [selectedCasa, setSelectedCasa] = useState("all");
  const [selectedPriorita, setSelectedPriorita] = useState("all");

  const { data: tasks, isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('task')
        .select(`
          *,
          casa:casa_id(id, nome, indirizzo),
          mezzi:mezzo_id(id, nome, tipo)
        `)
        .eq('stato', 'da_fare')
        .order('data_creazione', { ascending: false });
      
      if (error) throw error;
      return data as Task[];
    },
  });

  // Query separata per le task completate
  const { data: completedTasksCount } = useQuery({
    queryKey: ['completedTasksCount'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('task')
        .select('*', { count: 'exact', head: true })
        .eq('stato', 'completata');
      
      if (error) throw error;
      return count || 0;
    },
  });

  // Replace allTasksCount with archivedTasksCount
  const { data: archivedTasksCount } = useQuery({
    queryKey: ['archivedTasksCount'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('task')
        .select('*', { count: 'exact', head: true })
        .eq('stato', 'archiviata');
      
      if (error) throw error;
      return count || 0;
    },
  });

  const handleCompleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('task')
        .update({ 
          stato: 'completata',
          data_completamento: new Date().toISOString()
        })
        .eq('id', taskId);

      if (error) throw error;

      toast.success("Task completata con successo!");
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['completedTasksCount'] });
      queryClient.invalidateQueries({ queryKey: ['archivedTasksCount'] });
    } catch (error) {
      console.error('Errore nel completare la task:', error);
      toast.error("Errore nel completare la task");
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
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['completedTasksCount'] });
      queryClient.invalidateQueries({ queryKey: ['archivedTasksCount'] });
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

  // Filtra le task in base ai filtri selezionati
  const filteredTasks = tasks?.filter(task => {
    if (task.stato !== 'da_fare') return false;
    
    if (selectedCasa !== "all" && task.casa_id !== selectedCasa) return false;
    if (selectedPriorita !== "all" && task.priorita !== selectedPriorita) return false;
    
    return true;
  }) || [];

  const highPriorityTasks = filteredTasks.filter(task => task.priorita === 'alta');

  return (
    <div className={`space-y-6 ${isMobile ? 'px-4 py-4' : ''}`}>
      <div className="flex items-center justify-between">
        <h1 className={`font-bold tracking-tight ${isMobile ? 'text-2xl' : 'text-3xl'}`}>Dashboard</h1>
        <Button onClick={() => navigate('/nuova-task')} size={isMobile ? "sm" : "default"}>
          <Plus className="h-4 w-4 mr-2" />
          {isMobile ? "Nuova" : "Nuova Task"}
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className={`grid gap-4 ${isMobile ? 'grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-4'}`}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className={`font-medium ${isMobile ? 'text-xs' : 'text-sm'}`}>Task Pendenti</CardTitle>
            <Calendar className={`text-muted-foreground ${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
          </CardHeader>
          <CardContent className={isMobile ? 'pt-1' : ''}>
            <div className={`font-bold ${isMobile ? 'text-xl' : 'text-2xl'}`}>{filteredTasks.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className={`font-medium ${isMobile ? 'text-xs' : 'text-sm'}`}>Alta Priorità</CardTitle>
            <AlertTriangle className={`text-red-500 ${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
          </CardHeader>
          <CardContent className={isMobile ? 'pt-1' : ''}>
            <div className={`font-bold text-red-600 ${isMobile ? 'text-xl' : 'text-2xl'}`}>{highPriorityTasks.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className={`font-medium ${isMobile ? 'text-xs' : 'text-sm'}`}>Task Completate</CardTitle>
            <CheckCircle className={`text-green-500 ${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
          </CardHeader>
          <CardContent className={isMobile ? 'pt-1' : ''}>
            <div className={`font-bold ${isMobile ? 'text-xl' : 'text-2xl'}`}>{completedTasksCount || 0}</div>
            {!isMobile && <p className="text-xs text-muted-foreground">Vai a Task Completate</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className={`font-medium ${isMobile ? 'text-xs' : 'text-sm'}`}>Task Archiviate</CardTitle>
            <CheckCircle className={`text-muted-foreground ${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
          </CardHeader>
          <CardContent className={isMobile ? 'pt-1' : ''}>
            <div className={`font-bold ${isMobile ? 'text-xl' : 'text-2xl'}`}>{archivedTasksCount || 0}</div>
            {!isMobile && <p className="text-xs text-muted-foreground">Task archiviate</p>}
          </CardContent>
        </Card>
      </div>

      {/* Tasks List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className={`font-semibold ${isMobile ? 'text-xl' : 'text-2xl'}`}>Task da Completare</h2>
          {highPriorityTasks.length > 0 && (
            <Badge variant="destructive" className={isMobile ? 'text-xs' : ''}>
              {highPriorityTasks.length} alta priorità
            </Badge>
          )}
        </div>

        <TaskFilters
          selectedCasa={selectedCasa}
          selectedPriorita={selectedPriorita}
          onCasaChange={setSelectedCasa}
          onPrioritaChange={setSelectedPriorita}
          onClearFilters={handleClearFilters}
        />

        {isLoading ? (
          <div className="text-center py-8">Caricamento tasks...</div>
        ) : filteredTasks.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                {tasks?.length === 0 ? "Nessuna task da completare" : "Nessuna task trovata con i filtri selezionati"}
              </p>
              {tasks?.length === 0 && (
                <Button onClick={() => navigate('/nuova-task')} size={isMobile ? "sm" : "default"}>
                  <Plus className="h-4 w-4 mr-2" />
                  Crea la prima task
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className={isMobile ? "space-y-4" : "grid gap-6 md:grid-cols-2 lg:grid-cols-3"}>
            {filteredTasks.map((task) => (
              isMobile ? (
                <MobileTaskCard
                  key={task.id}
                  task={task}
                  onComplete={handleCompleteTask}
                  onArchive={handleArchiveTask}
                  onEdit={handleEditTask}
                  showCompleteButton={true}
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
                  onComplete={handleCompleteTask}
                  onArchive={handleArchiveTask}
                  onEdit={handleEditTask}
                  showCompleteButton={true}
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
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            queryClient.invalidateQueries({ queryKey: ['completedTasksCount'] });
            queryClient.invalidateQueries({ queryKey: ['archivedTasksCount'] });
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;
