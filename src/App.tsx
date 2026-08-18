import { useEffect, useState } from "react";

import "./App.css";
import { ChangeProcessor } from "./ChangeProcessor";
import type { ChangeResult } from "./ChangeProcessor";

import useGeolocation from "./hooks/useGeolocation";
import { ConfigLoader } from "./components/ConfigLoader";
import { ManualCalculator } from "./components/ManualCalculator";
import { FileProcessor } from "./components/FileProcessor";
import { ResultsPanel } from "./components/ResultsPanel";

function App() {
  // I realize this has prop drilling, however for this small of a project I believe
  // it to be fine. If it was any larger (eg: multiple levels of nesting) mobx or
  // state management libraries would be a better choice.
  const [changeProcessor] = useState(() => new ChangeProcessor());
  const [results, setResults] = useState<ChangeResult[]>([]);
  const { location, loading, requestLocation, permissionState } =
    useGeolocation();

  // Can use request location in the dependency array because useGeolocation has a stable reference
  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  useEffect(() => {
    if (location) {
      changeProcessor.setLocation(location);
    }
  }, [location]);

  return (
    <div className="app">
      <div className="container">
        <div className="header">
          <h1>Cash Register</h1>
          {loading && <p>Loading location for local currency...</p>}
          {location && !loading && <p>Using location for local currency</p>}
          {permissionState === "denied" && <p>Location permission denied</p>}
          <ConfigLoader changeProcessor={changeProcessor} />
        </div>
        <ManualCalculator
          changeProcessor={changeProcessor}
          setResults={setResults}
        />
        <FileProcessor
          changeProcessor={changeProcessor}
          setResults={setResults}
        />
        <ResultsPanel results={results} />
      </div>
    </div>
  );
}

export default App;
