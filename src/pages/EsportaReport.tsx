import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import type { Tables } from "@/integrations/supabase/types";

type CompletedTask = Tables<"task"> & {
  casa: Tables<"casa"> | null;
};

const EsportaReport = () => {
  const [filterType, setFilterType] = useState<"month" | "custom">("month");
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const isMobile = useIsMobile();

  const { data: completedTasks } = useQuery({
    queryKey: ['completed-tasks-export', filterType, selectedMonth, dateFrom, dateTo],
    queryFn: async () => {
      let startDate: string;
      let endDate: string;

      if (filterType === "month") {
        const year = parseInt(selectedMonth.slice(0, 4));
        const month = parseInt(selectedMonth.slice(5, 7));
        startDate = new Date(year, month - 1, 1).toISOString();
        endDate = new Date(year, month, 0, 23, 59, 59).toISOString();
      } else {
        if (!dateFrom || !dateTo) return [];
        startDate = new Date(dateFrom).toISOString();
        endDate = new Date(dateTo + "T23:59:59").toISOString();
      }

      const { data, error } = await supabase
        .from('task')
        .select(`
          *,
          casa (*)
        `)
        .eq('stato', 'completata')
        .gte('data_completamento', startDate)
        .lte('data_completamento', endDate)
        .order('data_completamento', { ascending: false });

      if (error) throw error;
      return data as CompletedTask[];
    },
    enabled: filterType === "month" || (filterType === "custom" && !!dateFrom && !!dateTo)
  });

  const generateCSV = () => {
    if (!completedTasks || completedTasks.length === 0) {
      toast.error("Nessuna task trovata per il periodo selezionato");
      return;
    }

    // Intestazioni CSV in italiano
    const headers = [
      "Nome Casa",
      "Data e Ora Task",
      "Descrizione",
      "Priorità",
      "Rilevato da",
      "Stato",
      "Operatore/Azienda",
      "Data e Ora Completamento",
      "Costo Manutenzione (€)"
    ];

    // Genera i dati CSV
    const csvData = completedTasks.map(task => [
      task.casa?.nome || "N/A",
      task.data_creazione ? new Date(task.data_creazione).toLocaleString('it-IT') : "N/A",
      task.descrizione || "N/A",
      task.priorita?.toUpperCase() || "N/A",
      task.rilevato_da || "N/A",
      "Completata",
      task.operatore || "N/A",
      task.data_completamento ? new Date(task.data_completamento).toLocaleString('it-IT') : "N/A",
      task.costo_manutenzione ? task.costo_manutenzione.toString() : "N/A"
    ]);

    // Combina intestazioni e dati
    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(";"))
      .join("\n");

    // Aggiungi BOM per UTF-8 (compatibilità Excel)
    const bom = "\uFEFF";
    const blob = new Blob([bom + csvContent], { type: "text/csv;charset=utf-8;" });

    // Genera nome file
    let fileName: string;
    if (filterType === "month") {
      const date = new Date(selectedMonth);
      const monthName = date.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' });
      fileName = `report-task-completate_${monthName.replace(' ', '-')}.csv`;
    } else {
      const fromFormatted = new Date(dateFrom).toLocaleDateString('it-IT').replace(/\//g, '-');
      const toFormatted = new Date(dateTo).toLocaleDateString('it-IT').replace(/\//g, '-');
      fileName = `report-task-completate_${fromFormatted}_${toFormatted}.csv`;
    }

    // Download del file
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`File ${fileName} scaricato con successo!`);
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      generateCSV();
    } catch (error) {
      console.error('Errore durante l\'esportazione:', error);
      toast.error('Errore durante l\'esportazione del CSV');
    } finally {
      setIsExporting(false);
    }
  };

  const getMonthOptions = () => {
    const options = [];
    const currentDate = new Date();
    
    // Genera ultimi 12 mesi
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const value = date.toISOString().slice(0, 7);
      const label = date.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' });
      options.push({ value, label });
    }
    
    return options;
  };

  return (
    <div className={`${isMobile ? 'p-4' : 'p-6'} space-y-6`}>
      <div className="flex items-center justify-between">
        <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-gray-900`}>
          Esporta Report Task
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configurazione Esportazione</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Selezione tipo filtro */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Tipo di Filtro</Label>
            <Select value={filterType} onValueChange={(value: "month" | "custom") => setFilterType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">Filtro per Mese</SelectItem>
                <SelectItem value="custom">Periodo Personalizzato</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filtro per mese */}
          {filterType === "month" && (
            <div>
              <Label className="text-sm font-medium mb-2 block">Seleziona Mese</Label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {getMonthOptions().map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Filtro personalizzato */}
          {filterType === "custom" && (
            <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
              <div>
                <Label htmlFor="dateFrom" className="text-sm font-medium mb-2 block">
                  Data Inizio
                </Label>
                <Input
                  id="dateFrom"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="dateTo" className="text-sm font-medium mb-2 block">
                  Data Fine
                </Label>
                <Input
                  id="dateTo"
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Info task trovate */}
          {completedTasks && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>{completedTasks.length}</strong> task completate trovate per il periodo selezionato
              </p>
            </div>
          )}

          {/* Bottone esportazione */}
          <Button 
            onClick={handleExport}
            disabled={isExporting || !completedTasks || completedTasks.length === 0}
            className="w-full"
            size="lg"
          >
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? "Esportazione in corso..." : "Esporta CSV"}
          </Button>

          {/* Info formato */}
          <div className="text-xs text-gray-500 space-y-1">
            <p><strong>Formato file:</strong> CSV UTF-8 con separatore ";" (compatibile Excel)</p>
            <p><strong>Campi inclusi:</strong> Casa, Date, Descrizione, Priorità, Operatore, Costi</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EsportaReport;
