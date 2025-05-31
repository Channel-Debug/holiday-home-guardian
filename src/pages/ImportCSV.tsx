
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Download, Upload } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ImportCSV = () => {
  const [loadingCasa, setLoadingCasa] = useState(false);
  const [loadingTask, setLoadingTask] = useState(false);

  // Esempio CSV per le case
  const generateCaseCSV = () => {
    const csvContent = `nome,indirizzo,note
"Villa Rossi","Via Roma 123, Milano","Casa principale famiglia Rossi"
"Appartamento Centro","Corso Buenos Aires 45, Milano","Bilocale in centro città"
"Casa Lago","Via del Lago 78, Como","Casa vacanze al lago"`;
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'esempio_case.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Esempio CSV per le task
  const generateTaskCSV = () => {
    const csvContent = `casa_nome,descrizione,priorita,rilevato_da,operatore,stato
"Villa Rossi","Riparazione perdita rubinetto cucina","alta","Mario Rossi","Idraulico Bianchi","completata"
"Villa Rossi","Tinteggiatura camera da letto","media","Laura Rossi","Imbianchino Verde","da_fare"
"Appartamento Centro","Sostituzione lampadina bagno","bassa","Giuseppe Verdi","","da_fare"
"Casa Lago","Manutenzione caldaia","alta","Maria Neri","Tecnico Clima","completata"`;
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'esempio_task.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCaseImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoadingCasa(true);
    try {
      const text = await file.text();
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
      
      const cases = [];
      for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim()) {
          const values = lines[i].split(',').map(v => v.replace(/"/g, '').trim());
          const casa = {
            nome: values[headers.indexOf('nome')] || '',
            indirizzo: values[headers.indexOf('indirizzo')] || null,
            note: values[headers.indexOf('note')] || null,
          };
          if (casa.nome) {
            cases.push(casa);
          }
        }
      }

      if (cases.length > 0) {
        const { error } = await supabase
          .from('casa')
          .insert(cases);

        if (error) throw error;
        toast.success(`${cases.length} case importate con successo!`);
      }
    } catch (error) {
      console.error('Errore importazione case:', error);
      toast.error('Errore durante l\'importazione delle case');
    } finally {
      setLoadingCasa(false);
      event.target.value = '';
    }
  };

  const handleTaskImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoadingTask(true);
    try {
      // Prima recupera tutte le case per il mapping
      const { data: houses } = await supabase
        .from('casa')
        .select('id, nome');

      if (!houses) {
        toast.error('Errore nel recuperare le case esistenti');
        return;
      }

      const houseMap = new Map(houses.map(h => [h.nome, h.id]));

      const text = await file.text();
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
      
      const tasks = [];
      for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim()) {
          const values = lines[i].split(',').map(v => v.replace(/"/g, '').trim());
          const casaNome = values[headers.indexOf('casa_nome')] || '';
          const casaId = houseMap.get(casaNome);
          
          if (casaId) {
            const task = {
              casa_id: casaId,
              descrizione: values[headers.indexOf('descrizione')] || '',
              priorita: values[headers.indexOf('priorita')] || 'media',
              rilevato_da: values[headers.indexOf('rilevato_da')] || '',
              operatore: values[headers.indexOf('operatore')] || null,
              stato: values[headers.indexOf('stato')] || 'da_fare',
            };
            if (task.descrizione && task.rilevato_da) {
              tasks.push(task);
            }
          }
        }
      }

      if (tasks.length > 0) {
        const { error } = await supabase
          .from('task')
          .insert(tasks);

        if (error) throw error;
        toast.success(`${tasks.length} task importate con successo!`);
      }
    } catch (error) {
      console.error('Errore importazione task:', error);
      toast.error('Errore durante l\'importazione delle task');
    } finally {
      setLoadingTask(false);
      event.target.value = '';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Importazione CSV</h1>

      <Tabs defaultValue="case" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="case">Case</TabsTrigger>
          <TabsTrigger value="task">Manutenzioni</TabsTrigger>
        </TabsList>

        <TabsContent value="case">
          <Card>
            <CardHeader>
              <CardTitle>Importazione Case</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>1. Scarica il foglio d'esempio</Label>
                <Button onClick={generateCaseCSV} variant="outline" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Scarica Esempio CSV Case
                </Button>
              </div>

              <div className="space-y-2">
                <Label>2. Compila il CSV con i tuoi dati</Label>
                <div className="text-sm text-gray-600">
                  <p><strong>Formato richiesto:</strong></p>
                  <ul className="list-disc pl-5">
                    <li><strong>nome</strong>: Nome della casa (obbligatorio)</li>
                    <li><strong>indirizzo</strong>: Indirizzo completo (opzionale)</li>
                    <li><strong>note</strong>: Note aggiuntive (opzionale)</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="casa-csv">3. Carica il tuo file CSV</Label>
                <Input
                  id="casa-csv"
                  type="file"
                  accept=".csv"
                  onChange={handleCaseImport}
                  disabled={loadingCasa}
                />
                {loadingCasa && (
                  <p className="text-sm text-blue-600">Importazione in corso...</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="task">
          <Card>
            <CardHeader>
              <CardTitle>Importazione Manutenzioni</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>1. Scarica il foglio d'esempio</Label>
                <Button onClick={generateTaskCSV} variant="outline" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Scarica Esempio CSV Manutenzioni
                </Button>
              </div>

              <div className="space-y-2">
                <Label>2. Compila il CSV con i tuoi dati</Label>
                <div className="text-sm text-gray-600">
                  <p><strong>Formato richiesto:</strong></p>
                  <ul className="list-disc pl-5">
                    <li><strong>casa_nome</strong>: Nome della casa (deve esistere nel database)</li>
                    <li><strong>descrizione</strong>: Descrizione dell'intervento (obbligatorio)</li>
                    <li><strong>priorita</strong>: bassa, media, alta (obbligatorio)</li>
                    <li><strong>rilevato_da</strong>: Chi ha rilevato il problema (obbligatorio)</li>
                    <li><strong>operatore</strong>: Operatore assegnato (opzionale)</li>
                    <li><strong>stato</strong>: da_fare, in_corso, completata (opzionale, default: da_fare)</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="task-csv">3. Carica il tuo file CSV</Label>
                <Input
                  id="task-csv"
                  type="file"
                  accept=".csv"
                  onChange={handleTaskImport}
                  disabled={loadingTask}
                />
                {loadingTask && (
                  <p className="text-sm text-blue-600">Importazione in corso...</p>
                )}
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                <p className="text-sm text-yellow-800">
                  <strong>Importante:</strong> Assicurati che le case referenziate nel CSV esistano già nel database.
                  Se necessario, importa prima le case e poi le manutenzioni.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ImportCSV;
