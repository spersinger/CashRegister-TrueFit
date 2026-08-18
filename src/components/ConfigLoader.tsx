import { useState } from "react";
import { ChangeProcessor } from "../ChangeProcessor.ts";
import type { ChangeEvent } from "react";

interface ConfigLoaderProps {
  changeProcessor: ChangeProcessor;
}

export const ConfigLoader = ({ changeProcessor }: ConfigLoaderProps) => {
  const [configLoaded, setConfigLoaded] = useState(false);
  const [configError, setConfigError] = useState<string | null>(null);

  const handleConfigFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const text = await file.text();
      const error = changeProcessor.setConfig(text);
      if (error) {
        setConfigError(error);
        return;
      }
      setConfigLoaded(true);
    }
  };

  return (
    <div>
      <label className="file-picker">
        <span className="file-picker-button">Upload config</span>
        <span className="file-picker-name">
          {!configLoaded && "Default config loaded"}
          {configLoaded && "Config loaded"}
        </span>
        <input type="file" onChange={handleConfigFileUpload} />
      </label>
      {configError && <p className="error">Config Error: {configError}.</p>}
    </div>
  );
};
