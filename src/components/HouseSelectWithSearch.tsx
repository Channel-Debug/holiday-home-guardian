
import React, { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Tables } from "@/integrations/supabase/types";

interface HouseSelectWithSearchProps {
  houses: Tables<"casa">[] | undefined;
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}

const HouseSelectWithSearch = ({ 
  houses, 
  value, 
  onValueChange, 
  placeholder = "Seleziona una casa",
  required = false 
}: HouseSelectWithSearchProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const filteredHouses = houses?.filter(casa => 
    casa.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (casa.indirizzo && casa.indirizzo.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  const handleClearSearch = () => {
    setSearchTerm("");
  };

  const selectedHouse = houses?.find(casa => casa.id === value);

  return (
    <Select 
      value={value} 
      onValueChange={onValueChange}
      required={required}
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <SelectTrigger>
        <SelectValue placeholder={placeholder}>
          {selectedHouse && (
            <span>
              {selectedHouse.nome} {selectedHouse.indirizzo && `- ${selectedHouse.indirizzo}`}
            </span>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <div className="sticky top-0 bg-background p-2 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Cerca casa per nome o indirizzo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-10"
              onClick={(e) => e.stopPropagation()}
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClearSearch();
                }}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
        <div className="max-h-60 overflow-y-auto">
          {filteredHouses.map((casa) => (
            <SelectItem key={casa.id} value={casa.id}>
              {casa.nome} {casa.indirizzo && `- ${casa.indirizzo}`}
            </SelectItem>
          ))}
          {filteredHouses.length === 0 && searchTerm && (
            <div className="p-2 text-sm text-gray-500">
              Nessuna casa trovata per "{searchTerm}"
            </div>
          )}
        </div>
      </SelectContent>
    </Select>
  );
};

export default HouseSelectWithSearch;
