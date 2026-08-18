import { useState } from "react";
import { ChangeProcessor } from "../ChangeProcessor.ts";
import type { ChangeEvent } from "react";
import type { ChangeResult } from "../ChangeProcessor.ts";
import type { Dispatch, SetStateAction } from "react";

interface FileProcessorProps {
  changeProcessor: ChangeProcessor;
  setResults: Dispatch<SetStateAction<ChangeResult[]>>;
}

export const FileProcessor = ({
  changeProcessor,
  setResults,
}: FileProcessorProps) => {
  const [fileText, setFileText] = useState("");
  const [fileName, setFileName] = useState("");

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

  return (
    <div className="file-picker-container">
      <label className="file-picker">
        <span className="file-picker-button">Upload File</span>
        <span className="file-picker-name">{fileName ?? "No file chosen"}</span>
        <input type="file" onChange={handleFileUpload} />
      </label>
      {fileText && (
        <button className="process-button" onClick={handleFileProcessing}>
          Process File
        </button>
      )}
    </div>
  );
};
