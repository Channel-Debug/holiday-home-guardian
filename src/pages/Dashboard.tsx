import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, Home, AlertTriangle, Clock, Filter, Edit } from "lucide-react";
import { toast } from "sonner";
import { ImageUpload } from "@/components/ImageUpload";
import { TaskImages } from "@/components/TaskImages";
import { useIsMobile } from "@/hooks/use-mobile";
import MobileTaskCard from "@/components/MobileTaskCard";
import type { Tables } from "@/integrations/supabase/types";
import TaskEditModal from "@/components/TaskEditModal";

type Task = Tables<"task"> & {
  casa: Tables<"casa"> | null;
};

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [selectedCasa, setSelectedCasa] = useState<string>("all");
  const [selectedPriorita, setSelectedPriorita] = useState<string>("all");
  const [imageRefresh, setImageRefresh] = useState(0);
  const isMobile = useIsMobile();
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  const { data: tasks, refetch: refetchTasks } = useQuery({
    queryKey: ['tasks', selectedCasa, selectedPriorita],
    queryFn: async () => {
      let query = supabase
        .from('task')
        .select(`
          *,
          casa (*)
        `)
        .eq('stato', 'da_fare')
        .order('data_creazione', { ascending: false });

      if (selectedCasa !== "all") {
        query = query.eq('casa_id', selectedCasa);
      }

      if (selectedPriorita !== "all") {
        query = query.eq('priorita', selectedPriorita);
      }
      
      const { data, error } = await query;
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

  const { data: houses } = useQuery({
    queryKey: ['houses-filter'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('casa')
        .select('*')
        .order('nome');
      
      if (error) throw error;
      return data as Tables<"casa">[];
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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('it-IT', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`${isMobile ? 'p-4' : 'p-6'} space-y-6`}>
      <div className="flex items-center justify-between">
        <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-gray-900`}>Dashboard</h1>
        {!isMobile && <p className="text-gray-600">Benvenuto, {user?.email}</p>}
      </div>

      {/* Stats Cards */}
      <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-3'} gap-${isMobile ? '4' : '6'}`}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium`}>Task Attive</CardTitle>
            <Clock className={`h-${isMobile ? '3' : '4'} w-${isMobile ? '3' : '4'} text-muted-foreground`} />
          </CardHeader>
          <CardContent>
            <div className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold`}>{tasks?.length || 0}</div>
            <p className={`${isMobile ? 'text-xs' : 'text-xs'} text-muted-foreground`}>
              Da completare
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium`}>Completate</CardTitle>
            <CheckCircle2 className={`h-${isMobile ? '3' : '4'} w-${isMobile ? '3' : '4'} text-muted-foreground`} />
          </CardHeader>
          <CardContent>
            <div className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold`}>{completedTasksCount || 0}</div>
            <p className={`${isMobile ? 'text-xs' : 'text-xs'} text-muted-foreground`}>
              Totale
            </p>
          </CardContent>
        </Card>

        {!isMobile && (
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
        )}
      </div>

      {/* Filtri */}
      <Card>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${isMobile ? 'text-lg' : ''}`}>
            <Filter className={`h-${isMobile ? '4' : '5'} w-${isMobile ? '4' : '5'}`} />
            Filtri
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'} gap-4`}>
            <div>
              <label className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium mb-2 block`}>Filtra per Casa</label>
              <Select value={selectedCasa} onValueChange={setSelectedCasa}>
                <SelectTrigger>
                  <SelectValue placeholder="Tutte le case" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutte le case</SelectItem>
                  {houses?.map((casa) => (
                    <SelectItem key={casa.id} value={casa.id}>
                      {casa.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium mb-2 block`}>Filtra per Priorità</label>
              <Select value={selectedPriorita} onValueChange={setSelectedPriorita}>
                <SelectTrigger>
                  <SelectValue placeholder="Tutte le priorità" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutte le priorità</SelectItem>
                  <SelectItem value="alta">🔴 Alta</SelectItem>
                  <SelectItem value="media">🟡 Media</SelectItem>
                  <SelectItem value="bassa">🟢 Bassa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Task Recenti */}
      <Card>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${isMobile ? 'text-lg' : ''}`}>
            <AlertTriangle className={`h-${isMobile ? '4' : '5'} w-${isMobile ? '4' : '5'}`} />
            Task da Completare
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tasks && tasks.length > 0 ? (
            <div className={`space-y-${isMobile ? '4' : '6'}`}>
              {tasks.map((task) => (
                isMobile ? (
                  <MobileTaskCard
                    key={task.id}
                    task={task}
                    onEdit={setEditingTask}
                    onComplete={handleCompleteTask}
                    showEditButton={true}
                    showCompleteButton={true}
                    refresh={imageRefresh}
                  >
                    <TaskImages taskId={task.id} />
                  </MobileTaskCard>
                ) : (
                  <div key={task.id} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={getPriorityVariant(task.priorita || '')}>
                            {task.priorita?.toUpperCase()}
                          </Badge>
                          <span className="font-medium text-lg">{task.casa?.nome}</span>
                        </div>
                        <p className="text-gray-600 mb-3">{task.descrizione}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-500 mb-3">
                          <div>
                            <span className="font-medium">Rilevato da:</span> {task.rilevato_da}
                          </div>
                          {task.operatore && (
                            <div>
                              <span className="font-medium">Operatore:</span> {task.operatore}
                            </div>
                          )}
                          <div>
                            <span className="font-medium">Creata il:</span> {formatDate(task.data_creazione)}
                          </div>
                          <div>
                            <span className="font-medium">Stato:</span> {task.stato}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingTask(task)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Modifica
                        </Button>
                        <Button 
                          onClick={() => handleCompleteTask(task.id)}
                        >
                          Completa
                        </Button>
                      </div>
                    </div>

                    {/* Sezione Immagini */}
                    <div className="border-t pt-4 space-y-3">
                      <TaskImages 
                        taskId={task.id} 
                        refresh={imageRefresh}
                      />
                      <ImageUpload 
                        taskId={task.id}
                        onImageUploaded={() => setImageRefresh(prev => prev + 1)}
                      />
                    </div>
                  </div>
                )
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">
              {selectedCasa !== "all" || selectedPriorita !== "all" 
                ? "Nessuna task trovata con i filtri selezionati" 
                : "Nessuna task attiva al momento"}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Modal di modifica */}
      {editingTask && (
        <TaskEditModal
          task={editingTask}
          isOpen={!!editingTask}
          onClose={() => setEditingTask(null)}
          onUpdate={() => {
            refetchTasks();
            setEditingTask(null);
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;
