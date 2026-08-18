import type { ChangeResult } from "../ChangeProcessor";
import ResultItem from "../ResultItem.tsx";

interface ResultsPanelProps {
  results: ChangeResult[];
}

export const ResultsPanel = ({ results }: ResultsPanelProps) => {

  /** Download all results as a timestamped .txt file, one result per line. */
  const handleDownloadResults = () => {
    if (!results || results.length === 0) return;

    const content = results.map((r) => r.value ?? r.error ?? "").join("\n");

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const downloadDate = new Date();
    a.download = `${downloadDate.toISOString().replace(/[:.]/g, '-')}-results.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="results">
      <h3>Change Due:</h3>
      {results.length === 0 && (
        <p>Upload a file or calculate a single transaction.</p>
      )}
      {results.length > 0 &&
        results.every((result) => result.error === undefined) && (
          <button onClick={handleDownloadResults}>Download Results</button>
        )}
      {results.map((result) => (
        <div key={result.key}>
          <ResultItem result={result} />
        </div>
      ))}
    </div>
  );
};
