
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

interface TaskFiltersProps {
  selectedCasa: string;
  selectedPriorita: string;
  onCasaChange: (value: string) => void;
  onPrioritaChange: (value: string) => void;
  onClearFilters: () => void;
}

const TaskFilters = ({ 
  selectedCasa, 
  selectedPriorita, 
  onCasaChange, 
  onPrioritaChange, 
  onClearFilters 
}: TaskFiltersProps) => {
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

  const hasActiveFilters = selectedCasa !== "all" || selectedPriorita !== "all";

  return (
    <div className="flex flex-wrap gap-4 items-center mb-4">
      <div className="flex-1 min-w-[150px]">
        <Select value={selectedCasa} onValueChange={onCasaChange}>
          <SelectTrigger>
            <SelectValue placeholder="Filtra per casa" />
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

      <div className="flex-1 min-w-[150px]">
        <Select value={selectedPriorita} onValueChange={onPrioritaChange}>
          <SelectTrigger>
            <SelectValue placeholder="Filtra per priorità" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutte le priorità</SelectItem>
            <SelectItem value="alta">🔴 Alta</SelectItem>
            <SelectItem value="media">🟡 Media</SelectItem>
            <SelectItem value="bassa">🟢 Bassa</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {hasActiveFilters && (
        <Button variant="outline" size="sm" onClick={onClearFilters}>
          <X className="h-4 w-4 mr-2" />
          Rimuovi filtri
        </Button>
      )}
    </div>
  );
};

export default TaskFilters;
