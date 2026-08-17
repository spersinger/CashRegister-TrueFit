import { useState } from 'react';

import './App.css'
import { ChangeProcessor} from './ChangeProcessor';
import type { change_result_t } from './ChangeProcessor';

function App() {
  const [changeProcessor] = useState(() => new ChangeProcessor());
  const [owed, setOwed] = useState("2.12");
  const [paid, setPaid] = useState("3.00");

  const [results, setResults] = useState<change_result_t[]>([]);

  const handleCalculateChange = () => {
    const results = changeProcessor.calculate_change(parseFloat(owed), parseFloat(paid));
    setResults([results]);
  };

  return (
    <div>
      <input type="text" value={owed} onChange={(e) => setOwed(e.target.value)} />
      <input type="text" value={paid} onChange={(e) => setPaid(e.target.value)} />
      <button onClick={handleCalculateChange}>Calculate</button>
      <div>
        {results.map((result, index) => (
          <div key={index}>
            <p>{owed} - {paid} = {result.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default App
