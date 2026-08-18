import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";

import "./App.css";
import { ChangeProcessor } from "./ChangeProcessor";
import type { ChangeResult } from "./ChangeProcessor";
import ResultItem from "./ResultItem";

import useGeolocation from "./hooks/useGeolocation";

function App() {
  const [changeProcessor] = useState(() => new ChangeProcessor());
  const [owed, setOwed] = useState("2.12");
  const [paid, setPaid] = useState("3.00");
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileText, setFileText] = useState<string | null>(null);
  const [configLoaded, setConfigLoaded] = useState(false);
  const [results, setResults] = useState<ChangeResult[]>([]);
  const { location, loading, requestLocation } = useGeolocation();

  // Can use request location in the dependency array because useGeolocation has a stable reference
  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  useEffect(() => {
    if (location) {
      changeProcessor.setLocation(location);
    }
  }, [location]);

  const handleCalculateChange = () => {
    const owedFloat = parseFloat(owed);
    const paidFloat = parseFloat(paid);
    if (isNaN(owedFloat) || isNaN(paidFloat)) return;
    const results = changeProcessor.calculateChange(
      owedFloat,
      paidFloat,
    );
    setResults([results]);
  };

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const text = await file.text();
      setFileText(text);
      setFileName(file.name);
    }
  };

  const handleFileProcessing = () => {
    if (fileText) {
      const results = changeProcessor.processFileContent(fileText);
      setResults(results);
    }
  };

  const handleConfigFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const text = await file.text();
      changeProcessor.setConfig(text);
      setConfigLoaded(true);
    }
  };

  const handleDownloadResults = () => {
    if (!results || results.length === 0) return;

    const content = results.map((r) => r.value ?? r.error ?? "").join("\n");

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const download_date = new Date();
    a.download = `${download_date.toLocaleString("en-GB", { hour12: false })}-results.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="app">
      <div className="container">
        <div className="header">
          <h1>Cash Register</h1>
          {loading && <p>Loading location for local currency...</p>}
          {location && !loading && <p>Using location for local currency</p>}
          <label className="file-picker">
            <span className="file-picker-button">Upload config</span>
            <span className="file-picker-name">
              {!configLoaded && "Default config loaded"}
              {configLoaded && "Config loaded"}
            </span>
            <input type="file" onChange={handleConfigFileUpload} />
          </label>
        </div>
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
          <button onClick={handleCalculateChange}>Calculate</button>
        </div>
        <div className="file-picker-container">
          <label className="file-picker">
            <span className="file-picker-button">Upload File</span>
            <span className="file-picker-name">
              {fileName ?? "No file chosen"}
            </span>
            <input type="file" onChange={handleFileUpload} />
          </label>
          {fileText && (
            <button className="process-button" onClick={handleFileProcessing}>
              Process File
            </button>
          )}
        </div>
        <div className="results">
          <h3>Change Due:</h3>
          {results.length === 0 && (
            <p>Upload a file or calculate a single transaction.</p>
          )}
          {results.map((result) => (
            <div key={result.key}>
              <ResultItem result={result} />
            </div>
          ))}
          {results.length > 0 &&
            results.every((result) => result.error === undefined) && (
              <button onClick={handleDownloadResults}>Download Results</button>
            )}
        </div>
      </div>
    </div>
  );
}

export default App;
