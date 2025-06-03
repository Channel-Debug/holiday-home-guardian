import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, CheckCircle2, Edit } from "lucide-react";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import MobileTaskCard from "@/components/MobileTaskCard";
import TaskEditModal from "@/components/TaskEditModal";
import { TaskImages } from "@/components/TaskImages";
import type { Tables } from "@/integrations/supabase/types";

type PendingTask = Tables<"task"> & {
  casa: Tables<"casa"> | null;
};

const Dashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCasa, setSelectedCasa] = useState<string>("all");
  const [selectedPriorita, setSelectedPriorita] = useState<string>("all");
  const [editingTask, setEditingTask] = useState<PendingTask | null>(null);
  const [imageRefresh, setImageRefresh] = useState(0);
  const isMobile = useIsMobile();

  const { data: pendingTasks, refetch } = useQuery({
    queryKey: ['pending-tasks', searchTerm, selectedCasa, selectedPriorita],
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

      if (searchTerm) {
        query = query.ilike('descrizione', `%${searchTerm}%`);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as PendingTask[];
    },
  });

  const { data: houses } = useQuery({
    queryKey: ['houses'],
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
      const { data: userData } = await supabase.auth.getUser();

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
          utente_id: userData.user?.id,
        });

      if (logError) throw logError;

      toast.success('Task completata con successo!');
      refetch();
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

  const filteredTasks = pendingTasks?.filter(task =>
    task.descrizione?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.casa?.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.operatore?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`${isMobile ? 'p-4' : 'p-6'} space-y-6`}>
      <div className="flex items-center justify-between">
        <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-gray-900`}>Task da Completare</h1>
        <p className="text-gray-600">
          {filteredTasks?.length || 0} task in sospeso
        </p>
      </div>

      {/* Ricerca e Filtri */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Cerca nelle task da completare..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
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

      {/* Task da Completare */}
      <div className={`space-y-${isMobile ? '4' : '6'}`}>
        {pendingTasks && pendingTasks.length > 0 ? (
          pendingTasks.map((task) => (
            isMobile ? (
              <MobileTaskCard
                key={task.id}
                task={task}
                onComplete={handleCompleteTask}
                onEdit={setEditingTask}
                showCompleteButton={true}
                showEditButton={true}
                showImageUpload={true}
                onImageUploaded={() => setImageRefresh(prev => prev + 1)}
                refresh={imageRefresh}
              >
                <TaskImages taskId={task.id} />
              </MobileTaskCard>
            ) : (
              <Card key={task.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={getPriorityVariant(task.priorita || '')}>
                          {task.priorita?.toUpperCase()}
                        </Badge>
                        <div>
                          <span className="font-semibold text-lg">{task.casa?.nome}</span>
                          {task.casa?.indirizzo && (
                            <div className="text-sm text-gray-500">
                              {task.casa.indirizzo}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-gray-700 mb-3">{task.descrizione}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
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
                        variant="outline"
                        size="sm"
                        onClick={() => handleCompleteTask(task.id)}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Completa
                      </Button>
                    </div>
                  </div>

                  {/* Sezione Immagini */}
                  <div className="border-t pt-4">
                    <TaskImages taskId={task.id} />
                  </div>
                </CardContent>
              </Card>
            )
          ))
        ) : (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-gray-500 py-8">
                {searchTerm || selectedCasa !== "all" || selectedPriorita !== "all" 
                  ? 'Nessuna task trovata con i criteri di ricerca' 
                  : 'Nessuna task da completare'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modal di modifica */}
      {editingTask && (
        <TaskEditModal
          task={editingTask}
          isOpen={!!editingTask}
          onClose={() => setEditingTask(null)}
          onUpdate={() => {
            refetch();
            setEditingTask(null);
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;
