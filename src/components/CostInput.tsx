
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CostInputProps {
  value: number | null;
  onChange: (value: number | null) => void;
  label?: string;
  placeholder?: string;
}

const CostInput = ({ value, onChange, label = "Costo (IVA 22% inclusa)", placeholder = "es. 122.00" }: CostInputProps) => {
  const [costWithVAT, setCostWithVAT] = useState<string>("");
  const [costWithoutVAT, setCostWithoutVAT] = useState<string>("");

  useEffect(() => {
    if (value) {
      setCostWithVAT(value.toFixed(2));
      // Calcoliamo il costo senza IVA (dividendo per 1.22)
      const withoutVAT = value / 1.22;
      setCostWithoutVAT(withoutVAT.toFixed(2));
    } else {
      setCostWithVAT("");
      setCostWithoutVAT("");
    }
  }, [value]);

  const handleInputChange = (inputValue: string) => {
    setCostWithVAT(inputValue);
    
    if (inputValue === "" || inputValue === null) {
      setCostWithoutVAT("");
      onChange(null);
      return;
    }

    const numValue = parseFloat(inputValue);
    if (!isNaN(numValue) && numValue >= 0) {
      const withoutVAT = numValue / 1.22;
      setCostWithoutVAT(withoutVAT.toFixed(2));
      onChange(numValue);
    } else {
      setCostWithoutVAT("");
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
        value={costWithVAT}
        onChange={(e) => handleInputChange(e.target.value)}
        placeholder={placeholder}
      />
      {costWithoutVAT && (
        <p className="text-sm text-gray-600">
          Costo senza IVA: <span className="font-semibold">€{costWithoutVAT}</span>
        </p>
      )}
    </div>
  );
};

export default CostInput;
