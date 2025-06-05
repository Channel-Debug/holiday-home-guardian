import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { ImageUpload } from "@/components/ImageUpload";
import { TaskImages } from "@/components/TaskImages";
import OperatorSelect from "@/components/OperatorSelect";
import CostInput from "@/components/CostInput";
import type { Tables } from "@/integrations/supabase/types";

const NuovaTask = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    tipo_manutenzione: "casa",
    casa_id: "",
    mezzo_id: "",
    descrizione: "",
    note: "",
    priorita: "",
    rilevato_da: "",
    operatore: "",
    costo_manutenzione: null as number | null,
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

  const { data: mezzi } = useQuery({
    queryKey: ['mezzi'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mezzi')
        .select('*')
        .order('nome');
      
      if (error) throw error;
      return data as Tables<"mezzi">[];
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const taskData = {
        tipo_manutenzione: formData.tipo_manutenzione,
        casa_id: formData.tipo_manutenzione === 'casa' ? formData.casa_id : null,
        mezzo_id: formData.tipo_manutenzione === 'mezzo' ? formData.mezzo_id : null,
        descrizione: formData.descrizione,
        note: formData.note,
        priorita: formData.priorita,
        rilevato_da: formData.rilevato_da,
        operatore: formData.operatore,
        costo_manutenzione: formData.costo_manutenzione,
        stato: 'da_fare',
      };

      const { data, error } = await supabase
        .from('task')
        .insert(taskData)
        .select()
        .single();

      if (error) throw error;

      toast.success("Task creata con successo!");
      setCreatedTaskId(data.id);
      
      // Reset form
      setFormData({
        tipo_manutenzione: "casa",
        casa_id: "",
        mezzo_id: "",
        descrizione: "",
        note: "",
        priorita: "",
        rilevato_da: "",
        operatore: "",
        costo_manutenzione: null,
      });
    } catch (error) {
      console.error('Errore nella creazione della task:', error);
      toast.error("Errore nella creazione della task");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | number | null) => {
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
                <Label>Tipo Manutenzione *</Label>
                <RadioGroup 
                  value={formData.tipo_manutenzione} 
                  onValueChange={(value) => handleInputChange('tipo_manutenzione', value)}
                  className="flex gap-6 mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="casa" id="casa" />
                    <Label htmlFor="casa">Casa</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="mezzo" id="mezzo" />
                    <Label htmlFor="mezzo">Mezzo</Label>
                  </div>
                </RadioGroup>
              </div>

              {formData.tipo_manutenzione === 'casa' && (
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
                          {casa.nome} {casa.indirizzo && `- ${casa.indirizzo}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {formData.tipo_manutenzione === 'mezzo' && (
                <div>
                  <Label htmlFor="mezzo">Mezzo *</Label>
                  <Select 
                    value={formData.mezzo_id} 
                    onValueChange={(value) => handleInputChange('mezzo_id', value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona un mezzo" />
                    </SelectTrigger>
                    <SelectContent>
                      {mezzi?.map((mezzo) => (
                        <SelectItem key={mezzo.id} value={mezzo.id}>
                          {mezzo.nome} {mezzo.tipo && `- ${mezzo.tipo}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

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
