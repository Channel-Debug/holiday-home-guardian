
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CostInputProps {
  value: number | null;
  onChange: (value: number | null) => void;
  label?: string;
  placeholder?: string;
}

const CostInput = ({ value, onChange, label = "Costo (senza IVA)", placeholder = "es. 100.00" }: CostInputProps) => {
  const [costWithoutVAT, setCostWithoutVAT] = useState<string>("");
  const [costWithVAT, setCostWithVAT] = useState<string>("");

  useEffect(() => {
    if (value) {
      // Se abbiamo un valore, calcoliamo il costo senza IVA (dividendo per 1.22)
      const withoutVAT = value / 1.22;
      setCostWithoutVAT(withoutVAT.toFixed(2));
      setCostWithVAT(value.toFixed(2));
    } else {
      setCostWithoutVAT("");
      setCostWithVAT("");
    }
  }, [value]);

  const handleInputChange = (inputValue: string) => {
    setCostWithoutVAT(inputValue);
    
    if (inputValue === "" || inputValue === null) {
      setCostWithVAT("");
      onChange(null);
      return;
    }

    const numValue = parseFloat(inputValue);
    if (!isNaN(numValue)) {
      const withVAT = numValue * 1.22;
      setCostWithVAT(withVAT.toFixed(2));
      onChange(withVAT);
    } else {
      setCostWithVAT("");
      onChange(null);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="cost-input">{label}</Label>
      <Input
        id="cost-input"
        type="number"
        step="0.01"
        min="0"
        value={costWithoutVAT}
        onChange={(e) => handleInputChange(e.target.value)}
        placeholder={placeholder}
      />
      {costWithVAT && (
        <p className="text-sm text-gray-600">
          Costo con IVA (22%): <span className="font-semibold">€{costWithVAT}</span>
        </p>
      )}
    </div>
  );
};

export default CostInput;
