import { useState } from 'react';
import type { ChangeEvent } from 'react';

import './App.css'
import { ChangeProcessor} from './ChangeProcessor';
import type { change_result_t } from './ChangeProcessor';

function App() {
  const [changeProcessor] = useState(() => new ChangeProcessor());
  const [owed, setOwed] = useState("2.12");
  const [paid, setPaid] = useState("3.00")
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileText, setFileText] = useState<string | null>(null);
  const [results, setResults] = useState<change_result_t[]>([]);

  const handleCalculateChange = () => {
    const results = changeProcessor.calculate_change(parseFloat(owed), parseFloat(paid));
    setResults([results]);
  };

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const text = await file.text();
      setFileText(text);
      setFileName(file.name );
    }
  }

  const handleFileProcessing = () => {
    if (fileText) {
      const results = changeProcessor.process_file_content(fileText);
      setResults(results);
    }
  };

  return (
    <div>
      <h1>Cash Register</h1>
      <div>
        <input type="text" value={owed} onChange={(e) => setOwed(e.target.value)} />
        <input type="text" value={paid} onChange={(e) => setPaid(e.target.value)} />
        <button onClick={handleCalculateChange}>Calculate</button>
      </div>
      <div>
        <label className="file-picker">
          <span className="file-picker-button">Upload File</span>
          <span className="file-picker__name">{fileName ?? "No file chosen"}</span>
          <input type="file" onChange={handleFileUpload} />
        </label>
      </div>
      {fileText && (
        <button onClick={handleFileProcessing}>Process File</button>
      )}
      <div>
        {results.map((result, index) => (
          <div key={index}>
            <p>{result.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default App
