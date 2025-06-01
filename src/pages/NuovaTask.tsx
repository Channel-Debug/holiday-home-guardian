
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { ImageUpload } from "@/components/ImageUpload";
import { TaskImages } from "@/components/TaskImages";
import type { Tables } from "@/integrations/supabase/types";

const NuovaTask = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    casa_id: "",
    descrizione: "",
    priorita: "",
    rilevato_da: "",
    operatore: "",
  });
  const [loading, setLoading] = useState(false);
  const [createdTaskId, setCreatedTaskId] = useState<string | null>(null);
  const [imageRefresh, setImageRefresh] = useState(0);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: user } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('task')
        .insert({
          ...formData,
          stato: 'da_fare',
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("Task creata con successo!");
      setCreatedTaskId(data.id);
      
      // Reset form
      setFormData({
        casa_id: "",
        descrizione: "",
        priorita: "",
        rilevato_da: "",
        operatore: "",
      });
    } catch (error) {
      console.error('Errore nella creazione della task:', error);
      toast.error("Errore nella creazione della task");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFinish = () => {
    navigate("/");
  };

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Nuova Task di Manutenzione
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="casa">Casa *</Label>
                <Select 
                  value={formData.casa_id} 
                  onValueChange={(value) => handleInputChange('casa_id', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona una casa" />
                  </SelectTrigger>
                  <SelectContent>
                    {houses?.map((casa) => (
                      <SelectItem key={casa.id} value={casa.id}>
                        {casa.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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

              <div>
                <Label htmlFor="operatore">Operatore/Azienda Assegnata</Label>
                <Input
                  id="operatore"
                  value={formData.operatore}
                  onChange={(e) => handleInputChange('operatore', e.target.value)}
                  placeholder="Nome dell'operatore o azienda (opzionale)"
                />
              </div>

              <div className="flex gap-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate("/")}
                  className="flex-1"
                >
                  Annulla
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? "Creazione..." : "Crea Task"}
                </Button>
              </div>
            </form>

            {/* Sezione per upload immagini dopo la creazione */}
            {createdTaskId && (
              <div className="mt-6 pt-6 border-t">
                <h3 className="text-lg font-medium mb-4">Aggiungi Immagini alla Task</h3>
                <div className="space-y-4">
                  <TaskImages 
                    taskId={createdTaskId} 
                    refresh={imageRefresh}
                  />
                  <ImageUpload 
                    taskId={createdTaskId}
                    onImageUploaded={() => setImageRefresh(prev => prev + 1)}
                  />
                  <Button 
                    onClick={handleFinish}
                    variant="outline"
                    className="w-full"
                  >
                    Termina e Torna alla Dashboard
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NuovaTask;
