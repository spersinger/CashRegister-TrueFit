import { useState } from "react";
import { ChangeProcessor } from "../ChangeProcessor.ts";
import type { Dispatch, SetStateAction } from "react";
import type { ChangeResult } from "../ChangeProcessor";


interface ManualCalculatorProps {
  changeProcessor: ChangeProcessor;
  setResults: Dispatch<SetStateAction<ChangeResult[]>>;
}

export const ManualCalculator = ({ changeProcessor, setResults }: ManualCalculatorProps) => {
  const [owed, setOwed] = useState("2.12");
  const [paid, setPaid] = useState("3.00");
  const [manualError, setManualError] = useState<string | null>(null);

  const handleCalculateChange = () => {
    const owedFloat = parseFloat(owed);
    const paidFloat = parseFloat(paid);
    if (isNaN(owedFloat) || isNaN(paidFloat)) {
      setManualError("Invalid input: owed and paid must be valid numbers");
      return;
    };
    const results = changeProcessor.calculateChange(owedFloat, paidFloat);
    setResults([results]);
  };

  return (
    <div className="input-container">
      <label>
        Amount Owed:
        <input
          type="text"
          value={owed}
          onChange={(e) => setOwed(e.target.value)}
          inputMode="decimal"
        />
      </label>
      <label>
        Amount Paid:
        <input
          type="text"
          value={paid}
          onChange={(e) => setPaid(e.target.value)}
          inputMode="decimal"
        />
      </label>
      {manualError && <p className="error">{manualError}</p>}
      <button onClick={handleCalculateChange}>Calculate</button>
    </div>
  );
};
