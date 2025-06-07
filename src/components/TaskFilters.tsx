
import React, { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Search } from "lucide-react";
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
  const [searchTerm, setSearchTerm] = useState("");

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

  const filteredHouses = houses?.filter(casa => 
    casa.nome.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const hasActiveFilters = selectedCasa !== "all" || selectedPriorita !== "all";

  const handleClearSearch = () => {
    setSearchTerm("");
  };

  return (
    <div className="space-y-4 mb-4">
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Cerca casa per nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearSearch}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        <div className="flex-1 min-w-[150px]">
          <Select value={selectedCasa} onValueChange={onCasaChange}>
            <SelectTrigger>
              <SelectValue placeholder="Filtra per casa" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutte le case</SelectItem>
              {filteredHouses.map((casa) => (
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

        {(hasActiveFilters || searchTerm) && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              onClearFilters();
              handleClearSearch();
            }}
          >
            <X className="h-4 w-4 mr-2" />
            Rimuovi filtri
          </Button>
        )}
      </div>
    </div>
  );
};

export default TaskFilters;
