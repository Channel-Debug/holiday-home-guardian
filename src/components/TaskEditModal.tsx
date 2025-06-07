import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import OperatorSelect from "./OperatorSelect";
import CostInput from "./CostInput";
import HouseSelectWithSearch from "./HouseSelectWithSearch";
import type { Tables } from "@/integrations/supabase/types";

type Task = Tables<"task"> & {
  casa: Tables<"casa"> | null;
};

interface TaskEditModalProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

const TaskEditModal = ({ task, isOpen, onClose, onUpdate }: TaskEditModalProps) => {
  const [formData, setFormData] = useState({
    casa_id: task.casa_id || "",
    descrizione: task.descrizione || "",
    note: task.note || "",
    priorita: task.priorita || "",
    rilevato_da: task.rilevato_da || "",
    operatore: task.operatore || "",
    costo_manutenzione: task.costo_manutenzione || null,
  });
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const { data: houses } = useQuery({
    queryKey: ['houses-edit'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('casa')
        .select('*')
        .order('nome');
      
      if (error) throw error;
      return data as Tables<"casa">[];
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('task')
        .update({
          casa_id: formData.casa_id,
          descrizione: formData.descrizione,
          note: formData.note,
          priorita: formData.priorita,
          rilevato_da: formData.rilevato_da,
          operatore: formData.operatore,
          costo_manutenzione: formData.costo_manutenzione,
        })
        .eq('id', task.id);

      if (error) throw error;

      toast.success("Task aggiornata con successo!");
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Errore nell\'aggiornamento della task:', error);
      toast.error("Errore nell'aggiornamento della task");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Sei sicuro di voler eliminare questa task? Questa azione non può essere annullata.")) {
      return;
    }

    setDeleteLoading(true);

    try {
      // Prima eliminiamo le immagini associate
      const { data: images } = await supabase
        .from('task_images')
        .select('storage_path')
        .eq('task_id', task.id);

      if (images && images.length > 0) {
        const storagePaths = images.map(img => img.storage_path);
        await supabase.storage
          .from('task-images')
          .remove(storagePaths);
      }

      // Eliminiamo le immagini dal database
      await supabase
        .from('task_images')
        .delete()
        .eq('task_id', task.id);

      // Infine eliminiamo la task
      const { error } = await supabase
        .from('task')
        .delete()
        .eq('id', task.id);

      if (error) throw error;

      toast.success("Task eliminata con successo!");
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Errore nell\'eliminazione della task:', error);
      toast.error("Errore nell'eliminazione della task");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | number | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] mx-auto">
        <DialogHeader>
          <DialogTitle>Modifica Task</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="casa">Casa *</Label>
            <HouseSelectWithSearch
              houses={houses}
              value={formData.casa_id}
              onValueChange={(value) => handleInputChange('casa_id', value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="descrizione">Descrizione Intervento *</Label>
            <Textarea
              id="descrizione"
              value={formData.descrizione}
              onChange={(e) => handleInputChange('descrizione', e.target.value)}
              placeholder="Descrivi il problema o l'intervento necessario..."
              rows={4}
              required
            />
          </div>

          <div>
            <Label htmlFor="note">Note</Label>
            <Textarea
              id="note"
              value={formData.note}
              onChange={(e) => handleInputChange('note', e.target.value)}
              placeholder="Note aggiuntive (opzionale)..."
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="priorita">Priorità *</Label>
            <Select 
              value={formData.priorita} 
              onValueChange={(value) => handleInputChange('priorita', value)}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleziona la priorità" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bassa">🟢 Bassa</SelectItem>
                <SelectItem value="media">🟡 Media</SelectItem>
                <SelectItem value="alta">🔴 Alta</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="rilevato_da">Rilevato da *</Label>
            <Input
              id="rilevato_da"
              value={formData.rilevato_da}
              onChange={(e) => handleInputChange('rilevato_da', e.target.value)}
              placeholder="Nome della persona che ha rilevato il problema"
              required
            />
          </div>

          <OperatorSelect
            value={formData.operatore}
            onChange={(value) => handleInputChange('operatore', value)}
          />

          <CostInput
            value={formData.costo_manutenzione}
            onChange={(value) => handleInputChange('costo_manutenzione', value)}
          />

          <div className="space-y-3 pt-4">
            <Button 
              type="button" 
              variant="destructive" 
              onClick={handleDelete}
              disabled={deleteLoading}
              className="w-full flex items-center justify-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              {deleteLoading ? "Eliminazione..." : "Elimina Task"}
            </Button>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                className="flex-1"
              >
                Annulla
              </Button>
              <Button 
                type="submit" 
                disabled={loading}
                className="flex-1"
              >
                {loading ? "Aggiornamento..." : "Aggiorna Task"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TaskEditModal;
