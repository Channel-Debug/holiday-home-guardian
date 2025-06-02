import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Tables } from "@/integrations/supabase/types";

interface OperatorSelectProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

const OperatorSelect = ({ value, onChange, required = false }: OperatorSelectProps) => {
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualOperator, setManualOperator] = useState("");

  const { data: profiles } = useQuery({
    queryKey: ['profiles-operators'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, nome, cognome, email, ruolo')
        .order('nome', { ascending: true })
        .order('cognome', { ascending: true });
      
      if (error) throw error;
      return data as Tables<"profiles">[];
    },
  });

  const handleSelectChange = (selectedValue: string) => {
    if (selectedValue === "altro") {
      setShowManualInput(true);
      onChange("");
    } else {
      setShowManualInput(false);
      setManualOperator("");
      
      // Trova il profilo selezionato e componi il nome completo
      const selectedProfile = profiles?.find(p => p.id === selectedValue);
      if (selectedProfile) {
        const fullName = `${selectedProfile.nome || ''} ${selectedProfile.cognome || ''}`.trim() || selectedProfile.email || '';
        onChange(fullName);
      }
    }
  };

  const handleManualInputChange = (inputValue: string) => {
    setManualOperator(inputValue);
    onChange(inputValue);
  };

  return (
    <div className="space-y-2">
      <Label>Operatore/Azienda Assegnata {required && "*"}</Label>
      
      {!showManualInput ? (
        <Select onValueChange={handleSelectChange} required={required}>
          <SelectTrigger>
            <SelectValue placeholder="Seleziona un operatore o 'Altro'" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="altro">🔧 Altro (inserimento manuale)</SelectItem>
            {profiles?.map((profile) => {
              const displayName = `${profile.nome || ''} ${profile.cognome || ''}`.trim() || profile.email || 'Utente senza nome';
              const role = profile.ruolo ? ` (${profile.ruolo})` : '';
              return (
                <SelectItem key={profile.id} value={profile.id}>
                  👤 {displayName}{role}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      ) : (
        <div className="space-y-2">
          <Input
            value={manualOperator}
            onChange={(e) => handleManualInputChange(e.target.value)}
            placeholder="Inserisci nome operatore o azienda"
            required={required}
          />
          <button
            type="button"
            onClick={() => {
              setShowManualInput(false);
              setManualOperator("");
              onChange("");
            }}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            ← Torna alla selezione da lista
          </button>
        </div>
      )}
    </div>
  );
};

export default OperatorSelect;
